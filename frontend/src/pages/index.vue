<template>
  <div class="px-3 md:px-12 py-8 space-y-10">
    <ClassicToolbar />

    <div ref="tradingviewContainer" class="tradingview-widget-container"></div>
    <div ref="tradingviewContainer2" class="tradingview-widget-container"></div>

    <HomeSection
      title="Bolsa de Valores do Brasil"
      icon="/icons/brazil.svg"
      region="br"
      :assets="brState.list"
      :page="brState.page"
      :total-pages="brState.totalPages"
      :types="brState.types"
      :selected-type="brState.type"
      :loading="brState.loading"
      @change-page="handlePage"
      @change-type="handleType"
    />

    <HomeSection
      title="Bolsa de Valores (Exterior)"
      icon="/icons/world.svg"
      region="us"
      :assets="usState.list"
      :page="usState.page"
      :total-pages="usState.totalPages"
      :types="usState.types"
      :selected-type="usState.type"
      :loading="usState.loading"
      @change-page="handlePage"
      @change-type="handleType"
    />

    <HomeSection
      title="Criptomoedas"
      icon="/icons/crypto.svg"
      region="crypto"
      :assets="cryptoState.list"
      :page="cryptoState.page"
      :total-pages="cryptoState.totalPages"
      :types="cryptoState.types"
      :selected-type="cryptoState.type"
      :loading="cryptoState.loading"
      :show-type-filter="false"
      @change-page="handlePage"
      @change-type="handleType"
    />
  </div>
</template>

<script setup>
import API from '@/utils/api'
import { onMounted, reactive, ref } from 'vue'
import ClassicToolbar from '@/components/ClassicToolbar.vue'
import HomeSection from '@/components/HomeSection.vue'

const makeState = () =>
  reactive({
    list: [],
    page: 1,
    totalPages: 1,
    total: 0,
    types: [],
    type: '',
    loading: false
  })

const brState = makeState()
const usState = makeState()
const cryptoState = makeState()

const tradingviewContainer = ref(null)
const tradingviewContainer2 = ref(null)

async function fetchSection(region, state) {
  state.loading = true
  const resp = await API.getHomeList(region, state.page, state.type)
  if (resp) {
    state.list = resp.list || []
    state.totalPages = resp.totalPages || 1
    state.total = resp.total || state.list.length
    state.types = resp.types || []
  }
  state.loading = false
}

const handlePage = (region, delta) => {
  const state = getState(region)
  const next = Math.min(Math.max(1, state.page + delta), state.totalPages)
  if (next === state.page) return
  state.page = next
  fetchSection(region, state)
}

const handleType = (region, type) => {
  const state = getState(region)
  state.type = type
  state.page = 1
  fetchSection(region, state)
}

function getState(region) {
  if (region === 'br') return brState
  if (region === 'crypto') return cryptoState
  return usState
}

onMounted(() => {
  fetchSection('br', brState)
  fetchSection('us', usState)
  fetchSection('crypto', cryptoState)
})

onMounted(() => {
  const container = tradingviewContainer.value
  const container2 = tradingviewContainer2.value

  const widgetWrapper = document.createElement('div')
  widgetWrapper.className = 'tradingview-widget-container__widget'
  container.appendChild(widgetWrapper)

  const script = [document.createElement('script'), document.createElement('script')]
  script[0].type = 'text/javascript'
  script[1].type = 'text/javascript'
  script[0].src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
  script[1].src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
  script[0].async = true
  script[1].async = true

  script[0].innerHTML = JSON.stringify({
    symbols: [
      { proName: 'NASDAQ:AAPL', title: '' },
      { proName: 'TVC:GOLD', title: '' },
      { proName: 'NASDAQ:TSLA', title: '' },
      { proName: 'BMFBOVESPA:PETR4', title: '' },
      { proName: 'NASDAQ:NVDA', title: '' },
      { proName: 'NASDAQ:AMD', title: '' },
      { proName: 'NASDAQ:MSFT', title: '' }
    ],
    colorTheme: 'dark',
    locale: 'pt-br',
    largeChartUrl: '',
    isTransparent: true,
    showSymbolLogo: true,
    displayMode: 'adaptive'
  })
  script[1].innerHTML = JSON.stringify({
    height: 400,
    allow_symbol_change: true,
    calendar: false,
    details: false,
    hide_side_toolbar: false,
    hide_top_toolbar: false,
    hide_legend: false,
    hide_volume: false,
    hotlist: false,
    interval: 'D',
    locale: 'pt-br',
    save_image: true,
    style: '1',
    symbol: 'NASDAQ:AAPL',
    theme: 'dark',
    timezone: 'Etc/UTC',
    backgroundColor: 'rgba(15, 15, 15, 0)',
    gridColor: 'rgba(242, 242, 242, 0.06)',
    watchlist: [],
    withdateranges: false,
    compareSymbols: [],
    studies: [],
    autosize: true
  })
  container.appendChild(script[1])
  container2.appendChild(script[0])
})
</script>

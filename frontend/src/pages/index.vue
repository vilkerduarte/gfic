<template>
  <div class="px-3 md:px-12 py-8 space-y-10">
    <ClassicToolbar />
    <iframe ref="iframe" class="w-[210mm] h-[297mm] scale-[0.5] fixed left-[-500%] top-0 bg-white origin-top"
      src="/generate_report.html"></iframe>

    <div ref="tradingviewContainer" class="tradingview-widget-container"></div>
    <div ref="tradingviewContainer2" class="tradingview-widget-container"></div>

    <HomeSection title="Bolsa de Valores do Brasil" icon="/icons/brazil.svg" region="br" :assets="brState.list"
      :page="brState.page" :total-pages="brState.totalPages" :types="brState.types" :selected-type="brState.type"
      :loading="brState.loading" :generating-map="generating" @change-page="handlePage" @change-type="handleType"
      @details="handleDetails" @generate-report="handleGenerateReport" @open-report="handleOpenReport" />

    <HomeSection title="Bolsa de Valores (Exterior)" icon="/icons/world.svg" region="us" :assets="usState.list"
      :page="usState.page" :total-pages="usState.totalPages" :types="usState.types" :selected-type="usState.type"
      :loading="usState.loading" :generating-map="generating" @change-page="handlePage" @change-type="handleType"
      @details="handleDetails" @generate-report="handleGenerateReport" @open-report="handleOpenReport" />

    <HomeSection title="Criptomoedas" icon="/icons/crypto.svg" region="crypto" :assets="cryptoState.list"
      :page="cryptoState.page" :total-pages="cryptoState.totalPages" :types="cryptoState.types"
      :selected-type="cryptoState.type" :loading="cryptoState.loading" :show-type-filter="false"
      :generating-map="generating" @change-page="handlePage" @change-type="handleType" @details="handleDetails"
      @generate-report="handleGenerateReport" @open-report="handleOpenReport" />

    <Dialog v-model:visible="detailVisible" header="Detalhes do Ativo" :style="{ width: '720px' }">
      <div v-if="detailData" class="space-y-3">
        <div class="flex justify-between items-center gap-2">
          <LogoAsset :src="logoUrl(detailData.stock)" :type="detailData.stock?.type == 'CRYPTO' ? 'rounded' : 'square'"/>
          <div class="flex-auto">
            <h3 class="text-xl font-bold">{{ detailData.stock?.name || detailData.stock?.symbol }}</h3>
            <p class="text-sm text-slate-400">{{ detailData.stock?.symbol }} • {{ detailData.stock?.exchange ||
              detailData.stock?.mic }}</p>
          </div>
          <div class="text-right">
            <p class="text-lg font-semibold">{{ formatCurrency(detailData.analysis?.priceMetrics?.currentPrice,
              detailData.stock?.currency) }}</p>
            <p class="text-sm text-slate-400">Variação: {{
              formatPercent(detailData.analysis?.priceMetrics?.priceChangePercent) }}</p>
          </div>
        </div>
        <pre>{{ JSON.stringify(detailData,null,2) }}</pre>
        
        <div v-if="detailData?.analysis" class="space-y-6 text-sm">

          <!-- HERO -->
          <section class="flex justify-between items-end">
            <div>
              <h3 class="text-2xl font-bold">
                {{ detailData.stock?.symbol }}
              </h3>
              <p class="text-slate-400">
                {{ detailData.stock?.name }} • {{ detailData.stock?.exchange }}
              </p>
            </div>

            <div class="text-right">
              <p class="text-3xl font-bold">
                {{ formatCurrency(detailData.analysis.priceMetrics.currentPrice, detailData.stock.currency) }}
              </p>
              <p class="flex items-center justify-end gap-1 font-medium" :class="detailData.analysis.priceMetrics.priceChangePercent < 0
                ? 'text-red-400'
                : 'text-emerald-400'">
                <span>
                  {{ detailData.analysis.priceMetrics.priceChangePercent < 0 ? '▼' : '▲' }} </span>
                    {{ formatPercent(detailData.analysis.priceMetrics.priceChangePercent) }}
              </p>
            </div>
          </section>

          <!-- SUMMARY TAGS -->
          <section class="flex flex-wrap gap-2">
            <span class="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
              {{ detailData.analysis.summary.trend }}
            </span>
            <span class="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
              {{ detailData.analysis.summary.marketCondition }}
            </span>
            <span class="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
              {{ detailData.analysis.summary.volumeActivity }}
            </span>
            <span class="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
              Força: {{ detailData.analysis.summary.strength }}
            </span>
          </section>

          <!-- PRICE METRICS -->
          <section>
            <h4 class="font-semibold mb-2 text-slate-300">Preço</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Metric label="Máxima" :value="detailData.analysis.priceMetrics.dayHigh" />
              <Metric label="Mínima" :value="detailData.analysis.priceMetrics.dayLow" />
              <Metric label="Range %" :value="formatPercent(detailData.analysis.priceMetrics.dayRangePercent)" />
              <Metric label="VWAP" :value="detailData.analysis.technicalMetrics.vwap" />
            </div>
          </section>

          <!-- TECHNICAL -->
          <section>
            <h4 class="font-semibold mb-2 text-slate-300">Indicadores Técnicos</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Metric label="Volatilidade" :value="detailData.analysis.technicalMetrics.volatility" />
              <Metric label="Momentum %" :value="formatPercent(detailData.analysis.technicalMetrics.priceMomentum)" />
              <Metric label="Bullish Bias" :value="formatPercent(detailData.analysis.technicalMetrics.bullishBias)" />
              <Metric label="Resistência" :value="detailData.analysis.technicalMetrics.resistanceLevel" />
            </div>
          </section>

          <!-- VOLUME -->
          <section>
            <h4 class="font-semibold mb-2 text-slate-300">Volume</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Metric label="Total" :value="detailData.analysis.volumeMetrics.totalVolume" />
              <Metric label="Média" :value="detailData.analysis.volumeMetrics.averageVolume" />
              <Metric label="Máximo" :value="detailData.analysis.volumeMetrics.maxVolume" />
              <Metric label="Ratio" :value="detailData.analysis.volumeMetrics.volumeRatio" />
            </div>
          </section>

          <!-- SESSION -->
          <section class="text-xs text-slate-400">
            <p>
              Dados de Análise:
              {{ new Date(detailData.analysis.sessionInfo.marketOpen).toLocaleDateString() }}
              →
              {{ new Date(detailData.analysis.sessionInfo.marketClose).toLocaleDateString() }}
              • {{ detailData.analysis.sessionInfo.dataPoints }} candles
              • Entervalo de {{ detailData.analysis.sessionInfo.dataGranularity }}
            </p>
          </section>

        </div>
        

      </div>
    </Dialog>
  </div>
</template>

<script setup>
import API from '@/utils/api'
import { onMounted, reactive, ref, watch, inject } from 'vue'
import ClassicToolbar from '@/components/ClassicToolbar.vue'
import HomeSection from '@/components/HomeSection.vue'
import { getSocket, emitAsync, connectSocket } from '@/utils/socket'
import Dialog from 'primevue/dialog'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkHtml from 'remark-html'
import { useToast } from 'primevue/usetoast'
import Metric from '@/components/Metric.vue'
import LogoAsset from '@/components/LogoAsset.vue'
const iframe = ref(null)

function logoUrl(stock){
  console.log(stock);
  let {currency,symbol,type} = stock;
  return `${API.HOST}/files/logo/${[symbol,type,currency].join('--')}.svg`
}

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
const generating = reactive({})
const auth = inject('auth')
const toast = useToast()
const detailVisible = ref(false)
const detailData = ref(null)

const tradingviewContainer = ref(null)
const tradingviewContainer2 = ref(null)

async function fetchSection(region, state) {
  // state.loading = true
  try {
    const socket = getSocket()
    if (auth?.isAuthenticated.value && socket && socket.connected) {
      const data = await emitAsync('home:fetch', {
        region,
        page: state.page,
        type: state.type
      })
      Object.assign(state, {
        list: data.list || [],
        totalPages: data.totalPages || 1,
        total: data.total || (data.list || []).length,
        types: data.types || []
      })
    } else {
      const resp = await API.getHomeList(region, state.page, state.type)
      if (resp) {
        state.list = resp.list || []
        state.totalPages = resp.totalPages || 1
        state.total = resp.total || state.list.length
        state.types = resp.types || []
      }
    }
    // atualizar mapa de geração com base em reports pendentes
    state.list?.forEach((asset) => {
      if (asset.report?.status === 'pending') {
        generating[asset.symbol] = true
      } else if (asset.report?.status === 'active') {
        generating[asset.symbol] = false
      }
    })
  } catch (err) {
    console.error(err)
  } finally {
    state.loading = false
  }
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

const handleDetails = async (asset) => {
  try {
    let data = null
    const socket = getSocket()
    if (auth?.isAuthenticated.value && socket && socket.connected) {
      data = await emitAsync('asset:details', { symbol: asset.symbol })
    } else {
      data = await API.get(`/assets/details/${asset.symbol}`)
    }
    detailData.value = data
    detailVisible.value = true
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Erro', detail: err.message || 'Falha ao buscar detalhes' })
  }
}

const ensureMyAsset = async (symbol) => {
  if (auth?.user.value?.assets?.includes(symbol)) return
  await API.post('/assets/my-assets', { symbol, name: symbol })
  await auth.fetchAssets()
}

const handleGenerateReport = async (asset) => {
  if (!auth?.isAuthenticated.value) {
    toast.add({ severity: 'warn', summary: 'Login necessário', detail: 'Entre para gerar relatório' })
    return
  }
  try {
    generating[asset.symbol] = true
    await ensureMyAsset(asset.symbol)
    const socket = getSocket()
    if (socket && socket.connected) {
      await emitAsync('report:create', { symbol: asset.symbol })
    } else {
      await API.get(`/reports/create/${asset.symbol}`)
    }
    toast.add({ severity: 'success', summary: 'Gerando', detail: 'Relatório em processamento (~3 min)' })
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Erro', detail: err.message || 'Falha ao gerar relatório' })
  } finally {
    generating[asset.symbol] = false
  }
}



const handleOpenReport = async (asset) => {
  console.log(asset)
  if (asset?.report?.hash) {
    let data = new Date(Date.parse(asset.report.created_at));
    let md = await API.get(`/reports/view/${asset.report.hash}`);
    console.log('hasss ', md);
    const file = await unified()
      .use(remarkParse)
      .use(remarkHtml)
      .process(md)
    let html = String(file)
    html = html.split('<hr>').map(a => `<section>${a}</section>`).join('');

    const iframeWindow = iframe.value?.contentWindow;
    iframeWindow.gerarPdf(html, data);
    // window.open(`${API.HOST}/reports/view/${asset.report.hash}`, '_blank')
  }
}

function getState(region) {
  if (region === 'br') return brState
  if (region === 'crypto') return cryptoState
  return usState
}

const formatCurrency = (value, currency = 'USD') => {
  if (value == null) return '-'
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value)
  } catch {
    return `${currency} ${Number(value).toFixed(2)}`
  }
}
const formatPercent = (value) => {
  if (value == null) return '-'
  return `${Number(value).toFixed(2)}%`
}

onMounted(() => {
  fetchSection('br', brState)
  fetchSection('us', usState)
  fetchSection('crypto', cryptoState)
  setTimeout(() => {
    fetchSection('br', brState)
    fetchSection('us', usState)
    fetchSection('crypto', cryptoState)
  }, 1000)
})

watch(
  () => auth?.isAuthenticated.value,
  (val) => {
    if (val) {
      connectSocket()
      fetchSection('br', brState)
      fetchSection('us', usState)
      fetchSection('crypto', cryptoState)
    }
  }
)

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

  const socket = getSocket()
  if (socket) {
    socket.on('report:update', ({ symbol, report }) => {
      applyReportUpdate(symbol, report)
    })
  }
})

function applyReportUpdate(symbol, report) {
  const apply = (state) => {
    state.list = state.list.map((a) => a.symbol === symbol ? { ...a, report } : a)
  }
  apply(brState)
  apply(usState)
  apply(cryptoState)
  if (report?.status === 'pending' || report?.status === 'active') {
    generating[symbol] = report.status === 'pending'
  } else {
    delete generating[symbol]
  }
}
</script>

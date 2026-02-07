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

    
    
    <Dialog v-model:visible="detailVisible" header="Detalhes do Ativo" :style="{ width: '840px' }">
      <div v-if="detail" class="space-y-6">
        <div class="flex justify-between items-center gap-3">
          <LogoAsset :src="logoUrl(detail.stock)" :type="detail.stock?.type == 'CRYPTO' ? 'rounded' : 'square'" />
          <div class="flex-auto">
            <h3 class="text-xl font-bold">{{ detail.name }}</h3>
            <p class="text-sm text-slate-400">
              {{ detail.symbol }}<span v-if="detail.exchange"> - {{ detail.exchange }}</span>
            </p>
            <div class="flex flex-wrap gap-2 mt-2 text-xs text-slate-300">
              <span v-if="detail.assetClass" class="px-2 py-1 rounded bg-slate-800 border border-slate-700">{{ detail.assetClass }}</span>
              <span v-if="detail.stock?.sector" class="px-2 py-1 rounded bg-slate-800 border border-slate-700">Setor: {{ detail.stock.sector }}</span>
              <span v-if="detail.info?.industry" class="px-2 py-1 rounded bg-slate-800 border border-slate-700">Industria: {{ detail.info.industry }}</span>
            </div>
          </div>
          <div class="text-right">
            <p class="text-lg font-semibold">{{ formatCurrency(detail.price, detail.currency) }}</p>
            <p class="text-sm" :class="changeClass(detail.changePct)">
              {{ formatSignedCurrency(detail.change, detail.currency) }}
              <span class="ml-1">({{ formatPercent(detail.changePct) }})</span>
            </p>
          </div>
        </div>
        <!-- <pre>{{ JSON.stringify(detail,null,2) }}</pre> -->

        <section v-if="detail.type === 'analysis' && detail.analysis" class="space-y-6 text-sm">
          <section class="flex justify-between items-end">
            <div>
              <h3 class="text-2xl font-bold">{{ detail.symbol }}</h3>
              <p class="text-slate-400">{{ detail.stock?.name }} - {{ detail.exchange }}</p>
            </div>
            <div class="text-right">
              <p class="text-3xl font-bold">{{ formatCurrency(detail.analysis?.priceMetrics?.currentPrice, detail.currency) }}</p>
              <p class="flex items-center justify-end gap-1 font-medium" :class="changeClass(detail.analysis?.priceMetrics?.priceChangePercent)">
                <span>{{ (detail.analysis?.priceMetrics?.priceChangePercent ?? 0) < 0 ? 'v' : '^' }}</span>
                {{ formatPercent(detail.analysis?.priceMetrics?.priceChangePercent) }}
              </p>
            </div>
          </section>

          <section class="flex flex-wrap gap-2">
            <span class="px-3 py-1 rounded-full bg-slate-800 border border-slate-700" v-if="detail.analysis?.summary?.trend">
              {{ detail.analysis.summary.trend }}
            </span>
            <span class="px-3 py-1 rounded-full bg-slate-800 border border-slate-700" v-if="detail.analysis?.summary?.marketCondition">
              {{ detail.analysis.summary.marketCondition }}
            </span>
            <span class="px-3 py-1 rounded-full bg-slate-800 border border-slate-700" v-if="detail.analysis?.summary?.volumeActivity">
              {{ detail.analysis.summary.volumeActivity }}
            </span>
            <span class="px-3 py-1 rounded-full bg-slate-800 border border-slate-700" v-if="detail.analysis?.summary?.strength">
              Forca: {{ detail.analysis.summary.strength }}
            </span>
          </section>

          <section>
            <h4 class="font-semibold mb-2 text-slate-300">Preco</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Metric label="Maxima" :value="detail.analysis?.priceMetrics?.dayHigh" />
              <Metric label="Minima" :value="detail.analysis?.priceMetrics?.dayLow" />
              <Metric label="Range %" :value="formatPercent(detail.analysis?.priceMetrics?.dayRangePercent)" />
              <Metric label="VWAP" :value="detail.analysis?.technicalMetrics?.vwap" />
            </div>
          </section>

          <section>
            <h4 class="font-semibold mb-2 text-slate-300">Indicadores Tecnicos</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Metric label="Volatilidade" :value="detail.analysis?.technicalMetrics?.volatility" />
              <Metric label="Momentum %" :value="formatPercent(detail.analysis?.technicalMetrics?.priceMomentum)" />
              <Metric label="Bullish Bias" :value="formatPercent(detail.analysis?.technicalMetrics?.bullishBias)" />
              <Metric label="Resistencia" :value="detail.analysis?.technicalMetrics?.resistanceLevel" />
            </div>
          </section>

          <section>
            <h4 class="font-semibold mb-2 text-slate-300">Volume</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Metric label="Total" :value="detail.analysis?.volumeMetrics?.totalVolume" />
              <Metric label="Media" :value="detail.analysis?.volumeMetrics?.averageVolume" />
              <Metric label="Maximo" :value="detail.analysis?.volumeMetrics?.maxVolume" />
              <Metric label="Ratio" :value="detail.analysis?.volumeMetrics?.volumeRatio" />
            </div>
          </section>

          <section class="text-xs text-slate-400">
            <p>
              Dados de Analise:
              {{ formatDate(detail.analysis?.sessionInfo?.marketOpen) }} ->
              {{ formatDate(detail.analysis?.sessionInfo?.marketClose) }}
              - {{ detail.analysis?.sessionInfo?.dataPoints || '-' }} candles
              - Intervalo de {{ detail.analysis?.sessionInfo?.dataGranularity || '-' }}
            </p>
          </section>
        </section>

        <section v-else class="space-y-4 text-sm">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Metric label="Ultimo preco" :value="formatCurrency(detail.price, detail.currency)" />
            <Metric label="Variacao" :value="formatPercent(detail.changePct)" />
            <Metric label="Volume" :value="detail.info?.primaryData?.volume || detail.stock?.volume || '-'" />
            <Metric label="Status" :value="detail.info?.marketStatus || '-'" />
          </div>

          <div v-if="detail.keyStats.length">
            <h4 class="font-semibold mb-2 text-slate-300">Estatisticas</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Metric v-for="stat in detail.keyStats" :key="stat.label" :label="stat.label" :value="stat.value" />
            </div>
          </div>
        </section>

        <section v-if="detail.summaryStats.length">
          <h4 class="font-semibold mb-2 text-slate-300">Resumo</h4>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Metric v-for="item in detail.summaryStats" :key="item.label" :label="item.label" :value="item.value" />
          </div>
        </section>

        <section v-if="detail.profile?.length" class="space-y-2 text-sm">
          <h4 class="font-semibold text-slate-300">Empresa</h4>
          <div class="space-y-2 bg-slate-900 border border-slate-700 rounded p-3">
            <div v-for="item in detail.profile" :key="item.label" class="flex gap-2">
              <span class="text-slate-400 min-w-[120px]">{{ labels[item.label] || item.label }}:</span>
              <span class="text-slate-200">{{ item.value }}</span>
            </div>
          </div>
        </section>

        <section v-if="detail.historyRows.length" class="space-y-2 text-sm">
          <h4 class="font-semibold text-slate-300">Historico recente</h4>
          <div class="overflow-hidden bg-slate-900 border rounded-2xl border-slate-700 rounded">
            <StockLineChart :data="detail.historyRows"/>
          </div>
        </section>

        <section v-if="detail.candles.length" class="space-y-2 text-sm">
          <h4 class="font-semibold text-slate-300">Ultimos candles</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div v-for="(candle, idx) in detail.candles.slice(-6)" :key="idx" class="bg-slate-900 border border-slate-700 rounded p-3 flex justify-between">
              <div>
                <p class="text-slate-400 text-xs">{{ formatDate(candle.timestamp) }}</p>
                <p class="text-sm">O {{ candle.open }} -> C {{ candle.close }}</p>
                <p class="text-xs text-slate-400">H {{ candle.high }} / L {{ candle.low }}</p>
              </div>
              <p class="text-xs text-slate-400">Vol: {{ candle.volume ?? 'N/A' }}</p>
            </div>
          </div>
        </section>
      </div>
    </Dialog>


  </div>
</template>

<script setup>
import API from '@/utils/api'
import { onMounted, reactive, ref, watch, inject, computed } from 'vue'
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
import { labels } from '@/constants/marketMaps'
import StockLineChart from '@/components/StockLineChart.vue'
const iframe = ref(null)

function logoUrl(stock) {
  if (!stock) return ''
  const { currency = 'USD', symbol = '', type = '' } = stock
  return `${API.HOST}/files/logo/${[symbol, type, currency].join('--')}.svg`
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

const toNumber = (value) => {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '')
    if (!cleaned || cleaned === '-' || cleaned === '.' || cleaned === '-.' || cleaned === '.-') return null
    const num = Number(cleaned)
    return Number.isFinite(num) ? num : null
  }
  return null
}

const normalizePrice = (value) => {
  const num = toNumber(value)
  if (num === null) return null
  if (Number.isInteger(num) && num > 1000) return num / 100
  return num
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('pt-BR')
}

const changeClass = (value) => {
  const num = toNumber(value)
  if (num === null) return 'text-slate-400'
  return num < 0 ? 'text-red-400' : 'text-emerald-400'
}

const detail = computed(() => {
  const data = detailData.value
  if (!data) return null

  const stock = data.stock || {}
  const info = data.info?.data || null
  const summary = data.summary?.data || null
  const profileData = data.profile?.data || null
  const history = data.history?.data || null
  const analysis = data.analysis || null
  const series = data.series || null

  const currency = stock.currency || info?.primaryData?.currency || 'USD'

  const price = normalizePrice(
    analysis?.priceMetrics?.currentPrice ??
    info?.primaryData?.lastSalePrice ??
    stock.close
  )

  const change = normalizePrice(
    analysis?.priceMetrics?.priceChange ??
    info?.primaryData?.netChange ??
    stock.change
  )

  const changePct = toNumber(
    analysis?.priceMetrics?.priceChangePercent ??
    info?.primaryData?.percentageChange ??
    null
  )

  const name = stock.name || info?.companyName || analysis?.companyName || stock.symbol
  const symbol = stock.symbol || info?.symbol || series?.symbol
  const exchange = info?.exchange || stock.exchange || stock.mic || analysis?.exchange || series?.exchange
  const assetClass = analysis?.assetClass || info?.assetClass || stock.type

  const summaryStats = summary?.summaryData ? Object.values(summary.summaryData) : []
  const keyStats = info?.keyStats ? Object.values(info.keyStats) : []
  const profile = profileData ? Object.values(profileData).filter((item) => item?.value) : []
  const historyRows = history?.tradesTable?.rows || []
  const candles = series?.candles || []

  return {
    stock,
    info,
    analysis,
    price,
    change,
    changePct,
    name,
    symbol,
    exchange,
    currency,
    assetClass,
    summaryStats,
    keyStats,
    profile,
    historyRows,
    candles,
    type: analysis ? 'analysis' : 'fundamentals'
  }
})

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
  const num = normalizePrice(value)
  if (num === null) return typeof value === 'string' ? value : '-'
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(num)
  } catch {
    return `${currency} ${num.toFixed(2)}`
  }
}

const formatSignedCurrency = (value, currency = 'USD') => {
  const num = normalizePrice(value)
  if (num === null) return '-'
  const formatted = formatCurrency(num, currency)
  return num > 0 ? `+${formatted}` : formatted
}

const formatPercent = (value) => {
  const num = toNumber(value)
  if (num === null || Number.isNaN(num)) return '-'
  return `${num.toFixed(2)}%`
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

<!-- src/components/MyAssetCard.vue -->
<template>
  <div
    class="bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-950 hover:border-primary-500">
    <!-- Header -->
    <div class="p-4 border-b border-slate-500">
      <div class="flex items-center justify-between">
        <div class="flex items-center w-full">
          <LogoAsset :src="logoUrl" :size="50"/>
          <div class="flex-auto relative pt-[16pt] pl-2">
            <div class="w-full absolute overflow-hidden top-0">
              <h3 class="font-semibold truncate text-[11pt]">{{ asset.data?.companyName || asset.name || asset.symbol }}</h3>
            </div>
            <p class="text-xs text-gray-300">{{ asset.symbol }}</p>
            <p class="text-xs text-gray-400">{{ asset.data?.exchange }}</p>
          </div>
        </div>
        <Button class="absolute" icon="pi pi-times" severity="danger" text rounded @click="$emit('remove', asset.symbol)"
          title="Remover ativo" />
      </div>
    </div>

    <!-- Conteúdo -->
    <div class="px-4 py-2 flex items-center justify-between bg-slate-900 border-y border-slate-700">
      <div class="text-xs text-gray-400">Preço</div>
      <div class="text-right">
        <div class="text-sm font-semibold">{{ formatCurrency(asset.data?.priceMetrics?.currentPrice) }}</div>
        <div :class="['text-xs', priceChangeClass]">
          {{ formatPercent(asset.data?.priceMetrics?.priceChangePercent) }}
        </div>
      </div>
    </div>

    <div class="relative h-[90px] mt-2">
      <!-- Resumo e Tendência -->
      <button @click="openMore = !openMore" :class="`absolute transition cursor-pointer hover:bg-blue-600 rounded-full bottom-2 text-center inset-x-32 shadow z-[100] text-[9pt] ${openMore ? 'bg-blue-600' : 'bg-slate-600'}`"><i :class="`pi-angle-double-down pi transition-all ${openMore ? 'rotate-180' : ' rotate-0'}`" style="font-size: 0.7rem;"></i> {{ openMore ? 'Ver Menos' : 'Ver Mais'}}</button>
      <div class="space-y-4 absolute z-10 transition-[all] duration-[1s] inset-x-0 px-4 pb-6 rounded-b-xl shadow overflow-hidden bg-slate-800" :style="`max-height: ${openMore ? '1000px' : '75px'}`">
        <div class="bg-slate-700 rounded-lg p-3">
          <div class="flex justify-between items-start mb-2">
            <span class="text-sm font-medium">Tendência</span>
            <span :class="[
              'px-2 py-1 rounded-full text-xs font-medium',
              trendClass
            ]">
              {{ asset.data?.summary?.trend }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="text-gray-400">Força:</span>
              <span class="ml-1">{{ asset.data?.summary?.strength }}</span>
            </div>
            <div>
              <span class="text-gray-400">Volume:</span>
              <span class="ml-1">{{ asset.data?.summary?.volumeActivity }}</span>
            </div>
          </div>
        </div>
        <!-- Métricas de Preço -->
        <div>
          <h4 class="text-sm font-medium mb-2">Preço</h4>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">Atual:</span>
              <span class="font-semibold">{{ formatCurrency(asset.data?.priceMetrics?.currentPrice) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Variação:</span>
              <span :class="priceChangeClass">
                {{ formatPercent(asset.data?.priceMetrics?.priceChangePercent) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Mín/Dia:</span>
              <span>{{ formatCurrency(asset.data?.priceMetrics?.dayLow) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Máx/Dia:</span>
              <span>{{ formatCurrency(asset.data?.priceMetrics?.dayHigh) }}</span>
            </div>
          </div>
        </div>

        <!-- Métricas Técnicas -->
        <div>
          <h4 class="text-sm font-medium mb-2">Análise Técnica</h4>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">VWAP:</span>
              <span>{{ formatCurrency(asset.data?.technicalMetrics?.vwap) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Volatilidade:</span>
              <span>{{ formatPercent(asset.data?.technicalMetrics?.volatility) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Viés Bullish:</span>
              <span>{{ formatPercent(asset.data?.technicalMetrics?.bullishBias) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Momentum:</span>
              <span>{{ asset.data?.technicalMetrics?.priceMomentum }}</span>
            </div>
          </div>
        </div>

        <!-- Suporte e Resistência -->
        <div class="bg-slate-700 rounded-lg p-3">
          <h4 class="text-sm font-medium mb-2">Suporte & Resistência</h4>
          <div class="flex justify-between items-center">
            <div class="text-center">
              <span class="text-xs text-gray-400 block">Suporte</span>
              <span class="text-sm font-semibold text-green-500">{{
                formatCurrency(asset.data?.technicalMetrics?.supportLevel) }}</span>
            </div>
            <div class="w-16 h-1 bg-gradient-to-r from-green-500 to-red-500 rounded-full"></div>
            <div class="text-center">
              <span class="text-xs text-gray-400 block">Resistência</span>
              <span class="text-sm font-semibold text-red-500">{{
                formatCurrency(asset.data?.technicalMetrics?.resistanceLevel) }}</span>
            </div>
          </div>
        </div>

        <!-- Volume -->
        <div>
          <h4 class="text-sm font-medium mb-2">Volume</h4>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">Volume:</span>
              <span>{{ asset.data?.volumeMetrics?.totalVolume || 'N/A' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Máx/Dia:</span>
              <span>{{ asset.data?.volumeMetrics?.maxVolume || 'N/A' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Médio:</span>
              <span>{{ asset.data?.volumeMetrics?.averageVolume || 'N/A' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Ratio:</span>
              <span>{{ asset.data?.volumeMetrics?.volumeRatio || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <!-- Informações da Sessão -->
        <div class="bg-slate-700 rounded-lg p-3">
          <h4 class="text-sm font-medium mb-2">Sessão</h4>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="text-gray-400">Abertura:</span>
              <span class="ml-1">{{ asset.data?.sessionInfo?.marketOpen || 'N/A' }}</span>
            </div>
            <div>
              <span class="text-gray-400">Fechamento:</span>
              <span class="ml-1">{{ asset.data?.sessionInfo?.marketClose || 'N/A' }}</span>
            </div>
            <div>
              <span class="text-gray-400">Data Points:</span>
              <span class="ml-1">{{ asset.data?.sessionInfo?.dataPoints || 'N/A' }}</span>
            </div>
            <div>
              <span class="text-gray-400">Frequência:</span>
              <span class="ml-1">{{ asset.data?.sessionInfo?.dataFrequency || 'N/A' }}min</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Footer -->
    <div class="p-3 bg-gray-900 relative z-1 border-t border-slate-600 rounded-b-lg">
      <div class="flex justify-end items-center">
        <!-- <Button label="Ver Detalhes" variant="outlined" severity="info" icon="pi pi-chart-line" size="small" @click="viewDetails" rounded/> -->
        <button v-if="!asset.report && !generating" class="flex items-center gap-2 rounded-full text-[11pt] bg-gradient-to-r from-blue-500 to-purple-600 px-2 h-[36px] cursor-pointer transition-all hover:outline-blue-600 outline-2 outline-transparent hover:outline-offset-2" @click="generateReport"><i class="pi pi-sparkles" style="font-size: 1rem;"></i> Gerar Relatório</button>
        <Button v-else-if="generating || asset.report?.status == 'pending'" :disabled="true" label="Gerando..." :loading="true" rounded icon="pi pi-file-pdf" size="small" severity="secondary"/>
        <Button v-else-if="asset.report.status == 'active'" rounded icon="pi pi-file-pdf" size="small" severity="secondary" @click="openReport" :loading="openingPDF" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

import LogoAsset from './LogoAsset.vue'
import Button from 'primevue/button'
import API from '@/utils/api'

const props = defineProps({
  asset: {
    type: Object,
    required: true
  },
  generating: {
    type: Boolean,
    default: false
  }
})
const openReport = async()=>{
  openingPDF.value = true;
  setTimeout(()=>{
    openingPDF.value = false;
  },1500)
  emit('openreport',props.asset);
}
const openingPDF = ref(false);
const openMore = ref(false);
const emit = defineEmits(['remove','generate','openreport'])

const logoUrl = computed(() => {
  return API.HOST + `/files/logo/${props.asset.symbol}.svg?q=${encodeURIComponent(props.asset.data?.companyName || props.asset.name || '')}`
})

// Computed para classes de estilo baseadas nos dados
const trendClass = computed(() => {
  const trend = props.asset.data?.summary?.trend?.toLowerCase()
  if (trend?.includes('alta') || trend?.includes('bull')) {
    return 'bg-green-100 text-green-800'
  } else if (trend?.includes('baixa') || trend?.includes('bear')) {
    return 'bg-red-100 text-red-800'
  } else {
    return 'bg-yellow-100 text-yellow-800'
  }
})

const priceChangeClass = computed(() => {
  const change = props.asset.data?.priceMetrics?.priceChangePercent
  if (!change) return 'text-gray-400'
  return change >= 0 ? 'text-green-500' : 'text-red-500'
})

// Métodos de formatação
const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'N/A'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: props.asset.data?.currency || 'BRL'
  }).format(value)
}

const formatPercent = (value) => {
  if (value === null || value === undefined) return 'N/A'
  const number = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number / 100)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('pt-BR')
}

const viewDetails = () => {
  console.log('Ver detalhes:', props.asset.symbol)
  // Navegar para página de detalhes do ativo
}

const generateReport = () => {
  console.log('Gerar relatório:', props.asset.symbol)
  emit('generate',props.asset);
}
</script>

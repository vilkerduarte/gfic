<!-- src/components/AssetCard.vue -->
<template>
  <div class="bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-950">
    <div class="p-4 border-b border-slate-500">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <LogoAsset :type="asset.type == 'CRYPTO' ? 'rounded' : 'square'" :src="logoUrl" :size="50" />
          <div>
            <h3 class="font-semibold text-sm truncate text-primary-300 cursor-pointer" @click="$emit('details', asset)">
              {{ displayName }}
            </h3>
            <p class="text-xs text-gray-300">{{ asset.symbol }}</p>
            <p class="text-[11px] text-gray-400">{{ displayExchange }}</p>
          </div>
        </div>
        <Button
          :icon="isInMyAssets ? 'pi pi-bookmark-fill' : 'pi pi-bookmark'"
          :severity="isInMyAssets ? 'success' : 'secondary'"
          text
          rounded
          @click="handleBookmarkClick"
          :loading="bookmarkLoading"
          title="Adicionar aos meus ativos"
        />
      </div>
    </div>

    <div class="p-4 space-y-3">
      <div class="flex justify-between items-center">
        <span class="text-sm text-slate-300">Preço</span>
        <span class="text-lg font-bold">{{ priceText }}</span>
      </div>

      <div class="flex justify-between items-center">
        <span class="text-sm text-slate-300">Variação</span>
        <span :class="['text-sm font-medium', changeClass]">
          {{ changeText }}
        </span>
      </div>

      <div class="flex justify-between items-center">
        <span class="text-sm text-slate-300">Tipo</span>
        <span class="text-sm">{{ typeLabel }}</span>
      </div>

      <div class="flex justify-between items-center">
        <span class="text-sm text-slate-300">Bolsa</span>
        <span class="text-sm">{{ exchangeLabel }}</span>
      </div>
    </div>

    <div class="p-3 bg-gray-900 border-t border-slate-600 rounded-b-lg text-right text-xs text-gray-400 flex items-center justify-between">
      <span>Fonte: Finnhub / Brapi</span>
      <div v-if="auth?.isAuthenticated.value" class="flex gap-2">
        <button
          v-if="!asset.report && !generating"
          class="flex items-center gap-2 text-white rounded-full text-[11pt] bg-gradient-to-r from-blue-500 to-purple-600 px-3 h-[36px] cursor-pointer transition-all hover:outline-blue-600 outline-2 outline-transparent hover:outline-offset-2"
          @click="$emit('generate-report', asset)"
        >
          <i class="pi pi-sparkles" style="font-size: 1rem;"></i> Gerar Relatório
        </button>
        <Button
          v-else-if="generating || asset.report?.status === 'pending'"
          :disabled="true"
          label="Gerando..."
          :loading="true"
          rounded
          icon="pi pi-file-pdf"
          size="small"
          severity="secondary"
        />
        <Button
          v-else-if="asset.report?.status === 'active'"
          rounded
          :loading="loaders.report"
          icon="pi pi-download"
          size="small"
          severity="secondary"
          @click="()=>{$emit('open-report', asset);tempLoadingReport() }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import API from '@/utils/api'
import LogoAsset from './LogoAsset.vue'
import { instrumentTypeMap, micNameMap } from '@/constants/marketMaps'

const loaders = ref({report:false});

const tempLoadingReport = ()=>{
  loaders.value.report = true; 
  setTimeout(()=>{
    loaders.value.report = false;
  },4000)
}
const props = defineProps({
  asset: { type: Object, required: true },
  isInMyAssets: { type: Boolean, default: false },
  generating: { type: Boolean, default: false }
})

const emit = defineEmits(['asset-added', 'asset-removed', 'details', 'generate-report', 'open-report'])

const router = useRouter()
const toast = useToast()
const auth = inject('auth')
const bookmarkLoading = ref(false)

const displayName = computed(() => props.asset.name || props.asset.symbol)
const displayExchange = computed(() => props.asset.exchange || props.asset.mic || 'Mercado')
const typeLabel = computed(() => instrumentTypeMap[props.asset.type] || props.asset.type || '-')
const exchangeLabel = computed(() => micNameMap[props.asset.mic] || props.asset.exchange || props.asset.mic || '-')

const logoUrl = computed(() => {

  return API.HOST + `/files/logo/${props.asset.symbol}--${props.asset.type}--${props.asset.currency}.svg`

  console.log(props.asset);
  if (props.asset.logo) {
    return props.asset.logo.startsWith('http')
      ? props.asset.logo
      : `${API.HOST}${props.asset.logo}`
  }
  return API.HOST + `/files/logo/${props.asset.symbol}.svg`
})

const priceText = computed(() => formatCurrency(props.asset.price, props.asset.currency))
const changeText = computed(() => {
  const percent = props.asset.changePercent
  if (percent == null) return '-'
  const value = Number(percent).toFixed(2)
  return `${value}%`
})

const changeClass = computed(() => {
  const percent = props.asset.changePercent
  if (percent == null) return 'text-slate-300'
  return percent >= 0 ? 'text-green-500' : 'text-red-500'
})

function formatCurrency(value, currency = 'USD') {
  if (value == null) return '-'
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency
    }).format(value)
  } catch (e) {
    return `${currency} ${Number(value).toFixed(2)}`
  }
}

const handleBookmarkClick = async () => {
  if (!auth.isAuthenticated.value) {
    router.push('/login')
    return
  }

  bookmarkLoading.value = true
  try {
    if (props.isInMyAssets) {
      const response = await API.delete(`/assets/my-assets/${props.asset.symbol}`)
      if (response.success) {
        toast.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Ativo removido dos favoritos!',
          life: 3000
        })
        emit('asset-removed', props.asset.symbol)
      }
    } else {
      const response = await API.post('/assets/my-assets', {
        symbol: props.asset.symbol,
        name: props.asset.name || props.asset.symbol
      })

      if (response.success) {
        toast.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Ativo adicionado aos favoritos!',
          life: 3000
        })
        emit('asset-added', props.asset)
      }
    }
    auth.fetchAssets()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: error.error || 'Erro ao processar solicitação',
      life: 5000
    })
  } finally {
    bookmarkLoading.value = false
  }
}
</script>

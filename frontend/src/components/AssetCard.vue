<!-- src/components/AssetCard.vue -->
<template>
  <div class="bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-950">
    <!-- Header do Card -->
    <div class="p-4 border-b border-slate-500">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <!-- <Avatar v-if="showLogo" @error="showLogo = false" :image="logoUrl" class="mr-2 p-1 shadow" style="background-color: white" size="xlarge" shape="square" /> -->
          <LogoAsset :src="logoUrl" :size="50"/>
          <div>
            <h3 class="font-semibold text-sm">{{ asset.shortName }}</h3>
            <p class="text-xs text-gray-300">{{ asset.symbol }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          
          <Button 
            :icon="isInMyAssets ? 'pi pi-bookmark-fill' : 'pi pi-bookmark'"
            :severity="isInMyAssets ? 'success' : 'secondary'"
            :size="isInMyAssets ? 'large' : 'small'"
            text
            rounded
            @click="handleBookmarkClick"
            :loading="bookmarkLoading"
            title="Adicionar aos meus ativos"
          />
        </div>
      </div>
    </div>

    <!-- Conteúdo do Card -->
    <div class="p-4 space-y-3">
      <!-- Preço -->
      <div class="flex justify-between items-center">
        <span class="text-sm text-slate-300">Preço:</span>
        <span class="text-lg font-bold">
          ${{ asset.regularMarketPrice?.fmt || 'N/A' }}
        </span>
      </div>

      <!-- Variação -->
      <div class="flex justify-between items-center">
        <span class="text-sm text-slate-300">Fechamento Anterior:</span>
        <span 
          :class="[
            'text-sm font-medium',
            lastClosePriceClass
          ]"
        >
          ${{ asset.lastClosePriceToNNWCPerShare?.fmt || 'N/A' }}
        </span>
      </div>

      <!-- Exchange -->
      <div class="flex justify-between items-center">
        <span class="text-sm text-slate-300">Exchange:</span>
        <span class="text-sm">{{ asset.fullExchangeName }}</span>
      </div>

      <!-- Horário -->
      <div class="flex justify-between items-center">
        <span class="text-sm text-slate-300">Última Atualização:</span>
        <span class="text-sm">{{ asset.regularMarketTime?.fmt || 'N/A' }}</span>
      </div>

      <!-- Timezone -->
      <div class="flex justify-between items-center">
        <span class="text-sm text-slate-300">Timezone:</span>
        <span class="text-sm">{{ asset.exchangeTimezoneShortName }}</span>
      </div>

      <!-- Status de Negociação -->
      <div class="flex justify-between items-center">
        <span class="text-sm text-slate-300">Negociável:</span>
        <span 
          :class="[
            'text-sm font-medium',
            asset.tradeable ? 'text-green-600' : 'text-red-600'
          ]"
        >
          {{ asset.tradeable ? 'Sim' : 'Não' }}
        </span>
      </div>
    </div>

    <!-- Footer do Card -->
    <div class="p-4 bg-gray-900 border-t border-slate-600 rounded-b-lg">
      <div class="flex justify-between text-xs text-gray-300">
        <span>Tipo: {{ asset.typeDisp }}</span>
        <span>Fonte: Yahoo Finanças</span>
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

const props = defineProps({
  asset: {
    type: Object,
    required: true
  },
  isInMyAssets: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['asset-added', 'asset-removed'])

const router = useRouter()
const toast = useToast()
const auth = inject('auth')

const bookmarkLoading = ref(false)

const showLogo = ref(true);

// URL da logo
const logoUrl = computed(() => API.HOST + `/files/logo/${props.asset.symbol}.svg`)

// Computed properties
const marketStateText = computed(() => {
  const states = {
    'REGULAR': 'Aberto',
    'CLOSED': 'Fechado',
    'PRE': 'Pré-Mercado',
    'POST': 'After-Market'
  }
  return states[props.asset.marketState] || props.asset.marketState
})

const lastClosePriceClass = computed(() => {
  const rawPrice = props.asset.lastClosePriceToNNWCPerShare?.raw
  if (rawPrice === undefined || rawPrice === null) return 'text-slate-300'
  return rawPrice >= 0 ? 'text-green-600' : 'text-red-600'
})

// Métodos
const handleBookmarkClick = async () => {
  if (!auth.isAuthenticated.value) {
    router.push('/login')
    return
  }

  bookmarkLoading.value = true

  try {
    if (props.isInMyAssets) {
      // Remover asset
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
      // Adicionar asset
      const response = await API.post('/assets/my-assets', {
        symbol: props.asset.symbol,
        name: props.asset.longName || props.asset.shortName,
        data: props.asset
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
    auth.fetchAssets();
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
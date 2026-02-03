<!-- src/components/AssetSearchCard.vue -->
<template>
  <div class="bg-slate-800 rounded-lg shadow-md border border-gray-950 hover:border-primary-500 transition-all duration-300">
    <div class="p-4">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center space-x-3">
          <LogoAsset :src="logoUrl" :size="50" />
          <div>
            <h3 class="font-semibold text-sm">{{ asset.name || asset.symbol }}</h3>
            <p class="text-xs text-gray-300">{{ asset.symbol }}</p>
            <p class="text-[11px] text-gray-400">{{ asset.exchange || asset.mic }}</p>
          </div>
        </div>
      </div>

      <div class="space-y-2 text-sm mb-4">
        <div class="flex justify-between">
          <span class="text-gray-400">Preço</span>
          <span>{{ priceText }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Variação</span>
          <span :class="changeClass">{{ changeText }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Tipo</span>
          <span>{{ asset.type || '-' }}</span>
        </div>
      </div>

      <Button
        :label="isAdded ? 'Já Adicionado' : 'Adicionar'"
        :icon="isAdded ? 'pi pi-check' : 'pi pi-plus'"
        :disabled="isAdded"
        :severity="isAdded ? 'secondary' : 'primary'"
        class="w-full"
        @click="$emit('add', asset)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import Button from 'primevue/button'
import API from '@/utils/api'
import LogoAsset from './LogoAsset.vue'

const props = defineProps({
  asset: { type: Object, required: true },
  isAdded: { type: Boolean, default: false }
})

defineEmits(['add'])

const logoUrl = computed(() => {
  if (props.asset.logo) {
    return props.asset.logo.startsWith('http')
      ? props.asset.logo
      : `${API.HOST}${props.asset.logo}`
  }
  return API.HOST + `/files/logo/${props.asset.symbol}.svg?q=${encodeURIComponent(props.asset.name || '')}`
})

const priceText = computed(() => {
  if (props.asset.price == null) return '-'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: props.asset.currency || 'USD'
  }).format(props.asset.price)
})

const changeText = computed(() => {
  if (props.asset.changePercent == null) return '-'
  return `${Number(props.asset.changePercent).toFixed(2)}%`
})

const changeClass = computed(() => {
  const v = props.asset.changePercent
  if (v == null) return 'text-gray-400'
  return v >= 0 ? 'text-green-500' : 'text-red-500'
})
</script>

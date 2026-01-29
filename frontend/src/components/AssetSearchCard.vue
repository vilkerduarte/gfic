<!-- src/components/AssetSearchCard.vue -->
<template>
  <div class="bg-slate-800 rounded-lg shadow-md border border-gray-950 hover:border-primary-500 transition-all duration-300">
    <div class="p-4">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center space-x-3">
          <LogoAsset 
            :src="logoUrl"
            :size="50"
          />
          <div>
            <h3 class="font-semibold text-sm">{{ asset.shortName || asset.longName }}</h3>
            <p class="text-xs text-gray-300">{{ asset.symbol }}</p>
          </div>
        </div>
      </div>

      <div class="space-y-2 text-sm mb-4">
        <div class="flex justify-between">
          <span class="text-gray-400">Exchange:</span>
          <span>{{ asset.fullExchangeName }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Tipo:</span>
          <span>{{ asset.type }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Moeda:</span>
          <span>{{ asset.currency }}</span>
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
  asset: {
    type: Object,
    required: true
  },
  isAdded: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['add'])

const logoUrl = computed(() => {
  return API.HOST + `/files/logo/${props.asset.symbol}.svg?q=${encodeURIComponent(props.asset.longName || props.asset.shortName || '')}`
})
</script>
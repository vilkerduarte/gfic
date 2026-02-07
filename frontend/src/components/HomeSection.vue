<template>
  <div class="rounded-md p-2 bg-black/10 border border-gray-800 space-y-3">
    <div class="flex gap-2 items-center justify-start">
      <img v-if="icon" :src="icon" alt="" class="w-12" />
      <h2 class="text-[17pt] md:text-[23pt]">{{ title }}</h2>
    </div>

    <div v-if="showTypeFilter && types.length" class="flex items-center gap-3">
      <label class="text-sm text-slate-300">Filtrar por tipo:</label>
      <select
        class="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm"
        :value="selectedType"
        @change="onType($event.target.value)"
      >
        <option value="">Todos</option>
        <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
      </select>
    </div>

    <div v-if="loading" class="text-center py-6 text-slate-400 text-sm">
      <i class="pi pi-spinner pi-spin mr-2"></i>Carregando...
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <AssetCard
        v-for="asset in assets"
        :key="region + '-' + asset.symbol"
        :asset="asset"
        :is-in-my-assets="isInMyAssets(asset)"
        :generating="isGenerating(asset)"
        @details="emit('details', asset)"
        @generate-report="emit('generate-report', asset)"
        @open-report="emit('open-report', asset)"
        @asset-added="emit('refresh')"
        @asset-removed="emit('refresh')"
      />
    </div>

    <div class="flex items-center justify-between text-sm text-slate-300">
      <span>Página {{ page }} de {{ totalPages }}</span>
      <div class="flex gap-2">
        <button
          class="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
          :disabled="page <= 1"
          @click="emit('change-page', region, -1)"
        >
          Anterior
        </button>
        <button
          class="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
          :disabled="page >= totalPages"
          @click="emit('change-page', region, 1)"
        >
          Próxima
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import AssetCard from './AssetCard.vue'

const props = defineProps({
  title: String,
  icon: String,
  region: { type: String, required: true },
  assets: { type: Array, default: () => [] },
  page: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  types: { type: Array, default: () => [] },
  selectedType: { type: String, default: '' },
  showTypeFilter: { type: Boolean, default: true },
  loading: { type: Boolean, default: false },
  generatingMap: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['change-page', 'change-type', 'details', 'generate-report', 'open-report', 'refresh'])
const auth = inject('auth', null)

const onType = (value) => emit('change-type', props.region, value)

const isInMyAssets = (asset) => {
  const list = auth?.user.value?.assets || []
  return asset.isInMyAssets || list.includes(asset.symbol)
}

const isGenerating = (asset) => {
  return !!props.generatingMap[asset.symbol]
}
</script>

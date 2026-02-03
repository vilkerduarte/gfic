<template>
  <div class="container mx-auto p-4">
    <!-- Filtros e Busca -->
    <div class="mb-6 space-y-4">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <FloatLabel variant="on">
            <InputText v-model="searchTerm" size="small" class="w-64" />
            <label>Pesquisar</label>
          </FloatLabel>
        </div>
        <div class="flex gap-2">
          <Dropdown 
            v-model="selectedExchange"
            :options="exchangeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Filtrar por Exchange"
            class="w-48"
          />
          <Button 
            label="Limpar Filtros"
            @click="clearFilters"
            variant="link"
          />
        </div>
      </div>
      
      <!-- Informações de paginação -->
      <div class="text-sm text-gray-600">
        Mostrando {{ startIndex + 1 }} - {{ Math.min(endIndex, filteredAssets.length) }} de {{ filteredAssets.length }} ativos
      </div>
    </div>

    <!-- Grid de Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <AssetCard 
        v-for="asset in paginatedAssets"
        :isInMyAssets="auth && auth.user.value ? auth.user.value.assets.includes(asset.symbol) : false"
        :key="asset.symbol"
        :asset="asset"
      />
    </div>

    <!-- Paginação -->
    <div class="mt-6 flex justify-center items-center gap-4">
      <Button 
        icon="pi pi-angle-left"
         rounded aria-label="Previous"
         size="small"
        @click="previousPage"
        :disabled="currentPage === 0"
      />
      
      <span class="text-sm text-gray-600">
        Página {{ currentPage + 1 }} de {{ totalPages }}
      </span>
      
      <Button 
        icon="pi pi-angle-right"
         rounded aria-label="Next"
         size="small"
        @click="nextPage"
        :disabled="currentPage >= totalPages - 1"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted,watch, inject } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import AssetCard from './AssetCard.vue'

const auth = inject('auth');

const props = defineProps({
  assets: {
    type: Array,
    required: true,
    default: () => []
  }
})

// Estados reativos
const searchTerm = ref('')
const selectedExchange = ref('')
const currentPage = ref(0)
const itemsPerPage = 12

// Computed properties
const exchangeOptions = computed(() => {
  const exchanges = [...new Set(props.assets.map(asset => asset.exchange || asset.mic))].filter(Boolean)
  return exchanges.map(exchange => ({
    label: exchange,
    value: exchange
  }))
})

const filteredAssets = computed(() => {
  let filtered = props.assets

  // Filtro por busca
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(asset => 
      asset.name?.toLowerCase().includes(term) ||
      asset.symbol?.toLowerCase().includes(term)
    )
  }

  // Filtro por exchange
  if (selectedExchange.value) {
    filtered = filtered.filter(asset => 
      (asset.exchange || asset.mic) === selectedExchange.value
    )
  }

  return filtered
})

const paginatedAssets = computed(() => {
  const start = currentPage.value * itemsPerPage
  const end = start + itemsPerPage
  return filteredAssets.value.slice(start, end)
})

const totalPages = computed(() => 
  Math.ceil(filteredAssets.value.length / itemsPerPage)
)

const startIndex = computed(() => currentPage.value * itemsPerPage)
const endIndex = computed(() => startIndex.value + itemsPerPage)

// Métodos
const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++
  }
}

const previousPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--
  }
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedExchange.value = ''
  currentPage.value = 0
}

// Debounce para busca
const debouncedSearch = useDebounceFn(() => {
  currentPage.value = 0
}, 300)

// Watchers
watch(searchTerm, debouncedSearch)
watch(selectedExchange, () => {
  currentPage.value = 0
})

// Resetar página quando os assets mudarem
watch(() => props.assets, () => {
  currentPage.value = 0
})
</script>

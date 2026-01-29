<!-- src/pages/MyAssets.vue -->
<template>
  <div class="px-3 md:px-12 py-8">
    <ClassicToolbar />
    <iframe ref="iframe" class="w-[210mm] h-[297mm] scale-[0.5] fixed left-[-500%] top-0 bg-white origin-top" src="/generate_report.html"></iframe>
    
    <div class="rounded-md p-2 bg-black/10 border border-gray-800 mb-8">
      <div class="py-2 flex gap-2 items-center justify-start">
        <i class="pi pi-th-large text-2xl"></i>
        <h2 class="text-[17pt] md:text-[23pt]">Meus Ativos Monitorados</h2>
        <Button @click="loadMyAssets()" size="small" icon="pi pi-refresh" rounded severity="primary" :loading="loading"/>
      </div>
      
      <!-- Busca Rápida -->
      <div class="mb-6">
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-search" />
          </InputGroupAddon>
          <InputText 
            v-model="searchQuery" 
            placeholder="Buscar ativos..." 
            class="w-96"
            @input="searchAssets"
          />
        </InputGroup>
      </div>

      <!-- Lista de Ativos -->
      <div v-if="loading && myAssets.length === 0" class="flex justify-center py-8">
        <i class="pi pi-spinner pi-spin text-4xl"></i>
      </div>

      <div v-else-if="myAssets.length === 0" class="text-center py-8 text-gray-500">
        <i class="pi pi-inbox text-4xl mb-4"></i>
        <p>Nenhum ativo adicionado ainda.</p>
        <p class="text-sm">Use a busca acima para encontrar e adicionar ativos.</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="(asset, i) in myAssets"
          :key="asset.hash" class="relative" :style="`z-index: ${(200 - i)}`">
            <MyAssetCard
              :asset="asset"
              @remove="removeAsset"
              @generate="generateReport"
              @openreport="openReport"
            />
        </div>
      </div>

      <!-- Paginação -->
      <div v-if="totalPages > 1" class="mt-6 flex justify-center items-center gap-4">
        <Button 
          icon="pi pi-angle-left"
          rounded 
          @click="previousPage"
          :disabled="currentPage === 0"
        />
        
        <span class="text-sm text-gray-600">
          Página {{ currentPage + 1 }} de {{ totalPages }}
        </span>
        
        <Button 
          icon="pi pi-angle-right"
          rounded 
          @click="nextPage"
          :disabled="currentPage >= totalPages - 1"
        />
      </div>
    </div>

    <!-- Busca de Novos Ativos -->
    <div class="rounded-md p-2 bg-black/10 border border-gray-800">
      <div class="py-2 flex gap-2 items-center justify-start">
        <i class="pi pi-search text-2xl"></i>
        <h2 class="text-[17pt] md:text-[23pt]">Buscar e Adicionar Ativos</h2>
      </div>

      <div class="mb-4">
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-search" />
          </InputGroupAddon>
          <InputText 
            v-model="globalSearchQuery" 
            placeholder="Digite o símbolo ou nome do ativo..."
            class="w-96"
            @input="debouncedGlobalSearch"
          />
        </InputGroup>
      </div>

      <div v-if="globalSearchResults.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AssetSearchCard 
          v-for="asset in globalSearchResults"
          :key="asset.symbol"
          :asset="asset"
          :is-added="isAssetAdded(asset.symbol)"
          @add="addAsset"
        />
      </div>

      <div v-else-if="globalSearchQuery && !searching" class="text-center py-8 text-gray-500">
        <p>Nenhum ativo encontrado para "{{ globalSearchQuery }}"</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted,watch, inject } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useToast } from 'primevue/usetoast'
import API from '@/utils/api'
import ClassicToolbar from '@/components/ClassicToolbar.vue'
import MyAssetCard from '@/components/MyAssetCard.vue'
import AssetSearchCard from '@/components/AssetSearchCard.vue'

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkHtml from 'remark-html'
const iframe = ref(null)
const toast = useToast()

// Estados para meus ativos
const myAssets = ref([])
const loading = ref(false)
const searchQuery = ref('')
const currentPage = ref(0)
const itemsPerPage = 12
const totalItems = ref(0)

// Estados para busca global
const globalSearchQuery = ref('')
const globalSearchResults = ref([])
const searching = ref(false)

const pooling = ref(null);
// Computed
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

// Carregar meus ativos
const loadMyAssets = async (page = 0) => {
  loading.value = true
  try {
    const response = await API.get(`/assets/my-assets?page=${page + 1}&q=${searchQuery.value}`)
    myAssets.value = response.list || []
    totalItems.value = response.total_items || 0
    currentPage.value = page
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Erro ao carregar ativos',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

// Busca de ativos globais
const searchGlobalAssets = async () => {
  if (!globalSearchQuery.value.trim()) {
    globalSearchResults.value = []
    return
  }

  searching.value = true
  try {
    const results = await API.get(`/assets/search?q=${globalSearchQuery.value}`)
    globalSearchResults.value = results || []
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Erro na busca',
      life: 5000
    })
  } finally {
    searching.value = false
  }
}

// Adicionar asset
const addAsset = async (asset) => {
  try {
    const response = await API.post('/assets/my-assets', {
      symbol: asset.symbol,
      name: asset.longName || asset.shortName,
      data: asset
    })

    if (response.success) {
      toast.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Ativo adicionado com sucesso!',
        life: 3000
      })
      // Recarregar lista
      loadMyAssets(currentPage.value)
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: error.error || 'Erro ao adicionar ativo',
      life: 5000
    })
  }
}

const auth = inject('auth');

// Remover asset
const removeAsset = async (symbol) => {
  try {
    const response = await API.delete(`/assets/my-assets/${symbol}`)
    
    if (response.success) {
      toast.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Ativo removido com sucesso!',
        life: 3000
      })
      // Recarregar lista
      loadMyAssets(currentPage.value)
      auth.fetchAssets();
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: error.error || 'Erro ao remover ativo',
      life: 5000
    })
  }
}
const creditModalManager = inject('creditModalManager')



async function openReport(asset) {
  
    let data = new Date(Date.parse(asset.report.created_at));
    let md = await API.get(`/reports/view/${asset.report.hash}`);  
    console.log('hasss ',md);
    const file = await unified()
        .use(remarkParse)
        .use(remarkHtml)
        .process(md)
    let html = String(file)
    html = html.split('<hr>').map(a => `<section>${a}</section>`).join('');

    const iframeWindow = iframe.value?.contentWindow;
    iframeWindow.gerarPdf(html,data);
}

const generateReport = async(asset)=>{
  if(auth.user.value){
    if(!auth.user.value.balance){
      toast.add({
        severity: 'warn',
        summary: 'Ops!',
        detail: 'Créditos Insuficientes',
        life: 2500
      })
      creditModalManager.open()
    }else{
      try {
        await API.get(`/reports/create/${asset.symbol}`);
        loadMyAssets(currentPage.value);
        auth.fetchUser();
        toast.add({
          severity: 'success',
          summary: 'Sucesso!',
          detail: 'Seu relatório ficará pronto em aproximadamente 3 minutos, por favor aguarde.',
          life: 10000
        });
      } catch (error) {
        
      }
    }
  }
}
// Verificar se asset já foi adicionado
const isAssetAdded = (symbol) => {
  return myAssets.value.some(asset => asset.symbol === symbol)
}

// Paginação
const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    loadMyAssets(currentPage.value + 1)
  }
}

const previousPage = () => {
  if (currentPage.value > 0) {
    loadMyAssets(currentPage.value - 1)
  }
}

// Debounce para busca
const debouncedGlobalSearch = useDebounceFn(searchGlobalAssets, 500)
const debouncedSearch = useDebounceFn(() => loadMyAssets(0), 500)

// Watchers
watch(searchQuery, debouncedSearch)

const poolingFetch = async()=>{
  await loadMyAssets(currentPage.value)
  setTimeout(poolingFetch,6000);
}
// Lifecycle
onMounted(() => {
  poolingFetch();
})
</script>
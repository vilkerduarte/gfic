<!-- src/components/ClassicToolbar.vue -->
<template>
    <div class="mb-3 relative z-[205]">
        <Toolbar>
            <template #end>
                <Button 
                    icon="pi pi-wallet" 
                    class="mr-2" 
                    severity="secondary" 
                    text 
                    @click="openCreditModal()"
                    title="Recarregar créditos"
                />
            </template>

            <template #start>
                <div class="relative">
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText 
                            placeholder="Pesquisar Ativo" 
                            class="w-full md:w-96 max-w-full"
                            v-model="searchQuery"
                            @input="debouncedSearch"
                            @focus="showResults = true"
                        />
                    </IconField>

                    

                    <!-- Dropdown de Resultados -->
                    <div 
                        v-if="showResults && searchResults.length > 0" 
                        class="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-[200] max-h-96 overflow-y-auto"
                    >
                        <div class="p-2 space-y-2">
                            <SearchResultCard 
                                v-for="asset in searchResults"
                                :key="asset.symbol"
                                :asset="asset"
                                :is-in-my-assets="auth.user.value ? auth.user.value.assets?.includes(asset.symbol) : false"
                                @add="addAsset"
                                @remove="removeAsset"
                            />
                        </div>
                    </div>
                </div>
            </template>
        </Toolbar>

      

    </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, onUnmounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useToast } from 'primevue/usetoast'
import API from '@/utils/api'
import SearchResultCard from '@/components/SearchResultCard.vue'

const creditModalManager = inject('creditModalManager')
const openCreditModal = () => {
  creditModalManager.open()
}

const toast = useToast()
const auth = inject('auth')

// Estados da busca
const searchQuery = ref('')
const searchResults = ref([])
const showResults = ref(false)
const searching = ref(false)


// Computed
const myAssets = computed(() => auth.user.value?.myAssets || [])

// Métodos
const debouncedSearch = useDebounceFn(async () => {
    if (!searchQuery.value.trim()) {
        searchResults.value = []
        showResults.value = false
        return
    }

    searching.value = true
    try {
        const results = await API.get(`/assets/search?q=${searchQuery.value}`)
        searchResults.value = results || []
        showResults.value = true
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro na busca',
            life: 5000
        })
        searchResults.value = []
    } finally {
        searching.value = false
    }
}, 500)

const isInMyAssets = (symbol) => {
    return myAssets.value.some(asset => asset.symbol === symbol)
}

const addAsset = async (asset) => {
    
    if (!auth.isAuthenticated.value) {
        toast.add({
            severity: 'warn',
            summary: 'Atenção',
            detail: 'Faça login para adicionar ativos',
            life: 3000
        })
        return
    }

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
                detail: 'Ativo adicionado!',
                life: 2000
            })
            // Atualizar lista local
        }
        auth.fetchAssets()
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.error || 'Erro ao adicionar ativo',
            life: 5000
        })
    }
}

const removeAsset = async (symbol) => {
    try {
        const response = await API.delete(`/assets/my-assets/${symbol}`)
        if (response.success) {
            toast.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Ativo removido!',
                life: 2000
            })
            // Atualizar lista local
            auth.refreshUser()
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



// Fechar dropdown ao clicar fora
const handleClickOutside = (event) => {
    const searchContainer = event.target.closest('.relative')
    if (!searchContainer) {
        showResults.value = false
    }
}

// Adicionar event listener
onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>
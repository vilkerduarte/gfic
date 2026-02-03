<!-- src/components/AssetCard.vue -->
<template>
    <div
        class="bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-950">
        <!-- Header do Card -->
        <div class="p-4 border-b border-slate-500">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <!-- <Avatar v-if="showLogo" @error="showLogo = false" :image="logoUrl" class="mr-2 p-1 shadow" style="background-color: white" size="xlarge" shape="square" /> -->
                    <LogoAsset :src="logoUrl" :size="50" />
                    <div>
                        <h3 class="font-semibold text-sm">{{ asset.name || asset.symbol }}</h3>
                        <p class="text-xs text-gray-300">{{ asset.symbol }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">

                    <Button icon="pi pi-close" :loading="bookmarkLoading" severity="secondary" size="large" rounded @click="handleBookmarkClick"
                        title="Adicionar aos meus ativos" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import API from '@/utils/api'
import LogoAsset from './LogoAsset.vue'

const props = defineProps({
    asset: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['refresh'])

const toast = useToast()

const bookmarkLoading = ref(false)

// URL da logo
const logoUrl = computed(() => {
    if (props.asset.logo) {
        return props.asset.logo.startsWith('http') ? props.asset.logo : `${API.HOST}${props.asset.logo}`
    }
    return API.HOST + `/files/logo/${props.asset.symbol}.svg`
})

// Métodos
const handleBookmarkClick = async () => {

    bookmarkLoading.value = true

    try {
        const response = await API.delete(`/files/${props.asset.symbol}`)
        if (response.success) {
            toast.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Ativo removido dos favoritos!',
                life: 3000
            })
            emit('refresh', props.asset.symbol)
        }
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

<!-- src/components/SearchResultCard.vue -->
<template>
    <div class="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-500 transition-colors">
        <div class="flex items-center space-x-3 flex-1 min-w-0">
            <LogoAsset :src="logoUrl" :size="30" />
            <div class="min-w-0 flex-1">
                <h4 class="font-semibold text-sm truncate">{{ asset.shortName || asset.longName }}</h4>
                <p class="text-xs text-gray-300 truncate">{{ asset.symbol }} • {{ asset.fullExchangeName }}</p>
            </div>
        </div>

        <Button :icon="isInMyAssets ? 'pi pi-bookmark-fill' : 'pi pi-bookmark'"
            :severity="isInMyAssets ? 'primary' : 'secondary'" text rounded size="small" :loading="loading"
            @click="handleBookmarkClick" :title="isInMyAssets ? 'Remover dos favoritos' : 'Adicionar aos favoritos'" />
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

const emit = defineEmits(['add', 'remove'])

const router = useRouter()
const toast = useToast()
const auth = inject('auth')

const loading = ref(false)

const logoUrl = computed(() => {
    return API.HOST + `/files/logo/${props.asset.symbol}.svg?q=${encodeURIComponent(props.asset.longName || props.asset.shortName || '')}`
})

const handleBookmarkClick = async () => {
    if (!auth.isAuthenticated.value) {
        router.push('/login')
        return
    }

    loading.value = true

    try {
        if (props.isInMyAssets) {
            const response = await API.delete(`/assets/my-assets/${props.asset.symbol}`)
            if (response.success) {
                toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Ativo removido!',
                    life: 2000
                })
                emit('remove', props.asset.symbol)
            }
        } else {
            const response = await API.post('/assets/my-assets', {
                symbol: props.asset.symbol,
                name: props.asset.longName || props.asset.shortName,
                data: props.asset
            })

            if (response.success) {
                toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Ativo adicionado!',
                    life: 2000
                })
                emit('add', props.asset)
            }
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.error || 'Erro ao processar solicitação',
            life: 5000
        })
    } finally {
        loading.value = false
    }
}
</script>
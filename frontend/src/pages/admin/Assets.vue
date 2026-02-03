<template>
  <div class="px-8 py-6">
    <div class="flex items-center gap-2 mb-4">
      <i class="pi pi-image"></i>
      <h2 class="text-2xl font-bold">Admin - Assets e Logos</h2>
    </div>

    <section class="rounded-md border border-slate-800 bg-black/20 p-4">
      <div class="flex flex-wrap gap-3 items-center mb-3">
        <InputText v-model="filters.q" placeholder="Buscar por symbol ou nome" class="w-72" @keyup.enter="fetchAssets" />
        <Button label="Buscar" icon="pi pi-search" size="small" @click="fetchAssets" />
      </div>

      <div class="space-y-2 max-h-[560px] overflow-y-auto">
        <div v-for="asset in assets" :key="asset.id" class="border border-slate-700 rounded p-3 flex items-center justify-between hover:border-primary-500">
          <div>
            <p class="font-semibold">{{ asset.symbol }}</p>
            <p class="text-sm text-slate-300">{{ asset.name }}</p>
            <p class="text-xs text-slate-400">Logo: {{ hasLogo(asset) ? 'sim' : 'nao' }}</p>
          </div>
          <Button label="Editar" size="small" icon="pi pi-pencil" outlined @click="selectAsset(asset)" />
        </div>
      </div>

      <div class="flex justify-between items-center mt-3">
        <Button icon="pi pi-angle-left" rounded size="small" :disabled="page===1" @click="changePage(page-1)" />
        <span class="text-sm text-slate-300">Pagina {{ page }} de {{ totalPages }}</span>
        <Button icon="pi pi-angle-right" rounded size="small" :disabled="page>=totalPages" @click="changePage(page+1)" />
      </div>
    </section>

    <Dialog v-model:visible="showAssetModal" modal header="Logo do asset" :style="{width:'520px'}">
      <div v-if="!selected" class="text-slate-400 text-sm">Selecione um asset para editar a logo.</div>
      <div v-else class="space-y-3">
        <p class="text-sm text-slate-300">Symbol: {{ selected.symbol }}</p>
        <div v-if="hasLogo(selected)" class="space-y-2">
          <p class="text-sm">Logo atual:</p>
          <img :src="imageUrl" alt="logo" class="h-20 bg-white p-2 rounded" />
          <Button label="Remover logo" icon="pi pi-trash" severity="danger" size="small" @click="removeLogo" />
        </div>
        <div class="space-y-2">
          <p class="text-sm">Enviar nova logo (svg/png/jpg/webp)</p>
          <input type="file" accept=".svg,.png,.jpg,.jpeg,.webp" @change="uploadLogo" class="text-sm" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import API from '@/utils/api'

const assets = ref([])
const total = ref(0)
const page = ref(1)
const perPage = 10
const filters = reactive({ q: '' })

const selected = ref(null)
const showAssetModal = ref(false)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage)))
const imageUrl = computed(() => {
  const path = selected.value?.logo || selected.value?.image
  if (!path) return ''
  return path.startsWith('http') ? path : `${API.HOST}${path}`
})

const withImageHost = (asset) => {
  if (!asset) return asset
  const logoPath = asset.logo || asset.image
  if (logoPath && !logoPath.startsWith('http')) {
    asset.logo = `${API.HOST}${logoPath}`
    asset.image = asset.logo
  } else if (logoPath) {
    asset.logo = logoPath
    asset.image = logoPath
  }
  return asset
}

const hasLogo = (asset) => {
  if (!asset) return false
  return Boolean(asset.logo || asset.image)
}

const fetchAssets = async () => {
  const query = `?page=${page.value}&perPage=${perPage}&q=${encodeURIComponent(filters.q)}`
  const data = await API.get(`/admin/assets${query}`)
  if (data) {
    assets.value = (data.list || []).map(withImageHost)
    total.value = data.total || 0
  }
}

const selectAsset = async (asset) => {
  showAssetModal.value = true
  const detail = await API.get(`/admin/assets/${asset.id}`)
  selected.value = withImageHost(detail?.asset || asset)
}

const uploadLogo = async (event) => {
  if (!selected.value) return
  const file = event.target.files?.[0]
  if (!file) return
  const formData = new FormData()
  formData.append('logo', file)
  const resp = await API.upload(`/admin/assets/${selected.value.symbol}/logo`, formData)
  if (resp?.image) {
    const path = resp.image.startsWith('http') ? resp.image : `${API.HOST}${resp.image}`
    selected.value.logo = path
    selected.value.image = path
    fetchAssets()
  }
  event.target.value = ''
}

const removeLogo = async () => {
  if (!selected.value) return
  const resp = await API.delete(`/admin/assets/${selected.value.symbol}/logo`)
  if (resp) {
    selected.value.logo = null
    selected.value.image = null
    fetchAssets()
  }
}

const changePage = (p) => {
  page.value = Math.max(1, Math.min(p, totalPages.value))
  fetchAssets()
}

onMounted(() => {
  fetchAssets()
})
</script>

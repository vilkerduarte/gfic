<template>
  <div class="px-8 py-6">
    <div class="flex items-center gap-2 mb-4">
      <i class="pi pi-shield"></i>
      <h2 class="text-2xl font-bold">Admin - Usuarios</h2>
    </div>

    <section class="rounded-md border border-slate-800 bg-black/20 p-4">
      <div class="flex flex-wrap gap-3 items-center mb-3">
        <InputText v-model="filters.q" placeholder="Buscar nome ou email" class="w-64" @keyup.enter="fetchUsers" />
        <select v-model="filters.permission" class="bg-slate-800 text-white px-3 py-2 rounded">
          <option value="">Todas permissoes</option>
          <option value="user">user</option>
          <option value="suporte">suporte</option>
          <option value="master">master</option>
        </select>
        <Button label="Buscar" icon="pi pi-search" size="small" @click="fetchUsers" />
      </div>

      <div class="space-y-2 max-h-[560px] overflow-y-auto">
        <div v-for="u in users" :key="u.id" class="border border-slate-700 rounded p-3 flex items-center justify-between hover:border-primary-500">
          <div>
            <p class="font-semibold">{{ u.name || 'Sem nome' }}</p>
            <p class="text-sm text-slate-300">{{ u.email }}</p>
            <p class="text-xs text-slate-400">Permissoes: {{ (u.permissions||[]).map(p=>p.permission).join(', ') }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-400">Saldo: {{ u.balance }}</span>
            <Button label="Abrir" icon="pi pi-eye" size="small" outlined @click="selectUser(u.id)" />
          </div>
        </div>
      </div>

      <div class="flex justify-between items-center mt-3">
        <Button icon="pi pi-angle-left" rounded size="small" :disabled="page===1" @click="changePage(page-1)" />
        <span class="text-sm text-slate-300">Pagina {{ page }} de {{ totalPages }}</span>
        <Button icon="pi pi-angle-right" rounded size="small" :disabled="page>=totalPages" @click="changePage(page+1)" />
      </div>
    </section>

    <Dialog v-model:visible="showUserModal" modal header="Usuario" :style="{width:'720px'}">
      <div v-if="loadingUser" class="flex items-center gap-2 text-slate-300 mb-2"><i class="pi pi-spinner pi-spin"></i> Carregando...</div>
      <div v-else-if="userDetails">
        <div class="flex gap-2 mb-3">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            :class="['px-3 py-2 rounded text-sm', activeTab === tab.value ? 'bg-primary-500 text-white' : 'bg-slate-800 text-slate-200']"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>

        <div v-if="activeTab === 'info'" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="text-sm text-slate-300">Nome</label>
              <InputText v-model="form.name" class="w-full" />
            </div>
            <div>
              <label class="text-sm text-slate-300">Email</label>
              <InputText v-model="form.email" class="w-full" />
            </div>
            <div>
              <label class="text-sm text-slate-300">Saldo (creditos)</label>
              <InputText v-model.number="form.balance" class="w-full" type="number" />
            </div>
            <div>
              <label class="text-sm text-slate-300">Nova senha (opcional)</label>
              <InputText v-model="form.password" class="w-full" type="password" />
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <Button label="Salvar" icon="pi pi-save" :loading="saving" @click="saveUser" />
          </div>

          <div class="border-t border-slate-700 pt-3 space-y-2">
            <div class="flex items-center gap-2">
              <h4 class="font-semibold">Permissoes</h4>
              <small class="text-slate-400" v-if="!auth.isMaster.value">Apenas master edita</small>
            </div>
            <div class="flex flex-wrap gap-3 items-center">
              <label class="flex items-center gap-2 text-sm">
                <input type="checkbox" value="user" v-model="permSelection" :disabled="!auth.isMaster.value" /> user
              </label>
              <label class="flex items-center gap-2 text-sm">
                <input type="checkbox" value="suporte" v-model="permSelection" :disabled="!auth.isMaster.value" /> suporte
              </label>
              <label class="flex items-center gap-2 text-sm">
                <input type="checkbox" value="master" v-model="permSelection" :disabled="!auth.isMaster.value" /> master
              </label>
              <Button label="Atualizar" size="small" icon="pi pi-check" :disabled="!auth.isMaster.value" @click="updatePermissions" />
            </div>
          </div>

          <div class="border-t border-slate-700 pt-3 space-y-2">
            <h4 class="font-semibold">Magic link</h4>
            <Button label="Gerar" icon="pi pi-link" size="small" @click="generateMagicLink" />
            <div v-if="magicLink" class="text-xs break-all bg-slate-900/50 p-2 rounded border border-slate-700">{{ magicLink }}</div>
          </div>
        </div>

        <div v-else-if="activeTab === 'credits'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-3">
            <h4 class="font-semibold">Adicionar creditos</h4>
            <InputText v-model.number="addValue" type="number" placeholder="Quantidade" />
            <InputText v-model="addDescription" placeholder="Descricao" />
            <Button label="Adicionar" icon="pi pi-plus" @click="submitAdd" />
          </div>
          <div class="space-y-3">
            <h4 class="font-semibold">Remover creditos</h4>
            <InputText v-model.number="removeValue" type="number" placeholder="Quantidade" />
            <InputText v-model="removeDescription" placeholder="Descricao" />
            <Button label="Remover" icon="pi pi-minus" severity="danger" @click="submitRemove" />
          </div>
          <div class="md:col-span-2">
            <h4 class="font-semibold mb-2">Historico de creditos</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              <div v-for="c in userDetails.credits || []" :key="c.id" class="border border-slate-700 rounded p-2 text-sm">
                <p><strong>Valor:</strong> {{ c.value }}</p>
                <p><strong>Status:</strong> {{ c.status }}</p>
                <p><strong>Descricao:</strong> {{ c.description }}</p>
                <p class="text-xs text-slate-400">Expira: {{ c.expires_at }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'assets'" class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto">
          <div v-for="asset in userDetails.my_assets || []" :key="asset.id" class="border border-slate-700 rounded p-3">
            <p class="font-semibold">{{ asset.symbol }}</p>
            <p class="text-sm text-slate-300">{{ asset.name }}</p>
          </div>
        </div>

        <div v-else-if="activeTab === 'payments'" class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto">
          <div v-for="inv in userDetails.invoices || []" :key="inv.id" class="border border-slate-700 rounded p-3 text-sm">
            <p><strong>TXID:</strong> {{ inv.txid }}</p>
            <p><strong>Status:</strong> {{ inv.status }}</p>
            <p><strong>Creditos:</strong> {{ inv.credits }}</p>
            <p><strong>Valor:</strong> {{ inv.value }}</p>
          </div>
        </div>

        <div v-else-if="activeTab === 'reports'" class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto">
          <div v-for="rep in userDetails.reports || []" :key="rep.id" class="border border-slate-700 rounded p-3 text-sm">
            <p><strong>Symbol:</strong> {{ rep.symbol }}</p>
            <p><strong>Status:</strong> {{ rep.status }}</p>
            <p class="text-xs text-slate-400">Criado: {{ rep.created_at }}</p>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import API from '@/utils/api'
import { useAuth } from '@/composables/useAuth'

const toast = useToast()
const auth = useAuth()

const users = ref([])
const total = ref(0)
const page = ref(1)
const perPage = 10
const filters = reactive({ q: '', permission: '' })

const userDetails = ref(null)
const loadingUser = ref(false)
const saving = ref(false)
const showUserModal = ref(false)
const form = reactive({ name: '', email: '', balance: 0, password: '' })
const permSelection = ref([])
const magicLink = ref('')
const activeTab = ref('info')
const tabs = [
  { value: 'info', label: 'Dados' },
  { value: 'credits', label: 'Creditos' },
  { value: 'assets', label: 'Assets' },
  { value: 'payments', label: 'Pagamentos' },
  { value: 'reports', label: 'Relatorios' }
]
const addValue = ref(0)
const addDescription = ref('Ajuste de creditos (admin)')
const removeValue = ref(0)
const removeDescription = ref('Remocao de creditos (admin)')

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage)))

const fetchUsers = async () => {
  const query = `?page=${page.value}&perPage=${perPage}&q=${encodeURIComponent(filters.q)}&permission=${filters.permission}`
  const data = await API.get(`/admin/users${query}`)
  if (data) {
    users.value = data.list || []
    total.value = data.total || 0
  }
}

const selectUser = async (id) => {
  loadingUser.value = true
  userDetails.value = null
  magicLink.value = ''
  showUserModal.value = true
  activeTab.value = 'info'
  const data = await API.get(`/admin/users/${id}`)
  if (data?.user) {
    userDetails.value = data.user
    fillForm()
  }
  loadingUser.value = false
}

const fillForm = () => {
  if (!userDetails.value) return
  form.name = userDetails.value.name || ''
  form.email = userDetails.value.email || ''
  form.balance = userDetails.value.balance || 0
  form.password = ''
  permSelection.value = (userDetails.value.permissions || []).map(p => p.permission)
}

const saveUser = async () => {
  if (!userDetails.value) return
  saving.value = true
  const payload = {
    name: form.name,
    email: form.email,
    balance: Number(form.balance)
  }
  if (form.password) payload.password = form.password
  const resp = await API.put(`/admin/users/${userDetails.value.id}`, payload)
  if (resp?.user) {
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Dados atualizados', life: 3000 })
    userDetails.value = resp.user
    fillForm()
    fetchUsers()
  }
  saving.value = false
}

const updatePermissions = async () => {
  if (!userDetails.value || !auth.isMaster.value) return
  const resp = await API.put(`/admin/users/${userDetails.value.id}/permissions`, { permissions: permSelection.value })
  if (resp) {
    toast.add({ severity: 'success', summary: 'Permissoes', detail: 'Permissoes atualizadas', life: 3000 })
    selectUser(userDetails.value.id)
  }
}

const generateMagicLink = async () => {
  if (!userDetails.value) return
  const resp = await API.post(`/admin/users/${userDetails.value.id}/magic-link`, {})
  if (resp?.link) {
    magicLink.value = resp.link
    toast.add({ severity: 'info', summary: 'Magic link criado', detail: 'Copie o link gerado', life: 5000 })
  }
}

const submitAdd = async () => {
  if (!userDetails.value) return
  const resp = await API.post(`/admin/credits/${userDetails.value.id}/add`, { value: Number(addValue.value), description: addDescription.value })
  if (resp) {
    toast.add({ severity: 'success', summary: 'Creditos', detail: 'Creditos adicionados', life: 3000 })
    selectUser(userDetails.value.id)
  }
}

const submitRemove = async () => {
  if (!userDetails.value) return
  const resp = await API.post(`/admin/credits/${userDetails.value.id}/remove`, { value: Number(removeValue.value), description: removeDescription.value })
  if (resp) {
    toast.add({ severity: 'warn', summary: 'Creditos', detail: 'Creditos removidos', life: 3000 })
    selectUser(userDetails.value.id)
  }
}

const changePage = (p) => {
  page.value = Math.max(1, Math.min(p, totalPages.value))
  fetchUsers()
}

watch(userDetails, fillForm)
onMounted(() => {
  fetchUsers()
})
</script>

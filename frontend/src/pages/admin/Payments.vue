<template>
  <div class="px-8 py-6">
    <div class="flex items-center gap-2 mb-4">
      <i class="pi pi-credit-card"></i>
      <h2 class="text-2xl font-bold">Admin - Pagamentos</h2>
    </div>

    <section class="rounded-md border border-slate-800 bg-black/20 p-4">
      <div class="flex flex-wrap gap-3 items-center mb-3">
        <InputText v-model="filters.q" placeholder="Buscar por txid, email, nome" class="w-72" @keyup.enter="fetchPayments" />
        <select v-model="filters.status" class="bg-slate-800 text-white px-3 py-2 rounded">
          <option value="">Todos status</option>
          <option value="pending">pending</option>
          <option value="paid">paid</option>
          <option value="expired">expired</option>
        </select>
        <Button label="Buscar" icon="pi pi-search" size="small" @click="fetchPayments" />
      </div>

      <div class="space-y-2 max-h-[560px] overflow-y-auto">
        <div v-for="inv in payments" :key="inv.id" class="border border-slate-700 rounded p-3 flex items-center justify-between hover:border-primary-500">
          <div>
            <p class="font-semibold">TXID: {{ inv.txid }}</p>
            <p class="text-sm text-slate-300">Status: {{ inv.status }} | Creditos: {{ inv.credits }}</p>
            <p class="text-xs text-slate-400">Usuario: {{ inv.users?.email }}</p>
          </div>
          <Button label="Abrir" size="small" icon="pi pi-eye" outlined @click="selectPayment(inv.id)" />
        </div>
      </div>

      <div class="flex justify-between items-center mt-3">
        <Button icon="pi pi-angle-left" rounded size="small" :disabled="page===1" @click="changePage(page-1)" />
        <span class="text-sm text-slate-300">Pagina {{ page }} de {{ totalPages }}</span>
        <Button icon="pi pi-angle-right" rounded size="small" :disabled="page>=totalPages" @click="changePage(page+1)" />
      </div>
    </section>

    <Dialog v-model:visible="showPaymentModal" modal header="Pagamento" :style="{width:'520px'}">
      <div v-if="loadingPayment" class="flex items-center gap-2 text-slate-300 mb-2"><i class="pi pi-spinner pi-spin"></i> Carregando...</div>
      <div v-else-if="selected" class="space-y-3 text-sm">
        <p><strong>TXID:</strong> {{ selected.txid }}</p>
        <p><strong>Email:</strong> {{ selected.users?.email }}</p>
        <p><strong>Nome:</strong> {{ selected.users?.name }}</p>
        <div>
          <label class="text-slate-300 text-sm">Status</label>
          <InputText v-model="editForm.status" class="w-full" :disabled="!auth.isMaster.value" />
        </div>
        <div>
          <label class="text-slate-300 text-sm">Creditos</label>
          <InputText v-model.number="editForm.credits" type="number" class="w-full" :disabled="!auth.isMaster.value" />
        </div>
        <div>
          <label class="text-slate-300 text-sm">Valor (centavos)</label>
          <InputText v-model.number="editForm.value" type="number" class="w-full" :disabled="!auth.isMaster.value" />
        </div>

        <div class="flex justify-end">
          <Button label="Salvar" icon="pi pi-save" :disabled="!auth.isMaster.value" @click="savePayment" />
        </div>
      </div>
      <div v-else class="text-slate-400 text-sm">Selecione um pagamento.</div>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import API from '@/utils/api'
import { useAuth } from '@/composables/useAuth'

const auth = useAuth()

const payments = ref([])
const total = ref(0)
const page = ref(1)
const perPage = 10
const filters = reactive({ q: '', status: '' })

const selected = ref(null)
const loadingPayment = ref(false)
const editForm = reactive({ status: '', credits: 0, value: 0 })
const showPaymentModal = ref(false)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage)))

const fetchPayments = async () => {
  const query = `?page=${page.value}&perPage=${perPage}&q=${encodeURIComponent(filters.q)}&status=${filters.status}`
  const data = await API.get(`/admin/payments${query}`)
  if (data) {
    payments.value = data.list || []
    total.value = data.total || 0
  }
}

const selectPayment = async (id) => {
  loadingPayment.value = true
  showPaymentModal.value = true
  const data = await API.get(`/admin/payments/${id}`)
  if (data?.invoice) {
    selected.value = data.invoice
    editForm.status = data.invoice.status || ''
    editForm.credits = data.invoice.credits || 0
    editForm.value = data.invoice.value || 0
  }
  loadingPayment.value = false
}

const savePayment = async () => {
  if (!selected.value || !auth.isMaster.value) return
  const payload = {
    status: editForm.status,
    credits: Number(editForm.credits),
    value: Number(editForm.value)
  }
  const resp = await API.put(`/admin/payments/${selected.value.id}`, payload)
  if (resp?.invoice) {
    selected.value = resp.invoice
    fetchPayments()
  }
}

const changePage = (p) => {
  page.value = Math.max(1, Math.min(p, totalPages.value))
  fetchPayments()
}

onMounted(() => {
  fetchPayments()
})
</script>

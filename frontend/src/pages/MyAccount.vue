<template>
    <div class="px-12 py-8 max-w-5xl mx-auto">
        <ClassicToolbar />

        <div class="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-6">
            <section class="rounded-md p-6 bg-black/10 border border-gray-800">
                <div class="flex items-center gap-3 mb-4">
                    <i class="pi pi-user-edit text-2xl"></i>
                    <div>
                        <h2 class="text-[23pt]">Meus Dados</h2>
                        <p class="text-sm text-slate-300">Atualize seu nome e email associados a conta.</p>
                    </div>
                </div>

                <form @submit.prevent="handleSave" class="space-y-4">
                    <div>
                        <InputGroup>
                            <InputGroupAddon>
                                <i class="pi pi-user" />
                            </InputGroupAddon>
                            <FloatLabel variant="in">
                                <InputText class="w-full" id="name" size="small" v-model="form.name" autocomplete="off" variant="filled" />
                                <label for="name">Nome</label>
                            </FloatLabel>
                        </InputGroup>
                        <small v-if="errors.name" class="text-red-400 text-xs">{{ errors.name }}</small>
                    </div>

                    <div>
                        <InputGroup>
                            <InputGroupAddon>
                                <i class="pi pi-envelope" />
                            </InputGroupAddon>
                            <FloatLabel variant="in">
                                <InputText class="w-full" id="email" size="small" v-model="form.email" type="email" autocomplete="off" variant="filled" />
                                <label for="email">Email</label>
                            </FloatLabel>
                        </InputGroup>
                        <small v-if="errors.email" class="text-red-400 text-xs">{{ errors.email }}</small>
                    </div>

                    <div class="flex items-center justify-end gap-3">
                        <Button type="button" label="Voltar" icon="pi pi-arrow-left" severity="secondary" @click="router.push('/')"/>
                        <Button type="submit" label="Salvar" icon="pi pi-save" :loading="saving" />
                    </div>
                </form>
            </section>

            <section class="rounded-md p-6 bg-black/10 border border-gray-800 space-y-4">
                <div class="flex items-center gap-2">
                    <i class="pi pi-id-card text-xl"></i>
                    <h3 class="text-xl font-semibold">Resumo</h3>
                </div>

                <div v-if="loadingUser" class="flex items-center gap-2 text-slate-300">
                    <i class="pi pi-spinner pi-spin"></i>
                    <span>Carregando suas informacoes...</span>
                </div>

                <div v-else class="space-y-3 text-sm text-slate-200">
                    <div class="flex items-center justify-between">
                        <span>Email</span>
                        <span class="font-semibold">{{ user?.email }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span>Nome</span>
                        <span class="font-semibold">{{ user?.name }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span>Creditos</span>
                        <span class="font-semibold">{{ user?.balance ?? 0 }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span>Ativos monitorados</span>
                        <span class="font-semibold">{{ assetsCount }}</span>
                    </div>
                    <div>
                        <span class="block mb-1">Ativos</span>
                        <div v-if="assetList.length" class="flex flex-wrap gap-2">
                            <span v-for="asset in assetList" :key="asset" class="px-2 py-1 rounded bg-slate-800 text-xs border border-slate-700">{{ asset }}</span>
                        </div>
                        <span v-else class="text-slate-400 text-xs">Nenhum ativo monitorado.</span>
                    </div>
                    <div v-if="user?.permissions?.length">
                        <span class="block mb-1">Permissoes</span>
                        <div class="flex flex-wrap gap-2">
                            <span v-for="perm in user.permissions" :key="perm.permission" class="px-2 py-1 rounded bg-indigo-800/40 text-xs border border-indigo-600">{{ perm.permission }}</span>
                        </div>
                    </div>
                    <div class="pt-2">
                        <Button label="Ir para meus ativos" icon="pi pi-th-large" text size="small" @click="router.push('/my-assets')" />
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import ClassicToolbar from '@/components/ClassicToolbar.vue';
import API from '@/utils/api';
import { useAuth } from '@/composables/useAuth';
import { profileSchema } from '@/schemas/auth';

const auth = useAuth();
const toast = useToast();
const router = useRouter();

const saving = ref(false);
const loadingUser = ref(true);
const errors = reactive({ name: '', email: '' });
const form = reactive({ name: '', email: '' });

const user = computed(() => auth.user.value);
const assetList = computed(() => user.value?.assets || []);
const assetsCount = computed(() => assetList.value.length);

const syncForm = (currentUser) => {
    if (currentUser) {
        form.name = currentUser.name || '';
        form.email = currentUser.email || '';
    }
};

onMounted(async () => {
    const current = user.value || await auth.fetchUser();
    loadingUser.value = false;

    if (!current) {
        router.push('/login');
        return;
    }

    syncForm(user.value);
});

watch(user, (value) => {
    syncForm(value);
});

const handleSave = async () => {
    try {
        errors.name = '';
        errors.email = '';

        const payload = profileSchema.parse(form);
        saving.value = true;

        const response = await API.put('/auth/account', payload, (resp) => {
            throw new Error(resp.error || 'Nao foi possivel atualizar os dados.');
        });

        await auth.fetchUser();

        toast.add({
            severity: 'success',
            summary: 'Dados atualizados',
            detail: response?.message || 'Dados salvos com sucesso.',
            life: 4000
        });
    } catch (error) {
        if (error.errors) {
            error.errors.forEach(err => {
                errors[err.path[0]] = err.message;
            });
        } else if (error.message) {
            toast.add({
                severity: 'error',
                summary: 'Erro',
                detail: error.message,
                life: 5000
            });
        } else {
            toast.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao salvar dados. Tente novamente.',
                life: 5000
            });
        }
    } finally {
        saving.value = false;
    }
};
</script>

<style scoped>
</style>

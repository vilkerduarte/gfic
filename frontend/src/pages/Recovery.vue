<template>
    <div class="flex-auto flex flex-col md:flex-row items-center justify-center gap-12">
        <div class="px-4 md:px-8 lg:px-12 hidden md:flex flex-col pb-12">
            <div class="flex gap-1">
                <div class="flex items-center">
                    <img src="/logo_white.svg" alt="GFIC" class="w-[95px]">
                </div>
                <h1 class="text-[48pt] font-bold">GFIC</h1>
            </div>
            <div class="w-full px-3">
                <span class="block text-[14px] text-center border-t border-slate-700 text-slate-300">Global Financial
                    Information Center</span>
            </div>
        </div>
        <div class="w-96">
            <h2 class="text-[23pt]">Recuperacao de conta</h2>
            <p class="text-neutral-300 mb-10">Enviaremos um email com um magic link para voce acessar a sua conta. Ao
                acessar, altere sua senha.</p>
            <form @submit.prevent="handleSubmit">
                <div class="flex flex-col gap-3">
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-envelope" />
                        </InputGroupAddon>
                        <FloatLabel variant="in">
                            <InputText class="w-full" id="email" size="small" v-model="form.email" type="email"
                                autocomplete="off" variant="filled" />
                            <label for="email">Email</label>
                        </FloatLabel>
                    </InputGroup>
                    <small v-if="errors.email" class="text-red-400 text-xs mt-1">{{ errors.email }}</small>
                </div>
                <div>
                    <RouterLink to="/login">
                        <button
                            class="cursor-pointer text-purple-400 text-[9pt] hover:text-indigo-600 font-bold">Retornar
                            para Login</button>
                    </RouterLink>
                </div>
                <div class="mt-2">
                    <Button type="submit" label="Recuperar" icon="pi pi-link" :loading="loading" />
                </div>
                <p v-if="successMessage" class="text-green-400 text-sm mt-3">{{ successMessage }}</p>
            </form>
        </div>
        <div class="absolute inset-0 overflow-hidden border z-[-10]">
            <div class="relative w-full h-full overflow-hidden">
                <div class="absolute w-[200vw] left-[-50vw] top-10 opacity-10 aspect-square md:hidden">
                    <img src="/logo_white.svg" alt="GFIC" class="w-full"></img>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import { recoverySchema } from '@/schemas/auth';
import API from '@/utils/api';
import { useAuth } from '@/composables/useAuth';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();
const auth = useAuth();

const loading = ref(false);
const errors = ref({});
const successMessage = ref('');

const form = reactive({
    email: ''
});

onMounted(async () => {
    if (auth.user.value?.hash) {
        router.push('/');
    }
});

const handleSubmit = async () => {
    try {
        errors.value = {};
        successMessage.value = '';

        const validatedData = recoverySchema.parse(form);

        loading.value = true;

        await API.post('/auth/recovery/request', validatedData, (resp) => {
            throw new Error(resp.error || 'Nao foi possivel enviar o email de recuperacao.');
        });

        successMessage.value = 'Se o email existir, um link de acesso foi enviado.';
        toast.add({
            severity: 'success',
            summary: 'Solicitacao enviada',
            detail: successMessage.value,
            life: 4000
        });
        form.email = '';
    } catch (error) {
        if (error.errors) {
            error.errors.forEach(err => {
                errors.value[err.path[0]] = err.message;
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
                detail: 'Erro ao enviar solicitacao. Tente novamente.',
                life: 5000
            });
        }
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped></style>

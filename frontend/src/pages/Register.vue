<template>
    <div class="flex-auto flex flex-col md:flex-row items-center justify-center gap-12">
        
        <div class="w-96">
            <h2 class="mb-2 text-[23pt] text-right">Crie uma conta</h2>
            <form @submit.prevent="handleSubmit">
                <div class="flex flex-col gap-3">
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-user" />
                        </InputGroupAddon>
                        <FloatLabel variant="in">
                            <InputText class="w-full" id="name" size="small" v-model="form.name"
                                autocomplete="off" variant="filled" />

                            <label for="name">Nome Completo</label>
                        </FloatLabel>
                    </InputGroup>
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
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-lock" />
                        </InputGroupAddon>
                        <FloatLabel variant="in">
                            <Password class="w-full" id="password" size="small" v-model="form.password" :feedback="false"
                                toggleMask autocomplete="off" variant="filled" />
                            <label for="password">Senha</label>
                        </FloatLabel>
                    </InputGroup>
                </div>
                <div class="mt-4 text-right">
                    <Button type="submit" label="Cadastrar" icon="pi pi-user-plus" :loading="loading"/>
                </div>

            </form>
        </div>
        <div class="px-4 md:px-8 lg:px-12 hidden md:flex flex-col pb-12">
            <div class="flex gap-1">
                <div class="flex items-center">
                    <img src="/logo_white.svg" alt="GFIC" class="w-[95px]">
                </div>
                <h1 class="text-[48pt] font-bold">GFIC</h1>
            </div>
            <div class="w-full px-3">
                <span class="block text-[14px] text-center border-t border-slate-700 text-slate-300">Global Financial Information Center</span>
            </div>
        </div>
        <div class="absolute inset-0 overflow-hidden border z-[-10]">
            <div class="relative w-full h-full overflow-hidden">
                <div class="absolute w-[200vw] left-[-100vw] top-10 opacity-10 aspect-square md:hidden">
                    <img src="/logo_white.svg" alt="GFIC" class="w-full"></img>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import { registerSchema } from '@/schemas/auth';
import API from '@/utils/api';
import { useRouter } from 'vue-router'

const router = useRouter()


const toast = useToast();

const loading = ref(false);
const errors = ref({});

const form = reactive({
    email: '',
    password: '',
    name:''
});

const handleSubmit = async (e) => {
    try {
        errors.value = {};

        // Validação com Zod
        const validatedData = registerSchema.parse(form);

        loading.value = true;

        // Chamada à API
        const response = await API.post('/auth/register', validatedData);

        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Cadastro realizado com sucesso!',
            life: 3000
        });
        router.push('/login');
    } catch (error) {
        if (error.errors) {
            // Erros de validação do Zod
            error.errors.forEach(err => {
                errors.value[err.path[0]] = err.message;
            });
        } else if (error.response?.data?.message) {
            // Erro da API
            toast.add({
                severity: 'error',
                summary: 'Erro',
                detail: error.response.data.message,
                life: 5000
            });
        } else {
            // Erro genérico
            toast.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao cadastrar. Tente novamente.',
                life: 5000
            });
        }
    } finally {
        loading.value = false;
    }
};

</script>

<style scoped>

</style>
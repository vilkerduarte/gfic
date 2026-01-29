<template>
    <div class="flex justify-center overflow-auto md:justify-start md:flex-row flex-col gap-4 items-center px-6 w-screen transition-all duration-[800ms] md:w-full fixed md:relative top-0 bottom-0 z-[300] bg-slate-800/80 backdrop-blur-sm md:bg-transparent"
        :class="{
            'left-[-100vw] md:left-0': !menu,
            'left-0': menu,
        }">
        <div class="flex md:hidden gap-1 pb-8 md:w-fit w-full justify-center md:justify-start">
            <div class="flex md:items-center">
                <img src="/logo_white.svg" alt="GFIC" class="w-[80px]">
            </div>
            <h1 class="text-[48pt] font-bold">GFIC</h1>
        </div>
        <div class="h-[89px] mx-8 border-r hidden md:inline-flex border-slate-800"></div>
        <RouterLink v-for="item in (auth.user.value ? itemsUser : items)" :key="item.path" :to="item.path">
            <button :title="item.title"  @click="emit('close')"
                class="rounded-lg min-w-[70vw] md:min-w-[10px] bg-slate-700 md:bg-transparent active:bg-slate-900 text-white border-none px-4 py-3 md:py-1 font-bold hover:ring-2 cursor-pointer ring-offset-2 ring-offset-surface-0 ring-primary transition-all flex items-center gap-2">
                <i v-if="$route.fullPath.split('?')[0] !== item.path" :class="`pi ${item.icon}`"></i>
                <span v-else class="text-indigo-500 flex items-center justify-center">
                    <i :class="`pi ${item.icon}`"></i>
                </span>
                {{ item.label }}
            </button>
        </RouterLink>
        <div v-if="auth.user.value" class="md:flex-auto flex flex-col md:flex-row items-center justify-end relative">
            <div class="relative group">
                <div
                    class="rounded-full py-2 bg-slate-800 px-4 text-white relative z-1 gap-2 flex justify-center items-end">
                    <div class="flex flex-col items-end justify-center gap-1 h-full">
                        <span>{{ auth.user.value?.name }}</span>
                        <span class="italic text-[8pt] mb-1">{{ auth.user.value?.email }}</span>
                    </div>
                    <div class="h-full">
                        <div
                            class="bg-white/10 rounded-xl w-12 h-12 flex flex-col items-center justify-center text-[8pt]">
                            <span>Creditos</span>
                            <strong class="w-full text-center">{{ auth.user.value?.balance }}</strong>
                        </div>
                    </div>
                </div>
                <div
                    class="absolute w-full text-white transition-all duration-600 font-bold hidden md:flex items-center justify-center rounded-full w-32 left-0 group-hover:left-[-70px] inset-y-0 p-2">
                    <button @click="()=>{auth.logout().then(function(){ $route.path !== '/' && $router.push('/'); } )}" class="bg-red-500 cursor-pointer hover:bg-red-400 rounded-full flex items-center justify-start px-4 w-full h-full">
                        Sair
                    </button>
                </div>
            </div>
            <button @click="()=>{emit('close'); auth.logout().then(() => { $route.path !== '/' && $router.push('/'); })}"
                class="bg-red-500 cursor-pointer hover:bg-red-400 md:hidden rounded-lg flex items-center justify-start px-6 mt-4 py-2">
                Sair
            </button>
        </div>


    </div>
</template>
<script setup>
import { inject, computed } from 'vue';
import { RouterLink } from 'vue-router';

const auth = inject('auth');

const items = [
    { path: '/', title: 'Inicio', label: 'Inicio', icon: 'pi-home' },
    { path: '/login', title: 'Entre com sua conta', label: 'Entrar', icon: 'pi-sign-in' },
    { path: '/register', title: 'Crie sua conta', label: 'Cadastrar', icon: 'pi-user-plus' }
]

const baseUserItems = [
    { path: '/', title: 'Inicio', label: 'Inicio', icon: 'pi-home' },
    { path: '/my-assets', title: 'Ver Meus Ativos', label: 'Meus Ativos', icon: 'pi-th-large' },
    { path: '/my-account', title: 'Atualizar meus dados', label: 'Meus Dados', icon: 'pi-user-edit' },
    { path: '/learn', title: 'Aprenda a Investir', label: 'Aprenda a Investir', icon: 'pi-book' }
]

const adminItems = [
    { path: '/admin/users', title: 'Admin Usuarios', label: 'Adm Usuarios', icon: 'pi-users' },
    { path: '/admin/payments', title: 'Pagamentos', label: 'Pagamentos', icon: 'pi-credit-card' },
    { path: '/admin/assets', title: 'Logos/Assets', label: 'Assets', icon: 'pi-image' }
]

const isAdmin = computed(() => auth.user.value?.permissions?.some(p => ['master', 'suporte'].includes(p.permission)))
const itemsUser = computed(() => {
    const list = [...baseUserItems]
    if (isAdmin.value) {
        list.push(...adminItems)
    }
    return list
})

const rolesLabel = computed(() => {
    const perms = auth.user.value?.permissions?.map(p => p.permission).join(', ')
    return perms || ''
})
const props = defineProps({
    menu: {
        default: false
    }
})
const emit = defineEmits(['close'])
</script>

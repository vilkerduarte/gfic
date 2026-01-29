<template>
    <div class="w-screen min-h-screen overflow-x-hidden flex flex-col justify-start">
        <div class="fixed top-2 right-2 z-[301] text-slate-900 bg-white w-12 h-12 flex md:hidden items-center justify-center rounded-full shadow-xl">
            <button @click="menu = !menu"><Menu/></button>
        </div>
        <div class="flex flex-col md:flex-row gap-1 shadow-2xl md:px-8 lg:px-12">
            <div class="flex gap-1 md:w-fit w-full justify-center md:justify-start">
                <div class="flex md:items-center">
                    <img src="/logo_white.svg" alt="GFIC" class="w-[80px]">
                </div>
                <h1 class="text-[48pt] font-bold">GFIC</h1>
            </div>
            <NavBar :menu="menu" @close="menu = false;"/>
        </div>
        <div class="flex-auto w-full flex flex-col">
            <slot />
        </div>
    </div>
</template>
<script setup>
import { Menu } from 'lucide-vue-next';
import NavBar from '@/components/NavBar.vue'
import { ref } from 'vue';

const menu = ref(false);
</script>
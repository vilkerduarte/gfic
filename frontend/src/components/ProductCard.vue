<template>
    <div class="bg-slate-800 flex flex-col md:flex-row rounded-xl w-full shadow-lg overflow-hidden border border-slate-700 hover:border-indigo-500 transition-all duration-300">
        <!-- Thumbnail -->
        <div class="aspect-square bg-slate-700 flex items-center justify-center aspect-square md:h-[150px] md:w-[150px]">
            <img v-if="product.thumbnail" :src="product.thumbnail" :alt="product.title"
                class="object-cover" />
            <div v-else class="text-slate-400">
                <i class="pi pi-book text-6xl"></i>
            </div>
        </div>

        <!-- Content -->
        <div class="pl-4 pt-4 pb-2 pr-2 flex flex-col">
            <div class="flex justify-between items-start">
                <h3 class="text-xl font-semibold text-white">{{ product.title }}</h3>
            </div>

            <p class="text-slate-300 line-clamp-3 text-justify flex-auto">
                {{ product.description }}
            </p>

            <div class="flex justify-between items-center">
                <span class="text-slate-400 text-sm capitalize">
                    {{ product.type }}
                </span>

                <Button v-if="product.hasItem" :loading="loading2" label="Download" icon="pi pi-download"
                    class="p-button-success" @click="baixar(product)" />
                <Button v-else :label="`${product.price} Créditos`" :loading="loading1" raised icon="pi pi-sparkles" severity="secondary"
                    @click="buy(product)" />
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';

const loading1 = ref(false);
const loading2 = ref(false);
const props = defineProps({
    product: {
        required: true
    }
})

async function buy(product){
    loading1.value = true;
    emit('purchase',product);
    await new Promise((resolve)=>{
        setTimeout(()=>{
            resolve()
        },800);
    })
    loading1.value = false;
}
async function baixar(product){
    loading2.value = true;
    emit('download',product);
    await new Promise((resolve)=>{
        setTimeout(()=>{
            resolve()
        },1800);
    })
    loading2.value = false;
}

const emit = defineEmits(['purchase','download'])
</script>
<style scoped>
.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Estilos para os botões do PrimeVue customizados */
:deep(.p-button) {
    padding: 0.5rem 1rem;
    font-weight: 500;
}

:deep(.p-button.p-button-success) {
    background: #10b981;
    border: 1px solid #10b981;
}

:deep(.p-button.p-button-success:hover) {
    background: #059669;
    border-color: #059669;
}
</style>
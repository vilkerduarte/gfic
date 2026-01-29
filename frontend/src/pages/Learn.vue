<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 py-8 px-4">
    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-indigo-400 mb-4">
        Aprenda sobre o mercado financeiro
      </h1>
      <p class="text-xl text-slate-300 max-w-2xl mx-auto">
        Domine o mercado financeiro com nossos materiais exclusivos.
        Invista com confiança e transforme seu conhecimento em resultados.
      </p>
    </div>

    <!-- Products Grid -->
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-wrap gap-6 justify-center items-center">
        <ProductCard v-for="product in products" :product="product" @purchase="handlePurchase" @download="handleDownload"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'
import Button from 'primevue/button'
import API from '@/utils/api'
import { useRouter } from 'vue-router';
import ProductCard from '@/components/ProductCard.vue';

// Dados de exemplo dos produtos
const products = ref([])
const myproducts = ref([])
const auth = inject('auth');
const creditModalManager = inject('creditModalManager')
const fetchMyProducts = async () => {
  let data = await API.get('/products/my');
  if (data) {
    myproducts.value = data.map(a => a.product_id);
  }
}
async function fetchProducts(){
  await fetchMyProducts()
  let data = await API.get('/products');
  products.value = data.map(a => ({...a,hasItem:myproducts.value.includes(a.id)}));
}
onMounted(async () => {
  await fetchProducts()
})
const router = useRouter();
// Funções de exemplo
const handlePurchase = async (product) => {
  console.log('Comprando produto:', product)
  await auth.fetchUser();
  if (auth.user.value) {
    if (auth.user.value.balance >= product.price) {
      try {
        let data = await API.post('/products/buy', { hash: product.hash });
        if (data) {
          fetchProducts();
          auth.fetchUser();
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      creditModalManager.open()
    }
  } else {
    router.push('/login');
  }
}

const handleDownload = async (product) => {
  console.log('Baixando produto:', product)
  
  try {
    const response = await API.get(`/products/download/${product.hash}.pdf`);
    
    // Criar Blob a partir do ArrayBuffer
    const blob = new Blob([response], { type: 'application/pdf' });
    
    // Criar URL temporária
    const url = window.URL.createObjectURL(blob);
    
    // Criar elemento link temporário
    const link = document.createElement('a');
    link.href = url;
    link.download = `${product.title}.pdf`;
    
    // Simular clique e limpar
    link.click();
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Erro ao baixar o arquivo:', error);
  }
}
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
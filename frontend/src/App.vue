<template>
  <PublicLayout>
    <RouterView />
  </PublicLayout>
  <Toast />
  <CreditModal 
      v-model="creditModalVisible"
      @success="handleCreditSuccess"
  />
</template>

<script setup>
import { onMounted, provide,ref  } from 'vue';
import PublicLayout from './layouts/PublicLayout.vue';
import { useAuth } from '@/composables/useAuth.js';
import CreditModalManager from '@/utils/CreditModalManager.js';
import CreditModal from '@/components/CreditModal.vue';
import API from './utils/api';
const auth = useAuth();
provide('auth',auth);

const creditModalVisible = ref(false)
const creditModalManager = CreditModalManager.getInstance()
provide('creditModalManager', creditModalManager)
const config = ref({});
provide('config',config);
onMounted(async()=>{
  const conf = await API.getConfigs();
  config.value = conf;

  await auth.fetchUser()
  creditModalManager.addListener((isOpen) => {
    creditModalVisible.value = isOpen
  })
})
const handleCreditSuccess = (data) => {
  console.log('Compra realizada com sucesso:', data)
  auth.refreshUser()
}
</script>

<style scoped></style>

<!-- src/components/CreditModal.vue -->
<template>
    <Dialog 
        :visible="modelValue" 
        modal 
        :header="getHeaderTitle()" 
        :style="{ width: '600px' }"
        :draggable="false"
        @update:visible="onVisibleChange"
        class="credit-modal"
        :closable="currentStep !== 3"
    >
        <!-- Progress Steps -->
        <div class="flex justify-center mb-6">
            <div class="flex items-center">
                <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300', 
                    currentStep >= 1 ? 'bg-primary-500 text-white' : 'bg-slate-600 text-gray-300']">
                    1
                </div>
                <div :class="['w-16 h-1 mx-2 transition-all duration-300', currentStep >= 2 ? 'bg-primary-500' : 'bg-slate-600']"></div>
                <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300', 
                    currentStep >= 2 ? 'bg-primary-500 text-white' : 'bg-slate-600 text-gray-300']">
                    2
                </div>
                <div :class="['w-16 h-1 mx-2 transition-all duration-300', currentStep >= 3 ? 'bg-primary-500' : 'bg-slate-600']"></div>
                <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300', 
                    currentStep >= 3 ? 'bg-primary-500 text-white' : 'bg-slate-600 text-gray-300']">
                    3
                </div>
            </div>
        </div>

        <!-- Step 1: CPF -->
        <div v-if="currentStep === 1" class="space-y-6">
            <div class="text-center mb-4">
                <i class="pi pi-id-card text-6xl text-primary-500 mb-4" style="font-size: 4rem"></i>
                <h3 class="text-xl font-bold text-white mb-2">CPF para Nota Fiscal</h3>
                <p class="text-gray-300">Informe seu CPF para emissão da nota fiscal</p>
            </div>

            <div class="bg-gradient-to-r from-blue-600/30 to-purple-500/30 rounded-4xl p-6 border-primary-500/30">
                <label class="block text-xl font-medium mb-4 text-center text-white">Digite seu CPF</label>
                <InputMask
                    v-model="cpf"
                    mask="999.999.999-99"
                    placeholder="000.000.000-00"
                    class="w-full p-3 text-center text-lg font-semibold bg-slate-700 border border-slate-600 rounded-lg focus:border-primary-500 transition-colors"
                    :class="{ 'border-red-500': cpfError }"
                    @keyup.enter="nextStep"
                />
                <small v-if="cpfError" class="text-red-400 block text-center mt-2">{{ cpfError }}</small>
            </div>

            <div class="flex justify-center">
                <Button 
                    label="Continuar" 
                    icon="pi pi-arrow-right"
                    @click="nextStep"
                    :disabled="!isStep1Valid"
                    class="px-8 py-3"
                />
            </div>
        </div>

        <!-- Step 2: Seleção de Créditos -->
        <div v-else-if="currentStep === 2" class="space-y-6">
            <div class="text-center mb-4 mt-2">
                <i class="pi pi-star text-yellow-500 mb-4" style="font-size: 4rem; text-shadow:0px 0px 15px yellow"></i>
                <h3 class="text-xl font-bold text-white mb-2">Escolha seus Créditos</h3>
                <p class="text-gray-300">Quanto mais créditos, mais análises você pode fazer!</p>
            </div>

            <!-- Valor em Destaque -->
            <div class="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-xl p-6 border border-yellow-500/30 text-center">
                <div class="text-4xl font-bold text-yellow-400 mb-2 relative">{{ credits }} créditos <i class="pi pi-sparkles text-amber-600 absolute right-[-15px] -top-2" style="font-size: 1em;"></i></div>
                <div class="text-2xl font-semibold text-white">R$ {{ totalValue }}</div>
                <div class="text-sm text-gray-300 mt-2">Apenas R$ 2,50 cada</div>
            </div>

            <!-- Slider -->
            <div class="space-y-4">
                <label class="block text-sm font-medium text-white">Quantos créditos você quer?</label>
                <Slider
                    v-model="credits"
                    :min="1"
                    :max="300"
                    :step="1"
                    class="w-full"
                />
                
                <!-- Input numérico para valores acima de 300 -->
                <div class="flex items-center gap-3 mt-4">
                    <span class="text-sm text-gray-300 flex-shrink-0">Ou digite a quantidade:</span>
                    <InputNumber
                        v-model="credits"
                        :min="1"
                        :max="10000"
                        showButtons
                        buttonLayout="horizontal"
                        class="flex-1"
                    >
                        <template #incrementbuttonicon>
                            <span class="pi pi-plus" />
                        </template>
                        <template #decrementbuttonicon>
                            <span class="pi pi-minus" />
                        </template>
                    </InputNumber>
                </div>
            </div>

            <!-- Botões Rápidos -->
            <div class="space-y-3">
                <label class="block text-sm font-medium text-white">Escolha rápida:</label>
                <div class="grid grid-cols-3 gap-3">
                    <div v-for="quickAmount in quickAmounts" :key="quickAmount" class="text-center">
                        <button
                            @click="credits = quickAmount"
                            class="py-2 bg-black/30 font-bold text-lg rounded-full w-full cursor-pointer hover:bg-white/10"
                        >{{quickAmount.toString()}} <i class="pi pi-sparkles text-amber-600" style="font-size: 1em;"></i></button>
                    </div>
                </div>
            </div>

            <!-- Resumo de Benefícios -->
            <div class="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <h4 class="font-semibold text-white mb-2">🎯 Para que servem os créditos?</h4>
                <ul class="text-sm text-gray-300 space-y-1">
                    <li>• <strong>Análises profundas</strong> geradas por IA</li>
                    <li>• Materiais Didáticos <strong>Exclusivos</strong></li>
                    <li>• Relatórios detalhados em PDF</li>
                    <li>• Dados técnicos</li>
                </ul>
            </div>

            <!-- Botões de Ação -->
            <div class="flex justify-between gap-3">
                <Button 
                    label="Voltar" 
                    icon="pi pi-arrow-left"
                    text
                    @click="prevStep"
                    class="flex-1"
                />
                <Button 
                    label="Gerar PIX" 
                    icon="pi pi-qrcode"
                    :loading="loading"
                    @click="generatePix"
                    :disabled="!isStep2Valid"
                    class="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 border-0"
                />
            </div>
        </div>

        <!-- Step 3: Pagamento PIX -->
        <div v-else class="space-y-6">
            <div class="text-center mb-4">
                <i class="pi pi-qrcode text-6xl text-green-500 mb-4" style="font-size: 4rem"></i>
                <h3 class="text-xl font-bold text-white mb-2">Pagamento PIX</h3>
                <p class="text-gray-300">Escaneie o QR Code ou copie o código PIX</p>
            </div>

            <!-- Resumo da Compra -->
            <div class="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-4 border border-green-500/30">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="text-lg font-bold text-white">{{ credits }} créditos</div>
                        <div class="text-sm text-gray-300">Valor: R$ {{ totalValue }}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm text-gray-300">Expira em:</div>
                        <div class="text-lg font-bold text-yellow-400">{{ countdown }}</div>
                    </div>
                </div>
            </div>

            <!-- QR Code -->
            <div class="flex flex-col items-center space-y-4">
                <div class="bg-white p-4 rounded-lg shadow-2xl">
                    
                    <qrcode-vue v-if="pixCopiaECola" class="w-48 h-48" :value="pixCopiaECola" :size="size" level="H" render-as="svg" />
                    <div v-else class="w-64 h-64 flex items-center justify-center bg-gray-100 rounded">
                        <i class="pi pi-spin pi-spinner text-4xl text-primary-500"></i>
                    </div>
                </div>
                
                <div class="text-center">
                    <p class="text-sm text-gray-300 mb-2">Escaneie com seu app bancário</p>
                    <Button 
                        icon="pi pi-camera"
                        label="Escaneie o QR Code"
                        severity="help"
                        text
                    />
                </div>
            </div>

            <!-- PIX Copia e Cola -->
            <div class="space-y-3">
                <label class="block text-sm font-medium text-white">Ou copie o código PIX:</label>
                <div class="flex gap-2">
                    <InputText
                        :value="pixCopiaECola"
                        readonly
                        class="flex-1 bg-slate-700 border-slate-600 text-sm font-mono"
                        :title="pixCopiaECola"
                    />
                    <Button 
                        icon="pi pi-copy"
                        severity="secondary"
                        @click="copyPixCode"
                        :disabled="!pixCopiaECola"
                        v-tooltip="'Copiar código PIX'"
                    />
                </div>
                <small class="text-gray-400 block text-center">
                    Clique no botão de copiar e cole no seu app bancário
                </small>
            </div>

            <!-- Instruções -->
            <div class="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <h4 class="font-semibold text-white mb-2">📱 Como pagar:</h4>
                <ul class="text-sm text-gray-300 space-y-1">
                    <li>1. Abra seu app bancário</li>
                    <li>2. Escaneie o QR Code <strong>OU</strong> cole o código PIX</li>
                    <li>3. Confirme o pagamento de <strong>R$ {{ totalValue }}</strong></li>
                    <li>4. Seus créditos serão liberados automaticamente</li>
                </ul>
            </div>

            <!-- Botões de Ação -->
            <div class="flex justify-between gap-3">
                <Button 
                    label="Voltar" 
                    icon="pi pi-arrow-left"
                    text
                    @click="prevStep"
                    class="flex-1"
                />
                <Button 
                    label="Já Paguei" 
                    icon="pi pi-check"
                    severity="success"
                    @click="checkPayment"
                    :loading="checkingPayment"
                    class="flex-1"
                />
                <Button 
                    label="Novo Pagamento" 
                    icon="pi pi-refresh"
                    severity="secondary"
                    @click="restartPayment"
                    class="flex-1"
                />
            </div>

            <!-- Contador Regressivo -->
            <div class="text-center">
                <div class="text-sm text-gray-400">
                    Este PIX expira em: <span class="font-bold text-yellow-400">{{ countdown }}</span>
                </div>
            </div>
        </div>

        <!-- Loading Overlay -->
        <div v-if="loading" class="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
            <div class="text-center">
                <i class="pi pi-spin pi-spinner text-4xl text-primary-500 mb-2"></i>
                <p class="text-white">Gerando PIX...</p>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, inject } from 'vue'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'
import InputMask from 'primevue/inputmask'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import Slider from 'primevue/slider'
import InputText from 'primevue/inputtext'
import Tooltip from 'primevue/tooltip'
import API from '@/utils/api'

// Props e Emits
const props = defineProps({
    modelValue: Boolean
})
const auth = inject('auth')
let poolingTimeout = null
const emit = defineEmits(['update:modelValue', 'success'])

const toast = useToast()

const startPaymentPooling = () => {
  const txid = pixResponse.value?.payment?.txid
  if (!txid) return

  const checkPaymentStatus = async () => {
    try {
      const response = await API.get(`/payments/verify/${txid}`)
      if (response.payment.status === 'paid') {
        // Parar pooling imediatamente
        stopPaymentPooling()
        
        // Atualizar dados do usuário
        await auth.fetchUser()
        
        toast.add({
          severity: 'success',
          summary: 'Pagamento Detectado! 🎉',
          detail: 'Seus créditos foram adicionados automaticamente!',
          life: 5000
        })
        
        emit('success', {
          credits: response.payment.credits,
          value: totalValue.value
        })
        closeModal()
      } else {
        // Agendar próxima verificação em 3 segundos
        poolingTimeout = setTimeout(checkPaymentStatus, 3000)
      }
    } catch (error) {
      // Em caso de erro, agendar nova tentativa em 3 segundos
      poolingTimeout = setTimeout(checkPaymentStatus, 3000)
    }
  }

  // Iniciar primeira verificação
  poolingTimeout = setTimeout(checkPaymentStatus, 3000)

  // Parar o pooling após 30 minutos (fallback)
  setTimeout(() => {
    stopPaymentPooling()
  }, 30 * 60 * 1000)
}

// Função para parar o pooling
const stopPaymentPooling = () => {
  if (poolingTimeout) {
    clearTimeout(poolingTimeout)
    poolingTimeout = null
  }
}
// Estados do formulário
const cpf = ref('')
const credits = ref(5)
const currentStep = ref(1)
const loading = ref(false)
const checkingPayment = ref(false)

// Estados do PIX
const pixResponse = ref(null)
const pixCopiaECola = ref('')
const qrCodeUrl = ref('')
const expirationTime = ref('')
const countdown = ref('')
let countdownInterval = null

// Valores rápidos pré-definidos
const quickAmounts = [10, 20, 30, 50, 100, 200]

const price = ref(25);

const CONFIGS = inject('config');

// Computed
const totalValue = computed(() => {
    return ((credits.value * price.value)/100).toFixed(2).replace('.', ',')
})

const cpfError = computed(() => {
    if (!cpf.value) return 'CPF é obrigatório para nota fiscal'
    const cleanCPF = cpf.value.replace(/\D/g, '')
    if (cleanCPF.length !== 11) return 'CPF inválido'
    return null
})

const isStep1Valid = computed(() => {
    return cpf.value && !cpfError.value
})

const isStep2Valid = computed(() => {
    return credits.value >= 1 && credits.value <= 10000
})

// Métodos
const getHeaderTitle = () => {
    switch (currentStep.value) {
        case 1: return 'CPF para Nota Fiscal'
        case 2: return 'Escolha seus Créditos'
        case 3: return 'Pagamento PIX'
        default: return 'Recarregar Créditos'
    }
}

const onVisibleChange = (visible) => {
   
    emit('update:modelValue', visible)
}

const closeModal = () => {
    emit('update:modelValue', false)
    resetForm()
}

const nextStep = () => {
    if (currentStep.value === 1 && isStep1Valid.value) {
        
        price.value = CONFIGS && CONFIGS.value && CONFIGS.value['credit-price'] ? parseInt(CONFIGS.value['credit-price']) : 25;
        currentStep.value = 2;
    } else if (currentStep.value === 2 && isStep2Valid.value) {
        generatePix()
    }
}

const prevStep = () => {
    if (currentStep.value > 1) {
        currentStep.value--
        
        // Se voltar do step 3, para o contador
        if (currentStep.value === 2) {
            stopCountdown()
        }
    }
}

const generatePix = async () => {
    if (!isStep2Valid.value) return

    loading.value = true

    try {
        const cleanCPF = cpf.value.replace(/\D/g, '')
        
        const response = await API.post('/payments/buy-credits', {
            cpf: cleanCPF,
            credits: credits.value
        })

        if (response.success) {
            pixResponse.value = response
            pixCopiaECola.value = response.payment?.pixCopiaECola || ''
            
            // Configurar expiração
            setupExpiration(300)

            startPaymentPooling();
            
            // Ir para step 3
            currentStep.value = 3
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Ops! 😕',
            detail: error.error || 'Erro ao gerar PIX. Tente novamente.',
            life: 5000
        })
    } finally {
        loading.value = false
    }
}

const setupExpiration = (seconds) => {
    const expiration = new Date(Date.now() + seconds * 1000)
    expirationTime.value = expiration.toLocaleTimeString('pt-BR')
    
    // Iniciar contador regressivo
    startCountdown(seconds)
}

const startCountdown = (totalSeconds) => {
    stopCountdown() // Para qualquer contador anterior
    
    let remaining = totalSeconds
    
    const updateCountdown = () => {
        const minutes = Math.floor(remaining / 60)
        const seconds = remaining % 60
        countdown.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        
        if (remaining <= 0) {
            stopCountdown()
            toast.add({
                severity: 'warn',
                summary: 'PIX Expirado',
                detail: 'O PIX expirou. Gere um novo pagamento.',
                life: 5000
            })
        }
        
        remaining--
    }
    
    updateCountdown()
    countdownInterval = setInterval(updateCountdown, 1000)
}

const stopCountdown = () => {
    if (countdownInterval) {
        clearInterval(countdownInterval)
        countdownInterval = null
    }
}

const copyPixCode = async () => {
    if (!pixCopiaECola.value) return
    
    try {
        await navigator.clipboard.writeText(pixCopiaECola.value)
        toast.add({
            severity: 'success',
            summary: 'Copiado!',
            detail: 'Código PIX copiado para a área de transferência',
            life: 3000
        })
    } catch (err) {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea')
        textArea.value = pixCopiaECola.value
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        
        toast.add({
            severity: 'success',
            summary: 'Copiado!',
            detail: 'Código PIX copiado',
            life: 3000
        })
    }
}

const checkPayment = async () => {
  checkingPayment.value = true
  
  try {
    stopPaymentPooling()
    const response = await API.post('/payments/confirm-payment', {
      txid: pixResponse.value?.payment?.txid
    })

    if (response.success) {
      toast.add({
        severity: 'success',
        summary: 'Pagamento Confirmado! 🎉',
        detail: `${response.payment.credits} créditos adicionados à sua conta!`,
        life: 5000
      })
      
      emit('success', {
        credits: response.payment.credits,
        value: totalValue.value,
        payment: response.payment
      })
      auth.fetchUser();
      closeModal()
    } else {
        startPaymentPooling();
      toast.add({
        severity: 'warn',
        summary: 'Pagamento não identificado',
        detail: response.message || 'Se você já pagou, aguarde alguns instantes.',
        life: 5000
      })
    }
  } catch (error) {
    startPaymentPooling();
    toast.add({
      severity: 'error',
      summary: 'Erro na verificação',
      detail: error.error || 'Erro ao verificar pagamento. Tente novamente.',
      life: 5000
    })
  } finally {
    checkingPayment.value = false
  }
}

const restartPayment = () => {
    stopCountdown()
    currentStep.value = 2
    pixResponse.value = null
    pixCopiaECola.value = ''
    qrCodeUrl.value = ''
}

const resetForm = () => {
    cpf.value = ''
    credits.value = 5
    currentStep.value = 1
    loading.value = false
    checkingPayment.value = false
    pixResponse.value = null
    pixCopiaECola.value = ''
    qrCodeUrl.value = ''
    stopCountdown()
}

// Watcher para resetar form quando modal fechar
watch(() => props.modelValue, (newVal) => {
    if (!newVal) {
        resetForm()
    }
})

// Limpar intervalos quando componente for destruído
onUnmounted(() => {
    stopCountdown()
})
</script>

<style scoped>
.credit-modal {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.credit-modal :deep(.p-dialog-header) {
    background: transparent;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.credit-modal :deep(.p-dialog-content) {
    background: transparent;
    padding: 2rem;
}

:deep(.p-slider .p-slider-range) {
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
}

:deep(.p-slider .p-slider-handle) {
    background: #3b82f6;
    border: 2px solid #fff;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

:deep(.p-slider .p-slider-handle:hover) {
    background: #2563eb;
    transform: scale(1.1);
    transition: all 0.2s ease;
}
</style>
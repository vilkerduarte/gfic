// src/utils/CreditModalManager.js
import { ref } from 'vue'

class CreditModalManager {
    constructor() {
        this.isOpen = ref(false)
        this.listeners = []
    }

    // Abrir modal de qualquer lugar
    open() {
        this.isOpen.value = true
        this.notifyListeners(true)
    }

    // Fechar modal
    close() {
        this.isOpen.value = false
        this.notifyListeners(false)
    }

    // Adicionar listener
    addListener(callback) {
        this.listeners.push(callback)
        return () => {
            this.listeners = this.listeners.filter(listener => listener !== callback)
        }
    }

    // Notificar todos os listeners
    notifyListeners(isOpen) {
        this.listeners.forEach(listener => {
            try {
                listener(isOpen)
            } catch (error) {
                console.error('Error in credit modal listener:', error)
            }
        })
    }

    // Método global para ser usado em qualquer componente
    static getInstance() {
        if (!CreditModalManager.instance) {
            CreditModalManager.instance = new CreditModalManager()
        }
        return CreditModalManager.instance
    }
}

// Criar instância singleton
CreditModalManager.instance = null

export default CreditModalManager
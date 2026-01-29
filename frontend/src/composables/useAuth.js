import { ref, computed } from 'vue'
import API from '@/utils/api'

// 🔸 estado global (compartilhado entre todos os componentes)
const user = ref(null)
const loading = ref(false)
const error = ref(null)

export const useAuth = () => {
    const isAuthenticated = computed(() => !!user.value?.hash)
    const roles = computed(() => user.value?.permissions?.map(p => p.permission) || [])
    const hasRole = (role) => roles.value.includes(role)
    const isMaster = computed(() => hasRole('master'))
    const isSupport = computed(() => hasRole('suporte') || hasRole('master'))

    const fetchAssets = async () => {
        const response = await API.get('/auth/account/assets', (error) => {
            throw new Error(error)
        })

        if (response.assets) {
            if(user.value){
                user.value.assets =  response.assets.split('!');
            }
            return response.assets;
        }
    }

    const fetchUser = async () => {
        loading.value = true
        error.value = null
        try {
            const response = await API.get('/auth/account', (error) => {
                throw new Error(error)
            })

            if (response.user) {
                user.value = {...response.user,assets: response.user.assets.split('!')};
                return response.user;
            }

            if (response.status === 401) {
                user.value = null;
                return null;
            }


        } catch (err) {
            error.value = err.message;
            user.value = null;
            return null;
        } finally {
            loading.value = false;
        }
    }

    const logout = async () => {
        loading.value = true
        error.value = null
        try {
            const data = await API.post('/auth/sign-out', {},(error) => {
                throw new Error(error)
            })
            user.value = null;
            return { success: true }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    const refreshUser = () => fetchUser()

    return {
        user:computed(()=> user.value),
        loading,
        error,
        isAuthenticated,
        fetchAssets,
        fetchUser,
        logout,
        refreshUser,
        roles,
        hasRole,
        isMaster,
        isSupport
    }
}

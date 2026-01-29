import { createRouter, createWebHistory } from 'vue-router'
import Index from '@/pages/index.vue'
import Login from '@/pages/Login.vue'
import Register from '@/pages/Register.vue'
import MyAssets from '@/pages/MyAssets.vue'
import Learn from '@/pages/Learn.vue'
import Recovery from '@/pages/Recovery.vue'
import AdminUsers from '@/pages/admin/Users.vue'
import AdminPayments from '@/pages/admin/Payments.vue'
import AdminAssets from '@/pages/admin/Assets.vue'
import MyAccount from '@/pages/MyAccount.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:'/',
      component:Index
    },
    {
      path:'/login',
      component:Login
    },
    {
      path:'/register',
      component:Register
    },
    {
      path: '/my-assets',
      component: MyAssets
    },
    {
      path: '/my-account',
      component: MyAccount
    },
    {
      path: '/learn',
      component: Learn
    },
    {
      path: '/recovery',
      component: Recovery
    },
    {
      path: '/admin/users',
      component: AdminUsers
    },
    {
      path: '/admin/payments',
      component: AdminPayments
    },
    {
      path: '/admin/assets',
      component: AdminAssets
    }
  ],
})

export default router

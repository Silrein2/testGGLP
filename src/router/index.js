import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../views/MainPage.vue'
import DashBoard from '../views/Dashboard.vue'
import Login from '@/views/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/main/:email',
      name: 'main',
      component: MainPage
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashBoard
    }
  ]
})

export default router

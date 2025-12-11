import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../views/MainPage.vue'
import AdminDashBoard from '../views/AdminDashboard.vue'
import UserDashboard from '@/views/UserDashboard.vue'
import Login from '@/views/Login.vue'
import QuestionPlanner from '@/views/QuestionPlanner.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/user-dashboard'
    },
    // {
    //   path: '/login',
    //   name: 'LoginPage',
    //   component: Login
    // },
    {
      path: '/main',
      name: 'MainPage',
      component: MainPage
    },
    {
      path: '/admin-dashboard',
      name: 'AdminDashboardPage',
      component: AdminDashBoard
    },
    {
      path: '/user-dashboard',
      name: 'UserDashboardPage',
      component: UserDashboard
    },
    {
      path: '/question-planner',
      name: 'QuestionPlannerPage',
      component: QuestionPlanner
    }
  ]
})

export default router

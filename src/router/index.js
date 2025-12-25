import HomeView from '@/views/Editor/HomeView.vue'
import AppLayout from '@/components/AppLayout.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
     {
      path: '/',
      name: 'app',
      component: AppLayout, 
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'app.cms.editor-home',
          component: HomeView,
          meta: { 
            title: 'CMS編輯器版面設計',
            breadcrumbs: [
              { text: 'CMS編輯器版面設計', to: null },
            ]
          }
        },
      ]
    },
  ],
})

export default router

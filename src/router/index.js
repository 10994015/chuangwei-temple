import HomeView from '@/views/Editor/HomeView.vue'
import AppLayout from '@/components/AppLayout.vue'
import { createRouter, createWebHistory } from 'vue-router'
import SubdomainSetup from '@/views/Editor/SubdomainSetup.vue'
import TemplateSelection from '@/views/Editor/TemplateSelection.vue'
import PageEditor from '@/views/Editor/PageEditor.vue'
import WebsiteSetupGuide from '@/views/Editor/WebsiteSetupGuide.vue'
import PricingPlans from '@/views/Editor/PricingPlans.vue'

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
        {
          path: 'website-setup',
          name: 'app.cms.website-setup',
          component: WebsiteSetupGuide,
          meta: { 
            title: '建立您的官廳網站',
            breadcrumbs: [
              { text: '建立您的官廳網站', to: null },
            ]
          }
        },
        {
          path: 'subdomain-setup',
          name: 'app.cms.subdomain-setup',
          component: SubdomainSetup,
          meta: { 
            title: '子網域設定',
            breadcrumbs: [
              { text: '子網域設定', to: null },
            ]
          }
        },
        {
          path: 'template-selection',
          name: 'app.cms.template-selection',
          component: TemplateSelection,
          meta: { 
            title: '模板選擇',
            breadcrumbs: [
              { text: '模板選擇', to: null },
            ]
          }
        },
        {
          path: 'page-editor',
          name: 'app.cms.page-editor',
          component: PageEditor,
          meta: { 
            title: '頁面編輯器',
            breadcrumbs: [
              { text: '頁面編輯器', to: null },
            ]
          }
        },
        {
          path: 'pricing-plans',
          name: 'app.cms.pricing-plans',
          component: PricingPlans,
          meta: { 
            title: '升級方案',
            breadcrumbs: [
              { text: '升級方案', to: null },
            ]
          }
        },
      ]
    },
  ],
})

export default router
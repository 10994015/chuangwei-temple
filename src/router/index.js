import HomeView from '@/views/Editor/HomeView.vue'
import AppLayout from '@/components/AppLayout.vue'
import { createRouter, createWebHistory } from 'vue-router'
import SubdomainSetup from '@/views/Editor/SubdomainSetup.vue'
import TemplateSelection from '@/views/Editor/TemplateSelection.vue'
import PageEditor from '@/views/Editor/PageEditor.vue'
import WebsiteSetupGuide from '@/views/Editor/WebsiteSetupGuide.vue'
import PricingPlans from '@/views/Editor/PricingPlans.vue'
import InitPassword from '@/views/InitPassword.vue'
import { useAuthStore } from '@/stores/auth'
import { useTemplateStore } from '@/stores/template'
import DashboardView from '@/views/Temple/DashboardView.vue'
import Websitesettings from '@/views/Editor/PageEditor/Websitesettings.vue'
import PreviewPage from '@/views/PreviewPage.vue'
import EditorLayout from '@/layouts/EditorLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'app',
      component: AppLayout, 
      children: [
        {
          path: '',
          name: 'app.cms.editor-home',
          component: HomeView,
          meta: { 
            title: 'CMS編輯器版面設計',
            breadcrumbs: [
              { text: 'CMS編輯器版面設計', to: null },
            ],
            requiresAuth: false
          }
        },
        // 香客帳號管理（固定路徑）
        {
          path: 'customer-account',
          name: 'app.cms.customer-account',
          component: HomeView,
          meta: { 
            title: '香客帳號管理',
            breadcrumbs: [
              { text: '香客帳號管理', to: null },
            ],
            requiresAuth: true,
            isCustomerAccount: true
          }
        },
        // 宮廟路由（動態 templeId）
        {
          path: ':templeId',
          name: 'app.temple',
          meta: { 
            requiresAuth: true,
            isTempleRoute: true
          },
          children: [
            {
              path: 'dashboard',
              name: 'app.temple.dashboard',
              component: DashboardView,
              meta: { 
                title: '宮廟總覽',
                breadcrumbs: [
                  { text: '宮廟總覽', to: null },
                ],
                requiresAuth: true
              }
            },
            {
              path: 'website-setup',
              name: 'app.temple.website-setup',
              component: WebsiteSetupGuide,
              meta: { 
                title: '建立您的宮廟網站',
                breadcrumbs: [
                  { text: '建立您的宮廟網站', to: null },
                ],
                requiresAuth: true,
                checkWebsite: true
              }
            },
            {
              path: 'subdomain-setup/:templateId',
              name: 'app.temple.subdomain-setup',
              component: SubdomainSetup,
              meta: { 
                title: '子網域設定',
                breadcrumbs: [
                  { text: '子網域設定', to: null },
                ],
                requiresAuth: true,
                checkWebsite: true
              }
            },
            {
              path: 'template-selection',
              name: 'app.temple.template-selection',
              component: TemplateSelection,
              meta: { 
                title: '模板選擇',
                breadcrumbs: [
                  { text: '模板選擇', to: null },
                ],
                requiresAuth: true,
                checkWebsite: true
              }
            },
            {
              path: 'pricing-plans',
              name: 'app.temple.pricing-plans',
              component: PricingPlans,
              meta: { 
                title: '升級方案',
                breadcrumbs: [
                  { text: '升級方案', to: null },
                ],
                requiresAuth: true
              }
            }
          ]
        }
      ]
    },
    {
      path: '/editor',
      component: EditorLayout,
      children: [
        {
          path: ':templeId/page-editor',
          name: 'app.temple.page-editor',
          component: PageEditor,
          meta: { 
            title: '頁面編輯器',
            breadcrumbs: [
              { text: '頁面編輯器', to: null },
            ],
            requiresAuth: true
          }
        },
        {
          path: ':templeId/website-settings',
          name: 'app.temple.website-settings',
          component: Websitesettings,
          meta: { 
            title: '網站設定',
            breadcrumbs: [
              { text: '網站設定', to: null },
            ],
            requiresAuth: true
          }
        },
        {
          path: ':templeId/preview',
          name: 'app.temple.preview',
          component: PreviewPage,
          meta: {
            title: '頁面預覽',
            requiresAuth: true
          }
        }
      ]
    },
    // 初始密碼設定（首次登入或密碼過期）
    {
      path: '/init-password/:token',
      name: 'init-password',
      component: InitPassword,
      meta: {
        title: '重設密碼',
        requiresAuth: false
      }
    },
  ],
})
// 全域路由守衛
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const templateStore = useTemplateStore()
  
  console.log('路由守衛：從', from.path, '到', to.path)
  console.log('需要認證:', to.meta.requiresAuth)
  
  // 檢查路由是否需要登入
  if (to.meta.requiresAuth) {
    try {
      console.log('開始檢查認證狀態...')
      // 檢查登入狀態
      const isAuthenticated = await authStore.checkAuth()
      console.log('認證結果:', isAuthenticated)
      
      if (!isAuthenticated) {
        console.log('未登入，重定向到首頁')
        // 未登入，重定向到首頁
        next('/')
        return
      }
      
      // 如果是宮廟路由，檢查是否有該宮廟的權限
      if (to.params.templeId) {
        const templeId = to.params.templeId
        console.log('檢查宮廟權限:', templeId)
        console.log('用戶的宮廟角色:', authStore.templeRoles)
        
        const hasPermission = authStore.templeRoles.some(
          temple => temple.templeId === templeId
        )
        
        console.log('是否有權限:', hasPermission)
        
        if (!hasPermission) {
          console.log('沒有該宮廟權限，重定向到首頁')
          alert('您沒有訪問該宮廟的權限')
          next('/')
          return
        }

        // 檢查是否需要檢查網站存在
        if (to.meta.checkWebsite) {
          console.log('檢查網站是否已建立...')
          const websiteExists = await templateStore.checkWebsiteExists(templeId)
          console.log('網站是否已存在:', websiteExists)
          
          if (websiteExists) {
            console.log('網站已存在，重定向到頁面編輯器')
            // 如果網站已存在，重定向到頁面編輯器
            next({
              name: 'app.temple.page-editor',
              params: { templeId }
            })
            return
          } else {
            console.log('網站尚未建立，允許訪問')
          }
        }
      }
      
      // 已登入，允許訪問
      console.log('認證通過，允許訪問')
      next()
    } catch (error) {
      console.error('認證檢查失敗:', error)
      // 認證失敗，重定向到首頁
      next('/')
    }
  } else {
    // 不需要登入的頁面，直接放行
    console.log('不需要認證，直接放行')
    next()
  }
})

// 在路由切換後更新網頁標題
router.afterEach((to, from) => {
  window.scrollTo(0, 0)
  
  const systemName = '宮掌櫃 CMS'
  
  if (to.meta && to.meta.title) {
    document.title = `${to.meta.title} - ${systemName}`
  } else {
    document.title = systemName
  }
})

export default router
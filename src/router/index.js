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
import CustomerLayout from '@/layouts/CustomerLayout.vue'
import MemberProfileView from '@/views/Customer/MemberProfileView.vue'
import TempleLayout from '@/layouts/TempleLayout.vue'

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
            breadcrumbs: [{ text: 'CMS編輯器版面設計', to: null }],
            requiresAuth: false
          }
        },

        // ── 香客帳號管理（CustomerLayout 側邊欄）──
        {
          path: 'customer-account',
          component: CustomerLayout,
          meta: { requiresAuth: true, isCustomerAccount: true },
          children: [
            {
              path: '',
              name: 'app.cms.customer-account',
              component: MemberProfileView,
              meta: {
                title: '會員資料',
                breadcrumbs: [
                  { text: '香客帳號管理', to: '/customer-account' },
                  { text: '會員資料', to: null },
                ],
                requiresAuth: true,
                isCustomerAccount: true
              }
            },
            // 未來擴充：
            // { path: 'photos',     name: 'app.cms.customer-photos',     component: () => import('@/views/Customer/PhotosView.vue'),     meta: { title: '相片管理',    requiresAuth: true } },
            { path: 'orders',     name: 'app.cms.customer-orders',     component: () => import('@/views/Customer/OrdersView.vue'),     meta: { title: '訂單紀錄',    requiresAuth: true } },
            // { path: 'divination', name: 'app.cms.customer-divination', component: () => import('@/views/Customer/DivinationView.vue'), meta: { title: '求籤紀錄',    requiresAuth: true } },
            // { path: 'checkin',    name: 'app.cms.customer-checkin',    component: () => import('@/views/Customer/CheckinView.vue'),    meta: { title: '打卡',        requiresAuth: true } },
            // { path: 'favorites',  name: 'app.cms.customer-favorites',  component: () => import('@/views/Customer/FavoritesView.vue'),  meta: { title: '我的最愛宮廟', requiresAuth: true } },
            { path: 'cart',       name: 'app.cms.customer-cart',       component: () => import('@/views/Customer/CartView.vue'),       meta: { title: '購物車',      requiresAuth: true } },
          ]
        },

        // ── 宮廟後台：含 TempleLayout 側邊欄 ──
        {
          path: ':templeId',
          component: TempleLayout,
          meta: { requiresAuth: true, isTempleRoute: true },
          children: [
            {
              path: 'dashboard',
              name: 'app.temple.dashboard',
              component: DashboardView,
              meta: {
                title: '宮廟總覽',
                breadcrumbs: [{ text: '宮廟總覽', to: null }],
                requiresAuth: true
              }
            },
            // 未來有側邊欄的後台頁面繼續加在這裡：
            { path: 'temple-info', name: 'app.temple.temple-info', component: () => import('@/views/Temple/TempleInfoView.vue'), meta: { title: '宮廟資料管理',   requiresAuth: true } },
            { path: 'news',        name: 'app.temple.news',        component: () => import('@/views/Temple/NewsManagementView.vue'),       meta: { title: '最新消息管理',   requiresAuth: true } },
            { path: 'news/create',        name: 'app.temple.news-create', component: () => import('@/views/Temple/NewsCreateView.vue') },
            { path: 'news/:newsId/detail', name: 'app.temple.news-detail', component: () => import('@/views/Temple/NewsDetailView.vue') },
            { path: 'news/:newsId/edit',   name: 'app.temple.news-edit',   component: () => import('@/views/Temple/NewsEditView.vue') },
            // { path: 'events',      name: 'app.temple.events',      component: () => import('@/views/Temple/EventsView.vue'),     meta: { title: '活動與上架管理', requiresAuth: true } },
            // { path: 'orders',      name: 'app.temple.orders',      component: () => import('@/views/Temple/OrdersView.vue'),     meta: { title: '訂單管理',       requiresAuth: true } },
            { path: 'account-management', name: 'app.temple.account-management', component: () => import('@/views/Temple/AccountManagementView.vue'), meta: { title: '帳號管理', requiresAuth: true } },
            { path: 'account-management/create', name: 'app.temple.account-create', component: () => import('@/views/Temple/AccountCreateView.vue'), meta: { title: '新增帳號', requiresAuth: true } },
            { path: 'account-management/role/new',     name: 'app.temple.role-create',  component: () => import('@/views/Temple/RoleEditView.vue'),         meta: { title: '新增權限角色', requiresAuth: true } },
            { path: 'account-management/role/:roleId', name: 'app.temple.role-edit',    component: () => import('@/views/Temple/RoleEditView.vue'),         meta: { title: '編輯權限角色', requiresAuth: true } },

            // ── 活動與上架管理 ──
            { path: 'activity-management',                             name: 'app.temple.activity-management', component: () => import('@/views/Temple/ActivityManagementView.vue'), meta: { title: '活動與上架管理', requiresAuth: true } },
            { path: 'activity-management/activity/create',             name: 'app.temple.activity-create',     component: () => import('@/views/Temple/ActivityFormView.vue'),       meta: { title: '新增活動',       requiresAuth: true } },
            { path: 'activity-management/activity/:activityId/detail', name: 'app.temple.activity-detail',     component: () => import('@/views/Temple/ActivityDetailView.vue'),     meta: { title: '活動詳細資料',   requiresAuth: true } },
            { path: 'activity-management/activity/:activityId/edit',   name: 'app.temple.activity-edit',       component: () => import('@/views/Temple/ActivityFormView.vue'),       meta: { title: '編輯活動',       requiresAuth: true } },
          ]
        },

        // ── 宮廟後台：不含側邊欄（直接掛在 AppLayout 下）──
        {
          path: ':templeId/website-setup',
          name: 'app.temple.website-setup',
          component: WebsiteSetupGuide,
          meta: {
            title: '建立您的宮廟網站',
            breadcrumbs: [{ text: '建立您的宮廟網站', to: null }],
            requiresAuth: true,
            checkWebsite: true,
            isTempleRoute: true
          }
        },
        {
          path: ':templeId/subdomain-setup/:templateId',
          name: 'app.temple.subdomain-setup',
          component: SubdomainSetup,
          meta: {
            title: '子網域設定',
            breadcrumbs: [{ text: '子網域設定', to: null }],
            requiresAuth: true,
            checkWebsite: true,
            isTempleRoute: true
          }
        },
        {
          path: ':templeId/template-selection',
          name: 'app.temple.template-selection',
          component: TemplateSelection,
          meta: {
            title: '模板選擇',
            breadcrumbs: [{ text: '模板選擇', to: null }],
            requiresAuth: true,
            checkWebsite: true,
            isTempleRoute: true
          }
        },
        {
          path: ':templeId/pricing-plans',
          name: 'app.temple.pricing-plans',
          component: PricingPlans,
          meta: {
            title: '升級方案',
            breadcrumbs: [{ text: '升級方案', to: null }],
            requiresAuth: true,
            isTempleRoute: true
          }
        },
      ]
    },

    // ── Editor（全頁編輯器，獨立 Layout）──
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
            breadcrumbs: [{ text: '頁面編輯器', to: null }],
            requiresAuth: true
          }
        },
        {
          path: ':templeId/website-settings',
          name: 'app.temple.website-settings',
          component: Websitesettings,
          meta: {
            title: '網站設定',
            breadcrumbs: [{ text: '網站設定', to: null }],
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

    // ── 初始密碼設定 ──
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

  if (to.meta.requiresAuth) {
    try {
      const isAuthenticated = await authStore.checkAuth()

      if (!isAuthenticated) {
        console.log('未登入，重定向到首頁')
        next('/')
        return
      }

      // 宮廟路由權限檢查
      if (to.params.templeId) {
        const templeId = to.params.templeId
        const hasPermission = authStore.templeRoles.some(t => t.tenantId === templeId)

        if (!hasPermission) {
          alert('您沒有訪問該宮廟的權限')
          next('/')
          return
        }

        // checkWebsite 檢查
        if (to.meta.checkWebsite) {
          const websiteExists = await templateStore.checkWebsiteExists(templeId)
          if (websiteExists) {
            next({ name: 'app.temple.page-editor', params: { templeId } })
            return
          }
        }
      }

      next()
    } catch (error) {
      console.error('認證檢查失敗:', error)
      next('/')
    }
  } else {
    next()
  }
})

// 路由切換後更新標題
router.afterEach((to) => {
  window.scrollTo(0, 0)
  const systemName = '宮掌櫃 CMS'
  document.title = to.meta?.title ? `${to.meta.title} - ${systemName}` : systemName
})

export default router
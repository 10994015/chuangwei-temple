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
import OperationsLayout from '@/layouts/OperationsLayout.vue'

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

        // ── 維運後台（OperationsLayout 側邊欄）──
        {
          path: 'operations',
          component: OperationsLayout,
          meta: { requiresAuth: true },
          children: [
            { path: '', redirect: { name: 'app.operations.user-management' } },
            { path: 'dashboard',        name: 'app.operations.dashboard',        component: () => import('@/views/Operations/OperationsDashboardView.vue'),    meta: { title: '營運總覽',    requiresAuth: true } },
            { path: 'user-management',  name: 'app.operations.user-management',  component: () => import('@/views/Operations/OperationsUserMgmtView.vue'),     meta: { title: '用戶管理',    requiresAuth: true } },
            { path: 'user-review',      name: 'app.operations.user-review',      component: () => import('@/views/Operations/OperationsUserReviewView.vue'),    meta: { title: '用戶審核',    requiresAuth: true } },
            { path: 'creator-review',   name: 'app.operations.creator-review',   component: () => import('@/views/Operations/OperationsCreatorReviewView.vue'), meta: { title: '創作者審核',  requiresAuth: true } },
            { path: 'orders',           name: 'app.operations.orders',           component: () => import('@/views/Operations/OperationsOrdersView.vue'),        meta: { title: '訂單管理',    requiresAuth: true } },
            { path: 'lanterns',         name: 'app.operations.lanterns',         component: () => import('@/views/Operations/OperationsLanternsView.vue'),      meta: { title: '數位光明燈管理', requiresAuth: true } },
            { path: 'finance',          name: 'app.operations.finance',          component: () => import('@/views/Operations/OperationsFinanceView.vue'),       meta: { title: '財務管理',    requiresAuth: true } },
            { path: 'plans',            name: 'app.operations.plans',            component: () => import('@/views/Operations/OperationsPlansView.vue'),         meta: { title: '方案管理',    requiresAuth: true } },
            { path: 'ads',              name: 'app.operations.ads',              component: () => import('@/views/Operations/OperationsAdsView.vue'),           meta: { title: '廣告管理',    requiresAuth: true } },
            { path: 'notifications',    name: 'app.operations.notifications',    component: () => import('@/views/Operations/OperationsNotificationsView.vue'), meta: { title: '通知管理',    requiresAuth: true } },
            { path: 'support',          name: 'app.operations.support',          component: () => import('@/views/Operations/OperationsSupportView.vue'),       meta: { title: '客服管理',    requiresAuth: true } },
            { path: 'reports',          name: 'app.operations.reports',          component: () => import('@/views/Operations/OperationsReportsView.vue'),       meta: { title: '報表中心',    requiresAuth: true } },
            { path: 'maintenance',          name: 'app.operations.maintenance',       component: () => import('@/views/Operations/OperationsMaintenanceView.vue'),   meta: { title: '營運維報',    requiresAuth: true } },
            { path: 'maintenance/account/new',          name: 'app.operations.account-create', component: () => import('@/views/Operations/OperationsAccountFormView.vue'), meta: { title: '新增帳號', requiresAuth: true } },
            { path: 'maintenance/account/:userId/edit', name: 'app.operations.account-edit',   component: () => import('@/views/Operations/OperationsAccountFormView.vue'), meta: { title: '編輯帳號', requiresAuth: true } },
            { path: 'maintenance/role/new',        name: 'app.operations.role-create', component: () => import('@/views/Operations/OperationsRoleFormView.vue'), meta: { title: '新增權限角色', requiresAuth: true } },
            { path: 'maintenance/role/:roleId/edit', name: 'app.operations.role-edit', component: () => import('@/views/Operations/OperationsRoleFormView.vue'), meta: { title: '編輯權限角色', requiresAuth: true } },
            { path: 'user-management/review/:userId/:applicationId/edit', name: 'app.operations.review-edit', component: () => import('@/views/Operations/OperationsReviewFormView.vue'), meta: { title: '審核操作', requiresAuth: true } },
            { path: 'user-management/review/:userId/:applicationId', name: 'app.operations.review-detail', component: () => import('@/views/Operations/OperationsReviewDetailView.vue'), meta: { title: '用戶審核詳細', requiresAuth: true } },
            { path: 'user-management/designer/:applicationId', name: 'app.operations.designer-detail', component: () => import('@/views/Operations/OperationsDesignerDetailView.vue'), meta: { title: '創作者詳細資料', requiresAuth: true } },
            { path: 'user-management/customer/:userId', name: 'app.operations.customer-detail', component: () => import('@/views/Operations/OperationsCustomerDetailView.vue'), meta: { title: '香客詳細資料', requiresAuth: true } },
            { path: 'settings',         name: 'app.operations.settings',         component: () => import('@/views/Operations/OperationsSettingsView.vue'),      meta: { title: '系統設定',    requiresAuth: true } },
          ]
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
            { path: 'orders', name: 'app.cms.customer-orders', component: () => import('@/views/Customer/OrdersView.vue'), meta: { title: '訂單紀錄', requiresAuth: true } },
            { path: 'cart',   name: 'app.cms.customer-cart',   component: () => import('@/views/Customer/CartView.vue'),   meta: { title: '購物車',  requiresAuth: true } },
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

            // ── 宮廟資料管理 ──
            { path: 'temple-info',                  name: 'app.temple.temple-info',   component: () => import('@/views/Temple/TempleInfoView.vue'),    meta: { title: '宮廟資料管理', requiresAuth: true } },
            { path: 'temple-info/deity/create',    name: 'app.temple.deity-create',  component: () => import('@/views/Temple/DeityCreateView.vue'),   meta: { title: '新增神尊',     requiresAuth: true } },
            { path: 'temple-info/branch/create',   name: 'app.temple.branch-create', component: () => import('@/views/Temple/BranchCreateView.vue'),  meta: { title: '新增分靈',     requiresAuth: true } },
            { path: 'temple-info/asset/create',    name: 'app.temple.asset-create',  component: () => import('@/views/Temple/AssetCreateView.vue'),   meta: { title: '新增資產',     requiresAuth: true } },

            // ── 最新消息 ──
            { path: 'news',                     name: 'app.temple.news',           component: () => import('@/views/Temple/NewsManagementView.vue'), meta: { title: '最新消息管理', requiresAuth: true } },
            { path: 'news/create',              name: 'app.temple.news-create',    component: () => import('@/views/Temple/NewsCreateView.vue') },
            { path: 'news/:newsId/detail',      name: 'app.temple.news-detail',    component: () => import('@/views/Temple/NewsDetailView.vue') },
            { path: 'news/:newsId/edit',        name: 'app.temple.news-edit',      component: () => import('@/views/Temple/NewsEditView.vue') },

            // ── 帳號管理 ──
            { path: 'account-management',             name: 'app.temple.account-management', component: () => import('@/views/Temple/AccountManagementView.vue'), meta: { title: '帳號管理',     requiresAuth: true } },
            { path: 'account-management/invite',       name: 'app.temple.account-invite',     component: () => import('@/views/Temple/AccountInviteView.vue'),      meta: { title: '權限指派',     requiresAuth: true } },
            { path: 'account-management/create',        name: 'app.temple.account-create', component: () => import('@/views/Temple/AccountCreateView.vue'), meta: { title: '新增帳號', requiresAuth: true } },
            { path: 'account-management/edit/:userId', name: 'app.temple.account-edit',  component: () => import('@/views/Temple/AccountCreateView.vue'), meta: { title: '編輯帳號', requiresAuth: true } },
            { path: 'account-management/role/new',    name: 'app.temple.role-create',        component: () => import('@/views/Temple/RoleEditView.vue'),          meta: { title: '新增權限角色', requiresAuth: true } },
            { path: 'account-management/role/:roleId',name: 'app.temple.role-edit',          component: () => import('@/views/Temple/RoleEditView.vue'),          meta: { title: '編輯權限角色', requiresAuth: true } },

            // ── 活動與上架管理 ──
            { path: 'activity-management',                             name: 'app.temple.activity-management', component: () => import('@/views/Temple/ActivityManagementView.vue'), meta: { title: '活動與上架管理', requiresAuth: true } },
            { path: 'activity-management/activity/create',             name: 'app.temple.activity-create',     component: () => import('@/views/Temple/ActivityFormView.vue'),       meta: { title: '新增活動',       requiresAuth: true } },
            { path: 'activity-management/activity/:activityId/detail', name: 'app.temple.activity-detail',     component: () => import('@/views/Temple/ActivityDetailView.vue'),     meta: { title: '活動詳細資料',   requiresAuth: true } },
            { path: 'activity-management/activity/:activityId/edit',   name: 'app.temple.activity-edit',       component: () => import('@/views/Temple/ActivityFormView.vue'),       meta: { title: '編輯活動',       requiresAuth: true } },
            { path: 'activity-management/service/create',              name: 'app.temple.service-create',      component: () => import('@/views/Temple/ServiceFormView.vue'),        meta: { title: '新增服務',       requiresAuth: true } },
            { path: 'activity-management/service/:serviceId/detail',   name: 'app.temple.service-detail',      component: () => import('@/views/Temple/ServiceDetailView.vue'),      meta: { title: '服務詳細資料',   requiresAuth: true } },
            { path: 'activity-management/service/:serviceId/edit',     name: 'app.temple.service-edit',        component: () => import('@/views/Temple/ServiceFormView.vue'),        meta: { title: '編輯服務',       requiresAuth: true } },

            { path: 'activity-management/donation-settings', name: 'app.temple.donation-settings', component: () => import('@/views/Temple/DonationSettingsView.vue'), meta: { title: '捐款設定', requiresAuth: true } },
            { path: 'activity-management/donation/create',       name: 'app.temple.donation-create', component: () => import('@/views/Temple/DonationFormView.vue'),   meta: { title: '新增捐款商品', requiresAuth: true } },
            { path: 'activity-management/donation/:donationId/detail', name: 'app.temple.donation-detail', component: () => import('@/views/Temple/DonationDetailView.vue'), meta: { title: '捐款商品詳情', requiresAuth: true } },
            { path: 'activity-management/shipping/create', name: 'app.temple.shipping-create', component: () => import('@/views/Temple/ShippingRuleFormView.vue'), meta: { title: '新增運費規則', requiresAuth: true } },
            { path: 'activity-management/shipping/:ruleId/detail', name: 'app.temple.shipping-detail', component: () => import('@/views/Temple/ShippingRuleDetailView.vue'), meta: { title: '運費規則詳情', requiresAuth: true } },
            { path: 'activity-management/lamp/create', name: 'app.temple.lamp-create', component: () => import('@/views/Temple/LampFormView.vue'), meta: { title: '新增燈種', requiresAuth: true } },
            { path: 'activity-management/lamp/:lampId/detail', name: 'app.temple.lamp-detail', component: () => import('@/views/Temple/LampDetailView.vue'), meta: { title: '燈種詳情', requiresAuth: true } },
            { path: 'activity-management/product/select',          name: 'app.temple.product-select', component: () => import('@/views/Temple/ProductTypeSelectView.vue'), meta: { title: '選擇商品類型', requiresAuth: true } },
            { path: 'activity-management/product/create',                 name: 'app.temple.product-create', component: () => import('@/views/Temple/ProductFormView.vue'),   meta: { title: '新增商品', requiresAuth: true } },
            { path: 'activity-management/product/:productId/detail',    name: 'app.temple.product-detail', component: () => import('@/views/Temple/ProductDetailView.vue'), meta: { title: '商品詳情', requiresAuth: true } },
            { path: 'activity-management/product/:productId/edit',      name: 'app.temple.product-edit',   component: () => import('@/views/Temple/ProductFormView.vue'),   meta: { title: '編輯商品', requiresAuth: true } },
            { path: 'activity-management/product/normal/create', name: 'app.temple.product-normal-create', component: () => import('@/views/Temple/NormalProductFormView.vue'), meta: { title: '新增普通商品', requiresAuth: true } },

          ] 
        },

        // ── 宮廟後台：不含側邊欄 ──
        {
          path: ':templeId/website-setup',
          name: 'app.temple.website-setup',
          component: WebsiteSetupGuide,
          meta: { title: '建立您的宮廟網站', requiresAuth: true, checkWebsite: true, isTempleRoute: true }
        },
        {
          path: ':templeId/subdomain-setup/:templateId',
          name: 'app.temple.subdomain-setup',
          component: SubdomainSetup,
          meta: { title: '子網域設定', requiresAuth: true, checkWebsite: true, isTempleRoute: true }
        },
        {
          path: ':templeId/template-selection',
          name: 'app.temple.template-selection',
          component: TemplateSelection,
          meta: { title: '模板選擇', requiresAuth: true, isTempleRoute: true }
        },
        {
          path: ':templeId/pricing-plans',
          name: 'app.temple.pricing-plans',
          component: PricingPlans,
          meta: { title: '升級方案', requiresAuth: true, isTempleRoute: true }
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
          meta: { title: '頁面編輯器', requiresAuth: true }
        },
        {
          path: ':templeId/website-settings',
          name: 'app.temple.website-settings',
          component: Websitesettings,
          meta: { title: '網站設定', requiresAuth: true }
        },
        {
          path: ':templeId/preview',
          name: 'app.temple.preview',
          component: PreviewPage,
          meta: { title: '頁面預覽', requiresAuth: true }
        }
      ]
    },

    // ── 登入頁 ──
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: '登入', requiresAuth: false }
    },

    // ── 註冊頁 ──
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { title: '註冊', requiresAuth: false }
    },

    // ── 忘記密碼 ──
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/ForgotPasswordView.vue'),
      meta: { title: '忘記密碼', requiresAuth: false }
    },

    // ── 初始密碼設定 ──
    {
      path: '/init-password/:token',
      name: 'init-password',
      component: InitPassword,
      meta: { title: '重設密碼', requiresAuth: false }
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
  const systemName = '宮掌櫃'
  document.title = to.meta?.title ? `${to.meta.title} - ${systemName}` : systemName
})

export default router
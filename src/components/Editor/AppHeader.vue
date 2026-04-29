<script setup>
import router from '@/router'
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axiosClient from '@/axios'
import LoginModal from './LoginModal.vue'

const route = useRoute()
const authStore = useAuthStore()

// 導航選單項目（動態從 API 撈取）
const navItems         = ref([])
const headerLogoUrl    = ref('')
const headerTenantName = ref('')

const fetchNavItems = async () => {
  try {
    const response = await axiosClient.get('/frontend/web-site/tab', { params: { locale: 'ZH-TW' } })
    console.log("6564654545", response.data)
    const data = response.data?.data || {}
    headerLogoUrl.value    = data.headerImgUrl || ''
    headerTenantName.value = data.tenantName || data.temple_name || ''
    navItems.value = (data.tabs || []).map(tab => ({ label: tab.label, path: `/${tab.slug}` }))
  } catch (err) {
    console.error('獲取導覽列失敗:', err)
  }
}

// 當前語言
const currentLanguage  = ref('繁體中文')
const showLanguageMenu = ref(false)

// 登入彈窗狀態
const showLoginModal = ref(false)

// 管理後台下拉選單狀態
const showAdminMenu = ref(false)

// 語言選項
const languages = ['繁體中文', 'English', '简体中文']

// 計算是否已登入
const isLoggedIn = computed(() => authStore.isAuthenticated)

// 計算當前的 templeId
const currentTempleId = computed(() => route.params.templeId || null)

// 判斷是否在宮廟路由中（顯示網站管理按鈕）
const isInTempleRoute = computed(() => !!currentTempleId.value)

// 取得所有宮廟角色列表
const templeRolesList = computed(() => authStore.templeRoles || [])

// 是否有維運後台權限（systemPermissions 不為空）
const hasOperationsAccess = computed(() => (authStore.systemPermissions || []).length > 0)

// 處理導航點擊 — 原本 commented out，維持原邏輯
const handleNavClick = (path) => {
  console.log('導航至:', path)
  // TODO: 實作路由導航
  // router.push(path)
}

// 處理網站管理點擊（動態路徑）
const handleSiteManagement = () => {
  if (currentTempleId.value) {
    router.push(`/${currentTempleId.value}/website-setup`)
  } else {
    alert('請先選擇一個宮廟')
  }
}

// 切換管理後台選單
const toggleAdminMenu = () => {
  showAdminMenu.value = !showAdminMenu.value
}

// 處理管理後台選項點擊
const handleAdminOption = (option) => {
  if (option === 'customer-account') {
    router.push('/customer-account')
  } else if (option === 'operations') {
    router.push('/operations')
  } else {
    router.push(`/${option}/dashboard`)
  }
  showAdminMenu.value = false
}

// 切換語言選單
const toggleLanguageMenu = () => {
  showLanguageMenu.value = !showLanguageMenu.value
}

// 選擇語言
const selectLanguage = (language) => {
  currentLanguage.value  = language
  showLanguageMenu.value = false
  console.log('切換語言至:', language)
}

// 開啟登入
const openLoginModal = () => {
  const currentPath = route.path
  const redirectPath = (currentPath && currentPath !== '/') ? currentPath : '/customer-account'
  router.push({ path: '/login', query: { redirect: redirectPath } })
}

// 關閉登入彈窗
const closeLoginModal = () => {
  showLoginModal.value = false
  document.body.style.overflow = ''
}

// 處理登入成功
const handleLoginSuccess = () => {
  console.log('Header: 登入成功')
}

// 處理登出
const handleLogout = async () => {
  if (confirm('確定要登出嗎？')) {
    await authStore.logout()
    console.log('已登出')
    const currentRoute = router.currentRoute.value
    if (currentRoute.meta.requiresAuth) router.push('/')
  }
}

// 組件掛載時檢查登入狀態
onMounted(async () => {
  try { await authStore.checkAuth() } catch { console.log('未登入或 token 已過期') }
  fetchNavItems()

  // 點擊外部關閉所有下拉
  document.addEventListener('click', () => {
    showLanguageMenu.value = false
    showAdminMenu.value    = false
  })
})

// 手機版選單
const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : ''
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

// 監聽路由變化，關閉下拉選單
watch(() => route.path, () => {
  showAdminMenu.value    = false
  showLanguageMenu.value = false
  closeMobileMenu()
})
</script>

<template>
  <header class="app-header">
    <div class="header-container">

      <!-- Logo -->
      <a class="logo-wrapper" @click.prevent="router.push('/')">
        <div class="logo">
          <img v-if="headerLogoUrl" :src="headerLogoUrl" alt="Logo" class="logo-image" />
          <span v-else class="logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="#E8572A"/>
              <text x="14" y="20" text-anchor="middle" font-size="14" fill="#fff" font-weight="bold">宮</text>
            </svg>
          </span>
          <span v-if="headerTenantName" class="logo-name">{{ headerTenantName }}</span>
        </div>
      </a>

      <!-- 桌機導航 -->
      <nav class="nav-menu desktop-only">
        <a
          v-for="item in navItems"
          :key="item.path"
          class="nav-item"
          :class="{ active: route.path === item.path }"
          @click="handleNavClick(item.path)"
        >{{ item.label }}</a>
      </nav>

      <!-- 漢堡按鈕 -->
      <button class="hamburger-btn mobile-only" :class="{ 'is-open': isMobileMenuOpen }" @click="toggleMobileMenu" :aria-expanded="isMobileMenuOpen">
        <span class="hamburger-line" :class="{ open: isMobileMenuOpen }"></span>
        <span class="hamburger-line" :class="{ open: isMobileMenuOpen }"></span>
        <span class="hamburger-line" :class="{ open: isMobileMenuOpen }"></span>
      </button>

      <!-- 桌機右側 -->
      <div class="nav-actions desktop-only">

        <!-- 未登入 -->
        <button v-if="!isLoggedIn" class="login-btn" @click="openLoginModal">登入／註冊</button>

        <!-- 已登入：登出 -->
        <div v-if="isLoggedIn" class="user-info">
          <button class="btn-logout" @click="handleLogout">
            <svg class="logout-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
            </svg>
            登出
          </button>
        </div>

        <!-- 網站管理 -->
        <button v-if="isLoggedIn && isInTempleRoute" class="btn-outline" @click="handleSiteManagement">網站管理</button>

        <!-- 管理後台下拉 -->
        <div v-if="isLoggedIn" class="admin-selector" @click.stop>
          <button class="admin-btn" @click="toggleAdminMenu">
            <span>管理後台</span>
          </button>
          <Transition name="dropdown">
            <div v-if="showAdminMenu" class="admin-dropdown">
              <template v-if="hasOperationsAccess">
                <button class="admin-option" :class="{ active: route.path.startsWith('/operations') }" @click="handleAdminOption('operations')">維運後台</button>
                <div class="dropdown-divider"></div>
              </template>
              <button class="admin-option" :class="{ active: route.path === '/customer-account' }" @click="handleAdminOption('customer-account')">香客帳號管理</button>
              <div v-if="templeRolesList.length > 0" class="dropdown-divider"></div>
              <button
                v-for="temple in templeRolesList"
                :key="temple.tenantId"
                class="admin-option"
                :class="{ active: currentTempleId === temple.tenantId }"
                @click="handleAdminOption(temple.tenantId)"
              >{{ temple.tenantName }}</button>
            </div>
          </Transition>
        </div>

        <!-- 語言選擇 -->
        <div class="locale-wrapper" @click.stop>
          <button class="locale-btn" @click="toggleLanguageMenu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span class="locale-label">{{ currentLanguage }}</span>
            <svg class="chevron-icon" :class="{ rotate: showLanguageMenu }" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          <Transition name="dropdown">
            <div v-if="showLanguageMenu" class="locale-dropdown">
              <button
                v-for="lang in languages"
                :key="lang"
                class="locale-option"
                :class="{ active: lang === currentLanguage }"
                @click="selectLanguage(lang)"
              >{{ lang }}</button>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- 登入彈窗 -->
    <LoginModal :show="showLoginModal" @close="closeLoginModal" @login-success="handleLoginSuccess" />

    <!-- 手機版遮罩 -->
    <Transition name="fade">
      <div v-if="isMobileMenuOpen" class="mobile-overlay" @click="closeMobileMenu" />
    </Transition>

    <!-- 手機版選單 -->
    <div class="mobile-menu mobile-only" :class="{ 'is-open': isMobileMenuOpen }">
      <nav class="mobile-nav">
        <a
          v-for="item in navItems"
          :key="item.path"
          class="mobile-nav-item"
          :class="{ active: route.path === item.path }"
          @click="handleNavClick(item.path); closeMobileMenu()"
        >
          <span>{{ item.label }}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </a>
      </nav>
      <div class="mobile-actions">
        <button v-if="!isLoggedIn" class="mobile-login-btn" @click="openLoginModal(); closeMobileMenu()">登入／註冊</button>
        <template v-if="isLoggedIn">
          <button v-if="isInTempleRoute" class="mobile-action-btn" @click="handleSiteManagement(); closeMobileMenu()">網站管理</button>
          <div class="mobile-section-label">管理後台</div>
          <button v-if="hasOperationsAccess" class="mobile-action-btn" :class="{ active: route.path.startsWith('/operations') }" @click="handleAdminOption('operations'); closeMobileMenu()">維運後台</button>
          <button class="mobile-action-btn" @click="handleAdminOption('customer-account'); closeMobileMenu()">香客帳號管理</button>
          <button
            v-for="temple in templeRolesList"
            :key="temple.tenantId"
            class="mobile-action-btn"
            :class="{ active: currentTempleId === temple.tenantId }"
            @click="handleAdminOption(temple.tenantId); closeMobileMenu()"
          >{{ temple.tenantName }}</button>
          <div class="mobile-divider" />
          <button class="mobile-action-btn danger" @click="handleLogout(); closeMobileMenu()">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
            </svg>
            登出
          </button>
        </template>
        <div class="mobile-divider" />
        <div class="mobile-section-label">語言</div>
        <div class="mobile-lang-row">
          <button
            v-for="lang in languages"
            :key="lang"
            class="mobile-lang-btn"
            :class="{ active: lang === currentLanguage }"
            @click="selectLanguage(lang)"
          >{{ lang }}</button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-header {
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #eee;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  position: sticky;
  top: 0;
  z-index: 200;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

/* ── Logo ── */
.logo-wrapper {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
}
.logo       { display: flex; align-items: center; gap: 8px; min-width: 80px; min-height: 40px; }
.logo-image { max-width: 140px; max-height: 40px; object-fit: contain; flex-shrink: 0; }
.logo-icon  { flex-shrink: 0; display: flex; align-items: center; }
.logo-name  { font-size: 16px; font-weight: 700; color: #222; white-space: nowrap; letter-spacing: 0.5px; }

/* ── Desktop Nav ── */
.nav-menu {
  display: flex;
  gap: 0.25rem;
  flex: 1;
  justify-content: center;
}
.nav-item {
  color: #444;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: color 0.2s;
  white-space: nowrap;
  &:hover  { color: #E8572A; }
  &.active { color: #E8572A; font-weight: 600; }
}

/* ── Right Actions ── */
.nav-actions { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

.user-info { display: flex; align-items: center; gap: 12px; }

/* 登入按鈕 — pill, #E8572A */
.login-btn {
  padding: 7px 20px;
  border: 1.5px solid #E8572A;
  border-radius: 20px;
  background: transparent;
  color: #E8572A;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  &:hover { background: #E8572A; color: #fff; }
}

/* 登出按鈕 */
.btn-logout {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 20px;
  border: 1.5px solid #fecaca;
  border-radius: 20px;
  background: transparent;
  color: #dc2626;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  &:hover { background: #fef2f2; }
  .logout-icon { width: 16px; height: 16px; }
}

/* 網站管理按鈕 */
.btn-outline {
  padding: 7px 20px;
  border: 1.5px solid #ddd;
  border-radius: 20px;
  background: transparent;
  color: #555;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  &:hover { border-color: #aaa; color: #333; }
}

/* ── 管理後台下拉 ── */
.admin-selector { position: relative; }
.admin-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 20px;
  background: #E8572A;
  color: #fff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  transition: background 0.2s;
  &:hover { background: #d94b1f; }
}
.admin-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  min-width: 200px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1001;
  padding: 4px 0;
}
.admin-option {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  transition: background 0.15s;
  &:hover  { background: #f3f4f6; }
  &.active { background: #fff7f3; color: #E8572A; font-weight: 500; }
}
.dropdown-divider { height: 1px; background: #e5e7eb; margin: 4px 0; }

/* ── 語言選擇 ── */
.locale-wrapper { position: relative; }
.locale-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  border: 1.5px solid #ddd;
  border-radius: 20px;
  background: transparent;
  color: #555;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  &:hover { border-color: #E8572A; color: #E8572A; }
}
.locale-label  { font-size: 13px; }
.chevron-icon  { width: 16px; height: 16px; color: #6b7280; transition: transform 0.2s; &.rotate { transform: rotate(180deg); } }
.locale-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  min-width: 130px;
  overflow: hidden;
  z-index: 1001;
  padding: 4px 0;
}
.locale-option {
  width: 100%;
  display: block;
  padding: 10px 16px;
  background: none;
  border: none;
  text-align: left;
  font-size: 13px;
  color: #444;
  cursor: pointer;
  transition: background 0.15s;
  &:hover  { background: #fff5f2; color: #E8572A; }
  &.active { color: #E8572A; font-weight: 600; background: #fff5f2; }
}

/* ── 下拉動畫 ── */
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.2s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-8px); }

/* ── Hamburger ── */
.hamburger-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  padding: 8px;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
  &:hover { background: #f5f5f5; }
}
.hamburger-line {
  display: block;
  width: 22px;
  height: 2px;
  background: #333;
  border-radius: 2px;
  transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
  transform-origin: center;
  &:nth-child(1).open { transform: translateY(7px) rotate(45deg); }
  &:nth-child(2).open { opacity: 0; transform: scaleX(0); }
  &:nth-child(3).open { transform: translateY(-7px) rotate(-45deg); }
}

/* ── Mobile Overlay ── */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  z-index: 998;
}

/* ── Mobile Menu ── */
.mobile-menu {
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #e5e5e5;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  z-index: 999;
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transform: translateY(-8px);
  transition: max-height 0.28s cubic-bezier(0.4,0,0.2,1),
              opacity    0.22s cubic-bezier(0.4,0,0.2,1),
              transform  0.25s cubic-bezier(0.4,0,0.2,1);
  &.is-open { max-height: 600px; opacity: 1; transform: translateY(0); }
}
.mobile-nav { padding: 8px 0; }
.mobile-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  color: #444;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  border-left: 3px solid transparent;
  cursor: pointer;
  transition: all 0.18s;
  &:hover  { color: #E8572A; background: #fff8f6; border-left-color: #E8572A; }
  &.active { color: #E8572A; background: #fff8f6; border-left-color: #E8572A; font-weight: 600; }
}
.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 24px 20px;
  border-top: 1px solid #f0f0f0;
}
.mobile-section-label {
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 8px 8px 4px;
}
.mobile-login-btn {
  width: 100%;
  padding: 10px 16px;
  background: #E8572A;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #d14a1f; }
}
.mobile-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: 8px;
  text-align: left;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: background 0.15s;
  &:hover  { background: #f3f4f6; }
  &.active { background: #fff7f3; color: #E8572A; font-weight: 500; }
  &.danger { color: #dc2626; &:hover { background: #fef2f2; } }
}
.mobile-divider { height: 1px; background: #f3f4f6; margin: 8px 0; }
.mobile-lang-row { display: flex; gap: 8px; padding: 4px 8px; flex-wrap: wrap; }
.mobile-lang-btn {
  padding: 7px 14px;
  border: 1.5px solid #ddd;
  border-radius: 16px;
  background: none;
  font-size: 13px;
  color: #555;
  cursor: pointer;
  transition: all 0.15s;
  &:hover  { border-color: #9ca3af; background: #f9fafb; }
  &.active { background: #E8572A; border-color: #E8572A; color: #fff; font-weight: 500; }
}

/* ── Fade animation ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── RWD ── */
.desktop-only { display: flex; }
.mobile-only  { display: none; }

@media (max-width: 768px) {
  .app-header { padding: 0 1rem; }
  .desktop-only { display: none !important; }
  .mobile-only  { display: flex !important; }
}
</style>

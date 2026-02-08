<script setup>
import router from '@/router'
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginModal from './LoginModal.vue'

const route = useRoute()
const authStore = useAuthStore()

// 導航選單項目
const navItems = [
  { label: '關於我們', path: '/about' },
  { label: '最新消息', path: '/news' },
  { label: '精選館藏品', path: '/collections' },
  { label: '宮廟地圖', path: '/map' },
  { label: '關於數位生態', path: '/digital' },
  { label: '靈籤司', path: '/divination' },
  { label: '聯絡我們', path: '/contact' }
]

// 當前語言
const currentLanguage = ref('繁體中文')
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
const isInTempleRoute = computed(() => {
  return !!currentTempleId.value
})

// 取得所有宮廟角色列表
const templeRolesList = computed(() => {
  return authStore.templeRoles || []
})

// 處理導航點擊
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
    // 香客帳號管理
    router.push('/customer-account')
  } else {
    // 宮廟後台（使用 templeId）
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
  currentLanguage.value = language
  showLanguageMenu.value = false
  console.log('切換語言至:', language)
  // TODO: 實作語言切換邏輯
}

// 點擊外部關閉語言選單
const closeLanguageMenu = () => {
  showLanguageMenu.value = false
}

// 點擊外部關閉管理後台選單
const closeAdminMenu = () => {
  showAdminMenu.value = false
}

// 開啟登入彈窗
const openLoginModal = () => {
  showLoginModal.value = true
  document.body.style.overflow = 'hidden' // 防止背景滾動
}

// 關閉登入彈窗
const closeLoginModal = () => {
  showLoginModal.value = false
  document.body.style.overflow = '' // 恢復滾動
}

// 處理登入成功
const handleLoginSuccess = () => {
  console.log('Header: 登入成功')
  // 可以在這裡處理登入成功後的邏輯
}

// 處理登出
const handleLogout = async () => {
  if (confirm('確定要登出嗎？')) {
    await authStore.logout()
    console.log('已登出')
    
    // 登出後檢查當前路由是否需要權限
    const currentRoute = router.currentRoute.value
    if (currentRoute.meta.requiresAuth) {
      // 如果當前頁面需要登入，跳轉到首頁
      router.push('/')
    }
  }
}

// 組件掛載時檢查登入狀態
onMounted(async () => {
  try {
    await authStore.checkAuth()
  } catch (error) {
    console.log('未登入或 token 已過期')
  }
})

// 監聽路由變化，關閉下拉選單
watch(() => route.path, () => {
  showAdminMenu.value = false
  showLanguageMenu.value = false
})
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo 區域 -->
      <div class="logo-section" @click="router.push('/')">
        <div class="logo-icon">
          <svg viewBox="0 0 40 40" class="temple-icon">
            <rect x="5" y="10" width="30" height="25" fill="#E8572A" />
            <path d="M 2 10 L 20 2 L 38 10 Z" fill="#E8572A" />
            <rect x="15" y="20" width="10" height="15" fill="#fff" opacity="0.3" />
          </svg>
        </div>
        <span class="logo-text">宮掌櫃</span>
      </div>

      <!-- 導航選單 -->
      <nav class="nav-menu">
        <a 
          v-for="item in navItems" 
          :key="item.path"
          class="nav-item"
          @click="handleNavClick(item.path)"
        >
          {{ item.label }}
        </a>
      </nav>

      <!-- 右側按鈕區 -->
      <div class="actions-section">
        <!-- 未登入時顯示登入按鈕 -->
        <button v-if="!isLoggedIn" class="btn btn-login" @click="openLoginModal">
          <svg class="user-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
          登入
        </button>

        <!-- 已登入時顯示用戶資訊和登出按鈕 -->
        <div v-if="isLoggedIn" class="user-info">
          <button class="btn btn-logout" @click="handleLogout">
            <svg class="logout-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
            </svg>
            登出
          </button>
        </div>
        
        <!-- 只有登入且在宮廟路由中才顯示網站管理按鈕 -->
        <button 
          v-if="isLoggedIn && isInTempleRoute" 
          class="btn btn-outline" 
          @click="handleSiteManagement"
        >
          網站管理
        </button>
        
        <!-- 只有登入後才顯示管理後台下拉選單 -->
        <div v-if="isLoggedIn" class="admin-selector" @click.stop>
          <button class="admin-btn" @click="toggleAdminMenu">
            <span>管理後台</span>
          </button>
          
          <!-- 管理後台下拉選單 -->
          <Transition name="dropdown">
            <div v-if="showAdminMenu" class="admin-dropdown">
              <!-- 香客帳號管理（固定選項） -->
              <button 
                class="admin-option"
                :class="{ 'active': route.path === '/customer-account' }"
                @click="handleAdminOption('customer-account')"
              >
                香客帳號管理
              </button>
              
              <!-- 分隔線 -->
              <div v-if="templeRolesList.length > 0" class="dropdown-divider"></div>
              
              <!-- 宮廟角色列表（動態生成） -->
              <button 
                v-for="temple in templeRolesList" 
                :key="temple.templeId"
                class="admin-option"
                :class="{ 'active': currentTempleId === temple.templeId }"
                @click="handleAdminOption(temple.templeId)"
              >
                {{ temple.templeName }}
              </button>
            </div>
          </Transition>
        </div>
        
        <!-- 語言選擇 -->
        <div class="language-selector" @click.stop>
          <button class="language-btn" @click="toggleLanguageMenu">
            <svg class="globe-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clip-rule="evenodd" />
            </svg>
            <span>{{ currentLanguage }}</span>
            <svg class="chevron-icon" :class="{ 'rotate': showLanguageMenu }" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <!-- 語言下拉選單 -->
          <Transition name="dropdown">
            <div v-if="showLanguageMenu" class="language-dropdown">
              <button 
                v-for="lang in languages" 
                :key="lang"
                class="language-option"
                :class="{ 'active': lang === currentLanguage }"
                @click="selectLanguage(lang)"
              >
                {{ lang }}
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- 登入彈窗組件 -->
    <LoginModal 
      :show="showLoginModal" 
      @close="closeLoginModal"
      @login-success="handleLoginSuccess"
    />
  </header>
</template>

<style scoped lang="scss">
.app-header {
  width: 100%;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 32px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  cursor: pointer;
}

.logo-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.temple-icon {
  width: 100%;
  height: 100%;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: #E8572A;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  white-space: nowrap;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 28px;
  flex: 1;
}

.nav-item {
  font-size: 15px;
  color: #374151;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;
  white-space: nowrap;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  font-weight: 500;
  position: relative;

  &:hover {
    color: #E8572A;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -20px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: #E8572A;
    transform: scaleX(0);
    transition: transform 0.2s ease;
  }

  &:hover::after {
    transform: scaleX(1);
  }
}

.actions-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
}

.btn {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  white-space: nowrap;
  border: 1px solid transparent;

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-login {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: transparent;
  color: #374151;
  border-color: #d1d5db;

  &:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
  }

  .user-icon {
    width: 16px;
    height: 16px;
  }
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: transparent;
  color: #dc2626;
  border-color: #fecaca;

  &:hover {
    background-color: #fef2f2;
    border-color: #fca5a5;
  }

  .logout-icon {
    width: 16px;
    height: 16px;
  }
}

.btn-outline {
  background-color: transparent;
  color: #374151;
  border-color: #d1d5db;

  &:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
  }
}

// ========== 管理後台下拉選單 ==========
.admin-selector {
  position: relative;
}

.admin-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background-color: #E8572A;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  white-space: nowrap;

  &:hover {
    background-color: #d94b1f;
  }

  &:active {
    transform: scale(0.98);
  }
}

.admin-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  gap: 10px;
  padding: 10px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  transition: background-color 0.2s ease;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;

  &:hover {
    background-color: #f3f4f6;
  }

  &.active {
    background-color: #fff7f3;
    color: #E8572A;
    font-weight: 500;
  }
}

.option-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.dropdown-divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 4px 0;
}

// ========== 語言選擇器 ==========
.language-selector {
  position: relative;
}

.language-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: transparent;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #374151;
  font-size: 14px;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;

  &:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
  }
}

.globe-icon,
.chevron-icon {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.chevron-icon {
  transition: transform 0.2s ease;

  &.rotate {
    transform: rotate(180deg);
  }
}

.language-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 150px;
  overflow: hidden;
  z-index: 1001;
}

.language-option {
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  transition: background-color 0.2s ease;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;

  &:hover {
    background-color: #f3f4f6;
  }

  &.active {
    background-color: #fef2f2;
    color: #E8572A;
    font-weight: 500;
  }
}

// 下拉選單動畫
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

// 響應式設計
@media (max-width: 1200px) {
  .nav-menu {
    gap: 20px;
  }

  .nav-item {
    font-size: 14px;
  }
}

@media (max-width: 1024px) {
  .nav-menu {
    gap: 16px;
  }

  .header-container {
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
    height: 56px;
  }

  .nav-menu {
    display: none;
  }

  .logo-text {
    font-size: 18px;
  }

  .btn {
    padding: 6px 16px;
    font-size: 13px;
  }

  .actions-section {
    gap: 8px;
  }

  .user-name {
    display: none;
  }
}
</style>
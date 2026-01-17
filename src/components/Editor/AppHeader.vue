<script setup>
import router from '@/router'
import { ref } from 'vue'

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

// 語言選項
const languages = ['繁體中文', 'English', '简体中文']

// 處理導航點擊
const handleNavClick = (path) => {
  console.log('導航至:', path)
  // TODO: 實作路由導航
  // router.push(path)
}

// 處理網站管理點擊
const handleSiteManagement = () => {
   router.push('/website-setup')
}

// 處理管理後台點擊
const handleAdminPanel = () => {
  console.log('前往管理後台')
  // TODO: 實作導航到管理後台
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
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo 區域 -->
      <div class="logo-section">
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
        <button class="btn btn-outline" @click="handleSiteManagement">
          網站管理
        </button>
        <button class="btn btn-primary" @click="handleAdminPanel">
          管理後台
        </button>
        
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

.btn-primary {
  background-color: #E8572A;
  color: #ffffff;
  border: none;

  &:hover {
    background-color: #d94b1f;
  }
}

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
    // TODO: 可以加入 hamburger menu 的響應式設計
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
}
</style>
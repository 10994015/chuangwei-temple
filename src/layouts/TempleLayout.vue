<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const templeId = computed(() => route.params.templeId)

const userName = computed(() => authStore.user?.name || '使用者')
const userEmail = computed(() => authStore.user?.email || 'user@example.com')

const isCollapsed = ref(false)
const isMobileOpen = ref(false)

const navItems = computed(() => [
  { label: '宮廟總覽',     path: `/${templeId.value}/dashboard` },
  { label: '宮廟資料管理', path: `/${templeId.value}/temple-info` },
  { label: '最新消息管理', path: `/${templeId.value}/news` },
  { label: '活動與上架管理', path: `/${templeId.value}/activity-management` },
  { label: '集影繪管理',   path: `/${templeId.value}/gallery` },
  { label: '靈籤司管理',   path: `/${templeId.value}/divination` },
  { label: '印刷管理',     path: `/${templeId.value}/print` },
  { label: '訂單管理',     path: `/${templeId.value}/orders` },
  { label: '香客資料管理', path: `/${templeId.value}/customers` },
  { label: '數位光明燈管理', path: `/${templeId.value}/lanterns` },
  { label: '方案與帳單',   path: `/${templeId.value}/billing` },
  { label: '廣告管理',     path: `/${templeId.value}/ads` },
  { label: '帳號管理',     path: `/${templeId.value}/account-management` },
])

const isActive = (path) => route.path === path

const handleLogout = async () => {
  if (confirm('確定要登出嗎？')) {
    await authStore.logout()
    router.push('/')
  }
}

const goToFrontend = () => {
  router.push('/')
}

const navigate = (path) => {
  router.push(path)
  isMobileOpen.value = false
}
</script>

<template>
  <div class="temple-layout" :class="{ 'sidebar-collapsed': isCollapsed }">

    <!-- 手機版遮罩 -->
    <div
      v-if="isMobileOpen"
      class="mobile-overlay"
      @click="isMobileOpen = false"
    />

    <!-- 左側導覽列 -->
    <aside class="sidebar" :class="{ 'mobile-open': isMobileOpen }">

      <!-- 收合切換按鈕（桌面） -->
      <button class="collapse-toggle" @click="isCollapsed = !isCollapsed" :title="isCollapsed ? '展開' : '收合'">
        <svg viewBox="0 0 20 20" fill="currentColor" class="toggle-icon" :class="{ rotated: isCollapsed }">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- 使用者資訊 -->
      <div class="user-info">
        <div class="user-avatar">{{ userName.charAt(0) }}</div>
        <div class="user-text">
          <p class="user-label">使用者</p>
          <p class="user-email">{{ userEmail }}</p>
        </div>
      </div>

      <!-- 導覽選單 -->
      <nav class="sidebar-nav">
        <button
          v-for="item in navItems"
          :key="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
          @click="navigate(item.path)"
          :title="isCollapsed ? item.label : ''"
        >
          <span class="nav-dot" />
          <span class="nav-label">{{ item.label }}</span>
        </button>
      </nav>

      <!-- 底部按鈕 -->
      <div class="sidebar-footer">
        <button class="btn-frontend" @click="goToFrontend" :title="isCollapsed ? '返回前台' : ''">
          <svg viewBox="0 0 20 20" fill="currentColor" class="btn-icon">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span class="btn-label">返回前台</span>
        </button>
        <button class="btn-logout" @click="handleLogout" :title="isCollapsed ? '登出' : ''">
          <svg viewBox="0 0 20 20" fill="currentColor" class="btn-icon">
            <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
          </svg>
          <span class="btn-label">登出</span>
        </button>
      </div>
    </aside>

    <!-- 主要內容區 -->
    <main class="main-content">
      <!-- 手機版漢堡選單按鈕 -->
      <button class="mobile-menu-btn" @click="isMobileOpen = true">
        <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
          <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
        </svg>
      </button>

      <router-view />
    </main>
  </div>
</template>

<style scoped lang="scss">
.temple-layout {
  display: flex;
  min-height: calc(100vh - 64px);
  background: #f3f4f6;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
}

// ========== 遮罩 ==========
.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 199;
}

// ========== 側邊欄 ==========
.sidebar {
  width: 250px;
  flex-shrink: 0;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 0.25s ease;
  z-index: 200;
}

// ========== 收合切換按鈕 ==========
.collapse-toggle {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 6px 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  border-bottom: 1px solid #f3f4f6;
  transition: color 0.15s;
  flex-shrink: 0;

  &:hover { color: #374151; }
}

.toggle-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.25s ease;

  &.rotated { transform: rotate(180deg); }
}

// ========== 使用者資訊 ==========
.user-info {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  min-width: 0;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #E8572A;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-text {
  min-width: 0;
  overflow: hidden;
  transition: opacity 0.2s, width 0.2s;
}

.user-label {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 2px 0;
  white-space: nowrap;
}

.user-email {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// ========== 導覽選單 ==========
.sidebar-nav {
  flex: 1;
  padding: 6px 0;
  overflow-y: auto;
}

.nav-item {
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
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  transition: background-color 0.15s;
  line-height: 1.4;
  white-space: nowrap;

  &:hover { background-color: #f9fafb; }

  &.active {
    background-color: #E8572A;
    color: #ffffff;
    font-weight: 500;
  }
}

.nav-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
  opacity: 0.5;

  .active & { opacity: 1; }
}

.nav-label {
  transition: opacity 0.2s;
}

// ========== 底部按鈕 ==========
.sidebar-footer {
  padding: 12px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.btn-frontend {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: 1.5px solid #E8572A;
  border-radius: 20px;
  color: #E8572A;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Microsoft YaHei', '微軒正黑體', sans-serif;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;

  &:hover { background: #fff7f3; }
}

.btn-logout {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
  font-family: 'Microsoft YaHei', '微軒正黑體', sans-serif;
  transition: color 0.2s;
  white-space: nowrap;
  overflow: hidden;

  &:hover { color: #374151; }
}

.btn-icon {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

.btn-label {
  transition: opacity 0.2s;
}

// ========== 收合狀態 ==========
.sidebar-collapsed .sidebar {
  width: 48px;

  .user-text,
  .nav-label,
  .btn-label { opacity: 0; width: 0; overflow: hidden; }

  .collapse-toggle { justify-content: center; }

  .user-info { justify-content: center; padding: 12px 8px; }

  .nav-item { justify-content: center; padding: 10px 0; }

  .sidebar-footer { padding: 12px 6px; }

  .btn-frontend,
  .btn-logout { padding: 8px 0; justify-content: center; border-radius: 8px; }
}

// ========== 手機漢堡按鈕 ==========
.mobile-menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin: 12px 16px 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  color: #374151;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover { background: #f9fafb; }
}

// ========== 主要內容 ==========
.main-content {
  flex: 1;
  overflow: auto;
  min-width: 0;
}

// ========== RWD ==========
@media (max-width: 768px) {
  .mobile-overlay { display: block; }

  .mobile-menu-btn { display: flex; }

  .sidebar {
    position: fixed;
    top: 64px;
    left: 0;
    height: calc(100vh - 64px);
    transform: translateX(-100%);
    transition: transform 0.25s ease, width 0.25s ease;
    width: 250px !important; // 手機版固定寬度，不受收合影響

    &.mobile-open { transform: translateX(0); }

    // 手機版強制展開顯示文字
    .user-text,
    .nav-label,
    .btn-label { opacity: 1 !important; width: auto !important; overflow: visible !important; }

    .collapse-toggle { display: none; }
    .user-info { justify-content: flex-start !important; padding: 12px 16px !important; }
    .nav-item { justify-content: flex-start !important; padding: 10px 16px !important; }
    .btn-frontend, .btn-logout { padding: 8px 12px !important; }
  }

  .sidebar-collapsed .sidebar {
    // 手機版不套用收合樣式
    .nav-item { justify-content: flex-start; padding: 10px 16px; }
  }
}
</style>

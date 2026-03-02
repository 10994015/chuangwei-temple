<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const templeId = computed(() => route.params.templeId)

const userName = computed(() => authStore.user?.name || '使用者')
const userEmail = computed(() => authStore.user?.email || 'user@example.com')

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
</script>

<template>
  <div class="temple-layout">
    <!-- 左側導覽列 -->
    <aside class="sidebar">
      <!-- 使用者資訊 -->
      <div class="user-info">
        <p class="user-label">使用者</p>
        <p class="user-email">{{ userEmail }}</p>
      </div>

      <!-- 導覽選單 -->
      <nav class="sidebar-nav">
        <button
          v-for="item in navItems"
          :key="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
          @click="router.push(item.path)"
        >
          {{ item.label }}
        </button>
      </nav>

      <!-- 底部按鈕 -->
      <div class="sidebar-footer">
        <button class="btn-frontend" @click="goToFrontend">
          <svg viewBox="0 0 20 20" fill="currentColor" class="btn-icon">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          返回前台
        </button>
        <button class="btn-logout" @click="handleLogout">
          <svg viewBox="0 0 20 20" fill="currentColor" class="btn-icon">
            <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
          </svg>
          登出
        </button>
      </div>
    </aside>

    <!-- 主要內容區 -->
    <main class="main-content">
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
}

.user-info {
  padding: 16px 16px 12px;
  border-bottom: 1px solid #f3f4f6;
}

.user-label {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 2px 0;
}

.user-email {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

.sidebar-nav {
  flex: 1;
  padding: 6px 0;
}

.nav-item {
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
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  transition: background-color 0.15s;
  line-height: 1.4;

  &:hover {
    background-color: #f9fafb;
  }

  &.active {
    background-color: #E8572A;
    color: #ffffff;
    font-weight: 500;
  }
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  transition: all 0.2s;

  &:hover {
    background: #fff7f3;
  }
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
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  transition: color 0.2s;

  &:hover { color: #374151; }
}

.btn-icon {
  width: 15px;
  height: 15px;
}

// ========== 主要內容 ==========
.main-content {
  flex: 1;
  overflow: auto;
  min-width: 0;
}
</style>
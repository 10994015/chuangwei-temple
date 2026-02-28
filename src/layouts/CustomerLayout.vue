<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const userName = computed(() => authStore.user?.name || '使用者')
const userEmail = computed(() => authStore.user?.email || 'user@example.com')

const navItems = [
  { label: '會員資料', path: '/customer-account', icon: 'user' },
  { label: '相片管理', path: '/customer-account/photos', icon: 'photo' },
  { label: '求籤紀錄', path: '/customer-account/divination', icon: 'book' },
  { label: '訂單紀錄', path: '/customer-account/orders', icon: 'cart' },
  { label: '打卡', path: '/customer-account/checkin', icon: 'pin' },
  { label: '我的最愛宮廟', path: '/customer-account/favorites', icon: 'heart' },
  { label: '購物車', path: '/customer-account/cart', icon: 'shopping' },
]

const isActive = (path) => route.path === path

const handleLogout = async () => {
  if (confirm('確定要登出嗎？')) {
    await authStore.logout()
    router.push('/')
  }
}
</script>

<template>
  <div class="customer-layout">
    <!-- 左側導覽列 -->
    <aside class="sidebar">
      <!-- 使用者資訊 -->
      <div class="user-info">
        <p class="user-name">{{ userName }}</p>
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
          <!-- user icon -->
          <svg v-if="item.icon === 'user'" class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
          <!-- photo icon -->
          <svg v-else-if="item.icon === 'photo'" class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
          </svg>
          <!-- book icon -->
          <svg v-else-if="item.icon === 'book'" class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
          <!-- cart icon -->
          <svg v-else-if="item.icon === 'cart'" class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
          <!-- pin icon -->
          <svg v-else-if="item.icon === 'pin'" class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
          <!-- heart icon -->
          <svg v-else-if="item.icon === 'heart'" class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
          </svg>
          <!-- shopping icon -->
          <svg v-else-if="item.icon === 'shopping'" class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
          </svg>

          {{ item.label }}
        </button>
      </nav>

      <!-- 登出按鈕 -->
      <div class="sidebar-footer">
        <button class="logout-btn" @click="handleLogout">
          <svg viewBox="0 0 20 20" fill="currentColor" class="logout-icon">
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
.customer-layout {
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
}

.user-info {
  padding: 20px 16px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.user-email {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

.sidebar-nav {
  flex: 1;
  padding: 8px 0;
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
  transition: background-color 0.2s;
  border-radius: 0;

  &:hover {
    background-color: #f9fafb;
  }

  &.active {
    background-color: #E8572A;
    color: #ffffff;
    font-weight: 500;

    .nav-icon {
      color: #ffffff;
    }
  }
}

.nav-icon {
  width: 18px;
  height: 18px;
  color: #6b7280;
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid #f3f4f6;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  transition: color 0.2s;

  &:hover {
    color: #374151;
  }
}

.logout-icon {
  width: 16px;
  height: 16px;
}

// ========== 主要內容 ==========
.main-content {
  flex: 1;
  overflow: auto;
}

@media (max-width: 768px) {
  .sidebar {
    width: 160px;
  }
}
</style>
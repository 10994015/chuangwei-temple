<script setup>
import { ref, computed } from 'vue'

// 模擬用戶登入狀態
const isLoggedIn = ref(false)
const userInfo = ref({
  username: '使用者名稱',
  email: 'user@example.com'
})

// 登入/登出處理
const handleLogin = () => {
  // 這裡應該連接到你的登入邏輯
  isLoggedIn.value = true
  console.log('執行登入')
}

const handleLogout = () => {
  // 這裡應該連接到你的登出邏輯
  isLoggedIn.value = false
  console.log('執行登出')
}

// 顯示帳號資訊
const showAccountInfo = ref(false)

const toggleAccountInfo = () => {
  showAccountInfo.value = !showAccountInfo.value
}
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo 和標題 -->
      <div class="logo-section">
        <div class="logo">
          <span class="logo-icon">宮</span>
        </div>
        <h1 class="title">宮掌權 形象網站編輯器</h1>
      </div>

      <!-- 右側按鈕區 -->
      <div class="actions-section">
        <template v-if="!isLoggedIn">
          <button class="btn btn-secondary" @click="handleLogin">登入</button>
        </template>
        
        <template v-else>
          <div class="user-menu">
            <button class="btn btn-account" @click="toggleAccountInfo">
              <span class="user-icon">👤</span>
              <span>{{ userInfo.username }}</span>
              <span class="dropdown-arrow">▼</span>
            </button>
            
            <!-- 下拉選單 -->
            <div v-if="showAccountInfo" class="dropdown-menu">
              <div class="user-info">
                <p class="user-name">{{ userInfo.username }}</p>
                <p class="user-email">{{ userInfo.email }}</p>
              </div>
              <div class="menu-divider"></div>
              <button class="menu-item" @click="handleLogout">
                <span>登出</span>
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-header {
    width: 100%;
  background-color: #fff;
  border-bottom: 2px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  width: 100%;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  background-color: #d32f2f;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo-icon {
  color: #fff;
  font-size: 28px;
  font-weight: bold;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
}

.actions-section {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;

  &:hover {
    background-color: #e8e8e8;
  }
}

.user-menu {
  position: relative;
}

.btn-account {
  background-color: #fff;
  color: #333;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;

  &:hover {
    background-color: #f8f8f8;
  }
}

.user-icon {
  font-size: 18px;
}

.dropdown-arrow {
  font-size: 10px;
  margin-left: 4px;
  transition: transform 0.3s ease;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1001;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-info {
  padding: 16px;
}

.user-name {
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  font-size: 14px;
}

.user-email {
  color: #666;
  margin: 0;
  font-size: 12px;
}

.menu-divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 8px 0;
}

.menu-item {
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background-color 0.2s ease;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;

  &:hover {
    background-color: #f5f5f5;
  }

  &:active {
    background-color: #e8e8e8;
  }
}

// 響應式設計
@media (max-width: 768px) {
  .header-container {
    padding: 12px 16px;
  }

  .title {
    font-size: 16px;
  }

  .logo {
    width: 40px;
    height: 40px;
  }

  .logo-icon {
    font-size: 24px;
  }

  .btn {
    padding: 6px 16px;
    font-size: 13px;
  }
}
</style>
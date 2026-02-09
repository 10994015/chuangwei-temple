<template>
  <header class="navbar" :class="{ 'edit-mode': isEditMode }">
    <div class="navbar-container">
      <!-- Logo 區域 - 可點擊編輯 -->
      <div 
        class="logo-wrapper"
        :class="{ 
          'selected': isLogoSelected,
          'clickable': isEditMode
        }"
        @click.stop="handleSelectLogo"
      >
        <div class="logo">
          <img 
            v-if="logoSrc" 
            :src="logoSrc" 
            alt="Logo"
            class="logo-image"
          />
          <span v-else class="logo-placeholder">{{ templeName || 'LOGO' }}</span>
        </div>
        
        <!-- 編輯模式下顯示刪除按鈕 -->
        <button
          v-if="isEditMode && logoSrc"
          class="delete-logo-btn"
          @click.stop="handleDeleteLogo"
          title="刪除 Logo"
        >
          ✕
        </button>
      </div>

      <!-- 導航選單 - 使用 tabs 數據 -->
      <nav class="nav-menu">
        <a 
          v-for="tab in tabs" 
          :key="tab.slug"
          href="#" 
          class="nav-item"
          :class="{ 'active': tab.slug === currentPageSlug }"
          @click.prevent="handleTabClick(tab)"
        >
          {{ tab.name }}
        </a>
      </nav>

      <!-- 右側操作區 -->
      <div class="nav-actions">
        <button class="cart-btn" :class="{ 'disabled': isEditMode }">🛒</button>
        <button class="login-btn" :class="{ 'disabled': isEditMode }">會員登入</button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 框架數據
  frameData: {
    type: Object,
    default: () => ({})
  },
  // 是否為編輯模式
  isEditMode: {
    type: Boolean,
    default: true
  },
  // Logo 是否被選中
  isLogoSelected: {
    type: Boolean,
    default: false
  },
  // 當前頁面 slug
  currentPageSlug: {
    type: String,
    default: null
  },
  // 完整的 frame 對象（用於傳遞給父組件）
  frame: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'select-logo', 
  'update-logo', 
  'delete-logo', 
  'change-page'
])

// Logo 圖片來源（從 API 數據）
const logoSrc = computed(() => {
  return props.frameData.logo_img_src || null
})

// 宮廟名稱
const templeName = computed(() => {
  return props.frameData.temple_name || 'LOGO'
})

// 選單項目（從 API 的 tabs 數據）
const tabs = computed(() => {
  return props.frameData.tabs || []
})

// 選擇 Logo
const handleSelectLogo = () => {
  // 只有在編輯模式下才能選擇 Logo
  if (props.isEditMode) {
    emit('select-logo', {
      type: 'logo',
      data: {
        src: logoSrc.value,
        id: props.frameData.logo_img_id
      },
      frame: props.frame
    })
  }
}

// 刪除 Logo
const handleDeleteLogo = () => {
  if (confirm('確定要刪除 Logo 嗎？')) {
    emit('delete-logo', {
      frame: props.frame
    })
  }
}

// ✅ 點擊選單項目切換頁面
const handleTabClick = (tab) => {
  console.log('🔄 NavbarBasemap: 切換頁面:', tab.slug, '| 編輯模式:', props.isEditMode)
  
  // ✅ 不管是編輯模式還是預覽模式，都發送切換頁面事件
  emit('change-page', tab.slug)
}
</script>

<style lang="scss" scoped>
.navbar {
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 100;

  .navbar-container {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
  }

  // Logo 區域
  .logo-wrapper {
    position: relative;
    border: 2px solid transparent;
    border-radius: 4px;
    transition: all 0.2s;
    padding: 4px;
    
    // ✅ 只有在編輯模式下才顯示可點擊樣式
    &.clickable {
      cursor: pointer;
      
      &:hover {
        border-color: #E8572A;
        background: #fff5f2;
      }

      &.selected {
        border-color: #E8572A;
        box-shadow: 0 0 0 3px rgba(232, 87, 42, 0.1);
      }
    }
  }

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 100px;
    min-height: 50px;
  }

  .logo-image {
    max-width: 150px;
    max-height: 50px;
    width: auto;
    height: auto;
    object-fit: contain;
  }

  .logo-placeholder {
    background: #f5f5f5;
    padding: 0.5rem 1.5rem;
    border-radius: 4px;
    font-weight: 500;
    color: #999;
  }

  .delete-logo-btn {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    border: none;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 50%;
    font-size: 14px;
    font-weight: bold;
    color: #666;
    cursor: pointer;
    opacity: 0;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 10;

    &:hover {
      background: #dc3545;
      color: #fff;
      transform: scale(1.1);
    }
  }

  .logo-wrapper:hover .delete-logo-btn {
    opacity: 1;
  }

  // 導航選單
  .nav-menu {
    display: flex;
    gap: 2rem;
    flex: 1;
    justify-content: center;
  }

  .nav-item {
    color: #666;
    text-decoration: none;
    font-size: 15px;
    transition: all 0.3s;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    position: relative;
    pointer-events: auto;  // ✅ 永遠可以點擊

    &:hover {
      color: #E8572A;
      background: #fff5f2;
    }

    &.active {
      color: #E8572A;
      font-weight: 600;
      
      &::after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 60%;
        height: 3px;
        background: #E8572A;
        border-radius: 2px;
      }
    }
  }

  // 右側操作
  .nav-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .cart-btn,
  .login-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: #666;
    transition: all 0.3s;
    
    &:hover:not(.disabled) {
      color: #8b6f47;
    }
    
    // ✅ 禁用狀態樣式
    &.disabled {
      pointer-events: none;
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .login-btn {
    padding: 0.5rem 1rem;
  }

  // 編輯模式樣式
  &.edit-mode {
    // 選單項目在編輯模式下可以點擊（用於切換頁面）
    .nav-item {
      pointer-events: auto;
      opacity: 1;
    }
  }
  
  // ✅ 預覽模式樣式（非編輯模式）
  &:not(.edit-mode) {
    // 選單項目在預覽模式下也可以點擊（用於切換頁面）
    .nav-item {
      pointer-events: auto;
      opacity: 1;
    }
    
    // 右側按鈕在預覽模式下可以點擊（但暫時無功能）
    .cart-btn,
    .login-btn {
      pointer-events: auto;
      opacity: 1;
      cursor: pointer;
    }
  }
}
</style>
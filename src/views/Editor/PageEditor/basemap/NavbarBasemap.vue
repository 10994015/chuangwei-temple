<template>
  <header class="navbar" :class="{ 'edit-mode': isEditMode }">
    <div class="navbar-container">
      <!-- Logo 區域 -->
      <div 
        class="logo-wrapper"
        :class="{ selected: isLogoSelected, clickable: isEditMode }"
        @click.stop="isEditMode ? handleSelectLogo() : emit('change-page', 'home')"
      >
        <div class="logo">
          <img v-if="logoSrc" :src="logoSrc" alt="Logo" class="logo-image" />
          <span class="logo-name">{{ tenantName }}</span>
        </div>

        <button
          v-if="isEditMode && logoSrc"
          class="delete-logo-btn"
          @click.stop="handleDeleteLogo"
          :title="t('navbarBasemap.deleteLogo')"
        >✕</button>
      </div>
      <!-- ✅ 桌機導航：device === 'desktop' 才顯示 -->
      <nav v-if="isDesktop" class="nav-menu">
        <a 
          v-for="tab in tabs" :key="tab.slug"
          href="#" class="nav-item"
          :class="{ active: tab.slug === currentPageSlug }"
          @click.prevent="handleTabClick(tab)"
        >{{ tab.name }}</a>
      </nav>

      <!-- ✅ 桌機右側操作：device === 'desktop' 才顯示 -->
      <div v-if="isDesktop" class="nav-actions">
        <button class="cart-btn" :class="{ disabled: isEditMode }">🛒</button>
        <button class="login-btn" :class="{ disabled: isEditMode }">{{ t('navbarBasemap.login') }}</button>
      </div>

      <!-- ✅ 漢堡按鈕：非桌機才顯示 -->
      <button 
        v-if="!isDesktop"
        class="hamburger-btn"
        :class="{ 'is-open': mobileMenuOpen }"
        @click.stop="toggleMobileMenu"
        :aria-label="t('navbarBasemap.openMenu')"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </div>

    <!-- ✅ 行動版下拉選單：非桌機才掛載 -->
    <template v-if="!isDesktop">
      <transition name="mobile-menu">
        <div v-if="mobileMenuOpen" class="mobile-menu" @click.stop>
          <nav class="mobile-nav">
            <a 
              v-for="tab in tabs" :key="tab.slug"
              href="#" class="mobile-nav-item"
              :class="{ active: tab.slug === currentPageSlug }"
              @click.prevent="handleMobileTabClick(tab)"
            >
              <span class="mobile-nav-text">{{ tab.name }}</span>
              <svg class="mobile-nav-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </a>
          </nav>

          <div class="mobile-actions">
            <button class="mobile-cart-btn" :class="{ disabled: isEditMode }">{{ t('navbarBasemap.cart') }}</button>
            <button class="mobile-login-btn" :class="{ disabled: isEditMode }">{{ t('navbarBasemap.login') }}</button>
          </div>
        </div>
      </transition>

      <!-- 遮罩 -->
      <transition name="overlay-fade">
        <div v-if="mobileMenuOpen" class="menu-overlay" @click="closeMobileMenu"></div>
      </transition>
    </template>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps({
  frameData:       { type: Object,  default: () => ({}) },
  isEditMode:      { type: Boolean, default: true },
  isLogoSelected:  { type: Boolean, default: false },
  currentPageSlug: { type: String,  default: null },
  frame:           { type: Object,  default: null },
  // ✅ 接收裝置類型：'desktop' | 'tablet' | 'mobile'
  device:          { type: String,  default: 'desktop' }
})

const emit = defineEmits(['select-logo', 'update-logo', 'delete-logo', 'change-page'])

// ==================== 裝置判斷 ====================
const isDesktop = computed(() => props.device === 'desktop')

// ==================== 行動選單狀態 ====================
const mobileMenuOpen = ref(false)

const toggleMobileMenu  = () => { mobileMenuOpen.value = !mobileMenuOpen.value }
const closeMobileMenu   = () => { mobileMenuOpen.value = false }

// ==================== Computed ====================
// ✅ 兼容 logoImgUrl（編輯器存的）和 logoImgSrc（API 回傳的）
const logoSrc = computed(() =>
  props.frameData.logoImgSrc || props.frameData.logoImgSrc || null
)

// ✅ 兼容 temple_name（編輯器存的舊格式）和 tenantName（API 回傳）
const tenantName = computed(() =>
  props.frameData.tenantName || props.frameData.temple_name || 'LOGO'
)

// ✅ 兼容 tab（編輯器存的）和 tabs（API 回傳的）
const tabs = computed(() =>
  props.frameData.tab || props.frameData.tabs || []
)
console.log('tabs:', props.frameData.tab, props.frameData.tabs)

// ==================== 事件處理 ====================
const handleSelectLogo = () => {
  if (props.isEditMode) {
    emit('select-logo', {
      type: 'logo',
      data: { src: logoSrc.value, id: props.frameData.logoImgId },
      frame: props.frame
    })
  }
}

const handleDeleteLogo = () => {
  if (confirm(t('navbarBasemap.confirmDeleteLogo'))) {
    emit('delete-logo', { frame: props.frame })
  }
}

const handleTabClick = (tab) => emit('change-page', tab.slug)

const handleMobileTabClick = (tab) => {
  closeMobileMenu()
  emit('change-page', tab.slug)
}
</script>

<style lang="scss" scoped>
.navbar {
  background: transparent;
  border-bottom: 1px solid #e5e5e5;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 200;

  .navbar-container {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
    position: relative;
  }

  // ==================== Logo ====================
  .logo-wrapper {
    position: relative;
    border: 2px solid transparent;
    border-radius: 4px;
    transition: all 0.2s;
    padding: 4px;
    flex-shrink: 0;
     &:not(.clickable) {
      cursor: pointer;  // 預覽模式也可點
    }
    &.clickable {
      cursor: pointer;
      &:hover { border-color: #E8572A; background: #fff5f2; }
      &.selected { border-color: #E8572A; box-shadow: 0 0 0 3px rgba(232,87,42,0.1); }
    }
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 80px;
    min-height: 44px;
  }

  .logo-image {
    max-width: 140px;
    max-height: 44px;
    width: auto; height: auto;
    object-fit: contain;
    flex-shrink: 0;
  }

  .logo-name {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    white-space: nowrap;
  }

  .delete-logo-btn {
    position: absolute;
    top: -8px; right: -8px;
    width: 24px; height: 24px;
    border: none;
    background: rgba(255,255,255,0.95);
    border-radius: 50%;
    font-size: 14px; font-weight: bold;
    color: #666; cursor: pointer;
    opacity: 0; transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 10;
    &:hover { background: #dc3545; color: #fff; transform: scale(1.1); }
  }
  .logo-wrapper:hover .delete-logo-btn { opacity: 1; }

  // ==================== 桌機導航 ====================
  .nav-menu {
    display: flex;
    gap: 1rem;
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
    pointer-events: auto;

    &:hover { color: #E8572A; background: #fff5f2; }
    &.active {
      color: #E8572A; font-weight: 600;
      &::after {
        content: '';
        position: absolute;
        bottom: -10px; left: 50%;
        transform: translateX(-50%);
        width: 60%; height: 3px;
        background: #E8572A; border-radius: 2px;
      }
    }
  }

  // ==================== 桌機右側 ====================
  .nav-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-shrink: 0;
  }

  .cart-btn, .login-btn {
    background: none; border: none;
    cursor: pointer; font-size: 14px; color: #666;
    transition: all 0.3s;
    &:hover:not(.disabled) { color: #E8572A; }
    &.disabled { pointer-events: none; opacity: 0.6; cursor: not-allowed; }
  }
  .login-btn { padding: 0.5rem 1rem; }

  // ==================== 漢堡按鈕 ====================
  .hamburger-btn {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
    width: 40px; height: 40px;
    padding: 8px;
    background: none; border: none; border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
    flex-shrink: 0;

    &:hover { background: #f5f5f5; }

    &.is-open {
      .hamburger-line:nth-child(1) { transform: translateY(7px) rotate(45deg); }
      .hamburger-line:nth-child(2) { opacity: 0; transform: scaleX(0); }
      .hamburger-line:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
    }
  }

  .hamburger-line {
    display: block;
    width: 22px; height: 2px;
    background: #333; border-radius: 2px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: center;
  }

  // ==================== 行動版下拉選單 ====================
  .mobile-menu {
    position: absolute;
    top: 70px; left: 0; right: 0;
    width: 100%;
    background: #fff;
    border-top: 1px solid #f0f0f0;
    border-bottom: 1px solid #e5e5e5;
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    z-index: 300;
    overflow: hidden;
    box-sizing: border-box;
  }

  .mobile-nav { padding: 8px 0; }

  .mobile-nav-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 24px;
    color: #444;
    text-decoration: none;
    font-size: 15px; font-weight: 500;
    border-left: 3px solid transparent;
    transition: all 0.18s ease;
    cursor: pointer;

    &:hover { color: #E8572A; background: #fff8f6; border-left-color: #E8572A; }
    &.active { color: #E8572A; background: #fff8f6; border-left-color: #E8572A; font-weight: 600; }
  }

  .mobile-nav-text { flex: 1; }

  .mobile-nav-arrow {
    flex-shrink: 0; opacity: 0.4;
    transition: opacity 0.18s, transform 0.18s;
  }
  .mobile-nav-item:hover .mobile-nav-arrow,
  .mobile-nav-item.active .mobile-nav-arrow {
    opacity: 1; transform: translateX(2px); stroke: #E8572A;
  }

  .mobile-actions {
    display: flex; gap: 12px;
    padding: 14px 24px 20px;
    border-top: 1px solid #f0f0f0;
  }

  .mobile-cart-btn, .mobile-login-btn {
    flex: 1; padding: 10px 16px;
    font-size: 14px; font-weight: 500;
    border-radius: 8px; cursor: pointer; transition: all 0.2s;
    &.disabled { pointer-events: none; opacity: 0.5; }
  }

  .mobile-cart-btn {
    background: #f5f5f5; border: 1px solid #e5e5e5; color: #555;
    &:hover:not(.disabled) { background: #eee; }
  }
  .mobile-login-btn {
    background: #E8572A; border: 1px solid #E8572A; color: #fff;
    &:hover:not(.disabled) { background: #d14a1f; }
  }

  // ==================== 遮罩 ====================
  .menu-overlay {
    position: fixed;
    inset: 0; top: 70px;
    background: rgba(0,0,0,0.2);
    z-index: 150;
  }

  &:not(.edit-mode) {
    .nav-item, .cart-btn, .login-btn { pointer-events: auto; opacity: 1; cursor: pointer; }
  }
}

// ==================== 下拉動畫 ====================
.mobile-menu-enter-active { transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1); }
.mobile-menu-leave-active { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.mobile-menu-enter-from   { opacity: 0; transform: translateY(-12px); }
.mobile-menu-leave-to     { opacity: 0; transform: translateY(-8px); }

.overlay-fade-enter-active, .overlay-fade-leave-active { transition: opacity 0.2s; }
.overlay-fade-enter-from, .overlay-fade-leave-to { opacity: 0; }
</style>
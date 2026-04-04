<template>
  <header class="pv-navbar" :class="{ 'edit-mode': isEditMode }">
    <div class="pv-navbar-container">

      <!-- Logo 區域 -->
      <div
        class="pv-logo-wrapper"
        :class="{ selected: isLogoSelected, clickable: isEditMode }"
        @click.stop="isEditMode ? handleSelectLogo() : emit('change-page', 'home')"
      >
        <div class="pv-logo">
          <img v-if="logoSrc" :src="logoSrc" alt="Logo" class="pv-logo-image" />
          <span v-else class="pv-logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="#E8572A"/>
              <text x="14" y="20" text-anchor="middle" font-size="14" fill="#fff" font-weight="bold">宮</text>
            </svg>
          </span>
        </div>

        <button
          v-if="isEditMode && logoSrc"
          class="pv-delete-logo-btn"
          @click.stop="handleDeleteLogo"
          title="刪除 Logo"
        >✕</button>
      </div>

      <!-- 桌機導航 -->
      <nav v-if="isDesktop" class="pv-nav-menu">
        <a
          v-for="tab in tabs"
          :key="tab.slug"
          href="#"
          class="pv-nav-item"
          :class="{ active: tab.slug === currentPageSlug }"
          @click.prevent="handleTabClick(tab)"
        >{{ tab.name }}</a>
      </nav>

      <!-- 桌機右側：登入/註冊 + 語言切換 -->
      <div v-if="isDesktop" class="pv-nav-actions">
        <button class="pv-login-btn" :class="{ disabled: isEditMode }">
          {{ t('navbarBasemap.login') }}
        </button>

        <div class="pv-locale-wrapper" @click.stop>
          <button class="pv-locale-btn" ref="localeBtnRef" @click="toggleLocaleMenu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span class="pv-locale-label">{{ currentLocaleLabel }}</span>
            <svg class="pv-chevron" :class="{ open: localeMenuOpen }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          <Teleport to="body">
            <transition name="locale-dropdown">
              <div v-if="localeMenuOpen" class="pv-locale-dropdown" :style="localeDropdownStyle" @click.stop>
                <button
                  v-for="loc in locales"
                  :key="loc.locale"
                  class="pv-locale-option"
                  :class="{ active: loc.locale === currentLocale }"
                  @click="handleLocaleChange(loc.locale)"
                >
                  {{ loc.label }}
                </button>
              </div>
            </transition>
          </Teleport>
        </div>
      </div>

      <!-- 漢堡按鈕：非桌機 -->
      <button
        v-if="!isDesktop"
        class="pv-hamburger-btn"
        :class="{ 'is-open': mobileMenuOpen }"
        @click.stop="toggleMobileMenu"
        aria-label="開啟選單"
      >
        <span class="pv-hamburger-line"></span>
        <span class="pv-hamburger-line"></span>
        <span class="pv-hamburger-line"></span>
      </button>
    </div>

    <!-- 行動版下拉選單 -->
    <template v-if="!isDesktop">
      <transition name="mobile-menu">
        <div v-if="mobileMenuOpen" class="pv-mobile-menu" @click.stop>
          <nav class="pv-mobile-nav">
            <a
              v-for="tab in tabs"
              :key="tab.slug"
              href="#"
              class="pv-mobile-nav-item"
              :class="{ active: tab.slug === currentPageSlug }"
              @click.prevent="handleMobileTabClick(tab)"
            >
              <span>{{ tab.name }}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </a>
          </nav>

          <div class="pv-mobile-actions">
            <button class="pv-mobile-login-btn" :class="{ disabled: isEditMode }">
              {{ t('navbarBasemap.login') }}
            </button>
            <div class="pv-mobile-locale">
              <button
                v-for="loc in locales"
                :key="loc.locale"
                class="pv-mobile-locale-btn"
                :class="{ active: loc.locale === currentLocale }"
                @click="handleLocaleChange(loc.locale)"
              >
                {{ loc.label }}
              </button>
            </div>
          </div>
        </div>
      </transition>

      <transition name="overlay-fade">
        <div v-if="mobileMenuOpen" class="pv-menu-overlay" @click="closeMobileMenu"></div>
      </transition>
    </template>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  frameData:       { type: Object,  default: () => ({}) },
  isEditMode:      { type: Boolean, default: true },
  isLogoSelected:  { type: Boolean, default: false },
  currentPageSlug: { type: String,  default: null },
  frame:           { type: Object,  default: null },
  device:          { type: String,  default: 'desktop' },
  locales:         { type: Array,   default: () => [] },
  currentLocale:   { type: String,  default: 'ZH-TW' },
})

const emit = defineEmits([
  'select-logo', 'update-logo', 'delete-logo', 'change-page', 'locale-change'
])

// 裝置判斷
const isDesktop = computed(() => props.device === 'desktop')

// 行動選單
const mobileMenuOpen = ref(false)
const toggleMobileMenu = () => { mobileMenuOpen.value = !mobileMenuOpen.value }
const closeMobileMenu  = () => { mobileMenuOpen.value = false }

// 語言選單
const localeMenuOpen = ref(false)
const localeBtnRef = ref(null)

const localeDropdownStyle = computed(() => {
  if (!localeBtnRef.value) return {}
  const rect = localeBtnRef.value.getBoundingClientRect()
  return {
    position: 'fixed',
    top: rect.bottom + 8 + 'px',
    right: window.innerWidth - rect.right + 'px',
    zIndex: 99999,
  }
})

const toggleLocaleMenu = () => { localeMenuOpen.value = !localeMenuOpen.value }

const handleLocaleChange = (locale) => {
  localeMenuOpen.value = false
  mobileMenuOpen.value = false
  emit('locale-change', locale)
}

// 點外部關閉語言下拉
const handleOutsideClick = (e) => {
  if (localeMenuOpen.value) localeMenuOpen.value = false
}
onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))

// Computed
const logoSrc = computed(() => props.frameData.logoImgSrc || null)

const tabs = computed(() =>
  (props.frameData.tabs || props.frameData.tab || []).filter(t => t.slug !== 'portal')
)

const currentLocaleLabel = computed(() => {
  if (!props.locales || props.locales.length === 0) {
    // 預設顯示
    const map = { 'ZH-TW': '繁中', 'ZH-CN': '简中', 'EN-US': 'EN' }
    return map[props.currentLocale] || props.currentLocale
  }
  const found = props.locales.find(l => l.locale === props.currentLocale)
  return found ? found.label : props.currentLocale
})

// 事件
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

const handleTabClick      = (tab) => emit('change-page', tab.slug)
const handleMobileTabClick = (tab) => { closeMobileMenu(); emit('change-page', tab.slug) }
</script>

<style lang="scss" scoped>
.pv-navbar {
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.pv-navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  position: relative;
}

// Logo
.pv-logo-wrapper {
  position: relative;
  border: 2px solid transparent;
  border-radius: 4px;
  transition: all 0.2s;
  padding: 4px;
  flex-shrink: 0;
  cursor: pointer;

  &.clickable:hover { border-color: #E8572A; background: #fff5f2; }
  &.clickable.selected { border-color: #E8572A; box-shadow: 0 0 0 3px rgba(232, 87, 42, 0.1); }
}

.pv-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 80px;
  min-height: 40px;
}

.pv-logo-image {
  max-width: 140px;
  max-height: 40px;
  width: auto;
  height: auto;
  object-fit: contain;
  flex-shrink: 0;
}

.pv-logo-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}


.pv-delete-logo-btn {
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

  &:hover { background: #dc3545; color: #fff; transform: scale(1.1); }
}

.pv-logo-wrapper:hover .pv-delete-logo-btn { opacity: 1; }

// 導航
.pv-nav-menu {
  display: flex;
  gap: 0.25rem;
  flex: 1;
  justify-content: center;
}

.pv-nav-item {
  color: #444;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;

  &:hover { color: #E8572A; }

  &.active {
    color: #E8572A;
    font-weight: 600;
  }
}

// 右側操作
.pv-nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.pv-login-btn {
  padding: 7px 20px;
  border: 1.5px solid #E8572A;
  border-radius: 20px;
  background: transparent;
  color: #E8572A;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover:not(.disabled) {
    background: #E8572A;
    color: #fff;
  }

  &.disabled {
    pointer-events: none;
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// 語言切換
.pv-locale-wrapper {
  position: relative;
}

.pv-locale-btn {
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
  transition: all 0.2s;
  white-space: nowrap;

  &:hover { border-color: #E8572A; color: #E8572A; }
}

.pv-locale-label {
  font-size: 13px;
}

.pv-chevron {
  transition: transform 0.2s;
  &.open { transform: rotate(180deg); }
}


// 漢堡
.pv-hamburger-btn {
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
  transition: background 0.2s;
  flex-shrink: 0;

  &:hover { background: #f5f5f5; }

  &.is-open {
    .pv-hamburger-line:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .pv-hamburger-line:nth-child(2) { opacity: 0; transform: scaleX(0); }
    .pv-hamburger-line:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
  }
}

.pv-hamburger-line {
  display: block;
  width: 22px;
  height: 2px;
  background: #333;
  border-radius: 2px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}

// 行動選單
.pv-mobile-menu {
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #e5e5e5;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  z-index: 300;
  overflow: hidden;
}

.pv-mobile-nav { padding: 8px 0; }

.pv-mobile-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  color: #444;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  border-left: 3px solid transparent;
  transition: all 0.18s;
  cursor: pointer;

  &:hover { color: #E8572A; background: #fff8f6; border-left-color: #E8572A; }
  &.active { color: #E8572A; background: #fff8f6; border-left-color: #E8572A; font-weight: 600; }
}

.pv-mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 24px 20px;
  border-top: 1px solid #f0f0f0;
}

.pv-mobile-login-btn {
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

  &:hover:not(.disabled) { background: #d14a1f; }
  &.disabled { opacity: 0.5; pointer-events: none; }
}

.pv-mobile-locale {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pv-mobile-locale-btn {
  padding: 7px 14px;
  border: 1.5px solid #ddd;
  border-radius: 16px;
  background: transparent;
  color: #555;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { border-color: #E8572A; color: #E8572A; }
  &.active { border-color: #E8572A; color: #E8572A; background: #fff5f2; font-weight: 600; }
}

.pv-menu-overlay {
  position: fixed;
  inset: 0;
  top: 64px;
  background: rgba(0, 0, 0, 0.2);
  z-index: 150;
}

// 動畫
.mobile-menu-enter-active { transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1); }
.mobile-menu-leave-active { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.mobile-menu-enter-from   { opacity: 0; transform: translateY(-12px); }
.mobile-menu-leave-to     { opacity: 0; transform: translateY(-8px); }

.locale-dropdown-enter-active { transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1); }
.locale-dropdown-leave-active { transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1); }
.locale-dropdown-enter-from   { opacity: 0; transform: translateY(-6px); }
.locale-dropdown-leave-to     { opacity: 0; transform: translateY(-4px); }

.overlay-fade-enter-active, .overlay-fade-leave-active { transition: opacity 0.2s; }
.overlay-fade-enter-from, .overlay-fade-leave-to { opacity: 0; }
</style>
<template>
  <div
    class="system-frame-wrapper"
    :class="{ 'is-selected': isFrameSelected }"
    :data-frame-type="frameType"
  >
    <button
      v-if="isFrameSelected && frame?.isDeletable"
      class="delete-system-frame-btn"
      @click.stop="handleDeleteFrame"
      title="刪除框架"
    >
      ✕
    </button>

    <div
      class="system-frame-container"
      :data-frame-type="frameType"
      :style="frameTextStyle"
      :class="{ 'is-clickable': isClickableFrame }"
      @click="handleContainerClick"
    >
      <!-- 頁首 (HEADER) -->
      <NavbarBasemap
        v-if="frameType === 'HEADER'"
        :frame-data="frameData"
        :is-edit-mode="true"
        :is-logo-selected="isLogoSelected"
        :current-page-slug="currentPageSlug"
        :frame="frame"
        @select-logo="handleSelectLogo"
        @update-logo="handleUpdateLogo"
        @delete-logo="handleDeleteLogo"
        @change-page="handleChangePage"
      />

      <!-- 頁首 v2 (PV_HEADER) -->
      <PvNavbarBasemap
        v-else-if="frameType === 'PV_HEADER'"
        :frame-data="frameData"
        :frame="frame"
        :is-edit-mode="true"
        :is-logo-selected="isLogoSelected"
        :current-page-slug="currentPageSlug"
        :locales="locales"
        :current-locale="currentLocale"
        :device="device"
        @select-logo="handleSelectLogo"
        @update-logo="handleUpdateLogo"
        @delete-logo="handleDeleteLogo"
        @change-page="handleChangePage"
        @locale-change="emit('locale-change', $event)"
      />

      <!-- 頁尾 (FOOTER) -->
      <FooterBasemap
        v-else-if="frameType === 'FOOTER'"
        v-bind="frameData"
        :footer-bg-color="frame?.data?.footerBgColor"
        :footer-text-color="frame?.data?.footerTextColor"
      />

      <!-- 頁尾 v2 (PV_FOOTER) -->
      <PvFooterBasemap
        v-else-if="frameType === 'PV_FOOTER'"
        v-bind="frameData"
        :footer-bg-color="frame?.data?.footerBgColor"
        :footer-text-color="frame?.data?.footerTextColor"
        :device="device"
      />

      <!-- 輪播牆 (CAROUSEL_WALL) -->
      <div
        v-else-if="frameType === 'CAROUSEL_WALL'"
        class="carousel-wall-clickable"
        @click.stop="handleSelectFrame(frame)"
      >
        <HeroBasemap v-bind="frameData" :device="device" />
      </div>

      <!-- 輪播牆 v2 (PV_CAROUSEL_WALL) -->
      <div
        v-else-if="frameType === 'PV_CAROUSEL_WALL'"
        class="carousel-wall-clickable"
        @click.stop="handleSelectFrame(frame)"
      >
        <PvHeroBasemap v-bind="frameData" :device="device" />
      </div>

      <!-- 首圖 (FIRST_PICTURE) -->
      <HeroBannerElement
        v-else-if="frameType === 'FIRST_PICTURE'"
        :frame-data="frameData"
        :frame="frame"
        :is-selected="isFrameSelected"
        @select-frame="handleSelectFrame"
      />

      <!-- 首圖 Pv (PV_PORTAL_PICTURE) -->
      <PvFirstPictureBasemap
        v-else-if="frameType === 'PV_PORTAL_PICTURE'"
        :frame-data="frameData"
        :frame="frame"
        :is-selected="isFrameSelected"
        :selected-sub-section="isFrameSelected ? editorSubSection : null"
        @select-frame="handleSelectFrame"
        @select-sub-section="handleSelectSubSection"
      />

      <!-- 首頁-最新消息 (INDEX_NEWS) -->
      <NewsBasemap v-else-if="frameType === 'INDEX_NEWS'" v-bind="frameData" />

      <!-- 首頁-最新消息 v2 (PV_INDEX_NEWS) -->
      <PvNewsBasemap v-else-if="frameType === 'PV_INDEX_NEWS'" v-bind="frameData" :device="device" />

      <!-- 消息列表 (NEWS_LIST) -->
      <NewsListBasemap v-else-if="frameType === 'NEWS_LIST'" v-bind="frameData" />

      <!-- 消息列表 v2 (PV_NEWS_LIST) -->
      <PvNewsListBasemap v-else-if="frameType === 'PV_NEWS_LIST'" v-bind="frameData" :device="device" />

      <!-- 首頁-商品標幅 (INDEX_PRODUCT) -->
      <ProductsBasemap v-else-if="frameType === 'INDEX_PRODUCT'" v-bind="frameData" />

      <!-- 首頁-商品標幅 v2 (PV_INDEX_PRODUCT) -->
      <PvProductsBasemap v-else-if="frameType === 'PV_INDEX_PRODUCT'" v-bind="frameData" :device="device" />

      <!-- 首頁-活動橫幅 (INDEX_EVENT) -->
      <EventsBasemap v-else-if="frameType === 'INDEX_EVENT'" v-bind="frameData" />

      <!-- 首頁-服務 v2 (PV_INDEX_SERVICE) -->
      <PvServicesBasemap v-else-if="frameType === 'PV_INDEX_SERVICE'" v-bind="frameData" :device="device" />

      <!-- 首頁-捐獻區 (INDEX_DONATION) -->
      <DonationBasemap
        v-else-if="frameType === 'INDEX_DONATION'"
        v-bind="frameData"
        :is-edit-mode="true"
        :frame="frame"
        :selected-element="selectedElement"
        @select-element="handleSelectElement"
      />

      <!-- 商品列表 (PRODUCT_LIST) -->
      <ProductListBasemap v-else-if="frameType === 'PRODUCT_LIST'" v-bind="frameData" />

      <!-- 商品列表 v2 (PV_PRODUCT_LIST) -->
      <PvProductListBasemap v-else-if="frameType === 'PV_PRODUCT_LIST'" v-bind="frameData" :device="device" />

      <!-- 相簿列表 (ALBUM_LIST) -->
      <AlbumListBasemap v-else-if="frameType === 'ALBUM_LIST'" v-bind="frameData" />

      <!-- 活動列表 (EVENT_LIST) -->
      <EventListBasemap v-else-if="frameType === 'EVENT_LIST'" v-bind="frameData" />

      <!-- 捐款商品 (DONATION_PRODUCT) -->
      <DonationProductBasemap v-else-if="frameType === 'DONATION_PRODUCT'" v-bind="frameData" />

      <!-- 光明燈 (BRIGHT_LAMP) -->
      <BrightLampBasemap v-else-if="frameType === 'BRIGHT_LAMP'" v-bind="frameData" />

      <!-- 數位生態系統自訂框架 (PV_CUSTOM_FRAME1) -->
      <PvCustomFrame1Basemap
        v-else-if="frameType === 'PV_CUSTOM_FRAME1'"
        :items="frameData.items"
        :device="device"
        :is-edit-mode="true"
        :frame="frame"
        :selected-element="isFrameSelected ? selectedElement : null"
        @select-element="handleSelectElement"
        @select-frame="handleSelectFrame"
      />

      <!-- 未知類型 -->
      <div v-else class="unknown-frame">
        <p>未知系統框架類型: {{ frameType }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, ref } from 'vue'
import NavbarBasemap from './basemap/NavbarBasemap.vue'
import PvNavbarBasemap from './basemap/PvNavbarBasemap.vue'
import PvHeroBasemap from './basemap/PvHeroBasemap.vue'
import PvFirstPictureBasemap from './basemap/PvFirstPictureBasemap.vue'
import PvNewsBasemap from './basemap/PvNewsBasemap.vue'
import PvNewsListBasemap from './basemap/PvNewsListBasemap.vue'
import PvProductsBasemap from './basemap/PvProductsBasemap.vue'
import PvProductListBasemap from './basemap/PvProductListBasemap.vue'
import PvServicesBasemap from './basemap/PvServicesBasemap.vue'
import PvCustomFrame1Basemap from './basemap/PvCustomFrame1Basemap.vue'
import PvFooterBasemap from './basemap/PvFooterBasemap.vue'
import FooterBasemap from './basemap/FooterBasemap.vue'
import HeroBasemap from './basemap/HeroBasemap.vue'
import NewsBasemap from './basemap/NewsBasemap.vue'
import NewsListBasemap from './basemap/NewsListBasemap.vue'
import EventsBasemap from './basemap/EventsBasemap.vue'
import EventListBasemap from './basemap/EventListBasemap.vue'
import ProductsBasemap from './basemap/ProductsBasemap.vue'
import ProductListBasemap from './basemap/ProductListBasemap.vue'
import DonationBasemap from './basemap/DonationBasemap.vue'
import AboutBasemap from './basemap/AboutBasemap.vue'
import AlbumListBasemap from './basemap/AlbumListBasemap.vue'
import HeroBannerElement from './elements/HeroBannerElement.vue'
import DonationProductBasemap from './basemap/DonationProductBasemap.vue'
import BrightLampBasemap from './basemap/BrightLampBasemap.vue'

const props = defineProps({
  frameType:       { type: String, required: true },
  frameData:       { type: Object, default: () => ({}) },
  frame:           { type: Object, default: null },
  selectedElement: { type: Object, default: null },
  selectedFrame:   { type: Object, default: null },
  currentPageSlug: { type: String, default: null },
  locales:         { type: Array,  default: () => [] },
  currentLocale:   { type: String, default: 'ZH-TW' },
  device:          { type: String, default: 'desktop' },
})

const emit = defineEmits([
  'select-element',
  'update-element',
  'delete-element',
  'change-page',
  'select-frame',
  'delete-frame',
  'locale-change',
  'select-sub-section',
])

// 文字色主題 CSS 變數
const THEME_PRESETS = {
  light: {
    '--frame-text-color':     '#333333',
    '--frame-text-secondary': '#666666',
    '--frame-text-muted':     '#999999',
    '--frame-link-color':     '#8b6f47',
    '--frame-heading-color':  '#222222',
    '--frame-tag-bg':         'rgba(0,0,0,0.06)',
    '--frame-card-bg':        '#ffffff',
    '--frame-border-color':   '#e5e5e5',
  },
  dark: {
    '--frame-text-color':     '#f0f0f0',
    '--frame-text-secondary': 'rgba(255,255,255,0.72)',
    '--frame-text-muted':     'rgba(255,255,255,0.45)',
    '--frame-link-color':     '#f5d9b0',
    '--frame-heading-color':  '#ffffff',
    '--frame-tag-bg':         'rgba(255,255,255,0.15)',
    '--frame-card-bg':        'rgba(255,255,255,0.08)',
    '--frame-border-color':   'rgba(255,255,255,0.15)',
  },
  sepia: {
    '--frame-text-color':     '#4a3728',
    '--frame-text-secondary': '#7a6050',
    '--frame-text-muted':     '#a08878',
    '--frame-link-color':     '#8b4513',
    '--frame-heading-color':  '#3a2818',
    '--frame-tag-bg':         'rgba(139,111,71,0.12)',
    '--frame-card-bg':        '#fdf6ee',
    '--frame-border-color':   '#d4b896',
  },
}

const frameTextStyle = computed(() => {
  const theme = props.frame?.data?.textTheme
  const customColor = props.frame?.data?.textColor

  if (!theme || theme === 'light') return THEME_PRESETS.light
  if (theme === 'dark') return THEME_PRESETS.dark
  if (theme === 'sepia') return THEME_PRESETS.sepia

  if (theme === 'custom' && customColor) {
    const hex = customColor.replace('#', '')
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    const lum = (r * 299 + g * 587 + b * 114) / 1000
    const isDark = lum < 128
    return {
      '--frame-text-color':     customColor,
      '--frame-text-secondary': isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)',
      '--frame-text-muted':     isDark ? 'rgba(255,255,255,0.4)'  : 'rgba(0,0,0,0.38)',
      '--frame-link-color':     customColor,
      '--frame-heading-color':  customColor,
      '--frame-tag-bg':         isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.07)',
      '--frame-card-bg':        isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
      '--frame-border-color':   isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.1)',
    }
  }

  return THEME_PRESETS.light
})

const editorSubSection = inject('editorSubSection', ref(null))

const isLogoSelected  = computed(() => props.selectedElement?.type === 'logo')
const isFrameSelected = computed(() => props.selectedFrame === props.frame)

// PV_HEADER 跟 HEADER 一樣有自己的點擊邏輯，不需要容器層攔截
const SELF_HANDLED_TYPES = ['CAROUSEL_WALL', 'PV_CAROUSEL_WALL', 'FIRST_PICTURE', 'PV_PORTAL_PICTURE', 'HEADER', 'PV_HEADER', 'PV_CUSTOM_FRAME1']
const isClickableFrame = computed(() =>
  !SELF_HANDLED_TYPES.includes(props.frameType)
)

const handleContainerClick = () => {
  if (isClickableFrame.value) {
    emit('select-frame', props.frame)
  }
}

const handleSelectFrame = (frame) => {
  emit('select-frame', frame)
}

const handleSelectSubSection = (sub) => {
  emit('select-sub-section', sub)
}

const handleDeleteFrame = () => {
  if (confirm('確定要刪除此系統框架嗎？')) {
    emit('delete-frame', { frame: props.frame, frameType: props.frameType })
  }
}

const handleChangePage = (slug) => {
  emit('change-page', slug)
}

const handleSelectLogo = (data) => {
  emit('select-element', { type: 'logo', frameType: props.frameType, data: data.data, frame: data.frame })
}

const handleSelectElement = (data) => {
  emit('select-element', data)
}

const handleUpdateLogo = (newData) => {
  emit('update-element', { type: 'logo', frameType: props.frameType, data: newData })
}

const handleDeleteLogo = (data) => {
  emit('delete-element', { type: 'logo', frameType: props.frameType, frame: data?.frame })
}
</script>

<style scoped>
.system-frame-wrapper {
  position: relative;
}

.system-frame-wrapper.is-selected {
  outline: 3px solid rgba(232, 87, 42, 0.5);
  outline-offset: -3px;
}

.system-frame-wrapper.is-selected .delete-system-frame-btn {
  opacity: 1;
}

.delete-system-frame-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  font-size: 16px;
  font-weight: bold;
  color: #666;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.delete-system-frame-btn:hover {
  background: #dc3545;
  color: #fff;
  transform: scale(1.1);
}

.system-frame-container {
  position: relative;
}

.system-frame-container.is-clickable {
  cursor: pointer;
  position: relative;
}

.system-frame-container.is-clickable::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 3px solid transparent;
  transition: border-color 0.2s;
  pointer-events: none;
  z-index: 10;
}

.system-frame-container.is-clickable:hover::after {
  border-color: rgba(232, 87, 42, 0.4);
}

.system-frame-wrapper.is-selected .system-frame-container.is-clickable::after {
  border-color: rgba(232, 87, 42, 0.6);
}

.carousel-wall-clickable {
  cursor: pointer;
  position: relative;
}

.carousel-wall-clickable::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 3px solid transparent;
  transition: border-color 0.2s;
  pointer-events: none;
  z-index: 10;
}

.carousel-wall-clickable:hover::after {
  border-color: rgba(232, 87, 42, 0.5);
}

.unknown-frame {
  padding: 2rem;
  text-align: center;
  background: #fff3cd;
  border: 2px dashed #ffc107;
  color: #856404;
}
</style>
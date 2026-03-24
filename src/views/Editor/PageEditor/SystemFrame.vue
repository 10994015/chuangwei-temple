<template>

  <div 
    class="system-frame-wrapper" 
    :class="{ 'is-selected': isFrameSelected }"
    :data-frame-type="frameType"
  >
    <!-- ✅ 刪除系統框架按鈕（只在框架可刪除且被選中時顯示） -->
    <button
      v-if="isFrameSelected && frame?.isDeletable"
      class="delete-system-frame-btn"
      @click.stop="handleDeleteFrame"
      title="刪除框架"
    >
      ✕
    </button>

    <!-- ✅ system-frame-container 注入 CSS 文字色變數，讓所有 basemap 子組件可直接使用 -->
    <!-- ✅ 統一點擊選取：除了已有自己點擊邏輯的類型，其他框架點擊此層就能選取 -->
    <div
      class="system-frame-container"
      :data-frame-type="frameType"
      :style="frameTextStyle"
      :class="{ 'is-clickable': isClickableFrame }"
      @click="handleContainerClick"
    >
      <!-- 頁首 (HEADER) - 可編輯版本 -->
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
      
      <!-- 頁尾 (FOOTER) -->
      <FooterBasemap
        v-else-if="frameType === 'FOOTER'"
        v-bind="frameData"
        :footer-bg-color="frame?.data?.footerBgColor"
        :footer-text-color="frame?.data?.footerTextColor"
      />
      
      <!-- ✅ 輪播牆 (CAROUSEL_WALL) - 加上點擊選取事件 -->
      <div
        v-else-if="frameType === 'CAROUSEL_WALL'"
        class="carousel-wall-clickable"
        @click.stop="handleSelectFrame(frame)"
      >
        <HeroBasemap v-bind="frameData" />
      </div>
      
      <!-- ✅ 首圖 (FIRST_PICTURE) - 使用新的 HeroBannerElement -->
      <HeroBannerElement 
        v-else-if="frameType === 'FIRST_PICTURE'" 
        :frame-data="frameData"
        :frame="frame"
        :is-selected="isFrameSelected"
        @select-frame="handleSelectFrame"
      />
      
      <!-- 首頁-最新消息 (INDEX_NEWS) -->
      <NewsBasemap v-else-if="frameType === 'INDEX_NEWS'" v-bind="frameData" />
      
      <!-- 消息列表 (NEWS_LIST) -->
      <NewsListBasemap v-else-if="frameType === 'NEWS_LIST'" v-bind="frameData" />
      
      <!-- 首頁-商品標幅 (INDEX_PRODUCT) -->
      <ProductsBasemap v-else-if="frameType === 'INDEX_PRODUCT'" v-bind="frameData" />
      
      <!-- 首頁-活動橫幅 (INDEX_EVENT) -->
      <EventsBasemap v-else-if="frameType === 'INDEX_EVENT'" v-bind="frameData" />
      
      <!-- 首頁-捐獻區 (INDEX_DONATION) - 可編輯版本 -->
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
    
    <!-- 相簿列表 (ALBUM_LIST) -->
    <AlbumListBasemap v-else-if="frameType === 'ALBUM_LIST'" v-bind="frameData" />
    
    <!-- 活動列表 (EVENT_LIST) -->
    <EventListBasemap v-else-if="frameType === 'EVENT_LIST'" v-bind="frameData" />
    
    <!-- 捐款商品 (DONATION_PRODUCT) -->
    <DonationProductBasemap v-else-if="frameType === 'DONATION_PRODUCT'" v-bind="frameData" />
    
    <!-- 光明燈 (BRIGHT_LAMP) -->
    <BrightLampBasemap v-else-if="frameType === 'BRIGHT_LAMP'" v-bind="frameData" />    
    <!-- 未知類型 -->
    <div v-else class="unknown-frame">
      <p>未知系統框架類型: {{ frameType }}</p>
    </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import NavbarBasemap from './basemap/NavbarBasemap.vue'
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
  frameType: { type: String, required: true },
  frameData: { type: Object, default: () => ({}) },
  frame: { type: Object, default: null },
  selectedElement: { type: Object, default: null },
  selectedFrame: { type: Object, default: null },
  currentPageSlug: { type: String, default: null }
})

const emit = defineEmits([
  'select-element', 
  'update-element', 
  'delete-element', 
  'change-page', 
  'select-frame',
  'delete-frame'
])

// ==================== 文字色主題 CSS 變數 ====================
// 讓所有 basemap 子組件可用 var(--frame-text-color) 等變數調整文字色

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

  // custom：主色自訂，其餘自動推導
  if (theme === 'custom' && customColor) {
    // 簡單亮度判斷：決定 secondary/muted 的透明度方向
    const hex = customColor.replace('#', '')
    const r = parseInt(hex.slice(0,2),16)
    const g = parseInt(hex.slice(2,4),16)
    const b = parseInt(hex.slice(4,6),16)
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

// ==================== 既有邏輯（不變）====================

const isLogoSelected = computed(() => props.selectedElement?.type === 'logo')
const isFrameSelected = computed(() => props.selectedFrame === props.frame)

// CAROUSEL_WALL 和 FIRST_PICTURE 已有自己的點擊邏輯，其他系統框架統一由容器層處理
const SELF_HANDLED_TYPES = ['CAROUSEL_WALL', 'FIRST_PICTURE', 'HEADER']
const isClickableFrame = computed(() =>
  !SELF_HANDLED_TYPES.includes(props.frameType)
)

const handleContainerClick = (event) => {
  // clickable 框架：任何點擊都觸發 select-frame
  // DonationBasemap 的子元素點擊已用 @click.stop 阻止冒泡，不會到這裡
  if (isClickableFrame.value) {
    emit('select-frame', props.frame)
  }
}

const handleSelectFrame = (frame) => {
  console.log('SystemFrame: 選擇框架', frame?.type)
  emit('select-frame', frame)
}

const handleDeleteFrame = () => {
  if (confirm('確定要刪除此系統框架嗎？')) {
    console.log('SystemFrame: 刪除框架', props.frameType)
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

console.log('ALBUM_LIST frameData:', props.frameData)
</script>

<style scoped>
.system-frame-wrapper {
  position: relative;
  
  &.is-selected {
    outline: 3px solid rgba(232, 87, 42, 0.5);
    outline-offset: -3px;
    .delete-system-frame-btn { opacity: 1; }
  }
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
  &:hover { background: #dc3545; color: #fff; transform: scale(1.1); }
}

.system-frame-container {
  position: relative;
}

/* ✅ 可點擊的系統框架：hover 邊框提示 + 選取狀態 */
.system-frame-container.is-clickable {
  cursor: pointer;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 3px solid transparent;
    transition: border-color 0.2s;
    pointer-events: none;
    z-index: 10;
  }

  &:hover::after {
    border-color: rgba(232, 87, 42, 0.4);
  }
}

/* 選取時外框（配合 is-selected 的 wrapper outline） */
.system-frame-wrapper.is-selected .system-frame-container.is-clickable::after {
  border-color: rgba(232, 87, 42, 0.6);
}

.carousel-wall-clickable {
  cursor: pointer;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 3px solid transparent;
    transition: border-color 0.2s;
    pointer-events: none;
    z-index: 10;
  }
  &:hover::after { border-color: rgba(232, 87, 42, 0.5); }
}

.unknown-frame {
  padding: 2rem;
  text-align: center;
  background: #fff3cd;
  border: 2px dashed #ffc107;
  color: #856404;
}
</style>
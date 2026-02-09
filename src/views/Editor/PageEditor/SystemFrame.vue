<template>
  <div class="system-frame-container" :data-frame-type="frameType">
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
    <FooterBasemap v-else-if="frameType === 'FOOTER'" v-bind="frameData" />
    
    <!-- 輪播牆 (CAROUSEL_WALL) -->
    <HeroBasemap v-else-if="frameType === 'CAROUSEL_WALL'" v-bind="frameData" />
    
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
    <NewsBasemap v-else-if="frameType === 'NEWS_LIST'" v-bind="frameData" />
    
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
    <ProductsBasemap v-else-if="frameType === 'PRODUCT_LIST'" v-bind="frameData" />
    
    <!-- 相簿列表 (ALBUM_LIST) -->
    <AlbumListBasemap v-else-if="frameType === 'ALBUM_LIST'" v-bind="frameData" />
    
    <!-- 活動列表 (EVENT_LIST) -->
    <EventsBasemap v-else-if="frameType === 'EVENT_LIST'" v-bind="frameData" />
    
    <!-- 捐款商品 (DONATION_PRODUCT) -->
    <DonationBasemap v-else-if="frameType === 'DONATION_PRODUCT'" v-bind="frameData" />
    
    <!-- 光明燈 (BRIGHT_LAMP) -->
    <AboutBasemap v-else-if="frameType === 'BRIGHT_LAMP'" v-bind="frameData" />
    
    <!-- 未知類型 -->
    <div v-else class="unknown-frame">
      <p>未知系統框架類型: {{ frameType }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import NavbarBasemap from './basemap/NavbarBasemap.vue'
import FooterBasemap from './basemap/FooterBasemap.vue'
import HeroBasemap from './basemap/HeroBasemap.vue'
import NewsBasemap from './basemap/NewsBasemap.vue'
import EventsBasemap from './basemap/EventsBasemap.vue'
import ProductsBasemap from './basemap/ProductsBasemap.vue'
import DonationBasemap from './basemap/DonationBasemap.vue'
import AboutBasemap from './basemap/AboutBasemap.vue'
import AlbumListBasemap from './basemap/AlbumListBasemap.vue'
import HeroBannerElement from './elements/HeroBannerElement.vue'  // ✅ 新增引入

const props = defineProps({
  frameType: {
    type: String,
    required: true
  },
  frameData: {
    type: Object,
    default: () => ({})
  },
  frame: {
    type: Object,
    default: null
  },
  selectedElement: {
    type: Object,
    default: null
  },
  currentPageSlug: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['select-element', 'update-element', 'delete-element', 'change-page', 'select-frame'])

// 檢查 Logo 是否被選中
const isLogoSelected = computed(() => {
  return props.selectedElement?.type === 'logo'
})

// ✅ 檢查框架是否被選中
const isFrameSelected = computed(() => {
  return props.frame === props.selectedElement?.frame
})

// ✅ 處理選擇框架
const handleSelectFrame = (frame) => {
  console.log('SystemFrame: 選擇框架', frame?.type)
  emit('select-frame', frame)
}

// 處理切換頁面
const handleChangePage = (slug) => {
  console.log('SystemFrame: 切換頁面', slug)
  emit('change-page', slug)
}


// 選擇 Logo
const handleSelectLogo = (data) => {
  console.log('選擇 Logo:', data)
  emit('select-element', {
    type: 'logo',
    frameType: props.frameType,
    data: data.data
  })
}

// 選擇元件（用於 INDEX_DONATION 等）
const handleSelectElement = (data) => {
  console.log('SystemFrame 選擇元件:', data)
  emit('select-element', data)
}

// 更新 Logo
const handleUpdateLogo = (newData) => {
  console.log('更新 Logo:', newData)
  emit('update-element', {
    type: 'logo',
    frameType: props.frameType,
    data: newData
  })
}

// 刪除 Logo
const handleDeleteLogo = () => {
  console.log('刪除 Logo')
  emit('delete-element', {
    type: 'logo',
    frameType: props.frameType
  })
}
</script>

<style scoped>
.system-frame-container {
  position: relative;
}

.unknown-frame {
  padding: 2rem;
  text-align: center;
  background: #fff3cd;
  border: 2px dashed #ffc107;
  color: #856404;
}
</style>
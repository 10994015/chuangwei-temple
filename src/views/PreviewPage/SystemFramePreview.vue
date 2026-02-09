<template>
  <div class="system-frame-preview" :data-frame-type="frameType">
    <!-- 頁首 (HEADER) -->
    <NavbarBasemap 
      v-if="frameType === 'HEADER'" 
      :frame-data="frameData"
      :is-edit-mode="false"
      :current-page-slug="currentPageSlug"
      @change-page="handleChangePage"
    />
    
    <!-- 頁尾 (FOOTER) -->
    <FooterBasemap v-else-if="frameType === 'FOOTER'" v-bind="frameData" />
    
    <!-- 輪播牆 (CAROUSEL_WALL) -->
    <HeroBasemap v-else-if="frameType === 'CAROUSEL_WALL'" v-bind="frameData" />
    
    <!-- ✅ 首圖 (FIRST_PICTURE) - 使用 HeroBannerElement -->
    <HeroBannerElement 
      v-else-if="frameType === 'FIRST_PICTURE'" 
      :frame-data="frameData"
      :is-selected="false"
    />
    
    <!-- 首頁-最新消息 (INDEX_NEWS) -->
    <NewsBasemap v-else-if="frameType === 'INDEX_NEWS'" v-bind="frameData" />
    
    <!-- 消息列表 (NEWS_LIST) -->
    <NewsBasemap v-else-if="frameType === 'NEWS_LIST'" v-bind="frameData" />
    
    <!-- 首頁-商品標幅 (INDEX_PRODUCT) -->
    <ProductsBasemap v-else-if="frameType === 'INDEX_PRODUCT'" v-bind="frameData" />
    
    <!-- 首頁-活動橫幅 (INDEX_EVENT) -->
    <EventsBasemap v-else-if="frameType === 'INDEX_EVENT'" v-bind="frameData" />
    
    <!-- 首頁-捐獻區 (INDEX_DONATION) -->
    <DonationBasemap 
      v-else-if="frameType === 'INDEX_DONATION'" 
      v-bind="frameData"
      :is-edit-mode="false"
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
import NavbarBasemap from '../Editor/PageEditor/basemap/NavbarBasemap.vue'
import FooterBasemap from '../Editor/PageEditor/basemap/FooterBasemap.vue'
import HeroBasemap from '../Editor/PageEditor/basemap/HeroBasemap.vue'
import NewsBasemap from '../Editor/PageEditor/basemap/NewsBasemap.vue'
import EventsBasemap from '../Editor/PageEditor/basemap/EventsBasemap.vue'
import ProductsBasemap from '../Editor/PageEditor/basemap/ProductsBasemap.vue'
import DonationBasemap from '../Editor/PageEditor/basemap/DonationBasemap.vue'
import AboutBasemap from '../Editor/PageEditor/basemap/AboutBasemap.vue'
import AlbumListBasemap from '../Editor/PageEditor/basemap/AlbumListBasemap.vue'
import HeroBannerElement from '../Editor/PageEditor/elements/HeroBannerElement.vue'  // ✅ 新增引入

const props = defineProps({
  frameType: {
    type: String,
    required: true
  },
  frameData: {
    type: Object,
    default: () => ({})
  },
  currentPageSlug: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['change-page'])

const handleChangePage = (slug) => {
  console.log('SystemFramePreview: 切換頁面', slug)
  emit('change-page', slug)
}
</script>

<style scoped>
.system-frame-preview {
  position: relative;
  width: 100%;
}

.unknown-frame {
  padding: 2rem;
  text-align: center;
  background: #fff3cd;
  border: 2px dashed #ffc107;
  color: #856404;
}
</style>
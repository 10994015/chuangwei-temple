<template>
  <div class="system-frame-container" :data-frame-type="frameType">
    <!-- 頁首 (HEADER) -->
    <NavbarBasemap v-if="frameType === 'HEADER'" v-bind="frameData" />
    
    <!-- 頁尾 (FOOTER) -->
    <FooterBasemap v-else-if="frameType === 'FOOTER'" v-bind="frameData" />
    
    <!-- 輪播牆 (CAROUSEL_WALL) -->
    <HeroBasemap v-else-if="frameType === 'CAROUSEL_WALL'" v-bind="frameData" />
    
    <!-- 首圖 (FIRST_PICTURE) -->
    <HeroBasemap v-else-if="frameType === 'FIRST_PICTURE'" v-bind="frameData" />
    
    <!-- 首頁-最新消息 (INDEX_NEWS) -->
    <NewsBasemap v-else-if="frameType === 'INDEX_NEWS'" v-bind="frameData" />
    
    <!-- 消息列表 (NEWS_LIST) -->
    <NewsBasemap v-else-if="frameType === 'NEWS_LIST'" v-bind="frameData" />
    
    <!-- 首頁-商品標幅 (INDEX_PRODUCT) -->
    <ProductsBasemap v-else-if="frameType === 'INDEX_PRODUCT'" v-bind="frameData" />
    
    <!-- 首頁-活動橫幅 (INDEX_EVENT) -->
    <EventsBasemap v-else-if="frameType === 'INDEX_EVENT'" v-bind="frameData" />
    
    <!-- 首頁-捐獻區 (INDEX_DONATION) -->
    <DonationBasemap v-else-if="frameType === 'INDEX_DONATION'" v-bind="frameData" />
    
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
import NavbarBasemap from './basemap/NavbarBasemap.vue'
import FooterBasemap from './basemap/FooterBasemap.vue'
import HeroBasemap from './basemap/HeroBasemap.vue'
import NewsBasemap from './basemap/NewsBasemap.vue'
import EventsBasemap from './basemap/EventsBasemap.vue'
import ProductsBasemap from './basemap/ProductsBasemap.vue'
import DonationBasemap from './basemap/DonationBasemap.vue'
import AboutBasemap from './basemap/AboutBasemap.vue'
import AlbumListBasemap from './basemap/AlbumListBasemap.vue'

const props = defineProps({
  frameType: {
    type: String,
    required: true
  },
  frameData: {
    type: Object,
    default: () => ({})
  }
})
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
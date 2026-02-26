<template>
  <div class="system-frame-preview" :data-frame-type="frameType">
    <!-- 頁首 (HEADER) -->
    <NavbarBasemap 
      v-if="frameType === 'HEADER'" 
      :frame-data="frameData"
      :is-edit-mode="false"
      :current-page-slug="currentPageSlug"
      :device="device"
      @change-page="handleChangePage"
    />
    
    <FooterBasemap v-else-if="frameType === 'FOOTER'" v-bind="frameData" />
    <HeroBasemap v-else-if="frameType === 'CAROUSEL_WALL'" v-bind="frameData" />
    <HeroBannerElement v-else-if="frameType === 'FIRST_PICTURE'" :frame-data="frameData" :is-selected="false" :is-edit-mode="false" />
    <NewsBasemap v-else-if="frameType === 'INDEX_NEWS'" v-bind="frameData" :device="device" />
    <NewsListBasemap v-else-if="frameType === 'NEWS_LIST'" v-bind="frameData" :device="device" />
    <ProductsBasemap v-else-if="frameType === 'INDEX_PRODUCT'" v-bind="frameData" :device="device" />
    <EventsBasemap v-else-if="frameType === 'INDEX_EVENT'" v-bind="frameData" :device="device" />
    <DonationBasemap v-else-if="frameType === 'INDEX_DONATION'" v-bind="frameData" :is-edit-mode="false" :device="device" />
    <!-- ✅ ProductListBasemap 傳入 device -->
    <ProductListBasemap v-else-if="frameType === 'PRODUCT_LIST'" v-bind="frameData" :device="device" />
    <AlbumListBasemap v-else-if="frameType === 'ALBUM_LIST'" v-bind="frameData" :device="device" />
    <EventListBasemap v-else-if="frameType === 'EVENT_LIST'" v-bind="frameData" :device="device" />
    <DonationProductBasemap v-else-if="frameType === 'DONATION_PRODUCT'" v-bind="frameData" :device="device" />
    <AboutBasemap v-else-if="frameType === 'BRIGHT_LAMP'" v-bind="frameData" :device="device" />
    
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
import NewsListBasemap from '../Editor/PageEditor/basemap/NewsListBasemap.vue'
import EventsBasemap from '../Editor/PageEditor/basemap/EventsBasemap.vue'
import EventListBasemap from '../Editor/PageEditor/basemap/EventListBasemap.vue'
import ProductsBasemap from '../Editor/PageEditor/basemap/ProductsBasemap.vue'
import ProductListBasemap from '../Editor/PageEditor/basemap/ProductListBasemap.vue'
import DonationBasemap from '../Editor/PageEditor/basemap/DonationBasemap.vue'
import DonationProductBasemap from '../Editor/PageEditor/basemap/DonationProductBasemap.vue'
import AboutBasemap from '../Editor/PageEditor/basemap/AboutBasemap.vue'
import AlbumListBasemap from '../Editor/PageEditor/basemap/AlbumListBasemap.vue'
import HeroBannerElement from '../Editor/PageEditor/elements/HeroBannerElement.vue'

const props = defineProps({
  frameType:       { type: String, required: true },
  frameData:       { type: Object, default: () => ({}) },
  currentPageSlug: { type: String, default: null },
  device:          { type: String, default: 'desktop' }
})

const emit = defineEmits(['change-page'])
const handleChangePage = (slug) => emit('change-page', slug)
</script>

<style scoped>
.system-frame-preview { position: relative; width: 100%; }
.unknown-frame { padding: 2rem; text-align: center; background: #fff3cd; border: 2px dashed #ffc107; color: #856404; }
</style>
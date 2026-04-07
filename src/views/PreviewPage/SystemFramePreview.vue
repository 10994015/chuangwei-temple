<template>
  <div class="system-frame-preview" :data-frame-type="frameType" :style="frameTextStyle">
    <NavbarBasemap
      v-if="frameType === 'HEADER'"
      :frame-data="frameData"
      :is-edit-mode="false"
      :current-page-slug="currentPageSlug"
      :device="device"
      @change-page="handleChangePage"
    />

    <PvNavbarBasemap
      v-else-if="frameType === 'PV_HEADER'"
      :frame-data="frameData"
      :is-edit-mode="false"
      :current-page-slug="currentPageSlug"
      :device="device"
      @change-page="handleChangePage"
    />

    <FooterBasemap
      v-else-if="frameType === 'FOOTER'"
      v-bind="frameData"
      :footer-bg-color="frameData.footerBgColor"
      :footer-text-color="frameData.footerTextColor"
      :device="device"
    />

    <PvFooterBasemap
      v-else-if="frameType === 'PV_FOOTER'"
      v-bind="frameData"
      :footer-bg-color="frameData.footerBgColor"
      :footer-text-color="frameData.footerTextColor"
      :device="device"
    />

    <HeroBasemap
      v-else-if="frameType === 'CAROUSEL_WALL'"
      v-bind="frameData"
    />

    <PvHeroBasemap
      v-else-if="frameType === 'PV_CAROUSEL_WALL'"
      v-bind="frameData"
    />

    <HeroBannerElement
      v-else-if="frameType === 'FIRST_PICTURE'"
      :frame-data="frameData"
      :is-selected="false"
      :is-edit-mode="false"
    />

    <PvFirstPictureBasemap
      v-else-if="frameType === 'PV_PORTAL_PICTURE'"
      :frame-data="frameData"
      :is-selected="false"
      :is-edit-mode="false"
    />

    <NewsBasemap
      v-else-if="frameType === 'INDEX_NEWS'"
      v-bind="frameData"
      :device="device"
    />

    <PvNewsBasemap
      v-else-if="frameType === 'PV_INDEX_NEWS'"
      v-bind="frameData"
      :device="device"
    />

    <NewsListBasemap
      v-else-if="frameType === 'NEWS_LIST'"
      v-bind="frameData"
      :device="device"
    />

    <PvNewsListBasemap
      v-else-if="frameType === 'PV_NEWS_LIST'"
      v-bind="frameData"
      :device="device"
    />

    <ProductsBasemap
      v-else-if="frameType === 'INDEX_PRODUCT'"
      v-bind="frameData"
      :device="device"
    />

    <PvProductsBasemap
      v-else-if="frameType === 'PV_INDEX_PRODUCT'"
      v-bind="frameData"
      :device="device"
    />

    <EventsBasemap
      v-else-if="frameType === 'INDEX_EVENT'"
      v-bind="frameData"
      :device="device"
    />

    <DonationBasemap
      v-else-if="frameType === 'INDEX_DONATION'"
      v-bind="frameData"
      :is-edit-mode="false"
      :device="device"
      :frame="fakeFrame"
    />

    <ProductListBasemap
      v-else-if="frameType === 'PRODUCT_LIST'"
      v-bind="frameData"
      :device="device"
    />

    <PvProductListBasemap
      v-else-if="frameType === 'PV_PRODUCT_LIST'"
      v-bind="frameData"
      :device="device"
    />

    <AlbumListBasemap
      v-else-if="frameType === 'ALBUM_LIST'"
      v-bind="frameData"
      :device="device"
    />

    <EventListBasemap
      v-else-if="frameType === 'EVENT_LIST'"
      v-bind="frameData"
      :device="device"
    />

    <DonationProductBasemap
      v-else-if="frameType === 'DONATION_PRODUCT'"
      v-bind="frameData"
      :device="device"
    />

    <BrightLampBasemap
      v-else-if="frameType === 'BRIGHT_LAMP'"
      :bg-img-src="frameData.bgImgSrc"
      :bg-img-id="frameData.bgImgId"
      :main-img-src="frameData.mainImgSrc"
      :main-img-id="frameData.mainImgId"
      :border-option="frameData.borderOption"
      :pillar-option="frameData.pillarOption"
      :lamp-types="frameData.lampTypes"
      :device="device"
    />

    <PvServicesBasemap
      v-else-if="frameType === 'PV_INDEX_SERVICE'"
      v-bind="frameData"
      :device="device"
    />

    <div v-else class="unknown-frame">
      <p>未知系統框架類型: {{ frameType }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import NavbarBasemap from '../Editor/PageEditor/basemap/NavbarBasemap.vue'
import PvNavbarBasemap from '../Editor/PageEditor/basemap/PvNavbarBasemap.vue'
import FooterBasemap from '../Editor/PageEditor/basemap/FooterBasemap.vue'
import PvFooterBasemap from '../Editor/PageEditor/basemap/PvFooterBasemap.vue'
import HeroBasemap from '../Editor/PageEditor/basemap/HeroBasemap.vue'
import PvHeroBasemap from '../Editor/PageEditor/basemap/PvHeroBasemap.vue'
import HeroBannerElement from '../Editor/PageEditor/elements/HeroBannerElement.vue'
import PvFirstPictureBasemap from '../Editor/PageEditor/basemap/PvFirstPictureBasemap.vue'
import NewsBasemap from '../Editor/PageEditor/basemap/NewsBasemap.vue'
import PvNewsBasemap from '../Editor/PageEditor/basemap/PvNewsBasemap.vue'
import NewsListBasemap from '../Editor/PageEditor/basemap/NewsListBasemap.vue'
import PvNewsListBasemap from '../Editor/PageEditor/basemap/PvNewsListBasemap.vue'
import ProductsBasemap from '../Editor/PageEditor/basemap/ProductsBasemap.vue'
import PvProductsBasemap from '../Editor/PageEditor/basemap/PvProductsBasemap.vue'
import EventsBasemap from '../Editor/PageEditor/basemap/EventsBasemap.vue'
import EventListBasemap from '../Editor/PageEditor/basemap/EventListBasemap.vue'
import DonationBasemap from '../Editor/PageEditor/basemap/DonationBasemap.vue'
import DonationProductBasemap from '../Editor/PageEditor/basemap/DonationProductBasemap.vue'
import ProductListBasemap from '../Editor/PageEditor/basemap/ProductListBasemap.vue'
import PvProductListBasemap from '../Editor/PageEditor/basemap/PvProductListBasemap.vue'
import AlbumListBasemap from '../Editor/PageEditor/basemap/AlbumListBasemap.vue'
import BrightLampBasemap from '../Editor/PageEditor/basemap/BrightLampBasemap.vue'
import PvServicesBasemap from '../Editor/PageEditor/basemap/PvServicesBasemap.vue'

const props = defineProps({
  frameType:       { type: String, required: true },
  frameData:       { type: Object, default: () => ({}) },
  currentPageSlug: { type: String, default: null },
  device:          { type: String, default: 'desktop' }
})

const emit = defineEmits(['change-page'])
const handleChangePage = (slug) => emit('change-page', slug)

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
  const theme = props.frameData?.textTheme
  const customColor = props.frameData?.textColor

  if (!theme || theme === 'light') return THEME_PRESETS.light
  if (theme === 'dark')  return THEME_PRESETS.dark
  if (theme === 'sepia') return THEME_PRESETS.sepia

  if (theme === 'custom' && customColor) {
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

const fakeFrame = computed(() => ({ data: props.frameData }))
</script>

<style scoped>
.system-frame-preview { position: relative; width: 100%; }
.unknown-frame { padding: 2rem; text-align: center; background: #fff3cd; border: 2px dashed #ffc107; color: #856404; }
</style>
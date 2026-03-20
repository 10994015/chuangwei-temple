<template>
  <div class="preview-page">
    <header class="preview-toolbar">
      <div class="toolbar-left">
        <span v-if="isTemplatePreviewMode" class="template-preview-label">
          模板預覽
        </span>
      </div>

      <div class="toolbar-center">
        <div class="device-switcher">
          <button class="device-btn" :class="{ active: currentDevice === 'desktop' }" @click="setDevice('desktop')" title="電腦版 (1280px)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            <span>電腦版</span>
          </button>
          <button class="device-btn" :class="{ active: currentDevice === 'tablet' }" @click="setDevice('tablet')" title="平板 (768px)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            <span>平板</span>
          </button>
          <button class="device-btn" :class="{ active: currentDevice === 'mobile' }" @click="setDevice('mobile')" title="手機版 (390px)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            <span>手機版</span>
          </button>
        </div>
        <span class="device-width-label">{{ deviceWidthLabel }}</span>
      </div>

      <div class="toolbar-right">
        <button class="btn btn-icon" @click="handleRefresh">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          重新載入
        </button>
      </div>
    </header>

    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">載入中...</div>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <h3>⚠️ 載入失敗</h3>
        <p>{{ error }}</p>
        <button @click="loadPreviewData" class="btn-retry">重試</button>
      </div>
    </div>

    <div v-else class="preview-area" :class="`device-${currentDevice}`">
      <div class="device-frame" :class="`device-frame--${currentDevice}`">
        <div v-if="currentDevice !== 'desktop'" class="device-notch">
          <div class="notch-bar"></div>
        </div>

        <div ref="screenRef" class="device-screen">
          <div class="website-preview" :style="previewContentStyle">
            <template v-for="(basemap, index) in currentPageBasemaps" :key="`basemap-${index}`">
              <div
                class="basemap-section"
                :class="`basemap-${getBasemapType(basemap).toLowerCase()}`"
                :style="getBasemapStyle(basemap)"
              >
                <template v-for="(frame, frameIndex) in basemap.frames" :key="`frame-${frameIndex}`">
                  <SystemFramePreview
                    v-if="isSystemFrame(frame)"
                    :frame-type="frame.type"
                    :frame-data="frame.data || {}"
                    :current-page-slug="currentSlug"
                    :device="currentDevice"
                    @change-page="handleChangePage"
                  />
                  <CustomFramePreview
                    v-else
                    :frame="frame"
                    :device="currentDevice"
                  />
                </template>
              </div>
            </template>
          </div>

          <Transition name="scroll-top">
            <button
              v-if="showScrollTop"
              class="scroll-top-btn"
              :class="`scroll-top-btn--${currentDevice}`"
              @click="scrollToTop"
              title="回到頂部"
              aria-label="回到頂部"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
            </button>
          </Transition>
        </div>

        <div v-if="currentDevice === 'mobile'" class="device-home-bar"></div>
        <div v-if="currentDevice === 'tablet'" class="device-tablet-bar"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SystemFramePreview from './PreviewPage/SystemFramePreview.vue'
import CustomFramePreview from './PreviewPage/CustomFramePreview.vue'
import axiosClient from '@/axios'

const router = useRouter()
const route = useRoute()
const pageEditorStore = inject('pageEditorStore', null)

const isLoading = ref(false)
const error = ref(null)

const pages = ref([])
const currentSlug = ref('')

const isTemplatePreviewMode = computed(() => !!route.query.templateId)

const currentPageBasemaps = computed(() => {
  const page = pages.value.find(p => p.slug === currentSlug.value)
  return page?.contentJson || []
})

const currentDevice = ref('desktop')

// ==================== Scroll-to-top ====================
const screenRef = ref(null)
const showScrollTop = ref(false)

const handleScroll = () => {
  showScrollTop.value = (screenRef.value?.scrollTop ?? 0) > 300
}

const scrollToTop = () => {
  screenRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(currentDevice, () => {
  showScrollTop.value = false
  screenRef.value?.scrollTo({ top: 0 })
})

onMounted(() => { attachScrollListener() })
onUnmounted(() => { screenRef.value?.removeEventListener('scroll', handleScroll) })

const attachScrollListener = () => {
  screenRef.value?.addEventListener('scroll', handleScroll, { passive: true })
}

watch(isLoading, (loading) => {
  if (!loading) setTimeout(attachScrollListener, 50)
})

// ==================== Device ====================
const deviceConfig = {
  desktop: { width: 1280, label: '1280px' },
  tablet:  { width: 768,  label: '768px'  },
  mobile:  { width: 390,  label: '390px'  }
}

const deviceWidthLabel = computed(() => deviceConfig[currentDevice.value].label)
const setDevice = (device) => { currentDevice.value = device }

const previewContentStyle = computed(() => {
  if (currentDevice.value === 'desktop') return {}
  return { width: '100%', minWidth: 'unset', overflowX: 'hidden' }
})

// ==================== Locale ====================
const currentLocale = ref(route.query.locale || pageEditorStore?.currentLocale || 'ZH-TW')

if (pageEditorStore) {
  watch(() => pageEditorStore.currentLocale, (newLocale) => {
    if (isTemplatePreviewMode.value) return
    if (newLocale && newLocale !== currentLocale.value) {
      currentLocale.value = newLocale
      loadPreviewData()
    }
  })
}

watch(() => route.query.locale, (newLocale) => {
  if (isTemplatePreviewMode.value) return
  if (newLocale && newLocale !== currentLocale.value) {
    currentLocale.value = newLocale
    router.replace({ query: { ...route.query, locale: newLocale } })
    loadPreviewData()
  }
})

// ==================== Data ====================
const getTempleId   = () => route.params.templeId
const getSlug       = () => route.query.slug || 'home'
const getTemplateId = () => route.query.templateId

const fetchAllDraftPages = async (tid, locale) => {
  const response = await axiosClient.get(`/tenant/${tid}/web-site/all-draft-page`, {
    params: { locale }
  })
  const result = response.data
  if (result.statusCode === 200 && Array.isArray(result.data)) return result.data
  throw new Error(result.message || '載入失敗')
}

const fetchTemplatePages = async (tid, templateId) => {
  const response = await axiosClient.get(`/tenant/${tid}/web-template/${templateId}/all-page`)
  const result = response.data
  if (result.statusCode === 200 && result.data) return result.data
  throw new Error(result.message || '載入模板失敗')
}

const loadPreviewData = async () => {
  const templeId = getTempleId()
  if (!templeId) { error.value = '缺少宮廟 ID'; return }

  isLoading.value = true
  error.value = null

  try {
    let data

    if (isTemplatePreviewMode.value) {
      data = await fetchTemplatePages(templeId, getTemplateId())
    } else {
      data = await fetchAllDraftPages(templeId, currentLocale.value)
    }

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('資料格式不正確')
    }

    pages.value = data

    if (isTemplatePreviewMode.value) {
      // 模板預覽：直接顯示第一頁，不特意找 home
      currentSlug.value = data[0].slug
    } else {
      // 草稿預覽：優先顯示 query 指定的頁面，找不到才用第一頁
      const targetSlug = getSlug()
      const matched = data.find(p => p.slug === targetSlug)
      currentSlug.value = matched ? targetSlug : data[0].slug
    }

  } catch (err) {
    error.value = err.message || '載入失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}

const handleChangePage = (slug) => {
  const page = pages.value.find(p => p.slug === slug)
  if (page) {
    currentSlug.value = slug
    screenRef.value?.scrollTo({ top: 0 })
    if (!isTemplatePreviewMode.value) {
      router.replace({ query: { ...route.query, slug } })
    }
  }
}

const handleRefresh = () => loadPreviewData()

const isSystemFrame = (frame) => {
  if (!frame || !frame.type) return false
  return !frame.type.startsWith('FRAME')
}

const getBasemapType = (basemap) => basemap.bgType || basemap.bg_type || 'content'

const getBasemapStyle = (basemap) => {
  const style = {}
  const pcSrc     = basemap.bgPcImgSrc     || basemap.bg_pc_img_src
  const tabletSrc = basemap.bgTabletImgSrc || basemap.bg_tablet_img_src
  const mobileSrc = basemap.bgPhoneImgSrc  || basemap.bg_phone_img_src

  let imgSrc = pcSrc
  if (currentDevice.value === 'tablet') imgSrc = tabletSrc || pcSrc
  if (currentDevice.value === 'mobile') imgSrc = mobileSrc || pcSrc

  if (imgSrc) {
    style.backgroundImage    = `url(${imgSrc})`
    style.backgroundSize     = 'cover'
    style.backgroundPosition = 'center'
    style.backgroundRepeat   = 'no-repeat'
  }
  return style
}

onMounted(() => loadPreviewData())
</script>

<style scoped>
.preview-page { display: flex; flex-direction: column; height: 100vh; max-width:1920px; margin:0 auto; width: 100vw; background: #f0f0f0; overflow: hidden; }

.preview-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 0 24px; height: 60px; background: #fff; border-bottom: 1px solid #e5e5e5; box-shadow: 0 1px 3px rgba(0,0,0,0.05); z-index: 100; flex-shrink: 0; }
.toolbar-left, .toolbar-right { display: flex; align-items: center; gap: 12px; flex: 1; }
.toolbar-center { display: flex; align-items: center; gap: 16px; flex: 1; justify-content: center; }
.toolbar-right { justify-content: flex-end; }

.template-preview-label { font-size: 13px; font-weight: 600; color: #d97444; background: #fff7f3; border: 1px solid #f5d0b8; padding: 4px 12px; border-radius: 20px; }

.device-switcher { display: flex; align-items: center; background: #f5f5f5; border-radius: 10px; padding: 4px; gap: 2px; border: 1px solid #e8e8e8; }
.device-btn { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border: none; border-radius: 7px; background: transparent; color: #888; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.18s ease; white-space: nowrap; }
.device-btn:hover { color: #444; background: rgba(255,255,255,0.7); }
.device-btn.active { background: #fff; color: #E8572A; box-shadow: 0 1px 4px rgba(0,0,0,0.12); }
.device-btn.active svg { stroke: #E8572A; }
.device-btn svg { flex-shrink: 0; transition: stroke 0.18s; }
.device-width-label { font-size: 12px; color: #aaa; font-variant-numeric: tabular-nums; min-width: 48px; }

.btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border: 1px solid #ddd; border-radius: 6px; background: #fff; font-size: 13px; cursor: pointer; transition: all 0.2s; color: #555; }
.btn:hover { background: #f5f5f5; border-color: #bbb; color: #333; }

.loading-overlay, .error-container { flex: 1; display: flex; align-items: center; justify-content: center; background: #f0f0f0; }
.loading-spinner { background: #fff; padding: 24px 48px; border-radius: 8px; font-size: 16px; font-weight: 500; color: #333; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.error-message { text-align: center; padding: 40px; background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 500px; }
.error-message h3 { margin: 0 0 16px; font-size: 20px; color: #dc3545; }
.error-message p { margin: 0 0 24px; color: #666; font-size: 14px; }
.btn-retry { padding: 10px 24px; background: #E8572A; color: #fff; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; }
.btn-retry:hover { background: #d14a1f; }

.preview-area { flex: 1; overflow: auto; display: flex; align-items: flex-start; justify-content: center; padding: 24px 24px 40px; background: #e8e8e8; background-image: radial-gradient(circle, #d0d0d0 1px, transparent 1px); background-size: 20px 20px; }
.preview-area.device-desktop { align-items: stretch; padding: 0; background: #fff; background-image: none; }
.preview-area.device-desktop .device-frame { width: 100%; height: 100%; border-radius: 0; box-shadow: none; border: none; background: #fff; }
.preview-area.device-desktop .device-screen { height: 100%; overflow-y: auto; overflow-x: hidden; border-radius: 0; }

.device-frame { position: relative; background: #1a1a1a; border-radius: 40px; box-shadow: 0 0 0 2px #3a3a3a, 0 30px 80px rgba(0,0,0,0.35), 0 10px 30px rgba(0,0,0,0.2); overflow: hidden; flex-shrink: 0; transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.device-frame--mobile { width: 390px; height: 80vh; max-height: 860px; border-radius: 44px; border: 10px solid #2a2a2a; box-sizing: content-box; }
.device-frame--tablet { width: 768px; height: 80vh; max-height: 1080px; border-radius: 20px; border: 12px solid #2a2a2a; box-sizing: content-box; }

.device-notch { position: relative; display: flex; align-items: center; justify-content: center; height: 0; }
.notch-bar { display: none; }
.device-home-bar { display: none; }
.device-tablet-bar { display: none; }

.device-screen { background: #fff; border-radius: 34px; overflow-y: auto; overflow-x: hidden; height: 100%; width: 100%; position: relative; }
.device-frame--tablet .device-screen { border-radius: 10px; }
.device-screen::-webkit-scrollbar { width: 0; }
.preview-area.device-desktop .device-screen::-webkit-scrollbar { width: 8px; }
.preview-area.device-desktop .device-screen::-webkit-scrollbar-track { background: #f1f1f1; }
.preview-area.device-desktop .device-screen::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }

.website-preview { width: 100%; min-height: 100%; background: #fff; }
.basemap-section { position: relative; width: 100%; background-size: cover; background-position: center; background-repeat: no-repeat; }
.basemap-section :deep(.system-frame-preview),
.basemap-section :deep(.custom-frame-preview) { background: transparent !important; }

.scroll-top-btn { position: sticky; bottom: 32px; margin-left: auto; display: flex; align-items: center; justify-content: center; margin-top: -56px; margin-right: 32px; z-index: 200; width: 44px; height: 44px; border-radius: 50%; border: none; background: #E8572A; color: #fff; cursor: pointer; box-shadow: 0 4px 16px rgba(232, 87, 42, 0.45); transition: background 0.2s, transform 0.2s, box-shadow 0.2s; }
.scroll-top-btn--mobile, .scroll-top-btn--tablet { width: 36px; height: 36px; bottom: 20px; margin-right: 12px; margin-top: -50px; }
.scroll-top-btn svg { width: 20px; height: 20px; pointer-events: none; }
.scroll-top-btn--mobile svg, .scroll-top-btn--tablet svg { width: 16px; height: 16px; }
.scroll-top-btn:hover { background: #d14a1f; transform: translateY(-3px); box-shadow: 0 8px 24px rgba(232, 87, 42, 0.5); }
.scroll-top-btn:active { transform: translateY(0); box-shadow: 0 2px 8px rgba(232, 87, 42, 0.3); }
.scroll-top-enter-active, .scroll-top-leave-active { transition: opacity 0.25s, transform 0.25s; }
.scroll-top-enter-from, .scroll-top-leave-to { opacity: 0; transform: translateY(12px); }
</style>
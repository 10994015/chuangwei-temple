<template>
  <div class="preview-page">

    <!-- 統一深色 toolbar，CMS 預覽無「選擇樣式」按鈕，模板選擇預覽有 -->
    <header class="preview-toolbar">
      <div class="toolbar-left">
        <button class="btn-close" @click="handleClose">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          返回
        </button>
      </div>
      <div class="toolbar-center">
        <div class="device-switcher">
          <button class="device-btn" :class="{ active: currentDevice === 'desktop' }" @click="setDevice('desktop')" title="電腦版 (1280px)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </button>
          <button class="device-btn" :class="{ active: currentDevice === 'tablet' }" @click="setDevice('tablet')" title="平板 (768px)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
          </button>
          <button class="device-btn" :class="{ active: currentDevice === 'mobile' }" @click="setDevice('mobile')" title="手機版 (390px)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
          </button>
        </div>
      </div>
      <div class="toolbar-right">
        <button v-if="isTemplateSelectionPreview" class="btn-select-style" @click="handleSelectStyle" :disabled="isApplying">
          <span v-if="isApplying">套用中...</span>
          <span v-else>選擇樣式 →</span>
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
import { ref, computed, onMounted, onUnmounted, inject, watch, provide  } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SystemFramePreview from './PreviewPage/SystemFramePreview.vue'
import CustomFramePreview from './PreviewPage/CustomFramePreview.vue'
import axiosClient from '@/axios'

const router = useRouter()
const route = useRoute()
const pageEditorStore = inject('pageEditorStore', null)

const isLoading = ref(false)
const error = ref(null)
const isApplying = ref(false)

const pages = ref([])
const currentSlug = ref('')

// ==================== 來源判斷 ====================
const source = computed(() => route.query.source)
const templateId = computed(() => route.query.templateId)

const isTemplateSelectionPreview = computed(() => source.value === 'template-selection' && !!templateId.value)

// 保留原本的 isTemplatePreviewMode，供 locale watch 使用
const isTemplatePreviewMode = computed(() => !!templateId.value)

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
provide('previewContext', {
  get tenantId() { return route.params.templeId || '' },
  get locale()   { return currentLocale.value || 'ZH-TW' },
  get source()   { return route.query.source   || 'cms' },
})
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

const fetchTemplatePages = async (tid, tplId) => {
  const response = await axiosClient.get(`/tenant/${tid}/web-template/${tplId}/all-page`)
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

// ==================== 關閉視窗 ====================
const handleClose = () => {
  window.close()
}

// ==================== 選擇樣式 ====================
const handleSelectStyle = async () => {
  const tid = getTempleId()
  const tplId = getTemplateId()

  if (!tid || !tplId) return

  isApplying.value = true

  try {
    const existRes = await axiosClient.get(`/tenant/${tid}/web-site/exist`)
    const existResult = existRes.data

    const websiteExists = existResult.statusCode === 200 && existResult.data?.result === true

    if (!websiteExists) {
      // 尚未建立網站，跳到子網域設定頁
      const resolved = router.resolve({
        name: 'app.temple.subdomain-setup',
        params: { templeId: tid, templateId: tplId }
      })
      window.location.href = resolved.href
      return
    }

    // 已建立網站，打 POST 套用模板後跳編輯器
    const applyRes = await axiosClient.post(`/tenant/${tid}/web-site/temp-content`, {
      webTemplateId: tplId
    })
    const applyResult = applyRes.data

    if (applyResult.statusCode !== 200) {
      throw new Error(applyResult.message || '套用模板失敗')
    }

    // 用 window.location.href 強制整頁跳轉，確保 EditorLayout 重新初始化
    const resolved = router.resolve({
      name: 'app.temple.page-editor',
      params: { templeId: tid },
      query: { templateId: tplId }
    })
    window.location.href = resolved.href
  } catch (err) {
    console.error('選擇樣式失敗:', err)
    alert('操作失敗，請稍後再試')
  } finally {
    isApplying.value = false
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

provide('previewNavigate', handleChangePage)

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

/* ==================== 深色 toolbar ==================== */
.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 52px;
  background: #1a1a1a;
  border-bottom: 1px solid #2e2e2e;
  z-index: 100;
  flex-shrink: 0;
}

.toolbar-left, .toolbar-right { display: flex; align-items: center; gap: 12px; flex: 1; }
.toolbar-center { display: flex; align-items: center; gap: 16px; flex: 1; justify-content: center; }
.toolbar-right { justify-content: flex-end; }

.btn-close {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: transparent;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  color: #aaa;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-close:hover { background: #2a2a2a; border-color: #555; color: #fff; }

.device-switcher { display: flex; align-items: center; background: #2a2a2a; border-radius: 10px; padding: 4px; gap: 2px; border: 1px solid #3a3a3a; }
.device-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 32px; border: none; border-radius: 7px; background: transparent; color: #888; cursor: pointer; transition: all 0.18s ease; }
.device-btn:hover { color: #ccc; background: rgba(255,255,255,0.08); }
.device-btn.active { background: #3a3a3a; color: #4ade80; box-shadow: none; }
.device-btn.active svg { stroke: #4ade80; }
.device-btn svg { flex-shrink: 0; transition: stroke 0.18s; }

.btn-select-style {
  padding: 8px 20px;
  background: #4ade80;
  color: #111;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-select-style:hover:not(:disabled) { background: #22c55e; }
.btn-select-style:disabled { background: #2a2a2a; color: #666; cursor: not-allowed; }

/* ==================== Loading / Error ==================== */
.loading-overlay, .error-container { flex: 1; display: flex; align-items: center; justify-content: center; background: #f0f0f0; }
.loading-spinner { background: #fff; padding: 24px 48px; border-radius: 8px; font-size: 16px; font-weight: 500; color: #333; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.error-message { text-align: center; padding: 40px; background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 500px; }
.error-message h3 { margin: 0 0 16px; font-size: 20px; color: #dc3545; }
.error-message p { margin: 0 0 24px; color: #666; font-size: 14px; }
.btn-retry { padding: 10px 24px; background: #E8572A; color: #fff; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; }
.btn-retry:hover { background: #d14a1f; }

/* ==================== Preview Area ==================== */
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

/* ==================== Scroll to top ==================== */
.scroll-top-btn { position: sticky; bottom: 32px; margin-left: auto; display: flex; align-items: center; justify-content: center; margin-top: -56px; margin-right: 32px; z-index: 200; width: 44px; height: 44px; border-radius: 50%; border: none; background: #E8572A; color: #fff; cursor: pointer; box-shadow: 0 4px 16px rgba(232, 87, 42, 0.45); transition: background 0.2s, transform 0.2s, box-shadow 0.2s; }
.scroll-top-btn--mobile, .scroll-top-btn--tablet { width: 36px; height: 36px; bottom: 20px; margin-right: 12px; margin-top: -50px; }
.scroll-top-btn svg { width: 20px; height: 20px; pointer-events: none; }
.scroll-top-btn--mobile svg, .scroll-top-btn--tablet svg { width: 16px; height: 16px; }
.scroll-top-btn:hover { background: #d14a1f; transform: translateY(-3px); box-shadow: 0 8px 24px rgba(232, 87, 42, 0.5); }
.scroll-top-btn:active { transform: translateY(0); box-shadow: 0 2px 8px rgba(232, 87, 42, 0.3); }
.scroll-top-enter-active, .scroll-top-leave-active { transition: opacity 0.25s, transform 0.25s; }
.scroll-top-enter-from, .scroll-top-leave-to { opacity: 0; transform: translateY(12px); }
</style>
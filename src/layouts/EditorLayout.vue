<template>
  <div class="editor-layout">
    <component :is="'style'" v-if="globalFontFamily">
      .canvas-area,
      .canvas-area *,
      .temple-website,
      .temple-website * {
        font-family: {{ globalFontFamily }} !important;
      }
    </component>

    <template v-if="!isPreviewRoute">
      <EditorToolbar
        :current-locale="pageEditorStore.currentLocale"
        :locales="pageEditorStore.locales"
        :has-unsaved-changes="hasUnsavedChanges"
        :current-page-slug="pageEditorStore.currentPageSlug"
        :current-device="currentDevice"
        @locale-change="handleLocaleChange"
        @change-page="handlePageChange"
        @settings="handleSettings"
        @select-template="handleSelectTemplate"
        @upgrade="handleUpgrade"
        @preview="handlePreview"
        @save="handleSave"
        @delete="handleDelete"
        @go-to-website="handleGoToWebsite"
        @publish="handlePublish"
        @device-change="currentDevice = $event"
      />

      <div v-if="pageEditorStore.isLoading" class="loading-overlay">
        <div class="loading-spinner">{{ t('editorLayout.loading') }}</div>
      </div>

      <transition name="notice-slide">
        <div v-if="showTemplateNotice" class="template-notice">
          <span>📋 已套用新模板，內容尚未儲存，請記得點「儲存草稿」以保留變更。</span>
          <button @click="showTemplateNotice = false" class="close-btn">✕</button>
        </div>
      </transition>

      <div v-if="pageEditorStore.error" class="error-banner">
        <span>⚠️ {{ pageEditorStore.error }}</span>
        <button @click="pageEditorStore.error = null" class="close-btn">✕</button>
      </div>
    </template>

    <div class="page-content">
      <router-view />
    </div>

    <template v-if="!isPreviewRoute">
      <PublishDialog
        ref="publishDialogRef"
        :is-visible="showPublishDialog"
        :current-locale="pageEditorStore.currentLocale"
        :current-page-slug="pageEditorStore.currentPageSlug"
        :locales="pageEditorStore.locales"
        :has-unsaved-changes="hasUnsavedChanges"
        @confirm="handleConfirmPublish"
        @cancel="handleCancelPublish"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePageEditorStore } from '@/stores/pageEditor'
import EditorToolbar from '@/components/Editor/EditorToolbar.vue'
import PublishDialog from '@/components/PublishDialog.vue'
import { useI18n } from 'vue-i18n'
import { fontGoogleMap, loadGoogleFont } from '@/composables/useGoogleFont'

const { locale, t } = useI18n()

const router = useRouter()
const route = useRoute()
const pageEditorStore = usePageEditorStore()

const showPublishDialog = ref(false)
const publishDialogRef = ref(null)
const showTemplateNotice = ref(false)
const currentDevice = ref('desktop')

// 每個 slug 獨立追蹤是否有未儲存的變更
const unsavedSlugs = ref(new Set())
const hasUnsavedChanges = computed(() => unsavedSlugs.value.size > 0)

const markDirty = (slug) => {
  if (!slug) return
  const next = new Set(unsavedSlugs.value)
  next.add(slug)
  unsavedSlugs.value = next
}
const markClean = (slug) => {
  if (!slug) return
  const next = new Set(unsavedSlugs.value)
  next.delete(slug)
  unsavedSlugs.value = next
}
const markAllClean = () => { unsavedSlugs.value = new Set() }

const isPreviewRoute = computed(() => route.name === 'app.temple.preview')

const isTemplatePreviewMode = computed(() =>
  route.name === 'app.temple.preview' && !!route.query.templateId
)

const websiteSettings = computed(() => pageEditorStore.websiteSettings)

const availableFonts = [
  { value: 'ibm-plex-sans-tc',    cssFamily: "'IBM Plex Sans TC', sans-serif" },
  { value: 'lxgw-wenkai-mono-tc', cssFamily: "'LXGW WenKai Mono TC', monospace" },
  { value: 'noto-sans-tc',        cssFamily: "'Noto Sans TC', sans-serif" },
  { value: 'noto-serif-tc',       cssFamily: "'Noto Serif TC', serif" },
  { value: 'noto-sans-sc',        cssFamily: "'Noto Sans SC', sans-serif" },
  { value: 'noto-serif-sc',       cssFamily: "'Noto Serif SC', serif" },
  { value: 'ibm-plex-sans-sc',    cssFamily: "'IBM Plex Sans SC', sans-serif" },
  { value: 'bona-nova',           cssFamily: "'Bona Nova', serif" },
  { value: 'inter',               cssFamily: "'Inter', sans-serif" },
  { value: 'cormorant-garamond',  cssFamily: "'Cormorant Garamond', serif" },
  { value: 'montserrat',          cssFamily: "'Montserrat', sans-serif" },
  { value: 'playfair-display',    cssFamily: "'Playfair Display', serif" },
]

const currentFontValue = computed(() => {
  if (!websiteSettings.value) return null
  const loc = pageEditorStore.currentLocale
  if (loc === 'ZH-CN') return websiteSettings.value.frontFamilyZhCn
  if (loc === 'EN-US') return websiteSettings.value.frontFamilyEnUs
  return websiteSettings.value.frontFamilyZhTw
})

const globalFontFamily = computed(() => {
  if (!currentFontValue.value) return "'Noto Sans TC', sans-serif"
  const font = availableFonts.find(f => f.value === currentFontValue.value)
  return font ? font.cssFamily : "'Noto Sans TC', sans-serif"
})

const loadWebsiteSettings = async () => {
  const templeId = getTempleId()
  if (!templeId) return

  try {
    await pageEditorStore.fetchWebsiteSettings(templeId)

    const s = pageEditorStore.websiteSettings
    if (s) {
      loadGoogleFont(fontGoogleMap[s.frontFamilyZhTw])
      loadGoogleFont(fontGoogleMap[s.frontFamilyZhCn])
      loadGoogleFont(fontGoogleMap[s.frontFamilyEnUs])
    }
  } catch (error) {
    console.error('載入網站設定失敗:', error)
  }
}

const syncLocaleToUrl = (newLocale) => {
  router.replace({
    query: { ...route.query, locale: newLocale }
  })
}

provide('setUnsavedChanges', (value) => {
  value ? markDirty(pageEditorStore.currentPageSlug) : markClean(pageEditorStore.currentPageSlug)
})

provide('pageEditorStore', pageEditorStore)
provide('currentDevice', currentDevice)

watch(
  () => pageEditorStore.currentPageBasemaps,
  () => {
    if (isPreviewRoute.value) return
    if (isTemplatePreviewMode.value) return
    markDirty(pageEditorStore.currentPageSlug)
  },
  { deep: true }
)

const getTempleId = () => route.params.templeId

onMounted(async () => {
  if (isPreviewRoute.value) return

  const templeId = getTempleId()

  if (!templeId) {
    pageEditorStore.error = t('editorLayout.errorMissingTempleId')
    return
  }

  pageEditorStore.resetStore()
  pageEditorStore.setTenantId(templeId)

  const localeFromQuery = route.query.locale
  if (localeFromQuery) {
    pageEditorStore.currentLocale = localeFromQuery
    locale.value = localeFromQuery
  } else {
    syncLocaleToUrl(pageEditorStore.currentLocale)
    locale.value = pageEditorStore.currentLocale
  }

  try {
    await loadWebsiteSettings()
    await pageEditorStore.fetchLocales(templeId)

    const templateId = route.query.templateId
    const BLANK_TEMPLATE_ID = 'blank-template'

    if (templateId && templateId !== BLANK_TEMPLATE_ID) {
      // 從模板選擇頁過來：打 POST temp-content 取得模板 JSON，塞進 store
      const data = await pageEditorStore.loadTemplateAsEditorData(templeId, templateId)

      if (!data) {
        pageEditorStore.error = t('editorLayout.errorApplyTemplate')
        return
      }

      // 找第一頁的 slug 作為初始頁
      const initialSlug = data[0]?.slug || 'home'
      pageEditorStore.currentPageSlug = initialSlug
      await pageEditorStore.fetchSystemFrames(templeId, initialSlug)

      // 移除 templateId query，避免重新整理時重複套用
      router.replace({
        query: {
          slug: initialSlug,
          locale: pageEditorStore.currentLocale
        }
      })

      markDirty(initialSlug)
      showTemplateNotice.value = true
    } else {
      // 一般進入：打 all-draft-page 載入草稿
      const slugFromQuery = route.query.slug
      const initialSlug = slugFromQuery || 'home'

      await pageEditorStore.switchPageWithLocale(initialSlug, pageEditorStore.currentLocale)
      await pageEditorStore.fetchSystemFrames(templeId, initialSlug)

      router.replace({
        query: {
          ...route.query,
          slug: initialSlug,
          locale: pageEditorStore.currentLocale
        }
      })

      markAllClean()
    }
  } catch (error) {
    console.error('EditorLayout 初始化失敗:', error)
    pageEditorStore.error = t('editorLayout.errorLoadPage')
  }
})

// ==================== 工具列事件處理 ====================

const handlePageChange = async (slug) => {
  const templeId = getTempleId()
  if (!templeId || !slug) return
  router.replace({ query: { ...route.query, slug, locale: pageEditorStore.currentLocale } })
  await pageEditorStore.switchPageWithLocale(slug, pageEditorStore.currentLocale)
  markClean(slug)
}

const handleLocaleChange = async (newLocale) => {
  const templeId = getTempleId()
  const currentSlug = pageEditorStore.currentPageSlug

  if (!templeId || !currentSlug) return

  try {
    pageEditorStore.currentLocale = newLocale
    locale.value = newLocale

    router.replace({ query: { ...route.query, locale: newLocale } })

    await pageEditorStore.reloadCurrentPage(newLocale)

    markClean(currentSlug)
  } catch (error) {
    console.error('語言切換失敗:', error)
    pageEditorStore.error = t('editorLayout.errorLocaleSwitch') + error.message
  }
}

const confirmLeave = () =>
  !hasUnsavedChanges.value || confirm(t('editorLayout.confirmLeaveUnsaved'))

const handleSettings = () => {
  if (!confirmLeave()) return
  const templeId = getTempleId()
  if (templeId) {
    router.push({ name: 'app.temple.website-settings', params: { templeId } })
  }
}

const handleSelectTemplate = () => {
  if (!confirmLeave()) return
  const templeId = getTempleId()
  if (templeId) {
    router.push({ name: 'app.temple.template-selection', params: { templeId } })
  }
}

const handleUpgrade = () => {
  if (!confirmLeave()) return
  const templeId = getTempleId()
  if (templeId) {
    router.push({ name: 'app.temple.pricing-plans', params: { templeId } })
  }
}

const handlePreview = () => {
  const templeId = getTempleId()
  const slug = pageEditorStore.currentPageSlug
  const loc = pageEditorStore.currentLocale

  if (templeId && slug) {
    const resolved = router.resolve({
      name: 'app.temple.preview',
      params: { templeId },
      query: { slug, locale: loc, source: 'cms' }
    })
    window.open(resolved.href, '_blank')
  } else {
    alert(t('editorLayout.alertSelectPage'))
  }
}

const handleSave = async () => {
  try {
    const success = await pageEditorStore.saveCurrentPage()
    if (success) {
      alert(t('editorLayout.alertSaveSuccess'))
      markClean(pageEditorStore.currentPageSlug)
      showTemplateNotice.value = false
    } else {
      alert(t('editorLayout.alertSaveFail'))
    }
  } catch (error) {
    alert(t('editorLayout.alertSaveError') + error.message)
  }
}

const handleDelete = async () => {
  const confirmed = confirm(t('editorLayout.confirmDelete'))
  if (!confirmed) return

  const templeId = getTempleId()
  const currentSlug = pageEditorStore.currentPageSlug

  if (!templeId || !currentSlug) {
    alert(t('editorLayout.alertDeleteMissingInfo'))
    return
  }

  try {
    const success = await pageEditorStore.deleteDraft(currentSlug, templeId)
    if (success) {
      markClean(currentSlug)
    } else {
      alert(t('editorLayout.alertDeleteFail') + (pageEditorStore.error || t('editorLayout.unknownError')))
    }
  } catch (error) {
    alert(t('editorLayout.alertDeleteError') + error.message)
  }
}

onUnmounted(() => {})

const handleGoToWebsite = () => {}

const handlePublish = () => {
  showPublishDialog.value = true
}

const handleConfirmPublish = async () => {
  const templeId = getTempleId()

  if (!templeId) {
    alert(t('editorLayout.alertMissingTempleId'))
    if (publishDialogRef.value) publishDialogRef.value.resetPublishing()
    return
  }

  try {
    if (hasUnsavedChanges.value) {
      const saveSuccess = await pageEditorStore.saveCurrentPage()
      if (!saveSuccess) {
        alert(t('editorLayout.alertPublishSaveFail'))
        if (publishDialogRef.value) publishDialogRef.value.resetPublishing()
        return
      }
      markClean(pageEditorStore.currentPageSlug)
    }

    const publishSuccess = await pageEditorStore.publishWebsite(
      templeId,
      pageEditorStore.currentLocale
    )

    if (publishSuccess) {
      showPublishDialog.value = false
      alert(t('editorLayout.alertPublishSuccess'))
      markAllClean()
    } else {
      alert(t('editorLayout.alertPublishFail') + (pageEditorStore.error || t('editorLayout.unknownError')))
    }
  } catch (error) {
    alert(t('editorLayout.alertPublishError') + error.message)
  } finally {
    if (publishDialogRef.value) publishDialogRef.value.resetPublishing()
  }
}

const handleCancelPublish = () => {
  showPublishDialog.value = false
}
</script>

<style scoped>
.editor-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: #f5f5f5;
  overflow: hidden;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  background: #fff;
  padding: 24px 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.template-notice {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 24px;
  background: #e8f4fd;
  border-bottom: 1px solid #90caf9;
  color: #1565c0;
  font-size: 14px;
  font-weight: 500;
  z-index: 100;

  .close-btn {
    background: none;
    border: none;
    font-size: 16px;
    color: #1565c0;
    cursor: pointer;
    padding: 0 4px;
    opacity: 0.7;
    &:hover { opacity: 1; }
  }
}

.notice-slide-enter-active { transition: all 0.3s ease; }
.notice-slide-leave-active { transition: all 0.25s ease; }
.notice-slide-enter-from   { opacity: 0; transform: translateY(-8px); }
.notice-slide-leave-to     { opacity: 0; transform: translateY(-8px); }

.error-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #fff3cd;
  border-bottom: 1px solid #ffc107;
  color: #856404;
  font-size: 14px;
  z-index: 100;
}

.error-banner .close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #856404;
  cursor: pointer;
  padding: 0 8px;
}

.page-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
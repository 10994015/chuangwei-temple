<template>
  <div class="editor-layout">
    <!-- 字型樣式 - 只套用到畫布區域 -->
    <component :is="'style'" v-if="globalFontFamily">
      .canvas-area,
      .canvas-area *,
      .temple-website,
      .temple-website * {
        font-family: {{ globalFontFamily }} !important;
      }
    </component>

    <!-- 工具列 -->
    <EditorToolbar
      :current-locale="pageEditorStore.currentLocale"
      :locales="pageEditorStore.locales"
      :has-unsaved-changes="hasUnsavedChanges"
      @locale-change="handleLocaleChange"
      @settings="handleSettings"
      @select-template="handleSelectTemplate"
      @upgrade="handleUpgrade"
      @preview="handlePreview"
      @save="handleSave"
      @delete="handleDelete"
      @go-to-website="handleGoToWebsite"
      @publish="handlePublish"
    />

    <!-- 載入遮罩 -->
    <div v-if="pageEditorStore.isLoading" class="loading-overlay">
      <div class="loading-spinner">載入中...</div>
    </div>

    <!-- 錯誤提示 -->
    <div v-if="pageEditorStore.error" class="error-banner">
      <span>⚠️ {{ pageEditorStore.error }}</span>
      <button @click="pageEditorStore.error = null" class="close-btn">✕</button>
    </div>

    <!-- 頁面內容 -->
    <div class="page-content">
      <router-view />
    </div>

    <!-- 發布對話框 -->
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePageEditorStore } from '@/stores/pageEditor'
import EditorToolbar from '@/components/Editor/EditorToolbar.vue'
import PublishDialog from '@/components/PublishDialog.vue'
import { useI18n } from 'vue-i18n'
import { fontGoogleMap, loadGoogleFont } from '@/composables/useGoogleFont'

const { locale } = useI18n()

const router = useRouter()
const route = useRoute()
const pageEditorStore = usePageEditorStore()

// 發布對話框狀態
const showPublishDialog = ref(false)
const publishDialogRef = ref(null)

// 追蹤未保存變更
const hasUnsavedChanges = ref(false)

// ✅ 直接從 store 讀取 websiteSettings（reactive，store 更新時自動重算）
const websiteSettings = computed(() => pageEditorStore.websiteSettings)

// 可用字型清單（cssFamily 對照）
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

// 依 locale 取得對應字型欄位值
const currentFontValue = computed(() => {
  if (!websiteSettings.value) return null
  const loc = pageEditorStore.currentLocale
  if (loc === 'ZH-CN') return websiteSettings.value.frontFamilyZhCn
  if (loc === 'EN-US') return websiteSettings.value.frontFamilyEnUs
  return websiteSettings.value.frontFamilyZhTw
})

// 計算全域字型（套用到畫布）
const globalFontFamily = computed(() => {
  if (!currentFontValue.value) return "'Noto Sans TC', sans-serif"
  const font = availableFonts.find(f => f.value === currentFontValue.value)
  return font ? font.cssFamily : "'Noto Sans TC', sans-serif"
})

// ✅ 載入網站設定，並動態注入用到的字型
const loadWebsiteSettings = async () => {
  const templeId = getTempleId()
  if (!templeId) return

  try {
    console.log('📥 載入網站設定（字型）...')
    await pageEditorStore.fetchWebsiteSettings(templeId)

    const s = pageEditorStore.websiteSettings
    if (s) {
      // ✅ 只載入這個宮廟實際設定的三個字型
      loadGoogleFont(fontGoogleMap[s.frontFamilyZhTw])
      loadGoogleFont(fontGoogleMap[s.frontFamilyZhCn])
      loadGoogleFont(fontGoogleMap[s.frontFamilyEnUs])
      console.log('✓ 字型已動態載入:', s.frontFamilyZhTw, s.frontFamilyZhCn, s.frontFamilyEnUs)
    }
  } catch (error) {
    console.error('❌ 載入網站設定失敗:', error)
  }
}

// ✅ 將 locale 寫入網址 query（不觸發頁面跳轉）
const syncLocaleToUrl = (newLocale) => {
  router.replace({
    query: { ...route.query, locale: newLocale }
  })
}

// 提供給子組件使用
provide('setUnsavedChanges', (value) => {
  hasUnsavedChanges.value = value
})

provide('pageEditorStore', pageEditorStore)

// 監聽數據變化
watch(
  () => pageEditorStore.currentPageBasemaps,
  () => {
    hasUnsavedChanges.value = true
  },
  { deep: true }
)

// 獲取 templeId
const getTempleId = () => {
  return route.params.templeId
}

// 初始化
onMounted(async () => {
  console.log('🚀 EditorLayout 初始化')

  const templeId = getTempleId()

  if (!templeId) {
    pageEditorStore.error = '無法載入頁面：缺少宮廟 ID'
    return
  }

  pageEditorStore.resetStore()
  pageEditorStore.setTenantId(templeId)

  // ✅ 從網址 query 讀取 locale，有則優先使用，否則維持 store 預設值
  const localeFromQuery = route.query.locale
  if (localeFromQuery) {
    pageEditorStore.currentLocale = localeFromQuery
    locale.value = localeFromQuery
    console.log('✓ 從網址讀取語言:', localeFromQuery)
  } else {
    syncLocaleToUrl(pageEditorStore.currentLocale)
    locale.value = pageEditorStore.currentLocale
  }

  try {
    // ✅ 載入網站設定並動態注入字型
    await loadWebsiteSettings()

    // 載入語言清單
    await pageEditorStore.fetchLocales(templeId)
    console.log('✓ 語言清單已載入')

    // ✅ 載入頁面選單（帶入當前語言）
    await pageEditorStore.fetchHeaderTabs(templeId, pageEditorStore.currentLocale)
    console.log('✓ Header Tabs 已載入:', pageEditorStore.headerTabs)

    if (pageEditorStore.headerTabs.length > 0) {
      // ✅ 從網址 query 讀取上次的 slug，找不到則用第一個 tab
      const slugFromQuery = route.query.slug
      const targetTab = slugFromQuery
        ? pageEditorStore.headerTabs.find(t => t.slug === slugFromQuery)
        : null
      const initialTab = targetTab || pageEditorStore.headerTabs[0]

      console.log('🔄 初始化頁面:', initialTab.slug, '(來源:', targetTab ? 'query' : '預設第一頁', ')')

      // ✅ 強制帶 locale 載入，避免舊快取造成語言閃爍
      await pageEditorStore.switchPageWithLocale(initialTab.slug, pageEditorStore.currentLocale)
      console.log('✓ 頁面已初始化:', initialTab.slug)

      pageEditorStore.syncHeaderMenuFromTabs()
      console.log('✓ Header 選單已同步')

      await pageEditorStore.fetchSystemFrames(templeId, initialTab.slug)
      console.log('✓ 系統框架已載入:', pageEditorStore.currentPageSystemFrames)

      // ✅ 確保網址同時有 slug 和 locale
      router.replace({
        query: {
          ...route.query,
          slug: initialTab.slug,
          locale: pageEditorStore.currentLocale
        }
      })

      hasUnsavedChanges.value = false
    } else {
      console.warn('⚠️ 沒有 Header Tabs 數據')
      pageEditorStore.error = '無法載入頁面列表'
    }

    console.log('✓ EditorLayout 初始化完成')
  } catch (error) {
    console.error('❌ EditorLayout 初始化失敗:', error)
    pageEditorStore.error = '載入頁面失敗，請稍後再試'
  }
})

// ==================== 工具列事件處理 ====================

const handleLocaleChange = async (newLocale) => {
  console.log('🌐 EditorLayout: 切換語言:', newLocale, '| 當前頁面:', pageEditorStore.currentPageSlug)

  const templeId = getTempleId()
  const currentSlug = pageEditorStore.currentPageSlug

  if (!templeId || !currentSlug) {
    console.error('❌ 缺少必要參數')
    return
  }

  try {
    pageEditorStore.currentLocale = newLocale
    locale.value = newLocale

    // ✅ 將新語言寫入網址 query（保留 slug）
    router.replace({
      query: { ...route.query, locale: newLocale }
    })

    // ✅ 重新載入對應語言的 tabs
    await pageEditorStore.fetchHeaderTabs(templeId, newLocale)
    pageEditorStore.syncHeaderMenuFromTabs()

    await pageEditorStore.reloadCurrentPage(newLocale)

    console.log('✓ 語言切換完成')
    hasUnsavedChanges.value = false
  } catch (error) {
    console.error('❌ 語言切換失敗:', error)
    pageEditorStore.error = '語言切換失敗：' + error.message
  }
}

const handleSettings = () => {
  const templeId = getTempleId()
  if (templeId) {
    router.push({
      name: 'app.temple.website-settings',
      params: { templeId }
    })
  }
}

const handleSelectTemplate = () => {
  const templeId = getTempleId()
  if (templeId) {
    router.push({
      name: 'app.temple.template-selection',
      params: { templeId }
    })
  }
}

const handleUpgrade = () => {
  const templeId = getTempleId()
  if (templeId) {
    router.push({
      name: 'app.temple.pricing-plans',
      params: { templeId }
    })
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
      query: { slug, locale: loc }
    })
    window.open(resolved.href, '_blank')
  } else {
    alert('請先選擇要預覽的頁面')
  }
}

const handleSave = async () => {
  try {
    const success = await pageEditorStore.saveCurrentPage()

    if (success) {
      alert('儲存成功！')
      hasUnsavedChanges.value = false
    } else {
      alert('儲存失敗，請稍後再試')
    }
  } catch (error) {
    alert('儲存失敗：' + error.message)
  }
}

const handleDelete = async () => {
  const confirmed = confirm('確定要刪除草稿嗎？')
  if (!confirmed) return

  const templeId = getTempleId()
  const currentSlug = pageEditorStore.currentPageSlug

  if (!templeId || !currentSlug) {
    alert('無法刪除草稿：缺少必要資訊')
    return
  }

  try {
    const success = await pageEditorStore.deleteDraft(currentSlug, templeId)

    if (success) {
      hasUnsavedChanges.value = false
    } else {
      alert('刪除失敗：' + (pageEditorStore.error || '未知錯誤'))
    }
  } catch (error) {
    console.error('❌ 刪除草稿時發生錯誤:', error)
    alert('刪除失敗：' + error.message)
  }
}

const handleGoToWebsite = () => {
  // window.location.href = "http://127.0.0.1:8000/site/" + getTempleId()
}

const handlePublish = () => {
  console.log('📋 打開發布對話框')
  showPublishDialog.value = true
}

const handleConfirmPublish = async () => {
  const templeId = getTempleId()

  if (!templeId) {
    alert('缺少宮廟 ID')
    if (publishDialogRef.value) publishDialogRef.value.resetPublishing()
    return
  }

  try {
    console.log('🚀 開始發布流程...')

    if (hasUnsavedChanges.value) {
      console.log('💾 檢測到未保存變更，先保存草稿...')

      const saveSuccess = await pageEditorStore.saveCurrentPage()

      if (!saveSuccess) {
        alert('保存草稿失敗，無法發布')
        if (publishDialogRef.value) publishDialogRef.value.resetPublishing()
        return
      }

      console.log('✓ 草稿已保存')
      hasUnsavedChanges.value = false
    }

    console.log('🚀 發布網站...')

    const publishSuccess = await pageEditorStore.publishWebsite(
      templeId,
      pageEditorStore.currentLocale
    )

    if (publishSuccess) {
      console.log('網站發布成功！')
      showPublishDialog.value = false
      alert('網站發布成功！')
      hasUnsavedChanges.value = false
    } else {
      alert('發布失敗：' + (pageEditorStore.error || '未知錯誤'))
    }
  } catch (error) {
    console.error('❌ 發布過程發生錯誤:', error)
    alert('發布失敗：' + error.message)
  } finally {
    if (publishDialogRef.value) publishDialogRef.value.resetPublishing()
  }
}

const handleCancelPublish = () => {
  console.log('❌ 取消發布')
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
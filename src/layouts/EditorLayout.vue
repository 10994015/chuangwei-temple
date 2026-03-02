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

// 可用字型清單（按語言分類，與 WebsiteSettings.vue 一致）
const availableFonts = [
  // 繁體中文
  { value: 'ibm-plex-sans-tc',    label: 'IBM Plex Sans TC',    cssFamily: "'IBM Plex Sans TC', sans-serif" },
  { value: 'lxgw-wenkai-mono-tc', label: 'LXGW WenKai Mono TC', cssFamily: "'LXGW WenKai Mono TC', monospace" },
  { value: 'noto-sans-tc',        label: 'Noto Sans TC',         cssFamily: "'Noto Sans TC', sans-serif" },
  { value: 'noto-serif-tc',       label: 'Noto Serif TC',        cssFamily: "'Noto Serif TC', serif" },
  // 簡體中文
  { value: 'noto-sans-sc',        label: 'Noto Sans SC',         cssFamily: "'Noto Sans SC', sans-serif" },
  { value: 'noto-serif-sc',       label: 'Noto Serif SC',        cssFamily: "'Noto Serif SC', serif" },
  { value: 'ibm-plex-sans-sc',    label: 'IBM Plex Sans SC',     cssFamily: "'IBM Plex Sans SC', sans-serif" },
  // 英文
  { value: 'bona-nova',           label: 'Bona Nova',            cssFamily: "'Bona Nova', serif" },
  { value: 'inter',               label: 'Inter',                cssFamily: "'Inter', sans-serif" },
  { value: 'cormorant-garamond',  label: 'Cormorant Garamond',   cssFamily: "'Cormorant Garamond', serif" },
  { value: 'montserrat',          label: 'Montserrat',           cssFamily: "'Montserrat', sans-serif" },
  { value: 'playfair-display',    label: 'Playfair Display',     cssFamily: "'Playfair Display', serif" },
]

// 依 locale 取得對應字型欄位值
const currentFontValue = computed(() => {
  if (!websiteSettings.value) return null
  const locale = pageEditorStore.currentLocale
  if (locale === 'ZH-CN') return websiteSettings.value.frontFamilyZhCn
  if (locale === 'EN-US') return websiteSettings.value.frontFamilyEnUs
  return websiteSettings.value.frontFamilyZhTw  // ZH-TW 及預設
})

// 計算全域字型（套用到畫布）
const globalFontFamily = computed(() => {
  if (!currentFontValue.value) return "'Noto Sans TC', sans-serif"
  const font = availableFonts.find(f => f.value === currentFontValue.value)
  return font ? font.cssFamily : "'Noto Sans TC', sans-serif"
})

// ✅ 載入網站設定（只負責呼叫 API，store 內部自動更新 websiteSettings）
const loadWebsiteSettings = async () => {
  const templeId = getTempleId()
  if (!templeId) return

  try {
    console.log('📥 載入網站設定（字型）...')
    await pageEditorStore.fetchWebsiteSettings(templeId)
    console.log('✓ 網站字型已載入:', {
      zhTw: pageEditorStore.websiteSettings?.frontFamilyZhTw,
      zhCn: pageEditorStore.websiteSettings?.frontFamilyZhCn,
      enUs: pageEditorStore.websiteSettings?.frontFamilyEnUs
    })
  } catch (error) {
    console.error('❌ 載入網站設定失敗:', error)
  }
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
  
  try {
    // 載入網站設定（字型）
    await loadWebsiteSettings()
    
    // 載入語言清單
    await pageEditorStore.fetchLocales(templeId)
    console.log('✓ 語言清單已載入')
    
    // 載入頁面選單
    await pageEditorStore.fetchHeaderTabs(templeId)
    console.log('✓ Header Tabs 已載入:', pageEditorStore.headerTabs)
    
    // 如果有頁面，初始化第一個頁面
    if (pageEditorStore.headerTabs.length > 0) {
      const firstTab = pageEditorStore.headerTabs[0]
      console.log('🔄 初始化第一個頁面:', firstTab.slug)
      
      await pageEditorStore.initializePage(firstTab.slug)
      console.log('✓ 頁面已初始化:', firstTab.slug)
      
      pageEditorStore.syncHeaderMenuFromTabs()
      console.log('✓ Header 選單已同步')
      
      await pageEditorStore.fetchSystemFrames(templeId, firstTab.slug)
      console.log('✓ 系統框架已載入:', pageEditorStore.currentPageSystemFrames)
      
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
    
    console.log('📥 重新載入頁面:', currentSlug, '語言:', newLocale)
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
  const locale = pageEditorStore.currentLocale  
  
  if (templeId && slug) {
    const route = router.resolve({
      name: 'app.temple.preview',
      params: { templeId },
      query: { slug, locale }
    })
    window.open(route.href, '_blank')
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
  alert('前往網站功能待實作')
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
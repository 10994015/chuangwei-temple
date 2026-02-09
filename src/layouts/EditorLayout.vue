<template>
  <div class="editor-layout">
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
import { ref, onMounted, watch, provide } from 'vue'
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
  
  pageEditorStore.setTenantId(templeId)
  
  try {
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
      
      // 初始化頁面
      await pageEditorStore.initializePage(firstTab.slug)
      console.log('✓ 頁面已初始化:', firstTab.slug)
      
      // 同步 Header 選單
      pageEditorStore.syncHeaderMenuFromTabs()
      console.log('✓ Header 選單已同步')
      
      // ✅ 重要：載入系統框架
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

// ✅ 語言切換
const handleLocaleChange = async (newLocale) => {
  console.log('🌐 EditorLayout: 切換語言:', newLocale, '| 當前頁面:', pageEditorStore.currentPageSlug)
  
  const templeId = getTempleId()
  const currentSlug = pageEditorStore.currentPageSlug
  
  if (!templeId || !currentSlug) {
    console.error('❌ 缺少必要參數')
    return
  }
  
  try {
    // 更新語言
    pageEditorStore.currentLocale = newLocale
    
    // 重新載入當前頁面
    console.log('📥 重新載入頁面:', currentSlug, '語言:', newLocale)
    await pageEditorStore.reloadCurrentPage(newLocale)
    
    console.log('✓ 語言切換完成')
    hasUnsavedChanges.value = false
  } catch (error) {
    console.error('❌ 語言切換失敗:', error)
    pageEditorStore.error = '語言切換失敗：' + error.message
  }
}

// 設定
const handleSettings = () => {
  const templeId = getTempleId()
  if (templeId) {
    router.push({
      name: 'app.temple.website-settings',
      params: { templeId }
    })
  }
}

// 選擇模板
const handleSelectTemplate = () => {
  const templeId = getTempleId()
  if (templeId) {
    router.push({
      name: 'app.temple.template-selection',
      params: { templeId }
    })
  }
}

// 升級方案
const handleUpgrade = () => {
  const templeId = getTempleId()
  if (templeId) {
    router.push({
      name: 'app.temple.pricing-plans',
      params: { templeId }
    })
  }
}

// 預覽
const handlePreview = () => {
  const templeId = getTempleId()
  const slug = pageEditorStore.currentPageSlug
  const locale = pageEditorStore.currentLocale  // ✅ 加上語言
  
  if (templeId && slug) {
    const route = router.resolve({
      name: 'app.temple.preview',
      params: { templeId },
      query: { 
        slug,
        locale  // ✅ 傳遞語言參數
      }
    })
    window.open(route.href, '_blank')
  } else {
    alert('請先選擇要預覽的頁面')
  }
}

// 儲存
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

// 刪除
const handleDelete = () => {
  if (confirm('確定要刪除此草稿嗎？此操作無法復原！')) {
    alert('刪除草稿功能待實作')
  }
}

// 前往網站
const handleGoToWebsite = () => {
  alert('前往網站功能待實作')
}

// 發布
const handlePublish = () => {
  console.log('📋 打開發布對話框')
  showPublishDialog.value = true
}

// 確認發布
const handleConfirmPublish = async () => {
  const templeId = getTempleId()
  
  if (!templeId) {
    alert('缺少宮廟 ID')
    if (publishDialogRef.value) {
      publishDialogRef.value.resetPublishing()
    }
    return
  }

  try {
    console.log('🚀 開始發布流程...')
    
    // 步驟 1: 如果有未保存的變更，先保存草稿
    if (hasUnsavedChanges.value) {
      console.log('💾 檢測到未保存變更，先保存草稿...')
      
      const saveSuccess = await pageEditorStore.saveCurrentPage()
      
      if (!saveSuccess) {
        alert('保存草稿失敗，無法發布')
        if (publishDialogRef.value) {
          publishDialogRef.value.resetPublishing()
        }
        return
      }
      
      console.log('✓ 草稿已保存')
      hasUnsavedChanges.value = false
    }
    
    // 步驟 2: 發布網站
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
    if (publishDialogRef.value) {
      publishDialogRef.value.resetPublishing()
    }
  }
}

// 取消發布
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
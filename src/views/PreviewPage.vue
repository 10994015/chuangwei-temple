<template>
  <div class="preview-page">
    <!-- 頂部工具列 -->
    <header class="preview-toolbar">
      <div class="toolbar-left">
      </div>
      
      <div class="toolbar-center">
        <h2 class="page-title">網站預覽</h2>
      </div>
      
      <div class="toolbar-right">
        <button class="btn btn-icon" @click="handleRefresh">🔄 重新載入</button>
      </div>
    </header>

    <!-- 載入中 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">載入中...</div>
    </div>

    <!-- 錯誤訊息 -->
    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <h3>⚠️ 載入失敗</h3>
        <p>{{ error }}</p>
        <button @click="loadPreviewData" class="btn-retry">重試</button>
      </div>
    </div>

    <!-- 預覽內容 -->
    <div v-else class="preview-content">
      <div class="website-preview">
        <!-- 動態渲染底圖 -->
        <template v-for="(basemap, index) in basemaps" :key="`basemap-${index}`">
          <div 
            class="basemap-section"
            :class="`basemap-${basemap.bg_type.toLowerCase()}`"
            :style="getBasemapStyle(basemap)"
          >
            <!-- 渲染框架 -->
            <template v-for="(frame, frameIndex) in basemap.frames" :key="`frame-${frameIndex}`">
              <!-- 系統框架 -->
              <SystemFramePreview 
                v-if="isSystemFrame(frame)"
                :frame-type="frame.type"
                :frame-data="frame.data || {}"
                :current-page-slug="currentSlug"
                @change-page="handleChangePage"
              />
              
              <!-- 自訂框架 -->
              <CustomFramePreview
                v-else
                :frame="frame"
              />
            </template>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SystemFramePreview from './PreviewPage/SystemFramePreview.vue'
import CustomFramePreview from './PreviewPage/CustomFramePreview.vue'

const router = useRouter()
const route = useRoute()

// ✅ 注入 Store（如果有）
const pageEditorStore = inject('pageEditorStore', null)

// ==================== 狀態 ====================
const isLoading = ref(false)
const error = ref(null)
const basemaps = ref([])
const currentSlug = ref('home')

// ✅ 從 URL query 或 Store 獲取語言
const currentLocale = ref(
  route.query.locale || 
  pageEditorStore?.currentLocale || 
  'zh-TW'
)

// ✅ 監聽 Store 的語言變化（如果有 Store）
if (pageEditorStore) {
  watch(
    () => pageEditorStore.currentLocale,
    (newLocale) => {
      if (newLocale && newLocale !== currentLocale.value) {
        console.log('🌐 PreviewPage: 檢測到語言變化:', newLocale)
        currentLocale.value = newLocale
        // 重新載入當前頁面
        loadPreviewData()
      }
    }
  )
}

// ✅ 監聽 URL query 的語言變化
watch(
  () => route.query.locale,
  (newLocale) => {
    if (newLocale && newLocale !== currentLocale.value) {
      console.log('🌐 PreviewPage: URL 語言變化:', newLocale)
      currentLocale.value = newLocale
      // 重新載入當前頁面
      loadPreviewData()
    }
  }
)

// ==================== 獲取參數 ====================
const getTempleId = () => {
  return route.params.templeId
}

const getSlug = () => {
  return route.query.slug || 'home'
}

// ==================== API 調用 ====================

/**
 * 載入頁面內容
 */
const fetchPageContent = async (tid, slug, locale) => {
  try {
    console.log(`📥 載入頁面: ${slug} (${locale})`)
    
    const response = await fetch(
      `/api/tenant/${tid}/web-site/draft-page/${slug}?locale=${locale}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    )

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const result = await response.json()

    if (result.statusCode === 200 && result.data) {
      console.log('✓ 頁面內容載入成功')
      return result.data
    }
    throw new Error(result.message || '載入失敗')
  } catch (err) {
    console.error('❌ 載入頁面內容失敗:', err)
    throw err
  }
}

/**
 * 載入預覽數據
 */
const loadPreviewData = async () => {
  const templeId = getTempleId()
  const slug = getSlug()
  
  if (!templeId) {
    error.value = '缺少宮廟 ID'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    // 載入頁面內容
    const data = await fetchPageContent(templeId, slug, currentLocale.value)
    
    if (data && Array.isArray(data)) {
      basemaps.value = data
      currentSlug.value = slug
      console.log('✓ 預覽數據已載入:', basemaps.value.length, '個底圖')
    } else {
      throw new Error('返回的數據格式不正確')
    }
  } catch (err) {
    console.error('❌ 載入預覽數據失敗:', err)
    error.value = err.message || '載入失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}

// ==================== 事件處理 ====================

/**
 * 返回編輯器
 */
const handleBack = () => {
  const templeId = getTempleId()
  if (templeId) {
    router.push({
      name: 'app.temple.page-editor',
      params: { templeId },
      query: { slug: currentSlug.value }
    })
  }
}

/**
 * 切換頁面
 */
const handleChangePage = async (slug) => {
  const templeId = getTempleId()
  
  console.log('🔄 切換預覽頁面:', slug)
  
  isLoading.value = true
  error.value = null
  
  try {
    const data = await fetchPageContent(templeId, slug, currentLocale.value)
    
    if (data && Array.isArray(data)) {
      basemaps.value = data
      currentSlug.value = slug
      
      // 更新 URL
      router.replace({
        query: { slug }
      })
      
      console.log('✓ 頁面已切換:', slug)
    }
  } catch (err) {
    console.error('❌ 切換頁面失敗:', err)
    error.value = '切換頁面失敗'
  } finally {
    isLoading.value = false
  }
}

/**
 * 重新載入
 */
const handleRefresh = () => {
  loadPreviewData()
}

// ==================== 輔助函數 ====================

/**
 * 判斷是否為系統框架
 */
const isSystemFrame = (frame) => {
  if (!frame || !frame.type) return false
  return !frame.type.startsWith('FRAME')
}

/**
 * 獲取底圖背景樣式
 */
const getBasemapStyle = (basemap) => {
  const style = {}
  
  if (basemap.bg_pc_img_src) {
    style.backgroundImage = `url(${basemap.bg_pc_img_src})`
    style.backgroundSize = 'cover'
    style.backgroundPosition = 'center'
    style.backgroundRepeat = 'no-repeat'
  }
  
  return style
}

// ==================== 生命週期 ====================
onMounted(() => {
  console.log('🚀 預覽頁面初始化')
  loadPreviewData()
})
</script>

<style scoped>
.preview-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: #f5f5f5;
  overflow: hidden;
}

/* 工具列 */
.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-left {
  flex: 1;
}

.toolbar-center {
  flex: 1;
  justify-content: center;
}

.toolbar-right {
  flex: 1;
  justify-content: flex-end;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #e5e5e5;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.btn-back {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #f5f5f5;
  color: #333;
  border-color: #bbb;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background: #f5f5f5;
}

.btn-icon {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 載入遮罩 */
.loading-overlay {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
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

/* 錯誤容器 */
.error-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.error-message {
  text-align: center;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 500px;
}

.error-message h3 {
  margin: 0 0 16px;
  font-size: 20px;
  color: #dc3545;
}

.error-message p {
  margin: 0 0 24px;
  color: #666;
  font-size: 14px;
}

.btn-retry {
  padding: 10px 24px;
  background: #E8572A;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-retry:hover {
  background: #d14a1f;
}

/* 預覽內容 */
.preview-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: #fff;
}

.website-preview {
  width: 100%;
  min-height: 100%;
  background: #fff;
}

.basemap-section {
  position: relative;
  width: 100%;
  min-height: 100px;
}

/* 滾動條樣式 */
.preview-content::-webkit-scrollbar {
  width: 8px;
}

.preview-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.preview-content::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 4px;
}

.preview-content::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}
</style>
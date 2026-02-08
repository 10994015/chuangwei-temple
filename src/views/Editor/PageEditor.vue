<template>
  <div class="temple-editor">
    <!-- 頂部工具列 -->
    <header class="toolbar">
      <div class="toolbar-left">
        <!-- 語言選擇器 -->
        <select v-model="pageEditorStore.currentLocale" class="locale-select" @change="handleLocaleChange">
          <option v-for="locale in pageEditorStore.locales" :key="locale.locale" :value="locale.locale">
            {{ locale.label }}
          </option>
        </select>
      </div>
      <div class="toolbar-right">
        <button class="btn btn-icon" @click="handleSettings">
          設定
        </button>
        <button class="btn btn-icon" @click="handleSelectTemplate">
          選擇模板
        </button>
        <button class="btn btn-icon" @click="handleUpgrade">
          升級方案
        </button>
        <div class="toolbar-divider"></div>
        <button class="btn btn-icon" @click="handlePreview">
          預覽
        </button>
        <button class="btn btn-icon" @click="handleSave">
          儲存草稿
        </button>
        <button class="btn btn-icon btn-danger" @click="handleDelete">
          刪除草稿
        </button>
        <div class="toolbar-divider"></div>
        <button class="btn btn-icon btn-secondary" @click="handleGoToWebsite">
          前往網站
        </button>
        <button class="btn btn-primary" @click="handlePublish">
          發布網站
        </button>
      </div>
    </header>

    <!-- 載入遮罩 -->
    <div v-if="pageEditorStore.isLoading" class="loading-overlay">
      <div class="loading-spinner">載入中...</div>
    </div>

    <!-- 錯誤提示 -->
    <div v-if="pageEditorStore.error" class="error-banner">
      <span>⚠️ {{ pageEditorStore.error }}</span>
      <button @click="pageEditorStore.error = null" class="close-btn">✕</button>
    </div>

    <!-- 主要內容區 -->
    <div class="editor-body">
      <!-- 左側：元件庫 -->
      <LeftSidebar @drag-start="handleDragStart" />

      <!-- 中間：畫布區 -->
      <CanvasArea
        :basemaps="pageEditorStore.currentPageBasemaps"
        :selected-basemap="pageEditorStore.selected.basemap"
        :selected-frame="pageEditorStore.selected.frame"
        :selected-element="pageEditorStore.selected.element"
        :current-page-slug="pageEditorStore.currentPageSlug"
        @select-basemap="handleSelectBasemap"
        @select-frame="handleSelectFrame"
        @select-element="handleSelectElement"
        @update-element="handleUpdateElement"
        @update-background="handleUpdateBackground"
        @select-cell="handleSelectCell"
        @drop-to-basemap="handleDropToBasemap"
        @drop-to-cell="handleDropToCell"
        @delete-basemap="handleDeleteBasemap"
        @delete-element="handleDeleteElement"
        @move-basemap-up="handleMoveBasemapUp"
        @move-basemap-down="handleMoveBasemapDown"
        @add-basemap="handleAddBasemap"
        @change-page="handleHeaderPageChange"
      />

      <!-- 右側：屬性面板 -->
      <PropsPanel
        :selected-basemap="pageEditorStore.selected.basemap"
        :selected-frame="pageEditorStore.selected.frame"
        :selected-element="pageEditorStore.selected.element"
        @upload-background="handleUploadBackground"
        @upload-image="handleUploadImage"
        @upload-carousel="handleUploadCarousel"
        @update-logo="handleUpdateLogo"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePageEditorStore } from '@/stores/pageEditor'
import LeftSidebar from './PageEditor/LeftSidebar.vue'
import CanvasArea from './PageEditor/CanvasArea.vue'
import PropsPanel from './PageEditor/PropsPanel.vue'

const router = useRouter()
const route = useRoute()

const pageEditorStore = usePageEditorStore()

const emit = defineEmits(['save', 'publish', 'preview'])

// ==================== 獲取 templeId ====================
const getTempleId = () => {
  const templeId = route.params.templeId
  
  if (!templeId) {
    console.error('❌ 無法從路由獲取 templeId')
    return null
  }
  
  return templeId
}

// ==================== 初始化 ====================
onMounted(async () => {
  console.log('🚀 PageEditor 初始化')
  
  const templeId = getTempleId()
  
  if (!templeId) {
    pageEditorStore.error = '無法載入頁面：缺少宮廟 ID'
    return
  }
  
  pageEditorStore.setTenantId(templeId)
  
  try {
    // ✅ 載入語言清單
    await pageEditorStore.fetchLocales(templeId)
    
    // 載入 Header Tabs
    await pageEditorStore.fetchHeaderTabs(templeId)
    
    // 初始化第一個頁面
    if (pageEditorStore.headerTabs.length > 0) {
      const firstTab = pageEditorStore.headerTabs[0]
      await pageEditorStore.initializePage(firstTab.slug)
      pageEditorStore.syncHeaderMenuFromTabs()
      
      console.log('✓ 已初始化頁面:', firstTab.slug)
    } else {
      console.warn('⚠️ 沒有 Header Tabs 數據')
      pageEditorStore.error = '無法載入頁面列表'
    }
  } catch (error) {
    console.error('❌ 初始化失敗:', error)
    pageEditorStore.error = '載入頁面失敗，請稍後再試'
  }
})

// 監聽頁面切換
watch(
  () => pageEditorStore.currentPageSlug,
  (newSlug) => {
    if (newSlug) {
      console.log('✓ 當前頁面:', newSlug)
    }
  }
)

// ==================== 頁面操作 ====================
const handlePageChange = async () => {
  const newSlug = pageEditorStore.currentPageSlug
  await pageEditorStore.switchPage(newSlug)
}

// ==================== Header 選單切換頁面 ====================
const handleHeaderPageChange = async (slug) => {
  console.log('📄 從 Header 切換頁面:', slug)
  
  try {
    // 切換到新頁面
    await pageEditorStore.switchPage(slug)
    console.log('✓ 頁面切換完成')
  } catch (error) {
    console.error('❌ 頁面切換失敗:', error)
    pageEditorStore.error = '頁面切換失敗，請重試'
  }
}

// ==================== 語言切換 ====================
const handleLocaleChange = async () => {
  const newLocale = pageEditorStore.currentLocale
  console.log('🌐 切換語言:', newLocale)
  
  try {
    // 重新載入當前頁面（使用新語言）
    await pageEditorStore.reloadCurrentPage(newLocale)
    console.log('✓ 語言切換完成')
  } catch (error) {
    console.error('❌ 語言切換失敗:', error)
    pageEditorStore.error = '語言切換失敗，請重試'
  }
}

// ==================== 選擇處理 ====================
const handleSelectBasemap = (basemap) => {
  console.log('✓ 選擇底圖:', basemap.bg_type)
  pageEditorStore.selectBasemap(basemap)
}

const handleSelectFrame = (frame) => {
  console.log('✓ 選擇框架:', frame.type)
  pageEditorStore.selectFrame(frame)
}

const handleSelectElement = (data) => {
  console.log('✓ 選擇元件:', data)
  pageEditorStore.selectElement(data)
}

const handleSelectCell = (data) => {
  pageEditorStore.clearSelection()
}

// ==================== 元件更新 ====================
const handleUpdateElement = (data) => {
  console.log('✓ 更新元件:', data)
  
  if (data.type === 'logo') {
    // 更新 Logo（直接修改 API 數據結構）
    if (data.frame && data.frame.data) {
      data.frame.data.logo_img_src = data.data.src
      data.frame.data.logo_img_id = data.data.id || null
      console.log('✓ Logo 已更新')
    }
  }
}

// ==================== 拖曳處理 ====================
const handleDragStart = ({ event, item, type }) => {
  console.log('開始拖曳:', type, item)
}

const handleDropToBasemap = ({ basemap, basemapIndex, frame }) => {
  console.log('✓ 放置框架到底圖:', frame)
  
  // 從拖曳數據中提取框架類型
  let frameType = null
  
  // 自訂框架：layout → API type
  if (frame.dragType === 'custom-frame' && frame.layout) {
    // layout: "1_1" → type: "FRAME1_1"
    // layout: "A" → type: "FRAME_A"
    
    // 移除可能存在的連字號或底線，統一處理
    const cleanLayout = frame.layout.replace(/-/g, '_')
    frameType = `FRAME${cleanLayout}`
    
    console.log(`✓ 自訂框架: ${frame.layout} → ${frameType}`)
  }
  // 系統框架：直接使用 type
  else if (frame.dragType === 'system-frame' && frame.type) {
    frameType = frame.type  // HEADER, FOOTER, INDEX_NEWS...
  }
  // 如果已經是 API 格式（有 type 屬性）
  else if (frame.type) {
    frameType = frame.type
  }
  
  // 檢查 frameType 是否有效
  if (!frameType) {
    console.error('❌ 無法確定框架類型:', frame)
    alert('框架數據錯誤，請重試')
    return
  }
  
  console.log('✓ 最終框架類型:', frameType)
  
  // 創建新框架（使用 API 格式）
  const newFrame = {
    type: frameType,
    is_deletable: true,
    is_draggable: true,
    data: {},
    elements: []
  }
  
  if (!basemap.frames) {
    basemap.frames = []
  }
  
  basemap.frames.push(newFrame)
  
  console.log('✓ 框架已添加:', newFrame)
}

const handleDropToCell = ({ frame, cellIndex, element }) => {
  console.log('✓ 放置元件到格子:', { frame, cellIndex, element })
  
  // 確保 frame.elements 是陣列
  if (!frame.elements) {
    frame.elements = []
  }
  
  // 在指定位置插入元件（如果位置超出陣列長度，填充空值）
  while (frame.elements.length < cellIndex) {
    frame.elements.push(null)
  }
  
  // 設置元件到指定位置
  if (frame.elements[cellIndex]) {
    alert('此格子已有元件')
    return
  }
  
  frame.elements[cellIndex] = element
  console.log('✓ 元件已添加到索引:', cellIndex)
}

// ==================== 底圖操作 ====================
const handleDeleteBasemap = (index) => {
  if (confirm('確定要刪除此底圖嗎？')) {
    pageEditorStore.deleteBasemap(index)
  }
}

const handleAddBasemap = (currentIndex) => {
  pageEditorStore.addBasemap(currentIndex)
}

const handleMoveBasemapUp = (index) => {
  pageEditorStore.moveBasemapUp(index)
}

const handleMoveBasemapDown = (index) => {
  pageEditorStore.moveBasemapDown(index)
}

// ==================== 元件操作 ====================
const handleDeleteElement = (data) => {
  if (data.type === 'logo') {
    if (confirm('確定要刪除 Logo 嗎？')) {
      if (data.frame && data.frame.data) {
        data.frame.data.logo_img_src = null
        data.frame.data.logo_img_id = null
      }
      pageEditorStore.clearSelection()
    }
    return
  }
  
  // 處理自訂框架的元件刪除
  if (data.frame && data.elementIndex !== undefined) {
    if (confirm('確定要刪除此元件嗎？')) {
      // ✅ 使用 null 替代元件，保持索引位置不變
      if (data.frame.elements && data.frame.elements[data.elementIndex]) {
        // 不使用 splice，而是設置為 null
        data.frame.elements[data.elementIndex] = null
        pageEditorStore.clearSelection()
        console.log('✓ 元件已刪除（索引保留）')
      }
    }
  }
}

// ==================== 上傳處理 ====================

// ⭐ 處理從 BasemapWrapper 上傳的背景（透過 CanvasArea emit）
const handleUpdateBackground = (data) => {
  console.log('PageEditor 收到背景更新:', data)
  
  const { basemap, type, imageData } = data
  
  if (!basemap) {
    console.error('找不到底圖')
    return
  }
  
  // 找到 Store 中對應的底圖（確保響應式更新）
  const basemaps = pageEditorStore.currentPageBasemaps
  const targetBasemap = basemaps.find(b => 
    b.bg_type === basemap.bg_type && b.bg_sequence === basemap.bg_sequence
  )
  
  if (!targetBasemap) {
    console.error('在 Store 中找不到對應的底圖')
    return
  }
  
  // 更新背景圖片
  switch (type) {
    case 'desktop':
      targetBasemap.bg_pc_img_src = imageData
      targetBasemap.bg_pc_img_id = null
      break
    case 'tablet':
      targetBasemap.bg_tablet_img_src = imageData
      targetBasemap.bg_tablet_img_id = null
      break
    case 'mobile':
      targetBasemap.bg_phone_img_src = imageData
      targetBasemap.bg_phone_img_id = null
      break
  }
  
  console.log('✓ 背景已更新到 Store')
}

const handleUploadBackground = () => {
  // 檢查是否有選中的底圖
  const selectedBasemap = pageEditorStore.selected.basemap
  
  if (!selectedBasemap) {
    alert('請先選擇一個底圖')
    return
  }
  
  if (!selectedBasemap.bg_can_change_img) {
    alert('此底圖不允許更換背景圖片')
    return
  }
  
  // 創建檔案選擇器
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // 檢查檔案大小（限制 5MB）
      if (file.size > 5 * 1024 * 1024) {
        alert('圖片大小不能超過 5MB')
        return
      }
      
      // 讀取圖片
      const reader = new FileReader()
      reader.onload = (event) => {
        // 更新底圖的背景圖片（API 格式）
        selectedBasemap.bg_pc_img_src = event.target.result
        selectedBasemap.bg_pc_img_id = null // 本地圖片沒有 ID
        
        // 也可以同時設置平板和手機版本
        selectedBasemap.bg_tablet_img_src = event.target.result
        selectedBasemap.bg_phone_img_src = event.target.result
        
        console.log('✓ 底圖背景已更新')
      }
      
      reader.onerror = () => {
        alert('讀取圖片失敗，請重試')
      }
      
      reader.readAsDataURL(file)
    }
  }
  
  input.click()
}

const handleUploadImage = () => {
  // 檢查是否有選中的元件
  const selectedElement = pageEditorStore.selected.element
  
  if (!selectedElement || !selectedElement.element) {
    alert('請先選擇一個圖片元件')
    return
  }
  
  if (selectedElement.element.type !== 'IMG') {
    alert('只有圖片元件才能上傳圖片')
    return
  }
  
  // 創建檔案選擇器
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // 檢查檔案大小
      if (file.size > 5 * 1024 * 1024) {
        alert('圖片大小不能超過 5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (event) => {
        // 更新元件的圖片（API 格式）
        if (!selectedElement.element.value) {
          selectedElement.element.value = {}
        }
        
        selectedElement.element.value.src = event.target.result
        selectedElement.element.value.id = null
        
        console.log('✓ 元件圖片已更新')
      }
      
      reader.onerror = () => {
        alert('讀取圖片失敗，請重試')
      }
      
      reader.readAsDataURL(file)
    }
  }
  
  input.click()
}

const handleUploadCarousel = () => {
  // TODO: 實現輪播圖片上傳
  alert('輪播圖片上傳功能待實作')
}

const handleUpdateLogo = (logoData) => {
  pageEditorStore.updateHeaderLogo(logoData.src, logoData.id)
}

// ==================== 工具列操作 ====================
const handleSettings = () => {
  const templeId = getTempleId()
  if (!templeId) {
    console.error('❌ 無法取得 templeId')
    return
  }
  
  // 使用 router 導航到設定頁面
  router.push({
    name: 'app.temple.website-settings',
    params: { templeId: templeId }
  })
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
  alert('預覽功能待實作')
}

const handleSave = async () => {
  try {
    const success = await pageEditorStore.saveCurrentPage()
    
    if (success) {
      alert('儲存成功！')
    } else {
      alert('儲存失敗，請稍後再試')
    }
  } catch (error) {
    alert('儲存失敗：' + error.message)
  }
}

const handleDelete = () => {
  if (confirm('確定要刪除此草稿嗎？此操作無法復原！')) {
    alert('刪除草稿功能待實作')
  }
}

const handleGoToWebsite = () => {
  alert('前往網站功能待實作')
}

const handlePublish = () => {
  if (confirm('確定要發布網站嗎？')) {
    alert('網站已發布！')
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.temple-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
  background: #f5f5f5;
  overflow: hidden;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
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

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #e5e5e5;
}

.page-select {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.locale-select {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background: #fff;
  min-width: 120px;
}

.locale-select:hover {
  border-color: #E8572A;
}

.page-select-mini {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  background: #f8f9fa;
  min-width: 100px;
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

.btn:hover:not(:disabled) {
  background: #f5f5f5;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #E8572A;
  color: #fff;
  border-color: #E8572A;
}

.btn-secondary {
  color: #E8572A;
  border-color: #E8572A;
}

.btn-danger {
  color: #dc3545;
}

.editor-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}
</style>
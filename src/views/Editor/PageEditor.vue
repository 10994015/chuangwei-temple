<script setup>
import { ref, inject, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LeftSidebar from './PageEditor/LeftSidebar.vue'
import CanvasArea from './PageEditor/CanvasArea.vue'
import PropsPanel from './PageEditor/PropsPanel.vue'

const router = useRouter()
const route = useRoute()

// 從佈局組件注入
const pageEditorStore = inject('pageEditorStore')
const setUnsavedChanges = inject('setUnsavedChanges')

// 監聽數據變化
watch(
  () => pageEditorStore.currentPageBasemaps,
  () => {
    setUnsavedChanges(true)
  },
  { deep: true }
)

// ==================== 頁面操作 ====================
const handleHeaderPageChange = async (slug) => {
  console.log('📄 從 Header 切換頁面:', slug)
  
  try {
    await pageEditorStore.switchPage(slug)
    console.log('✓ 頁面切換完成')
    
    // ✅ 切換頁面後重新載入系統框架
    const templeId = route.params.templeId
    if (templeId && slug) {
      await pageEditorStore.fetchSystemFrames(templeId, slug)
      console.log('✓ 系統框架已重新載入')
    }
    
    setUnsavedChanges(false)
  } catch (error) {
    console.error('❌ 頁面切換失敗:', error)
    pageEditorStore.error = '頁面切換失敗，請重試'
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
  console.log('✓ 選擇格子:', data)
  pageEditorStore.selectCell(data)
}

// ==================== 元件更新 ====================
const handleUpdateElement = (data) => {
  console.log('✓ 更新元件:', data)
  
  if (data.type === 'logo') {
    if (data.frame && data.frame.data) {
      data.frame.data.logo_img_src = data.data.src
      data.frame.data.logo_img_id = data.data.id || null
      console.log('✓ Logo 已更新')
    }
  }
}

const handleUpdateCellPadding = (data) => {
  const { frame, cellIndex, padding } = data
  
  console.log('✓ PageEditor: 更新格子 padding', { cellIndex, padding })
  
  if (!frame.elements) {
    frame.elements = []
  }
  
  while (frame.elements.length <= cellIndex) {
    frame.elements.push(null)
  }
  
  if (!frame.elements[cellIndex]) {
    frame.elements[cellIndex] = { 
      type: null, 
      padding: padding 
    }
  } else {
    frame.elements[cellIndex].padding = padding
  }
  
  console.log('✓ 格子 padding 已更新到 Store')
}

// ==================== 拖曳處理 ====================
const handleDragStart = ({ event, item, type }) => {
  console.log('開始拖曳:', type, item)
}

const handleDropToBasemap = ({ basemap, basemapIndex, frame }) => {
  console.log('✓ 放置框架到底圖:', frame)
  
  let frameType = null
  
  if (frame.dragType === 'custom-frame' && frame.layout) {
    const cleanLayout = frame.layout.replace(/-/g, '_')
    frameType = `FRAME${cleanLayout}`
    console.log(`✓ 自訂框架: ${frame.layout} → ${frameType}`)
  } else if (frame.dragType === 'system-frame' && frame.type) {
    frameType = frame.type
  } else if (frame.type) {
    frameType = frame.type
  }
  
  if (!frameType) {
    console.error('❌ 無法確定框架類型:', frame)
    alert('框架數據錯誤，請重試')
    return
  }
  
  console.log('✓ 最終框架類型:', frameType)
  
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
  
  if (!frame.elements) {
    frame.elements = []
  }
  
  while (frame.elements.length < cellIndex) {
    frame.elements.push(null)
  }
  
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
  
  if (data.frame && data.elementIndex !== undefined) {
    if (confirm('確定要刪除此元件嗎？')) {
      if (data.frame.elements && data.frame.elements[data.elementIndex]) {
        data.frame.elements[data.elementIndex] = null
        pageEditorStore.clearSelection()
        console.log('✓ 元件已刪除（索引保留）')
      }
    }
  }
}

// ✅ 刪除框架
const handleDeleteFrame = (data) => {
  console.log('PageEditor: 刪除框架', data)
  
  const { basemap, frame } = data
  
  if (!basemap || !basemap.frames) {
    console.error('❌ 底圖或框架列表不存在')
    return
  }
  
  // 找到框架在 basemap.frames 中的索引
  const frameIndex = basemap.frames.findIndex(f => f === frame)
  
  if (frameIndex === -1) {
    console.error('❌ 找不到要刪除的框架')
    return
  }
  
  console.log(`✓ 找到框架索引: ${frameIndex}`)
  
  // 從 frames 陣列中移除框架
  basemap.frames.splice(frameIndex, 1)
  
  // 清除選中狀態
  pageEditorStore.clearSelection()
  
  console.log('✓ 框架已刪除')
}

// ==================== 上傳處理 ====================
const handleUpdateBackground = (data) => {
  console.log('PageEditor 收到背景更新:', data)
  
  const { basemap, type, imageData } = data
  
  if (!basemap) {
    console.error('找不到底圖')
    return
  }
  
  const basemaps = pageEditorStore.currentPageBasemaps
  const targetBasemap = basemaps.find(b => 
    b.bg_type === basemap.bg_type && b.bg_sequence === basemap.bg_sequence
  )
  
  if (!targetBasemap) {
    console.error('在 Store 中找不到對應的底圖')
    return
  }
  
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
  const selectedBasemap = pageEditorStore.selected.basemap
  
  if (!selectedBasemap) {
    alert('請先選擇一個底圖')
    return
  }
  
  if (!selectedBasemap.bg_can_change_img) {
    alert('此底圖不允許更換背景圖片')
    return
  }
  
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('圖片大小不能超過 5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (event) => {
        selectedBasemap.bg_pc_img_src = event.target.result
        selectedBasemap.bg_pc_img_id = null
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
  const selectedElement = pageEditorStore.selected.element
  
  if (!selectedElement || !selectedElement.element) {
    alert('請先選擇一個圖片元件')
    return
  }
  
  if (selectedElement.element.type !== 'IMG') {
    alert('只有圖片元件才能上傳圖片')
    return
  }
  
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('圖片大小不能超過 5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (event) => {
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
  alert('輪播圖片上傳功能待實作')
}

const handleUpdateLogo = (logoData) => {
  console.log('✓ PageEditor: 更新 Logo', logoData)
  
  // 更新 Store 中的 Header Logo
  pageEditorStore.updateHeaderLogo(logoData.src, logoData.id)
  
  console.log('✓ Logo 已更新到 Store')
}

</script>

<template>
  <div class="editor-body">
    <!-- 左側：元件庫 -->
    <LeftSidebar @drag-start="handleDragStart" />

    <!-- 中間：畫布區 -->
    <CanvasArea
      :basemaps="pageEditorStore.currentPageBasemaps"
      :selected-basemap="pageEditorStore.selected.basemap"
      :selected-frame="pageEditorStore.selected.frame"
      :selected-element="pageEditorStore.selected.element"
      :selected-cell="pageEditorStore.selected.cell"
      :current-page-slug="pageEditorStore.currentPageSlug"
      @select-basemap="handleSelectBasemap"
      @select-frame="handleSelectFrame"
      @select-element="handleSelectElement"
      @update-element="handleUpdateElement"
      @update-background="handleUpdateBackground"
      @select-cell="handleSelectCell"
      @update-cell-padding="handleUpdateCellPadding"
      @drop-to-basemap="handleDropToBasemap"
      @drop-to-cell="handleDropToCell"
      @delete-basemap="handleDeleteBasemap"
      @delete-element="handleDeleteElement"
      @delete-frame="handleDeleteFrame"
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
      :selected-cell="pageEditorStore.selected.cell"
      @upload-background="handleUploadBackground"
      @upload-image="handleUploadImage"
      @upload-carousel="handleUploadCarousel"
      @update-logo="handleUpdateLogo"
      @update-cell-padding="handleUpdateCellPadding"
    />
  </div>
</template>

<style scoped>
.editor-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}
</style>
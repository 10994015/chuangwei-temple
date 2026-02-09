<script setup>
import { ref } from 'vue'
import BasemapWrapper from './basemap/BasemapWrapper.vue'
import SystemFrame from './SystemFrame.vue'
import CustomFrame from './CustomFrame.vue'

// Props - 直接接收 API 格式的 basemaps
const props = defineProps({
  basemaps: {
    type: Array,
    default: () => []
  },
  selectedBasemap: {
    type: Object,
    default: null
  },
  selectedFrame: {
    type: Object,
    default: null
  },
  selectedElement: {
    type: Object,
    default: null
  },
  selectedCell: {
    type: Object,
    default: null
  },
  currentPageSlug: {
    type: String,
    default: null
  }
})

// Emits
const emit = defineEmits([
  'select-basemap',
  'select-frame',
  'select-element',
  'select-cell',
  'drop-to-basemap',
  'drop-to-cell',
  'delete-basemap',
  'delete-element',
  'delete-frame',  // ✅ 新增：刪除框架
  'update-element',
  'update-background',
  'update-cell-padding',
  'add-basemap',
  'move-basemap-up',
  'move-basemap-down',
  'change-page'
])

// 拖曳懸浮狀態
const dragOverBasemap = ref(null)

// ✅ 全局拖曳狀態（追蹤是否正在拖曳）
const isDragging = ref(false)

// ✅ 監聽全局拖曳事件
if (typeof window !== 'undefined') {
  // 開始拖曳
  window.addEventListener('dragstart', () => {
    isDragging.value = true
  })
  
  // 結束拖曳
  window.addEventListener('dragend', () => {
    isDragging.value = false
    dragOverBasemap.value = null
  })
  
  // 放置完成
  window.addEventListener('drop', () => {
    isDragging.value = false
    dragOverBasemap.value = null
  })
}

// ==================== 頁面切換 ====================
const handleChangePage = (slug) => {
  console.log('CanvasArea: 切換頁面', slug)
  emit('change-page', slug)
}

// ==================== 選擇事件 ====================

// 判斷底圖是否被選中
const isBasemapSelected = (basemap) => {
  return props.selectedBasemap === basemap
}

const handleBasemapClick = (basemap) => {
  console.log('點擊底圖:', basemap.bg_type)
  emit('select-basemap', basemap)
}

const handleSelectFrame = (frame) => {
  console.log('CanvasArea: 選擇框架', frame?.type)
  emit('select-frame', frame)
}

const handleSelectElement = (data) => {
  emit('select-element', data)
}

const handleUpdateElement = (data) => {
  emit('update-element', data)
}

const handleSelectCell = (data) => {
  emit('select-cell', data)
}

// ✅ 更新格子 padding
const handleUpdateCellPadding = (data) => {
  emit('update-cell-padding', data)
}

// ==================== 底圖操作 ====================

const handleAddBasemap = (currentIndex) => {
  console.log('在索引', currentIndex, '後新增空白底圖')
  emit('add-basemap', currentIndex)
}

const handleDeleteBasemap = (index) => {
  console.log('刪除底圖，索引:', index)
  emit('delete-basemap', index)
}

const handleMoveBasemap = ({ fromIndex, direction }) => {
  console.log('移動底圖:', direction)
  
  if (direction === 'up') {
    emit('move-basemap-up', fromIndex)
  } else if (direction === 'down') {
    emit('move-basemap-down', fromIndex)
  }
}

// ⭐ 更新底圖背景
const handleUpdateBackground = (data) => {
  console.log('CanvasArea 收到背景更新事件:', data)
  
  // 直接向上層發送事件，讓 PageEditor 或 Store 處理
  emit('update-background', data)
}

// ==================== 拖曳事件 ====================

const handleDragOver = (event, basemap) => {
  event.preventDefault()
  event.stopPropagation()
  
  const basemapId = `${basemap.bg_type}-${basemap.bg_sequence}`
  
  // 預設允許放置
  event.dataTransfer.dropEffect = 'copy'
  dragOverBasemap.value = basemapId
}

const handleDragLeave = (event) => {
  event.preventDefault()
  event.stopPropagation()
  
  // ✅ 檢查是否真的離開了該元素
  const relatedTarget = event.relatedTarget
  if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
    dragOverBasemap.value = null
  }
}

const handleDrop = (event, basemap, basemapIndex) => {
  event.preventDefault()
  dragOverBasemap.value = null
  
  try {
    const data = event.dataTransfer.getData('application/json')
    
    if (!data) {
      return
    }
    
    const dragData = JSON.parse(data)
    console.log('📦 放置到底圖:', dragData)
    
    // 元件不能直接放到底圖
    if (dragData.dragType === 'element') {
      console.log('元件不能直接放到底圖')
      return
    }
    
    // ✅ 檢查框架放置規則
    const hasFrames = basemap.frames && basemap.frames.length > 0
    
    if (hasFrames) {
      // 檢查已有框架的類型
      const hasSystemFrame = basemap.frames.some(frame => {
        // 系統框架：不以 FRAME 開頭
        return frame.type && !frame.type.startsWith('FRAME')
      })
      
      const isDraggingSystemFrame = dragData.dragType === 'system-frame'
      const isDraggingCustomFrame = dragData.dragType === 'custom-frame'
      
      console.log('🔍 框架檢查:', {
        hasSystemFrame,
        isDraggingSystemFrame,
        isDraggingCustomFrame
      })
      
      // 規則 1: 底圖已有系統框架 → 不能再放任何框架
      if (hasSystemFrame) {
        alert('此底圖已有系統框架，不能再添加其他框架')
        return
      }
      
      // 規則 2: 底圖已有自訂框架 + 拖曳系統框架 → 不允許
      if (!hasSystemFrame && isDraggingSystemFrame) {
        alert('此底圖已有自訂框架，不能添加系統框架')
        return
      }
      
      // 規則 3: 底圖已有自訂框架 + 拖曳自訂框架 → 允許（多個自訂框架）
      // 這種情況直接通過，繼續執行
    }
    
    // 發送放置事件
    emit('drop-to-basemap', {
      basemap: basemap,
      basemapIndex: basemapIndex,
      frame: dragData
    })
    
  } catch (error) {
    console.error('處理拖放時發生錯誤:', error)
  }
}

// ==================== 元件操作 ====================

const handleDropToCell = (data) => {
  emit('drop-to-cell', data)
}

const handleDeleteElement = (data) => {
  emit('delete-element', data)
}

// ✅ 刪除框架
const handleDeleteFrame = (data, basemap, basemapIndex) => {
  console.log('CanvasArea: 刪除框架', data)
  emit('delete-frame', {
    ...data,
    basemap,
    basemapIndex
  })
}

// ==================== 輔助函數 ====================

// 判斷框架類型
const isSystemFrame = (frame) => {
  // 檢查 frame 是否存在且有 type 屬性
  if (!frame || !frame.type) {
    return false
  }
  
  const type = frame.type
  
  // 自訂框架：以 FRAME 開頭
  // FRAME1_1, FRAME1_2, FRAME_A, FRAME_B 等都是自訂框架
  if (type.startsWith('FRAME')) {
    return false  // 這是自訂框架
  }
  
  // 系統框架：HEADER, FOOTER, INDEX_NEWS, CAROUSEL_WALL 等
  return true
}

// 獲取底圖 ID（用於 key）
const getBasemapKey = (basemap, index) => {
  return `${basemap.bg_type}-${basemap.bg_sequence}-${index}`
}
</script>

<template>
  <div class="canvas-area" :class="{ 'is-dragging': isDragging }">
    <div class="temple-website">
      <!-- 動態渲染底圖 -->
      <template v-for="(basemap, index) in basemaps" :key="getBasemapKey(basemap, index)">
        <BasemapWrapper 
          :index="index"
          :basemap-id="`basemap-${index}`"
          :basemap="basemap"
          :is-footer="basemap.bg_type === 'FOOTER'"
          :is-header="basemap.bg_type === 'HEADER'"
          :is-deletable="basemap.bg_is_deletable"
          :total-basemaps="basemaps.length"
          @add-basemap="handleAddBasemap"
          @delete-basemap="() => handleDeleteBasemap(index)"
          @move-basemap="handleMoveBasemap"
          @update-background="handleUpdateBackground"
        >
          <!-- 空白底圖（沒有框架） -->
          <div 
            v-if="!basemap.frames || basemap.frames.length === 0" 
            class="blank-basemap"
            :class="{ 
              'drag-over': dragOverBasemap === `${basemap.bg_type}-${basemap.bg_sequence}`,
              'is-selected': isBasemapSelected(basemap)
            }"
            @click="handleBasemapClick(basemap)"
            @dragover="handleDragOver($event, basemap)"
            @dragleave="handleDragLeave"
            @drop="handleDrop($event, basemap, index)"
          >
            <div class="blank-content">
              <div class="blank-icon">📄</div>
              <p class="blank-text">空白底圖</p>
              <p class="blank-hint">從左側拖曳框架至此處</p>
              <p class="blank-note" v-if="!basemap.bg_allow_multiple_frames">
                此底圖只允許一個框架
              </p>
              <p class="blank-note" v-else>
                此底圖可以有多個框架
              </p>
            </div>
          </div>
          
          <!-- 有框架的底圖 -->
          <div 
            v-else 
            class="basemap-with-frames"
            :class="{ 
              'drag-over': dragOverBasemap === `${basemap.bg_type}-${basemap.bg_sequence}`,
              'has-frame': basemap.frames.length > 0,
              'is-selected': isBasemapSelected(basemap)
            }"
            :style="{
              backgroundImage: basemap.bg_pc_img_src ? `url(${basemap.bg_pc_img_src})` : 'none'
            }"
            @dragover="handleDragOver($event, basemap)"
            @dragleave="handleDragLeave"
            @drop="handleDrop($event, basemap, index)"
          >
            <!-- 底圖選擇疊加層 -->
            <div 
              class="basemap-overlay"
              :class="{ 'show': isBasemapSelected(basemap) }"
              @click.stop="handleBasemapClick(basemap)"
              title="點擊選擇底圖以編輯背景"
            ></div>
            
            <!-- 渲染所有框架 -->
            <template v-for="(frame, frameIndex) in basemap.frames" :key="`frame-${frameIndex}`">
              <!-- 系統框架 -->
              <SystemFrame 
                v-if="isSystemFrame(frame)"
                :frame-type="frame.type"
                :frame-data="frame.data || {}"
                :frame="frame"
                :selected-element="selectedElement"
                :selected-frame="selectedFrame"
                :current-page-slug="currentPageSlug"
                class="relative-frame"
                @select-element="handleSelectElement"
                @update-element="handleUpdateElement"
                @delete-element="handleDeleteElement"
                @change-page="handleChangePage"
                @select-frame="handleSelectFrame"
                @delete-frame="(data) => handleDeleteFrame(data, basemap, index)"
              />
              
              <!-- 自訂框架 -->
              <CustomFrame
                v-else
                :frame="frame"
                :basemap="basemap"
                :basemap-index="index"
                :selected-element="selectedElement"
                :selected-cell="selectedCell"
                class="relative-frame"
                @drop-to-cell="handleDropToCell"
                @delete-element="handleDeleteElement"
                @delete-frame="(data) => handleDeleteFrame(data, basemap, index)"
                @select-frame="handleSelectFrame"
                @select-element="handleSelectElement"
                @select-cell="handleSelectCell"
              />
            </template>
          </div>
        </BasemapWrapper>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 0;
  position: relative;
}

.temple-website {
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft JhengHei', sans-serif;
  color: #333;
  background: #fff;
}

.blank-basemap {
  min-height: 300px;
  background: transparent;
  border: 2px dashed transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background: #fafafa;
    border-color: #ddd;
    
    .blank-icon {
      opacity: 0.3;
    }
    
    .blank-text, .blank-hint {
      opacity: 1;
    }
  }
  
  &.is-selected {
    background: #fafafa;
    border-color: #E8572A;
    border-style: solid;
    box-shadow: 0 0 0 4px rgba(232, 87, 42, 0.1);
    
    .blank-icon {
      opacity: 0.3;
    }
    
    .blank-text, .blank-hint {
      opacity: 1;
    }
  }
  
  &.drag-over {
    background: #fff5f2;
    border-color: #E8572A;
    border-width: 3px;
    border-style: solid;
    box-shadow: 0 0 0 4px rgba(232, 87, 42, 0.1);
    transform: scale(1.01);
    
    .blank-icon {
      opacity: 0.6;
      transform: scale(1.1);
    }
    
    .blank-text, .blank-hint {
      color: #E8572A;
      opacity: 1;
    }
  }
}

.canvas-area.is-dragging .blank-basemap {
  background: #fafafa;
  border-color: #ddd;
  
  .blank-icon {
    opacity: 0.2;
  }
  
  .blank-text, .blank-hint {
    opacity: 0.8;
  }
}

.blank-content {
  text-align: center;
  padding: 2rem;
  pointer-events: none;
}

.blank-icon {
  font-size: 48px;
  margin-bottom: 1rem;
  opacity: 0;
  transition: all 0.3s ease;
}

.blank-text {
  font-size: 18px;
  color: #666;
  margin: 0 0 0.5rem;
  font-weight: 500;
  opacity: 0;
  transition: all 0.3s ease;
}

.blank-hint {
  font-size: 14px;
  color: #999;
  margin: 0 0 0.5rem;
  opacity: 0;
  transition: all 0.3s ease;
}

.blank-note {
  font-size: 12px;
  color: #bbb;
  margin: 0;
  font-style: italic;
}

.basemap-with-frames {
  position: relative;
  min-height: 100px;
  transition: all 0.3s ease;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  &.is-selected {
    outline: 3px solid #E8572A;
    outline-offset: -3px;
    box-shadow: 0 0 0 4px rgba(232, 87, 42, 0.1);
    
    .basemap-overlay {
      opacity: 1;
    }
  }
}

.basemap-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(232, 87, 42, 0.05);
  opacity: 0;
  transition: opacity 0.2s ease;
  cursor: pointer;
  z-index: 1;
  pointer-events: none;
  
  &:hover {
    opacity: 1;
    background: rgba(232, 87, 42, 0.08);
  }
  
  &.show {
    opacity: 1;
    pointer-events: auto;
  }
}

.relative-frame {
  position: relative;
  z-index: 2;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.canvas-area::-webkit-scrollbar {
  width: 8px;
}

.canvas-area::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.canvas-area::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 4px;
}

.canvas-area::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}
</style>
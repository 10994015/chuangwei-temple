<script setup>
import { ref, computed } from 'vue'
// 引入底圖組件
import NavbarBasemap from './basemap/NavbarBasemap.vue'
import FooterBasemap from './basemap/FooterBasemap.vue'
import BasemapWrapper from './basemap/BasemapWrapper.vue'
import SystemFrame from './SystemFrame.vue'
import CustomFrame from './CustomFrame.vue'

// Props
const props = defineProps({
  canvases: {
    type: Array,
    default: () => []
  },
  selectedCanvas: {
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
  }
})

// Emits
const emit = defineEmits([
  'select-canvas',
  'select-frame',
  'select-element',
  'select-cell',
  'drop-to-canvas',
  'drop-to-cell',
  'delete-canvas',
  'delete-frame',
  'delete-element',
  'move-frame',
  'add-canvas',
  'move-canvas'
])

// 使用 computed 包裝 props.canvases，不再本地管理數據
const basemaps = computed(() => props.canvases)

// 拖曳懸浮狀態
const dragOverBasemap = ref(null)

// 處理新增空白底圖
const handleAddBasemap = (currentIndex) => {
  console.log('在索引', currentIndex, '後新增空白底圖')
  
  // 發送事件給父組件，由父組件處理數據
  emit('add-canvas', {
    index: currentIndex + 1
  })
}

// 處理刪除底圖（使用 ID 而不是索引）
const handleDeleteBasemap = (basemapId) => {
  console.log('===== CanvasArea: 開始刪除底圖 =====')
  console.log('要刪除的底圖 ID:', basemapId)
  
  // 根據 ID 找到對應的底圖和索引
  const index = basemaps.value.findIndex(b => b.id === basemapId)
  
  console.log('找到的索引:', index)
  
  if (index === -1) {
    console.error('找不到要刪除的底圖:', basemapId)
    alert('找不到要刪除的底圖')
    return
  }
  
  const basemap = basemaps.value[index]
  
  console.log('找到的底圖:', basemap)
  console.log('底圖類型:', basemap.type)
  
  // 不允許刪除 header 和 footer
  if (basemap.type === 'header') {
    console.log('阻止刪除：這是 header')
    alert('頁首不能刪除')
    return
  }
  
  if (basemap.type === 'footer') {
    console.log('阻止刪除：這是 footer')
    alert('頁尾不能刪除')
    return
  }
  
  console.log('✓ 驗證通過，發送刪除事件')
  
  // 發送事件給父組件，由父組件處理數據刪除
  emit('delete-canvas', index)
  
  console.log('===== CanvasArea: 刪除事件已發送 =====')
}

// 處理移動底圖
const handleMoveBasemap = ({ basemapId, fromIndex, toIndex, direction }) => {
  console.log('===== CanvasArea: 開始移動底圖 =====')
  console.log('底圖 ID:', basemapId)
  console.log('從索引:', fromIndex, '到索引:', toIndex)
  console.log('方向:', direction)
  
  // 驗證索引有效性
  if (fromIndex < 0 || fromIndex >= basemaps.value.length) {
    console.error('無效的起始索引:', fromIndex)
    return
  }
  
  if (toIndex < 0 || toIndex >= basemaps.value.length) {
    console.error('無效的目標索引:', toIndex)
    return
  }
  
  const basemap = basemaps.value[fromIndex]
  
  // 不允許移動 header 和 footer
  if (basemap.type === 'header' || basemap.type === 'footer') {
    console.log('阻止移動：這是', basemap.type)
    alert(`${basemap.type === 'header' ? '頁首' : '頁尾'}不能移動`)
    return
  }
  
  // 確保不會移動到 header 或 footer 的位置
  if (toIndex === 0) {
    console.log('阻止移動：不能移動到 header 位置')
    return
  }
  
  if (toIndex === basemaps.value.length - 1) {
    console.log('阻止移動：不能移動到 footer 位置')
    return
  }
  
  console.log('✓ 驗證通過，發送移動事件')
  
  // 發送事件給父組件
  emit('move-canvas', {
    fromIndex,
    toIndex,
    direction
  })
  
  console.log('===== CanvasArea: 移動事件已發送 =====')
}

// 處理元件放置到格子
const handleDropToCell = ({ frame, col, element }) => {
  console.log('處理元件放置到格子:', { frame, col, element })
  
  // 檢查格子是否已有元件
  if (frame.elements[col.id]) {
    if (!confirm('此格子已有元件，是否替換？')) {
      return
    }
  }
  
  // 創建新元件實例
  const newElement = {
    id: `elem-${Date.now()}`,
    name: element.name,
    type: element.type,
    content: getDefaultElementContent(element.type)
  }
  
  // 放置元件到格子
  frame.elements[col.id] = newElement
  
  console.log('元件已放置:', newElement)
}

// 獲取元件預設內容
const getDefaultElementContent = (type) => {
  const defaults = {
    text: {
      text: '這是文字內容，點擊右側編輯',
      fontSize: '16px',
      color: '#333333',
      align: 'left'
    },
    image: {
      src: 'https://via.placeholder.com/400x300/E8572A/FFF?text=預設圖片',
      alt: '圖片',
      width: '100%'
    },
    button: {
      text: '按鈕文字',
      textColor: '#FFFFFF',
      bgColor: '#E8572A',
      link: '',
      align: 'center'
    },
    'h-line': { 
      color: '#E0E0E0', 
      thickness: '2px',
      width: '100%'
    },
    'v-line': { 
      color: '#E0E0E0', 
      thickness: '2px',
      height: '100px'
    },
    carousel: {
      images: [
        'https://via.placeholder.com/800x400/667eea/FFF?text=輪播1',
        'https://via.placeholder.com/800x400/764ba2/FFF?text=輪播2',
        'https://via.placeholder.com/800x400/f093fb/FFF?text=輪播3'
      ],
      autoPlay: true,
      interval: 3000
    },
    map: { 
      address: '請輸入地址', 
      lat: 25.033, 
      lng: 121.565,
      zoom: 15
    },
    album: { 
      albumId: null, 
      title: '相簿預覽',
      columns: 3
    }
  }
  return defaults[type] || {}
}

// 處理刪除元件
const handleDeleteElement = ({ frame, colId }) => {
  console.log('處理刪除元件:', { frame, colId })
  
  if (confirm('確定要刪除此元件嗎？')) {
    frame.elements[colId] = null
    console.log('元件已刪除')
  }
}

// 處理拖曳進入底圖
const handleDragOver = (event, basemap) => {
  event.preventDefault()
  
  try {
    const data = event.dataTransfer.getData('application/json')
    if (!data) {
      event.dataTransfer.dropEffect = 'copy'
      dragOverBasemap.value = basemap.id
      return
    }
    
    const dragData = JSON.parse(data)
    
    // 檢查底圖中現有框架的類型
    const hasSystemFrame = basemap.frames && basemap.frames.some(f => f.frameType === 'system')
    const hasCustomFrame = basemap.frames && basemap.frames.some(f => f.frameType === 'custom')
    
    // 如果拖的是系統框架
    if (dragData.dragType === 'system-frame') {
      // 已有任何框架就不能再放系統框架
      if (hasSystemFrame || hasCustomFrame) {
        event.dataTransfer.dropEffect = 'none'
      } else {
        event.dataTransfer.dropEffect = 'copy'
      }
    }
    // 如果拖的是自訂框架
    else if (dragData.dragType === 'custom-frame') {
      // 有系統框架就不能放自訂框架
      if (hasSystemFrame) {
        event.dataTransfer.dropEffect = 'none'
      } else {
        // 沒有系統框架，可以放自訂框架（允許多個）
        event.dataTransfer.dropEffect = 'copy'
      }
    }
    else {
      event.dataTransfer.dropEffect = 'copy'
    }
    
  } catch (error) {
    event.dataTransfer.dropEffect = 'copy'
  }
  
  dragOverBasemap.value = basemap.id
}

// 處理拖曳離開底圖
const handleDragLeave = (event) => {
  // 確保真的離開了底圖區域
  const relatedTarget = event.relatedTarget
  if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
    dragOverBasemap.value = null
  }
}

// 處理放置到底圖
const handleDrop = (event, basemap, basemapIndex) => {
  event.preventDefault()
  
  // 重置拖曳狀態
  dragOverBasemap.value = null
  
  try {
    const data = JSON.parse(event.dataTransfer.getData('application/json'))
    console.log('放置數據:', data)
    
    let newFrame = null
    
    // 檢查底圖中現有框架的類型
    const hasSystemFrame = basemap.frames && basemap.frames.some(f => f.frameType === 'system')
    const hasCustomFrame = basemap.frames && basemap.frames.some(f => f.frameType === 'custom')
    
    // 處理系統框架
    if (data.dragType === 'system-frame') {
      // 檢查是否已有任何框架（系統框架只能有一個，且不能與自訂框架混用）
      if (basemap.frames && basemap.frames.length > 0) {
        if (hasSystemFrame) {
          alert('此底圖已有系統框架，一個底圖只能有一個系統框架')
        } else if (hasCustomFrame) {
          alert('此底圖已有自訂框架，不能再添加系統框架')
        }
        return
      }
      
      newFrame = {
        id: `frame-${Date.now()}`,
        type: data.type,
        frameType: 'system',
        component: data.component,
        data: {}
      }
      
      console.log('成功添加系統框架:', newFrame)
    } 
    // 處理自訂框架
    else if (data.dragType === 'custom-frame') {
      // 檢查是否有系統框架（不能混用）
      if (hasSystemFrame) {
        alert('此底圖已有系統框架，不能再添加自訂框架')
        return
      }
      
      // 自訂框架可以有多個，直接添加
      const elements = {}
      data.columns.forEach(col => {
        elements[col.id] = null
      })
      
      newFrame = {
        id: `frame-${Date.now()}`,
        name: data.name,
        layout: data.layout,
        frameType: 'custom',
        columns: JSON.parse(JSON.stringify(data.columns)),
        elements: elements,
        properties: {
          'padding-top': '5%',
          'padding-right': '5%',
          'padding-bottom': '5%',
          'padding-left': '5%'
        }
      }
      
      console.log('成功添加自訂框架:', newFrame)
    } 
    else {
      console.log('未知的拖曳類型，忽略')
      return
    }
    
    // 添加到底圖的 frames 陣列
    if (newFrame) {
      basemap.frames.push(newFrame)
      console.log('當前底圖狀態:', basemap)
      
      // 只有在添加系統框架時，才自動新增空白底圖
      if (newFrame.frameType === 'system') {
        const footerIndex = basemaps.value.findIndex(b => b.type === 'footer')
        
        if (basemap.type !== 'footer' && basemapIndex + 1 !== footerIndex) {
          console.log('在索引', basemapIndex, '後自動新增空白底圖')
          
          setTimeout(() => {
            emit('add-canvas', {
              index: basemapIndex + 1
            })
          }, 100)
        }
      }
      // 自訂框架不自動新增空白底圖，用戶可以繼續在同一底圖添加更多自訂框架
    }
    
  } catch (error) {
    console.error('處理拖放時發生錯誤:', error)
  }
}
</script>

<template>
  <div class="canvas-area">
    <div class="temple-website">
      <!-- 動態渲染底圖 -->
      <template v-for="(basemap, index) in basemaps" :key="basemap.id">
        <BasemapWrapper 
          :index="index"
          :basemap-id="basemap.id"
          :is-footer="basemap.type === 'footer'"
          :is-header="basemap.type === 'header'"
          :total-basemaps="basemaps.length"
          @add-basemap="handleAddBasemap"
          @delete-basemap="handleDeleteBasemap"
          @move-basemap="handleMoveBasemap"
        >
          <!-- 空白底圖（沒有框架） -->
          <div 
            v-if="!basemap.frames || basemap.frames.length === 0" 
            class="blank-basemap"
            :class="{ 'drag-over': dragOverBasemap === basemap.id }"
            @dragover="handleDragOver($event, basemap)"
            @dragleave="handleDragLeave"
            @drop="handleDrop($event, basemap, index)"
          >
            <div class="blank-content">
              <div class="blank-icon">📄</div>
              <p class="blank-text">空白底圖</p>
              <p class="blank-hint">從左側拖曳框架至此處</p>
              <p class="blank-note">系統框架：一個底圖一個框架</p>
              <p class="blank-note">自訂框架：一個底圖可多個框架</p>
            </div>
          </div>
          
          <!-- 有框架的底圖 -->
          <div 
            v-else 
            class="basemap-with-frames"
            :class="{ 
              'drag-over': dragOverBasemap === basemap.id,
              'has-frame': basemap.frames.length > 0
            }"
            @dragover="handleDragOver($event, basemap)"
            @dragleave="handleDragLeave"
            @drop="handleDrop($event, basemap, index)"
          >
            <!-- 渲染所有框架 -->
            <template v-for="(frame, frameIndex) in basemap.frames" :key="frame.id">
              <!-- 系統框架 -->
              <SystemFrame 
                v-if="frame.frameType === 'system'"
                :frame-type="frame.type"
                :frame-data="frame.data || {}"
              />
              
              <!-- 自訂框架 -->
              <CustomFrame
                v-else-if="frame.frameType === 'custom'"
                :frame="frame"
                :basemap="basemap"
                :basemap-index="index"
                @drop-to-cell="handleDropToCell"
                @delete-element="handleDeleteElement"
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

// 空白底圖樣式
.blank-basemap {
  min-height: 300px;
  background: #fafafa;
  border: 2px dashed #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f5f5f5;
    border-color: #E8572A;
  }
  
  // 拖曳懸浮時的效果
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
    
    .blank-text {
      color: #E8572A;
    }
    
    .blank-hint {
      color: #E8572A;
    }
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
  opacity: 0.3;
  transition: all 0.3s ease;
}

.blank-text {
  font-size: 18px;
  color: #666;
  margin: 0 0 0.5rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.blank-hint {
  font-size: 14px;
  color: #999;
  margin: 0 0 0.5rem;
  transition: color 0.3s ease;
}

.blank-note {
  font-size: 12px;
  color: #bbb;
  margin: 0;
  font-style: italic;
}

// 有框架的底圖
.basemap-with-frames {
  position: relative;
  min-height: 100px;
  transition: all 0.3s ease;
  
  // 已有框架時的拖曳效果（禁止放置）
  &.has-frame.drag-over {
    background: #fff3f3;
    outline: 3px solid #dc2626;
    outline-offset: -3px;
    box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
    
    // 顯示禁止提示
    &::after {
      content: '此底圖已有框架，無法再添加';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(220, 38, 38, 0.95);
      color: #fff;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      pointer-events: none;
      z-index: 100;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      animation: fadeInScale 0.2s ease;
    }
  }
}

// 自訂框架（預留）
.custom-frame {
  padding: 2rem;
  background: #e3f2fd;
  border: 2px solid #2196f3;
  text-align: center;
  color: #1976d2;
}

// 提示框動畫
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

// 滾動條樣式
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
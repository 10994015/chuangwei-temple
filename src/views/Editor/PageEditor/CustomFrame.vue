<template>
  <div 
    class="custom-frame-wrapper"
    @dragover="handleFrameDragOver"
    @drop="handleFrameDrop"
  >
    <div 
      class="custom-frame"
      :class="frameLayoutClass"
      :style="frameStyles"
    >
      <!-- 渲染每個格子 -->
      <div
        v-for="col in frame.columns"
        :key="col.id"
        class="frame-cell"
        :class="{
          'has-element': hasElement(col.id),
          'drag-over': dragOverCell === col.id
        }"
        @dragover="handleDragOver($event, col)"
        @dragleave="handleDragLeave"
        @drop="handleDrop($event, col)"
        @click="handleCellClick(col)"
      >
        <!-- 空格子提示 -->
        <div v-if="!hasElement(col.id)" class="empty-cell">
          <div class="empty-icon">📦</div>
          <p class="empty-text">拖曳元件至此</p>
        </div>

        <!-- 顯示元件 -->
        <div v-else class="cell-content">
          <!-- 元件控制按鈕 -->
          <div class="element-controls">
            <button 
              class="element-control-btn delete-btn" 
              @click.stop="handleDeleteElement(col)"
              title="刪除元件"
            >
              ✕
            </button>
          </div>

          <!-- 渲染元件 -->
          <component
            :is="getElementComponent(col.id)"
            :content="getElementContent(col.id)"
            :element="frame.elements[col.id]"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
// 導入元件組件
import TextElement from './elements/TextElement.vue'
import ImageElement from './elements/ImageElement.vue'
import ButtonElement from './elements/ButtonElement.vue'
import HLineElement from './elements/HLineElement.vue'
import VLineElement from './elements/VLineElement.vue'
import CarouselElement from './elements/CarouselElement.vue'
import MapElement from './elements/MapElement.vue'
import AlbumElement from './elements/AlbumElement.vue'

const props = defineProps({
  frame: {
    type: Object,
    required: true
  },
  basemap: {
    type: Object,
    required: true
  },
  basemapIndex: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['drop-to-cell', 'delete-element'])

// 拖曳狀態
const dragOverCell = ref(null)

// 框架佈局 class
const frameLayoutClass = computed(() => {
  return `layout-${props.frame.layout}`
})

// 框架樣式
const frameStyles = computed(() => {
  const p = props.frame.properties || {}
  return {
    paddingTop: p['padding-top'] || '5%',
    paddingRight: p['padding-right'] || '5%',
    paddingBottom: p['padding-bottom'] || '5%',
    paddingLeft: p['padding-left'] || '5%'
  }
})

// 檢查格子是否有元件
const hasElement = (colId) => {
  return props.frame.elements[colId] !== null && props.frame.elements[colId] !== undefined
}

// 獲取元件內容
const getElementContent = (colId) => {
  const element = props.frame.elements[colId]
  return element ? element.content : {}
}

// 獲取元件組件
const getElementComponent = (colId) => {
  const element = props.frame.elements[colId]
  if (!element) return null

  const componentMap = {
    'text': TextElement,
    'image': ImageElement,
    'button': ButtonElement,
    'h-line': HLineElement,
    'v-line': VLineElement,
    'carousel': CarouselElement,
    'map': MapElement,
    'album': AlbumElement
  }

  return componentMap[element.type] || null
}

// 處理拖曳進入格子
const handleDragOver = (event, col) => {
  event.preventDefault()
  event.stopPropagation()
  
  const data = event.dataTransfer.getData('application/json')
  if (!data) return
  
  try {
    const dragData = JSON.parse(data)
    
    // 只接受元件類型
    if (dragData.dragType === 'element') {
      event.dataTransfer.dropEffect = 'copy'
      dragOverCell.value = col.id
    } else {
      event.dataTransfer.dropEffect = 'none'
    }
  } catch (error) {
    console.error('解析拖曳數據失敗:', error)
  }
}

// 處理拖曳離開格子
const handleDragLeave = (event) => {
  const relatedTarget = event.relatedTarget
  if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
    dragOverCell.value = null
  }
}

// 處理放置元件
const handleDrop = (event, col) => {
  event.preventDefault()
  event.stopPropagation() // 阻止事件冒泡到父層（底圖）
  
  dragOverCell.value = null
  
  try {
    const data = JSON.parse(event.dataTransfer.getData('application/json'))
    console.log('放置元件到格子:', data)
    
    // 只處理元件拖曳
    if (data.dragType === 'element') {
      emit('drop-to-cell', {
        frame: props.frame,
        col: col,
        element: data
      })
    } else {
      console.log('不是元件類型，忽略:', data.dragType)
    }
  } catch (error) {
    console.error('處理元件放置時發生錯誤:', error)
  }
}

// 處理點擊格子
const handleCellClick = (col) => {
  console.log('點擊格子:', col)
  // TODO: 可以在這裡觸發選擇事件，用於右側屬性面板
}

// 處理刪除元件
const handleDeleteElement = (col) => {
  emit('delete-element', {
    frame: props.frame,
    colId: col.id
  })
}

// 處理框架拖曳到框架區域（阻止）
const handleFrameDragOver = (event) => {
  try {
    const data = event.dataTransfer.getData('application/json')
    if (data) {
      const dragData = JSON.parse(data)
      // 如果拖的是框架（系統或自訂），阻止拖放到框架區域
      if (dragData.dragType === 'system-frame' || dragData.dragType === 'custom-frame') {
        event.preventDefault()
        event.stopPropagation()
        event.dataTransfer.dropEffect = 'none'
        return
      }
    }
  } catch (error) {
    // 忽略解析錯誤
  }
}

// 處理框架放置（阻止）
const handleFrameDrop = (event) => {
  try {
    const data = event.dataTransfer.getData('application/json')
    if (data) {
      const dragData = JSON.parse(data)
      // 如果拖的是框架，阻止並提示
      if (dragData.dragType === 'system-frame' || dragData.dragType === 'custom-frame') {
        event.preventDefault()
        event.stopPropagation()
        console.log('阻止框架拖放到框架區域')
        return
      }
    }
  } catch (error) {
    // 忽略解析錯誤
  }
}

</script>

<style lang="scss" scoped>
.custom-frame-wrapper {
  width: 100%;
  background: #fff;
}

.custom-frame {
  display: grid;
  gap: 16px;
  width: 100%;
  /* 移除 max-width: 1200px; 讓框架佔滿整個底圖 */
  /* 移除 margin: 0 auto; */
  min-height: 200px;
}

// ========== 框架佈局樣式 ==========

// 單層 1-1
.layout-1-1 {
  grid-template-columns: 1fr;
}

// 單層 1-2
.layout-1-2 {
  grid-template-columns: repeat(2, 1fr);
}

// 單層 1-3
.layout-1-3 {
  grid-template-columns: repeat(3, 1fr);
}

// 單層 1-4
.layout-1-4 {
  grid-template-columns: repeat(4, 1fr);
}

// 雙層 2-2
.layout-2-2 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

// 雙層 2-3
.layout-2-3 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

// 雙層 2-4
.layout-2-4 {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

// ========== 複合框架佈局樣式 ==========

// 複合框架 A (左大右小 - 2:1 分割，右邊上下兩欄)
.layout-A {
  grid-template-columns: 2fr 1fr;
  grid-template-rows: repeat(2, 1fr);
  
  // 左邊格子（第1個）佔兩行
  > .frame-cell:nth-child(1) {
    grid-row: 1 / 3 !important;
  }
  
  // 右上格子（第2個）
  > .frame-cell:nth-child(2) {
    grid-column: 2 !important;
    grid-row: 1 !important;
  }
  
  // 右下格子（第3個）
  > .frame-cell:nth-child(3) {
    grid-column: 2 !important;
    grid-row: 2 !important;
  }
}

// 複合框架 B (左小右大 - 1:2 分割，左邊上下兩欄)
.layout-B {
  grid-template-columns: 1fr 2fr;
  grid-template-rows: repeat(2, 1fr);
  
  // 左上格子（第1個）
  > .frame-cell:nth-child(1) {
    grid-column: 1 !important;
    grid-row: 1 !important;
  }
  
  // 左下格子（第2個）
  > .frame-cell:nth-child(2) {
    grid-column: 1 !important;
    grid-row: 2 !important;
  }
  
  // 右邊格子（第3個）佔兩行
  > .frame-cell:nth-child(3) {
    grid-column: 2 !important;
    grid-row: 1 / 3 !important;
  }
}

// 複合框架 C (上大下小 - 上下 2:1 分割，下邊左右兩欄)
.layout-C {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 2fr 1fr;
  
  // 上邊格子（第1個）佔兩列
  > .frame-cell:nth-child(1) {
    grid-column: 1 / 3 !important;
    grid-row: 1 !important;
  }
  
  // 左下格子（第2個）
  > .frame-cell:nth-child(2) {
    grid-column: 1 !important;
    grid-row: 2 !important;
  }
  
  // 右下格子（第3個）
  > .frame-cell:nth-child(3) {
    grid-column: 2 !important;
    grid-row: 2 !important;
  }
}

// 複合框架 D (上小下大 - 上下 1:2 分割，上邊左右兩欄)
.layout-D {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 1fr 2fr;
  
  // 左上格子（第1個）
  > .frame-cell:nth-child(1) {
    grid-column: 1 !important;
    grid-row: 1 !important;
  }
  
  // 右上格子（第2個）
  > .frame-cell:nth-child(2) {
    grid-column: 2 !important;
    grid-row: 1 !important;
  }
  
  // 下邊格子（第3個）佔兩列
  > .frame-cell:nth-child(3) {
    grid-column: 1 / 3 !important;
    grid-row: 2 !important;
  }
}

// ========== 格子樣式 ==========
.frame-cell {
  min-height: 150px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &:hover {
    border-color: #E8572A;
    background: #fff;
  }

  &.drag-over {
    border-color: #E8572A;
    border-style: solid;
    background: #fff5f2;
    box-shadow: 0 0 0 4px rgba(232, 87, 42, 0.1);
    transform: scale(1.02);
  }

  &.has-element {
    border-style: solid;
    border-color: #e5e5e5;
    background: #fff;

    &:hover {
      border-color: #E8572A;

      .element-controls {
        opacity: 1;
      }
    }
  }
}

// ========== 空格子樣式 ==========
.empty-cell {
  text-align: center;
  padding: 2rem;
  pointer-events: none;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 0.5rem;
  opacity: 0.3;
}

.empty-text {
  font-size: 14px;
  color: #999;
  margin: 0;
}

// ========== 格子內容樣式 ==========
.cell-content {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 1rem;
}

// ========== 元件控制按鈕 ==========
.element-controls {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.element-control-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: rgba(220, 53, 69, 0.95);
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);

  &:hover {
    background: #c82333;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
}

// ========== 響應式設計 ==========
@media (max-width: 768px) {
  .custom-frame {
    gap: 12px;
  }

  .frame-cell {
    min-height: 120px;
  }

  // 小螢幕改為單欄
  .layout-1-2,
  .layout-1-3,
  .layout-1-4,
  .layout-2-2,
  .layout-2-3,
  .layout-2-4 {
    grid-template-columns: 1fr;
  }
}
</style>
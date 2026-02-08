<template>
  <div 
    class="custom-frame"
    :class="[
      `layout-${frameLayout}`, 
      { 
        'is-selected': isFrameSelected,
        'is-dragging': isDragging
      }
    ]"
    @click.stop="handleFrameClick"
  >
    <!-- 根據框架佈局渲染格子和元件 -->
    <div class="frame-grid" :style="gridStyle">
      <template v-for="(element, index) in displayElements" :key="`cell-${index}`">
        <!-- 渲染格子 -->
        <div 
          class="grid-cell"
          :class="{ 
            'has-element': element && element.type,
            'is-selected': isElementSelected(index)
          }"
          @click.stop="handleCellClick(index, element)"
          @dragover="handleDragOver($event, index)"
          @dragleave="handleDragLeave"
          @drop="handleDrop($event, index)"
        >
          <!-- 有元件：顯示元件內容 -->
          <div v-if="element && element.type" class="element-content">
            <!-- IMG 元件 -->
            <div v-if="element.type === 'IMG'" class="element-image">
              <img 
                v-if="element.value?.src" 
                :src="element.value.src" 
                alt="圖片"
                class="element-img"
              />
              <div v-else class="placeholder-image">
                <span>🖼️ 圖片</span>
                <p>請在右側上傳圖片</p>
              </div>
            </div>

            <!-- TEXT 元件 -->
            <div v-else-if="element.type === 'TEXT'" class="element-text">
              <div v-html="element.value?.text || '文字內容'"></div>
            </div>

            <!-- BUTTON 元件 -->
            <div v-else-if="element.type === 'BUTTON'" class="element-button">
              <a 
                :href="element.value?.url || '#'" 
                class="button-link"
                @click.prevent
              >
                {{ element.value?.text || '按鈕' }}
              </a>
            </div>

            <!-- H_LINE 元件 -->
            <div v-else-if="element.type === 'H_LINE'" class="element-hline">
              <hr :style="{ 
                borderColor: element.value?.color || '#ddd',
                borderWidth: element.value?.thickness || '2px'
              }" />
            </div>

            <!-- V_LINE 元件 -->
            <div v-else-if="element.type === 'V_LINE'" class="element-vline">
              <div class="vertical-line" :style="{ 
                backgroundColor: element.value?.color || '#ddd',
                width: element.value?.thickness || '2px'
              }"></div>
            </div>

            <!-- CAROUSEL 元件 -->
            <div v-else-if="element.type === 'CAROUSEL'" class="element-carousel">
              <CarouselElement 
                :content="{
                  images: element.value?.images || [],
                  autoPlay: element.value?.autoPlay !== false,
                  interval: element.value?.interval || 3000,
                  height: element.value?.height || 400
                }"
                :element="element"
                :key="`carousel-${index}-${element.value?.images?.length || 0}`"
                @vue:mounted="console.log('🎪 CAROUSEL mounted, element.value:', element.value)"
              />
            </div>

            <!-- MAP 元件 -->
            <div v-else-if="element.type === 'MAP'" class="element-map">
              <div class="map-placeholder">
                <span>🗺️ 地圖</span>
                <p>{{ element.value?.address || '請設定地址' }}</p>
              </div>
            </div>

            <!-- ALBUM 元件 -->
            <div v-else-if="element.type === 'ALBUM'" class="element-album">
              <div class="album-placeholder">
                <span>📸 相簿</span>
                <p>{{ element.value?.title || '相簿標題' }}</p>
              </div>
            </div>

            <!-- 未知類型 -->
            <div v-else class="element-unknown">
              <span>未知元件：{{ element.type }}</span>
            </div>

            <!-- 刪除按鈕 -->
            <button 
              class="delete-element-btn"
              @click.stop="handleDeleteElement(index)"
              title="刪除元件"
            >
              ✕
            </button>
          </div>

          <!-- 沒有元件：顯示空格子 -->
          <div v-else class="empty-cell" :class="{ 'drag-over': dragOverCell === index }">
            <span class="drop-hint">📦 拖曳元件至此</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CarouselElement from './elements/CarouselElement.vue'

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
  },
  selectedElement: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'select-frame',
  'select-element',
  'select-cell',
  'drop-to-cell',
  'delete-element'
])

// 拖曳狀態
const dragOverCell = ref(null)

// ✅ 全局拖曳狀態
const isDragging = ref(false)

// ✅ 監聽全局拖曳事件
if (typeof window !== 'undefined') {
  window.addEventListener('dragstart', () => {
    isDragging.value = true
  })
  
  window.addEventListener('dragend', () => {
    isDragging.value = false
    dragOverCell.value = null
  })
  
  window.addEventListener('drop', () => {
    isDragging.value = false
    dragOverCell.value = null
  })
}

// 框架佈局類型
const frameLayout = computed(() => {
  // 防禦性檢查：確保 frame.type 存在
  if (!props.frame || !props.frame.type) {
    console.warn('⚠️ 框架缺少 type 屬性:', props.frame)
    return 'A' // 預設值
  }
  
  const type = props.frame.type
  
  // 處理多種格式：
  // "FRAME1_1" → "1_1"  (後端新格式)
  // "FRAME_A" → "A"     (後端新格式)
  // "FRAME1-2" → "1_2"  (舊格式，轉換為新格式)
  // "FRAME-1-2" → "1_2" (舊格式，轉換為新格式)
  
  if (type.startsWith('FRAME')) {
    // 移除 FRAME 前綴
    let layout = type.replace(/^FRAME/, '')
    
    // 移除可能的連字號或底線前綴
    layout = layout.replace(/^[-_]/, '')
    
    // 將連字號轉換為底線（統一格式）
    layout = layout.replace(/-/g, '_')
    
    console.log(`✓ 框架類型解析: ${type} → ${layout}`)
    return layout
  }
  
  // 如果都不匹配，直接返回 type
  return type
})

// 根據框架類型決定格子數量
const cellCount = computed(() => {
  const layout = frameLayout.value
  
  switch (layout) {
    // 複合框架（大寫字母）
    case 'A':
    case 'B':
      return 3
    case 'C':
    case 'D':
      return 4
    
    // 單層框架（底線格式）
    case '1_1':
      return 1
    case '1_2':
      return 2
    case '1_3':
      return 3
    case '1_4':
      return 4
    
    // 雙層框架（底線格式）
    case '2_2':
      return 4
    case '2_3':
      return 6
    case '2_4':
      return 8
    
    // 預設值
    default:
      console.warn('⚠️ 未知框架佈局:', layout)
      return 4
  }
})

// 顯示用的元件陣列（補齊到指定格子數）
const displayElements = computed(() => {
  const elements = props.frame.elements || []
  const result = [...elements]
  
  // 補齊到指定格子數
  while (result.length < cellCount.value) {
    result.push(null)
  }
  
  return result.slice(0, cellCount.value)
})

// Grid 樣式
const gridStyle = computed(() => {
  const layout = frameLayout.value
  
  switch (layout) {
    // ✅ 複合框架 A - 左大右2小
    case 'A':
      return {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '20px'
      }
    
    // ✅ 複合框架 B - 左2小右大
    case 'B':
      return {
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '20px'
      }
    
    // ✅ 複合框架 C - 左大右3小
    case 'C':
      return {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: '20px'
      }
    
    // ✅ 複合框架 D - 左3小右大
    case 'D':
      return {
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: '20px'
      }
    
    // ✅ 單層框架
    case '1_1':
      return {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '20px'
      }
    case '1_2':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px'
      }
    case '1_3':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px'
      }
    case '1_4':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px'
      }
    
    // ✅ 雙層框架
    case '2_2':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '20px'
      }
    case '2_3':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '20px'
      }
    case '2_4':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '20px'
      }
    
    // 預設
    default:
      console.warn('⚠️ 未知框架佈局 gridStyle:', layout)
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
      }
  }
})

// 是否選中框架
const isFrameSelected = computed(() => {
  return props.selectedElement?.frame?.type === props.frame.type
})

// 是否選中元件
const isElementSelected = (index) => {
  return props.selectedElement?.elementIndex === index && 
         props.selectedElement?.frame?.type === props.frame.type
}

// ==================== 事件處理 ====================

// 點擊框架
const handleFrameClick = () => {
  emit('select-frame', props.frame)
}

// 點擊格子
const handleCellClick = (index, element) => {
  if (element && element.type) {
    // 有元件：選擇元件
    emit('select-element', {
      element: element,
      frame: props.frame,
      elementIndex: index
    })
  } else {
    // 空格子：選擇格子
    emit('select-cell', {
      frame: props.frame,
      cellIndex: index
    })
  }
}

// 拖曳進入格子
const handleDragOver = (event, index) => {
  event.preventDefault()
  // ❌ 移除 stopPropagation，讓框架拖曳可以冒泡到底圖
  // event.stopPropagation()
  
  // ✅ 直接設置視覺反饋，不需要檢查 dataTransfer
  // 在拖曳過程中，某些瀏覽器不允許訪問 getData()
  const element = displayElements.value[index]
  
  // 檢查格子是否已有元件
  if (element && element.type) {
    event.dataTransfer.dropEffect = 'none'
    dragOverCell.value = null
  } else {
    event.dataTransfer.dropEffect = 'copy'
    dragOverCell.value = index  // ✅ 立即顯示視覺反饋
  }
}

// 拖曳離開格子
const handleDragLeave = (event) => {
  event.preventDefault()
  // ❌ 移除 stopPropagation
  // event.stopPropagation()
  dragOverCell.value = null
}

// 放置到格子
const handleDrop = (event, index) => {
  try {
    const data = event.dataTransfer.getData('application/json')
    if (!data) return
    
    const dragData = JSON.parse(data)
    console.log('📦 CustomFrame 收到 drop:', dragData.dragType)
    
    // ✅ 只處理元件，框架讓它冒泡到底圖
    if (dragData.dragType !== 'element') {
      console.log('❌ 不是元件，讓事件冒泡到底圖處理')
      // 不調用 preventDefault()，讓事件繼續冒泡
      return
    }
    
    // ✅ 是元件，阻止冒泡，由 CustomFrame 處理
    event.preventDefault()
    event.stopPropagation()
    dragOverCell.value = null
    
    console.log('📦 放置元件到格子 ' + index + ':', dragData)
    
    // 檢查格子是否已有元件
    const element = displayElements.value[index]
    if (element && element.type) {
      alert('此格子已有元件')
      return
    }
    
    // 創建新元件（API 格式）
    const newElement = createElementFromDrag(dragData, index)
    
    // 發送事件到 PageEditor
    emit('drop-to-cell', {
      frame: props.frame,
      cellIndex: index,
      element: newElement
    })
    
  } catch (error) {
    console.error('❌ 處理拖放時發生錯誤:', error)
  }
}

// 刪除元件
const handleDeleteElement = (index) => {
  emit('delete-element', {
    frame: props.frame,
    elementIndex: index
  })
}

// ==================== 工具函數 ====================

// 從拖曳數據創建元件（API 格式）
const createElementFromDrag = (dragData, index) => {
  // 元件類型映射
  const typeMap = {
    'text': 'TEXT',
    'image': 'IMG',
    'button': 'BUTTON',
    'h-line': 'H_LINE',
    'v-line': 'V_LINE',
    'carousel': 'CAROUSEL'  // ✅ 添加映射
  }
  
  const apiType = typeMap[dragData.type] || dragData.type.toUpperCase()
  
  // 根據類型創建預設值
  let value = {}
  
  switch (dragData.type) {
    case 'text':
      value = {
        text: '<p>這是文字內容，點擊右側屬性面板進行編輯</p>'
      }
      break
    
    case 'image':
      value = {
        id: null,
        src: null
      }
      break
    
    case 'button':
      value = {
        text: '按鈕文字',
        url: '#'
      }
      break
    
    case 'h-line':
      value = {
        color: '#ddd',
        thickness: '2px'
      }
      break
    
    case 'v-line':
      value = {
        color: '#ddd',
        thickness: '2px'
      }
      break
    
    case 'carousel':
      value = {
        images: [],  // ✅ 初始化空陣列
        autoPlay: true,
        interval: 3000,
        height: 400
      }
      break
    
    default:
      value = {}
  }
  
  return {
    type: apiType,
    sequence: index + 1,
    value: value,
    metadata: {}
  }
}
</script>

<style lang="scss" scoped>
.custom-frame {
  padding: 40px;
  background: #fff;
  min-height: 200px;
  position: relative;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 0 0 2px rgba(232, 87, 42, 0.2);
  }
  
  &.is-selected {
    box-shadow: 0 0 0 3px rgba(232, 87, 42, 0.5);
  }
}

.frame-grid {
  width: 100%;
  min-height: 500px;  // ✅ 設置最小高度，確保有足夠空間
}

// ==================== 複合框架特殊佈局 ====================

// 複合框架 A - 左大右2小
.custom-frame.layout-A {
  .frame-grid {
    min-height: 600px;  // ✅ 複合框架需要更高
    
    .grid-cell {
      height: 100%;  // ✅ 格子填滿可用空間
    }
    
    .grid-cell:nth-child(1) {
      grid-column: 1;
      grid-row: 1 / 3;  // 跨2行
    }
    .grid-cell:nth-child(2) {
      grid-column: 2;
      grid-row: 1;
    }
    .grid-cell:nth-child(3) {
      grid-column: 2;
      grid-row: 2;
    }
  }
}

// 複合框架 B - 左2小右大
.custom-frame.layout-B {
  .frame-grid {
    min-height: 600px;
    
    .grid-cell {
      height: 100%;
    }
    
    .grid-cell:nth-child(1) {
      grid-column: 1;
      grid-row: 1;
    }
    .grid-cell:nth-child(2) {
      grid-column: 1;
      grid-row: 2;
    }
    .grid-cell:nth-child(3) {
      grid-column: 2;
      grid-row: 1 / 3;  // 跨2行
    }
  }
}

// 複合框架 C - 左大右3小
.custom-frame.layout-C {
  .frame-grid {
    min-height: 750px;  // ✅ 3行需要更高
    
    .grid-cell {
      height: 100%;
    }
    
    .grid-cell:nth-child(1) {
      grid-column: 1;
      grid-row: 1 / 4;  // 跨3行
    }
    .grid-cell:nth-child(2) {
      grid-column: 2;
      grid-row: 1;
    }
    .grid-cell:nth-child(3) {
      grid-column: 2;
      grid-row: 2;
    }
    .grid-cell:nth-child(4) {
      grid-column: 2;
      grid-row: 3;
    }
  }
}

// 複合框架 D - 左3小右大
.custom-frame.layout-D {
  .frame-grid {
    min-height: 750px;
    
    .grid-cell {
      height: 100%;
    }
    
    .grid-cell:nth-child(1) {
      grid-column: 1;
      grid-row: 1;
    }
    .grid-cell:nth-child(2) {
      grid-column: 1;
      grid-row: 2;
    }
    .grid-cell:nth-child(3) {
      grid-column: 1;
      grid-row: 3;
    }
    .grid-cell:nth-child(4) {
      grid-column: 2;
      grid-row: 1 / 4;  // 跨3行
    }
  }
}

.grid-cell {
  min-height: 250px;  // ✅ 從 150px 增加到 250px
  position: relative;
  border-radius: 8px;
  transition: all 0.2s;
  
  &.has-element {
    border: 2px solid transparent;
    cursor: pointer;
    
    &:hover {
      border-color: #E8572A;
    }
    
    &.is-selected {
      border-color: #E8572A;
      box-shadow: 0 0 0 3px rgba(232, 87, 42, 0.1);
    }
  }
}

.element-content {
  position: relative;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  height: 100%;
  min-height: 150px;
  
  &:hover .delete-element-btn {
    opacity: 1;
  }
}

// ✅ 輪播元件的 content 特殊處理（使用相鄰選擇器）
.element-carousel {
  width: 100%;
  min-height: 300px;
  
  // CarouselElement 內部會處理高度
}

.delete-element-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  font-size: 14px;
  font-weight: bold;
  color: #666;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
  
  &:hover {
    background: #dc3545;
    color: #fff;
    transform: scale(1.1);
  }
}

// ==================== 元件樣式 ====================

.element-image {
  .element-img {
    width: 100%;
    height: auto;
    max-height: 300px;
    border-radius: 4px;
    object-fit: cover;
  }
  
  .placeholder-image {
    width: 100%;
    height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border: 2px dashed #ddd;
    border-radius: 4px;
    color: #999;
    
    span {
      font-size: 48px;
      margin-bottom: 8px;
    }
    
    p {
      font-size: 14px;
      margin: 0;
    }
  }
}

.element-text {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  min-height: 100px;
  
  ::v-deep(p) {
    margin: 0 0 1em;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.element-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  
  .button-link {
    display: inline-block;
    padding: 12px 32px;
    background: #E8572A;
    color: #fff;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
    font-size: 16px;
    transition: background 0.2s;
    cursor: not-allowed;
    
    &:hover {
      background: #d14a1f;
    }
  }
}

.element-hline {
  padding: 40px 0;
  
  hr {
    border: none;
    border-top: 2px solid #ddd;
    margin: 0;
  }
}

.element-vline {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  min-height: 150px;
  
  .vertical-line {
    width: 2px;
    height: 100%;
    min-height: 100px;
    background: #ddd;
  }
}

.element-map {
  width: 100%;
  height: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8f5e9;
  border: 2px dashed #4caf50;
  border-radius: 8px;
}

.map-placeholder {
  text-align: center;
  
  span {
    font-size: 48px;
    display: block;
    margin-bottom: 8px;
  }
  
  p {
    margin: 0;
    color: #2e7d32;
    font-size: 14px;
  }
}

.element-album {
  width: 100%;
  height: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3e5f5;
  border: 2px dashed #9c27b0;
  border-radius: 8px;
}

.album-placeholder {
  text-align: center;
  
  span {
    font-size: 48px;
    display: block;
    margin-bottom: 8px;
  }
  
  p {
    margin: 0;
    color: #7b1fa2;
    font-size: 14px;
  }
}

.element-unknown {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #fff3cd;
  border: 2px dashed #ffc107;
  border-radius: 4px;
  color: #856404;
  font-size: 14px;
  min-height: 150px;
}

// ==================== 空格子樣式 ====================

.empty-cell {
  height: 100%;  // ✅ 佔滿整個格子高度
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;  // ✅ 默認透明
  border: 2px dashed transparent;  // ✅ 默認透明邊框
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  .drop-hint {
    color: transparent;  // ✅ 默認隱藏文字
    font-size: 14px;
    pointer-events: none;
    transition: all 0.2s;
  }
  
  // ✅ 懸浮時顯示（鼠標懸停）
  &:hover {
    background: #fafafa;
    border-color: #ddd;
    
    .drop-hint {
      color: #999;
    }
  }
  
  // ✅ 拖曳元件經過時顯示（更明顯）
  &.drag-over {
    background: #fff5f2;
    border-color: #E8572A;
    border-width: 3px;
    border-style: solid;
    box-shadow: 0 0 0 4px rgba(232, 87, 42, 0.1);
    transform: scale(1.02);
    
    .drop-hint {
      color: #E8572A;
      transform: scale(1.1);
    }
  }
}

// ✅ 當全局正在拖曳時，顯示所有空格子的邊框
.custom-frame.is-dragging .empty-cell {
  background: #fafafa;
  border-color: #ddd;
  
  .drop-hint {
    color: #ccc;
  }
}
</style>
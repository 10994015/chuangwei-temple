<template>
  <div class="frame-custom" :style="getFrameStyle()">
    <div class="frame-grid" :class="`layout-${frame.layout}`">
      <!-- 渲染每個格子 -->
      <div
        v-for="col in frame.columns"
        :key="col.id"
        class="grid-cell"
        :class="`span-${col.span || 'normal'}`"
        @dragover.prevent
        @drop="handleDrop($event, col)"
      >
        <!-- 如果有元件，渲染元件 -->
        <div
          v-if="frame.elements && frame.elements[col.id]"
          :class="['element-wrapper', { 
            selected: selectedElement?.id === frame.elements[col.id].id 
          }]"
          @click.stop="handleSelectElement(frame.elements[col.id])"
        >
          <!-- 元件刪除按鈕 -->
          <button
            class="delete-btn"
            @click.stop="handleDelete(col.id)"
            title="刪除元件"
          >
            ✕
          </button>

          <!-- 渲染元件內容 -->
          <component
            :is="getElementComponent(frame.elements[col.id].type)"
            :data="frame.elements[col.id].content"
          />
        </div>

        <!-- 空格子 -->
        <div v-else class="empty-cell">
          <div class="empty-icon">🖼️</div>
          <p>拖拽元件到此</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  frame: {
    type: Object,
    required: true
  },
  selectedElement: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['select-element', 'delete-element', 'drop-to-cell'])

// 獲取框架樣式
const getFrameStyle = () => {
  if (!props.frame.properties) return {}
  
  const p = props.frame.properties
  return {
    paddingTop: p['padding-top'] || '40px',
    paddingRight: p['padding-right'] || '40px',
    paddingBottom: p['padding-bottom'] || '40px',
    paddingLeft: p['padding-left'] || '40px'
  }
}

// 獲取元件組件
const getElementComponent = (type) => {
  const components = {
    text: 'ElementText',
    image: 'ElementImage',
    button: 'ElementButton',
    'h-line': 'ElementHLine',
    'v-line': 'ElementVLine',
    carousel: 'ElementCarousel',
    map: 'ElementMap',
    album: 'ElementAlbum'
  }
  return components[type] || 'ElementDefault'
}

// 處理拖放
const handleDrop = (event, col) => {
  emit('drop-to-cell', { event, frame: props.frame, col })
}

// 選擇元件
const handleSelectElement = (element) => {
  emit('select-element', element)
}

// 刪除元件
const handleDelete = (colId) => {
  emit('delete-element', { frame: props.frame, colId })
}
</script>

<!-- 引入元件組件 -->
<script>
import ElementText from '../elements/ElementText.vue'
import ElementImage from '../elements/ElementImage.vue'
import ElementButton from '../elements/ElementButton.vue'
import ElementHLine from '../elements/ElementHLine.vue'
import ElementVLine from '../elements/ElementVLine.vue'
import ElementCarousel from '../elements/ElementCarousel.vue'
import ElementMap from '../elements/ElementMap.vue'
import ElementAlbum from '../elements/ElementAlbum.vue'
import ElementDefault from '../elements/ElementDefault.vue'

export default {
  components: {
    ElementText,
    ElementImage,
    ElementButton,
    ElementHLine,
    ElementVLine,
    ElementCarousel,
    ElementMap,
    ElementAlbum,
    ElementDefault
  }
}
</script>

<style scoped>
.frame-custom {
  background: #fff;
}

.frame-grid {
  display: grid;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* ===== 單層框架 ===== */
.frame-grid.layout-1-1 {
  grid-template-columns: 1fr;
}

.frame-grid.layout-1-2 {
  grid-template-columns: repeat(2, 1fr);
}

.frame-grid.layout-1-3 {
  grid-template-columns: repeat(3, 1fr);
}

.frame-grid.layout-1-4 {
  grid-template-columns: repeat(4, 1fr);
}

/* ===== 雙層框架 ===== */
.frame-grid.layout-2-2 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.frame-grid.layout-2-3 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.frame-grid.layout-2-4 {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

/* ===== 複合框架 ===== */
.frame-grid.layout-a {
  grid-template-columns: 2fr 1fr;
  grid-template-rows: repeat(2, 1fr);
}

.frame-grid.layout-a .grid-cell:nth-child(1) {
  grid-row: 1 / 3;
}

.frame-grid.layout-b {
  grid-template-columns: 1fr 2fr;
  grid-template-rows: repeat(2, 1fr);
}

.frame-grid.layout-b .grid-cell:nth-child(3) {
  grid-row: 1 / 3;
}

.frame-grid.layout-c {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.frame-grid.layout-c .grid-cell:nth-child(1) {
  grid-column: 1 / 3;
}

.frame-grid.layout-c .grid-cell:nth-child(2) {
  grid-column: 3 / 5;
}

.frame-grid.layout-d {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.frame-grid.layout-d .grid-cell:nth-child(3) {
  grid-column: 3 / 5;
}

.frame-grid.layout-d .grid-cell:nth-child(4) {
  grid-column: 3 / 5;
}

/* ===== 格子樣式 ===== */
.grid-cell {
  min-height: 200px;
  position: relative;
  transition: all 0.2s;
}

.grid-cell:hover {
  outline: 2px dashed #E8572A;
  outline-offset: -2px;
}

/* ===== 空格子 ===== */
.empty-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: #fafafa;
  color: #999;
  transition: all 0.2s;
}

.grid-cell:hover .empty-cell {
  border-color: #E8572A;
  background: #fffaf8;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-cell p {
  margin: 0;
  font-size: 14px;
}

/* ===== 元件包裝 ===== */
.element-wrapper {
  position: relative;
  min-height: 200px;
  border: 2px solid transparent;
  border-radius: 4px;
  transition: all 0.2s;
  cursor: pointer;
}

.element-wrapper:hover {
  border-color: #E8572A;
}

.element-wrapper:hover .delete-btn {
  opacity: 1;
}

.element-wrapper.selected {
  border-color: #E8572A;
  box-shadow: 0 0 0 3px rgba(232, 87, 42, 0.1);
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  font-size: 16px;
  font-weight: bold;
  color: #666;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.delete-btn:hover {
  background: #dc3545;
  color: #fff;
  transform: scale(1.1);
}
</style>
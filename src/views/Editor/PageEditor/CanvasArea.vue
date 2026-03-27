<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import BasemapWrapper from './basemap/BasemapWrapper.vue'
import SystemFrame from './SystemFrame.vue'
import CustomFrame from './CustomFrame.vue'

// Props
const props = defineProps({
  basemaps: { type: Array, default: () => [] },
  selectedBasemap: { type: Object, default: null },
  selectedFrame: { type: Object, default: null },
  selectedElement: { type: Object, default: null },
  selectedCell: { type: Object, default: null },
  currentPageSlug: { type: String, default: null }
})

// Emits
const emit = defineEmits([
  'select-basemap', 'select-frame', 'select-element', 'select-cell',
  'drop-to-basemap', 'drop-to-cell', 'delete-basemap', 'delete-element',
  'delete-frame', 'update-element', 'update-background', 'update-cell-padding',
  'add-basemap', 'move-basemap-up', 'move-basemap-down', 'change-page'
])

// ==================== Scroll-to-top ====================
const canvasRef = ref(null)
const showScrollTop = ref(false)

const handleScroll = () => {
  showScrollTop.value = (canvasRef.value?.scrollTop ?? 0) > 300
}

const scrollToTop = () => {
  canvasRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  canvasRef.value?.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  canvasRef.value?.removeEventListener('scroll', handleScroll)
})

// ==================== 拖曳狀態 ====================
const dragOverBasemap = ref(null)
const isDragging = ref(false)

if (typeof window !== 'undefined') {
  window.addEventListener('dragstart', () => { isDragging.value = true })
  window.addEventListener('dragend', () => { isDragging.value = false; dragOverBasemap.value = null })
  window.addEventListener('drop', () => { isDragging.value = false; dragOverBasemap.value = null })
}

// ==================== 頁面切換 ====================
const handleChangePage = (slug) => {
  console.log('CanvasArea: 切換頁面', slug)
  emit('change-page', slug)
}

// ==================== 選擇事件 ====================
const isBasemapSelected = (basemap) => props.selectedBasemap === basemap

const handleBasemapClick = (basemap) => {
  console.log('點擊底圖:', basemap.bgType)
  emit('select-basemap', basemap)
}

const handleSelectFrame = (frame) => {
  console.log('CanvasArea: 選擇框架', frame?.type)
  emit('select-frame', frame)
}

const handleSelectElement = (data) => { emit('select-element', data) }
const handleUpdateElement = (data) => { emit('update-element', data) }
const handleSelectCell = (data) => { emit('select-cell', data) }
const handleUpdateCellPadding = (data) => { emit('update-cell-padding', data) }

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
  if (direction === 'up') emit('move-basemap-up', fromIndex)
  else if (direction === 'down') emit('move-basemap-down', fromIndex)
}

const handleUpdateBackground = (data) => {
  console.log('CanvasArea 收到背景更新事件:', data)
  emit('update-background', data)
}

// ==================== 拖曳事件 ====================
const handleDragOver = (event, index) => {
  event.preventDefault()
  event.stopPropagation()
  event.dataTransfer.dropEffect = 'copy'
  dragOverBasemap.value = `basemap-${index}`
}

const handleDragLeave = (event) => {
  event.preventDefault()
  event.stopPropagation()
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
    if (!data) return
    const dragData = JSON.parse(data)
    console.log('📦 放置到底圖:', dragData)

    if (dragData.dragType === 'element') {
      console.log('元件不能直接放到底圖')
      return
    }

    const hasFrames = basemap.frames && basemap.frames.length > 0
    if (hasFrames) {
      const hasSystemFrame = basemap.frames.some(f => f.type && !f.type.startsWith('FRAME'))
      const isDraggingSystemFrame = dragData.dragType === 'system-frame'

      if (hasSystemFrame) { alert('此底圖已有系統框架，不能再添加其他框架'); return }
      if (!hasSystemFrame && isDraggingSystemFrame) { alert('此底圖已有自訂框架，不能添加系統框架'); return }
    }

    emit('drop-to-basemap', { basemap, basemapIndex, frame: dragData })
  } catch (error) {
    console.error('處理拖放時發生錯誤:', error)
  }
}

// ==================== 元件操作 ====================
const handleDropToCell = (data) => { emit('drop-to-cell', data) }
const handleDeleteElement = (data) => { emit('delete-element', data) }

const handleDeleteFrame = (data, basemap, basemapIndex) => {
  console.log('CanvasArea: 刪除框架', data)
  emit('delete-frame', { ...data, basemap, basemapIndex })
}

// ==================== 輔助函數 ====================
const isSystemFrame = (frame) => {
  if (!frame || !frame.type) return false
  return !frame.type.startsWith('FRAME')
}

const getBasemapKey = (basemap, index) => {
  return `${basemap.bgType}-${index}`
}
</script>

<template>
  <div ref="canvasRef" class="canvas-area" :class="{ 'is-dragging': isDragging }">
    <div class="temple-website">
      <!-- 動態渲染底圖 -->
      <template v-for="(basemap, index) in basemaps" :key="getBasemapKey(basemap, index)">
        <BasemapWrapper 
          :index="index"
          :basemap-id="`basemap-${index}`"
          :basemap="basemap"
          :is-footer="basemap.bgType === 'FOOTER'"
          :is-header="basemap.bgType === 'HEADER'"
          :is-deletable="basemap.bgIsDeletable"
          :total-basemaps="basemaps.length"
          @add-basemap="handleAddBasemap"
          @delete-basemap="() => handleDeleteBasemap(index)"
          @move-basemap="handleMoveBasemap"
          @update-background="handleUpdateBackground"
        >
          <div 
            class="basemap-with-frames"
            :class="{ 
              'drag-over': dragOverBasemap === `basemap-${index}`,
              'has-frame': basemap.frames && basemap.frames.length > 0,
              'is-selected': isBasemapSelected(basemap)
            }"
            :style="{ backgroundImage: basemap.bgPcImgSrc ? `url(${basemap.bgPcImgSrc})` : 'none' }"
            @dragover="handleDragOver($event, index)"
            @dragleave="handleDragLeave"
            @drop="handleDrop($event, basemap, index)"
          >
            <div 
              class="basemap-overlay"
              :class="{ 'show': isBasemapSelected(basemap) }"
              @click.stop="handleBasemapClick(basemap)"
              title="點擊選擇底圖以編輯背景"
            ></div>

            <div 
              v-if="!basemap.frames || basemap.frames.length === 0" 
              class="blank-basemap"
              :class="{ 
                'drag-over': dragOverBasemap === `basemap-${index}`,
                'is-selected': isBasemapSelected(basemap),
                'has-bg': !!basemap.bgPcImgSrc
              }"
              @click="handleBasemapClick(basemap)"
            >
              <div class="blank-content">
                <div class="blank-icon">📄</div>
                <p class="blank-text">空白底圖</p>
                <p class="blank-hint">從左側拖曳框架至此處</p>
                <p class="blank-note" v-if="!basemap.bgAllowMultipleFrames">此底圖只允許一個框架</p>
                <p class="blank-note" v-else>此底圖可以有多個框架</p>
              </div>
            </div>
            
            <template v-for="(frame, frameIndex) in basemap.frames" :key="`frame-${frameIndex}`">
              <SystemFrame 
                v-if="isSystemFrame(frame)"
                :frame-type="frame.type"
                :frame-data="frame.data"
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
              
              <CustomFrame
                v-else
                :frame="frame"
                :basemap="basemap"
                :basemap-index="index"
                :selected-element="selectedElement"
                :selected-cell="selectedCell"
                :selected-frame="selectedFrame"
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

    <!-- Scroll-to-top 按鈕 -->
    <Transition name="scroll-top">
      <button
        v-if="showScrollTop"
        class="scroll-top-btn"
        @click="scrollToTop"
        title="回到頂部"
        aria-label="回到頂部"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round">
          <polyline points="18 15 12 9 6 15"/>
        </svg>
      </button>
    </Transition>
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
  max-width: 1920px;
  margin: 0 auto;
}

.temple-website {
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft JhengHei', sans-serif;
  color: #333;
  background: #fff;
}

// ==================== Scroll-to-top ====================

.scroll-top-btn {
  position: sticky;
  bottom: 32px;
  // 靠右下，margin-left: auto 推到右側，再配合自身寬度偏移
  align-self: flex-end;
  margin-right: 32px;
  // 讓它浮在內容上方，不佔 flow 空間
  margin-top: -56px; // 負 margin 讓它不推擠下方內容
  z-index: 100;
  width: 44px;
  min-height: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: #E8572A;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(232, 87, 42, 0.4);
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
  pointer-events: auto;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: #d14a1f;
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(232, 87, 42, 0.5);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(232, 87, 42, 0.3);
  }
}

// 進場/離場動畫
.scroll-top-enter-active,
.scroll-top-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}

.scroll-top-enter-from,
.scroll-top-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

// ==================== 以下與原版相同 ====================

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

  &.has-bg {
    .blank-content {
      background: rgba(0, 0, 0, 0.35);
      border-radius: 12px;
      padding: 1.5rem 2.5rem;
      backdrop-filter: blur(2px);
      transition: background 0.3s ease;
    }
    .blank-icon { opacity: 0.7; color: #fff; }
    .blank-text, .blank-hint, .blank-note { opacity: 0.85; color: #fff; }

    &:hover {
      background: transparent;
      border-color: rgba(255, 255, 255, 0.5);
      .blank-content { background: rgba(0, 0, 0, 0.5); }
      .blank-icon { opacity: 0.9; }
      .blank-text, .blank-hint { opacity: 1; }
    }

    &.is-selected {
      background: transparent;
      border-color: #E8572A;
      border-style: solid;
      box-shadow: 0 0 0 4px rgba(232, 87, 42, 0.3);
      .blank-content { background: rgba(0, 0, 0, 0.5); }
      .blank-icon { opacity: 0.9; }
      .blank-text, .blank-hint { opacity: 1; }
    }

    &.drag-over {
      background: transparent;
      border-color: #E8572A;
      border-width: 3px;
      border-style: solid;
      box-shadow: 0 0 0 4px rgba(232, 87, 42, 0.3);
      transform: scale(1.01);
      .blank-content { background: rgba(232, 87, 42, 0.35); }
      .blank-icon { opacity: 0.9; transform: scale(1.1); }
      .blank-text, .blank-hint { color: #fff; opacity: 1; }
    }
  }
  
  &:hover {
    background: #fafafa;
    border-color: #ddd;
    .blank-icon { opacity: 0.3; }
    .blank-text, .blank-hint { opacity: 1; }
  }
  
  &.is-selected {
    background: #fafafa;
    border-color: #E8572A;
    border-style: solid;
    box-shadow: 0 0 0 4px rgba(232, 87, 42, 0.1);
    .blank-icon { opacity: 0.3; }
    .blank-text, .blank-hint { opacity: 1; }
  }
  
  &.drag-over {
    background: #fff5f2;
    border-color: #E8572A;
    border-width: 3px;
    border-style: solid;
    box-shadow: 0 0 0 4px rgba(232, 87, 42, 0.1);
    transform: scale(1.01);
    .blank-icon { opacity: 0.6; transform: scale(1.1); }
    .blank-text, .blank-hint { color: #E8572A; opacity: 1; }
  }
}

.canvas-area.is-dragging .blank-basemap {
  background: #fafafa;
  border-color: #ddd;
  .blank-icon { opacity: 0.2; }
  .blank-text, .blank-hint { opacity: 0.8; }
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
  transition: all 0.3s ease;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  &.is-selected {
    outline: 3px solid #E8572A;
    outline-offset: -3px;
    box-shadow: 0 0 0 4px rgba(232, 87, 42, 0.1);
    .basemap-overlay { opacity: 1; }
  }
}

.basemap-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(232, 87, 42, 0.05);
  opacity: 0;
  transition: opacity 0.2s ease;
  cursor: pointer;
  z-index: 1;
  pointer-events: none;
  
  &:hover { opacity: 1; background: rgba(232, 87, 42, 0.08); }
  &.show { opacity: 1; pointer-events: auto; }
}

.relative-frame {
  position: relative;
  z-index: 2;
}

.canvas-area::-webkit-scrollbar { width: 8px; }
.canvas-area::-webkit-scrollbar-track { background: #f1f1f1; }
.canvas-area::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 4px;
  &:hover { background: #ccc; }
}
</style>
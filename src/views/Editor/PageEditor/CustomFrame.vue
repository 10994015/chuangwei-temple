<template>
  <div
    class="custom-frame"
    :class="[`layout-${frameLayout}`, { 'is-selected': isFrameSelected, 'is-dragging': isDragging }]"
    @click.stop="handleFrameClick"
  >
    <button
      v-if="isFrameSelected && !hasAnyElement && frame.isDeletable"
      class="delete-frame-btn"
      @click.stop="handleDeleteFrame"
      :title="t('customFrame.deleteFrame')"
    >
      ✕
    </button>

    <div class="frame-container" :style="frameContainerStyle">

      <!-- 雙層框架 -->
      <template v-if="isDoubleRowLayout">
        <div class="double-row" :style="doubleRowStyle">
          <div
            v-for="(element, index) in doubleRowSplit.row1"
            :key="`row1-cell-${index}`"
            class="grid-cell"
            :class="cellClass(element, index)"
            :style="{ padding: getCellPadding(element), flex: getCellFlex(element), minWidth: 0 }"
            @click.stop="handleCellClick(index, element)"
            @dragover="handleDragOver($event, index)"
            @dragleave="handleDragLeave"
            @drop="handleDrop($event, index)"
          >
            <FrameElementRenderer
              :element="element"
              :cell-index="index"
              :cell-key="`r1-${index}`"
              :is-edit-mode="true"
              :is-drag-over="dragOverCell === index"
              @delete="handleDeleteElement"
            />
          </div>
        </div>

        <div class="double-row" :style="doubleRowStyle">
          <div
            v-for="(element, rIndex) in doubleRowSplit.row2"
            :key="`row2-cell-${rIndex}`"
            class="grid-cell"
            :class="cellClass(element, doubleLayoutCols + rIndex)"
            :style="{ padding: getCellPadding(element), flex: getCellFlex(element), minWidth: 0 }"
            @click.stop="handleCellClick(doubleLayoutCols + rIndex, element)"
            @dragover="handleDragOver($event, doubleLayoutCols + rIndex)"
            @dragleave="handleDragLeave"
            @drop="handleDrop($event, doubleLayoutCols + rIndex)"
          >
            <FrameElementRenderer
              :element="element"
              :cell-index="doubleLayoutCols + rIndex"
              :cell-key="`r2-${rIndex}`"
              :is-edit-mode="true"
              :is-drag-over="dragOverCell === (doubleLayoutCols + rIndex)"
              @delete="handleDeleteElement"
            />
          </div>
        </div>
      </template>

      <!-- 複合框架 A/B/C/D -->
      <template v-else-if="isCompositeLayout && compositeInfo">
        <div class="composite-frame">
          <div class="composite-col composite-col--left" :style="{ width: compositeInfo.leftWidth }">
            <div
              v-for="idx in compositeInfo.leftCells"
              :key="`composite-left-${idx}`"
              class="grid-cell composite-cell"
              :class="cellClass(displayElements[idx], idx)"
              :style="{ padding: getCellPadding(displayElements[idx]) }"
              @click.stop="handleCellClick(idx, displayElements[idx])"
              @dragover="handleDragOver($event, idx)"
              @dragleave="handleDragLeave"
              @drop="handleDrop($event, idx)"
            >
              <FrameElementRenderer
                :element="displayElements[idx]"
                :cell-index="idx"
                :cell-key="`cl-${idx}`"
                :is-edit-mode="true"
                :is-drag-over="dragOverCell === idx"
                @delete="handleDeleteElement"
              />
            </div>
          </div>

          <div class="composite-col composite-col--right">
            <div
              v-for="idx in compositeInfo.rightCells"
              :key="`composite-right-${idx}`"
              class="grid-cell composite-cell"
              :class="cellClass(displayElements[idx], idx)"
              :style="{ padding: getCellPadding(displayElements[idx]) }"
              @click.stop="handleCellClick(idx, displayElements[idx])"
              @dragover="handleDragOver($event, idx)"
              @dragleave="handleDragLeave"
              @drop="handleDrop($event, idx)"
            >
              <FrameElementRenderer
                :element="displayElements[idx]"
                :cell-index="idx"
                :cell-key="`cr-${idx}`"
                :is-edit-mode="true"
                :is-drag-over="dragOverCell === idx"
                @delete="handleDeleteElement"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- 單層框架 -->
      <div v-else class="frame-grid" :style="gridStyle">
        <div
          v-for="(element, index) in displayElements"
          :key="`cell-${index}`"
          class="grid-cell"
          :class="cellClass(element, index)"
          :style="{ padding: getCellPadding(element) }"
          @click.stop="handleCellClick(index, element)"
          @dragover="handleDragOver($event, index)"
          @dragleave="handleDragLeave"
          @drop="handleDrop($event, index)"
        >
          <FrameElementRenderer
            :element="element"
            :cell-index="index"
            :cell-key="`cell-${index}`"
            :is-edit-mode="true"
            :is-drag-over="dragOverCell === index"
            @delete="handleDeleteElement"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FrameElementRenderer from './elements/FrameElementRenderer.vue'

const { t } = useI18n()

const props = defineProps({
  frame:           { type: Object,  required: true },
  basemap:         { type: Object,  required: true },
  basemapIndex:    { type: Number,  required: true },
  selectedElement: { type: Object,  default: null },
  selectedCell:    { type: Object,  default: null },
  selectedFrame:   { type: Object,  default: null }
})

const emit = defineEmits([
  'select-frame', 'select-element', 'select-cell',
  'drop-to-cell', 'delete-element', 'delete-frame'
])

const dragOverCell = ref(null)
const isDragging   = ref(false)

if (typeof window !== 'undefined') {
  window.addEventListener('dragstart', () => { isDragging.value = true })
  window.addEventListener('dragend',   () => { isDragging.value = false; dragOverCell.value = null })
  window.addEventListener('drop',      () => { isDragging.value = false; dragOverCell.value = null })
}

const frameLayout = computed(() => {
  if (!props.frame?.type) return 'A'
  const type = props.frame.type
  if (type.startsWith('FRAME')) {
    return type.replace(/^FRAME/, '').replace(/^[-_]/, '').replace(/-/g, '_')
  }
  return type
})

const cellCount = computed(() => {
  switch (frameLayout.value) {
    case 'A': case 'B': return 3
    case 'C': case 'D': return 4
    case '1_1': return 1
    case '1_2': return 2
    case '1_3': return 3
    case '1_4': return 4
    case '2_2': return 4
    case '2_3': return 6
    case '2_4': return 8
    default:    return 4
  }
})

const displayElements = computed(() => {
  const elements = props.frame.elements || []
  const result = [...elements]
  while (result.length < cellCount.value) result.push(null)
  return result.slice(0, cellCount.value)
})

const hasAnyElement = computed(() =>
  (props.frame.elements || []).some(el => el && el.type)
)

const doubleLayoutCols = computed(() => {
  switch (frameLayout.value) {
    case '2_2': return 2
    case '2_3': return 3
    case '2_4': return 4
    default: return 0
  }
})

const isDoubleRowLayout  = computed(() => doubleLayoutCols.value > 0)
const isCompositeLayout  = computed(() => ['A', 'B', 'C', 'D'].includes(frameLayout.value))

const doubleRowSplit = computed(() => {
  if (!isDoubleRowLayout.value) return null
  const cols = doubleLayoutCols.value
  const els  = displayElements.value
  return { row1: els.slice(0, cols), row2: els.slice(cols, cols * 2) }
})

const doubleRowStyle = computed(() => ({ display: 'flex', width: '100%' }))

const compositeInfo = computed(() => {
  const layout = frameLayout.value
  const els    = displayElements.value
  const map = {
    'A': { leftCells: [0],       rightCells: [1, 2],    leftWidth: els[0]?.width || '66.7%' },
    'B': { leftCells: [0, 1],    rightCells: [2],       leftWidth: els[0]?.width || '33.3%' },
    'C': { leftCells: [0],       rightCells: [1, 2, 3], leftWidth: els[0]?.width || '66.7%' },
    'D': { leftCells: [0, 1, 2], rightCells: [3],       leftWidth: els[0]?.width || '33.3%' },
  }
  return map[layout] || null
})

const frameContainerStyle = computed(() => {
  const style = { maxWidth: '1200px', margin: '0 auto', width: '100%' }
  if (props.frame.metadata?.frameWidth) style.maxWidth = props.frame.metadata.frameWidth
  return style
})

const gridStyle = computed(() => {
  const layout = frameLayout.value
  const singleRowLayouts = ['1_1', '1_2', '1_3', '1_4']
  if (singleRowLayouts.includes(layout)) {
    const widths = displayElements.value.map(el => el?.width || '1fr')
    return { display: 'grid', gridTemplateColumns: widths.join(' '), gap: '0' }
  }
  return { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0' }
})

const isFrameSelected   = computed(() => props.selectedFrame === props.frame)
const isElementSelected = (index) => props.selectedElement?.elementIndex === index && props.selectedElement?.frame === props.frame
const isCellSelected    = (index) => props.selectedCell?.cellIndex === index && props.selectedCell?.frame === props.frame

const cellClass = (element, index) => ({
  'has-element': element && element.type,
  'is-selected': isElementSelected(index) || isCellSelected(index),
  'empty-cell':  !element || !element.type
})

const getCellPadding = (element) => {
  if (!element?.padding) return '20px'
  const { top = 20, right = 20, bottom = 20, left = 20 } = element.padding
  return `${top}px ${right}px ${bottom}px ${left}px`
}

const getCellFlex = (element) => {
  if (!element?.width) return '1'
  return element.width === 'auto' ? '1' : `0 0 ${element.width}`
}

const handleFrameClick = () => emit('select-frame', props.frame)

const handleCellClick = (index, element) => {
  if (element && element.type) {
    emit('select-element', { element, frame: props.frame, elementIndex: index, cellIndex: index })
  } else {
    emit('select-cell', { frame: props.frame, cellIndex: index })
    emit('select-frame', props.frame)
  }
}

const handleDragOver = (event, index) => {
  event.preventDefault()
  const element = displayElements.value[index]
  if (element && element.type) {
    event.dataTransfer.dropEffect = 'none'
    dragOverCell.value = null
  } else {
    event.dataTransfer.dropEffect = 'copy'
    dragOverCell.value = index
  }
}

const handleDragLeave = (event) => {
  event.preventDefault()
  dragOverCell.value = null
}

const handleDrop = (event, index) => {
  try {
    const data = event.dataTransfer.getData('application/json')
    if (!data) return
    const dragData = JSON.parse(data)
    if (dragData.dragType !== 'element') return
    event.preventDefault()
    event.stopPropagation()
    dragOverCell.value = null
    const element = displayElements.value[index]
    if (element && element.type) { alert(t('customFrame.cellOccupied')); return }
    emit('drop-to-cell', { frame: props.frame, cellIndex: index, element: createElementFromDrag(dragData, index) })
  } catch (error) {
    console.error('處理拖放時發生錯誤:', error)
  }
}

const handleDeleteElement = (index) => emit('delete-element', { frame: props.frame, elementIndex: index })

const handleDeleteFrame = () => {
  if (confirm(t('customFrame.confirmDeleteFrame'))) {
    emit('delete-frame', { frame: props.frame, basemap: props.basemap, basemapIndex: props.basemapIndex })
  }
}

const createElementFromDrag = (dragData, index) => {
  const typeMap = {
    'text': 'TEXT', 'image': 'IMG', 'button': 'BUTTON',
    'h-line': 'HORIZON_LINE', 'v-line': 'VERTICAL_LINE',
    'carousel': 'CAROUSEL_IMG', 'map': 'GOOGLE_MAP',
    'product-card': 'PRODUCT_CARD', 'service-card': 'SERVICE_CARD', 'event-card': 'EVENT_CARD'
  }
  const apiType = typeMap[dragData.type] || dragData.type.toUpperCase()
  let value = {}
  switch (dragData.type) {
    case 'text':         value = { text: `<p>${t('customFrame.initText')}</p>` }; break
    case 'image':        value = { id: null, src: null, alt: '' }; break
    case 'button':       value = { text: t('customFrame.initButtonText'), url: '#' }; break
    case 'h-line':       value = { color: '#ddd', thickness: '2px' }; break
    case 'v-line':       value = { color: '#ddd', thickness: '2px' }; break
    case 'carousel':     value = { imgs: [], autoPlay: true, interval: 3000, height: 400 }; break
    case 'map':          value = { address: '台北市信義區信義路五段7號（台北 101）', lat: 25.0339639, lng: 121.5644722, zoom: 17 }; break
    case 'album':        value = { image: null, tag: '相簿封面', title: '相簿標題', description: '' }; break
    case 'product-card': value = { image: null, tag: '法會活動', title: '商品標題', date: '2024-08-22' }; break
    case 'service-card': value = { image: null, tag: '祈福服務', title: '服務標題', date: '2024-08-22' }; break
    case 'event-card':   value = { image: null, tag: '法會活動', title: '中元普渡法會', description: '2024年中元普渡法會活動紀錄' }; break
  }
  return {
    type: apiType, value,
    metadata: { color: null, fontSize: null, fontWeight: null, textAlign: null, width: null, height: null, backgroundColor: null },
    padding: { top: 20, right: 20, bottom: 20, left: 20 },
    width: getInitialCellWidth(frameLayout.value, index)
  }
}

const getInitialCellWidth = (layout, cellIndex) => {
  const singleRowLayouts = { '1_1': 1, '1_2': 2, '1_3': 3, '1_4': 4 }
  if (singleRowLayouts[layout]) {
    const cellsInRow = singleRowLayouts[layout]
    const existing = displayElements.value.filter(el => el && el.type)
    if (existing.length > 0) {
      let usedWidth = 0, elementsWithWidth = 0
      existing.forEach(el => {
        if (el.width?.includes('%')) {
          const w = parseFloat(el.width)
          if (!isNaN(w)) { usedWidth += w; elementsWithWidth++ }
        }
      })
      const remaining = 100 - usedWidth
      const remainingCells = cellsInRow - elementsWithWidth
      if (remainingCells > 0 && remaining > 0) return (remaining / remainingCells).toFixed(1) + '%'
    }
    return (100 / cellsInRow).toFixed(1) + '%'
  }

  const doubleRowCols = { '2_2': 2, '2_3': 3, '2_4': 4 }
  if (doubleRowCols[layout]) {
    const cols = doubleRowCols[layout]
    const row = cellIndex < cols ? 0 : 1
    const rowStart = row * cols
    const rowEls = displayElements.value.slice(rowStart, rowStart + cols)
    const existing = rowEls.filter(el => el && el.type)
    if (existing.length > 0) {
      let usedWidth = 0, elementsWithWidth = 0
      existing.forEach(el => {
        if (el.width?.includes('%')) {
          const w = parseFloat(el.width)
          if (!isNaN(w)) { usedWidth += w; elementsWithWidth++ }
        }
      })
      const remaining = 100 - usedWidth
      const remainingCells = cols - elementsWithWidth
      if (remainingCells > 0 && remaining > 0) return (remaining / remainingCells).toFixed(1) + '%'
    }
    return (100 / cols).toFixed(1) + '%'
  }

  const compositeMap = {
    'A': { leftCells: [0],       rightCells: [1, 2],    defaultLeft: '66.7%', defaultRight: '33.3%' },
    'B': { leftCells: [0, 1],    rightCells: [2],       defaultLeft: '33.3%', defaultRight: '66.7%' },
    'C': { leftCells: [0],       rightCells: [1, 2, 3], defaultLeft: '66.7%', defaultRight: '33.3%' },
    'D': { leftCells: [0, 1, 2], rightCells: [3],       defaultLeft: '33.3%', defaultRight: '66.7%' },
  }
  if (compositeMap[layout]) {
    const info = compositeMap[layout]
    const isLeft = info.leftCells.includes(cellIndex)
    const allCells = isLeft ? info.leftCells : info.rightCells
    const els = displayElements.value
    for (const idx of allCells) {
      if (els[idx]?.width?.includes('%')) return els[idx].width
    }
    return isLeft ? info.defaultLeft : info.defaultRight
  }

  return '100%'
}
</script>

<style lang="scss" scoped>
.custom-frame {
  padding: 0;
  background: transparent;
  min-height: auto;
  position: relative;
  transition: all 0.2s;
  cursor: pointer;

  &:hover { box-shadow: 0 0 0 2px rgba(232, 87, 42, 0.2); }

  &.is-selected {
    box-shadow: 0 0 0 3px rgba(232, 87, 42, 0.5);
    .delete-frame-btn { opacity: 1; }
  }
}

.delete-frame-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  font-size: 16px;
  font-weight: bold;
  color: #666;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 100;

  &:hover { background: #dc3545; color: #fff; transform: scale(1.1); }
}

.frame-container { max-width: 1200px; margin: 0 auto; width: 100%; }
.frame-grid { width: 100%; }
.double-row { display: flex; width: 100%; }

.composite-frame { display: flex; width: 100%; align-items: stretch; }

.composite-col {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  &--left .composite-cell:only-child { flex: 1; }

  &--right {
    flex: 1;
    flex-shrink: 1;
    .composite-cell { height: auto; }
  }
}

.composite-cell { width: 100%; box-sizing: border-box; }

.grid-cell {
  min-height: auto;
  position: relative;
  border-radius: 8px;
  transition: all 0.2s;
  box-sizing: border-box;
  border: 2px solid transparent;

  &.has-element {
    cursor: pointer;
    &:hover { border-color: #E8572A; }
    &.is-selected { border-color: #E8572A; box-shadow: 0 0 0 3px rgba(232, 87, 42, 0.1); }
  }

  &.empty-cell.is-selected {
    border: 2px dashed #E8572A;
    background: rgba(232, 87, 42, 0.05);
  }
}

.custom-frame.is-dragging :deep(.empty-cell) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(200, 200, 200, 0.5);

  .drop-hint { color: #ccc; }
}
</style>
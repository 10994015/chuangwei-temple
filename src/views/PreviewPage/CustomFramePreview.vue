<template>
  <div
    class="custom-frame-preview"
    :class="[`layout-${frameLayout}`, `device-${device}`]"
  >
    <div class="frame-container" :style="frameContainerStyle">

      <!-- 雙層框架（桌機版） -->
      <template v-if="isDoubleRowLayout && !isMobile">
        <div class="double-row">
          <div
            v-for="(element, index) in doubleRowSplit.row1"
            :key="`row1-cell-${index}`"
            class="grid-cell"
            :style="getCellStyle(element, index)"
          >
            <FrameElementRenderer
              :element="element"
              :cell-index="index"
              :cell-key="`r1-${index}`"
              :is-edit-mode="false"
            />
          </div>
        </div>

        <div class="double-row">
          <div
            v-for="(element, rIndex) in doubleRowSplit.row2"
            :key="`row2-cell-${rIndex}`"
            class="grid-cell"
            :style="getCellStyle(element, rIndex)"
          >
            <FrameElementRenderer
              :element="element"
              :cell-index="rIndex"
              :cell-key="`r2-${rIndex}`"
              :is-edit-mode="false"
            />
          </div>
        </div>
      </template>

      <!-- 複合框架 A/B/C/D -->
      <template v-else-if="isCompositeLayout && compositeInfo && !isMobile">
        <div class="composite-frame">
          <div class="composite-col composite-col--left" :style="{ width: compositeInfo.leftWidth }">
            <div
              v-for="idx in compositeInfo.leftCells"
              :key="`composite-left-${idx}`"
              class="grid-cell composite-cell"
              :style="{ padding: getCellPadding(displayElements[idx]) }"
            >
              <FrameElementRenderer
                :element="displayElements[idx]"
                :cell-index="idx"
                :cell-key="`cl-${idx}`"
                :is-edit-mode="false"
              />
            </div>
          </div>

          <div class="composite-col composite-col--right">
            <div
              v-for="idx in compositeInfo.rightCells"
              :key="`composite-right-${idx}`"
              class="grid-cell composite-cell"
              :style="{ padding: getCellPadding(displayElements[idx]) }"
            >
              <FrameElementRenderer
                :element="displayElements[idx]"
                :cell-index="idx"
                :cell-key="`cr-${idx}`"
                :is-edit-mode="false"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- 其他框架 or 手機版 -->
      <div v-else class="frame-grid" :style="gridStyle">
        <div
          v-for="(element, index) in mobileReorderedElements"
          :key="`cell-${index}`"
          class="grid-cell"
          :style="getCellStyle(element, index)"
        >
          <FrameElementRenderer
            :element="element"
            :cell-index="index"
            :cell-key="`cell-${index}`"
            :is-edit-mode="false"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import FrameElementRenderer from '../Editor/PageEditor/elements/FrameElementRenderer.vue'

const props = defineProps({
  frame:  { type: Object, required: true },
  device: { type: String, default: 'desktop' }
})

const isMobile = computed(() => props.device === 'mobile')
const isTablet = computed(() => props.device === 'tablet')
const isNarrow = computed(() => isMobile.value)

const frameLayout = computed(() => {
  if (!props.frame?.type) return 'A'
  const type = props.frame.type
  if (type.startsWith('FRAME')) {
    return type.replace(/^FRAME/, '').replace(/^[-_]/, '').replace(/-/g, '_')
  }
  return type
})

const isMultiColumnLayout = computed(() =>
  ['A', 'B', 'C', 'D', '2_2', '2_3', '2_4'].includes(frameLayout.value)
)

const isSingleRowMultiCol = computed(() =>
  ['1_2', '1_3', '1_4'].includes(frameLayout.value)
)

const isCompositeLayout = computed(() =>
  ['A', 'B', 'C', 'D'].includes(frameLayout.value)
)

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

const doubleLayoutCols = computed(() => {
  switch (frameLayout.value) {
    case '2_2': return 2
    case '2_3': return 3
    case '2_4': return 4
    default: return 0
  }
})

const isDoubleRowLayout = computed(() => doubleLayoutCols.value > 0)

const doubleRowSplit = computed(() => {
  if (!isDoubleRowLayout.value) return null
  const cols = doubleLayoutCols.value
  const els = displayElements.value
  return { row1: els.slice(0, cols), row2: els.slice(cols, cols * 2) }
})

const compositeInfo = computed(() => {
  const layout = frameLayout.value
  const els = displayElements.value
  const map = {
    'A': { leftCells: [0],       rightCells: [1, 2],    leftWidth: els[0]?.width || '66.7%' },
    'B': { leftCells: [0, 1],    rightCells: [2],       leftWidth: els[0]?.width || '33.3%' },
    'C': { leftCells: [0],       rightCells: [1, 2, 3], leftWidth: els[0]?.width || '66.7%' },
    'D': { leftCells: [0, 1, 2], rightCells: [3],       leftWidth: els[0]?.width || '33.3%' },
  }
  return map[layout] || null
})

const mobileReorderedElements = computed(() => {
  const elements = displayElements.value
  const layout = frameLayout.value

  const reorderByColumn = (els, cols, rows) => {
    const result = []
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        result.push(els[row * cols + col])
      }
    }
    return result
  }

  if (layout === '2_2' && isMobile.value) return reorderByColumn(elements, 2, 2)
  if (layout === '2_3' && isMobile.value) return reorderByColumn(elements, 3, 2)
  if (layout === '2_4' && (isMobile.value || isTablet.value)) return reorderByColumn(elements, 4, 2)

  return elements
})

const frameContainerStyle = computed(() => {
  const style = { maxWidth: '1200px', margin: '0 auto', width: '100%' }
  if (props.frame.metadata?.frameWidth || props.frame.metadata?.frame_width) {
    style.maxWidth = props.frame.metadata.frameWidth || props.frame.metadata.frame_width
  }
  return style
})

const gridStyle = computed(() => {
  const layout = frameLayout.value

  if (isMobile.value && (isMultiColumnLayout.value || isSingleRowMultiCol.value)) {
    return { display: 'grid', gridTemplateColumns: '1fr', gap: '0' }
  }
  if (isTablet.value && isSingleRowMultiCol.value) {
    return { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0' }
  }
  if (isTablet.value && isMultiColumnLayout.value) {
    switch (layout) {
      case '2_2': return { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: '0' }
      case '2_3': return { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: '0' }
      case '2_4': return { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0' }
      default:    return { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0' }
    }
  }

  const singleRowLayouts = ['1_1', '1_2', '1_3', '1_4']
  if (singleRowLayouts.includes(layout)) {
    const widths = displayElements.value.map(el => (el && el.width) ? el.width : '1fr')
    return { display: 'grid', gridTemplateColumns: widths.join(' '), gap: '0' }
  }

  switch (layout) {
    case '2_2': return { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: '0' }
    case '2_3': return { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: '0' }
    case '2_4': return { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: '0' }
    default:    return { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0' }
  }
})

const getCellStyle = (element, index) => {
  const padding = getCellPadding(element)
  if (isNarrow.value && isMultiColumnLayout.value) {
    return { padding, gridColumn: 'auto', gridRow: 'auto' }
  }
  return { padding }
}

const getCellPadding = (element) => {
  if (!element?.padding) return '20px'
  const { top = 20, right = 20, bottom = 20, left = 20 } = element.padding
  return `${top}px ${right}px ${bottom}px ${left}px`
}
</script>

<style scoped>
.custom-frame-preview {
  background: transparent;
  min-height: auto;
  position: relative;
}

.frame-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  min-height: auto;
}

.frame-grid { width: 100%; min-height: auto; }

.double-row { display: flex; width: 100%; }
.double-row .grid-cell { flex: 1; min-width: 0; }

.composite-frame { display: flex; width: 100%; align-items: stretch; }

.composite-col { display: flex; flex-direction: column; flex-shrink: 0; }
.composite-col--left .composite-cell:only-child { flex: 1; }
.composite-col--right { flex: 1; flex-shrink: 1; }
.composite-col--right .composite-cell { height: auto; }
.composite-cell { width: 100%; box-sizing: border-box; }

.grid-cell { min-height: auto; box-sizing: border-box; margin: 0; }

.custom-frame-preview.device-mobile .grid-cell {
  grid-column: auto !important;
  grid-row: auto !important;
  width: 100% !important;
}
</style>
<template>
  <div 
    class="custom-frame-preview"
    :class="`layout-${frameLayout}`"
  >
    <!-- ✅ 新增 frame-container 來限制寬度和添加最小高度 -->
    <div class="frame-container">
      <div class="frame-grid" :style="gridStyle">
        <template v-for="(element, index) in displayElements" :key="`cell-${index}`">
          <div 
            class="grid-cell"
            :style="{
              margin: '0',
              padding: getCellPadding(element)
            }"
          >
            <div v-if="element && element.type" class="element-content">
            <!-- IMG 元件 -->
            <div v-if="element.type === 'IMG'" class="element-image" :style="getImageContainerStyle(element)">
              <img 
                v-if="element.value?.src" 
                :src="element.value.src" 
                :alt="element.value?.alt || '圖片'"
                class="element-img"
                :style="getElementStyle(element)"
              />
              <div v-else class="placeholder-image">
                <span>🖼️</span>
              </div>
            </div>

            <!-- TEXT 元件 -->
            <div 
              v-else-if="element.type === 'TEXT'" 
              class="element-text"
              :style="getElementStyle(element)"
              v-html="element.value?.text || ''"
            ></div>

            <!-- BUTTON 元件 -->
            <div v-else-if="element.type === 'BUTTON'" class="element-button">
              <a 
                :href="element.value?.url || '#'" 
                class="button-link"
                :style="getButtonStyle(element)"
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
              />
            </div>

            <!-- MAP 元件 -->
            <div v-else-if="element.type === 'MAP'" class="element-map">
              <div class="map-placeholder">
                <span>🗺️</span>
                <p>{{ element.value?.address || '地圖' }}</p>
              </div>
            </div>

            <!-- ALBUM 元件 -->
            <div v-else-if="element.type === 'ALBUM'" class="element-album">
              <div class="album-placeholder">
                <span>📷</span>
                <p>{{ element.value?.title || '相簿' }}</p>
              </div>
            </div>
          </div>

          <!-- 空格子 -->
          <div v-else class="empty-cell"></div>
        </div>
      </template>
    </div>
    </div>  <!-- ✅ 結束 frame-container -->
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CarouselElement from '../Editor/PageEditor/elements/CarouselElement.vue'

const props = defineProps({
  frame: {
    type: Object,
    required: true
  }
})

// 框架佈局類型
const frameLayout = computed(() => {
  if (!props.frame || !props.frame.type) return 'A'
  
  const type = props.frame.type
  
  if (type.startsWith('FRAME')) {
    let layout = type.replace(/^FRAME/, '')
    layout = layout.replace(/^[-_]/, '')
    layout = layout.replace(/-/g, '_')
    return layout
  }
  
  return type
})

// 根據框架類型決定格子數量
const cellCount = computed(() => {
  const layout = frameLayout.value
  
  switch (layout) {
    case 'A':
    case 'B':
      return 3
    case 'C':
    case 'D':
      return 4
    case '1_1':
      return 1
    case '1_2':
      return 2
    case '1_3':
      return 3
    case '1_4':
      return 4
    case '2_2':
      return 4
    case '2_3':
      return 6
    case '2_4':
      return 8
    default:
      return 4
  }
})

// 顯示用的元件陣列
const displayElements = computed(() => {
  const elements = props.frame.elements || []
  const result = [...elements]
  
  while (result.length < cellCount.value) {
    result.push(null)
  }
  
  return result.slice(0, cellCount.value)
})

// Grid 樣式
const gridStyle = computed(() => {
  const layout = frameLayout.value
  
  switch (layout) {
    case 'A':
      return {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '0'
      }
    case 'B':
      return {
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '0'
      }
    case 'C':
      return {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: '0'
      }
    case 'D':
      return {
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: '0'
      }
    case '1_1':
      return {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '0'
      }
    case '1_2':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0'
      }
    case '1_3':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0'
      }
    case '1_4':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0'
      }
    case '2_2':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '0'
      }
    case '2_3':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '0'
      }
    case '2_4':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '0'
      }
    default:
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0'
      }
  }
})

// 獲取格子 padding
const getCellPadding = (element) => {
  if (!element || !element.padding) {
    return '20px'
  }
  
  const { top = 20, right = 20, bottom = 20, left = 20 } = element.padding
  return `${top}px ${right}px ${bottom}px ${left}px`
}

// ✅ 獲取圖片容器的樣式（用於對齊）
const getImageContainerStyle = (element) => {
  if (!element || !element.metadata) return {}
  
  const metadata = element.metadata
  const style = {}
  
  // 使用 text_align 來控制圖片對齊
  if (metadata.text_align) {
    style.textAlign = metadata.text_align
  }
  
  return style
}

// 獲取元件樣式
const getElementStyle = (element) => {
  if (!element || !element.metadata) return {}
  
  const metadata = element.metadata
  const style = {}
  
  if (metadata.color) style.color = metadata.color
  if (metadata.font_size) style.fontSize = metadata.font_size
  if (metadata.font_weight) style.fontWeight = metadata.font_weight
  
  // ✅ 圖片不使用 text_align（已在容器處理）
  // 其他元件（TEXT, BUTTON）可以使用 text_align
  if (metadata.text_align && element.type !== 'IMG') {
    style.textAlign = metadata.text_align
  }
  
  if (metadata.width) style.width = metadata.width
  if (metadata.height) style.height = metadata.height
  if (metadata.background_color) style.backgroundColor = metadata.background_color
  
  return style
}

// 獲取按鈕樣式
const getButtonStyle = (element) => {
  if (!element || !element.metadata) return {}
  
  const metadata = element.metadata
  const style = {}
  
  if (metadata.color) style.color = metadata.color
  if (metadata.font_size) style.fontSize = metadata.font_size
  if (metadata.font_weight) style.fontWeight = metadata.font_weight
  if (metadata.background_color) style.backgroundColor = metadata.background_color
  
  return style
}
</script>

<style scoped>
.custom-frame-preview {
  padding: 20px;  /* ✅ 改為 20px */
  background: transparent;
  min-height: auto;  /* ✅ 改為 auto，適應內容高度 */
  position: relative;
}

/* ✅ 新增：內容容器限制最大寬度 */
.frame-container {
  max-width: 1200px;  /* ✅ 限制最大寬度為 1200px */
  margin: 0 auto;
  width: 100%;
  min-height: auto;  /* ✅ 改為 auto */
}

.frame-grid {
  width: 100%;
  min-height: auto;
}

/* 複合框架特殊佈局 */
.custom-frame-preview.layout-A .frame-grid {
  min-height: auto;
}

.custom-frame-preview.layout-A .grid-cell:nth-child(1) {
  grid-column: 1;
  grid-row: 1 / 3;
  min-height: auto;  /* ✅ 改為 auto */
}

.custom-frame-preview.layout-A .grid-cell:nth-child(2) {
  grid-column: 2;
  grid-row: 1;
  min-height: auto;  /* ✅ 改為 auto */
}

.custom-frame-preview.layout-A .grid-cell:nth-child(3) {
  grid-column: 2;
  grid-row: 2;
  min-height: auto;  /* ✅ 改為 auto */
}

.custom-frame-preview.layout-B .frame-grid {
  min-height: auto;
}

.custom-frame-preview.layout-B .grid-cell:nth-child(1) {
  grid-column: 1;
  grid-row: 1;
  min-height: auto;  /* ✅ 改為 auto */
}

.custom-frame-preview.layout-B .grid-cell:nth-child(2) {
  grid-column: 1;
  grid-row: 2;
  min-height: auto;  /* ✅ 改為 auto */
}

.custom-frame-preview.layout-B .grid-cell:nth-child(3) {
  grid-column: 2;
  grid-row: 1 / 3;
  min-height: auto;  /* ✅ 改為 auto */
}

.custom-frame-preview.layout-C .frame-grid {
  min-height: auto;
}

.custom-frame-preview.layout-C .grid-cell:nth-child(1) {
  grid-column: 1;
  grid-row: 1 / 4;
  min-height: auto;  /* ✅ 改為 auto */
}

.custom-frame-preview.layout-C .grid-cell:nth-child(2) {
  grid-column: 2;
  grid-row: 1;
  min-height: auto;  /* ✅ 改為 auto */
}

.custom-frame-preview.layout-C .grid-cell:nth-child(3) {
  grid-column: 2;
  grid-row: 2;
  min-height: auto;  /* ✅ 改為 auto */
}

.custom-frame-preview.layout-C .grid-cell:nth-child(4) {
  grid-column: 2;
  grid-row: 3;
  min-height: auto;  /* ✅ 改為 auto */
}

.custom-frame-preview.layout-D .frame-grid {
  min-height: auto;
}

.custom-frame-preview.layout-D .grid-cell:nth-child(1) {
  grid-column: 1;
  grid-row: 1;
  min-height: auto;  /* ✅ 改為 auto */
}

.custom-frame-preview.layout-D .grid-cell:nth-child(2) {
  grid-column: 1;
  grid-row: 2;
  min-height: auto;  /* ✅ 改為 auto */
}

.custom-frame-preview.layout-D .grid-cell:nth-child(3) {
  grid-column: 1;
  grid-row: 3;
  min-height: auto;  /* ✅ 改為 auto */
}

.custom-frame-preview.layout-D .grid-cell:nth-child(4) {
  grid-column: 2;
  grid-row: 1 / 4;
  min-height: auto;  /* ✅ 改為 auto */
}

.grid-cell {
  min-height: auto;  /* ✅ 改為 auto，適應內容高度 */
  box-sizing: border-box;
  margin: 0;
}

.element-content {
  position: relative;
  padding: 0;
  background: transparent;
  border-radius: 8px;
}

.element-carousel {
  width: 100%;
}

/* 元件樣式 */
.element-image {
  width: 100%;
  
  .element-img {
    display: inline-block;
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    object-fit: contain;
    vertical-align: middle;
  }
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
  font-size: 48px;
}

.element-text {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
}

.element-text :deep(p) {
  margin: 0 0 1em;
}

.element-text :deep(p:last-child) {
  margin-bottom: 0;
}

.element-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

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
}

.button-link:hover {
  background: #d14a1f;
}

.element-hline {
  padding: 40px 0;
}

.element-hline hr {
  border: none;
  border-top: 2px solid #ddd;
  margin: 0;
}

.element-vline {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  min-height: 150px;
}

.vertical-line {
  width: 2px;
  height: 100%;
  min-height: 100px;
  background: #ddd;
}

.element-map,
.element-album {
  width: 100%;
  height: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #ddd;
  border-radius: 8px;
}

.map-placeholder,
.album-placeholder {
  text-align: center;
}

.map-placeholder span,
.album-placeholder span {
  font-size: 48px;
  display: block;
  margin-bottom: 8px;
}

.map-placeholder p,
.album-placeholder p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.empty-cell {
  min-height: 150px;
}
.basemap-section :deep(.element-content) {
  background: transparent !important;
}

</style>
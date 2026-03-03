<template>
  <div 
    class="custom-frame-preview"
    :class="[`layout-${frameLayout}`, `device-${device}`]"
  >
    <div class="frame-container" :style="frameContainerStyle">

      <!-- ✅ 雙層框架（桌機版）：兩排各自獨立，高度互不影響 -->
      <template v-if="isDoubleRowLayout && !isMobile">
        <!-- 第一排 -->
        <div class="double-row">
          <div
            v-for="(element, index) in doubleRowSplit.row1"
            :key="`row1-cell-${index}`"
            class="grid-cell"
            :style="getCellStyle(element, index)"
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
                  <img
                    src="https://images.unsplash.com/photo-1548013146-72479768bada?w=1280&h=300&fit=crop"
                    alt="placeholder"
                    class="placeholder-img"
                  />
                  <div class="placeholder-overlay">
                    <span>🖼️</span>
                  </div>
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
              <div 
                v-else-if="element.type === 'BUTTON'" 
                class="element-button"
                :style="getButtonContainerStyle(element)"
              >
                <a 
                  :href="element.value?.url || '#'" 
                  class="button-link"
                  :style="getButtonStyle(element)"
                >
                  {{ element.value?.text || '按鈕' }}
                </a>
              </div>

              <!-- HORIZON_LINE 元件 -->
              <div v-else-if="element.type === 'HORIZON_LINE'" class="element-hline">
                <hr :style="{ 
                  borderColor: element.value?.color || '#ddd',
                  borderWidth: element.value?.thickness || '2px'
                }" />
              </div>

              <!-- VERTICAL_LINE 元件 -->
              <div v-else-if="element.type === 'VERTICAL_LINE'" class="element-vline">
                <div class="vertical-line" :style="{ 
                  backgroundColor: element.value?.color || '#ddd',
                  width: element.value?.thickness || '2px'
                }"></div>
              </div>

              <!-- CAROUSEL_IMG 元件 -->
              <div v-else-if="element.type === 'CAROUSEL_IMG'" class="element-carousel">
                <CarouselElement 
                  :content="{
                    imgs: element.value?.imgs || [],
                    autoPlay: element.value?.autoPlay !== false,
                    interval: element.value?.interval || 3000,
                    height: element.value?.height || 400
                  }"
                  :element="element"
                />
              </div>

              <!-- GOOGLE_MAP 元件 -->
              <div v-else-if="element.type === 'GOOGLE_MAP'" class="element-map">
                <MapElement
                  :content="{
                    address: element.value?.address || '',
                    lat: element.value?.lat || 25.033,
                    lng: element.value?.lng || 121.565,
                    zoom: element.value?.zoom || 15
                  }"
                  :element="element"
                  :key="`map-r1-${index}-${element.value?.lat}-${element.value?.lng}`"
                />
              </div>

              <!-- ALBUM 元件 -->
              <div v-else-if="element.type === 'ALBUM'" class="element-card-wrapper">
                <AlbumCard 
                  :content="{
                    image: element.value?.image || null,
                    tag: element.value?.tag || '相簿封面',
                    title: element.value?.title || '相簿標題',
                    description: element.value?.description || ''
                  }"
                  :element="element"
                />
              </div>

              <!-- PRODUCT_CARD 元件 -->
              <div v-else-if="element.type === 'PRODUCT_CARD'" class="element-card-wrapper">
                <ProductCard 
                  :content="{
                    image: element.value?.image || null,
                    tag: element.value?.tag || '法會活動',
                    title: element.value?.title || '商品標題',
                    date: element.value?.date || '2024-08-22'
                  }"
                  :element="element"
                />
              </div>

              <!-- SERVICE_CARD 元件 -->
              <div v-else-if="element.type === 'SERVICE_CARD'" class="element-card-wrapper">
                <ServiceCard 
                  :content="{
                    image: element.value?.image || null,
                    tag: element.value?.tag || '祈福服務',
                    title: element.value?.title || '服務標題',
                    date: element.value?.date || '2024-08-22'
                  }"
                  :element="element"
                />
              </div>

              <!-- EVENT_CARD 元件 -->
              <div v-else-if="element.type === 'EVENT_CARD'" class="element-card-wrapper">
                <EventCard 
                  :content="{
                    image: element.value?.image || null,
                    tag: element.value?.tag || '法會活動',
                    title: element.value?.title || '中元普渡法會',
                    description: element.value?.description || '2024年中元普渡法會活動紀錄'
                  }"
                  :element="element"
                />
              </div>
            </div>

            <!-- 空格子 -->
            <div v-else class="empty-cell"></div>
          </div>
        </div>

        <!-- 第二排 -->
        <div class="double-row">
          <div
            v-for="(element, rIndex) in doubleRowSplit.row2"
            :key="`row2-cell-${rIndex}`"
            class="grid-cell"
            :style="getCellStyle(element, rIndex)"
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
                  <img
                    src="https://images.unsplash.com/photo-1548013146-72479768bada?w=1280&h=300&fit=crop"
                    alt="placeholder"
                    class="placeholder-img"
                  />
                  <div class="placeholder-overlay">
                    <span>🖼️</span>
                  </div>
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
              <div 
                v-else-if="element.type === 'BUTTON'" 
                class="element-button"
                :style="getButtonContainerStyle(element)"
              >
                <a 
                  :href="element.value?.url || '#'" 
                  class="button-link"
                  :style="getButtonStyle(element)"
                >
                  {{ element.value?.text || '按鈕' }}
                </a>
              </div>

              <!-- HORIZON_LINE 元件 -->
              <div v-else-if="element.type === 'HORIZON_LINE'" class="element-hline">
                <hr :style="{ 
                  borderColor: element.value?.color || '#ddd',
                  borderWidth: element.value?.thickness || '2px'
                }" />
              </div>

              <!-- VERTICAL_LINE 元件 -->
              <div v-else-if="element.type === 'VERTICAL_LINE'" class="element-vline">
                <div class="vertical-line" :style="{ 
                  backgroundColor: element.value?.color || '#ddd',
                  width: element.value?.thickness || '2px'
                }"></div>
              </div>

              <!-- CAROUSEL_IMG 元件 -->
              <div v-else-if="element.type === 'CAROUSEL_IMG'" class="element-carousel">
                <CarouselElement 
                  :content="{
                    imgs: element.value?.imgs || [],
                    autoPlay: element.value?.autoPlay !== false,
                    interval: element.value?.interval || 3000,
                    height: element.value?.height || 400
                  }"
                  :element="element"
                />
              </div>

              <!-- GOOGLE_MAP 元件 -->
              <div v-else-if="element.type === 'GOOGLE_MAP'" class="element-map">
                <MapElement
                  :content="{
                    address: element.value?.address || '',
                    lat: element.value?.lat || 25.033,
                    lng: element.value?.lng || 121.565,
                    zoom: element.value?.zoom || 15
                  }"
                  :element="element"
                  :key="`map-r2-${rIndex}-${element.value?.lat}-${element.value?.lng}`"
                />
              </div>

              <!-- ALBUM 元件 -->
              <div v-else-if="element.type === 'ALBUM'" class="element-card-wrapper">
                <AlbumCard 
                  :content="{
                    image: element.value?.image || null,
                    tag: element.value?.tag || '相簿封面',
                    title: element.value?.title || '相簿標題',
                    description: element.value?.description || ''
                  }"
                  :element="element"
                />
              </div>

              <!-- PRODUCT_CARD 元件 -->
              <div v-else-if="element.type === 'PRODUCT_CARD'" class="element-card-wrapper">
                <ProductCard 
                  :content="{
                    image: element.value?.image || null,
                    tag: element.value?.tag || '法會活動',
                    title: element.value?.title || '商品標題',
                    date: element.value?.date || '2024-08-22'
                  }"
                  :element="element"
                />
              </div>

              <!-- SERVICE_CARD 元件 -->
              <div v-else-if="element.type === 'SERVICE_CARD'" class="element-card-wrapper">
                <ServiceCard 
                  :content="{
                    image: element.value?.image || null,
                    tag: element.value?.tag || '祈福服務',
                    title: element.value?.title || '服務標題',
                    date: element.value?.date || '2024-08-22'
                  }"
                  :element="element"
                />
              </div>

              <!-- EVENT_CARD 元件 -->
              <div v-else-if="element.type === 'EVENT_CARD'" class="element-card-wrapper">
                <EventCard 
                  :content="{
                    image: element.value?.image || null,
                    tag: element.value?.tag || '法會活動',
                    title: element.value?.title || '中元普渡法會',
                    description: element.value?.description || '2024年中元普渡法會活動紀錄'
                  }"
                  :element="element"
                />
              </div>
            </div>

            <!-- 空格子 -->
            <div v-else class="empty-cell"></div>
          </div>
        </div>
      </template>

      <!-- 其他框架 or 手機版雙層：維持原本 frame-grid -->
      <div v-else class="frame-grid" :style="gridStyle">
        <template v-for="(element, index) in mobileReorderedElements" :key="`cell-${index}`">
          <div 
            class="grid-cell"
            :style="getCellStyle(element, index)"
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
                  <img
                    src="https://images.unsplash.com/photo-1548013146-72479768bada?w=1280&h=300&fit=crop"
                    alt="placeholder"
                    class="placeholder-img"
                  />
                  <div class="placeholder-overlay">
                    <span>🖼️</span>
                  </div>
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
              <div 
                v-else-if="element.type === 'BUTTON'" 
                class="element-button"
                :style="getButtonContainerStyle(element)"
              >
                <a 
                  :href="element.value?.url || '#'" 
                  class="button-link"
                  :style="getButtonStyle(element)"
                >
                  {{ element.value?.text || '按鈕' }}
                </a>
              </div>

              <!-- HORIZON_LINE 元件 -->
              <div v-else-if="element.type === 'HORIZON_LINE'" class="element-hline">
                <hr :style="{ 
                  borderColor: element.value?.color || '#ddd',
                  borderWidth: element.value?.thickness || '2px'
                }" />
              </div>

              <!-- VERTICAL_LINE 元件 -->
              <div v-else-if="element.type === 'VERTICAL_LINE'" class="element-vline">
                <div class="vertical-line" :style="{ 
                  backgroundColor: element.value?.color || '#ddd',
                  width: element.value?.thickness || '2px'
                }"></div>
              </div>

              <!-- CAROUSEL_IMG 元件 -->
              <div v-else-if="element.type === 'CAROUSEL_IMG'" class="element-carousel">
                <CarouselElement 
                  :content="{
                    imgs: element.value?.imgs || [],
                    autoPlay: element.value?.autoPlay !== false,
                    interval: element.value?.interval || 3000,
                    height: element.value?.height || 400
                  }"
                  :element="element"
                />
              </div>

              <!-- GOOGLE_MAP 元件 -->
              <div v-else-if="element.type === 'GOOGLE_MAP'" class="element-map">
                <MapElement
                  :content="{
                    address: element.value?.address || '',
                    lat: element.value?.lat || 25.033,
                    lng: element.value?.lng || 121.565,
                    zoom: element.value?.zoom || 15
                  }"
                  :element="element"
                  :key="`map-${index}-${element.value?.lat}-${element.value?.lng}`"
                />
              </div>

              <!-- ALBUM 元件 -->
              <div v-else-if="element.type === 'ALBUM'" class="element-card-wrapper">
                <AlbumCard 
                  :content="{
                    image: element.value?.image || null,
                    tag: element.value?.tag || '相簿封面',
                    title: element.value?.title || '相簿標題',
                    description: element.value?.description || ''
                  }"
                  :element="element"
                />
              </div>

              <!-- PRODUCT_CARD 元件 -->
              <div v-else-if="element.type === 'PRODUCT_CARD'" class="element-card-wrapper">
                <ProductCard 
                  :content="{
                    image: element.value?.image || null,
                    tag: element.value?.tag || '法會活動',
                    title: element.value?.title || '商品標題',
                    date: element.value?.date || '2024-08-22'
                  }"
                  :element="element"
                />
              </div>

              <!-- SERVICE_CARD 元件 -->
              <div v-else-if="element.type === 'SERVICE_CARD'" class="element-card-wrapper">
                <ServiceCard 
                  :content="{
                    image: element.value?.image || null,
                    tag: element.value?.tag || '祈福服務',
                    title: element.value?.title || '服務標題',
                    date: element.value?.date || '2024-08-22'
                  }"
                  :element="element"
                />
              </div>

              <!-- EVENT_CARD 元件 -->
              <div v-else-if="element.type === 'EVENT_CARD'" class="element-card-wrapper">
                <EventCard 
                  :content="{
                    image: element.value?.image || null,
                    tag: element.value?.tag || '法會活動',
                    title: element.value?.title || '中元普渡法會',
                    description: element.value?.description || '2024年中元普渡法會活動紀錄'
                  }"
                  :element="element"
                />
              </div>
            </div>

            <!-- 空格子 -->
            <div v-else class="empty-cell"></div>
          </div>
        </template>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CarouselElement from '../Editor/PageEditor/elements/CarouselElement.vue'
import MapElement from '../Editor/PageEditor/elements/MapElement.vue'
import AlbumCard from '../Editor/PageEditor/elements/AlbumCard.vue'
import ProductCard from '../Editor/PageEditor/elements/ProductCard.vue'
import ServiceCard from '../Editor/PageEditor/elements/ServiceCard.vue'
import EventCard from '../Editor/PageEditor/elements/EventCard.vue'

const props = defineProps({
  frame: {
    type: Object,
    required: true
  },
  // ✅ 接收裝置類型：'desktop' | 'tablet' | 'mobile'
  device: {
    type: String,
    default: 'desktop'
  }
})

// ==================== 響應式斷點判斷 ====================

const isMobile = computed(() => props.device === 'mobile')
const isTablet = computed(() => props.device === 'tablet')
const isNarrow = computed(() => isMobile.value)

// ==================== 框架類型解析 ====================

const frameLayout = computed(() => {
  if (!props.frame?.type) return 'A'
  const type = props.frame.type
  if (type.startsWith('FRAME')) {
    let layout = type.replace(/^FRAME/, '').replace(/^[-_]/, '').replace(/-/g, '_')
    return layout
  }
  return type
})

const isMultiColumnLayout = computed(() => {
  const layout = frameLayout.value
  return ['A', 'B', 'C', 'D', '2_2', '2_3', '2_4'].includes(layout)
})

const isSingleRowMultiCol = computed(() => {
  const layout = frameLayout.value
  return ['1_2', '1_3', '1_4'].includes(layout)
})

// ==================== 格子數量 ====================

const cellCount = computed(() => {
  const layout = frameLayout.value
  switch (layout) {
    case 'A': case 'B': return 3
    case 'C': case 'D': return 4
    case '1_1': return 1
    case '1_2': return 2
    case '1_3': return 3
    case '1_4': return 4
    case '2_2': return 4
    case '2_3': return 6
    case '2_4': return 8
    default:   return 4
  }
})

const displayElements = computed(() => {
  const elements = props.frame.elements || []
  const result = [...elements]
  while (result.length < cellCount.value) result.push(null)
  return result.slice(0, cellCount.value)
})

// ✅ 雙層框架：欄數
const doubleLayoutCols = computed(() => {
  switch (frameLayout.value) {
    case '2_2': return 2
    case '2_3': return 3
    case '2_4': return 4
    default: return 0
  }
})

// ✅ 雙層框架：是否為雙層
const isDoubleRowLayout = computed(() => doubleLayoutCols.value > 0)

// ✅ 雙層框架：拆成兩排
const doubleRowSplit = computed(() => {
  if (!isDoubleRowLayout.value) return null
  const cols = doubleLayoutCols.value
  const els = displayElements.value
  return {
    row1: els.slice(0, cols),
    row2: els.slice(cols, cols * 2)
  }
})

// ==================== ✅ 手機版重新排序（欄優先）====================

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

  if (layout === '2_2' && isMobile.value) {
    return reorderByColumn(elements, 2, 2)
  }
  if (layout === '2_3' && isMobile.value) {
    return reorderByColumn(elements, 3, 2)
  }
  if (layout === '2_4' && (isMobile.value || isTablet.value)) {
    return reorderByColumn(elements, 4, 2)
  }

  return elements
})

// ==================== 框架容器樣式 ====================

const frameContainerStyle = computed(() => {
  const style = {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  }
  // ✅ 兼容 frameWidth（編輯器）和 frame_width（API）
  if (props.frame.metadata?.frameWidth || props.frame.metadata?.frame_width) {
    style.maxWidth = props.frame.metadata.frameWidth || props.frame.metadata.frame_width
  }
  return style
})

// ==================== Grid 樣式 ====================

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
      case '2_2':
        return { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: '0' }
      case '2_3':
        return { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: '0' }
      case '2_4':
        return { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0' }
      default:
        return { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0' }
    }
  }

  const singleRowLayouts = ['1_1', '1_2', '1_3', '1_4']
  if (singleRowLayouts.includes(layout)) {
    const elements = displayElements.value
    const widths = elements.map(el => (el && el.width) ? el.width : '1fr')
    return { display: 'grid', gridTemplateColumns: widths.join(' '), gap: '0' }
  }

  switch (layout) {
    case 'A':
      return { display: 'grid', gridTemplateColumns: '2fr 1fr', gridTemplateRows: 'repeat(2, 1fr)', gap: '0' }
    case 'B':
      return { display: 'grid', gridTemplateColumns: '1fr 2fr', gridTemplateRows: 'repeat(2, 1fr)', gap: '0' }
    case 'C':
      return { display: 'grid', gridTemplateColumns: '2fr 1fr', gridTemplateRows: 'repeat(3, 1fr)', gap: '0' }
    case 'D':
      return { display: 'grid', gridTemplateColumns: '1fr 2fr', gridTemplateRows: 'repeat(3, 1fr)', gap: '0' }
    case '2_2':
      return { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: '0' }
    case '2_3':
      return { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: '0' }
    case '2_4':
      return { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: '0' }
    default:
      return { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0' }
  }
})

// ==================== 格子樣式 ====================

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

// ==================== ✅ 元件樣式（兼容 camelCase 和 snake_case）====================

/**
 * 從 metadata 取值，兼容 camelCase（API 回傳）和 snake_case（編輯器存的）
 */
const getMeta = (m, camel, snake) => m[camel] || m[snake] || null

const getImageContainerStyle = (element) => {
  if (!element?.metadata) return {}
  const m = element.metadata
  const textAlign = getMeta(m, 'textAlign', 'text_align')
  const style = {}
  if (textAlign) style.textAlign = textAlign
  return style
}

const getElementStyle = (element) => {
  if (!element?.metadata) return {}
  const m = element.metadata
  const style = {}

  if (m.color)                                    style.color           = m.color
  const fontSize    = getMeta(m, 'fontSize',    'font_size')
  const fontWeight  = getMeta(m, 'fontWeight',  'font_weight')
  const textAlign   = getMeta(m, 'textAlign',   'text_align')
  const bgColor     = getMeta(m, 'backgroundColor', 'background_color')

  if (fontSize)                                   style.fontSize        = fontSize
  if (fontWeight)                                 style.fontWeight      = fontWeight
  if (textAlign && element.type !== 'IMG')        style.textAlign       = textAlign
  if (m.width)                                    style.width           = m.width
  if (m.height)                                   style.height          = m.height
  if (bgColor)                                    style.backgroundColor = bgColor

  return style
}

const getButtonContainerStyle = (element) => {
  const textAlign = getMeta(element?.metadata || {}, 'textAlign', 'text_align')
  const justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end' }
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: justifyMap[textAlign] || 'center',
    padding: '40px 0'
  }
}

const getButtonStyle = (element) => {
  if (!element?.metadata) return {}
  const m = element.metadata
  const style = {}
  if (m.color)                                    style.color           = m.color
  const fontSize    = getMeta(m, 'fontSize',    'font_size')
  const fontWeight  = getMeta(m, 'fontWeight',  'font_weight')
  const bgColor     = getMeta(m, 'backgroundColor', 'background_color')
  if (fontSize)                                   style.fontSize        = fontSize
  if (fontWeight)                                 style.fontWeight      = fontWeight
  if (bgColor)                                    style.backgroundColor = bgColor
  return style
}
</script>

<style scoped>
.custom-frame-preview {
  padding: 20px;
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

.frame-grid {
  width: 100%;
  min-height: auto;
}

/* ✅ 雙層框架：每排獨立 flex，格子等寬，高度互不影響 */
.double-row {
  display: flex;
  width: 100%;
}

.double-row .grid-cell {
  flex: 1;
  min-width: 0; /* 防止內容撐破 */
}

/* ==================== 桌機版複合框架 grid-area ==================== */

.custom-frame-preview.layout-A:not(.device-mobile):not(.device-tablet) .grid-cell:nth-child(1) { grid-column: 1; grid-row: 1 / 3; }
.custom-frame-preview.layout-A:not(.device-mobile):not(.device-tablet) .grid-cell:nth-child(2) { grid-column: 2; grid-row: 1; }
.custom-frame-preview.layout-A:not(.device-mobile):not(.device-tablet) .grid-cell:nth-child(3) { grid-column: 2; grid-row: 2; }

.custom-frame-preview.layout-B:not(.device-mobile):not(.device-tablet) .grid-cell:nth-child(1) { grid-column: 1; grid-row: 1; }
.custom-frame-preview.layout-B:not(.device-mobile):not(.device-tablet) .grid-cell:nth-child(2) { grid-column: 1; grid-row: 2; }
.custom-frame-preview.layout-B:not(.device-mobile):not(.device-tablet) .grid-cell:nth-child(3) { grid-column: 2; grid-row: 1 / 3; }

.custom-frame-preview.layout-C:not(.device-mobile):not(.device-tablet) .grid-cell:nth-child(1) { grid-column: 1; grid-row: 1 / 4; }
.custom-frame-preview.layout-C:not(.device-mobile):not(.device-tablet) .grid-cell:nth-child(2) { grid-column: 2; grid-row: 1; }
.custom-frame-preview.layout-C:not(.device-mobile):not(.device-tablet) .grid-cell:nth-child(3) { grid-column: 2; grid-row: 2; }
.custom-frame-preview.layout-C:not(.device-mobile):not(.device-tablet) .grid-cell:nth-child(4) { grid-column: 2; grid-row: 3; }

.custom-frame-preview.layout-D:not(.device-mobile):not(.device-tablet) .grid-cell:nth-child(1) { grid-column: 1; grid-row: 1; }
.custom-frame-preview.layout-D:not(.device-mobile):not(.device-tablet) .grid-cell:nth-child(2) { grid-column: 1; grid-row: 2; }
.custom-frame-preview.layout-D:not(.device-mobile):not(.device-tablet) .grid-cell:nth-child(3) { grid-column: 1; grid-row: 3; }
.custom-frame-preview.layout-D:not(.device-mobile):not(.device-tablet) .grid-cell:nth-child(4) { grid-column: 2; grid-row: 1 / 4; }

/* ==================== 手機版：強制單欄 ==================== */
.custom-frame-preview.device-mobile .grid-cell {
  grid-column: auto !important;
  grid-row: auto !important;
  width: 100% !important;
}

/* ==================== 元件樣式 ==================== */

.grid-cell {
  min-height: auto;
  box-sizing: border-box;
  margin: 0;
}

.element-content {
  position: relative;
  padding: 0;
  background: transparent;
  border-radius: 8px;
}

.element-carousel,
.element-map,
.element-image,
.element-card-wrapper {
  width: 100%;
}

.element-img {
  display: inline-block;
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  object-fit: contain;
  vertical-align: middle;
}

.placeholder-image {
  width: 100%;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

.placeholder-image .placeholder-img {
  width: 100%;
  min-height: 200px;
  object-fit: cover;
  display: block;
  filter: brightness(0.7);
}

.placeholder-image .placeholder-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
  font-size: 36px;
}
.element-text {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
}
.element-text :deep(p) { margin: 0 0 1em; }
.element-text :deep(p:last-child) { margin-bottom: 0; }

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
.button-link:hover { background: #d14a1f; }

.element-hline { padding: 0 0; }
.element-hline hr { border: none; border-top: 2px solid #ddd; margin: 0; }

.element-vline {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  min-height: 150px;
}
.vertical-line { width: 2px; height: 100%; min-height: 100px; background: #ddd; }

.empty-cell { min-height: 150px; }

/* ==================== 手機版字體縮小 ==================== */
.custom-frame-preview.device-mobile .element-text { font-size: 14px; }
.custom-frame-preview.device-mobile .button-link { padding: 10px 24px; font-size: 14px; }
</style>
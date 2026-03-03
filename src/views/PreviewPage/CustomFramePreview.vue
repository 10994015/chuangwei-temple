<template>
  <div 
    class="custom-frame-preview"
    :class="[`layout-${frameLayout}`, `device-${device}`]"
  >
    <div class="frame-container" :style="frameContainerStyle">

      <!-- 雙層框架（桌機版） -->
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
              <div v-if="element.type === 'IMG'" class="element-image" :style="getImageContainerStyle(element)">
                <img v-if="element.value?.src" :src="element.value.src" :alt="element.value?.alt || '圖片'" class="element-img" :style="getElementStyle(element)" />
                <div v-else class="placeholder-image">
                  <img src="https://images.unsplash.com/photo-1548013146-72479768bada?w=1280&h=300&fit=crop" alt="placeholder" class="placeholder-img" />
                  <div class="placeholder-overlay"><span>🖼️</span></div>
                </div>
              </div>
              <div v-else-if="element.type === 'TEXT'" class="element-text" :style="getElementStyle(element)" v-html="element.value?.text || ''"></div>
              <div v-else-if="element.type === 'BUTTON'" class="element-button" :style="getButtonContainerStyle(element)">
                <a :href="element.value?.url || '#'" class="button-link" :style="getButtonStyle(element)">{{ element.value?.text || '按鈕' }}</a>
              </div>
              <div v-else-if="element.type === 'HORIZON_LINE'" class="element-hline">
                <hr :style="{ borderColor: element.value?.color || '#ddd', borderWidth: element.value?.thickness || '2px' }" />
              </div>
              <div v-else-if="element.type === 'VERTICAL_LINE'" class="element-vline">
                <div class="vertical-line" :style="{ backgroundColor: element.value?.color || '#ddd', width: element.value?.thickness || '2px' }"></div>
              </div>
              <div v-else-if="element.type === 'CAROUSEL_IMG'" class="element-carousel">
                <CarouselElement :content="{ imgs: element.value?.imgs || [], autoPlay: element.value?.autoPlay !== false, interval: element.value?.interval || 3000, height: element.value?.height || 400 }" :element="element" />
              </div>
              <div v-else-if="element.type === 'GOOGLE_MAP'" class="element-map">
                <MapElement :content="{ address: element.value?.address || '', lat: element.value?.lat || 25.033, lng: element.value?.lng || 121.565, zoom: element.value?.zoom || 15 }" :element="element" :key="`map-r1-${index}-${element.value?.lat}-${element.value?.lng}`" />
              </div>
              <div v-else-if="element.type === 'ALBUM'" class="element-card-wrapper">
                <AlbumCard :content="{ image: element.value?.image || null, tag: element.value?.tag || '相簿封面', title: element.value?.title || '相簿標題', description: element.value?.description || '' }" :element="element" />
              </div>
              <div v-else-if="element.type === 'PRODUCT_CARD'" class="element-card-wrapper">
                <ProductCard :content="{ image: element.value?.image || null, tag: element.value?.tag || '法會活動', title: element.value?.title || '商品標題', date: element.value?.date || '2024-08-22' }" :element="element" />
              </div>
              <div v-else-if="element.type === 'SERVICE_CARD'" class="element-card-wrapper">
                <ServiceCard :content="{ image: element.value?.image || null, tag: element.value?.tag || '祈福服務', title: element.value?.title || '服務標題', date: element.value?.date || '2024-08-22' }" :element="element" />
              </div>
              <div v-else-if="element.type === 'EVENT_CARD'" class="element-card-wrapper">
                <EventCard :content="{ image: element.value?.image || null, tag: element.value?.tag || '法會活動', title: element.value?.title || '中元普渡法會', description: element.value?.description || '2024年中元普渡法會活動紀錄' }" :element="element" />
              </div>
            </div>
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
              <div v-if="element.type === 'IMG'" class="element-image" :style="getImageContainerStyle(element)">
                <img v-if="element.value?.src" :src="element.value.src" :alt="element.value?.alt || '圖片'" class="element-img" :style="getElementStyle(element)" />
                <div v-else class="placeholder-image">
                  <img src="https://images.unsplash.com/photo-1548013146-72479768bada?w=1280&h=300&fit=crop" alt="placeholder" class="placeholder-img" />
                  <div class="placeholder-overlay"><span>🖼️</span></div>
                </div>
              </div>
              <div v-else-if="element.type === 'TEXT'" class="element-text" :style="getElementStyle(element)" v-html="element.value?.text || ''"></div>
              <div v-else-if="element.type === 'BUTTON'" class="element-button" :style="getButtonContainerStyle(element)">
                <a :href="element.value?.url || '#'" class="button-link" :style="getButtonStyle(element)">{{ element.value?.text || '按鈕' }}</a>
              </div>
              <div v-else-if="element.type === 'HORIZON_LINE'" class="element-hline">
                <hr :style="{ borderColor: element.value?.color || '#ddd', borderWidth: element.value?.thickness || '2px' }" />
              </div>
              <div v-else-if="element.type === 'VERTICAL_LINE'" class="element-vline">
                <div class="vertical-line" :style="{ backgroundColor: element.value?.color || '#ddd', width: element.value?.thickness || '2px' }"></div>
              </div>
              <div v-else-if="element.type === 'CAROUSEL_IMG'" class="element-carousel">
                <CarouselElement :content="{ imgs: element.value?.imgs || [], autoPlay: element.value?.autoPlay !== false, interval: element.value?.interval || 3000, height: element.value?.height || 400 }" :element="element" />
              </div>
              <div v-else-if="element.type === 'GOOGLE_MAP'" class="element-map">
                <MapElement :content="{ address: element.value?.address || '', lat: element.value?.lat || 25.033, lng: element.value?.lng || 121.565, zoom: element.value?.zoom || 15 }" :element="element" :key="`map-r2-${rIndex}-${element.value?.lat}-${element.value?.lng}`" />
              </div>
              <div v-else-if="element.type === 'ALBUM'" class="element-card-wrapper">
                <AlbumCard :content="{ image: element.value?.image || null, tag: element.value?.tag || '相簿封面', title: element.value?.title || '相簿標題', description: element.value?.description || '' }" :element="element" />
              </div>
              <div v-else-if="element.type === 'PRODUCT_CARD'" class="element-card-wrapper">
                <ProductCard :content="{ image: element.value?.image || null, tag: element.value?.tag || '法會活動', title: element.value?.title || '商品標題', date: element.value?.date || '2024-08-22' }" :element="element" />
              </div>
              <div v-else-if="element.type === 'SERVICE_CARD'" class="element-card-wrapper">
                <ServiceCard :content="{ image: element.value?.image || null, tag: element.value?.tag || '祈福服務', title: element.value?.title || '服務標題', date: element.value?.date || '2024-08-22' }" :element="element" />
              </div>
              <div v-else-if="element.type === 'EVENT_CARD'" class="element-card-wrapper">
                <EventCard :content="{ image: element.value?.image || null, tag: element.value?.tag || '法會活動', title: element.value?.title || '中元普渡法會', description: element.value?.description || '2024年中元普渡法會活動紀錄' }" :element="element" />
              </div>
            </div>
            <div v-else class="empty-cell"></div>
          </div>
        </div>
      </template>

      <!-- ✅ 複合框架 A/B/C/D：flex 左右欄，右側各列高度彼此獨立 -->
      <template v-else-if="isCompositeLayout && compositeInfo && !isMobile">
        <div class="composite-frame">
          <!-- 左欄 -->
          <div class="composite-col composite-col--left" :style="{ width: compositeInfo.leftWidth }">
            <div
              v-for="idx in compositeInfo.leftCells"
              :key="`composite-left-${idx}`"
              class="grid-cell composite-cell"
              :style="{ padding: getCellPadding(displayElements[idx]) }"
            >
              <div v-if="displayElements[idx] && displayElements[idx].type" class="element-content">
                <div v-if="displayElements[idx].type === 'IMG'" class="element-image" :style="getImageContainerStyle(displayElements[idx])">
                  <img v-if="displayElements[idx].value?.src" :src="displayElements[idx].value.src" :alt="displayElements[idx].value?.alt || '圖片'" class="element-img" :style="getElementStyle(displayElements[idx])" />
                  <div v-else class="placeholder-image">
                    <img src="https://images.unsplash.com/photo-1548013146-72479768bada?w=1280&h=300&fit=crop" alt="placeholder" class="placeholder-img" />
                    <div class="placeholder-overlay"><span>🖼️</span></div>
                  </div>
                </div>
                <div v-else-if="displayElements[idx].type === 'TEXT'" class="element-text" :style="getElementStyle(displayElements[idx])" v-html="displayElements[idx].value?.text || ''"></div>
                <div v-else-if="displayElements[idx].type === 'BUTTON'" class="element-button" :style="getButtonContainerStyle(displayElements[idx])">
                  <a :href="displayElements[idx].value?.url || '#'" class="button-link" :style="getButtonStyle(displayElements[idx])">{{ displayElements[idx].value?.text || '按鈕' }}</a>
                </div>
                <div v-else-if="displayElements[idx].type === 'HORIZON_LINE'" class="element-hline">
                  <hr :style="{ borderColor: displayElements[idx].value?.color || '#ddd', borderWidth: displayElements[idx].value?.thickness || '2px' }" />
                </div>
                <div v-else-if="displayElements[idx].type === 'VERTICAL_LINE'" class="element-vline">
                  <div class="vertical-line" :style="{ backgroundColor: displayElements[idx].value?.color || '#ddd', width: displayElements[idx].value?.thickness || '2px' }"></div>
                </div>
                <div v-else-if="displayElements[idx].type === 'CAROUSEL_IMG'" class="element-carousel">
                  <CarouselElement :content="{ imgs: displayElements[idx].value?.imgs || [], autoPlay: displayElements[idx].value?.autoPlay !== false, interval: displayElements[idx].value?.interval || 3000, height: displayElements[idx].value?.height || 400 }" :element="displayElements[idx]" />
                </div>
                <div v-else-if="displayElements[idx].type === 'GOOGLE_MAP'" class="element-map">
                  <MapElement :content="{ address: displayElements[idx].value?.address || '', lat: displayElements[idx].value?.lat || 25.033, lng: displayElements[idx].value?.lng || 121.565, zoom: displayElements[idx].value?.zoom || 15 }" :element="displayElements[idx]" :key="`map-cl-${idx}`" />
                </div>
                <div v-else-if="displayElements[idx].type === 'ALBUM'" class="element-card-wrapper">
                  <AlbumCard :content="{ image: displayElements[idx].value?.image || null, tag: displayElements[idx].value?.tag || '相簿封面', title: displayElements[idx].value?.title || '相簿標題', description: displayElements[idx].value?.description || '' }" :element="displayElements[idx]" />
                </div>
                <div v-else-if="displayElements[idx].type === 'PRODUCT_CARD'" class="element-card-wrapper">
                  <ProductCard :content="{ image: displayElements[idx].value?.image || null, tag: displayElements[idx].value?.tag || '法會活動', title: displayElements[idx].value?.title || '商品標題', date: displayElements[idx].value?.date || '2024-08-22' }" :element="displayElements[idx]" />
                </div>
                <div v-else-if="displayElements[idx].type === 'SERVICE_CARD'" class="element-card-wrapper">
                  <ServiceCard :content="{ image: displayElements[idx].value?.image || null, tag: displayElements[idx].value?.tag || '祈福服務', title: displayElements[idx].value?.title || '服務標題', date: displayElements[idx].value?.date || '2024-08-22' }" :element="displayElements[idx]" />
                </div>
                <div v-else-if="displayElements[idx].type === 'EVENT_CARD'" class="element-card-wrapper">
                  <EventCard :content="{ image: displayElements[idx].value?.image || null, tag: displayElements[idx].value?.tag || '法會活動', title: displayElements[idx].value?.title || '中元普渡法會', description: displayElements[idx].value?.description || '2024年中元普渡法會活動紀錄' }" :element="displayElements[idx]" />
                </div>
              </div>
              <div v-else class="empty-cell"></div>
            </div>
          </div>

          <!-- 右欄 -->
          <div class="composite-col composite-col--right">
            <div
              v-for="idx in compositeInfo.rightCells"
              :key="`composite-right-${idx}`"
              class="grid-cell composite-cell"
              :style="{ padding: getCellPadding(displayElements[idx]) }"
            >
              <div v-if="displayElements[idx] && displayElements[idx].type" class="element-content">
                <div v-if="displayElements[idx].type === 'IMG'" class="element-image" :style="getImageContainerStyle(displayElements[idx])">
                  <img v-if="displayElements[idx].value?.src" :src="displayElements[idx].value.src" :alt="displayElements[idx].value?.alt || '圖片'" class="element-img" :style="getElementStyle(displayElements[idx])" />
                  <div v-else class="placeholder-image">
                    <img src="https://images.unsplash.com/photo-1548013146-72479768bada?w=1280&h=300&fit=crop" alt="placeholder" class="placeholder-img" />
                    <div class="placeholder-overlay"><span>🖼️</span></div>
                  </div>
                </div>
                <div v-else-if="displayElements[idx].type === 'TEXT'" class="element-text" :style="getElementStyle(displayElements[idx])" v-html="displayElements[idx].value?.text || ''"></div>
                <div v-else-if="displayElements[idx].type === 'BUTTON'" class="element-button" :style="getButtonContainerStyle(displayElements[idx])">
                  <a :href="displayElements[idx].value?.url || '#'" class="button-link" :style="getButtonStyle(displayElements[idx])">{{ displayElements[idx].value?.text || '按鈕' }}</a>
                </div>
                <div v-else-if="displayElements[idx].type === 'HORIZON_LINE'" class="element-hline">
                  <hr :style="{ borderColor: displayElements[idx].value?.color || '#ddd', borderWidth: displayElements[idx].value?.thickness || '2px' }" />
                </div>
                <div v-else-if="displayElements[idx].type === 'VERTICAL_LINE'" class="element-vline">
                  <div class="vertical-line" :style="{ backgroundColor: displayElements[idx].value?.color || '#ddd', width: displayElements[idx].value?.thickness || '2px' }"></div>
                </div>
                <div v-else-if="displayElements[idx].type === 'CAROUSEL_IMG'" class="element-carousel">
                  <CarouselElement :content="{ imgs: displayElements[idx].value?.imgs || [], autoPlay: displayElements[idx].value?.autoPlay !== false, interval: displayElements[idx].value?.interval || 3000, height: displayElements[idx].value?.height || 400 }" :element="displayElements[idx]" />
                </div>
                <div v-else-if="displayElements[idx].type === 'GOOGLE_MAP'" class="element-map">
                  <MapElement :content="{ address: displayElements[idx].value?.address || '', lat: displayElements[idx].value?.lat || 25.033, lng: displayElements[idx].value?.lng || 121.565, zoom: displayElements[idx].value?.zoom || 15 }" :element="displayElements[idx]" :key="`map-cr-${idx}`" />
                </div>
                <div v-else-if="displayElements[idx].type === 'ALBUM'" class="element-card-wrapper">
                  <AlbumCard :content="{ image: displayElements[idx].value?.image || null, tag: displayElements[idx].value?.tag || '相簿封面', title: displayElements[idx].value?.title || '相簿標題', description: displayElements[idx].value?.description || '' }" :element="displayElements[idx]" />
                </div>
                <div v-else-if="displayElements[idx].type === 'PRODUCT_CARD'" class="element-card-wrapper">
                  <ProductCard :content="{ image: displayElements[idx].value?.image || null, tag: displayElements[idx].value?.tag || '法會活動', title: displayElements[idx].value?.title || '商品標題', date: displayElements[idx].value?.date || '2024-08-22' }" :element="displayElements[idx]" />
                </div>
                <div v-else-if="displayElements[idx].type === 'SERVICE_CARD'" class="element-card-wrapper">
                  <ServiceCard :content="{ image: displayElements[idx].value?.image || null, tag: displayElements[idx].value?.tag || '祈福服務', title: displayElements[idx].value?.title || '服務標題', date: displayElements[idx].value?.date || '2024-08-22' }" :element="displayElements[idx]" />
                </div>
                <div v-else-if="displayElements[idx].type === 'EVENT_CARD'" class="element-card-wrapper">
                  <EventCard :content="{ image: displayElements[idx].value?.image || null, tag: displayElements[idx].value?.tag || '法會活動', title: displayElements[idx].value?.title || '中元普渡法會', description: displayElements[idx].value?.description || '2024年中元普渡法會活動紀錄' }" :element="displayElements[idx]" />
                </div>
              </div>
              <div v-else class="empty-cell"></div>
            </div>
          </div>
        </div>
      </template>

      <!-- 其他框架 or 手機版 -->
      <div v-else class="frame-grid" :style="gridStyle">
        <template v-for="(element, index) in mobileReorderedElements" :key="`cell-${index}`">
          <div class="grid-cell" :style="getCellStyle(element, index)">
            <div v-if="element && element.type" class="element-content">
              <div v-if="element.type === 'IMG'" class="element-image" :style="getImageContainerStyle(element)">
                <img v-if="element.value?.src" :src="element.value.src" :alt="element.value?.alt || '圖片'" class="element-img" :style="getElementStyle(element)" />
                <div v-else class="placeholder-image">
                  <img src="https://images.unsplash.com/photo-1548013146-72479768bada?w=1280&h=300&fit=crop" alt="placeholder" class="placeholder-img" />
                  <div class="placeholder-overlay"><span>🖼️</span></div>
                </div>
              </div>
              <div v-else-if="element.type === 'TEXT'" class="element-text" :style="getElementStyle(element)" v-html="element.value?.text || ''"></div>
              <div v-else-if="element.type === 'BUTTON'" class="element-button" :style="getButtonContainerStyle(element)">
                <a :href="element.value?.url || '#'" class="button-link" :style="getButtonStyle(element)">{{ element.value?.text || '按鈕' }}</a>
              </div>
              <div v-else-if="element.type === 'HORIZON_LINE'" class="element-hline">
                <hr :style="{ borderColor: element.value?.color || '#ddd', borderWidth: element.value?.thickness || '2px' }" />
              </div>
              <div v-else-if="element.type === 'VERTICAL_LINE'" class="element-vline">
                <div class="vertical-line" :style="{ backgroundColor: element.value?.color || '#ddd', width: element.value?.thickness || '2px' }"></div>
              </div>
              <div v-else-if="element.type === 'CAROUSEL_IMG'" class="element-carousel">
                <CarouselElement :content="{ imgs: element.value?.imgs || [], autoPlay: element.value?.autoPlay !== false, interval: element.value?.interval || 3000, height: element.value?.height || 400 }" :element="element" />
              </div>
              <div v-else-if="element.type === 'GOOGLE_MAP'" class="element-map">
                <MapElement :content="{ address: element.value?.address || '', lat: element.value?.lat || 25.033, lng: element.value?.lng || 121.565, zoom: element.value?.zoom || 15 }" :element="element" :key="`map-${index}-${element.value?.lat}-${element.value?.lng}`" />
              </div>
              <div v-else-if="element.type === 'ALBUM'" class="element-card-wrapper">
                <AlbumCard :content="{ image: element.value?.image || null, tag: element.value?.tag || '相簿封面', title: element.value?.title || '相簿標題', description: element.value?.description || '' }" :element="element" />
              </div>
              <div v-else-if="element.type === 'PRODUCT_CARD'" class="element-card-wrapper">
                <ProductCard :content="{ image: element.value?.image || null, tag: element.value?.tag || '法會活動', title: element.value?.title || '商品標題', date: element.value?.date || '2024-08-22' }" :element="element" />
              </div>
              <div v-else-if="element.type === 'SERVICE_CARD'" class="element-card-wrapper">
                <ServiceCard :content="{ image: element.value?.image || null, tag: element.value?.tag || '祈福服務', title: element.value?.title || '服務標題', date: element.value?.date || '2024-08-22' }" :element="element" />
              </div>
              <div v-else-if="element.type === 'EVENT_CARD'" class="element-card-wrapper">
                <EventCard :content="{ image: element.value?.image || null, tag: element.value?.tag || '法會活動', title: element.value?.title || '中元普渡法會', description: element.value?.description || '2024年中元普渡法會活動紀錄' }" :element="element" />
              </div>
            </div>
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
  frame: { type: Object, required: true },
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

// ✅ 新增
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

// ✅ 新增
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
  if (m.color) style.color = m.color
  const fontSize   = getMeta(m, 'fontSize',   'font_size')
  const fontWeight = getMeta(m, 'fontWeight', 'font_weight')
  const textAlign  = getMeta(m, 'textAlign',  'text_align')
  const bgColor    = getMeta(m, 'backgroundColor', 'background_color')
  if (fontSize)                            style.fontSize        = fontSize
  if (fontWeight)                          style.fontWeight      = fontWeight
  if (textAlign && element.type !== 'IMG') style.textAlign       = textAlign
  if (m.width)                             style.width           = m.width
  if (m.height)                            style.height          = m.height
  if (bgColor)                             style.backgroundColor = bgColor
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
  if (m.color) style.color = m.color
  const fontSize   = getMeta(m, 'fontSize',   'font_size')
  const fontWeight = getMeta(m, 'fontWeight', 'font_weight')
  const bgColor    = getMeta(m, 'backgroundColor', 'background_color')
  if (fontSize)   style.fontSize        = fontSize
  if (fontWeight) style.fontWeight      = fontWeight
  if (bgColor)    style.backgroundColor = bgColor
  return style
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

.frame-grid {
  width: 100%;
  min-height: auto;
}

.double-row {
  display: flex;
  width: 100%;
}

.double-row .grid-cell {
  flex: 1;
  min-width: 0;
}

/* ==================== ✅ 複合框架 A/B/C/D ==================== */

.composite-frame {
  display: flex;
  width: 100%;
  align-items: stretch;
}

.composite-col {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.composite-col--left .composite-cell:only-child {
  flex: 1;
}

.composite-col--right {
  flex: 1;
  flex-shrink: 1;
}

.composite-col--right .composite-cell {
  height: auto; /* 各格高度獨立，不互相影響 */
}

.composite-cell {
  width: 100%;
  box-sizing: border-box;
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

.element-hline { padding: 20px 0; }
.element-hline hr { border: none; border-top: 2px solid #ddd; margin: 0; }

.element-vline {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  min-height: 150px;
}
.vertical-line { width: 2px; height: 100%; min-height: 100px; background: #ddd; }

.empty-cell { min-height: 100px; }

/* ==================== 手機版 ==================== */
.custom-frame-preview.device-mobile .grid-cell {
  grid-column: auto !important;
  grid-row: auto !important;
  width: 100% !important;
}
.custom-frame-preview.device-mobile .element-text { font-size: 14px; }
.custom-frame-preview.device-mobile .button-link { padding: 10px 24px; font-size: 14px; }
</style>
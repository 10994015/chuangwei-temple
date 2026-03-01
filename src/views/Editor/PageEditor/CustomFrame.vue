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
    <!-- ✅ 刪除框架按鈕（只在框架被選中且沒有元件時顯示） -->
    <button
      v-if="isFrameSelected && !hasAnyElement && frame.isDeletable"
      class="delete-frame-btn"
      @click.stop="handleDeleteFrame"
      title="刪除框架"
    >
      ✕
    </button>

    <!-- ✅ 新增 container 來限制內容最大寬度，支持動態寬度 -->
    <div class="frame-container" :style="frameContainerStyle">

      <!-- ✅ 雙層框架：兩排各自獨立，高度互不影響 -->
      <template v-if="isDoubleRowLayout">
        <!-- 第一排 -->
        <div class="double-row" :style="doubleRowStyle">
          <div
            v-for="(element, index) in doubleRowSplit.row1"
            :key="`row1-cell-${index}`"
            class="grid-cell"
            :class="{ 
              'has-element': element && element.type,
              'is-selected': isElementSelected(index) || isCellSelected(index),
              'empty-cell': !element || !element.type
            }"
            :style="{ padding: getCellPadding(element), flex: getCellFlex(element), minWidth: 0 }"
            @click.stop="handleCellClick(index, element)"
            @dragover="handleDragOver($event, index)"
            @dragleave="handleDragLeave"
            @drop="handleDrop($event, index)"
          >
            <!-- 有元件：顯示元件內容 -->
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
                    <p>請在右側上傳圖片</p>
                  </div>
                </div>
              </div>

              <!-- TEXT 元件 -->
              <div 
                v-else-if="element.type === 'TEXT'" 
                class="element-text"
                :style="getElementStyle(element)"
                v-html="element.value?.text || '文字內容'"
              ></div>

              <!-- BUTTON 元件 -->
              <div v-else-if="element.type === 'BUTTON'" class="element-button">
                <a 
                  :href="element.value?.url || '#'" 
                  class="button-link"
                  :style="getButtonStyle(element)"
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
                  :content="element.value"
                  :element="element"
                  :key="`carousel-r1-${index}-${element.value?.imgs?.length || 0}`"
                />
              </div>

              <!-- MAP 元件 -->
              <div v-else-if="element.type === 'MAP'" class="element-map">
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

              <!-- PRODUCT_CARD 商品卡片 -->
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

              <!-- SERVICE_CARD 服務卡片 -->
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

              <!-- EVENT_CARD 活動卡片 -->
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
        </div>

        <!-- 第二排 -->
        <div class="double-row" :style="doubleRowStyle">
          <div
            v-for="(element, rIndex) in doubleRowSplit.row2"
            :key="`row2-cell-${rIndex}`"
            class="grid-cell"
            :class="{ 
              'has-element': element && element.type,
              'is-selected': isElementSelected(doubleLayoutCols + rIndex) || isCellSelected(doubleLayoutCols + rIndex),
              'empty-cell': !element || !element.type
            }"
            :style="{ padding: getCellPadding(element), flex: getCellFlex(element), minWidth: 0 }"
            @click.stop="handleCellClick(doubleLayoutCols + rIndex, element)"
            @dragover="handleDragOver($event, doubleLayoutCols + rIndex)"
            @dragleave="handleDragLeave"
            @drop="handleDrop($event, doubleLayoutCols + rIndex)"
          >
            <!-- 有元件：顯示元件內容 -->
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
                    <p>請在右側上傳圖片</p>
                  </div>
                </div>
              </div>

              <!-- TEXT 元件 -->
              <div 
                v-else-if="element.type === 'TEXT'" 
                class="element-text"
                :style="getElementStyle(element)"
                v-html="element.value?.text || '文字內容'"
              ></div>

              <!-- BUTTON 元件 -->
              <div v-else-if="element.type === 'BUTTON'" class="element-button">
                <a 
                  :href="element.value?.url || '#'" 
                  class="button-link"
                  :style="getButtonStyle(element)"
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
                  :content="element.value"
                  :element="element"
                  :key="`carousel-r2-${rIndex}-${element.value?.imgs?.length || 0}`"
                />
              </div>

              <!-- MAP 元件 -->
              <div v-else-if="element.type === 'MAP'" class="element-map">
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

              <!-- PRODUCT_CARD 商品卡片 -->
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

              <!-- SERVICE_CARD 服務卡片 -->
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

              <!-- EVENT_CARD 活動卡片 -->
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

              <!-- 未知類型 -->
              <div v-else class="element-unknown">
                <span>未知元件：{{ element.type }}</span>
              </div>

              <!-- 刪除按鈕 -->
              <button 
                class="delete-element-btn"
                @click.stop="handleDeleteElement(doubleLayoutCols + rIndex)"
                title="刪除元件"
              >
                ✕
              </button>
            </div>

            <!-- 沒有元件：顯示空格子 -->
            <div v-else class="empty-cell" :class="{ 'drag-over': dragOverCell === (doubleLayoutCols + rIndex) }">
              <span class="drop-hint">📦 拖曳元件至此</span>
            </div>
          </div>
        </div>
      </template>

      <!-- 其他框架（單層、複合 A/B/C/D）維持原本的 frame-grid -->
      <div v-else class="frame-grid" :style="gridStyle">
        <template v-for="(element, index) in displayElements" :key="`cell-${index}`">
          <!-- 渲染格子 -->
          <div 
            class="grid-cell"
            :class="{ 
              'has-element': element && element.type,
              'is-selected': isElementSelected(index) || isCellSelected(index),
              'empty-cell': !element || !element.type
            }"
            :style="{
              padding: getCellPadding(element)
            }"
            @click.stop="handleCellClick(index, element)"
            @dragover="handleDragOver($event, index)"
            @dragleave="handleDragLeave"
            @drop="handleDrop($event, index)"
          >
            <!-- 有元件：顯示元件內容 -->
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
                    <p>請在右側上傳圖片</p>
                  </div>
                </div>
              </div>

              <!-- TEXT 元件 -->
              <div 
                v-else-if="element.type === 'TEXT'" 
                class="element-text"
                :style="getElementStyle(element)"
                v-html="element.value?.text || '文字內容'"
              ></div>

              <!-- BUTTON 元件 -->
              <div v-else-if="element.type === 'BUTTON'" class="element-button">
                <a 
                  :href="element.value?.url || '#'" 
                  class="button-link"
                  :style="getButtonStyle(element)"
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
                  :content="element.value"
                  :element="element"
                  :key="`carousel-${index}-${element.value?.imgs?.length || 0}-${element.value?.imgs?.[element.value.imgs.length - 1]?.id || 'empty'}`"
                />
              </div>

              <!-- MAP 元件 -->
              <div v-else-if="element.type === 'MAP'" class="element-map">
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

              <!-- PRODUCT_CARD 商品卡片 -->
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

              <!-- SERVICE_CARD 服務卡片 -->
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

              <!-- EVENT_CARD 活動卡片 -->
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CarouselElement from './elements/CarouselElement.vue'
import MapElement from './elements/MapElement.vue'
import AlbumCard from './elements/AlbumCard.vue'
import ProductCard from './elements/ProductCard.vue'
import ServiceCard from './elements/ServiceCard.vue'
import EventCard from './elements/EventCard.vue'

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
  },
  selectedCell: {
    type: Object,
    default: null
  },
  selectedFrame: {  // ✅ 新增：選中的框架
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'select-frame',
  'select-element',
  'select-cell',
  'drop-to-cell',
  'delete-element',
  'delete-frame'  // ✅ 新增：刪除框架事件
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
  if (!props.frame || !props.frame.type) {
    console.warn('⚠️ 框架缺少 type 屬性:', props.frame)
    return 'A'
  }
  
  const type = props.frame.type
  
  if (type.startsWith('FRAME')) {
    let layout = type.replace(/^FRAME/, '')
    layout = layout.replace(/^[-_]/, '')
    layout = layout.replace(/-/g, '_')
    
    console.log(`✓ 框架類型解析: ${type} → ${layout}`)
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
      console.warn('⚠️ 未知框架佈局:', layout)
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

// ✅ 檢查是否有任何元件（用於控制刪除按鈕顯示）
const hasAnyElement = computed(() => {
  const elements = props.frame.elements || []
  return elements.some(el => el && el.type)
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

// ✅ 雙層框架：每排的 flex 樣式
const doubleRowStyle = computed(() => ({
  display: 'flex',
  width: '100%'
}))

// ✅ 框架容器樣式（支持自訂寬度）
const frameContainerStyle = computed(() => {
  const style = {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  }
  
  // 如果 frame.metadata 有設定寬度，使用自訂寬度
  if (props.frame.metadata?.frameWidth) {
    style.maxWidth = props.frame.metadata.frameWidth
  }
  
  return style
})

// ✅ Grid 樣式 - 根據元件 width 動態生成列宽
const gridStyle = computed(() => {
  const layout = frameLayout.value
  
  // ✅ 單行佈局：使用元件的 width 來決定列寬
  const singleRowLayouts = ['1_1', '1_2', '1_3', '1_4']
  
  if (singleRowLayouts.includes(layout)) {
    const elements = displayElements.value
    const widths = elements.map(el => el && el.width ? el.width : '1fr')
    const columns = widths.join(' ')
    
    console.log(`✓ 動態 Grid 列寬 (${layout}):`, columns)
    
    return {
      display: 'grid',
      gridTemplateColumns: columns,
      gap: '0'
    }
  }
  
  // ✅ 複合佈局 A/B/C/D：從 element.width 讀左右欄寬，無則用預設
  // A: cell 0 = 左欄, cell 1,2 = 右欄
  // B: cell 0,1 = 左欄, cell 2 = 右欄
  // C: cell 0 = 左欄, cell 1,2,3 = 右欄
  // D: cell 0,1,2 = 左欄, cell 3 = 右欄
  const getCompositeColumns = (leftCellIdx, rightCellIdx, defaultLeft, defaultRight, rows) => {
    const els = displayElements.value
    const leftWidth = els[leftCellIdx]?.width || defaultLeft
    const rightWidth = els[rightCellIdx]?.width || defaultRight
    return {
      display: 'grid',
      gridTemplateColumns: `${leftWidth} ${rightWidth}`,
      gridTemplateRows: `repeat(${rows}, 1fr)`,
      gap: '0'
    }
  }

  switch (layout) {
    case 'A':
      return getCompositeColumns(0, 1, '66.7%', '33.3%', 2)
    
    case 'B':
      return getCompositeColumns(0, 2, '33.3%', '66.7%', 2)
    
    case 'C':
      return getCompositeColumns(0, 1, '66.7%', '33.3%', 3)
    
    case 'D':
      return getCompositeColumns(0, 3, '33.3%', '66.7%', 3)
    
    default:
      console.warn('⚠️ 未知框架佈局 gridStyle:', layout)
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0'
      }
  }
})

// 是否選中框架
// ✅ 是否選中框架（直接比較框架對象）
const isFrameSelected = computed(() => {
  return props.selectedFrame === props.frame
})

// 是否選中元件
const isElementSelected = (index) => {
  return props.selectedElement?.elementIndex === index && 
         props.selectedElement?.frame === props.frame  // ✅ 修正：改用物件參考比較，避免同類型框架互相干擾
}

// ✅ 是否選中格子
const isCellSelected = (index) => {
  return props.selectedCell?.cellIndex === index && 
         props.selectedCell?.frame === props.frame  // ✅ 修正：改用物件參考比較，避免同類型框架互相干擾
}

// ==================== ✅ 樣式相關方法 ====================

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

// ✅ 獲取元件的動態樣式（基於 metadata）
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

// ✅ 獲取按鈕的動態樣式
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

// ==================== 事件處理 ====================

// 點擊框架
const handleFrameClick = () => {
  emit('select-frame', props.frame)
}

// ✅ 點擊格子 - 發送 cellIndex，阻止冒泡
const handleCellClick = (index, element) => {
  if (element && element.type) {
    // 有元件：選擇元件，同時傳遞格子信息
    emit('select-element', {
      element: element,
      frame: props.frame,
      elementIndex: index,
      cellIndex: index
    })
  } else {
    // ✅ 空格子：選擇格子（用於調整 padding）+ 選擇框架
    emit('select-cell', {
      frame: props.frame,
      cellIndex: index
    })
    
    // ✅ 同時選中框架，這樣才能顯示刪除按鈕
    emit('select-frame', props.frame)
  }
}

// ✅ 獲取格子的 padding 樣式
const getCellPadding = (element) => {
  if (!element || !element.padding) {
    return '20px'
  }
  
  const { top = 20, right = 20, bottom = 20, left = 20 } = element.padding
  return `${top}px ${right}px ${bottom}px ${left}px`
}

// ✅ 獲取雙層框架格子的 flex 寬度
const getCellFlex = (element) => {
  if (!element || !element.width) return '1'
  const w = element.width
  if (w === 'auto') return '1'
  return `0 0 ${w}`
}

// ✅ 獲取格子的寬度（從 element.width 读取）
// 拖曳進入格子
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

// 拖曳離開格子
const handleDragLeave = (event) => {
  event.preventDefault()
  dragOverCell.value = null
}

// 放置到格子
const handleDrop = (event, index) => {
  try {
    const data = event.dataTransfer.getData('application/json')
    if (!data) return
    
    const dragData = JSON.parse(data)
    console.log('📦 CustomFrame 收到 drop:', dragData.dragType)
    
    if (dragData.dragType !== 'element') {
      console.log('❌ 不是元件，讓事件冒泡到底圖處理')
      return
    }
    
    event.preventDefault()
    event.stopPropagation()
    dragOverCell.value = null
    
    console.log('📦 放置元件到格子 ' + index + ':', dragData)
    
    const element = displayElements.value[index]
    if (element && element.type) {
      alert('此格子已有元件')
      return
    }
    
    const newElement = createElementFromDrag(dragData, index)
    
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

// ✅ 刪除框架
const handleDeleteFrame = () => {
  if (confirm('確定要刪除此框架嗎？')) {
    emit('delete-frame', {
      frame: props.frame,
      basemap: props.basemap,
      basemapIndex: props.basemapIndex
    })
  }
}

// 從拖曳數據創建元件
const createElementFromDrag = (dragData, index) => {
  const typeMap = {
    'text': 'TEXT',
    'image': 'IMG',
    'button': 'BUTTON',
    'h-line': 'H_LINE',
    'v-line': 'V_LINE',
    'carousel': 'CAROUSEL',
    'product-card': 'PRODUCT_CARD',
    'service-card': 'SERVICE_CARD',
    'event-card': 'EVENT_CARD'
  }
  
  const apiType = typeMap[dragData.type] || dragData.type.toUpperCase()
  
  let value = {}
  
  switch (dragData.type) {
    case 'text':
      value = { text: '<p>這是文字內容，點擊右側屬性面板進行編輯</p>' }
      break
    case 'image':
      value = { id: null, src: null, alt: '' }  // ✅ 加上 alt 初始化
      break
    case 'button':
      value = { text: '按鈕文字', url: '#' }
      break
    case 'h-line':
      value = { color: '#ddd', thickness: '2px' }
      break
    case 'v-line':
      value = { color: '#ddd', thickness: '2px' }
      break
    case 'carousel':
      value = { imgs: [], autoPlay: true, interval: 3000, height: 400 }
      break
    case 'map':
      // ✅ MAP 元件預設台北 101 地址
      value = { 
        address: '台北市信義區信義路五段7號（台北 101）',
        lat: 25.0339639,
        lng: 121.5644722,
        zoom: 17
      }
      break
    case 'album':
      value = {
        image: null,
        tag: '相簿封面',
        title: '相簿標題',
        description: ''
      }
      break
    case 'product-card':
      value = {
        image: null,
        tag: '法會活動',
        title: '商品標題',
        date: '2024-08-22'
      }
      break
    case 'service-card':
      value = {
        image: null,
        tag: '祈福服務',
        title: '服務標題',
        date: '2024-08-22'
      }
      break
    case 'event-card':
      value = {
        image: null,
        tag: '法會活動',
        title: '中元普渡法會',
        description: '2024年中元普渡法會活動紀錄'
      }
      break
    default:
      value = {}
  }
  
  // ✅ 根据布局计算初始宽度，傳入 index（cellIndex）而非 cellCount
  const initialWidth = getInitialCellWidth(frameLayout.value, index)
  
  console.log(`✓ 創建元件，佈局: ${frameLayout.value}, 初始寬度: ${initialWidth}`)
  
  return {
    type: apiType,
    value: value,
    metadata: {  // ✅ 初始化 metadata
      color: null,
      font_size: null,
      font_weight: null,
      text_align: null,
      width: null,
      height: null,
      background_color: null
    },
    padding: { top: 20, right: 20, bottom: 20, left: 20 },
    width: initialWidth  // ✅ 使用计算出的初始宽度
  }
}

// ✅ 根据布局计算格子的初始宽度（cellIndex 用於雙層框架判斷排別）
const getInitialCellWidth = (layout, cellIndex) => {
  // 单行布局：需要考虑已有元件的宽度
  const singleRowLayouts = {
    '1_1': 1,
    '1_2': 2,
    '1_3': 3,
    '1_4': 4
  }
  
  if (singleRowLayouts[layout]) {
    const cellsInRow = singleRowLayouts[layout]
    
    // ✅ 检查已有元件的总宽度
    const existingElements = displayElements.value.filter(el => el && el.type)
    
    if (existingElements.length > 0) {
      // 有已存在的元件，计算它们占用的宽度
      let usedWidth = 0
      let elementsWithWidth = 0
      
      existingElements.forEach(el => {
        if (el.width && el.width.includes('%')) {
          const width = parseFloat(el.width)
          if (!isNaN(width)) {
            usedWidth += width
            elementsWithWidth++
          }
        }
      })
      
      // 计算剩余宽度和剩余格子数
      const remainingWidth = 100 - usedWidth
      const remainingCells = cellsInRow - elementsWithWidth
      
      if (remainingCells > 0 && remainingWidth > 0) {
        const widthPerCell = (remainingWidth / remainingCells).toFixed(1)
        console.log(`✓ 單行佈局 ${layout}: 已用 ${usedWidth}%, 剩餘 ${remainingWidth}%, 新元件 ${widthPerCell}%`)
        return widthPerCell + '%'
      }
    }
    
    // 没有已存在的元件，平均分配
    const widthPerCell = (100 / cellsInRow).toFixed(1)
    console.log(`✓ 單行佈局 ${layout}: 每格 ${widthPerCell}%`)
    return widthPerCell + '%'
  }

  // ✅ 雙層框架：按排計算初始寬度
  const doubleRowCols = { '2_2': 2, '2_3': 3, '2_4': 4 }
  if (doubleRowCols[layout]) {
    const cols = doubleRowCols[layout]
    // 判斷當前格子在第幾排
    const row = cellIndex < cols ? 0 : 1
    const rowStart = row * cols
    const rowElements = displayElements.value.slice(rowStart, rowStart + cols)
    const existing = rowElements.filter(el => el && el.type)
    if (existing.length > 0) {
      let usedWidth = 0, elementsWithWidth = 0
      existing.forEach(el => {
        if (el.width && el.width.includes('%')) {
          const w = parseFloat(el.width)
          if (!isNaN(w)) { usedWidth += w; elementsWithWidth++ }
        }
      })
      const remainingWidth = 100 - usedWidth
      const remainingCells = cols - elementsWithWidth
      if (remainingCells > 0 && remainingWidth > 0) {
        const widthPerCell = (remainingWidth / remainingCells).toFixed(1)
        console.log(`✓ 雙層佈局 ${layout} 第${row + 1}排: 已用 ${usedWidth}%, 剩餘 ${remainingWidth}%, 新元件 ${widthPerCell}%`)
        return widthPerCell + '%'
      }
    }
    const widthPerCell = (100 / cols).toFixed(1)
    console.log(`✓ 雙層佈局 ${layout} 第${row + 1}排: 每格 ${widthPerCell}%`)
    return widthPerCell + '%'
  }
  
  // ✅ 複合框架 A/B/C/D：左右兩欄，依格子所屬欄位給預設寬
  const compositeLayoutInfo = {
    'A': { leftCells: [0],       rightCells: [1, 2],    defaultLeft: '66.7%', defaultRight: '33.3%' },
    'B': { leftCells: [0, 1],    rightCells: [2],       defaultLeft: '33.3%', defaultRight: '66.7%' },
    'C': { leftCells: [0],       rightCells: [1, 2, 3], defaultLeft: '66.7%', defaultRight: '33.3%' },
    'D': { leftCells: [0, 1, 2], rightCells: [3],       defaultLeft: '33.3%', defaultRight: '66.7%' },
  }
  if (compositeLayoutInfo[layout]) {
    const info = compositeLayoutInfo[layout]
    const isLeft = info.leftCells.includes(cellIndex)
    // 如果同欄已有元件設定寬度，直接沿用
    const allCells = isLeft ? info.leftCells : info.rightCells
    const els = displayElements.value
    for (const idx of allCells) {
      if (els[idx]?.width && els[idx].width.includes('%')) {
        return els[idx].width
      }
    }
    return isLeft ? info.defaultLeft : info.defaultRight
  }

  // 非单行布局：默认 100%
  console.log(`✓ 非單行佈局 ${layout}: 默認 100%`)
  return '100%'
}
</script>

<style lang="scss" scoped>
.custom-frame {
  padding: 0;  // ✅ 改為 0，讓內容完全貼邊
  background: transparent;  // ✅ 透明，讓底圖背景圖顯示
  min-height: auto;  // ✅ 改為 auto，適應內容高度
  position: relative;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 0 0 2px rgba(232, 87, 42, 0.2);
  }
  
  &.is-selected {
    box-shadow: 0 0 0 3px rgba(232, 87, 42, 0.5);
    
    // ✅ 框架被選中時，顯示刪除按鈕
    .delete-frame-btn {
      opacity: 1;
    }
  }
}

// ✅ 刪除框架按鈕
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
  
  &:hover {
    background: #dc3545;
    color: #fff;
    transform: scale(1.1);
  }
}

// ✅ 新增：內容容器限制最大寬度
.frame-container {
  max-width: 1200px;  // ✅ 限制最大寬度為 1200px
  margin: 0 auto;
  width: 100%;
}

.frame-grid {
  width: 100%;
  // ✅ 移除固定 min-height，讓內容自動撐開
}

// ✅ 雙層框架：每排獨立 flex，高度互不影響
// flex 寬度由 getCellFlex() 動態控制，不在 CSS 固定
.double-row {
  display: flex;
  width: 100%;
}

// ==================== 複合框架特殊佈局 ====================

.custom-frame.layout-A {
  .frame-grid {
    // ✅ 移除固定 min-height
    
    .grid-cell {
      // ✅ 移除 min-height，讓內容自動撐開
      min-height: auto;
    }
    
    .grid-cell:nth-child(1) {
      grid-column: 1;
      grid-row: 1 / 3;
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

.custom-frame.layout-B {
  .frame-grid {
    // ✅ 移除固定 min-height
    
    .grid-cell {
      min-height: auto;
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
      grid-row: 1 / 3;
    }
  }
}

.custom-frame.layout-C {
  .frame-grid {
    // ✅ 移除固定 min-height
    
    .grid-cell {
      min-height: auto;
    }
    
    .grid-cell:nth-child(1) {
      grid-column: 1;
      grid-row: 1 / 4;
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

.custom-frame.layout-D {
  .frame-grid {
    // ✅ 移除固定 min-height
    
    .grid-cell {
      min-height: auto;
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
      grid-row: 1 / 4;
    }
  }
}

// ✅ grid-cell 樣式 - 讓內容自動撐開高度
.grid-cell {
  min-height: auto;  // ✅ 改為 auto，完全適應內容高度
  position: relative;
  border-radius: 8px;
  transition: all 0.2s;
  box-sizing: border-box;
  border: 2px solid transparent;
  
  &.has-element {
    cursor: pointer;
    
    &:hover {
      border-color: #E8572A;
    }
    
    &.is-selected {
      border-color: #E8572A;
      box-shadow: 0 0 0 3px rgba(232, 87, 42, 0.1);
    }
  }
  
  // ✅ 空格子被選中時的樣式
  &.empty-cell.is-selected {
    border: 2px dashed #E8572A;
    background: rgba(232, 87, 42, 0.05);
  }
}

// ✅ element-content 移除固定高度，讓內容自動撐開
.element-content {
  position: relative;
  padding: 0;
  background: transparent;  // ✅ 透明，讓底圖背景圖顯示
  border-radius: 8px;
  // ✅ 移除 height: 100% 和 min-height，讓內容決定高度
  
  &:hover .delete-element-btn {
    opacity: 1;
  }
}

.element-carousel {
  width: 100%;
  height: 100%;  // ✅ 填滿格子高度
  // ✅ 移除 min-height，讓輪播組件自己決定高度
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
  // ✅ 圖片容器使用 text-align 來控制圖片對齊
  width: 100%;
  
  .element-img {
    // ✅ 使用 inline-block 讓 text-align 生效
    display: inline-block;
    max-width: 100%;  // ✅ 限制最大寬度不超過容器
    height: auto;
    border-radius: 4px;
    object-fit: contain;
    vertical-align: middle;  // ✅ 垂直置中對齊
  }
  
  .placeholder-image {
    width: 100%;
    position: relative;
    border-radius: 4px;
    overflow: hidden;

    .placeholder-img {
      width: 100%;
      height: 100%;
      min-height: 200px;
      object-fit: cover;
      display: block;
      filter: brightness(0.7);
    }

    .placeholder-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.25);
      color: #fff;

      span {
        font-size: 36px;
        margin-bottom: 8px;
      }

      p {
        font-size: 13px;
        margin: 0;
        opacity: 0.9;
      }
    }
  }
}

.element-text {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  // ✅ 移除 min-height，讓文字內容決定高度
  
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
  // ✅ MapElement 會自己決定高度和樣式
}

// ==================== 卡片元件 Wrapper ====================

.element-card-wrapper {
  width: 100%;
  height: auto;
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
  height: auto;  // ✅ 改為 auto
  min-height: 100px;  // ✅ 降低最小高度到 100px
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 2px dashed transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  .drop-hint {
    color: transparent;
    font-size: 14px;
    pointer-events: none;
    transition: all 0.2s;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.4);  // ✅ 半透明，不蓋住底圖背景
    border-color: rgba(255, 255, 255, 0.6);
    
    .drop-hint {
      color: #999;
    }
  }
  
  &.drag-over {
    background: rgba(232, 87, 42, 0.15);  // ✅ 半透明橘色
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

.custom-frame.is-dragging .empty-cell {
  background: rgba(255, 255, 255, 0.3);  // ✅ 半透明
  border-color: rgba(200, 200, 200, 0.5);
  
  .drop-hint {
    color: #ccc;
  }
}
</style>
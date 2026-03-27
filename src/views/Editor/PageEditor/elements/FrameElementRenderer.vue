<template>
  <div v-if="element && element.type" class="element-content">

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
          <p v-if="isEditMode">{{ t('customFrame.uploadImgHint') }}</p>
        </div>
      </div>
    </div>

    <div
      v-else-if="element.type === 'TEXT'"
      class="element-text"
      :style="getElementStyle(element)"
      v-html="element.value?.text || (isEditMode ? t('customFrame.textPlaceholder') : '')"
    ></div>

    <div v-else-if="element.type === 'BUTTON'" class="element-button" :style="isEditMode ? undefined : getButtonContainerStyle(element)">
      <a
        :href="element.value?.url || '#'"
        class="button-link"
        :style="getButtonStyle(element)"
        @click="isEditMode ? $event.preventDefault() : handleButtonClick($event, element.value?.url)"
      >
        {{ element.value?.text || (isEditMode ? t('customFrame.buttonText') : '按鈕') }}
      </a>
    </div>

    <div v-else-if="element.type === 'HORIZON_LINE'" class="element-hline">
      <hr :style="{ borderColor: element.value?.color || '#ddd', borderWidth: element.value?.thickness || '2px' }" />
    </div>

    <div v-else-if="element.type === 'VERTICAL_LINE'" class="element-vline">
      <div class="vertical-line" :style="{ backgroundColor: element.value?.color || '#ddd', width: element.value?.thickness || '2px' }"></div>
    </div>

    <div v-else-if="element.type === 'CAROUSEL_IMG'" class="element-carousel">
      <CarouselElement
        :content="isEditMode ? element.value : { imgs: element.value?.imgs || [], autoPlay: element.value?.autoPlay !== false, interval: element.value?.interval || 3000, height: element.value?.height || 400 }"
        :element="element"
        :key="`carousel-${cellKey}-${element.value?.imgs?.length || 0}`"
      />
    </div>

    <div v-else-if="element.type === 'GOOGLE_MAP'" class="element-map">
      <MapElement
        :content="{ address: element.value?.address || '', lat: element.value?.lat || 25.033, lng: element.value?.lng || 121.565, zoom: element.value?.zoom || 15 }"
        :element="element"
        :key="`map-${cellKey}-${element.value?.lat}-${element.value?.lng}`"
      />
    </div>

    <div v-else-if="element.type === 'ALBUM'" class="element-card-wrapper">
      <AlbumCard
        :content="{ image: element.value?.image || null, tag: element.value?.tag || (isEditMode ? t('customFrame.albumTag') : '相簿封面'), title: element.value?.title || (isEditMode ? t('customFrame.albumTitle') : '相簿標題'), description: element.value?.description || '' }"
        :element="element"
      />
    </div>

    <div v-else-if="element.type === 'PRODUCT_CARD'" class="element-card-wrapper">
      <ProductCard
        :content="{ image: element.value?.image || null, tag: element.value?.tag || (isEditMode ? t('customFrame.productTag') : '法會活動'), title: element.value?.title || (isEditMode ? t('customFrame.productTitle') : '商品標題'), date: element.value?.date || '2024-08-22' }"
        :element="element"
      />
    </div>

    <div v-else-if="element.type === 'SERVICE_CARD'" class="element-card-wrapper">
      <ServiceCard
        :content="{ image: element.value?.image || null, tag: element.value?.tag || (isEditMode ? t('customFrame.serviceTag') : '祈福服務'), title: element.value?.title || (isEditMode ? t('customFrame.serviceTitle') : '服務標題'), date: element.value?.date || '2024-08-22' }"
        :element="element"
      />
    </div>

    <div v-else-if="element.type === 'EVENT_CARD'" class="element-card-wrapper">
      <EventCard
        :content="{ image: element.value?.image || null, tag: element.value?.tag || (isEditMode ? t('customFrame.eventTag') : '法會活動'), title: element.value?.title || (isEditMode ? t('customFrame.eventTitle') : '中元普渡法會'), description: element.value?.description || (isEditMode ? t('customFrame.eventDesc') : '2024年中元普渡法會活動紀錄') }"
        :element="element"
      />
    </div>

    <div v-else class="element-unknown">
      <span>{{ isEditMode ? t('customFrame.unknownElement') : '未知元件：' }}{{ element.type }}</span>
    </div>

    <button
      v-if="isEditMode"
      class="delete-element-btn"
      @click.stop="emit('delete', cellIndex)"
      :title="t('customFrame.deleteElement')"
    >
      ✕
    </button>
  </div>

  <div v-else-if="isEditMode" class="empty-cell" :class="{ 'drag-over': isDragOver }">
    <span class="drop-hint">📦 {{ t('customFrame.dropHint') }}</span>
  </div>

  <div v-else class="empty-cell"></div>
</template>

<script setup>
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'
import CarouselElement from './CarouselElement.vue'
import MapElement from './MapElement.vue'
import AlbumCard from './AlbumCard.vue'
import ProductCard from './ProductCard.vue'
import ServiceCard from './ServiceCard.vue'
import EventCard from './EventCard.vue'

const { t } = useI18n()

const previewNavigate = inject('previewNavigate', null)
const previewContext  = inject('previewContext',  null)

const handleButtonClick = (e, url) => {
  if (!url || url === '#') { e.preventDefault(); return }

  // 判斷是否為內頁連結格式：/site/{tenantId}/{slug}
  if (previewNavigate && previewContext) {
    const prefix = `/site/${previewContext.tenantId}/`
    if (url.startsWith(prefix)) {
      e.preventDefault()
      const slug = url.slice(prefix.length)
      previewNavigate(slug)
      return
    }
  }
  // 外部連結：在新分頁開啟
  e.preventDefault()
  window.open(url, '_blank')
}

const props = defineProps({
  element:    { type: Object,  default: null },
  cellIndex:  { type: Number,  default: 0 },
  cellKey:    { type: String,  default: '0' },
  isEditMode: { type: Boolean, default: false },
  isDragOver: { type: Boolean, default: false }
})

const emit = defineEmits(['delete'])

const getMeta = (m, camel, snake) => m?.[camel] || m?.[snake] || null

const getImageContainerStyle = (element) => {
  if (!element?.metadata) return {}
  const textAlign = getMeta(element.metadata, 'textAlign', 'text_align')
  return textAlign ? { textAlign } : {}
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
  if (fontSize)                              style.fontSize        = fontSize
  if (fontWeight)                            style.fontWeight      = fontWeight
  if (textAlign && element.type !== 'IMG')   style.textAlign       = textAlign
  if (m.width)                               style.width           = m.width
  if (m.height)                              style.height          = m.height
  if (bgColor)                               style.backgroundColor = bgColor
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
.element-content {
  position: relative;
  padding: 0;
  background: transparent;
  border-radius: 8px;
}

.element-content:hover .delete-element-btn {
  opacity: 1;
}

.element-image { width: 100%; }

.element-img {
  display: inline-block;
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  object-fit: cover;
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.25);
  color: #fff;
}

.placeholder-overlay span { font-size: 36px; margin-bottom: 8px; }
.placeholder-overlay p { font-size: 13px; margin: 0; opacity: 0.9; }

.element-text { font-size: 16px; line-height: 1.6; color: #333; }
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
  cursor: pointer;
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

.element-carousel,
.element-map,
.element-card-wrapper { width: 100%; }

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
}
.delete-element-btn:hover { background: #dc3545; color: #fff; transform: scale(1.1); }

.empty-cell {
  height: auto;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 2px dashed transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.empty-cell .drop-hint {
  color: transparent;
  font-size: 14px;
  pointer-events: none;
  transition: all 0.2s;
}

.empty-cell:hover {
  background: rgba(255, 255, 255, 0.4);
  border-color: rgba(255, 255, 255, 0.6);
}

.empty-cell:hover .drop-hint { color: #999; }

.empty-cell.drag-over {
  background: rgba(232, 87, 42, 0.15);
  border-color: #E8572A;
  border-width: 3px;
  border-style: solid;
  box-shadow: 0 0 0 4px rgba(232, 87, 42, 0.1);
  transform: scale(1.02);
}

.empty-cell.drag-over .drop-hint { color: #E8572A; transform: scale(1.1); }
</style>
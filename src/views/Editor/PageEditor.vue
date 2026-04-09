<script setup>
import { ref, inject, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LeftSidebar from './PageEditor/LeftSidebar.vue'
import CanvasArea from './PageEditor/CanvasArea.vue'
import PropsPanel from './PageEditor/PropsPanel.vue'

const router = useRouter()
const route = useRoute()

const pageEditorStore = inject('pageEditorStore')
const setUnsavedChanges = inject('setUnsavedChanges')
const currentDevice = inject('currentDevice')

watch(
  () => pageEditorStore.currentPageBasemaps,
  () => {
    setUnsavedChanges(true)
  },
  { deep: true }
)

const handleHeaderPageChange = async (slug) => {
  try {
    router.replace({
      query: { ...route.query, slug, locale: pageEditorStore.currentLocale }
    })
    await pageEditorStore.switchPageWithLocale(slug, pageEditorStore.currentLocale)
    const templeId = route.params.templeId
    if (templeId && slug) {
      await pageEditorStore.fetchSystemFrames(templeId, slug)
    }
    pageEditorStore.syncHeaderMenuFromTabs()
    setUnsavedChanges(false)
  } catch (error) {
    console.error('頁面切換失敗:', error)
    pageEditorStore.error = '頁面切換失敗，請重試'
  }
}

const handleHeaderLocaleChange = async (newLocale) => {
  const templeId = route.params.templeId
  const currentSlug = pageEditorStore.currentPageSlug
  if (!templeId || !currentSlug) return
  try {
    pageEditorStore.currentLocale = newLocale
    router.replace({ query: { ...route.query, locale: newLocale } })
    await pageEditorStore.reloadCurrentPage(newLocale)
    setUnsavedChanges(false)
  } catch (error) {
    console.error('語言切換失敗:', error)
    pageEditorStore.error = '語言切換失敗：' + error.message
  }
}

const handleSelectBasemap  = (basemap) => { pageEditorStore.selectBasemap(basemap) }
const handleSelectFrame    = (frame)   => { pageEditorStore.selectFrame(frame) }
const handleSelectElement  = (data)    => { pageEditorStore.selectElement(data) }
const handleSelectCell     = (data)    => { pageEditorStore.selectCell(data) }

const handleUpdateElement = (data) => {
  if (data.type === 'logo') {
    if (data.frame && data.frame.data) {
      data.frame.data.logoImgSrc = data.data.src
      data.frame.data.logoImgId  = data.data.id || null
    }
  }
}

const handleUpdateCellPadding = (data) => {
  const { frame, cellIndex, padding } = data
  if (!frame.elements) frame.elements = []
  while (frame.elements.length <= cellIndex) frame.elements.push(null)
  if (!frame.elements[cellIndex]) {
    frame.elements[cellIndex] = { type: null, padding }
  } else {
    frame.elements[cellIndex].padding = padding
  }
}

const handleDragStart = ({ event, item, type }) => {}

const handleDropToBasemap = ({ basemap, basemapIndex, frame }) => {
  let frameType = null
  if (frame.dragType === 'custom-frame' && frame.layout) {
    frameType = `FRAME${frame.layout.replace(/-/g, '_')}`
  } else if (frame.dragType === 'system-frame' && frame.type) {
    frameType = frame.type
  } else if (frame.type) {
    frameType = frame.type
  }
  if (!frameType) { alert('框架數據錯誤，請重試'); return }
  if (!basemap.frames) basemap.frames = []
  basemap.frames.push({
    type: frameType,
    isDeletable: true,
    isDraggable: true,
    data: {},
    elements: []
  })
}

// 各元件的預設資料
const elementDefaults = {
  ACCORDION: {
    value: {
      items: [
        { title: '如何開始使用本服務？', content: '您可以點擊右上角的「立即註冊」按鈕，填寫基本資料後即可開始使用。' },
        { title: '如何聯繫客服？', content: '您可以透過頁面下方的聯絡表單，或直接來信至官方信箱，我們將在一個工作天內回覆。' },
        { title: '服務費用如何計算？', content: '基本服務完全免費。如需進階功能，請參考我們的方案頁面，選擇最適合您的服務內容。' },
      ]
    },
    content: {},
    metadata: {},
    padding: {
      pc:     { top: 0, right: 0, bottom: 0, left: 0 },
      tablet: { top: 0, right: 0, bottom: 0, left: 0 },
      phone:  { top: 0, right: 0, bottom: 0, left: 0 },
    },
    width: '100%',
  }
}

const handleDropToCell = ({ frame, cellIndex, element }) => {
  if (!frame.elements) frame.elements = []
  while (frame.elements.length < cellIndex) frame.elements.push(null)
  if (frame.elements[cellIndex]) { alert('此格子已有元件'); return }

  // 補充各元件的預設值
  const defaults = elementDefaults[element.type]
  if (defaults) {
    element = {
      ...element,
      value:    element.value    ?? defaults.value,
      content:  element.content  ?? defaults.content,
      metadata: element.metadata ?? defaults.metadata,
      padding:  element.padding  ?? defaults.padding,
      width:    element.width    ?? defaults.width,
    }
  }

  frame.elements[cellIndex] = element
}

const handleDeleteBasemap = (index) => {
  if (confirm('確定要刪除此底圖嗎？')) pageEditorStore.deleteBasemap(index)
}
const handleAddBasemap      = (i) => { pageEditorStore.addBasemap(i) }
const handleMoveBasemapUp   = (i) => { pageEditorStore.moveBasemapUp(i) }
const handleMoveBasemapDown = (i) => { pageEditorStore.moveBasemapDown(i) }

const handleDeleteElement = (data) => {
  if (data.type === 'logo') {
    pageEditorStore.clearHeaderLogo()
    pageEditorStore.clearSelection()
    return
  }
  if (data.frame && data.elementIndex !== undefined) {
    if (confirm('確定要刪除此元件嗎？')) {
      if (data.frame.elements?.[data.elementIndex]) {
        data.frame.elements[data.elementIndex] = null
        pageEditorStore.clearSelection()
      }
    }
  }
}

const handleDeleteFrame = (data) => {
  const { basemap, frame } = data
  if (!basemap?.frames) return
  const idx = basemap.frames.findIndex(f => f === frame)
  if (idx === -1) return
  basemap.frames.splice(idx, 1)
  pageEditorStore.clearSelection()
}

const handleUpdateBackground = (data) => {}
const handleUploadBackground = () => {}

const handleUploadImage = () => {
  const selectedElement = pageEditorStore.selected.element
  if (!selectedElement?.element) { alert('請先選擇一個圖片元件'); return }
  if (selectedElement.element.type !== 'IMG') { alert('只有圖片元件才能上傳圖片'); return }

  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('圖片大小不能超過 5MB'); return }
    const reader = new FileReader()
    reader.onload = (event) => {
      if (!selectedElement.element.value) selectedElement.element.value = {}
      selectedElement.element.value.src = event.target.result
      selectedElement.element.value.id  = null
    }
    reader.onerror = () => { alert('讀取圖片失敗，請重試') }
    reader.readAsDataURL(file)
  }
  input.click()
}

const handleUploadCarousel = () => { alert('輪播圖片上傳功能待實作') }

const handleUpdateLogo = (logoData) => {
  pageEditorStore.updateHeaderLogo(logoData.src, logoData.id)
}
</script>

<template>
  <div class="editor-body">
    <LeftSidebar @drag-start="handleDragStart" />

    <CanvasArea
      :basemaps="pageEditorStore.currentPageBasemaps"
      :selected-basemap="pageEditorStore.selected.basemap"
      :selected-frame="pageEditorStore.selected.frame"
      :selected-element="pageEditorStore.selected.element"
      :selected-cell="pageEditorStore.selected.cell"
      :current-page-slug="pageEditorStore.currentPageSlug"
      :locales="pageEditorStore.locales"
      :current-locale="pageEditorStore.currentLocale"
      :device="currentDevice"
      @select-basemap="handleSelectBasemap"
      @select-frame="handleSelectFrame"
      @select-element="handleSelectElement"
      @update-element="handleUpdateElement"
      @update-background="handleUpdateBackground"
      @select-cell="handleSelectCell"
      @update-cell-padding="handleUpdateCellPadding"
      @drop-to-basemap="handleDropToBasemap"
      @drop-to-cell="handleDropToCell"
      @delete-basemap="handleDeleteBasemap"
      @delete-element="handleDeleteElement"
      @delete-frame="handleDeleteFrame"
      @move-basemap-up="handleMoveBasemapUp"
      @move-basemap-down="handleMoveBasemapDown"
      @add-basemap="handleAddBasemap"
      @change-page="handleHeaderPageChange"
      @locale-change="handleHeaderLocaleChange"
    />

    <PropsPanel
      :selected-basemap="pageEditorStore.selected.basemap"
      :selected-frame="pageEditorStore.selected.frame"
      :selected-element="pageEditorStore.selected.element"
      :selected-cell="pageEditorStore.selected.cell"
      @upload-background="handleUploadBackground"
      @upload-image="handleUploadImage"
      @upload-carousel="handleUploadCarousel"
      @update-logo="handleUpdateLogo"
      @delete-logo="() => { pageEditorStore.clearHeaderLogo(); pageEditorStore.clearSelection() }"
      @update-cell-padding="handleUpdateCellPadding"
    />
  </div>
</template>

<style scoped>
.editor-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}
</style>
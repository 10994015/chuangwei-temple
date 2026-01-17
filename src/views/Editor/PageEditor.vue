<template>
  <div class="temple-editor">
    <!-- 頂部工具列 -->
    <header class="toolbar">
      <div class="toolbar-left">
        <select v-model="currentPageId" class="page-select">
          <option v-for="page in pages" :key="page.id" :value="page.id">
            {{ page.name }}
          </option>
        </select>
      </div>
      <div class="toolbar-right">
        <button class="btn btn-icon" @click="handleSettings">
          設定
        </button>
        <button class="btn btn-icon" @click="handleSelectTemplate">
          選擇模板
        </button>
        <button class="btn btn-icon" @click="handleUpgrade">
          升級方案
        </button>
        <div class="toolbar-divider"></div>
        <button class="btn btn-icon" @click="handlePreview">
          預覽
        </button>
        <button class="btn btn-icon" @click="handleSave">
          儲存草稿
        </button>
        <button class="btn btn-icon btn-danger" @click="handleDelete">
          刪除草稿
        </button>
        <div class="toolbar-divider"></div>
        <button class="btn btn-icon btn-secondary" @click="handleGoToWebsite">
          前往網站
        </button>
        <button class="btn btn-primary" @click="handlePublish">
          發布網站
        </button>
      </div>
    </header>

    <!-- 主要內容區 -->
    <div class="editor-body">
      <!-- 左側：元件庫 (固定 280px) -->
      <LeftSidebar @drag-start="handleDragStart" />

      <!-- 中間：畫布區 (自動填滿剩餘空間) -->
      <CanvasArea
        :canvases="currentPage.canvases"
        :selected-canvas="selected.canvas"
        :selected-frame="selected.frame"
        :selected-element="selected.element"
        @select-canvas="handleSelectCanvas"
        @select-frame="handleSelectFrame"
        @select-element="handleSelectElement"
        @select-cell="handleSelectCell"
        @drop-to-canvas="handleDropToCanvas"
        @drop-to-cell="handleDropToCell"
        @delete-canvas="handleDeleteCanvas"
        @delete-frame="handleDeleteFrame"
        @delete-element="handleDeleteElement"
        @move-frame="handleMoveFrame"
        @add-canvas="handleAddCanvas"
        @move-canvas="handleMoveCanvas"
      />

      <!-- 右側：屬性面板 (固定 320px) -->
      <PropsPanel
        :selected-canvas="selected.canvas"
        :selected-frame="selected.frame"
        :selected-element="selected.element"
        @upload-background="handleUploadBackground"
        @upload-image="handleUploadImage"
        @upload-carousel="handleUploadCarousel"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import LeftSidebar from './PageEditor/LeftSidebar.vue'
import CanvasArea from './PageEditor/CanvasArea.vue'
import PropsPanel from './PageEditor/PropsPanel.vue'

const router = useRouter()
// ==================== Props ====================
const props = defineProps({
  // 初始頁面資料（可選）
  initialData: {
    type: Object,
    default: () => ({})
  }
})

// ==================== Emits ====================
const emit = defineEmits([
  'save',      // 儲存時觸發
  'publish',   // 發布時觸發
  'preview'    // 預覽時觸發
])

// ==================== 頁面列表 ====================
const pages = ref([
  { id: 1, name: '首頁' },
  { id: 2, name: '關於我們' },
  { id: 3, name: '商品服務' },
  { id: 4, name: '慶典活動' },
  { id: 5, name: '最新消息' },
  { id: 6, name: '集影牆' },
  { id: 7, name: '宮廟捐款' }
])

const currentPageId = ref(1)

// ==================== 頁面數據 ====================
const pageData = ref({
  1: {
    id: 1,
    canvases: [
      {
        id: 'canvas-header',
        name: '頁首區域',
        type: 'header',
        frames: [
          { 
            id: 'frame-header',
            type: 'HEADER', 
            frameType: 'system',
            component: 'NavbarBasemap' 
          }
        ]
      },
      {
        id: 'canvas-1',
        name: '內容區域',
        type: 'content',
        frames: []
      },
      {
        id: 'canvas-footer',
        name: '頁尾區域',
        type: 'footer',
        frames: [
          { 
            id: 'frame-footer',
            type: 'FOOTER', 
            frameType: 'system',
            component: 'FooterBasemap' 
          }
        ]
      }
    ]
  }
})


// ==================== 選擇狀態 ====================
const selected = ref({
  canvas: null,
  frame: null,
  element: null
})

// ==================== 計算屬性 ====================
const currentPage = computed(() => {
  return pageData.value[currentPageId.value] || { canvases: [] }
})

// ==================== 拖拽處理 ====================
const handleDragStart = ({ event, item, type }) => {
  console.log('開始拖拽:', type, item)
  // 這裡可以添加拖拽開始的邏輯
}

const handleDropToCanvas = ({ event, canvas }) => {
  event.preventDefault()
  event.stopPropagation()

  const data = JSON.parse(event.dataTransfer.getData('application/json'))

  // 只允許框架拖到底圖
  if (data.dragType !== 'frame') {
    alert('只能將框架拖到底圖上')
    return
  }

  // 創建新框架
  const newFrame = {
    id: `frame-${Date.now()}`,
    name: data.name,
    layout: data.layout,
    columns: JSON.parse(JSON.stringify(data.columns)),
    elements: {},
    properties: {
      'padding-top': '5%',
      'padding-right': '5%',
      'padding-bottom': '5%',
      'padding-left': '5%'
    }
  }

  canvas.frames.push(newFrame)
}

const handleDropToCell = ({ event, frame, col }) => {
  event.preventDefault()
  event.stopPropagation()

  const data = JSON.parse(event.dataTransfer.getData('application/json'))

  // 只允許元件拖到格子
  if (data.dragType !== 'element') {
    alert('只能將元件拖到格子內')
    return
  }

  // 檢查格子是否已有元件
  if (frame.elements && frame.elements[col.id]) {
    if (!confirm('此格子已有元件，是否替換？')) return
  }

  // 初始化 elements 對象（如果不存在）
  if (!frame.elements) {
    frame.elements = {}
  }

  // 創建新元件（帶預設內容）
  const newElement = {
    id: `elem-${Date.now()}`,
    name: data.name,
    type: data.type,
    content: getDefaultElementContent(data.type)
  }

  frame.elements[col.id] = newElement
}

// 獲取元件預設內容
const getDefaultElementContent = (type) => {
  const defaults = {
    text: {
      text: '這是文字內容，點擊右側編輯',
      fontSize: '16px',
      color: '#333333',
      align: 'center'
    },
    image: {
      src: 'https://via.placeholder.com/400x300/E8572A/FFF?text=預設圖片',
      alt: '圖片'
    },
    button: {
      text: '按鈕文字',
      textColor: '#FFFFFF',
      bgColor: '#E8572A',
      link: ''
    },
    'h-line': { color: '#E0E0E0', thickness: '2px' },
    'v-line': { color: '#E0E0E0', thickness: '2px' },
    carousel: {
      images: [
        'https://via.placeholder.com/800x400/667eea/FFF?text=輪播1',
        'https://via.placeholder.com/800x400/764ba2/FFF?text=輪播2'
      ],
      autoPlay: true
    },
    map: { address: '請輸入地址', lat: 25.033, lng: 121.565 },
    album: { albumId: null, title: '相簿預覽' }
  }
  return defaults[type] || {}
}

// ==================== 選擇處理 ====================
const handleSelectCanvas = (canvas) => {
  selected.value = { canvas, frame: null, element: null }
}

const handleSelectFrame = (frame) => {
  selected.value = { canvas: null, frame, element: null }
}

const handleSelectElement = (element) => {
  selected.value = { canvas: null, frame: null, element }
}

const handleSelectCell = ({ frame, col }) => {
  // 選擇空格子時，選中該框架
  selected.value = { canvas: null, frame, element: null }
}

// ==================== 底圖操作 ====================
const handleDeleteCanvas = (index) => {
  console.log('===== PageEditor: 收到刪除底圖請求 =====')
  console.log('要刪除的索引:', index)
  console.log('當前 canvases:', currentPage.value.canvases.map(c => ({ id: c.id, type: c.type })))
  
  // 檢查索引是否有效
  if (index < 0 || index >= currentPage.value.canvases.length) {
    console.error('無效的底圖索引:', index)
    alert('無效的底圖索引')
    return
  }
  
  const canvas = currentPage.value.canvases[index]
  console.log('要刪除的底圖:', canvas)
  
  // CanvasArea 已經做過驗證了，這裡直接刪除
  currentPage.value.canvases.splice(index, 1)
  
  // 清除選擇狀態
  selected.value = { canvas: null, frame: null, element: null }
  
  console.log('刪除後的 canvases:', currentPage.value.canvases.map(c => ({ id: c.id, type: c.type })))
  console.log('===== PageEditor: 底圖刪除完成 =====')
}


const handleAddCanvas = ({ index }) => {
  console.log('===== PageEditor: 收到新增底圖請求 =====')
  console.log('插入位置索引:', index)
  
  // 創建新的空白底圖
  const newCanvas = {
    id: `canvas-${Date.now()}`,
    name: `內容區域 ${index}`,
    type: 'content',
    frames: []
  }
  
  console.log('新建底圖:', newCanvas)
  
  // 插入到指定位置
  currentPage.value.canvases.splice(index, 0, newCanvas)
  
  console.log('新增後的 canvases:', currentPage.value.canvases.map(c => ({ id: c.id, type: c.type })))
  console.log('===== PageEditor: 底圖新增完成 =====')
}

// ==================== 框架操作 ====================
const handleDeleteFrame = ({ canvas, index }) => {
  if (confirm('確定要刪除此框架嗎？')) {
    canvas.frames.splice(index, 1)
    selected.value = { canvas: null, frame: null, element: null }
  }
}

const handleMoveFrame = ({ canvas, index, direction }) => {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= canvas.frames.length) return

  const [frame] = canvas.frames.splice(index, 1)
  canvas.frames.splice(newIndex, 0, frame)
}

// ==================== 元件操作 ====================
const handleDeleteElement = ({ frame, colId }) => {
  if (confirm('確定要刪除此元件嗎？')) {
    delete frame.elements[colId]
    selected.value = { canvas: null, frame: null, element: null }
  }
}

// ==================== 上传处理 ====================
const handleUploadBackground = () => {
  console.log('上传背景图片')
  // TODO: 实现文件上传逻辑
  alert('上传背景功能待实作')
}

const handleUploadImage = () => {
  console.log('上传图片')
  // TODO: 实现文件上传逻辑
  alert('上传图片功能待实作')
}

const handleUploadCarousel = () => {
  console.log('上传轮播图片')
  // TODO: 实现文件上传逻辑
  alert('上传轮播图片功能待实作')
}

// ==================== 工具列操作 ====================
const handleSettings = () => {
  console.log('打開設定')
  alert('設定功能待實作')
}

const handleSelectTemplate = () => {
  console.log('選擇模板')
  alert('選擇模板功能待實作')
}

const handleUpgrade = () => {
  console.log('升級方案')
  router.push('/pricing-plans')
}

const handlePreview = () => {
  console.log('預覽網站')
  emit('preview', {
    pageId: currentPageId.value,
    data: currentPage.value
  })
  alert('預覽功能待實作')
}

const handleSave = () => {
  console.log('儲存草稿', pageData.value)
  emit('save', {
    pageId: currentPageId.value,
    data: pageData.value
  })
  alert('儲存成功！')
}

const handleDelete = () => {
  if (confirm('確定要刪除此草稿嗎？此操作無法復原！')) {
    console.log('刪除草稿')
    alert('刪除草稿功能待實作')
  }
}

const handleGoToWebsite = () => {
  console.log('前往網站')
  // 這裡可以打開新視窗前往已發布的網站
  alert('前往網站功能待實作')
}

const handlePublish = () => {
  if (confirm('確定要發布網站嗎？')) {
    console.log('發布網站', pageData.value)
    emit('publish', {
      data: pageData.value
    })
    alert('網站已發布！')
  }
}

// ==================== 對外方法 ====================
// 獲取所有頁面資料
const getAllData = () => {
  return pageData.value
}

// 獲取當前頁面資料
const getCurrentPageData = () => {
  return currentPage.value
}

// 設置頁面資料
const setPageData = (data) => {
  pageData.value = data
}

// 切換頁面
const switchPage = (pageId) => {
  currentPageId.value = pageId
}
// 處理底圖移動
const handleMoveCanvas = ({ fromIndex, toIndex, direction }) => {
  console.log('===== PageEditor: 收到移動底圖請求 =====')
  console.log('從索引:', fromIndex, '到索引:', toIndex)
  console.log('方向:', direction)
  
  const canvases = currentPage.value.canvases
  
  // 驗證索引
  if (fromIndex < 0 || fromIndex >= canvases.length) {
    console.error('無效的起始索引:', fromIndex)
    return
  }
  
  if (toIndex < 0 || toIndex >= canvases.length) {
    console.error('無效的目標索引:', toIndex)
    return
  }
  
  // 取出要移動的底圖
  const [movedCanvas] = canvases.splice(fromIndex, 1)
  
  // 插入到新位置
  canvases.splice(toIndex, 0, movedCanvas)
  
  console.log('移動後的 canvases:', canvases.map(c => ({ id: c.id, type: c.type })))
  console.log('===== PageEditor: 底圖移動完成 =====')
}

// 暴露方法給父組件
defineExpose({
  getAllData,
  getCurrentPageData,
  setPageData,
  switchPage
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.temple-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
  background: #f5f5f5;
  overflow: hidden;
}

/* ========== 頂部工具列 ========== */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #e5e5e5;
  margin: 0 4px;
}

.page-select {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  cursor: pointer;
  background: #fff;
  color: #333;
}

.page-select:focus {
  border-color: #E8572A;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn:hover {
  background: #f5f5f5;
}

.btn-icon {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-primary {
  background: #E8572A;
  color: #fff;
  border-color: #E8572A;
}

.btn-primary:hover {
  background: #d14a1f;
}

.btn-secondary {
  background: #fff;
  color: #E8572A;
  border-color: #E8572A;
}

.btn-secondary:hover {
  background: #fff5f2;
}

.btn-danger {
  color: #dc3545;
  border-color: #ddd;
}

.btn-danger:hover {
  background: #fff5f5;
  border-color: #dc3545;
}

/* ========== 主要內容區 ========== */
.editor-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  width: 100%;
  height: calc(100vh - 60px); /* 扣除頂部工具列高度 */
}

</style>
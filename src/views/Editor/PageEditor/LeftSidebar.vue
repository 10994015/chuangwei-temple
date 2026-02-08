<template>
  <aside class="sidebar-left">
    <!-- 標題 -->
    <div class="sidebar-header">
      <h3>元件庫</h3>
    </div>

    <!-- 標籤切換 -->
    <div class="tabs">
      <button
        :class="['tab', { active: activeTab === 'system-frames' }]"
        @click="activeTab = 'system-frames'"
      >
        系統框架
      </button>
      <button
        :class="['tab', { active: activeTab === 'custom-frames' }]"
        @click="activeTab = 'custom-frames'"
      >
        自訂框架
      </button>
      <button
        :class="['tab', { active: activeTab === 'elements' }]"
        @click="activeTab = 'elements'"
      >
        元件
      </button>
    </div>

    <!-- 標籤內容 -->
    <div class="tab-content">
      <!-- 系統框架列表 -->
      <div v-show="activeTab === 'system-frames'" class="tab-panel">
        <!-- 首頁區塊 -->
        <div class="section">
          <h4 class="section-title">首頁區塊</h4>
          <div class="system-frame-list">
            <div
              v-for="frame in indexFrames"
              :key="frame.id"
              class="system-frame-card"
              draggable="true"
              @dragstart="handleDragStart($event, frame)"
            >
              <div class="system-frame-preview">
                <div class="preview-label">{{ frame.label }}</div>
              </div>
              <span class="system-frame-name">{{ frame.name }}</span>
            </div>
          </div>
        </div>

        <!-- 列表頁 -->
        <div class="section">
          <h4 class="section-title">列表頁</h4>
          <div class="system-frame-list">
            <div
              v-for="frame in listFrames"
              :key="frame.id"
              class="system-frame-card"
              draggable="true"
              @dragstart="handleDragStart($event, frame)"
            >
              <div class="system-frame-preview">
                <div class="preview-label">{{ frame.label }}</div>
              </div>
              <span class="system-frame-name">{{ frame.name }}</span>
            </div>
          </div>
        </div>

        <!-- 其他 -->
        <div class="section">
          <h4 class="section-title">其他</h4>
          <div class="system-frame-list">
            <div
              v-for="frame in otherFrames"
              :key="frame.id"
              class="system-frame-card"
              draggable="true"
              @dragstart="handleDragStart($event, frame)"
            >
              <div class="system-frame-preview">
                <div class="preview-label">{{ frame.label }}</div>
              </div>
              <span class="system-frame-name">{{ frame.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 自訂框架列表 -->
      <div v-show="activeTab === 'custom-frames'" class="tab-panel">
        <!-- 單層框架 -->
        <div class="section">
          <h4 class="section-title">單層框架</h4>
          <div class="frame-list">
            <div
              v-for="frame in singleFrames"
              :key="frame.id"
              class="frame-card"
              draggable="true"
              @dragstart="handleDragStart($event, frame)"
            >
              <div class="frame-preview" :class="`layout-${frame.layout}`">
                <div
                  v-for="col in frame.columns"
                  :key="col.id"
                  class="frame-col"
                ></div>
              </div>
              <span class="frame-name">{{ frame.name }}</span>
            </div>
          </div>
        </div>

        <!-- 雙層框架 -->
        <div class="section">
          <h4 class="section-title">雙層框架</h4>
          <div class="frame-list">
            <div
              v-for="frame in doubleFrames"
              :key="frame.id"
              class="frame-card"
              draggable="true"
              @dragstart="handleDragStart($event, frame)"
            >
              <div class="frame-preview" :class="`layout-${frame.layout}`">
                <div
                  v-for="col in frame.columns"
                  :key="col.id"
                  class="frame-col"
                ></div>
              </div>
              <span class="frame-name">{{ frame.name }}</span>
            </div>
          </div>
        </div>

        <!-- 複合框架 -->
        <div class="section">
          <h4 class="section-title">複合框架</h4>
          <div class="frame-list">
            <div
              v-for="frame in complexFrames"
              :key="frame.id"
              class="frame-card"
              draggable="true"
              @dragstart="handleDragStart($event, frame)"
            >
              <div class="frame-preview" :class="`layout-${frame.layout}`">
                <div
                  v-for="col in frame.columns"
                  :key="col.id"
                  class="frame-col"
                  :class="`span-${col.span}`"
                ></div>
              </div>
              <span class="frame-name">{{ frame.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 元件列表 -->
      <div v-show="activeTab === 'elements'" class="tab-panel">
        <div class="section">
          <h4 class="section-title">基本元件</h4>
          <div class="element-list">
            <div
              v-for="element in elements"
              :key="element.id"
              class="element-card"
              draggable="true"
              @dragstart="handleDragStart($event, element)"
            >
              <div class="element-icon" :style="{ backgroundColor: element.color }">
                {{ element.icon }}
              </div>
              <span class="element-name">{{ element.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'

// ==================== Props & Emits ====================
const emit = defineEmits(['drag-start'])

// ==================== 狀態 ====================
const activeTab = ref('system-frames')

// ==================== 系統框架 ====================

// 首頁區塊
const indexFrames = ref([
  {
    id: 'sys-carousel',
    name: '輪播牆',
    label: 'CAROUSEL_WALL',
    type: 'CAROUSEL_WALL',
    dragType: 'system-frame',
    component: 'HeroBasemap'
  },
  {
    id: 'sys-first-picture',
    name: '首圖',
    label: 'FIRST_PICTURE',
    type: 'FIRST_PICTURE',
    dragType: 'system-frame',
    component: 'HeroBasemap'
  },
  {
    id: 'sys-index-news',
    name: '首頁-最新消息',
    label: 'INDEX_NEWS',
    type: 'INDEX_NEWS',
    dragType: 'system-frame',
    component: 'NewsBasemap'
  },
  {
    id: 'sys-index-product',
    name: '首頁-商品標幅',
    label: 'INDEX_PRODUCT',
    type: 'INDEX_PRODUCT',
    dragType: 'system-frame',
    component: 'ProductsBasemap'
  },
  {
    id: 'sys-index-event',
    name: '首頁-活動橫幅',
    label: 'INDEX_EVENT',
    type: 'INDEX_EVENT',
    dragType: 'system-frame',
    component: 'EventsBasemap'
  },
  {
    id: 'sys-index-donation',
    name: '首頁-捐獻區',
    label: 'INDEX_DONATION',
    type: 'INDEX_DONATION',
    dragType: 'system-frame',
    component: 'DonationBasemap'
  }
])

// 列表頁
const listFrames = ref([
  {
    id: 'sys-product-list',
    name: '商品列表',
    label: 'PRODUCT_LIST',
    type: 'PRODUCT_LIST',
    dragType: 'system-frame',
    component: 'ProductsBasemap'
  },
  {
    id: 'sys-news-list',
    name: '消息列表',
    label: 'NEWS_LIST',
    type: 'NEWS_LIST',
    dragType: 'system-frame',
    component: 'NewsBasemap'
  },
  {
    id: 'sys-album-list',
    name: '相簿列表',
    label: 'ALBUM_LIST',
    type: 'ALBUM_LIST',
    dragType: 'system-frame',
    component: 'AlbumListBasemap'
  },
  {
    id: 'sys-event-list',
    name: '活動列表',
    label: 'EVENT_LIST',
    type: 'EVENT_LIST',
    dragType: 'system-frame',
    component: 'EventsBasemap'
  }
])

// 其他
const otherFrames = ref([
  {
    id: 'sys-donation-product',
    name: '捐款商品',
    label: 'DONATION_PRODUCT',
    type: 'DONATION_PRODUCT',
    dragType: 'system-frame',
    component: 'DonationBasemap'
  },
  {
    id: 'sys-bright-lamp',
    name: '光明燈',
    label: 'BRIGHT_LAMP',
    type: 'BRIGHT_LAMP',
    dragType: 'system-frame',
    component: 'AboutBasemap'
  }
])

// ==================== 自訂框架 ====================

// ✅ 單層框架 - 使用底線格式
const singleFrames = ref([
  {
    id: 'frame-1-1',
    name: '單層 1-1',
    layout: '1_1',  // ✅ 改用底線
    dragType: 'custom-frame',
    columns: [{ id: 'col-1', span: 'normal' }]
  },
  {
    id: 'frame-1-2',
    name: '單層 1-2',
    layout: '1_2',  // ✅ 改用底線
    dragType: 'custom-frame',
    columns: [
      { id: 'col-1', span: 'normal' },
      { id: 'col-2', span: 'normal' }
    ]
  },
  {
    id: 'frame-1-3',
    name: '單層 1-3',
    layout: '1_3',  // ✅ 改用底線
    dragType: 'custom-frame',
    columns: [
      { id: 'col-1', span: 'normal' },
      { id: 'col-2', span: 'normal' },
      { id: 'col-3', span: 'normal' }
    ]
  },
  {
    id: 'frame-1-4',
    name: '單層 1-4',
    layout: '1_4',  // ✅ 改用底線
    dragType: 'custom-frame',
    columns: [
      { id: 'col-1', span: 'normal' },
      { id: 'col-2', span: 'normal' },
      { id: 'col-3', span: 'normal' },
      { id: 'col-4', span: 'normal' }
    ]
  }
])

// ✅ 雙層框架 - 使用底線格式
const doubleFrames = ref([
  {
    id: 'frame-2-2',
    name: '雙層 2-2',
    layout: '2_2',  // ✅ 改用底線
    dragType: 'custom-frame',
    columns: [
      { id: 'col-1', span: 'normal' },
      { id: 'col-2', span: 'normal' },
      { id: 'col-3', span: 'normal' },
      { id: 'col-4', span: 'normal' }
    ]
  },
  {
    id: 'frame-2-3',
    name: '雙層 2-3',
    layout: '2_3',  // ✅ 改用底線
    dragType: 'custom-frame',
    columns: [
      { id: 'col-1', span: 'normal' },
      { id: 'col-2', span: 'normal' },
      { id: 'col-3', span: 'normal' },
      { id: 'col-4', span: 'normal' },
      { id: 'col-5', span: 'normal' },
      { id: 'col-6', span: 'normal' }
    ]
  },
  {
    id: 'frame-2-4',
    name: '雙層 2-4',
    layout: '2_4',  // ✅ 改用底線
    dragType: 'custom-frame',
    columns: [
      { id: 'col-1', span: 'normal' },
      { id: 'col-2', span: 'normal' },
      { id: 'col-3', span: 'normal' },
      { id: 'col-4', span: 'normal' },
      { id: 'col-5', span: 'normal' },
      { id: 'col-6', span: 'normal' },
      { id: 'col-7', span: 'normal' },
      { id: 'col-8', span: 'normal' }
    ]
  }
])

// ✅ 複合框架 - 使用大寫字母
const complexFrames = ref([
  {
    id: 'frame-a',
    name: '複合 A',
    layout: 'A',  // ✅ 大寫字母
    dragType: 'custom-frame',
    columns: [
      { id: 'col-1', span: 'large' },
      { id: 'col-2', span: 'small' },
      { id: 'col-3', span: 'small' }
    ]
  },
  {
    id: 'frame-b',
    name: '複合 B',
    layout: 'B',  // ✅ 大寫字母
    dragType: 'custom-frame',
    columns: [
      { id: 'col-1', span: 'small' },
      { id: 'col-2', span: 'small' },
      { id: 'col-3', span: 'large' }
    ]
  },
  {
    id: 'frame-c',
    name: '複合 C',
    layout: 'C',  // ✅ 大寫字母
    dragType: 'custom-frame',
    columns: [
      { id: 'col-1', span: 'large' },
      { id: 'col-2', span: 'small' },
      { id: 'col-3', span: 'small' },
      { id: 'col-4', span: 'small' }
    ]
  },
  {
    id: 'frame-d',
    name: '複合 D',
    layout: 'D',  // ✅ 大寫字母
    dragType: 'custom-frame',
    columns: [
      { id: 'col-1', span: 'small' },
      { id: 'col-2', span: 'small' },
      { id: 'col-3', span: 'small' },
      { id: 'col-4', span: 'large' }
    ]
  }
])

// ==================== 元件列表 ====================
const elements = ref([
  { id: 'text', name: '文字', icon: 'T', color: '#3b82f6', type: 'text', dragType: 'element' },
  { id: 'image', name: '圖片', icon: '🖼️', color: '#f59e0b', type: 'image', dragType: 'element' },
  { id: 'button', name: '按鈕', icon: '▭', color: '#10b981', type: 'button', dragType: 'element' },
  { id: 'h-line', name: '橫線', icon: '─', color: '#6b7280', type: 'h-line', dragType: 'element' },
  { id: 'v-line', name: '直線', icon: '│', color: '#6b7280', type: 'v-line', dragType: 'element' },
  { id: 'carousel', name: '輪播圖片', icon: '🎠', color: '#ec4899', type: 'carousel', dragType: 'element' },
  { id: 'map', name: 'Google地圖', icon: '🗺️', color: '#06b6d4', type: 'map', dragType: 'element' },
  { id: 'album', name: '相簿預覽', icon: '📷', color: '#8b5cf6', type: 'album', dragType: 'element' }
])

// ==================== 方法 ====================
const handleDragStart = (event, item) => {
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData(
    'application/json',
    JSON.stringify(item)
  )
  
  // 發送事件給父組件
  emit('drag-start', { event, item, type: item.dragType })
}
</script>

<style scoped>
/* 樣式保持不變，只更新 layout class 名稱 */
.sidebar-left {
  width: 280px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e5e5e5;
  flex-shrink: 0;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e5e5e5;
  background: #fafafa;
  flex-shrink: 0;
}

.tab {
  flex: 1;
  padding: 12px 8px;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.tab:hover {
  background: #fff;
  color: #333;
}

.tab.active {
  background: #fff;
  color: #E8572A;
  font-weight: 600;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #E8572A;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.tab-panel {
  padding: 20px;
}

.section {
  margin-bottom: 24px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.system-frame-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.system-frame-card {
  padding: 12px;
  background: #f8f8f8;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s;
  user-select: none;
}

.system-frame-card:hover {
  background: #fff;
  border-color: #E8572A;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(232, 87, 42, 0.15);
}

.system-frame-card:active {
  cursor: grabbing;
}

.system-frame-preview {
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.preview-label {
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-align: center;
  padding: 0 8px;
}

.system-frame-name {
  display: block;
  text-align: center;
  font-size: 12px;
  color: #333;
  font-weight: 500;
}

.frame-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.frame-card {
  padding: 12px;
  background: #f8f8f8;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s;
  user-select: none;
}

.frame-card:hover {
  background: #fff;
  border-color: #E8572A;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(232, 87, 42, 0.15);
}

.frame-card:active {
  cursor: grabbing;
}

.frame-preview {
  display: grid;
  gap: 4px;
  height: 50px;
  margin-bottom: 8px;
  padding: 4px;
  background: #fff;
  border-radius: 4px;
}

.frame-col {
  background: rgba(232, 87, 42, 0.2);
  border-radius: 2px;
}

/* ✅ 單層框架 - 使用底線 */
.frame-preview.layout-1_1 {
  grid-template-columns: 1fr;
}

.frame-preview.layout-1_2 {
  grid-template-columns: repeat(2, 1fr);
}

.frame-preview.layout-1_3 {
  grid-template-columns: repeat(3, 1fr);
}

.frame-preview.layout-1_4 {
  grid-template-columns: repeat(4, 1fr);
}

/* ✅ 雙層框架 - 使用底線 */
.frame-preview.layout-2_2 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.frame-preview.layout-2_3 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.frame-preview.layout-2_4 {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

/* ✅ 複合框架 - 使用大寫字母 */
.frame-preview.layout-A {
  grid-template-columns: 2fr 1fr;
  grid-template-rows: repeat(2, 1fr);
}

.frame-preview.layout-A .frame-col:nth-child(1) {
  grid-row: 1 / 3;
}

.frame-preview.layout-A .frame-col:nth-child(2) {
  grid-column: 2;
  grid-row: 1;
}

.frame-preview.layout-A .frame-col:nth-child(3) {
  grid-column: 2;
  grid-row: 2;
}

.frame-preview.layout-B {
  grid-template-columns: 1fr 2fr;
  grid-template-rows: repeat(2, 1fr);
}

.frame-preview.layout-B .frame-col:nth-child(1) {
  grid-column: 1;
  grid-row: 1;
}

.frame-preview.layout-B .frame-col:nth-child(2) {
  grid-column: 1;
  grid-row: 2;
}

.frame-preview.layout-B .frame-col:nth-child(3) {
  grid-column: 2;
  grid-row: 1 / 3;
}

.frame-preview.layout-C {
  grid-template-columns: 2fr 1fr;
  grid-template-rows: repeat(3, 1fr);
}

.frame-preview.layout-C .frame-col:nth-child(1) {
  grid-column: 1;
  grid-row: 1 / 4;
}

.frame-preview.layout-C .frame-col:nth-child(2) {
  grid-column: 2;
  grid-row: 1;
}

.frame-preview.layout-C .frame-col:nth-child(3) {
  grid-column: 2;
  grid-row: 2;
}

.frame-preview.layout-C .frame-col:nth-child(4) {
  grid-column: 2;
  grid-row: 3;
}

.frame-preview.layout-D {
  grid-template-columns: 1fr 2fr;
  grid-template-rows: repeat(3, 1fr);
}

.frame-preview.layout-D .frame-col:nth-child(1) {
  grid-column: 1;
  grid-row: 1;
}

.frame-preview.layout-D .frame-col:nth-child(2) {
  grid-column: 1;
  grid-row: 2;
}

.frame-preview.layout-D .frame-col:nth-child(3) {
  grid-column: 1;
  grid-row: 3;
}

.frame-preview.layout-D .frame-col:nth-child(4) {
  grid-column: 2;
  grid-row: 1 / 4;
}

.frame-name {
  display: block;
  text-align: center;
  font-size: 12px;
  color: #333;
  font-weight: 500;
}

.element-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.element-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: #f8f8f8;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s;
  user-select: none;
}

.element-card:hover {
  background: #fff;
  border-color: #E8572A;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(232, 87, 42, 0.15);
}

.element-card:active {
  cursor: grabbing;
}

.element-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 18px;
  color: #fff;
}

.element-name {
  font-size: 12px;
  color: #333;
  font-weight: 500;
}

.tab-content::-webkit-scrollbar {
  width: 6px;
}

.tab-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.tab-content::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.tab-content::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}
</style>
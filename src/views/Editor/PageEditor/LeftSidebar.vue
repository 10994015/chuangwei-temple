<template>
  <aside class="sidebar-left" :class="{ 'is-collapsed': isCollapsed }">

    <!-- 收合按鈕 -->
    <button class="collapse-btn" @click="isCollapsed = !isCollapsed" :title="isCollapsed ? t('leftSidebar.expand') : t('leftSidebar.collapse')">
      <svg class="collapse-icon" :class="{ 'is-flipped': isCollapsed }"
        width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2.5"
        stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>

    <!-- 收合時的垂直標題 -->
    <div v-if="isCollapsed" class="collapsed-label">{{ t('leftSidebar.componentLibrary') }}</div>

    <!-- 展開時的完整內容 -->
    <template v-else>
      <!-- 標題 -->
      <div class="sidebar-header">
        <h3>{{ t('leftSidebar.componentLibrary') }}</h3>
      </div>

      <!-- 標籤切換 -->
      <div class="tabs">
        <button
          :class="['tab', { active: activeTab === 'system-frames' }]"
          @click="activeTab = 'system-frames'"
        >
          {{ t('leftSidebar.tabSystemFrames') }}
        </button>
        <button
          :class="['tab', { active: activeTab === 'custom-frames' }]"
          @click="activeTab = 'custom-frames'"
        >
          {{ t('leftSidebar.tabCustomFrames') }}
        </button>
        <button
          :class="['tab', { active: activeTab === 'elements' }]"
          @click="activeTab = 'elements'"
        >
          {{ t('leftSidebar.tabElements') }}
        </button>
      </div>

      <!-- 標籤內容 -->
      <div class="tab-content">
        <!-- 系統框架列表 -->
        <div v-show="activeTab === 'system-frames'" class="tab-panel">
          <!-- ✅ 載入中 -->
          <div v-if="isLoadingSystemFrames" class="loading-state">
            <div class="loading-spinner">{{ t('leftSidebar.loading') }}</div>
          </div>

          <!-- ✅ 載入失敗 -->
          <div v-else-if="systemFramesError" class="error-state">
            <p class="error-text">⚠️ {{ systemFramesError }}</p>
            <button @click="loadSystemFrames" class="retry-btn">{{ t('leftSidebar.retry') }}</button>
          </div>

          <!-- ✅ 沒有可用框架 -->
          <div v-else-if="!availableSystemFrames || availableSystemFrames.length === 0" class="empty-state">
            <p>{{ t('leftSidebar.noSystemFrames') }}</p>
          </div>

          <!-- ✅ 顯示系統框架 -->
          <div v-else class="system-frames-container">
            <div class="section">
              <div class="system-frame-list">
                <div
                  v-for="frameType in availableSystemFrames"
                  :key="`${pageEditorStore.currentPageSlug}-${frameType}`"
                  class="system-frame-card"
                  draggable="true"
                  @dragstart="handleDragStart($event, createSystemFrameData(frameType))"
                >
                  <div class="system-frame-preview">
                    <div class="preview-label">{{ frameType }}</div>
                  </div>
                  <span class="system-frame-name">{{ getFrameDisplayName(frameType) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 自訂框架列表 -->
        <div v-show="activeTab === 'custom-frames'" class="tab-panel">
          <!-- 單層框架 -->
          <div class="section">
            <h4 class="section-title">{{ t('leftSidebar.sectionSingle') }}</h4>
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
            <h4 class="section-title">{{ t('leftSidebar.sectionDouble') }}</h4>
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
            <h4 class="section-title">{{ t('leftSidebar.sectionComplex') }}</h4>
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
            <h4 class="section-title">{{ t('leftSidebar.sectionBasic') }}</h4>
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
    </template>
  </aside>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

// ==================== Props & Emits ====================
const emit = defineEmits(['drag-start'])

// ==================== ✅ 從父組件注入 Store ====================
const pageEditorStore = inject('pageEditorStore')

// ==================== 收合狀態 ====================
const isCollapsed = ref(false)

// ==================== 狀態 ====================
const activeTab = ref('system-frames')

// ✅ 從 Store 獲取系統框架列表 - 使用 computed 確保響應式
const availableSystemFrames = computed(() => {
  const frames = pageEditorStore.currentPageSystemFrames
  console.log('🔄 LeftSidebar computed 更新:', {
    slug: pageEditorStore.currentPageSlug,
    frames: frames,
    count: frames?.length || 0
  })
  return frames || []
})

const isLoadingSystemFrames = computed(() => pageEditorStore.isLoading)
const systemFramesError = computed(() => pageEditorStore.error)

// ✅ 監聽當前頁面 slug 變化
watch(
  () => pageEditorStore.currentPageSlug,
  (newSlug, oldSlug) => {
    console.log('🔄 LeftSidebar 檢測到頁面切換:', {
      from: oldSlug,
      to: newSlug,
      frames: pageEditorStore.currentPageSystemFrames
    })
  },
  { immediate: true }
)

// ✅ 監聽系統框架變化
watch(
  () => pageEditorStore.currentPageSystemFrames,
  (newFrames) => {
    console.log('🔄 LeftSidebar 檢測到系統框架更新:', {
      slug: pageEditorStore.currentPageSlug,
      frames: newFrames,
      count: newFrames?.length || 0
    })
  },
  { immediate: true, deep: true }
)

// ✅ 獲取框架顯示名稱
const frameDisplayKeyMap = {
  'CAROUSEL_WALL':    'leftSidebar.frameCarouselWall',
  'FIRST_PICTURE':    'leftSidebar.frameFirstPicture',
  'INDEX_NEWS':       'leftSidebar.frameIndexNews',
  'INDEX_PRODUCT':    'leftSidebar.frameIndexProduct',
  'INDEX_EVENT':      'leftSidebar.frameIndexEvent',
  'INDEX_DONATION':   'leftSidebar.frameIndexDonation',
  'PRODUCT_LIST':     'leftSidebar.frameProductList',
  'NEWS_LIST':        'leftSidebar.frameNewsList',
  'ALBUM_LIST':       'leftSidebar.frameAlbumList',
  'EVENT_LIST':       'leftSidebar.frameEventList',
  'DONATION_PRODUCT': 'leftSidebar.frameDonationProduct',
  'BRIGHT_LAMP':      'leftSidebar.frameBrightLamp',
}
const getFrameDisplayName = (frameType) => {
  return frameDisplayKeyMap[frameType] ? t(frameDisplayKeyMap[frameType]) : frameType
}
const systemFrameDefaults = {
  'INDEX_DONATION': {
    donationTitle: '捐款護持',
    donationBrief: '您的捐款將用於宮廟維護與慈善公益\n支持本宮日常運作、建設修繕及幫助弱勢族群\n每一分善款都將妥善運用 功德無量',
    donationButtonText: '前往捐款 ›',
    donationButtonLink: '',
  },
  // 之後其他系統框架有需要也可以在這裡加
}
// ✅ 創建系統框架拖曳數據
const createSystemFrameData = (frameType) => {
  return {
    id: `sys-${frameType.toLowerCase()}`,
    name: getFrameDisplayName(frameType),
    label: frameType,
    type: frameType,
    dragType: 'system-frame',
    data: systemFrameDefaults[frameType] ?? {},
  }
}

// ✅ 重新載入系統框架
const loadSystemFrames = async () => {
  if (!pageEditorStore.tenantId || !pageEditorStore.currentPageSlug) {
    console.warn('⚠️ 缺少 tenantId 或 currentPageSlug')
    return
  }
  
  console.log('🔄 手動重新載入系統框架')
  await pageEditorStore.fetchSystemFrames(
    pageEditorStore.tenantId,
    pageEditorStore.currentPageSlug
  )
}

// ==================== 自訂框架 ====================

const singleFrames = computed(() => [
  { id: 'frame-1-1', name: t('leftSidebar.single11'), layout: '1_1', dragType: 'custom-frame', columns: [{ id: 'col-1', span: 'normal' }] },
  { id: 'frame-1-2', name: t('leftSidebar.single12'), layout: '1_2', dragType: 'custom-frame', columns: [{ id: 'col-1', span: 'normal' }, { id: 'col-2', span: 'normal' }] },
  { id: 'frame-1-3', name: t('leftSidebar.single13'), layout: '1_3', dragType: 'custom-frame', columns: [{ id: 'col-1', span: 'normal' }, { id: 'col-2', span: 'normal' }, { id: 'col-3', span: 'normal' }] },
  { id: 'frame-1-4', name: t('leftSidebar.single14'), layout: '1_4', dragType: 'custom-frame', columns: [{ id: 'col-1', span: 'normal' }, { id: 'col-2', span: 'normal' }, { id: 'col-3', span: 'normal' }, { id: 'col-4', span: 'normal' }] },
])

const doubleFrames = computed(() => [
  { id: 'frame-2-2', name: t('leftSidebar.double22'), layout: '2_2', dragType: 'custom-frame', columns: [{ id: 'col-1', span: 'normal' }, { id: 'col-2', span: 'normal' }, { id: 'col-3', span: 'normal' }, { id: 'col-4', span: 'normal' }] },
  { id: 'frame-2-3', name: t('leftSidebar.double23'), layout: '2_3', dragType: 'custom-frame', columns: [{ id: 'col-1', span: 'normal' }, { id: 'col-2', span: 'normal' }, { id: 'col-3', span: 'normal' }, { id: 'col-4', span: 'normal' }, { id: 'col-5', span: 'normal' }, { id: 'col-6', span: 'normal' }] },
  { id: 'frame-2-4', name: t('leftSidebar.double24'), layout: '2_4', dragType: 'custom-frame', columns: [{ id: 'col-1', span: 'normal' }, { id: 'col-2', span: 'normal' }, { id: 'col-3', span: 'normal' }, { id: 'col-4', span: 'normal' }, { id: 'col-5', span: 'normal' }, { id: 'col-6', span: 'normal' }, { id: 'col-7', span: 'normal' }, { id: 'col-8', span: 'normal' }] },
])

const complexFrames = computed(() => [
  { id: 'frame-a', name: t('leftSidebar.complexA'), layout: 'A', dragType: 'custom-frame', columns: [{ id: 'col-1', span: 'large' }, { id: 'col-2', span: 'small' }, { id: 'col-3', span: 'small' }] },
  { id: 'frame-b', name: t('leftSidebar.complexB'), layout: 'B', dragType: 'custom-frame', columns: [{ id: 'col-1', span: 'small' }, { id: 'col-2', span: 'small' }, { id: 'col-3', span: 'large' }] },
  { id: 'frame-c', name: t('leftSidebar.complexC'), layout: 'C', dragType: 'custom-frame', columns: [{ id: 'col-1', span: 'large' }, { id: 'col-2', span: 'small' }, { id: 'col-3', span: 'small' }, { id: 'col-4', span: 'small' }] },
  { id: 'frame-d', name: t('leftSidebar.complexD'), layout: 'D', dragType: 'custom-frame', columns: [{ id: 'col-1', span: 'small' }, { id: 'col-2', span: 'small' }, { id: 'col-3', span: 'small' }, { id: 'col-4', span: 'large' }] },
])

// ==================== 元件列表 ====================
const elements = computed(() => [
  { id: 'text',         name: t('leftSidebar.elemText'),        icon: 'T',   color: '#3b82f6', type: 'text',         dragType: 'element' },
  { id: 'image',        name: t('leftSidebar.elemImage'),       icon: '🖼️', color: '#f59e0b', type: 'image',        dragType: 'element' },
  { id: 'button',       name: t('leftSidebar.elemButton'),      icon: '▭',  color: '#10b981', type: 'button',       dragType: 'element' },
  { id: 'h-line',       name: t('leftSidebar.elemHLine'),       icon: '─',  color: '#6b7280', type: 'h-line',       dragType: 'element' },
  { id: 'v-line',       name: t('leftSidebar.elemVLine'),       icon: '│',  color: '#6b7280', type: 'v-line',       dragType: 'element' },
  { id: 'carousel',     name: t('leftSidebar.elemCarousel'),    icon: '🎠', color: '#ec4899', type: 'carousel',     dragType: 'element' },
  { id: 'map',          name: t('leftSidebar.elemMap'),         icon: '🗺️', color: '#06b6d4', type: 'map',          dragType: 'element' },
  { id: 'album',        name: t('leftSidebar.elemAlbum'),       icon: '📷', color: '#8b5cf6', type: 'album',        dragType: 'element' },
  { id: 'product-card', name: t('leftSidebar.elemProductCard'), icon: '🛍️', color: '#f97316', type: 'product-card', dragType: 'element' },
  { id: 'service-card', name: t('leftSidebar.elemServiceCard'), icon: '🙏', color: '#14b8a6', type: 'service-card', dragType: 'element' },
  { id: 'event-card',   name: t('leftSidebar.elemEventCard'),   icon: '🎉', color: '#a855f7', type: 'event-card',   dragType: 'element' },
])

// ==================== 方法 ====================
const handleDragStart = (event, item) => {
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData(
    'application/json',
    JSON.stringify(item)
  )
  
  emit('drag-start', { event, item, type: item.dragType })
}
</script>

<style scoped>
.sidebar-left {
  width: 280px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  position: relative; /* 新增：讓 collapse-btn absolute 定位相對於此 */
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ===== 新增：收合狀態 ===== */
.sidebar-left.is-collapsed {
  width: 36px;
}

/* ===== 新增：收合按鈕 ===== */
.collapse-btn {
  position: absolute;
  top: 50%;
  right: -20px;
  transform: translateY(-50%);
  z-index: 10;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #e5e5e5;
  background: #fff;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: all 0.2s;
  padding: 0;
  flex-shrink: 0;
}

.collapse-btn:hover {
  background: #E8572A;
  border-color: #E8572A;
  color: #fff;
  box-shadow: 0 4px 12px rgba(232, 87, 42, 0.3);
}

.collapse-icon {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: block;
}

.collapse-icon.is-flipped {
  transform: rotate(180deg);
}

/* ===== 新增：收合時垂直標題 ===== */
.collapsed-label {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 13px;
  font-weight: 600;
  color: #999;
  letter-spacing: 2px;
  margin: auto;
  user-select: none;
  white-space: nowrap;
}

/* ===== 以下全部與原版相同，未做任何修改 ===== */
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

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.loading-spinner {
  font-size: 14px;
  color: #666;
}

.error-text {
  color: #dc3545;
  font-size: 13px;
  margin-bottom: 12px;
}

.retry-btn {
  padding: 6px 16px;
  background: #E8572A;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #d14a1f;
}

.empty-state p {
  color: #999;
  font-size: 13px;
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
  background: #E8572A;
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

.frame-preview.layout-1_1 { grid-template-columns: 1fr; }
.frame-preview.layout-1_2 { grid-template-columns: repeat(2, 1fr); }
.frame-preview.layout-1_3 { grid-template-columns: repeat(3, 1fr); }
.frame-preview.layout-1_4 { grid-template-columns: repeat(4, 1fr); }
.frame-preview.layout-2_2 { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr); }
.frame-preview.layout-2_3 { grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(2, 1fr); }
.frame-preview.layout-2_4 { grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(2, 1fr); }

.frame-preview.layout-A { grid-template-columns: 2fr 1fr; grid-template-rows: repeat(2, 1fr); }
.frame-preview.layout-A .frame-col:nth-child(1) { grid-row: 1 / 3; }
.frame-preview.layout-A .frame-col:nth-child(2) { grid-column: 2; grid-row: 1; }
.frame-preview.layout-A .frame-col:nth-child(3) { grid-column: 2; grid-row: 2; }

.frame-preview.layout-B { grid-template-columns: 1fr 2fr; grid-template-rows: repeat(2, 1fr); }
.frame-preview.layout-B .frame-col:nth-child(1) { grid-column: 1; grid-row: 1; }
.frame-preview.layout-B .frame-col:nth-child(2) { grid-column: 1; grid-row: 2; }
.frame-preview.layout-B .frame-col:nth-child(3) { grid-column: 2; grid-row: 1 / 3; }

.frame-preview.layout-C { grid-template-columns: 2fr 1fr; grid-template-rows: repeat(3, 1fr); }
.frame-preview.layout-C .frame-col:nth-child(1) { grid-column: 1; grid-row: 1 / 4; }
.frame-preview.layout-C .frame-col:nth-child(2) { grid-column: 2; grid-row: 1; }
.frame-preview.layout-C .frame-col:nth-child(3) { grid-column: 2; grid-row: 2; }
.frame-preview.layout-C .frame-col:nth-child(4) { grid-column: 2; grid-row: 3; }

.frame-preview.layout-D { grid-template-columns: 1fr 2fr; grid-template-rows: repeat(3, 1fr); }
.frame-preview.layout-D .frame-col:nth-child(1) { grid-column: 1; grid-row: 1; }
.frame-preview.layout-D .frame-col:nth-child(2) { grid-column: 1; grid-row: 2; }
.frame-preview.layout-D .frame-col:nth-child(3) { grid-column: 1; grid-row: 3; }
.frame-preview.layout-D .frame-col:nth-child(4) { grid-column: 2; grid-row: 1 / 4; }

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

.tab-content::-webkit-scrollbar { width: 6px; }
.tab-content::-webkit-scrollbar-track { background: #f1f1f1; }
.tab-content::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
.tab-content::-webkit-scrollbar-thumb:hover { background: #ccc; }
</style>
<template>
  <div class="lamp-detail-page" :class="`device-${device}`">

    <!-- 頂部導航列 -->
    <div class="page-nav">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        返回上一頁
      </button>
      <h1 class="page-title">{{ pageTitle }}</h1>
      <div class="nav-placeholder"></div>
    </div>

    <!-- 搜尋列 -->
    <div class="search-bar">
      <div class="search-field">
        <label class="search-label">燈柱</label>
        <div class="select-wrapper">
          <select class="search-select" v-model="filterPillar">
            <option value="">請選擇燈柱</option>
            <option v-for="pillar in pillarOptions" :key="pillar.value" :value="pillar.value">
              {{ pillar.label }}
            </option>
          </select>
          <span class="select-arrow">▾</span>
        </div>
      </div>

      <div class="search-field">
        <label class="search-label">燈位編號</label>
        <input
          v-model="filterLampNo"
          class="search-input"
          type="text"
          placeholder="請輸入燈位編號"
        />
      </div>

      <div class="search-field">
        <label class="search-label">姓名</label>
        <input
          v-model="filterName"
          class="search-input"
          type="text"
          placeholder="請輸入您的姓名"
        />
      </div>

      <div class="search-field">
        <label class="search-label">電話</label>
        <input
          v-model="filterPhone"
          class="search-input"
          type="tel"
          placeholder="請輸入您的電話"
        />
      </div>

      <button class="search-btn" @click="handleSearch">搜尋</button>
    </div>

    <!-- 神位 Grid -->
    <div class="lamp-grid">
      <div
        v-for="(lamp, index) in displayLamps"
        :key="lamp.id ?? index"
        class="lamp-cell"
        :class="[`lamp-cell--${lamp.status}`]"
      >
        <!-- CSS 刻的木框外框 -->
        <div class="lamp-outer-frame">
          <div class="lamp-inner">

            <!-- 有神明 -->
            <template v-if="lamp.status === 'occupied'">
              <img
                :src="lamp.imageUrl || '/images/bright-light/god.jpg'"
                :alt="lamp.name || '神明'"
                class="lamp-god-img"
              />
              <!-- 名牌區：疊在圖片底部 -->
              <div class="lamp-nameplate">
                <div class="lamp-name">{{ lamp.name }}</div>
                <div class="lamp-wish">{{ lamp.wish }}</div>
              </div>
            </template>

            <!-- 空位 / 純背景：empty.png -->
            <img
              v-else
              src="/images/bright-light/empty.png"
              alt=""
              class="lamp-empty-img"
              aria-hidden="true"
            />

          </div>
        </div>
      </div>
    </div>

    <!-- 空狀態 -->
    <div v-if="displayLamps.length === 0" class="empty-state">
      <p>查無符合條件的燈位</p>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  lampType:    { type: String, default: '光明燈' },
  pillarLabel: { type: String, default: '1號柱' },
  pillarOptions: {
    type: Array,
    default: () => [
      { value: '1', label: '1號柱' },
      { value: '2', label: '2號柱' },
      { value: '3', label: '3號柱' },
    ]
  },
  lamps: {
    type: Array,
    default: () => [
      { id: 1,  status: 'bg-only',  imageUrl: null, name: null,      wish: null },
      { id: 2,  status: 'occupied', imageUrl: null, name: '林文德',   wish: '身體健康 萬事如意' },
      { id: 3,  status: 'empty',    imageUrl: null, name: null,      wish: null },
      { id: 4,  status: 'occupied', imageUrl: null, name: '陳美珠',   wish: '闔家平安 事業順遂' },
      { id: 5,  status: 'occupied', imageUrl: null, name: '王大明',   wish: '學業進步 金榜題名' },
      { id: 6,  status: 'bg-only',  imageUrl: null, name: null,      wish: null },
      { id: 7,  status: 'occupied', imageUrl: null, name: '張雅婷',   wish: '平安健康 諸事順利' },
      { id: 8,  status: 'empty',    imageUrl: null, name: null,      wish: null },
      { id: 9,  status: 'occupied', imageUrl: null, name: '黃志豪',   wish: '財運亨通 心想事成' },
      { id: 10, status: 'occupied', imageUrl: null, name: '李淑芬',   wish: '身體健康 萬事如意' },
      { id: 11, status: 'empty',    imageUrl: null, name: null,      wish: null },
      { id: 12, status: 'occupied', imageUrl: null, name: '吳建國',   wish: '事業順利 闔家安康' },
      { id: 13, status: 'bg-only',  imageUrl: null, name: null,      wish: null },
      { id: 14, status: 'occupied', imageUrl: null, name: '劉雅琴',   wish: '平安喜樂 萬事如意' },
      { id: 15, status: 'occupied', imageUrl: null, name: '蔡明輝',   wish: '身體健康 財源廣進' },
      { id: 16, status: 'empty',    imageUrl: null, name: null,      wish: null },
    ]
  },
  device: { type: String, default: 'desktop' }
})

const emit = defineEmits(['go-back', 'search'])

const pageTitle = computed(() => `${props.lampType} - ${props.pillarLabel}`)

const filterPillar = ref('')
const filterLampNo = ref('')
const filterName   = ref('')
const filterPhone  = ref('')

const displayLamps = computed(() => props.lamps)

const handleSearch = () => {
  emit('search', {
    pillar: filterPillar.value,
    lampNo: filterLampNo.value,
    name:   filterName.value,
    phone:  filterPhone.value,
  })
}
</script>

<style lang="scss" scoped>

/* ==================== 整體頁面 ==================== */
.lamp-detail-page {
  width: 100%;
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Microsoft JhengHei', sans-serif;
}

/* ==================== 頂部導航 ==================== */
.page-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  border-bottom: 1px solid #e5e5e5;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  font-size: 14px;
  color: #8b6f47;
  cursor: pointer;
  padding: 6px 0;
  transition: color 0.2s;
  white-space: nowrap;

  &:hover { color: #5e4525; }

  svg { flex-shrink: 0; }
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
  text-align: center;
}

.nav-placeholder {
  flex: 0 0 auto;
  min-width: 80px;
}

/* ==================== 搜尋列 ==================== */
.search-bar {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  padding: 20px 32px;
  border-bottom: 1px solid #e5e5e5;
  flex-wrap: wrap;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.search-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 120px;
}

.search-label {
  font-size: 13px;
  font-weight: 500;
  color: #555;
  white-space: nowrap;
}

.select-wrapper {
  position: relative;
}

.search-select {
  width: 100%;
  padding: 9px 32px 9px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  color: #444;
  background: #fff;
  appearance: none;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus { border-color: #8b6f47; }
}

.select-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  color: #888;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  background: #fff;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus { border-color: #8b6f47; }
  &::placeholder { color: #bbb; }
}

.search-btn {
  padding: 9px 28px;
  background: #7a5c38;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
  align-self: flex-end;
  flex-shrink: 0;

  &:hover { background: #5e4525; }
  &:active { background: #4a3318; }
}

/* ==================== 神位 Grid ==================== */
.lamp-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 312px));
  gap: 0;
  padding: 16px 32px 32px;
  background: #fff;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* ==================== 神位格 ==================== */
.lamp-cell {
  position: relative;
  aspect-ratio: 3 / 4;
  width: 100%;
  padding: 6px;
  background: #2a1508;
  box-sizing: border-box;
  cursor: pointer;
  transition: filter 0.2s;

  &:hover { filter: brightness(1.08); }
}

/* 木框外框：深棕色漸層邊框 */
.lamp-outer-frame {
  width: 100%;
  height: 100%;
  position: relative;
  box-sizing: border-box;

  border: 12px solid #5a2d0c;
  border-radius: 4px;
  box-shadow:
    inset 0 0 0 2px #c87820,
    inset 0 0 0 5px #3d1a06,
    0 0 0 1px #3d1a06;

  &::before,
  &::after {
    content: '';
    position: absolute;
    z-index: 5;
  }

  /* 左下角花 */
  &::before {
    bottom: -10px;
    left: -10px;
    width: 32px;
    height: 32px;
    clip-path: polygon(0 100%, 100% 100%, 0 0);
    background: linear-gradient(135deg, #e89830 0%, #8b4a10 50%, #5a2d0c 100%);
  }

  /* 右下角花 */
  &::after {
    bottom: -10px;
    right: -10px;
    width: 32px;
    height: 32px;
    clip-path: polygon(100% 100%, 0 100%, 100% 0);
    background: linear-gradient(225deg, #e89830 0%, #8b4a10 50%, #5a2d0c 100%);
  }
}

/* 內框：神位內容區 */
.lamp-inner {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #1a0a04;
  border-radius: 2px;

  /* 頂部燈光橫槓 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 14px;
    background: linear-gradient(180deg, #5a3010 0%, #2a1404 100%);
    z-index: 4;
    border-bottom: 2px solid #8b5a20;
  }
}

/* 神明圖片：不填滿，保留底部名牌空間 */
.lamp-god-img {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 28%;
  width: 100%;
  height: 72%;
  object-fit: cover;
  object-position: center top;
  display: block;
  z-index: 1;
}

/* 空位圖片填滿 */
.lamp-empty-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  display: block;
  z-index: 1;
}

/* ==================== 名牌區 ==================== */
.lamp-nameplate {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 28%;
  z-index: 3;
  background: linear-gradient(180deg, #0a0402 0%, #100604 100%);
  padding: 10px 10px 12px;
  text-align: center;
  border-top: 2px solid #8b5a20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.lamp-name {
  font-size: 17px;
  font-weight: 700;
  color: #f5d080;
  letter-spacing: 4px;
}

.lamp-wish {
  font-size: 13px;
  color: #c8901c;
  letter-spacing: 2px;
  line-height: 1.5;
}

/* ==================== 空狀態 ==================== */
.empty-state {
  padding: 80px 20px;
  text-align: center;
  color: #999;
  font-size: 15px;
}

/* ==================== 響應式 ==================== */
.lamp-detail-page.device-tablet {
  .page-nav { padding: 14px 20px; }
  .page-title { font-size: 18px; }
  .search-bar { padding: 16px 20px; gap: 12px; }
  .lamp-grid { grid-template-columns: repeat(3, 1fr); padding: 12px 20px 24px; }
  .lamp-name { font-size: 13px; }
  .lamp-wish { font-size: 11px; }
}

.lamp-detail-page.device-mobile {
  .page-nav {
    padding: 12px 16px;
    .page-title { font-size: 15px; }
    .back-btn { font-size: 13px; }
    .nav-placeholder { min-width: 60px; }
  }

  .search-bar {
    padding: 12px 16px;
    gap: 8px;
    max-width: 100%;

    .search-field {
      flex: 1 1 calc(50% - 8px);
      min-width: 0;
    }

    .search-btn {
      flex: 1 1 100%;
      text-align: center;
    }
  }

  .lamp-grid { grid-template-columns: repeat(2, 1fr); padding: 8px 12px 20px; }
  .lamp-cell { padding: 4px; }
  .lamp-name { font-size: 11px; letter-spacing: 1px; }
  .lamp-wish { font-size: 10px; }
  .lamp-nameplate { padding: 5px 6px 7px; gap: 3px; }
  .lamp-outer-frame { border-width: 6px; }
}
</style>
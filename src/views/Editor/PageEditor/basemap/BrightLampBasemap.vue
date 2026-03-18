<template>
  <div class="bright-lamp-wrapper">

    <!-- 搜尋首頁 -->
    <section v-if="!showDetail" class="bright-lamp-section" :class="`device-${device}`">

    <!-- 全幅背景 -->
    <div class="scene">
      <img class="scene__bg" :src="bgSrc" alt="" aria-hidden="true" />

      <!-- 左柱 -->
      <img class="scene__pillar scene__pillar--left"  :src="pillarSrc" alt="" aria-hidden="true" />
      <!-- 右柱 -->
      <img class="scene__pillar scene__pillar--right" :src="pillarSrc" alt="" aria-hidden="true" />

      <!-- 主神像 -->
      <img class="scene__main" :src="mainSrc" alt="主神像" />
    </div>

    <!-- 搜尋面板 -->
    <div class="panel-wrap">
      <div class="panel">
        <!-- 金色邊框圖 -->
        <img class="panel__border" :src="borderSrc" alt="" aria-hidden="true" />

        <!-- 面板內容 -->
        <div class="panel__body">

          <!-- 上排：兩個下拉 -->
          <div class="panel__selects">
            <div class="select-wrapper">
              <select class="panel__select" v-model="selectedLampType">
                <option value="">請選擇燈別</option>
                <option v-for="opt in displayLampTypes" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
              <span class="select-arrow">▾</span>
            </div>
            <div class="select-wrapper">
              <select class="panel__select" v-model="searchMode">
                <option value="name-phone">姓名電話搜尋</option>
                <option value="lamp-no">燈位編號搜尋</option>
              </select>
              <span class="select-arrow">▾</span>
            </div>
          </div>

          <!-- 欄位區：min-height 固定高度避免切換時跳動 -->
          <div class="panel__fields-wrap">

            <!-- 模式一：姓名電話搜尋 -->
            <div v-if="searchMode === 'name-phone'" class="panel__fields">
              <div class="field-group">
                <label class="field-label">{{ t('brightLampBasemap.labelName') }}</label>
                <input
                  v-model="searchName"
                  class="panel__input"
                  type="text"
                  :placeholder="t('brightLampBasemap.placeholderName')"
                />
              </div>
              <div class="field-group">
                <label class="field-label">{{ t('brightLampBasemap.labelPhone') }}</label>
                <div class="input-with-btn">
                  <input
                    v-model="searchPhone"
                    class="panel__input"
                    type="tel"
                    :placeholder="t('brightLampBasemap.placeholderPhone')"
                  />
                  <button class="panel__btn" @click="handleSearch">
                    {{ t('brightLampBasemap.search') }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 模式二：燈位編號搜尋 -->
            <div v-else class="panel__fields">
              <div class="field-group">
                <label class="field-label">{{ t('brightLampBasemap.labelLampNo') }}</label>
                <div class="input-with-btn">
                  <input
                    v-model="searchLampNo"
                    class="panel__input"
                    type="text"
                    :placeholder="t('brightLampBasemap.placeholderLampNo')"
                  />
                  <button class="panel__btn" @click="handleSearch">
                    {{ t('brightLampBasemap.search') }}
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>

    </section>

    <!-- 神位列表頁 -->
    <BrightLampDetailPage
      v-else
      :lamp-type="selectedLampTypeLabel"
      pillar-label="1號柱"
      :device="device"
      @go-back="showDetail = false"
      @search="handleDetailSearch"
    />

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BrightLampDetailPage from './BrightLampDetailPage.vue'

const { t } = useI18n()

const props = defineProps({
  lampTypes:    { type: Array,  default: null },
  bgImgSrc:     { type: String, default: null },
  bgImgId:      { type: String, default: null },
  mainImgSrc:   { type: String, default: null },
  mainImgId:    { type: String, default: null },
  borderOption: { type: String, default: 'border' },
  pillarOption: { type: String, default: 'pillar' },
  device:       { type: String, default: 'desktop' }
})

const displayLampTypes = computed(() =>
  props.lampTypes ?? [
    { value: 'bright', label: t('brightLampBasemap.lampBright') },
    { value: 'peace',  label: t('brightLampBasemap.lampPeace') },
    { value: 'wealth', label: t('brightLampBasemap.lampWealth') },
    { value: 'wisdom', label: t('brightLampBasemap.lampWisdom') },
  ]
)

const bgSrc     = computed(() => props.bgImgSrc   || '/images/bright-light/bg.png')
const mainSrc   = computed(() => props.mainImgSrc || '/images/bright-light/main.jpg')

// 邊框：後端目前只有 border，之後可擴充
const BORDER_OPTIONS = {
  border: '/images/bright-light/border.png',
}
const borderSrc = computed(() => BORDER_OPTIONS[props.borderOption] ?? BORDER_OPTIONS.border)

// 柱子：後端目前只有 pillar，之後可擴充
const PILLAR_OPTIONS = {
  pillar: '/images/bright-light/pillar.png',
}
const pillarSrc = computed(() => PILLAR_OPTIONS[props.pillarOption] ?? PILLAR_OPTIONS.pillar)

const emit = defineEmits([])

const searchMode       = ref('name-phone')
const selectedLampType = ref('')
const searchName       = ref('')
const searchPhone      = ref('')
const searchLampNo     = ref('')

// 頁面切換狀態
const showDetail = ref(false)

const selectedLampTypeLabel = computed(() => {
  const found = displayLampTypes.value.find(t => t.value === selectedLampType.value)
  return found?.label || '光明燈'
})

const handleSearch = () => {
  showDetail.value = true
}

const handleDetailSearch = () => {
  // 預覽模式，不打 API，保持假資料顯示
}
</script>

<style lang="scss" scoped>

/* ==================== 外層包裝 ==================== */
.bright-lamp-wrapper {
  width: 100%;
}

/* ==================== 整體區塊 ==================== */
.bright-lamp-section {
  position: relative;
  width: 100%;
  min-height: 640px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}

/* ==================== 場景圖層 ==================== */
.scene {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 640px;
}

.scene__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  display: block;
}

/* 燈柱：絕對定位，左右對稱，與主神像並排 */
.scene__pillar {
  position: absolute;
  top: 0;
  height: 100%;
  width: auto;
  max-width: 12%;
  object-fit: contain;
  object-position: bottom;
  filter: drop-shadow(0 0 24px rgba(255, 180, 0, 0.4));

  &--left  { left: 22%; }
  &--right { right: 22%; transform: scaleX(-1); }
}

/* 主神像：置中，從頂部向下延伸 */
.scene__main {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 85%;
  width: auto;
  max-width: 36%;
  object-fit: contain;
  object-position: top center;
  display: block;
}

/* ==================== 搜尋面板 ==================== */
.panel-wrap {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 500px;
  padding: 0 16px 0;
  display: flex;
  justify-content: center;
  z-index: 10;
}

.panel {
  position: relative;
  width: 100%;
}

/* border.png 當裝飾框，完全覆蓋面板區域 */
.panel__border {
  position: absolute;
  inset: -10px -16px;
  width: calc(100% + 32px);
  height: calc(100% + 20px);
  object-fit: fill;
  pointer-events: none;
  z-index: 1;
}

.panel__body {
  position: relative;
  z-index: 2;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 4px;
  padding: 24px 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ==================== 下拉列 ==================== */
.panel__selects {
  display: flex;
  gap: 12px;
}

.select-wrapper {
  position: relative;
  flex: 1;
}

.panel__select {
  width: 100%;
  padding: 10px 36px 10px 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  color: #444;
  background: #fff;
  appearance: none;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;

  &:focus { border-color: #8b6f47; }
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #888;
  pointer-events: none;
}

/* ==================== 欄位切換容器 ==================== */
.panel__fields-wrap {
  min-height: 148px; /* 姓名 + 電話兩欄的高度：兩個 field-group(各約 64px) + gap 16px + label 高度 */
}

.panel__fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ==================== 欄位 ==================== */

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: #555;
}

.panel__input {
  width: 100%;
  padding: 10px 14px;
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

/* 電話欄位：input + 搜尋按鈕並排 */
.input-with-btn {
  display: flex;
  gap: 8px;

  .panel__input { flex: 1; }
}

.panel__btn {
  padding: 10px 24px;
  background: #7a5c38;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;

  &:hover { background: #5e4525; }
  &:active { background: #4a3318; }
}

/* ==================== 響應式 ==================== */
.bright-lamp-section.device-tablet {
  min-height: 560px;

  .scene { min-height: 560px; }

  .scene__pillar {
    max-width: 9%;
    &--left  { left: 12%; }
    &--right { right: 12%; }
  }

  .scene__main {
    max-width: 42%;
    height: 78%;
  }

  .panel-wrap { max-width: 460px; }

  .panel__body { padding: 20px 24px 24px; }
}

.bright-lamp-section.device-mobile {
  min-height: 0;
  display: flex;
  flex-direction: column;

  .scene {
    min-height: 0;
    height: 320px;
    flex-shrink: 0;
  }

  .scene__pillar {
    display: none;
  }

  .scene__main {
    height: 100%;
    max-width: 60%;
    object-position: top center;
  }

  .panel-wrap {
    position: relative;
    bottom: auto;
    left: auto;
    transform: none;
    max-width: 100%;
    padding: 0;
    width: 100%;
  }

  .panel__border {
    display: none;
  }

  .panel__body {
    padding: 20px 16px 24px;
    gap: 14px;
    border-radius: 0;
    border-top: 3px solid #8b6f47;
    background: rgba(255, 255, 255, 0.98);
  }

  .panel__selects { flex-direction: column; gap: 8px; }

  .panel__btn { padding: 10px 16px; }

  .panel__fields-wrap { min-height: 130px; }
}
</style>
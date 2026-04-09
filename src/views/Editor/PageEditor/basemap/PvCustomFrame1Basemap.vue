<template>
  <section
    class="pv-cf1"
    :class="[`device-${device}`, { 'is-edit-mode': isEditMode }]"
    @click="isEditMode && emit('select-frame', frame)"
  >
    <div class="pv-cf1-container">
      <div class="pv-cf1-grid">

        <!-- 左側主區 -->
        <div class="pv-cf1-left">

          <!-- Hero 卡片 (item 0) -->
          <div
            class="pv-cf1-card pv-cf1-hero"
            :class="{ 'is-edit-selected': isEditMode && selectedItemIndex === 0 }"
            :style="cardPadStyle0"
            @click.stop="isEditMode && selectItem(0)"
          >
            <div class="pv-cf1-hero-text">
              <h3 class="pv-cf1-title" v-html="item0.title"></h3>
              <div class="pv-cf1-desc" v-html="item0.description"></div>
            </div>
            <div class="pv-cf1-hero-img" :style="imgStyle0">
              <img v-if="item0.image" :src="item0.image" :alt="item0.title" class="pv-cf1-img" />
              <div v-else class="pv-cf1-img-placeholder">
                <span>{{ isEditMode ? '點擊卡片進行編輯' : '' }}</span>
              </div>
            </div>
          </div>

          <!-- 底部兩卡片 (items 2, 3) -->
          <div class="pv-cf1-bottom-row">
            <div
              class="pv-cf1-card pv-cf1-bottom-card"
              :class="{ 'is-edit-selected': isEditMode && selectedItemIndex === 2 }"
              :style="cardPadStyle2"
              @click.stop="isEditMode && selectItem(2)"
            >
              <h3 class="pv-cf1-title" v-html="item2.title"></h3>
              <div class="pv-cf1-desc" v-html="item2.description"></div>
            </div>
            <div
              class="pv-cf1-card pv-cf1-bottom-card"
              :class="{ 'is-edit-selected': isEditMode && selectedItemIndex === 3 }"
              :style="cardPadStyle3"
              @click.stop="isEditMode && selectItem(3)"
            >
              <h3 class="pv-cf1-title" v-html="item3.title"></h3>
              <div class="pv-cf1-desc" v-html="item3.description"></div>
            </div>
          </div>

        </div>

        <!-- 右側高卡片 (item 1) -->
        <div
          class="pv-cf1-card pv-cf1-side"
          :class="{ 'is-edit-selected': isEditMode && selectedItemIndex === 1 }"
          :style="cardPadStyle1"
          @click.stop="isEditMode && selectItem(1)"
        >
          <div class="pv-cf1-side-text">
            <h3 class="pv-cf1-title" v-html="item1.title"></h3>
            <div class="pv-cf1-desc" v-html="item1.description"></div>
          </div>
          <div class="pv-cf1-side-img" :style="imgStyle1">
            <img v-if="item1.image" :src="item1.image" :alt="item1.title" class="pv-cf1-img" />
            <div v-else class="pv-cf1-img-placeholder pv-cf1-img-placeholder--side">
              <span>{{ isEditMode ? '點擊卡片進行編輯' : '' }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive } from 'vue'

const props = defineProps({
  items:           { type: Array,   default: () => [] },
  device:          { type: String,  default: 'desktop' },
  isEditMode:      { type: Boolean, default: false },
  frame:           { type: Object,  default: null },
  selectedElement: { type: Object,  default: null },
})

const emit = defineEmits(['select-element', 'select-frame'])

// 從 selectedElement 推算目前選中的 item index
const selectedItemIndex = computed(() => {
  const id = props.selectedElement?.element?.id
  if (!id?.startsWith('cf1-item-')) return -1
  return parseInt(id.replace('cf1-item-', ''), 10)
})

// 點擊卡片 → 建立虛擬元素並 emit select-element
const selectItem = (idx) => {
  const element = reactive({
    type: 'CF1_ITEM',
    id: `cf1-item-${idx}`,
    itemIndex: idx,
  })
  emit('select-element', { element, frame: props.frame })
}

const DEFAULT_ITEMS = [
  { title: '宮廟地圖',   description: '整合全台宮廟資訊，提供地理搜尋、神明分類、活動查詢等多元曝光管道。', image: null, imageId: null },
  { title: '靈籤司',     description: '解籤後智能推薦宮廟，將線上求籤信眾精準導流至實地參拜。',              image: null, imageId: null },
  { title: '主平台服務', description: '匯聚宮廟完整資訊，成為信眾探索文化、查詢活動的一站式入口。',          image: null, imageId: null },
  { title: '宮廟網站建置', description: '協助建置專屬數位門戶，提供客製化功能與獨立經營數位社群能力。',      image: null, imageId: null },
]

const getItem = (index) => computed(() => {
  const src = props.items?.[index]
  const def = DEFAULT_ITEMS[index]
  if (!src) return def
  return { ...def, ...src }
})

const item0 = getItem(0)
const item1 = getItem(1)
const item2 = getItem(2)
const item3 = getItem(3)

const CF1_DEVICE_KEY = { desktop: 'pc', tablet: 'tablet', mobile: 'phone' }

const getCardPadStyle = (item) => computed(() => {
  const key = CF1_DEVICE_KEY[props.device] || 'pc'
  const p = item.value.padding?.[key]
  if (!p) return {}
  const { top = 0, right = 0, bottom = 0, left = 0 } = p
  if (!top && !right && !bottom && !left) return {}
  return { padding: `${top}px ${right}px ${bottom}px ${left}px` }
})

const cardPadStyle0 = getCardPadStyle(item0)
const cardPadStyle1 = getCardPadStyle(item1)
const cardPadStyle2 = getCardPadStyle(item2)
const cardPadStyle3 = getCardPadStyle(item3)

const getImgStyle = (item) => computed(() => {
  const style = {}
  if (item.value.imageWidth)                style.width        = item.value.imageWidth + 'px'
  if (item.value.imageHeight)               style.height       = item.value.imageHeight + 'px'
  if (item.value.imageBorderRadius != null) style.borderRadius = item.value.imageBorderRadius + 'px'
  if (item.value.imageBorderWidth)          style.border       = `${item.value.imageBorderWidth}px solid ${item.value.imageBorderColor || '#000000'}`
  return style
})

const imgStyle0 = getImgStyle(item0)
const imgStyle1 = getImgStyle(item1)
</script>

<style lang="scss" scoped>
.pv-cf1 {
  padding: 3rem 0 4rem;
  background: transparent;
}

.pv-cf1-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

.pv-cf1-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 20px;
  align-items: stretch;
}

.pv-cf1-left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// 卡片基底
.pv-cf1-card {
  background: var(--frame-card-bg, #fff);
  border: 1px solid var(--frame-border-color, #eee);
  border-radius: 16px;
  overflow: hidden;
  outline: 2px solid transparent;
  outline-offset: 2px;
  transition: outline-color 0.15s;

  .pv-cf1.is-edit-mode & {
    cursor: pointer;

    &:hover {
      outline-color: rgba(232, 87, 42, 0.4);
    }

    &.is-edit-selected {
      outline-color: #E8572A;
    }
  }
}

// Hero 卡片：左文右圖
.pv-cf1-hero {
  display: flex;
  align-items: center;
  padding: 2rem 2.5rem;
  gap: 2rem;
  flex: 1;

  .pv-cf1-hero-text {
    flex: 1;
    min-width: 0;
  }

  .pv-cf1-hero-img {
    flex-shrink: 0;
    width: 260px;
    height: 200px;
    overflow: hidden;
  }
}

// 底部兩卡並排
.pv-cf1-bottom-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.pv-cf1-bottom-card {
  padding: 2rem 2rem;
}

// 右側高卡片
.pv-cf1-side {
  display: flex;
  flex-direction: column;

  .pv-cf1-side-text {
    padding: 1.5rem 1.5rem 1rem;
  }

  .pv-cf1-side-img {
    flex: 1;
    min-height: 200px;
    overflow: hidden;
  }
}

// 文字
.pv-cf1-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--frame-heading-color, #222);
  margin: 0 0 10px;
  line-height: 1.3;
}

.pv-cf1-desc {
  font-size: 14px;
  color: var(--frame-text-muted, #666);
  margin: 0;
  line-height: 1.7;
}

// 圖片
.pv-cf1-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.pv-cf1-img-placeholder {
  width: 100%;
  height: 100%;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--frame-tag-bg, #f5f5f5);
  border-radius: 8px;

  span {
    font-size: 12px;
    color: var(--frame-text-muted, #bbb);
    text-align: center;
    padding: 0 12px;
  }

  &--side {
    border-radius: 0 0 16px 16px;
    min-height: 200px;
  }
}

// 響應式 - 平板
.pv-cf1.device-tablet {
  .pv-cf1-container { padding: 0 1.5rem; }

  .pv-cf1-grid {
    grid-template-columns: 1fr 220px;
    gap: 16px;
  }

  .pv-cf1-hero {
    flex-direction: column;
    align-items: flex-start;
    .pv-cf1-hero-img { width: 100%; height: 180px; }
  }
}

// 響應式 - 手機
.pv-cf1.device-mobile {
  padding: 2rem 0 2.5rem;

  .pv-cf1-container { padding: 0 1rem; }

  .pv-cf1-grid {
    grid-template-columns: 1fr;
  }

  .pv-cf1-hero {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.5rem;

    .pv-cf1-hero-img { width: 100%; height: 180px; }
  }

  .pv-cf1-bottom-row {
    grid-template-columns: 1fr;
  }

  .pv-cf1-side {
    flex-direction: row;
    align-items: center;

    .pv-cf1-side-text { flex: 1; }
    .pv-cf1-side-img { width: 120px; height: 120px; flex: none; }
  }

  .pv-cf1-title { font-size: 16px; }
  .pv-cf1-desc  { font-size: 13px; }
}
</style>

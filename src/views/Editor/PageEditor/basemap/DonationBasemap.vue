<template>
  <section
    class="donation-section"
    :style="{ background: backgroundColor }"
  >
    <div class="donation-content">
      <!-- 標題 - 可編輯 -->
      <h2
        class="donation-title"
        :class="{ 'is-editable': isEditMode, 'is-selected': isTitleSelected }"
        @click="isEditMode && handleElementClick('title')"
      >
        {{ currentTitle }}
      </h2>

      <!-- 內文 - 可編輯 -->
      <p
        class="donation-text"
        :class="{ 'is-editable': isEditMode, 'is-selected': isTextSelected }"
        @click="isEditMode && handleElementClick('text')"
      >
        {{ currentText }}
      </p>

      <!-- 按鈕 - 可編輯 -->
      <a
        :href="isEditMode ? '#' : currentButtonLink"
        class="donation-btn"
        :class="{ 'is-editable': isEditMode, 'is-selected': isButtonSelected }"
        @click="isEditMode ? handleElementClick('button', $event) : null"
      >
        {{ currentButtonText }}
      </a>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, watch, ref } from 'vue'

const props = defineProps({
  backgroundColor: {
    type: String,
    default: 'linear-gradient(135deg, #8b7355 0%, #a0826d 100%)'
  },
  isEditMode:    { type: Boolean, default: false },
  frameData:     { type: Object,  default: null },
  frame:         { type: Object,  default: null },
  selectedElement: { type: Object, default: null },
  donationTitle:      { type: String, default: '捐款護持' },
  donationBrief:      { type: String, default: '您的捐款將用於宮廟維護與慈善公益\n支持本宮日常運作、建設修繕及幫助弱勢族群\n每一分善款都將妥善運用 功德無量' },
  donationButtonText: { type: String, default: '前往捐款 ›' },
  donationButtonLink: { type: String, default: '#' },
})

const emit = defineEmits(['select-element'])

// ==================== 取得當前內容 ====================

// 優先從 frame.data 取值，沒有才用 props 預設值
const currentTitle = computed(() => {
  if (props.frame?.data?.donationTitle) return props.frame.data.donationTitle
  return props.donationTitle
})

const currentText = computed(() => {
  if (props.frame?.data?.donationBrief) return props.frame.data.donationBrief
  return props.donationBrief
})

const currentButtonText = computed(() => {
  if (props.frame?.data?.donationButtonText) return props.frame.data.donationButtonText
  return props.donationButtonText
})

const currentButtonLink = computed(() => {
  if (props.frame?.data?.donationButtonLink) return props.frame.data.donationButtonLink
  return props.donationButtonLink
})
// ==================== 選中狀態判斷 ====================

const isTitleSelected = computed(() => {
  return props.selectedElement?.element?.id === 'donationTitle'
})

const isTextSelected = computed(() => {
  return props.selectedElement?.element?.id === 'donationBrief'
})

const isButtonSelected = computed(() => {
  return props.selectedElement?.element?.id === 'donationButtonText'
})

// ==================== 處理點擊 ====================

// 儲存 watcher stop handles，避免重複點擊累積 watcher
let stopHandles = []

const handleElementClick = (elementType, event) => {
  if (event) event.preventDefault()

  stopHandles.forEach(stop => stop())
  stopHandles = []

  if (!props.frame.data) props.frame.data = {}
  const data = props.frame.data
  let element = null

  if (elementType === 'title') {
    element = reactive({
      type: 'TEXT',
      id: 'donationTitle',
      value: { text: data.donationTitle ?? props.donationTitle },
      metadata: {}
    })
    stopHandles.push(
      watch(() => element.value.text, (val) => { props.frame.data.donationTitle = val })
    )

  } else if (elementType === 'text') {
    element = reactive({
      type: 'TEXT',
      id: 'donationBrief',
      value: { text: data.donationBrief ?? props.donationBrief },
      metadata: {}
    })
    stopHandles.push(
      watch(() => element.value.text, (val) => { props.frame.data.donationBrief = val })
    )

  } else if (elementType === 'button') {
    element = reactive({
      type: 'BUTTON',
      id: 'donationButtonText',
      value: {
        text: data.donationButtonText ?? props.donationButtonText,
        url:  data.donationButtonLink  ?? props.donationButtonLink
      },
      metadata: {}
    })
    stopHandles.push(
      watch(() => element.value.text, (val) => { props.frame.data.donationButtonText = val }),
      watch(() => element.value.url,  (val) => { props.frame.data.donationButtonLink = val })
    )
  }

  if (element) {
    emit('select-element', { element, frame: props.frame })
  }
}
</script>

<style lang="scss" scoped>
.donation-section {
  padding: 6rem 0;
  text-align: center;
  color: #fff;
  position: relative;
}

.donation-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.is-editable {
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
  padding: 8px;
  margin: -8px;
  border-radius: 4px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }

  &.is-selected {
    background: rgba(232, 87, 42, 0.15);
    border-color: #E8572A;
    outline: 2px solid #E8572A;
    outline-offset: 2px;
  }
}

.donation-title {
  font-size: 36px;
  font-weight: 500;
  width: 100%;
}

.donation-text {
  font-size: 16px;
  line-height: 1.8;
  opacity: 0.95;
  white-space: pre-line;
  width: 100%;
}

.donation-btn {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid #fff;
  border-radius: 6px;
  color: #fff;
  text-decoration: none;
  font-size: 15px;
  transition: all 0.3s;
  margin-top: 1rem;

  &:not(.is-editable):hover {
    background: #fff;
    color: #8b7355;
  }

  &.is-editable {
    pointer-events: auto;
  }
}
</style>

<template>
  <section
    class="donation-section"
    :style="{ background: backgroundColor }"
    @click.stop="handleSectionClick"
  >
    <div class="donation-content">
      <!-- 標題 -->
      <h2
        class="donation-title"
        :class="{ 'is-editable': isEditMode, 'is-selected': isTitleSelected }"
        @click.stop="isEditMode && handleElementClick('title')"
      >
        <span v-if="isHtml(currentTitle)" v-html="currentTitle"></span>
        <template v-else>{{ currentTitle }}</template>
      </h2>

      <!-- 內文 -->
      <p
        class="donation-text"
        :class="{ 'is-editable': isEditMode, 'is-selected': isTextSelected }"
        @click.stop="isEditMode && handleElementClick('text')"
      >
        <span v-if="isHtml(currentText)" v-html="currentText"></span>
        <template v-else>{{ currentText }}</template>
      </p>

      <!-- 按鈕 -->
      <a
        :href="isEditMode ? '#' : currentButtonLink"
        class="donation-btn"
        :class="{ 'is-editable': isEditMode, 'is-selected': isButtonSelected }"
        @click.stop="isEditMode ? handleElementClick('button', $event) : null"
      >
        {{ currentButtonText }}
      </a>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  backgroundColor:    { type: String,  default: 'linear-gradient(135deg, #8b7355 0%, #a0826d 100%)' },
  isEditMode:         { type: Boolean, default: false },
  frameData:          { type: Object,  default: null },
  frame:              { type: Object,  default: null },
  selectedElement:    { type: Object,  default: null },
  donationTitle:      { type: String,  default: undefined },
  donationBrief:      { type: String,  default: undefined },
  donationButtonText: { type: String,  default: undefined },
  donationButtonLink: { type: String,  default: '#' },
})

const emit = defineEmits(['select-element', 'select-frame'])

// 判斷是否為 HTML 字串（RichTextEditor 輸出的內容）
const isHtml = (str) => typeof str === 'string' && /<[a-z][\s\S]*>/i.test(str)

// ==================== 當前內容 ====================
const currentTitle      = computed(() => props.frame?.data?.donationTitle      ?? props.donationTitle      ?? t('donationBasemap.title'))
const currentText       = computed(() => props.frame?.data?.donationBrief       ?? props.donationBrief       ?? t('donationBasemap.brief'))
const currentButtonText = computed(() => props.frame?.data?.donationButtonText  ?? props.donationButtonText  ?? t('donationBasemap.buttonText'))
const currentButtonLink = computed(() => props.frame?.data?.donationButtonLink  ?? props.donationButtonLink)

// ==================== 選中狀態 ====================
const isTitleSelected  = computed(() => props.selectedElement?.element?.id === 'donationTitle')
const isTextSelected   = computed(() => props.selectedElement?.element?.id === 'donationBrief')
const isButtonSelected = computed(() => props.selectedElement?.element?.id === 'donationButtonText')

// ==================== 點擊處理 ====================

// section 層：編輯模式點擊空白區域 → 選取框架（emit select-frame），
// 非編輯模式不需任何動作，但仍 .stop 防止冒泡到 SystemFrame 容器
const handleSectionClick = () => {
  if (props.isEditMode && props.frame) {
    emit('select-frame', props.frame)
  }
}

let stopHandles = []

const handleElementClick = (elementType, event) => {
  if (event) event.preventDefault()

  // 清除上一次的 watchers
  stopHandles.forEach(stop => stop())
  stopHandles = []

  if (!props.frame.data) props.frame.data = {}
  const data = props.frame.data
  let element = null

  if (elementType === 'title') {
    element = reactive({
      type: 'TEXT', id: 'donationTitle',
      value: { text: data.donationTitle ?? props.donationTitle ?? t('donationBasemap.title') },
      metadata: {}
    })
    stopHandles.push(watch(() => element.value.text, val => { props.frame.data.donationTitle = val }))

  } else if (elementType === 'text') {
    element = reactive({
      type: 'TEXT', id: 'donationBrief',
      value: { text: data.donationBrief ?? props.donationBrief ?? t('donationBasemap.brief') },
      metadata: {}
    })
    stopHandles.push(watch(() => element.value.text, val => { props.frame.data.donationBrief = val }))

  } else if (elementType === 'button') {
    element = reactive({
      type: 'BUTTON', id: 'donationButtonText',
      value: {
        text: data.donationButtonText ?? props.donationButtonText ?? t('donationBasemap.buttonText'),
        url:  data.donationButtonLink ?? props.donationButtonLink,
      },
      metadata: {}
    })
    stopHandles.push(
      watch(() => element.value.text, val => { props.frame.data.donationButtonText = val }),
      watch(() => element.value.url,  val => { props.frame.data.donationButtonLink = val }),
    )
  }

  if (element) emit('select-element', { element, frame: props.frame })
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
  // ✅ 讓文字色跟隨主題，但 fallback 維持白色（捐款框一般是深色背景）
  color: #fff;
}

.donation-text {
  font-size: 16px;
  line-height: 1.8;
  opacity: 0.95;
  white-space: pre-line;
  width: 100%;
  color: #fff;
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
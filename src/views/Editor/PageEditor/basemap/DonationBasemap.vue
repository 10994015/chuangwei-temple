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
import { computed } from 'vue'

const props = defineProps({
  // 基本屬性（靜態模式）
  title: {
    type: String,
    default: '捐款護持'
  },
  text: {
    type: String,
    default: '您的捐款將用於宮廟維護與慈善公益\n支持本宮日常運作、建設修繕及幫助弱勢族群\n每一分善款都將妥善運用 功德無量'
  },
  buttonText: {
    type: String,
    default: '查看所有商品 ›'
  },
  buttonLink: {
    type: String,
    default: '#'
  },
  backgroundColor: {
    type: String,
    default: 'linear-gradient(135deg, #8b7355 0%, #a0826d 100%)'
  },
  // 編輯模式屬性
  isEditMode: {
    type: Boolean,
    default: false
  },
  frameData: {
    type: Object,
    default: null
  },
  frame: {
    type: Object,
    default: null
  },
  selectedElement: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['select-element'])

// ==================== 取得當前內容 ====================

// 從 frame.elements 中找元件，如果沒有就用預設值
const getElementValue = (elementId, defaultValue) => {
  if (!props.frame?.elements) {
    return defaultValue
  }
  const element = props.frame.elements.find(el => el && el.id === elementId)
  return element?.value?.text || defaultValue
}

const getButtonElement = () => {
  if (!props.frame?.elements) {
    return null
  }
  return props.frame.elements.find(el => el && el.id === 'donation-button')
}

// 當前顯示的內容
const currentTitle = computed(() => {
  if (props.isEditMode) {
    return getElementValue('donation-title', props.title)
  }
  return props.title
})

const currentText = computed(() => {
  if (props.isEditMode) {
    return getElementValue('donation-text', props.text)
  }
  return props.text
})

const currentButtonText = computed(() => {
  if (props.isEditMode) {
    const buttonEl = getButtonElement()
    return buttonEl?.value?.text || props.buttonText
  }
  return props.buttonText
})

const currentButtonLink = computed(() => {
  if (props.isEditMode) {
    const buttonEl = getButtonElement()
    return buttonEl?.value?.url || props.buttonLink
  }
  return props.buttonLink
})

// ==================== 選中狀態判斷 ====================

const isTitleSelected = computed(() => {
  return props.selectedElement?.element?.id === 'donation-title'
})

const isTextSelected = computed(() => {
  return props.selectedElement?.element?.id === 'donation-text'
})

const isButtonSelected = computed(() => {
  return props.selectedElement?.element?.id === 'donation-button'
})

// ==================== 處理點擊 ====================

const handleElementClick = (elementType, event) => {
  if (event) {
    event.preventDefault()
  }
  
  console.log('點擊捐款區元件:', elementType)
  
  // 確保 frame.elements 存在
  if (!props.frame.elements) {
    props.frame.elements = []
  }
  
  // 根據類型找到或創建元件
  let element = null
  let elementId = ''
  
  if (elementType === 'title') {
    elementId = 'donation-title'
    element = props.frame.elements.find(el => el && el.id === elementId)
    
    if (!element) {
      element = {
        type: 'TEXT',
        id: elementId,
        value: { text: props.title },
        metadata: {}
      }
      props.frame.elements.push(element)
    }
  } else if (elementType === 'text') {
    elementId = 'donation-text'
    element = props.frame.elements.find(el => el && el.id === elementId)
    
    if (!element) {
      element = {
        type: 'TEXT',
        id: elementId,
        value: { text: props.text },
        metadata: {}
      }
      props.frame.elements.push(element)
    }
  } else if (elementType === 'button') {
    elementId = 'donation-button'
    element = props.frame.elements.find(el => el && el.id === elementId)
    
    if (!element) {
      element = {
        type: 'BUTTON',
        id: elementId,
        value: { 
          text: props.buttonText,
          url: props.buttonLink
        },
        metadata: {}
      }
      props.frame.elements.push(element)
    }
  }
  
  // 發送選中事件
  if (element) {
    emit('select-element', {
      element: element,
      frame: props.frame
    })
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

// 可編輯元件樣式
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
<template>
  <div 
    class="basemap-container"
    @mouseenter="handleContentMouseEnter"
    @mouseleave="handleContentMouseLeave"
  >
    <!-- 底圖控制按鈕 (移到外層) -->
    <div v-if="!isHeader && !isFooter" class="basemap-controls">
      <!-- 刪除按鈕 -->
      <button 
        class="control-btn delete-btn" 
        @click="handleDelete" 
        title="刪除底圖"
      >
        <span class="icon">✕</span>
      </button>
    </div>

    <!-- 底圖內容 -->
    <div class="basemap-content">
      <slot></slot>
    </div>

    <!-- 分隔線 + 移動/新增按鈕 (Footer 不顯示) -->
    <div 
      v-if="!isFooter" 
      class="basemap-divider"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <div class="divider-line"></div>
      
      <!-- 按鈕組容器 -->
      <div class="divider-buttons">
        <!-- 上移按鈕 -->
        <button 
          v-if="!isHeader"
          class="divider-btn move-up-btn" 
          :class="{ active: isHovered }"
          :disabled="!canMoveUp"
          @click="handleMoveUp" 
          title="上移底圖"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </button>
        
        <!-- 新增按鈕 -->
        <button 
          class="add-basemap-btn" 
          :class="{ active: isHovered }"
          @click="addBlankBasemap"
          title="新增空白底圖"
        >
          <span class="plus-icon">+</span>
        </button>
        
        <!-- 下移按鈕 -->
        <button 
          v-if="!isHeader"
          class="divider-btn move-down-btn" 
          :class="{ active: isHovered }"
          :disabled="!canMoveDown"
          @click="handleMoveDown" 
          title="下移底圖"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </button>
      </div>
      
      <div class="divider-line"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  isFooter: {
    type: Boolean,
    default: false
  },
  isHeader: {
    type: Boolean,
    default: false
  },
  index: {
    type: Number,
    required: true
  },
  basemapId: {
    type: String,
    required: true
  },
  totalBasemaps: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['add-basemap', 'delete-basemap', 'move-basemap'])

const isHovered = ref(false)
const isContentHovered = ref(false)

// 計算是否可以上移
const canMoveUp = computed(() => {
  // header 的下一個位置（index 1）不能上移
  // 或者當前已經是第一個可移動的底圖
  return props.index > 1
})

// 計算是否可以下移
const canMoveDown = computed(() => {
  // footer 的前一個位置不能下移
  // props.totalBasemaps - 1 是最後一個索引（footer）
  // props.totalBasemaps - 2 是 footer 前一個
  return props.index < props.totalBasemaps - 2
})

const handleMouseEnter = () => {
  isHovered.value = true
}

const handleMouseLeave = () => {
  isHovered.value = false
}

const handleContentMouseEnter = () => {
  isContentHovered.value = true
}

const handleContentMouseLeave = () => {
  isContentHovered.value = false
}

// 新增空白底圖
const addBlankBasemap = () => {
  emit('add-basemap', props.index)
}

// 刪除底圖
const handleDelete = () => {
  emit('delete-basemap', props.basemapId)
}

// 上移底圖
const handleMoveUp = () => {
  if (canMoveUp.value) {
    console.log('上移底圖，當前索引:', props.index)
    emit('move-basemap', {
      basemapId: props.basemapId,
      fromIndex: props.index,
      toIndex: props.index - 1,
      direction: 'up'
    })
  }
}

// 下移底圖
const handleMoveDown = () => {
  if (canMoveDown.value) {
    console.log('下移底圖，當前索引:', props.index)
    emit('move-basemap', {
      basemapId: props.basemapId,
      fromIndex: props.index,
      toIndex: props.index + 1,
      direction: 'down'
    })
  }
}
</script>

<style lang="scss" scoped>
.basemap-container {
  position: relative;
  
  &:hover {
    .basemap-controls {
      opacity: 1;
      pointer-events: auto;
    }
  }
}

.basemap-content {
  position: relative;
}

// 底圖控制按鈕
.basemap-controls {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 200;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.control-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #fff;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  
  .icon {
    font-size: 20px;
    font-weight: bold;
    color: #fff;
    line-height: 1;
  }
  
  svg.icon {
    width: 20px;
    height: 20px;
    color: #fff;
  }
  
  &:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    background: rgba(156, 163, 175, 0.95);
  }
}

// 上移按鈕
.move-up-btn {
  background: rgba(59, 130, 246, 0.95);
  
  &:hover:not(:disabled) {
    background: #2563eb;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
}

// 下移按鈕
.move-down-btn {
  background: rgba(16, 185, 129, 0.95);
  
  &:hover:not(:disabled) {
    background: #059669;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }
}

// 刪除按鈕
.delete-btn {
  background: rgba(220, 53, 69, 0.95);
  
  &:hover {
    background: #c82333;
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
  }
}

// 分隔線 + 按鈕組
.basemap-divider {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 0;
  display: flex;
  align-items: center;
  background: transparent;
  transition: all 0.3s ease;
  z-index: 50;
  pointer-events: none;
  
  // 擴大滑鼠感應區域（上下各 20px）
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 0;
    right: 0;
    height: 40px;
    pointer-events: auto;
  }
  
  &:hover {
    .divider-line {
      opacity: 1;
    }
  }
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, #333, transparent);
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
}

// 按鈕組容器
.divider-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 1rem;
  pointer-events: auto;
}

// 分隔線上的按鈕通用樣式
.divider-btn {
  width: 32px;
  height: 32px;
  border: 2px solid #666;
  border-radius: 50%;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0;
  transform: scale(0.8);
  position: relative;
  z-index: 10;
  background: #fff;
  
  .basemap-divider:hover & {
    opacity: 1;
    transform: scale(1);
  }
  
  &.active {
    opacity: 1;
    transform: scale(1);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    border-color: #ccc;
    color: #ccc;
    
    &:hover {
      transform: scale(1);
      border-color: #ccc;
      color: #ccc;
      background: #fff;
      box-shadow: none;
    }
  }
  
  .icon {
    width: 16px;
    height: 16px;
  }
}

// 上移按鈕樣式
.move-up-btn {
  &:hover:not(:disabled) {
    background: #3b82f6;
    border-color: #3b82f6;
    color: #fff;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
}

// 下移按鈕樣式
.move-down-btn {
  &:hover:not(:disabled) {
    background: #10b981;
    border-color: #10b981;
    color: #fff;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
}

// 新增按鈕
.add-basemap-btn {
  width: 32px;
  height: 32px;
  border: 2px solid #333;
  border-radius: 50%;
  background: #333;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0;
  transform: scale(0.8);
  position: relative;
  z-index: 10;
  
  .basemap-divider:hover & {
    opacity: 1;
    transform: scale(1);
  }
  
  &.active {
    opacity: 1;
    transform: scale(1);
  }
  
  &:hover {
    background: #000;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.plus-icon {
  font-size: 18px;
  font-weight: 300;
  line-height: 1;
}
</style>
<template>
  <div 
    class="hero-banner"
    :class="{ 'is-selected': isSelected }"
    @click.stop="handleClick"
  >
    <div class="hero-container" :style="heroStyle">
      <!-- 半透明遮罩層 -->
      <div class="hero-overlay" :style="overlayStyle"></div>
      
      <!-- 文字內容區 -->
      <div class="hero-content">
        <div class="text-box" :style="textBoxStyle">
          <h1 
            v-if="heroTitle" 
            class="hero-title"
            :style="titleStyle"
          >
            {{ heroTitle }}
          </h1>
          <p 
            v-if="heroSubtitle" 
            class="hero-subtitle"
            :style="subtitleStyle"
          >
            {{ heroSubtitle }}
          </p>
          
          <!-- 如果沒有標題和副標題，顯示提示文字 -->
          <div v-if="!heroTitle && !heroSubtitle" class="placeholder-text">
            <p>點擊首圖以編輯內容</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- ✅ 編輯提示層 -->
    <div class="edit-hint" v-if="!heroTitle && !heroSubtitle">
      <span>點擊此處編輯首圖</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  frameData: {
    type: Object,
    default: () => ({})
  },
  frame: {
    type: Object,
    default: null
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select-frame'])

// ✅ 處理點擊事件
const handleClick = () => {
  console.log('🖼️ 點擊首圖框架')
  emit('select-frame', props.frame)
}

// 背景圖片
const backgroundImage = computed(() => {
  return props.frameData.hero_bg_img_src || null
})

// 標題
const heroTitle = computed(() => {
  return props.frameData.hero_title || ''
})

// 副標題
const heroSubtitle = computed(() => {
  return props.frameData.hero_subtitle || ''
})

// 遮罩透明度 (0-100)
const overlayOpacity = computed(() => {
  return props.frameData.overlay_opacity !== undefined 
    ? props.frameData.overlay_opacity / 100 
    : 0.4
})

// 遮罩顏色
const overlayColor = computed(() => {
  return props.frameData.overlay_color || '#000000'
})

// ✅ 文字框背景顏色 - 固定透明
const textBoxBgColor = computed(() => {
  return 'transparent'
})

// 文字框圓角
const textBoxBorderRadius = computed(() => {
  return props.frameData.text_box_border_radius || '12px'
})

// 標題顏色
const titleColor = computed(() => {
  return props.frameData.title_color || '#333333'
})

// 標題字體大小
const titleFontSize = computed(() => {
  return props.frameData.title_font_size || '48px'
})

// 副標題顏色
const subtitleColor = computed(() => {
  return props.frameData.subtitle_color || '#666666'
})

// 副標題字體大小
const subtitleFontSize = computed(() => {
  return props.frameData.subtitle_font_size || '20px'
})

// Hero 容器樣式
const heroStyle = computed(() => {
  const style = {
    minHeight: props.frameData.hero_height || '600px'
  }
  
  if (backgroundImage.value) {
    style.backgroundImage = `url(${backgroundImage.value})`
  }
  
  return style
})

// 遮罩樣式
const overlayStyle = computed(() => {
  return {
    backgroundColor: overlayColor.value,
    opacity: overlayOpacity.value
  }
})

// 文字框樣式
const textBoxStyle = computed(() => {
  return {
    backgroundColor: textBoxBgColor.value,
    borderRadius: textBoxBorderRadius.value
  }
})

// 標題樣式
const titleStyle = computed(() => {
  return {
    color: titleColor.value,
    fontSize: titleFontSize.value
  }
})

// 副標題樣式
const subtitleStyle = computed(() => {
  return {
    color: subtitleColor.value,
    fontSize: subtitleFontSize.value
  }
})
</script>

<style lang="scss" scoped>
.hero-banner {
  width: 100%;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 0 0 3px rgba(232, 87, 42, 0.2);
    
    .edit-hint {
      opacity: 1;
    }
  }
  
  &.is-selected {
    box-shadow: 0 0 0 3px rgba(232, 87, 42, 0.5);
    
    .edit-hint {
      opacity: 1;
    }
  }
}

// ✅ 編輯提示層
.edit-hint {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(232, 87, 42, 0.9);
  color: #fff;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.hero-container {
  position: relative;
  width: 100%;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #f5f5f5;  // 沒有背景圖時的預設顏色
  overflow: hidden;
}

// 半透明遮罩層
.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #000;
  opacity: 0.4;
  pointer-events: none;
  z-index: 1;
}

// 文字內容區
.hero-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1400px;
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 文字框
.text-box {
  background: transparent;  // ✅ 改為透明
  padding: 60px 80px;
  border-radius: 12px;
  text-align: center;
  max-width: 800px;
  width: 100%;
  // ✅ 移除 box-shadow 和 backdrop-filter
}

// 標題
.hero-title {
  font-size: 48px;
  font-weight: 700;
  color: #333;
  margin: 0 0 20px;
  line-height: 1.2;
}

// 副標題
.hero-subtitle {
  font-size: 20px;
  color: #666;
  margin: 0;
  line-height: 1.6;
}

// 提示文字
.placeholder-text {
  color: #999;
  font-size: 16px;
  font-style: italic;
  
  p {
    margin: 0;
  }
}

// 響應式設計
@media (max-width: 1024px) {
  .text-box {
    padding: 50px 60px;
    max-width: 700px;
  }
  
  .hero-title {
    font-size: 40px;
  }
  
  .hero-subtitle {
    font-size: 18px;
  }
}

@media (max-width: 768px) {
  .hero-container {
    min-height: 500px;
  }
  
  .hero-content {
    padding: 0 20px;
  }
  
  .text-box {
    padding: 40px 30px;
  }
  
  .hero-title {
    font-size: 32px;
    margin-bottom: 16px;
  }
  
  .hero-subtitle {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .hero-container {
    min-height: 400px;
  }
  
  .text-box {
    padding: 30px 20px;
  }
  
  .hero-title {
    font-size: 24px;
    margin-bottom: 12px;
  }
  
  .hero-subtitle {
    font-size: 14px;
  }
}
</style>
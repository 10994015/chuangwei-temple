<template>
  <div class="carousel-element">
    <div class="carousel-container">
      <!-- 輪播主體 -->
      <div class="carousel-wrapper">
        <div class="carousel-track" :style="trackStyle">
          <div
            v-for="(image, index) in images"
            :key="index"
            class="carousel-slide"
          >
            <img
              :src="image"
              :alt="`輪播圖片 ${index + 1}`"
              class="carousel-image"
            />
          </div>
        </div>

        <!-- 上一張按鈕 -->
        <button
          v-if="images.length > 1"
          class="carousel-btn prev-btn"
          @click="prevSlide"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <!-- 下一張按鈕 -->
        <button
          v-if="images.length > 1"
          class="carousel-btn next-btn"
          @click="nextSlide"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        <!-- 指示器 -->
        <div v-if="images.length > 1" class="carousel-indicators">
          <button
            v-for="(image, index) in images"
            :key="index"
            class="indicator"
            :class="{ active: currentIndex === index }"
            @click="goToSlide(index)"
          ></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  content: {
    type: Object,
    required: true
  },
  element: {
    type: Object,
    required: true
  }
})

// 當前索引
const currentIndex = ref(0)
let autoplayTimer = null

// 圖片列表（如果沒有圖片，使用預設的假圖片）
const images = computed(() => {
  if (props.content.images && props.content.images.length > 0) {
    return props.content.images
  }
  
  // 預設輪播圖片（使用 Unsplash 的假圖）
  return [
    'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800&h=450&fit=crop'
  ]
})

// 自動播放設定
const autoPlay = computed(() => {
  return props.content.autoPlay !== false
})

const interval = computed(() => {
  return props.content.interval || 3000
})

// 軌道樣式
const trackStyle = computed(() => {
  return {
    transform: `translateX(-${currentIndex.value * 100}%)`
  }
})

// 下一張
const nextSlide = () => {
  if (images.value.length <= 1) return
  currentIndex.value = (currentIndex.value + 1) % images.value.length
}

// 上一張
const prevSlide = () => {
  if (images.value.length <= 1) return
  currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length
}

// 跳到指定張
const goToSlide = (index) => {
  currentIndex.value = index
}

// 開始自動播放
const startAutoplay = () => {
  if (!autoPlay.value || images.value.length <= 1) return
  autoplayTimer = setInterval(nextSlide, interval.value)
}

// 停止自動播放
const stopAutoplay = () => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

// 生命週期
onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<style lang="scss" scoped>
.carousel-element {
  width: 100%;
}

.carousel-container {
  width: 100%;
  position: relative;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.carousel-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; // 16:9 比例
  overflow: hidden;
}

.carousel-track {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease;
}

.carousel-slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

// 控制按鈕
.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;

  svg {
    width: 20px;
    height: 20px;
    color: #333;
  }

  &:hover {
    background: #fff;
    transform: translateY(-50%) scale(1.1);
  }

  &.prev-btn {
    left: 16px;
  }

  &.next-btn {
    right: 16px;
  }
}

// 指示器
.carousel-indicators {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;

  &.active {
    background: #fff;
    width: 24px;
    border-radius: 5px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.8);
  }
}

// 響應式設計
@media (max-width: 768px) {
  .carousel-btn {
    width: 32px;
    height: 32px;

    svg {
      width: 16px;
      height: 16px;
    }

    &.prev-btn {
      left: 8px;
    }

    &.next-btn {
      right: 8px;
    }
  }

  .carousel-indicators {
    bottom: 12px;
  }

  .indicator {
    width: 8px;
    height: 8px;

    &.active {
      width: 20px;
    }
  }
}
</style>
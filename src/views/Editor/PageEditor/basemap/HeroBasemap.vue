<template>
  <section class="hero">
    <div class="hero-swiper">
      <div class="swiper-wrapper">
        <!-- ✅ 有圖片時顯示輪播 -->
        <template v-if="normalizedSlides.length > 0">
          <div 
            v-for="(slide, index) in normalizedSlides" 
            :key="index"
            class="swiper-slide"
            :class="{ active: currentSlide === index }"
          >
            <img :src="slide.image" :alt="slide.title || '輪播圖片'" class="slide-image" />
          </div>
        </template>

        <!-- ✅ 沒有圖片時的空狀態 -->
        <div v-else class="swiper-slide active">
          <div class="empty-carousel">
            <div class="empty-icon">🖼️</div>
            <p class="empty-text">輪播牆尚未上傳圖片</p>
            <p class="empty-hint">請在右側屬性面板上傳圖片</p>
          </div>
        </div>
      </div>
      
      <!-- 導航按鈕（有圖片才顯示） -->
      <template v-if="normalizedSlides.length > 1">
        <button class="hero-btn prev" @click="prevSlide">‹</button>
        <button class="hero-btn next" @click="nextSlide">›</button>
        
        <!-- 分頁指示器 -->
        <div class="hero-pagination">
          <button
            v-for="(slide, index) in normalizedSlides"
            :key="index"
            class="pagination-dot"
            :class="{ active: currentSlide === index }"
            @click="goToSlide(index)"
          ></button>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  // ✅ 舊格式（向下相容）
  slides: {
    type: Array,
    default: null
  },
  // ✅ 新格式：API 回傳的 caroisel_wall_imgs
  caroisel_wall_imgs: {
    type: Array,
    default: null
  },
  autoPlayInterval: {
    type: Number,
    default: 5000
  }
})

// ✅ 統一資料格式
// caroisel_wall_imgs 結構: [{ id, src }]
// slides 舊結構: [{ image, title, description, link }]
const normalizedSlides = computed(() => {
  // 優先使用新格式 caroisel_wall_imgs
  if (props.caroisel_wall_imgs && props.caroisel_wall_imgs.length > 0) {
    return props.caroisel_wall_imgs.map(item => ({
      image: item.src,  // ✅ 改用 src
      title: item.title || '',
      description: item.description || '',
      link: item.link || null,
      id: item.id
    }))
  }
  
  // 向下相容舊格式 slides
  if (props.slides && props.slides.length > 0) {
    return props.slides
  }
  
  return []
})

const currentSlide = ref(0)
let autoPlayTimer = null

const nextSlide = () => {
  if (normalizedSlides.value.length === 0) return
  currentSlide.value = (currentSlide.value + 1) % normalizedSlides.value.length
}

const prevSlide = () => {
  if (normalizedSlides.value.length === 0) return
  currentSlide.value = currentSlide.value === 0 
    ? normalizedSlides.value.length - 1 
    : currentSlide.value - 1
}

const goToSlide = (index) => {
  currentSlide.value = index
}

const startAutoPlay = () => {
  stopAutoPlay()
  if (normalizedSlides.value.length > 1) {
    autoPlayTimer = setInterval(() => {
      nextSlide()
    }, props.autoPlayInterval)
  }
}

const stopAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

// ✅ 圖片數量改變時重置輪播
watch(normalizedSlides, (newSlides) => {
  if (currentSlide.value >= newSlides.length) {
    currentSlide.value = Math.max(0, newSlides.length - 1)
  }
  startAutoPlay()
})

onMounted(() => {
  startAutoPlay()
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<style lang="scss" scoped>
.hero {
  position: relative;
  width: 100%;
  height: 600px;
  overflow: hidden;
}

.hero-swiper {
  position: relative;
  width: 100%;
  height: 100%;
}

.swiper-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.swiper-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.8s ease-in-out;
  
  &.active {
    opacity: 1;
    z-index: 1;
  }
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

// ✅ 空狀態樣式
.empty-carousel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  
  .empty-icon {
    font-size: 64px;
    margin-bottom: 1rem;
    opacity: 0.4;
  }
  
  .empty-text {
    font-size: 18px;
    color: #666;
    margin: 0 0 0.5rem;
    font-weight: 500;
  }
  
  .empty-hint {
    font-size: 14px;
    color: #999;
    margin: 0;
  }
}

.hero-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 24px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.5);
    transform: translateY(-50%) scale(1.1);
  }

  &.prev {
    left: 2rem;
  }

  &.next {
    right: 2rem;
  }
}

.hero-pagination {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 12px;
}

.pagination-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  padding: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.6);
    transform: scale(1.2);
  }

  &.active {
    background: #fff;
    width: 30px;
    border-radius: 6px;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .hero {
    height: 400px;
  }

  .slide-title {
    font-size: 32px;
  }

  .slide-description {
    font-size: 16px;
  }

  .hero-btn {
    width: 40px;
    height: 40px;
    font-size: 20px;

    &.prev { left: 1rem; }
    &.next { right: 1rem; }
  }
}
</style>
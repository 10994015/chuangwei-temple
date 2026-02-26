<template>
  <section class="hero" :style="heroStyle">
    <div class="hero-swiper">
      <div class="swiper-wrapper">
        <div 
          v-for="(slide, index) in displaySlides" 
          :key="index"
          class="swiper-slide"
          :class="{ active: currentSlide === index }"
        >
          <img :src="slide.image" :alt="slide.title || '輪播圖片'" class="slide-image" />
        </div>
      </div>
      
      <template v-if="displaySlides.length > 1">
        <button class="hero-btn prev" @click="prevSlide">‹</button>
        <button class="hero-btn next" @click="nextSlide">›</button>
        
        <div class="hero-pagination">
          <button
            v-for="(slide, index) in displaySlides"
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

// ✅ 假圖片（廟宇/宗教風格，Unsplash）
const PLACEHOLDER_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1280&h=600&fit=crop',
    title: '輪播圖片 1'
  },
  {
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1280&h=600&fit=crop',
    title: '輪播圖片 2'
  },
  {
    image: 'https://images.unsplash.com/photo-1604881991720-f91add269bed?w=1280&h=600&fit=crop',
    title: '輪播圖片 3'
  }
]

const props = defineProps({
  slides: {
    type: Array,
    default: null
  },
  caroiselWallImgs: {
    type: Array,
    default: null
  },
  carouselWallHeight: {
    type: [Number, String],
    default: 600
  },
  carouselWallAutoPlay: {
    type: Boolean,
    default: true
  },
  carouselWallInterval: {
    type: Number,
    default: 5000
  },
  autoPlayInterval: {
    type: Number,
    default: null
  }
})

const heroStyle = computed(() => {
  const h = props.carouselWallHeight
  if (!h) return { height: '600px' }
  const val = typeof h === 'number' || /^\d+$/.test(String(h))
    ? String(h) + 'px'
    : String(h)
  return { height: val }
})

const effectiveInterval = computed(() => {
  return props.carouselWallInterval || props.autoPlayInterval || 5000
})

const normalizedSlides = computed(() => {
  if (props.caroiselWallImgs && props.caroiselWallImgs.length > 0) {
    return props.caroiselWallImgs.map(item => ({
      image: item.src,
      title: item.title || '',
      description: item.description || '',
      link: item.link || null,
      id: item.id
    }))
  }
  if (props.slides && props.slides.length > 0) return props.slides
  return []
})

// ✅ 沒有圖片時用假圖
const displaySlides = computed(() => {
  return normalizedSlides.value.length > 0 ? normalizedSlides.value : PLACEHOLDER_SLIDES
})

const currentSlide = ref(0)
let autoPlayTimer = null

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % displaySlides.value.length
}

const prevSlide = () => {
  currentSlide.value = currentSlide.value === 0
    ? displaySlides.value.length - 1
    : currentSlide.value - 1
}

const goToSlide = (index) => {
  currentSlide.value = index
}

const startAutoPlay = () => {
  stopAutoPlay()
  if (displaySlides.value.length > 1 && props.carouselWallAutoPlay) {
    autoPlayTimer = setInterval(nextSlide, effectiveInterval.value)
  }
}

const stopAutoPlay = () => {
  if (autoPlayTimer) { clearInterval(autoPlayTimer); autoPlayTimer = null }
}

watch(normalizedSlides, (newSlides) => {
  if (currentSlide.value >= displaySlides.value.length) {
    currentSlide.value = Math.max(0, displaySlides.value.length - 1)
  }
  startAutoPlay()
})

watch(() => props.carouselWallAutoPlay, startAutoPlay)
watch(() => props.carouselWallInterval, startAutoPlay)

onMounted(() => startAutoPlay())
onUnmounted(() => stopAutoPlay())
</script>

<style lang="scss" scoped>
.hero {
  position: relative;
  width: 100%;
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
  top: 0; left: 0;
  width: 100%; height: 100%;
  opacity: 0;
  transition: opacity 0.8s ease-in-out;
  &.active { opacity: 1; z-index: 1; }
}

.slide-image {
  width: 100%; height: 100%;
  object-fit: cover;
}

.hero-btn {
  position: absolute;
  top: 50%; transform: translateY(-50%);
  z-index: 10;
  background: rgba(255,255,255,0.3);
  border: none;
  width: 50px; height: 50px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 24px; color: #fff;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.3s;
  backdrop-filter: blur(10px);

  &:hover { background: rgba(255,255,255,0.5); transform: translateY(-50%) scale(1.1); }
  &.prev { left: 2rem; }
  &.next { right: 2rem; }
}

.hero-pagination {
  position: absolute;
  bottom: 2rem; left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex; gap: 12px;
}

.pagination-dot {
  width: 12px; height: 12px;
  border-radius: 50%;
  background: rgba(255,255,255,0.4);
  border: none; cursor: pointer;
  transition: all 0.3s; padding: 0;

  &:hover { background: rgba(255,255,255,0.6); transform: scale(1.2); }
  &.active { background: #fff; width: 30px; border-radius: 6px; }
}

@media (max-width: 768px) {
  .hero-btn {
    width: 40px; height: 40px; font-size: 20px;
    &.prev { left: 1rem; }
    &.next { right: 1rem; }
  }
}
</style>
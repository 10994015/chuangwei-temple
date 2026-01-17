<template>
  <section class="hero">
    <div class="hero-swiper">
      <div class="swiper-wrapper">
        <div 
          v-for="(slide, index) in slides" 
          :key="index"
          class="swiper-slide"
          :class="{ active: currentSlide === index }"
        >
          <img :src="slide.image" :alt="slide.title" class="slide-image" />
          <div class="slide-overlay">
            <div class="slide-content">
              <h2 class="slide-title">{{ slide.title }}</h2>
              <p class="slide-description">{{ slide.description }}</p>
              <a v-if="slide.link" :href="slide.link" class="slide-btn">了解更多</a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 導航按鈕 -->
      <button class="hero-btn prev" @click="prevSlide">‹</button>
      <button class="hero-btn next" @click="nextSlide">›</button>
      
      <!-- 分頁指示器 -->
      <div class="hero-pagination">
        <button
          v-for="(slide, index) in slides"
          :key="index"
          class="pagination-dot"
          :class="{ active: currentSlide === index }"
          @click="goToSlide(index)"
        ></button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  slides: {
    type: Array,
    default: () => [
      {
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1920&h=600&fit=crop',
        title: '桃園某某宮',
        description: '守護信眾 庇佑平安',
        link: '#'
      },
      {
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1920&h=600&fit=crop',
        title: '祈福法會',
        description: '每月初一十五誦經祈福',
        link: '#'
      },
      {
        image: 'https://images.unsplash.com/photo-1604881991720-f91add269bed?w=1920&h=600&fit=crop',
        title: '慶典活動',
        description: '傳承文化 弘揚信仰',
        link: '#'
      }
    ]
  },
  autoPlayInterval: {
    type: Number,
    default: 5000
  }
})

const currentSlide = ref(0)
let autoPlayTimer = null

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % props.slides.length
}

const prevSlide = () => {
  currentSlide.value = currentSlide.value === 0 
    ? props.slides.length - 1 
    : currentSlide.value - 1
}

const goToSlide = (index) => {
  currentSlide.value = index
}

const startAutoPlay = () => {
  autoPlayTimer = setInterval(() => {
    nextSlide()
  }, props.autoPlayInterval)
}

const stopAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
  }
}

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

.slide-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.5) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-content {
  text-align: center;
  color: #fff;
  max-width: 800px;
  padding: 0 2rem;
}

.slide-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  animation: slideInUp 0.8s ease-out;
}

.slide-description {
  font-size: 20px;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  animation: slideInUp 0.8s ease-out 0.2s both;
}

.slide-btn {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid #fff;
  border-radius: 50px;
  color: #fff;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
  animation: slideInUp 0.8s ease-out 0.4s both;

  &:hover {
    background: #fff;
    color: #8b7355;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
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

    &.prev {
      left: 1rem;
    }

    &.next {
      right: 1rem;
    }
  }
}
</style>
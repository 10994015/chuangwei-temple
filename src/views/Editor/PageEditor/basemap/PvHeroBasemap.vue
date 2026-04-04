<template>
  <div
    class="pv-carousel"
    :style="{ height: carouselHeight + 'px' }"
    @mouseenter="stopAutoplay"
    @mouseleave="startAutoplay"
  >
    <div class="pv-viewport" ref="viewportRef" :style="{ padding: `0 ${sidePx}px` }">
      <div class="pv-track" :style="trackStyle" :class="{ 'no-transition': isJumping }">
        <div
          v-for="(src, i) in clonedImages"
          :key="i"
          class="pv-slide"
          :class="{ 'is-active': i === currentIndex + 1 }"
          :style="{ width: slideWidth + 'px' }"
        >
          <img :src="src" :alt="`輪播圖片 ${i + 1}`" class="pv-img" />
        </div>
      </div>

      <button
        v-if="displayImages.length > 1"
        class="pv-arrow pv-arrow--left"
        @click.stop="prevSlide"
        aria-label="上一張"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>

      <button
        v-if="displayImages.length > 1"
        class="pv-arrow pv-arrow--right"
        @click.stop="nextSlide"
        aria-label="下一張"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      <div v-if="displayImages.length > 1" class="pv-indicators">
        <button
          v-for="(_, i) in displayImages"
          :key="i"
          class="pv-dot"
          :class="{ active: currentIndex === i }"
          @click.stop="goToSlide(i)"
          :aria-label="`第 ${i + 1} 張`"
        ></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  caroiselWallImgs:     { type: Array,   default: () => [] },
  carouselWallHeight:   { type: Number,  default: 600 },
  carouselWallAutoPlay: { type: Boolean, default: true },
  carouselWallInterval: { type: Number,  default: 5000 },
})

const currentIndex  = ref(0)
const viewportRef   = ref(null)
const viewportWidth = ref(0)
const isJumping     = ref(false)
let autoplayTimer   = null
let resizeObserver  = null

const SIDE_RATIO = 0.04

const carouselHeight = computed(() => props.carouselWallHeight || 600)

const sideRatio = computed(() => viewportWidth.value <= 768 ? 0.08 : SIDE_RATIO)
const sidePx = computed(() => Math.floor(viewportWidth.value * sideRatio.value))

const displayImages = computed(() => {
  const imgs = props.caroiselWallImgs
  if (imgs && imgs.length > 0) {
    return imgs.map(img => (typeof img === 'object' ? img.src : img)).filter(Boolean)
  }
  return [
    'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&h=700&fit=crop',
    'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&h=700&fit=crop',
    'https://images.unsplash.com/photo-1604881991720-f91add269bed?w=1200&h=700&fit=crop',
  ]
})

// 頭尾各加一張 clone 實現無限循環
const clonedImages = computed(() => {
  const imgs = displayImages.value
  if (imgs.length <= 1) return imgs
  return [imgs[imgs.length - 1], ...imgs, imgs[0]]
})

const slideWidth = computed(() => {
  if (!viewportWidth.value) return 0
  return viewportWidth.value - sidePx.value * 2
})

// 單張時沒有 clone，offset 直接為 0；多張時第 0 位是 clone，從 index+1 開始
const trackStyle = computed(() => {
  if (!slideWidth.value) return {}
  const isSingle = displayImages.value.length <= 1
  const offset = isSingle ? 0 : (currentIndex.value + 1) * slideWidth.value
  return { transform: `translateX(-${offset}px)` }
})

// 靜默跳位（不帶 transition）
const jumpTo = (index) => {
  isJumping.value = true
  currentIndex.value = index
  // 下一個 tick 後恢復 transition
  setTimeout(() => { isJumping.value = false }, 20)
}

const nextSlide = () => {
  const len = displayImages.value.length
  if (len <= 1) return
  const next = currentIndex.value + 1
  currentIndex.value = next
  // 如果滑到了尾部 clone（index = len），動畫結束後靜默跳回 0
  if (next >= len) {
    setTimeout(() => jumpTo(0), 560)
  }
}

const prevSlide = () => {
  const len = displayImages.value.length
  if (len <= 1) return
  const prev = currentIndex.value - 1
  currentIndex.value = prev
  // 如果滑到了頭部 clone（index = -1），動畫結束後靜默跳回 len-1
  if (prev < 0) {
    setTimeout(() => jumpTo(len - 1), 560)
  }
}

const goToSlide = (i) => {
  currentIndex.value = i
}

const startAutoplay = () => {
  if (!props.carouselWallAutoPlay || displayImages.value.length <= 1) return
  stopAutoplay()
  autoplayTimer = setInterval(nextSlide, props.carouselWallInterval || 5000)
}

const stopAutoplay = () => {
  if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null }
}

watch(() => displayImages.value.length, () => {
  currentIndex.value = 0
  stopAutoplay()
  startAutoplay()
})

watch([() => props.carouselWallAutoPlay, () => props.carouselWallInterval], () => {
  stopAutoplay()
  startAutoplay()
})

onMounted(() => {
  if (viewportRef.value) {
    viewportWidth.value = viewportRef.value.offsetWidth
    resizeObserver = new ResizeObserver(() => {
      viewportWidth.value = viewportRef.value.offsetWidth
    })
    resizeObserver.observe(viewportRef.value)
  }
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
  if (resizeObserver) resizeObserver.disconnect()
})
</script>

<style lang="scss" scoped>
.pv-carousel {
  position: relative;
  width: 100%;
  background: transparent;
  user-select: none;
}

.pv-viewport {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.pv-track {
  display: flex;
  height: 100%;
  transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);

  &.no-transition {
    transition: none;
  }
}

.pv-slide {
  flex-shrink: 0;
  height: 100%;
  padding: 0 6px;
  box-sizing: border-box;
  opacity: 0.45;
  transition: opacity 0.45s ease;

  &.is-active {
    opacity: 1;
  }
}

.pv-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 12px;
}

.pv-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.88);
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: background 0.2s, transform 0.2s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);

  svg { width: 18px; height: 18px; }

  &--left  { left: 13%; }
  &--right { right: 13%; }

  &:hover {
    background: #fff;
    transform: translateY(-50%) scale(1.08);
  }
}

.pv-indicators {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.pv-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;

  &.active {
    background: #fff;
    width: 24px;
    border-radius: 4px;
  }

  &:hover { background: rgba(255, 255, 255, 0.75); }
}

@media (max-width: 768px) {
  .pv-arrow {
    width: 34px;
    height: 34px;
    svg { width: 15px; height: 15px; }
    &--left  { left: 10%; }
    &--right { right: 10%; }
  }
}
</style>
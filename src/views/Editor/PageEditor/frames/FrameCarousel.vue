<template>
  <div class="frame-carousel">
    <div class="carousel-slide">
      <div class="slide-content">
        <h1>banner</h1>
      </div>
    </div>
    
    <!-- 輪播指示器 -->
    <div class="carousel-indicators">
      <span class="indicator active"></span>
      <span class="indicator"></span>
      <span class="indicator"></span>
    </div>
    
    <!-- 左右箭頭 -->
    <button class="carousel-arrow prev">‹</button>
    <button class="carousel-arrow next">›</button>
  </div>
</template>

<script setup>
const props = defineProps({
  frame: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.frame-carousel {
  position: relative;
  width: 100%;
  height: 500px;
  background: linear-gradient(135deg, #a89177 0%, #8b7355 100%);
  overflow: hidden;
}

.carousel-slide {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-content {
  text-align: center;
}

.slide-content h1 {
  font-size: 72px;
  font-weight: 300;
  color: rgba(0, 0, 0, 0.3);
  margin: 0;
  letter-spacing: 8px;
}

.carousel-indicators {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 10;
}

.indicator {
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.3s;
}

.indicator.active {
  background: rgba(255, 255, 255, 0.9);
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.6);
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border: none;
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 32px;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.carousel-arrow:hover {
  background: rgba(255, 255, 255, 0.5);
}

.carousel-arrow.prev {
  left: 30px;
}

.carousel-arrow.next {
  right: 30px;
}
</style>
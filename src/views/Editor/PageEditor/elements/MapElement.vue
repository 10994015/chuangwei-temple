<template>
  <div class="map-element">
    <div class="map-container">
      <!-- 地圖顯示區域 -->
      <div class="map-display">
        <!-- 使用 OpenStreetMap (不需要 API Key) -->
        <iframe
          :src="mapUrl"
          class="map-iframe"
          loading="lazy"
        ></iframe>
      </div>

      <!-- 地址信息 -->
      <div class="map-info" v-if="content.address">
        <div class="info-icon">📍</div>
        <div class="info-text">{{ content.address }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

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

// 計算地圖 URL - 使用 OpenStreetMap (不需要 API Key)
const mapUrl = computed(() => {
  const lat = props.content.lat || 25.033
  const lng = props.content.lng || 121.565
  const zoom = props.content.zoom || 15
  
  // OpenStreetMap Embed - 計算邊界框
  const delta = 0.01 / Math.pow(2, zoom - 15) // 根據縮放級別調整
  const bbox = `${lng-delta},${lat-delta},${lng+delta},${lat+delta}`
  
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`
})
</script>

<style lang="scss" scoped>
.map-element {
  width: 100%;
}

.map-container {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #f5f5f5;
}

.map-display {
  width: 100%;
  height: 400px;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  // 顯示「地圖載入中」
  &::before {
    content: '🗺️';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 64px;
    opacity: 0.3;
    z-index: 1;
    pointer-events: none;
  }

  &::after {
    content: '地圖預覽';
    position: absolute;
    top: 55%;
    left: 50%;
    transform: translate(-50%, 20px);
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    z-index: 1;
    pointer-events: none;
  }
}

.map-iframe {
  width: 100%;
  height: 100%;
  border: none;
  position: relative;
  z-index: 2;
}

// 地址信息
.map-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
}

.info-icon {
  font-size: 24px;
  line-height: 1;
}

.info-text {
  flex: 1;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
}

// 響應式設計
@media (max-width: 768px) {
  .map-display {
    height: 300px;
  }

  .map-info {
    padding: 12px;
  }

  .info-icon {
    font-size: 20px;
  }

  .info-text {
    font-size: 13px;
  }
}
</style>

<style lang="scss" scoped>
.map-element {
  position: relative;
  width: 100%;
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.map-container {
  position: relative;
  width: 100%;
  padding-bottom: 75%; // 4:3 比例
  background: #e9ecef;
}

.map-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  iframe {
    display: block;
  }
}

.map-empty {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  opacity: 0.8;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
}

.empty-hint {
  font-size: 14px;
  opacity: 0.8;
  margin: 0;
}

.map-address-label {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  max-width: 80%;
  z-index: 10;
}

.location-icon {
  width: 20px;
  height: 20px;
  color: #ea4335; // Google Maps 紅色
  flex-shrink: 0;
}

.address-text {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.element-tools {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
  z-index: 20;
}

.tool-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &.edit-btn {
    svg {
      color: #4CAF50;
    }
  }

  &.delete-btn {
    svg {
      color: #f44336;
    }
  }
}

// 當地圖有內容時，調整 hover 效果
.map-wrapper ~ .element-tools {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.map-element:hover .map-wrapper ~ .element-tools {
  opacity: 1;
}
</style>
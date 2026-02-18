<template>
  <div class="map-element">
    <div class="map-container">
      <!-- ✅ Leaflet 地圖容器 -->
      <div ref="mapContainer" class="map-display"></div>

      <!-- 地址信息 -->
      <div class="map-info" v-if="content.address">
        <div class="info-icon">📍</div>
        <div class="info-text">{{ content.address }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'

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

const mapContainer = ref(null)
let map = null
let marker = null

// ✅ 初始化地圖
const initMap = () => {
  if (!mapContainer.value) return
  
  const lat = props.content.lat || 25.033
  const lng = props.content.lng || 121.565
  const zoom = props.content.zoom || 15
  
  // 如果地圖已存在，先清除
  if (map) {
    map.remove()
  }
  
  // 建立 Leaflet 地圖
  map = window.L.map(mapContainer.value).setView([lat, lng], zoom)
  
  // 加入 OpenStreetMap 圖層
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)
  
  // 加入標記點
  marker = window.L.marker([lat, lng]).addTo(map)
  
  // 如果有地址，顯示在標記上
  if (props.content.address) {
    marker.bindPopup(props.content.address)
  }
}

// ✅ 更新地圖中心點和縮放
const updateMap = () => {
  if (!map) return
  
  const lat = props.content.lat || 25.033
  const lng = props.content.lng || 121.565
  const zoom = props.content.zoom || 15
  
  map.setView([lat, lng], zoom)
  
  if (marker) {
    marker.setLatLng([lat, lng])
    if (props.content.address) {
      marker.bindPopup(props.content.address)
    }
  }
}

// ✅ 載入 Leaflet CSS 和 JS
const loadLeaflet = () => {
  return new Promise((resolve) => {
    // 檢查是否已載入
    if (window.L) {
      resolve()
      return
    }
    
    // 載入 CSS
    const cssLink = document.createElement('link')
    cssLink.rel = 'stylesheet'
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(cssLink)
    
    // 載入 JS
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => resolve()
    document.head.appendChild(script)
  })
}

// ✅ 生命週期
onMounted(async () => {
  await loadLeaflet()
  initMap()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})

// ✅ 監聽內容變化
watch(() => [props.content.lat, props.content.lng, props.content.zoom, props.content.address], () => {
  updateMap()
}, { deep: true })
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
  background: #e5e5e5;
  
  // ✅ Leaflet 地圖會填滿這個容器
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
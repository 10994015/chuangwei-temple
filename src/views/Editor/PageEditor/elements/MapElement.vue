<template>
  <div class="map-element">
    <div class="map-container">
      <!-- ✅ Google Maps 容器 -->
      <div ref="mapContainer" class="map-display" v-show="hasLocation"></div>

      <!-- 無資料時的佔位 -->
      <div v-if="!hasLocation" class="map-placeholder">
        <div class="placeholder-icon">🗺️</div>
        <p>請在右側設定地址或經緯度</p>
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  content: {
    type: Object,
    required: true
  },
  element: {
    type: Object,
    required: true
  },
  apiKey: {
    type: String,
    default: 'AIzaSyBkr7vfTOrVKnXZHidLQcxX0sVUET74zIM'
  }
})

const mapContainer = ref(null)
let map = null
let marker = null
let geocoder = null
let InfoWindow = null
let AdvancedMarkerElement = null
let isInitializing = false  // ✅ 防止重複初始化
let isDestroyed = false     // ✅ 防止 unmount 後還繼續執行

const hasLocation = computed(() => {
  return !!(props.content.address || (props.content.lat && props.content.lng))
})

// ✅ 載入 Google Maps bootstrap（loading=async 官方推薦）
const loadGoogleMaps = () => {
  return new Promise((resolve, reject) => {
    if (window.google?.maps?.importLibrary) {
      resolve()
      return
    }

    if (document.getElementById('google-maps-script')) {
      const wait = setInterval(() => {
        if (window.google?.maps?.importLibrary) {
          clearInterval(wait)
          resolve()
        }
      }, 50)
      return
    }

    const script = document.createElement('script')
    script.id = 'google-maps-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${props.apiKey}&loading=async`
    script.async = true
    script.defer = true
    script.onload = () => {
      const wait = setInterval(() => {
        if (window.google?.maps?.importLibrary) {
          clearInterval(wait)
          resolve()
        }
      }, 50)
    }
    script.onerror = () => reject(new Error('Google Maps 載入失敗'))
    document.head.appendChild(script)
  })
}

// ✅ Geocoding 查座標
const geocodeAddress = (address) => {
  if (!geocoder || !address || isDestroyed) return
  geocoder.geocode({ address }, (results, status) => {
    if (isDestroyed) return
    if (status === 'OK' && results[0]) {
      const location = results[0].geometry.location
      map?.setCenter(location)
      if (marker) marker.position = location
    } else {
      console.warn('Geocoding 失敗:', status)
    }
  })
}

// ✅ 初始化地圖
const initMap = async () => {
  if (!mapContainer.value || isInitializing || map || isDestroyed) return
  isInitializing = true

  try {
    const lat = Number(props.content.lat) || 25.033
    const lng = Number(props.content.lng) || 121.565
    const zoom = props.content.zoom || 15

    const mapsLib    = await window.google.maps.importLibrary('maps')
    const markerLib  = await window.google.maps.importLibrary('marker')
    const geocodeLib = await window.google.maps.importLibrary('geocoding')

    // ✅ unmount 後不繼續
    if (isDestroyed) return

    InfoWindow            = mapsLib.InfoWindow
    AdvancedMarkerElement = markerLib.AdvancedMarkerElement
    geocoder              = new geocodeLib.Geocoder()

    map = new mapsLib.Map(mapContainer.value, {
      center: { lat, lng },
      zoom,
      mapId: 'DEMO_MAP_ID',
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    })

    marker = new AdvancedMarkerElement({
      position: { lat, lng },
      map,
      title: props.content.address || '',
    })

    if (props.content.address) {
      const infoWindow = new InfoWindow({
        content: `<div style="font-size:14px;padding:4px 8px">${props.content.address}</div>`
      })
      marker.addListener('gmp-click', () => infoWindow.open(map, marker))

      if (!props.content.lat || !props.content.lng) {
        geocodeAddress(props.content.address)
      }
    }
  } catch (e) {
    console.error('地圖初始化失敗:', e)
  } finally {
    isInitializing = false
  }
}

// ✅ 更新地圖（只有 map 和 marker 都存在才執行）
const updateMap = () => {
  if (!map || !marker || isDestroyed) return

  const lat = Number(props.content.lat) || 25.033
  const lng = Number(props.content.lng) || 121.565
  const zoom = props.content.zoom || 15

  map.setCenter({ lat, lng })
  map.setZoom(zoom)
  marker.position = { lat, lng }
  marker.title = props.content.address || ''
}

// ✅ 入口：載入 + 初始化
const setup = async () => {
  if (!hasLocation.value || isDestroyed) return
  try {
    await loadGoogleMaps()
    if (isDestroyed) return
    await nextTick()  // 確保 DOM 已渲染
    await initMap()
  } catch (e) {
    console.error(e.message)
  }
}

onMounted(() => setup())

onUnmounted(() => {
  isDestroyed = true
  map = null
  marker = null
  geocoder = null
})

// ✅ 監聽座標 / 縮放（加 guard，初始化完才執行）
watch(
  () => [props.content.lat, props.content.lng, props.content.zoom],
  () => {
    if (map && marker) updateMap()
  }
)

// ✅ 監聽地址
watch(
  () => props.content.address,
  (newAddress) => {
    if (!map || isDestroyed) return
    if (newAddress) geocodeAddress(newAddress)
  }
)

// ✅ 一開始沒資料，後來才設定時觸發初始化
watch(hasLocation, async (val) => {
  if (val && !map && !isInitializing) {
    await setup()
  }
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
  position: relative;
}

.map-display {
  width: 100%;
  height: 400px;
  display: block;
}

.map-placeholder {
  width: 100%;
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  color: #9ca3af;
  gap: 12px;

  .placeholder-icon {
    font-size: 48px;
    opacity: 0.5;
  }

  p {
    font-size: 14px;
    margin: 0;
  }
}

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

@media (max-width: 768px) {
  .map-display,
  .map-placeholder {
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
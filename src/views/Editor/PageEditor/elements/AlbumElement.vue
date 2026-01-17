<template>
  <div class="album-element">
    <div class="album-container">
      <!-- 相簿標題 -->
      <div class="album-header" v-if="safeContent.title">
        <h3 class="album-title">{{ safeContent.title }}</h3>
        <span class="photo-count">{{ photos.length }} 張照片</span>
      </div>

      <!-- 照片網格 -->
      <div class="album-grid" :class="`grid-cols-${columns}`">
        <div
          v-for="(photo, index) in displayPhotos"
          :key="index"
          class="photo-item"
          @click="openLightbox(index)"
        >
          <img
            :src="photo.src"
            :alt="photo.alt || `照片 ${index + 1}`"
            class="photo-image"
          />
          <div class="photo-overlay">
            <div class="overlay-icon">🔍</div>
          </div>
        </div>

        <!-- 顯示更多按鈕 -->
        <div
          v-if="hasMore"
          class="photo-item more-item"
          @click="viewMore"
        >
          <div class="more-content">
            <div class="more-icon">+{{ remainingCount }}</div>
            <div class="more-text">查看更多</div>
          </div>
        </div>
      </div>

      <!-- 查看全部按鈕 -->
      <div class="album-footer" v-if="safeContent.showViewAll">
        <button class="view-all-btn" @click="viewAll">
          查看完整相簿
          <svg class="arrow-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: {
    type: Object,
    default: () => ({})
  },
  element: {
    type: Object,
    default: () => ({})
  }
})

// 安全獲取 content，確保不會報錯
const safeContent = computed(() => props.content || {})

// 欄位數量
const columns = computed(() => {
  return safeContent.value.columns || 3
})

// 最多顯示數量
const maxDisplay = computed(() => {
  return safeContent.value.maxDisplay || 6
})

// 照片列表（預設或實際）
const photos = computed(() => {
  // 如果有設定 albumId 且有照片，使用實際照片
  if (safeContent.value.albumId && safeContent.value.photos && safeContent.value.photos.length > 0) {
    return safeContent.value.photos
  }
  
  // 否則使用預設照片
  return [
    { src: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&h=400&fit=crop', alt: '照片 1' },
    { src: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=400&fit=crop', alt: '照片 2' },
    { src: 'https://images.unsplash.com/photo-1604881991720-f91add269bed?w=400&h=400&fit=crop', alt: '照片 3' },
    { src: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=400&fit=crop', alt: '照片 4' },
    { src: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=400&h=400&fit=crop', alt: '照片 5' },
    { src: 'https://images.unsplash.com/photo-1551361415-69c87624334f?w=400&h=400&fit=crop', alt: '照片 6' },
    { src: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop', alt: '照片 7' },
    { src: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&h=400&fit=crop', alt: '照片 8' }
  ]
})

// 顯示的照片（扣除「更多」格子）
const displayPhotos = computed(() => {
  if (photos.value.length <= maxDisplay.value) {
    return photos.value
  }
  return photos.value.slice(0, maxDisplay.value - 1)
})

// 是否有更多照片
const hasMore = computed(() => {
  return photos.value.length > maxDisplay.value
})

// 剩餘照片數量
const remainingCount = computed(() => {
  return photos.value.length - (maxDisplay.value - 1)
})

// 打開燈箱
const openLightbox = (index) => {
  console.log('打開燈箱，照片索引:', index)
  // TODO: 實作燈箱功能
}

// 查看更多
const viewMore = () => {
  console.log('查看更多照片')
  // TODO: 實作查看更多功能
}

// 查看全部
const viewAll = () => {
  console.log('查看完整相簿')
  // TODO: 實作查看全部功能
}
</script>

<style lang="scss" scoped>
.album-element {
  width: 100%;
}

.album-container {
  width: 100%;
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
}

// 相簿標題
.album-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.album-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.photo-count {
  font-size: 14px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: '📷';
  }
}

// 照片網格
.album-grid {
  display: grid;
  gap: 8px;
  padding: 8px;

  &.grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }

  &.grid-cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }

  &.grid-cols-4 {
    grid-template-columns: repeat(4, 1fr);
  }
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  background: #f3f4f6;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
    z-index: 10;

    .photo-overlay {
      opacity: 1;
    }
  }
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.overlay-icon {
  font-size: 32px;
  color: #ffffff;
}

// 更多照片格子
.more-item {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.05);

    .more-icon {
      transform: scale(1.1);
    }
  }
}

.more-content {
  text-align: center;
  color: #ffffff;
}

.more-icon {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
  transition: transform 0.3s ease;
}

.more-text {
  font-size: 14px;
  font-weight: 500;
}

// 底部按鈕
.album-footer {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.view-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e5e7eb;
    transform: translateY(-2px);
  }
}

.arrow-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;

  .view-all-btn:hover & {
    transform: translateX(4px);
  }
}

// 響應式設計
@media (max-width: 768px) {
  .album-grid {
    &.grid-cols-3,
    &.grid-cols-4 {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .album-header {
    padding: 16px;
  }

  .album-title {
    font-size: 18px;
  }

  .photo-count {
    font-size: 13px;
  }
}
</style>
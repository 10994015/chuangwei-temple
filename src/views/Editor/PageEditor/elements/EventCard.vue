<template>
  <div class="event-card">
    <div class="card-image">
      <img 
        v-if="content.image" 
        :src="content.image" 
        :alt="content.title || '活動圖片'"
      />
      <div v-else class="card-image-placeholder">
        <span>🎉</span>
      </div>
    </div>
    <div class="card-content">
      <span class="card-tag">{{ content.tag || '法會活動' }}</span>
      <h3 class="card-title">{{ content.title || '中元普渡法會' }}</h3>
      <p class="card-description">{{ content.description || '2024年中元普渡法會活動紀錄' }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  content: {
    type: Object,
    default: () => ({
      image: null,
      tag: '法會活動',
      title: '中元普渡法會',
      description: '2024年中元普渡法會活動紀錄'
    })
  },
  element: {
    type: Object,
    default: null
  }
})
</script>

<style lang="scss" scoped>
.event-card {
  width: 100%;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
}

.card-image {
  width: 100%;
  height: 200px;
  position: relative;
  overflow: hidden;
  background: #f5f5f5;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.card-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e9d5ff 0%, #a855f7 100%);
  
  span {
    font-size: 64px;
    opacity: 0.8;
  }
}

.card-content {
  padding: 16px;
}

.card-tag {
  display: inline-block;
  padding: 4px 12px;
  background: #a855f7;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.card-title {
  margin: 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.card-description {
  margin: 8px 0 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}
</style>
<template>
  <div class="service-card">
    <div class="card-image">
      <img
        :src="content.image || '/images/service-card/03.png'"
        :alt="content.title || '服務圖片'"
      />
    </div>
    <div class="card-content">
      <span class="card-tag">{{ content.tag || '祈福服務' }}</span>
      <h3 class="card-title">{{ content.title || '服務標題' }}</h3>
      <p class="card-date">{{ content.date || '2024-08-22' }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  content: {
    type: Object,
    default: () => ({
      image: null,
      tag: '祈福服務',
      title: '服務標題',
      date: '2024-08-22'
    })
  },
  element: {
    type: Object,
    default: null
  }
})
</script>

<style lang="scss" scoped>
.service-card {
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
  background: linear-gradient(135deg, #99f6e4 0%, #14b8a6 100%);
  
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
  background: #14b8a6;
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

.card-date {
  margin: 8px 0 0;
  font-size: 13px;
  color: #999;
}
</style>
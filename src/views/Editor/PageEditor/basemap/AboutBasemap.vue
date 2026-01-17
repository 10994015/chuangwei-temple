<template>
  <section class="about-section">
    <div class="container">
      <div class="about-content">
        <div class="about-image">
          <div class="image-placeholder">{{ imagePlaceholder }}</div>
        </div>
        <div class="about-text">
          <h2 class="about-title">{{ title }}</h2>
          <p class="about-subtitle">{{ subtitle }}</p>
          <p 
            v-for="(desc, index) in descriptions"
            :key="index"
            class="about-description"
          >
            {{ desc }}
          </p>
          <a :href="linkUrl" class="about-link">{{ linkText }}</a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: '關於我們'
  },
  subtitle: {
    type: String,
    default: '認識天上聖母宮的歷史與特色'
  },
  descriptions: {
    type: Array,
    default: () => [
      '天上聖母宮創建於民國XX年，主祀天上聖母媽祖娘娘，為當地重要信仰中心。',
      '本宮歷經數十載風雨，香火鼎盛，神威顯赫，守護在地居民,庇佑四方信眾。'
    ]
  },
  linkText: {
    type: String,
    default: '了解宮廟歷史 ›'
  },
  linkUrl: {
    type: String,
    default: '#'
  },
  imagePlaceholder: {
    type: String,
    default: '宮廟圖片'
  }
})
</script>

<style lang="scss" scoped>
.about-section {
  padding: 4rem 0;
  background: #fff;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.about-content {
  display: flex;
  gap: 4rem;
  align-items: center;
}

.about-image {
  flex: 1;
  height: 400px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  .image-placeholder {
    color: #999;
    font-size: 16px;
  }
}

.about-text {
  flex: 1;
}

.about-title {
  font-size: 32px;
  font-weight: 500;
  margin-bottom: 1rem;
  color: #333;
}

.about-subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 2rem;
}

.about-description {
  font-size: 15px;
  color: #666;
  line-height: 1.8;
  margin-bottom: 1rem;
}

.about-link {
  display: inline-block;
  margin-top: 1.5rem;
  color: #8b6f47;
  text-decoration: none;
  font-size: 15px;
  transition: color 0.3s;

  &:hover {
    color: #6d5636;
  }
}

@media (max-width: 768px) {
  .about-content {
    flex-direction: column;
    gap: 2rem;
  }

  .about-image {
    width: 100%;
    height: 300px;
  }
}
</style>
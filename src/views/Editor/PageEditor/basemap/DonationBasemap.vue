<template>
  <section class="donation-section">
    <div class="donation-content">
      <h2 class="donation-title">{{ title }}</h2>
      <p class="donation-subtitle">{{ subtitle }}</p>
      <p 
        v-for="(desc, index) in descriptions" 
        :key="index"
        class="donation-description"
      >
        {{ desc }}
      </p>
      <a :href="buttonLink" class="donation-btn">{{ buttonText }}</a>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: '捐款護持'
  },
  subtitle: {
    type: String,
    default: '您的捐款將用於宮廟維護與慈善公益'
  },
  descriptions: {
    type: Array,
    default: () => [
      '支持本宮日常運作、建設修繕及幫助弱勢族群',
      '每一分善款都將妥善運用 功德無量'
    ]
  },
  buttonText: {
    type: String,
    default: '查看所有商品 ›'
  },
  buttonLink: {
    type: String,
    default: '#'
  },
  backgroundColor: {
    type: String,
    default: 'linear-gradient(135deg, #8b7355 0%, #a0826d 100%)'
  }
})
</script>

<style lang="scss" scoped>
.donation-section {
  padding: 6rem 0;
  background: v-bind(backgroundColor);
  text-align: center;
  color: #fff;
}

.donation-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.donation-title {
  font-size: 36px;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.donation-subtitle {
  font-size: 18px;
  margin-bottom: 1rem;
  opacity: 0.95;
}

.donation-description {
  font-size: 16px;
  margin-bottom: 0.8rem;
  opacity: 0.9;
  line-height: 1.8;
}

.donation-btn {
  display: inline-block;
  margin-top: 2rem;
  padding: 1rem 2.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid #fff;
  border-radius: 6px;
  color: #fff;
  text-decoration: none;
  font-size: 15px;
  transition: all 0.3s;

  &:hover {
    background: #fff;
    color: #8b7355;
  }
}
</style>
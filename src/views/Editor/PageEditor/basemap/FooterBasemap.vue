<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-column">
          <h3 class="footer-title">{{ brandName }}</h3>
        </div>
        
        <div 
          v-for="(column, index) in columns"
          :key="index"
          class="footer-column"
        >
          <h4 
            v-for="item in column"
            :key="item"
            class="footer-heading"
          >
            {{ item }}
          </h4>
        </div>
        
        <div class="footer-column">
          <p 
            v-for="(contact, index) in contacts"
            :key="index"
            class="footer-contact"
          >
            {{ contact }}
          </p>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>{{ copyright }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
const props = defineProps({
  brandName: {
    type: String,
    default: '桃園某某宮'
  },
  columns: {
    type: Array,
    default: () => [
      ['最新消息', '慶典活動', '商品與服務'],
      ['捐款護持', '關於我們', '集影牆']
    ]
  },
  contacts: {
    type: Array,
    default: () => [
      '(03) 1234-5678',
      '桃園市XX區XX路XX號',
      'info@temple.com'
    ]
  },
  copyright: {
    type: String,
    default: 'Copyright © 2026 桃園某某宮 | 宮廟'
  }
})
</script>

<style lang="scss" scoped>
.footer {
  background: #2d2d2d;
  color: #fff;
  padding: 3rem 0 0;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #fff;
}

.footer-heading {
  font-size: 14px;
  font-weight: 400;
  margin: 0;
  color: #ccc;
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: #fff;
  }
}

.footer-contact {
  font-size: 14px;
  color: #ccc;
  margin: 0;
  line-height: 1.8;
}

.footer-bottom {
  padding: 1.5rem 0;
  text-align: center;
}

.footer-bottom p {
  margin: 0;
  font-size: 13px;
  color: #999;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .footer-column {
    gap: 0.8rem;
  }
}
</style>

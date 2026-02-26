<template>
  <footer class="footer" :class="`device-${device}`">
    <div class="footer-container">
      <div class="footer-content">
        <!-- 品牌名稱 -->
        <div class="footer-column brand-column">
          <h3 class="footer-title">{{ displayName }}</h3>
        </div>
        
        <!-- 連結欄（桌機：獨立欄；手機：合併成一個區塊） -->
        <div class="footer-links-wrapper">
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
        </div>
        
        <!-- 聯絡資訊 -->
        <div class="footer-column contact-column">
          <p v-if="displayPhone"   class="footer-contact">📞 {{ displayPhone }}</p>
          <p v-if="displayAddress" class="footer-contact">📍 {{ displayAddress }}</p>
          <p v-if="displayEmail"   class="footer-contact">✉️ {{ displayEmail }}</p>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>{{ displayCopyright }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  templeName:    { type: String, default: null },
  templePhone:   { type: String, default: null },
  templeAddress: { type: String, default: null },
  templeEmail:   { type: String, default: null },
  templeId:      { type: String, default: null },
  brandName:     { type: String, default: null },
  contacts:      { type: Array,  default: null },
  copyright:     { type: String, default: null },
  columns: {
    type: Array,
    default: () => [
      ['最新消息', '慶典活動', '商品與服務'],
      ['捐款護持', '關於我們', '集影牆']
    ]
  },
  device: { type: String, default: 'desktop' }
})

const displayName    = computed(() => props.templeName    || props.brandName    || '宮廟名稱')
const displayPhone   = computed(() => props.templePhone   || null)
const displayAddress = computed(() => props.templeAddress || null)
const displayEmail   = computed(() => props.templeEmail   || null)
const displayCopyright = computed(() =>
  props.copyright || `Copyright © ${new Date().getFullYear()} ${displayName.value} | 宮廟`
)
</script>

<style lang="scss" scoped>
.footer {
  background: #2d2d2d;
  color: #fff;
  padding: 3rem 0 0;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* ==================== 桌機版 ==================== */

.footer-content {
  display: grid;
  grid-template-columns: 2fr 2fr 1.5fr;
  gap: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* 連結欄容器：桌機內部再分 2 欄 */
.footer-links-wrapper {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.footer-column {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
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
  white-space: nowrap;
  &:hover { color: #fff; }
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

/* ==================== 平板 ==================== */

.footer.device-tablet {
  padding: 2rem 0 0;

  .footer-container { padding: 0 1.25rem; }

  .footer-content {
    grid-template-columns: 1fr 1.5fr 1.2fr;
    gap: 2rem;
  }

  .footer-links-wrapper {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .footer-title   { font-size: 18px; }
  .footer-heading { font-size: 13px; }
  .footer-contact { font-size: 13px; }
}

/* ==================== 手機 ==================== */

.footer.device-mobile {
  padding: 1.5rem 0 0;

  .footer-container { padding: 0 1rem; }

  /* 垂直堆疊：品牌 → 連結 → 聯絡 */
  .footer-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding-bottom: 1.5rem;
  }

  /* 連結欄在手機仍保持 2 欄橫排，避免文字變直 */
  .footer-links-wrapper {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem 1.5rem;
  }

  .footer-column  { gap: 0.6rem; }
  .footer-title   { font-size: 17px; }
  .footer-heading { font-size: 13px; }
  .footer-contact { font-size: 13px; }
  .footer-bottom  { padding: 1rem 0; }
  .footer-bottom p { font-size: 12px; }
}
</style>
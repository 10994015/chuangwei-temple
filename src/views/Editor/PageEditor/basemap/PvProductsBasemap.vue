<template>
  <section class="pv-products-section" :class="`device-${device}`">
    <div class="pv-container">

      <!-- 標題列 -->
      <div class="pv-section-header">
        <div class="pv-header-left">
          <h2 class="pv-section-title">{{ t('productsBasemap.title') }}</h2>
          <p class="pv-section-subtitle">{{ '嚴選優質結緣品，傳遞祝福與心意' }}</p>
        </div>
        <div class="pv-header-right">
          <a href="#" class="pv-view-all" @click.prevent="$emit('view-all')">
            {{ t('productsBasemap.viewMore') }}
          </a>
          <button class="pv-nav-btn" @click="prevPage" aria-label="上一頁">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button class="pv-nav-btn" @click="nextPage" aria-label="下一頁">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 商品 Grid -->
      <div class="pv-products-grid">
        <div
          v-for="product in displayProducts"
          :key="product.id"
          class="pv-product-card"
        >
          <!-- 圖片區 -->
          <div class="pv-product-image">
            <img
              v-if="product.image && !product.imageFailed"
              :src="product.image"
              :alt="product.title"
              class="pv-image"
              @error="product.imageFailed = true"
            />
            <div v-else class="pv-image-placeholder">
              <span>{{ t('productsBasemap.imagePlaceholder') }}</span>
            </div>

            <!-- badge 右下角 -->
            <span v-if="product.badge" class="pv-badge" :class="product.badgeClass">
              {{ product.badge }}
            </span>
          </div>

          <!-- 文字資訊 -->
          <div class="pv-product-info">
            <p class="pv-product-source">{{ product.source }}</p>
            <h3 class="pv-product-title">{{ product.title }}</h3>
            <div class="pv-product-footer">
              <span class="pv-product-price">{{ product.price }}</span>
              <button class="pv-cart-btn" @click.stop="addToCart(product)" aria-label="加入購物車">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  products: { type: Array,  default: () => [] },
  device:   { type: String, default: 'desktop' },
})

const emit = defineEmits(['add-to-cart', 'view-all'])

const DEFAULT_PRODUCTS = [
  { id: 1, name: '平安符結緣品',   source: '宮廟好物', price: 150,  imgSrc: null, labels: ['熱門'] },
  { id: 2, name: '開運香火袋',     source: '宮廟好物', price: 200,  imgSrc: null, labels: ['推薦'] },
  { id: 3, name: '祈福金紙禮盒',   source: '宮廟好物', price: 380,  imgSrc: null, labels: [] },
  { id: 4, name: '媽祖御守項鍊',   source: '宮廟好物', price: 580,  imgSrc: null, labels: ['新品'] },
]

const pageSize = 4
const pageIndex = ref(0)

const sourceProducts = computed(() =>
  props.products.length > 0 ? props.products : DEFAULT_PRODUCTS
)

const totalPages = computed(() => Math.max(1, Math.ceil(sourceProducts.value.length / pageSize)))

const nextPage = () => {
  if (sourceProducts.value.length <= pageSize) return
  pageIndex.value = (pageIndex.value + 1) % totalPages.value
}

const prevPage = () => {
  if (sourceProducts.value.length <= pageSize) return
  pageIndex.value = (pageIndex.value - 1 + totalPages.value) % totalPages.value
}

const badgeClassMap = (labels) => {
  const label = labels?.[0] || ''
  if (label === '熱門' || label === 'hot')         return 'hot'
  if (label === '推薦' || label === 'recommended') return 'recommended'
  if (label === '新品' || label === 'new')         return 'new'
  return 'hot'
}

const displayProducts = computed(() => {
  const start = pageIndex.value * pageSize
  return sourceProducts.value.slice(start, start + pageSize).map(p => ({
    id:          p.id,
    title:       p.name || '',
    source:      p.source || p.temple || '',
    price:       p.price != null ? `NT$ ${Number(p.price).toLocaleString()}` : '',
    image:       p.imgSrc || null,
    imageFailed: false,
    badge:       Array.isArray(p.labels) && p.labels.length ? p.labels[0] : null,
    badgeClass:  badgeClassMap(p.labels),
  }))
})

const addToCart = (product) => emit('add-to-cart', product)
</script>

<style lang="scss" scoped>
.pv-products-section {
  padding: 3rem 0 4rem;
  background: transparent;
}

.pv-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

// 標題列
.pv-section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.75rem;
}

.pv-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pv-section-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--frame-heading-color, #222);
  margin: 0;
  line-height: 1.2;
}

.pv-section-subtitle {
  font-size: 13px;
  color: var(--frame-text-muted, #999);
  margin: 0;
}

.pv-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pv-view-all {
  padding: 8px 20px;
  border: 1.5px solid var(--frame-border-color, #ddd);
  border-radius: 20px;
  font-size: 14px;
  color: var(--frame-text-color, #444);
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    border-color: #E8572A;
    color: #E8572A;
  }
}

.pv-nav-btn {
  width: 36px;
  height: 36px;
  border: 1.5px solid var(--frame-border-color, #ddd);
  border-radius: 50%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--frame-text-color, #444);

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    border-color: #E8572A;
    color: #E8572A;
  }
}

// 商品 Grid：4 欄
.pv-products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

// 商品卡片
.pv-product-card {
  background: var(--frame-card-bg, #fff);
  border: 1px solid var(--frame-border-color, #eee);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

// 圖片區
.pv-product-image {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #f5f5f5;
}

.pv-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;

  .pv-product-card:hover & {
    transform: scale(1.03);
  }
}

.pv-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--frame-tag-bg, #f0f0f0);

  span {
    font-size: 13px;
    color: var(--frame-text-muted, #bbb);
  }
}

// badge 右下角
.pv-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  line-height: 1.4;

  &.hot         { background: #dc3545; }
  &.recommended { background: #1a73e8; }
  &.new         { background: #2ecc71; }
}

// 文字資訊
.pv-product-info {
  padding: 14px 16px 16px;
}

.pv-product-source {
  font-size: 13px;
  color: var(--frame-text-muted, #999);
  margin: 0 0 4px;
}

.pv-product-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--frame-text-color, #222);
  margin: 0 0 14px;
  line-height: 1.3;
}

.pv-product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pv-product-price {
  font-size: 16px;
  font-weight: 500;
  color: var(--frame-text-color, #333);
}

.pv-cart-btn {
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #E8572A;
  transition: transform 0.2s;
  padding: 0;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover { transform: scale(1.15); }
}

// 響應式
.pv-products-section.device-tablet {
  .pv-container { padding: 0 1.5rem; }
  .pv-products-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .pv-section-title { font-size: 22px; }
}

.pv-products-section.device-mobile {
  padding: 2rem 0 2.5rem;

  .pv-container { padding: 0 1rem; }

  .pv-section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .pv-header-right { align-self: flex-end; }

  .pv-products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .pv-section-title { font-size: 20px; }
  .pv-product-title { font-size: 15px; }
  .pv-product-source { font-size: 12px; }
  .pv-product-price { font-size: 14px; }
}

@media (max-width: 1024px) {
  .pv-products-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .pv-products-grid { grid-template-columns: 1fr; }
}
</style>
<template>
  <section class="products-section" :class="`device-${device}`">
    <div class="container">

      <!-- 標題列 -->
      <div class="section-header">
        <h2 class="section-title">祈福商品</h2>
      </div>

      <!-- 商品 Grid — 固定 3 筆 -->
      <div class="products-grid">
        <div
          v-for="product in displayProducts"
          :key="product.id"
          class="product-card"
        >
          <!-- 圖片區 -->
          <div class="product-image">
            <div v-if="product.rank" class="rank-badge">NO.{{ product.rank }}</div>
            <img
              v-if="product.image && !product.imageFailed"
              :src="product.image"
              :alt="product.title"
              class="image"
              @error="product.imageFailed = true"
            />
            <div v-else class="image-placeholder">
              <span>商品圖片</span>
            </div>
          </div>

          <!-- 資訊區 -->
          <div class="product-info">
            <span v-if="product.badge" class="product-badge" :class="product.badgeClass">
              {{ product.badge }}
            </span>
            <div v-else class="badge-placeholder"></div>

            <h3 class="product-title">{{ product.title }}</h3>

            <div class="product-footer">
              <span class="product-price">{{ product.price }}</span>
              <button class="add-to-cart-btn" @click.stop="addToCart(product)">
                <svg class="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 查看更多 -->
      <div class="view-more-wrap">
        <a href="#" class="view-more-btn" @click.prevent="$emit('view-all')">
          查看更多商品
        </a>
      </div>

    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  productsList: {
    type: Array,
    default: () => [
      { id: 1, rank: 1, title: '平安符',     price: 'NT$200',   image: null, badge: '熱門', badgeClass: 'hot' },
      { id: 2, rank: 2, title: '個人光明燈', price: 'NT$600',   image: null, badge: '推薦', badgeClass: 'recommended' },
      { id: 3, rank: 3, title: '全家光明燈', price: 'NT$1,200', image: null },
      { id: 4,          title: '平安米',     price: 'NT$150',   image: null, badge: '新品', badgeClass: 'new' },
      { id: 5,          title: '香油錢',     price: 'NT$500',   image: null },
      { id: 6,          title: '祈福手環',   price: 'NT$350',   image: null, badge: '熱門', badgeClass: 'hot' },
    ]
  },
  device: { type: String, default: 'desktop' }
})

const emit = defineEmits(['add-to-cart', 'view-all'])

// 固定只取前 3 筆
const displayProducts = computed(() => props.productsList.slice(0, 3))

const addToCart = (product) => {
  emit('add-to-cart', product)
}
</script>

<style lang="scss" scoped>
.products-section {
  padding: 3rem 0 4rem;
  background: #f5f5f5;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* ==================== 標題列 ==================== */
.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 22px;
  font-weight: 600;
  color: #222;
  margin: 0;
}

/* ==================== 商品 Grid — 3 欄 ==================== */
.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  border: 1px solid #ddd;
}

/* ==================== 商品卡片 ==================== */
.product-card {
  background: #fff;
  cursor: pointer;
  transition: box-shadow 0.2s;

  &:hover { box-shadow: inset 0 0 0 2px #c9a55a; }
}

/* 圖片區 */
.product-image {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  background: #efefef;
  overflow: hidden;
}

.rank-badge {
  position: absolute;
  top: 0;
  left: 0;
  padding: 6px 14px;
  background: #8b7355;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  z-index: 2;
  letter-spacing: 0.5px;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #efefef;

  span {
    font-size: 13px;
    color: #bbb;
    letter-spacing: 1px;
  }
}

/* 資訊區 */
.product-info {
  padding: 16px 20px 20px;
}

.product-badge {
  display: inline-block;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  border-radius: 2px;
  margin-bottom: 12px;
  line-height: 1.4;

  &.hot         { background: #dc3545; }
  &.recommended { background: #1a73e8; }
  &.new         { background: #2ecc71; }
}

.badge-placeholder {
  height: 26px;
  margin-bottom: 12px;
}

.product-title {
  font-size: 17px;
  font-weight: 500;
  color: #222;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 20px;
  font-weight: 600;
  color: #8b7355;
}

.add-to-cart-btn {
  width: 38px;
  height: 38px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    border-color: #8b7355;
    background: #8b7355;
    .cart-icon { color: #fff; }
  }
}

.cart-icon {
  width: 18px;
  height: 18px;
  color: #888;
  transition: color 0.2s;
}

/* ==================== 查看更多 ==================== */
.view-more-wrap {
  display: flex;
  justify-content: center;
  margin-top: 36px;
}

.view-more-btn {
  display: inline-block;
  padding: 10px 40px;
  border: 1px solid #8b6f47;
  border-radius: 4px;
  color: #8b6f47;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  background: transparent;

  &:hover {
    background: #8b6f47;
    color: #fff;
  }
}

/* ==================== RWD ==================== */
.products-section.device-tablet {
  .container      { padding: 0 1.25rem; }
  .products-grid  { grid-template-columns: repeat(2, 1fr); }
  .product-title  { font-size: 15px; }
  .product-price  { font-size: 17px; }
}

.products-section.device-mobile {
  padding: 1.5rem 0 2.5rem;

  .container      { padding: 0 0.75rem; }
  .products-grid  { grid-template-columns: repeat(2, 1fr); }
  .product-info   { padding: 10px 12px 14px; }
  .product-title  { font-size: 13px; margin-bottom: 12px; }
  .product-price  { font-size: 15px; }

  .add-to-cart-btn { width: 32px; height: 32px; }
  .cart-icon       { width: 14px; height: 14px; }
  .rank-badge      { font-size: 11px; padding: 4px 10px; }
  .section-title   { font-size: 18px; }
  .view-more-wrap  { margin-top: 24px; }
}
</style>
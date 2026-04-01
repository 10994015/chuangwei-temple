<template>
  <section class="product-list-section" :class="`device-${device}`">
    <div class="container">

      <!-- 篩選欄 -->
      <div class="filter-bar">
        <div class="filter-group">
          <label class="filter-label">{{ t('productListBasemap.labelEvent') }}</label>
          <select class="filter-select wide"><option>{{ t('productListBasemap.all') }}</option></select>
        </div>
        <div class="filter-group">
          <label class="filter-label">{{ t('productListBasemap.labelType') }}</label>
          <select class="filter-select narrow"><option>{{ t('productListBasemap.all') }}</option></select>
        </div>
        <div class="filter-group">
          <label class="filter-label">{{ t('productListBasemap.labelCategory') }}</label>
          <select class="filter-select mid"><option>{{ t('productListBasemap.all') }}</option></select>
        </div>
        <div class="filter-group">
          <label class="filter-label">{{ t('productListBasemap.labelSort') }}</label>
          <select class="filter-select mid"><option>{{ t('productListBasemap.sortPriceAsc') }}</option></select>
        </div>
        <div class="filter-group search-group">
          <label class="filter-label">{{ t('productListBasemap.labelKeyword') }}</label>
          <div class="search-box">
            <input type="text" :placeholder="t('productListBasemap.searchPlaceholder')" class="search-input" />
            <button class="search-btn">{{ t('productListBasemap.searchBtn') }}</button>
          </div>
        </div>
      </div>

      <!-- 批次選擇 -->
      <div class="batch-actions">
        <button class="batch-select-btn">{{ t('productListBasemap.batchSelect') }}</button>
      </div>

      <!-- 精選推薦：有 rank 的，一列 3 欄 -->
      <h2 class="section-title">{{ t('productListBasemap.sectionTitle') }}</h2>
      <div class="products-grid products-grid--featured">
        <div
          v-for="product in featuredProducts"
          :key="product.id"
          class="product-card"
        >
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
              <span>{{ t('productListBasemap.imagePlaceholder') }}</span>
            </div>
          </div>
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

      <!-- 其餘商品：無 rank 的，一列 4 欄 -->
      <div v-if="restProducts.length > 0" class="products-grid products-grid--rest">
        <div
          v-for="product in restProducts"
          :key="product.id"
          class="product-card"
        >
          <div class="product-image">
            <img
              v-if="product.image && !product.imageFailed"
              :src="product.image"
              :alt="product.title"
              class="image"
              @error="product.imageFailed = true"
            />
            <div v-else class="image-placeholder">
              <span>{{ t('productListBasemap.imagePlaceholder') }}</span>
            </div>
          </div>
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

    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  // 後端 frame.data 直接傳入的欄位
  featuredProduct: { type: Array,  default: () => [] },           // 精選商品（有 no 排名）
  productList:     { type: Object, default: () => ({ data: [], total: 0, totalPages: 1 }) },
  device:          { type: String, default: 'desktop' }
})

const mapProduct = (p) => ({
  id:        p.id,
  rank:      p.no ?? null,
  title:     p.name || '',
  price:     p.price != null ? `NT$${Number(p.price).toLocaleString()}` : '',
  image:     p.imgSrc || null,
  badge:     Array.isArray(p.labels) && p.labels.length ? p.labels[0] : null,
  badgeClass: 'hot',
})

const DEFAULT_FEATURED = [
  { id: 1, name: '平安符結緣品', no: 1, price: 150, imgSrc: null, labels: ['熱門'] },
  { id: 2, name: '開運香火袋',   no: 2, price: 200, imgSrc: null, labels: ['推薦'] },
  { id: 3, name: '祈福金紙禮盒', no: 3, price: 380, imgSrc: null, labels: [] },
]

const DEFAULT_REST = [
  { id: 4, name: '媽祖御守項鍊',   price: 580, imgSrc: null, labels: [] },
  { id: 5, name: '五路財神金幣',   price: 120, imgSrc: null, labels: ['熱門'] },
  { id: 6, name: '太歲符令護身符', price: 250, imgSrc: null, labels: [] },
  { id: 7, name: '招財進寶擺飾',   price: 450, imgSrc: null, labels: ['推薦'] },
  { id: 8, name: '開光玉佩吊墜',   price: 320, imgSrc: null, labels: [] },
]

const featuredProducts = computed(() =>
  props.featuredProduct.length > 0 ? props.featuredProduct.map(mapProduct) : DEFAULT_FEATURED.map(mapProduct)
)
const restProducts = computed(() => {
  const data = props.productList?.data
  return (Array.isArray(data) && data.length > 0) ? data.map(mapProduct) : DEFAULT_REST.map(mapProduct)
})

const emit = defineEmits(['add-to-cart'])
const addToCart = (product) => emit('add-to-cart', product)
</script>

<style lang="scss" scoped>
.product-list-section {
  padding: 2rem 0 4rem;
  background: transparent;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* ==================== 篩選欄 ==================== */
.filter-bar {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
  padding: 1.5rem 2rem;
  background: transparent;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 13px;
  color: var(--frame-text-secondary, #555);
  font-weight: 400;
  white-space: nowrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--frame-border-color, #ccc);
  border-radius: 0;
  font-size: 14px;
  color: var(--frame-text-color, #333);
  background: var(--frame-card-bg, #fff);
  cursor: pointer;
  appearance: auto;
  height: 36px;

  &:focus { outline: none; border-color: var(--frame-link-color, #8b7355); }

  &.wide   { min-width: 160px; }
  &.mid    { min-width: 120px; }
  &.narrow { min-width: 80px; }
}

.search-group {
  flex: 1;
  min-width: 280px;
  max-width: 380px;
}

.search-box {
  display: flex;
  height: 36px;
}

.search-input {
  flex: 1;
  padding: 0 12px;
  border: 1px solid var(--frame-border-color, #ccc);
  border-right: none;
  border-radius: 0;
  font-size: 14px;
  height: 36px;
  box-sizing: border-box;
  background: var(--frame-card-bg, #fff);
  color: var(--frame-text-color, #333);

  &:focus { outline: none; border-color: var(--frame-link-color, #8b7355); }
  &::placeholder { color: var(--frame-text-muted, #aaa); }
}

.search-btn {
  padding: 0 20px;
  background: var(--frame-link-color, #8b7355);
  color: #fff;
  border: none;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  height: 36px;
  transition: filter 0.2s;

  &:hover { filter: brightness(0.85); }
}

/* ==================== 批次選擇 ==================== */
.batch-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.batch-select-btn {
  padding: 6px 20px;
  background: var(--frame-card-bg, #fff);
  border: 1px solid var(--frame-border-color, #ccc);
  border-radius: 2px;
  font-size: 14px;
  color: var(--frame-text-secondary, #555);
  cursor: pointer;
  transition: all 0.2s;

  &:hover { border-color: var(--frame-link-color, #8b7355); color: var(--frame-link-color, #8b7355); }
}

/* ==================== 標題 ==================== */
.section-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--frame-heading-color, #222);
  margin: 0 0 1.5rem 0;
}

/* ==================== 商品 Grid ==================== */
.products-grid {
  display: grid;
  gap: 10px;
  margin-bottom: 10px;
}

.products-grid--featured {
  grid-template-columns: repeat(3, 1fr);
}

.products-grid--rest {
  grid-template-columns: repeat(4, 1fr);
}

/* ==================== 商品卡片 ==================== */
.product-card {
  cursor: pointer;
  transition: box-shadow 0.2s;
  border: 1px solid var(--frame-border-color, #ddd);

  &:hover { box-shadow: 0 0 0 2px var(--frame-link-color, #c9a55a); }
}

.product-image {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  background: var(--frame-tag-bg, #efefef);
  overflow: hidden;
}

.rank-badge {
  position: absolute;
  top: 0;
  left: 0;
  padding: 6px 14px;
  background: var(--frame-link-color, #8b7355);
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
  background: var(--frame-tag-bg, #efefef);

  span {
    font-size: 13px;
    color: var(--frame-text-muted, #bbb);
    letter-spacing: 1px;
  }
}

.product-info {
  padding: 16px 20px 20px;
  background-color: var(--frame-card-bg, #fff);
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
}

.badge-placeholder {
  height: 26px;
  margin-bottom: 12px;
}

.product-title {
  font-size: 17px;
  font-weight: 500;
  color: var(--frame-text-color, #222);
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
  color: var(--frame-link-color, #8b7355);
}

.add-to-cart-btn {
  width: 38px;
  height: 38px;
  background: var(--frame-card-bg, #fff);
  border: 1px solid var(--frame-border-color, #ccc);
  border-radius: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    border-color: var(--frame-link-color, #8b7355);
    background: var(--frame-link-color, #8b7355);
    .cart-icon { color: #fff; }
  }
}

.cart-icon {
  width: 18px;
  height: 18px;
  color: var(--frame-text-muted, #888);
  transition: color 0.2s;
}

/* ==================== device prop RWD ==================== */
.product-list-section.device-tablet {
  .container               { padding: 0 1.25rem; }
  .filter-bar              { justify-content: flex-start; padding: 1rem; }
  .products-grid--featured { grid-template-columns: repeat(3, 1fr); }
  .products-grid--rest     { grid-template-columns: repeat(2, 1fr); }
  .product-title           { font-size: 15px; }
  .product-price           { font-size: 17px; }
}

.product-list-section.device-mobile {
  padding: 1rem 0 2rem;
  .container               { padding: 0 0.75rem; }
  .filter-bar              { flex-direction: column; align-items: stretch; padding: 0.75rem; gap: 0.75rem; justify-content: flex-start; }
  .filter-select           { width: 100%; }
  .search-group            { min-width: auto; max-width: 100%; }
  .products-grid--featured { grid-template-columns: 1fr; }
  .products-grid--rest     { grid-template-columns: repeat(2, 1fr); }
  .product-info            { padding: 10px 12px 14px; }
  .product-title           { font-size: 13px; margin-bottom: 12px; }
  .product-price           { font-size: 15px; }
  .add-to-cart-btn         { width: 32px; height: 32px; }
  .cart-icon               { width: 14px; height: 14px; }
  .rank-badge              { font-size: 11px; padding: 4px 10px; }
  .section-title           { font-size: 18px; margin-bottom: 1rem; }
  .batch-actions           { margin-bottom: 1rem; }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .product-list-section .container               { padding: 0 1.25rem; }
  .product-list-section .filter-bar              { justify-content: flex-start; padding: 1rem; }
  .product-list-section .products-grid--featured { grid-template-columns: repeat(3, 1fr); }
  .product-list-section .products-grid--rest     { grid-template-columns: repeat(2, 1fr); }
  .product-list-section .product-title           { font-size: 15px; }
  .product-list-section .product-price           { font-size: 17px; }
}

@media (max-width: 768px) {
  .product-list-section                          { padding: 1rem 0 2rem; }
  .product-list-section .container               { padding: 0 0.75rem; }
  .product-list-section .filter-bar              { flex-direction: column; align-items: stretch; padding: 0.75rem; gap: 0.75rem; justify-content: flex-start; }
  .product-list-section .filter-select           { width: 100%; }
  .product-list-section .search-group            { min-width: auto; max-width: 100%; }
  .product-list-section .products-grid--featured { grid-template-columns: 1fr; }
  .product-list-section .products-grid--rest     { grid-template-columns: repeat(2, 1fr); }
  .product-list-section .product-info            { padding: 10px 12px 14px; }
  .product-list-section .product-title           { font-size: 13px; margin-bottom: 12px; }
  .product-list-section .product-price           { font-size: 15px; }
  .product-list-section .add-to-cart-btn         { width: 32px; height: 32px; }
  .product-list-section .cart-icon               { width: 14px; height: 14px; }
  .product-list-section .rank-badge              { font-size: 11px; padding: 4px 10px; }
  .product-list-section .section-title           { font-size: 18px; margin-bottom: 1rem; }
  .product-list-section .batch-actions           { margin-bottom: 1rem; }
}
</style>
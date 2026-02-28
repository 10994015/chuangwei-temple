<template>
  <section class="product-list-section" :class="`device-${device}`">
    <div class="container">

      <!-- 篩選欄 -->
      <div class="filter-bar">
        <div class="filter-group">
          <label class="filter-label">慶典活動</label>
          <select class="filter-select wide">
            <option>全部</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">類型</label>
          <select class="filter-select narrow">
            <option>全部</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">需求分類</label>
          <select class="filter-select mid">
            <option>全部</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">排序方式</label>
          <select class="filter-select mid">
            <option>價格低到高</option>
          </select>
        </div>

        <div class="filter-group search-group">
          <label class="filter-label">關鍵字搜尋</label>
          <div class="search-box">
            <input type="text" placeholder="搜尋商品或服務名稱" class="search-input" />
            <button class="search-btn">搜尋</button>
          </div>
        </div>
      </div>

      <!-- 批次選擇 -->
      <div class="batch-actions">
        <button class="batch-select-btn">批次選擇</button>
      </div>

      <!-- 精選推薦 -->
      <h2 class="section-title">精選推薦</h2>

      <!-- 商品 Grid -->
      <div class="products-grid">
        <div
          v-for="product in productsList"
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
            <!-- badge 在標題上方 -->
            <span v-if="product.badge" class="product-badge" :class="product.badgeClass">
              {{ product.badge }}
            </span>
            <!-- 無 badge 時補空白高度，保持對齊 -->
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
import { reactive } from 'vue'

const props = defineProps({
  productsList: {
    type: Array,
    default: () => reactive([
      { id: 1, rank: 1, title: '個人光明燈', price: 'NT$600',   image: null },
      { id: 2, rank: 2, title: '平安符',     price: 'NT$200',   image: null, badge: '熱門', badgeClass: 'hot' },
      { id: 3, rank: 3, title: '全家光明燈', price: 'NT$1,200', image: null, badge: '推薦', badgeClass: 'recommended' },
      { id: 4,          title: '平安香',     price: 'NT$150',   image: null },
      { id: 5,          title: '祈福金紙組', price: 'NT$300',   image: null },
      { id: 6,          title: '問事服務',   price: 'NT$500',   image: null },
      { id: 7,          title: '文昌燈',     price: 'NT$600',   image: null },
      { id: 8,          title: '太歲燈',     price: 'NT$800',   image: null, badge: '熱門', badgeClass: 'hot' },
      { id: 9,          title: '財神燈',     price: 'NT$800',   image: null },
    ])
  },
  device: { type: String, default: 'desktop' }
})

const emit = defineEmits(['add-to-cart'])

const addToCart = (product) => {
  emit('add-to-cart', product)
}
</script>

<style lang="scss" scoped>
.product-list-section {
  padding: 2rem 0 4rem;
  background: #f5f5f5;
  min-height: 100vh;
}

.container {
  max-width: 1400px;
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
  color: #555;
  font-weight: 400;
  white-space: nowrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 0;
  font-size: 14px;
  color: #333;
  background: #fff;
  cursor: pointer;
  appearance: auto;
  height: 36px;

  &:focus { outline: none; border-color: #8b7355; }

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
  gap: 0;
  height: 36px;
}

.search-input {
  flex: 1;
  padding: 0 12px;
  border: 1px solid #ccc;
  border-right: none;
  border-radius: 0;
  font-size: 14px;
  height: 36px;
  box-sizing: border-box;

  &:focus { outline: none; border-color: #8b7355; }
}

.search-btn {
  padding: 0 20px;
  background: #8b7355;
  color: #fff;
  border: none;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  height: 36px;
  transition: background 0.2s;

  &:hover { background: #6a5a47; }
}

/* ==================== 批次選擇 ==================== */
.batch-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.batch-select-btn {
  padding: 6px 20px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 2px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { border-color: #8b7355; color: #8b7355; }
}

/* ==================== 標題 ==================== */
.section-title {
  font-size: 22px;
  font-weight: 600;
  color: #222;
  margin: 0 0 1.5rem 0;
}

/* ==================== 商品 Grid — 3 欄 ==================== */
.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;           // 細邊框效果用 gap + 背景色
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
}

.badge-placeholder {
  height: 26px;   // 與 badge 高度相同，保持卡片標題對齊
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

/* ==================== RWD ==================== */
.product-list-section.device-tablet {
  .container { padding: 0 1.25rem; }
  .filter-bar { justify-content: flex-start; padding: 1rem; }
  .products-grid { grid-template-columns: repeat(2, 1fr); }
  .product-title { font-size: 15px; }
  .product-price { font-size: 17px; }
}

.product-list-section.device-mobile {
  padding: 1rem 0 2rem;

  .container { padding: 0 0.75rem; }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    padding: 0.75rem;
    gap: 0.75rem;
    justify-content: flex-start;
  }

  .filter-select { width: 100%; }
  .search-group  { min-width: auto; max-width: 100%; }

  .products-grid { grid-template-columns: repeat(2, 1fr); }

  .product-info  { padding: 10px 12px 14px; }
  .product-title { font-size: 13px; margin-bottom: 12px; }
  .product-price { font-size: 15px; }

  .add-to-cart-btn { width: 32px; height: 32px; }
  .cart-icon       { width: 14px; height: 14px; }
  .rank-badge      { font-size: 11px; padding: 4px 10px; }
  .section-title   { font-size: 18px; margin-bottom: 1rem; }
  .batch-actions   { margin-bottom: 1rem; }
}
</style>
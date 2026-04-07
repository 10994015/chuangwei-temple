<template>
  <section class="pv-product-list-section" :class="`device-${device}`">
    <div class="pv-container">

      <!-- 大標題 -->
      <h2 class="pv-page-title">{{ t('productListBasemap.sectionTitle') || '精選結緣品' }}</h2>

      <!-- 篩選欄 -->
      <div class="pv-filter-bar">
        <select class="pv-filter-select">
          <option>{{ t('productListBasemap.labelType') || '所有類型' }}</option>
        </select>
        <select class="pv-filter-select">
          <option>{{ t('productListBasemap.labelCategory') || '所有需求' }}</option>
        </select>
        <select class="pv-filter-select">
          <option>{{ t('productListBasemap.labelSort') || '預設排序' }}</option>
        </select>
        <div class="pv-search-box">
          <input
            type="text"
            v-model="keyword"
            :placeholder="t('productListBasemap.searchPlaceholder') || '請輸入關鍵字'"
            class="pv-search-input"
          />
          <button class="pv-search-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            {{ t('productListBasemap.searchBtn') || '搜尋' }}
          </button>
        </div>
      </div>

      <!-- 精選推薦標題列 -->
      <div class="pv-featured-header">
        <h3 class="pv-featured-title">{{ t('productListBasemap.featuredTitle') || '精選推薦' }}</h3>
        <div class="pv-featured-actions">
          <button class="pv-batch-btn" @click="toggleBatch">
            {{ t('productListBasemap.batchSelect') || '批次選擇' }}
          </button>
          <button class="pv-nav-circle" @click="featuredPrev" aria-label="上一頁">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button class="pv-nav-circle" @click="featuredNext" aria-label="下一頁">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 精選商品：3 欄 -->
      <div class="pv-products-grid pv-products-grid--featured">
        <div
          v-for="product in pagedFeatured"
          :key="product.id"
          class="pv-product-card"
          :class="{ 'is-selected': selectedIds.includes(product.id) }"
          @click="handleCardClick(product)"
        >
          <div class="pv-product-image">
            <img
              v-if="product.image && !product.imageFailed"
              :src="product.image"
              :alt="product.title"
              class="pv-image"
              @error="product.imageFailed = true"
            />
            <div v-else class="pv-image-placeholder"><span>暫無圖片</span></div>
            <div v-if="batchMode" class="pv-check" :class="{ checked: selectedIds.includes(product.id) }">
              <svg v-if="selectedIds.includes(product.id)" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>
          <div class="pv-product-info">
            <span v-if="product.badge" class="pv-badge" :class="product.badgeClass">{{ product.badge }}</span>
            <p class="pv-product-source">{{ product.source }}</p>
            <h3 class="pv-product-title">{{ product.title }}</h3>
            <div class="pv-product-footer">
              <span class="pv-product-price">{{ product.price }}</span>
              <button class="pv-cart-btn" @click.stop="$emit('add-to-cart', product)" aria-label="加入購物車">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 其餘商品：5 欄 -->
      <div v-if="pagedRest.length > 0" class="pv-products-grid pv-products-grid--rest">
        <div
          v-for="product in pagedRest"
          :key="product.id"
          class="pv-product-card"
          :class="{ 'is-selected': selectedIds.includes(product.id) }"
          @click="handleCardClick(product)"
        >
          <div class="pv-product-image">
            <img
              v-if="product.image && !product.imageFailed"
              :src="product.image"
              :alt="product.title"
              class="pv-image"
              @error="product.imageFailed = true"
            />
            <div v-else class="pv-image-placeholder"><span>暫無圖片</span></div>
            <div v-if="batchMode" class="pv-check" :class="{ checked: selectedIds.includes(product.id) }">
              <svg v-if="selectedIds.includes(product.id)" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>
          <div class="pv-product-info">
            <span v-if="product.badge" class="pv-badge" :class="product.badgeClass">{{ product.badge }}</span>
            <p class="pv-product-source">{{ product.source }}</p>
            <h3 class="pv-product-title">{{ product.title }}</h3>
            <div class="pv-product-footer">
              <span class="pv-product-price">{{ product.price }}</span>
              <button class="pv-cart-btn" @click.stop="$emit('add-to-cart', product)" aria-label="加入購物車">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分頁 -->
      <div v-if="restTotalPages > 1" class="pv-pagination">
        <button
          class="pv-page-circle"
          :class="{ disabled: restPage === 1 }"
          :disabled="restPage === 1"
          @click="restPage > 1 && restPage--"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <template v-for="page in restPageNumbers" :key="page">
          <span v-if="page === '...'" class="pv-page-ellipsis">...</span>
          <button
            v-else
            class="pv-page-circle"
            :class="{ active: restPage === page }"
            @click="restPage = page"
          >{{ page }}</button>
        </template>

        <button
          class="pv-page-circle"
          :class="{ disabled: restPage === restTotalPages }"
          :disabled="restPage === restTotalPages"
          @click="restPage < restTotalPages && restPage++"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  featuredProduct: { type: Array,  default: () => [] },
  productList:     { type: Object, default: () => ({ data: [], total: 0, totalPages: 1 }) },
  device:          { type: String, default: 'desktop' },
})

const emit = defineEmits(['add-to-cart'])

const keyword    = ref('')
const batchMode  = ref(false)
const selectedIds = ref([])

const mapProduct = (p) => ({
  id:          p.id,
  title:       p.name || '',
  source:      p.source || p.tenantName || p.temple || '',
  price:       p.price != null ? `NT$ ${Number(p.price).toLocaleString()}` : '',
  image:       p.imgSrc || null,
  imageFailed: false,
  badge:       Array.isArray(p.labels) && p.labels.length ? p.labels[0] : null,
  badgeClass:  (() => {
    const l = p.labels?.[0] || ''
    if (l === '熱門' || l === 'hot')         return 'hot'
    if (l === '推薦' || l === 'recommended') return 'recommended'
    return 'default'
  })(),
})

const DEFAULT_FEATURED = [
  { id: 1, name: '平安符結緣品',   source: '宮廟好物', price: 150,  imgSrc: null, labels: ['熱門'] },
  { id: 2, name: '開運香火袋',     source: '宮廟好物', price: 200,  imgSrc: null, labels: ['推薦'] },
  { id: 3, name: '祈福金紙禮盒',   source: '宮廟好物', price: 380,  imgSrc: null, labels: [] },
]

const DEFAULT_REST = [
  { id: 4,  name: '媽祖御守項鍊',   source: '宮廟好物', price: 580,  imgSrc: null, labels: ['新品'] },
  { id: 5,  name: '五路財神金幣',   source: '宮廟好物', price: 120,  imgSrc: null, labels: [] },
  { id: 6,  name: '太歲符令護身符', source: '宮廟好物', price: 250,  imgSrc: null, labels: ['熱門'] },
  { id: 7,  name: '招財進寶擺飾',   source: '宮廟好物', price: 450,  imgSrc: null, labels: [] },
  { id: 8,  name: '開光玉佩吊墜',   source: '宮廟好物', price: 320,  imgSrc: null, labels: ['推薦'] },
]

const featuredProducts = computed(() =>
  props.featuredProduct.length > 0 ? props.featuredProduct.map(mapProduct) : DEFAULT_FEATURED.map(mapProduct)
)
const restProducts = computed(() => {
  const data = props.productList?.data
  return (Array.isArray(data) && data.length > 0) ? data.map(mapProduct) : DEFAULT_REST.map(mapProduct)
})

// 精選分頁（每頁 3 筆）
const featuredPageSize = 3
const featuredPage = ref(0)
const featuredTotalPages = computed(() => Math.max(1, Math.ceil(featuredProducts.value.length / featuredPageSize)))
const pagedFeatured = computed(() => {
  const start = featuredPage.value * featuredPageSize
  return featuredProducts.value.slice(start, start + featuredPageSize)
})
const featuredNext = () => { if (featuredPage.value < featuredTotalPages.value - 1) featuredPage.value++ }
const featuredPrev = () => { if (featuredPage.value > 0) featuredPage.value-- }

// rest 分頁（每頁 5 筆）
const restPageSize = 5
const restPage = ref(1)
const restTotalPages = computed(() => Math.max(1, Math.ceil(restProducts.value.length / restPageSize)))
const pagedRest = computed(() => {
  const start = (restPage.value - 1) * restPageSize
  return restProducts.value.slice(start, start + restPageSize)
})
const restPageNumbers = computed(() => {
  const total = restTotalPages.value
  const cur   = restPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (cur <= 4)         return [1, 2, 3, 4, 5, '...', total]
  if (cur >= total - 3) return [1, '...', total-4, total-3, total-2, total-1, total]
  return [1, '...', cur-1, cur, cur+1, '...', total]
})

const toggleBatch = () => {
  batchMode.value = !batchMode.value
  if (!batchMode.value) selectedIds.value = []
}

const handleCardClick = (product) => {
  if (!batchMode.value) return
  const idx = selectedIds.value.indexOf(product.id)
  if (idx === -1) selectedIds.value.push(product.id)
  else selectedIds.value.splice(idx, 1)
}
</script>

<style lang="scss" scoped>
.pv-product-list-section {
  padding: 2.5rem 0 5rem;
  background: transparent;
  min-height: 60vh;
}

.pv-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

// 大標題
.pv-page-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--frame-heading-color, #222);
  margin: 0 0 1.5rem;
}

// 篩選欄
.pv-filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.pv-filter-select {
  height: 40px;
  padding: 0 14px;
  border: 1.5px solid var(--frame-border-color, #ddd);
  border-radius: 20px;
  font-size: 14px;
  color: var(--frame-text-color, #444);
  background: #fff;
  cursor: pointer;
  appearance: auto;
  transition: border-color 0.2s;

  &:focus { outline: none; border-color: #E8572A; }
}

.pv-search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 400px;
}

.pv-search-input {
  flex: 1;
  height: 40px;
  padding: 0 16px;
  border: 1.5px solid var(--frame-border-color, #ddd);
  border-radius: 20px;
  font-size: 14px;
  color: var(--frame-text-color, #333);
  background: #fff;
  transition: border-color 0.2s;

  &:focus { outline: none; border-color: #E8572A; }
  &::placeholder { color: var(--frame-text-muted, #bbb); }
}

.pv-search-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 20px;
  border: 1.5px solid #E8572A;
  border-radius: 20px;
  background: transparent;
  color: #E8572A;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover { background: #E8572A; color: #fff; }
}

// 精選標題列
.pv-featured-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.pv-featured-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--frame-heading-color, #222);
  margin: 0;
}

.pv-featured-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pv-batch-btn {
  height: 36px;
  padding: 0 18px;
  border: 1.5px solid var(--frame-border-color, #ddd);
  border-radius: 20px;
  background: transparent;
  font-size: 14px;
  color: var(--frame-text-color, #555);
  cursor: pointer;
  transition: all 0.2s;

  &:hover { border-color: #E8572A; color: #E8572A; }
}

.pv-nav-circle {
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

  svg { width: 16px; height: 16px; }
  &:hover { border-color: #E8572A; color: #E8572A; }
}

// Grid
.pv-products-grid {
  display: grid;
  gap: 16px;
  margin-bottom: 16px;

  &--featured { grid-template-columns: repeat(3, 1fr); }
  &--rest     { grid-template-columns: repeat(5, 1fr); }
}

// 卡片
.pv-product-card {
  background: var(--frame-card-bg, #fff);
  border: 1px solid var(--frame-border-color, #eee);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;

  &:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.09); transform: translateY(-2px); }
  &.is-selected { box-shadow: 0 0 0 2px #E8572A; }
}

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
  .pv-product-card:hover & { transform: scale(1.03); }
}

.pv-image-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: var(--frame-tag-bg, #f0f0f0);
  span { font-size: 13px; color: var(--frame-text-muted, #bbb); }
}

.pv-badge {
  position: absolute;
  top: 12px; right: 14px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px; font-weight: 600; color: #fff;
  &.hot         { background: #dc3545; }
  &.recommended { background: #1a73e8; }
  &.new         { background: #2ecc71; }
  &.default     { background: #E8572A; }
}

.pv-check {
  position: absolute;
  top: 10px; right: 10px;
  width: 24px; height: 24px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;

  &.checked { background: #E8572A; border-color: #E8572A; }
  svg { width: 14px; height: 14px; }
}

.pv-product-info { position: relative; padding: 12px 14px 14px; }

.pv-product-source {
  font-size: 12px;
  color: var(--frame-text-muted, #999);
  margin: 0 0 3px;
}

.pv-product-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--frame-text-color, #222);
  margin: 0 0 10px;
  line-height: 1.3;
}

.pv-product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pv-product-price {
  font-size: 15px;
  font-weight: 500;
  color: #E8572A;
}

.pv-cart-btn {
  width: 32px; height: 32px;
  background: transparent; border: none;
  cursor: pointer; padding: 0;
  display: flex; align-items: center; justify-content: center;
  color: #E8572A; transition: transform 0.2s;
  svg { width: 18px; height: 18px; }
  &:hover { transform: scale(1.15); }
}

// 分頁
.pv-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 2.5rem;
}

.pv-page-circle {
  width: 38px; height: 38px;
  border: 1.5px solid var(--frame-border-color, #ddd);
  border-radius: 50%;
  background: transparent;
  font-size: 14px;
  color: var(--frame-text-secondary, #555);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
  svg { width: 16px; height: 16px; }

  &:hover:not(.disabled):not(.active) { border-color: #E8572A; color: #E8572A; }
  &.active { background: #E8572A; border-color: #E8572A; color: #fff; font-weight: 600; }
  &.disabled { opacity: 0.35; cursor: default; }
}

.pv-page-ellipsis {
  width: 38px; height: 38px;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; color: var(--frame-text-muted, #bbb);
  letter-spacing: 2px;
}

// 響應式
.pv-product-list-section.device-tablet {
  .pv-container { padding: 0 1.5rem; }
  .pv-products-grid--featured { grid-template-columns: repeat(2, 1fr); }
  .pv-products-grid--rest     { grid-template-columns: repeat(3, 1fr); }
}

.pv-product-list-section.device-mobile {
  padding: 1.5rem 0 3rem;

  .pv-container { padding: 0 1rem; }

  .pv-filter-bar { gap: 8px; }
  .pv-filter-select { font-size: 13px; }
  .pv-search-box { max-width: 100%; }

  .pv-products-grid--featured { grid-template-columns: 1fr; }
  .pv-products-grid--rest     { grid-template-columns: repeat(2, 1fr); }

  .pv-product-title  { font-size: 14px; }
  .pv-product-source { font-size: 11px; }
}

@media (max-width: 1024px) {
  .pv-products-grid--rest { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 640px) {
  .pv-products-grid--featured { grid-template-columns: 1fr; }
  .pv-products-grid--rest     { grid-template-columns: repeat(2, 1fr); }
}
</style>
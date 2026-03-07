<template>
  <div class="donation-product-basemap" :class="`device-${device}`">
    <div class="donation-container">
      <!-- 左側：圖片區 -->
      <div class="image-section">
        <!-- 主圖 -->
        <div class="main-image">
          <img
            v-if="mainImage"
            :src="mainImage"
            alt="捐款商品主圖"
            class="main-img"
          />
          <div v-else class="image-placeholder main-placeholder"></div>
        </div>

        <!-- 縮圖列 -->
        <div class="thumbnail-row">
          <div
            v-for="(img, index) in thumbnails"
            :key="index"
            class="thumbnail-item"
            :class="{ active: selectedThumb === index }"
            @click="selectedThumb = index"
          >
            <img
              v-if="img"
              :src="img"
              :alt="`縮圖 ${index + 1}`"
              class="thumb-img"
            />
            <div v-else class="image-placeholder thumb-placeholder"></div>
          </div>
        </div>
      </div>

      <!-- 右側：捐款表單 -->
      <div class="form-section">
        <!-- 捐款項目 -->
        <div class="form-group">
          <label class="form-label">捐款項目</label>
          <select class="form-select" v-model="selectedItem">
            <option
              v-for="(item, index) in donationItems"
              :key="index"
              :value="item.value"
            >
              {{ item.label }}
            </option>
          </select>
        </div>

        <!-- 電子捐款收據 -->
        <div class="receipt-group" v-if="hasReceipt">
          <p class="receipt-hint">購買此規格將提供</p>
          <div class="receipt-badge">電子捐款收據</div>
        </div>

        <!-- 捐款金額 -->
        <div class="form-group">
          <label class="form-label">捐款金額</label>
          <div class="amount-input-wrapper">
            <span class="currency-label">NT$</span>
            <input
              type="number"
              class="amount-input"
              v-model.number="donationAmount"
              :placeholder="`請輸入捐款金額（最低 NT$${minAmount}）`"
              :min="minAmount"
              @input="validateAmount"
            />
          </div>
          <p v-if="amountError" class="amount-error">{{ amountError }}</p>
        </div>

        <!-- 總計 -->
        <div class="total-row">
          <span class="total-label">總計</span>
          <span class="total-amount">NT$ {{ formattedTotal }}</span>
        </div>

        <!-- 立即捐款按鈕 -->
        <button
          class="donate-btn"
          :disabled="!canDonate"
          @click="handleDonate"
        >
          立即捐款
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  items: {
    type: Array,
    default: () => [
      { label: '一般捐款', value: 'general' },
      { label: '助建基金', value: 'fund' },
      { label: '慈善專案', value: 'charity' },
      { label: '祭典活動', value: 'festival' }
    ]
  },
  min_amount: {
    type: Number,
    default: 100
  },
  has_receipt: {
    type: Boolean,
    default: true
  },
  // ✅ 接收裝置類型
  device: {
    type: String,
    default: 'desktop'
  }
})

// ==================== 圖片 ====================

const selectedThumb = ref(0)

const mainImage = computed(() => {
  if (!props.images || props.images.length === 0) return null
  const idx = selectedThumb.value < props.images.length ? selectedThumb.value : 0
  return props.images[idx]?.src || props.images[idx] || null
})

const thumbnails = computed(() => {
  const result = []
  for (let i = 0; i < 3; i++) {
    const img = props.images?.[i]
    result.push(img ? (img.src || img) : null)
  }
  return result
})

// ==================== 表單 ====================

const donationItems = computed(() => {
  if (!props.items || props.items.length === 0) {
    return [{ label: '一般捐款', value: 'general' }]
  }
  return props.items
})

const selectedItem    = ref(donationItems.value[0]?.value || 'general')
const donationAmount  = ref(null)
const amountError     = ref('')
const minAmount       = computed(() => props.min_amount || 100)
const hasReceipt      = computed(() => props.has_receipt !== false)

const validateAmount = () => {
  if (!donationAmount.value) { amountError.value = ''; return }
  amountError.value = donationAmount.value < minAmount.value
    ? `最低捐款金額為 NT$${minAmount.value}`
    : ''
}

const formattedTotal = computed(() => {
  const amt = donationAmount.value
  if (!amt || amt <= 0) return 0
  return amt.toLocaleString()
})

const canDonate = computed(() =>
  donationAmount.value &&
  donationAmount.value >= minAmount.value &&
  !amountError.value
)

const handleDonate = () => {
  if (!canDonate.value) return
  console.log('捐款:', { item: selectedItem.value, amount: donationAmount.value })
}
</script>

<style scoped>
.donation-product-basemap {
  width: 100%;
  background: transparent;
  padding: 60px 0;
}

.donation-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: start;
}

/* ==================== 左側圖片區 ==================== */

.image-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.main-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f5f5;
}

.main-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumbnail-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.thumbnail-item {
  aspect-ratio: 4 / 3;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;
  background: #f5f5f5;
}

.thumbnail-item.active { border-color: #b5a48a; }
.thumbnail-item:hover  { border-color: #ccc; }

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-placeholder { width: 100%; height: 100%; background: #f0f0f0; }
.main-placeholder  { aspect-ratio: 4 / 3; }

/* ==================== 右側表單區 ==================== */

.form-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  background-color: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  padding: 32px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  background: #fff;
  appearance: auto;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}
.form-select:focus { border-color: #b5a48a; }

.receipt-group { display: flex; flex-direction: column; gap: 8px; }
.receipt-hint  { margin: 0; font-size: 13px; color: #999; }
.receipt-badge {
  display: inline-block;
  padding: 6px 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
  background: #fff;
  width: fit-content;
}

.amount-input-wrapper {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ccc;
  padding-bottom: 8px;
  gap: 12px;
}

.currency-label {
  font-size: 14px;
  color: #999;
  white-space: nowrap;
  flex-shrink: 0;
}

.amount-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  background: transparent;
  padding: 0;
}
.amount-input::placeholder { color: #bbb; }
.amount-input::-webkit-outer-spin-button,
.amount-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.amount-input[type='number'] { -moz-appearance: textfield; }

.amount-error { margin: 0; font-size: 12px; color: #dc3545; }

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 4px;
}

.total-label  { font-size: 15px; color: #333; }
.total-amount { font-size: 18px; color: #b5a48a; font-weight: 500; }

.donate-btn {
  width: 100%;
  padding: 16px;
  background: #b5a48a;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  letter-spacing: 2px;
}
.donate-btn:hover:not(:disabled) { background: #a0917a; }
.donate-btn:disabled { background: #c8bba8; cursor: not-allowed; }

/* ==================== ✅ device prop 響應式（取代 media query）==================== */

/* 平板：左右並排但縮小間距 */
.donation-product-basemap.device-tablet {
  padding: 40px 0;
}
.donation-product-basemap.device-tablet .donation-container {
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  padding: 0 24px;
}
.donation-product-basemap.device-tablet .form-section {
  padding: 24px;
  gap: 20px;
}

/* 手機：垂直堆疊 */
.donation-product-basemap.device-mobile {
  padding: 24px 0;
}
.donation-product-basemap.device-mobile .donation-container {
  grid-template-columns: 1fr;
  gap: 24px;
  padding: 0 16px;
}
.donation-product-basemap.device-mobile .form-section {
  padding: 20px;
  gap: 18px;
}
.donation-product-basemap.device-mobile .form-label {
  font-size: 14px;
}
.donation-product-basemap.device-mobile .form-select {
  padding: 10px 12px;
  font-size: 13px;
}
.donation-product-basemap.device-mobile .donate-btn {
  padding: 14px;
  font-size: 15px;
}
.donation-product-basemap.device-mobile .total-amount {
  font-size: 16px;
}
.donation-product-basemap.device-mobile .thumbnail-row {
  gap: 8px;
}
</style>
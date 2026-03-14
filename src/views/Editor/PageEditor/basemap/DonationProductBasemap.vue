<template>
  <div class="donation-product-basemap" :class="`device-${device}`">
    <div class="donation-container">
      <!-- 左側：圖片區 -->
      <div class="image-section">
        <div class="main-image">
          <img v-if="mainImage" :src="mainImage" :alt="t('donationProductBasemap.mainImageAlt')" class="main-img" />
          <div v-else class="image-placeholder main-placeholder"></div>
        </div>
        <div class="thumbnail-row">
          <div
            v-for="(img, index) in thumbnails"
            :key="index"
            class="thumbnail-item"
            :class="{ active: selectedThumb === index }"
            @click="selectedThumb = index"
          >
            <img v-if="img" :src="img" :alt="`${t('donationProductBasemap.thumbAlt')} ${index + 1}`" class="thumb-img" />
            <div v-else class="image-placeholder thumb-placeholder"></div>
          </div>
        </div>
      </div>

      <!-- 右側：捐款表單 -->
      <div class="form-section">
        <div class="form-group">
          <label class="form-label">{{ t('donationProductBasemap.itemLabel') }}</label>
          <select class="form-select" v-model="selectedItem">
            <option v-for="(item, index) in donationItems" :key="index" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </div>

        <div class="receipt-group" v-if="hasReceipt">
          <p class="receipt-hint">{{ t('donationProductBasemap.receiptHint') }}</p>
          <div class="receipt-badge">{{ t('donationProductBasemap.receiptBadge') }}</div>
        </div>

        <div class="form-group">
          <label class="form-label">{{ t('donationProductBasemap.amountLabel') }}</label>
          <div class="amount-input-wrapper">
            <span class="currency-label">NT$</span>
            <input
              type="number"
              class="amount-input"
              v-model.number="donationAmount"
              :placeholder="t('donationProductBasemap.amountPlaceholder', { min: minAmount })"
              :min="minAmount"
              @input="validateAmount"
            />
          </div>
          <p v-if="amountError" class="amount-error">{{ amountError }}</p>
        </div>

        <div class="total-row">
          <span class="total-label">{{ t('donationProductBasemap.total') }}</span>
          <span class="total-amount">NT$ {{ formattedTotal }}</span>
        </div>

        <button class="donate-btn" :disabled="!canDonate" @click="handleDonate">
          {{ t('donationProductBasemap.donateBtn') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  images:      { type: Array,   default: () => [] },
  items:       { type: Array,   default: undefined },
  min_amount:  { type: Number,  default: 100 },
  has_receipt: { type: Boolean, default: true },
  device:      { type: String,  default: 'desktop' },
})

const selectedThumb = ref(0)

const mainImage = computed(() => {
  if (!props.images?.length) return null
  const idx = selectedThumb.value < props.images.length ? selectedThumb.value : 0
  return props.images[idx]?.src || props.images[idx] || null
})

const thumbnails = computed(() =>
  Array.from({ length: 3 }, (_, i) => {
    const img = props.images?.[i]
    return img ? (img.src || img) : null
  })
)

const donationItems  = computed(() => props.items?.length ? props.items : [
  { label: t('donationProductBasemap.defaultItem1'), value: 'general' },
  { label: t('donationProductBasemap.defaultItem2'), value: 'fund' },
  { label: t('donationProductBasemap.defaultItem3'), value: 'charity' },
  { label: t('donationProductBasemap.defaultItem4'), value: 'festival' },
])
const selectedItem   = ref(donationItems.value[0]?.value || 'general')
const donationAmount = ref(null)
const amountError    = ref('')
const minAmount      = computed(() => props.min_amount || 100)
const hasReceipt     = computed(() => props.has_receipt !== false)

const validateAmount = () => {
  if (!donationAmount.value) { amountError.value = ''; return }
  amountError.value = donationAmount.value < minAmount.value ? t('donationProductBasemap.amountError', { min: minAmount.value }) : ''
}

const formattedTotal = computed(() => {
  const amt = donationAmount.value
  return (!amt || amt <= 0) ? 0 : amt.toLocaleString()
})

const canDonate  = computed(() => donationAmount.value && donationAmount.value >= minAmount.value && !amountError.value)
const handleDonate = () => { if (!canDonate.value) return; console.log('捐款:', { item: selectedItem.value, amount: donationAmount.value }) }
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
.image-section { display: flex; flex-direction: column; gap: 12px; }

.main-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 4px;
  overflow: hidden;
  background: var(--frame-tag-bg, #f5f5f5);
}

.main-img { width: 100%; height: 100%; object-fit: cover; display: block; }

.thumbnail-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }

.thumbnail-item {
  aspect-ratio: 4 / 3;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;
  background: var(--frame-tag-bg, #f5f5f5);
}
.thumbnail-item.active { border-color: var(--frame-link-color, #b5a48a); }
.thumbnail-item:hover  { border-color: var(--frame-border-color, #ccc); }

.thumb-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.image-placeholder { width: 100%; height: 100%; background: var(--frame-tag-bg, #f0f0f0); }
.main-placeholder  { aspect-ratio: 4 / 3; }

/* ==================== 右側表單區 ==================== */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  background-color: var(--frame-card-bg, #fff);
  border: 1px solid var(--frame-border-color, #e5e5e5);
  border-radius: 4px;
  padding: 32px;
}

.form-group { display: flex; flex-direction: column; gap: 10px; }

.form-label { font-size: 15px; font-weight: 500; color: var(--frame-text-color, #333); }

.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--frame-border-color, #ccc);
  border-radius: 4px;
  font-size: 14px;
  color: var(--frame-text-color, #333);
  background: var(--frame-card-bg, #fff);
  appearance: auto;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}
.form-select:focus { border-color: var(--frame-link-color, #b5a48a); }

.receipt-group { display: flex; flex-direction: column; gap: 8px; }
.receipt-hint  { margin: 0; font-size: 13px; color: var(--frame-text-muted, #999); }
.receipt-badge {
  display: inline-block;
  padding: 6px 14px;
  border: 1px solid var(--frame-border-color, #ccc);
  border-radius: 4px;
  font-size: 13px;
  color: var(--frame-text-secondary, #666);
  background: var(--frame-card-bg, #fff);
  width: fit-content;
}

.amount-input-wrapper {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--frame-border-color, #ccc);
  padding-bottom: 8px;
  gap: 12px;
}

.currency-label { font-size: 14px; color: var(--frame-text-muted, #999); white-space: nowrap; flex-shrink: 0; }

.amount-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: var(--frame-text-color, #333);
  background: transparent;
  padding: 0;
}
.amount-input::placeholder { color: var(--frame-text-muted, #bbb); }
.amount-input::-webkit-outer-spin-button,
.amount-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.amount-input[type='number'] { -moz-appearance: textfield; }

.amount-error { margin: 0; font-size: 12px; color: #dc3545; }

.total-row { display: flex; justify-content: space-between; align-items: center; padding-top: 4px; }
.total-label  { font-size: 15px; color: var(--frame-text-color, #333); }
.total-amount { font-size: 18px; color: var(--frame-link-color, #b5a48a); font-weight: 500; }

.donate-btn {
  width: 100%;
  padding: 16px;
  background: var(--frame-link-color, #b5a48a);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: filter 0.2s;
  letter-spacing: 2px;
}
.donate-btn:hover:not(:disabled) { filter: brightness(0.88); }
.donate-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ==================== RWD ==================== */
.donation-product-basemap.device-tablet { padding: 40px 0; }
.donation-product-basemap.device-tablet .donation-container { grid-template-columns: 1fr 1fr; gap: 32px; padding: 0 24px; }
.donation-product-basemap.device-tablet .form-section       { padding: 24px; gap: 20px; }

.donation-product-basemap.device-mobile { padding: 24px 0; }
.donation-product-basemap.device-mobile .donation-container { grid-template-columns: 1fr; gap: 24px; padding: 0 16px; }
.donation-product-basemap.device-mobile .form-section       { padding: 20px; gap: 18px; }
.donation-product-basemap.device-mobile .form-label         { font-size: 14px; }
.donation-product-basemap.device-mobile .form-select        { padding: 10px 12px; font-size: 13px; }
.donation-product-basemap.device-mobile .donate-btn         { padding: 14px; font-size: 15px; }
.donation-product-basemap.device-mobile .total-amount       { font-size: 16px; }
.donation-product-basemap.device-mobile .thumbnail-row      { gap: 8px; }
</style>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 選中的方案
const selectedPlanId = ref(null)

// 定價方案數據
const pricingPlans = [
  {
    id: 'basic',
    icon: '🖼️',
    name: '進階內容方案',
    description: '適合需要活動曝光的宮廟',
    features: [
      '集影牆完整功能',
      '慶典活動頁進階管理',
      '活動報名系統',
      '相簿無限容量',
      '影片上傳功能'
    ],
    price: 2000,
    currency: 'NT$',
    period: '/ 月'
  },
  {
    id: 'ecommerce',
    icon: '🛍️',
    name: '金流與服務方案',
    description: '適合有固定遠持與服務需求的宮廟',
    features: [
      '商品與服務完整上架',
      '捐款進階設定',
      '金流串接服務',
      '訂單管理系統',
      '會員管理功能'
    ],
    price: 3500,
    currency: 'NT$',
    period: '/ 月'
  },
  {
    id: 'enterprise',
    icon: '⚙️',
    name: '完整營運方案',
    description: '適合大型或全年運作宮廟',
    features: [
      '包含所有功能模組',
      '進階曝光與推廣',
      'SEO 優化服務',
      '數據分析報表',
      '優先技術支援',
      '客製化功能開發'
    ],
    price: 6000,
    currency: 'NT$',
    period: '/ 月',
    isRecommended: true
  }
]

// 方案說明
const planNotes = [
  '所有方案皆可隨時升級或降級',
  '免費會員可使用基礎網站功能',
  '付費方案提供 7 天免費試用',
  '年繳方案享 85 折優惠'
]

// 選擇方案
const selectPlan = (plan) => {
  selectedPlanId.value = plan.id
  console.log('選擇方案:', plan.name)
  // TODO: 實作選擇方案邏輯
  // 可能需要導航到付款頁面或顯示確認對話框
}

// 返回編輯器
const handleBack = () => {
  router.back()
}
</script>

<template>
  <div class="pricing-page">
    <div class="container">
      <!-- 返回按鈕 -->
      <button class="back-button" @click="handleBack">
        <svg class="back-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
        </svg>
        返回編輯器
      </button>

      <!-- 標題區 -->
      <div class="header-section">
        <h1 class="page-title">升級您的網站功能</h1>
        <p class="page-subtitle">免費會員可依需求升級以下方案</p>
      </div>

      <!-- 定價卡片網格 -->
      <div class="pricing-grid">
        <div
          v-for="plan in pricingPlans"
          :key="plan.id"
          class="pricing-card"
          :class="{ 
            recommended: plan.isRecommended,
            selected: selectedPlanId === plan.id 
          }"
        >
          <!-- 推薦標籤 -->
          <div v-if="plan.isRecommended" class="recommended-badge">
            ⭐ 推薦方案
          </div>

          <!-- 圖標 -->
          <div class="plan-icon">
            <div class="icon-wrapper">
              <span class="icon-emoji">{{ plan.icon }}</span>
            </div>
          </div>

          <!-- 方案名稱 -->
          <h3 class="plan-name">{{ plan.name }}</h3>
          <p class="plan-description">{{ plan.description }}</p>

          <!-- 功能列表 -->
          <ul class="features-list">
            <li
              v-for="(feature, index) in plan.features"
              :key="index"
              class="feature-item"
            >
              <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              <span>{{ feature }}</span>
            </li>
          </ul>

          <!-- 價格 -->
          <div class="price-section">
            <span class="currency">{{ plan.currency }}</span>
            <span class="price-amount">{{ plan.price.toLocaleString() }}</span>
            <span class="period">{{ plan.period }}</span>
          </div>

          <!-- 選擇按鈕 -->
          <button 
            class="select-button"
            :class="{ active: selectedPlanId === plan.id }"
            @click="selectPlan(plan)"
          >
            {{ selectedPlanId === plan.id ? '✓ 已選擇' : '選擇方案' }}
          </button>
        </div>
      </div>

      <!-- 方案說明 -->
      <div class="plan-notes">
        <div class="notes-header">
          <span class="bulb-icon">💡</span>
          <span class="notes-title">方案說明</span>
        </div>
        <ul class="notes-list">
          <li v-for="(note, index) in planNotes" :key="index" class="note-item">
            {{ note }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pricing-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 40px 20px 80px;
  font-family: 'Microsoft YaHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, sans-serif;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
}

// ========== 返回按鈕 ==========
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 32px;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
}

.back-icon {
  width: 18px;
  height: 18px;
}

// ========== 標題區 ==========
.header-section {
  margin-bottom: 48px;
}

.page-title {
  font-size: 36px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

// ========== 定價網格 ==========
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 48px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }
}

// ========== 定價卡片 ==========
.pricing-card {
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(-4px);
  }

  &.recommended {
    border-color: #3b82f6;
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
  }

  &.selected {
    border-color: #10b981;
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.25);
    background: linear-gradient(to bottom, #ffffff 0%, #f0fdf4 100%);
    
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 16px;
      z-index: -1;
      opacity: 0.15;
    }
  }

  &.recommended.selected {
    border-color: #10b981;
    
    &::before {
      background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
    }
  }
}

.recommended-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.plan-icon {
  margin-bottom: 20px;
}

.icon-wrapper {
  width: 56px;
  height: 56px;
  background: #f3f4f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-emoji {
  font-size: 28px;
  line-height: 1;
}

.plan-name {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.plan-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

// ========== 功能列表 ==========
.features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 28px 0;
  flex: 1;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;

  &:not(:last-child) {
    border-bottom: 1px solid #f3f4f6;
  }
}

.check-icon {
  width: 18px;
  height: 18px;
  color: #10b981;
  flex-shrink: 0;
  margin-top: 2px;
}

// ========== 價格區 ==========
.price-section {
  display: flex;
  align-items: baseline;
  margin-bottom: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.currency {
  font-size: 18px;
  font-weight: 600;
  color: #4b5563;
  margin-right: 4px;
}

.price-amount {
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
  margin-right: 8px;
}

.period {
  font-size: 16px;
  color: #6b7280;
}

// ========== 選擇按鈕 ==========
.select-button {
  width: 100%;
  padding: 14px 24px;
  background: #374151;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #1f2937;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  .recommended & {
    background: #3b82f6;

    &:hover {
      background: #2563eb;
    }
  }

  &.active {
    background: #10b981;
    
    &:hover {
      background: #059669;
    }
  }

  .recommended &.active {
    background: #10b981;
    
    &:hover {
      background: #059669;
    }
  }
}

// ========== 方案說明 ==========
.plan-notes {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.notes-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.bulb-icon {
  font-size: 24px;
  line-height: 1;
}

.notes-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.notes-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.note-item {
  font-size: 14px;
  color: #4b5563;
  padding-left: 24px;
  position: relative;
  line-height: 1.6;

  &::before {
    content: '•';
    position: absolute;
    left: 8px;
    color: #9ca3af;
  }
}

// ========== 響應式設計 ==========
@media (max-width: 1024px) {
  .page-title {
    font-size: 32px;
  }

  .pricing-card {
    padding: 28px 24px;
  }
}

@media (max-width: 768px) {
  .pricing-page {
    padding: 24px 16px 60px;
  }

  .page-title {
    font-size: 28px;
  }

  .page-subtitle {
    font-size: 14px;
  }

  .header-section {
    margin-bottom: 32px;
  }

  .pricing-grid {
    gap: 20px;
    margin-bottom: 32px;
  }

  .price-amount {
    font-size: 32px;
  }

  .plan-notes {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .back-button {
    padding: 8px 16px;
    font-size: 13px;
  }

  .page-title {
    font-size: 24px;
  }

  .pricing-card {
    padding: 24px 20px;
  }

  .plan-name {
    font-size: 18px;
  }

  .price-amount {
    font-size: 28px;
  }

  .plan-notes {
    padding: 20px;
  }

  .notes-title {
    font-size: 16px;
  }

  .note-item {
    font-size: 13px;
  }
}
</style>
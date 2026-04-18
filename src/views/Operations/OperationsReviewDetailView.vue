<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOperationsStore } from '@/stores/operations'

const router = useRouter()
const route  = useRoute()
const operationsStore = useOperationsStore()

const isLoading = ref(true)
const detail    = ref(null)


const applicationStatusMap = {
  SUBMITTED:  '已送出',
  APPROVED:   '已通過',
  REJECTED:   '已拒絕',
  CANCELLED:  '已取消',
}
const reviewStatusMap = {
  PENDING:        '待審核',
  UNDER_REVIEW:   '審核中',
  APPROVED:       '審核通過',
  REVIEW_FAILED:  '審核失敗',
  NEED_RESUBMIT:  '需要重新提交',
}

const fmtDate = (val) => val ? val.slice(0, 10).replace(/-/g, '/') : '-'
const fmtDateTime = (val) => val ? val.slice(0, 16).replace('T', ' ') : '-'

const goBack = () => router.push({ name: 'app.operations.user-management', query: { tab: 'review' } })

onMounted(async () => {
  try {
    detail.value = await operationsStore.fetchDesignerApplicationDetail(
      route.params.userId,
      route.params.applicationId,
    )
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="review-detail-view">
    <nav class="breadcrumb">
      <span class="link" @click="router.push('/operations')">營運後台</span>
      <span class="sep">›</span>
      <span class="link" @click="goBack">用戶管理</span>
      <span class="sep">›</span>
      <span class="current">用戶審核詳細</span>
    </nav>

    <div class="back-row">
      <button class="btn-back" @click="goBack">
        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" /></svg>
        返回
      </button>
    </div>

    <h1 class="page-title">用戶審核詳細</h1>

    <div v-if="isLoading" class="loading">載入中...</div>

    <template v-else-if="detail">

      <!-- 審核狀態 -->
      <div class="section-card">
        <h2 class="section-title">審核狀態</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">申請狀態</span>
            <span class="info-value">
              <span class="badge" :class="{
                'badge-submitted':  detail.applicationStatus === 'SUBMITTED',
                'badge-active':     detail.applicationStatus === 'APPROVED',
                'badge-inactive':   detail.applicationStatus === 'REJECTED',
                'badge-cancelled':  detail.applicationStatus === 'CANCELLED',
              }">{{ applicationStatusMap[detail.applicationStatus] || detail.applicationStatus }}</span>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">審核狀態</span>
            <span class="info-value">
              <span class="badge" :class="{
                'badge-pending':    detail.reviewStatus === 'PENDING',
                'badge-submitted':  detail.reviewStatus === 'UNDER_REVIEW',
                'badge-active':     detail.reviewStatus === 'APPROVED',
                'badge-inactive':   detail.reviewStatus === 'REVIEW_FAILED',
                'badge-cancelled':  detail.reviewStatus === 'NEED_RESUBMIT',
              }">{{ reviewStatusMap[detail.reviewStatus] || detail.reviewStatus }}</span>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">設計師代碼</span>
            <span class="info-value">{{ detail.designerCode || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">審核備註</span>
            <span class="info-value">{{ detail.reviewNote || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">審核日期</span>
            <span class="info-value">{{ fmtDateTime(detail.reviewedAt) }}</span>
          </div>
        </div>
      </div>

      <!-- 基本資料 -->
      <div class="section-card">
        <h2 class="section-title">基本資料</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">姓名</span>
            <span class="info-value">{{ detail.fullName || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">身分證字號</span>
            <span class="info-value">{{ detail.idNumber || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">出生日期</span>
            <span class="info-value">{{ fmtDate(detail.birthDate) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">信箱</span>
            <span class="info-value">{{ detail.email || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">聯絡電話</span>
            <span class="info-value">{{ detail.phone || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">國籍</span>
            <span class="info-value">{{ detail.countryCodeAlpha3 || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">是否為公司</span>
            <span class="info-value">{{ detail.isCompany ? '是' : '否' }}</span>
          </div>
        </div>
      </div>

      <!-- 地址資料 -->
      <div class="section-card">
        <h2 class="section-title">地址資料</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">縣市</span>
            <span class="info-value">{{ detail.city || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">行政區</span>
            <span class="info-value">{{ detail.district || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">郵遞區號</span>
            <span class="info-value">{{ detail.postalCode || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">地址</span>
            <span class="info-value">{{ detail.address || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 銀行資料 -->
      <div class="section-card">
        <h2 class="section-title">銀行資料</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">銀行名稱</span>
            <span class="info-value">{{ detail.bankName || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">銀行帳號</span>
            <span class="info-value">{{ detail.bankAccount || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 時間資訊 -->
      <div class="section-card">
        <h2 class="section-title">時間資訊</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">申請日期</span>
            <span class="info-value">{{ fmtDateTime(detail.createdAt) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">最後更新</span>
            <span class="info-value">{{ fmtDateTime(detail.updatedAt) }}</span>
          </div>
        </div>
      </div>

    </template>

    <div v-else class="loading">找不到此審核資料</div>
  </div>
</template>

<style scoped lang="scss">
.review-detail-view {
  padding: 24px;
  background: #f3f4f6;
  min-height: 100%;
  font-family: 'Noto Sans TC', sans-serif;
}

.breadcrumb {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  .sep     { color: #d1d5db; }
  .current { color: #E8572A; }
  .link    { cursor: pointer; &:hover { color: #374151; } }
}

.back-row { margin-bottom: 12px; }

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  font-family: 'Noto Sans TC', sans-serif;
  &:hover { background: #f9fafb; }
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 20px;
}

.loading {
  text-align: center;
  padding: 60px;
  color: #9ca3af;
}

.section-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 24px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #1f2937;
}

.badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  &.badge-active    { background: #d1fae5; color: #065f46; }
  &.badge-inactive  { background: #fee2e2; color: #991b1b; }
  &.badge-submitted { background: #dbeafe; color: #1e40af; }
  &.badge-pending   { background: #fef9c3; color: #854d0e; }
  &.badge-cancelled { background: #f3f4f6; color: #6b7280; }
}
</style>

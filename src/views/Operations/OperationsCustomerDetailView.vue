<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOperationsStore } from '@/stores/operations'

const router = useRouter()
const route  = useRoute()
const operationsStore = useOperationsStore()

const isLoading = ref(true)
const customer  = ref(null)

const genderMap = { MALE: '男', FEMALE: '女', OTHER: '其他' }
const statusMap  = { OPEN: '啟用', INVALID: '停用', LOCK: '封鎖' }

const fmtDate = (val) => val ? val.slice(0, 10).replace(/-/g, '/') : '-'
const fmtDateTime = (val) => val ? val.slice(0, 16).replace('T', ' ') : '-'

const goBack = () => router.push({ name: 'app.operations.user-management' })

onMounted(async () => {
  try {
    customer.value = await operationsStore.fetchCustomerDetail(route.params.userId)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="customer-detail-view">
    <nav class="breadcrumb">
      <span class="link" @click="router.push('/operations')">營運後台</span>
      <span class="sep">›</span>
      <span class="link" @click="goBack">用戶管理</span>
      <span class="sep">›</span>
      <span class="current">香客詳細資料</span>
    </nav>

    <div class="back-row">
      <button class="btn-back" @click="goBack">
        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" /></svg>
        返回
      </button>
    </div>

    <h1 class="page-title">香客詳細資料</h1>

    <div v-if="isLoading" class="loading">載入中...</div>

    <template v-else-if="customer">
      <!-- 基本資料 -->
      <div class="section-card">
        <h2 class="section-title">基本資料</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">姓名</span>
            <span class="info-value">{{ customer.name || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">帳號</span>
            <span class="info-value">{{ customer.credential || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">信箱</span>
            <span class="info-value">{{ customer.email || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">性別</span>
            <span class="info-value">{{ genderMap[customer.gender] || customer.gender || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">出生日期</span>
            <span class="info-value">{{ fmtDate(customer.birthDate) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">聯絡電話</span>
            <span class="info-value">{{ customer.phone || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">地址</span>
            <span class="info-value">{{ customer.address || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">身分證字號</span>
            <span class="info-value">{{ customer.identificationNumber || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">狀態</span>
            <span class="info-value">
              <span class="badge" :class="{
                'badge-active':   customer.status === 'OPEN',
                'badge-inactive': customer.status === 'INVALID',
                'badge-lock':     customer.status === 'LOCK',
              }">{{ statusMap[customer.status] || customer.status }}</span>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">登入方式</span>
            <span class="info-value">{{ customer.provider || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 時間資訊 -->
      <div class="section-card">
        <h2 class="section-title">時間資訊</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">加入日期</span>
            <span class="info-value">{{ fmtDateTime(customer.createdAt) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">最後更新</span>
            <span class="info-value">{{ fmtDateTime(customer.updatedAt) }}</span>
          </div>
          <div class="info-item" v-if="customer.deletedAt">
            <span class="info-label">刪除時間</span>
            <span class="info-value">{{ fmtDateTime(customer.deletedAt) }}</span>
          </div>
        </div>
      </div>

      <!-- 所屬租客（宮廟）-->
      <div class="section-card">
        <h2 class="section-title">所屬宮廟</h2>
        <div v-if="!customer.tenants || customer.tenants.length === 0" class="empty-text">無關聯宮廟</div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>宮廟名稱</th>
              <th>類型</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in customer.tenants" :key="t.tenantId">
              <td>{{ t.tenantName }}</td>
              <td>{{ t.tenantType }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <div v-else class="loading">找不到此用戶資料</div>
  </div>
</template>

<style scoped lang="scss">
.customer-detail-view {
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
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
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
  &.badge-active   { background: #d1fae5; color: #065f46; }
  &.badge-inactive { background: #f3f4f6; color: #6b7280; }
  &.badge-lock     { background: #fee2e2; color: #991b1b; }
}

.empty-text {
  font-size: 14px;
  color: #9ca3af;
  padding: 12px 0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th {
    text-align: left;
    padding: 10px 12px;
    background: #f9fafb;
    color: #6b7280;
    font-size: 12px;
    font-weight: 600;
    border-bottom: 1px solid #e5e7eb;
  }

  td {
    padding: 12px;
    color: #374151;
    border-bottom: 1px solid #f3f4f6;
  }

  tr:last-child td { border-bottom: none; }
}
</style>

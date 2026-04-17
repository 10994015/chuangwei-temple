<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useOperationsStore } from '@/stores/operations'

const operationsStore = useOperationsStore()

const activeTab = ref('customer')

const tabs = [
  { key: 'customer', label: '香客管理' },
  { key: 'creator',  label: '創作者管理' },
  { key: 'review',   label: '用戶審核' },
]

const pageTitle = computed(() => {
  const found = tabs.find(t => t.key === activeTab.value)
  return found?.label || ''
})

// ── 創作者管理 ──
const creatorQ                = ref('')
const creatorType             = ref('')
const creatorStatus           = ref('')
const creatorStartAt          = ref('')
const creatorEndAt            = ref('')
const creatorPublishedCountMin = ref('')
const creatorPublishedCountMax = ref('')
const creatorPage             = ref(1)

const statusMap = { OPEN: '啟用', INVALID: '停用', LOCK: '封鎖' }

const loadDesigners = () => {
  operationsStore.fetchDesigners({
    q:                 creatorQ.value,
    type:              creatorType.value,
    status:            creatorStatus.value,
    startAt:           creatorStartAt.value  ? creatorStartAt.value  + 'T00:00:00.000Z' : '',
    endAt:             creatorEndAt.value    ? creatorEndAt.value    + 'T23:59:59.999Z' : '',
    publishedCountMin: creatorPublishedCountMin.value,
    publishedCountMax: creatorPublishedCountMax.value,
    page:              creatorPage.value,
    pageSize:          10,
  })
}

const onCreatorSearch = () => {
  creatorPage.value = 1
  loadDesigners()
}

const goCreatorPage = (page) => {
  if (page >= 1 && page <= operationsStore.designersTotalPages) {
    creatorPage.value = page
    loadDesigners()
  }
}

const fmtDate = (val) => val ? val.slice(0, 10).replace(/-/g, '/') : ''

// ── 香客管理 ──
const customerBirthStart = ref('')
const customerBirthEnd   = ref('')
const customerJoinStart  = ref('')
const customerJoinEnd    = ref('')
const customerPage       = ref(1)

const loadCustomers = () => {
  operationsStore.fetchCustomers({
    startAt:  customerJoinStart.value ? customerJoinStart.value + 'T00:00:00.000Z' : '',
    endAt:    customerJoinEnd.value   ? customerJoinEnd.value   + 'T23:59:59.999Z' : '',
    page:     customerPage.value,
    pageSize: 10,
  })
}

const onCustomerSearch = () => {
  customerPage.value = 1
  loadCustomers()
}

const goCustomerPage = (page) => {
  if (page >= 1 && page <= operationsStore.customersTotalPages) {
    customerPage.value = page
    loadCustomers()
  }
}

// ── 用戶審核 ──
const reviewRoleFilter  = ref('')
const reviewStartAt     = ref('')
const reviewEndAt       = ref('')
const reviewPage        = ref(1)

const loadDesignerApplications = () => {
  operationsStore.fetchDesignerApplications({
    reviewStatus: reviewRoleFilter.value,
    startAt:      reviewStartAt.value ? reviewStartAt.value + 'T00:00:00.000Z' : '',
    endAt:        reviewEndAt.value   ? reviewEndAt.value   + 'T23:59:59.999Z' : '',
    page:         reviewPage.value,
    pageSize:     10,
  })
}

const onReviewSearch = () => {
  reviewPage.value = 1
  loadDesignerApplications()
}

const goReviewPage = (page) => {
  if (page >= 1 && page <= operationsStore.designerApplicationsTotalPages) {
    reviewPage.value = page
    loadDesignerApplications()
  }
}

watch(activeTab, (tab) => {
  if (tab === 'creator')  loadDesigners()
  if (tab === 'customer') loadCustomers()
  if (tab === 'review')   loadDesignerApplications()
})

onMounted(() => {
  loadCustomers()
})
</script>

<template>
  <div class="user-mgmt-view">
    <div class="page-header">
      <h1 class="page-title">{{ pageTitle }}</h1>
    </div>

    <!-- 分頁標籤 -->
    <div class="tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ══ 創作者管理 ══ -->
    <template v-if="activeTab === 'creator'">
      <!-- 篩選 -->
      <div class="filter-card">
        <div class="filter-row">
          <div class="filter-field">
            <label class="filter-label">關鍵字</label>
            <input v-model="creatorQ" type="text" class="filter-input" placeholder="請輸入關鍵字" @keydown.enter="onCreatorSearch" />
          </div>
          <div class="filter-field">
            <label class="filter-label">類型</label>
            <select v-model="creatorType" class="filter-select" @change="onCreatorSearch">
              <option value="">選擇類型</option>
              <option value="COMPANY">公司</option>
              <option value="PERSONAL">香客</option>
            </select>
          </div>
          <div class="filter-field">
            <label class="filter-label">狀態</label>
            <select v-model="creatorStatus" class="filter-select" @change="onCreatorSearch">
              <option value="">選擇狀態</option>
              <option value="OPEN">啟用</option>
              <option value="INVALID">停用</option>
              <option value="LOCK">封鎖</option>
            </select>
          </div>
          <div class="filter-field date-range">
            <label class="filter-label">審核日期</label>
            <div class="date-row">
              <input v-model="creatorStartAt" type="date" class="filter-input date-input" placeholder="開始日期" @change="onCreatorSearch" />
              <span class="date-sep">~</span>
              <input v-model="creatorEndAt" type="date" class="filter-input date-input" placeholder="結束日期" @change="onCreatorSearch" />
            </div>
          </div>
        </div>
        <!-- 第二排：已發布模板數量 -->
        <div class="filter-row filter-row-2">
          <div class="filter-field">
            <label class="filter-label">已發布模板數量</label>
            <div class="date-row">
              <input v-model="creatorPublishedCountMin" type="number" min="0" class="filter-input count-input" placeholder="最低數量" />
              <span class="date-sep">~</span>
              <input v-model="creatorPublishedCountMax" type="number" min="0" class="filter-input count-input" placeholder="最高數量" />
            </div>
          </div>
        </div>
      </div>

      <!-- 操作列（右對齊，無新增按鈕） -->
      <div class="action-row action-row-right">
        <button class="btn-outlined">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
          下載資料統計表
        </button>
        <button class="btn-outlined">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
          匯出當前篩選結果
        </button>
      </div>

      <!-- 表格 -->
      <div class="table-card">
        <div v-if="operationsStore.isDesignerLoading" class="loading-row">載入中...</div>
        <div class="table-wrap" v-else>
          <table class="data-table">
            <thead>
              <tr>
                <th>創作者名稱</th>
                <th>類型</th>
                <th>聯絡電話</th>
                <th>信箱</th>
                <th>已發布模板數量</th>
                <th>審核日期</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="operationsStore.designers.length === 0">
                <td colspan="8" class="td-empty">暫無資料</td>
              </tr>
              <tr v-for="row in operationsStore.designers" :key="row.designerApplicationId">
                <td><strong>{{ row.name }}</strong></td>
                <td>{{ row.type === 'COMPANY' ? '公司' : row.type === 'PERSONAL' ? '香客' : row.type }}</td>
                <td>{{ row.phone }}</td>
                <td>{{ row.email }}</td>
                <td>{{ row.publishedTemplateCount ?? '-' }}</td>
                <td>{{ fmtDate(row.reviewedAt) }}</td>
                <td>
                  <span class="badge" :class="{
                    'badge-active':   row.status === 'OPEN',
                    'badge-inactive': row.status === 'INVALID',
                    'badge-lock':     row.status === 'LOCK',
                  }">
                    {{ statusMap[row.status] || row.status }}
                  </span>
                </td>
                <td>
                  <div class="action-btns">
                    <button class="icon-btn" title="查看">
                      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg>
                    </button>
                    <button class="icon-btn" title="宮廟詳情">
                      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination" v-if="!operationsStore.isDesignerLoading">
          <button class="page-btn" :disabled="creatorPage === 1" @click="goCreatorPage(creatorPage - 1)">上一頁</button>
          <template v-if="operationsStore.designersTotalPages > 0">
            <button
              v-for="p in operationsStore.designersTotalPages" :key="p"
              class="page-btn page-num"
              :class="{ current: p === creatorPage }"
              @click="goCreatorPage(p)"
            >{{ p }}</button>
          </template>
          <button v-else class="page-btn page-num current">1</button>
          <button class="page-btn" :disabled="creatorPage === operationsStore.designersTotalPages || operationsStore.designersTotalPages === 0" @click="goCreatorPage(creatorPage + 1)">下一頁</button>
        </div>
      </div>
    </template>

    <!-- ══ 用戶審核 ══ -->
    <template v-else-if="activeTab === 'review'">
      <div class="filter-card">
        <div class="filter-row">
          <div class="filter-field date-range">
            <label class="filter-label">申請日期</label>
            <div class="date-row">
              <input v-model="reviewStartAt" type="date" class="filter-input date-input" @change="onReviewSearch" />
              <span class="date-sep">~</span>
              <input v-model="reviewEndAt" type="date" class="filter-input date-input" @change="onReviewSearch" />
            </div>
          </div>
          <div class="action-right" style="margin-left: auto; display: flex; gap: 8px; align-items: flex-end;">
            <button class="btn-outlined">
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
              下載資料統計表
            </button>
            <button class="btn-outlined">
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
              匯出當前篩選結果
            </button>
          </div>
        </div>
      </div>

      <div class="table-card">
        <div v-if="operationsStore.isDesignerApplicationLoading" class="loading-row">載入中...</div>
        <div class="table-wrap" v-else>
          <table class="data-table">
            <thead>
              <tr>
                <th>用戶名稱</th>
                <th>連絡電話</th>
                <th>信箱</th>
                <th>地址</th>
                <th>申請日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="operationsStore.designerApplications.length === 0">
                <td colspan="6" class="td-empty">暫無資料</td>
              </tr>
              <tr v-for="row in operationsStore.designerApplications" :key="row.id">
                <td><strong>{{ row.fullName }}</strong></td>
                <td>{{ row.phone || '-' }}</td>
                <td>{{ row.email || '-' }}</td>
                <td class="td-ellipsis">{{ row.address || '-' }}</td>
                <td>{{ fmtDate(row.createdAt) }}</td>
                <td>
                  <div class="action-btns">
                    <button class="icon-btn" title="查看">
                      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination" v-if="!operationsStore.isDesignerApplicationLoading">
          <button class="page-btn" :disabled="reviewPage === 1" @click="goReviewPage(reviewPage - 1)">上一頁</button>
          <template v-if="operationsStore.designerApplicationsTotalPages > 0">
            <button
              v-for="p in operationsStore.designerApplicationsTotalPages" :key="p"
              class="page-btn page-num"
              :class="{ current: p === reviewPage }"
              @click="goReviewPage(p)"
            >{{ p }}</button>
          </template>
          <button v-else class="page-btn page-num current">1</button>
          <button class="page-btn" :disabled="reviewPage === operationsStore.designerApplicationsTotalPages || operationsStore.designerApplicationsTotalPages === 0" @click="goReviewPage(reviewPage + 1)">下一頁</button>
        </div>
      </div>
    </template>

    <!-- ══ 香客管理 ══ -->
    <template v-else-if="activeTab === 'customer'">
      <!-- 篩選 -->
      <div class="filter-card">
        <div class="filter-row">
          <div class="filter-field date-range">
            <label class="filter-label">出生日期</label>
            <div class="date-row">
              <input v-model="customerBirthStart" type="date" class="filter-input date-input" placeholder="開始日期" />
              <span class="date-sep">~</span>
              <input v-model="customerBirthEnd" type="date" class="filter-input date-input" placeholder="結束日期" />
            </div>
          </div>
          <div class="filter-field date-range">
            <label class="filter-label">加入日期</label>
            <div class="date-row">
              <input v-model="customerJoinStart" type="date" class="filter-input date-input" placeholder="開始日期" @change="onCustomerSearch" />
              <span class="date-sep">~</span>
              <input v-model="customerJoinEnd" type="date" class="filter-input date-input" placeholder="結束日期" @change="onCustomerSearch" />
            </div>
          </div>
        </div>
      </div>

      <!-- 操作列 -->
      <div class="action-row action-row-right">
        <button class="btn-outlined">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
          下載資料統計表
        </button>
        <button class="btn-outlined">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
          匯出當前篩選結果
        </button>
      </div>

      <!-- 表格 -->
      <div class="table-card">
        <div v-if="operationsStore.isCustomerLoading" class="loading-row">載入中...</div>
        <div class="table-wrap" v-else>
          <table class="data-table">
            <thead>
              <tr>
                <th>香客名稱</th>
                <th>出生日期</th>
                <th>身分證字號</th>
                <th>聯絡電話</th>
                <th>信箱</th>
                <th>加入日期</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="operationsStore.customers.length === 0">
                <td colspan="8" class="td-empty">暫無資料</td>
              </tr>
              <tr v-for="row in operationsStore.customers" :key="row.id">
                <td><strong>{{ row.name }}</strong></td>
                <td>{{ row.birthDate || '-' }}</td>
                <td>{{ row.identificationNumber || '-' }}</td>
                <td>{{ row.phone || '-' }}</td>
                <td>{{ row.email }}</td>
                <td>{{ fmtDate(row.createdAt) }}</td>
                <td>
                  <span class="badge" :class="{
                    'badge-active':   row.status === 'OPEN',
                    'badge-inactive': row.status === 'INVALID',
                    'badge-lock':     row.status === 'LOCK',
                  }">
                    {{ statusMap[row.status] || row.status }}
                  </span>
                </td>
                <td>
                  <div class="action-btns">
                    <button class="icon-btn" title="查看">
                      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination" v-if="!operationsStore.isCustomerLoading">
          <button class="page-btn" :disabled="customerPage === 1" @click="goCustomerPage(customerPage - 1)">上一頁</button>
          <template v-if="operationsStore.customersTotalPages > 0">
            <button
              v-for="p in operationsStore.customersTotalPages" :key="p"
              class="page-btn page-num"
              :class="{ current: p === customerPage }"
              @click="goCustomerPage(p)"
            >{{ p }}</button>
          </template>
          <button v-else class="page-btn page-num current">1</button>
          <button class="page-btn" :disabled="customerPage === operationsStore.customersTotalPages || operationsStore.customersTotalPages === 0" @click="goCustomerPage(customerPage + 1)">下一頁</button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.user-mgmt-view {
  padding: 24px;
  background: #f3f4f6;
  min-height: 100%;
  font-family: 'Noto Sans TC', sans-serif;
}

.page-header { margin-bottom: 16px; }

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

// ── tab bar ──
.tab-bar {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  font-family: 'Noto Sans TC', sans-serif;
  transition: color 0.15s, border-color 0.15s;

  &:hover { color: #374151; }

  &.active {
    color: #E8572A;
    border-bottom-color: #E8572A;
    font-weight: 600;
  }
}

// ── filter card ──
.filter-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.filter-row-2 {
  border-top: 1px solid #f3f4f6;
  padding-top: 14px;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 140px;
}

.filter-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

.filter-input,
.filter-select {
  height: 36px;
  padding: 0 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  color: #374151;
  background: #fff;
  font-family: 'Noto Sans TC', sans-serif;
  transition: border-color 0.15s;
  box-sizing: border-box;

  &:focus { outline: none; border-color: #E8572A; }
  &::placeholder { color: #bbb; }
}

.filter-select { cursor: pointer; }

.date-range { min-width: 280px; }

.date-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-input,
.count-input {
  flex: 1;
  min-width: 0;
}

.date-sep { font-size: 13px; color: #9ca3af; flex-shrink: 0; }

// ── action row ──
.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
}

.action-row-right {
  justify-content: flex-end;
}

.btn-add {
  padding: 8px 18px;
  background: #E8572A;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Noto Sans TC', sans-serif;
  transition: background 0.15s;
  &:hover { background: #d94b1f; }
}

.action-right { display: flex; gap: 10px; }

.btn-outlined {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  font-family: 'Noto Sans TC', sans-serif;
  transition: all 0.15s;
  &:hover { background: #f9fafb; border-color: #9ca3af; }
}

// ── table ──
.table-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  overflow: hidden;
}

.table-wrap { overflow-x: auto; }

.loading-row {
  padding: 40px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  thead tr {
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }

  th {
    padding: 12px 14px;
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    white-space: nowrap;
  }

  td {
    padding: 13px 14px;
    color: #374151;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: middle;
    white-space: nowrap;
  }

  tbody tr:last-child td { border-bottom: none; }
  tbody tr:hover td { background: #fafafa; }
}

.td-ellipsis {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.td-empty {
  text-align: center;
  color: #9ca3af;
  padding: 40px !important;
}

// ── badges ──
.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.badge-active   { background: #d1fae5; color: #065f46; }
.badge-inactive { background: #fee2e2; color: #991b1b; }
.badge-lock     { background: #fce7f3; color: #9d174d; }

.sub-text {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

// ── action buttons ──
.action-btns { display: flex; gap: 6px; align-items: center; }

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.15s;
  &:hover { background: #e5e7eb; color: #374151; }
}

// ── pagination ──
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px;
  border-top: 1px solid #f3f4f6;
}

.page-btn {
  padding: 6px 12px;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  font-family: 'Noto Sans TC', sans-serif;
  transition: all 0.15s;

  &:hover:not(:disabled) { background: #f9fafb; border-color: #d1d5db; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.page-num {
  min-width: 34px;
  text-align: center;

  &.current {
    background: #E8572A;
    border-color: #E8572A;
    color: #fff;
    font-weight: 600;
    border-radius: 50%;
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }
}

// ── empty tab ──
.empty-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  gap: 16px;
}

.empty-text { font-size: 15px; color: #9ca3af; margin: 0; }

// ── RWD ──
@media (max-width: 768px) {
  .user-mgmt-view { padding: 16px; }
  .filter-row { flex-direction: column; }
  .filter-field { width: 100%; min-width: 0; }
  .date-range { min-width: 0; width: 100%; }
  .action-row, .action-row-right { flex-direction: column; align-items: flex-start; }
}
</style>

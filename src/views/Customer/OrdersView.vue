<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 篩選條件
const searchQuery = ref('')
const statusFilter = ref('全部狀態')
const dateFilter = ref('')
const showStatusDropdown = ref(false)

const statusOptions = ['全部狀態', '已完成', '未完成']

// 模擬訂單資料
const allOrders = ref([
  { id: 'ORD20240126001', date: '2024-01-26', temple: '龍山寺',  amount: 1280,  status: '已完成' },
  { id: 'DON20240125002', date: '2024-01-25', temple: '行天宮',  amount: 3600,  status: '已完成' },
  { id: 'ORD20240124003', date: '2024-01-24', temple: '保安宮',  amount: 2450,  status: '未完成' },
  { id: 'DON20240123004', date: '2024-01-23', temple: '鎮瀾宮',  amount: 5000,  status: '已完成' },
  { id: 'ORD20240122005', date: '2024-01-22', temple: '天后宮',  amount: 500,   status: '已完成' },
  { id: 'ORD20240121006', date: '2024-01-21', temple: '文昌宮',  amount: 800,   status: '未完成' },
  { id: 'DON20240120007', date: '2024-01-20', temple: '龍山寺',  amount: 10000, status: '已完成' },
  { id: 'ORD20240119008', date: '2024-01-19', temple: '行天宮',  amount: 1680,  status: '已完成' },
  { id: 'ORD20240118009', date: '2024-01-18', temple: '保安宮',  amount: 350,   status: '已完成' },
  { id: 'DON20240117010', date: '2024-01-17', temple: '鎮瀾宮',  amount: 2000,  status: '未完成' },
  { id: 'ORD20240116011', date: '2024-01-16', temple: '天后宮',  amount: 1200,  status: '已完成' },
  { id: 'ORD20240115012', date: '2024-01-15', temple: '文昌宮',  amount: 600,   status: '已完成' },
  { id: 'DON20240114013', date: '2024-01-14', temple: '龍山寺',  amount: 8000,  status: '已完成' },
  { id: 'ORD20240113014', date: '2024-01-13', temple: '行天宮',  amount: 950,   status: '未完成' },
  { id: 'ORD20240112015', date: '2024-01-12', temple: '保安宮',  amount: 1500,  status: '已完成' },
])

// 過濾後的訂單
const filteredOrders = computed(() => {
  return allOrders.value.filter(order => {
    const matchSearch = !searchQuery.value ||
      order.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      order.temple.includes(searchQuery.value)

    const matchStatus = statusFilter.value === '全部狀態' || order.status === statusFilter.value

    const matchDate = !dateFilter.value || order.date === dateFilter.value

    return matchSearch && matchStatus && matchDate
  })
})

// 分頁
const pageSize = 8
const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(filteredOrders.value.length / pageSize))

const pagedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredOrders.value.slice(start, start + pageSize)
})

const pageNumbers = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i)
    }
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }

  return pages
})

const goToPage = (page) => {
  if (typeof page === 'number' && page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// 重設分頁（篩選條件改變時）
const resetPage = () => { currentPage.value = 1 }

const selectStatus = (opt) => {
  statusFilter.value = opt
  showStatusDropdown.value = false
  resetPage()
}

// 彈跳視窗
const showModal = ref(false)
const selectedOrder = ref(null)

// 模擬每筆訂單的詳細內容（實際應從 API 取得）
const orderDetails = {
  'ORD20240126001': {
    items: [
      { name: '平安符', unitPrice: 380, qty: 2, subtotal: 760 },
      { name: '文昌筆', unitPrice: 520, qty: 1, subtotal: 520 },
    ],
    photos: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80',
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=200&q=80',
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=200&q=80',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=200&q=80',
    ]
  },
  'DON20240125002': {
    items: [
      { name: '捐款', unitPrice: 3600, qty: 1, subtotal: 3600 },
    ],
    photos: []
  },
  'ORD20240124003': {
    items: [
      { name: '光明燈', unitPrice: 600, qty: 2, subtotal: 1200 },
      { name: '護身符', unitPrice: 150, qty: 1, subtotal: 150 },
      { name: '平安符', unitPrice: 380, qty: 1, subtotal: 380 },
      { name: '香火袋', unitPrice: 360, qty: 2, subtotal: 720 },
    ],
    photos: []
  },
}

const getOrderDetail = (orderId) => {
  return orderDetails[orderId] || {
    items: [{ name: '訂單商品', unitPrice: 0, qty: 1, subtotal: 0 }],
    photos: []
  }
}

const handleDownload = (order) => {
  console.log('下載訂單:', order.id)
}

const handleView = (order) => {
  selectedOrder.value = order
  showModal.value = true
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  showModal.value = false
  selectedOrder.value = null
  document.body.style.overflow = ''
}

const formatAmount = (amount) => {
  return `NT$ ${amount.toLocaleString()}`
}
</script>

<template>
  <div class="orders-view">
    <!-- 麵包屑 -->
    <div class="breadcrumb">
      <span class="breadcrumb-link" @click="$router.push('/customer-account')">香客帳號管理</span>
      <span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-current">訂單紀錄</span>
    </div>

    <!-- 搜尋 + 篩選列 -->
    <div class="filter-bar">
      <!-- 搜尋框 -->
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜尋訂單編號/商品名稱或宮廟"
          @input="resetPage"
        />
      </div>

      <div class="filter-right">
        <!-- 狀態篩選 -->
        <div class="status-selector" @click.stop>
          <button class="filter-btn" @click="showStatusDropdown = !showStatusDropdown">
            <svg class="filter-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
            </svg>
            <span>{{ statusFilter }}</span>
            <svg class="chevron" :class="{ rotate: showStatusDropdown }" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          <Transition name="dropdown">
            <div v-if="showStatusDropdown" class="status-dropdown">
              <button
                v-for="opt in statusOptions"
                :key="opt"
                class="status-option"
                :class="{ active: statusFilter === opt }"
                @click="selectStatus(opt)"
              >{{ opt }}</button>
            </div>
          </Transition>
        </div>

        <!-- 日期篩選 -->
        <div class="date-box">
          <svg class="calendar-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
          </svg>
          <input
            v-model="dateFilter"
            type="date"
            class="date-input"
            @change="resetPage"
          />
          <span v-if="!dateFilter" class="date-placeholder">年 / 月 / 日</span>
        </div>
      </div>
    </div>

    <!-- 訂單表格 -->
    <div class="table-card">
      <table class="orders-table">
        <thead>
          <tr>
            <th>訂單編號</th>
            <th>訂單日期</th>
            <th>宮廟</th>
            <th>金額</th>
            <th>狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in pagedOrders" :key="order.id">
            <td class="order-id">{{ order.id }}</td>
            <td class="order-date">{{ order.date }}</td>
            <td class="order-temple">{{ order.temple }}</td>
            <td class="order-amount">{{ formatAmount(order.amount) }}</td>
            <td>
              <span class="status-badge" :class="order.status === '已完成' ? 'completed' : 'pending'">
                {{ order.status }}
              </span>
            </td>
            <td>
              <div class="action-btns">
                <button
                  class="action-btn"
                  :class="{ disabled: order.status !== '已完成' }"
                  :disabled="order.status !== '已完成'"
                  @click="handleDownload(order)"
                  title="下載"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button class="action-btn" @click="handleView(order)" title="查看">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="pagedOrders.length === 0">
            <td colspan="6" class="empty-row">找不到符合條件的訂單</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分頁 -->
    <div v-if="totalPages > 1" class="pagination">
      <!-- 上一頁 -->
      <button
        class="page-btn arrow"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- 頁碼 -->
      <template v-for="(page, index) in pageNumbers" :key="index">
        <span v-if="page === '...'" class="page-ellipsis">…</span>
        <button
          v-else
          class="page-btn"
          :class="{ active: currentPage === page }"
          @click="goToPage(page)"
        >{{ page }}</button>
      </template>

      <!-- 下一頁 -->
      <button
        class="page-btn arrow"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
    <!-- 訂單詳情彈跳視窗 -->
    <Transition name="modal">
      <div v-if="showModal && selectedOrder" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <!-- 視窗標題 -->
          <div class="modal-header">
            <h2 class="modal-title">訂單詳情</h2>
            <button class="modal-close" @click="closeModal">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- 訂單基本資訊 -->
          <div class="modal-info">
            <div class="info-row">
              <span class="info-label">訂單編號：</span>
              <span class="info-value bold">{{ selectedOrder.id }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">訂單日期：</span>
              <span class="info-value">{{ selectedOrder.date }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">所屬宮廟：</span>
              <span class="info-value">{{ selectedOrder.temple }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">訂單狀態：</span>
              <span class="status-badge" :class="selectedOrder.status === '已完成' ? 'completed' : 'pending'">
                {{ selectedOrder.status }}
              </span>
            </div>
          </div>

          <div class="modal-divider"></div>

          <!-- 訂單內容 -->
          <div class="modal-section">
            <h3 class="section-title">訂單內容</h3>
            <div class="items-box">
              <div
                v-for="(item, index) in getOrderDetail(selectedOrder.id).items"
                :key="index"
                class="order-item"
              >
                <div class="item-left">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-unit">單價 NT$ {{ item.unitPrice.toLocaleString() }} × {{ item.qty }}</div>
                </div>
                <div class="item-subtotal">NT$ {{ item.subtotal.toLocaleString() }}</div>
              </div>
            </div>
          </div>

          <div class="modal-divider"></div>

          <!-- 總計 -->
          <div class="modal-total">
            <span class="total-label">總計</span>
            <span class="total-amount">{{ formatAmount(selectedOrder.amount) }}</span>
          </div>

          <!-- 福影司（照片）-->
          <template v-if="getOrderDetail(selectedOrder.id).photos.length > 0">
            <div class="modal-divider"></div>
            <div class="modal-section">
              <h3 class="section-title">福影司</h3>
              <div class="photos-grid">
                <img
                  v-for="(photo, index) in getOrderDetail(selectedOrder.id).photos"
                  :key="index"
                  :src="photo"
                  class="photo-thumb"
                  alt="福影司照片"
                />
              </div>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.orders-view {
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  background: #f3f4f6;
  min-height: 100%;
}

// ========== 麵包屑 ==========
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.breadcrumb-link {
  color: #6b7280;
  cursor: pointer;
  &:hover { color: #E8572A; }
}

.breadcrumb-sep {
  color: #9ca3af;
  font-size: 16px;
}

.breadcrumb-current {
  color: #E8572A;
  font-weight: 500;
}

// ========== 篩選列 ==========
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

// 搜尋框
.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0 16px;
  height: 44px;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: #E8572A;
    box-shadow: 0 0 0 2px rgba(232, 87, 42, 0.08);
  }
}

.search-icon {
  width: 16px;
  height: 16px;
  color: #9ca3af;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #374151;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  background: transparent;

  &::placeholder { color: #9ca3af; }
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

// 狀態篩選
.status-selector {
  position: relative;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0 14px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  min-width: 120px;
  transition: border-color 0.2s;

  &:hover { border-color: #d1d5db; }
}

.filter-icon {
  width: 15px;
  height: 15px;
  color: #9ca3af;
}

.chevron {
  width: 14px;
  height: 14px;
  color: #9ca3af;
  margin-left: auto;
  transition: transform 0.2s;
  &.rotate { transform: rotate(180deg); }
}

.status-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  min-width: 120px;
  z-index: 100;
  overflow: hidden;
}

.status-option {
  width: 100%;
  padding: 10px 14px;
  background: none;
  border: none;
  text-align: left;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  transition: background 0.15s;

  &:hover { background: #f9fafb; }
  &.active { color: #E8572A; font-weight: 500; background: #fff7f3; }
}

// 日期框
.date-box {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 14px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  min-width: 148px;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: #E8572A;
    box-shadow: 0 0 0 2px rgba(232, 87, 42, 0.08);
  }
}

.calendar-icon {
  width: 15px;
  height: 15px;
  color: #9ca3af;
  flex-shrink: 0;
}

.date-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  border: none;
  outline: none;

  &::-webkit-calendar-picker-indicator { cursor: pointer; }
}

.date-placeholder {
  font-size: 14px;
  color: #9ca3af;
  pointer-events: none;
  user-select: none;
}

// ========== 表格卡片 ==========
.table-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  overflow: hidden;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th {
    padding: 14px 20px;
    text-align: left;
    color: #6b7280;
    font-weight: 500;
    font-size: 13px;
    background: #ffffff;
    border-bottom: 1px solid #f3f4f6;
  }

  td {
    padding: 18px 20px;
    color: #374151;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: middle;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover td {
    background: #fafafa;
  }
}

.order-id {
  font-weight: 500;
  color: #1f2937;
}

.order-date {
  color: #6b7280;
}

.order-amount {
  color: #E8572A !important;
  font-weight: 500;
}

// 狀態 badge
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;

  &.completed {
    background: #d1fae5;
    color: #065f46;
  }

  &.pending {
    background: #fef9c3;
    color: #854d0e;
  }
}

// 操作按鈕
.action-btns {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  color: #9ca3af;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  svg { width: 18px; height: 18px; }

  &:hover { color: #374151; }

  &.disabled {
    color: #d1d5db;
    cursor: not-allowed;
    &:hover { color: #d1d5db; }
  }
}

.empty-row {
  text-align: center;
  color: #9ca3af;
  padding: 48px !important;
}

// ========== 分頁 ==========
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  transition: all 0.15s;

  svg { width: 16px; height: 16px; }

  &:hover:not(:disabled):not(.active) {
    border-color: #E8572A;
    color: #E8572A;
  }

  &.active {
    background: #E8572A;
    border-color: #E8572A;
    color: #ffffff;
    font-weight: 500;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &.arrow { padding: 0 8px; }
}

.page-ellipsis {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #9ca3af;
}

// Dropdown 動畫
.dropdown-enter-active,
.dropdown-leave-active { transition: all 0.15s ease; }
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

// ========== 彈跳視窗 ==========
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-box {
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;

  &:hover { color: #374151; }

  svg { width: 20px; height: 20px; }
}

.modal-info {
  padding: 0 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.info-label {
  color: #6b7280;
  flex-shrink: 0;
}

.info-value {
  color: #1f2937;

  &.bold { font-weight: 600; }
}

.modal-divider {
  height: 1px;
  background: #f3f4f6;
  margin: 0 24px;
}

.modal-section {
  padding: 16px 24px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.items-box {
  background: #f9fafb;
  border-radius: 8px;
  overflow: hidden;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;

  &:last-child { border-bottom: none; }
}

.item-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.item-unit {
  font-size: 12px;
  color: #9ca3af;
}

.item-subtotal {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  flex-shrink: 0;
}

.modal-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
}

.total-label {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.total-amount {
  font-size: 20px;
  font-weight: 700;
  color: #E8572A;
}

// 照片格
.photos-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.photo-thumb {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 6px;
  background: #f3f4f6;
}

// Modal 動畫
.modal-enter-active,
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  .modal-box { transform: scale(0.96) translateY(8px); }
}



</style>
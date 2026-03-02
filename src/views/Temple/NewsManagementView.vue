<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const templeId = computed(() => router.currentRoute.value.params.templeId)

// ── 篩選條件 ──
const dateFilter = ref('')
const statusFilter = ref('全部')
const typeFilter = ref('全部')
const keywordFilter = ref('')

const statusOptions = ['全部', '已發佈', '草稿', '排程中']
const typeOptions = ['全部', '活動公告', '重要通知', '一般公告']

const showStatusDropdown = ref(false)
const showTypeDropdown = ref(false)

// ── 模擬資料 ──
const allNews = ref([
  { id: 1, title: '春節祈福活動公告', type: '活動公告', date: '2024-01-15', views: 1250, status: '已發佈' },
  { id: 2, title: '宮廟整修通知',     type: '重要通知', date: '2024-01-12', views: 856,  status: '已發佈' },
  { id: 3, title: '新年參拜時間調整', type: '一般公告', date: '2024-01-10', views: 432,  status: '草稿' },
  { id: 4, title: '廟會遶境路線公布', type: '活動公告', date: '2024-01-08', views: 2103, status: '排程中' },
  { id: 5, title: '元宵節活動通知',   type: '活動公告', date: '2024-01-05', views: 678,  status: '已發佈' },
  { id: 6, title: '宮廟志工招募',     type: '一般公告', date: '2024-01-03', views: 320,  status: '草稿' },
  { id: 7, title: '春季法會公告',     type: '重要通知', date: '2023-12-28', views: 940,  status: '已發佈' },
  { id: 8, title: '年終感恩祈福',     type: '活動公告', date: '2023-12-20', views: 1580, status: '已發佈' },
  { id: 9, title: '冬至湯圓活動',     type: '一般公告', date: '2023-12-15', views: 510,  status: '排程中' },
])

// ── 篩選 ──
const filteredNews = computed(() => {
  return allNews.value.filter(n => {
    const matchDate   = !dateFilter.value   || n.date === dateFilter.value
    const matchStatus = statusFilter.value === '全部' || n.status === statusFilter.value
    const matchType   = typeFilter.value   === '全部' || n.type   === typeFilter.value
    const matchKw     = !keywordFilter.value || n.title.includes(keywordFilter.value)
    return matchDate && matchStatus && matchType && matchKw
  })
})

// ── 分頁 ──
const pageSize = 4
const currentPage = ref(1)

const totalPages = computed(() => Math.max(1, Math.ceil(filteredNews.value.length / pageSize)))

const pagedNews = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredNews.value.slice(start, start + pageSize)
})

const resetPage = () => { currentPage.value = 1 }

const goToPage = (p) => {
  if (p >= 1 && p <= totalPages.value) currentPage.value = p
}

const pageNumbers = computed(() => {
  const total = totalPages.value
  const cur = currentPage.value
  const pages = []
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (cur > 3) pages.push('...')
    for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i)
    if (cur < total - 2) pages.push('...')
    pages.push(total)
  }
  return pages
})

// ── 操作 ──
const handleDelete = (id) => {
  if (confirm('確定要刪除此消息嗎？')) {
    allNews.value = allNews.value.filter(n => n.id !== id)
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
  }
}
const createNews = () => {
  router.push(`/${templeId.value}/news/create`)
}
const viewNews = (id) => {
  router.push(`/${templeId.value}/news/${id}/detail`)
}
const editNews = (id) => {
  router.push(`/${templeId.value}/news/${id}/edit`)
}
// status badge class
const badgeClass = (status) => {
  if (status === '已發佈')  return 'badge-published'
  if (status === '排程中') return 'badge-scheduled'
  return 'badge-draft'
}
</script>

<template>
  <div class="news-view" @click="showStatusDropdown = false; showTypeDropdown = false">
    <!-- 麵包屑 -->
    <div class="breadcrumb">
      <span class="breadcrumb-link">後台管理</span>
      <span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-current">最新消息管理</span>
    </div>

    <!-- 新增按鈕 -->
    <div>
      <button class="btn-add" @click="createNews()">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/>
        </svg>
        新增消息
      </button>
    </div>

    <!-- 篩選列 -->
    <div class="filter-row">
      <!-- 日期範圍 -->
      <div class="filter-group">
        <div class="filter-label">日期範圍</div>
        <div class="date-box">
          <input v-model="dateFilter" type="date" class="date-input" @change="resetPage" />
          <span v-if="!dateFilter" class="date-placeholder">年 / 月 / 日</span>
          <svg class="cal-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
          </svg>
        </div>
      </div>

      <!-- 狀態 -->
      <div class="filter-group">
        <div class="filter-label">狀態</div>
        <div class="select-wrapper" @click.stop>
          <div class="native-select-wrap">
            <select v-model="statusFilter" class="native-select" @change="resetPage">
              <option v-for="opt in statusOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <svg class="select-chevron" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- 類型 -->
      <div class="filter-group">
        <div class="filter-label">類型</div>
        <div class="select-wrapper" @click.stop>
          <div class="native-select-wrap">
            <select v-model="typeFilter" class="native-select" @change="resetPage">
              <option v-for="opt in typeOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <svg class="select-chevron" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- 關鍵字 -->
      <div class="filter-group">
        <div class="filter-label">關鍵字</div>
        <div class="keyword-box">
          <input
            v-model="keywordFilter"
            type="text"
            class="keyword-input"
            placeholder="搜尋標題..."
            @input="resetPage"
          />
          <svg class="keyword-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>標題</th>
            <th>類別</th>
            <th>日期</th>
            <th>瀏覽數</th>
            <th>發佈狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in pagedNews" :key="item.id">
            <td class="col-title">{{ item.title }}</td>
            <td class="col-type">{{ item.type }}</td>
            <td class="col-date">{{ item.date }}</td>
            <td class="col-views">{{ item.views.toLocaleString() }}</td>
            <td>
              <span class="status-badge" :class="badgeClass(item.status)">{{ item.status }}</span>
            </td>
            <td>
              <div class="action-btns">
                <button class="icon-btn" title="查看" @click="viewNews(item.id)">
                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>
                </button>
                <button class="icon-btn" title="編輯" @click="editNews(item.id)">
                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
                </button>
                <button class="icon-btn danger" title="刪除" @click="handleDelete(item.id)">
                  <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="pagedNews.length === 0">
            <td colspan="6" class="empty-row">找不到符合條件的消息</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分頁 -->
    <div class="pagination">
      <button class="page-btn arrow" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">上一頁</button>

      <template v-for="(p, i) in pageNumbers" :key="i">
        <span v-if="p === '...'" class="page-ellipsis">…</span>
        <button v-else class="page-btn" :class="{ active: currentPage === p }" @click="goToPage(p)">{{ p }}</button>
      </template>

      <button class="page-btn arrow" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">下一頁</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.news-view {
  padding: 20px 28px 48px;
  background: #f3f4f6;
  min-height: 100%;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// ── 麵包屑 ──
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}
.breadcrumb-link { color: #6b7280; cursor: pointer; &:hover { color: #E8572A; } }
.breadcrumb-sep  { color: #9ca3af; font-size: 16px; }
.breadcrumb-current { color: #E8572A; font-weight: 500; }

// ── 新增按鈕 ──
.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: #E8572A;
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  transition: background 0.2s;
  &:hover { background: #d94b1f; }
  svg { width: 16px; height: 16px; }
}

// ── 篩選列 ──
.filter-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 16px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

// 日期框
.date-box {
  position: relative;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  height: 42px;
  padding: 0 12px;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: #E8572A;
    box-shadow: 0 0 0 2px rgba(232,87,42,0.08);
  }
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
  flex: 1;
  font-size: 14px;
  color: #9ca3af;
  pointer-events: none;
  user-select: none;
}

.cal-icon {
  width: 16px;
  height: 16px;
  color: #9ca3af;
  pointer-events: none;
  flex-shrink: 0;
}

// Select 下拉
.select-wrapper { position: relative; }

.native-select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.native-select {
  width: 100%;
  height: 42px;
  padding: 0 36px 0 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  appearance: none;
  -webkit-appearance: none;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #E8572A;
    box-shadow: 0 0 0 2px rgba(232,87,42,0.08);
  }
}

.select-chevron {
  position: absolute;
  right: 10px;
  width: 16px;
  height: 16px;
  color: #9ca3af;
  pointer-events: none;
}

// 關鍵字框
.keyword-box {
  position: relative;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  height: 42px;
  padding: 0 12px;
  gap: 8px;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: #E8572A;
    box-shadow: 0 0 0 2px rgba(232,87,42,0.08);
  }
}

.keyword-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #374151;
  background: transparent;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  &::placeholder { color: #9ca3af; }
}

.keyword-icon {
  width: 16px;
  height: 16px;
  color: #9ca3af;
  flex-shrink: 0;
}

// ── 表格卡 ──
.table-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th {
    padding: 13px 20px;
    text-align: left;
    color: #6b7280;
    font-weight: 400;
    font-size: 13px;
    border-bottom: 1px solid #f3f4f6;
  }

  td {
    padding: 18px 20px;
    color: #374151;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: middle;
  }

  tbody tr:last-child td { border-bottom: none; }
  tbody tr:hover td { background: #fafafa; }
}

.col-title { font-weight: 600; color: #1f2937; }
.col-type  { color: #6b7280; }
.col-date  { color: #6b7280; }
.col-views { color: #374151; }

// 狀態 badge
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;

  &.badge-published {
    background: #d1fae5;
    color: #065f46;
  }
  &.badge-draft {
    background: #f3f4f6;
    color: #6b7280;
  }
  &.badge-scheduled {
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

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  color: #9ca3af;
  display: flex;
  align-items: center;
  transition: color 0.15s;
  svg { width: 17px; height: 17px; }
  &:hover { color: #374151; }
  &.danger:hover { color: #ef4444; }
}

.empty-row {
  text-align: center;
  color: #9ca3af;
  padding: 48px !important;
}

// ── 分頁 ──
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  transition: all 0.15s;

  &:hover:not(:disabled):not(.active) {
    border-color: #E8572A;
    color: #E8572A;
  }

  &.active {
    background: #E8572A;
    border-color: #E8572A;
    color: #ffffff;
    font-weight: 600;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &.arrow {
    font-size: 13px;
    padding: 0 14px;
  }
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

@media (max-width: 1024px) {
  .filter-row { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 640px) {
  .news-view { padding: 16px; }
  .filter-row { grid-template-columns: 1fr; }
}
</style>
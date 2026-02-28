<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const templeId = computed(() => route.params.templeId)
const currentTemple = computed(() => {
  return authStore.templeRoles.find(t => t.tenantId === templeId.value)
})

// 統計數據
const stats = ref({
  totalViews: 3456,
  viewsGrowth: '+12.5%',
  totalRevenue: 68200,
  revenueGrowth: '+8.3%',
})

// 月曆
const currentMonth = ref(new Date())

const goToday = () => { currentMonth.value = new Date() }
const prevMonth = () => {
  const d = new Date(currentMonth.value)
  d.setMonth(d.getMonth() - 1)
  currentMonth.value = d
}
const nextMonth = () => {
  const d = new Date(currentMonth.value)
  d.setMonth(d.getMonth() + 1)
  currentMonth.value = d
}

const formattedMonth = computed(() => {
  const y = currentMonth.value.getFullYear()
  const m = currentMonth.value.getMonth() + 1
  return `${y} 年 ${m} 月`
})

// 模擬活動資料（key: YYYY-M-D）
const activitiesMap = ref({
  '2026-1-1':  [{ name: '屆年大典', color: '#fef9c3', dot: '#f59e0b' }],
  '2026-1-15': [{ name: '初一祭祀', color: '#d1fae5', dot: '#10b981' }],
  '2026-2-5':  [{ name: '元宵燈會', color: '#fef9c3', dot: '#f59e0b' }],
})

const getActivities = (year, month, day) => {
  const key = `${year}-${month}-${day}`
  return activitiesMap.value[key] || []
}

// 生成日曆格子（含上下月補位）
const calendarWeeks = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const cells = []

  // 前補
  const startDow = firstDay.getDay()
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    cells.push({ date: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear(), isCurrentMonth: false })
  }

  // 本月
  for (let i = 1; i <= lastDay.getDate(); i++) {
    cells.push({ date: i, month: month + 1, year, isCurrentMonth: true })
  }

  // 後補
  const remaining = 42 - cells.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    cells.push({ date: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear(), isCurrentMonth: false })
  }

  // 切成週
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
})

const isToday = (cell) => {
  const now = new Date()
  return cell.isCurrentMonth &&
    cell.date === now.getDate() &&
    cell.month === now.getMonth() + 1 &&
    cell.year === now.getFullYear()
}

// 宮廟地圖數據
const mapStats = ref([
  { label: '地圖瀏覽次數', value: 1234 },
  { label: '收藏次數',     value: 567 },
  { label: '打卡次數',     value: 890 },
])

// 熱門活動
const hotActivities = ref([
  { name: '新春祈福大典', people: 156, revenue: 45200 },
  { name: '中秋法會',     people: 128, revenue: 38900 },
  { name: '文昌開筆禮',   people: 98,  revenue: 32500 },
])

// 熱門商品
const hotProducts = ref([
  { name: '平安符', sold: 156 },
  { name: '祈福燈', sold: 134 },
  { name: '香油錢', sold: 98 },
])

// 熱門服務
const hotServices = ref([
  { name: '光明燈',   count: 234 },
  { name: '祈福法會', count: 189 },
  { name: '問事服務', count: 145 },
])

onMounted(() => {
  console.log('DashboardView mounted, temple:', currentTemple.value)
})
</script>

<template>
  <div class="dashboard-view">
    <!-- 麵包屑 -->
    <div class="breadcrumb">
      <span class="breadcrumb-link">後台管理</span>
      <span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-current">宮廟總覽</span>
    </div>

    <!-- 統計卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">網站瀏覽</div>
        <div class="stat-value">{{ stats.totalViews.toLocaleString() }}</div>
        <div class="stat-growth">{{ stats.viewsGrowth }} 較上月</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">本月營收</div>
        <div class="stat-value">NT$ {{ stats.totalRevenue.toLocaleString() }}</div>
        <div class="stat-growth">{{ stats.revenueGrowth }} 較上月</div>
      </div>
    </div>

    <!-- 月曆卡片 -->
    <div class="calendar-card">
      <!-- 月曆 Header -->
      <div class="calendar-toolbar">
        <div class="calendar-title">
          <svg class="cal-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
          </svg>
          <span>{{ formattedMonth }}</span>
        </div>
        <div class="calendar-nav">
          <button class="today-btn" @click="goToday">今天</button>
          <button class="nav-btn" @click="prevMonth">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          <button class="nav-btn" @click="nextMonth">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 星期列 -->
      <div class="cal-header">
        <div v-for="d in ['日','一','二','三','四','五','六']" :key="d" class="cal-weekday">{{ d }}</div>
      </div>

      <!-- 日期格 -->
      <div class="cal-body">
        <div
          v-for="(week, wi) in calendarWeeks"
          :key="wi"
          class="cal-week"
        >
          <div
            v-for="(cell, ci) in week"
            :key="ci"
            class="cal-cell"
            :class="{ 'other-month': !cell.isCurrentMonth, 'today': isToday(cell) }"
          >
            <span class="cell-date">{{ cell.date }}</span>
            <!-- 活動標籤 -->
            <div
              v-for="(act, ai) in getActivities(cell.year, cell.month, cell.date)"
              :key="ai"
              class="act-tag"
              :style="{ background: act.color }"
            >
              <span class="act-dot" :style="{ background: act.dot }"></span>
              {{ act.name }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部四格 -->
    <div class="bottom-grid">
      <!-- 宮廟地圖數據 -->
      <div class="data-card">
        <h3 class="data-card-title">宮廟地圖數據</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>數據項目</th>
              <th class="text-right">數值</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in mapStats" :key="item.label">
              <td>{{ item.label }}</td>
              <td class="text-right orange">{{ item.value.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 熱門活動 -->
      <div class="data-card">
        <h3 class="data-card-title">熱門活動</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>活動名稱</th>
              <th class="text-right">人數</th>
              <th class="text-right">收入</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in hotActivities" :key="item.name">
              <td>{{ item.name }}</td>
              <td class="text-right gray">{{ item.people }}</td>
              <td class="text-right orange">NT$ {{ item.revenue.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 熱門商品 -->
      <div class="data-card">
        <h3 class="data-card-title">熱門商品</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>商品名稱</th>
              <th class="text-right">銷量</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in hotProducts" :key="item.name">
              <td>{{ item.name }}</td>
              <td class="text-right orange">{{ item.sold }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 熱門服務 -->
      <div class="data-card">
        <h3 class="data-card-title">熱門服務</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>服務名稱</th>
              <th class="text-right">預約數</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in hotServices" :key="item.name">
              <td>{{ item.name }}</td>
              <td class="text-right orange">{{ item.count }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dashboard-view {
  padding: 20px 28px 40px;
  background: #f3f4f6;
  min-height: 100%;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.breadcrumb-sep { color: #9ca3af; font-size: 16px; }

.breadcrumb-current {
  color: #E8572A;
  font-weight: 500;
}

// ========== 統計卡片 ==========
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px 28px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #E8572A;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.stat-growth {
  font-size: 13px;
  color: #10b981;
}

// ========== 月曆卡片 ==========
.calendar-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  overflow: hidden;
}

.calendar-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.calendar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.cal-icon {
  width: 18px;
  height: 18px;
  color: #E8572A;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.today-btn {
  padding: 5px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #ffffff;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  margin-right: 4px;

  &:hover { background: #f9fafb; }
}

.nav-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #ffffff;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.15s;

  &:hover { background: #f9fafb; color: #374151; }

  svg { width: 16px; height: 16px; }
}

// 星期列
.cal-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-top: 1px solid #f3f4f6;
}

.cal-weekday {
  text-align: center;
  padding: 10px 0;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  border-right: 1px solid #f3f4f6;

  &:last-child { border-right: none; }
}

// 日期格
.cal-body {
  border-top: 1px solid #f3f4f6;
}

.cal-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid #f3f4f6;

  &:last-child { border-bottom: none; }
}

.cal-cell {
  min-height: 90px;
  padding: 8px 10px;
  border-right: 1px solid #f3f4f6;
  vertical-align: top;
  position: relative;

  &:last-child { border-right: none; }

  &.other-month .cell-date {
    color: #d1d5db;
  }

  &.today .cell-date {
    background: #E8572A;
    color: #ffffff;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.cell-date {
  font-size: 13px;
  color: #374151;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
}

.act-tag {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #374151;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.act-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

// ========== 底部四格 ==========
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.data-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.data-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th {
    color: #9ca3af;
    font-weight: 400;
    font-size: 13px;
    padding: 0 0 10px 0;
    border-bottom: 1px solid #f3f4f6;
  }

  td {
    padding: 14px 0;
    color: #374151;
    border-bottom: 1px solid #f3f4f6;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
}

.text-right {
  text-align: right;
}

.orange {
  color: #E8572A !important;
  font-weight: 500;
}

.gray {
  color: #9ca3af;
}

@media (max-width: 1100px) {
  .stats-grid { grid-template-columns: 1fr; }
  .bottom-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .dashboard-view { padding: 16px; }
  .cal-cell { min-height: 60px; }
}
</style>
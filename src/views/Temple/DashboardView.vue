<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

// 當前宮廟 ID
const templeId = computed(() => route.params.templeId)

// 當前宮廟資訊
const currentTemple = computed(() => {
  return authStore.templeRoles.find(temple => temple.templeId === templeId.value)
})

// 統計數據
const stats = ref({
  totalViews: 3456,
  viewsGrowth: '+12%',
  totalRevenue: 68200,
  revenueItems: '捐款 + 商品'
})

// 活動月曆數據
const currentMonth = ref(new Date())
const monthActivities = ref([
  { date: 15, name: '農曆新年祈福大典', time: '09:00', people: 156, status: '進行中' },
  { date: 15, name: '光明燈點燈儀式', time: '14:00', people: 89, status: '進行中' }
])

// 宮廟地圖數據
const mapStats = ref({
  checkIns: { count: 1234, label: '打卡次數', period: '本月累計' },
  addToFavorite: { count: 856, label: '加到最愛', period: '本月累計' },
  mapViews: { count: 3421, label: '地圖瀏覽', period: '本月累計' }
})

// 熱門商品
const popularProducts = ref([
  { name: '平安符', price: 200, sold: 45 },
  { name: '光明燈', price: 600, sold: 32 },
  { name: '護身符', price: 150, sold: 28 }
])

// 熱門服務
const popularServices = ref([
  { name: '祈福點燈', type: '線上點燈服務', count: 78 },
  { name: '收驚服務', type: '預約收驚', count: 56 },
  { name: '求籤解籤', type: '線上求籤', count: 42 }
])

// 切換月份
const prevMonth = () => {
  const date = new Date(currentMonth.value)
  date.setMonth(date.getMonth() - 1)
  currentMonth.value = date
}

const nextMonth = () => {
  const date = new Date(currentMonth.value)
  date.setMonth(date.getMonth() + 1)
  currentMonth.value = date
}

// 格式化月份
const formattedMonth = computed(() => {
  return `${currentMonth.value.getFullYear()} 年 ${currentMonth.value.getMonth() + 1} 月`
})

// 生成日曆
const calendar = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = firstDay.getDay()
  
  const days = []
  
  // 填充前面的空白
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null)
  }
  
  // 填充日期
  for (let i = 1; i <= daysInMonth; i++) {
    const hasActivity = monthActivities.value.some(activity => activity.date === i)
    days.push({ date: i, hasActivity })
  }
  
  return days
})

onMounted(() => {
  console.log('當前宮廟:', currentTemple.value)
})
</script>

<template>
  <div class="dashboard-view">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h1 class="page-title">宮廟總覽</h1>
      <p class="page-subtitle">{{ currentTemple?.templeName || '桃園創齊宮' }}數據總覽與管理</p>
    </div>

    <!-- 統計卡片區 -->
    <div class="stats-grid">
      <!-- 網站瀏覽 -->
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">網站瀏覽</span>
          <svg class="stat-icon" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="stat-value">{{ stats.totalViews.toLocaleString() }}</div>
        <div class="stat-growth positive">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          相比上月 {{ stats.viewsGrowth }}
        </div>
      </div>

      <!-- 本月總收 -->
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">本月總收</span>
          <svg class="stat-icon dollar" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="stat-value revenue">NT$ {{ stats.totalRevenue.toLocaleString() }}</div>
        <div class="stat-detail">{{ stats.revenueItems }}</div>
      </div>
    </div>

    <!-- 主要內容區 -->
    <div class="content-grid">
      <!-- 活動月曆 -->
      <div class="content-card calendar-card">
        <div class="card-header">
          <h2 class="card-title">活動月曆</h2>
        </div>
        <div class="card-body">
          <!-- 月份切換 -->
          <div class="month-selector">
            <button class="month-btn" @click="prevMonth">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
            <span class="month-text">{{ formattedMonth }}</span>
            <button class="month-btn" @click="nextMonth">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- 日曆表格 -->
          <div class="calendar">
            <div class="calendar-header">
              <div class="weekday">日</div>
              <div class="weekday">一</div>
              <div class="weekday">二</div>
              <div class="weekday">三</div>
              <div class="weekday">四</div>
              <div class="weekday">五</div>
              <div class="weekday">六</div>
            </div>
            <div class="calendar-body">
              <div 
                v-for="(day, index) in calendar" 
                :key="index"
                class="calendar-day"
                :class="{ 'has-activity': day?.hasActivity }"
              >
                <span v-if="day" class="day-number">{{ day.date }}</span>
                <span v-if="day?.hasActivity" class="activity-dot"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 活動列表 -->
      <div class="content-card activities-card">
        <div class="card-header">
          <h3 class="card-subtitle">3 月 15 日活動</h3>
        </div>
        <div class="card-body">
          <div class="activity-list">
            <div 
              v-for="(activity, index) in monthActivities" 
              :key="index"
              class="activity-item"
            >
              <div class="activity-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="activity-content">
                <div class="activity-name">{{ activity.name }}</div>
                <div class="activity-meta">{{ activity.time }} • {{ activity.people }} 人</div>
              </div>
              <span class="activity-badge">{{ activity.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部區域 -->
    <div class="bottom-grid">
      <!-- 宮廟地圖數據 -->
      <div class="content-card">
        <div class="card-header">
          <h2 class="card-title">宮廟地圖數據</h2>
          <button class="view-more-btn">
            查看詳情 →
          </button>
        </div>
        <div class="card-body">
          <div class="map-stats-grid">
            <div class="map-stat-item">
              <div class="map-stat-icon blue">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="map-stat-content">
                <div class="map-stat-label">{{ mapStats.checkIns.label }}</div>
                <div class="map-stat-value">{{ mapStats.checkIns.count.toLocaleString() }}</div>
                <div class="map-stat-period">{{ mapStats.checkIns.period }}</div>
              </div>
            </div>

            <div class="map-stat-item">
              <div class="map-stat-icon red">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="map-stat-content">
                <div class="map-stat-label">{{ mapStats.addToFavorite.label }}</div>
                <div class="map-stat-value">{{ mapStats.addToFavorite.count.toLocaleString() }}</div>
                <div class="map-stat-period">{{ mapStats.addToFavorite.period }}</div>
              </div>
            </div>

            <div class="map-stat-item">
              <div class="map-stat-icon green">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="map-stat-content">
                <div class="map-stat-label">{{ mapStats.mapViews.label }}</div>
                <div class="map-stat-value">{{ mapStats.mapViews.count.toLocaleString() }}</div>
                <div class="map-stat-period">{{ mapStats.mapViews.period }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 熱門商品 -->
      <div class="content-card">
        <div class="card-header">
          <h2 class="card-title">熱門商品</h2>
          <button class="view-more-btn">
            管理 →
          </button>
        </div>
        <div class="card-body">
          <div class="product-list">
            <div 
              v-for="(product, index) in popularProducts" 
              :key="index"
              class="product-item"
            >
              <div class="product-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="product-content">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-price">NT$ {{ product.price }}</div>
              </div>
              <div class="product-sold">已售 {{ product.sold }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 熱門服務 -->
      <div class="content-card">
        <div class="card-header">
          <h2 class="card-title">熱門服務</h2>
          <button class="view-more-btn">
            管理 →
          </button>
        </div>
        <div class="card-body">
          <div class="service-list">
            <div 
              v-for="(service, index) in popularServices" 
              :key="index"
              class="service-item"
            >
              <div class="service-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div class="service-content">
                <div class="service-name">{{ service.name }}</div>
                <div class="service-type">{{ service.type }}</div>
              </div>
              <div class="service-count">{{ service.count }} 次</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dashboard-view {
  padding: 32px;
  background: #fafafa;
  min-height: 100vh;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
}

// ========== 頁面標題 ==========
.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

// ========== 統計卡片 ==========
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.stat-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.stat-icon {
  width: 24px;
  height: 24px;
  color: #d97444;
  
  &.dollar {
    color: #f59e0b;
  }
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
  
  &.revenue {
    color: #f59e0b;
  }
}

.stat-growth {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #10b981;
  
  &.positive {
    color: #10b981;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
}

.stat-detail {
  font-size: 13px;
  color: #9ca3af;
}

// ========== 主要內容區 ==========
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.content-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.card-subtitle {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.card-body {
  padding: 24px;
}

.view-more-btn {
  background: none;
  border: none;
  color: #d97444;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: #c45e30;
  }
}

// ========== 月曆 ==========
.month-selector {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
}

.month-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #6b7280;
  transition: color 0.2s;
  
  &:hover {
    color: #1f2937;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
}

.month-text {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  min-width: 150px;
  text-align: center;
}

.calendar {
  
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  padding: 8px 0;
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 8px;
  transition: background 0.2s;
  
  &:hover {
    background: #f9fafb;
  }
  
  &.has-activity {
    background: #fff7f3;
  }
}

.day-number {
  font-size: 14px;
  color: #374151;
}

.activity-dot {
  position: absolute;
  bottom: 6px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #d97444;
}

// ========== 活動列表 ==========
.activities-card {
  
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.activity-icon {
  width: 40px;
  height: 40px;
  background: #fff7f3;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 20px;
    height: 20px;
    color: #d97444;
  }
}

.activity-content {
  flex: 1;
}

.activity-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.activity-meta {
  font-size: 12px;
  color: #9ca3af;
}

.activity-badge {
  padding: 4px 12px;
  background: #d97444;
  color: #ffffff;
  font-size: 12px;
  font-weight: 500;
  border-radius: 12px;
  flex-shrink: 0;
}

// ========== 底部區域 ==========
.bottom-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

// ========== 地圖數據 ==========
.map-stats-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.map-stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.map-stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 24px;
    height: 24px;
    color: #ffffff;
  }
  
  &.blue {
    background: #3b82f6;
  }
  
  &.red {
    background: #ef4444;
  }
  
  &.green {
    background: #10b981;
  }
}

.map-stat-content {
  flex: 1;
}

.map-stat-label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 4px;
}

.map-stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 2px;
}

.map-stat-period {
  font-size: 12px;
  color: #9ca3af;
}

// ========== 商品列表 ==========
.product-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-icon {
  width: 40px;
  height: 40px;
  background: #fff7f3;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 20px;
    height: 20px;
    color: #d97444;
  }
}

.product-content {
  flex: 1;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 2px;
}

.product-price {
  font-size: 13px;
  color: #6b7280;
}

.product-sold {
  font-size: 13px;
  color: #9ca3af;
}

// ========== 服務列表 ==========
.service-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-icon {
  width: 40px;
  height: 40px;
  background: #fff7f3;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 20px;
    height: 20px;
    color: #d97444;
  }
}

.service-content {
  flex: 1;
}

.service-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 2px;
}

.service-type {
  font-size: 13px;
  color: #6b7280;
}

.service-count {
  font-size: 13px;
  color: #9ca3af;
}

// 響應式設計
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-view {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .calendar-day {
    font-size: 12px;
  }
}
</style>
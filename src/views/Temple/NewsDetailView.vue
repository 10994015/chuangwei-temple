<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route  = useRoute()

// 實際應用由 API 以 route.params.newsId 取得
const newsId = computed(() => route.params.newsId)

const news = ref({
  id: 1,
  title: '春節祈福活動公告',
  category: '活動公告',
  publishDate: '2024-01-15',
  views: 1250,
  status: '已發佈',
  content: `本宮將於農曆春節期間舉辦祈福活動，歡迎信眾前來參拜。活動期間將提供免費平安符及福袋，數量有限，發完為止。祈求新的一年平安順遂，闔家幸福。

活動時間：農曆正月初一至初五
活動地點：本宮大殿

活動內容：
1. 新春祈福法會
2. 免費發送平安符
3. 福袋結緣
4. 點光明燈服務`,
  coverImage: null,
})

const badgeClass = (status) => {
  if (status === '已發佈')  return 'badge-published'
  if (status === '排程中') return 'badge-scheduled'
  return 'badge-draft'
}

const goEdit = () => {
  const base = route.path.endsWith('/') ? route.path.slice(0, -1) : route.path
  router.push(base.replace('/detail', '/edit'))
}
</script>

<template>
  <div class="news-detail-view">
    <!-- 麵包屑 -->
    <div class="breadcrumb">
      <span class="breadcrumb-link">後台管理</span>
      <span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-current">最新消息管理</span>
    </div>

    <!-- 返回 -->
    <button class="back-btn" @click="router.back()">
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
      </svg>
      返回上一頁
    </button>

    <!-- 消息資訊卡 -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">消息資訊</h2>
        <button class="btn-edit" @click="goEdit">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
          </svg>
          編輯資料
        </button>
      </div>

      <div class="info-grid">
        <div class="info-field full">
          <div class="field-label">標題</div>
          <div class="field-value bold">{{ news.title }}</div>
        </div>

        <div class="info-field">
          <div class="field-label">類別</div>
          <div class="field-value bold">{{ news.category }}</div>
        </div>
        <div class="info-field">
          <div class="field-label">發佈日期</div>
          <div class="field-value">{{ news.publishDate }}</div>
        </div>

        <div class="info-field">
          <div class="field-label">瀏覽數</div>
          <div class="field-value bold">{{ news.views.toLocaleString() }}</div>
        </div>
        <div class="info-field">
          <div class="field-label">發佈狀態</div>
          <div class="field-value">
            <span class="status-badge" :class="badgeClass(news.status)">{{ news.status }}</span>
          </div>
        </div>

        <div class="info-field full">
          <div class="field-label">消息內容</div>
          <div class="field-value content-text">{{ news.content }}</div>
        </div>

        <div v-if="news.coverImage" class="info-field full">
          <div class="field-label">封面圖片</div>
          <img :src="news.coverImage" class="cover-img" alt="封面圖片" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.news-detail-view {
  padding: 20px 28px 48px;
  background: #f3f4f6;
  min-height: 100%;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.breadcrumb {
  display: flex; align-items: center; gap: 4px; font-size: 14px;
}
.breadcrumb-link { color: #6b7280; cursor: pointer; &:hover { color: #E8572A; } }
.breadcrumb-sep  { color: #9ca3af; font-size: 16px; }
.breadcrumb-current { color: #E8572A; font-weight: 500; }

.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: none; border: none; font-size: 14px; color: #6b7280;
  cursor: pointer; font-family: inherit; padding: 0; transition: color 0.2s;
  &:hover { color: #374151; }
  svg { width: 16px; height: 16px; }
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 28px 32px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.card-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 8px;
}
.card-title { font-size: 18px; font-weight: 600; color: #1f2937; margin: 0; }

.btn-edit {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 16px;
  background: transparent;
  border: 1.5px solid #E8572A;
  border-radius: 20px;
  color: #E8572A; font-size: 14px; font-weight: 500;
  cursor: pointer; font-family: inherit; transition: all 0.2s;
  &:hover { background: #fff7f3; }
  svg { width: 14px; height: 14px; }
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.info-field {
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
  &.full { grid-column: 1 / -1; }
}

// 移除最後一行 border
.info-field:last-child,
.info-field:nth-last-child(2):not(.full) { border-bottom: none; }

.field-label { font-size: 13px; color: #9ca3af; margin-bottom: 6px; }
.field-value {
  font-size: 15px; color: #1f2937;
  &.bold { font-weight: 600; }
  &.content-text {
    white-space: pre-line; line-height: 1.8;
    color: #374151; font-size: 14px;
  }
}

.status-badge {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 4px 14px; border-radius: 20px;
  font-size: 13px; font-weight: 500;
  &.badge-published  { background: #d1fae5; color: #065f46; }
  &.badge-draft      { background: #f3f4f6; color: #6b7280; }
  &.badge-scheduled  { background: #fef9c3; color: #854d0e; }
}

.cover-img {
  width: 100%; max-height: 280px;
  object-fit: cover; border-radius: 8px; margin-top: 8px;
}

@media (max-width: 768px) {
  .news-detail-view { padding: 16px; }
  .info-grid { grid-template-columns: 1fr; }
  .card { padding: 20px 16px; }
}
</style>
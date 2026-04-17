<template>
  <div class="activity-detail-page">
    <AppBreadcrumb :items="breadcrumbs" />
    <button class="back-btn" @click="$router.back()">← 返回上一頁</button>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">活動資訊</h2>
        <button
          class="btn-edit"
          @click="$router.push({ name: 'app.temple.activity-edit', params: { templeId, activityId } })"
        >
          ✏ 編輯資料
        </button>
      </div>

      <div class="view-grid">
        <!-- 活動名稱：全寬 -->
        <div class="vf vf-full">
          <div class="field-label">活動名稱</div>
          <div class="field-value bold">{{ activity.name }}</div>
        </div>

        <div class="vf">
          <div class="field-label">類別</div>
          <div class="field-value">{{ activity.category }}</div>
        </div>
        <div class="vf">
          <div class="field-label">活動開始日期</div>
          <div class="field-value">{{ activity.startDate }}</div>
        </div>

        <div class="vf">
          <div class="field-label">活動結束日期</div>
          <div class="field-value">{{ activity.endDate }}</div>
        </div>
        <div class="vf">
          <div class="field-label">地點</div>
          <div class="field-value">{{ activity.location }}</div>
        </div>

        <div class="vf">
          <div class="field-label">報名人數</div>
          <div class="field-value">{{ activity.registrations }} 人</div>
        </div>
        <div class="vf">
          <div class="field-label">發佈狀態</div>
          <div class="field-value">
            <span :class="['badge', statusClass]">{{ activity.status }}</span>
          </div>
        </div>

        <!-- 活動描述：全寬 -->
        <div class="vf vf-full desc-field">
          <div class="field-label">活動描述</div>
          <div class="field-value desc">{{ activity.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'

const route = useRoute()
const router = useRouter()
const templeId = computed(() => route.params.templeId)
const activityId = computed(() => route.params.activityId)

const breadcrumbs = [
  { text: '後台管理' },
  { text: '活動與上架管理', onClick: () => router.back() },
  { text: '活動詳情' },
]

const activity = ref({
  name: '',
  category: '',
  startDate: '',
  endDate: '',
  location: '',
  registrations: 0,
  status: '',
  description: '',
})

const statusClass = computed(() => ({
  'badge-published':  activity.value.status === '已發佈',
  'badge-draft':      activity.value.status === '草稿',
  'badge-scheduled':  activity.value.status === '排程中',
}))

onMounted(() => {
  // TODO: fetch by activityId
  // 模擬資料
  activity.value = {
    name: '春節祈福法會',
    category: '法會',
    startDate: '2024-02-10',
    endDate: '2024-02-15',
    location: '本宮大殿',
    registrations: 120,
    status: '已發佈',
    description: `本宮將於農曆春節期間舉辦祈福法會，歡迎信眾前來參拜。活動期間將提供免費平安符及福袋，數量有限，發完為止。祈求新的一年平安順遂，闔家幸福。

活動時間：農曆正月初一至初五
活動地點：本宮大殿

活動內容：
1. 新春祈福法會
2. 免費發送平安符
3. 福袋結緣
4. 點光明燈服務`,
  }
})
</script>

<style scoped>
.activity-detail-page {
  padding: 24px 32px 60px;
  background: #f0f2f5;
  min-height: 100%;
}

.back-btn {
  background: none; border: none; cursor: pointer;
  color: #555; font-size: 13px; padding: 0;
  margin-bottom: 20px; display: flex; align-items: center; gap: 4px;
}
.back-btn:hover { color: #E8572A; }

/* card */
.card {
  background: #fff; border-radius: 14px;
  padding: 32px 36px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.06);
}

.card-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 28px;
}
.card-title { font-size: 20px; font-weight: 700; color: #1a1a1a; margin: 0; }

.btn-edit {
  padding: 9px 20px; border-radius: 999px;
  border: 1.5px solid #E8572A; background: transparent;
  color: #E8572A; font-size: 14px; font-weight: 500;
  cursor: pointer; display: flex; align-items: center; gap: 6px;
  transition: all 0.2s; font-family: inherit;
}
.btn-edit:hover { background: rgba(232,87,42,0.08); }

/* grid */
.view-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px 48px;
}
.vf-full { grid-column: 1 / -1; }
.desc-field { margin-top: 4px; }

.field-label { font-size: 12px; color: #999; margin-bottom: 6px; }
.field-value { font-size: 15px; color: #222; }
.field-value.bold { font-weight: 700; font-size: 17px; }
.field-value.desc {
  white-space: pre-line; line-height: 1.85;
  color: #444; font-size: 14px;
}

/* badge */
.badge {
  display: inline-block; padding: 4px 12px;
  border-radius: 999px; font-size: 12px; font-weight: 500;
}
.badge-published  { background: #e6f9f0; color: #1a9e5e; }
.badge-draft      { background: #f0f0f0; color: #888; }
.badge-scheduled  { background: #fff8e6; color: #d4860a; }
</style>
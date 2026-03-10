<template>
  <div class="service-detail-page">
    <!-- 麵包屑 -->
    <div class="breadcrumb">
      <span class="bc-root">後台管理</span>
      <span class="bc-sep">›</span>
      <router-link :to="{ name: 'app.temple.activity-management', params: { templeId } }" class="bc-link">
        活動與上架管理
      </router-link>
    </div>

    <!-- 返回按鈕 -->
    <button class="back-btn" @click="goBack">
      <span class="back-arrow">‹</span> 返回上一頁
    </button>

    <!-- 服務資訊卡片 -->
    <div class="detail-card">
      <div class="card-header">
        <h2 class="card-title">服務資訊</h2>
        <button class="btn-edit" @click="goEdit">
          <span class="edit-icon">✎</span> 編輯資料
        </button>
      </div>

      <!-- 服務名稱 -->
      <div class="field-group">
        <div class="field-label">服務名稱</div>
        <div class="field-value bold">{{ service.name }}</div>
      </div>

      <!-- 服務類別 -->
      <div class="field-group">
        <div class="field-label">服務類別</div>
        <div class="field-value">
          <span v-for="c in service.categories" :key="c" class="tag-chip tag-category">{{ c }}</span>
        </div>
      </div>

      <!-- 關聯活動 -->
      <div class="field-group">
        <div class="field-label">關聯活動</div>
        <div class="field-value bold">{{ service.event || '無' }}</div>
      </div>

      <!-- 標籤類別 -->
      <div class="field-group">
        <div class="field-label">標籤類別</div>
        <div class="field-value">
          <span
            v-for="tag in service.tags"
            :key="tag.label"
            class="tag-chip"
            :class="tag.color"
          >{{ tag.label }}</span>
        </div>
      </div>

      <!-- 開始時間 & 結束時間（兩欄） -->
      <div class="field-row">
        <div class="field-group">
          <div class="field-label">開始時間</div>
          <div class="field-value bold">{{ service.startTime || '常駐服務' }}</div>
        </div>
        <div class="field-group">
          <div class="field-label">結束時間</div>
          <div class="field-value bold">{{ service.endTime || '常駐服務' }}</div>
        </div>
      </div>

      <!-- 發佈狀態 -->
      <div class="field-group">
        <div class="field-label">發佈狀態</div>
        <div class="field-value">
          <span class="badge" :class="statusClass(service.status)">{{ service.status }}</span>
        </div>
      </div>

      <!-- 服務描述 -->
      <div class="field-group">
        <div class="field-label">服務描述</div>
        <div class="field-value description">{{ service.shortDescription }}</div>
      </div>

      <!-- 服務內容（多行） -->
      <div class="field-group" v-if="service.content">
        <div class="field-value description pre-wrap">{{ service.content }}</div>
      </div>
    </div>

    <!-- 服務規格卡片 -->
    <div class="detail-card specs-card">
      <h3 class="card-title">服務規格</h3>

      <div v-for="spec in service.specs" :key="spec.id" class="spec-detail-card">
        <!-- 規格名稱 -->
        <div class="spec-field-group">
          <div class="spec-field-label">規格名稱</div>
          <div class="spec-field-value bold">{{ spec.name }}</div>
        </div>

        <!-- 價格 & 數量 -->
        <div class="spec-field-row">
          <div class="spec-field-group">
            <div class="spec-field-label">價格</div>
            <div class="spec-field-value bold">NT$ {{ spec.price.toLocaleString() }}</div>
          </div>
          <div class="spec-field-group">
            <div class="spec-field-label">數量</div>
            <div class="spec-field-value bold">{{ spec.quantity }} 個</div>
          </div>
        </div>

        <!-- 提供疏文 & 運費類型 -->
        <div class="spec-field-row">
          <div class="spec-field-group">
            <div class="spec-field-label">提供疏文</div>
            <div class="spec-field-value bold">{{ spec.hasShuwen ? '是' : '否' }}</div>
          </div>
          <div class="spec-field-group">
            <div class="spec-field-label">運費類型</div>
            <div class="spec-field-value bold">{{ spec.shippingType }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const templeId = computed(() => route.params.templeId)
const serviceId = computed(() => route.params.serviceId)

// 模擬服務資料（實際應從 API 取得）
const service = ref({
  id: 1,
  name: '光明燈',
  categories: ['點燈服務', '祈福服務'],
  event: null,
  tags: [
    { label: '熱門', color: 'tag-hot' },
    { label: '推薦', color: 'tag-recommend' },
  ],
  startTime: null,  // null = 常駐服務
  endTime: null,
  isPermanent: true,
  status: '已發佈',
  shortDescription: '點光明燈祈求前途光明、事業順利、學業進步。',
  content: `服務內容：
1. 全年供奉光明燈
2. 每月初一、十五誦經祈福
3. 提供光明燈卡片
4. 可線上查詢燈位

注意事項：
- 點燈期限為一年
- 可代為點燈
- 提供線上點燈服務`,
  specs: [
    { id: 1, name: '個人光明燈', price: 500,  quantity: 100, hasShuwen: true, shippingType: '不需運送' },
    { id: 2, name: '全家光明燈', price: 2000, quantity: 50,  hasShuwen: true, shippingType: '不需運送' },
  ]
})

const statusClass = (s) => ({
  'badge-published':  s === '已發佈',
  'badge-draft':      s === '草稿',
  'badge-scheduled':  s === '排程中',
})

const goBack = () => {
  router.push({ name: 'app.temple.activity-management', params: { templeId: templeId.value } })
}

const goEdit = () => {
  router.push({
    name: 'app.temple.service-edit',
    params: { templeId: templeId.value, serviceId: serviceId.value }
  })
}
</script>

<style scoped>
.service-detail-page {
  padding: 24px 32px 60px;
  min-height: 100%;
  background: #f8f8f6;
}

/* 麵包屑 */
.breadcrumb {
  font-size: 13px;
  color: #999;
  margin-bottom: 16px;
}
.bc-sep { margin: 0 6px; }
.bc-link {
  color: #E8572A;
  text-decoration: none;
  font-weight: 500;
}
.bc-link:hover { text-decoration: underline; }

/* 返回按鈕 */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #555;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 24px;
  padding: 0;
  transition: color 0.2s;
}
.back-btn:hover { color: #E8572A; }
.back-arrow { font-size: 18px; line-height: 1; }

/* 卡片通用 */
.detail-card {
  background: #fff;
  border-radius: 16px;
  padding: 32px 36px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  margin-bottom: 24px;
}

/* 卡片頭部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}
.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 24px;
}
.card-header .card-title { margin: 0; }

/* 編輯按鈕 */
.btn-edit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: #fff;
  border: 1.5px solid #E8572A;
  border-radius: 50px;
  color: #E8572A;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-edit:hover { background: #fff3ef; }
.edit-icon { font-size: 14px; }

/* 欄位 */
.field-group {
  margin-bottom: 24px;
}
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}
.field-label {
  font-size: 13px;
  color: #888;
  margin-bottom: 6px;
}
.field-value {
  font-size: 14px;
  color: #333;
}
.field-value.bold { font-weight: 600; color: #1a1a1a; }
.field-value.description {
  font-size: 14px;
  color: #444;
  line-height: 1.6;
}
.field-value.pre-wrap {
  white-space: pre-wrap;
  font-size: 14px;
  color: #444;
  line-height: 1.75;
}

/* Tags */
.tag-chip {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-right: 6px;
}
.tag-category { background: #f0f0f0; color: #555; }
.tag-hot      { background: #FFE0D6; color: #E8572A; }
.tag-recommend { background: #D6EAFF; color: #2563EB; }
.tag-new      { background: #D6FFE8; color: #16A34A; }
.tag-limited  { background: #FFF3D6; color: #D97706; }

/* Badge */
.badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.badge-published  { background: #e6f9f0; color: #27a163; }
.badge-draft      { background: #f5f5f5; color: #888; }
.badge-scheduled  { background: #fff8e6; color: #d4860a; }

/* 規格卡片 */
.specs-card .card-title { margin-bottom: 20px; }

.spec-detail-card {
  background: #fafafa;
  border: 1px solid #ebebeb;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 16px;
}
.spec-detail-card:last-child { margin-bottom: 0; }

.spec-field-group { margin-bottom: 16px; }
.spec-field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
.spec-field-row:last-child,
.spec-field-group:last-child { margin-bottom: 0; }

.spec-field-label { font-size: 12px; color: #999; margin-bottom: 4px; }
.spec-field-value { font-size: 14px; color: #333; }
.spec-field-value.bold { font-weight: 600; color: #1a1a1a; }
</style>
<template>
  <div class="product-select-page">
    <AppBreadcrumb :items="breadcrumbs" />

    <!-- 返回按鈕 -->
    <button class="back-btn" @click="goBack">
      <span class="back-arrow">‹</span> 返回上一頁
    </button>

    <!-- 選擇區 -->
    <div class="select-card">
      <h1 class="select-title">選擇商品類型</h1>
      <p class="select-subtitle">請選擇您要新增的商品類型</p>

      <div class="type-grid">
        <button
          v-for="type in productTypes"
          :key="type.key"
          class="type-card"
          @click="selectType(type.key)"
        >
          <div class="type-name">{{ type.name }}</div>
          <div class="type-desc">{{ type.desc }}</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'

const route = useRoute()
const router = useRouter()

const templeId = computed(() => route.params.templeId)

const breadcrumbs = [
  { text: '後台管理' },
  { text: '活動與上架管理', onClick: () => router.push({ name: 'app.temple.activity-management', params: { templeId: templeId.value }, query: { tab: 'products' } }) },
  { text: '選擇商品類型' },
]

const productTypes = [
  { key: 'self',    name: '自行上架商品', desc: '自行設定商品資訊、規格、價格等完整內容' },
  { key: 'normal',  name: '普通商品',     desc: '使用標準範本快速建立一般商品' },
  { key: 'special', name: '特殊商品',     desc: '客製化特殊需求的商品類型' },
]

const routeMap = {
  self:    'app.temple.product-create',
  normal:  'app.temple.product-normal-create',
  special: 'app.temple.product-special-create',
}

const selectType = (key) => {
  router.push({
    name: routeMap[key],
    params: { templeId: templeId.value },
  })
}

const goBack = () => {
  router.push({ name: 'app.temple.activity-management', params: { templeId: templeId.value }, query: { tab: 'products' } })
}
</script>

<style scoped>
.product-select-page {
  padding: 24px 32px 60px;
  min-height: 100%;
  background: #F3F4F6;
}

/* 返回 */
.back-btn {
  display: inline-flex; align-items: center; gap: 4px;
  background: none; border: none; color: #555; font-size: 14px;
  cursor: pointer; margin-bottom: 28px; padding: 0;
  transition: color 0.2s;
}
.back-btn:hover { color: #E8572A; }
.back-arrow { font-size: 18px; line-height: 1; }

/* 選擇卡片 */
.select-card {
  background: #fff;
  border-radius: 20px;
  padding: 56px 48px 64px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  text-align: center;
}

.select-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 12px;
}

.select-subtitle {
  font-size: 14px;
  color: #aaa;
  margin: 0 0 48px;
}

/* 三欄類型格 */
.type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.type-card {
  background: #fff;
  border: 1.5px solid #e8e8e8;
  border-radius: 16px;
  padding: 40px 28px;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
}
.type-card:hover {
  border-color: #E8572A;
  box-shadow: 0 4px 20px rgba(232,87,42,0.1);
  transform: translateY(-2px);
}

.type-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.type-desc {
  font-size: 13px;
  color: #aaa;
  line-height: 1.6;
}
</style>
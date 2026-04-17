<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import NewsFormCard from '@/components/News/NewsFormCard.vue'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'

const router = useRouter()

const form = ref({
  title: '',
  category: '',
  publishTime: '',
  publishNow: false,
  content: '',
  coverImage: null,
  coverPreview: null,
})

const errors = ref({})

const clearError = (key) => { delete errors.value[key] }

const validate = () => {
  const e = {}
  if (!form.value.title.trim())   e.title       = '請輸入消息標題'
  if (!form.value.category)        e.category     = '請選擇消息類別'
  if (!form.value.publishNow && !form.value.publishTime) e.publishTime = '請選擇發佈時間或勾選即時發佈'
  if (!form.value.content.trim()) e.content      = '請輸入消息內容'
  errors.value = e
  return Object.keys(e).length === 0
}

const handleSubmit = () => {
  if (!validate()) return
  console.log('確認新增:', form.value)
  alert('新增成功！')
  router.back()
}

const handleDraft = () => {
  if (!form.value.title.trim()) {
    errors.value.title = '請輸入消息標題'
    return
  }
  console.log('儲存草稿:', form.value)
  alert('已儲存為草稿')
  router.back()
}

const handleCancel = () => {
  if (confirm('確定要取消嗎？未儲存的資料將會遺失。')) {
    router.back()
  }
}

const breadcrumbs = computed(() => [
  { text: '後台管理' },
  { text: '最新消息管理', onClick: () => router.back() },
  { text: '新增消息' },
])
</script>

<template>
  <div class="news-create-view">
    <!-- 麵包屑 -->
    <AppBreadcrumb :items="breadcrumbs" />

    <!-- 返回 -->
    <button class="back-btn" @click="router.back()">
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
      </svg>
      返回上一頁
    </button>

    <!-- 共用表單卡 -->
    <div class="card">
      <h2 class="card-title">消息資訊</h2>
      <NewsFormCard
        v-model="form"
        :errors="errors"
        @clearError="clearError"
      />
    </div>

    <!-- 底部按鈕 -->
    <div class="footer-actions">
      <button class="btn-submit" @click="handleSubmit">確認新增</button>
      <button class="btn-draft"  @click="handleDraft">儲存為草稿</button>
      <button class="btn-cancel" @click="handleCancel">取消</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.news-create-view {
  padding: 20px 28px 60px;
  background: #f3f4f6;
  min-height: 100%;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

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
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-title { font-size: 18px; font-weight: 600; color: #1f2937; margin: 0; }

.footer-actions {
  display: flex; justify-content: flex-end; align-items: center; gap: 10px;
}

.btn-submit {
  padding: 10px 24px;
  background: #E8572A; border: none; border-radius: 8px;
  color: #fff; font-size: 14px; font-weight: 500;
  cursor: pointer; font-family: inherit; transition: background 0.2s;
  &:hover { background: #d94b1f; }
}

.btn-draft {
  padding: 10px 24px;
  background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
  color: #374151; font-size: 14px; font-weight: 500;
  cursor: pointer; font-family: inherit; transition: all 0.2s;
  &:hover { border-color: #9ca3af; background: #f9fafb; }
}

.btn-cancel {
  padding: 10px 24px;
  background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
  color: #374151; font-size: 14px;
  cursor: pointer; font-family: inherit; transition: all 0.2s;
  &:hover { border-color: #9ca3af; background: #f9fafb; }
}

@media (max-width: 768px) {
  .news-create-view { padding: 16px 16px 60px; }
  .card { padding: 20px 16px; }
}
</style>
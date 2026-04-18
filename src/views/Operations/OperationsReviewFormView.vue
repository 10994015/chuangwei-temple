<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOperationsStore } from '@/stores/operations'

const router = useRouter()
const route  = useRoute()
const operationsStore = useOperationsStore()

const isSaving  = ref(false)
const form = ref({ reviewStatus: '', reviewNote: '' })

const goBack = () => router.push({ name: 'app.operations.review-detail', params: { userId: route.params.userId, applicationId: route.params.applicationId } })

const save = async () => {
  if (!form.value.reviewStatus) { alert('請選擇審核狀態'); return }
  isSaving.value = true
  try {
    await operationsStore.updateDesignerApplicationReview(
      route.params.userId,
      route.params.applicationId,
      { reviewStatus: form.value.reviewStatus, reviewNote: form.value.reviewNote },
    )
    alert('審核更新成功')
    goBack()
  } catch (err) {
    console.error('審核更新失敗:', err)
    alert('更新失敗，請稍後再試')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="review-form-view">
    <nav class="breadcrumb">
      <span class="link" @click="router.push('/operations')">營運後台</span>
      <span class="sep">›</span>
      <span class="link" @click="router.push({ name: 'app.operations.user-management', query: { tab: 'review' } })">用戶管理</span>
      <span class="sep">›</span>
      <span class="link" @click="goBack">用戶審核詳細</span>
      <span class="sep">›</span>
      <span class="current">審核操作</span>
    </nav>

    <div class="back-row">
      <button class="btn-back" @click="goBack">
        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" /></svg>
        返回
      </button>
    </div>

    <h1 class="page-title">審核操作</h1>

    <div class="form-card">
      <div class="form-field">
        <label class="form-label">審核狀態 <span class="required">*</span></label>
        <select v-model="form.reviewStatus" class="form-select">
          <option value="">請選擇</option>
          <option value="APPROVED">審核通過</option>
          <option value="REVIEW_FAILED">審核失敗</option>
          <option value="NEED_RESUBMIT">需要重新提交</option>
        </select>
      </div>
      <div class="form-field">
        <label class="form-label">審核備註</label>
        <textarea v-model="form.reviewNote" class="form-textarea" placeholder="請輸入備註（選填）" rows="4" />
      </div>
    </div>

    <div class="form-actions">
      <button class="btn-cancel" @click="goBack">取消</button>
      <button class="btn-save" @click="save" :disabled="isSaving">
        {{ isSaving ? '送出中...' : '送出審核' }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.review-form-view {
  padding: 24px;
  background: #f3f4f6;
  min-height: 100%;
  font-family: 'Noto Sans TC', sans-serif;
}

.breadcrumb {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  .sep     { color: #d1d5db; }
  .current { color: #E8572A; }
  .link    { cursor: pointer; &:hover { color: #374151; } }
}

.back-row { margin-bottom: 12px; }

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  font-family: 'Noto Sans TC', sans-serif;
  &:hover { background: #f9fafb; }
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 20px;
}

.form-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 28px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 560px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.required { color: #ef4444; }

.form-select {
  height: 40px;
  padding: 0 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  font-family: 'Noto Sans TC', sans-serif;
  background: #fff;
  outline: none;
  &:focus { border-color: #E8572A; }
}

.form-textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  font-family: 'Noto Sans TC', sans-serif;
  resize: vertical;
  outline: none;
  &:focus { border-color: #E8572A; }
}

.form-actions {
  display: flex;
  gap: 10px;
  max-width: 560px;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 9px 24px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  font-family: 'Noto Sans TC', sans-serif;
  &:hover { background: #f9fafb; }
}

.btn-save {
  padding: 9px 28px;
  border: none;
  border-radius: 8px;
  background: #E8572A;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Noto Sans TC', sans-serif;
  &:hover:not(:disabled) { background: #d04a20; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}
</style>

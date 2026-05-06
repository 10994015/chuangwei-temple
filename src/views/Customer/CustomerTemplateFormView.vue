<template>
  <div class="tmpl-form-page">
    <div class="breadcrumb">
      <span class="bc-link" @click="router.push({ name: 'app.cms.customer-template-management' })">網站模板管理</span>
      <span class="bc-sep">›</span>
      <span class="bc-current">新建模板</span>
    </div>

    <div class="form-card">
      <div class="form-card-header">新建網站模板</div>

      <div class="form-body">
        <!-- 模板名稱 -->
        <div class="form-group">
          <label class="form-label required">模板名稱</label>
          <input
            v-model="form.name"
            class="form-input"
            :class="{ 'has-error': errors.name }"
            placeholder="請輸入模板名稱"
          />
          <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
        </div>

        <!-- 方案層級 -->
        <div class="form-group">
          <label class="form-label required">方案層級</label>
          <div class="select-wrap">
            <select
              v-model="form.level"
              class="form-select"
              :class="{ 'has-error': errors.level }"
            >
              <option value="">請選擇層級</option>
              <option value="FREE">FREE</option>
              <option value="PRO">PRO</option>
              <option value="ENTERPRISE">ENTERPRISE</option>
            </select>
            <span class="select-arrow">▾</span>
          </div>
          <span v-if="errors.level" class="error-msg">{{ errors.level }}</span>
        </div>

        <!-- 描述 -->
        <div class="form-group form-group--full">
          <label class="form-label">描述</label>
          <textarea
            v-model="form.description"
            class="form-textarea"
            placeholder="請輸入模板描述（選填）"
            rows="4"
          />
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="form-footer">
        <button class="btn-cancel" @click="router.back()">取消</button>
        <button class="btn-submit" @click="handleSubmit" :disabled="submitting">
          <span v-if="submitting">建立中...</span>
          <span v-else>建立模板</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axiosClient from '@/axios'

const router = useRouter()

const form = reactive({
  name:        '',
  level:       '',
  description: '',
})

const errors     = reactive({ name: '', level: '' })
const submitting = ref(false)

const validate = () => {
  errors.name  = form.name.trim()  ? '' : '請輸入模板名稱'
  errors.level = form.level        ? '' : '請選擇方案層級'
  return !errors.name && !errors.level
}

const handleSubmit = async () => {
  if (!validate()) return
  submitting.value = true
  try {
    const payload = {
      name:        form.name.trim(),
      level:       form.level,
      description: form.description.trim() || undefined,
    }
    const res = await axiosClient.post('/frontend/web-template/', payload)
    const webTemplateId = res.data?.data?.webTemplateId
    alert('模板建立成功！')
    if (webTemplateId) {
      router.push({ name: 'app.cms.customer-template-detail', params: { templateId: webTemplateId } })
    } else {
      router.push({ name: 'app.cms.customer-template-management' })
    }
  } catch (e) {
    console.error('建立模板失敗:', e)
    alert(e.response?.data?.message || '建立失敗，請稍後再試')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.tmpl-form-page {
  padding: 24px 32px 60px;
  min-height: 100%;
  background: #f3f4f6;
}

/* 麵包屑 */
.breadcrumb { font-size: 13px; color: #999; margin-bottom: 24px; }
.bc-sep { margin: 0 6px; }
.bc-link { color: #E8572A; cursor: pointer; &:hover { text-decoration: underline; } }
.bc-current { color: #374151; font-weight: 500; }

/* 表單卡片 */
.form-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  max-width: 640px;
}

.form-card-header {
  padding: 18px 28px;
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  border-bottom: 1px solid #f3f4f6;
  background: #fafafa;
}

.form-body {
  padding: 28px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &--full { grid-column: 1 / -1; }
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;

  &.required::after {
    content: ' *';
    color: #E8572A;
  }
}

.form-input,
.form-select,
.form-textarea {
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  background: #fff;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;

  &:focus {
    border-color: #E8572A;
    box-shadow: 0 0 0 3px rgba(232,87,42,0.08);
  }

  &.has-error { border-color: #dc2626; }
}

.form-textarea { resize: vertical; min-height: 96px; }

.select-wrap { position: relative; }
.form-select { width: 100%; padding-right: 36px; appearance: none; cursor: pointer; }
.select-arrow {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  color: #9ca3af; pointer-events: none; font-size: 12px;
}

.error-msg { font-size: 12px; color: #dc2626; }

/* 底部按鈕 */
.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 28px;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
}

.btn-cancel {
  padding: 9px 22px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { border-color: #9ca3af; color: #374151; }
}

.btn-submit {
  padding: 9px 28px;
  background: #E8572A;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover:not(:disabled) { background: #d14a1f; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}

/* RWD */
@media (max-width: 640px) {
  .tmpl-form-page { padding: 16px 16px 40px; }
  .form-body { grid-template-columns: 1fr; }
  .form-card { max-width: 100%; }
}
</style>

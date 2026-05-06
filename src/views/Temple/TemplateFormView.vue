<template>
  <div class="template-form-page">
    <AppBreadcrumb :items="breadcrumbs" />

    <div class="page-header">
      <h1 class="page-title">建立模板</h1>
    </div>

    <form class="form-wrap" @submit.prevent="handleSubmit">

      <div class="form-card">
        <div class="form-card-title">基本資訊</div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">模板名稱</label>
            <input
              v-model="form.name"
              type="text"
              class="form-input"
              :class="{ 'is-error': errors.name }"
              placeholder="請輸入模板名稱"
            />
            <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">分類 ID（categoryId）</label>
            <input
              v-model="form.categoryId"
              type="text"
              class="form-input"
              placeholder="請輸入分類 ID（UUID）"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">類型</label>
            <select v-model="form.type" class="form-select" :class="{ 'is-error': errors.type }">
              <option value="">請選擇</option>
              <option value="TEMPLE">TEMPLE</option>
              <option value="PLATFORM_VENDOR">PLATFORM_VENDOR</option>
            </select>
            <span v-if="errors.type" class="form-error">{{ errors.type }}</span>
          </div>

          <div class="form-group">
            <label class="form-label required">方案層級</label>
            <select v-model="form.level" class="form-select" :class="{ 'is-error': errors.level }">
              <option value="">請選擇</option>
              <option value="FREE">FREE</option>
              <option value="PRO">PRO</option>
              <option value="ENTERPRISE">ENTERPRISE</option>
            </select>
            <span v-if="errors.level" class="form-error">{{ errors.level }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">狀態</label>
            <select v-model="form.status" class="form-select">
              <option value="OPEN">啟用（OPEN）</option>
              <option value="INVALID">停用（INVALID）</option>
            </select>
          </div>

          <div class="form-group"></div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">字型（frontFamily）</label>
            <select v-model="form.frontFamily" class="form-select">
              <option value="">請選擇字型</option>
              <optgroup label="繁體中文">
                <option v-for="f in zhTwFonts" :key="f.value" :value="f.label">{{ f.label }}</option>
              </optgroup>
              <optgroup label="簡體中文">
                <option v-for="f in zhCnFonts" :key="f.value" :value="f.label">{{ f.label }}</option>
              </optgroup>
            </select>
            <div v-if="form.frontFamily" class="font-preview">
              <span class="preview-label">字型預覽</span>
              <p class="preview-text" :style="{ fontFamily: fontCssFamily(form.frontFamily) }">
                歡迎來到宮廟網站，這是字型預覽文字。
              </p>
            </div>
          </div>

          <div class="form-group"></div>
        </div>

        <div class="form-row form-row--full">
          <div class="form-group">
            <label class="form-label">描述</label>
            <textarea
              v-model="form.description"
              class="form-textarea"
              rows="4"
              placeholder="請輸入模板描述"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- 操作列 -->
      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="router.back()">取消</button>
        <button type="submit" class="btn-submit" :disabled="isSubmitting">
          <span v-if="isSubmitting">建立中...</span>
          <span v-else>建立模板</span>
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'
import axiosClient from '@/axios'

// ── 字型清單（中文）──
const zhTwFonts = [
  { value: 'ibm-plex-sans-tc',    label: 'IBM Plex Sans TC',    cssFamily: "'IBM Plex Sans TC', sans-serif" },
  { value: 'lxgw-wenkai-mono-tc', label: 'LXGW WenKai Mono TC', cssFamily: "'LXGW WenKai Mono TC', monospace" },
  { value: 'noto-sans-tc',        label: 'Noto Sans TC',         cssFamily: "'Noto Sans TC', sans-serif" },
  { value: 'noto-serif-tc',       label: 'Noto Serif TC',        cssFamily: "'Noto Serif TC', serif" },
]

const zhCnFonts = [
  { value: 'noto-sans-sc',     label: 'Noto Sans SC',     cssFamily: "'Noto Sans SC', sans-serif" },
  { value: 'noto-serif-sc',    label: 'Noto Serif SC',    cssFamily: "'Noto Serif SC', serif" },
  { value: 'ibm-plex-sans-sc', label: 'IBM Plex Sans SC', cssFamily: "'IBM Plex Sans SC', sans-serif" },
]

const allFonts = [...zhTwFonts, ...zhCnFonts]

const fontCssFamily = (label) => {
  const found = allFonts.find(f => f.label === label)
  return found ? found.cssFamily : label
}

const route    = useRoute()
const router   = useRouter()
const templeId = route.params.templeId

const breadcrumbs = [
  { text: '宮廟後台',    to: `/${templeId}/dashboard` },
  { text: '網站模板管理', to: `/${templeId}/template-management` },
  { text: '建立模板',    to: null },
]

const form = reactive({
  categoryId:  '',
  type:        '',
  level:       '',
  name:        '',
  description: '',
  status:      'OPEN',
  frontFamily: '',
})

const errors      = reactive({})
const isSubmitting = ref(false)

const validate = () => {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.name.trim()) errors.name  = '請輸入模板名稱'
  if (!form.type)        errors.type  = '請選擇類型'
  if (!form.level)       errors.level = '請選擇方案層級'
  return Object.keys(errors).length === 0
}

const handleSubmit = async () => {
  if (!validate()) return
  isSubmitting.value = true
  try {
    await axiosClient.post('/backend/web-template/', {
      categoryId:  form.categoryId  || undefined,
      type:        form.type,
      level:       form.level,
      creatorType: 'SYSTEM',
      name:        form.name.trim(),
      description: form.description.trim() || undefined,
      status:      form.status,
      frontFamily: form.frontFamily.trim() || undefined,
    })
    alert('模板建立成功！')
    router.push({ name: 'app.temple.template-management', params: { templeId } })
  } catch (e) {
    const msg = e.response?.data?.message || '建立失敗，請稍後再試'
    alert(msg)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.template-form-page {
  padding: 24px;
  max-width: 900px;
}

.page-header { margin-bottom: 24px; }

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

/* 表單卡片 */
.form-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}

.form-card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

/* 表單列 */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;

  &--full {
    grid-template-columns: 1fr;
  }

  &:last-child { margin-bottom: 0; }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;

  &.required::after {
    content: ' *';
    color: #dc2626;
  }
}

.form-input,
.form-select,
.form-textarea {
  padding: 9px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
  font-family: inherit;

  &:focus { border-color: #E8572A; box-shadow: 0 0 0 3px rgba(232,87,42,0.08); }
  &.is-error { border-color: #dc2626; }
}

.form-textarea { resize: vertical; min-height: 96px; }

.form-error {
  font-size: 12px;
  color: #dc2626;
}

.font-preview {
  margin-top: 10px;
  padding: 12px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.preview-label {
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 6px;
}

.preview-text {
  font-size: 15px;
  color: #1f2937;
  margin: 0;
  line-height: 1.7;
}

/* 操作列 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  padding: 10px 24px;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { border-color: #9ca3af; }
}

.btn-submit {
  padding: 10px 28px;
  background: #E8572A;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
  &:hover:not(:disabled) { background: #d14a1f; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}

@media (max-width: 640px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>

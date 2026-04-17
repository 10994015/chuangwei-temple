<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'

const router = useRouter()
const route = useRoute()

const form = ref({
  name: '',
  type: '主祀神',
  source: '',
  sourceDate: '',
  contactName: '',
  contactPhone: '',
  contactAddress: '',
  birthday: '',
  photo: null,
})

const photoPreview = ref(null)
const isDragging = ref(false)
const fileInput = ref(null)

const handleFileChange = (file) => {
  if (!file) return
  form.value.photo = file
  const reader = new FileReader()
  reader.onload = (e) => { photoPreview.value = e.target.result }
  reader.readAsDataURL(file)
}

const onFileInput = (e) => {
  const file = e.target.files[0]
  if (file) handleFileChange(file)
}

const onDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) handleFileChange(file)
}

const removePhoto = () => {
  form.value.photo = null
  photoPreview.value = null
  if (fileInput.value) fileInput.value.value = ''
}

const goBack = () => {
  router.push({ name: 'app.temple.temple-info', params: { templeId: route.params.templeId } })
}

const handleSubmit = () => {
  if (!form.value.name || !form.value.source) {
    alert('請填寫必填欄位')
    return
  }
  alert('新增成功！')
  goBack()
}

const breadcrumbs = [
  { text: '後台管理' },
  { text: '宮廟資料管理', onClick: goBack },
  { text: '新增神尊' },
]
</script>

<template>
  <div class="deity-create-view">
    <!-- 麵包屑 -->
    <AppBreadcrumb :items="breadcrumbs" />

    <!-- Tab 列（靜態顯示，active 停在神尊管理）-->
    <div class="tab-bar">
      <button class="tab-btn" @click="goBack">基本資料</button>
      <button class="tab-btn active">神尊管理</button>
      <button class="tab-btn" @click="goBack">分靈管理</button>
      <button class="tab-btn" @click="goBack">資產管理</button>
    </div>

    <!-- 返回上一頁 -->
    <div class="back-link" @click="goBack">
      <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
      返回上一頁
    </div>

    <!-- 表單卡片 -->
    <div class="form-card">
      <h2 class="form-title">神尊資訊</h2>

      <div class="form-grid">
        <!-- 神尊稱謂 -->
        <div class="form-field">
          <label class="form-label">神尊稱謂 <em class="req">*</em></label>
          <input v-model="form.name" class="form-input" placeholder="請輸入神尊稱謂" />
        </div>

        <!-- 主祀/配祀 -->
        <div class="form-field">
          <label class="form-label">主祀/配祀</label>
          <div class="select-wrap">
            <select v-model="form.type" class="form-select">
              <option>主祀神</option>
              <option>配祀神</option>
            </select>
            <svg class="select-arrow" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
          </div>
        </div>

        <!-- 分靈來源 -->
        <div class="form-field">
          <label class="form-label">分靈來源 <em class="req">*</em></label>
          <input v-model="form.source" class="form-input" placeholder="請輸入分靈來源" />
        </div>

        <!-- 分靈日期 -->
        <div class="form-field">
          <label class="form-label">分靈日期</label>
          <input v-model="form.sourceDate" class="form-input" placeholder="年 /月/日" type="text" />
        </div>

        <!-- 分靈地聯絡人 -->
        <div class="form-field">
          <label class="form-label">分靈地聯絡人</label>
          <input v-model="form.contactName" class="form-input" placeholder="請輸入聯絡人" />
        </div>

        <!-- 分靈地連絡電話 -->
        <div class="form-field">
          <label class="form-label">分靈地連絡電話</label>
          <input v-model="form.contactPhone" class="form-input" placeholder="請輸入連絡電話" />
        </div>

        <!-- 分靈地聯絡地址（全寬） -->
        <div class="form-field full">
          <label class="form-label">分靈地聯絡地址</label>
          <input v-model="form.contactAddress" class="form-input" placeholder="請輸入聯絡地址" />
        </div>

        <!-- 神尊誕辰（半寬） -->
        <div class="form-field">
          <label class="form-label">神尊誕辰</label>
          <input v-model="form.birthday" class="form-input" placeholder="例：農曆三月十五日" />
        </div>

        <!-- 神尊照片（全寬） -->
        <div class="form-field full">
          <label class="form-label">神尊照片</label>

          <!-- 已上傳預覽 -->
          <div v-if="photoPreview" class="photo-preview-wrap">
            <img :src="photoPreview" class="photo-preview" />
            <button class="photo-remove" @click="removePhoto">
              <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
            </button>
          </div>

          <!-- 上傳區 -->
          <div
            v-else
            class="upload-zone"
            :class="{ dragging: isDragging }"
            @click="fileInput.click()"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
          >
            <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
            </svg>
            <p class="upload-text">點擊或拖曳圖片至此上傳</p>
            <p class="upload-hint">支援 JPG, PNG 格式</p>
            <input ref="fileInput" type="file" accept="image/jpeg,image/png" class="file-input-hidden" @change="onFileInput" />
          </div>
        </div>
      </div>

      <!-- 底部按鈕 -->
      <div class="form-actions">
        <button class="btn-submit" @click="handleSubmit">確認新增</button>
        <button class="btn-cancel" @click="goBack">取消</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.deity-create-view {
  padding: 20px 28px 48px;
  background: #f3f4f6;
  min-height: 100%;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 16px;
}


// ── Tab 列 ──
.tab-bar {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}
.tab-btn {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 15px;
  color: #6b7280;
  cursor: pointer;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  transition: all 0.15s;
  margin-bottom: -1px;
  &:hover { color: #374151; }
  &.active {
    color: #E8572A;
    border-bottom-color: #E8572A;
    font-weight: 500;
  }
}

// ── 返回 ──
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  width: fit-content;
  transition: color 0.15s;
  &:hover { color: #E8572A; }
  svg { width: 16px; height: 16px; }
}

// ── 表單卡片 ──
.form-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  padding: 28px 32px 32px;
}

.form-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 28px;
}

// ── 表單格 ──
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 28px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  &.full { grid-column: 1 / -1; }
}

.form-label {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.req {
  font-style: normal;
  color: #E8572A;
}

.form-input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  background: #fff;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
  &::placeholder { color: #9ca3af; }
  &:focus {
    outline: none;
    border-color: #E8572A;
    box-shadow: 0 0 0 2px rgba(232,87,42,0.08);
  }
}

// ── Select ──
.select-wrap {
  position: relative;
}
.form-select {
  width: 100%;
  padding: 10px 40px 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  background: #fff;
  appearance: none;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  cursor: pointer;
  box-sizing: border-box;
  transition: border-color 0.2s;
  &:focus {
    outline: none;
    border-color: #E8572A;
    box-shadow: 0 0 0 2px rgba(232,87,42,0.08);
  }
}
.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #9ca3af;
  pointer-events: none;
}

// ── 上傳區 ──
.upload-zone {
  width: 100%;
  min-height: 140px;
  border: 1.5px dashed #d1d5db;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  background: #fafafa;
  box-sizing: border-box;
  position: relative;

  &:hover, &.dragging {
    border-color: #E8572A;
    background: #fff7f3;
  }
}
.upload-icon {
  width: 32px;
  height: 32px;
  color: #9ca3af;
  margin-bottom: 4px;
}
.upload-text {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}
.upload-hint {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}
.file-input-hidden {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

// ── 照片預覽 ──
.photo-preview-wrap {
  position: relative;
  width: 160px;
}
.photo-preview {
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}
.photo-remove {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  background: rgba(0,0,0,0.5);
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  svg { width: 14px; height: 14px; }
  &:hover { background: rgba(0,0,0,0.75); }
}

// ── 底部按鈕 ──
.form-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

.btn-submit {
  padding: 10px 28px;
  background: #E8572A;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  transition: background 0.2s;
  &:hover { background: #d94b1f; }
}

.btn-cancel {
  padding: 10px 28px;
  background: #fff;
  color: #374151;
  border: 1.5px solid #e5e7eb;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  transition: all 0.2s;
  &:hover { border-color: #d1d5db; background: #f9fafb; }
}

@media (max-width: 768px) {
  .deity-create-view { padding: 16px; }
  .form-grid { grid-template-columns: 1fr; }
  .form-card { padding: 20px 16px; }
}
</style>
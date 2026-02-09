<template>
  <div class="website-settings">
    <!-- 頂部導航 -->
    <div class="settings-header">
      <button class="back-button" @click="handleBack">
        <span class="icon">←</span>
        返回編輯器
      </button>
      <h1 class="settings-title">網站設定</h1>
      <div class="header-actions">
        <button 
          class="save-button" 
          @click="handleSave"
          :disabled="isSaving || !hasChanges"
        >
          <span v-if="isSaving">儲存中...</span>
          <span v-else>儲存變更</span>
        </button>
      </div>
    </div>

    <!-- 載入狀態 -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>載入中...</p>
    </div>

    <!-- 錯誤訊息 -->
    <div v-if="error" class="error-banner">
      <span class="error-icon">⚠️</span>
      <span>{{ error }}</span>
      <button class="retry-button" @click="loadSettings">重試</button>
    </div>

    <!-- 設定表單 -->
    <div v-if="!isLoading && !error" class="settings-content">
      <!-- SEO 設定區塊 -->
      <section class="settings-section">
        <div class="section-header">
          <h2 class="section-title">SEO 設定</h2>
          <p class="section-description">優化您的網站在搜尋引擎中的排名</p>
        </div>

        <div class="form-group">
          <label class="form-label" for="seo-title">
            網站標題 (SEO Title)
            <span class="required">*</span>
          </label>
          <input
            id="seo-title"
            v-model="formData.seo_title"
            type="text"
            class="form-input"
            placeholder=""
            maxlength="60"
            @input="markAsChanged"
          />
          <div class="input-hint">
            <span :class="{ 'text-warning': formData.seo_title.length > 50 }">
              {{ formData.seo_title.length }} / 60 字
            </span>
            <span class="hint-text"></span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="seo-description">
            網站描述 (SEO Description)
            <span class="required">*</span>
          </label>
          <textarea
            id="seo-description"
            v-model="formData.seo_description"
            class="form-textarea"
            placeholder=""
            maxlength="160"
            rows="4"
            @input="markAsChanged"
          ></textarea>
          <div class="input-hint">
            <span :class="{ 'text-warning': formData.seo_description.length > 150 }">
              {{ formData.seo_description.length }} / 160 字
            </span>
            <span class="hint-text"></span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="seo-keywords">
            關鍵字 (SEO Keywords)
          </label>
          <input
            id="seo-keywords"
            v-model="formData.seo_keywords"
            type="text"
            class="form-input"
            placeholder=""
            @input="markAsChanged"
          />
          <p class="input-hint">
            <span class="hint-text"></span>
          </p>
        </div>

        <div class="form-group">
          <label class="form-label" for="meta-pixel">
            Meta Pixel ID
          </label>
          <input
            id="meta-pixel"
            v-model="formData.meta_pixel"
            type="text"
            class="form-input"
            placeholder="例如：1234567890"
            @input="markAsChanged"
          />
          <p class="input-hint">
            <span class="hint-text">用於 Facebook 廣告追蹤</span>
          </p>
        </div>
      </section>

      <!-- 變更提示 -->
      <div v-if="hasChanges" class="changes-banner">
        <span class="changes-icon">✏️</span>
        <span>您有未儲存的變更</span>
        <div class="changes-actions">
          <button class="cancel-button" @click="handleCancel">取消</button>
          <button class="save-button-small" @click="handleSave">儲存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePageEditorStore } from '@/stores/pageEditor'

const router = useRouter()
const route = useRoute()
const pageEditorStore = usePageEditorStore()

// Props - 從路由參數獲取 templeId
const templeId = computed(() => route.params.templeId)

// 狀態
const isLoading = ref(true)
const isSaving = ref(false)
const error = ref(null)
const hasChanges = ref(false)

// 表單資料
const formData = reactive({
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
  meta_pixel: ''
})

// 原始資料（用於比對變更）
const originalData = reactive({
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
  meta_pixel: ''
})

// ==================== 載入設定 ====================

const loadSettings = async () => {
  isLoading.value = true
  error.value = null

  try {
    // 使用 Store 的 API 方法
    const settings = await pageEditorStore.fetchWebsiteSettings(templeId.value)
    
    if (settings) {
      // 更新表單資料
      formData.seo_title = settings.seo_title || ''
      formData.seo_description = settings.seo_description || ''
      formData.seo_keywords = settings.seo_keywords || ''
      formData.meta_pixel = settings.meta_pixel || ''

      // 儲存原始資料
      Object.assign(originalData, formData)
      
      hasChanges.value = false
    }
  } catch (err) {
    console.error('❌ 載入設定失敗:', err)
    error.value = pageEditorStore.error || '載入設定失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}

// ==================== 儲存設定 ====================

const handleSave = async () => {
  // 驗證必填欄位
  if (!formData.seo_title.trim()) {
    alert('請填寫網站標題')
    return
  }

  if (!formData.seo_description.trim()) {
    alert('請填寫網站描述')
    return
  }

  isSaving.value = true

  try {
    // 準備請求資料
    const settingsData = {
      seo_title: formData.seo_title.trim(),
      seo_description: formData.seo_description.trim(),
      seo_keywords: formData.seo_keywords.trim(),
      meta_pixel: formData.meta_pixel.trim()
    }

    // 使用 Store 的 API 方法
    const success = await pageEditorStore.updateWebsiteSettings(
      templeId.value,
      settingsData
    )

    if (success) {
      // 更新原始資料
      Object.assign(originalData, formData)
      hasChanges.value = false
      alert('設定已儲存！')
    } else {
      error.value = pageEditorStore.error || '儲存失敗，請稍後再試'
      alert('儲存失敗：' + error.value)
    }
  } finally {
    isSaving.value = false
  }
}

// ==================== 取消變更 ====================

const handleCancel = () => {
  if (confirm('確定要放棄所有未儲存的變更嗎？')) {
    Object.assign(formData, originalData)
    hasChanges.value = false
  }
}

// ==================== 返回編輯器 ====================

const handleBack = () => {
  if (hasChanges.value) {
    if (confirm('您有未儲存的變更，確定要離開嗎？')) {
      router.back()
    }
  } else {
    router.back()
  }
}

// ==================== 標記有變更 ====================

const markAsChanged = () => {
  hasChanges.value = 
    formData.seo_title !== originalData.seo_title ||
    formData.seo_description !== originalData.seo_description ||
    formData.seo_keywords !== originalData.seo_keywords ||
    formData.meta_pixel !== originalData.meta_pixel
}

// ==================== 掛載 ====================

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.website-settings {
  min-height: 100vh;
  background: #f5f5f5;
}

/* ==================== 頂部導航 ==================== */

.settings-header {
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.back-button:hover {
  background: #f5f5f5;
  border-color: #E8572A;
  color: #E8572A;
}

.back-button .icon {
  font-size: 1.2rem;
}

.settings-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.save-button {
  padding: 0.75rem 1.5rem;
  background: #E8572A;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.save-button:hover:not(:disabled) {
  background: #d14a1f;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(232, 87, 42, 0.3);
}

.save-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* ==================== 載入與錯誤 ==================== */

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #E8572A;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-banner {
  margin: 2rem;
  padding: 1rem 1.5rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.error-icon {
  font-size: 1.5rem;
}

.retry-button {
  margin-left: auto;
  padding: 0.5rem 1rem;
  background: #c33;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-button:hover {
  background: #a22;
}

/* ==================== 設定內容 ==================== */

.settings-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.settings-section {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.section-description {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

/* ==================== 表單元件 ==================== */

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
}

.required {
  color: #E8572A;
  margin-left: 0.25rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #E8572A;
  box-shadow: 0 0 0 3px rgba(232, 87, 42, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.input-hint {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #999;
}

.hint-text {
  color: #999;
}

.text-warning {
  color: #ff9800;
  font-weight: 500;
}

/* ==================== Google 預覽 ==================== */

.preview-section {
  background: #fafafa;
}

.google-preview {
  padding: 1.5rem;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.preview-url {
  color: #1a0dab;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.preview-title {
  color: #1a0dab;
  font-size: 1.25rem;
  font-weight: 400;
  margin-bottom: 0.5rem;
  line-height: 1.3;
  text-decoration: none;
  cursor: pointer;
}

.preview-title:hover {
  text-decoration: underline;
}

.preview-description {
  color: #545454;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* ==================== 變更提示 ==================== */

.changes-banner {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  border: 2px solid #E8572A;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.changes-icon {
  font-size: 1.5rem;
}

.changes-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.cancel-button {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button:hover {
  background: #f5f5f5;
  border-color: #999;
}

.save-button-small {
  padding: 0.5rem 1rem;
  background: #E8572A;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.save-button-small:hover {
  background: #d14a1f;
}

/* ==================== 響應式 ==================== */

@media (max-width: 768px) {
  .settings-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .settings-title {
    order: -1;
    text-align: center;
  }

  .header-actions {
    justify-content: center;
  }

  .settings-content {
    padding: 1rem;
  }

  .settings-section {
    padding: 1.5rem;
  }
}
</style>
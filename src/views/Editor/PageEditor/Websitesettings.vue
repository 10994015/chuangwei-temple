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
    <div v-if="error" class="error-container">
      <div class="error-banner">
        <span class="error-icon">⚠️</span>
        <span>{{ error }}</span>
        <button class="retry-button" @click="loadSettings">重試</button>
      </div>
    </div>

    <!-- 設定表單 -->
    <div v-if="!isLoading && !error" class="settings-content">
      <!-- 字型設定區塊 -->
      <section class="settings-section">
        <div class="section-header">
          <h2 class="section-title">字型設定</h2>
          <p class="section-description">選擇網站使用的字型樣式</p>
        </div>

        <!-- 繁體中文字型 -->
        <div class="form-group">
          <label class="form-label" for="font-family-zh-tw">
            繁體中文字型（ZH-TW）
            <span class="required">*</span>
          </label>
          <select
            id="font-family-zh-tw"
            v-model="formData.frontFamilyZhTw"
            class="form-select"
            @change="markAsChanged"
          >
            <option value="">請選擇字型</option>
            <option v-for="font in zhTwFonts" :key="font.value" :value="font.value">
              {{ font.label }}
            </option>
          </select>
        </div>
        <div v-if="formData.frontFamilyZhTw" class="font-preview">
          <div class="preview-label">繁中字型預覽</div>
          <div class="preview-content" :style="{ fontFamily: getFontFamily(formData.frontFamilyZhTw) }">
            <p class="preview-chinese">歡迎來到宮廟網站，這是繁體中文預覽文字。</p>
          </div>
        </div>

        <!-- 簡體中文字型 -->
        <div class="form-group">
          <label class="form-label" for="font-family-zh-cn">
            簡體中文字型（ZH-CN）
            <span class="required">*</span>
          </label>
          <select
            id="font-family-zh-cn"
            v-model="formData.frontFamilyZhCn"
            class="form-select"
            @change="markAsChanged"
          >
            <option value="">請選擇字型</option>
            <option v-for="font in zhCnFonts" :key="font.value" :value="font.value">
              {{ font.label }}
            </option>
          </select>
        </div>
        <div v-if="formData.frontFamilyZhCn" class="font-preview">
          <div class="preview-label">简中字型预览</div>
          <div class="preview-content" :style="{ fontFamily: getFontFamily(formData.frontFamilyZhCn) }">
            <p class="preview-chinese">欢迎来到宫庙网站，这是简体中文预览文字。</p>
          </div>
        </div>

        <!-- 英文字型 -->
        <div class="form-group">
          <label class="form-label" for="font-family-en-us">
            英文字型（EN-US）
            <span class="required">*</span>
          </label>
          <select
            id="font-family-en-us"
            v-model="formData.frontFamilyEnUs"
            class="form-select"
            @change="markAsChanged"
          >
            <option value="">請選擇字型</option>
            <option v-for="font in enFonts" :key="font.value" :value="font.value">
              {{ font.label }}
            </option>
          </select>
        </div>
        <div v-if="formData.frontFamilyEnUs" class="font-preview">
          <div class="preview-label">EN Font Preview</div>
          <div class="preview-content" :style="{ fontFamily: getFontFamily(formData.frontFamilyEnUs) }">
            <p class="preview-english">Welcome to Temple Website, this is English preview text.</p>
          </div>
        </div>
      </section>

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
            v-model="formData.seoTitle"
            type="text"
            class="form-input"
            placeholder=""
            maxlength="60"
            @input="markAsChanged"
          />
          <div class="input-hint">
            <span :class="{ 'text-warning': formData.seoTitle.length > 50 }">
              {{ formData.seoTitle.length }} / 60 字
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
            v-model="formData.seoDescription"
            class="form-textarea"
            placeholder=""
            maxlength="160"
            rows="4"
            @input="markAsChanged"
          ></textarea>
          <div class="input-hint">
            <span :class="{ 'text-warning': formData.seoDescription.length > 150 }">
              {{ formData.seoDescription.length }} / 160 字
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
            v-model="formData.seoKeywords"
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
            v-model="formData.metaPixel"
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

// ==================== 字型清單（按語言分類）====================

const zhTwFonts = [
  { value: 'ibm-plex-sans-tc',    label: 'IBM Plex Sans TC',    googleFont: 'IBM+Plex+Sans+TC:wght@400;600',                  cssFamily: "'IBM Plex Sans TC', sans-serif" },
  { value: 'lxgw-wenkai-mono-tc', label: 'LXGW WenKai Mono TC', googleFont: 'LXGW+WenKai+Mono+TC',                            cssFamily: "'LXGW WenKai Mono TC', monospace" },
  { value: 'noto-sans-tc',        label: 'Noto Sans TC',         googleFont: 'Noto+Sans+TC:wght@400;600',                      cssFamily: "'Noto Sans TC', sans-serif" },
  { value: 'noto-serif-tc',       label: 'Noto Serif TC',        googleFont: 'Noto+Serif+TC:wght@400;600',                     cssFamily: "'Noto Serif TC', serif" },
]

const zhCnFonts = [
  { value: 'noto-sans-sc',        label: 'Noto Sans SC',         googleFont: 'Noto+Sans+SC:wght@400;600',                      cssFamily: "'Noto Sans SC', sans-serif" },
  { value: 'noto-serif-sc',       label: 'Noto Serif SC',        googleFont: 'Noto+Serif+SC:wght@400;600',                     cssFamily: "'Noto Serif SC', serif" },
  { value: 'ibm-plex-sans-sc',    label: 'IBM Plex Sans SC',     googleFont: 'IBM+Plex+Sans+SC:wght@400;600',                  cssFamily: "'IBM Plex Sans SC', sans-serif" },
]

const enFonts = [
  { value: 'bona-nova',           label: 'Bona Nova',            googleFont: 'Bona+Nova:ital,wght@0,400;0,700;1,400',          cssFamily: "'Bona Nova', serif" },
  { value: 'inter',               label: 'Inter',                googleFont: 'Inter:wght@400;600',                             cssFamily: "'Inter', sans-serif" },
  { value: 'cormorant-garamond',  label: 'Cormorant Garamond',   googleFont: 'Cormorant+Garamond:ital,wght@0,400;0,600;1,400', cssFamily: "'Cormorant Garamond', serif" },
  { value: 'montserrat',          label: 'Montserrat',           googleFont: 'Montserrat:wght@400;600',                        cssFamily: "'Montserrat', sans-serif" },
  { value: 'playfair-display',    label: 'Playfair Display',     googleFont: 'Playfair+Display:ital,wght@0,400;0,600;1,400',   cssFamily: "'Playfair Display', serif" },
]

// 合併用於 getFontFamily 查找
const allFonts = [...zhTwFonts, ...zhCnFonts, ...enFonts]

// ==================== 狀態 ====================

const templeId = computed(() => route.params.templeId)
const isLoading = ref(true)
const isSaving = ref(false)
const error = ref(null)
const hasChanges = ref(false)

const formData = reactive({
  frontFamilyZhTw: '',
  frontFamilyZhCn: '',
  frontFamilyEnUs: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  metaPixel: ''
})

const originalData = reactive({
  frontFamilyZhTw: '',
  frontFamilyZhCn: '',
  frontFamilyEnUs: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  metaPixel: ''
})

const getFontFamily = (fontValue) => {
  const font = allFonts.find(f => f.value === fontValue)
  return font ? font.cssFamily : "'Noto Sans TC', sans-serif"
}

// ==================== 載入設定 ====================

const loadSettings = async () => {
  isLoading.value = true
  error.value = null

  try {
    const settings = await pageEditorStore.fetchWebsiteSettings(templeId.value)
    
    if (settings) {
      formData.frontFamilyZhTw = settings.frontFamilyZhTw || 'noto-sans-tc'
      formData.frontFamilyZhCn = settings.frontFamilyZhCn || 'noto-sans-sc'
      formData.frontFamilyEnUs = settings.frontFamilyEnUs || 'inter'
      formData.seoTitle        = settings.seoTitle        || ''
      formData.seoDescription  = settings.seoDescription  || ''
      formData.seoKeywords     = settings.seoKeywords     || ''
      formData.metaPixel       = settings.metaPixel       || ''

      Object.assign(originalData, formData)
      hasChanges.value = false

      console.log('✓ 設定已載入 (從 API):', {
        front_family: settings.front_family,
        seo_title: settings.seo_title,
        轉換後: formData
      })
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
  if (!formData.frontFamilyZhTw || !formData.frontFamilyZhCn || !formData.frontFamilyEnUs) {
    alert('請選擇所有語言的網站字型')
    return
  }
  if (!formData.seoTitle.trim()) { alert('請填寫網站標題'); return }
  if (!formData.seoDescription.trim()) { alert('請填寫網站描述'); return }

  isSaving.value = true

  try {
    const settingsData = {
      frontFamilyZhTw: formData.frontFamilyZhTw,
      frontFamilyZhCn: formData.frontFamilyZhCn,
      frontFamilyEnUs: formData.frontFamilyEnUs,
      seoTitle:        formData.seoTitle.trim(),
      seoDescription:  formData.seoDescription.trim(),
      seoKeywords:     formData.seoKeywords.trim(),
      metaPixel:       formData.metaPixel.trim()
    }

    const success = await pageEditorStore.updateWebsiteSettings(templeId.value, settingsData)

    if (success) {
      alert('設定已儲存！')
      // ✅ 重新讀取設定（顯示載入中，不整頁重新整理）
      await loadSettings()
    } else {
      error.value = pageEditorStore.error || '儲存失敗，請稍後再試'
      alert('儲存失敗：' + error.value)
    }
  } finally {
    isSaving.value = false
  }
}

// ==================== 其他事件 ====================

const handleCancel = () => {
  if (confirm('確定要放棄所有未儲存的變更嗎？')) {
    Object.assign(formData, originalData)
    hasChanges.value = false
  }
}

const handleBack = () => {
  if (hasChanges.value) {
    if (confirm('您有未儲存的變更，確定要離開嗎？')) router.back()
  } else {
    router.back()
  }
}

const markAsChanged = () => {
  hasChanges.value =
    formData.frontFamilyZhTw !== originalData.frontFamilyZhTw ||
    formData.frontFamilyZhCn !== originalData.frontFamilyZhCn ||
    formData.frontFamilyEnUs !== originalData.frontFamilyEnUs ||
    formData.seoTitle        !== originalData.seoTitle        ||
    formData.seoDescription  !== originalData.seoDescription  ||
    formData.seoKeywords     !== originalData.seoKeywords     ||
    formData.metaPixel       !== originalData.metaPixel
}

onMounted(() => { loadSettings() })
</script>

<style scoped>
.website-settings {
  min-height: 100vh;
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

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

.back-button .icon { font-size: 1.2rem; }

.settings-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.header-actions { display: flex; gap: 0.5rem; }

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

.save-button:disabled { background: #ccc; cursor: not-allowed; }

.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

.error-container {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem;
}

.error-banner {
  width: 100%;
  max-width: 900px;
  padding: 1rem 1.5rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.error-icon { font-size: 1.5rem; }

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

.retry-button:hover { background: #a22; }

.settings-content {
  flex: 1;
  overflow-y: auto;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;
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

.section-description { color: #666; font-size: 0.9rem; margin: 0; }

.form-group { margin-bottom: 1.5rem; }

.form-label {
  display: block;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
}

.required { color: #E8572A; margin-left: 0.25rem; }

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #E8572A;
  box-shadow: 0 0 0 3px rgba(232, 87, 42, 0.1);
}

.form-textarea { resize: vertical; min-height: 100px; font-family: inherit; }
.form-select { cursor: pointer; background: #fff; }

.input-hint {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #999;
}

.hint-text { color: #999; }
.text-warning { color: #ff9800; font-weight: 500; }

.font-preview {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.preview-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
  margin-bottom: 1rem;
}

.preview-content {
  background: #fff;
  padding: 1.5rem;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.preview-chinese { font-size: 1.25rem; line-height: 1.8; color: #333; margin: 0 0 1rem 0; }
.preview-english { font-size: 1.1rem; line-height: 1.6; color: #555; margin: 0 0 1rem 0; }
.preview-numbers { font-size: 1rem; color: #777; margin: 0; }

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

.changes-icon { font-size: 1.5rem; }
.changes-actions { display: flex; gap: 0.5rem; margin-left: auto; }

.cancel-button {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button:hover { background: #f5f5f5; border-color: #999; }

.save-button-small {
  padding: 0.5rem 1rem;
  background: #E8572A;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.save-button-small:hover { background: #d14a1f; }

.settings-content::-webkit-scrollbar { width: 8px; }
.settings-content::-webkit-scrollbar-track { background: #f5f5f5; }
.settings-content::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
.settings-content::-webkit-scrollbar-thumb:hover { background: #999; }

@media (max-width: 768px) {
  .settings-header { flex-direction: column; gap: 1rem; align-items: stretch; }
  .settings-title { order: -1; text-align: center; }
  .header-actions { justify-content: center; }
  .settings-content { padding: 1rem; }
  .settings-section { padding: 1.5rem; }
}
</style>
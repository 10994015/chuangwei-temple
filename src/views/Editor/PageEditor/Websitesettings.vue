<template>
  <div class="website-settings">
    <!-- 頂部導航 -->
    <div class="settings-header">
      <button class="back-button" @click="handleBack">
        <span class="icon">←</span>
        {{ t('websiteSettings.backBtn') }}
      </button>
      <h1 class="settings-title">{{ t('websiteSettings.pageTitle') }}</h1>
      <div class="header-actions">
        <button
          class="save-button"
          @click="handleSave"
          :disabled="isSaving || !hasChanges"
        >
          <span v-if="isSaving">{{ t('websiteSettings.saving') }}</span>
          <span v-else>{{ t('websiteSettings.saveBtn') }}</span>
        </button>
      </div>
    </div>

    <!-- 載入狀態 -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>{{ t('websiteSettings.loading') }}</p>
    </div>

    <!-- 錯誤訊息 -->
    <div v-if="error" class="error-container">
      <div class="error-banner">
        <span class="error-icon">⚠️</span>
        <span>{{ error }}</span>
        <button class="retry-button" @click="loadSettings">{{ t('websiteSettings.retry') }}</button>
      </div>
    </div>

    <!-- 設定表單 -->
    <div v-if="!isLoading && !error" class="settings-content">

      <!-- ===== 字型設定區塊 ===== -->
      <section class="settings-section">
        <div class="section-header">
          <h2 class="section-title">{{ t('websiteSettings.fontSection') }}</h2>
          <p class="section-description">{{ t('websiteSettings.fontSectionDesc') }}</p>
        </div>

        <!-- 繁體中文字型 -->
        <div class="form-group">
          <label class="form-label" for="font-family-zh-tw">
            {{ t('websiteSettings.fontZhTwLabel') }}
            <span class="required">*</span>
          </label>
          <select
            id="font-family-zh-tw"
            v-model="siteForm.frontFamilyZhTw"
            class="form-select"
            @change="markSiteChanged"
          >
            <option value="">{{ t('websiteSettings.fontSelectPlaceholder') }}</option>
            <option v-for="font in zhTwFonts" :key="font.value" :value="font.value">
              {{ font.label }}
            </option>
          </select>
        </div>
        <div v-if="siteForm.frontFamilyZhTw" class="font-preview">
          <div class="preview-label">繁中字型預覽</div>
          <div class="preview-content" :style="{ fontFamily: getFontFamily(siteForm.frontFamilyZhTw) }">
            <p class="preview-chinese">歡迎來到宮廟網站，這是繁體中文預覽文字。</p>
          </div>
        </div>

        <!-- 簡體中文字型 -->
        <div class="form-group">
          <label class="form-label" for="font-family-zh-cn">
            {{ t('websiteSettings.fontZhCnLabel') }}
            <span class="required">*</span>
          </label>
          <select
            id="font-family-zh-cn"
            v-model="siteForm.frontFamilyZhCn"
            class="form-select"
            @change="markSiteChanged"
          >
            <option value="">{{ t('websiteSettings.fontSelectPlaceholder') }}</option>
            <option v-for="font in zhCnFonts" :key="font.value" :value="font.value">
              {{ font.label }}
            </option>
          </select>
        </div>
        <div v-if="siteForm.frontFamilyZhCn" class="font-preview">
          <div class="preview-label">简中字型预览</div>
          <div class="preview-content" :style="{ fontFamily: getFontFamily(siteForm.frontFamilyZhCn) }">
            <p class="preview-chinese">欢迎来到宫庙网站，这是简体中文预览文字。</p>
          </div>
        </div>

        <!-- 英文字型 -->
        <div class="form-group">
          <label class="form-label" for="font-family-en-us">
            {{ t('websiteSettings.fontEnUsLabel') }}
            <span class="required">*</span>
          </label>
          <select
            id="font-family-en-us"
            v-model="siteForm.frontFamilyEnUs"
            class="form-select"
            @change="markSiteChanged"
          >
            <option value="">{{ t('websiteSettings.fontSelectPlaceholder') }}</option>
            <option v-for="font in enFonts" :key="font.value" :value="font.value">
              {{ font.label }}
            </option>
          </select>
        </div>
        <div v-if="siteForm.frontFamilyEnUs" class="font-preview">
          <div class="preview-label">EN Font Preview</div>
          <div class="preview-content" :style="{ fontFamily: getFontFamily(siteForm.frontFamilyEnUs) }">
            <p class="preview-english">Welcome to Temple Website, this is English preview text.</p>
          </div>
        </div>
      </section>

      <!-- ===== 追蹤設定區塊 (Meta Pixel + Google GTM) ===== -->
      <section class="settings-section">
        <div class="section-header">
          <h2 class="section-title">{{ t('websiteSettings.trackingSection') }}</h2>
          <p class="section-description">{{ t('websiteSettings.trackingSectionDesc') }}</p>
        </div>

        <div class="form-group">
          <label class="form-label" for="meta-pixel">
            Meta Pixel ID
          </label>
          <input
            id="meta-pixel"
            v-model="siteForm.metaPixel"
            type="text"
            class="form-input"
            :placeholder="t('websiteSettings.metaPixelPlaceholder')"
            @input="markSiteChanged"
          />
          <p class="input-hint">
            <span class="hint-text">{{ t('websiteSettings.metaPixelHint') }}</span>
          </p>
        </div>

        <div class="form-group">
          <label class="form-label" for="google-gtm">
            Google GTM ID
          </label>
          <input
            id="google-gtm"
            v-model="siteForm.googleGtm"
            type="text"
            class="form-input"
            placeholder="GTM-XXXXXXX"
            @input="markSiteChanged"
          />
          <p class="input-hint">
            <span class="hint-text">{{ t('websiteSettings.googleGtmHint') }}</span>
          </p>
        </div>
      </section>

      <!-- ===== SEO 設定區塊（依頁面分開） ===== -->
      <section class="settings-section">
        <div class="section-header">
          <h2 class="section-title">{{ t('websiteSettings.seoSection') }}</h2>
          <p class="section-description">{{ t('websiteSettings.seoSectionDesc') }}</p>
        </div>

        <!-- 頁面切換 Tab -->
        <div class="seo-tabs">
          <button
            v-for="tab in pageEditorStore.headerTabs"
            :key="tab.slug"
            class="seo-tab"
            :class="{ active: activeSeoSlug === tab.slug }"
            @click="switchSeoTab(tab.slug)"
          >
            {{ tab.name }}
          </button>
        </div>

        <!-- SEO 載入中 -->
        <div v-if="isSeoLoading" class="seo-loading">
          <div class="spinner spinner-sm"></div>
          <span>載入 SEO 資料中...</span>
        </div>

        <!-- SEO 表單 -->
        <template v-else-if="activeSeoSlug">
          <div class="form-group">
            <label class="form-label" for="seo-title">
              {{ t('websiteSettings.seoTitleLabel') }}
              <span class="required">*</span>
            </label>
            <input
              id="seo-title"
              v-model="seoForm.seoTitle"
              type="text"
              class="form-input"
              maxlength="60"
              @input="markSeoChanged"
            />
            <div class="input-hint">
              <span :class="{ 'text-warning': seoForm.seoTitle.length > 50 }">
                {{ t('websiteSettings.charCount', { n: seoForm.seoTitle.length, max: 60 }) }}
              </span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="seo-description">
              {{ t('websiteSettings.seoDescLabel') }}
              <span class="required">*</span>
            </label>
            <textarea
              id="seo-description"
              v-model="seoForm.seoDescription"
              class="form-textarea"
              maxlength="160"
              rows="4"
              @input="markSeoChanged"
            ></textarea>
            <div class="input-hint">
              <span :class="{ 'text-warning': seoForm.seoDescription.length > 150 }">
                {{ t('websiteSettings.charCount', { n: seoForm.seoDescription.length, max: 160 }) }}
              </span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="seo-keywords">
              {{ t('websiteSettings.seoKeywordsLabel') }}
            </label>
            <input
              id="seo-keywords"
              v-model="seoForm.seoKeywords"
              type="text"
              class="form-input"
              @input="markSeoChanged"
            />
          </div>

          <!-- 單獨儲存 SEO 按鈕 -->
          <div class="seo-save-row">
            <button
              class="save-button-small"
              @click="handleSaveSeo"
              :disabled="isSeoSaving || !hasSeoChanges"
            >
              <span v-if="isSeoSaving">儲存中...</span>
              <span v-else>儲存此頁面 SEO</span>
            </button>
          </div>
        </template>
      </section>

      <!-- 變更提示 -->
      <div v-if="hasChanges" class="changes-banner">
        <span class="changes-icon">✏️</span>
        <span>{{ t('websiteSettings.unsavedChanges') }}</span>
        <div class="changes-actions">
          <button class="cancel-button" @click="handleCancel">{{ t('websiteSettings.cancelBtn') }}</button>
          <button class="save-button-small" @click="handleSave">{{ t('websiteSettings.saveSmallBtn') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePageEditorStore } from '@/stores/pageEditor'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const pageEditorStore = usePageEditorStore()
const { t } = useI18n()

// ==================== 字型清單 ====================

const zhTwFonts = [
  { value: 'ibm-plex-sans-tc',    label: 'IBM Plex Sans TC',    cssFamily: "'IBM Plex Sans TC', sans-serif" },
  { value: 'lxgw-wenkai-mono-tc', label: 'LXGW WenKai Mono TC', cssFamily: "'LXGW WenKai Mono TC', monospace" },
  { value: 'noto-sans-tc',        label: 'Noto Sans TC',         cssFamily: "'Noto Sans TC', sans-serif" },
  { value: 'noto-serif-tc',       label: 'Noto Serif TC',        cssFamily: "'Noto Serif TC', serif" },
]

const zhCnFonts = [
  { value: 'noto-sans-sc',        label: 'Noto Sans SC',         cssFamily: "'Noto Sans SC', sans-serif" },
  { value: 'noto-serif-sc',       label: 'Noto Serif SC',        cssFamily: "'Noto Serif SC', serif" },
  { value: 'ibm-plex-sans-sc',    label: 'IBM Plex Sans SC',     cssFamily: "'IBM Plex Sans SC', sans-serif" },
]

const enFonts = [
  { value: 'bona-nova',           label: 'Bona Nova',            cssFamily: "'Bona Nova', serif" },
  { value: 'inter',               label: 'Inter',                cssFamily: "'Inter', sans-serif" },
  { value: 'cormorant-garamond',  label: 'Cormorant Garamond',   cssFamily: "'Cormorant Garamond', serif" },
  { value: 'montserrat',          label: 'Montserrat',           cssFamily: "'Montserrat', sans-serif" },
  { value: 'playfair-display',    label: 'Playfair Display',     cssFamily: "'Playfair Display', serif" },
]

const allFonts = [...zhTwFonts, ...zhCnFonts, ...enFonts]

const getFontFamily = (fontValue) => {
  const font = allFonts.find(f => f.value === fontValue)
  return font ? font.cssFamily : "'Noto Sans TC', sans-serif"
}

// ==================== 狀態 ====================

const templeId = computed(() => route.params.templeId)

// 全域載入 / 錯誤（字型 + 追蹤）
const isLoading = ref(true)
const isSaving  = ref(false)
const error     = ref(null)
const hasChanges = ref(false)

// SEO 獨立狀態
const isSeoLoading  = ref(false)
const isSeoSaving   = ref(false)
const hasSeoChanges = ref(false)
const activeSeoSlug = ref(null)

// ===== 網站基本設定表單（字型 + 追蹤）=====
const siteForm = reactive({
  frontFamilyZhTw: '',
  frontFamilyZhCn: '',
  frontFamilyEnUs: '',
  metaPixel: '',
  googleGtm: '',
})

const originalSiteForm = reactive({
  frontFamilyZhTw: '',
  frontFamilyZhCn: '',
  frontFamilyEnUs: '',
  metaPixel: '',
  googleGtm: '',
})

// ===== SEO 表單（單一頁面）=====
const seoForm = reactive({
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
})

const originalSeoForm = reactive({
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
})

// ==================== 載入設定 ====================

const loadSettings = async () => {
  isLoading.value = true
  error.value = null

  try {
    const settings = await pageEditorStore.fetchWebsiteSettings(templeId.value)

    if (settings) {
      siteForm.frontFamilyZhTw = settings.frontFamilyZhTw || 'noto-sans-tc'
      siteForm.frontFamilyZhCn = settings.frontFamilyZhCn || 'noto-sans-sc'
      siteForm.frontFamilyEnUs = settings.frontFamilyEnUs || 'inter'
      siteForm.metaPixel       = settings.metaPixel       || ''
      siteForm.googleGtm       = settings.googleGtm       || ''

      Object.assign(originalSiteForm, siteForm)
      hasChanges.value = false
    }

    // 載入頁面 Tab 清單（如果還沒載入）
    if (pageEditorStore.headerTabs.length === 0) {
      await pageEditorStore.fetchHeaderTabs(templeId.value)
    }

    // 預設載入第一個頁面的 SEO
    if (pageEditorStore.headerTabs.length > 0) {
      const firstSlug = pageEditorStore.headerTabs[0].slug
      await switchSeoTab(firstSlug)
    }

  } catch (err) {
    console.error('❌ 載入設定失敗:', err)
    error.value = pageEditorStore.error || t('websiteSettings.errorLoad')
  } finally {
    isLoading.value = false
  }
}

// ==================== SEO Tab 切換 ====================

const switchSeoTab = async (slug) => {
  if (hasSeoChanges.value) {
    if (!confirm('目前 SEO 有未儲存的變更，切換頁面將會捨棄，是否繼續？')) return
  }

  activeSeoSlug.value = slug
  isSeoLoading.value = true
  hasSeoChanges.value = false

  try {
    const data = await pageEditorStore.fetchPageSeo(templeId.value, slug)

    if (data) {
      seoForm.seoTitle       = data.seoTitle       || ''
      seoForm.seoDescription = data.seoDescription || ''
      seoForm.seoKeywords    = data.seoKeywords     || ''
    } else {
      seoForm.seoTitle       = ''
      seoForm.seoDescription = ''
      seoForm.seoKeywords    = ''
    }

    Object.assign(originalSeoForm, seoForm)
  } catch (err) {
    console.error('❌ 載入 SEO 失敗:', err)
  } finally {
    isSeoLoading.value = false
  }
}

// ==================== 儲存網站基本設定（字型 + 追蹤）====================

const handleSave = async () => {
  if (!siteForm.frontFamilyZhTw || !siteForm.frontFamilyZhCn || !siteForm.frontFamilyEnUs) {
    alert(t('websiteSettings.alertSelectFonts'))
    return
  }

  isSaving.value = true

  try {
    const payload = {
      frontFamilyZhTw: siteForm.frontFamilyZhTw,
      frontFamilyZhCn: siteForm.frontFamilyZhCn,
      frontFamilyEnUs: siteForm.frontFamilyEnUs,
      metaPixel:       siteForm.metaPixel.trim(),
      googleGtm:       siteForm.googleGtm.trim(),
    }

    const success = await pageEditorStore.updateWebsiteSettings(templeId.value, payload)

    if (success) {
      alert(t('websiteSettings.alertSaveSuccess'))
      await loadSettings()
    } else {
      error.value = pageEditorStore.error || t('websiteSettings.errorSave')
      alert(t('websiteSettings.alertSaveFailed') + error.value)
    }
  } finally {
    isSaving.value = false
  }
}

// ==================== 儲存 SEO ====================

const handleSaveSeo = async () => {
  if (!seoForm.seoTitle.trim()) {
    alert(t('websiteSettings.alertFillTitle'))
    return
  }
  if (!seoForm.seoDescription.trim()) {
    alert(t('websiteSettings.alertFillDesc'))
    return
  }

  isSeoSaving.value = true

  try {
    const payload = {
      slug:           activeSeoSlug.value,
      seoTitle:       seoForm.seoTitle.trim(),
      seoDescription: seoForm.seoDescription.trim(),
      seoKeywords:    seoForm.seoKeywords.trim(),
    }

    const success = await pageEditorStore.updatePageSeo(templeId.value, payload)

    if (success) {
      alert('SEO 已儲存！')
      Object.assign(originalSeoForm, seoForm)
      hasSeoChanges.value = false
    } else {
      alert('SEO 儲存失敗：' + (pageEditorStore.error || '未知錯誤'))
    }
  } finally {
    isSeoSaving.value = false
  }
}

// ==================== 變更追蹤 ====================

const markSiteChanged = () => {
  hasChanges.value =
    siteForm.frontFamilyZhTw !== originalSiteForm.frontFamilyZhTw ||
    siteForm.frontFamilyZhCn !== originalSiteForm.frontFamilyZhCn ||
    siteForm.frontFamilyEnUs !== originalSiteForm.frontFamilyEnUs ||
    siteForm.metaPixel       !== originalSiteForm.metaPixel       ||
    siteForm.googleGtm       !== originalSiteForm.googleGtm
}

const markSeoChanged = () => {
  hasSeoChanges.value =
    seoForm.seoTitle       !== originalSeoForm.seoTitle       ||
    seoForm.seoDescription !== originalSeoForm.seoDescription ||
    seoForm.seoKeywords    !== originalSeoForm.seoKeywords
}

// ==================== 其他事件 ====================

const handleCancel = () => {
  if (confirm(t('websiteSettings.confirmDiscard'))) {
    Object.assign(siteForm, originalSiteForm)
    hasChanges.value = false
  }
}

const handleBack = () => {
  if (hasChanges.value || hasSeoChanges.value) {
    if (confirm(t('websiteSettings.confirmLeave'))) router.back()
  } else {
    router.back()
  }
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

.spinner-sm {
  width: 20px;
  height: 20px;
  border-width: 3px;
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
  max-width: 1000px;
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

.preview-chinese { font-size: 1.25rem; line-height: 1.8; color: #333; margin: 0; }
.preview-english { font-size: 1.1rem; line-height: 1.6; color: #555; margin: 0; }

/* ===== SEO Tabs ===== */
.seo-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0;
}

.seo-tab {
  padding: 0.6rem 1.2rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: 0.95rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px 4px 0 0;
}

.seo-tab:hover { color: #E8572A; background: #fff5f2; }

.seo-tab.active {
  color: #E8572A;
  border-bottom-color: #E8572A;
  font-weight: 600;
}

.seo-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 0;
  color: #999;
  font-size: 0.9rem;
}

.seo-save-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

/* ===== 底部 Banner ===== */
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

.save-button-small:hover:not(:disabled) { background: #d14a1f; }
.save-button-small:disabled { background: #ccc; cursor: not-allowed; }

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
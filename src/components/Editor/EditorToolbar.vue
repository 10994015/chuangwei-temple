<template>
  <header class="toolbar">
    <div class="toolbar-left">
      <!-- 返回管理後台按鈕 -->
      <button class="btn btn-icon btn-back" @click="handleBackToDashboard" :title="t('editorToolbar.backTitle')">
        {{ t('editorToolbar.backBtn') }}
      </button>
      
      <div class="toolbar-divider"></div>
      
      <!-- 頁面切換 -->
      <select
        v-if="pageTabs.length > 0"
        :value="currentPageSlug"
        @change="handlePageChange"
        class="locale-select"
      >
        <option v-for="tab in pageTabs" :key="tab.slug" :value="tab.slug">
          {{ tab.name || tab.slug }}
        </option>
      </select>

      <!-- 語言選擇器 -->
      <select
        :value="currentLocale"
        @change="handleLocaleChange"
        class="locale-select"
      >
        <option v-for="locale in locales" :key="locale.locale" :value="locale.locale">
          {{ locale.label }}
        </option>
      </select>
      
      <!-- 未保存提示 -->
      <span v-if="hasUnsavedChanges" class="unsaved-indicator" :title="t('editorToolbar.unsavedTitle')">
        {{ t('editorToolbar.unsavedLabel') }}
      </span>
    </div>
    
    <div class="toolbar-right">
      <button class="btn btn-icon" @click="handleSettings">{{ t('editorToolbar.settings') }}</button>
      <button class="btn btn-icon" @click="handleSelectTemplate">{{ t('editorToolbar.selectTemplate') }}</button>
      <button class="btn btn-icon" @click="handleUpgrade">{{ t('editorToolbar.upgrade') }}</button>
      <div class="toolbar-divider"></div>
      <button class="btn btn-icon" @click="handlePreview">{{ t('editorToolbar.preview') }}</button>
      <button class="btn btn-icon" @click="handleSave">{{ t('editorToolbar.saveDraft') }}</button>
      <button class="btn btn-icon btn-danger" @click="handleDelete">{{ t('editorToolbar.deleteDraft') }}</button>
      <div class="toolbar-divider"></div>
      <button
        class="btn btn-icon btn-secondary"
        @click="handleGoToWebsite"
        :disabled="!domainName"
        :title="domainName || t('editorToolbar.noWebsiteUrl')"
      >
        {{ t('editorToolbar.goToWebsite') }}
      </button>
      <button class="btn btn-primary" @click="handlePublish">{{ t('editorToolbar.publish') }}</button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePageEditorStore } from '@/stores/pageEditor'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const store = usePageEditorStore()

const props = defineProps({
  currentLocale: {
    type: String,
    default: 'ZH-TW'
  },
  locales: {
    type: Array,
    default: () => []
  },
  hasUnsavedChanges: {
    type: Boolean,
    default: false
  },
  currentPageSlug: {
    type: String,
    default: null
  }
})

const emit = defineEmits([
  'locale-change',
  'change-page',
  'settings',
  'select-template',
  'upgrade',
  'preview',
  'save',
  'delete',
  'go-to-website',
  'publish'
])

// 從 store 取得 domainName
const domainName = computed(() => store.websiteSettings?.domainName || null)

// 頁面 tabs（過濾掉 portal）
const pageTabs = computed(() => store.headerTabs || [])

// 獲取 templeId
const getTempleId = () => route.params.templeId

// 返回管理後台
const handleBackToDashboard = () => {
  const templeId = getTempleId()
  if (templeId) {
    router.push({
      name: 'app.temple.dashboard',
      params: { templeId }
    })
  }
}

// 頁面切換
const handlePageChange = (event) => emit('change-page', event.target.value)

// 語言切換
const handleLocaleChange = (event) => emit('locale-change', event.target.value)

const handleSettings       = () => emit('settings')
const handleSelectTemplate = () => emit('select-template')
const handleUpgrade        = () => emit('upgrade')
const handlePreview        = () => emit('preview')
const handleSave           = () => emit('save')
const handleDelete         = () => emit('delete')
const handlePublish        = () => emit('publish')

// 前往網站：直接用 domainName 開新分頁
const handleGoToWebsite = () => {
  if (!domainName.value) return

  emit('go-to-website')   // 保留 emit，父層可監聽

  let url = domainName.value.trim()
  // 若沒有 protocol，自動補上 https://
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #e5e5e5;
}

.locale-select {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background: #fff;
  min-width: 120px;
}

.locale-select:hover {
  border-color: #E8572A;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover:not(:disabled) {
  background: #f5f5f5;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-back {
  color: #666;
  font-weight: 500;
}

.btn-back:hover {
  background: #f5f5f5;
  color: #333;
  border-color: #bbb;
}

.btn-primary {
  background: #E8572A;
  color: #fff;
  border-color: #E8572A;
}

.btn-primary:hover {
  background: #d14a1f;
}

.btn-secondary {
  color: #E8572A;
  border-color: #E8572A;
}

.btn-secondary:hover:not(:disabled) {
  background: #fff5f2;
}

.btn-danger {
  color: #dc3545;
}

.btn-danger:hover {
  background: #fff5f5;
}

.unsaved-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: #fff3cd;
  color: #856404;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
</style>
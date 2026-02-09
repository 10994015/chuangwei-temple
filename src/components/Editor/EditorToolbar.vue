<template>
  <header class="toolbar">
    <div class="toolbar-left">
      <!-- 返回管理後台按鈕 -->
      <button class="btn btn-icon btn-back" @click="handleBackToDashboard" title="返回管理後台">
        ← 返回後台
      </button>
      
      <div class="toolbar-divider"></div>
      
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
      <span v-if="hasUnsavedChanges" class="unsaved-indicator" title="有未保存的變更">
        ● 未保存
      </span>
    </div>
    
    <div class="toolbar-right">
      <button class="btn btn-icon" @click="handleSettings">設定</button>
      <button class="btn btn-icon" @click="handleSelectTemplate">選擇模板</button>
      <button class="btn btn-icon" @click="handleUpgrade">升級方案</button>
      <div class="toolbar-divider"></div>
      <button class="btn btn-icon" @click="handlePreview">預覽</button>
      <button class="btn btn-icon" @click="handleSave">
        儲存草稿
      </button>
      <button class="btn btn-icon btn-danger" @click="handleDelete">刪除草稿</button>
      <div class="toolbar-divider"></div>
      <button class="btn btn-icon btn-secondary" @click="handleGoToWebsite">前往網站</button>
      <button class="btn btn-primary" @click="handlePublish">發布網站</button>
    </div>
  </header>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

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
  }
})

const emit = defineEmits([
  'locale-change',
  'settings',
  'select-template',
  'upgrade',
  'preview',
  'save',
  'delete',
  'go-to-website',
  'publish'
])

// 獲取 templeId
const getTempleId = () => {
  return route.params.templeId
}

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

// 語言切換
const handleLocaleChange = (event) => {
  emit('locale-change', event.target.value)
}

// 設定
const handleSettings = () => {
  emit('settings')
}

// 選擇模板
const handleSelectTemplate = () => {
  emit('select-template')
}

// 升級方案
const handleUpgrade = () => {
  emit('upgrade')
}

// 預覽
const handlePreview = () => {
  emit('preview')
}

// 儲存
const handleSave = () => {
  emit('save')
}

// 刪除
const handleDelete = () => {
  emit('delete')
}

// 前往網站
const handleGoToWebsite = () => {
  emit('go-to-website')
}

// 發布
const handlePublish = () => {
  emit('publish')
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

.btn-secondary:hover {
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
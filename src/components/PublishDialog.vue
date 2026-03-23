<template>
  <teleport to="body">
    <transition name="dialog-fade">
      <div v-if="isVisible" class="dialog-overlay" @click.self="handleCancel">
        <div class="dialog-container">
          <div class="dialog-header">
            <h3>發布網站</h3>
            <button class="close-btn" @click="handleCancel">✕</button>
          </div>

          <div class="dialog-body">
            <!-- 有未儲存變更 -->
            <div class="has-changes-notice" v-if="hasUnsavedChanges">
              <div class="notice-icon">💾</div>
              <p>檢測到未保存的變更，發布前將自動保存草稿</p>
            </div>

            <!-- 無未儲存變更：準備就緒 -->
            <div v-else class="ready-state">
              <div class="ready-icon">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="32" r="30" fill="#f0faf4" stroke="#4caf82" stroke-width="2"/>
                  <polyline points="18,33 27,43 46,22" stroke="#4caf82" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <p class="ready-title">準備就緒</p>
              <p class="ready-desc">所有變更已儲存，確認後將立即發布網站</p>
            </div>
          </div>

          <div class="dialog-footer">
            <button class="btn btn-cancel" @click="handleCancel" :disabled="isPublishing">
              取消
            </button>
            <button class="btn btn-publish" @click="handleConfirm" :disabled="isPublishing">
              <span v-if="isPublishing" class="loading-spinner">⏳</span>
              <span v-else>確認發布</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  currentLocale: {
    type: String,
    default: 'ZH-TW'
  },
  currentPageSlug: {
    type: String,
    default: ''
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

const emit = defineEmits(['confirm', 'cancel'])

const isPublishing = ref(false)

// 獲取當前語言名稱
const currentLocaleName = computed(() => {
  const locale = props.locales.find(l => l.locale === props.currentLocale)
  return locale ? locale.label : props.currentLocale
})

const handleConfirm = () => {
  isPublishing.value = true
  emit('confirm')
}

const handleCancel = () => {
  if (!isPublishing.value) {
    emit('cancel')
  }
}

// 重置發布狀態
const resetPublishing = () => {
  isPublishing.value = false
}

// 暴露方法給父組件
defineExpose({
  resetPublishing
})
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.dialog-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5e5;
}

.dialog-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #e8e8e8;
  color: #333;
}

.dialog-body {
  padding: 24px;
  overflow-y: auto;
}

.publish-info {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-item:not(:last-child) {
  border-bottom: 1px solid #e5e5e5;
}

.info-item .label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.info-item .value {
  font-size: 14px;
  color: #333;
  font-weight: 600;
}

.warning-box {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  margin-bottom: 20px;
}

.warning-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.warning-content h4 {
  margin: 0 0 12px;
  font-size: 15px;
  color: #856404;
}

.warning-content ul {
  margin: 0;
  padding-left: 20px;
  color: #856404;
  font-size: 13px;
  line-height: 1.6;
}

.warning-content li {
  margin-bottom: 6px;
}

.warning-content strong {
  font-weight: 600;
}

.has-changes-notice {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  background: #d1ecf1;
  border: 1px solid #bee5eb;
  border-radius: 8px;
}

.notice-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.has-changes-notice p {
  margin: 0;
  font-size: 13px;
  color: #0c5460;
  line-height: 1.5;
}

.ready-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0 4px;
  gap: 10px;
}

.ready-icon svg {
  width: 64px;
  height: 64px;
}

.ready-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #2d7a55;
}

.ready-desc {
  margin: 0;
  font-size: 13px;
  color: #666;
  text-align: center;
  line-height: 1.6;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e5e5;
  background: #fafafa;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: #fff;
  border: 1px solid #ddd;
  color: #666;
}

.btn-cancel:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #ccc;
}

.btn-publish {
  background: #E8572A;
  color: #fff;
}

.btn-publish:hover:not(:disabled) {
  background: #d14a1f;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 對話框過渡動畫 */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s;
}

.dialog-fade-enter-active .dialog-container,
.dialog-fade-leave-active .dialog-container {
  transition: transform 0.3s;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-from .dialog-container {
  transform: scale(0.9);
}

.dialog-fade-leave-to .dialog-container {
  transform: scale(0.9);
}
</style>
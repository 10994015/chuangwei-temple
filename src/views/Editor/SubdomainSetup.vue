<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTemplateStore } from '@/stores/template'

const router = useRouter()
const route = useRoute()
const templateStore = useTemplateStore()

// 獲取當前的 templeId 和 templateId
const currentTempleId = computed(() => route.params.templeId)
const currentTemplateId = computed(() => route.params.templateId)

// 狀態管理
const subdomain = ref('')
const errorMessage = ref('')
const showConfirmDialog = ref(false)
const isCheckingSubdomain = ref(false) // 👈 新增：檢查子網域中

// 組件掛載時記錄模板 ID
onMounted(() => {
  console.log('當前宮廟 ID:', currentTempleId.value)
  console.log('選中的模板 ID:', currentTemplateId.value)
  
  // 驗證是否有 templateId
  if (!currentTemplateId.value) {
    console.warn('警告：未找到模板 ID')
  }
})

// 驗證子網域
const validateSubdomain = () => {
  const value = subdomain.value.trim()
  
  if (!value) {
    errorMessage.value = ''
    return
  }

  // 檢查格式：只允許英文、數字和連字符
  const validPattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/
  
  if (!validPattern.test(value)) {
    errorMessage.value = '只能使用英文小寫、數字和連字符，且不能以連字符開頭或結尾'
    return
  }

  // 檢查長度
  if (value.length < 1) {
    errorMessage.value = '名稱至少需要1個字元'
    return
  }

  if (value.length > 63) {
    errorMessage.value = '名稱不能超過63個字元'
    return
  }

  errorMessage.value = ''
}

// 計算完整網址
const fullUrl = computed(() => {
  return `https://${subdomain.value}.gongzhanggui.com`
})

// 計算是否有效
const isValid = computed(() => {
  return subdomain.value.trim() !== '' && errorMessage.value === ''
})

// 處理上一步
const handleBack = () => {
  console.log('返回上一步')
  if (currentTempleId.value) {
    router.push({ 
      name: 'app.temple.template-selection',
      params: { templeId: currentTempleId.value }
    })
  } else {
    alert('無法獲取宮廟資訊')
  }
}

// 👇 修改：處理下一步 - 先檢查子網域是否可用
const handleNext = async () => {
  if (!isValid.value) return
  
  // 防止重複檢查
  if (isCheckingSubdomain.value) return
  
  isCheckingSubdomain.value = true
  errorMessage.value = ''
  
  try {
    console.log('開始檢查子網域是否可用...')
    
    // 調用 API 檢查子網域
    const isAvailable = await templateStore.checkSubdomainAvailable(
      currentTempleId.value,
      subdomain.value
    )
    
    if (isAvailable) {
      console.log('子網域可用，顯示確認對話框')
      showConfirmDialog.value = true
    } else {
      console.log('子網域已被使用')
      errorMessage.value = '此網站名稱已被使用，請選擇其他名稱'
    }
  } catch (error) {
    console.error('檢查子網域時發生錯誤:', error)
    errorMessage.value = '檢查網站名稱時發生錯誤，請稍後再試'
  } finally {
    isCheckingSubdomain.value = false
  }
}

// 取消確認
const cancelConfirm = () => {
  showConfirmDialog.value = false
}

// 確認並開始編輯
const confirmAndStart = async () => {
  console.log('確認網站設定')
  console.log('子網域:', subdomain.value)
  console.log('模板 ID:', currentTemplateId.value)
  console.log('宮廟 ID:', currentTempleId.value)
  
  // 防止重複提交
  if (templateStore.isCreatingWebsite) return
  
  try {
    // 調用 store 中的建立網站方法
    const result = await templateStore.createWebsite(
      currentTempleId.value,
      currentTemplateId.value,
      subdomain.value
    )
    
    if (result.success) {
      console.log('網站建立成功！', result.data)
      
      // 關閉對話框
      showConfirmDialog.value = false
      
      // 導航到頁面編輯器
      router.push({ 
        name: 'app.temple.page-editor',
        params: { templeId: currentTempleId.value },
        query: { templateId: currentTemplateId.value }
      })
    } else {
      // 建立失敗，顯示錯誤訊息
      console.error('建立失敗:', result.error)
      errorMessage.value = result.error
      showConfirmDialog.value = false
    }
    
  } catch (error) {
    console.error('建立網站時發生未預期的錯誤:', error)
    errorMessage.value = '發生未預期的錯誤，請稍後再試'
    showConfirmDialog.value = false
  }
}
</script>

<template>
  <div class="subdomain-setup-page">
    <div class="setup-container">
      <!-- 主要設定卡片 -->
      <div class="setup-card">
        <h1 class="page-title">設定網站網址</h1>
        <p class="page-subtitle">
          請輸入您要使用的網站名稱 這將成為您的專屬網址
        </p>

        <div class="form-content">
          <!-- 網站名稱輸入區 -->
          <div class="form-group">
            <label class="form-label">網站名稱</label>
            <div class="input-row">
              <input
                v-model="subdomain"
                type="text"
                class="subdomain-input"
                placeholder="aaa"
                @input="validateSubdomain"
                :disabled="isCheckingSubdomain"
              />
              <span class="domain-suffix">.gongzhanggui.com</span>
            </div>
            
            <p v-if="errorMessage" class="error-hint">
              ⚠ {{ errorMessage }}
            </p>
            <p v-else class="info-hint">
              請注意：設定後無法更改
            </p>
          </div>

          <!-- 預覽網址區 -->
          <div class="preview-section">
            <label class="preview-label">預覽網址</label>
            <div class="preview-url-box">
              {{ subdomain ? fullUrl : 'https://.gongzhanggui.com' }}
            </div>
          </div>

          <!-- 按鈕組 -->
          <div class="button-group">
            <button 
              class="btn btn-back" 
              @click="handleBack"
              :disabled="isCheckingSubdomain"
            >
              上一步
            </button>
            <button 
              class="btn btn-next" 
              :disabled="!isValid || isCheckingSubdomain"
              @click="handleNext"
            >
              <!-- 👇 顯示檢查中狀態 -->
              <span v-if="isCheckingSubdomain" class="loading-spinner"></span>
              <span v-else>下一步</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 確認對話框 -->
    <transition name="dialog-fade">
      <div v-if="showConfirmDialog" class="dialog-overlay" @click.self="cancelConfirm">
        <div class="dialog-box">
          <h3 class="dialog-title">確認網址設定</h3>
          
          <div class="dialog-content">
            <p class="dialog-label">您的專屬網址</p>
            <p class="dialog-url">{{ fullUrl }}</p>
            <p class="dialog-warning">
              網址設定後將無法更改，請再次確認您的網站網址
            </p>
          </div>

          <div class="dialog-actions">
            <button 
              class="btn btn-cancel" 
              @click="cancelConfirm"
              :disabled="templateStore.isCreatingWebsite"
            >
              取消
            </button>
            <button 
              class="btn btn-confirm" 
              @click="confirmAndStart"
              :disabled="templateStore.isCreatingWebsite"
            >
              <span v-if="templateStore.isCreatingWebsite" class="loading-spinner"></span>
              <span v-else>確認並開始編輯網站</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
/* 樣式與之前相同，已包含 loading-spinner */
.subdomain-setup-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  padding: 40px 20px;
  font-family: 'Microsoft YaHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, sans-serif;
}

.setup-container {
  width: 100%;
  max-width: 720px;
}

.setup-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  padding: 40px 48px 12px;
  text-align: center;
}

.page-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  padding: 0 48px 32px;
  text-align: center;
  line-height: 1.6;
}

.form-content {
  padding: 32px 48px 48px;
  border-top: 1px solid #f3f4f6;
}

.form-group {
  margin-bottom: 32px;
}

.form-label {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 12px;
}

.input-row {
  display: flex;
  align-items: stretch;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: #9ca3af;
    box-shadow: 0 0 0 3px rgba(156, 163, 175, 0.1);
  }
}

.subdomain-input {
  flex: 1;
  padding: 14px 16px;
  border: none;
  font-size: 15px;
  color: #1f2937;
  outline: none;
  background: transparent;
  min-width: 0;

  &::placeholder {
    color: #9ca3af;
  }
  
  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
  }
}

.domain-suffix {
  padding: 14px 20px;
  font-size: 15px;
  color: #6b7280;
  background: #f9fafb;
  border-left: 1px solid #e5e7eb;
  white-space: nowrap;
  display: flex;
  align-items: center;
  user-select: none;
}

.error-hint {
  margin: 10px 0 0 0;
  font-size: 13px;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-hint {
  margin: 10px 0 0 0;
  font-size: 13px;
  color: #dc2626;
}

.preview-section {
  margin-bottom: 32px;
}

.preview-label {
  display: block;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.preview-url-box {
  padding: 16px 20px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 15px;
  color: #1f2937;
  word-break: break-all;
  line-height: 1.5;
}

.button-group {
  display: flex;
  gap: 16px;

  @media (max-width: 640px) {
    flex-direction: column-reverse;
  }
}

.btn {
  flex: 1;
  padding: 14px 32px;
  font-size: 15px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  @media (max-width: 640px) {
    width: 100%;
  }
}

.btn-back {
  background: #ffffff;
  color: #4b5563;
  border: 1px solid #d1d5db;

  &:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #9ca3af;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-next {
  background: #d97444;
  color: #ffffff;

  &:hover:not(:disabled) {
    background: #c45e30;
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
    opacity: 0.6;
  }
}

// ========== 確認對話框 ==========
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
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.dialog-box {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: dialogSlideUp 0.3s ease;
}

@keyframes dialogSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dialog-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  padding: 32px 32px 24px;
  text-align: center;
  border-bottom: 1px solid #f3f4f6;
}

.dialog-content {
  padding: 32px;
}

.dialog-label {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.dialog-url {
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
  margin: 0 0 20px 0;
  padding: 14px 16px;
  background: #f9fafb;
  border-radius: 8px;
  word-break: break-all;
}

.dialog-warning {
  font-size: 13px;
  color: #dc2626;
  margin: 0;
  line-height: 1.6;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  padding: 0 32px 32px;

  @media (max-width: 640px) {
    flex-direction: column-reverse;
  }
}

.btn-cancel {
  flex: 1;
  padding: 12px 24px;
  background: #ffffff;
  color: #4b5563;
  border: 1px solid #d1d5db;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #9ca3af;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-confirm {
  flex: 2;
  padding: 12px 24px;
  background: #d97444;
  color: #ffffff;
  border: none;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover:not(:disabled) {
    background: #c45e30;
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }
  
  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }
}

// Loading spinner 樣式
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// 對話框動畫
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

// 響應式設計
@media (max-width: 768px) {
  .page-title {
    font-size: 22px;
    padding: 32px 32px 12px;
  }

  .page-subtitle {
    padding: 0 32px 24px;
  }

  .form-content {
    padding: 24px 32px 32px;
  }

  .dialog-title {
    font-size: 18px;
    padding: 24px 24px 20px;
  }

  .dialog-content {
    padding: 24px;
  }

  .dialog-actions {
    padding: 0 24px 24px;
  }
}

@media (max-width: 480px) {
  .subdomain-setup-page {
    padding: 20px;
  }

  .page-title {
    font-size: 20px;
    padding: 24px 24px 10px;
  }

  .page-subtitle {
    font-size: 13px;
    padding: 0 24px 20px;
  }

  .form-content {
    padding: 20px 24px 24px;
  }

  .domain-suffix {
    padding: 14px 12px;
    font-size: 13px;
  }
}
</style>
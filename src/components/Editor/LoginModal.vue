<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Props
const props = defineProps({
  show: {
    type: Boolean,
    required: true
  }
})

// Emits
const emit = defineEmits(['close', 'login-success'])

// 登入表單資料
const loginForm = ref({
  credential: '',
  password: ''
})

const rememberMe = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')

// 關閉彈窗
const closeModal = () => {
  // 重置表單
  loginForm.value = {
    credential: '',
    password: ''
  }
  rememberMe.value = false
  errorMsg.value = ''
  isLoading.value = false
  
  emit('close')
}

// 處理 Google 登入
const handleGoogleLogin = () => {
  console.log('使用 Google 登入')
  // TODO: 實作 Google OAuth 登入
}

// 處理登入提交
const handleLogin = async () => {
  // 驗證表單
  if (!loginForm.value.credential) {
    errorMsg.value = '請輸入帳號'
    return
  }
  
  if (!loginForm.value.password) {
    errorMsg.value = '請輸入密碼'
    return
  }
  
  isLoading.value = true
  errorMsg.value = ''
  
  try {
    const result = await authStore.login({
      credential: loginForm.value.credential,
      password: loginForm.value.password
    })
    
    if (result.success) {
      // 處理首次登入或密碼過期 (202)
      if (result.statusCode === 202) {
        const message = result.data.firstLogin 
          ? '首次登入需重設密碼！' 
          : '密碼已過期，請重新設定密碼！'
        alert(message)
        
        // 關閉登入彈窗
        closeModal()
        
        // 跳轉到密碼設定頁面
        router.push(`/init-password/${result.data.changePwToken}`)
        return
      }
      
      // 登入成功 (200)
      console.log('登入成功')
      console.log('用戶資料:', authStore.user)
      console.log('系統權限:', authStore.systemPermissions)
      console.log('宮廟角色:', authStore.templeRoles)
      
      // 發送登入成功事件
      emit('login-success')
      
      // 關閉登入彈窗
      closeModal()
      
    } else {
      // 登入失敗
      errorMsg.value = result.error || '登入失敗，請檢查帳號或密碼'
    }
  } catch (error) {
    console.error('登入處理失敗:', error)
    errorMsg.value = '登入失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}

// 前往註冊頁面
const goToRegister = () => {
  console.log('前往註冊頁面')
  closeModal()
  // TODO: 實作路由跳轉
}

// 忘記密碼
const forgotPassword = () => {
  console.log('忘記密碼')
  closeModal()
  // TODO: 實作忘記密碼流程
}
</script>

<template>
  <!-- 登入彈窗 -->
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <!-- 關閉按鈕 -->
        <button class="modal-close" @click="closeModal">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- 標題區域 -->
        <div class="modal-header">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#E8572A" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 class="modal-title">用戶登入</h2>
          <p class="modal-subtitle">登入管理您的帳號、訂單與宮廟資訊</p>
        </div>

        <!-- 登入表單 -->
        <form @submit.prevent="handleLogin" class="login-form">
          <!-- 帳號輸入 -->
          <div class="form-group">
            <label class="form-label">帳號</label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
              <input 
                v-model="loginForm.credential"
                type="text" 
                class="form-input" 
                placeholder="請輸入帳號"
                :disabled="isLoading"
                @input="errorMsg = ''"
              />
            </div>
          </div>

          <!-- 密碼輸入 -->
          <div class="form-group">
            <div class="label-row">
              <label class="form-label">密碼</label>
              <button type="button" class="forgot-password-btn" @click="forgotPassword" :disabled="isLoading">
                忘記密碼？
              </button>
            </div>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
              <input 
                v-model="loginForm.password"
                type="password" 
                class="form-input" 
                placeholder="請輸入密碼"
                :disabled="isLoading"
                @input="errorMsg = ''"
                @keyup.enter="handleLogin"
              />
            </div>
          </div>
          <!-- Google 登入 -->
          <button type="button" class="google-login-btn" @click="handleGoogleLogin" :disabled="isLoading">
            <svg class="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            使用 Google 登入
          </button>
          <!-- 錯誤訊息 -->
          <div v-if="errorMsg" class="error-message">
            <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ errorMsg }}
          </div>

          <!-- 記住我 -->
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input 
                v-model="rememberMe"
                type="checkbox" 
                class="checkbox-input"
                :disabled="isLoading"
              />
              <span class="checkbox-text">記住我的登入狀態</span>
            </label>
          </div>

          <!-- 登入按鈕 -->
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <svg 
              v-if="isLoading"
              class="loading-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 3a1 1 0 011 1v4a1 1 0 11-2 0V4a1 1 0 011-1zm0 10a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm7-7a1 1 0 011 1 1 1 0 11-2 0 1 1 0 011-1zM3 10a1 1 0 011-1 1 1 0 110 2 1 1 0 01-1-1z" />
            </svg>
            {{ isLoading ? '登入中...' : '登入' }}
          </button>

          <!-- 註冊連結 -->
          <div class="register-link">
            <span class="register-text">還沒有帳號？</span>
            <button type="button" class="register-btn" @click="goToRegister" :disabled="isLoading">
              立即註冊
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-container {
  background-color: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
  padding: 32px;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  color: #9ca3af;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #374151;
  }

  svg {
    width: 20px;
    height: 20px;
  }
}

.modal-header {
  text-align: center;
  margin-bottom: 28px;
}

.header-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 100%;
    height: 100%;
  }
}

.modal-title {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
}

.modal-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.google-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #ffffff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s ease;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;

  &:hover:not(:disabled) {
    background-color: #f9fafb;
    border-color: #d1d5db;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .google-icon {
    width: 20px;
    height: 20px;
  }
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #e5e7eb;
  }

  span {
    padding: 0 12px;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-password-btn {
  background: none;
  border: none;
  color: #E8572A;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;

  &:hover:not(:disabled) {
    text-decoration: underline;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  width: 18px;
  height: 18px;
  color: #9ca3af;
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  transition: all 0.2s ease;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: #E8572A;
    box-shadow: 0 0 0 3px rgba(232, 87, 42, 0.1);
  }

  &:disabled {
    background-color: #f9fafb;
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
}

.error-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #E8572A;
}

.checkbox-text {
  font-size: 14px;
  color: #374151;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background-color: #E8572A;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background-color: #d94b1f;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.loading-icon {
  width: 20px;
  height: 20px;
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

.register-link {
  text-align: center;
  font-size: 14px;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
}

.register-text {
  color: #6b7280;
  margin-right: 4px;
}

.register-btn {
  background: none;
  border: none;
  color: #E8572A;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;

  &:hover:not(:disabled) {
    text-decoration: underline;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// 彈窗動畫
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;

  .modal-container {
    transition: transform 0.3s ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal-container {
    transform: scale(0.95) translateY(-20px);
  }
}

// 響應式設計
@media (max-width: 768px) {
  .modal-container {
    padding: 24px;
    max-width: 100%;
  }

  .modal-title {
    font-size: 20px;
  }
}

// 移除自動填入背景色
.form-input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px white inset;
  box-shadow: 0 0 0 1000px white inset;
}
</style>
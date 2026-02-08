<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')
const token = ref('')
const isFirstLogin = ref(true) // 判斷是首次登入還是密碼過期

// 密碼強度指示器
const passwordStrength = ref(0)
const passwordStrengthText = ref('')
const passwordStrengthColor = ref('')

onMounted(() => {
  token.value = route.params.token
  // 可以根據 token 或其他方式判斷是首次登入還是密碼過期
  // 這裡暫時都當作首次登入處理
})

// 計算密碼強度
const calculatePasswordStrength = (pwd) => {
  let strength = 0
  
  if (pwd.length >= 8) strength += 25
  if (pwd.length >= 12) strength += 25
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25
  if (/\d/.test(pwd)) strength += 15
  if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength += 10
  
  passwordStrength.value = Math.min(strength, 100)
  
  if (strength < 40) {
    passwordStrengthText.value = '弱'
    passwordStrengthColor.value = '#ef4444'
  } else if (strength < 70) {
    passwordStrengthText.value = '中等'
    passwordStrengthColor.value = '#f59e0b'
  } else {
    passwordStrengthText.value = '強'
    passwordStrengthColor.value = '#10b981'
  }
}

// 監聽密碼輸入
const onPasswordInput = () => {
  calculatePasswordStrength(password.value)
  errorMsg.value = ''
}

// 驗證密碼
const validatePassword = () => {
  if (!password.value) {
    errorMsg.value = '請輸入新密碼'
    return false
  }
  
  if (password.value.length < 8) {
    errorMsg.value = '密碼長度至少需要 8 個字元'
    return false
  }
  
  if (!/[A-Z]/.test(password.value)) {
    errorMsg.value = '密碼必須包含至少一個大寫字母'
    return false
  }
  
  if (!/[a-z]/.test(password.value)) {
    errorMsg.value = '密碼必須包含至少一個小寫字母'
    return false
  }
  
  if (!/\d/.test(password.value)) {
    errorMsg.value = '密碼必須包含至少一個數字'
    return false
  }
  
  if (!confirmPassword.value) {
    errorMsg.value = '請確認新密碼'
    return false
  }
  
  if (password.value !== confirmPassword.value) {
    errorMsg.value = '兩次輸入的密碼不一致'
    return false
  }
  
  return true
}

// 提交密碼變更
const handleSubmit = async () => {
  if (!validatePassword()) {
    return
  }
  
  isLoading.value = true
  errorMsg.value = ''
  
  try {
    const result = await authStore.changePassword({
      certificationId: token.value,
      password: password.value,
      confirmPassword: confirmPassword.value
    })
    
    if (result.success) {
      alert('密碼設定成功！請重新登入')
      router.push('/')
    } else {
      errorMsg.value = result.error || '密碼設定失敗，請稍後再試'
    }
  } catch (error) {
    console.error('密碼設定失敗:', error)
    errorMsg.value = '密碼設定失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}
</script>

<template>
  <div class="init-password-container">
    <div class="init-password-card">
      <!-- Logo -->
      <div class="logo-section">
        <div class="logo-icon">
          <svg viewBox="0 0 40 40" class="temple-icon">
            <rect x="5" y="10" width="30" height="25" fill="#E8572A" />
            <path d="M 2 10 L 20 2 L 38 10 Z" fill="#E8572A" />
            <rect x="15" y="20" width="10" height="15" fill="#fff" opacity="0.3" />
          </svg>
        </div>
        <span class="logo-text">宮掌櫃</span>
      </div>

      <!-- 標題 -->
      <div class="header-section">
        <h1 class="title">設定新密碼</h1>
        <p class="subtitle">
          {{ isFirstLogin ? '首次登入需要設定您的密碼' : '您的密碼已過期，請設定新密碼' }}
        </p>
      </div>

      <!-- 表單 -->
      <form @submit.prevent="handleSubmit" class="password-form">
        <!-- 新密碼 -->
        <div class="form-group">
          <label class="form-label">新密碼</label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
            </svg>
            <input 
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="請輸入新密碼"
              @input="onPasswordInput"
              :disabled="isLoading"
            />
            <button 
              type="button"
              @click="togglePassword"
              class="toggle-password-btn"
              :disabled="isLoading"
            >
              <svg v-if="showPassword" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
              <svg v-else viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          
          <!-- 密碼強度指示器 -->
          <div v-if="password" class="password-strength">
            <div class="strength-bar">
              <div 
                class="strength-fill"
                :style="{ width: passwordStrength + '%', backgroundColor: passwordStrengthColor }"
              ></div>
            </div>
            <span class="strength-text" :style="{ color: passwordStrengthColor }">
              密碼強度: {{ passwordStrengthText }}
            </span>
          </div>

          <!-- 密碼要求提示 -->
          <div class="password-requirements">
            <p class="requirement-title">密碼必須符合以下條件：</p>
            <ul class="requirement-list">
              <li :class="{ 'valid': password.length >= 8 }">
                <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                至少 8 個字元
              </li>
              <li :class="{ 'valid': /[A-Z]/.test(password) }">
                <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                至少一個大寫字母
              </li>
              <li :class="{ 'valid': /[a-z]/.test(password) }">
                <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                至少一個小寫字母
              </li>
              <li :class="{ 'valid': /\d/.test(password) }">
                <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                至少一個數字
              </li>
            </ul>
          </div>
        </div>

        <!-- 確認密碼 -->
        <div class="form-group">
          <label class="form-label">確認新密碼</label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
            </svg>
            <input 
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="請再次輸入新密碼"
              :disabled="isLoading"
              @input="errorMsg = ''"
            />
            <button 
              type="button"
              @click="toggleConfirmPassword"
              class="toggle-password-btn"
              :disabled="isLoading"
            >
              <svg v-if="showConfirmPassword" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
              <svg v-else viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 錯誤訊息 -->
        <div v-if="errorMsg" class="error-message">
          <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          {{ errorMsg }}
        </div>

        <!-- 提交按鈕 -->
        <button 
          type="submit"
          class="submit-btn"
          :disabled="isLoading"
        >
          <svg 
            v-if="isLoading"
            class="loading-icon"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 3a1 1 0 011 1v4a1 1 0 11-2 0V4a1 1 0 011-1zm0 10a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm7-7a1 1 0 011 1 1 1 0 11-2 0 1 1 0 011-1zM3 10a1 1 0 011-1 1 1 0 110 2 1 1 0 01-1-1z" />
          </svg>
          {{ isLoading ? '設定中...' : '確認設定' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.init-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
}

.init-password-card {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 2rem;
}

.logo-icon {
  width: 40px;
  height: 40px;
}

.temple-icon {
  width: 100%;
  height: 100%;
}

.logo-text {
  font-size: 24px;
  font-weight: 600;
  color: #E8572A;
}

.header-section {
  text-align: center;
  margin-bottom: 2rem;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
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
  padding: 12px 40px 12px 40px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  transition: all 0.2s ease;

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

.toggle-password-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
    color: #9ca3af;
    transition: color 0.2s ease;
  }

  &:hover:not(:disabled) svg {
    color: #6b7280;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.password-strength {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.strength-bar {
  width: 100%;
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-text {
  font-size: 12px;
  font-weight: 500;
}

.password-requirements {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 0.5rem;
}

.requirement-title {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.requirement-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.requirement-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 13px;
  color: #6b7280;
  transition: color 0.2s ease;

  &.valid {
    color: #10b981;

    .check-icon {
      opacity: 1;
      color: #10b981;
    }
  }
}

.check-icon {
  width: 16px;
  height: 16px;
  opacity: 0.3;
  flex-shrink: 0;
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

.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #E8572A;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background-color: #d94b1f;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(232, 87, 42, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
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

// 響應式設計
@media (max-width: 640px) {
  .init-password-container {
    padding: 1rem;
  }

  .init-password-card {
    padding: 2rem 1.5rem;
  }

  .title {
    font-size: 24px;
  }
}
</style>
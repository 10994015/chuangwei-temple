<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router    = useRouter()
const authStore = useAuthStore()

const email      = ref('')
const isLoading  = ref(false)
const errorMsg   = ref('')
const successMsg = ref('')

const handleSubmit = async () => {
  errorMsg.value   = ''
  successMsg.value = ''
  if (!email.value) { errorMsg.value = '請輸入信箱'; return }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { errorMsg.value = '信箱格式不正確'; return }

  isLoading.value = true
  try {
    const result = await authStore.sendResetPasswordEmail(email.value)
    if (result.success) {
      successMsg.value = '驗證信已寄出，請至信箱查收（15 分鐘內有效）'
    } else {
      errorMsg.value = result.error || '發送失敗，請稍後再試'
    }
  } catch {
    errorMsg.value = '發送失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="forgot-page">
    <div class="forgot-card">
      <div class="card-header">
        <img src="/home-logo.png" alt="宮掌櫃" class="logo" />
        <h1 class="card-title">忘記密碼</h1>
        <p class="card-desc">輸入您的信箱，系統將寄送密碼重設連結</p>
      </div>

      <div class="form-field">
        <label class="form-label">信箱</label>
        <input
          v-model="email"
          type="email"
          class="form-input"
          placeholder="請輸入註冊信箱"
          @keydown.enter="handleSubmit"
        />
      </div>

      <p v-if="errorMsg"   class="error-msg">{{ errorMsg }}</p>
      <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>

      <button class="btn-submit" @click="handleSubmit" :disabled="isLoading">
        {{ isLoading ? '寄送中...' : '寄送驗證信' }}
      </button>

      <p class="back-link"><a @click="router.push('/login')">‹ 返回登入</a></p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.forgot-page {
  min-height: 100vh;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Noto Sans TC', sans-serif;
  padding: 24px;
}

.forgot-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px 36px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 28px;
}

.logo {
  height: 48px;
  object-fit: contain;
}

.card-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.card-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  text-align: center;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  height: 40px;
  padding: 0 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  font-family: 'Noto Sans TC', sans-serif;
  outline: none;
  &:focus { border-color: #E8572A; }
}

.error-msg {
  color: #ef4444;
  font-size: 13px;
  margin: 0 0 10px;
}

.success-msg {
  color: #22c55e;
  font-size: 13px;
  margin: 0 0 10px;
  line-height: 1.5;
}

.btn-submit {
  width: 100%;
  padding: 11px;
  background: #E8572A;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Noto Sans TC', sans-serif;
  transition: background 0.15s;
  margin-top: 4px;

  &:hover:not(:disabled) { background: #d04a20; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}

.back-link {
  text-align: center;
  font-size: 13px;
  margin: 16px 0 0;

  a {
    color: #E8572A;
    cursor: pointer;
    font-weight: 500;
    &:hover { text-decoration: underline; }
  }
}
</style>

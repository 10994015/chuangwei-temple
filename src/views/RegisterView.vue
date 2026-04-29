<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router    = useRouter()
const authStore = useAuthStore()

const form = ref({
  credential:      '',
  email:           '',
  name:            '',
  password:        '',
  confirmPassword: '',
})

const isLoading = ref(false)
const errorMsg  = ref('')
const successMsg = ref('')

const validate = () => {
  const { credential, email, name, password, confirmPassword } = form.value
  if (!credential)      { errorMsg.value = '請輸入帳號'; return false }
  if (!name)            { errorMsg.value = '請輸入姓名'; return false }
  if (!email)           { errorMsg.value = '請輸入信箱'; return false }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errorMsg.value = '信箱格式不正確'; return false }
  if (!password)        { errorMsg.value = '請輸入密碼'; return false }
  if (password.length < 8 || password.length > 20) { errorMsg.value = '密碼長度需為 8~20 碼'; return false }
  if (!/[A-Z]/.test(password)) { errorMsg.value = '密碼需包含英文大寫'; return false }
  if (!/[a-z]/.test(password)) { errorMsg.value = '密碼需包含英文小寫'; return false }
  if (!/[0-9]/.test(password)) { errorMsg.value = '密碼需包含數字'; return false }
  if (!/[^A-Za-z0-9]/.test(password)) { errorMsg.value = '密碼需包含特殊符號'; return false }
  if (password !== confirmPassword) { errorMsg.value = '兩次密碼輸入不一致'; return false }
  return true
}

const handleRegister = async () => {
  errorMsg.value  = ''
  successMsg.value = ''
  if (!validate()) return

  isLoading.value = true
  try {
    const result = await authStore.register({ ...form.value })
    if (result.success) {
      successMsg.value = '註冊成功！即將跳轉至登入頁...'
      setTimeout(() => router.push('/login'), 1500)
    } else {
      errorMsg.value = result.error || '註冊失敗，請稍後再試'
    }
  } catch {
    errorMsg.value = '註冊失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="register-page">
    <div class="register-card">
      <div class="card-header">
        <img src="/home-logo.png" alt="宮掌櫃" class="logo" />
        <h1 class="card-title">建立帳號</h1>
      </div>

      <div class="form-field">
        <label class="form-label">帳號</label>
        <input v-model="form.credential" type="text" class="form-input" placeholder="請輸入帳號" @keydown.enter="handleRegister" />
      </div>

      <div class="form-field">
        <label class="form-label">姓名</label>
        <input v-model="form.name" type="text" class="form-input" placeholder="請輸入姓名" @keydown.enter="handleRegister" />
      </div>

      <div class="form-field">
        <label class="form-label">信箱</label>
        <input v-model="form.email" type="email" class="form-input" placeholder="請輸入信箱" @keydown.enter="handleRegister" />
      </div>

      <div class="form-field">
        <label class="form-label">密碼</label>
        <input v-model="form.password" type="password" class="form-input" placeholder="8~20 碼，需含大小寫、數字、特殊符號" @keydown.enter="handleRegister" />
      </div>

      <div class="form-field">
        <label class="form-label">確認密碼</label>
        <input v-model="form.confirmPassword" type="password" class="form-input" placeholder="請再次輸入密碼" @keydown.enter="handleRegister" />
      </div>

      <p v-if="errorMsg"   class="error-msg">{{ errorMsg }}</p>
      <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>

      <button class="btn-register" @click="handleRegister" :disabled="isLoading">
        {{ isLoading ? '註冊中...' : '註冊' }}
      </button>

      <p class="login-link">已有帳號？<a @click="router.push('/login')">返回登入</a></p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.register-page {
  min-height: 100vh;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Noto Sans TC', sans-serif;
  padding: 24px;
}

.register-card {
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
  gap: 12px;
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
}

.btn-register {
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

.login-link {
  text-align: center;
  font-size: 13px;
  color: #6b7280;
  margin: 16px 0 0;

  a {
    color: #E8572A;
    cursor: pointer;
    font-weight: 500;
    &:hover { text-decoration: underline; }
  }
}
</style>

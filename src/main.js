import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { setUnauthorizedHandler } from './axios'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 設置 401 錯誤處理
setUnauthorizedHandler(() => {
  const authStore = useAuthStore()
  authStore.forceLogout('登入憑證已過期，請重新登入')
})

app.mount('#app')
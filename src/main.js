import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import GoogleSignInPlugin from 'vue3-google-signin'
import { setUnauthorizedHandler } from './axios'
import { useAuthStore } from '@/stores/auth'
import { i18n } from './i18n'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(GoogleSignInPlugin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
})

// 設置 401 錯誤處理
setUnauthorizedHandler(() => {
  const authStore = useAuthStore()
  authStore.forceLogout(i18n.global.t('auth.sessionExpired'))
})

app.use(i18n)
app.mount('#app')
// axios.js - API 配置模組
import axios from 'axios'

// 創建 axios 實例
const axiosClient = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,  // 允許發送 cookies
  timeout: 600000,  // 請求超時時間 (10分鐘)
  headers: {
    'Content-Type': 'application/json'
  }
})

// 追蹤是否正在處理 401 錯誤，避免重複處理
let isHandling401 = false

// 401 錯誤回調函數，由外部設置
let onUnauthorized = null

// 設置 401 錯誤處理回調
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler
}

// 請求攔截器
axiosClient.interceptors.request.use(
  config => {
    // 在發送請求之前做些什麼
    // console.log('🚀 發送請求:', config.method?.toUpperCase(), config.url)
    return config
  },
  error => {
    // console.error('❌ 請求錯誤:', error)
    return Promise.reject(error)
  }
)

// 響應攔截器
axiosClient.interceptors.response.use(
  response => {
    // 對回應資料做點什麼
    // console.log('✅ 收到回應:', response.status, response.config.url)
    
    // 成功請求時重置 401 處理狀態
    isHandling401 = false
    
    return response
  },
  error => {
    // console.error('❌ 回應錯誤:', error.response?.status, error.config?.url)
    
    // 統一錯誤處理
    if (error.response?.status === 401) {
      // console.warn('🔒 認證失敗，登入憑證已過期')
      
      // 避免重複處理 401 錯誤
      if (isHandling401) {
        // console.log('已在處理 401 錯誤，跳過')
        return Promise.reject(error)
      }
      
      isHandling401 = true
      
      // 檢查當前是否已經在登入頁或公開頁面
      const currentPath = window.location.pathname
      const publicPages = ['/login', '/register', '/forgot-password', '/init-password']
      const isPublicPage = publicPages.some(page => currentPath.startsWith(page))
      
      if (isPublicPage) {
        // console.log('當前已在公開頁面，跳過 401 處理')
        isHandling401 = false
        return Promise.reject(error)
      }
      
      // 調用外部設置的處理函數
      if (onUnauthorized) {
        onUnauthorized()
      } else {
        // 備用方案：直接跳轉到首頁（因為目前沒有登入頁）
        // console.warn('未設置 401 處理函數，使用備用方案')
        window.location.href = '/'
      }
      
    } else if (error.response?.status === 403) {
      // console.warn('🚫 權限不足')
    } else if (error.response?.status === 500) {
      // console.error('🔧 伺服器內部錯誤')
    } else if (error.code === 'ECONNABORTED') {
      // console.error('⏰ 請求超時')
    } else if (!error.response) {
      // console.error('🌐 網路連線錯誤')
    }
    
    return Promise.reject(error)
  }
)

export default axiosClient

// 也可以導出一些常用的方法
export const get = (url, config) => axiosClient.get(url, config)
export const post = (url, data, config) => axiosClient.post(url, data, config)
export const put = (url, data, config) => axiosClient.put(url, data, config)
export const del = (url, config) => axiosClient.delete(url, config)
export const patch = (url, data, config) => axiosClient.patch(url, data, config)
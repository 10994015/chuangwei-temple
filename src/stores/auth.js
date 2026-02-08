// stores/auth.js - 認證相關的 store
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosClient from '../axios'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const systemPermissions = ref([])
  const templeRoles = ref([])
  
  // Computed
  const isAuthenticated = computed(() => !!user.value)

  // ==================== 權限檢查方法 ====================
  
  const hasSystemPermission = (permissionName, mode = 'Readonly') => {
    if (!systemPermissions.value || systemPermissions.value.length === 0) return false
    
    const permission = systemPermissions.value.find(p => p.permission_name === permissionName)
    if (!permission) return false
    
    if (mode === 'Readonly' || mode === 'readonly') {
      return permission.mode === 'Readonly' || permission.mode === 'FULL'
    }
    
    if (mode === 'Full' || mode === 'FULL') {
      return permission.mode === 'FULL'
    }
    
    return false
  }

  const hasTemplePermission = (templeId, permissionName, mode = 'Readonly') => {
    if (!templeRoles.value || templeRoles.value.length === 0) return false
    
    const temple = templeRoles.value.find(t => t.templeId === templeId)
    if (!temple) return false
    
    const permission = temple.permissions.find(p => p.permission_name === permissionName)
    if (!permission) return false
    
    if (mode === 'Readonly' || mode === 'readonly') {
      return permission.mode === 'Readonly' || permission.mode === 'FULL'
    }
    
    if (mode === 'Full' || mode === 'FULL') {
      return permission.mode === 'FULL'
    }
    
    return false
  }

  const hasPermission = (permissionName, mode = 'Readonly') => {
    return hasSystemPermission(permissionName, mode)
  }

  const canAccessPage = (permissionName) => {
    return hasSystemPermission(permissionName, 'Readonly') || hasSystemPermission(permissionName, 'FULL')
  }

  const canModify = (permissionName) => {
    return hasSystemPermission(permissionName, 'FULL')
  }

  // ==================== SHA256 加密 ====================
  
  async function hashSHA256(message) {
    const encoder = new TextEncoder()
    const data = encoder.encode(message)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  }

  // ==================== 認證相關方法 ====================

  const forceLogout = (message = '登入憑證已過期，請重新登入') => {
    user.value = null
    systemPermissions.value = []
    templeRoles.value = []
    isInitialized.value = false
    
    if (message) {
      console.warn(message)
    }
    
    if (window.location.pathname !== '/') {
      window.location.href = '/'
    }
  }

  const login = async (credentials) => {
    try {
      credentials.password = await hashSHA256(credentials.password)
      
      const response = await axiosClient.post('/login', credentials)
      
      if (response.status === 202) {
        return {
          success: true,
          data: response.data.data,
          statusCode: response.status,
        }
      }
      
      if (response.status === 200) {
        const data = response.data.data
        user.value = {
          userId: data.userId,
          name: data.name,
        }
        systemPermissions.value = data.systemPermissions || []
        templeRoles.value = data.templeRoles || []
        
        return { 
          success: true, 
          statusCode: response.status,
          data: data
        }
      }
    } catch (error) {
      console.error('登入錯誤:', error)
      
      if (error.response) {
        const statusCode = error.response.status
        const responseData = error.response.data
        const message = responseData?.message
        
        switch (statusCode) {
          case 401:
            return { 
              success: false, 
              error: message || '帳號或密碼錯誤',
              statusCode: statusCode
            }
          case 403:
            if (responseData.data?.status === 'Lock') {
              const lockedUntil = responseData.data?.lockedUntil
              return { 
                success: false, 
                error: `${message}！帳號已被鎖定${lockedUntil ? `至 ${formatDateTime(lockedUntil)}` : ''}`,
                statusCode: statusCode,
                data: responseData.data
              }
            }
            return { 
              success: false, 
              error: message || '帳號狀態異常，請聯繫管理員',
              statusCode: statusCode,
              data: responseData.data
            }
          case 407:
            return { 
              success: false, 
              error: message || '帳號未審核',
              statusCode: statusCode
            }
          default:
            return { 
              success: false, 
              error: message || `伺服器錯誤 (${statusCode})`,
              statusCode: statusCode
            }
        }
      } else if (error.request) {
        return { 
          success: false, 
          error: '網路連線錯誤，請檢查網路狀態',
          statusCode: 500
        }
      } else {
        return { 
          success: false, 
          error: error.message || '未知錯誤',
          statusCode: 500
        }
      }
    }
  }

  const googleLogin = async (credential) => {
    try {
      const response = await axiosClient.post('/login/google', {
        token: credential
      })
      
      if (response.status === 202) {
        return {
          success: true,
          data: response.data.data,
          statusCode: response.status,
        }
      }
      
      if (response.status === 200) {
        const data = response.data.data
        user.value = {
          userId: data.userId,
          name: data.name,
        }
        systemPermissions.value = data.systemPermissions || []
        templeRoles.value = data.templeRoles || []
        
        return { 
          success: true, 
          statusCode: response.status,
          data: data
        }
      }
    } catch (error) {
      console.error('Google 登入錯誤:', error)
      
      if (error.response) {
        const statusCode = error.response.status
        const responseData = error.response.data
        const message = responseData?.message
        
        switch (statusCode) {
          case 401:
            return { 
              success: false, 
              error: message || 'Google 登入驗證失敗',
              statusCode: statusCode
            }
          case 407:
            return { 
              success: false, 
              error: message || '帳號未審核',
              statusCode: statusCode
            }
          default:
            return { 
              success: false, 
              error: message || `伺服器錯誤 (${statusCode})`,
              statusCode: statusCode
            }
        }
      } else if (error.request) {
        return { 
          success: false, 
          error: '網路連線錯誤，請檢查網路狀態',
          statusCode: 500
        }
      } else {
        return { 
          success: false, 
          error: error.message || '未知錯誤',
          statusCode: 500
        }
      }
    }
  }

  const checkAuth = async () => {
    if (isInitialized.value) {
      console.log('已初始化，當前登入狀態:', isAuthenticated.value)
      return isAuthenticated.value
    }
    
    isLoading.value = true
    
    try {
      console.log('開始檢查登入狀態...')
      await fetchUser()
      console.log('登入狀態檢查成功')
      console.log('用戶:', user.value)
      console.log('系統權限:', systemPermissions.value)
      console.log('宮廟角色:', templeRoles.value)
      return true
    } catch (error) {
      console.error('認證檢查失敗:', error)
      console.log('錯誤狀態碼:', error.response?.status)
      
      user.value = null
      systemPermissions.value = []
      templeRoles.value = []
      
      if (error.response && error.response.status === 401) {
        console.log('401 錯誤：未登入或 token 已過期')
        return false
      }
      
      return false
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  /**
   * 獲取用戶權限
   * @returns {Promise<Object>}
   */
  const fetchUserPermissions = async () => {
    try {
      console.log('正在獲取用戶權限...')
      const response = await axiosClient.get('/frontend/user/permission')
      console.log('fetchUserPermissions 回應:', response)
      
      if (response.status === 200 && response.data.data) {
        const data = response.data.data
        console.log('權限資料:', data)
        
        // 更新權限資料
        if (data.systemPermissions) {
          systemPermissions.value = data.systemPermissions
          console.log('系統權限已更新:', systemPermissions.value)
        } else {
          systemPermissions.value = []
        }
        
        if (data.templeRoles) {
          templeRoles.value = data.templeRoles
          console.log('宮廟角色已更新:', templeRoles.value)
        } else {
          templeRoles.value = []
        }
        
        return {
          systemPermissions: systemPermissions.value,
          templeRoles: templeRoles.value
        }
      }
      
      return {
        systemPermissions: [],
        templeRoles: []
      }
    } catch (error) {
      console.error('fetchUserPermissions 錯誤:', error)
      systemPermissions.value = []
      templeRoles.value = []
      throw error
    }
  }

  /**
   * 獲取用戶資料
   * @returns {Promise<Object>}
   */
  const fetchUser = async () => {
    try {
      console.log('正在獲取用戶資料...')
      const response = await axiosClient.get('/frontend/user')
      console.log('fetchUser 回應:', response)
      
      if (response.status === 200 && response.data.data) {
        const data = response.data.data
        console.log('用戶資料:', data)
        
        user.value = {
          userId: data.userId,
          name: data.name,
          email: data.email,
        }
        
        // 獲取用戶權限
        await fetchUserPermissions()
        
        return user.value
      }
    } catch (error) {
      console.error('fetchUser 錯誤:', error)
      console.log('錯誤詳情:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      
      user.value = null
      systemPermissions.value = []
      templeRoles.value = []
      throw error
    }
  }

  const logout = async () => {
    try {
      await axiosClient.post('/login/out')
    } catch (error) {
      console.error('登出請求失敗:', error)
    } finally {
      user.value = null
      systemPermissions.value = []
      templeRoles.value = []
      isInitialized.value = false
      return true
    }
  }

  const changePassword = async ({ certificationId, password, confirmPassword }) => {
    try {
      const hashedPassword = await hashSHA256(password)
      const hashedConfirmPassword = await hashSHA256(confirmPassword)
      
      const response = await axiosClient.patch('/change-password', {
        certificationId: certificationId,
        password: hashedPassword,
        confirmPassword: hashedConfirmPassword
      })
      
      if (response.status === 200) {
        return { success: true }
      } else {
        return { 
          success: false, 
          error: response.data?.message || '密碼變更失敗' 
        }
      }
    } catch (error) {
      console.error('密碼變更錯誤:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || '密碼變更失敗，請稍後再試' 
      }
    }
  }

  const register = async (credentials) => {
    try {
      const hashedPassword = await hashSHA256(credentials.password)
      const hashedConfirmPassword = await hashSHA256(credentials.confirmPassword)
      
      credentials.password = hashedPassword
      credentials.confirmPassword = hashedConfirmPassword
      
      const response = await axiosClient.post('/register', credentials)
      
      if (response.status === 202 || response.status === 200) {
        return { success: true }
      } else {
        return { 
          success: false, 
          error: response.data?.message || '註冊失敗' 
        }
      }
    } catch (error) {
      console.error('註冊錯誤:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || '註冊失敗，請稍後再試' 
      }
    }
  }

  const updateUser = async (userData) => {
    try {
      const response = await axiosClient.patch('/user', {
        nickName: userData.nickname,
        status: userData.status,
      })
      
      if (response.status === 200) {
        user.value = response.data.data
        return { success: true }
      } else {
        return { 
          success: false, 
          error: response.data?.message || '更新失敗' 
        }
      }
    } catch (error) {
      console.error('更新用戶資料錯誤:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || '更新失敗，請稍後再試' 
      }
    }
  }

  const updatePassword = async (passwordForm) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = passwordForm
      
      if (newPassword !== confirmPassword) {
        return { success: false, error: '新密碼和確認密碼不一致' }
      }
      
      const hashedCurrentPassword = await hashSHA256(currentPassword)
      const hashedNewPassword = await hashSHA256(newPassword)
      const hashedConfirmPassword = await hashSHA256(confirmPassword)
      
      const response = await axiosClient.patch('/user/change-password', {
        originalPassword: hashedCurrentPassword,
        password: hashedNewPassword,
        confirmPassword: hashedConfirmPassword
      })
      
      if (response.status === 200) {
        return { success: true, response: response }
      } else {
        return { 
          success: false, 
          error: response.data?.message || '密碼更新失敗' 
        }
      }
    } catch (error) {
      console.error('密碼更新錯誤:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || '密碼更新失敗，請稍後再試' 
      }
    }
  }

  const sendResetPasswordEmail = async (email) => {
    try {
      const response = await axiosClient.post('/change-password', { email })
      
      if (response.status === 202 || response.status === 200) {
        return { success: true }
      } else {
        return { 
          success: false, 
          error: response.data?.message || '發送失敗' 
        }
      }
    } catch (error) {
      console.error('發送重設密碼郵件錯誤:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || '發送失敗，請稍後再試' 
      }
    }
  }

  const emailVerification = async (token) => {
    try {
      const response = await axiosClient.post('/register/verify', { 
        certificationId: token 
      })
      
      if (response.status === 200) {
        return { success: true, message: 'Email 驗證成功' }
      } else {
        return { 
          success: false, 
          error: response.data?.message || 'Email 驗證失敗' 
        }
      }
    } catch (error) {
      console.error('Email 驗證錯誤:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Email 驗證失敗' 
      }
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (error) {
      return dateString
    }
  }

  return {
    user: computed(() => user.value),
    systemPermissions: computed(() => systemPermissions.value),
    templeRoles: computed(() => templeRoles.value),
    isAuthenticated,
    isLoading: computed(() => isLoading.value),
    isInitialized: computed(() => isInitialized.value),
    
    hasPermission,
    hasSystemPermission,
    hasTemplePermission,
    canAccessPage,
    canModify,
    
    login,
    googleLogin,
    register,
    logout,
    checkAuth,
    fetchUser,
    fetchUserPermissions,
    forceLogout,
    
    changePassword,
    updatePassword,
    sendResetPasswordEmail,
    
    updateUser,
    emailVerification,
  }
})
// stores/account.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosClient from '../axios'

export const useAccountStore = defineStore('account', () => {
  // State
  const accounts = ref([])
  const selectedAccount = ref(null)
  const permissionRoles = ref([])
  const total = ref(0)
  const totalPages = ref(0)
  const currentPage = ref(1)
  const currentPageSize = ref(10)
  const isLoadingAccounts = ref(false)
  const isLoadingDetail = ref(false)
  const isLoadingRoles = ref(false)
  const isCreating = ref(false)
  const isDeleting = ref(false)
  const isUpdatingRole = ref(false)
  const error = ref(null)

  // 角色列表（權限管理 Tab）
  const authRoles = ref([])
  const authRolesTotal = ref(0)
  const authRolesTotalPages = ref(0)
  const isLoadingAuthRoles = ref(false)

  // 單一角色 & 所有可用權限
  const selectedRole = ref(null)
  const allPermissions = ref([])
  const isLoadingRole = ref(false)
  const isLoadingPermissions = ref(false)
  const isSavingRole = ref(false)

  // Computed
  const formattedAccounts = computed(() => {
    return accounts.value.map(account => ({
      id: account.id,
      credential: account.credential,
      name: account.name,
      email: account.email,
      gender: account.gender,
      status: account.status,
      roleId: account.roleId,
      roleName: account.roleName,
      lastLoginAt: account.lastLoginAt,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    }))
  })

  const hasAccounts = computed(() => accounts.value.length > 0)

  const pagination = computed(() => ({
    page: currentPage.value,
    pageSize: currentPageSize.value,
    total: total.value,
    totalPages: totalPages.value,
  }))

  // ==================== API 方法 ====================

  // GET /api/tenant/{tid}/user/ - 查詢租戶底下帳號清單
  const fetchAccounts = async (templeId, params = {}) => {
    if (!templeId) {
      console.error('fetchAccounts: templeId is required')
      return []
    }
      console.log("templeIdtempleIdtempleId",templeId);
    isLoadingAccounts.value = true
    error.value = null

    try {
      const {
        q = '',
        status = '',
        sortBy = '',
        sortOrder = '',
        page = 1,
        pageSize = 10,
      } = params

      const queryParams = {}
      if (q)         queryParams.q         = q
      if (status)    queryParams.status    = status
      if (sortBy)    queryParams.sortBy    = sortBy
      if (sortOrder) queryParams.sortOrder = sortOrder
      queryParams.page     = page
      queryParams.pageSize = pageSize
      
      const response = await axiosClient.get(
        `/tenant/${templeId}/user/`,
        { params: queryParams }
      )

      if (response.status === 200 && response.data.data) {
        const data = response.data.data
        console.log(data);
        
        accounts.value        = data.data || []
        total.value           = data.total || 0
        totalPages.value      = data.totalPages || 0
        currentPage.value     = data.page || page
        currentPageSize.value = data.pageSize || pageSize
        return accounts.value
      }

      return []
    } catch (err) {
      console.error('獲取帳號清單失敗:', err)
      error.value = err.response?.data?.message || '獲取帳號清單失敗'
      accounts.value = []
      return []
    } finally {
      isLoadingAccounts.value = false
    }
  }

  // POST /api/tenant/{tid}/user/ - 新增租戶帳號
  const createAccount = async (templeId, payload) => {
    if (!templeId || !payload) {
      console.error('createAccount: templeId and payload are required')
      throw new Error('缺少必要參數')
    }

    isCreating.value = true
    error.value = null

    try {
      const response = await axiosClient.post(
        `/tenant/${templeId}/user/`,
        payload
      )

      if (response.status === 200 || response.status === 201) {
        return { success: true, data: response.data }
      } else {
        throw new Error(response.data?.message || '新增帳號失敗')
      }
    } catch (err) {
      console.error('新增帳號失敗:', err)
      const errorMessage = resolveErrorMessage(err, '新增帳號時發生錯誤')
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isCreating.value = false
    }
  }

  // GET /api/tenant/{tid}/user/permission-role - 查詢租戶目前有的權限角色
  const fetchPermissionRoles = async (templeId) => {
    if (!templeId) {
      console.error('fetchPermissionRoles: templeId is required')
      return []
    }

    isLoadingRoles.value = true
    error.value = null

    try {
      const response = await axiosClient.get(`/tenant/${templeId}/user/permission-role`)

      if (response.status === 200 && response.data.data) {
        permissionRoles.value = response.data.data || []
        return permissionRoles.value
      }

      return []
    } catch (err) {
      console.error('獲取權限角色失敗:', err)
      error.value = err.response?.data?.message || '獲取權限角色失敗'
      permissionRoles.value = []
      return []
    } finally {
      isLoadingRoles.value = false
    }
  }

  // GET /api/tenant/{tid}/user/{id} - 查詢租戶底下單一帳號
  const fetchAccountById = async (templeId, userId) => {
    if (!templeId || !userId) {
      console.error('fetchAccountById: templeId and userId are required')
      return null
    }

    isLoadingDetail.value = true
    error.value = null

    try {
      const response = await axiosClient.get(`/tenant/${templeId}/user/${userId}`)

      if (response.status === 200 && response.data.data) {
        selectedAccount.value = response.data.data
        return selectedAccount.value
      }

      return null
    } catch (err) {
      console.error('獲取帳號詳情失敗:', err)
      error.value = err.response?.data?.message || '獲取帳號詳情失敗'
      selectedAccount.value = null
      return null
    } finally {
      isLoadingDetail.value = false
    }
  }

  // DELETE /api/tenant/{tid}/user/{id} - 刪除租戶帳號關聯
  const deleteAccount = async (templeId, userId) => {
    if (!templeId || !userId) {
      console.error('deleteAccount: templeId and userId are required')
      throw new Error('缺少必要參數')
    }

    isDeleting.value = true
    error.value = null

    try {
      const response = await axiosClient.delete(`/tenant/${templeId}/user/${userId}`)

      if (response.status === 200 || response.status === 204) {
        accounts.value = accounts.value.filter(a => a.id !== userId)
        return { success: true }
      } else {
        throw new Error(response.data?.message || '刪除帳號失敗')
      }
    } catch (err) {
      console.error('刪除帳號失敗:', err)
      const errorMessage = resolveErrorMessage(err, '刪除帳號時發生錯誤')
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isDeleting.value = false
    }
  }

  // GET /api/tenant/{tid}/user/all/{credential} - 查詢全系統帳號清單（精準搜尋）
  const searchAllAccounts = async (templeId, credential, params = {}) => {
    if (!templeId || !credential) return []
    try {
      const { page = 1, pageSize = 10 } = params
      const response = await axiosClient.get(
        `/tenant/${templeId}/user/all/${encodeURIComponent(credential)}`,
        { params: { page, pageSize } }
      )
      if (response.status === 200 && response.data.data) {
        return response.data.data.data || []
      }
      return []
    } catch (err) {
      console.error('搜尋帳號失敗:', err)
      return []
    }
  }

  // POST /api/tenant/{tid}/user/existing - 送出既有帳號加入宮廟邀請
  const inviteExistingUser = async (templeId, payload) => {
    if (!templeId || !payload) {
      console.error('inviteExistingUser: templeId and payload are required')
      throw new Error('缺少必要參數')
    }

    isCreating.value = true
    error.value = null

    try {
      const response = await axiosClient.post(
        `/tenant/${templeId}/user/existing`,
        payload
      )

      if (response.status === 200 || response.status === 201) {
        return { success: true, data: response.data }
      } else {
        throw new Error(response.data?.message || '送出邀請失敗')
      }
    } catch (err) {
      console.error('送出邀請失敗:', err)
      const errorMessage = resolveErrorMessage(err, '送出邀請時發生錯誤')
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isCreating.value = false
    }
  }

  // PATCH /api/tenant/{tid}/user/{id}/permission-role - 編輯租戶帳號權限角色
  const updateAccountPermissionRole = async (templeId, userId, payload) => {
    if (!templeId || !userId || !payload) {
      console.error('updateAccountPermissionRole: templeId, userId and payload are required')
      throw new Error('缺少必要參數')
    }

    isUpdatingRole.value = true
    error.value = null

    try {
      const response = await axiosClient.patch(
        `/tenant/${templeId}/user/${userId}/permission-role`,
        payload
      )

      if (response.status === 200) {
        if (selectedAccount.value?.id === userId) {
          selectedAccount.value = { ...selectedAccount.value, ...response.data.data }
        }
        return { success: true, data: response.data }
      } else {
        throw new Error(response.data?.message || '更新權限角色失敗')
      }
    } catch (err) {
      console.error('更新權限角色失敗:', err)
      const errorMessage = resolveErrorMessage(err, '更新權限角色時發生錯誤')
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isUpdatingRole.value = false
    }
  }

  // GET /api/tenant/{tid}/auth/role - 查詢租戶權限角色列表
  const fetchAuthRoles = async (templeId, params = {}) => {
    if (!templeId) return []
    isLoadingAuthRoles.value = true
    try {
      const { name = '', page = 1, pageSize = 10 } = params
      const query = { page, pageSize }
      if (name) query.name = name
      const response = await axiosClient.get(`/tenant/${templeId}/auth/role`, { params: query })
      console.log("----------->",response.data);
      
      if (response.status === 200 && response.data.data) {
        const d = response.data.data
        authRoles.value           = d.data || []
        authRolesTotal.value      = d.total || 0
        authRolesTotalPages.value = d.totalPages || 0
        return authRoles.value
      }
      return []
    } catch (err) {
      console.error('獲取權限角色列表失敗:', err)
      authRoles.value = []
      return []
    } finally {
      isLoadingAuthRoles.value = false
    }
  }

  // GET /api/tenant/{tid}/auth/role/{id} - 查詢單一權限角色
  const fetchAuthRoleById = async (templeId, roleId) => {
    if (!templeId || !roleId) return null
    isLoadingRole.value = true
    try {
      const response = await axiosClient.get(`/tenant/${templeId}/auth/role/${roleId}`)
      console.log('     ',response);
      
      if (response.status === 200 && response.data.data) {
        selectedRole.value = response.data.data
        return selectedRole.value
      }
      return null
    } catch (err) {
      console.error('獲取角色詳情失敗:', err)
      return null
    } finally {
      isLoadingRole.value = false
    }
  }

  // GET /api/tenant/{tid}/auth/permission - 查詢所有可用權限
  // 回傳格式：[{ category, permissions: [{ id, name, mode: ['FULL','READONLY'] }] }]
  const fetchAllPermissions = async (templeId) => {
    if (!templeId) return []
    isLoadingPermissions.value = true
    try {
      const response = await axiosClient.get(`/tenant/${templeId}/auth/permission`)
      if (response.status === 200 && response.data.data) {
        // response.data.data 已是分組陣列，直接存
        allPermissions.value = Array.isArray(response.data.data) ? response.data.data : []
        return allPermissions.value
      }
      return []
    } catch (err) {
      console.error('獲取可用權限失敗:', err)
      allPermissions.value = []
      return []
    } finally {
      isLoadingPermissions.value = false
    }
  }

  // POST /api/tenant/{tid}/auth/role - 新增權限角色
  const createAuthRole = async (templeId, payload) => {
    if (!templeId || !payload) throw new Error('缺少必要參數')
    isSavingRole.value = true
    try {
      const response = await axiosClient.post(`/tenant/${templeId}/auth/role`, payload)
      if (response.status === 200 || response.status === 201) {
        return { success: true, data: response.data }
      }
      throw new Error(response.data?.message || '新增失敗')
    } catch (err) {
      console.error('新增權限角色失敗:', err)
      const msg = resolveErrorMessage(err, '新增權限角色時發生錯誤')
      return { success: false, error: msg }
    } finally {
      isSavingRole.value = false
    }
  }

  // DELETE /api/tenant/{tid}/auth/role/{id} - 刪除權限角色
  const deleteAuthRole = async (templeId, roleId) => {
    if (!templeId || !roleId) throw new Error('缺少必要參數')
    try {
      const response = await axiosClient.delete(`/tenant/${templeId}/auth/role/${roleId}`)
      if (response.status === 200) {
        authRoles.value = authRoles.value.filter(r => r.roleId !== roleId)
        return { success: true }
      }
      throw new Error(response.data?.message || '刪除失敗')
    } catch (err) {
      console.error('刪除權限角色失敗:', err)
      const msg = resolveErrorMessage(err, '刪除權限角色時發生錯誤')
      return { success: false, error: msg }
    }
  }

  // PATCH /api/tenant/{tid}/auth/role/{id} - 編輯權限角色
  const updateAuthRole = async (templeId, roleId, payload) => {
    if (!templeId || !roleId || !payload) throw new Error('缺少必要參數')
    isSavingRole.value = true
    try {
      const response = await axiosClient.patch(`/tenant/${templeId}/auth/role/${roleId}`, payload)
      if (response.status === 200) {
        return { success: true, data: response.data }
      }
      throw new Error(response.data?.message || '更新失敗')
    } catch (err) {
      console.error('更新權限角色失敗:', err)
      const msg = resolveErrorMessage(err, '更新權限角色時發生錯誤')
      return { success: false, error: msg }
    } finally {
      isSavingRole.value = false
    }
  }

  // ==================== 工具方法 ====================

  const resolveErrorMessage = (err, fallback) => {
    if (err.response) {
      const status = err.response.status
      const message = err.response.data?.message
      switch (status) {
        case 400: return message || '輸入資料有誤，請檢查後重試'
        case 401: return '您沒有權限執行此操作'
        case 404: return '找不到指定的帳號'
        case 409: return message || '帳號已存在'
        case 500: return '伺服器錯誤，請稍後再試'
        default:  return message || `發生錯誤 (${status})`
      }
    }
    if (err.request) return '網路連線失敗，請檢查您的網路連線'
    return err.message || fallback
  }

  const clearAccounts = () => {
    accounts.value        = []
    selectedAccount.value = null
    permissionRoles.value = []
    total.value           = 0
    totalPages.value      = 0
    currentPage.value     = 1
    currentPageSize.value = 10
    error.value           = null
  }

  // ==================== Return ====================

  return {
    accounts:          computed(() => accounts.value),
    selectedAccount:   computed(() => selectedAccount.value),
    permissionRoles:   computed(() => permissionRoles.value),
    total:             computed(() => total.value),
    totalPages:        computed(() => totalPages.value),
    currentPage:       computed(() => currentPage.value),
    currentPageSize:   computed(() => currentPageSize.value),
    isLoadingAccounts: computed(() => isLoadingAccounts.value),
    isLoadingDetail:   computed(() => isLoadingDetail.value),
    isLoadingRoles:    computed(() => isLoadingRoles.value),
    isCreating:        computed(() => isCreating.value),
    isDeleting:        computed(() => isDeleting.value),
    isUpdatingRole:    computed(() => isUpdatingRole.value),
    error:             computed(() => error.value),

    formattedAccounts,
    hasAccounts,
    pagination,

    authRoles:           computed(() => authRoles.value),
    authRolesTotal:      computed(() => authRolesTotal.value),
    authRolesTotalPages: computed(() => authRolesTotalPages.value),
    isLoadingAuthRoles:  computed(() => isLoadingAuthRoles.value),

    selectedRole:        computed(() => selectedRole.value),
    allPermissions:      computed(() => allPermissions.value),
    isLoadingRole:       computed(() => isLoadingRole.value),
    isLoadingPermissions:computed(() => isLoadingPermissions.value),
    isSavingRole:        computed(() => isSavingRole.value),

    fetchAccounts,
    createAccount,
    fetchPermissionRoles,
    fetchAccountById,
    deleteAccount,
    searchAllAccounts,
    inviteExistingUser,
    updateAccountPermissionRole,
    fetchAuthRoleById,
    fetchAllPermissions,
    createAuthRole,
    updateAuthRole,
    deleteAuthRole,
    fetchAuthRoles,
    clearAccounts,
  }
})
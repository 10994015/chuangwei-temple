// stores/member.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosClient from '../axios'

export const useMemberStore = defineStore('member', () => {
  const profile    = ref(null)
  const isLoading  = ref(false)
  const isUpdating = ref(false)
  const error      = ref(null)

  // 家人列表
  const families        = ref([])
  const isFamilyLoading = ref(false)

  // 公司列表
  const companies        = ref([])
  const isCompanyLoading = ref(false)

  // GET /api/frontend/user/ - 查詢個人資料
  const fetchProfile = async () => {
    isLoading.value = true
    error.value     = null
    try {
      const response = await axiosClient.get('/frontend/user/')
      if (response.status === 200 && response.data.data) {
        profile.value = response.data.data
        return profile.value
      }
      return null
    } catch (err) {
      console.error('獲取個人資料失敗:', err)
      error.value = err.response?.data?.message || '獲取個人資料失敗'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // PATCH /api/frontend/user/ - 編輯個人資料
  const updateProfile = async (payload) => {
    isUpdating.value = true
    error.value      = null
    try {
      const response = await axiosClient.patch('/frontend/user/', payload)
      if (response.status === 200 && response.data.data) {
        profile.value = { ...profile.value, ...response.data.data }
        return { success: true, data: response.data.data }
      }
      return { success: false, error: '更新失敗' }
    } catch (err) {
      console.error('更新個人資料失敗:', err)
      const message = err.response?.data?.message || '更新個人資料失敗'
      error.value = message
      return { success: false, error: message }
    } finally {
      isUpdating.value = false
    }
  }

  // GET /api/frontend/user/family - 查詢家人資料列表
  const fetchFamilies = async (params = {}) => {
    isFamilyLoading.value = true
    try {
      const { page = 1, pageSize = 100 } = params
      const response = await axiosClient.get('/frontend/user/family', { params: { page, pageSize } })
      if (response.status === 200 && response.data.data) {
        families.value = response.data.data.data || []
        return families.value
      }
      return []
    } catch (err) {
      console.error('獲取家人資料失敗:', err)
      return []
    } finally {
      isFamilyLoading.value = false
    }
  }

  // POST /api/frontend/user/family - 新增家人資料
  const createFamily = async (payload) => {
    try {
      const response = await axiosClient.post('/frontend/user/family', payload)
      if (response.status === 200 || response.status === 201) {
        return { success: true }
      }
      return { success: false, error: '新增失敗' }
    } catch (err) {
      console.error('新增家人資料失敗:', err)
      return { success: false, error: err.response?.data?.message || '新增家人資料失敗' }
    }
  }

  // PATCH /api/frontend/user/family/{id} - 修改家人資料
  const updateFamily = async (id, payload) => {
    try {
      const response = await axiosClient.patch(`/frontend/user/family/${id}`, payload)
      if (response.status === 200) {
        return { success: true }
      }
      return { success: false, error: '修改失敗' }
    } catch (err) {
      console.error('修改家人資料失敗:', err)
      return { success: false, error: err.response?.data?.message || '修改家人資料失敗' }
    }
  }

  // DELETE /api/frontend/user/family/{id} - 刪除家人資料
  const deleteFamily = async (id) => {
    try {
      const response = await axiosClient.delete(`/frontend/user/family/${id}`)
      if (response.status === 200) {
        families.value = families.value.filter(f => f.id !== id)
        return { success: true }
      }
      return { success: false, error: '刪除失敗' }
    } catch (err) {
      console.error('刪除家人資料失敗:', err)
      return { success: false, error: err.response?.data?.message || '刪除家人資料失敗' }
    }
  }

  // GET /api/frontend/user/company - 查詢公司資料列表
  const fetchCompanies = async (params = {}) => {
    isCompanyLoading.value = true
    try {
      const { page = 1, pageSize = 100 } = params
      const response = await axiosClient.get('/frontend/user/company', { params: { page, pageSize } })
      if (response.status === 200 && response.data.data) {
        companies.value = response.data.data.data || []
        return companies.value
      }
      return []
    } catch (err) {
      console.error('獲取公司資料失敗:', err)
      return []
    } finally {
      isCompanyLoading.value = false
    }
  }

  // POST /api/frontend/user/company - 新增公司資料
  const createCompany = async (payload) => {
    try {
      const response = await axiosClient.post('/frontend/user/company', payload)
      if (response.status === 200 || response.status === 201) return { success: true }
      return { success: false, error: '新增失敗' }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || '新增公司資料失敗' }
    }
  }

  // PATCH /api/frontend/user/company/{id} - 修改公司資料
  const updateCompany = async (id, payload) => {
    try {
      const response = await axiosClient.patch(`/frontend/user/company/${id}`, payload)
      if (response.status === 200) return { success: true }
      return { success: false, error: '修改失敗' }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || '修改公司資料失敗' }
    }
  }

  // DELETE /api/frontend/user/company/{id} - 刪除公司資料
  const deleteCompany = async (id) => {
    try {
      const response = await axiosClient.delete(`/frontend/user/company/${id}`)
      if (response.status === 200) {
        companies.value = companies.value.filter(c => c.id !== id)
        return { success: true }
      }
      return { success: false, error: '刪除失敗' }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || '刪除公司資料失敗' }
    }
  }

  return {
    profile:           computed(() => profile.value),
    isLoading:         computed(() => isLoading.value),
    isUpdating:        computed(() => isUpdating.value),
    error:             computed(() => error.value),
    families:          computed(() => families.value),
    isFamilyLoading:   computed(() => isFamilyLoading.value),
    companies:         computed(() => companies.value),
    isCompanyLoading:  computed(() => isCompanyLoading.value),
    fetchProfile,
    updateProfile,
    fetchFamilies,
    createFamily,
    updateFamily,
    deleteFamily,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
  }
})

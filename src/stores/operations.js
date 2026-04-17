// stores/operations.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axiosClient from '../axios'

export const useOperationsStore = defineStore('operations', () => {

  // ── 創作者（設計師）清單 ──
  const designers        = ref([])
  const designersTotal   = ref(0)
  const designersTotalPages = ref(1)
  const isDesignerLoading = ref(false)

  // GET /api/backend/user/designer
  const fetchDesigners = async (params = {}) => {
    isDesignerLoading.value = true
    try {
      const {
        q                  = '',
        type               = '',
        status             = '',
        startAt            = '',
        endAt              = '',
        publishedCountMin  = '',
        publishedCountMax  = '',
        sortBy             = 'reviewedAt',
        sortOrder          = 'DESC',
        page               = 1,
        pageSize           = 10,
      } = params

      const query = { page, pageSize, sortBy, sortOrder }
      if (q)                 query.q                 = q
      if (type)              query.type              = type
      if (status)            query.status            = status
      if (startAt)           query.startAt           = startAt
      if (endAt)             query.endAt             = endAt
      if (publishedCountMin) query.publishedCountMin = publishedCountMin
      if (publishedCountMax) query.publishedCountMax = publishedCountMax

      const response = await axiosClient.get('/backend/user/designer', { params: query })
      if (response.status === 200 && response.data.data) {
        const payload = response.data.data
        designers.value       = payload.data        || []
        designersTotal.value  = payload.total       || 0
        designersTotalPages.value = payload.totalPages ?? Math.ceil((payload.total || 0) / pageSize)
      } else {
        designers.value = []
      }
      return designers.value
    } catch (err) {
      console.error('獲取創作者清單失敗:', err)
      designers.value = []
      return []
    } finally {
      isDesignerLoading.value = false
    }
  }

  // ── 維運帳號清單（宮廟管理）──
  const operationUsers           = ref([])
  const operationUsersTotal      = ref(0)
  const operationUsersTotalPages = ref(1)
  const isOperationUsersLoading  = ref(false)

  // GET /api/backend/user/operation
  const fetchOperationUsers = async (params = {}) => {
    isOperationUsersLoading.value = true
    try {
      const {
        q         = '',
        status    = '',
        sortBy    = 'createdAt',
        sortOrder = 'DESC',
        page      = 1,
        pageSize  = 10,
      } = params

      const query = { page, pageSize, sortBy, sortOrder }
      if (q)      query.q      = q
      if (status) query.status = status

      const response = await axiosClient.get('/backend/user/operation', { params: query })
      console.log("-----",response.data);
      
      if (response.status === 200 && response.data.data) {
        const payload = response.data.data
        operationUsers.value           = payload.data       || []
        operationUsersTotal.value      = payload.total      || 0
        operationUsersTotalPages.value = payload.totalPages ?? Math.ceil((payload.total || 0) / pageSize)
      } else {
        operationUsers.value = []
      }
      return operationUsers.value
    } catch (err) {
      console.error('獲取維運帳號失敗:', err)
      operationUsers.value = []
      return []
    } finally {
      isOperationUsersLoading.value = false
    }
  }

  // ── 權限角色 ──
  const roles           = ref([])
  const rolesTotal      = ref(0)
  const rolesTotalPages = ref(1)
  const isRolesLoading  = ref(false)

  // GET /api/backend/user/operation/permission-role
  const fetchTenantPermissionRoles = async () => {
    const response = await axiosClient.get('/backend/user/operation/permission-role')
    return response.data?.data || []
  }

  // POST /api/backend/user/
  const createOperationUser = async (body) => {
    const response = await axiosClient.post('/backend/user/', { tenantId: null, ...body })
    return response.data
  }

  // PATCH /api/backend/user/{id}
  const updateOperationUser = async (id, body) => {
    const response = await axiosClient.patch(`/backend/user/${id}`, body)
    return response.data
  }

  // DELETE /api/backend/user/{id}
  const deleteOperationUser = async (id) => {
    const response = await axiosClient.delete(`/backend/user/${id}`)
    return response.data
  }

  // GET /api/backend/auth/system-permission
  const fetchSystemPermissions = async () => {
    const response = await axiosClient.get('/backend/auth/system-permission')
    return response.data?.data || []
  }

  // POST /api/backend/auth/role
  const createRole = async (body) => {
    const response = await axiosClient.post('/backend/auth/role', { tenantId: null, ...body })
    return response.data
  }

  // GET /api/backend/auth/role/{id}
  const fetchRole = async (id) => {
    const response = await axiosClient.get(`/backend/auth/role/${id}`)
    return response.data?.data || null
  }

  // PATCH /api/backend/auth/role/{id}
  const updateRole = async (id, body) => {
    const response = await axiosClient.patch(`/backend/auth/role/${id}`, body)
    return response.data
  }

  // DELETE /api/backend/auth/role/{id}
  const deleteRole = async (id) => {
    const response = await axiosClient.delete(`/backend/auth/role/${id}`)
    return response.data
  }

  // GET /api/backend/auth/role
  const fetchRoles = async (params = {}) => {
    isRolesLoading.value = true
    try {
      const {
        name      = '',
        tenantId  = '',
        sortBy    = 'name',
        sortOrder = 'ASC',
        page      = 1,
        pageSize  = 10,
      } = params

      const query = { page, pageSize, sortBy, sortOrder, tenantId: 'null' }
      if (name)     query.name     = name
      if (tenantId) query.tenantId = tenantId

      const response = await axiosClient.get('/backend/auth/role', { params: query })
      if (response.status === 200 && response.data.data) {
        const payload = response.data.data
        roles.value           = payload.data       || []
        rolesTotal.value      = payload.total      || 0
        rolesTotalPages.value = payload.totalPages ?? Math.ceil((payload.total || 0) / pageSize)
      } else {
        roles.value = []
      }
      return roles.value
    } catch (err) {
      console.error('獲取權限角色失敗:', err)
      roles.value = []
      return []
    } finally {
      isRolesLoading.value = false
    }
  }

  // ── 租客（帳號管理）──
  const tenants           = ref([])
  const tenantsTotal      = ref(0)
  const tenantsTotalPages = ref(1)
  const isTenantsLoading  = ref(false)

  // GET /api/backend/auth/tenant
  const fetchTenants = async (params = {}) => {
    isTenantsLoading.value = true
    try {
      const {
        name      = '',
        type      = '',
        sortBy    = 'createdAt',
        sortOrder = 'DESC',
        page      = 1,
        pageSize  = 10,
      } = params

      const query = { page, pageSize, sortBy, sortOrder }
      if (name) query.name = name
      if (type) query.type = type

      const response = await axiosClient.get('/backend/auth/tenant', { params: query })
      if (response.status === 200 && response.data.data) {
        const payload = response.data.data
        tenants.value           = payload.data       || []
        tenantsTotal.value      = payload.total      || 0
        tenantsTotalPages.value = payload.totalPages ?? Math.ceil((payload.total || 0) / pageSize)
      } else {
        tenants.value = []
      }
      return tenants.value
    } catch (err) {
      console.error('獲取租客帳號失敗:', err)
      tenants.value = []
      return []
    } finally {
      isTenantsLoading.value = false
    }
  }

  // ── 用戶審核（設計師申請）──
  const designerApplications           = ref([])
  const designerApplicationsTotal      = ref(0)
  const designerApplicationsTotalPages = ref(1)
  const isDesignerApplicationLoading   = ref(false)

  // GET /api/backend/user/designer-application
  const fetchDesignerApplications = async (params = {}) => {
    isDesignerApplicationLoading.value = true
    try {
      const {
        startAt           = '',
        endAt             = '',
        userId            = '',
        applicationStatus = '',
        reviewStatus      = '',
        sortBy            = 'createdAt',
        sortOrder         = 'DESC',
        page              = 1,
        pageSize          = 10,
      } = params

      const query = { page, pageSize, sortBy, sortOrder }
      if (startAt)           query.startAt           = startAt
      if (endAt)             query.endAt             = endAt
      if (userId)            query.userId            = userId
      if (applicationStatus) query.applicationStatus = applicationStatus
      if (reviewStatus)      query.reviewStatus      = reviewStatus

      const response = await axiosClient.get('/backend/user/designer-application', { params: query })
      if (response.status === 200 && response.data.data) {
        const payload = response.data.data
        designerApplications.value           = payload.data       || []
        designerApplicationsTotal.value      = payload.total      || 0
        designerApplicationsTotalPages.value = payload.totalPages ?? Math.ceil((payload.total || 0) / pageSize)
        console.log('[用戶審核] API response payload:', payload)
        console.log('[用戶審核] 第一筆資料:', payload.data?.[0])
      } else {
        designerApplications.value = []
      }
      return designerApplications.value
    } catch (err) {
      console.error('獲取用戶審核失敗:', err)
      designerApplications.value = []
      return []
    } finally {
      isDesignerApplicationLoading.value = false
    }
  }

  // ── 香客清單 ──
  const customers           = ref([])
  const customersTotal      = ref(0)
  const customersTotalPages = ref(1)
  const isCustomerLoading   = ref(false)

  // GET /api/backend/user/
  const fetchCustomers = async (params = {}) => {
    isCustomerLoading.value = true
    try {
      const {
        q         = '',
        status    = '',
        provider  = '',
        startAt   = '',
        endAt     = '',
        sortBy    = 'createdAt',
        sortOrder = 'DESC',
        page      = 1,
        pageSize  = 10,
      } = params

      const query = { page, pageSize, sortBy, sortOrder }
      if (q)        query.q        = q
      if (status)   query.status   = status
      if (provider) query.provider = provider
      if (startAt)  query.startAt  = startAt
      if (endAt)    query.endAt    = endAt

      const response = await axiosClient.get('/backend/user/', { params: query })
      if (response.status === 200 && response.data.data) {
        const payload = response.data.data
        customers.value           = payload.data       || []
        customersTotal.value      = payload.total      || 0
        customersTotalPages.value = payload.totalPages ?? Math.ceil((payload.total || 0) / pageSize)
      } else {
        customers.value = []
      }
      return customers.value
    } catch (err) {
      console.error('獲取香客清單失敗:', err)
      customers.value = []
      return []
    } finally {
      isCustomerLoading.value = false
    }
  }

  return {
    roles,
    rolesTotal,
    rolesTotalPages,
    isRolesLoading,
    fetchRoles,
    fetchTenantPermissionRoles,
    createOperationUser,
    updateOperationUser,
    deleteOperationUser,
    fetchSystemPermissions,
    fetchRole,
    createRole,
    updateRole,
    deleteRole,
    tenants,
    tenantsTotal,
    tenantsTotalPages,
    isTenantsLoading,
    fetchTenants,
    designerApplications,
    designerApplicationsTotal,
    designerApplicationsTotalPages,
    isDesignerApplicationLoading,
    fetchDesignerApplications,
    operationUsers,
    operationUsersTotal,
    operationUsersTotalPages,
    isOperationUsersLoading,
    fetchOperationUsers,
    designers,
    designersTotal,
    designersTotalPages,
    isDesignerLoading,
    fetchDesigners,
    customers,
    customersTotal,
    customersTotalPages,
    isCustomerLoading,
    fetchCustomers,
  }
})

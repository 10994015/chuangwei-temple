import { defineStore } from 'pinia'
import { ref } from 'vue'
import axiosClient from '../axios'

export const useTempleStore = defineStore('temple', () => {

  // ── 服務管理 ──
  const services          = ref([])
  const servicesTotal     = ref(0)
  const servicesTotalPages = ref(1)
  const isServicesLoading = ref(false)

  // GET /api/tenant/{tid}/product/service
  const fetchServices = async (tid, params = {}) => {
    isServicesLoading.value = true
    try {
      const {
        name       = '',
        categoryId = '',
        status     = '',
        eventId    = '',
        startAt    = '',
        endAt      = '',
        minPrice   = '',
        maxPrice   = '',
        sortBy     = 'createdAt',
        sortOrder  = 'DESC',
        page       = 1,
        pageSize   = 10,
      } = params

      const query = { page, pageSize, sortBy, sortOrder }
      if (name)       query.name       = name
      if (categoryId) query.categoryId = categoryId
      if (status)     query.status     = status
      if (eventId)    query.eventId    = eventId
      if (startAt)    query.startAt    = startAt
      if (endAt)      query.endAt      = endAt
      if (minPrice)   query.minPrice   = minPrice
      if (maxPrice)   query.maxPrice   = maxPrice

      const res = await axiosClient.get(`/tenant/${tid}/product/service`, { params: query })
      console.log('[fetchServices] response:', res.data)
      if (res.status === 200 && res.data.data) {
        const payload = res.data.data
        console.log('[fetchServices] items:', payload.data)
        services.value           = payload.data       || []
        servicesTotal.value      = payload.total      || 0
        servicesTotalPages.value = payload.totalPages ?? Math.ceil((payload.total || 0) / pageSize)
      } else {
        services.value = []
      }
      return services.value
    } catch (err) {
      console.error('獲取服務列表失敗:', err)
      services.value = []
      return []
    } finally {
      isServicesLoading.value = false
    }
  }

  // POST /api/tenant/{tid}/product/service
  const createService = async (tid, payload) => {
    const res = await axiosClient.post(`/tenant/${tid}/product/service`, payload)
    return res.data
  }

  // POST /api/tenant/{tid}/product/main/file 上傳商品主圖
  const uploadMainImages = async (tid, files) => {
    const formData = new FormData()
    files.forEach(file => formData.append('file', file))
    const res = await axiosClient.post(`/tenant/${tid}/product/main/file`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    console.log('uploadMainImages response:', res.data)
    return res.data?.data || []
  }

  // POST /api/tenant/{tid}/product/sku/file 上傳商品規格圖片
  const uploadSkuImages = async (tid, files) => {
    const formData = new FormData()
    files.forEach(file => formData.append('file', file))
    const res = await axiosClient.post(`/tenant/${tid}/product/sku/file`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    console.log('uploadSkuImages response:', res.data)
    return res.data?.data || []
  }

  // POST /api/tenant/{tid}/product/service-category 新增服務類別
  const createServiceCategory = async (tid, payload) => {
    const res = await axiosClient.post(`/tenant/${tid}/product/service-category`, payload)
    return res.data
  }

  // GET /api/tenant/{tid}/product/service-category 查詢服務類別列表
  const fetchServiceCategories = async (tid) => {
    try {
      const res = await axiosClient.get(`/tenant/${tid}/product/service-category`, {
        params: { page: 1, pageSize: 100, sortBy: 'sequence', sortOrder: 'ASC' },
      })
      return res.data?.data?.data || []
    } catch {
      return []
    }
  }

  // GET /api/tenant/{tid}/product/service-item 查詢服務項目列表
  const fetchServiceItems = async (tid) => {
    try {
      const res = await axiosClient.get(`/tenant/${tid}/product/service-item`, {
        params: { page: 1, pageSize: 100, sortBy: 'sequence', sortOrder: 'ASC' },
      })
      return res.data?.data?.data || []
    } catch {
      return []
    }
  }

  // GET /api/tenant/{tid}/product/ritual 查詢疏文列表
  const fetchRitualDocuments = async (tid) => {
    try {
      const res = await axiosClient.get(`/tenant/${tid}/product/ritual`, {
        params: { page: 1, pageSize: 100, sortBy: 'createdAt', sortOrder: 'DESC' },
      })
      return res.data?.data?.data || []
    } catch {
      return []
    }
  }

  // GET /api/tenant/{tid}/product/certificate 查詢感謝狀列表
  const fetchCertificates = async (tid) => {
    try {
      const res = await axiosClient.get(`/tenant/${tid}/product/certificate`, {
        params: { page: 1, pageSize: 100, sortBy: 'createdAt', sortOrder: 'DESC' },
      })
      return res.data?.data?.data || []
    } catch {
      return []
    }
  }

  // GET /api/tenant/{tid}/product/label-category 查詢標籤類別列表
  const fetchLabelCategories = async (tid) => {
    try {
      const res = await axiosClient.get(`/tenant/${tid}/product/label-category`, {
        params: { page: 1, pageSize: 100, sortBy: 'sequence', sortOrder: 'ASC' },
      })
      return res.data?.data?.data || []
    } catch {
      return []
    }
  }

  // POST /api/tenant/{tid}/product/label-category 新增標籤類別
  const createLabelCategory = async (tid, payload) => {
    const res = await axiosClient.post(`/tenant/${tid}/product/label-category`, payload)
    return res.data
  }

  // POST /api/tenant/{tid}/product/product-category 新增商品類別
  const createProductCategory = async (tid, payload) => {
    const res = await axiosClient.post(`/tenant/${tid}/product/product-category`, payload)
    return res.data
  }

  // GET /api/tenant/{tid}/product/product-category 查詢商品類別列表
  const fetchProductCategories = async (tid, params = {}) => {
    try {
      const query = { page: 1, pageSize: 100, sortBy: 'sequence', sortOrder: 'ASC' }
      if (params.name) query.name = params.name
      const res = await axiosClient.get(`/tenant/${tid}/product/product-category`, { params: query })
      return res.data?.data?.data || []
    } catch {
      return []
    }
  }

  // GET /api/tenant/{tid}/product/product-item 查詢商品項目列表
  const fetchProductItems = async (tid, params = {}) => {
    try {
      const query = { page: 1, pageSize: 100, sortBy: 'sequence', sortOrder: 'ASC' }
      if (params.name) query.name = params.name
      const res = await axiosClient.get(`/tenant/${tid}/product/product-item`, { params: query })
      return res.data?.data?.data || []
    } catch {
      return []
    }
  }

  // GET /api/tenant/{tid}/product/event 查詢可綁定活動列表
  const fetchBindableEvents = async (tid, productId = null) => {
    try {
      const params = { page: 1, pageSize: 100, sortBy: 'createdAt', sortOrder: 'DESC' }
      if (productId) params.productId = productId
      console.log('fetchBindableEvents params:', params)
      const res = await axiosClient.get(`/tenant/${tid}/product/event`, { params })
      console.log('fetchBindableEvents res:', res.data)
      return res.data?.data?.data || []
    } catch {
      return []
    }
  }

  // ── 活動管理 ──
  const events          = ref([])
  const eventsTotal     = ref(0)
  const eventsTotalPages = ref(1)
  const isEventsLoading = ref(false)

  // GET /api/tenant/{tid}/event
  const fetchEvents = async (tid, params = {}) => {
    isEventsLoading.value = true
    try {
      const query = {
        page:      params.page      || 1,
        pageSize:  params.pageSize  || 10,
        sortBy:    'createdAt',
        sortOrder: 'DESC',
      }
      if (params.name)       query.name       = params.name
      if (params.categoryId) query.categoryId = params.categoryId
      if (params.status)     query.status     = params.status
      const res = await axiosClient.get(`/tenant/${tid}/event`, { params: query })
      if (res.status === 200 && res.data.data) {
        const payload = res.data.data
        events.value           = payload.data       || []
        eventsTotal.value      = payload.total      || 0
        eventsTotalPages.value = payload.totalPages ?? Math.ceil((payload.total || 0) / (params.pageSize || 10))
      } else {
        events.value = []
      }
      return events.value
    } catch (err) {
      console.error('獲取活動列表失敗:', err)
      events.value = []
      return []
    } finally {
      isEventsLoading.value = false
    }
  }

  // DELETE /api/tenant/{tid}/event/{id}
  const deleteEvent = async (tid, id) => {
    const res = await axiosClient.delete(`/tenant/${tid}/event/${id}`)
    return res.data
  }

  // DELETE /api/tenant/{tid}/product/physical/{id}
  const deletePhysicalProduct = async (tid, id) => {
    const res = await axiosClient.delete(`/tenant/${tid}/product/physical/${id}`)
    return res.data
  }

  // DELETE /api/tenant/{tid}/product/lamp/{id}
  const deleteLampProduct = async (tid, id) => {
    const res = await axiosClient.delete(`/tenant/${tid}/product/lamp/${id}`)
    return res.data
  }

  // DELETE /api/tenant/{tid}/product/donation/{id}
  const deleteDonationProduct = async (tid, id) => {
    const res = await axiosClient.delete(`/tenant/${tid}/product/donation/${id}`)
    return res.data
  }

  // DELETE /api/tenant/{tid}/product/service/{id}
  const deleteService = async (tid, id) => {
    const res = await axiosClient.delete(`/tenant/${tid}/product/service/${id}`)
    return res.data
  }

  // GET /api/tenant/{tid}/product/service/{id}
  const fetchService = async (tid, id) => {
    const res = await axiosClient.get(`/tenant/${tid}/product/service/${id}`)
    return res.data?.data || null
  }

  // PATCH /api/tenant/{tid}/product/service/{id}
  const updateService = async (tid, id, payload) => {
    const res = await axiosClient.patch(`/tenant/${tid}/product/service/${id}`, payload)
    return res.data
  }

  // GET /api/tenant/{tid}/product/physical/{id}
  const fetchPhysicalProduct = async (tid, id) => {
    const res = await axiosClient.get(`/tenant/${tid}/product/physical/${id}`)
    return res.data?.data || null
  }

  // PATCH /api/tenant/{tid}/product/physical/{id}
  const updatePhysicalProduct = async (tid, id, payload) => {
    const res = await axiosClient.patch(`/tenant/${tid}/product/physical/${id}`, payload)
    return res.data
  }

  // POST /api/tenant/{tid}/product/physical
  const createPhysicalProduct = async (tid, payload) => {
    const res = await axiosClient.post(`/tenant/${tid}/product/physical`, payload)
    return res.data
  }

  // ── 實體商品管理 ──
  const physicalProducts          = ref([])
  const physicalProductsTotal     = ref(0)
  const physicalProductsTotalPages = ref(1)
  const isPhysicalProductsLoading = ref(false)

  // GET /api/tenant/{tid}/product/physical
  const fetchPhysicalProducts = async (tid, params = {}) => {
    isPhysicalProductsLoading.value = true
    try {
      const {
        name       = '',
        categoryId = '',
        itemId     = '',
        eventId    = '',
        status     = '',
        startAt    = '',
        endAt      = '',
        minPrice   = '',
        maxPrice   = '',
        sortBy     = 'createdAt',
        sortOrder  = 'DESC',
        page       = 1,
        pageSize   = 10,
      } = params

      const query = { page, pageSize, sortBy, sortOrder }
      if (name)       query.name       = name
      if (categoryId) query.categoryId = categoryId
      if (itemId)     query.itemId     = itemId
      if (eventId)    query.eventId    = eventId
      if (status)     query.status     = status
      if (startAt)    query.startAt    = startAt
      if (endAt)      query.endAt      = endAt
      if (minPrice)   query.minPrice   = minPrice
      if (maxPrice)   query.maxPrice   = maxPrice

      const res = await axiosClient.get(`/tenant/${tid}/product/physical`, { params: query })
      if (res.status === 200 && res.data.data) {
        const payload = res.data.data
        physicalProducts.value           = payload.data       || []
        physicalProductsTotal.value      = payload.total      || 0
        physicalProductsTotalPages.value = payload.totalPages ?? Math.ceil((payload.total || 0) / pageSize)
      } else {
        physicalProducts.value = []
      }
      return physicalProducts.value
    } catch (err) {
      console.error('獲取實體商品列表失敗:', err)
      physicalProducts.value = []
      return []
    } finally {
      isPhysicalProductsLoading.value = false
    }
  }

  // POST /api/tenant/{tid}/product/donation
  const createDonationProduct = async (tid, payload) => {
    const res = await axiosClient.post(`/tenant/${tid}/product/donation`, payload)
    return res.data
  }

  // GET /api/tenant/{tid}/product/donation/{id}
  const fetchDonationProduct = async (tid, id) => {
    const res = await axiosClient.get(`/tenant/${tid}/product/donation/${id}`)
    return res.data?.data || null
  }

  // PATCH /api/tenant/{tid}/product/donation/{id}
  const updateDonationProduct = async (tid, id, payload) => {
    const res = await axiosClient.patch(`/tenant/${tid}/product/donation/${id}`, payload)
    return res.data
  }

  // ── 捐款商品管理 ──
  const donationProducts          = ref([])
  const donationProductsTotal     = ref(0)
  const donationProductsTotalPages = ref(1)
  const isDonationProductsLoading = ref(false)

  // GET /api/tenant/{tid}/product/donation
  const fetchDonationProducts = async (tid, params = {}) => {
    isDonationProductsLoading.value = true
    try {
      const {
        name       = '',
        categoryId = '',
        itemId     = '',
        startAt    = '',
        endAt      = '',
        minPrice   = '',
        maxPrice   = '',
        sortBy     = 'createdAt',
        sortOrder  = 'DESC',
        page       = 1,
        pageSize   = 10,
      } = params

      const query = { page, pageSize, sortBy, sortOrder }
      if (name)       query.name       = name
      if (categoryId) query.categoryId = categoryId
      if (itemId)     query.itemId     = itemId
      if (startAt)    query.startAt    = startAt
      if (endAt)      query.endAt      = endAt
      if (minPrice)   query.minPrice   = minPrice
      if (maxPrice)   query.maxPrice   = maxPrice

      const res = await axiosClient.get(`/tenant/${tid}/product/donation`, { params: query })
      if (res.status === 200 && res.data.data) {
        const payload = res.data.data
        donationProducts.value           = payload.data       || []
        donationProductsTotal.value      = payload.total      || 0
        donationProductsTotalPages.value = payload.totalPages ?? Math.ceil((payload.total || 0) / pageSize)
      } else {
        donationProducts.value = []
      }
      return donationProducts.value
    } catch (err) {
      console.error('獲取捐款商品列表失敗:', err)
      donationProducts.value = []
      return []
    } finally {
      isDonationProductsLoading.value = false
    }
  }

  // ── 點燈商品管理 ──
  const lampProducts          = ref([])
  const lampProductsTotal     = ref(0)
  const lampProductsTotalPages = ref(1)
  const isLampProductsLoading = ref(false)

  // POST /api/tenant/{tid}/product/lamp
  const createLampProduct = async (tid, payload) => {
    const res = await axiosClient.post(`/tenant/${tid}/product/lamp`, payload)
    return res.data
  }

  // GET /api/tenant/{tid}/product/lamp
  const fetchLampProducts = async (tid, params = {}) => {
    isLampProductsLoading.value = true
    try {
      const query = { page: params.page || 1, pageSize: params.pageSize || 10, sortBy: 'createdAt', sortOrder: 'DESC' }
      if (params.name)       query.name       = params.name
      if (params.categoryId) query.categoryId = params.categoryId
      if (params.itemId)     query.itemId     = params.itemId
      if (params.status)     query.status     = params.status
      if (params.eventId)    query.eventId    = params.eventId
      if (params.startAt)    query.startAt    = params.startAt
      if (params.endAt)      query.endAt      = params.endAt
      if (params.minPrice)   query.minPrice   = params.minPrice
      if (params.maxPrice)   query.maxPrice   = params.maxPrice
      const res = await axiosClient.get(`/tenant/${tid}/product/lamp`, { params: query })
      if (res.status === 200 && res.data.data) {
        const payload = res.data.data
        lampProducts.value           = payload.data       || []
        lampProductsTotal.value      = payload.total      || 0
        lampProductsTotalPages.value = payload.totalPages ?? Math.ceil((payload.total || 0) / (params.pageSize || 10))
      } else {
        lampProducts.value = []
      }
      return lampProducts.value
    } catch (err) {
      console.error('獲取點燈商品列表失敗:', err)
      lampProducts.value = []
      return []
    } finally {
      isLampProductsLoading.value = false
    }
  }

  // ── 運費規則 ──
  const shippingRules          = ref([])
  const isShippingRulesLoading = ref(false)

  // POST /api/tenant/{tid}/shipping/rule
  const createShippingRule = async (tid, payload) => {
    const res = await axiosClient.post(`/tenant/${tid}/shipping/rule`, payload)
    return res.data
  }

  // GET /api/tenant/{tid}/shipping/rule/{id}
  const fetchShippingRule = async (tid, id) => {
    const res = await axiosClient.get(`/tenant/${tid}/shipping/rule/${id}`)
    return res.data?.data || null
  }

  // PATCH /api/tenant/{tid}/shipping/rule/{id}
  const updateShippingRule = async (tid, id, payload) => {
    const res = await axiosClient.patch(`/tenant/${tid}/shipping/rule/${id}`, payload)
    return res.data
  }

  // DELETE /api/tenant/{tid}/shipping/rule/{id}
  const deleteShippingRule = async (tid, id) => {
    const res = await axiosClient.delete(`/tenant/${tid}/shipping/rule/${id}`)
    return res.data
  }

  // PATCH /api/tenant/{tid}/shipping/rule/{id}/priority
  const updateShippingRulePriority = async (tid, id, priority) => {
    const res = await axiosClient.patch(`/tenant/${tid}/shipping/rule/${id}/priority`, { priority })
    return res.data
  }

  // GET /api/tenant/{tid}/shipping/rule
  const fetchShippingRules = async (tid, params = {}) => {
    isShippingRulesLoading.value = true
    try {
      const query = {}
      if (params.name)   query.name   = params.name
      if (params.type)   query.type   = params.type
      if (params.status) query.status = params.status
      const res = await axiosClient.get(`/tenant/${tid}/shipping/rule`, { params: query })
      shippingRules.value = res.data?.data || []
      return shippingRules.value
    } catch (err) {
      console.error('獲取運費規則失敗:', err)
      shippingRules.value = []
      return []
    } finally {
      isShippingRulesLoading.value = false
    }
  }

  return {
    services,
    servicesTotal,
    servicesTotalPages,
    isServicesLoading,
    fetchServices,
    createService,
    fetchService,
    updateService,
    events,
    eventsTotal,
    eventsTotalPages,
    isEventsLoading,
    fetchEvents,
    deleteEvent,
    deletePhysicalProduct,
    deleteLampProduct,
    deleteDonationProduct,
    deleteService,
    createServiceCategory,
    fetchServiceCategories,
    fetchServiceItems,
    fetchRitualDocuments,
    fetchCertificates,
    fetchLabelCategories,
    createLabelCategory,
    createProductCategory,
    fetchProductCategories,
    fetchProductItems,
    uploadMainImages,
    uploadSkuImages,
    fetchBindableEvents,
    physicalProducts,
    physicalProductsTotal,
    physicalProductsTotalPages,
    isPhysicalProductsLoading,
    fetchPhysicalProducts,
    fetchPhysicalProduct,
    updatePhysicalProduct,
    createPhysicalProduct,
    createDonationProduct,
    fetchDonationProduct,
    updateDonationProduct,
    donationProducts,
    donationProductsTotal,
    donationProductsTotalPages,
    isDonationProductsLoading,
    fetchDonationProducts,
    lampProducts,
    lampProductsTotal,
    lampProductsTotalPages,
    isLampProductsLoading,
    fetchLampProducts,
    createLampProduct,
    shippingRules,
    isShippingRulesLoading,
    fetchShippingRules,
    createShippingRule,
    fetchShippingRule,
    updateShippingRule,
    deleteShippingRule,
    updateShippingRulePriority,
  }
})

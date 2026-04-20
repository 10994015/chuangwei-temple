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
        sortBy     = 'createdAt',
        sortOrder  = 'DESC',
        page       = 1,
        pageSize   = 10,
      } = params

      const query = { page, pageSize, sortBy, sortOrder }
      if (name)       query.name       = name
      if (categoryId) query.categoryId = categoryId
      if (status)     query.status     = status

      const res = await axiosClient.get(`/tenant/${tid}/product/service`, { params: query })
      if (res.status === 200 && res.data.data) {
        const payload = res.data.data
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
        sortBy     = 'createdAt',
        sortOrder  = 'DESC',
        page       = 1,
        pageSize   = 10,
      } = params

      const query = { page, pageSize, sortBy, sortOrder }
      if (name)       query.name       = name
      if (categoryId) query.categoryId = categoryId
      if (itemId)     query.itemId     = itemId

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
        sortBy     = 'createdAt',
        sortOrder  = 'DESC',
        page       = 1,
        pageSize   = 10,
      } = params

      const query = { page, pageSize, sortBy, sortOrder }
      if (name)       query.name       = name
      if (categoryId) query.categoryId = categoryId
      if (itemId)     query.itemId     = itemId

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

  return {
    services,
    servicesTotal,
    servicesTotalPages,
    isServicesLoading,
    fetchServices,
    createService,
    fetchService,
    updateService,
    deleteService,
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
  }
})

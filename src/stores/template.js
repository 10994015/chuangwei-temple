// stores/template.js - 模板相關的 store
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosClient from '../axios'

export const useTemplateStore = defineStore('template', () => {
  // State
  const layer1Categories = ref([])
  const selectedCategoryDetail = ref(null)
  const webTemplates = ref([])
  const webTemplatesCache = ref({})
  const isLoadingL1 = ref(false)
  const isLoadingDetail = ref(false)
  const isLoadingTemplates = ref(false)
  const isCreatingWebsite = ref(false)
  const error = ref(null)

  // Computed
  const formattedLayer1 = computed(() => {
    return layer1Categories.value.map(category => ({
      id: category.id,
      name: category.name,
      layer: category.layer,
      parentId: category.parent_id
    }))
  })

  const formattedSubCategories = computed(() => {
    if (!selectedCategoryDetail.value || !selectedCategoryDetail.value.subCategories) {
      return []
    }

    return selectedCategoryDetail.value.subCategories.map(subCat => ({
      id: subCat.subCategoryId,
      name: subCat.subCategoryName,
      parentId: selectedCategoryDetail.value.id,
      parentName: selectedCategoryDetail.value.name
    }))
  })

  const formattedWebTemplates = computed(() => {
    return webTemplates.value.map(template => ({
      id: template.id,
      categoryId: template.categoryId,
      name: template.name,
      description: template.description,
      status: template.status,
      level: template.level,
      coverImgUrl: template.coverImgUrl,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    }))
  })

  // ==================== API 方法 ====================

  const fetchLayer1Categories = async (templeId) => {
    if (!templeId) {
      console.error('fetchLayer1Categories: templeId is required')
      return []
    }

    isLoadingL1.value = true
    error.value = null

    try {
      const response = await axiosClient.get(`/tenant/${templeId}/template-category/layer/1`)

      if (response.status === 200 && response.data.data) {
        layer1Categories.value = response.data.data.data || []
        return layer1Categories.value
      }

      return []
    } catch (err) {
      console.error('獲取 L1 類別失敗:', err)
      error.value = err.response?.data?.message || '獲取網站類型失敗'
      layer1Categories.value = []
      return []
    } finally {
      isLoadingL1.value = false
    }
  }

  const fetchCategoryDetail = async (templeId, categoryId) => {
    if (!templeId || !categoryId) {
      console.error('fetchCategoryDetail: templeId and categoryId are required')
      return null
    }

    isLoadingDetail.value = true
    error.value = null

    try {
      const response = await axiosClient.get(`/tenant/${templeId}/template-category/${categoryId}`)

      if (response.status === 200 && response.data.data) {
        selectedCategoryDetail.value = response.data.data
        console.log('類別詳情獲取成功:', selectedCategoryDetail.value)
        console.log('子分類列表:', selectedCategoryDetail.value.subCategories)
        return selectedCategoryDetail.value
      }

      return null
    } catch (err) {
      console.error('獲取類別詳情失敗:', err)
      error.value = err.response?.data?.message || '獲取類別詳情失敗'
      selectedCategoryDetail.value = null
      return null
    } finally {
      isLoadingDetail.value = false
    }
  }

  const fetchWebTemplates = async (templeId, categoryId = null, forceRefresh = false) => {
    if (!templeId) {
      console.error('fetchWebTemplates: templeId is required')
      return []
    }

    if (categoryId && !forceRefresh && webTemplatesCache.value[categoryId]) {
      console.log(`使用快取的模板資料，分類 ID: ${categoryId}`)
      webTemplates.value = webTemplatesCache.value[categoryId]
      return webTemplates.value
    }

    isLoadingTemplates.value = true
    error.value = null

    try {
      const url = categoryId
        ? `/tenant/${templeId}/web-template/?categoryId=${categoryId}`
        : `/tenant/${templeId}/web-template/`

      const response = await axiosClient.get(url)


      if (response.status === 200 && response.data.data) {
        const raw = response.data.data
        const templates = Array.isArray(raw) ? raw : (raw.data || [])
        webTemplates.value = templates

        if (categoryId) {
          webTemplatesCache.value[categoryId] = templates
        }

        return webTemplates.value
      }

      return []
    } catch (err) {
      console.error('獲取網站模板失敗:', err)
      error.value = err.response?.data?.message || '獲取網站模板失敗'
      webTemplates.value = []
      return []
    } finally {
      isLoadingTemplates.value = false
    }
  }

  const createWebsite = async (templeId, templateId, domain) => {
    if (!templeId || !templateId || !domain) {
      console.error('createWebsite: templeId, templateId and domain are required')
      throw new Error('缺少必要參數')
    }

    isCreatingWebsite.value = true
    error.value = null

    try {
      const actualTemplateId = templateId === 'blank-template' ? null : templateId

      const response = await axiosClient.post(
        `/tenant/${templeId}/web-site/`,
        {
          webTemplateId: actualTemplateId,
          domain: domain
        }
      )

      if (response.status === 200) {
        return { success: true, data: response.data }
      } else {
        throw new Error(response.data?.message || '建立網站失敗')
      }
    } catch (err) {
      console.error('建立網站失敗:', err)

      let errorMessage = '建立網站時發生錯誤'

      if (err.response) {
        const status = err.response.status
        const message = err.response.data?.message

        switch (status) {
          case 400: errorMessage = message || '輸入資料有誤，請檢查後重試'; break
          case 401: errorMessage = '您沒有權限執行此操作'; break
          case 409: errorMessage = '此網站名稱已被使用，請選擇其他名稱'; break
          case 500: errorMessage = '伺服器錯誤，請稍後再試'; break
          default: errorMessage = message || `發生錯誤 (${status})`
        }
      } else if (err.request) {
        errorMessage = '網路連線失敗，請檢查您的網路連線'
      } else {
        errorMessage = err.message || '發生未知錯誤'
      }

      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isCreatingWebsite.value = false
    }
  }

  const fetchAllCategories = async (templeId) => {
    if (!templeId) {
      console.error('fetchAllCategories: templeId is required')
      return { layer1: [] }
    }

    try {
      const l1 = await fetchLayer1Categories(templeId)
      return { layer1: l1 }
    } catch (err) {
      console.error('獲取所有類別失敗:', err)
      return { layer1: [] }
    }
  }

  const getCategoryById = (categoryId) => {
    return layer1Categories.value.find(cat => cat.id === categoryId) || null
  }

  const getSubCategoryById = (subCategoryId) => {
    if (!selectedCategoryDetail.value || !selectedCategoryDetail.value.subCategories) {
      return null
    }

    const subCat = selectedCategoryDetail.value.subCategories.find(
      sub => sub.subCategoryId === subCategoryId
    )

    if (subCat) {
      return {
        id: subCat.subCategoryId,
        name: subCat.subCategoryName,
        parentId: selectedCategoryDetail.value.id,
        parentName: selectedCategoryDetail.value.name
      }
    }

    return null
  }

  const clearTemplateCache = (categoryId = null) => {
    if (categoryId) {
      delete webTemplatesCache.value[categoryId]
    } else {
      webTemplatesCache.value = {}
    }
  }

  const clearAll = () => {
    layer1Categories.value = []
    selectedCategoryDetail.value = null
    webTemplates.value = []
    webTemplatesCache.value = {}
    error.value = null
  }

  const checkWebsiteExists = async (templeId) => {
    if (!templeId) {
      console.error('checkWebsiteExists: templeId is required')
      return false
    }

    try {
      const response = await axiosClient.get(`/tenant/${templeId}/web-site/exist`)

      if (response.status === 200 && response.data.data) {
        return response.data.data.result === true
      }

      return false
    } catch (err) {
      console.error('檢查網站存在失敗:', err)
      return false
    }
  }

  const checkSubdomainAvailable = async (templeId, subdomain) => {
    if (!templeId || !subdomain) {
      console.error('checkSubdomainAvailable: templeId and subdomain are required')
      return false
    }

    try {
      const response = await axiosClient.get(
        `/tenant/${templeId}/web-site/check-subdomain`,
        { params: { subdomain } }
      )

      if (response.status === 200 && response.data.data) {
        return response.data.data.result === true
      }

      return false
    } catch (err) {
      console.error('檢查子網域失敗:', err)
      return false
    }
  }

  // ==================== Return ====================

  return {
    layer1Categories: computed(() => layer1Categories.value),
    selectedCategoryDetail: computed(() => selectedCategoryDetail.value),
    webTemplates: computed(() => webTemplates.value),
    isLoadingL1: computed(() => isLoadingL1.value),
    isLoadingDetail: computed(() => isLoadingDetail.value),
    isLoadingTemplates: computed(() => isLoadingTemplates.value),
    isCreatingWebsite: computed(() => isCreatingWebsite.value),
    error: computed(() => error.value),

    formattedLayer1,
    formattedSubCategories,
    formattedWebTemplates,

    fetchLayer1Categories,
    fetchCategoryDetail,
    fetchWebTemplates,
    fetchAllCategories,
    getCategoryById,
    getSubCategoryById,
    createWebsite,
    clearTemplateCache,
    clearAll,
    checkWebsiteExists,
    checkSubdomainAvailable,
  }
})
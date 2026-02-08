// stores/template.js - 模板相關的 store
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosClient from '../axios'

export const useTemplateStore = defineStore('template', () => {
  // State
  const layer1Categories = ref([])
  const selectedCategoryDetail = ref(null)
  const webTemplates = ref([])
  const webTemplatesCache = ref({}) // 👈 新增：模板快取，key 為 categoryId
  const isLoadingL1 = ref(false)
  const isLoadingDetail = ref(false)
  const isLoadingTemplates = ref(false)
  const isCreatingWebsite = ref(false)
  const error = ref(null)

  // Computed
  /**
   * 格式化 L1 類別為組件所需的格式
   */
  const formattedLayer1 = computed(() => {
    return layer1Categories.value.map(category => ({
      id: category.id,
      name: category.name,
      layer: category.layer,
      parentId: category.parent_id
    }))
  })

  /**
   * 格式化子分類列表（從選中類型的詳情中獲取）
   */
  const formattedSubCategories = computed(() => {
    if (!selectedCategoryDetail.value || !selectedCategoryDetail.value.sub_categories) {
      return []
    }
    
    return selectedCategoryDetail.value.sub_categories.map(subCat => ({
      id: subCat.sub_category_id,
      name: subCat.sub_category_name,
      parentId: selectedCategoryDetail.value.id,
      parentName: selectedCategoryDetail.value.name
    }))
  })

  /**
   * 格式化網站模板列表
   */
  const formattedWebTemplates = computed(() => {
    return webTemplates.value.map(template => ({
      id: template.id,
      categoryId: template.category_id,
      name: template.name,
      description: template.description,
      isActive: template.is_active,
      createdAt: template.created_at,
      updatedAt: template.updated_at
    }))
  })

  // ==================== API 方法 ====================

  /**
   * 獲取 L1 層級的模板類別（網站類型）
   */
  const fetchLayer1Categories = async (templeId) => {
    if (!templeId) {
      console.error('fetchLayer1Categories: templeId is required')
      return []
    }

    isLoadingL1.value = true
    error.value = null

    try {
      console.log('獲取 L1 類別，宮廟 ID:', templeId)
      const response = await axiosClient.get(`/tenant/${templeId}/template-category/layer/1`)
      
      if (response.status === 200 && response.data.data) {
        layer1Categories.value = response.data.data.data || []
        console.log('L1 類別獲取成功:', layer1Categories.value)
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

  /**
   * 獲取單一類別的詳細資訊（包含 sub_categories）
   * @param {string} templeId - 宮廟 ID
   * @param {string} categoryId - 類別 ID（L1 的 ID）
   */
  const fetchCategoryDetail = async (templeId, categoryId) => {
    if (!templeId || !categoryId) {
      console.error('fetchCategoryDetail: templeId and categoryId are required')
      return null
    }

    isLoadingDetail.value = true
    error.value = null

    try {
      console.log('獲取類別詳情，宮廟 ID:', templeId, '類別 ID:', categoryId)
      const response = await axiosClient.get(`/tenant/${templeId}/template-category/${categoryId}`)
      
      if (response.status === 200 && response.data.data) {
        selectedCategoryDetail.value = response.data.data
        console.log('類別詳情獲取成功:', selectedCategoryDetail.value)
        console.log('子分類列表:', selectedCategoryDetail.value.sub_categories)
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

  /**
   * 👇 優化：獲取網站模板列表（帶快取）
   * @param {string} templeId - 宮廟 ID
   * @param {string} categoryId - 子分類 ID (sub_category_id)
   * @param {boolean} forceRefresh - 是否強制重新獲取（忽略快取）
   */
  const fetchWebTemplates = async (templeId, categoryId = null, forceRefresh = false) => {
    if (!templeId) {
      console.error('fetchWebTemplates: templeId is required')
      return []
    }

    // 👇 檢查快取
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
      
      console.log('獲取網站模板，URL:', url)
      const response = await axiosClient.get(url)
      
      if (response.status === 200 && response.data.data) {
        const templates = response.data.data || []
        webTemplates.value = templates
        
        // 👇 儲存到快取
        if (categoryId) {
          webTemplatesCache.value[categoryId] = templates
          console.log(`模板資料已快取，分類 ID: ${categoryId}`)
        }
        
        console.log('網站模板獲取成功:', webTemplates.value)
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

  /**
   * 建立 CMS 網站
   * @param {string} templeId - 宮廟 ID
   * @param {string} templateId - 模板 ID（如果是 'blank-template' 則傳 null）
   * @param {string} domain - 子網域名稱
   * @returns {Promise<Object>} 建立結果
   */
  const createWebsite = async (templeId, templateId, domain) => {
    if (!templeId || !templateId || !domain) {
      console.error('createWebsite: templeId, templateId and domain are required')
      throw new Error('缺少必要參數')
    }

    isCreatingWebsite.value = true
    error.value = null

    try {
      console.log('開始建立網站')
      console.log('宮廟 ID:', templeId)
      console.log('模板 ID:', templateId)
      console.log('子網域:', domain)

      // 如果 templateId 是 'blank-template'，則傳 null 給後端
      const actualTemplateId = templateId === 'blank-template' ? null : templateId

      const response = await axiosClient.post(
        `/tenant/${templeId}/web-site/`,
        {
          webTemplateId: actualTemplateId,
          domain: domain
        }
      )

      console.log('建立網站 API 回應:', response)

      if (response.status === 200) {
        console.log('網站建立成功！')
        return {
          success: true,
          data: response.data
        }
      } else {
        throw new Error(response.data?.message || '建立網站失敗')
      }

    } catch (err) {
      console.error('建立網站失敗:', err)
      
      // 處理不同的錯誤狀態
      let errorMessage = '建立網站時發生錯誤'
      
      if (err.response) {
        const status = err.response.status
        const message = err.response.data?.message
        
        switch (status) {
          case 400:
            errorMessage = message || '輸入資料有誤，請檢查後重試'
            break
          case 401:
            errorMessage = '您沒有權限執行此操作'
            break
          case 409:
            errorMessage = '此網站名稱已被使用，請選擇其他名稱'
            break
          case 500:
            errorMessage = '伺服器錯誤，請稍後再試'
            break
          default:
            errorMessage = message || `發生錯誤 (${status})`
        }
      } else if (err.request) {
        errorMessage = '網路連線失敗，請檢查您的網路連線'
      } else {
        errorMessage = err.message || '發生未知錯誤'
      }
      
      error.value = errorMessage
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      isCreatingWebsite.value = false
    }
  }

  /**
   * 獲取所有需要的資料
   */
  const fetchAllCategories = async (templeId) => {
    if (!templeId) {
      console.error('fetchAllCategories: templeId is required')
      return { layer1: [] }
    }

    try {
      console.log('獲取所有類別，宮廟 ID:', templeId)
      const l1 = await fetchLayer1Categories(templeId)
      
      return {
        layer1: l1
      }
    } catch (err) {
      console.error('獲取所有類別失敗:', err)
      return { layer1: [] }
    }
  }

  /**
   * 根據 ID 獲取類別資訊
   */
  const getCategoryById = (categoryId) => {
    return layer1Categories.value.find(cat => cat.id === categoryId) || null
  }

  /**
   * 根據子分類 ID 獲取子分類資訊
   */
  const getSubCategoryById = (subCategoryId) => {
    if (!selectedCategoryDetail.value || !selectedCategoryDetail.value.sub_categories) {
      return null
    }
    
    const subCat = selectedCategoryDetail.value.sub_categories.find(
      sub => sub.sub_category_id === subCategoryId
    )
    
    if (subCat) {
      return {
        id: subCat.sub_category_id,
        name: subCat.sub_category_name,
        parentId: selectedCategoryDetail.value.id,
        parentName: selectedCategoryDetail.value.name
      }
    }
    
    return null
  }

  /**
   * 👇 新增：清除模板快取
   * @param {string} categoryId - 如果提供，只清除該分類的快取；否則清除所有快取
   */
  const clearTemplateCache = (categoryId = null) => {
    if (categoryId) {
      delete webTemplatesCache.value[categoryId]
      console.log(`已清除分類 ${categoryId} 的模板快取`)
    } else {
      webTemplatesCache.value = {}
      console.log('已清除所有模板快取')
    }
  }

  /**
   * 清空所有資料
   */
  const clearAll = () => {
    layer1Categories.value = []
    selectedCategoryDetail.value = null
    webTemplates.value = []
    webTemplatesCache.value = {} // 👈 也清空快取
    error.value = null
  }
    /**
     * 👇 新增：檢查宮廟是否已有網站
     * @param {string} templeId - 宮廟 ID
     * @returns {Promise<boolean>} 是否已有網站
     */
    const checkWebsiteExists = async (templeId) => {
        if (!templeId) {
            console.error('checkWebsiteExists: templeId is required')
            return false
        }

        try {
            console.log('檢查網站是否存在，宮廟 ID:', templeId)
            const response = await axiosClient.get(`/tenant/${templeId}/web-site/exist`)
            
            console.log('檢查網站存在 API 回應:', response)
            
            if (response.status === 200 && response.data.data) {
            const exists = response.data.data.result === true
            console.log('網站是否存在:', exists)
            return exists
            }
            
            return false
        } catch (err) {
            console.error('檢查網站存在失敗:', err)
            return false
        }
    }
    /**
     * 👇 新增：檢查子網域是否可用
     * @param {string} templeId - 宮廟 ID
     * @param {string} subdomain - 子網域名稱
     * @returns {Promise<boolean>} 是否可用（true = 可用，false = 已被使用）
     */
    const checkSubdomainAvailable = async (templeId, subdomain) => {
        if (!templeId || !subdomain) {
            console.error('checkSubdomainAvailable: templeId and subdomain are required')
            return false
        }

        try {
            console.log('檢查子網域是否可用，宮廟 ID:', templeId, '子網域:', subdomain)
            const response = await axiosClient.get(
            `/tenant/${templeId}/web-site/check-subdomain`,
            {
                params: { subdomain }
            }
            )
            
            console.log('檢查子網域 API 回應:', response)
            
            if (response.status === 200 && response.data.data) {
            const isAvailable = response.data.data.result === true
            console.log('子網域是否可用:', isAvailable)
            return isAvailable
            }
            
            return false
        } catch (err) {
            console.error('檢查子網域失敗:', err)
            return false
        }
    }
  // ==================== Return ====================

  return {
    // State
    layer1Categories: computed(() => layer1Categories.value),
    selectedCategoryDetail: computed(() => selectedCategoryDetail.value),
    webTemplates: computed(() => webTemplates.value),
    isLoadingL1: computed(() => isLoadingL1.value),
    isLoadingDetail: computed(() => isLoadingDetail.value),
    isLoadingTemplates: computed(() => isLoadingTemplates.value),
    isCreatingWebsite: computed(() => isCreatingWebsite.value),
    error: computed(() => error.value),
    
    // Computed
    formattedLayer1,
    formattedSubCategories,
    formattedWebTemplates,
    
    // Methods
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
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosClient from '../axios'

export const usePageEditorStore = defineStore('pageEditor', () => {
  // ==================== State ====================

  const tenantId = ref(null)
  const headerTabs = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const currentPageSlug = ref(null)

  const locales = ref([])
  const currentLocale = ref('ZH-TW')

  const pageData = ref({})
  const systemFrames = ref({})

  const selected = ref({
    basemap: null,
    frame: null,
    element: null,
    cell: null
  })

  const pendingDeleteFileIds = ref([])
  const websiteSettings = ref(null)
  const pageSeoData = ref({})

  // ==================== Computed ====================

  const currentPageBasemaps = computed(() => {
    return pageData.value[currentPageSlug.value]?.data || []
  })

  const currentPageSystemFrames = computed(() => {
    return systemFrames.value[currentPageSlug.value] || []
  })

  // ==================== 檔案刪除追蹤 ====================

  const markFileForDeletion = (fileId) => {
    if (!fileId) return
    if (!pendingDeleteFileIds.value.includes(fileId)) {
      pendingDeleteFileIds.value.push(fileId)
      console.log('標記待刪除 ID:', fileId, '| 目前清單:', pendingDeleteFileIds.value)
    }
  }

  const clearPendingDeleteFileIds = () => {
    console.log('清空待刪除清單，共', pendingDeleteFileIds.value.length, '個')
    pendingDeleteFileIds.value = []
  }

  // ==================== API ====================

  /**
   * GET /api/tenant/{tid}/web-site/draft-page/tab
   */
  const fetchHeaderTabs = async (tid, locale = null) => {
    if (!tid) return []

    isLoading.value = true
    error.value = null

    try {
      const response = await axiosClient.get(`/tenant/${tid}/web-site/draft-page/tab`, {
        params: { locale: locale || currentLocale.value }
      })
      const result = response.data

      if (result.statusCode === 200 && result.data) {
        headerTabs.value = result.data
        tenantId.value = tid
        return result.data
      }
      throw new Error(result.message || '載入失敗')
    } catch (err) {
      console.error('Header Tabs 失敗:', err)
      error.value = err.message
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * GET /api/tenant/{tid}/web-site/locale
   */
  const fetchLocales = async (tid) => {
    if (!tid) return []

    isLoading.value = true
    error.value = null

    try {
      const response = await axiosClient.get(`/tenant/${tid}/web-site/locale`)
      const result = response.data

      if (result.statusCode === 200 && result.data) {
        locales.value = result.data

        if (result.data.length > 0 && !currentLocale.value) {
          currentLocale.value = result.data[0].locale
        }

        return result.data
      }
      throw new Error(result.message || '載入語言清單失敗')
    } catch (err) {
      console.error('載入語言清單失敗:', err)
      error.value = err.message
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * GET /api/tenant/{tid}/web-site/draft-page/{slug}/system-frame
   */
  const fetchSystemFrames = async (tid, slug) => {
    if (!tid || !slug) {
      console.warn('fetchSystemFrames: 缺少 tid 或 slug')
      return []
    }

    try {
      const response = await axiosClient.get(`/tenant/${tid}/web-site/draft-page/${slug}/system-frame`)
      const result = response.data

      if (result.statusCode === 200 && Array.isArray(result.data)) {
        systemFrames.value[slug] = result.data
        return result.data
      }

      throw new Error(result.message || '載入系統框架失敗')
    } catch (err) {
      console.error(`載入系統框架失敗 (${slug}):`, err)
      systemFrames.value[slug] = []
      return []
    }
  }

  /**
   * GET /api/tenant/{tid}/web-site/all-draft-page
   * 一次抓所有頁面的草稿內容
   * 回傳格式：[{ slug, contentJson: [...basemaps] }, ...]
   */
  const fetchAllPages = async (tid, locale = null) => {
    if (!tid) return null

    const targetLocale = locale || currentLocale.value

    isLoading.value = true
    error.value = null

    try {
      console.log(`載入所有頁面 (${targetLocale})`)

      const response = await axiosClient.get(`/tenant/${tid}/web-site/all-draft-page`, {
        params: { locale: targetLocale }
      })
      const result = response.data

      if (result.statusCode === 200 && Array.isArray(result.data)) {
        result.data.forEach(page => {
          pageData.value[page.slug] = { data: page.contentJson }
        })
        console.log('所有頁面已載入:', result.data.map(p => p.slug))
        return result.data
      }
      throw new Error(result.message || '載入失敗')
    } catch (err) {
      console.error('載入所有頁面失敗:', err)
      error.value = err.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * PATCH /api/tenant/{tid}/web-site/all-draft-page
   * 一次儲存所有頁面的草稿內容
   */
  const saveAllPages = async (tid) => {
    if (!tid) {
      console.error('缺少必要參數')
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      console.log('儲存所有頁面...')

      const allPageContentJson = Object.entries(pageData.value).map(([slug, val]) => ({
        slug,
        contentJson: validateAndFixContent(val.data)
      }))

      const requestBody = {
        locale: currentLocale.value,
        deleteFileIds: [...pendingDeleteFileIds.value],
        allPageContentJson
      }

      const jsonString = JSON.stringify(requestBody)
      const sizeInMB = (jsonString.length / 1024 / 1024).toFixed(2)
      console.log('資料大小:', sizeInMB, 'MB')

      const maxSizeMB = 10
      if (jsonString.length > maxSizeMB * 1024 * 1024) {
        const errorMsg = `資料量太大 (${sizeInMB} MB)，超過限制 (${maxSizeMB} MB)。`
        console.error(errorMsg)
        error.value = errorMsg
        alert(errorMsg)
        return false
      }

      console.log('發送 PATCH /all-draft-page...')
      const response = await axiosClient.patch(`/tenant/${tid}/web-site/all-draft-page`, requestBody)
      const result = response.data

      if (result.statusCode === 200) {
        console.log('所有頁面儲存成功！')
        clearPendingDeleteFileIds()

        if (Array.isArray(result.data)) {
          result.data.forEach(page => {
            pageData.value[page.slug] = { data: page.contentJson }
          })
          console.log('編輯器資料已用 API 回傳更新')
        }

        clearSelection()
        return true
      }

      throw new Error(result.message || '儲存失敗')
    } catch (err) {
      console.error('儲存失敗:', err)
      error.value = err.message || '儲存失敗，請稍後再試'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 驗證和修正內容數據
   */
  const validateAndFixContent = (basemaps) => {
    if (!Array.isArray(basemaps)) {
      console.error('basemaps 不是陣列')
      return []
    }

    return basemaps.map((basemap) => {
      if (!Array.isArray(basemap.frames)) {
        basemap.frames = []
      }

      basemap.frames = basemap.frames.map((frame) => {
        if (!frame.data) {
          frame.data = {}
        }

        if (frame.type === 'CAROUSEL_WALL') {
          if (!Array.isArray(frame.data.caroiselWallImgs)) {
            frame.data.caroiselWallImgs = []
          }
        }

        if (frame.type === 'INDEX_NEWS') {
          if (!Array.isArray(frame.data.posts)) {
            frame.data.posts = []
          }
        }

        if (frame.type === 'INDEX_EVENT') {
          if (!Array.isArray(frame.data.events)) {
            frame.data.events = []
          }
        }

        if (frame.type === 'INDEX_PRODUCT') {
          if (!Array.isArray(frame.data.products)) {
            frame.data.products = []
          }
        }

        if (frame.type === 'HEADER') {
          if (!Array.isArray(frame.data.tabs)) {
            frame.data.tabs = []
          }
        }

        if (!Array.isArray(frame.elements)) {
          frame.elements = []
        }

        frame.elements = frame.elements.map((element) => {
          if (!element) return null

          if (!element.value) {
            element.value = {}
          }

          if (element.type === 'CAROUSEL_IMG') {
            if (!Array.isArray(element.value.imgs)) element.value.imgs = []
            if (typeof element.value.autoPlay !== 'boolean') element.value.autoPlay = true
            if (typeof element.value.interval !== 'number') element.value.interval = 3000
            if (typeof element.value.height !== 'number') element.value.height = 400
          }

          return element
        }).filter(el => el !== null)

        return frame
      })

      return basemap
    })
  }

  // ==================== 頁面切換 ====================

  const setTenantId = (tid) => {
    tenantId.value = tid
  }

  /**
   * 初始化頁面
   * 有資料就直接切，沒資料才打 fetchAllPages
   */
  const initializePage = async (slug, locale = null) => {
    if (!tenantId.value) {
      console.error('缺少租戶 ID')
      return
    }

    // 有資料且不是語言切換，直接切換 slug
    if (Object.keys(pageData.value).length > 0 && !locale) {
      currentPageSlug.value = slug

      if (!systemFrames.value[slug]) {
        await fetchSystemFrames(tenantId.value, slug)
      }
      return
    }

    // 首次載入或語言切換：抓全部頁面
    const data = await fetchAllPages(tenantId.value, locale)
    if (data) {
      currentPageSlug.value = slug
      await fetchSystemFrames(tenantId.value, slug)
    }
  }

  /**
   * 切換頁面（不打 API，直接從已載入的資料切換）
   */
  const switchPage = async (slug) => {
    clearSelection()
    currentPageSlug.value = slug

    if (!systemFrames.value[slug]) {
      await fetchSystemFrames(tenantId.value, slug)
    }
  }

  /**
   * 語言切換時重新載入所有頁面
   */
  const reloadCurrentPage = async (newLocale) => {
    if (!currentPageSlug.value) {
      console.warn('沒有當前頁面')
      return
    }

    console.log(`重新載入所有頁面 (${newLocale})`)

    currentLocale.value = newLocale
    clearSelection()

    // 清掉舊資料，強制重新抓
    pageData.value = {}

    const data = await fetchAllPages(tenantId.value, newLocale)
    if (data) {
      syncHeaderMenuFromTabs()
    }

    console.log('所有頁面已重新載入')
  }

  /**
   * 切換頁面並確保資料已載入
   */
  const switchPageWithLocale = async (slug, locale) => {
    clearSelection()
    currentPageSlug.value = slug

    // 沒有資料才打 API
    if (Object.keys(pageData.value).length === 0) {
      await fetchAllPages(tenantId.value, locale)
    }

    if (!systemFrames.value[slug]) {
      await fetchSystemFrames(tenantId.value, slug)
    }
  }

  // ==================== 選擇狀態 ====================

  const selectBasemap = (basemap) => {
    selected.value = { basemap, frame: null, element: null, cell: null }
  }

  const selectFrame = (frame) => {
    selected.value = { basemap: null, frame, element: null, cell: null }
  }

  const selectElement = (element) => {
    selected.value = { basemap: null, frame: null, element, cell: null }
  }

  const selectCell = (cellData) => {
    selected.value = { basemap: null, frame: null, element: null, cell: cellData }
    console.log('Store: 選中格子', cellData)
  }

  const clearSelection = () => {
    selected.value = { basemap: null, frame: null, element: null, cell: null }
  }

  // ==================== Header ====================

  const updateHeaderLogo = (logoSrc, logoId) => {
    const basemaps = currentPageBasemaps.value
    const headerBasemap = basemaps.find(b => b.bgType === 'HEADER')

    if (headerBasemap?.frames?.[0]) {
      if (!headerBasemap.frames[0].data) {
        headerBasemap.frames[0].data = {}
      }
      headerBasemap.frames[0].data.logoImgSrc = logoSrc
      headerBasemap.frames[0].data.logoImgId = logoId
    }
  }

  const syncHeaderMenuFromTabs = () => {
    const basemaps = currentPageBasemaps.value
    const headerBasemap = basemaps.find(b => b.bgType === 'HEADER')

    if (headerBasemap?.frames?.[0]) {
      if (!headerBasemap.frames[0].data) headerBasemap.frames[0].data = {}
      headerBasemap.frames[0].data.tabs = headerTabs.value.map(tab => ({
        name: tab.name,
        slug: tab.slug
      }))
    }
  }

  // ==================== 儲存 ====================

  const saveCurrentPage = async () => {
    return await saveAllPages(tenantId.value)
  }

  // ==================== 底圖操作 ====================

  const addBasemap = (insertIndex) => {
    const basemaps = currentPageBasemaps.value
    const actualIndex = insertIndex + 1
    const maxSequence = basemaps.reduce((max, b) => Math.max(max, b.bgSequence || 0), 0)
    const newSequence = maxSequence + 1

    const newBasemap = {
      bgSequence: newSequence,
      bgPcImgSrc: null,
      bgPcImgId: null,
      bgTabletImgSrc: null,
      bgTabletImgId: null,
      bgPhoneImgSrc: null,
      bgPhoneImgId: null,
      bgIsDeletable: true,
      bgAllowMultipleFrames: true,
      bgCanChangeImg: true,
      bgType: 'CONTENT',
      frames: []
    }

    basemaps.splice(actualIndex, 0, newBasemap)
    console.log(`在索引 ${insertIndex} 之後新增底圖`)
  }

  const deleteBasemap = (index) => {
    const basemaps = currentPageBasemaps.value

    if (index < 0 || index >= basemaps.length) {
      console.error('無效的底圖索引')
      return false
    }

    const basemap = basemaps[index]

    if (!basemap.bgIsDeletable) {
      console.error('此底圖不可刪除')
      return false
    }

    markFileForDeletion(basemap.bgPcImgId)
    markFileForDeletion(basemap.bgTabletImgId)
    markFileForDeletion(basemap.bgPhoneImgId)

    basemaps.splice(index, 1)
    clearSelection()
    return true
  }

  const moveBasemapUp = (index) => {
    const basemaps = currentPageBasemaps.value

    if (index <= 0 || index >= basemaps.length) return false

    const basemap = basemaps[index]
    if (basemap.bgType === 'HEADER' || basemap.bgType === 'FOOTER') return false
    if (basemaps[index - 1].bgType === 'HEADER') return false

    const temp = basemaps[index]
    basemaps[index] = basemaps[index - 1]
    basemaps[index - 1] = temp
    return true
  }

  const moveBasemapDown = (index) => {
    const basemaps = currentPageBasemaps.value

    if (index < 0 || index >= basemaps.length - 1) return false

    const basemap = basemaps[index]
    if (basemap.bgType === 'HEADER' || basemap.bgType === 'FOOTER') return false
    if (basemaps[index + 1].bgType === 'FOOTER') return false

    const temp = basemaps[index]
    basemaps[index] = basemaps[index + 1]
    basemaps[index + 1] = temp
    return true
  }

  // ==================== 重置 ====================

  const resetStore = () => {
    tenantId.value = null
    headerTabs.value = []
    isLoading.value = false
    error.value = null
    currentPageSlug.value = null
    pageData.value = {}
    systemFrames.value = {}
    locales.value = []
    selected.value = { basemap: null, frame: null, element: null, cell: null }
    pendingDeleteFileIds.value = []
    websiteSettings.value = null
  }

  // ==================== 網站設定 ====================

  const fetchWebsiteSettings = async (tid) => {
    if (!tid) {
      error.value = '缺少宮廟 ID'
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await axiosClient.get(`/tenant/${tid}/web-site/`)
      const result = response.data

      if (result.statusCode === 200 && result.data) {
        websiteSettings.value = result.data
        return result.data
      }

      const errorMsg = result.message || '載入設定失敗'
      error.value = errorMsg
      return null
    } catch (err) {
      error.value = err.message || '網路連線失敗'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const updateWebsiteSettings = async (tid, settingsData) => {
    if (!tid || !settingsData || typeof settingsData !== 'object') {
      error.value = '缺少必要參數'
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await axiosClient.patch(`/tenant/${tid}/web-site/`, settingsData)
      const result = response.data

      if (result.statusCode === 200) {
        if (result.data) {
          websiteSettings.value = result.data
        }
        return true
      }

      error.value = result.message || '保存設定失敗'
      return false
    } catch (err) {
      error.value = err.message || '網路連線失敗'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // ==================== 發布 ====================

  const publishWebsite = async (tid, locale) => {
    if (!tid || !locale) {
      error.value = '缺少必要參數'
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await axiosClient.patch(`/tenant/${tid}/web-site/publish`, { locale })
      const result = response.data

      if (result.statusCode === 200) {
        return true
      }

      error.value = result.message || '發布失敗'
      return false
    } catch (err) {
      error.value = err.message || '網路連線失敗'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // ==================== 上傳圖片 ====================

  const uploadImage = async (file, tid = null) => {
    const targetTid = tid || tenantId.value

    if (!targetTid || !file) {
      error.value = '缺少必要參數'
      return null
    }

    if (file.size > 10 * 1024 * 1024) {
      error.value = '圖片大小不能超過 10MB'
      return null
    }

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axiosClient.post(
        `/tenant/${targetTid}/web-site/draft-page/file`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      const result = response.data

      if (result.statusCode === 200 && result.data && result.data.length > 0) {
        const uploadedFile = result.data[0]
        return {
          id: uploadedFile.id,
          fileUrl: uploadedFile.publicFileUrl,
          fileName: uploadedFile.fileName,
          originalName: uploadedFile.originalName,
          size: uploadedFile.size
        }
      }

      error.value = result.message || '上傳失敗'
      return null
    } catch (err) {
      error.value = err.message || '上傳失敗'
      return null
    }
  }

  // ==================== 刪除草稿 ====================

  const deleteDraft = async (slug, tid = null) => {
    const targetTid = tid || tenantId.value

    if (!targetTid || !slug) {
      error.value = '缺少必要參數'
      return false
    }

    try {
      isLoading.value = true
      error.value = null

      const response = await axiosClient.delete(`/tenant/${targetTid}/web-site/draft-page/${slug}`, {
        data: { locale: currentLocale.value || 'any' }
      })
      const result = response.data

      if (result.statusCode === 200) {
        // 刪除後重新抓所有頁面
        pageData.value = {}
        await fetchAllPages(targetTid, currentLocale.value)
        isLoading.value = false
        return true
      }

      error.value = result.message || '刪除失敗'
      isLoading.value = false
      return false
    } catch (err) {
      error.value = err.message || '刪除草稿失敗'
      isLoading.value = false
      return false
    }
  }

  // ==================== SEO ====================

  const fetchPageSeo = async (tid, slug) => {
    if (!tid || !slug) {
      error.value = '缺少必要參數'
      return null
    }

    try {
      const response = await axiosClient.get(`/tenant/${tid}/web-site/page/seo/${slug}`)
      const result = response.data

      if (result.statusCode === 200 && result.data) {
        pageSeoData.value[slug] = result.data
        return result.data
      }

      error.value = result.message || '載入 SEO 失敗'
      return null
    } catch (err) {
      error.value = err.message || '網路連線失敗'
      return null
    }
  }

  const updatePageSeo = async (tid, seoData) => {
    if (!tid || !seoData?.slug) {
      error.value = '缺少必要資料'
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await axiosClient.patch(`/tenant/${tid}/web-site/page/seo`, seoData)
      const result = response.data

      if (result.statusCode === 200) {
        if (result.data) {
          pageSeoData.value[seoData.slug] = result.data
        }
        return true
      }

      error.value = result.message || '保存 SEO 失敗'
      return false
    } catch (err) {
      error.value = err.message || '網路連線失敗'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // ==================== Return ====================

  return {
    tenantId,
    headerTabs,
    isLoading,
    error,
    currentPageSlug,
    pageData,
    selected,
    currentPageBasemaps,
    currentPageSystemFrames,
    locales,
    currentLocale,
    pendingDeleteFileIds,
    websiteSettings,
    pageSeoData,
    fetchHeaderTabs,
    fetchLocales,
    fetchSystemFrames,
    fetchAllPages,
    saveAllPages,
    saveCurrentPage,
    setTenantId,
    initializePage,
    switchPage,
    reloadCurrentPage,
    switchPageWithLocale,
    selectBasemap,
    selectFrame,
    selectElement,
    selectCell,
    clearSelection,
    updateHeaderLogo,
    syncHeaderMenuFromTabs,
    addBasemap,
    deleteBasemap,
    moveBasemapUp,
    moveBasemapDown,
    resetStore,
    fetchWebsiteSettings,
    updateWebsiteSettings,
    publishWebsite,
    uploadImage,
    deleteDraft,
    markFileForDeletion,
    clearPendingDeleteFileIds,
    fetchPageSeo,
    updatePageSeo,
  }
})
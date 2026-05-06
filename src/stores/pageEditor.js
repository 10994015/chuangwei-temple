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

  const websiteSettings = ref(null)
  const pageSeoData = ref({})

  // 是否為模板套用模式（尚未儲存，等待 user 按儲存）
  const isTemplateMode = ref(false)


  // ==================== Computed ====================

  const currentPageBasemaps = computed(() => {
    return pageData.value[currentPageSlug.value]?.data || []
  })

  const currentPageSystemFrames = computed(() => {
    return systemFrames.value[currentPageSlug.value] || []
  })

  // ==================== 從頁面資料同步 headerTabs ====================

  const syncHeaderTabsFromPageData = (pages) => {
    if (!Array.isArray(pages) || pages.length === 0) return

    for (const page of pages) {
      const headerBasemap = page.contentJson?.find(
        b => b.bgType === 'HEADER' || b.bgType === 'PV_HEADER'
      )
      const headerFrame = headerBasemap?.frames?.[0]
      if (headerFrame?.data?.tabs && Array.isArray(headerFrame.data.tabs) && headerFrame.data.tabs.length > 0) {
        headerTabs.value = headerFrame.data.tabs
        return
      }
    }
  }

  // ==================== API ====================

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
    if (!tid || !slug) return []

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

  const fetchTemplateSystemFrames = async (templateId, slug) => {
    if (!templateId || !slug) return []

    try {
      const response = await axiosClient.get(`/backend/web-template/${templateId}/draft-page/${slug}/system-frame`)
      const result = response.data

      if (result.statusCode === 200 && Array.isArray(result.data)) {
        systemFrames.value[slug] = result.data
        return result.data
      }

      throw new Error(result.message || '載入模板系統框架失敗')
    } catch (err) {
      console.error(`載入模板系統框架失敗 (${slug}):`, err)
      systemFrames.value[slug] = []
      return []
    }
  }

  const fetchFrontendTemplateSystemFrames = async (templateId, slug) => {
    if (!templateId || !slug) return []

    try {
      const response = await axiosClient.get(`/frontend/web-template/${templateId}/draft-page/${slug}/system-frame`)
      const result = response.data

      if (result.statusCode === 200 && Array.isArray(result.data)) {
        systemFrames.value[slug] = result.data
        return result.data
      }

      throw new Error(result.message || '載入前台模板系統框架失敗')
    } catch (err) {
      console.error(`載入前台模板系統框架失敗 (${slug}):`, err)
      systemFrames.value[slug] = []
      return []
    }
  }

  /**
   * GET /api/tenant/{tid}/web-site/all-draft-page
   */
  const fetchAllPages = async (tid, locale = null) => {
    if (!tid) return null

    const targetLocale = locale || currentLocale.value

    isLoading.value = true
    error.value = null

    try {
      const response = await axiosClient.get(`/tenant/${tid}/web-site/all-draft-page`, {
        params: { locale: targetLocale }
      })
      const result = response.data
      console.log('[fetchAllPages] API 回傳資料:', JSON.parse(JSON.stringify(result)))

      if (result.statusCode === 200 && Array.isArray(result.data)) {
        result.data.forEach(page => {
          pageData.value[page.slug] = { data: page.contentJson }
        })


        syncHeaderTabsFromPageData(result.data)

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
   * POST /api/tenant/{tid}/web-site/temp-content
   * 套用模板到編輯器，回傳所有頁面 JSON，直接塞進 store，不儲存，等 user 按儲存
   */
  const loadTemplateAsEditorData = async (tid, webTemplateId) => {
    if (!tid || !webTemplateId) return false

    isLoading.value = true
    error.value = null

    try {
      const response = await axiosClient.post(`/tenant/${tid}/web-site/temp-content`, {
        webTemplateId
      })
      const result = response.data

      if (result.statusCode !== 200 || !Array.isArray(result.data)) {
        throw new Error(result.message || '套用模板失敗')
      }

      result.data.forEach(page => {
        pageData.value[page.slug] = { data: page.contentJson }
      })

      syncHeaderTabsFromPageData(result.data)
      isTemplateMode.value = true

      return result.data
    } catch (err) {
      error.value = err.message || '套用模板失敗'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * PATCH /api/tenant/{tid}/web-site/all-draft-page
   */
  const saveAllPages = async (tid) => {
    if (!tid) {
      console.error('缺少必要參數')
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const allPageContentJson = Object.entries(pageData.value).map(([slug, val]) => ({
        slug,
        contentJson: validateAndFixContent(val.data)
      }))

      const requestBody = {
        locale: currentLocale.value,
        allPageContentJson
      }

      const jsonString = JSON.stringify(requestBody)
      const sizeInMB = (jsonString.length / 1024 / 1024).toFixed(2)
      console.log('[saveAllPages] 發送 JSON:', JSON.parse(jsonString))

      const maxSizeMB = 10
      if (jsonString.length > maxSizeMB * 1024 * 1024) {
        const errorMsg = `資料量太大 (${sizeInMB} MB)，超過限制 (${maxSizeMB} MB)。`
        error.value = errorMsg
        alert(errorMsg)
        return false
      }

      const response = await axiosClient.patch(`/tenant/${tid}/web-site/all-draft-page`, requestBody)
      const result = response.data

      if (result.statusCode === 200) {
        isTemplateMode.value = false

        if (Array.isArray(result.data)) {
          result.data.forEach(page => {
            pageData.value[page.slug] = { data: page.contentJson }
          })
          syncHeaderTabsFromPageData(result.data)
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

  const validateAndFixContent = (basemaps) => {
    if (!Array.isArray(basemaps)) return []

    return basemaps.map((basemap) => {
      if (!Array.isArray(basemap.frames)) basemap.frames = []

      basemap.frames = basemap.frames.map((frame) => {
        if (!frame.data) frame.data = {}

        if (frame.type === 'CAROUSEL_WALL') {
          if (!Array.isArray(frame.data.caroiselWallImgs)) frame.data.caroiselWallImgs = []
        }
        if (frame.type === 'INDEX_NEWS') {
          if (!Array.isArray(frame.data.posts)) frame.data.posts = []
        }
        if (frame.type === 'INDEX_EVENT') {
          if (!Array.isArray(frame.data.events)) frame.data.events = []
        }
        if (frame.type === 'INDEX_PRODUCT') {
          if (!Array.isArray(frame.data.products)) frame.data.products = []
        }
        if (frame.type === 'HEADER') {
          if (!Array.isArray(frame.data.tabs)) frame.data.tabs = []
        }
        if (frame.type === 'PV_CUSTOM_FRAME1') {
          if (!Array.isArray(frame.data.items)) {
            frame.data.items = [
              { title: '宮廟地圖',     description: '', image: null, imageId: null },
              { title: '靈籤司',       description: '', image: null, imageId: null },
              { title: '主平台服務',   description: '', image: null, imageId: null },
              { title: '宮廟網站建置', description: '', image: null, imageId: null },
            ]
          }
        }
        if (frame.type === 'PV_PORTAL_PICTURE') {
          if (!Array.isArray(frame.data.buttons)) frame.data.buttons = []
          if (frame.data.heroTitle == null) frame.data.heroTitle = '在宮掌櫃，\n遇見你的神明'
          if (frame.data.brandName == null) frame.data.brandName = ''
          frame.data.bgColor = 'transparent'
        }
        if (!Array.isArray(frame.elements)) frame.elements = []

        frame.elements = frame.elements.map((element) => {
          if (!element) return null
          if (!element.value) element.value = {}

          if (element.type === 'CAROUSEL_IMG') {
            if (!Array.isArray(element.value.imgs)) element.value.imgs = []
            if (typeof element.value.autoPlay !== 'boolean') element.value.autoPlay = true
            if (typeof element.value.interval !== 'number') element.value.interval = 3000
            if (typeof element.value.height !== 'number') element.value.height = 400
          }

          // 將舊版扁平 padding { top,right,bottom,left } 升級為巢狀結構 { pc, tablet, phone }
          if (element.padding && element.padding.pc === undefined) {
            const flat = element.padding
            const sides = { top: flat.top ?? 20, right: flat.right ?? 20, bottom: flat.bottom ?? 20, left: flat.left ?? 20 }
            element.padding = { pc: { ...sides }, tablet: { ...sides }, phone: { ...sides } }
          }
          if (!element.padding) {
            element.padding = {
              pc:     { top: 20, right: 20, bottom: 20, left: 20 },
              tablet: { top: 20, right: 20, bottom: 20, left: 20 },
              phone:  { top: 20, right: 20, bottom: 20, left: 20 },
            }
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

  const initializePage = async (slug, locale = null) => {
    if (!tenantId.value) return

    if (Object.keys(pageData.value).length > 0 && !locale) {
      currentPageSlug.value = slug
      if (!systemFrames.value[slug]) {
        await fetchSystemFrames(tenantId.value, slug)
      }
      return
    }

    const data = await fetchAllPages(tenantId.value, locale)
    if (data) {
      currentPageSlug.value = slug
      await fetchSystemFrames(tenantId.value, slug)
    }
  }

  const switchPage = async (slug) => {
    clearSelection()
    currentPageSlug.value = slug

    if (!systemFrames.value[slug]) {
      await fetchSystemFrames(tenantId.value, slug)
    }
  }

  const reloadCurrentPage = async (newLocale) => {
    if (!currentPageSlug.value) return

    currentLocale.value = newLocale
    clearSelection()
    pageData.value = {}

    await fetchAllPages(tenantId.value, newLocale)
  }

  const switchPageWithLocale = async (slug, locale) => {
    clearSelection()
    currentPageSlug.value = slug

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
  }

  const clearSelection = () => {
    selected.value = { basemap: null, frame: null, element: null, cell: null }
  }

  // ==================== Header ====================

  // 遍歷所有頁面的 HEADER frame 並執行 callback
  const forEachHeaderFrame = (callback) => {
    Object.values(pageData.value).forEach(page => {
      const headerBasemap = (page.data || []).find(b => b.bgType === 'HEADER')
      if (headerBasemap?.frames?.[0]) {
        if (!headerBasemap.frames[0].data) headerBasemap.frames[0].data = {}
        callback(headerBasemap, headerBasemap.frames[0])
      }
    })
  }

  // 同步 logo 到所有頁面的 HEADER
  const updateHeaderLogo = (logoSrc, logoId) => {
    let count = 0
    forEachHeaderFrame((_basemap, frame) => {
      frame.data.logoImgSrc = logoSrc
      frame.data.logoImgId = logoId
      count++
    })
    console.log(`[updateHeaderLogo] 同步到 ${count} 個頁面，logoId=${logoId}, logoSrc=${logoSrc}`)
  }

  // 清除所有頁面 HEADER 的 logo
  const clearHeaderLogo = () => {
    forEachHeaderFrame((_basemap, frame) => {
      frame.data.logoImgSrc = null
      frame.data.logoImgId = null
    })
  }

  // 同步 header 底圖到所有頁面的 HEADER basemap
  const syncAllHeaderBackground = (type, src, id) => {
    Object.values(pageData.value).forEach(page => {
      const headerBasemap = (page.data || []).find(b => b.bgType === 'HEADER')
      if (!headerBasemap) return
      switch (type) {
        case 'desktop':
          headerBasemap.bgPcImgSrc = src
          headerBasemap.bgPcImgId  = id
          break
        case 'tablet':
          headerBasemap.bgTabletImgSrc = src
          headerBasemap.bgTabletImgId  = id
          break
        case 'mobile':
          headerBasemap.bgPhoneImgSrc = src
          headerBasemap.bgPhoneImgId  = id
          break
      }
    })
  }

  const syncHeaderMenuFromTabs = () => {}

  // ==================== 儲存 ====================

  const saveCurrentPage = async () => {
    return await saveAllPages(tenantId.value)
  }

  // ==================== 底圖操作 ====================

  const addBasemap = (insertIndex) => {
    const basemaps = currentPageBasemaps.value
    const actualIndex = insertIndex + 1
    const newBasemap = {
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
  }

  const deleteBasemap = (index) => {
    const basemaps = currentPageBasemaps.value

    if (index < 0 || index >= basemaps.length) return false

    const basemap = basemaps[index]
    if (!basemap.bgIsDeletable) return false

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
    websiteSettings.value = null
    isTemplateMode.value = false
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

      error.value = result.message || '載入設定失敗'
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
        if (result.data) websiteSettings.value = result.data
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

      if (result.statusCode === 200) return true

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
        if (result.data) pageSeoData.value[seoData.slug] = result.data
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
    websiteSettings,
    pageSeoData,
    isTemplateMode,
    fetchLocales,
    fetchSystemFrames,
    fetchTemplateSystemFrames,
    fetchFrontendTemplateSystemFrames,
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
    clearHeaderLogo,
    syncAllHeaderBackground,
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
    fetchPageSeo,
    updatePageSeo,
    loadTemplateAsEditorData,
  }
})
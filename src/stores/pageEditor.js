import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * PageEditor Store
 * 直接使用 API 返回的數據結構，不做任何轉換
 */
export const usePageEditorStore = defineStore('pageEditor', () => {
  // ==================== State ====================
  
  const tenantId = ref(null)
  const headerTabs = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const currentPageSlug = ref(null)
  
  // 語言相關
  const locales = ref([])  // 語言清單
  const currentLocale = ref('ZH-TW')  // 當前語言
  
  // 頁面數據，直接使用 API 格式：{ slug: { data: [...] } }
  const pageData = ref({})
  
  // 選擇狀態
  const selected = ref({
    basemap: null,
    frame: null,
    element: null
  })

  // ==================== Computed ====================
  
  // 當前頁面的 basemaps（就是 API 返回的 data 陣列）
  const currentPageBasemaps = computed(() => {
    return pageData.value[currentPageSlug.value]?.data || []
  })

  // ==================== API Functions ====================
  
  /**
   * GET /api/tenant/{tid}/web-site/draft-page/tab
   */
  const fetchHeaderTabs = async (tid) => {
    if (!tid) return []

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`/api/tenant/${tid}/web-site/draft-page/tab`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const result = await response.json()

      if (result.statusCode === 200 && result.data) {
        headerTabs.value = result.data
        tenantId.value = tid
        console.log('✓ Header Tabs:', result.data)
        return result.data
      }
      throw new Error(result.message || '載入失敗')
    } catch (err) {
      console.error('❌ Header Tabs 失敗:', err)
      error.value = err.message
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * GET /api/tenant/{tid}/web-site/locale
   * 獲取語言清單
   */
  const fetchLocales = async (tid) => {
    if (!tid) return []

    isLoading.value = true
    error.value = null

    try {
      console.log('📥 載入語言清單...')
      
      const response = await fetch(`/api/tenant/${tid}/web-site/locale`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const result = await response.json()

      if (result.statusCode === 200 && result.data) {
        locales.value = result.data
        
        // 如果有語言清單，預設使用第一個
        if (result.data.length > 0 && !currentLocale.value) {
          currentLocale.value = result.data[0].locale
        }
        
        console.log('✓ 語言清單:', result.data)
        console.log('✓ 當前語言:', currentLocale.value)
        return result.data
      }
      throw new Error(result.message || '載入語言清單失敗')
    } catch (err) {
      console.error('❌ 載入語言清單失敗:', err)
      error.value = err.message
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * GET /api/tenant/{tid}/web-site/draft-page/{slug}
   * @param {string} tid - 租戶 ID
   * @param {string} slug - 頁面 slug
   * @param {string} locale - 語言代碼（可選，預設使用 currentLocale）
   */
  const fetchPageContent = async (tid, slug, locale = null) => {
    if (!tid || !slug) return null

    // 使用傳入的 locale 或當前的 currentLocale
    const targetLocale = locale || currentLocale.value

    isLoading.value = true
    error.value = null

    try {
      console.log(`📥 載入 ${slug} (${targetLocale})`)
      
      const response = await fetch(`/api/tenant/${tid}/web-site/draft-page/${slug}?locale=${targetLocale}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const result = await response.json()

      if (result.statusCode === 200 && result.data) {
        // 直接存儲 API 數據
        pageData.value[slug] = { data: result.data }
        console.log('✓ 載入成功:', slug, targetLocale)
        return result.data
      }
      throw new Error(result.message || '載入失敗')
    } catch (err) {
      console.error('❌ 載入失敗:', err)
      error.value = err.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 保存頁面內容
   * PATCH /api/tenant/{tid}/web-site/draft-page
   */
  const savePageContent = async (tid, slug) => {
    if (!tid || !slug || !pageData.value[slug]) {
      console.error('❌ 缺少必要參數')
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      console.log(`💾 保存頁面: ${slug}`)
      
      //   驗證和修正數據
      const contentJson = validateAndFixContent(pageData.value[slug].data)
      
      // 準備請求 body（符合 API 格式）
      const requestBody = {
        locale: currentLocale.value,  //   使用當前選擇的語言
        slug: slug,
        deleteFileIds: [],  // 要刪除的檔案 ID 陣列
        contentJson: contentJson  //   傳送驗證後的 basemaps 陣列
      }
      
      //   完整輸出送出的 JSON（格式化）
      console.log('📤 完整請求 JSON:')
      console.log(JSON.stringify(requestBody, null, 2))
      
      //   Debug: 檢查數據大小
      const jsonString = JSON.stringify(requestBody)
      const sizeInKB = (jsonString.length / 1024).toFixed(2)
      const sizeInMB = (jsonString.length / 1024 / 1024).toFixed(2)
      
      console.log('📊 數據大小分析:')
      console.log('  總大小:', sizeInKB, 'KB (', sizeInMB, 'MB )')
      console.log('  字元數:', jsonString.length)
      
      //   Debug: 檢查每個 basemap 的大小
      contentJson.forEach((basemap, index) => {
        const basemapString = JSON.stringify(basemap)
        const basemapSizeKB = (basemapString.length / 1024).toFixed(2)
        console.log(`  Basemap ${index} (${basemap.bg_type}):`, basemapSizeKB, 'KB')
        
        // 檢查每個 frame
        basemap.frames?.forEach((frame, fIndex) => {
          const frameString = JSON.stringify(frame)
          const frameSizeKB = (frameString.length / 1024).toFixed(2)
          console.log(`    Frame ${fIndex} (${frame.type}):`, frameSizeKB, 'KB')
          
          // 檢查 frame 中的大型數據
          if (frame.data) {
            Object.keys(frame.data).forEach(key => {
              const value = frame.data[key]
              if (typeof value === 'string' && value.length > 10000) {
                console.log(`      ⚠️ ${key}: ${(value.length / 1024).toFixed(2)} KB`)
              }
            })
          }
        })
      })
      
      // ⚠️ 如果數據太大，警告並停止
      const maxSizeMB = 10  // 資料庫限制（根據實際情況調整）
      if (jsonString.length > maxSizeMB * 1024 * 1024) {
        const errorMsg = `數據量太大 (${sizeInMB} MB)，超過限制 (${maxSizeMB} MB)。請減少圖片數量或壓縮圖片大小。`
        console.error('❌', errorMsg)
        error.value = errorMsg
        alert(errorMsg)
        return false
      }
      
      console.log('📤 發送 PATCH 請求...')
      
      const response = await fetch(`/api/tenant/${tid}/web-site/draft-page`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      console.log('📥 回應狀態:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ 保存失敗，回應:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log('📥 回應內容:', result)

      if (result.statusCode === 200) {
        console.log('  保存成功！')
        return true
      }
      
      throw new Error(result.message || '保存失敗')
      
    } catch (err) {
      console.error('❌ 保存失敗:', err)
      error.value = err.message || '保存失敗，請稍後再試'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 驗證和修正內容數據
   * 確保所有必要的欄位都存在且格式正確
   */
  const validateAndFixContent = (basemaps) => {
    if (!Array.isArray(basemaps)) {
      console.error('❌ basemaps 不是陣列')
      return []
    }

    return basemaps.map((basemap) => {
      // 確保 frames 是陣列
      if (!Array.isArray(basemap.frames)) {
        basemap.frames = []
      }

      // 修正每個 frame 的數據
      basemap.frames = basemap.frames.map((frame) => {
        // 確保 data 物件存在
        if (!frame.data) {
          frame.data = {}
        }

        // 修正 CAROUSEL_WALL 的數據結構
        if (frame.type === 'CAROUSEL_WALL') {
          if (!Array.isArray(frame.data.caroisel_wall_imgs)) {
            frame.data.caroisel_wall_imgs = []
            console.log('✓ 修正 CAROUSEL_WALL.caroisel_wall_imgs 為空陣列')
          }
        }

        // 修正 INDEX_NEWS 的數據結構
        if (frame.type === 'INDEX_NEWS') {
          if (!Array.isArray(frame.data.posts)) {
            frame.data.posts = []
            console.log('✓ 修正 INDEX_NEWS.posts 為空陣列')
          }
        }

        // 修正 INDEX_EVENT 的數據結構
        if (frame.type === 'INDEX_EVENT') {
          if (!Array.isArray(frame.data.events)) {
            frame.data.events = []
            console.log('✓ 修正 INDEX_EVENT.events 為空陣列')
          }
        }

        // 修正 INDEX_PRODUCT 的數據結構
        if (frame.type === 'INDEX_PRODUCT') {
          if (!Array.isArray(frame.data.products)) {
            frame.data.products = []
            console.log('✓ 修正 INDEX_PRODUCT.products 為空陣列')
          }
        }

        // 修正 HEADER 的數據結構
        if (frame.type === 'HEADER') {
          if (!Array.isArray(frame.data.tabs)) {
            frame.data.tabs = []
            console.log('✓ 修正 HEADER.tabs 為空陣列')
          }
        }

        // 確保 elements 是陣列
        if (!Array.isArray(frame.elements)) {
          frame.elements = []
        }

        // 修正每個 element 的數據
        frame.elements = frame.elements.map((element) => {
          if (!element) return null

          // 確保 value 物件存在
          if (!element.value) {
            element.value = {}
          }

          // 修正 CAROUSEL 元件的數據
          if (element.type === 'CAROUSEL') {
            if (!Array.isArray(element.value.images)) {
              element.value.images = []
              console.log('✓ 修正 CAROUSEL.images 為空陣列')
            }
            if (typeof element.value.autoPlay !== 'boolean') {
              element.value.autoPlay = true
            }
            if (typeof element.value.interval !== 'number') {
              element.value.interval = 3000
            }
            if (typeof element.value.height !== 'number') {
              element.value.height = 400
            }
          }

          return element
        }).filter(el => el !== null)  // 移除 null 元素

        return frame
      })

      return basemap
    })
  }

  // ==================== Page Functions ====================
  
  const setTenantId = (tid) => {
    tenantId.value = tid
  }

  const initializePage = async (slug, locale = null) => {
    if (!tenantId.value) {
      console.error('❌ 缺少租戶 ID')
      return
    }

    // 如果已經載入過該頁面，直接切換（不重新載入）
    // 除非指定了 locale，則強制重新載入
    if (pageData.value[slug] && !locale) {
      currentPageSlug.value = slug
      return
    }

    const data = await fetchPageContent(tenantId.value, slug, locale)
    if (data) {
      currentPageSlug.value = slug
    }
  }

  const switchPage = async (slug) => {
    clearSelection()
    await initializePage(slug)
  }

  /**
   * 重新載入當前頁面（用於語言切換）
   */
  const reloadCurrentPage = async (newLocale) => {
    if (!currentPageSlug.value) {
      console.warn('⚠️ 沒有當前頁面')
      return
    }

    console.log(`🔄 重新載入頁面 ${currentPageSlug.value} (${newLocale})`)
    
    // 更新語言
    currentLocale.value = newLocale
    
    // 清除選擇
    clearSelection()
    
    // 強制重新載入當前頁面
    await initializePage(currentPageSlug.value, newLocale)
    
    // 重新同步 Header Menu
    syncHeaderMenuFromTabs()
    
    console.log('✓ 頁面已重新載入')
  }

  const selectBasemap = (basemap) => {
    selected.value = { basemap, frame: null, element: null }
  }

  const selectFrame = (frame) => {
    selected.value = { basemap: null, frame, element: null }
  }

  const selectElement = (element) => {
    selected.value = { basemap: null, frame: null, element }
  }

  const clearSelection = () => {
    selected.value = { basemap: null, frame: null, element: null }
  }

  const updateHeaderLogo = (logoSrc, logoId) => {
    const basemaps = currentPageBasemaps.value
    const headerBasemap = basemaps.find(b => b.bg_type === 'HEADER')
    
    if (headerBasemap?.frames?.[0]) {
      if (!headerBasemap.frames[0].data) headerBasemap.frames[0].data = {}
      headerBasemap.frames[0].data.logo_img_src = logoSrc
      headerBasemap.frames[0].data.logo_img_id = logoId
    }
  }

  const syncHeaderMenuFromTabs = () => {
    const basemaps = currentPageBasemaps.value
    const headerBasemap = basemaps.find(b => b.bg_type === 'HEADER')
    
    if (headerBasemap?.frames?.[0]) {
      if (!headerBasemap.frames[0].data) headerBasemap.frames[0].data = {}
      headerBasemap.frames[0].data.tabs = headerTabs.value.map(tab => ({
        name: tab.name,
        slug: tab.slug
      }))
    }
  }

  const saveCurrentPage = async () => {
    return await savePageContent(tenantId.value, currentPageSlug.value)
  }

  // ==================== 底圖操作 ====================
  
  /**
   * 新增底圖
   * @param {number} insertIndex - 在此索引之後插入新底圖
   */
  const addBasemap = (insertIndex) => {
    const basemaps = currentPageBasemaps.value
    
    // 在指定位置的下一個位置插入
    const actualIndex = insertIndex + 1
    
    // 計算新的 sequence
    const newSequence = actualIndex + 1
    
    // 創建新底圖（使用 API 格式）
    const newBasemap = {
      bg_sequence: newSequence,
      bg_pc_img_src: null,
      bg_pc_img_id: null,
      bg_tablet_img_src: null,
      bg_tablet_img_id: null,
      bg_phone_img_src: null,
      bg_phone_img_id: null,
      bg_is_deletable: true,
      bg_allow_multiple_frames: true,
      bg_can_change_img: true,
      bg_type: 'CONTENT',
      frames: []
    }
    
    // 在指定位置插入新底圖
    basemaps.splice(actualIndex, 0, newBasemap)
    
    console.log(`✓ 在索引 ${insertIndex} 之後新增底圖（實際插入位置：${actualIndex}）`)
  }

  /**
   * 刪除底圖
   */
  const deleteBasemap = (index) => {
    const basemaps = currentPageBasemaps.value
    
    if (index < 0 || index >= basemaps.length) {
      console.error('無效的底圖索引')
      return false
    }
    
    const basemap = basemaps[index]
    
    if (!basemap.bg_is_deletable) {
      console.error('此底圖不可刪除')
      return false
    }
    
    basemaps.splice(index, 1)
    clearSelection()
    console.log('✓ 底圖已刪除')
    return true
  }

  /**
   * 上移底圖
   */
  const moveBasemapUp = (index) => {
    const basemaps = currentPageBasemaps.value
    
    if (index <= 0 || index >= basemaps.length) {
      console.error('無法上移')
      return false
    }
    
    const basemap = basemaps[index]
    
    // 不允許移動 HEADER 和 FOOTER
    if (basemap.bg_type === 'HEADER' || basemap.bg_type === 'FOOTER') {
      console.error('無法移動系統底圖')
      return false
    }
    
    // 不允許移到 HEADER 上方
    if (basemaps[index - 1].bg_type === 'HEADER') {
      console.error('無法移動到頁首上方')
      return false
    }
    
    // 交換位置
    const temp = basemaps[index]
    basemaps[index] = basemaps[index - 1]
    basemaps[index - 1] = temp
    
    console.log('✓ 底圖已上移')
    return true
  }

  /**
   * 下移底圖
   */
  const moveBasemapDown = (index) => {
    const basemaps = currentPageBasemaps.value
    
    if (index < 0 || index >= basemaps.length - 1) {
      console.error('無法下移')
      return false
    }
    
    const basemap = basemaps[index]
    
    // 不允許移動 HEADER 和 FOOTER
    if (basemap.bg_type === 'HEADER' || basemap.bg_type === 'FOOTER') {
      console.error('無法移動系統底圖')
      return false
    }
    
    // 不允許移到 FOOTER 下方
    if (basemaps[index + 1].bg_type === 'FOOTER') {
      console.error('無法移動到頁尾下方')
      return false
    }
    
    // 交換位置
    const temp = basemaps[index]
    basemaps[index] = basemaps[index + 1]
    basemaps[index + 1] = temp
    
    console.log('✓ 底圖已下移')
    return true
  }

  const resetStore = () => {
    tenantId.value = null
    headerTabs.value = []
    isLoading.value = false
    error.value = null
    currentPageSlug.value = null
    pageData.value = {}
    selected.value = { basemap: null, frame: null, element: null }
  }
   /**
   * 獲取網站設定
   * GET /api/tenant/{tid}/web-site/
   * 
   * @param {string} tid - 宮廟 ID
   * @returns {Object|null} 網站設定資料或 null
   * 
   * 回應格式:
   * {
   *   "timestamp": "2025-06-11 11:08:25",
   *   "statusCode": 200,
   *   "message": "string",
   *   "data": {
   *     "domain": "localhost",
   *     "seo_title": "網站SEO標題",
   *     "seo_description": "網站 SEO 敘述",
   *     "seo_keywords": "網站 SEO 關鍵字",
   *     "meta_pixel": "臉書 pixel"
   *   }
   * }
   */
  const fetchWebsiteSettings = async (tid) => {
    if (!tid) {
      console.error('❌ 缺少宮廟 ID (tid)')
      error.value = '缺少宮廟 ID'
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      console.log(`📥 載入網站設定... (tid: ${tid})`)

      const response = await fetch(`/api/tenant/${tid}/web-site/`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json'
        }
      })

      console.log(`📥 回應狀態: ${response.status}`)

      // 處理 401 Unauthorized
      if (response.status === 401) {
        const errorMsg = '未授權，請重新登入'
        console.error(`❌ ${errorMsg}`)
        error.value = errorMsg
        return null
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ HTTP ${response.status}: ${errorText}`)
        error.value = `HTTP ${response.status}: 載入失敗`
        return null
      }

      const result = await response.json()
      
      console.log('📥 完整回應:', result)

      // 檢查 statusCode
      if (result.statusCode === 200 && result.data) {
        console.log('✓ 網站設定:', result.data)
        
        // 返回 data 物件
        return result.data
      }

      // 其他 statusCode
      const errorMsg = result.message || '載入設定失敗'
      console.error(`❌ ${errorMsg}`)
      error.value = errorMsg
      return null

    } catch (err) {
      console.error('❌ 網路錯誤:', err)
      error.value = err.message || '網路連線失敗'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 保存網站設定
   * PATCH /api/tenant/{tid}/web-site/
   * 
   * @param {string} tid - 宮廟 ID
   * @param {Object} settingsData - 設定資料
   * @returns {boolean} 是否保存成功
   */
  const updateWebsiteSettings = async (tid, settingsData) => {
    if (!tid) {
      console.error('❌ 缺少宮廟 ID (tid)')
      error.value = '缺少宮廟 ID'
      return false
    }

    if (!settingsData || typeof settingsData !== 'object') {
      console.error('❌ 無效的設定資料')
      error.value = '無效的設定資料'
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      console.log(`💾 保存網站設定... (tid: ${tid})`)
      console.log('📤 請求資料:', settingsData)

      const response = await fetch(`/api/tenant/${tid}/web-site/`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settingsData)
      })

      console.log(`📥 回應狀態: ${response.status}`)

      // 處理 401 Unauthorized
      if (response.status === 401) {
        const errorMsg = '未授權，請重新登入'
        console.error(`❌ ${errorMsg}`)
        error.value = errorMsg
        return false
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ HTTP ${response.status}: ${errorText}`)
        error.value = `HTTP ${response.status}: 保存失敗`
        return false
      }

      const result = await response.json()
      
      console.log('📥 完整回應:', result)

      // 檢查 statusCode
      if (result.statusCode === 200) {
        console.log('  網站設定已保存！')
        console.log('📊 更新後的資料:', result.data)
        return true
      }

      // 其他 statusCode
      const errorMsg = result.message || '保存設定失敗'
      console.error(`❌ ${errorMsg}`)
      error.value = errorMsg
      return false

    } catch (err) {
      console.error('❌ 網路錯誤:', err)
      error.value = err.message || '網路連線失敗'
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    tenantId,
    headerTabs,
    isLoading,
    error,
    currentPageSlug,
    pageData,
    selected,
    currentPageBasemaps,
    locales,              //   語言清單
    currentLocale,        //   當前語言
    fetchHeaderTabs,
    fetchPageContent,
    savePageContent,
    fetchLocales,         //   獲取語言清單
    setTenantId,
    initializePage,
    switchPage,
    reloadCurrentPage,    //   重新載入當前頁面（語言切換用）
    selectBasemap,
    selectFrame,
    selectElement,
    clearSelection,
    updateHeaderLogo,
    syncHeaderMenuFromTabs,
    saveCurrentPage,
    addBasemap,
    deleteBasemap,
    moveBasemapUp,
    moveBasemapDown,
    resetStore,
    fetchWebsiteSettings,
    updateWebsiteSettings
  }
})
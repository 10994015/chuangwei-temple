import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosClient from '../axios'

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
  
  // ✅ 系統框架列表（按頁面存儲）
  const systemFrames = ref({})  // { slug: ['FIRST_PICTURE', 'INDEX_NEWS', ...] }
  
  // 選擇狀態
  const selected = ref({
    basemap: null,
    frame: null,
    element: null,
    cell: null
  })

  // ✅ 待刪除的檔案 ID 清單
  const pendingDeleteFileIds = ref([])

  // ==================== Computed ====================
  
  // 當前頁面的 basemaps（就是 API 返回的 data 陣列）
  const currentPageBasemaps = computed(() => {
    return pageData.value[currentPageSlug.value]?.data || []
  })

  // ✅ 當前頁面的系統框架列表
  const currentPageSystemFrames = computed(() => {
    return systemFrames.value[currentPageSlug.value] || []
  })

  // ==================== ✅ 檔案刪除追蹤 ====================

  /**
   * 標記一個檔案 ID 為待刪除
   * @param {string|null} fileId - 要刪除的檔案 ID
   */
  const markFileForDeletion = (fileId) => {
    if (!fileId) return
    if (!pendingDeleteFileIds.value.includes(fileId)) {
      pendingDeleteFileIds.value.push(fileId)
      console.log('🗑️ 標記待刪除 ID:', fileId, '| 目前清單:', pendingDeleteFileIds.value)
    }
  }

  /**
   * 清空待刪除清單（儲存成功後呼叫）
   */
  const clearPendingDeleteFileIds = () => {
    console.log('🧹 清空待刪除清單，共', pendingDeleteFileIds.value.length, '個')
    pendingDeleteFileIds.value = []
  }

  // ==================== API Functions ====================
  
  /**
   * GET /api/tenant/{tid}/web-site/draft-page/tab
   */
  const fetchHeaderTabs = async (tid) => {
    if (!tid) return []

    isLoading.value = true
    error.value = null

    try {
      const response = await axiosClient.get(`/tenant/${tid}/web-site/draft-page/tab`)
      const result = response.data

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
      
      const response = await axiosClient.get(`/tenant/${tid}/web-site/locale`)
      const result = response.data

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
   * ✅ GET /api/tenant/{tid}/web-site/draft-page/{slug}/system-frame
   * 獲取指定頁面可用的系統框架列表
   * @param {string} tid - 租戶 ID
   * @param {string} slug - 頁面 slug
   * @returns {Array} 系統框架類型陣列，例如：['FIRST_PICTURE', 'INDEX_NEWS', 'PRODUCT_LIST']
   */
  const fetchSystemFrames = async (tid, slug) => {
    if (!tid || !slug) {
      console.warn('⚠️ fetchSystemFrames: 缺少 tid 或 slug')
      return []
    }

    // 不使用全局 loading，避免影響其他操作
    try {
      console.log(`📥 載入系統框架列表: ${slug}`)
      
      const response = await axiosClient.get(`/tenant/${tid}/web-site/draft-page/${slug}/system-frame`)
      const result = response.data

      if (result.statusCode === 200 && Array.isArray(result.data)) {
        // 存儲到 systemFrames
        systemFrames.value[slug] = result.data
        
        console.log(`✓ 系統框架列表 (${slug}):`, result.data)
        return result.data
      }
      
      throw new Error(result.message || '載入系統框架失敗')
      
    } catch (err) {
      console.error(`❌ 載入系統框架失敗 (${slug}):`, err)
      // 發生錯誤時返回空陣列，不阻斷其他操作
      systemFrames.value[slug] = []
      return []
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
      
      const response = await axiosClient.get(`/tenant/${tid}/web-site/draft-page/${slug}`, {
        params: { locale: targetLocale }
      })
      const result = response.data

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
      
      // 驗證和修正數據
      const contentJson = validateAndFixContent(pageData.value[slug].data)
      
      // 準備請求 body（符合 API 格式）
      const requestBody = {
        locale: currentLocale.value,
        slug: slug,
        deleteFileIds: [...pendingDeleteFileIds.value],  // ✅ 帶入待刪除清單（原本是 []）
        contentJson: contentJson
      }
      
      // 完整輸出送出的 JSON（格式化）
      console.log('📤 完整請求 JSON:')
      console.log(JSON.stringify(requestBody, null, 2))
      console.log('🗑️ 待刪除檔案 IDs:', pendingDeleteFileIds.value)  // ✅ 新增 log
      
      // Debug: 檢查數據大小
      const jsonString = JSON.stringify(requestBody)
      const sizeInKB = (jsonString.length / 1024).toFixed(2)
      const sizeInMB = (jsonString.length / 1024 / 1024).toFixed(2)
      
      console.log('📊 數據大小分析:')
      console.log('  總大小:', sizeInKB, 'KB (', sizeInMB, 'MB )')
      console.log('  字元數:', jsonString.length)
      
      // Debug: 檢查每個 basemap 的大小
      contentJson.forEach((basemap, index) => {
        const basemapString = JSON.stringify(basemap)
        const basemapSizeKB = (basemapString.length / 1024).toFixed(2)
        console.log(`  Basemap ${index} (${basemap.bgType}):`, basemapSizeKB, 'KB')
        
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
      const maxSizeMB = 10
      if (jsonString.length > maxSizeMB * 1024 * 1024) {
        const errorMsg = `數據量太大 (${sizeInMB} MB)，超過限制 (${maxSizeMB} MB)。請減少圖片數量或壓縮圖片大小。`
        console.error('❌', errorMsg)
        error.value = errorMsg
        alert(errorMsg)
        return false
      }
      
      console.log('📤 發送 PATCH 請求...')

      const response = await axiosClient.patch(`/tenant/${tid}/web-site/draft-page`, requestBody)
      console.log('📥 回應狀態:', response.status)
      const result = response.data
      console.log('📥 回應內容:', result)

      if (result.statusCode === 200) {
        console.log('✓ 保存成功！')

        // ✅ 清空待刪除清單
        clearPendingDeleteFileIds()
        
        // ✅ 關鍵修正：用 API 回傳的數據更新編輯器
        if (result.data && Array.isArray(result.data)) {
          console.log('🔄 更新編輯器數據...')
          
          // 保存前的數據快照（用於對比）
          const beforeSave = JSON.stringify(pageData.value[slug].data)
          
          // 更新 Store 中的數據
          pageData.value[slug] = { data: result.data }
          
          // 保存後的數據快照
          const afterSave = JSON.stringify(pageData.value[slug].data)
          
          // 檢查數據是否有變化
          if (beforeSave !== afterSave) {
            console.log('✓ 編輯器數據已更新（API 回傳的數據與送出的不同）')
            
            // 詳細對比變化
            const beforeLength = beforeSave.length
            const afterLength = afterSave.length
            const diff = afterLength - beforeLength
            const diffPercent = ((diff / beforeLength) * 100).toFixed(2)
            
            console.log('📊 數據變化:')
            console.log(`  保存前: ${(beforeLength / 1024).toFixed(2)} KB`)
            console.log(`  保存後: ${(afterLength / 1024).toFixed(2)} KB`)
            console.log(`  差異: ${diff > 0 ? '+' : ''}${(diff / 1024).toFixed(2)} KB (${diffPercent}%)`)
          } else {
            console.log('✓ 編輯器數據已更新（與送出的數據相同）')
          }
          
          // ✅ 清除選中狀態（避免指向舊的對象引用）
          clearSelection()
          
          console.log('✓ 數據同步完成')
        } else {
          console.warn('⚠️ API 沒有返回 contentJson，保留編輯器中的數據')
        }
        
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
          if (!Array.isArray(frame.data.caroiselWallImgs)) {
            frame.data.caroiselWallImgs = []
            console.log('✓ 修正 CAROUSEL_WALL.caroiselWallImgs 為空陣列')
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
            console.log('✓ 修正 HEADER.tab 為空陣列')
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
            if (!Array.isArray(element.value.imgs)) {
              element.value.imgs = []
              console.log('✓ 修正 CAROUSEL.imgs 為空陣列')
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
        }).filter(el => el !== null)

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
      
      // ✅ 即使頁面已載入，也要確保有系統框架
      if (!systemFrames.value[slug]) {
        await fetchSystemFrames(tenantId.value, slug)
      }
      return
    }

    const data = await fetchPageContent(tenantId.value, slug, locale)
    if (data) {
      currentPageSlug.value = slug
      
      // ✅ 載入系統框架列表
      await fetchSystemFrames(tenantId.value, slug)
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
    selected.value = { basemap, frame: null, element: null, cell: null }
  }

  const selectFrame = (frame) => {
    selected.value = { basemap: null, frame, element: null, cell: null }
  }

  const selectElement = (element) => {
    selected.value = { basemap: null, frame: null, element, cell: null }
  }

  const selectCell = (cellData) => {
    selected.value = { 
      basemap: null, 
      frame: null, 
      element: null, 
      cell: cellData 
    }
    console.log('✓ Store: 選中格子', cellData)
  }

  const clearSelection = () => {
    selected.value = { basemap: null, frame: null, element: null, cell: null }
  }

  const updateHeaderLogo = (logoSrc, logoId) => {
    const basemaps = currentPageBasemaps.value
    const headerBasemap = basemaps.find(b => b.bgType === 'HEADER')
    
    if (headerBasemap?.frames?.[0]) {
      if (!headerBasemap.frames[0].data) {
        headerBasemap.frames[0].data = {}
      }
      
      // ✅ 更新 logoImgSrc 和 logoImgId
      headerBasemap.frames[0].data.logoImgSrc = logoSrc
      headerBasemap.frames[0].data.logoImgId = logoId
      
      console.log('✓ Store: Logo 已更新:', {
        logoImgSrc: logoSrc,
        logoImgId: logoId
      })
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
    
    // 計算新的 sequence：取現有最大值 +1，確保全域唯一，避免 bgType+bgSequence 重複
    const maxSequence = basemaps.reduce((max, b) => Math.max(max, b.bgSequence || 0), 0)
    const newSequence = maxSequence + 1
    
    // 創建新底圖（使用 API 格式）
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
    
    if (!basemap.bgIsDeletable) {
      console.error('此底圖不可刪除')
      return false
    }

    // ✅ 刪除底圖時，標記所有背景圖片 ID 待刪除
    markFileForDeletion(basemap.bgPcImgId)
    markFileForDeletion(basemap.bgTabletImgId)
    markFileForDeletion(basemap.bgPhoneImgId)
    
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
    if (basemap.bgType === 'HEADER' || basemap.bgType === 'FOOTER') {
      console.error('無法移動系統底圖')
      return false
    }
    
    // 不允許移到 HEADER 上方
    if (basemaps[index - 1].bgType === 'HEADER') {
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
    if (basemap.bgType === 'HEADER' || basemap.bgType === 'FOOTER') {
      console.error('無法移動系統底圖')
      return false
    }
    
    // 不允許移到 FOOTER 下方
    if (basemaps[index + 1].bgType === 'FOOTER') {
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
    systemFrames.value = {}  // ✅ 重置系統框架
    locales.value = []
    selected.value = { basemap: null, frame: null, element: null, cell: null }
    pendingDeleteFileIds.value = []  // ✅ 重置待刪除清單
  }

  /**
   * 獲取網站設定
   * GET /api/tenant/{tid}/web-site/
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

      const response = await axiosClient.get(`/tenant/${tid}/web-site/`)
      console.log(`📥 回應狀態: ${response.status}`)
      const result = response.data
      
      console.log('📥 完整回應:', result)

      if (result.statusCode === 200 && result.data) {
        console.log('✓ 網站設定:', result.data)
        return result.data
      }

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

      const response = await axiosClient.patch(`/tenant/${tid}/web-site/`, settingsData)
      console.log(`📥 回應狀態: ${response.status}`)
      const result = response.data
      
      console.log('📥 完整回應:', result)

      if (result.statusCode === 200) {
        console.log('✓ 網站設定已保存！')
        console.log('📊 更新後的資料:', result.data)
        return true
      }

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

  /**
   * 發布網站
   * PATCH /api/tenant/{tid}/web-site/publish
   * @param {string} tid - 租戶 ID
   * @param {string} locale - 語言代碼
   * @returns {boolean} 是否發布成功
   */
  const publishWebsite = async (tid, locale) => {
    if (!tid || !locale) {
      console.error('❌ 缺少必要參數')
      error.value = '缺少必要參數'
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      console.log(`🚀 發布網站 (tid: ${tid}, locale: ${locale})`)
      
      const response = await axiosClient.patch(`/tenant/${tid}/web-site/publish`, { locale })
      console.log(`📥 回應狀態: ${response.status}`)
      const result = response.data
      
      console.log('📥 完整回應:', result)

      if (result.statusCode === 200) {
        console.log('✓ 網站發布成功！')
        return true
      }

      const errorMsg = result.message || '發布失敗'
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
  /**
   * ✅ 上傳圖片檔案
   * POST /api/tenant/{tid}/web-site/draft-page/file
   * @param {File} file - 要上傳的圖片檔案
   * @param {string} tid - 租戶 ID (可選，不提供時使用 store 中的 tenantId)
   * @returns {Object|null} 上傳成功返回 { id, fileUrl(=publicFileUrl), fileName, size }，失敗返回 null
   */
  const uploadImage = async (file, tid = null) => {
    const targetTid = tid || tenantId.value
    
    if (!targetTid) {
      console.error('❌ 缺少宮廟 ID')
      error.value = '缺少宮廟 ID'
      return null
    }

    if (!file) {
      console.error('❌ 缺少檔案')
      error.value = '缺少檔案'
      return null
    }

    // 檢查檔案大小 (最大 10MB)
    if (file.size > 10 * 1024 * 1024) {
      const errorMsg = '圖片大小不能超過 10MB'
      console.error(`❌ ${errorMsg}`)
      error.value = errorMsg
      return null
    }

    try {
      console.log(`📤 開始上傳圖片: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`)
      
      // 準備 FormData
      const formData = new FormData()
      formData.append('file', file)
      
      // 呼叫 API（FormData 需覆蓋 Content-Type，讓瀏覽器自動附帶 boundary）
      const response = await axiosClient.post(
        `/tenant/${targetTid}/web-site/draft-page/file`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      console.log(`📥 回應狀態: ${response.status}`)
      const result = response.data
      
      console.log('📥 上傳回應:', result)

      // 檢查回應格式
      if (result.statusCode === 200 && result.data && result.data.length > 0) {
        const uploadedFile = result.data[0]
        
        console.log('✓ 圖片上傳成功:', {
          id: uploadedFile.id,
          fileUrl: uploadedFile.publicFileUrl,
          fileName: uploadedFile.fileName,
          size: `${(uploadedFile.size / 1024).toFixed(2)} KB`
        })

        return {
          id: uploadedFile.id,
          fileUrl: uploadedFile.publicFileUrl,
          fileName: uploadedFile.fileName,
          originalName: uploadedFile.originalName,
          size: uploadedFile.size
        }
      }

      const errorMsg = result.message || '上傳失敗'
      console.error(`❌ ${errorMsg}`)
      error.value = errorMsg
      return null

    } catch (err) {
      console.error('❌ 上傳失敗:', err)
      error.value = err.message || '上傳失敗'
      return null
    }
  }

  /**
   * ✅ 刪除草稿頁面（回溯到上一個發布版本）
   * DELETE /api/tenant/{tid}/web-site/draft-page/{slug}
   * @param {string} slug - 頁面 slug (例如: 'home', 'about-us')
   * @param {string} tid - 租戶 ID (可選，不提供時使用 store 中的 tenantId)
   * @returns {boolean} 刪除成功返回 true，失敗返回 false
   */
  const deleteDraft = async (slug, tid = null) => {
    const targetTid = tid || tenantId.value
    
    if (!targetTid) {
      console.error('❌ 缺少宮廟 ID')
      error.value = '缺少宮廟 ID'
      return false
    }

    if (!slug) {
      console.error('❌ 缺少頁面 slug')
      error.value = '缺少頁面 slug'
      return false
    }

    try {
      console.log(`🗑️ 開始刪除草稿: ${slug}`)
      isLoading.value = true
      error.value = null
      
      // ✅ 呼叫刪除 API
      const response = await axiosClient.delete(`/tenant/${targetTid}/web-site/draft-page/${slug}`, {
        data: { locale: currentLocale.value || 'any' }
      })
      console.log(`📥 刪除回應狀態: ${response.status}`)
      const result = response.data
      console.log('📥 刪除回應:', result)

      if (result.statusCode === 200) {
        console.log('✓ 草稿已刪除，即將重新載入...')
        
        // ✅ 刪除成功後，重新載入草稿（會回溯到上一個發布版本）
        // 使用 reloadCurrentPage 或 initializePage 重新載入
        try {
          console.log('📥 重新載入頁面:', slug)
          
          // 方法 1: 使用 reloadCurrentPage（推薦）
          if (typeof reloadCurrentPage === 'function') {
            await reloadCurrentPage(currentLocale.value)
          } 
          // 方法 2: 使用 initializePage（如果沒有 reloadCurrentPage）
          else if (typeof initializePage === 'function') {
            await initializePage(slug, currentLocale.value, targetTid)
          }
          // 方法 3: 直接載入草稿（備用）
          else {
            await loadDraft(slug, currentLocale.value, targetTid)
          }
          
          console.log('✓ 草稿已重新載入')
          isLoading.value = false
          return true
          
        } catch (reloadError) {
          console.error('❌ 重新載入草稿失敗:', reloadError)
          error.value = '草稿已刪除，但重新載入失敗'
          isLoading.value = false
          return false
        }
      }

      const errorMsg = result.message || '刪除失敗'
      console.error(`❌ ${errorMsg}`)
      error.value = errorMsg
      isLoading.value = false
      return false

    } catch (err) {
      console.error('❌ 刪除草稿失敗:', err)
      error.value = err.message || '刪除草稿失敗'
      isLoading.value = false
      return false
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
    currentPageSystemFrames,  // ✅ 導出
    locales,
    currentLocale,
    pendingDeleteFileIds,       // ✅ 新增導出
    fetchHeaderTabs,
    fetchPageContent,
    fetchSystemFrames,          // ✅ 導出
    savePageContent,
    fetchLocales,
    setTenantId,
    initializePage,
    switchPage,
    reloadCurrentPage,
    selectBasemap,
    selectFrame,
    selectElement,
    selectCell,
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
    updateWebsiteSettings,
    publishWebsite,
    uploadImage,
    deleteDraft,
    markFileForDeletion,        // ✅ 新增導出
    clearPendingDeleteFileIds,  // ✅ 新增導出
  }
})
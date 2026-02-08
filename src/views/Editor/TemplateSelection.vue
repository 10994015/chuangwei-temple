<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTemplateStore } from '@/stores/template'

const router = useRouter()
const route = useRoute()
const templateStore = useTemplateStore()

// 獲取當前的 templeId
const currentTempleId = computed(() => route.params.templeId)

// 👇 新增：空白模板的識別ID
const BLANK_TEMPLATE_ID = 'blank-template'

// 當前步驟：1=選擇類型, 2=選擇風格
const currentStep = ref(1)

// 從 store 獲取資料
const websiteTypes = computed(() => {
  // 👇 在 API 返回的類型前面加入「空白模板」選項
  const blankTemplate = {
    id: BLANK_TEMPLATE_ID,
    name: '空白模板',
    layer: 1,
    parentId: null
  }
  return [blankTemplate, ...templateStore.formattedLayer1]
})

const subCategories = computed(() => templateStore.formattedSubCategories)
const webTemplates = computed(() => templateStore.formattedWebTemplates)
const isLoading = computed(() => 
  templateStore.isLoadingL1 || 
  templateStore.isLoadingDetail || 
  templateStore.isLoadingTemplates
)

// 當前選中的類型和模板
const selectedType = ref(null)
const selectedSubCategory = ref(null)
const selectedTemplate = ref(null)
const expandedCategory = ref(null)

// 當前顯示的模板列表（根據選中的子分類過濾）
const currentTemplates = computed(() => {
  if (!selectedSubCategory.value) return []
  return webTemplates.value.filter(
    template => template.categoryId === selectedSubCategory.value
  )
})

// 模板預覽內容映射
const templatePreviews = {
  'gold-red': {
    name: '金域赤焰',
    colors: { primary: '#C41E3A', secondary: '#D4AF37', bg: '#FFF8F0' }
  },
  'blessing-yellow': {
    name: '福祉吉黃',
    colors: { primary: '#F4A900', secondary: '#FFE5B4', bg: '#FFFEF7' }
  },
  'tranquil-blue': {
    name: '靜水慈藍',
    colors: { primary: '#4A90E2', secondary: '#87CEEB', bg: '#F0F8FF' }
  },
  'prosperity-purple': {
    name: '紫光澤賞',
    colors: { primary: '#8B4789', secondary: '#DDA0DD', bg: '#FFF5FF' }
  },
  'shadow-collect': {
    name: '陰陽素集',
    colors: { primary: '#2C3E50', secondary: '#95A5A6', bg: '#FFFFFF' }
  },
  'ruicai-life': {
    name: '瑞氣生青',
    colors: { primary: '#2E7D32', secondary: '#81C784', bg: '#F1F8F4' }
  },
  'divine-light': {
    name: '神跡曜光',
    colors: { primary: '#FFD700', secondary: '#FFF8DC', bg: '#FFFAF0' }
  }
}

// 當前預覽的模板數據
const currentTemplatePreview = computed(() => {
  if (!selectedTemplate.value) return null
  
  if (templatePreviews[selectedTemplate.value]) {
    return templatePreviews[selectedTemplate.value]
  }
  
  const template = webTemplates.value.find(t => t.id === selectedTemplate.value)
  if (template) {
    return {
      name: template.name,
      colors: { primary: '#d97444', secondary: '#f4a900', bg: '#ffffff' }
    }
  }
  
  return {
    name: '預設風格',
    colors: { primary: '#d97444', secondary: '#f4a900', bg: '#ffffff' }
  }
})

// 切換分類展開狀態
const toggleCategory = async (categoryId) => {
  if (expandedCategory.value === categoryId) {
    expandedCategory.value = null
    selectedSubCategory.value = null 
  } else {
    expandedCategory.value = categoryId
    selectedSubCategory.value = categoryId 
    
    // 展開時載入該分類的模板
    if (currentTempleId.value) {
      await templateStore.fetchWebTemplates(currentTempleId.value, categoryId)
    }
  }
}

// 選擇網站類型
const selectType = (typeId) => {
  selectedType.value = typeId
  console.log('選擇類型:', typeId)
}

// 選擇模板
const selectTemplate = (templateId) => {
  selectedTemplate.value = templateId
  console.log('選擇模板:', templateId)
}

// 返回上一步
const handlePrevious = () => {
  if (currentStep.value === 2) {
    currentStep.value = 1
    selectedSubCategory.value = null
    selectedTemplate.value = null
    expandedCategory.value = null
  }
}

// 下一步
const handleNext = async () => {
  if (currentStep.value === 1) {
    if (!selectedType.value) {
      alert('請先選擇一個網站類型')
      return
    }
    
    // 👇 如果選擇的是空白模板，直接跳到子網域設定頁面
    if (selectedType.value === BLANK_TEMPLATE_ID) {
      console.log('選擇空白模板，直接跳轉到子網域設定')
      if (currentTempleId.value) {
        router.push({ 
          name: 'app.temple.subdomain-setup',
          params: { 
            templeId: currentTempleId.value, 
            templateId: BLANK_TEMPLATE_ID  // 傳遞空白模板的識別ID
          }
        })
      } else {
        alert('無法獲取宮廟資訊')
      }
      return
    }
    
    // 進入步驟二前，先載入選中類型的詳細資訊（包含 sub_categories）
    if (currentTempleId.value) {
      console.log('載入類型詳情，類型 ID:', selectedType.value)
      await templateStore.fetchCategoryDetail(currentTempleId.value, selectedType.value)
      console.log('子分類列表:', subCategories.value)
    }
    
    currentStep.value = 2
  } else if (currentStep.value === 2) {
    if (!selectedTemplate.value) {
      alert('請先選擇一個模板')
      return
    }
    console.log('使用類型:', selectedType.value)
    console.log('使用模板:', selectedTemplate.value)
    
    // 導航到子網域設定頁面
    if (currentTempleId.value) {
      router.push({ 
        name: 'app.temple.subdomain-setup',
        params: { 
          templeId: currentTempleId.value, 
          templateId: selectedTemplate.value
        }
      })
    } else {
      alert('無法獲取宮廟資訊')
    }
  }
}

// 組件掛載時獲取資料
onMounted(async () => {
  if (currentTempleId.value) {
    console.log('開始獲取模板分類資料，宮廟 ID:', currentTempleId.value)
    await templateStore.fetchAllCategories(currentTempleId.value)
    console.log('L1 類別:', websiteTypes.value)
  } else {
    console.error('無法獲取宮廟 ID')
  }
})
</script>

<template>
  <div class="template-selection-page">
    <!-- Loading 狀態 -->
    <div v-if="isLoading && currentStep === 1" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>載入中...</p>
    </div>

    <!-- 步驟一：選擇網站類型 -->
    <template v-else-if="currentStep === 1">
      <!-- 左側選單 -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2 class="sidebar-title">選擇網站類型</h2>
          <p class="sidebar-subtitle">
            請選擇最符合您宮廟需求的網站類型，後續隨時可以調整與編輯
          </p>
        </div>

        <div class="type-list">
          <!-- 如果沒有資料，顯示提示 -->
          <div v-if="websiteTypes.length === 0" class="empty-state">
            <p>暫無可用的網站類型</p>
          </div>
          
          <!-- 網站類型列表 -->
          <button
            v-for="type in websiteTypes"
            :key="type.id"
            class="type-item"
            :class="{ selected: selectedType === type.id }"
            @click="selectType(type.id)"
          >
            <span class="type-icon">{{ type.icon }}</span>
            <span class="type-name">{{ type.name }}</span>
          </button>
        </div>

        <div class="sidebar-footer">
          <button class="btn-next" :disabled="!selectedType" @click="handleNext">
            下一步
          </button>
        </div>
      </aside>

      <!-- 右側預覽區 -->
      <main class="preview-area">
        <div v-if="!selectedType" class="preview-placeholder">
          <div class="placeholder-icon">
            <svg viewBox="0 0 200 200" fill="none">
              <rect x="40" y="40" width="120" height="120" rx="8" stroke="currentColor" stroke-width="3" stroke-dasharray="8 8" opacity="0.3"/>
              <circle cx="100" cy="80" r="20" fill="currentColor" opacity="0.2"/>
              <rect x="60" y="120" width="80" height="8" rx="4" fill="currentColor" opacity="0.2"/>
              <rect x="70" y="140" width="60" height="8" rx="4" fill="currentColor" opacity="0.15"/>
            </svg>
          </div>
          <p class="placeholder-text">請從左側選擇一個網站類型</p>
        </div>

        <div v-else class="preview-content">
          <div class="preview-frame type-preview-frame">
            <div class="preview-browser-bar">
              <div class="browser-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <div class="browser-url">XXXX宮官方網站 - 預覽</div>
            </div>

            <div class="type-preview-mock">
              <!-- 頂部導航 -->
              <div class="mock-navbar">
                <div class="mock-logo">LOGO</div>
                <div class="mock-nav-items">
                  <div class="mock-nav-item"></div>
                  <div class="mock-nav-item"></div>
                  <div class="mock-nav-item"></div>
                  <div class="mock-nav-item"></div>
                  <div class="mock-nav-item"></div>
                </div>
              </div>

              <!-- 輪播橫幅 -->
              <div class="mock-banner">
                <div class="banner-placeholder"></div>
              </div>

              <!-- 內容區 -->
              <div class="mock-main-content">
                <div class="content-section">
                  <div class="section-header">
                    <div class="section-title"></div>
                    <div class="section-link"></div>
                  </div>
                  <div class="cards-grid">
                    <div class="card-item" v-for="i in 3" :key="i">
                      <div class="card-image"></div>
                      <div class="card-badges">
                        <span class="badge red"></span>
                        <span class="badge blue"></span>
                      </div>
                      <div class="card-title"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>

    <!-- 步驟二：選擇網站風格 -->
    <template v-else-if="currentStep === 2">
      <!-- 左側選單 -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2 class="sidebar-title">選擇網站風格</h2>
          <p class="sidebar-subtitle">
            請選擇一個適合您宮廟的風格，後續隨時可以調整與編輯
          </p>
        </div>

        <!-- 載入中狀態 -->
        <div v-if="templateStore.isLoadingDetail" class="loading-state">
          <div class="mini-spinner"></div>
          <p>載入模板分類中...</p>
        </div>

        <div v-else class="template-categories">
          <!-- 如果沒有資料，顯示提示 -->
          <div v-if="subCategories.length === 0" class="empty-state">
            <p>暫無可用的模板分類</p>
          </div>
          
          <!-- 子分類列表（可展開/收合）-->
          <div
            v-for="category in subCategories"
            :key="category.id"
            class="category-group"
          >
            <button
              class="category-header"
              :class="{ expanded: expandedCategory === category.id }"
              @click="toggleCategory(category.id)"
            >
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
              <svg
                class="category-arrow"
                :class="{ rotated: expandedCategory === category.id }"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>

            <!-- 展開後顯示該分類下的模板列表 -->
            <transition name="slide">
              <div
                v-if="expandedCategory === category.id"
                class="template-list"
              >
                <!-- 載入中 -->
                <div v-if="templateStore.isLoadingTemplates" class="template-loading">
                  <div class="mini-spinner"></div>
                  <p>載入模板中...</p>
                </div>
                
                <!-- 模板列表 -->
                <div v-else-if="currentTemplates.length > 0">
                  <button
                    v-for="template in currentTemplates"
                    :key="template.id"
                    class="template-item"
                    :class="{ selected: selectedTemplate === template.id }"
                    @click="selectTemplate(template.id)"
                  >
                    <span class="template-icon">{{ template.icon }}</span>
                    <span class="template-name">{{ template.name }}</span>
                  </button>
                </div>
                
                <!-- 無模板 -->
                <div v-else class="no-templates">
                  <p>此分類暫無可用模板</p>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <div class="sidebar-footer">
          <button class="btn-previous" @click="handlePrevious">
            上一步
          </button>
          <button class="btn-next" :disabled="!selectedTemplate" @click="handleNext">
            下一步
          </button>
        </div>
      </aside>

      <!-- 右側預覽區 -->
      <main class="preview-area">
        <div v-if="!currentTemplatePreview" class="preview-placeholder">
          <div class="placeholder-icon">
            <svg viewBox="0 0 200 200" fill="none">
              <rect x="40" y="40" width="120" height="120" rx="8" stroke="currentColor" stroke-width="3" stroke-dasharray="8 8" opacity="0.3"/>
              <circle cx="100" cy="80" r="20" fill="currentColor" opacity="0.2"/>
              <rect x="60" y="120" width="80" height="8" rx="4" fill="currentColor" opacity="0.2"/>
              <rect x="70" y="140" width="60" height="8" rx="4" fill="currentColor" opacity="0.15"/>
            </svg>
          </div>
          <p class="placeholder-text">請從左側選擇一個模板以查看預覽</p>
        </div>

        <div v-else class="preview-content">
          <!-- 模板預覽框 -->
          <div 
            class="preview-frame"
            :style="{ backgroundColor: currentTemplatePreview.colors.bg }"
          >
            <div class="preview-browser-bar">
              <div class="browser-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <div class="browser-url">XXXX宮官方網站</div>
            </div>

            <div class="preview-mock">
              <!-- 導航列模擬 -->
              <div class="mock-navbar" :style="{ borderBottomColor: currentTemplatePreview.colors.secondary }">
                <div class="mock-logo" :style="{ color: currentTemplatePreview.colors.primary }">LOGO</div>
                <div class="mock-nav-items">
                  <div class="mock-nav-item" :style="{ background: currentTemplatePreview.colors.secondary + '40' }"></div>
                  <div class="mock-nav-item" :style="{ background: currentTemplatePreview.colors.secondary + '40' }"></div>
                  <div class="mock-nav-item" :style="{ background: currentTemplatePreview.colors.secondary + '40' }"></div>
                  <div class="mock-nav-item" :style="{ background: currentTemplatePreview.colors.secondary + '40' }"></div>
                  <div class="mock-nav-item" :style="{ background: currentTemplatePreview.colors.secondary + '40' }"></div>
                </div>
              </div>

              <!-- 橫幅模擬 -->
              <div class="mock-hero" :style="{ 
                background: `linear-gradient(135deg, ${currentTemplatePreview.colors.primary} 0%, ${currentTemplatePreview.colors.secondary} 100%)`
              }">
                <div class="mock-hero-content">
                  <div class="hero-text-large"></div>
                  <div class="hero-text-small"></div>
                </div>
              </div>

              <!-- 內容區模擬 -->
              <div class="mock-content">
                <div class="content-header">
                  <div class="content-title" :style="{ background: currentTemplatePreview.colors.primary }"></div>
                  <div class="content-link" :style="{ color: currentTemplatePreview.colors.primary }">
                    查看所有活動 →
                  </div>
                </div>

                <div class="mock-cards">
                  <div class="mock-card" v-for="i in 3" :key="i">
                    <div class="mock-card-image" :style="{ backgroundColor: currentTemplatePreview.colors.secondary + '20' }">
                      <svg class="image-placeholder" viewBox="0 0 100 100" fill="none">
                        <rect x="20" y="20" width="60" height="60" rx="4" stroke="currentColor" stroke-width="2" opacity="0.3"/>
                        <circle cx="40" cy="40" r="8" fill="currentColor" opacity="0.3"/>
                        <path d="M20 70 L40 50 L60 70 L80 50 L80 80 L20 80 Z" fill="currentColor" opacity="0.2"/>
                      </svg>
                    </div>
                    <div class="mock-card-body">
                      <div class="card-badges">
                        <span class="badge" :style="{ background: '#ef4444' }">熱門</span>
                        <span class="badge" :style="{ background: currentTemplatePreview.colors.primary }">推薦</span>
                      </div>
                      <div class="card-text-line"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 頁尾模擬 -->
              <div class="mock-footer" :style="{ backgroundColor: currentTemplatePreview.colors.primary + '10', borderTopColor: currentTemplatePreview.colors.secondary }">
                <div class="footer-content">
                  <div class="footer-section" v-for="i in 3" :key="i">
                    <div class="footer-title" :style="{ background: currentTemplatePreview.colors.primary + '60' }"></div>
                    <div class="footer-line"></div>
                    <div class="footer-line"></div>
                    <div class="footer-line short"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.template-selection-page {
  display: flex;
  height: 100vh;
  background: #fafafa;
  font-family: 'Microsoft YaHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, sans-serif;
}

// ========== Loading 狀態 ==========
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  
  p {
    margin-top: 16px;
    font-size: 16px;
    color: #6b7280;
  }
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f4f6;
  border-top-color: #d97444;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.loading-state {
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
  
  .mini-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #f3f4f6;
    border-top-color: #d97444;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 12px;
  }
  
  p {
    margin: 0;
    font-size: 14px;
  }
}
// ========== 空狀態 ==========
.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
  
  p {
    margin: 0;
    font-size: 14px;
  }
}

// ========== 左側選單 ==========
.sidebar {
  width: 280px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow-y: auto;
}

.sidebar-header {
  padding: 32px 24px 24px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.sidebar-subtitle {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

// ========== 網站類型列表 ==========
.type-list {
  padding: 12px;
  flex-shrink: 0;
}

.type-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #d97444;
    transform: translateY(-1px);
  }
  
  &.selected {
    border-color: #d97444;
    background: #fff7f3;
  }
}

.type-icon {
  font-size: 24px;
  line-height: 1;
}

.type-name {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
  text-align: left;
}

// ========== 模板分類（下拉選單）==========
.template-categories {
  padding: 8px 0;
  flex-shrink: 0;
}

.category-group {
  margin-bottom: 4px;
}

.category-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #f9fafb;
  }
  
  &.expanded {
    background: #f3f4f6;
  }
}

.category-icon {
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
}

.category-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  text-align: left;
}

.category-arrow {
  width: 16px;
  height: 16px;
  color: #9ca3af;
  transition: transform 0.2s;
  flex-shrink: 0;
  
  &.rotated {
    transform: rotate(180deg);
  }
}

.template-list {
  background: #fafafa;
  padding: 4px 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
  max-height: 500px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.template-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px 12px 40px;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
  }
  
  &.selected {
    background: #fff7f3;
    
    .template-name {
      color: #d97444;
      font-weight: 500;
    }
  }
}

.template-icon {
  font-size: 18px;
  line-height: 1;
}

.template-name {
  flex: 1;
  font-size: 14px;
  color: #4b5563;
  text-align: left;
  transition: color 0.2s;
}

// 模板載入中
.template-loading {
  padding: 20px;
  text-align: center;
  color: #9ca3af;
  
  .mini-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid #f3f4f6;
    border-top-color: #d97444;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 8px;
  }
  
  p {
    margin: 0;
    font-size: 13px;
  }
}

.no-templates {
  padding: 20px;
  text-align: center;
  color: #9ca3af;
  
  p {
    margin: 0;
    font-size: 13px;
  }
}

// ========== 頁尾按鈕 ==========
.sidebar-footer {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #ffffff;
  display: flex;
  gap: 12px;
  flex-shrink: 0;
  margin-top: 16px;
}

.btn-previous {
  flex: 1;
  padding: 12px 24px;
  background: #ffffff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
}

.btn-next {
  flex: 1;
  padding: 12px 24px;
  background: #d97444;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #c45e30;
  }
  
  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
    opacity: 0.6;
  }
}

// ========== 右側預覽區 ==========
.preview-area {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.placeholder-icon {
  width: 200px;
  height: 200px;
  margin-bottom: 24px;
  
  svg {
    width: 100%;
    height: 100%;
    color: currentColor;
  }
}

.placeholder-text {
  font-size: 16px;
  color: #6b7280;
}

.preview-content {
  width: 100%;
  max-width: 1200px;
}

.preview-frame {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.type-preview-frame {
  background: #ffffff;
}

.preview-browser-bar {
  height: 40px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.browser-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  
  &.red { background: #ef4444; }
  &.yellow { background: #f59e0b; }
  &.green { background: #10b981; }
}

.browser-url {
  flex: 1;
  background: #ffffff;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  color: #6b7280;
  text-align: center;
}

// ========== 類型預覽 Mock ==========
.type-preview-mock {
  background: #ffffff;
  min-height: 600px;
}

.mock-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
}

.mock-logo {
  padding: 8px 16px;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
}

.mock-nav-items {
  display: flex;
  gap: 16px;
}

.mock-nav-item {
  height: 8px;
  width: 40px;
  background: #e5e7eb;
  border-radius: 4px;
}

.mock-banner {
  height: 280px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.banner-placeholder {
  width: 100%;
  height: 100%;
  background: #e5e7eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mock-main-content {
  padding: 40px 32px;
  background: #fefbf6;
}

.content-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  width: 120px;
  height: 24px;
  background: #1f2937;
  border-radius: 4px;
}

.section-link {
  width: 100px;
  height: 16px;
  background: #d97444;
  border-radius: 4px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.card-item {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.card-image {
  height: 140px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-badges {
  display: flex;
  gap: 6px;
  padding: 12px;
}

.badge {
  height: 18px;
  width: 36px;
  border-radius: 3px;
  
  &.red {
    background: #ef4444;
  }
  
  &.blue {
    background: #3b82f6;
  }
}

.card-title {
  height: 14px;
  background: #d1d5db;
  border-radius: 3px;
  margin: 0 12px 12px;
}

// ========== 模板預覽 Mock ==========
.preview-mock {
  min-height: 800px;
  background: #ffffff;
}

.mock-hero {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  position: relative;
}

.mock-hero-content {
  text-align: center;
  z-index: 1;
}

.hero-text-large {
  width: 200px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  margin: 0 auto 12px;
}

.hero-text-small {
  width: 150px;
  height: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  margin: 0 auto;
}

.mock-content {
  padding: 48px 32px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.content-title {
  width: 100px;
  height: 24px;
  border-radius: 4px;
}

.content-link {
  font-size: 14px;
  font-weight: 500;
}

.mock-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.mock-card {
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.mock-card-image {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder {
  width: 60px;
  height: 60px;
  color: #9ca3af;
}

.mock-card-body {
  padding: 16px;
}

.card-text-line {
  height: 12px;
  background: #e5e7eb;
  border-radius: 3px;
}

.mock-footer {
  padding: 32px;
  border-top: 2px solid;
  margin-top: 40px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.footer-section {
  
}

.footer-title {
  height: 16px;
  width: 80px;
  border-radius: 3px;
  margin-bottom: 12px;
}

.footer-line {
  height: 10px;
  background: #d1d5db;
  border-radius: 3px;
  margin-bottom: 8px;
  
  &.short {
    width: 70%;
  }
}

// ========== 響應式設計 ==========
@media (max-width: 1024px) {
  .sidebar {
    width: 240px;
  }
  
  .cards-grid,
  .mock-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .template-selection-page {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    max-height: 50vh;
  }
  
  .cards-grid,
  .mock-cards {
    grid-template-columns: 1fr;
  }
  
  .mock-nav-items {
    display: none;
  }
}
</style>
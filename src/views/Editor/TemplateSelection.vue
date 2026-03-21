<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTemplateStore } from '@/stores/template'
import axiosClient from '@/axios'

const router = useRouter()
const route = useRoute()
const templateStore = useTemplateStore()

const currentTempleId = computed(() => route.params.templeId)

const BLANK_TEMPLATE_ID = 'blank-template'

const currentStep = ref(1)

const handlePreview = (templateId) => {
  const resolved = router.resolve({
    name: 'app.temple.preview',
    params: { templeId: currentTempleId.value },
    query: { templateId, source: 'template-selection' }
  })
  window.open(resolved.href, '_blank')
}

// 按「選擇」直接跳到 page-editor，帶 templateId 讓 EditorLayout 初始化時套用模板
const handleApplyTemplate = async (templateId) => {
  if (!currentTempleId.value) {
    alert('無法獲取宮廟資訊')
    return
  }

  try {
    const res = await axiosClient.get(`/tenant/${currentTempleId.value}/web-site/exist`)
    const websiteExists = res.data?.statusCode === 200 && res.data?.data?.result === true

    if (!websiteExists) {
      // 尚未建立網站，先設定子網域
      router.push({
        name: 'app.temple.subdomain-setup',
        params: { templeId: currentTempleId.value, templateId }
      })
    } else {
      // 已建立網站，直接進編輯器套用模板
      router.push({
        name: 'app.temple.page-editor',
        params: { templeId: currentTempleId.value },
        query: { templateId }
      })
    }
  } catch (err) {
    console.error('檢查網站狀態失敗:', err)
    alert('操作失敗，請稍後再試')
  }
}

const websiteTypes = computed(() => {
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

const selectedType = ref(null)
const selectedCategory = ref(null)
const selectedTemplate = ref(null)

const currentTemplates = computed(() => {
  if (!selectedCategory.value) return []
  return webTemplates.value.filter(
    template => template.categoryId === selectedCategory.value
  )
})

const selectCategory = async (categoryId) => {
  selectedCategory.value = categoryId
  selectedTemplate.value = null
  if (currentTempleId.value) {
    await templateStore.fetchWebTemplates(currentTempleId.value, categoryId)
  }
}

const selectType = (typeId) => {
  selectedType.value = typeId
}

const selectTemplate = (templateId) => {
  selectedTemplate.value = templateId
}

const handlePrevious = () => {
  if (currentStep.value === 2) {
    currentStep.value = 1
    selectedCategory.value = null
    selectedTemplate.value = null
  }
}

const handleNext = async () => {
  if (currentStep.value === 1) {
    if (!selectedType.value) {
      alert('請先選擇一個網站類型')
      return
    }

    if (selectedType.value === BLANK_TEMPLATE_ID) {
      if (currentTempleId.value) {
        router.push({
          name: 'app.temple.subdomain-setup',
          params: {
            templeId: currentTempleId.value,
            templateId: BLANK_TEMPLATE_ID
          }
        })
      } else {
        alert('無法獲取宮廟資訊')
      }
      return
    }

    if (currentTempleId.value) {
      await templateStore.fetchCategoryDetail(currentTempleId.value, selectedType.value)
    }

    currentStep.value = 2

    // 預設選取第一個分類
    const firstCategory = templateStore.formattedSubCategories?.[0]
    if (firstCategory) {
      await selectCategory(firstCategory.id)
    }
  } else if (currentStep.value === 2) {
    if (!selectedTemplate.value) {
      alert('請先選擇一個模板')
      return
    }
    handleApplyTemplate(selectedTemplate.value)
  }
}

onMounted(async () => {
  if (currentTempleId.value) {
    await templateStore.fetchAllCategories(currentTempleId.value)
  }
})
</script>

<template>
  <div class="template-selection-page">
    <div v-if="isLoading && currentStep === 1" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>載入中...</p>
    </div>

    <!-- 步驟一：選擇網站類型 -->
    <template v-else-if="currentStep === 1">
      <aside class="sidebar">
        <div class="sidebar-back">
          <button class="btn-back" @click="router.back()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            返回
          </button>
        </div>
        <div class="sidebar-header">
          <h2 class="sidebar-title">選擇網站類型</h2>
          <p class="sidebar-subtitle">
            請選擇最符合您宮廟需求的網站類型，後續隨時可以調整與編輯
          </p>
        </div>

        <div class="type-list">
          <div v-if="websiteTypes.length === 0" class="empty-state">
            <p>暫無可用的網站類型</p>
          </div>

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
              <div class="mock-navbar">
                <div class="mock-logo">LOGO</div>
                <div class="mock-nav-items">
                  <div class="mock-nav-item" v-for="i in 5" :key="i"></div>
                </div>
              </div>
              <div class="mock-banner">
                <div class="banner-placeholder"></div>
              </div>
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
      <aside class="sidebar">
        <div class="sidebar-back">
          <button class="btn-back" @click="router.back()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            返回
          </button>
        </div>
        <div class="sidebar-header">
          <h2 class="sidebar-title">選擇網站風格</h2>
          <p class="sidebar-subtitle">
            請選擇一個適合您宮廟的風格，後續隨時可以調整與編輯
          </p>
        </div>

        <div v-if="templateStore.isLoadingDetail" class="loading-state">
          <div class="mini-spinner"></div>
          <p>載入模板分類中...</p>
        </div>

        <div v-else class="category-list">
          <div v-if="subCategories.length === 0" class="empty-state">
            <p>暫無可用的模板分類</p>
          </div>

          <button
            v-for="category in subCategories"
            :key="category.id"
            class="category-item"
            :class="{ selected: selectedCategory === category.id }"
            @click="selectCategory(category.id)"
          >
            <span class="category-icon">{{ category.icon }}</span>
            <span class="category-name">{{ category.name }}</span>
          </button>
        </div>

        <div class="sidebar-footer">
          <button class="btn-previous" @click="handlePrevious">上一步</button>
          <button class="btn-next" :disabled="!selectedTemplate" @click="handleNext">下一步</button>
        </div>
      </aside>

      <!-- 右側：模板卡片網格 -->
      <main class="template-grid-area">
        <div v-if="!selectedCategory" class="preview-placeholder">
          <div class="placeholder-icon">
            <svg viewBox="0 0 200 200" fill="none">
              <rect x="40" y="40" width="120" height="120" rx="8" stroke="currentColor" stroke-width="3" stroke-dasharray="8 8" opacity="0.3"/>
              <circle cx="100" cy="80" r="20" fill="currentColor" opacity="0.2"/>
              <rect x="60" y="120" width="80" height="8" rx="4" fill="currentColor" opacity="0.2"/>
              <rect x="70" y="140" width="60" height="8" rx="4" fill="currentColor" opacity="0.15"/>
            </svg>
          </div>
          <p class="placeholder-text">請從左側選擇一個模板分類</p>
        </div>

        <div v-else-if="templateStore.isLoadingTemplates" class="grid-loading">
          <div class="loading-spinner"></div>
          <p>載入模板中...</p>
        </div>

        <div v-else-if="currentTemplates.length === 0" class="preview-placeholder">
          <p class="placeholder-text">此分類暫無可用模板</p>
        </div>

        <div v-else class="template-cards-grid">
          <div
            v-for="template in currentTemplates"
            :key="template.id"
            class="template-card"
            :class="{ selected: selectedTemplate === template.id }"
            @click="selectTemplate(template.id)"
          >
            <div class="card-thumbnail">
              <img
                :src="template.coverImgUrl || 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=640&h=400&fit=crop'"
                :alt="template.name"
                class="card-img"
              />
              <div class="card-overlay">
                <button class="card-btn btn-preview" @click.stop="handlePreview(template.id)">預覽</button>
                <button class="card-btn btn-select" @click.stop="handleApplyTemplate(template.id)">選擇</button>
              </div>
              <div v-if="selectedTemplate === template.id" class="card-selected-badge">
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>
            <div class="card-info">
              <p class="card-name">{{ template.name }}</p>
              <p class="card-id">{{ template.id }}</p>
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

// ========== Loading ==========
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  p { margin-top: 16px; font-size: 16px; color: #6b7280; }
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f4f6;
  border-top-color: #d97444;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-state {
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
  p { margin: 0; font-size: 14px; }
}

.mini-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top-color: #d97444;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
  p { margin: 0; font-size: 14px; }
}

// ========== 返回按鈕 ==========
.sidebar-back {
  padding: 16px 16px 0;
  flex-shrink: 0;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
    color: #374151;
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

// ========== 類型列表 ==========
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

  &:hover { border-color: #d97444; transform: translateY(-1px); }
  &.selected { border-color: #d97444; background: #fff7f3; }
}

.type-icon { font-size: 24px; line-height: 1; }
.type-name { flex: 1; font-size: 16px; font-weight: 500; color: #1f2937; text-align: left; }

// ========== 分類列表（步驟二，直接點選）==========
.category-list {
  padding: 12px;
  flex-shrink: 0;
}

.category-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover { border-color: #d97444; transform: translateY(-1px); }
  &.selected { border-color: #d97444; background: #fff7f3; }
}

.category-icon { font-size: 20px; line-height: 1; flex-shrink: 0; }
.category-name { flex: 1; font-size: 15px; font-weight: 500; color: #1f2937; }

// ========== 頁尾按鈕 ==========
.sidebar-footer {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #ffffff;
  display: flex;
  gap: 12px;
  flex-shrink: 0;
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
  &:hover { background: #f9fafb; border-color: #9ca3af; }
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
  &:hover:not(:disabled) { background: #c45e30; }
  &:disabled { background: #d1d5db; cursor: not-allowed; opacity: 0.6; }
}

// ========== 右側預覽（步驟一）==========
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
  height: 100%;
}

.placeholder-icon {
  width: 200px;
  height: 200px;
  margin-bottom: 24px;
  svg { width: 100%; height: 100%; color: currentColor; }
}

.placeholder-text { font-size: 16px; color: #6b7280; }

.preview-content { width: 100%; max-width: 1200px; }

.preview-frame {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.type-preview-frame { background: #ffffff; }

.preview-browser-bar {
  height: 40px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.browser-dots { display: flex; gap: 6px; }

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

.type-preview-mock { background: #ffffff; min-height: 600px; }

.mock-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  border-bottom: 1px solid #e5e7eb;
}

.mock-logo {
  padding: 8px 16px;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
}

.mock-nav-items { display: flex; gap: 16px; }
.mock-nav-item { height: 8px; width: 40px; background: #e5e7eb; border-radius: 4px; }

.mock-banner { height: 280px; background: #f3f4f6; padding: 40px; }
.banner-placeholder { width: 100%; height: 100%; background: #e5e7eb; border-radius: 8px; }

.mock-main-content { padding: 40px 32px; background: #fefbf6; }
.content-section { margin-bottom: 32px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.section-title { width: 120px; height: 24px; background: #1f2937; border-radius: 4px; }
.section-link { width: 100px; height: 16px; background: #d97444; border-radius: 4px; }

.cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

.card-item {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.card-image { height: 140px; background: #f3f4f6; }
.card-badges { display: flex; gap: 6px; padding: 12px; }
.badge { height: 18px; width: 36px; border-radius: 3px; &.red { background: #ef4444; } &.blue { background: #3b82f6; } }
.card-title { height: 14px; background: #d1d5db; border-radius: 3px; margin: 0 12px 12px; }

// ========== 右側模板卡片網格（步驟二）==========
.template-grid-area {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
}

.grid-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  gap: 16px;
  p { font-size: 14px; margin: 0; }
}

.template-cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;

  @media (max-width: 1400px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 1100px) { grid-template-columns: repeat(2, 1fr); }
}

.template-card {
  background: #ffffff;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  &:hover {
    border-color: #d97444;
    box-shadow: 0 4px 16px rgba(217, 116, 68, 0.15);
    transform: translateY(-2px);
    .card-overlay { opacity: 1; }
  }

  &.selected {
    border-color: #d97444;
    box-shadow: 0 0 0 3px rgba(217, 116, 68, 0.2);
  }
}

.card-thumbnail {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: #f3f4f6;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

.card-btn {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.15s;

  &.btn-preview {
    background: rgba(255, 255, 255, 0.15);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.6);
    &:hover { background: rgba(255, 255, 255, 0.25); }
  }

  &.btn-select {
    background: #d97444;
    color: #ffffff;
    &:hover { background: #c45e30; }
  }
}

.card-selected-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  background: #d97444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.card-info { padding: 12px 14px; }

.card-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-id {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// ========== 響應式 ==========
@media (max-width: 1024px) {
  .sidebar { width: 240px; }
  .cards-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .template-selection-page { flex-direction: column; }
  .sidebar { width: 100%; max-height: 50vh; }
  .template-cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
}
</style>
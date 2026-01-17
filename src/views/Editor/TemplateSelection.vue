<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 模板分類數據
const templateCategories = [
  {
    id: 'category-1',
    name: '模板 001',
    templates: [
      { id: 'gold-red', name: '金域赤焰', icon: '🏮' },
      { id: 'blessing-yellow', name: '福祉吉黃', icon: '✨' },
      { id: 'tranquil-blue', name: '靜水慈藍', icon: '💧' },
      { id: 'prosperity-purple', name: '紫光澤賞', icon: '🌟' },
      { id: 'shadow-collect', name: '陰陽素集', icon: '☯️' },
      { id: 'ruicai-life', name: '瑞氣生青', icon: '🌿' },
      { id: 'divine-light', name: '神跡曜光', icon: '🔆' }
    ]
  },
  {
    id: 'category-2',
    name: '模板 002',
    templates: [
      { id: 'gold-red-2', name: '金域赤焰', icon: '🏮' },
      { id: 'blessing-yellow-2', name: '福祉吉黃', icon: '✨' }
    ]
  }
]

// 當前選中的模板
const selectedTemplate = ref(null)
const expandedCategory = ref('category-1')

// 模板預覽內容映射
const templatePreviews = {
  'gold-red': {
    name: '金域赤焰',
    description: '傳統莊嚴，紅金配色，適合歷史悠久的宮廟',
    colors: { primary: '#C41E3A', secondary: '#D4AF37', bg: '#FFF8F0' },
    preview: 'gold-red'
  },
  'blessing-yellow': {
    name: '福祉吉黃',
    description: '溫暖吉祥，黃色系，象徵福祉與光明',
    colors: { primary: '#F4A900', secondary: '#FFE5B4', bg: '#FFFEF7' },
    preview: 'blessing-yellow'
  },
  'tranquil-blue': {
    name: '靜水慈藍',
    description: '清新寧靜，藍色系，給人安詳感受',
    colors: { primary: '#4A90E2', secondary: '#87CEEB', bg: '#F0F8FF' },
    preview: 'tranquil-blue'
  },
  'prosperity-purple': {
    name: '紫光澤賞',
    description: '尊貴典雅，紫色系，展現神聖氣息',
    colors: { primary: '#8B4789', secondary: '#DDA0DD', bg: '#FFF5FF' },
    preview: 'prosperity-purple'
  },
  'shadow-collect': {
    name: '陰陽素集',
    description: '簡約現代，黑白灰，展現禪意與平衡',
    colors: { primary: '#2C3E50', secondary: '#95A5A6', bg: '#FFFFFF' },
    preview: 'shadow-collect'
  },
  'ruicai-life': {
    name: '瑞氣生青',
    description: '自然清新，綠色系，象徵生機與希望',
    colors: { primary: '#2E7D32', secondary: '#81C784', bg: '#F1F8F4' },
    preview: 'ruicai-life'
  },
  'divine-light': {
    name: '神跡曜光',
    description: '神聖光明，金色系，彰顯莊嚴與神性',
    colors: { primary: '#FFD700', secondary: '#FFF8DC', bg: '#FFFAF0' },
    preview: 'divine-light'
  },
  'gold-red-2': {
    name: '金域赤焰',
    description: '模板002 - 傳統莊嚴風格變體',
    colors: { primary: '#DC143C', secondary: '#FFD700', bg: '#FFF5EE' },
    preview: 'gold-red-2'
  },
  'blessing-yellow-2': {
    name: '福祉吉黃',
    description: '模板002 - 溫暖吉祥風格變體',
    colors: { primary: '#FFB300', secondary: '#FFECB3', bg: '#FFFEF0' },
    preview: 'blessing-yellow-2'
  }
}

// 當前預覽的模板數據
const currentPreview = computed(() => {
  if (!selectedTemplate.value) return null
  return templatePreviews[selectedTemplate.value] || null
})

// 切換分類展開狀態
const toggleCategory = (categoryId) => {
  expandedCategory.value = expandedCategory.value === categoryId ? null : categoryId
}

// 選擇模板
const selectTemplate = (templateId) => {
  selectedTemplate.value = templateId
  console.log('選擇模板:', templateId)
}

// 下一步 - 前往子網域設定
const handleNext = () => {
  if (!selectedTemplate.value) {
    alert('請先選擇一個模板')
    return
  }
  
  console.log('使用模板:', selectedTemplate.value)
  // 導航到子網域設定頁面
  router.push({ name: 'app.cms.subdomain-setup' })
}
</script>

<template>
  <div class="template-selection-page">
    <!-- 左側選單 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">選擇網站風格</h2>
        <p class="sidebar-subtitle">
          請選擇一個適合您宮廟的風格，後續隨時可以調整與編輯
        </p>
      </div>

      <div class="template-categories">
        <div
          v-for="category in templateCategories"
          :key="category.id"
          class="category-group"
        >
          <button
            class="category-header"
            :class="{ expanded: expandedCategory === category.id }"
            @click="toggleCategory(category.id)"
          >
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

          <transition name="slide">
            <div
              v-if="expandedCategory === category.id"
              class="template-list"
            >
              <button
                v-for="template in category.templates"
                :key="template.id"
                class="template-item"
                :class="{ selected: selectedTemplate === template.id }"
                @click="selectTemplate(template.id)"
              >
                <span class="template-icon">{{ template.icon }}</span>
                <span class="template-name">{{ template.name }}</span>
                <span
                  v-if="selectedTemplate === template.id"
                  class="selected-indicator"
                >
                  ✓
                </span>
              </button>
            </div>
          </transition>
        </div>
      </div>

      <div class="sidebar-footer">
        <button class="btn-next" :disabled="!selectedTemplate" @click="handleNext">
          下一步
        </button>
      </div>
    </aside>

    <!-- 右側預覽區 -->
    <main class="preview-area">
      <div v-if="!currentPreview" class="preview-placeholder">
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
        <!-- 模板信息卡片 -->
        <div class="preview-info-card">
          <div class="info-header">
            <h3 class="template-preview-name">{{ currentPreview.name }}</h3>
            <div class="color-swatches">
              <div
                class="color-swatch"
                :style="{ backgroundColor: currentPreview.colors.primary }"
                :title="'主色調: ' + currentPreview.colors.primary"
              ></div>
              <div
                class="color-swatch"
                :style="{ backgroundColor: currentPreview.colors.secondary }"
                :title="'輔助色: ' + currentPreview.colors.secondary"
              ></div>
            </div>
          </div>
          <p class="template-preview-description">{{ currentPreview.description }}</p>
        </div>

        <!-- 模板預覽框 -->
        <div 
          class="preview-frame"
          :style="{ backgroundColor: currentPreview.colors.bg }"
        >
          <div class="preview-browser-bar">
            <div class="browser-dots">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <div class="browser-url">XXXX宮官方網站</div>
          </div>

          <div class="preview-mock" :class="'preview-' + currentPreview.preview">
            <!-- 導航列模擬 -->
            <div class="mock-navbar" :style="{ borderBottomColor: currentPreview.colors.secondary }">
              <div class="mock-logo">LOGO</div>
              <div class="mock-nav-items">
                <div class="mock-nav-item">首頁</div>
                <div class="mock-nav-item">關於我們</div>
                <div class="mock-nav-item">最新消息</div>
                <div class="mock-nav-item">祈福商品</div>
                <div class="mock-nav-item">慶典活動</div>
                <div class="mock-nav-item">聯絡我們</div>
              </div>
            </div>

            <!-- 橫幅模擬 -->
            <div class="mock-hero" :style="{ 
              background: `linear-gradient(135deg, ${currentPreview.colors.primary}dd 0%, ${currentPreview.colors.secondary}dd 100%)`
            }">
              <div class="mock-hero-content">
                <div class="mock-hero-title">{{ currentPreview.name }}</div>
                <div class="mock-hero-subtitle">守護信眾 庇佑平安</div>
              </div>
            </div>

            <!-- 內容區模擬 -->
            <div class="mock-content">
              <div class="mock-section">
                <div class="mock-section-title" :style="{ color: currentPreview.colors.primary }">
                  最新消息
                </div>
                <div class="mock-cards">
                  <div class="mock-card" v-for="i in 3" :key="i">
                    <div class="mock-card-image" :style="{ backgroundColor: currentPreview.colors.secondary + '40' }"></div>
                    <div class="mock-card-content">
                      <div class="mock-card-title"></div>
                      <div class="mock-card-text"></div>
                      <div class="mock-card-text short"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mock-section">
                <div class="mock-section-title" :style="{ color: currentPreview.colors.primary }">
                  慶典活動
                </div>
                <div class="mock-event-banner" :style="{ 
                  background: `linear-gradient(90deg, ${currentPreview.colors.primary}15 0%, ${currentPreview.colors.secondary}15 100%)`
                }">
                  <div class="mock-event-content"></div>
                </div>
              </div>
            </div>

            <!-- 頁尾模擬 -->
            <div class="mock-footer" :style="{ backgroundColor: currentPreview.colors.primary + '15' }">
              <div class="mock-footer-content">
                <div class="mock-footer-block" v-for="i in 3" :key="i"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.template-selection-page {
  display: flex;
  height: 100vh;
  background: #fafafa;
  font-family: 'Microsoft YaHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, sans-serif;
}

// ========== 左側選單 ==========
.sidebar {
  width: 280px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 32px 24px 24px;
  border-bottom: 1px solid #e5e7eb;
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

.template-categories {
  overflow-y: auto;
  padding: 8px 0;
}

.category-group {
  margin-bottom: 4px;
}

.category-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.category-name {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.category-arrow {
  width: 16px;
  height: 16px;
  color: #9ca3af;
  transition: transform 0.2s;
  
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
  position: relative;
  
  &:hover {
    background: #f3f4f6;
  }
  
  &.selected {
    background: #eff6ff;
    
    .template-name {
      color: #1d4ed8;
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

.selected-indicator {
  color: #1d4ed8;
  font-weight: bold;
  font-size: 16px;
}

.sidebar-footer {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #ffffff;
}

.btn-next {
  width: 100%;
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
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(217, 116, 68, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
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
  flex-direction: column;
  align-items: center;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
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

.preview-info-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.template-preview-name {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.color-swatches {
  display: flex;
  gap: 8px;
}

.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px #e5e7eb, 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: help;
}

.template-preview-description {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

.preview-frame {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
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

.preview-mock {
  min-height: 800px;
  background: #ffffff;
}

// 模擬元素樣式
.mock-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  border-bottom: 2px solid #e5e7eb;
  background: #ffffff;
}

.mock-logo {
  padding: 8px 16px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
}

.mock-nav-items {
  display: flex;
  gap: 24px;
}

.mock-nav-item {
  height: 6px;
  width: 50px;
  background: #e5e7eb;
  border-radius: 3px;
}

.mock-hero {
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%);
  }
}

.mock-hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.mock-hero-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 12px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.mock-hero-subtitle {
  font-size: 16px;
  opacity: 0.95;
  text-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

.mock-content {
  padding: 48px 32px;
}

.mock-section {
  margin-bottom: 48px;
}

.mock-section-title {
  height: 28px;
  width: 120px;
  background: currentColor;
  border-radius: 6px;
  margin-bottom: 24px;
  opacity: 0.9;
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
  height: 120px;
  background: #f3f4f6;
}

.mock-card-content {
  padding: 16px;
}

.mock-card-title {
  height: 12px;
  background: #d1d5db;
  border-radius: 4px;
  margin-bottom: 8px;
}

.mock-card-text {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  margin-bottom: 6px;
  
  &.short {
    width: 60%;
  }
}

.mock-event-banner {
  height: 200px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

.mock-event-content {
  width: 80%;
  height: 60%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
}

.mock-footer {
  padding: 32px;
  border-top: 1px solid #e5e7eb;
}

.mock-footer-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.mock-footer-block {
  height: 80px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
}

// 響應式設計
@media (max-width: 1024px) {
  .sidebar {
    width: 240px;
  }
  
  .preview-area {
    padding: 24px;
  }
  
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
    max-height: 40vh;
  }
  
  .mock-cards {
    grid-template-columns: 1fr;
  }
  
  .mock-nav-items {
    display: none;
  }
}
</style>
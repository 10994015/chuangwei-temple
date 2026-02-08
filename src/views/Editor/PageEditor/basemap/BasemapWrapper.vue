<template>
  <div 
    class="basemap-container"
    @mouseenter="handleContentMouseEnter"
    @mouseleave="handleContentMouseLeave"
  >
    <!-- 底圖內容 -->
    <div class="basemap-content">
      <slot></slot>
    </div>

    <!-- 分隔線 + 移動/新增/刪除按鈕 (Footer 不顯示) -->
    <div 
      v-if="!isFooter" 
      class="basemap-divider"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <div class="divider-line"></div>
      
      <!-- 按鈕組容器 -->
      <div class="divider-buttons">
        <!-- 上移按鈕 -->
        <button 
          v-if="!isHeader"
          class="divider-btn move-up-btn" 
          :class="{ active: isHovered }"
          :disabled="!canMoveUp"
          @click="handleMoveUp" 
          title="上移底圖"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </button>
        
        <!-- 新增按鈕 -->
        <button 
          class="add-basemap-btn" 
          :class="{ active: isHovered }"
          @click="addBlankBasemap"
          title="新增空白底圖"
        >
          <span class="plus-icon">+</span>
        </button>
        
        <!-- 下移按鈕 -->
        <button 
          v-if="!isHeader"
          class="divider-btn move-down-btn" 
          :class="{ active: isHovered }"
          :disabled="!canMoveDown"
          @click="handleMoveDown" 
          title="下移底圖"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </button>
        
        <!-- 背景圖片按鈕 -->
        <button 
          class="divider-btn bg-btn" 
          :class="{ active: isHovered }"
          @click="openBackgroundModal"
          title="編輯背景圖片"
        >
          <span class="icon">🖼️</span>
        </button>
        
        <!-- 刪除按鈕 -->
        <button 
          v-if="!isHeader && !isFooter"
          class="divider-btn delete-btn-divider" 
          :class="{ active: isHovered }"
          :disabled="!isDeletable"
          @click="handleDelete" 
          :title="isDeletable ? '刪除底圖' : '此底圖不可刪除'"
        >
          <span class="icon">✕</span>
        </button>
      </div>
      
      <div class="divider-line"></div>
    </div>

    <!-- 背景圖片編輯彈窗 -->
    <teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-dialog" @click.stop>
          <div class="modal-header">
            <h3>編輯背景圖片</h3>
            <button class="modal-close-btn" @click="closeModal">✕</button>
          </div>

          <div class="modal-body">
            <!-- 桌面版背景 -->
            <div class="bg-item">
              <label>桌面版背景</label>
              <div class="preview-box">
                <img
                  v-if="backgrounds.desktop"
                  :src="backgrounds.desktop"
                  alt="桌面版背景"
                  class="preview-img"
                />
                <div v-else class="no-preview">尚未上傳</div>
              </div>
              <button class="upload-btn" @click="uploadImage('desktop')">
                {{ backgrounds.desktop ? '更換圖片' : '上傳圖片' }}
              </button>
            </div>

            <!-- 平板版背景 -->
            <div class="bg-item">
              <label>平板版背景</label>
              <div class="preview-box">
                <img
                  v-if="backgrounds.tablet"
                  :src="backgrounds.tablet"
                  alt="平板版背景"
                  class="preview-img"
                />
                <div v-else class="no-preview">尚未上傳</div>
              </div>
              <button class="upload-btn" @click="uploadImage('tablet')">
                {{ backgrounds.tablet ? '更換圖片' : '上傳圖片' }}
              </button>
            </div>

            <!-- 手機版背景 -->
            <div class="bg-item">
              <label>手機版背景</label>
              <div class="preview-box">
                <img
                  v-if="backgrounds.mobile"
                  :src="backgrounds.mobile"
                  alt="手機版背景"
                  class="preview-img"
                />
                <div v-else class="no-preview">尚未上傳</div>
              </div>
              <button class="upload-btn" @click="uploadImage('mobile')">
                {{ backgrounds.mobile ? '更換圖片' : '上傳圖片' }}
              </button>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-close" @click="closeModal">關閉</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  isFooter: {
    type: Boolean,
    default: false
  },
  isHeader: {
    type: Boolean,
    default: false
  },
  isDeletable: {
    type: Boolean,
    default: true
  },
  index: {
    type: Number,
    required: true
  },
  basemapId: {
    type: String,
    required: true
  },
  basemap: {
    type: Object,
    default: null
  },
  totalBasemaps: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['add-basemap', 'delete-basemap', 'move-basemap', 'update-background'])

const isHovered = ref(false)
const isContentHovered = ref(false)
const showModal = ref(false)

// 背景圖片（響應式）
const backgrounds = ref({
  desktop: null,
  tablet: null,
  mobile: null
})

// 計算是否可以上移
const canMoveUp = computed(() => {
  return props.index > 1
})

// 計算是否可以下移
const canMoveDown = computed(() => {
  return props.index < props.totalBasemaps - 2
})

// 是否可以更換背景（改為永遠 true，讓所有底圖都能上傳背景）
const canChangeBackground = computed(() => {
  // 暫時忽略 bg_can_change_img 限制，讓所有底圖都能上傳背景
  return true
  // 原邏輯：return props.basemap?.bg_can_change_img !== false
})

// Debug: 顯示所有按鈕狀態
const logButtonStates = () => {
  console.log('按鈕狀態:', {
    isHeader: props.isHeader,
    isFooter: props.isFooter,
    isDeletable: props.isDeletable,
    canChangeBackground: canChangeBackground.value,
    canMoveUp: canMoveUp.value,
    canMoveDown: canMoveDown.value,
    index: props.index,
    totalBasemaps: props.totalBasemaps
  })
}

logButtonStates()

// 監聽 basemap 變化，同步背景圖片
watch(
  () => props.basemap,
  (newBasemap) => {
    if (newBasemap) {
      backgrounds.value = {
        desktop: newBasemap.bg_pc_img_src,
        tablet: newBasemap.bg_tablet_img_src,
        mobile: newBasemap.bg_phone_img_src
      }
      logButtonStates()
    }
  },
  { immediate: true, deep: true }
)

const handleMouseEnter = () => {
  isHovered.value = true
}

const handleMouseLeave = () => {
  isHovered.value = false
}

const handleContentMouseEnter = () => {
  isContentHovered.value = true
}

const handleContentMouseLeave = () => {
  isContentHovered.value = false
}

// 新增空白底圖
const addBlankBasemap = () => {
  emit('add-basemap', props.index)
}

// 刪除底圖
const handleDelete = () => {
  // 檢查是否可刪除
  if (!props.isDeletable) {
    alert('此底圖不可刪除')
    return
  }
  
  // 二次確認
  if (confirm('確定要刪除此底圖嗎？')) {
    emit('delete-basemap', props.basemapId)
  }
}

// 上移底圖
const handleMoveUp = () => {
  if (canMoveUp.value) {
    console.log('上移底圖，當前索引:', props.index)
    emit('move-basemap', {
      basemapId: props.basemapId,
      fromIndex: props.index,
      toIndex: props.index - 1,
      direction: 'up'
    })
  }
}

// 下移底圖
const handleMoveDown = () => {
  if (canMoveDown.value) {
    console.log('下移底圖，當前索引:', props.index)
    emit('move-basemap', {
      basemapId: props.basemapId,
      fromIndex: props.index,
      toIndex: props.index + 1,
      direction: 'down'
    })
  }
}

// ==================== 背景圖片處理 ====================

const openBackgroundModal = () => {
  // 所有底圖都可以上傳背景，直接打開 modal
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const uploadImage = (type) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  input.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // 檢查檔案大小
    if (file.size > 5 * 1024 * 1024) {
      alert('圖片大小不能超過 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageData = event.target.result

      // 更新本地響應式數據（用於預覽）
      backgrounds.value[type] = imageData

      // ⭐ 通過 emit 讓父組件更新數據（觸發響應式）
      emit('update-background', {
        basemapId: props.basemapId,
        basemap: props.basemap,
        type: type,  // 'desktop', 'tablet', 'mobile'
        imageData: imageData
      })

      console.log(`✓ ${type} 背景已更新`)
    }

    reader.onerror = () => {
      alert('讀取圖片失敗，請重試')
    }

    reader.readAsDataURL(file)
  }

  input.click()
}
</script>

<style lang="scss" scoped>
.basemap-container {
  position: relative;
}

.basemap-content {
  position: relative;
}

// 分隔線 + 按鈕組
.basemap-divider {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 0;
  display: flex;
  align-items: center;
  background: transparent;
  transition: all 0.3s ease;
  z-index: 50;
  pointer-events: none;
  
  // 擴大滑鼠感應區域（上下各 20px）
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 0;
    right: 0;
    height: 40px;
    pointer-events: auto;
  }
  
  &:hover {
    .divider-line {
      opacity: 1;
    }
  }
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, #333, transparent);
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
}

// 按鈕組容器
.divider-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 1rem;
  pointer-events: auto;
}

// 分隔線上的按鈕通用樣式
.divider-btn {
  width: 32px;
  height: 32px;
  border: 2px solid #666;
  border-radius: 50%;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0;
  transform: scale(0.8);
  position: relative;
  z-index: 10;
  background: #fff;
  
  .basemap-divider:hover & {
    opacity: 1;
    transform: scale(1);
  }
  
  &.active {
    opacity: 1;
    transform: scale(1);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    border-color: #ccc;
    color: #ccc;
    
    // 禁用狀態下仍然顯示，只是顏色變灰
    .basemap-divider:hover & {
      opacity: 0.4;
      transform: scale(1);
    }
    
    &:hover {
      transform: scale(1);
      border-color: #ccc;
      color: #ccc;
      background: #fff;
      box-shadow: none;
    }
  }
  
  .icon {
    width: 16px;
    height: 16px;
  }
  
  span.icon {
    font-size: 16px;
    font-weight: bold;
    line-height: 1;
  }
}

// 上移按鈕樣式
.move-up-btn {
  &:hover:not(:disabled) {
    background: #3b82f6;
    border-color: #3b82f6;
    color: #fff;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
}

// 背景圖片按鈕樣式
.bg-btn {
  &:hover {
    background: #9C27B0;
    border-color: #9C27B0;
    color: #fff;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(156, 39, 176, 0.3);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  span.icon {
    font-size: 14px;
  }
}

// 下移按鈕樣式
.move-down-btn {
  &:hover:not(:disabled) {
    background: #10b981;
    border-color: #10b981;
    color: #fff;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
}

// 刪除按鈕樣式（在分隔線上）
.delete-btn-divider {
  &:hover {
    background: #ef4444;
    border-color: #ef4444;
    color: #fff;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

// 新增按鈕
.add-basemap-btn {
  width: 32px;
  height: 32px;
  border: 2px solid #333;
  border-radius: 50%;
  background: #333;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0;
  transform: scale(0.8);
  position: relative;
  z-index: 10;
  
  .basemap-divider:hover & {
    opacity: 1;
    transform: scale(1);
  }
  
  &.active {
    opacity: 1;
    transform: scale(1);
  }
  
  &:hover {
    background: #000;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.plus-icon {
  font-size: 18px;
  font-weight: 300;
  line-height: 1;
}

// ==================== 彈窗樣式 ====================

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-dialog {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5e5;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
}

.modal-close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e5e5e5;
    color: #333;
  }
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.bg-item {
  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #666;
    margin-bottom: 12px;
  }
}

.preview-box {
  width: 100%;
  height: 180px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-preview {
  color: #999;
  font-size: 14px;
}

.upload-btn {
  width: 100%;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  background: #E8572A;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #d14a1f;
  }
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e5e5;
  display: flex;
  justify-content: flex-end;
}

.btn-close {
  padding: 10px 24px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    border-color: #ccc;
  }
}
</style>
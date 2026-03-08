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
      <div v-if="showModal" class="modal-overlay" @click="tryCloseModal">
        <div class="modal-dialog" @click.stop>
          <div class="modal-header">
            <h3>編輯背景圖片</h3>
            <button class="modal-close-btn" @click="tryCloseModal">✕</button>
          </div>

          <div class="modal-body">
            <!-- 桌面版背景 -->
            <div class="bg-item" :class="{ 'bg-item--required-error': desktopRequired }">
              <label>
                桌面版背景
                <span class="required-mark">*必填</span>
                <span v-if="desktopRequired" class="required-hint">（請先上傳桌面版）</span>
              </label>
              <div class="preview-box">
                <img
                  v-if="backgrounds.desktop"
                  :src="backgrounds.desktop"
                  alt="桌面版背景"
                  class="preview-img"
                />
                <div v-else class="no-preview" :class="{ 'no-preview--error': desktopRequired }">
                  尚未上傳
                </div>
              </div>
              <div v-if="uploadingState.desktop" class="uploading-row">
                <div class="upload-spinner"></div>
                <span>上傳中...</span>
              </div>
              <div v-else class="btn-row">
                <button class="upload-btn" @click="uploadImage('desktop')">
                  {{ backgrounds.desktop ? '更換圖片' : '上傳圖片' }}
                </button>
                <button 
                  v-if="backgrounds.desktop"
                  class="clear-img-btn"
                  @click="clearBackground('desktop')"
                  title="清除背景"
                >✕</button>
              </div>
            </div>

            <!-- 平板版背景 -->
            <div class="bg-item">
              <label>平板版背景<span class="optional-mark">選填</span></label>
              <div class="preview-box">
                <img
                  v-if="backgrounds.tablet"
                  :src="backgrounds.tablet"
                  alt="平板版背景"
                  class="preview-img"
                />
                <div v-else class="no-preview">未設定（使用桌面版）</div>
              </div>
              <div v-if="uploadingState.tablet" class="uploading-row">
                <div class="upload-spinner"></div>
                <span>上傳中...</span>
              </div>
              <div v-else class="btn-row">
                <button class="upload-btn" @click="uploadImage('tablet')">
                  {{ backgrounds.tablet ? '更換圖片' : '上傳圖片' }}
                </button>
                <button 
                  v-if="backgrounds.tablet"
                  class="clear-img-btn"
                  @click="clearBackground('tablet')"
                  title="清除背景"
                >✕</button>
              </div>
            </div>

            <!-- 手機版背景 -->
            <div class="bg-item">
              <label>手機版背景<span class="optional-mark">選填</span></label>
              <div class="preview-box">
                <img
                  v-if="backgrounds.mobile"
                  :src="backgrounds.mobile"
                  alt="手機版背景"
                  class="preview-img"
                />
                <div v-else class="no-preview">未設定（使用桌面版）</div>
              </div>
              <div v-if="uploadingState.mobile" class="uploading-row">
                <div class="upload-spinner"></div>
                <span>上傳中...</span>
              </div>
              <div v-else class="btn-row">
                <button class="upload-btn" @click="uploadImage('mobile')">
                  {{ backgrounds.mobile ? '更換圖片' : '上傳圖片' }}
                </button>
                <button 
                  v-if="backgrounds.mobile"
                  class="clear-img-btn"
                  @click="clearBackground('mobile')"
                  title="清除背景"
                >✕</button>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <p class="hint-text">💡 桌面版為必填；平板/手機未設定時自動沿用桌面版</p>
            <button class="btn-close" @click="tryCloseModal">關閉</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'

const props = defineProps({
  isFooter: { type: Boolean, default: false },
  isHeader: { type: Boolean, default: false },
  isDeletable: { type: Boolean, default: true },
  index: { type: Number, required: true },
  basemapId: { type: String, required: true },
  basemap: { type: Object, default: null },
  totalBasemaps: { type: Number, required: true }
})

const emit = defineEmits(['add-basemap', 'delete-basemap', 'move-basemap', 'update-background'])

const pageEditorStore = inject('pageEditorStore')

const isHovered = ref(false)
const isContentHovered = ref(false)
const showModal = ref(false)

const backgrounds = ref({ desktop: null, tablet: null, mobile: null })
const uploadingState = ref({ desktop: false, tablet: false, mobile: false })

const canMoveUp = computed(() => props.index > 1)
const canMoveDown = computed(() => props.index < props.totalBasemaps - 2)

// 是否顯示「桌機必填」錯誤狀態：
// 有平板或手機，但桌機是空的
const desktopRequired = computed(() =>
  !backgrounds.value.desktop &&
  (!!backgrounds.value.tablet || !!backgrounds.value.mobile)
)

watch(
  () => props.basemap,
  (newBasemap) => {
    if (newBasemap) {
      backgrounds.value = {
        desktop: newBasemap.bgPcImgSrc,
        tablet: newBasemap.bgTabletImgSrc,
        mobile: newBasemap.bgPhoneImgSrc
      }
    }
  },
  { immediate: true, deep: true }
)

const handleMouseEnter = () => { isHovered.value = true }
const handleMouseLeave = () => { isHovered.value = false }
const handleContentMouseEnter = () => { isContentHovered.value = true }
const handleContentMouseLeave = () => { isContentHovered.value = false }

const addBlankBasemap = () => { emit('add-basemap', props.index) }

const handleDelete = () => {
  if (!props.isDeletable) { alert('此底圖不可刪除'); return }
  if (confirm('確定要刪除此底圖嗎？')) { emit('delete-basemap', props.basemapId) }
}

const handleMoveUp = () => {
  if (canMoveUp.value) {
    emit('move-basemap', { basemapId: props.basemapId, fromIndex: props.index, toIndex: props.index - 1, direction: 'up' })
  }
}

const handleMoveDown = () => {
  if (canMoveDown.value) {
    emit('move-basemap', { basemapId: props.basemapId, fromIndex: props.index, toIndex: props.index + 1, direction: 'down' })
  }
}

// ==================== 背景圖片處理 ====================

const openBackgroundModal = () => { showModal.value = true }

// 關閉前檢查：有平板或手機但桌機為空 → 阻止關閉
const tryCloseModal = () => {
  if (desktopRequired.value) {
    alert('已設定平板或手機背景，請同時上傳桌面版背景（必填），或清除其他版本的背景後再關閉。')
    return
  }
  showModal.value = false
}

// ==================== 寫入 basemap 輔助 ====================

const applyUploadToBasemap = (type, uploadedFile) => {
  if (!props.basemap) return
  switch (type) {
    case 'desktop':
      props.basemap.bgPcImgSrc = uploadedFile.fileUrl
      props.basemap.bgPcImgId  = uploadedFile.id
      backgrounds.value.desktop = uploadedFile.fileUrl
      break
    case 'tablet':
      props.basemap.bgTabletImgSrc = uploadedFile.fileUrl
      props.basemap.bgTabletImgId  = uploadedFile.id
      backgrounds.value.tablet = uploadedFile.fileUrl
      break
    case 'mobile':
      props.basemap.bgPhoneImgSrc = uploadedFile.fileUrl
      props.basemap.bgPhoneImgId  = uploadedFile.id
      backgrounds.value.mobile = uploadedFile.fileUrl
      break
  }
}

// ==================== 上傳 ====================

const uploadImage = (type) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!pageEditorStore?.uploadImage) {
      alert('上傳功能初始化失敗，請重新整理頁面')
      return
    }

    // 標記舊圖片 ID 待刪除
    if (props.basemap) {
      const oldIdMap = {
        desktop: props.basemap.bgPcImgId,
        tablet:  props.basemap.bgTabletImgId,
        mobile:  props.basemap.bgPhoneImgId,
      }
      pageEditorStore.markFileForDeletion(oldIdMap[type])
    }

    uploadingState.value[type] = true

    try {
      const uploadedFile = await pageEditorStore.uploadImage(file)
      if (!uploadedFile) {
        alert('背景圖片上傳失敗，請稍後再試')
        return
      }

      // 寫入目標版本
      applyUploadToBasemap(type, uploadedFile)

      // ✅ 核心規則：上傳平板或手機時，若桌機目前是空的，自動同步到桌機
      if (type !== 'desktop' && !backgrounds.value.desktop) {
        // 同一個檔案已上傳，直接把相同的 url/id 也寫入桌機，不需重複上傳
        pageEditorStore.markFileForDeletion(null) // 桌機本來就空，不需標記刪除
        applyUploadToBasemap('desktop', uploadedFile)
        console.log(`✓ 桌機版自動同步為 ${type} 版圖片`)
      }

      emit('update-background', {
        basemapId: props.basemapId,
        basemap: props.basemap,
        type,
        imageData: uploadedFile.fileUrl,
        imageId: uploadedFile.id
      })

    } catch (error) {
      console.error(`❌ 底圖背景上傳失敗 (${type}):`, error)
      alert('上傳失敗：' + error.message)
    } finally {
      uploadingState.value[type] = false
    }
  }

  input.click()
}

// ==================== 清除 ====================

const clearBackground = (type) => {
  if (!props.basemap) return

  switch (type) {
    case 'desktop':
      pageEditorStore.markFileForDeletion(props.basemap.bgPcImgId)
      props.basemap.bgPcImgSrc = null
      props.basemap.bgPcImgId  = null
      backgrounds.value.desktop = null
      break
    case 'tablet':
      pageEditorStore.markFileForDeletion(props.basemap.bgTabletImgId)
      props.basemap.bgTabletImgSrc = null
      props.basemap.bgTabletImgId  = null
      backgrounds.value.tablet = null
      break
    case 'mobile':
      pageEditorStore.markFileForDeletion(props.basemap.bgPhoneImgId)
      props.basemap.bgPhoneImgSrc = null
      props.basemap.bgPhoneImgId  = null
      backgrounds.value.mobile = null
      break
  }
}
</script>

<style lang="scss" scoped>
.basemap-container {
  position: relative;
}

.basemap-content {
  position: relative;
}

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
  
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 0;
    right: 0;
    height: 40px;
    pointer-events: auto;
  }
  
  &:hover .divider-line { opacity: 1; }
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, #333, transparent);
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
}

.divider-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 1rem;
  pointer-events: auto;
}

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
  
  &.active { opacity: 1; transform: scale(1); }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    border-color: #ccc;
    color: #ccc;
    
    .basemap-divider:hover & { opacity: 0.4; transform: scale(1); }
    &:hover { transform: scale(1); border-color: #ccc; color: #ccc; background: #fff; box-shadow: none; }
  }
  
  .icon { width: 16px; height: 16px; }
  span.icon { font-size: 16px; font-weight: bold; line-height: 1; }
}

.move-up-btn {
  &:hover:not(:disabled) {
    background: #3b82f6; border-color: #3b82f6; color: #fff;
    transform: scale(1.05); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  &:active:not(:disabled) { transform: scale(0.95); }
}

.bg-btn {
  &:hover {
    background: #9C27B0; border-color: #9C27B0; color: #fff;
    transform: scale(1.05); box-shadow: 0 4px 12px rgba(156, 39, 176, 0.3);
  }
  &:active { transform: scale(0.95); }
  span.icon { font-size: 14px; }
}

.move-down-btn {
  &:hover:not(:disabled) {
    background: #10b981; border-color: #10b981; color: #fff;
    transform: scale(1.05); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
  &:active:not(:disabled) { transform: scale(0.95); }
}

.delete-btn-divider {
  &:hover {
    background: #ef4444; border-color: #ef4444; color: #fff;
    transform: scale(1.05); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }
  &:active { transform: scale(0.95); }
}

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
  
  .basemap-divider:hover & { opacity: 1; transform: scale(1); }
  &.active { opacity: 1; transform: scale(1); }
  &:hover { background: #000; transform: scale(1.05); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); }
  &:active { transform: scale(0.95); }
}

.plus-icon {
  font-size: 18px;
  font-weight: 300;
  line-height: 1;
}

// ==================== 彈窗樣式 ====================

.modal-overlay {
  position: fixed;
  inset: 0;
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
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5e5;

  h3 { margin: 0; font-size: 18px; font-weight: 600; color: #333; }
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

  &:hover { background: #e5e5e5; color: #333; }
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
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 500;
    color: #666;
    margin-bottom: 12px;
  }

  // 桌機必填錯誤狀態
  &--required-error {
    label { color: #ef4444; }
    .preview-box { border-color: #ef4444; }
  }
}

.required-mark {
  font-size: 11px;
  font-weight: 600;
  color: #E8572A;
  background: #fff5f2;
  border: 1px solid #E8572A;
  border-radius: 3px;
  padding: 1px 5px;
}

.optional-mark {
  font-size: 11px;
  font-weight: 400;
  color: #999;
  background: #f5f5f5;
  border-radius: 3px;
  padding: 1px 5px;
}

.required-hint {
  font-size: 11px;
  color: #ef4444;
  font-weight: 400;
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
  transition: border-color 0.2s;
}

.preview-img { width: 100%; height: 100%; object-fit: cover; }

.no-preview {
  color: #999;
  font-size: 14px;

  &--error {
    color: #ef4444;
    font-weight: 500;
  }
}

.btn-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.uploading-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: #fff5f2;
  border: 1px solid #E8572A;
  border-radius: 6px;
  color: #E8572A;
  font-size: 14px;
}

.upload-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #fde0d7;
  border-top: 2px solid #E8572A;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.upload-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  background: #E8572A;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover { background: #d14a1f; }
}

.clear-img-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  color: #999;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { background: #fee2e2; border-color: #ef4444; color: #ef4444; }
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hint-text { font-size: 12px; color: #999; margin: 0; }

.btn-close {
  padding: 10px 24px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { background: #f5f5f5; border-color: #ccc; }
}
</style>
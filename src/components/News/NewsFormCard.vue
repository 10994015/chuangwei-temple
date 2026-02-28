<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'clearError'])

const categoryOptions = ref(['活動公告', '重要通知', '一般公告'])
const showCategoryDropdown = ref(false)

const update = (key, value) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
  emit('clearError', key)
}

const selectCategory = (opt) => {
  update('category', opt)
  showCategoryDropdown.value = false
}

const handlePublishNow = (val) => {
  if (val) update('publishTime', '')
  update('publishNow', val)
}

// ── 圖片上傳 ──
const fileInput = ref(null)
const isDragging = ref(false)

const handleFileSelect = (file) => {
  if (!file) return
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    alert('僅支援 JPG、PNG 格式')
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    emit('update:modelValue', {
      ...props.modelValue,
      coverImage: file,
      coverPreview: e.target.result,
    })
  }
  reader.readAsDataURL(file)
}

const onFileInputChange = (e) => handleFileSelect(e.target.files[0])

const onDrop = (e) => {
  isDragging.value = false
  handleFileSelect(e.dataTransfer.files[0])
}

const removeCover = () => {
  emit('update:modelValue', { ...props.modelValue, coverImage: null, coverPreview: null })
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <div class="news-form-card" @click="showCategoryDropdown = false">
    <!-- 消息標題 -->
    <div class="form-field">
      <label class="field-label">消息標題 <span class="required">*</span></label>
      <input
        :value="modelValue.title"
        type="text"
        class="text-input"
        :class="{ error: errors.title }"
        placeholder="請輸入消息標題"
        @input="update('title', $event.target.value)"
      />
      <span v-if="errors.title" class="error-msg">{{ errors.title }}</span>
    </div>

    <!-- 消息類別 + 發佈時間 -->
    <div class="row-fields">
      <!-- 消息類別 -->
      <div class="form-field flex-3">
        <label class="field-label">消息類別 <span class="required">*</span></label>
        <div class="category-row">
          <div class="custom-select" @click.stop>
            <button
              class="select-trigger"
              :class="{ error: errors.category, filled: modelValue.category }"
              @click="showCategoryDropdown = !showCategoryDropdown"
            >
              <span :class="{ placeholder: !modelValue.category }">
                {{ modelValue.category || '請選擇類別' }}
              </span>
              <svg class="chevron" :class="{ rotate: showCategoryDropdown }" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </button>
            <Transition name="dropdown">
              <div v-if="showCategoryDropdown" class="select-dropdown">
                <button
                  v-for="opt in categoryOptions" :key="opt"
                  class="select-option"
                  :class="{ active: modelValue.category === opt }"
                  @click="selectCategory(opt)"
                >{{ opt }}</button>
              </div>
            </Transition>
          </div>
          <button class="btn-category-manage">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
            </svg>
            消息類別管理
          </button>
        </div>
        <span v-if="errors.category" class="error-msg">{{ errors.category }}</span>
      </div>

      <!-- 發佈時間 -->
      <div class="form-field flex-2">
        <label class="field-label">發佈時間 <span class="required">*</span></label>
        <input
          :value="modelValue.publishTime"
          type="datetime-local"
          class="text-input"
          :class="{ error: errors.publishTime }"
          :disabled="modelValue.publishNow"
          @change="update('publishTime', $event.target.value)"
        />
        <label class="checkbox-row">
          <input
            :checked="modelValue.publishNow"
            type="checkbox"
            class="checkbox"
            @change="handlePublishNow($event.target.checked)"
          />
          <span class="checkbox-label">即時發佈</span>
        </label>
        <span v-if="errors.publishTime" class="error-msg">{{ errors.publishTime }}</span>
      </div>
    </div>

    <!-- 消息內容 -->
    <div class="form-field">
      <label class="field-label">消息內容 <span class="required">*</span></label>
      <textarea
        :value="modelValue.content"
        class="textarea-input"
        :class="{ error: errors.content }"
        placeholder="請輸入消息內容..."
        rows="8"
        @input="update('content', $event.target.value)"
      ></textarea>
      <span v-if="errors.content" class="error-msg">{{ errors.content }}</span>
    </div>

    <!-- 封面圖片 -->
    <div class="form-field">
      <label class="field-label">封面圖片</label>

      <div v-if="modelValue.coverPreview" class="cover-preview-wrap">
        <img :src="modelValue.coverPreview" class="cover-preview" alt="封面預覽" />
        <button class="remove-cover" @click="removeCover">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>

      <div
        v-else
        class="upload-zone"
        :class="{ dragging: isDragging }"
        @click="fileInput.click()"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png"
          class="file-input-hidden"
          @change="onFileInputChange"
        />
        <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
        </svg>
        <p class="upload-text">點擊或拖曳圖片至此上傳</p>
        <p class="upload-hint">支援 JPG, PNG 格式</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.news-form-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  &.flex-3 { flex: 3; }
  &.flex-2 { flex: 2; }
}

.field-label {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}
.required { color: #E8572A; }

.text-input {
  height: 44px;
  padding: 0 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
  background: #ffffff;
  &::placeholder { color: #9ca3af; }
  &:focus { border-color: #E8572A; box-shadow: 0 0 0 2px rgba(232,87,42,0.08); }
  &.error { border-color: #ef4444; }
  &:disabled { background: #f9fafb; color: #9ca3af; cursor: not-allowed; }
}

.textarea-input {
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  outline: none;
  font-family: inherit;
  resize: vertical;
  min-height: 180px;
  line-height: 1.6;
  background: #ffffff;
  transition: border-color 0.2s;
  &::placeholder { color: #9ca3af; }
  &:focus { border-color: #E8572A; box-shadow: 0 0 0 2px rgba(232,87,42,0.08); }
  &.error { border-color: #ef4444; }
}

.error-msg { font-size: 12px; color: #ef4444; }

.row-fields {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

// ── 自訂下拉 ──
.category-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.custom-select { position: relative; flex: 1; }

.select-trigger {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: border-color 0.2s;
  text-align: left;
  &:focus, &:focus-visible { outline: none; border-color: #E8572A; box-shadow: 0 0 0 2px rgba(232,87,42,0.08); }
  &.error { border-color: #ef4444; }
}
.placeholder { color: #9ca3af; }
.chevron {
  width: 16px; height: 16px; color: #9ca3af;
  transition: transform 0.2s; flex-shrink: 0;
  &.rotate { transform: rotate(180deg); }
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 4px); left: 0; right: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  z-index: 100;
  overflow: hidden;
}
.select-option {
  width: 100%; padding: 10px 14px;
  background: none; border: none;
  text-align: left; font-size: 14px; color: #374151;
  cursor: pointer; font-family: inherit;
  &:hover { background: #f9fafb; }
  &.active { color: #E8572A; font-weight: 500; background: #fff7f3; }
}

.btn-category-manage {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 16px;
  background: transparent;
  border: 1.5px solid #E8572A;
  border-radius: 20px;
  color: #E8572A; font-size: 13px; font-weight: 500;
  cursor: pointer; font-family: inherit;
  white-space: nowrap; transition: all 0.2s;
  &:hover { background: #fff7f3; }
  svg { width: 15px; height: 15px; }
}

.checkbox-row {
  display: flex; align-items: center; gap: 8px;
  cursor: pointer; margin-top: 4px;
}
.checkbox { width: 16px; height: 16px; accent-color: #E8572A; cursor: pointer; }
.checkbox-label { font-size: 14px; color: #374151; user-select: none; }

// ── 圖片 ──
.upload-zone {
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  padding: 48px 24px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 8px; cursor: pointer;
  transition: all 0.2s; background: #fafafa;
  &:hover, &.dragging { border-color: #E8572A; background: #fff7f3; }
}
.upload-icon { width: 36px; height: 36px; color: #9ca3af; margin-bottom: 4px; }
.upload-text { font-size: 14px; color: #374151; margin: 0; }
.upload-hint { font-size: 13px; color: #9ca3af; margin: 0; }
.file-input-hidden { display: none; }

.cover-preview-wrap { position: relative; }
.cover-preview {
  width: 100%; max-height: 240px;
  object-fit: cover; border-radius: 8px; display: block;
}
.remove-cover {
  position: absolute; top: 8px; right: 8px;
  width: 28px; height: 28px;
  background: rgba(0,0,0,0.5); border: none;
  border-radius: 50%; cursor: pointer; color: #fff;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
  &:hover { background: rgba(0,0,0,0.7); }
  svg { width: 16px; height: 16px; }
}

.dropdown-enter-active, .dropdown-leave-active { transition: all 0.15s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-6px); }

@media (max-width: 768px) {
  .row-fields { flex-direction: column; }
}
</style>
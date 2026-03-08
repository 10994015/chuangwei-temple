<template>
  <div class="rich-editor" :class="{ 'link-popup-open': showLinkInput }">

    <!-- 工具列 -->
    <div class="editor-toolbar" v-if="editor">

      <!-- 粗體 / 斜體 / 底線 -->
      <button class="toolbar-btn" :class="{ active: editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()" title="粗體 (Ctrl+B)" type="button">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
      </button>
      <button class="toolbar-btn" :class="{ active: editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()" title="斜體 (Ctrl+I)" type="button">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
      </button>
      <button class="toolbar-btn" :class="{ active: editor.isActive('underline') }"
        @click="editor.chain().focus().toggleUnderline().run()" title="底線 (Ctrl+U)" type="button">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" y1="20" x2="20" y2="20"/></svg>
      </button>

      <div class="toolbar-divider"></div>

      <!-- 字體大小 -->
      <div class="toolbar-select-group" title="字體大小">
        <select class="toolbar-select" @change="setFontSize($event.target.value)" :value="currentFontSize">
          <option value="">大小</option>
          <option v-for="s in fontSizes" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <!-- 文字顏色 -->
      <div class="toolbar-color-group" title="文字顏色">
        <div class="color-preview" :style="{ background: currentTextColor }"></div>
        <input type="color" class="toolbar-color-input" :value="currentTextColor"
          @input="setTextColor($event.target.value)" title="文字顏色" />
      </div>

      <div class="toolbar-divider"></div>

      <!-- 對齊 -->
      <button class="toolbar-btn" :class="{ active: editor.isActive({ textAlign: 'left' }) }"
        @click="editor.chain().focus().setTextAlign('left').run()" title="靠左" type="button">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
      </button>
      <button class="toolbar-btn" :class="{ active: editor.isActive({ textAlign: 'center' }) }"
        @click="editor.chain().focus().setTextAlign('center').run()" title="置中" type="button">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/></svg>
      </button>
      <button class="toolbar-btn" :class="{ active: editor.isActive({ textAlign: 'right' }) }"
        @click="editor.chain().focus().setTextAlign('right').run()" title="靠右" type="button">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
      </button>

      <div class="toolbar-divider"></div>

      <!-- 行高 -->
      <div class="toolbar-select-group" title="行高">
        <select class="toolbar-select" @change="setLineHeight($event.target.value)" :value="currentLineHeight">
          <option value="">行高</option>
          <option v-for="lh in lineHeights" :key="lh.value" :value="lh.value">{{ lh.label }}</option>
        </select>
      </div>

      <div class="toolbar-divider"></div>

      <!-- 清單 -->
      <button class="toolbar-btn" :class="{ active: editor.isActive('orderedList') }"
        @click="editor.chain().focus().toggleOrderedList().run()" title="有序清單" type="button">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
      </button>
      <button class="toolbar-btn" :class="{ active: editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()" title="無序清單" type="button">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>
      </button>

      <div class="toolbar-divider"></div>

      <!-- 連結 -->
      <button class="toolbar-btn" :class="{ active: editor.isActive('link') }"
        @click="handleSetLink" title="插入連結" type="button">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      </button>
      <button v-if="editor.isActive('link')" class="toolbar-btn"
        @click="editor.chain().focus().unsetLink().run()" title="移除連結" type="button">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/><line x1="2" y1="2" x2="22" y2="22" stroke-width="2.5"/></svg>
      </button>

      <div class="toolbar-divider"></div>

      <!-- 清除格式 -->
      <button class="toolbar-btn"
        @click="editor.chain().focus().clearNodes().unsetAllMarks().run()" title="清除格式" type="button">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>
      </button>
    </div>

    <!-- 編輯區 -->
    <editor-content class="editor-content" :editor="editor" />

    <!-- 連結輸入浮出 -->
    <div v-if="showLinkInput" class="link-popup" @click.stop>
      <input
        ref="linkInputRef"
        v-model="linkUrl"
        type="url"
        class="link-input"
        placeholder="https://example.com"
        @keydown.enter="confirmLink"
        @keydown.esc="showLinkInput = false"
      />
      <button class="link-confirm-btn" @click="confirmLink" type="button">確認</button>
      <button class="link-cancel-btn" @click="showLinkInput = false" type="button">✕</button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import FontSize from 'tiptap-extension-font-size'
import { Extension } from '@tiptap/core'

// ==================== 自訂 LineHeight Extension ====================
const LineHeight = Extension.create({
  name: 'lineHeight',
  addOptions() {
    return { types: ['paragraph', 'heading'] }
  },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        lineHeight: {
          default: null,
          parseHTML: el => el.style.lineHeight || null,
          renderHTML: attrs => {
            if (!attrs.lineHeight) return {}
            return { style: `line-height: ${attrs.lineHeight}` }
          }
        }
      }
    }]
  },
  addCommands() {
    return {
      setLineHeight: (lineHeight) => ({ commands }) => {
        return this.options.types.every(type =>
          commands.updateAttributes(type, { lineHeight })
        )
      },
      unsetLineHeight: () => ({ commands }) => {
        return this.options.types.every(type =>
          commands.resetAttributes(type, 'lineHeight')
        )
      }
    }
  }
})

const props = defineProps({
  modelValue: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

// ==================== 字體大小選項 ====================
const fontSizes = ['12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '64']
const lineHeights = [
  { label: '0', value: '0' },
  { label: '0.2', value: '0.2' },
  { label: '0.4', value: '0.4' },
  { label: '0.6', value: '0.6' },
  { label: '0.8', value: '0.8' },
  { label: '1.0', value: '1' },
  { label: '1.2', value: '1.2' },
  { label: '1.4', value: '1.4' },
  { label: '1.6', value: '1.6' },
  { label: '1.8', value: '1.8' },
  { label: '2.0', value: '2' },
  { label: '2.5', value: '2.5' },
  { label: '3.0', value: '3' },
]

// ==================== 當前狀態 ====================
const currentFontSize = computed(() => {
  if (!editor.value) return ''
  const attrs = editor.value.getAttributes('textStyle')
  return attrs?.fontSize ? attrs.fontSize.replace('px', '') : ''
})

const currentTextColor = computed(() => {
  if (!editor.value) return '#333333'
  const attrs = editor.value.getAttributes('textStyle')
  return attrs?.color || '#333333'
})

const setFontSize = (size) => {
  if (!size) {
    editor.value?.chain().focus().unsetFontSize().run()
  } else {
    editor.value?.chain().focus().setFontSize(size + 'px').run()
  }
}

const currentLineHeight = computed(() => {
  if (!editor.value) return ''
  const attrs = editor.value.getAttributes('paragraph')
  return attrs?.lineHeight || ''
})

const setLineHeight = (lh) => {
  if (!lh) {
    editor.value?.chain().focus().unsetLineHeight().run()
  } else {
    editor.value?.chain().focus().setLineHeight(lh).run()
  }
}

const setTextColor = (color) => {
  editor.value?.chain().focus().setColor(color).run()
}

// ==================== 連結 ====================
const showLinkInput = ref(false)
const linkUrl = ref('')
const linkInputRef = ref(null)

const handleSetLink = () => {
  const existing = editor.value?.getAttributes('link')?.href || ''
  linkUrl.value = existing
  showLinkInput.value = true
  nextTick(() => linkInputRef.value?.focus())
}

const confirmLink = () => {
  if (!linkUrl.value.trim()) {
    editor.value?.chain().focus().unsetLink().run()
  } else {
    editor.value?.chain().focus().setLink({ href: linkUrl.value.trim(), target: '_blank' }).run()
  }
  showLinkInput.value = false
  linkUrl.value = ''
}

// ==================== Editor ====================
const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TextStyle,
    Color,
    FontSize,
    LineHeight,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' }
    })
  ],
  content: props.modelValue || '',
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
  }
})

watch(() => props.modelValue, (newVal) => {
  if (editor.value && editor.value.getHTML() !== newVal) {
    editor.value.commands.setContent(newVal || '', false)
  }
})

onBeforeUnmount(() => editor.value?.destroy())
</script>

<style lang="scss" scoped>
.rich-editor {
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: visible; // 讓連結浮出不被裁切
  background: #fff;
  transition: border-color 0.2s;
  position: relative;

  &:focus-within {
    border-color: #E8572A;
    box-shadow: 0 0 0 3px rgba(232, 87, 42, 0.08);
  }
}

// ==================== 工具列 ====================
.editor-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  padding: 5px 6px;
  background: #f9f9f9;
  border-bottom: 1px solid #e5e5e5;
  border-radius: 6px 6px 0 0;
}

.toolbar-btn {
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  transition: all 0.15s;
  padding: 0;
  flex-shrink: 0;

  &:hover { background: #e8e8e8; color: #333; }
  &.active { background: #E8572A; color: #fff; }
}

.toolbar-divider {
  width: 1px;
  height: 18px;
  background: #ddd;
  margin: 0 3px;
  flex-shrink: 0;
}

// 字體大小 select
.toolbar-select-group {
  position: relative;
}

.toolbar-select {
  height: 26px;
  padding: 0 20px 0 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23999'/%3E%3C/svg%3E") no-repeat right 5px center;
  -webkit-appearance: none;
  font-size: 11px;
  color: #555;
  cursor: pointer;
  outline: none;
  min-width: 52px;

  &:hover { border-color: #ccc; }
  &:focus { border-color: #E8572A; }
}

// 文字顏色
.toolbar-color-group {
  position: relative;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #ddd;
  cursor: pointer;
  flex-shrink: 0;

  &:hover { border-color: #ccc; }
}

.color-preview {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  transition: background 0.15s;
}

.toolbar-color-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  padding: 0;
  border: none;
  z-index: 2;
}

// ==================== 編輯區 ====================
.editor-content {
  min-height: 120px;
  max-height: 320px;
  overflow-y: auto;
  border-radius: 0 0 6px 6px;

  :deep(.ProseMirror) {
    padding: 10px 12px;
    outline: none;
    font-size: 14px;
    line-height: 1.7;
    color: #333;
    min-height: 120px;

    // 段落與標題
    p { margin: 0 0 0.4em; &:last-child { margin-bottom: 0; } }
    h2 { font-size: 18px; font-weight: 700; margin: 0.2em 0 0.4em; }
    h3 { font-size: 15px; font-weight: 700; margin: 0.2em 0 0.4em; }

    // 文字樣式
    strong { font-weight: 700; }
    em { font-style: italic; }
    u { text-decoration: underline; }
    a { color: #E8572A; text-decoration: underline; cursor: pointer; }

    // 清單
    ul { padding-left: 1.4em; margin: 0.2em 0 0.4em; list-style-type: disc; }
    ol { padding-left: 1.4em; margin: 0.2em 0 0.4em; list-style-type: decimal; }
    li { margin-bottom: 0.15em; }

    // 對齊
    &[style*="text-align"] { width: 100%; }
  }
}

// ==================== 連結浮出 ====================
.link-popup {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #E8572A;
  border-radius: 6px;
  padding: 8px;
  display: flex;
  gap: 6px;
  align-items: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 200;
}

.link-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  outline: none;
  &:focus { border-color: #E8572A; }
}

.link-confirm-btn {
  padding: 6px 12px;
  background: #E8572A;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  &:hover { background: #d14a1f; }
}

.link-cancel-btn {
  width: 28px;
  height: 28px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  flex-shrink: 0;
  &:hover { background: #e8e8e8; }
}
</style>
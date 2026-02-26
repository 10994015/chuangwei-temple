<template>
  <div 
    class="text-element"
    :style="{
      fontSize: ensureUnit(content.fontSize, '16px'),
      color: content.color || '#333',
      textAlign: content.align || 'left'
    }"
  >
    {{ content.text || '文字內容' }}
  </div>
</template>

<script setup>
const props = defineProps({
  content: {
    type: Object,
    required: true
  },
  element: {
    type: Object,
    required: true
  }
})

// ✅ 確保數值自動加上 px 單位
const ensureUnit = (value, defaultValue) => {
  if (!value) return defaultValue
  if (typeof value === 'number') return value + 'px'
  if (typeof value === 'string' && /^\d+$/.test(value)) return value + 'px'
  return value
}
</script>

<style lang="scss" scoped>
.text-element {
  width: 100%;
  line-height: 1.6;
  word-wrap: break-word;
}
</style>
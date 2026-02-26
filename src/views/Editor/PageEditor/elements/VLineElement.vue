<template>
  <div class="vline-element">
    <div 
      class="element-line"
      :style="{
        borderColor: content.color || '#E0E0E0',
        borderWidth: ensureUnit(content.thickness, '2px'),
        height: ensureUnit(content.height, '100px')
      }"
    />
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
.vline-element {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.element-line {
  border: none;
  border-left-style: solid;
}
</style>
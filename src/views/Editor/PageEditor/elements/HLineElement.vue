<template>
  <div class="hline-element">
    <hr 
      class="element-line"
      :style="{
        borderColor: content.color || '#E0E0E0',
        borderWidth: ensureUnit(content.thickness, '2px'),
        width: ensureUnit(content.width, '100%')
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

// ✅ 確保數值自動加上 px 單位（但保留百分比）
const ensureUnit = (value, defaultValue) => {
  if (!value) return defaultValue
  if (typeof value === 'number') return value + 'px'
  if (typeof value === 'string' && /^\d+$/.test(value)) return value + 'px'
  return value
}
</script>

<style lang="scss" scoped>
.hline-element {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 0;
}

.element-line {
  margin: 0;
  border: none;
  border-top-style: solid;
}
</style>
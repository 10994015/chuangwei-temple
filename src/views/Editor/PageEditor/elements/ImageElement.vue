<template>
  <div class="image-element">
    <img 
      :src="content.src || 'https://via.placeholder.com/400x300'" 
      :alt="content.alt || '圖片'"
      :style="{
        width: ensureUnit(content.width, '100%'),
        height: ensureUnit(content.height, 'auto'),
        objectFit: content.objectFit || 'cover'
      }"
      class="element-image"
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

// ✅ 確保數值自動加上 px 單位（但保留 auto 和百分比）
const ensureUnit = (value, defaultValue) => {
  if (!value) return defaultValue
  if (value === 'auto') return 'auto'
  if (typeof value === 'number') return value + 'px'
  if (typeof value === 'string' && /^\d+$/.test(value)) return value + 'px'
  return value
}
</script>

<style lang="scss" scoped>
.image-element {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.element-image {
  max-width: 100%;
  border-radius: 4px;
  display: block;
}
</style>
<template>
  <div class="image-element">
    <img 
      :src="content.src || 'https://via.placeholder.com/400x300'" 
      :alt="content.alt || '圖片'"
      :style="{
        width: content.width || '100%',
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
  height: auto;
  border-radius: 4px;
  display: block;
}
</style>
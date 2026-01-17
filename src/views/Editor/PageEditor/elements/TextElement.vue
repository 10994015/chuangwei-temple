<template>
  <div 
    class="text-element"
    :style="{
      fontSize: content.fontSize || '16px',
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
</script>

<style lang="scss" scoped>
.text-element {
  width: 100%;
  line-height: 1.6;
  word-wrap: break-word;
}
</style>
<template>
  <div class="vline-element">
    <div 
      class="element-line"
      :style="{
        borderColor: content.color || '#E0E0E0',
        borderWidth: content.thickness || '2px',
        height: content.height || '100px'
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
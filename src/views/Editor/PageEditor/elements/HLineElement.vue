<template>
  <div class="hline-element">
    <hr 
      class="element-line"
      :style="{
        borderColor: content.color || '#E0E0E0',
        borderWidth: content.thickness || '2px',
        width: content.width || '100%'
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
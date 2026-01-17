<template>
  <div class="element-image">
    <img :src="data.src" :alt="data.alt" />
  </div>
</template>

<script setup>
defineProps({
  data: { type: Object, required: true }
})
</script>

<style scoped>
.element-image {
  width: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.element-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}
</style>
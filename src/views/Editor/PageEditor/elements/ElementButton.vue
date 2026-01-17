<template>
  <div class="element-button">
    <button :style="buttonStyle">{{ data.text }}</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  data: { type: Object, required: true }
})
const buttonStyle = computed(() => ({
  color: props.data.textColor,
  backgroundColor: props.data.bgColor
}))
</script>

<style scoped>
.element-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  padding: 20px;
}
.element-button button {
  padding: 14px 40px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}
.element-button button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
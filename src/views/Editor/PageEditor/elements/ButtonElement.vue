<template>
  <div 
    class="button-element"
    :style="{ textAlign: content.align || 'center' }"
  >
    <a
      :href="content.link || '#'"
      class="element-button"
      target="_blank"
      :style="{
        color: content.textColor || '#fff',
        backgroundColor: content.bgColor || '#E8572A'
      }"
    >
      {{ content.text || '按鈕文字' }}
    </a>
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
.button-element {
  width: 100%;
  padding: 0.5rem 0;
}

.element-button {
  display: inline-block;
  padding: 12px 32px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
}
</style>
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
        backgroundColor: content.bgColor || '#E8572A',
        fontSize: ensureUnit(content.fontSize, '16px'),
        padding: ensureUnit(content.padding, '12px 32px')
      }"
    >
      {{ content.text || t('buttonElement.defaultText') }}
    </a>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

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
.button-element {
  width: 100%;
  padding: 0.5rem 0;
}

.element-button {
  display: inline-block;
  border-radius: 6px;
  text-decoration: none;
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
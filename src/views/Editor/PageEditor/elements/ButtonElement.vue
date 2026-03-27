<template>
  <div
    class="button-element"
    :style="{ textAlign: content.align || 'center' }"
  >
    <a
      :href="resolvedHref"
      class="element-button"
      :target="isInternalSlug(content.link || element?.value?.url) ? '_self' : '_blank'"
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
import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  content: { type: Object, required: true },
  element: { type: Object, required: true }
})

const previewContext = inject('previewContext', null)

const isInternalSlug = (url) => {
  if (!url || url === '#') return false
  return !url.includes('://') && !url.startsWith('/') && !url.startsWith('#')
}

const resolvedHref = computed(() => {
  const url = props.content.link || props.element?.value?.url || ''
  if (!url || url === '#') return '#'

  if (isInternalSlug(url) && previewContext) {
    const { tenantId, locale, source } = previewContext
    return `/editor/${tenantId}/preview?slug=${url}&locale=${locale}&source=${source}`
  }

  return url
})

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
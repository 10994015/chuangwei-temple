<template>
  <div class="accordion-element">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="accordion-item"
      :class="{ 'is-open': openIndexes.includes(index) }"
    >
      <button
        class="accordion-header"
        :style="{
          color: content.titleColor || 'var(--frame-text-color, #333)',
          fontSize: ensureUnit(content.titleFontSize, '16px'),
          fontWeight: content.titleFontWeight || '600',
        }"
        @click="toggle(index)"
      >
        <span class="accordion-title">{{ item.title || t('accordionElement.titlePlaceholder') }}</span>
        <svg
          class="accordion-icon"
          :class="{ 'is-open': openIndexes.includes(index) }"
          width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div class="accordion-body" :class="{ 'is-open': openIndexes.includes(index) }">
        <div
          class="accordion-content"
          :style="{
            color: content.contentColor || 'var(--frame-text-color, #666)',
            fontSize: ensureUnit(content.contentFontSize, '15px'),
          }"
        >
          <span v-if="isHtml(item.content)" v-html="item.content"></span>
          <template v-else>{{ item.content }}</template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  content: { type: Object, required: true },
  element: { type: Object, required: true },
})

const items = computed(() =>
  Array.isArray(props.element?.value?.items) ? props.element.value.items : []
)

const defaultOpen = computed(() => props.content.defaultOpen ?? false)
const openIndexes = ref(defaultOpen.value ? [0] : [])

const toggle = (index) => {
  const pos = openIndexes.value.indexOf(index)
  if (pos === -1) {
    openIndexes.value = [...openIndexes.value, index]
  } else {
    openIndexes.value = openIndexes.value.filter(i => i !== index)
  }
}

const isHtml = (str) => typeof str === 'string' && /<[a-z][\s\S]*>/i.test(str)

const ensureUnit = (value, defaultValue) => {
  if (!value) return defaultValue
  if (typeof value === 'number') return value + 'px'
  if (typeof value === 'string' && /^\d+$/.test(value)) return value + 'px'
  return value
}
</script>

<style lang="scss" scoped>
.accordion-element {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.accordion-item {
  border: 1px solid var(--frame-border-color, #e8e8e8);
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.10);
    border-color: #d0d0d0;
  }

  &.is-open {
    border-color: #E8572A;
    box-shadow: 0 3px 12px rgba(232, 87, 42, 0.12);
  }
}

.accordion-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  gap: 12px;
  transition: color 0.2s;

  .accordion-item.is-open & {
    color: #E8572A !important;
  }

  &:hover {
    color: #E8572A !important;
  }
}

.accordion-title {
  flex: 1;
  line-height: 1.5;
}

.accordion-icon {
  flex-shrink: 0;
  transition: transform 0.25s ease;
  color: inherit;
  opacity: 0.6;

  .accordion-item.is-open & {
    transform: rotate(180deg);
    opacity: 1;
  }
}

.accordion-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.28s ease;

  &.is-open {
    grid-template-rows: 1fr;
  }
}

.accordion-content {
  overflow: hidden;
  padding: 0 20px;
  transition: padding 0.28s ease;
  line-height: 1.8;
  white-space: pre-line;

  .accordion-body.is-open & {
    padding: 0 20px 20px;
  }
}
</style>
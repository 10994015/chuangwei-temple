<template>
  <section
    class="pv-first-picture"
    :class="{
      'is-selected': isSelected && !selectedSubSection && isEditMode,
      'is-preview': !isEditMode
    }"
    :style="sectionStyle"
    @click.stop="isEditMode ? selectSection(null) : null"
  >

    <div
      class="pv-fp-logo"
      :class="{
        'pv-fp-section': isEditMode,
        'pv-fp-section--selected': isEditMode && selectedSubSection === 'logo'
      }"
      :style="logoPaddingStyle"
      @click.stop="isEditMode ? selectSection('logo') : null"
    >
      <img v-if="logoSrc" :src="logoSrc" alt="Logo" class="pv-fp-logo-img" :style="logoImgStyle" />
      <span v-else class="pv-fp-logo-icon">
        <img src="/images/icon.png" alt="icon" class="pv-fp-logo-icon-img" />
      </span>
      <span v-if="brandName !== ''" class="pv-fp-brand" :style="{ color: brandColor }">{{ brandName }}</span>
    </div>

    <div
      class="pv-fp-hero"
      :class="{
        'pv-fp-section': isEditMode,
        'pv-fp-section--selected': isEditMode && selectedSubSection === 'hero'
      }"
      :style="heroPaddingStyle"
      @click.stop="isEditMode ? selectSection('hero') : null"
    >
      <img
        v-if="heroImgSrc"
        :src="heroImgSrc"
        alt="主標題圖片"
        class="pv-fp-hero-img"
        :style="heroImgStyle"
      />
      <h1
        v-if="displayTitle !== ''"
        class="pv-fp-title"
        :style="titleStyle"
      >{{ displayTitle }}</h1>
      <div v-if="isEditMode && !heroImgSrc && displayTitle === ''" class="pv-fp-hero-placeholder">
        點擊編輯主標題
      </div>
    </div>

    <div
      class="pv-fp-buttons"
      :class="{
        'pv-fp-section': isEditMode,
        'pv-fp-section--selected': isEditMode && selectedSubSection === 'buttons'
      }"
      :style="buttonsPaddingStyle"
      @click.stop="isEditMode ? selectSection('buttons') : null"
    >
      <a
        v-for="(btn, i) in displayButtons"
        :key="i"
        :href="isEditMode ? '#' : resolvedHref(btn)"
        :target="!isEditMode && isInternalSlug(btn.internalSlug || btn.url) ? '_self' : '_blank'"
        class="pv-fp-btn"
        :style="{ borderColor: btn.color || btnColor, color: btn.color || btnColor }"
        @click="isEditMode ? $event.preventDefault() : null"
      >
        {{ btn.text }}
      </a>
    </div>

    <div class="pv-fp-copyright">
      <p>{{ displayCopyright }}</p>
    </div>

  </section>
</template>

<script setup>
import { computed, inject } from 'vue'

const props = defineProps({
  frameData:          { type: Object,  default: () => ({}) },
  frame:              { type: Object,  default: null },
  isSelected:         { type: Boolean, default: false },
  selectedSubSection: { type: String,  default: null },
  isEditMode:         { type: Boolean, default: true },
})

const emit = defineEmits(['select-frame', 'select-sub-section'])

const data = computed(() => props.frameData || props.frame?.data || {})
const previewContext = inject('previewContext', null)

const selectSection = (sub) => {
  emit('select-frame', props.frame)
  emit('select-sub-section', sub)
}

// Logo
const logoSrc    = computed(() => data.value.logoImgSrc || null)
const brandName  = computed(() => data.value.brandName != null ? data.value.brandName : (data.value.tenantName ?? ''))
const brandColor = computed(() => data.value.brandColor || '#E8572A')
const logoWidth  = computed(() => data.value.logoWidth  || null)
const logoHeight = computed(() => data.value.logoHeight || null)
const logoImgStyle = computed(() => ({
  width:     logoWidth.value  ? logoWidth.value  + 'px' : undefined,
  height:    logoHeight.value ? logoHeight.value + 'px' : undefined,
  objectFit: 'contain',
}))

const logoPadding = computed(() => data.value.logoPadding || { top: 0, right: 0, bottom: 0, left: 0 })
const logoPaddingStyle = computed(() => ({
  paddingTop:    (logoPadding.value.top    ?? 0) + 'px',
  paddingRight:  (logoPadding.value.right  ?? 0) + 'px',
  paddingBottom: (logoPadding.value.bottom ?? 0) + 'px',
  paddingLeft:   (logoPadding.value.left   ?? 0) + 'px',
}))

// Hero
const heroImgSrc    = computed(() => data.value.heroImgSrc    || null)
const heroImgWidth  = computed(() => data.value.heroImgWidth  || null)
const heroImgHeight = computed(() => data.value.heroImgHeight || null)
const heroImgStyle  = computed(() => ({
  width:     heroImgWidth.value  ? heroImgWidth.value  + 'px' : '100%',
  height:    heroImgHeight.value ? heroImgHeight.value + 'px' : 'auto',
  maxWidth:  '100%',
  objectFit: 'contain',
}))

const displayTitle  = computed(() => data.value.heroTitle ?? '')
const titleFontSize = computed(() => data.value.titleFontSize || null)
const titleColor    = computed(() => data.value.titleColor || '#1a1a1a')
const titleStyle    = computed(() => ({
  color:    titleColor.value,
  fontSize: titleFontSize.value ? titleFontSize.value + 'px' : undefined,
}))

const heroPadding = computed(() => data.value.heroPadding || { top: 0, right: 0, bottom: 0, left: 0 })
const heroPaddingStyle = computed(() => ({
  paddingTop:    (heroPadding.value.top    ?? 0) + 'px',
  paddingRight:  (heroPadding.value.right  ?? 0) + 'px',
  paddingBottom: (heroPadding.value.bottom ?? 0) + 'px',
  paddingLeft:   (heroPadding.value.left   ?? 0) + 'px',
}))

// Buttons
const isInternalSlug = (url) => {
  if (!url || url === '#') return false
  return !url.includes('://') && !url.startsWith('/') && !url.startsWith('#')
}

const resolvedHref = (btn) => {
  const url = btn.internalSlug || btn.url || '#'
  if (!url || url === '#') return '#'
  if (isInternalSlug(url) && previewContext) {
    const { tenantId, locale, source } = previewContext
    return `/editor/${tenantId}/preview?slug=${url}&locale=${locale}&source=${source}`
  }
  return url
}

const displayButtons = computed(() => {
  if (Array.isArray(data.value.buttons) && data.value.buttons.length > 0) return data.value.buttons
  return [
    { text: '靈籤司',  url: '#' },
    { text: '宮廟地圖', url: '#' },
    { text: '進入首頁', url: '#' },
  ]
})
const btnColor = computed(() => data.value.btnColor || '#E8572A')

const buttonsPadding = computed(() => data.value.buttonsPadding || { top: 0, right: 0, bottom: 0, left: 0 })
const buttonsPaddingStyle = computed(() => ({
  paddingTop:    (buttonsPadding.value.top    ?? 0) + 'px',
  paddingRight:  (buttonsPadding.value.right  ?? 0) + 'px',
  paddingBottom: (buttonsPadding.value.bottom ?? 0) + 'px',
  paddingLeft:   (buttonsPadding.value.left   ?? 0) + 'px',
}))

// Copyright
const displayCopyright = computed(() =>
  data.value.copyright ||
  `Copyright © ${new Date().getFullYear()} 創蔚國際有限公司 All Rights Reserved.`
)

const sectionStyle = computed(() => ({ background: 'transparent' }))
</script>

<style lang="scss" scoped>
.pv-first-picture {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem 2rem;
  box-sizing: border-box;
  position: relative;
  gap: 0;
  transition: outline 0.15s;

  &.is-selected {
    outline: 2px solid #E8572A;
    outline-offset: -2px;
  }
}

.pv-fp-section {
  position: relative;
  border-radius: 6px;
  transition: outline 0.15s;
  cursor: pointer;

  &:hover {
    outline: 1px dashed rgba(232, 87, 42, 0.4);
    outline-offset: 6px;
  }

  &.pv-fp-section--selected {
    outline: 2px solid #E8572A;
    outline-offset: 6px;
  }
}

.is-preview {
  cursor: default;

  .pv-fp-logo,
  .pv-fp-hero,
  .pv-fp-buttons {
    cursor: default;

    &:hover {
      outline: none;
    }
  }
}

.pv-fp-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1.2rem;
}

.pv-fp-logo-img {
  max-width: 1000px;
  max-height: 1000px;
  object-fit: contain;
}

.pv-fp-logo-icon {
  display: flex;
  align-items: center;
}

.pv-fp-logo-icon-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.pv-fp-brand {
  font-size: 22px;
  font-weight: 700;
  color: #E8572A;
  letter-spacing: 1px;
}

.pv-fp-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
  margin-bottom: 1.2rem;
  min-height: 80px;
  min-width: 200px;
  justify-content: center;
}

.pv-fp-hero-img {
  display: block;
}

.pv-fp-title {
  font-size: 64px;
  font-weight: 900;
  line-height: 1.25;
  color: #1a1a1a;
  margin: 0;
  white-space: pre-line;
  letter-spacing: -0.5px;
  font-family: 'Noto Serif TC', 'Source Han Serif TC', '思源宋體', serif;
  text-align: center;
}

.pv-fp-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 4rem;
}

.pv-fp-btn {
  display: inline-block;
  padding: 12px 32px;
  border: 1.5px solid #E8572A;
  border-radius: 28px;
  background: transparent;
  color: #E8572A;
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.22s;
  letter-spacing: 0.5px;

  &:hover {
    background: #E8572A;
    color: #fff !important;
  }
}

.pv-fp-copyright {
  position: absolute;
  bottom: 1.5rem;
  left: 0;
  right: 0;
  text-align: center;

  p {
    margin: 0;
    font-size: 13px;
    color: #aaa;
  }
}

.pv-fp-hero-placeholder {
  font-size: 14px;
  color: #ccc;
  border: 1px dashed #ddd;
  padding: 16px 32px;
  border-radius: 8px;
  pointer-events: none;
}

@media (max-width: 768px) {
  .pv-first-picture { padding: 2.5rem 1.25rem 2rem; }
  .pv-fp-logo       { margin-bottom: 2.5rem; }
  .pv-fp-brand      { font-size: 18px; }
  .pv-fp-hero       { gap: 1rem; margin-bottom: 2.5rem; }
  .pv-fp-buttons    { gap: 12px; margin-bottom: 3rem; }
  .pv-fp-btn        { padding: 10px 24px; font-size: 14px; }
}
</style>
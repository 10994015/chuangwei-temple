<template>
  <footer class="pv-footer" :class="`device-${device}`" :style="footerStyle">
    <div class="pv-footer-container">

      <div class="pv-footer-content">

        <!-- 左側 Logo -->
        <div class="pv-footer-brand">
          <div class="pv-footer-logo">
            <img v-if="logoSrc" :src="logoSrc" alt="Logo" class="pv-logo-img" />
            <span v-else class="pv-logo-icon">
              <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="6" fill="#E8572A"/>
                <text x="14" y="20" text-anchor="middle" font-size="14" fill="#fff" font-weight="bold">宮</text>
              </svg>
            </span>
            <span v-if="displayName" class="pv-logo-name">{{ displayName }}</span>
          </div>
        </div>

        <!-- 中間連結欄 -->
        <div class="pv-footer-links-wrapper">
          <div
            v-for="(column, colIndex) in columns"
            :key="colIndex"
            class="pv-footer-column"
          >
            <a
              v-for="item in column"
              :key="item"
              href="#"
              class="pv-footer-link"
            >{{ item }}</a>
          </div>
        </div>

        <!-- 右側聯絡資訊 -->
        <div class="pv-footer-contact-col">
          <h4 class="pv-contact-heading">聯絡我們</h4>
          <p v-if="displayPhone"   class="pv-contact-item">電話：{{ displayPhone }}</p>
          <p v-if="displayAddress" class="pv-contact-item">地址：{{ displayAddress }}</p>
          <p v-if="displayEmail"   class="pv-contact-item">Email：{{ displayEmail }}</p>
        </div>

      </div>

      <!-- 分隔線 -->
      <div class="pv-footer-divider"></div>

      <!-- Copyright -->
      <div class="pv-footer-bottom">
        <p>{{ displayCopyright }}</p>
      </div>

    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tenantName:      { type: String, default: null },
  tenantPhone:     { type: String, default: null },
  tenantAddress:   { type: String, default: null },
  tenantEmail:     { type: String, default: null },
  brandName:       { type: String, default: null },
  copyright:       { type: String, default: null },
  logoImgSrc:      { type: String, default: null },
  columns: {
    type: Array,
    default: () => [
      ['關於我們', '最新消息', '關於數位生態'],
      ['寶緣堂精選', '宮廟地圖', '靈籤司'],
    ]
  },
  device:          { type: String, default: 'desktop' },
  footerBgColor:   { type: String, default: null },
  footerTextColor: { type: String, default: null },
})

const displayName = computed(() => props.tenantName || props.brandName || '')
const displayPhone   = computed(() => props.tenantPhone   || null)
const displayAddress = computed(() => props.tenantAddress || null)
const displayEmail   = computed(() => props.tenantEmail   || null)
const logoSrc = computed(() => props.logoImgSrc || null)

const displayCopyright = computed(() =>
  props.copyright || `Copyright © ${new Date().getFullYear()} ${displayName.value} All Rights Reserved.`
)

const footerStyle = computed(() => {
  const style = {}
  if (props.footerBgColor)   style['background']          = props.footerBgColor
  if (props.footerTextColor) style['--pv-footer-text']    = props.footerTextColor
  return style
})
</script>

<style lang="scss" scoped>
.pv-footer {
  background: #1e1e1e;
  color: var(--pv-footer-text, #fff);
  padding: 3rem 0 0;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.pv-footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

// 主體三欄
.pv-footer-content {
  display: grid;
  grid-template-columns: 2fr 3fr 2fr;
  gap: 4rem;
  padding-bottom: 2.5rem;
  align-items: start;
}

// 左側 Logo
.pv-footer-brand {
  display: flex;
  flex-direction: column;
}

.pv-footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pv-logo-img {
  max-width: 120px;
  max-height: 40px;
  object-fit: contain;
}

.pv-logo-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.pv-logo-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--pv-footer-text, #fff);
  white-space: nowrap;
  letter-spacing: 1px;
}

// 中間連結欄
.pv-footer-links-wrapper {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 2rem;
}

.pv-footer-column {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.pv-footer-link {
  font-size: 14px;
  color: var(--pv-footer-text, rgba(255, 255, 255, 0.7));
  opacity: 0.75;
  text-decoration: none;
  transition: opacity 0.2s;
  white-space: nowrap;

  &:hover { opacity: 1; }
}

// 右側聯絡資訊
.pv-footer-contact-col {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.pv-contact-heading {
  font-size: 15px;
  font-weight: 600;
  color: var(--pv-footer-text, #fff);
  margin: 0 0 0.25rem;
}

.pv-contact-item {
  font-size: 14px;
  color: var(--pv-footer-text, rgba(255, 255, 255, 0.7));
  opacity: 0.75;
  margin: 0;
  line-height: 1.7;
}

// 分隔線
.pv-footer-divider {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

// Copyright
.pv-footer-bottom {
  padding: 1.5rem 0;
  text-align: center;

  p {
    margin: 0;
    font-size: 13px;
    color: var(--pv-footer-text, rgba(255, 255, 255, 0.45));
    opacity: 0.6;
  }
}

// 平板
.pv-footer.device-tablet {
  padding: 2rem 0 0;

  .pv-footer-container { padding: 0 1.5rem; }
  .pv-footer-content {
    grid-template-columns: 1fr 2fr 1.5fr;
    gap: 2rem;
  }
  .pv-logo-name    { font-size: 17px; }
  .pv-footer-link  { font-size: 13px; }
  .pv-contact-item { font-size: 13px; }
}

// 手機
.pv-footer.device-mobile {
  padding: 1.5rem 0 0;

  .pv-footer-container { padding: 0 1.25rem; }
  .pv-footer-content {
    grid-template-columns: 1fr;
    gap: 1.75rem;
    padding-bottom: 1.5rem;
  }
  .pv-footer-links-wrapper {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem 1.5rem;
  }
  .pv-logo-name    { font-size: 17px; }
  .pv-footer-link  { font-size: 13px; }
  .pv-contact-item { font-size: 13px; }
  .pv-footer-bottom { padding: 1rem 0; p { font-size: 12px; } }
}
</style>
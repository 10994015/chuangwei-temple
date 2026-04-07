<template>
  <section class="pv-services-section" :class="`device-${device}`">
    <div class="pv-container">

      <!-- 標題列 -->
      <div class="pv-section-header">
        <div class="pv-header-left">
          <h2 class="pv-section-title">{{ t('eventsBasemap.serviceTitle') || '精選結緣品' }}</h2>
          <p class="pv-section-subtitle">{{ t('eventsBasemap.serviceSubtitle') || '線上預約宮廟服務，虔誠祈福更便利' }}</p>
        </div>
        <div class="pv-header-right">
          <a href="#" class="pv-view-all" @click.prevent="$emit('view-all')">
            {{ t('eventsBasemap.viewMore') || '查看更多' }}
          </a>
          <button class="pv-nav-btn" @click="prevPage" aria-label="上一頁">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button class="pv-nav-btn" @click="nextPage" aria-label="下一頁">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 服務 Grid -->
      <div class="pv-services-grid">
        <div
          v-for="item in displayServices"
          :key="item.id"
          class="pv-service-card"
          @click="$emit('view-detail', item)"
        >
          <!-- 圖片區 -->
          <div class="pv-service-image">
            <img
              v-if="item.image && !item.imageFailed"
              :src="item.image"
              :alt="item.title"
              class="pv-image"
              @error="item.imageFailed = true"
            />
            <div v-else class="pv-image-placeholder">
              <span>暫無圖片</span>
            </div>

          </div>

          <!-- 文字資訊 -->
          <div class="pv-service-info">
            <!-- badge 文字區右上角 -->
            <span v-if="item.badge" class="pv-badge" :class="item.badgeClass">
              {{ item.badge }}
            </span>
            <p class="pv-service-source">{{ item.source }}</p>
            <h3 class="pv-service-title">{{ item.title }}</h3>
            <div class="pv-service-footer">
              <p v-if="item.description" class="pv-service-desc">{{ item.description }}</p>
              <button class="pv-cart-btn" @click.stop="$emit('add-to-cart', item)" aria-label="預約">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  services: { type: Array,  default: () => [] },
  device:   { type: String, default: 'desktop' },
})

const emit = defineEmits(['view-detail', 'view-all', 'add-to-cart'])

const DEFAULT_SERVICES = [
  { id: 1, name: '安太歲祈福服務',   tenantName: '宮廟服務', description: '為信眾進行安太歲儀式，化解流年不順', imgSrc: null, labels: ['熱門'] },
  { id: 2, name: '光明燈點燈服務',   tenantName: '宮廟服務', description: '點燃光明燈，照亮前途，招財納福', imgSrc: null, labels: ['推薦'] },
  { id: 3, name: '求籤解籤諮詢',     tenantName: '宮廟服務', description: '提供專業籤詩解析，指引人生方向', imgSrc: null, labels: [] },
  { id: 4, name: '祈福法會參與',     tenantName: '宮廟服務', description: '參與法會共同祈福，凝聚信眾力量', imgSrc: null, labels: ['新品'] },
]

const pageSize = 4
const pageIndex = ref(0)

const sourceServices = computed(() =>
  props.services.length > 0 ? props.services : DEFAULT_SERVICES
)

const totalPages = computed(() => Math.max(1, Math.ceil(sourceServices.value.length / pageSize)))

const nextPage = () => {
  if (sourceServices.value.length <= pageSize) return
  pageIndex.value = (pageIndex.value + 1) % totalPages.value
}

const prevPage = () => {
  if (sourceServices.value.length <= pageSize) return
  pageIndex.value = (pageIndex.value - 1 + totalPages.value) % totalPages.value
}

const badgeClassMap = (labels) => {
  const label = labels?.[0] || ''
  if (label === '熱門' || label === 'hot')         return 'hot'
  if (label === '推薦' || label === 'recommended') return 'recommended'
  if (label === '新品' || label === 'new')         return 'new'
  return 'default'
}

const displayServices = computed(() => {
  const start = pageIndex.value * pageSize
  return sourceServices.value.slice(start, start + pageSize).map(s => ({
    id:          s.id,
    title:       s.name || '',
    source:      s.tenantName || '',
    description: s.description || '',
    link:        s.link || '#',
    image:       s.imgSrc || null,
    imageFailed: false,
    badge:       Array.isArray(s.labels) && s.labels.length ? s.labels[0] : null,
    badgeClass:  badgeClassMap(s.labels),
  }))
})
</script>

<style lang="scss" scoped>
.pv-services-section {
  padding: 3rem 0 4rem;
  background: transparent;
}

.pv-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

// 標題列
.pv-section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.75rem;
}

.pv-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pv-section-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--frame-heading-color, #222);
  margin: 0;
  line-height: 1.2;
}

.pv-section-subtitle {
  font-size: 13px;
  color: var(--frame-text-muted, #999);
  margin: 0;
}

.pv-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pv-view-all {
  padding: 8px 20px;
  border: 1.5px solid var(--frame-border-color, #ddd);
  border-radius: 20px;
  font-size: 14px;
  color: var(--frame-text-color, #444);
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    border-color: #E8572A;
    color: #E8572A;
  }
}

.pv-nav-btn {
  width: 36px;
  height: 36px;
  border: 1.5px solid var(--frame-border-color, #ddd);
  border-radius: 50%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--frame-text-color, #444);

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    border-color: #E8572A;
    color: #E8572A;
  }
}

// 服務 Grid：4 欄
.pv-services-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

// 服務卡片
.pv-service-card {
  background: var(--frame-card-bg, #fff);
  border: 1px solid var(--frame-border-color, #eee);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

// 圖片區
.pv-service-image {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #f5f5f5;
}

.pv-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;

  .pv-service-card:hover & {
    transform: scale(1.03);
  }
}

.pv-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--frame-tag-bg, #f0f0f0);

  span {
    font-size: 13px;
    color: var(--frame-text-muted, #bbb);
  }
}

// badge 文字區右上角
.pv-badge {
  position: absolute;
  top: 14px;
  right: 16px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  line-height: 1.4;

  &.hot         { background: #dc3545; }
  &.recommended { background: #1a73e8; }
  &.new         { background: #2ecc71; }
  &.default     { background: #E8572A; }
}

// 文字資訊
.pv-service-info {
  position: relative;
  padding: 14px 16px 16px;
}

.pv-service-source {
  font-size: 13px;
  color: var(--frame-text-muted, #999);
  margin: 0 0 4px;
}

.pv-service-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--frame-text-color, #222);
  margin: 0 0 8px;
  line-height: 1.3;
}

.pv-service-desc {
  font-size: 13px;
  color: var(--frame-text-muted, #999);
  margin: 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.pv-service-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 8px;
  margin-top: 10px;
}

.pv-cart-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #E8572A;
  transition: transform 0.2s;
  padding: 0;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover { transform: scale(1.15); }
}

// 響應式
.pv-services-section.device-tablet {
  .pv-container     { padding: 0 1.5rem; }
  .pv-services-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .pv-section-title { font-size: 22px; }
}

.pv-services-section.device-mobile {
  padding: 2rem 0 2.5rem;

  .pv-container { padding: 0 1rem; }

  .pv-section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .pv-header-right { align-self: flex-end; }

  .pv-services-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .pv-section-title  { font-size: 20px; }
  .pv-service-title  { font-size: 15px; }
  .pv-service-source { font-size: 12px; }
  .pv-service-price  { font-size: 14px; }
}

@media (max-width: 1024px) {
  .pv-services-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .pv-services-grid { grid-template-columns: 1fr; }
}
</style>
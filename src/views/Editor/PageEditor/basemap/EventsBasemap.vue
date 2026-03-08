<template>
  <section class="events-section" :class="`device-${device}`">
    <div class="container">

      <!-- 標題列 -->
      <div class="section-header">
        <h2 class="section-title">慶典活動</h2>
      </div>

      <!-- 活動 Grid — 固定 3 筆 -->
      <div class="events-grid">
        <div
          v-for="event in displayEvents"
          :key="event.id"
          class="event-card"
          @click="viewEventDetail(event)"
        >
          <div class="event-image">
            <img
              v-if="event.image && !event.imageFailed"
              :src="event.image"
              :alt="event.title"
              class="image"
              @error="event.imageFailed = true"
            />
            <div v-else class="image-placeholder">
              <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="placeholder-icon">
                <rect x="8" y="14" width="64" height="48" rx="4" stroke="#bbb" stroke-width="3"/>
                <circle cx="28" cy="32" r="7" stroke="#bbb" stroke-width="3"/>
                <path d="M8 50l18-16 14 14 10-10 18 18" stroke="#bbb" stroke-width="3" stroke-linejoin="round"/>
              </svg>
              <span class="placeholder-text">活動圖片</span>
            </div>
          </div>

          <div class="event-info">
            <div class="event-tags" v-if="event.tags && event.tags.length > 0">
              <span
                v-for="tag in event.tags"
                :key="tag"
                class="event-tag"
                :class="getTagClass(tag)"
              >{{ tag }}</span>
            </div>
            <div v-else class="tags-placeholder"></div>

            <h3 class="event-title">{{ event.title }}</h3>

            <div class="event-details">
              <div class="event-detail">
                <svg class="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>{{ event.date }}</span>
              </div>
              <div class="event-detail">
                <svg class="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{{ event.time }}</span>
              </div>
              <div class="event-detail">
                <svg class="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{{ event.location }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 查看更多 -->
      <div class="view-more-wrap">
        <a href="#" class="view-more-btn" @click.prevent="$emit('view-all')">
          查看更多活動
        </a>
      </div>

    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  eventsList: {
    type: Array,
    default: () => [
      { id: 1, title: '農曆九月初九 天公聖誕慶典', date: '2024年12月10日', time: '上午8:00 - 下午5:00', location: '本宮大殿',  tags: ['熱門', '推薦'], image: null },
      { id: 2, title: '冬至祭祖法會',               date: '2024年12月21日', time: '上午9:00 - 下午3:00', location: '本宮後殿',  tags: [],              image: null },
      { id: 3, title: '新春開廟門迎春',             date: '2025年1月29日',  time: '凌晨12:00',           location: '本宮',       tags: ['熱門'],        image: null },
      { id: 4, title: '元宵燈會活動',               date: '2025年2月12日',  time: '下午6:00 - 晚上10:00',location: '本宮廣場',  tags: [],              image: null },
      { id: 5, title: '清明祭祖大典',               date: '2025年4月4日',   time: '上午8:00 - 下午4:00', location: '本宮大殿',  tags: [],              image: null },
      { id: 6, title: '端午祈福慶典',               date: '2025年5月31日',  time: '上午9:00 - 下午5:00', location: '本宮',       tags: [],              image: null },
    ]
  },
  device: { type: String, default: 'desktop' }
})

const emit = defineEmits(['view-detail', 'view-all'])
const displayEvents = computed(() => props.eventsList.slice(0, 3))

const getTagClass = (tag) => {
  const tagMap = { '熱門': 'hot', '推薦': 'recommended', '重要': 'important', '法會': 'ceremony' }
  return tagMap[tag] || 'default'
}

const viewEventDetail = (event) => emit('view-detail', event)
</script>

<style lang="scss" scoped>
.events-section {
  padding: 3rem 0 4rem;
  background: transparent;
}

.container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header { margin-bottom: 2rem; }

.section-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--frame-heading-color, #222);
  margin: 0;
}

/* ==================== 活動 Grid ==================== */
.events-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* ==================== 活動卡片 ==================== */
.event-card {
  background: var(--frame-card-bg, #fff);
  border: 1px solid var(--frame-border-color, #e0e0e0);
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s;

  &:hover { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); }
}

.event-image {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--frame-tag-bg, #e8e8e8);
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
  .event-card:hover & { transform: scale(1.04); }
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--frame-tag-bg, #e8e8e8);
  gap: 12px;
}

.placeholder-icon { width: 80px; height: 80px; }
.placeholder-text { font-size: 13px; color: var(--frame-text-muted, #aaa); }

/* 資訊區 */
.event-info { padding: 20px 24px 24px; }

.event-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.tags-placeholder {
  height: 26px;
  margin-bottom: 12px;
}

.event-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  line-height: 1.5;

  &.hot         { background: #dc3545; }
  &.recommended { background: #1a73e8; }
  &.important   { background: #f39c12; }
  &.ceremony    { background: #9b59b6; }
  &.default     { background: #95a5a6; }
}

.event-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--frame-text-color, #222);
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-detail {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--frame-text-secondary, #666);
  line-height: 1.5;
  span { flex: 1; }
}

.detail-icon {
  width: 16px;
  height: 16px;
  color: var(--frame-text-muted, #999);
  flex-shrink: 0;
}

/* ==================== 查看更多 ==================== */
.view-more-wrap {
  display: flex;
  justify-content: center;
  margin-top: 36px;
}

.view-more-btn {
  display: inline-block;
  padding: 10px 40px;
  border: 1px solid var(--frame-link-color, #8b6f47);
  border-radius: 4px;
  color: var(--frame-link-color, #8b6f47);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  background: transparent;

  &:hover {
    background: var(--frame-link-color, #8b6f47);
    color: #fff;
  }
}

/* ==================== RWD ==================== */
.events-section.device-tablet {
  .container   { padding: 0 1.25rem; }
  .events-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .event-title { font-size: 16px; }
  .event-info  { padding: 16px 18px 20px; }
}

.events-section.device-mobile {
  padding: 1.5rem 0 2.5rem;
  .container    { padding: 0 0.75rem; }
  .events-grid  { grid-template-columns: 1fr; gap: 14px; }
  .event-info   { padding: 14px 16px 18px; }
  .event-title  { font-size: 15px; margin-bottom: 12px; }
  .event-detail { font-size: 13px; gap: 8px; }
  .detail-icon  { width: 14px; height: 14px; }
  .view-more-wrap { margin-top: 24px; }
}
</style>
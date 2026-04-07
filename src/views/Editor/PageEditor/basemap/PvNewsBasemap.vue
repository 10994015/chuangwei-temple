<template>
  <section class="pv-news-section" :class="`device-${device}`">
    <div class="pv-container">

      <div class="pv-section-header">
        <div class="pv-header-left">
          <h2 class="pv-section-title">{{ t('newsBasemap.title') }}</h2>
          <p class="pv-section-subtitle">掌握宮廟活動與文化資訊</p>
        </div>
        <a href="#" class="pv-view-all">{{ t('newsBasemap.viewAll') }}</a>
      </div>

      <div class="pv-news-list">
        <div
          v-for="news in mappedPosts"
          :key="news.id"
          class="pv-news-item"
        >
          <div class="pv-news-tag">{{ news.tag }}</div>
          <div class="pv-news-title">{{ news.title }}</div>
          <div class="pv-news-date">{{ news.date }}</div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  posts:  { type: Array,  default: () => [] },
  device: { type: String, default: 'desktop' },
})

const DEFAULT_POSTS = [
  { id: 1, tag: '祈福活動', title: '2025年春節祈福法會活動公告', date: '2025-01-15' },
  { id: 2, tag: '廟會文化', title: '媽祖遶境文化節活動報名開始', date: '2025-01-10' },
  { id: 3, tag: '宮廟公告', title: '元宵節燈謎晚會暨祈福儀式', date: '2025-01-05' },
  { id: 4, tag: '祈福活動', title: '求籤解籤服務時間調整公告', date: '2024-12-28' },
  { id: 5, tag: '廟會文化', title: '歲末感恩祭典暨文化展覽活動', date: '2024-12-20' },
]

const mappedPosts = computed(() => {
  const source = props.posts.length > 0 ? props.posts : DEFAULT_POSTS
  return source.map(n => ({
    id:    n.id,
    tag:   n.type || n.tag || '祈福活動',
    title: n.title || '',
    date:  n.createdAt ? n.createdAt.slice(0, 10) : (n.date || ''),
  }))
})
</script>

<style lang="scss" scoped>
.pv-news-section {
  padding: 3.5rem 0;
  background: transparent;
}

.pv-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

// 頂部標題列
.pv-section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  padding-bottom: 1.25rem;
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

.pv-view-all {
  padding: 8px 20px;
  border: 1.5px solid var(--frame-border-color, #ddd);
  border-radius: 20px;
  font-size: 14px;
  color: var(--frame-text-color, #444);
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    border-color: #E8572A;
    color: #E8572A;
  }
}

// 列表
.pv-news-list {
  display: flex;
  flex-direction: column;
}

.pv-news-item {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid var(--frame-border-color, #f0f0f0);
  cursor: pointer;
  transition: background 0.15s;

  &:first-child { border-top: 1px solid var(--frame-border-color, #f0f0f0); }

  &:hover {
    .pv-news-title { color: #E8572A; }
  }
}

// 橘紅色膠囊 tag
.pv-news-tag {
  flex-shrink: 0;
  padding: 5px 14px;
  border-radius: 20px;
  background: #E8572A;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.pv-news-title {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  color: var(--frame-text-color, #333);
  transition: color 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pv-news-date {
  flex-shrink: 0;
  font-size: 14px;
  color: var(--frame-text-muted, #aaa);
  white-space: nowrap;
}

// 響應式
.pv-news-section.device-tablet {
  padding: 2.5rem 0;
  .pv-container { padding: 0 1.5rem; }
  .pv-section-title { font-size: 22px; }
  .pv-news-title { font-size: 15px; }
}

.pv-news-section.device-mobile {
  padding: 2rem 0;

  .pv-container { padding: 0 1rem; }

  .pv-section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .pv-section-title { font-size: 20px; }

  .pv-news-item {
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
  }

  .pv-news-title {
    font-size: 14px;
    flex-basis: 100%;
    order: 2;
  }

  .pv-news-tag { order: 1; font-size: 12px; padding: 4px 10px; }
  .pv-news-date { order: 3; font-size: 12px; flex-basis: 100%; }
}
</style>
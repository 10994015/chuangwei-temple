<template>
  <section class="news-section" :class="`device-${device}`">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">{{ t('newsBasemap.title') }}</h2>
        <a href="#" class="view-all">{{ t('newsBasemap.viewAll') }}</a>
      </div>
      
      <div class="news-list">
        <div 
          v-for="news in mappedPosts"
          :key="news.id"
          class="news-item"
        >
          <div class="news-tag" :class="news.tagClass">{{ news.tag }}</div>
          <div class="news-content">
            <h3 class="news-title">{{ news.title }}</h3>
            <p class="news-description">{{ news.description }}</p>
          </div>
          <div class="news-date">{{ news.date }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  posts:  { type: Array,  default: () => [] },  // frame.data.posts
  device: { type: String, default: 'desktop' }
})

const { t } = useI18n()

const mappedPosts = computed(() =>
  props.posts.map(n => ({
    id:          n.id,
    tag:         n.type || '',
    tagClass:    'notice',
    title:       n.title || '',
    description: n.content || '',
    date:        n.createdAt ? n.createdAt.slice(0, 10) : '',
  }))
)
</script>

<style lang="scss" scoped>
.news-section {
  padding: 4rem 0;
  background: transparent;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

/* ===== 文字色套用 CSS 變數 (fallback = 原始固定色) ===== */
.section-title {
  font-size: 28px;
  font-weight: 500;
  color: var(--frame-heading-color, #333);
}

.view-all {
  color: var(--frame-text-muted, #666);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
  &:hover { color: var(--frame-link-color, #8b6f47); }
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.news-item {
  background: var(--frame-card-bg, #fff);
  border: 1px solid var(--frame-border-color, transparent);
  padding: 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  transition: box-shadow 0.3s;
  cursor: pointer;
  &:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
}

.news-tag {
  padding: 0.4rem 1rem;
  border-radius: 4px;
  font-size: 13px;
  white-space: nowrap;
  color: #fff;
  font-weight: 500;
  flex-shrink: 0;
  &.festival     { background: #8b6f47; }
  &.notice       { background: #a0826d; }
  &.announcement { background: #b8956a; }
}

.news-content { flex: 1; min-width: 0; }

.news-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--frame-text-color, #333);
}

.news-description {
  font-size: 14px;
  color: var(--frame-text-secondary, #666);
  line-height: 1.6;
}

.news-date {
  color: var(--frame-text-muted, #999);
  font-size: 14px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ==================== 響應式 ==================== */
.news-section.device-tablet {
  padding: 2.5rem 0;
  .container { padding: 0 1.25rem; }
  .section-title { font-size: 24px; }
  .news-item { padding: 1.25rem; gap: 1rem; }
  .news-title { font-size: 16px; }
  .news-description { font-size: 13px; }
}

.news-section.device-mobile {
  padding: 2rem 0;
  .container { padding: 0 0.75rem; }
  .section-title { font-size: 20px; }
  .news-list { gap: 0.75rem; }
  .news-item {
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    &:hover { transform: none; }
  }
  .news-tag { align-self: flex-start; font-size: 12px; padding: 0.3rem 0.8rem; }
  .news-title { font-size: 15px; margin-bottom: 0.4rem; }
  .news-description { font-size: 13px; }
  .news-date { font-size: 12px; color: var(--frame-text-muted, #bbb); }
}
</style>
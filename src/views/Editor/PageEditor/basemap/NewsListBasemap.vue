<template>
  <section class="news-list-section" :class="`device-${device}`">
    <div class="container">
      <!-- 分類標籤 -->
      <div class="filter-bar">
        <button 
          v-for="category in categories" 
          :key="category.id"
          class="filter-btn"
          :class="{ active: selectedCategory === category.id }"
          @click="selectedCategory = category.id"
        >
          {{ category.name }}
        </button>
      </div>

      <!-- 分隔線 -->
      <hr class="divider" />

      <!-- 消息列表 -->
      <div class="news-list">
        <div
          v-for="news in pagedNews"
          :key="news.id"
          class="news-item"
          @click="viewNewsDetail(news)"
        >
          <div class="news-tag" :class="news.tagClass">{{ news.tag }}</div>
          <div class="news-content">
            <h3 class="news-title">{{ news.title }}</h3>
            <p class="news-description">{{ news.description }}</p>
          </div>
          <div class="news-date">{{ news.date }}</div>
        </div>
      </div>

      <!-- 分頁 -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="page-btn page-nav"
          :class="{ disabled: currentPage === 1 }"
          :disabled="currentPage === 1"
          @click="prevPage"
        >{{ t('newsListBasemap.prev') }}</button>

        <template v-for="page in pageNumbers" :key="page">
          <span v-if="page === '...'" class="page-ellipsis">...</span>
          <button
            v-else
            class="page-btn"
            :class="{ active: currentPage === page }"
            @click="goToPage(page)"
          >{{ page }}</button>
        </template>

        <button
          class="page-btn page-nav"
          :class="{ disabled: currentPage === totalPages }"
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >{{ t('newsListBasemap.next') }}</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  // 後端 frame.data 直接傳入的欄位
  postCategories: { type: Array,  default: () => [] },           // ["法會公告","活動消息","宮務公告"]
  postList:       { type: Object, default: () => ({ data: [], total: 0, totalPages: 1 }) },
  pageSize:       { type: Number, default: 5 },
  device:         { type: String, default: 'desktop' }
})

const emit = defineEmits(['view-detail'])

// 分類按鈕：從 API 拿到字串陣列，轉成 { id, name }
const categories = computed(() => [
  { id: 'all', name: t('newsListBasemap.catAll') },
  ...props.postCategories.map(c => ({ id: c, name: c })),
])

// 把 API 欄位對應成元件格式
const mappedNews = computed(() =>
  (props.postList?.data || []).map(n => ({
    id:          n.id,
    tag:         n.type || '',
    tagClass:    'notice',
    title:       n.title || '',
    description: n.content || '',
    date:        n.createdAt ? n.createdAt.slice(0, 10) : '',
  }))
)

const selectedCategory = ref('all')
const currentPage = ref(1)

const filteredNews = computed(() =>
  selectedCategory.value === 'all'
    ? mappedNews.value
    : mappedNews.value.filter(n => n.tag === selectedCategory.value)
)

const totalPages = computed(() => Math.max(1, Math.ceil(filteredNews.value.length / props.pageSize)))

const pagedNews = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize
  return filteredNews.value.slice(start, start + props.pageSize)
})

const goToPage = (page) => { if (page < 1 || page > totalPages.value) return; currentPage.value = page }
const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }

const pageNumbers = computed(() => {
  const total = totalPages.value
  const cur   = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = []
  if (cur <= 4) {
    pages.push(...[1, 2, 3, 4, 5], '...', total)
  } else if (cur >= total - 3) {
    pages.push(1, '...', ...[total-4, total-3, total-2, total-1, total])
  } else {
    pages.push(1, '...', cur-1, cur, cur+1, '...', total)
  }
  return pages
})

const viewNewsDetail = (news) => {
  console.log('查看消息詳情:', news)
  emit('view-detail', news)
}
</script>

<style lang="scss" scoped>
.news-list-section {
  padding: 2rem 0 4rem;
  background: transparent;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* ==================== 分類 Tab ==================== */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 24px;
  border: none;
  background: transparent;
  font-size: 15px;
  color: var(--frame-text-secondary, #666);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover  { color: var(--frame-text-color, #333); }
  &.active { background: var(--frame-link-color, #8b6f47); color: #fff; font-weight: 500; }
}

.divider {
  border: none;
  border-top: 1px solid var(--frame-border-color, #e5e5e5);
  margin: 16px 0 32px;
}

/* ==================== 消息列表 ==================== */
.news-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 3rem;
}

.news-item {
  background: var(--frame-card-bg, #fff);
  border: 1px solid var(--frame-border-color, transparent);
  padding: 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateX(4px);
  }
}

.news-tag {
  padding: 0.4rem 1rem;
  border-radius: 4px;
  font-size: 13px;
  white-space: nowrap;
  color: #fff;
  font-weight: 500;
  flex-shrink: 0;
  background: var(--frame-tag-bg, transparent);

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
  transition: color 0.2s;
  .news-item:hover & { color: var(--frame-link-color, #8b7355); }
}

.news-description {
  font-size: 14px;
  color: var(--frame-text-secondary, #666);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-date {
  color: var(--frame-text-muted, #999);
  font-size: 14px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ==================== 頁碼 ==================== */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  margin-top: 48px;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--frame-text-secondary, #555);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(.disabled):not(.active) {
    background: var(--frame-tag-bg, #f5f5f5);
    color: var(--frame-text-color, #333);
  }

  &.active {
    background: var(--frame-link-color, #8b6f47);
    color: #fff;
    font-weight: 500;
  }

  &.page-nav {
    color: var(--frame-text-muted, #999);
    font-size: 13px;
    min-width: auto;
    padding: 0 14px;
    &.disabled { color: var(--frame-text-muted, #ccc); opacity: 0.5; cursor: default; }
  }
}

.page-ellipsis {
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--frame-text-muted, #bbb);
  letter-spacing: 2px;
}

/* ==================== 響應式 ==================== */
.news-list-section.device-tablet {
  .container { padding: 0 1.25rem; }
  .filter-btn { font-size: 14px; padding: 8px 18px; }
  .news-item { gap: 1.25rem; padding: 1.25rem; }
  .news-title { font-size: 16px; }
  .page-btn { min-width: 32px; height: 32px; font-size: 13px; }
}

.news-list-section.device-mobile {
  padding: 1rem 0 2rem;
  .container { padding: 0 0.75rem; }
  .filter-bar { gap: 2px; }
  .filter-btn { font-size: 13px; padding: 7px 14px; }
  .divider { margin: 12px 0 20px; }
  .news-list { gap: 0.75rem; margin-bottom: 2rem; }
  .news-item {
    flex-direction: column;
    gap: 0.6rem;
    padding: 1rem;
    &:hover { transform: none; }
  }
  .news-tag { align-self: flex-start; font-size: 12px; padding: 0.3rem 0.8rem; }
  .news-title { font-size: 15px; margin-bottom: 0.4rem; }
  .news-description { font-size: 13px; }
  .news-date { font-size: 12px; }
  .pagination { margin-top: 32px; }
  .page-btn { min-width: 32px; height: 32px; font-size: 13px; }
  .page-btn.page-nav { padding: 0 8px; }
}
</style>
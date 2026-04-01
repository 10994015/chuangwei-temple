<template>
  <section class="pv-news-list-section" :class="`device-${device}`">
    <div class="pv-container">

      <!-- 大標題 -->
      <h2 class="pv-page-title">{{ t('newsListBasemap.title') || '最新消息' }}</h2>

      <!-- 分類 Tab -->
      <div class="pv-filter-bar">
        <button
          v-for="category in categories"
          :key="category.id"
          class="pv-filter-btn"
          :class="{ active: selectedCategory === category.id }"
          @click="selectCategory(category.id)"
        >
          {{ category.name }}
        </button>
      </div>

      <div class="pv-filter-divider"></div>

      <!-- 消息列表 -->
      <div class="pv-news-list">
        <template v-if="pagedNews.length > 0">
          <div
            v-for="news in pagedNews"
            :key="news.id"
            class="pv-news-item"
            @click="$emit('view-detail', news)"
          >
            <h3 class="pv-news-title">{{ news.title }}</h3>
            <span class="pv-news-date">{{ news.date }}</span>
          </div>
        </template>
        <div v-else class="pv-news-empty">未找到符合條件的文章</div>
      </div>

      <!-- 分頁 -->
      <div v-if="totalPages > 1" class="pv-pagination">
        <button
          class="pv-page-btn pv-page-nav"
          :class="{ disabled: currentPage === 1 }"
          :disabled="currentPage === 1"
          @click="prevPage"
        >
          {{ t('newsListBasemap.prev') || '上一頁' }}
        </button>

        <template v-for="page in pageNumbers" :key="page">
          <span v-if="page === '...'" class="pv-page-ellipsis">...</span>
          <button
            v-else
            class="pv-page-btn"
            :class="{ active: currentPage === page }"
            @click="goToPage(page)"
          >{{ page }}</button>
        </template>

        <button
          class="pv-page-btn pv-page-nav"
          :class="{ disabled: currentPage === totalPages }"
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >
          {{ t('newsListBasemap.next') || '下一頁' }}
        </button>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  postCategories: { type: Array,  default: () => [] },
  postList:       { type: Object, default: () => ({ data: [], total: 0, totalPages: 1 }) },
  pageSize:       { type: Number, default: 7 },
  device:         { type: String, default: 'desktop' },
})

const emit = defineEmits(['view-detail'])

const DEFAULT_CATEGORIES = ['祈福活動', '廟會文化', '宮廟公告']

const DEFAULT_NEWS = [
  { id: 1, type: '祈福活動', title: '2025年春節祈福法會活動公告',   createdAt: '2025-01-15' },
  { id: 2, type: '廟會文化', title: '媽祖遶境文化節活動報名開始',   createdAt: '2025-01-10' },
  { id: 3, type: '宮廟公告', title: '元宵節燈謎晚會暨祈福儀式',     createdAt: '2025-01-05' },
  { id: 4, type: '祈福活動', title: '求籤解籤服務時間調整公告',     createdAt: '2024-12-28' },
  { id: 5, type: '廟會文化', title: '歲末感恩祭典暨文化展覽活動',   createdAt: '2024-12-20' },
  { id: 6, type: '宮廟公告', title: '新年開廟時間與慶典活動說明',   createdAt: '2024-12-15' },
  { id: 7, type: '祈福活動', title: '觀音菩薩聖誕祈福法會報名通知', createdAt: '2024-12-10' },
]

const categories = computed(() => [
  { id: 'all', name: t('newsListBasemap.catAll') || '全部' },
  ...(props.postCategories.length > 0 ? props.postCategories : DEFAULT_CATEGORIES).map(c => ({ id: c, name: c })),
])

const mappedNews = computed(() => {
  const data = props.postList?.data
  const source = (Array.isArray(data) && data.length > 0) ? data : DEFAULT_NEWS
  return source.map(n => ({
    id:    n.id,
    tag:   n.type || '',
    title: n.title || '',
    date:  n.createdAt ? n.createdAt.slice(0, 10) : '',
  }))
})

const selectedCategory = ref('all')
const currentPage = ref(1)

const selectCategory = (id) => {
  selectedCategory.value = id
  currentPage.value = 1
}

const filteredNews = computed(() =>
  selectedCategory.value === 'all'
    ? mappedNews.value
    : mappedNews.value.filter(n => n.tag === selectedCategory.value)
)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredNews.value.length / props.pageSize))
)

const pagedNews = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize
  return filteredNews.value.slice(start, start + props.pageSize)
})

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}
const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }

const pageNumbers = computed(() => {
  const total = totalPages.value
  const cur   = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (cur <= 4)          return [1, 2, 3, 4, 5, '...', total]
  if (cur >= total - 3)  return [1, '...', total-4, total-3, total-2, total-1, total]
  return [1, '...', cur-1, cur, cur+1, '...', total]
})

// 切換分類時重置頁碼
watch(selectedCategory, () => { currentPage.value = 1 })
</script>

<style lang="scss" scoped>
.pv-news-list-section {
  padding: 3rem 0 5rem;
  background: transparent;
  min-height: 60vh;
}

.pv-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

// 大標題置中
.pv-page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--frame-heading-color, #222);
  text-align: center;
  margin: 0 0 2.5rem;
}

// 分類 Tab
.pv-filter-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  flex-wrap: wrap;
}

.pv-filter-btn {
  padding: 10px 20px;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  font-size: 15px;
  color: var(--frame-text-secondary, #666);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  margin-bottom: -1px;

  &:hover { color: var(--frame-text-color, #333); }

  &.active {
    color: #E8572A;
    border-bottom-color: #E8572A;
    font-weight: 500;
  }
}

.pv-filter-divider {
  border-top: 1px solid var(--frame-border-color, #e5e5e5);
  margin-bottom: 2rem;
}

// 消息列表
.pv-news-list {
  display: flex;
  flex-direction: column;
  margin-bottom: 3rem;
}

.pv-news-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 0;
  border-bottom: 1px solid var(--frame-border-color, #f0f0f0);
  cursor: pointer;
  transition: all 0.15s;

  &:first-child { border-top: 1px solid var(--frame-border-color, #f0f0f0); }

  &:hover .pv-news-title { color: #E8572A; }
}

.pv-news-title {
  flex: 1;
  font-size: 16px;
  font-weight: 700;
  color: var(--frame-text-color, #333);
  margin: 0;
  transition: color 0.2s;
  padding-right: 2rem;
}

.pv-news-date {
  flex-shrink: 0;
  font-size: 14px;
  color: var(--frame-text-muted, #aaa);
  white-space: nowrap;
}

.pv-news-empty {
  padding: 3rem 0;
  text-align: center;
  font-size: 15px;
  color: var(--frame-text-muted, #bbb);
}

// 分頁
.pv-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 2rem;
}

.pv-page-btn {
  min-width: 38px;
  height: 38px;
  padding: 0 10px;
  border: 1.5px solid var(--frame-border-color, #ddd);
  border-radius: 20px;
  background: transparent;
  font-size: 14px;
  color: var(--frame-text-secondary, #555);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(.disabled):not(.active) {
    border-color: #E8572A;
    color: #E8572A;
  }

  &.active {
    background: #E8572A;
    border-color: #E8572A;
    color: #fff;
    font-weight: 600;
  }

  &.pv-page-nav {
    padding: 0 16px;
    font-size: 13px;

    &.disabled {
      opacity: 0.4;
      cursor: default;
    }
  }
}

.pv-page-ellipsis {
  min-width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--frame-text-muted, #bbb);
  letter-spacing: 2px;
}

// 響應式
.pv-news-list-section.device-tablet {
  .pv-container   { padding: 0 1.5rem; }
  .pv-page-title  { font-size: 24px; }
  .pv-filter-btn  { font-size: 14px; padding: 8px 16px; }
  .pv-news-title  { font-size: 15px; }
}

.pv-news-list-section.device-mobile {
  padding: 2rem 0 3rem;

  .pv-container  { padding: 0 1rem; }
  .pv-page-title { font-size: 22px; margin-bottom: 1.5rem; }

  .pv-filter-bar { justify-content: flex-start; overflow-x: auto; flex-wrap: nowrap; padding-bottom: 2px; }
  .pv-filter-btn { font-size: 13px; padding: 8px 14px; }

  .pv-news-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 0.9rem 0;
  }

  .pv-news-title { font-size: 14px; padding-right: 0; }
  .pv-news-date  { font-size: 12px; }

  .pv-page-btn { min-width: 34px; height: 34px; font-size: 13px; }
  .pv-page-btn.pv-page-nav { padding: 0 12px; }
}
</style>
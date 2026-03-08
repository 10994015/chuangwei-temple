<template>
  <section class="album-list-section" :class="`device-${device}`">
    <div class="container">

      <div class="filter-bar">
        <button
          v-for="cat in categories"
          :key="cat.value"
          class="filter-btn"
          :class="{ active: activeCategory === cat.value }"
          @click="onCategoryClick(cat.value)"
        >
          {{ cat.label }}
        </button>
      </div>

      <hr class="divider" />

      <div class="album-grid">
        <div v-for="album in pagedAlbums" :key="album.id" class="album-card">
          <div class="album-cover-wrap">
            <div class="album-cover">
              <img v-if="album.coverImage" :src="album.coverImage" :alt="album.title" class="cover-image" />
              <div v-else class="cover-placeholder">
                <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="8" width="48" height="36" rx="3" stroke="#bbb" stroke-width="2.5"/>
                  <circle cx="18" cy="22" r="4" stroke="#bbb" stroke-width="2.5"/>
                  <path d="M4 36l13-13 9 10 7-8 12 13" stroke="#bbb" stroke-width="2.5" stroke-linejoin="round"/>
                </svg>
                <span class="placeholder-text">相簿封面</span>
              </div>
            </div>
          </div>

          <div class="album-info">
            <div class="meta-row">
              <span v-if="album.tag" class="tag">{{ album.tag }}</span>
              <span v-if="album.date" class="date">{{ album.date }}</span>
            </div>
            <h3 class="album-title">{{ album.title }}</h3>
            <p v-if="album.description" class="album-description">{{ album.description }}</p>
          </div>
        </div>
      </div>

      <div v-if="filteredAlbums.length === 0" class="empty-state">
        <p>此分類目前沒有相簿</p>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn page-nav" :class="{ disabled: currentPage === 1 }" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">上一頁</button>
        <template v-for="page in pageNumbers" :key="page">
          <span v-if="page === '...'" class="page-ellipsis">...</span>
          <button v-else class="page-btn" :class="{ active: currentPage === page }" @click="goToPage(page)">{{ page }}</button>
        </template>
        <button class="page-btn page-nav" :class="{ disabled: currentPage === totalPages }" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">下一頁</button>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  albumList:       { type: [Array, Object], default: undefined },
  albumCategories: { type: Array, default: () => [] },
  categoryList:    { type: Array, default: () => [] },
  device:          { type: String, default: 'desktop' },
  perPage:         { type: Number, default: 3 },
})

const safeAlbumList = computed(() => {
  const raw = props.albumList
  if (raw && typeof raw === 'object' && Array.isArray(raw.data)) return raw.data
  if (Array.isArray(raw)) return raw
  return []
})

const normalizedAlbums = computed(() =>
  safeAlbumList.value.map(a => ({
    ...a,
    coverImage: a.imgSrc ?? a.coverImage ?? null,
    tag:        a.category ?? a.tag ?? null,
    date:       a.createdAt ? a.createdAt.slice(0, 10) : (a.date ?? null),
    title:      a.title ?? '',
  }))
)

const categories = computed(() => {
  const base = [{ label: '全部', value: 'all' }]
  const catSource = props.albumCategories?.length > 0
    ? props.albumCategories
    : props.categoryList?.length > 0 ? props.categoryList : null

  if (catSource) return [...base, ...catSource.map(c => ({ label: c.label || c.name || c, value: c.value || c.id || c }))]

  const tags = [...new Set(normalizedAlbums.value.map(a => a.tag).filter(Boolean))]
  return [...base, ...tags.map(t => ({ label: t, value: t }))]
})

const activeCategory = ref('all')
const currentPage    = ref(1)

const onCategoryClick = (value) => { activeCategory.value = value; currentPage.value = 1 }

const filteredAlbums = computed(() =>
  activeCategory.value === 'all' ? normalizedAlbums.value : normalizedAlbums.value.filter(a => a.tag === activeCategory.value)
)

const totalPages = computed(() => Math.ceil(filteredAlbums.value.length / props.perPage))
const pagedAlbums = computed(() => {
  const start = (currentPage.value - 1) * props.perPage
  return filteredAlbums.value.slice(start, start + props.perPage)
})

const goToPage = (page) => { if (page >= 1 && page <= totalPages.value) currentPage.value = page }

const pageNumbers = computed(() => {
  const total = totalPages.value, cur = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (cur <= 4)         return [...[1,2,3,4,5], '...', total]
  if (cur >= total - 3) return [1, '...', ...[total-4,total-3,total-2,total-1,total]]
  return [1, '...', cur-1, cur, cur+1, '...', total]
})
</script>

<style lang="scss" scoped>
.album-list-section {
  padding: 3rem 0 4rem;
  background: transparent;
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

/* ==================== 相簿 Grid ==================== */
.album-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

/* ==================== 相簿卡片 ==================== */
.album-card {
  border: 1px solid var(--frame-border-color, #ddd);
  border-radius: 8px;
  background: var(--frame-card-bg, #fff);
  cursor: pointer;
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-4px);
  }
}

.album-cover-wrap { padding: 12px 12px 0; }

.album-cover {
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--frame-tag-bg, #e8e8e8);
  border-radius: 4px;
  position: relative;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
  .album-card:hover & { transform: scale(1.04); }
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--frame-tag-bg, #e8e8e8);
  gap: 10px;
  svg { width: 72px; height: 72px; }
}

.placeholder-text { font-size: 13px; color: var(--frame-text-muted, #bbb); margin: 0; }

/* 資訊區 */
.album-info { padding: 16px 16px 20px; }

.meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.tag {
  display: inline-block;
  padding: 3px 10px;
  background: var(--frame-link-color, #8b6f47);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  border-radius: 2px;
  white-space: nowrap;
}

.date { font-size: 13px; color: var(--frame-text-muted, #999); }

.album-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--frame-text-color, #222);
  margin: 0 0 8px;
  line-height: 1.4;
}

.album-description {
  font-size: 13px;
  color: var(--frame-text-secondary, #888);
  margin: 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: var(--frame-text-muted, #aaa);
  font-size: 14px;
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
    &.disabled { opacity: 0.4; cursor: default; }
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

/* ==================== RWD ==================== */
.album-list-section.device-tablet {
  .container   { padding: 0 1.25rem; }
  .album-grid  { grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .filter-btn  { padding: 8px 18px; font-size: 14px; }
  .album-title { font-size: 16px; }
}

.album-list-section.device-mobile {
  padding: 1.5rem 0 2rem;
  .container         { padding: 0 0.75rem; }
  .album-grid        { grid-template-columns: 1fr; gap: 14px; }
  .filter-btn        { padding: 7px 14px; font-size: 13px; }
  .divider           { margin: 12px 0 20px; }
  .album-cover-wrap  { padding: 10px 10px 0; }
  .album-info        { padding: 12px 12px 14px; }
  .album-title       { font-size: 15px; }
  .album-description { font-size: 12px; }
  .pagination        { margin-top: 32px; }
  .page-btn          { min-width: 32px; height: 32px; font-size: 13px; }
  .page-btn.page-nav { padding: 0 8px; }
}
</style>
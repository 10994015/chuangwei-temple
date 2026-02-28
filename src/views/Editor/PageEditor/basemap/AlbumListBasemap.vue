<template>
  <section class="album-list-section" :class="`device-${device}`">
    <div class="container">

      <!-- 分類 Tab 篩選列 -->
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

      <!-- 分隔線 -->
      <hr class="divider" />

      <!-- 相簿 Grid -->
      <div class="album-grid">
        <div
          v-for="album in pagedAlbums"
          :key="album.id"
          class="album-card"
        >
          <!-- 封面圖 -->
          <div class="album-cover-wrap">
          <div class="album-cover">
            <img
              v-if="album.coverImage"
              :src="album.coverImage"
              :alt="album.title"
              class="cover-image"
            />
            <div v-else class="cover-placeholder">
              <!-- 線條風格 placeholder，對應截圖樣式 -->
              <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="8" width="48" height="36" rx="3" stroke="#bbb" stroke-width="2.5"/>
                <circle cx="18" cy="22" r="4" stroke="#bbb" stroke-width="2.5"/>
                <path d="M4 36l13-13 9 10 7-8 12 13" stroke="#bbb" stroke-width="2.5" stroke-linejoin="round"/>
              </svg>
              <span class="placeholder-text">相簿封面</span>
            </div>
          </div>
          </div>

          <!-- 資訊 -->
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

      <!-- 無資料 -->
      <div v-if="filteredAlbums.length === 0" class="empty-state">
        <p>此分類目前沒有相簿</p>
      </div>

      <!-- 頁碼 -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="page-btn page-nav"
          :class="{ disabled: currentPage === 1 }"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >上一頁</button>

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
          @click="goToPage(currentPage + 1)"
        >下一頁</button>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  albumList: {
    type: [Array, Object],
    default: undefined
  },
  // API 傳進來的分類（albumCategories）或舊格式（categoryList）都接受
  albumCategories: {
    type: Array,
    default: () => []
  },
  categoryList: {
    type: Array,
    default: () => []
  },
  device: {
    type: String,
    default: 'desktop'
  },
  perPage: {
    type: Number,
    default: 3
  }
})

// ==================== 假資料（API 串接前 / 無資料時顯示）====================
// 假資料欄位以後端 API 實際回傳為準，確認後再調整
const mockAlbums = [
  { id: 1, coverImage: null, tag: '法會活動', date: '2024-08-22', title: '中元普渡法會', description: '2024年中元普渡法會活動紀錄' },
  { id: 2, coverImage: null, tag: '慶典紀錄', date: '2024-03-19', title: '觀音佛誕慶典', description: '觀音佛誕慶祝活動' },
  { id: 3, coverImage: null, tag: '法會活動', date: '2024-02-10', title: '新春祈福法會', description: '農曆新年祈福法會活動照片' },
  { id: 4, coverImage: null, tag: '建築風光', date: '2024-01-05', title: '廟宇建築之美', description: '本廟建築細節與風光記錄' },
  { id: 5, coverImage: null, tag: '志工服務', date: '2023-12-25', title: '歲末志工活動', description: '年底志工服務暨感恩活動' },
  { id: 6, coverImage: null, tag: '慶典紀錄', date: '2023-11-15', title: '建廟週年慶典', description: '建廟週年慶典精彩花絮' },
]

// ==================== 安全取得陣列 ====================
// API 回傳格式: { data: [], page, pageSize, total, totalPages }
const safeAlbumList = computed(() => {
  const raw = props.albumList

  // 分頁物件格式 { data: [...] }
  if (raw && typeof raw === 'object' && Array.isArray(raw.data)) {
    return raw.data.length > 0 ? raw.data : mockAlbums
  }
  // 純陣列格式
  if (Array.isArray(raw)) {
    return raw.length > 0 ? raw : mockAlbums
  }
  // 沒傳或其他 → 假資料
  return mockAlbums
})

// ==================== 分類 Tab ====================
const categories = computed(() => {
  const base = [{ label: '全部', value: 'all' }]
  // 優先用 API 傳入的 albumCategories，其次 categoryList，最後從資料自動產生
  const catSource = props.albumCategories?.length > 0
    ? props.albumCategories
    : props.categoryList?.length > 0
      ? props.categoryList
      : null

  if (catSource) {
    return [...base, ...catSource.map(c => ({
      label: c.label || c.name || c,
      value: c.value || c.id || c
    }))]
  }
  // 從相簿資料自動抽取 tag
  const tags = [...new Set(safeAlbumList.value.map(a => a.tag).filter(Boolean))]
  return [...base, ...tags.map(t => ({ label: t, value: t }))]
})

const activeCategory = ref('all')
const currentPage = ref(1)

const onCategoryClick = (value) => {
  activeCategory.value = value
  currentPage.value = 1  // 切分類重置到第一頁
}

// ==================== 篩選 ====================
const filteredAlbums = computed(() => {
  if (activeCategory.value === 'all') return safeAlbumList.value
  return safeAlbumList.value.filter(a => a.tag === activeCategory.value)
})

// ==================== 分頁 ====================
const totalPages = computed(() => Math.ceil(filteredAlbums.value.length / props.perPage))

const pagedAlbums = computed(() => {
  const start = (currentPage.value - 1) * props.perPage
  return filteredAlbums.value.slice(start, start + props.perPage)
})

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

// 頁碼按鈕（含省略號邏輯）
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
</script>

<style lang="scss" scoped>
.album-list-section {
  padding: 3rem 0 4rem;
  background: #fff;
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
  color: #666;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover  { color: #333; }
  &.active { background: #8b6f47; color: #fff; font-weight: 500; }
}

.divider {
  border: none;
  border-top: 1px solid #e5e5e5;
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
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-4px);
  }
}

/* 封面外層：帶 margin，讓圖片縮在卡片內 */
.album-cover-wrap {
  padding: 12px 12px 0;
}

/* 封面圖：帶圓角 */
.album-cover {
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #e8e8e8;
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
  background: #e8e8e8;
  gap: 10px;

  svg { width: 72px; height: 72px; }
}

.placeholder-text {
  font-size: 13px;
  color: #bbb;
  margin: 0;
}

/* 資訊區 */
.album-info {
  padding: 16px 16px 20px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.tag {
  display: inline-block;
  padding: 3px 10px;
  background: #8b6f47;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  border-radius: 2px;
  white-space: nowrap;
}

.date {
  font-size: 13px;
  color: #999;
}

.album-title {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  margin: 0 0 8px;
  line-height: 1.4;
}

.album-description {
  font-size: 13px;
  color: #888;
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
  color: #aaa;
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
  color: #555;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(.disabled):not(.active) {
    background: #f5f5f5;
    color: #333;
  }

  &.active {
    background: #8b6f47;
    color: #fff;
    font-weight: 500;
  }

  &.page-nav {
    color: #999;
    font-size: 13px;
    min-width: auto;
    padding: 0 14px;

    &.disabled {
      color: #ccc;
      cursor: default;
    }
  }
}

.page-ellipsis {
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #bbb;
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
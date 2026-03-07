<template>
  <section class="event-list-section" :class="`device-${device}`">
    <div class="container">
      <!-- 分類標籤 -->
      <div class="filter-bar">
        <button 
          v-for="category in categories" 
          :key="category.id"
          class="filter-btn"
          :class="{ active: selectedCategory === category.id }"
          @click="onCategoryClick(category.id)"
        >
          {{ category.name }}
        </button>
      </div>

      <!-- 分隔線 -->
      <hr class="divider" />

      <!-- 活動 Grid -->
      <div class="events-grid">
        <div 
          v-for="event in pagedEvents" 
          :key="event.id"
          class="event-card"
          @click="viewEventDetail(event)"
        >
          <!-- 圖片區 -->
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

          <!-- 資訊區 -->
          <div class="event-info">
            <!-- badge 在標題上方 -->
            <div class="event-tags" v-if="event.tags && event.tags.length > 0">
              <span 
                v-for="tag in event.tags" 
                :key="tag"
                class="event-tag"
                :class="getTagClass(tag)"
              >{{ tag }}</span>
            </div>
            <!-- 無 badge 時保持間距一致 -->
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

      <!-- 無資料 -->
      <div v-if="filteredEvents.length === 0" class="empty-state">
        <p>此分類目前沒有活動</p>
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
  eventsList: {
    type: Array,
    default: () => [
      {
        id: 1,
        title: '農曆九月初九 天公聖誕慶典',
        date: '2024-12-10',
        time: '上午8:00 - 下午5:00',
        location: '本宮大殿',
        tags: ['熱門', '推薦'],
        image: null
      },
      {
        id: 2,
        title: '冬至祭祖法會',
        date: '2024-12-21',
        time: '上午9:00 - 下午3:00',
        location: '本宮後殿',
        tags: [],
        image: null
      },
      {
        id: 3,
        title: '新春開廟門迎春',
        date: '2025-01-29 - 2025-02-02',
        time: '凌晨12:00',
        location: '本宮',
        tags: ['熱門'],
        image: null
      },
      {
        id: 4,
        title: '元宵燈會活動',
        date: '2025-02-12',
        time: '下午6:00 - 晚上10:00',
        location: '本宮廣場',
        tags: [],
        image: null
      },
      {
        id: 5,
        title: '清明祭祖大典',
        date: '2025-04-04',
        time: '上午8:00 - 下午4:00',
        location: '本宮大殿',
        tags: [],
        image: null
      },
      {
        id: 6,
        title: '端午祈福慶典',
        date: '2025-05-31',
        time: '上午9:00 - 下午5:00',
        location: '本宮',
        tags: [],
        image: null
      },
      {
        id: 7,
        title: '中元普渡法會',
        date: '2025-08-22',
        time: '上午8:00 - 下午6:00',
        location: '本宮大殿',
        tags: ['推薦'],
        image: null
      },
      {
        id: 8,
        title: '中秋賞月活動',
        date: '2025-09-15',
        time: '下午7:00 - 晚上11:00',
        location: '本宮廣場',
        tags: ['熱門'],
        image: null
      },
      {
        id: 9,
        title: '重陽敬老活動',
        date: '2025-10-11',
        time: '上午9:00 - 下午3:00',
        location: '本宮',
        tags: [],
        image: null
      }
    ]
  },
  perPage: {
    type: Number,
    default: 3
  },
  device: {
    type: String,
    default: 'desktop'
  }
})

const emit = defineEmits(['view-detail'])

const categories = [
  { id: 'all',       name: '全部' },
  { id: 'ceremony',  name: '慶典法會' },
  { id: 'prayer',    name: '祈福活動' },
  { id: 'culture',   name: '文化活動' },
  { id: 'volunteer', name: '志工服務' }
]

const selectedCategory = ref('all')
const currentPage = ref(1)

const onCategoryClick = (id) => {
  selectedCategory.value = id
  currentPage.value = 1
}

const filteredEvents = computed(() => {
  if (selectedCategory.value === 'all') return props.eventsList
  return props.eventsList.filter(e => e.category === selectedCategory.value)
})

const totalPages = computed(() => Math.ceil(filteredEvents.value.length / props.perPage))

const pagedEvents = computed(() => {
  const start = (currentPage.value - 1) * props.perPage
  return filteredEvents.value.slice(start, start + props.perPage)
})

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

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

const getTagClass = (tag) => {
  const tagMap = { '熱門': 'hot', '推薦': 'recommended' }
  return tagMap[tag] || 'default'
}

const viewEventDetail = (event) => {
  emit('view-detail', event)
}
</script>

<style lang="scss" scoped>
.event-list-section {
  padding: 2rem 0 4rem;
  background: transparent;
  min-height: 100vh;
}

.container {
  max-width: 1300px;
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
  padding: 0.5rem 0;
}

.filter-btn {
  padding: 10px 28px;
  border: none;
  background: transparent;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  white-space: nowrap;
  font-weight: 400;

  &:hover  { color: #333; }
  &.active {
    background: #8b6f47;
    color: #fff;
    font-weight: 500;
    border-radius: 6px;
  }
}

.divider {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 14px 0 36px;
}

/* ==================== 活動 Grid — 3 欄 ==================== */
.events-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* ==================== 活動卡片 ==================== */
.event-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}

/* 圖片區 */
.event-image {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #e8e8e8;
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
  background: #e8e8e8;
  gap: 12px;
}

.placeholder-icon {
  width: 80px;
  height: 80px;
}

.placeholder-text {
  font-size: 13px;
  color: #aaa;
}

/* 資訊區 */
.event-info {
  padding: 20px 24px 24px;
}

/* badge 在標題上方 */
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
}

.event-title {
  font-size: 18px;
  font-weight: 600;
  color: #222;
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
  color: #666;
  line-height: 1.5;

  span { flex: 1; }
}

.detail-icon {
  width: 16px;
  height: 16px;
  color: #999;
  flex-shrink: 0;
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

    &.disabled { color: #ccc; cursor: default; }
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
.event-list-section.device-tablet {
  .container   { padding: 0 1.25rem; }
  .events-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .filter-btn  { font-size: 14px; padding: 8px 18px; }
  .event-title { font-size: 16px; }
  .event-info  { padding: 16px 18px 20px; }
}

.event-list-section.device-mobile {
  padding: 1rem 0 2rem;

  .container   { padding: 0 0.75rem; }
  .filter-bar  { gap: 2px; }
  .filter-btn  { font-size: 13px; padding: 7px 14px; }
  .divider     { margin: 12px 0 20px; }
  .events-grid { grid-template-columns: 1fr; gap: 14px; }
  .event-info  { padding: 14px 16px 18px; }
  .event-title { font-size: 15px; margin-bottom: 12px; }

  .event-detail {
    font-size: 13px;
    gap: 8px;
  }

  .detail-icon {
    width: 14px;
    height: 14px;
  }

  .pagination        { margin-top: 32px; }
  .page-btn          { min-width: 32px; height: 32px; font-size: 13px; }
  .page-btn.page-nav { padding: 0 8px; }
}
</style>
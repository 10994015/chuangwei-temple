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
          @click="activeCategory = cat.value"
        >
          {{ cat.label }}
        </button>
      </div>

      <!-- 分隔線 -->
      <hr class="divider" />

      <!-- 相簿 Grid -->
      <div class="album-grid">
        <div
          v-for="album in filteredAlbums"
          :key="album.id"
          class="album-card"
        >
          <!-- 上半部：封面圖 -->
          <div class="album-cover">
            <img
              v-if="album.coverImage"
              :src="album.coverImage"
              :alt="album.title"
              class="cover-image"
            />
            <div v-else class="cover-placeholder">
              <div class="placeholder-icon">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="48" rx="4" fill="#e8e8e8"/>
                  <path d="M12 34l8-10 6 7 4-5 6 8H12z" fill="#bbb"/>
                  <circle cx="18" cy="20" r="3" fill="#bbb"/>
                </svg>
              </div>
              <span class="placeholder-text">相簿封面</span>
            </div>
          </div>

          <!-- 下半部：資訊 -->
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
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  albumList: {
    type: [Array, Object],  // ✅ 接受陣列或物件，防止型別錯誤
    default: () => []
  },
  categoryList: {
    type: Array,
    default: () => []
  },
  // ✅ 接收裝置類型
  device: {
    type: String,
    default: 'desktop'
  }
})

// ==================== ✅ 安全取得陣列 ====================
// API 回傳有時是物件、有時是陣列，統一轉為陣列處理
const safeAlbumList = computed(() => {
  const list = props.albumList
  if (Array.isArray(list)) return list
  if (list && typeof list === 'object') return Object.values(list)
  return []
})

// ==================== 分類 Tab ====================

const categories = computed(() => {
  const base = [{ label: '全部', value: 'all' }]

  if (props.categoryList && props.categoryList.length > 0) {
    return [...base, ...props.categoryList.map(c => ({
      label: c.label || c,
      value: c.value || c
    }))]
  }

  const tags = [...new Set(
    safeAlbumList.value
      .map(a => a.tag)
      .filter(Boolean)
  )]

  return [...base, ...tags.map(t => ({ label: t, value: t }))]
})

const activeCategory = ref('all')

// ==================== 篩選 ====================

const filteredAlbums = computed(() => {
  if (activeCategory.value === 'all') return safeAlbumList.value
  return safeAlbumList.value.filter(a => a.tag === activeCategory.value)
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
  gap: 0;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 10px 28px;
  border: none;
  background: transparent;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover  { color: #333; background: #f5f5f5; }
  &.active { background: #8b6f47; color: #fff; font-weight: 500; }
}

.divider {
  border: none;
  border-top: 1px solid #e5e5e5;
  margin: 20px 0 36px;
}

/* ==================== 相簿 Grid ==================== */

.album-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* ==================== 相簿卡片 ==================== */

.album-card {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-4px);
  }
}

.album-cover {
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #f0f0f0;
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
  background: #f0f0f0;
  gap: 8px;
}

.placeholder-icon {
  width: 64px;
  height: 64px;
  opacity: 0.6;
  svg { width: 100%; height: 100%; }
}

.placeholder-text { font-size: 13px; color: #aaa; }

.album-info { padding: 16px 20px 20px; background: #fff; }

.meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.tag {
  display: inline-block;
  padding: 4px 10px;
  background: #8b6f47;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  border-radius: 2px;
  white-space: nowrap;
}

.date { font-size: 13px; color: #999; }

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

/* ==================== ✅ device prop 響應式（取代 media query）==================== */

/* 平板：2 欄 */
.album-list-section.device-tablet {
  .container { padding: 0 1.25rem; }

  .album-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .filter-btn {
    padding: 8px 20px;
    font-size: 14px;
  }

  .album-title { font-size: 16px; }
}

/* 手機：單欄 */
.album-list-section.device-mobile {
  padding: 1.5rem 0 2rem;

  .container { padding: 0 0.75rem; }

  .album-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .filter-btn {
    padding: 7px 14px;
    font-size: 13px;
  }

  .divider { margin: 14px 0 20px; }

  .album-info { padding: 12px 14px 16px; }

  .album-title { font-size: 15px; }

  .album-description { font-size: 12px; }

  .placeholder-icon { width: 48px; height: 48px; }
}
</style>
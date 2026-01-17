<template>
  <section class="album-list-section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">相簿列表</h2>
        <a href="#" class="view-all">查看所有相簿 ›</a>
      </div>
      
      <div class="album-grid">
        <div 
          v-for="album in albumList" 
          :key="album.id"
          class="album-card"
        >
          <div class="album-cover">
            <img :src="album.coverImage" :alt="album.title" class="cover-image" />
            <div class="album-overlay">
              <div class="photo-count">
                <span class="icon">📷</span>
                <span class="count">{{ album.photoCount }} 張照片</span>
              </div>
            </div>
          </div>
          <div class="album-info">
            <h3 class="album-title">{{ album.title }}</h3>
            <p class="album-date">{{ album.date }}</p>
            <p class="album-description">{{ album.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  albumList: {
    type: Array,
    default: () => [
      {
        id: 1,
        title: '2024 新春祈福大典',
        date: '2024-02-10',
        photoCount: 48,
        coverImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop',
        description: '甲辰年新春祈福大典盛況，信眾齊聚祈求新年平安順遂'
      },
      {
        id: 2,
        title: '中秋祭祀活動',
        date: '2024-09-17',
        photoCount: 36,
        coverImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=600&fit=crop',
        description: '農曆八月十五中秋祭祀，月圓人團圓，祈願闔家平安'
      },
      {
        id: 3,
        title: '端午節慶典',
        date: '2024-06-10',
        photoCount: 52,
        coverImage: 'https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800&h=600&fit=crop',
        description: '端午佳節祭祀活動，傳承文化，弘揚信仰'
      },
      {
        id: 4,
        title: '冬至祭祖法會',
        date: '2023-12-22',
        photoCount: 28,
        coverImage: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&h=600&fit=crop',
        description: '冬至時節祭祖法會，慎終追遠，感念先人恩德'
      },
      {
        id: 5,
        title: '平安燈點燈儀式',
        date: '2024-01-15',
        photoCount: 64,
        coverImage: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&h=600&fit=crop',
        description: '年度平安燈點燈儀式，光明照耀，祈福平安'
      },
      {
        id: 6,
        title: '元宵燈會',
        date: '2024-02-24',
        photoCount: 72,
        coverImage: 'https://images.unsplash.com/photo-1551361415-69c87624334f?w=800&h=600&fit=crop',
        description: '正月十五元宵燈會，花燈璀璨，熱鬧非凡'
      }
    ]
  }
})
</script>

<style lang="scss" scoped>
.album-list-section {
  padding: 4rem 0;
  background: #fff;
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
  margin-bottom: 2.5rem;
}

.section-title {
  font-size: 28px;
  font-weight: 500;
  color: #333;
}

.view-all {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;

  &:hover {
    color: #8b6f47;
  }
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.album-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);

    .album-overlay {
      opacity: 1;
    }

    .cover-image {
      transform: scale(1.05);
    }
  }
}

.album-cover {
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;
  background: #f5f5f5;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.album-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.7) 100%
  );
  display: flex;
  align-items: flex-end;
  padding: 1.5rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.photo-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #fff;
  font-size: 14px;
  font-weight: 500;

  .icon {
    font-size: 18px;
  }
}

.album-info {
  padding: 1.5rem;
}

.album-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem;
  line-height: 1.4;
}

.album-date {
  font-size: 13px;
  color: #999;
  margin: 0 0 0.75rem;
}

.album-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// 響應式設計
@media (max-width: 1024px) {
  .album-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 640px) {
  .album-grid {
    grid-template-columns: 1fr;
  }

  .album-cover {
    height: 200px;
  }
}
</style>
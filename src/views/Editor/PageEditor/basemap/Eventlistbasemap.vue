<template>
  <section class="event-list-section">
    <div class="container">
      <!-- 分類標籤 -->
      <div class="category-tabs">
        <button 
          v-for="category in categories" 
          :key="category.id"
          class="category-tab"
          :class="{ active: selectedCategory === category.id }"
          @click="selectedCategory = category.id"
        >
          {{ category.name }}
        </button>
      </div>

      <!-- 活動 Grid -->
      <div class="events-grid">
        <div 
          v-for="event in eventsList" 
          :key="event.id"
          class="event-card"
          @click="viewEventDetail(event)"
        >
          <div class="event-image">
            <img :src="event.image" :alt="event.title" class="image" />
            <div class="event-tags">
              <span 
                v-for="tag in event.tags" 
                :key="tag"
                class="event-tag"
                :class="getTagClass(tag)"
              >
                {{ tag }}
              </span>
            </div>
          </div>
          
          <div class="event-info">
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
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

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
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop'
      },
      {
        id: 2,
        title: '冬至祭祖法會',
        date: '2024-12-21',
        time: '上午9:00 - 下午3:00',
        location: '本宮後殿',
        tags: [],
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=600&fit=crop'
      },
      {
        id: 3,
        title: '新春開廟門迎春',
        date: '2025-01-29 - 2025-02-02',
        time: '凌晨12:00',
        location: '本宮',
        tags: ['熱門'],
        image: 'https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800&h=600&fit=crop'
      },
      {
        id: 4,
        title: '元宵燈會活動',
        date: '2025-02-12',
        time: '下午6:00 - 晚上10:00',
        location: '本宮廣場',
        tags: [],
        image: 'https://images.unsplash.com/photo-1551361415-69c87624334f?w=800&h=600&fit=crop'
      },
      {
        id: 5,
        title: '清明祭祖大典',
        date: '2025-04-04',
        time: '上午8:00 - 下午4:00',
        location: '本宮大殿',
        tags: [],
        image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&h=600&fit=crop'
      },
      {
        id: 6,
        title: '端午祈福慶典',
        date: '2025-05-31',
        time: '上午9:00 - 下午5:00',
        location: '本宮',
        tags: [],
        image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&h=600&fit=crop'
      },
      {
        id: 7,
        title: '中元普渡法會',
        date: '2025-08-22',
        time: '上午8:00 - 下午6:00',
        location: '本宮大殿',
        tags: ['推薦'],
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=600&fit=crop'
      },
      {
        id: 8,
        title: '中秋賞月活動',
        date: '2025-09-15',
        time: '下午7:00 - 晚上11:00',
        location: '本宮廣場',
        tags: ['熱門'],
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop'
      },
      {
        id: 9,
        title: '重陽敬老活動',
        date: '2025-10-11',
        time: '上午9:00 - 下午3:00',
        location: '本宮',
        tags: [],
        image: 'https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800&h=600&fit=crop'
      }
    ]
  }
})

const emit = defineEmits(['view-detail'])

const categories = [
  { id: 'all', name: '全部' },
  { id: 'ceremony', name: '慶典法會' },
  { id: 'prayer', name: '祈福活動' },
  { id: 'culture', name: '文化活動' },
  { id: 'volunteer', name: '志工服務' }
]

const selectedCategory = ref('all')

const getTagClass = (tag) => {
  const tagMap = {
    '熱門': 'hot',
    '推薦': 'recommended'
  }
  return tagMap[tag] || 'default'
}

const viewEventDetail = (event) => {
  console.log('查看活動詳情:', event)
  emit('view-detail', event)
}
</script>

<style lang="scss" scoped>
.event-list-section {
  padding: 2rem 0 4rem;
  background: #fafafa;
  min-height: 100vh;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

// 分類標籤
.category-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e5e5;
}

.category-tab {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  
  &:hover {
    background: #f5f5f5;
    color: #333;
  }
  
  &.active {
    background: #8b7355;
    color: #fff;
  }
}

// 活動 Grid
.events-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem 1.5rem;
}

.event-card {
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);

    .image {
      transform: scale(1.05);
    }
  }
}

.event-image {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #f5f5f5;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.event-tags {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 6px;
}

.event-tag {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  backdrop-filter: blur(10px);

  &.hot {
    background: #dc3545;
  }

  &.recommended {
    background: #007bff;
  }
}

.event-info {
  padding: 1.5rem;
}

.event-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  line-height: 1.5;
  min-height: 3em;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-detail {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  color: #7f8c8d;
  line-height: 1.5;

  span {
    flex: 1;
  }
}

.detail-icon {
  width: 16px;
  height: 16px;
  color: #95a5a6;
  flex-shrink: 0;
  margin-top: 2px;
}

// 響應式設計
@media (max-width: 1200px) {
  .events-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .events-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .events-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .category-tabs {
    flex-wrap: wrap;
  }
  
  .category-tab {
    font-size: 14px;
    padding: 0.6rem 1.2rem;
  }
}
</style>
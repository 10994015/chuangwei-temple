<template>
  <section class="events-section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">慶典活動</h2>
        <a href="#" class="view-all">查看所有活動 ›</a>
      </div>

      <div class="events-carousel">
        <button 
          class="carousel-btn prev" 
          @click="prevSlide"
          :disabled="currentIndex === 0"
        >
          ‹
        </button>
        
        <div class="events-wrapper">
          <div 
            class="events-container"
            :style="{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }"
          >
            <div 
              v-for="event in eventsList" 
              :key="event.id"
              class="event-card"
              :style="{ minWidth: `calc(${100 / visibleCount}% - ${(visibleCount - 1) * 1.5 / visibleCount}rem)` }"
            >
              <div class="event-image">
                <img :src="event.image" :alt="event.title" class="image" />
                <div class="image-overlay">
                  <div class="event-date-badge">
                    <span class="date-day">{{ event.displayDate.day }}</span>
                    <span class="date-month">{{ event.displayDate.month }}</span>
                  </div>
                </div>
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
                <button class="view-detail-btn" @click="viewEventDetail(event)">
                  查看詳情
                  <svg class="arrow-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <button 
          class="carousel-btn next" 
          @click="nextSlide"
          :disabled="currentIndex >= eventsList.length - visibleCount"
        >
          ›
        </button>
      </div>

      <!-- 輪播指示器 -->
      <div class="carousel-indicators">
        <button
          v-for="(_, index) in Math.ceil(eventsList.length / visibleCount)"
          :key="index"
          class="indicator-dot"
          :class="{ active: Math.floor(currentIndex / visibleCount) === index }"
          @click="goToSlide(index)"
        ></button>
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
        date: '2024年12月10日',
        time: '上午 8:00 - 下午 5:00',
        location: '本宮大殿',
        tags: ['熱門', '推薦'],
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop',
        displayDate: { day: '10', month: '12月' }
      },
      {
        id: 2,
        title: '冬至祭祖法會',
        date: '2024年12月21日',
        time: '上午 9:00 - 下午 3:00',
        location: '本宮後殿',
        tags: ['法會'],
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=600&fit=crop',
        displayDate: { day: '21', month: '12月' }
      },
      {
        id: 3,
        title: '新春開廟門迎春',
        date: '2025年1月29日',
        time: '凌晨 12:00',
        location: '本宮',
        tags: ['熱門', '重要'],
        image: 'https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800&h=600&fit=crop',
        displayDate: { day: '29', month: '1月' }
      },
      {
        id: 4,
        title: '元宵燈會活動',
        date: '2025年2月12日',
        time: '下午 6:00 - 晚上 10:00',
        location: '本宮廣場',
        tags: ['熱門', '推薦'],
        image: 'https://images.unsplash.com/photo-1551361415-69c87624334f?w=800&h=600&fit=crop',
        displayDate: { day: '12', month: '2月' }
      },
      {
        id: 5,
        title: '清明祭祖大典',
        date: '2025年4月4日',
        time: '上午 8:00 - 下午 4:00',
        location: '本宮大殿',
        tags: ['法會'],
        image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&h=600&fit=crop',
        displayDate: { day: '04', month: '4月' }
      },
      {
        id: 6,
        title: '端午祈福慶典',
        date: '2025年5月31日',
        time: '上午 9:00 - 下午 5:00',
        location: '本宮',
        tags: ['熱門'],
        image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&h=600&fit=crop',
        displayDate: { day: '31', month: '5月' }
      }
    ]
  },
  visibleCount: {
    type: Number,
    default: 3
  }
})

const emit = defineEmits(['view-detail'])

const currentIndex = ref(0)

const nextSlide = () => {
  if (currentIndex.value < props.eventsList.length - props.visibleCount) {
    currentIndex.value++
  }
}

const prevSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const goToSlide = (index) => {
  currentIndex.value = index * props.visibleCount
}

const getTagClass = (tag) => {
  const tagMap = {
    '熱門': 'hot',
    '推薦': 'recommended',
    '重要': 'important',
    '法會': 'ceremony'
  }
  return tagMap[tag] || 'default'
}

const viewEventDetail = (event) => {
  console.log('查看活動詳情:', event)
  emit('view-detail', event)
}
</script>

<style lang="scss" scoped>
.events-section {
  padding: 4rem 0;
  background: #ffffff;
}

.container {
  max-width: 1280px;
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
  font-size: 32px;
  font-weight: 600;
  color: #2c3e50;
  position: relative;
  padding-bottom: 12px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(to right, #e74c3c, #c0392b);
    border-radius: 2px;
  }
}

.view-all {
  color: #8b7355;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    color: #6a5a47;
    transform: translateX(4px);
  }
}

.events-carousel {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.carousel-btn {
  background: #ffffff;
  border: 2px solid #e8e6e3;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 24px;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &:hover:not(:disabled) {
    background: #e74c3c;
    color: #ffffff;
    border-color: #e74c3c;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

.events-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.events-container {
  display: flex;
  gap: 1.5rem;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.event-card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);

    .image {
      transform: scale(1.08);
    }

    .image-overlay {
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.3) 0%,
        rgba(0, 0, 0, 0.7) 100%
      );
    }
  }
}

.event-image {
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;
  background: #f5f5f5;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.5) 100%
  );
  transition: all 0.3s ease;
  display: flex;
  align-items: flex-end;
  padding: 1rem;
}

.event-date-badge {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 10px 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.date-day {
  font-size: 28px;
  font-weight: 700;
  color: #e74c3c;
  line-height: 1;
  margin-bottom: 2px;
}

.date-month {
  font-size: 12px;
  font-weight: 600;
  color: #7f8c8d;
  text-transform: uppercase;
  line-height: 1;
}

.event-tags {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}

.event-tag {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  &.hot {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  }

  &.recommended {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  }

  &.important {
    background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  }

  &.ceremony {
    background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
  }

  &.default {
    background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
  }
}

.event-info {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.event-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 1.5rem;
}

.event-detail {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #7f8c8d;
  line-height: 1.4;

  span {
    flex: 1;
  }
}

.detail-icon {
  width: 18px;
  height: 18px;
  color: #95a5a6;
  flex-shrink: 0;
}

.view-detail-btn {
  margin-top: auto;
  padding: 12px 20px;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(231, 76, 60, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

.arrow-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;

  .view-detail-btn:hover & {
    transform: translateX(4px);
  }
}

// 輪播指示器
.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 2rem;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d1d5db;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;

  &:hover {
    background: #9ca3af;
    transform: scale(1.2);
  }

  &.active {
    width: 24px;
    border-radius: 4px;
    background: #e74c3c;
  }
}

// 響應式設計
@media (max-width: 1280px) {
  .events-container {
    gap: 1.2rem;
  }
}

@media (max-width: 1024px) {
  .section-title {
    font-size: 28px;
  }

  .event-image {
    height: 200px;
  }

  .event-title {
    font-size: 16px;
  }

  .date-day {
    font-size: 24px;
  }
}

@media (max-width: 768px) {
  .events-section {
    padding: 3rem 0;
  }

  .container {
    padding: 0 1rem;
  }

  .section-title {
    font-size: 24px;
  }

  .carousel-btn {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .event-image {
    height: 180px;
  }

  .date-day {
    font-size: 22px;
  }

  .date-month {
    font-size: 11px;
  }
}

@media (max-width: 640px) {
  .events-carousel {
    gap: 0.5rem;
  }

  .carousel-btn {
    width: 36px;
    height: 36px;
  }

  .event-info {
    padding: 1.2rem;
  }

  .event-details {
    gap: 8px;
  }

  .event-detail {
    font-size: 13px;
  }
}
</style>
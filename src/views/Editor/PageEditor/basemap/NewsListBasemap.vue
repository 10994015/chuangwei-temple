<template>
  <section class="news-list-section">
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

      <!-- 消息列表 -->
      <div class="news-list">
        <div 
          v-for="news in newsList" 
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
      <div class="pagination">
        <button class="page-btn prev" :disabled="currentPage === 1" @click="prevPage">
          上一頁
        </button>
        <button 
          v-for="page in totalPages" 
          :key="page"
          class="page-btn"
          :class="{ active: currentPage === page }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <button class="page-btn next" :disabled="currentPage === totalPages" @click="nextPage">
          下一頁
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  newsList: {
    type: Array,
    default: () => [
      {
        id: 1,
        tag: '法會通知',
        tagClass: 'notice',
        title: '冬季祈福法會圓滿結束',
        description: '感謝眾信眾參與本次冬季祈福法會。法會已圓滿結束，祈願眾信眾身體健康、闔家平安。本次法會共有百餘位信眾參與，場面莊嚴隆…',
        date: '2024-12-08'
      },
      {
        id: 2,
        tag: '節日慶典',
        tagClass: 'festival',
        title: '新年平安燈開放點燈登記',
        description: '申辰年平安燈現已開放登記，歡迎信眾前來點燈祈福，祈求新年平安順遂。點燈期間自農曆正月初一至十二月三十日，功德無量。',
        date: '2024-12-05'
      },
      {
        id: 3,
        tag: '活動公告',
        tagClass: 'announcement',
        title: '歲末感恩祈福活動開始報名',
        description: '歲末年終，本宮將舉辦感恩祈福活動，感謝神明庇佑、信眾護持。活動內容包含祈福儀式、平安餐會及結緣品發放，名額有限，請及…',
        date: '2024-12-03'
      },
      {
        id: 4,
        tag: '節日慶典',
        tagClass: 'festival',
        title: '中秋祭祖大典圓滿落幕',
        description: '農曆八月十五中秋祭祖大典已圓滿結束，感謝眾信眾熱情參與。當日月圓人團圓，祭祀儀式莊嚴隆重，祈願闔家平安、萬事如意。',
        date: '2024-11-28'
      },
      {
        id: 5,
        tag: '法會通知',
        tagClass: 'notice',
        title: '每月初一十五誦經祈福',
        description: '本宮每月農曆初一、十五定期舉行誦經祈福法會，歡迎信眾參與共修。法會時間為上午九時至十一時，現場備有茶點供應,功德回向十…',
        date: '2024-12-01'
      },
      {
        id: 6,
        tag: '活動公告',
        tagClass: 'announcement',
        title: '春季祈福法會通知',
        description: '春季祈福法會將於下月舉行，歡迎信眾報名參加。法會將為信眾祈求身體健康、事業順利、闔家平安。報名請洽櫃台或電話預約。',
        date: '2024-11-25'
      },
      {
        id: 7,
        tag: '節日慶典',
        tagClass: 'festival',
        title: '端午節祈福活動圓滿',
        description: '端午節祈福活動已圓滿結束，感謝眾信眾參與。活動當日進行祈福儀式、發放平安符及艾草，祈願眾信眾平安健康、諸事順遂。',
        date: '2024-11-20'
      },
      {
        id: 8,
        tag: '法會通知',
        tagClass: 'notice',
        title: '農曆七月普渡法會',
        description: '農曆七月將舉行普渡法會，超渡孤魂、祈求平安。法會時間為農曆七月十五日，歡迎信眾參與共修，功德無量。',
        date: '2024-11-15'
      },
      {
        id: 9,
        tag: '活動公告',
        tagClass: 'announcement',
        title: '廟宇整修工程通知',
        description: '本宮將進行外牆整修工程，預計施工期間為三個月。施工期間正常開放參拜，但請信眾注意安全，不便之處敬請見諒。',
        date: '2024-11-10'
      },
      {
        id: 10,
        tag: '節日慶典',
        tagClass: 'festival',
        title: '清明祭祖大典通知',
        description: '清明節將至，本宮將舉辦祭祖大典。歡迎信眾攜家帶眷前來參拜，緬懷先祖恩德，祈求祖先庇佑後代子孫平安順遂。',
        date: '2024-11-05'
      }
    ]
  },
  pageSize: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['view-detail'])

const categories = [
  { id: 'all', name: '全部' },
  { id: 'festival', name: '節日慶典' },
  { id: 'notice', name: '法會通知' },
  { id: 'announcement', name: '活動公告' }
]

const selectedCategory = ref('all')
const currentPage = ref(1)
const totalPages = ref(2) // 模擬分頁

const goToPage = (page) => {
  currentPage.value = page
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const viewNewsDetail = (news) => {
  console.log('查看消息詳情:', news)
  emit('view-detail', news)
}
</script>

<style lang="scss" scoped>
.news-list-section {
  padding: 2rem 0 4rem;
  background: #fafafa;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
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

// 消息列表
.news-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 3rem;
}

.news-item {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  transition: all 0.3s;
  cursor: pointer;
  border: 1px solid transparent;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #e5e5e5;
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

  &.festival {
    background: #8b6f47;
  }

  &.notice {
    background: #a0826d;
  }

  &.announcement {
    background: #b8956a;
  }
}

.news-content {
  flex: 1;
  min-width: 0;
}

.news-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
  transition: color 0.2s;
  
  .news-item:hover & {
    color: #8b7355;
  }
}

.news-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-date {
  color: #999;
  font-size: 14px;
  white-space: nowrap;
  flex-shrink: 0;
}

// 分頁
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e5e5;
}

.page-btn {
  min-width: 80px;
  padding: 0.75rem 1rem;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled):not(.active) {
    background: #f5f5f5;
    border-color: #bbb;
  }
  
  &.active {
    background: #8b7355;
    color: #fff;
    border-color: #8b7355;
    font-weight: 500;
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  
  &.prev,
  &.next {
    min-width: auto;
  }
}

// 響應式設計
@media (max-width: 768px) {
  .news-item {
    flex-direction: column;
    gap: 1rem;
  }
  
  .news-tag {
    align-self: flex-start;
  }
  
  .news-date {
    align-self: flex-start;
  }
  
  .category-tabs {
    flex-wrap: wrap;
  }
  
  .category-tab {
    font-size: 14px;
    padding: 0.6rem 1.2rem;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
  
  .page-btn {
    min-width: 60px;
    padding: 0.6rem 0.8rem;
    font-size: 13px;
  }
}
</style>
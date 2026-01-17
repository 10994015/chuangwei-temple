<template>
  <section class="news-section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">最新消息</h2>
        <a href="#" class="view-all">查看所有消息 ›</a>
      </div>
      
      <div class="news-list">
        <div 
          v-for="news in newsList" 
          :key="news.id"
          class="news-item"
        >
          <div class="news-tag" :class="news.tagClass">{{ news.tag }}</div>
          <div class="news-content">
            <h3 class="news-title">{{ news.title }}</h3>
            <p class="news-description">{{ news.description }}</p>
          </div>
          <div class="news-date">{{ news.date }}</div>
        </div>
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
        tag: '節日慶典',
        tagClass: 'festival',
        title: '新年平安燈開放點燈登記',
        description: '申辰年平安燈現已開放登記，歡迎信眾前來點燈祈福，祈求新年平安順遂。點燈期間自農曆正月初一至十二月三十日，功德無量。',
        date: '2024-12-05'
      },
      {
        id: 2,
        tag: '法會通知',
        tagClass: 'notice',
        title: '冬季祈福法會圓滿結束',
        description: '感謝眾信眾參與本次冬季祈福法會。法會已圓滿結束，祈願眾信眾身體健康、闔家平安。本次法會共有百餘位信眾參與，場面莊嚴…',
        date: '2024-12-08'
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
        tag: '法會通知',
        tagClass: 'notice',
        title: '每月初一十五誦經祈福',
        description: '本宮每月農曆初一、十五定期舉行誦經祈福法會，歡迎信眾參與共修。法會時間為上午九時至十一時，現場備有茶點供應,功德回向十…',
        date: '2024-12-01'
      },
      {
        id: 5,
        tag: '節日慶典',
        tagClass: 'festival',
        title: '中秋祭祀大典圓滿落幕',
        description: '農曆八月十五中秋祭祀大典已圓滿結束，感謝眾信眾熱情參與。當日月圓人團圓，祭祀儀式莊嚴隆重，祈願闔家平安、萬事如意。',
        date: '2024-11-28'
      }
    ]
  }
})
</script>

<style lang="scss" scoped>
.news-section {
  padding: 4rem 0;
  background: #fafafa;
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
  margin-bottom: 2rem;
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

.news-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.news-item {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  transition: box-shadow 0.3s;
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.news-tag {
  padding: 0.4rem 1rem;
  border-radius: 4px;
  font-size: 13px;
  white-space: nowrap;
  color: #fff;
  font-weight: 500;

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
}

.news-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
}

.news-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.news-date {
  color: #999;
  font-size: 14px;
  white-space: nowrap;
}
</style>
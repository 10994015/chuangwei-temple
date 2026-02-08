<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

const router = useRouter()
const route = useRoute()

// 獲取當前的 templeId
const currentTempleId = computed(() => route.params.templeId)

const handleStartBuilding = () => {
  // 檢查是否有 templeId
  if (currentTempleId.value) {
    // 如果在宮廟路由中，跳轉到該宮廟的模板選擇
    router.push({ 
      name: 'app.temple.template-selection',
      params: { templeId: currentTempleId.value }
    })
  } else {
    // 如果不在宮廟路由中，提示用戶
    alert('請先從管理後台選擇一個宮廟')
  }
}
</script>

<template>
  <div class="website-setup-guide">
    <div class="container">
      <h1 class="title">建立您的宮廟網站</h1>
      
      <p class="subtitle">
        只需幾個簡單步驟即可完成網站的初始設定<br>
        之後隨時可以調整內容與風格
      </p>

      <div class="steps-container">
        <div class="step-card">
          <h2 class="step-number">1. 選擇網站風格</h2>
          <p class="step-description">
            即時預覽效果，選擇首頁的畫<br>
            點與氛圍
          </p>
        </div>

        <div class="step-card">
          <h2 class="step-number">2. 設定網站網址</h2>
          <p class="step-description">
            為您的宮廟建立專屬網站網<br>
            址，作為對外公開的官方入<br>
            口。
          </p>
        </div>

        <div class="step-card">
          <h2 class="step-number">3. 開始編輯網站</h2>
          <p class="step-description">
            進入網站編輯器，上傳內容、<br>
            調整版面並預覽發布。
          </p>
        </div>
      </div>

      <p class="notice">
        注意：網站網址設定完成後無法更改，其餘屬性與內容皆可於後台調整。
      </p>

      <button class="start-button" @click="handleStartBuilding">
        開始建立網站
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.website-setup-guide {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f8f8f8;

  .container {
    max-width: 1200px;
    width: 100%;
    text-align: center;
  }

  .title {
    font-size: 2.5rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 1.5rem;
  }

  .subtitle {
    font-size: 1rem;
    color: #666;
    line-height: 1.6;
    margin-bottom: 3rem;
  }

  .steps-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 2.5rem;
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .step-card {
    background: white;
    border-radius: 8px;
    padding: 2.5rem 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }

    .step-number {
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 1rem;
    }

    .step-description {
      font-size: 0.95rem;
      color: #666;
      line-height: 1.8;
    }
  }

  .notice {
    font-size: 0.9rem;
    color: #d9534f;
    margin-bottom: 2.5rem;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }

  .start-button {
    background-color: #d9724f;
    color: white;
    font-size: 1.1rem;
    font-weight: 500;
    padding: 1rem 3rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(217, 114, 79, 0.3);

    &:hover {
      background-color: #c56542;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(217, 114, 79, 0.4);
    }

    &:active {
      transform: translateY(0);
    }
  }
}
</style>
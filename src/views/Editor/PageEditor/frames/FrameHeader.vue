<template>
  <div class="frame-header">
    <div class="header-container">
      <!-- Logo 區域 -->
      <div class="header-logo">
        <div class="logo-box">LOGO</div>
        <span class="temple-name">桃園某某宮</span>
      </div>

      <!-- 導航選單 -->
      <nav class="header-nav">
        <a href="#" class="nav-link">最新消息</a>
        <a href="#" class="nav-link">慶典活動</a>
        <a href="#" class="nav-link">商品與服務</a>
        <a href="#" class="nav-link">捐款護持</a>
        <a href="#" class="nav-link">集影牆</a>
        <a href="#" class="nav-link">關於我們</a>
      </nav>

      <!-- 右側功能 -->
      <div class="header-actions">
        <button class="action-icon">🛒</button>
        <button class="action-btn">會員登入</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  frame: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.frame-header {
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-box {
  width: 60px;
  height: 60px;
  background: #f0f0f0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #999;
  font-weight: 600;
}

.temple-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 40px;
  flex: 1;
  justify-content: center;
}

.nav-link {
  color: #666;
  text-decoration: none;
  font-size: 15px;
  transition: color 0.2s;
  white-space: nowrap;
}

.nav-link:hover {
  color: #E8572A;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-icon {
  width: 40px;
  height: 40px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-icon:hover {
  background: #e5e5e5;
}

.action-btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 6px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.action-btn:hover {
  border-color: #E8572A;
  color: #E8572A;
}
</style>
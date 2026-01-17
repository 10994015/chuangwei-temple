<template>
  <header class="navbar">
    <div class="navbar-container">
      <div class="logo">LOGO</div>
      <nav class="nav-menu">
        <a href="#" class="nav-item">桃園某某宮</a>
        <a href="#" class="nav-item">最新消息</a>
        <a href="#" class="nav-item">慶典活動</a>
        <a href="#" class="nav-item">商品與服務</a>
        <a href="#" class="nav-item">捐款護持</a>
        <a href="#" class="nav-item">集影牆</a>
        <a href="#" class="nav-item">關於我們</a>
      </nav>
      <div class="nav-actions">
        <button class="cart-btn">🛒</button>
        <button class="login-btn">會員登入</button>
      </div>
    </div>
  </header>
</template>

<script setup>
// 可以接收 props 來自定義導航欄內容
const props = defineProps({
  logo: {
    type: String,
    default: 'LOGO'
  },
  menuItems: {
    type: Array,
    default: () => [
      '桃園某某宮',
      '最新消息',
      '慶典活動',
      '商品與服務',
      '捐款護持',
      '集影牆',
      '關於我們'
    ]
  }
})
</script>

<style lang="scss" scoped>
.navbar {
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 100;

  .navbar-container {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
  }

  .logo {
    background: #f5f5f5;
    padding: 0.5rem 1.5rem;
    border-radius: 4px;
    font-weight: 500;
    color: #999;
  }

  .nav-menu {
    display: flex;
    gap: 2rem;
    flex: 1;
    justify-content: center;
  }

  .nav-item {
    color: #666;
    text-decoration: none;
    font-size: 15px;
    transition: color 0.3s;

    &:hover {
      color: #8b6f47;
    }
  }

  .nav-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .cart-btn,
  .login-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: #666;
    transition: color 0.3s;

    &:hover {
      color: #8b6f47;
    }
  }

  .login-btn {
    padding: 0.5rem 1rem;
  }
}
</style>
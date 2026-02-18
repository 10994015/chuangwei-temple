<template>
  <section class="product-list-section">
    <div class="container">
      <!-- 篩選欄 -->
      <div class="filter-bar">
        <div class="filter-group">
          <label>慶典活動</label>
          <select class="filter-select">
            <option>全部</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>類型</label>
          <select class="filter-select">
            <option>全部</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>需求分類</label>
          <select class="filter-select">
            <option>全部</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>排序方式</label>
          <select class="filter-select">
            <option>價格低到高</option>
          </select>
        </div>
        
        <div class="filter-group search-group">
          <label>關鍵字搜尋</label>
          <div class="search-box">
            <input type="text" placeholder="搜尋商品或服務名稱" class="search-input" />
            <button class="search-btn">搜尋</button>
          </div>
        </div>
      </div>

      <!-- 批次選擇按鈕 -->
      <div class="batch-actions">
        <button class="batch-select-btn">批次選擇</button>
      </div>

      <!-- 精選推薦標題 -->
      <h2 class="section-title">精選推薦</h2>

      <!-- 商品 Grid -->
      <div class="products-grid">
        <div 
          v-for="product in productsList" 
          :key="product.id"
          class="product-card"
        >
          <div class="product-image">
            <div class="rank-badge" v-if="product.rank">NO.{{ product.rank }}</div>
            <img :src="product.image" :alt="product.title" class="image" />
            <span v-if="product.badge" class="product-badge" :class="product.badgeClass">
              {{ product.badge }}
            </span>
          </div>
          
          <div class="product-info">
            <h3 class="product-title">{{ product.title }}</h3>
            <div class="product-footer">
              <span class="product-price">{{ product.price }}</span>
              <button class="add-to-cart-btn" @click="addToCart(product)">
                <svg class="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 2L7 6M17 2L19 6M5 6H19L18 16H6L5 6Z"/>
                  <circle cx="9" cy="20" r="1"/>
                  <circle cx="15" cy="20" r="1"/>
                </svg>
              </button>
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
  productsList: {
    type: Array,
    default: () => [
      {
        id: 1,
        rank: 1,
        title: '個人光明燈',
        price: 'NT$600',
        image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=600&h=600&fit=crop'
      },
      {
        id: 2,
        rank: 2,
        title: '平安符',
        price: 'NT$200',
        badge: '熱門',
        badgeClass: 'hot',
        image: 'https://images.unsplash.com/photo-1582719366310-0dd91e0d36f9?w=600&h=600&fit=crop'
      },
      {
        id: 3,
        rank: 3,
        title: '全家光明燈',
        price: 'NT$1,200',
        badge: '推薦',
        badgeClass: 'recommended',
        image: 'https://images.unsplash.com/photo-1551361415-69c87624334f?w=600&h=600&fit=crop'
      },
      {
        id: 4,
        title: '平安香',
        price: 'NT$150',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=600&fit=crop'
      },
      {
        id: 5,
        title: '祈福金紙組',
        price: 'NT$300',
        image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600&h=600&fit=crop'
      },
      {
        id: 6,
        title: '問事服務',
        price: 'NT$500',
        image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&h=600&fit=crop'
      },
      {
        id: 7,
        title: '文昌燈',
        price: 'NT$600',
        image: 'https://images.unsplash.com/photo-1551361415-69c87624334f?w=600&h=600&fit=crop'
      },
      {
        id: 8,
        title: '太歲燈',
        price: 'NT$800',
        badge: '熱門',
        badgeClass: 'hot',
        image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=600&h=600&fit=crop'
      },
      {
        id: 9,
        title: '財神燈',
        price: 'NT$800',
        image: 'https://images.unsplash.com/photo-1582719366310-0dd91e0d36f9?w=600&h=600&fit=crop'
      },
      {
        id: 10,
        title: '祈福法會',
        price: 'NT$1,000',
        badge: '推薦',
        badgeClass: 'recommended',
        image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600&h=600&fit=crop'
      },
      {
        id: 11,
        title: '婚喪喜慶',
        price: 'NT$2,000',
        image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&h=600&fit=crop'
      }
    ]
  }
})

const emit = defineEmits(['add-to-cart'])

const addToCart = (product) => {
  console.log('加入購物車:', product)
  emit('add-to-cart', product)
}
</script>

<style lang="scss" scoped>
.product-list-section {
  padding: 2rem 0 4rem;
  background: #fafafa;
  min-height: 100vh;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

// 篩選欄
.filter-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  label {
    font-size: 14px;
    color: #666;
    font-weight: 500;
  }
  
  &.search-group {
    flex: 1;
    min-width: 300px;
  }
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  background: #fff;
  cursor: pointer;
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: #c9a55a;
  }
}

.search-box {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #c9a55a;
  }
}

.search-btn {
  padding: 0.5rem 2rem;
  background: #8b7355;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #6a5a47;
  }
}

// 批次選擇
.batch-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.batch-select-btn {
  padding: 0.5rem 1.5rem;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #c9a55a;
    color: #c9a55a;
  }
}

// 標題
.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2rem;
}

// 商品 Grid
.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.product-card {
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

.product-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f5f5f5;
}

.rank-badge {
  position: absolute;
  top: 0;
  left: 0;
  padding: 0.5rem 1rem;
  background: #8b7355;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  z-index: 10;
  border-bottom-right-radius: 8px;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-badge {
  position: absolute;
  bottom: 12px;
  right: 12px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  z-index: 10;

  &.hot {
    background: #dc3545;
  }

  &.recommended {
    background: #007bff;
  }
}

.product-info {
  padding: 1.25rem;
}

.product-title {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 20px;
  font-weight: 700;
  color: #8b7355;
}

.add-to-cart-btn {
  background: transparent;
  border: 2px solid #d4d4d4;
  width: 40px;
  height: 40px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    border-color: #c9a55a;
    background: #c9a55a;
    
    .cart-icon {
      color: #ffffff;
    }
  }
}

.cart-icon {
  width: 18px;
  height: 18px;
  color: #999;
  transition: color 0.2s;
}

// 響應式設計
@media (max-width: 1400px) {
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group.search-group {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
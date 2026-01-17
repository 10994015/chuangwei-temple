<template>
  <section class="products-section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">祈福商品</h2>
        <a href="#" class="view-all">查看所有商品 ›</a>
      </div>

      <div class="products-carousel">
        <button 
          class="carousel-btn prev" 
          @click="prevSlide"
          :disabled="currentIndex === 0"
        >
          ‹
        </button>
        
        <div class="products-wrapper">
          <div 
            class="products-container"
            :style="{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }"
          >
            <div 
              v-for="product in productsList" 
              :key="product.id"
              class="product-card"
              :style="{ minWidth: `calc(${100 / visibleCount}% - ${(visibleCount - 1) * 1.5 / visibleCount}rem)` }"
            >
              <div class="product-image">
                <img :src="product.image" :alt="product.title" class="image" />
                <div class="image-overlay">
                  <button class="quick-view-btn">快速查看</button>
                </div>
                <span v-if="product.badge" class="product-badge" :class="product.badgeClass">
                  {{ product.badge }}
                </span>
              </div>
              <div class="product-info">
                <h3 class="product-title">{{ product.title }}</h3>
                <p class="product-description">{{ product.description }}</p>
                <div class="product-footer">
                  <div class="price-group">
                    <span class="product-price">{{ product.price }}</span>
                    <span v-if="product.originalPrice" class="original-price">
                      {{ product.originalPrice }}
                    </span>
                  </div>
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

        <button 
          class="carousel-btn next" 
          @click="nextSlide"
          :disabled="currentIndex >= productsList.length - visibleCount"
        >
          ›
        </button>
      </div>

      <!-- 輪播指示器 -->
      <div class="carousel-indicators">
        <button
          v-for="(_, index) in Math.ceil(productsList.length / visibleCount)"
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
  productsList: {
    type: Array,
    default: () => [
      {
        id: 1,
        title: '平安符',
        price: 'NT$ 200',
        originalPrice: 'NT$ 300',
        badge: '熱門',
        badgeClass: 'hot',
        image: 'https://images.unsplash.com/photo-1582719366310-0dd91e0d36f9?w=600&h=600&fit=crop',
        description: '祈求平安順遂'
      },
      {
        id: 2,
        title: '個人光明燈',
        price: 'NT$ 600',
        badge: '推薦',
        badgeClass: 'recommended',
        image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=600&h=600&fit=crop',
        description: '點亮前程光明'
      },
      {
        id: 3,
        title: '全家光明燈',
        price: 'NT$ 1,200',
        originalPrice: 'NT$ 1,500',
        badge: '熱門',
        badgeClass: 'hot',
        image: 'https://images.unsplash.com/photo-1551361415-69c87624334f?w=600&h=600&fit=crop',
        description: '闔家平安健康'
      },
      {
        id: 4,
        title: '平安米',
        price: 'NT$ 150',
        badge: '新品',
        badgeClass: 'new',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=600&fit=crop',
        description: '福米平安'
      },
      {
        id: 5,
        title: '香油錢',
        price: 'NT$ 500',
        badge: '推薦',
        badgeClass: 'recommended',
        image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600&h=600&fit=crop',
        description: '功德無量'
      },
      {
        id: 6,
        title: '祈福手環',
        price: 'NT$ 350',
        badge: '熱門',
        badgeClass: 'hot',
        image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&h=600&fit=crop',
        description: '隨身護佑'
      }
    ]
  },
  visibleCount: {
    type: Number,
    default: 4
  }
})

const emit = defineEmits(['add-to-cart'])

const currentIndex = ref(0)

const nextSlide = () => {
  if (currentIndex.value < props.productsList.length - props.visibleCount) {
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

const addToCart = (product) => {
  console.log('加入購物車:', product)
  emit('add-to-cart', product)
}
</script>

<style lang="scss" scoped>
.products-section {
  padding: 4rem 0;
  background: linear-gradient(to bottom, #fafaf8 0%, #f5f3f0 100%);
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
    background: linear-gradient(to right, #c9a55a, #d4af37);
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

.products-carousel {
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
    background: #c9a55a;
    color: #ffffff;
    border-color: #c9a55a;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(201, 165, 90, 0.3);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

.products-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.products-container {
  display: flex;
  gap: 1.5rem;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);

    .image-overlay {
      opacity: 1;
    }

    .image {
      transform: scale(1.05);
    }
  }
}

.product-image {
  position: relative;
  width: 100%;
  height: 280px;
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
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.7) 100%
  );
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.quick-view-btn {
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 6px;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.product-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  backdrop-filter: blur(10px);
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  &.hot {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  }

  &.recommended {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  }

  &.new {
    background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  }
}

.product-info {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.product-description {
  font-size: 13px;
  color: #7f8c8d;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.price-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-price {
  font-size: 22px;
  font-weight: 700;
  color: #c9a55a;
  line-height: 1;
}

.original-price {
  font-size: 14px;
  color: #95a5a6;
  text-decoration: line-through;
  line-height: 1;
}

.add-to-cart-btn {
  background: linear-gradient(135deg, #c9a55a 0%, #d4af37 100%);
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(201, 165, 90, 0.3);

  &:hover {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 4px 16px rgba(201, 165, 90, 0.4);
  }

  &:active {
    transform: scale(0.95) rotate(0deg);
  }
}

.cart-icon {
  width: 20px;
  height: 20px;
  color: #ffffff;
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
    background: #c9a55a;
  }
}

// 響應式設計
@media (max-width: 1280px) {
  .products-container {
    gap: 1.2rem;
  }
}

@media (max-width: 1024px) {
  .section-title {
    font-size: 28px;
  }

  .product-image {
    height: 240px;
  }

  .product-title {
    font-size: 16px;
  }

  .product-price {
    font-size: 20px;
  }
}

@media (max-width: 768px) {
  .products-section {
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

  .product-image {
    height: 200px;
  }
}

@media (max-width: 640px) {
  .products-carousel {
    gap: 0.5rem;
  }

  .carousel-btn {
    width: 36px;
    height: 36px;
  }

  .product-info {
    padding: 1.2rem;
  }
}
</style>
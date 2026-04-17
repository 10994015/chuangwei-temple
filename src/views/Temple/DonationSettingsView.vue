<template>
  <div class="donation-settings-page">
    <AppBreadcrumb :items="breadcrumbs" />

    <!-- Tab 導航（沿用主頁樣式） -->
    <div class="tab-nav">
      <router-link
        v-for="tab in tabs"
        :key="tab.key"
        :to="{ name: tab.route, params: { templeId } }"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
      >
        {{ tab.label }}
      </router-link>
    </div>

    <!-- 返回捐款管理 -->
    <button class="back-btn" @click="goBack">
      <span class="back-arrow">‹</span> 返回捐款管理
    </button>

    <!-- 頁面標題 -->
    <h1 class="page-title">捐款設定</h1>

    <!-- 線上收款功能卡片 -->
    <div class="setting-card">
      <div class="setting-card-content">
        <div class="setting-info">
          <div class="setting-name">線上收款功能</div>
          <div class="setting-desc">啟用後信眾可透過網站進行線上捐款，單筆訂單結帳金額最高20萬元</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" v-model="settings.onlinePayment" class="toggle-input" />
          <span class="toggle-track">
            <span class="toggle-thumb"></span>
          </span>
        </label>
      </div>
    </div>

    <!-- 捐款類別卡片 -->
    <div class="setting-card">
      <div class="category-title">捐款類別</div>

      <!-- 類別列表 -->
      <div class="categories-list">
        <div v-for="(cat, idx) in settings.categories" :key="cat.id" class="category-card">
          <!-- 右上角關閉 -->
          <button class="cat-close" type="button" @click="removeCategory(idx)">✕</button>

          <!-- 類別名稱 -->
          <div class="cat-block">
            <label class="cat-label">類別名稱 <span class="required">*</span></label>
            <input v-model="cat.name" class="form-input" placeholder="請輸入類別名稱" />
          </div>

          <!-- 類別圖片 -->
          <div class="cat-block" style="margin-top: 16px;">
            <label class="cat-label">類別圖片</label>
            <div class="image-upload-area">
              <!-- 已上傳圖片 -->
              <div v-for="(img, imgIdx) in cat.images" :key="imgIdx" class="image-preview">
                <img :src="img.url" alt="preview" />
                <button class="image-remove" type="button" @click="removeCatImage(cat, imgIdx)">✕</button>
              </div>
              <!-- 上傳框 -->
              <label
                v-if="cat.images.length < 9"
                class="image-upload-btn"
                :for="`cat-img-${cat.id}`"
              >
                <span class="upload-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M12 16V8M12 8L9 11M12 8L15 11" stroke="#bbb" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3 15V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V15" stroke="#bbb" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                </span>
                <span class="upload-text">上傳圖片</span>
                <input
                  :id="`cat-img-${cat.id}`"
                  type="file"
                  accept="image/*"
                  multiple
                  style="display:none"
                  @change="handleCatImageUpload(cat, $event)"
                />
              </label>
            </div>
            <div class="image-hint">最多可上傳 9 張圖片</div>
          </div>
        </div>
      </div>

      <!-- 新增類別按鈕 -->
      <button class="btn-add-category" type="button" @click="addCategory">
        + 新增類別
      </button>
    </div>

    <!-- 底部操作列 -->
    <div class="form-actions">
      <button class="btn-primary" type="button" @click="handleSave">儲存設定</button>
      <button class="btn-cancel" type="button" @click="goBack">取消</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'

const route = useRoute()
const router = useRouter()

const templeId = computed(() => route.params.templeId)
const activeTab = ref('donations')

const breadcrumbs = [
  { text: '後台管理' },
  { text: '活動與上架管理', onClick: () => router.push({ name: 'app.temple.activity-management', params: { templeId: templeId.value } }) },
  { text: '捐款設定' },
]

const tabs = [
  { key: 'events',    label: '活動管理', route: 'app.temple.activity-management' },
  { key: 'services',  label: '服務管理', route: 'app.temple.activity-management' },
  { key: 'products',  label: '商品管理', route: 'app.temple.activity-management' },
  { key: 'donations', label: '捐款管理', route: 'app.temple.activity-management' },
  { key: 'shipping',  label: '運費管理', route: 'app.temple.activity-management' },
]

const settings = reactive({
  onlinePayment: true,
  categories: [],
})

let catIdCounter = 0

const addCategory = () => {
  settings.categories.push({
    id: ++catIdCounter,
    name: '',
    images: [],
  })
}

const removeCategory = (idx) => {
  settings.categories.splice(idx, 1)
}

const removeCatImage = (cat, idx) => {
  cat.images.splice(idx, 1)
}

const handleCatImageUpload = (cat, event) => {
  const files = Array.from(event.target.files)
  const remaining = 9 - cat.images.length
  files.slice(0, remaining).forEach(file => {
    const url = URL.createObjectURL(file)
    cat.images.push({ url, file })
  })
  event.target.value = ''
}

const handleSave = () => {
  console.log('儲存設定', settings)
  goBack()
}

const goBack = () => {
  router.push({ name: 'app.temple.activity-management', params: { templeId: templeId.value } })
}
</script>

<style scoped>
.donation-settings-page {
  padding: 24px 32px 60px;
  min-height: 100%;
  background: #F3F4F6;
}

/* Tab */
.tab-nav {
  display: flex;
  border-bottom: 2px solid #e8e8e8;
  margin-bottom: 24px;
}
.tab-btn {
  padding: 10px 24px;
  background: none; border: none;
  font-size: 14px; color: #888; cursor: pointer;
  position: relative; font-weight: 500;
  transition: color 0.2s; white-space: nowrap;
  text-decoration: none; display: inline-block;
}
.tab-btn:hover { color: #E8572A; }
.tab-btn.active { color: #E8572A; font-weight: 600; }
.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 0; right: 0;
  height: 2px; background: #E8572A;
  border-radius: 2px 2px 0 0;
}

/* 返回按鈕 */
.back-btn {
  display: inline-flex; align-items: center; gap: 4px;
  background: none; border: none; color: #E8572A; font-size: 14px;
  cursor: pointer; margin-bottom: 16px; padding: 0;
  transition: opacity 0.2s; font-weight: 500;
}
.back-btn:hover { opacity: 0.75; }
.back-arrow { font-size: 16px; line-height: 1; }

/* 頁面標題 */
.page-title {
  font-size: 1.8rem; font-weight: 700; color: #1a1a1a;
  margin: 0 0 24px;
}

/* 設定卡片 */
.setting-card {
  background: #fff; border-radius: 16px; padding: 28px 32px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 20px;
}

/* 線上收款功能列 */
.setting-card-content {
  display: flex; justify-content: space-between; align-items: center;
}
.setting-info { flex: 1; }
.setting-name { font-size: 15px; font-weight: 600; color: #1a1a1a; margin-bottom: 4px; }
.setting-desc { font-size: 13px; color: #888; }

/* Toggle switch */
.toggle-switch { position: relative; cursor: pointer; }
.toggle-input { display: none; }
.toggle-track {
  display: block; width: 48px; height: 26px;
  background: #ddd; border-radius: 13px;
  transition: background 0.25s; position: relative;
}
.toggle-thumb {
  position: absolute; top: 3px; left: 3px;
  width: 20px; height: 20px; border-radius: 50%;
  background: #fff; transition: transform 0.25s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.toggle-input:checked + .toggle-track { background: #E8572A; }
.toggle-input:checked + .toggle-track .toggle-thumb { transform: translateX(22px); }

/* 捐款類別標題 */
.category-title {
  font-size: 15px; font-weight: 700; color: #1a1a1a; margin-bottom: 20px;
}

/* 類別列表 */
.categories-list { display: flex; flex-direction: column; gap: 0; }

/* 類別卡片 */
.category-card {
  position: relative;
  background: #fafafa; border: 1px solid #e8e8e8; border-radius: 14px;
  padding: 24px 28px; margin-bottom: 16px;
}

/* 右上角關閉 */
.cat-close {
  position: absolute; top: 14px; right: 14px;
  background: none; border: none; color: #e53e3e;
  font-size: 16px; cursor: pointer; padding: 4px 6px;
  border-radius: 4px; line-height: 1; transition: background 0.15s;
}
.cat-close:hover { background: #fff0f0; }

/* 類別欄位 */
.cat-block { display: flex; flex-direction: column; }
.cat-label { font-size: 13px; font-weight: 500; color: #555; margin-bottom: 8px; }
.required { color: #E8572A; margin-left: 2px; }

/* 輸入框 */
.form-input {
  padding: 11px 16px; border: 1px solid #e0e0e0; border-radius: 10px;
  font-size: 14px; color: #333; background: #fff; outline: none;
  transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; width: 100%;
}
.form-input:focus { border-color: #E8572A; box-shadow: 0 0 0 3px rgba(232,87,42,0.08); }

/* 圖片上傳 */
.image-upload-area { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; }

.image-preview {
  position: relative; width: 220px; height: 220px;
  border-radius: 12px; overflow: hidden; border: 1px solid #e0e0e0;
}
.image-preview img { width: 100%; height: 100%; object-fit: cover; }
.image-remove {
  position: absolute; top: 6px; right: 6px;
  background: rgba(0,0,0,0.45); color: white; border: none;
  border-radius: 50%; width: 22px; height: 22px; font-size: 11px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}

/* 圖片上傳框：大的虛線框，中間有上傳 icon */
.image-upload-btn {
  width: 220px; height: 440px;
  border: 1.5px dashed #c8c8c8; border-radius: 16px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  cursor: pointer; background: #f5f5f5;
  transition: border-color 0.2s, background 0.2s; gap: 10px;
}
.image-upload-btn:hover { border-color: #E8572A; background: #fff8f6; }
.upload-icon { display: flex; align-items: center; justify-content: center; }
.upload-text { font-size: 13px; color: #aaa; }
.image-hint { font-size: 12px; color: #aaa; margin-top: 8px; }

/* 新增類別按鈕 */
.btn-add-category {
  display: block; width: 100%; padding: 18px; margin-top: 4px;
  background: #fff; border: 1.5px dashed #d0d0d0; border-radius: 14px;
  color: #888; font-size: 14px; cursor: pointer;
  text-align: center; transition: border-color 0.2s, color 0.2s, background 0.2s;
}
.btn-add-category:hover { border-color: #E8572A; color: #E8572A; background: #fff8f6; }

/* 底部操作列 */
.form-actions {
  display: flex; justify-content: flex-end;
  align-items: center; gap: 12px;
  margin-top: 28px; padding-bottom: 20px;
}
.btn-primary {
  padding: 10px 28px; background: #E8572A; color: #fff;
  border: none; border-radius: 50px; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: background 0.2s;
}
.btn-primary:hover { background: #d14a1f; }
.btn-cancel {
  padding: 10px 24px; background: #fff; color: #555;
  border: 1px solid #ddd; border-radius: 50px; font-size: 14px;
  font-weight: 500; cursor: pointer; transition: background 0.2s;
}
.btn-cancel:hover { background: #f5f5f5; }
</style>
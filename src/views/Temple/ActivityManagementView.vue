<template>
  <div class="activity-mgmt">
    <AppBreadcrumb :items="breadcrumbs" />

    <!-- Tab 導航 -->
    <div class="tab-nav">
      <button v-for="tab in tabs" :key="tab.key" class="tab-btn"
        :class="{ active: activeTab === tab.key }" @click="setTab(tab.key)">
        {{ tab.label }}
      </button>
    </div>

    <!-- ===== 活動管理 ===== -->
    <div v-if="activeTab === 'events'" class="tab-content">
      <div class="toolbar">
        <button class="btn-primary" @click="goCreateActivity">＋ 新增活動</button>
      </div>
      <div class="filter-grid filter-grid-4">
        <div class="filter-item">
          <div class="filter-label">關鍵字</div>
          <div class="search-wrap">
            <span class="search-icon">🔍</span>
            <input v-model="eventFilter.keyword" class="filter-input" placeholder="搜尋活動名稱..." />
          </div>
        </div>
        <div class="filter-item">
          <div class="filter-label">活動類別</div>
          <select v-model="eventFilter.category" class="filter-select">
            <option value="">全部</option>
            <option v-for="c in eventCategories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="filter-item">
          <div class="filter-label">活動開始日期</div>
          <input v-model="eventFilter.startDate" type="date" class="filter-input filter-date" placeholder="年 /月/日" />
        </div>
        <div class="filter-item">
          <div class="filter-label">活動結束日期</div>
          <input v-model="eventFilter.endDate" type="date" class="filter-input filter-date" placeholder="年 /月/日" />
        </div>
      </div>
      <div class="export-bar">
        <button class="btn-export">⬇ 下載資料統計表</button>
        <button class="btn-export">⬇ 匯出當前篩選結果</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr>
            <th>活動名稱</th><th>類別</th><th>活動開始日期</th><th>活動結束日期</th><th>發佈狀態</th><th class="col-action">操作</th>
          </tr></thead>
          <tbody>
            <tr v-for="item in filteredEvents" :key="item.id">
              <td class="td-bold">{{ item.name }}</td>
              <td>{{ item.category }}</td>
              <td>{{ item.startDate }}</td>
              <td>{{ item.endDate }}</td>
              <td><span class="badge" :class="statusClass(item.status)">{{ item.status }}</span></td>
              <td class="col-action">
                <button class="icon-btn" @click="goViewActivity(item.id)">👁</button>
                <button class="icon-btn" @click="goEditActivity(item.id)">✏️</button>
                <button class="icon-btn del">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <button class="page-btn">上一頁</button>
        <button class="page-btn page-num active">1</button>
        <button class="page-btn">下一頁</button>
      </div>
    </div>

    <!-- ===== 服務管理 ===== -->
    <div v-if="activeTab === 'services'" class="tab-content">
      <div class="toolbar">
        <button class="btn-primary" @click="goCreateService">＋ 新增服務</button>
      </div>
      <div class="filter-grid filter-grid-4">
        <div class="filter-item">
          <div class="filter-label">關鍵字</div>
          <div class="search-wrap">
            <span class="search-icon">🔍</span>
            <input v-model="serviceFilter.keyword" class="filter-input" placeholder="搜尋服務名稱..." />
          </div>
        </div>
        <div class="filter-item">
          <div class="filter-label">服務類別</div>
          <select v-model="serviceFilter.category" class="filter-select">
            <option value="">全部分類</option>
            <option v-for="c in serviceCategories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="filter-item">
          <div class="filter-label">最低價格</div>
          <input v-model="serviceFilter.minPrice" type="number" class="filter-input" placeholder="最低價格" />
        </div>
        <div class="filter-item">
          <div class="filter-label">最高價格</div>
          <input v-model="serviceFilter.maxPrice" type="number" class="filter-input" placeholder="最高價格" />
        </div>
        <div class="filter-item">
          <div class="filter-label">開始日期</div>
          <input v-model="serviceFilter.startDate" type="date" class="filter-input filter-date" placeholder="年 /月/日" />
        </div>
        <div class="filter-item">
          <div class="filter-label">結束日期</div>
          <input v-model="serviceFilter.endDate" type="date" class="filter-input filter-date" placeholder="年 /月/日" />
        </div>
        <div class="filter-item">
          <div class="filter-label">關聯活動</div>
          <select v-model="serviceFilter.event" class="filter-select">
            <option value="">全部</option>
            <option v-for="e in eventNames" :key="e" :value="e">{{ e }}</option>
          </select>
        </div>
        <div class="filter-item">
          <div class="filter-label">狀態</div>
          <select v-model="serviceFilter.status" class="filter-select">
            <option value="">全部狀態</option>
            <option value="已發佈">已發佈</option>
            <option value="草稿">草稿</option>
            <option value="排程中">排程中</option>
          </select>
        </div>
      </div>
      <div class="export-bar">
        <button class="btn-export">⬇ 下載資料統計表</button>
        <button class="btn-export">⬇ 匯出當前篩選結果</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr>
            <th>服務名稱</th><th>價格</th><th>開始日期</th><th>結束日期</th><th>關聯活動</th><th>報名人數</th><th>發佈狀態</th><th class="col-action">操作</th>
          </tr></thead>
          <tbody>
            <tr v-for="item in services" :key="item.id">
              <td class="td-bold">{{ item.name }}</td>
              <td>NT$ {{ item.price.toLocaleString() }}</td>
              <td>{{ item.startDate }}</td>
              <td>{{ item.endDate }}</td>
              <td>{{ item.event || '無' }}</td>
              <td>{{ item.registered }} / {{ item.capacity }}</td>
              <td><span class="badge" :class="statusClass(item.status)">{{ item.status }}</span></td>
              <td class="col-action">
                <button class="icon-btn">⬇</button>
                <button class="icon-btn" @click="goViewService(item.id)">👁</button>
                <button class="icon-btn" @click="goEditService(item.id)">✏️</button>
                <button class="icon-btn del">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <button class="page-btn">上一頁</button>
        <button class="page-btn page-num active">1</button>
        <button class="page-btn">下一頁</button>
      </div>
    </div>

    <!-- ===== 商品管理 ===== -->
    <div v-if="activeTab === 'products'" class="tab-content">
      <div class="toolbar">
        <button class="btn-primary" @click="goSelectProductType">＋ 新增商品</button>
      </div>
      <div class="filter-grid filter-grid-4">
        <div class="filter-item">
          <div class="filter-label">關鍵字</div>
          <div class="search-wrap">
            <span class="search-icon">🔍</span>
            <input v-model="productFilter.keyword" class="filter-input" placeholder="搜尋商品或規格名稱..." />
          </div>
        </div>
        <div class="filter-item">
          <div class="filter-label">商品類別</div>
          <select v-model="productFilter.category" class="filter-select">
            <option value="">全部分類</option>
            <option v-for="c in productCategories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="filter-item">
          <div class="filter-label">最低價格</div>
          <input v-model="productFilter.minPrice" type="number" class="filter-input" placeholder="最低價格" />
        </div>
        <div class="filter-item">
          <div class="filter-label">最高價格</div>
          <input v-model="productFilter.maxPrice" type="number" class="filter-input" placeholder="最高價格" />
        </div>
        <div class="filter-item">
          <div class="filter-label">上架日期</div>
          <input v-model="productFilter.onDate" type="date" class="filter-input filter-date" placeholder="年 /月/日" />
        </div>
        <div class="filter-item">
          <div class="filter-label">下架日期</div>
          <input v-model="productFilter.offDate" type="date" class="filter-input filter-date" placeholder="年 /月/日" />
        </div>
        <div class="filter-item">
          <div class="filter-label">關聯活動</div>
          <select v-model="productFilter.event" class="filter-select">
            <option value="">全部</option>
            <option v-for="e in eventNames" :key="e" :value="e">{{ e }}</option>
          </select>
        </div>
        <div class="filter-item">
          <div class="filter-label">篩選條件</div>
          <label class="checkbox-label">
            <input type="checkbox" v-model="productFilter.permanent" />
            常駐商品
          </label>
        </div>
      </div>
      <div class="export-bar">
        <button class="btn-export">⬇ 下載資料統計表</button>
        <button class="btn-export">⬇ 匯出當前篩選結果</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr>
            <th>商品名稱</th><th>規格</th><th>價格</th><th>上架日期</th><th>下架日期</th><th>關聯活動</th><th>庫存</th><th>發佈狀態</th><th class="col-action">操作</th>
          </tr></thead>
          <tbody>
            <tr v-for="item in products" :key="item.id">
              <td class="td-bold">{{ item.name }}</td>
              <td>{{ item.spec }}</td>
              <td>NT$ {{ item.price.toLocaleString() }}</td>
              <td>{{ item.onDate }}</td>
              <td>{{ item.offDate || '常駐' }}</td>
              <td>{{ item.event || '-' }}</td>
              <td>{{ item.stock || '-' }}</td>
              <td><span class="badge" :class="statusClass(item.status)">{{ item.status }}</span></td>
              <td class="col-action">
                <button class="icon-btn">⬇</button>
                <button class="icon-btn" @click="goViewProduct(item.id)">👁</button>
                <button class="icon-btn" @click="goEditProduct(item.id)">✏️</button>
                <button class="icon-btn del">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <button class="page-btn">上一頁</button>
        <button class="page-btn page-num active">1</button>
        <button class="page-btn">下一頁</button>
      </div>
    </div>

    <!-- ===== 捐款管理 ===== -->
    <div v-if="activeTab === 'donations'" class="tab-content">
      <!-- 統計卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">本月捐款總額</div>
          <div class="stat-value stat-orange">NT$ 18,000</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">本月捐款筆數</div>
          <div class="stat-value">3 筆</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">累計總額</div>
          <div class="stat-value">NT$ 856k</div>
        </div>
        <div class="stat-card stat-ranking">
          <div class="stat-card-header">
            <span class="stat-label">捐款人排名紀錄</span>
            <button class="btn-more">查看更多</button>
          </div>
          <div class="ranking-list">
            <div v-for="(r, i) in donationRanking" :key="i" class="ranking-row">
              <span class="ranking-no">{{ i + 1 }}. {{ r.name }}</span>
              <span class="ranking-amount">NT$ {{ r.amount }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="toolbar">
        <button class="btn-primary btn-settings" @click="goDonationSettings">⚙ 捐款設定</button>
      </div>

      <div class="filter-grid filter-grid-4">
        <div class="filter-item">
          <div class="filter-label">關鍵字</div>
          <div class="search-wrap">
            <span class="search-icon">🔍</span>
            <input v-model="donationFilter.keyword" class="filter-input" placeholder="搜尋捐款人、付款人、訂單編號..." />
          </div>
        </div>
        <div class="filter-item">
          <div class="filter-label">起始日期</div>
          <input v-model="donationFilter.startDate" type="date" class="filter-input filter-date" placeholder="年 /月/日" />
        </div>
        <div class="filter-item">
          <div class="filter-label">結束日期</div>
          <input v-model="donationFilter.endDate" type="date" class="filter-input filter-date" placeholder="年 /月/日" />
        </div>
        <div class="filter-item">
          <div class="filter-label">捐款類別</div>
          <select v-model="donationFilter.category" class="filter-select">
            <option value="">全部類別</option>
            <option v-for="c in donationCategories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="filter-item">
          <div class="filter-label">最低金額</div>
          <input v-model="donationFilter.minAmount" type="number" class="filter-input" placeholder="輸入最低金額..." />
        </div>
        <div class="filter-item">
          <div class="filter-label">最高金額</div>
          <input v-model="donationFilter.maxAmount" type="number" class="filter-input" placeholder="輸入最高金額..." />
        </div>
      </div>

      <div class="export-bar">
        <button class="btn-export">⬇ 下載資料統計表</button>
        <button class="btn-export">⬇ 匯出當前篩選結果</button>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead><tr>
            <th>捐款人</th><th>付款人</th><th>類別</th><th>金額</th><th>捐款日期</th><th class="col-action">操作</th>
          </tr></thead>
          <tbody>
            <tr v-for="item in donations" :key="item.id">
              <td class="td-bold">{{ item.donor }}</td>
              <td class="td-bold">{{ item.payer }}</td>
              <td>{{ item.category }}</td>
              <td class="td-orange">NT$ {{ item.amount.toLocaleString() }}</td>
              <td>{{ item.date }}</td>
              <td class="col-action">
                <button class="icon-btn">👁</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <button class="page-btn">上一頁</button>
        <button class="page-btn page-num active">1</button>
        <button class="page-btn">下一頁</button>
      </div>
    </div>

    <!-- ===== 運費管理 ===== -->
    <div v-if="activeTab === 'shipping'" class="tab-content shipping-tab">
      <h2 class="section-title">普通運費設定</h2>
      <p class="section-desc">設定根據訂單總金額自動計算的運費級距，系統將依據訂單金額自動套用對應的運費。</p>

      <div v-for="(tier, idx) in shippingTiers" :key="tier.id" class="tier-card">
        <div class="tier-header">
          <span class="tier-title">級距 {{ idx + 1 }}</span>
          <button class="tier-delete" @click="removeTier(idx)">✕</button>
        </div>
        <div class="tier-fields">
          <div class="tier-field">
            <label class="tier-label">最低金額 (元)</label>
            <input v-model="tier.min" type="number" class="tier-input" />
          </div>
          <div class="tier-field tier-field-max">
            <label class="tier-label">最高金額 (元)</label>
            <div class="tier-max-row">
              <input v-model="tier.max" type="number" class="tier-input tier-input-max" :disabled="tier.isAbove" :placeholder="tier.isAbove ? String(tier.min) : ''" />
              <label class="above-label">
                <input type="checkbox" v-model="tier.isAbove" class="above-checkbox" @change="onAboveChange(tier)" />
                以上
              </label>
            </div>
          </div>
          <div class="tier-field">
            <label class="tier-label">運費 (元)</label>
            <input v-model="tier.fee" type="number" class="tier-input" />
          </div>
        </div>
        <div class="tier-preview">
          預覽：{{ tierPreview(tier) }}
        </div>
      </div>

      <button class="btn-add-tier" @click="addTier">＋ 新增級距</button>

      <div class="shipping-actions">
        <button class="btn-secondary" @click="resetShipping">取消變更</button>
        <button class="btn-primary btn-save">儲存變更</button>
      </div>

      <div class="shipping-notice">
        <div class="notice-title">💡 運費計算說明</div>
        <p><strong>普通運費：</strong>系統會依據訂單總金額自動套用對應級距的運費。例如訂單金額為 $800，則套用級距 2 的運費 $60。</p>
        <p><strong>特殊運費：</strong>若訂單中包含標註為「特殊運費」的商品，則該商品將使用其獨立設定的運費，不受普通運費級距影響。</p>
        <p><strong>混合運費：</strong>當訂單同時包含普通商品與特殊商品時，系統將分別計算並加總兩種運費。</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'

const route = useRoute()
const router = useRouter()
const templeId = computed(() => route.params.templeId)

const breadcrumbs = [
  { text: '後台管理' },
  { text: '活動與上架管理' },
]

const VALID_TABS = ['events', 'services', 'products', 'donations', 'shipping']

const tabs = [
  { key: 'events',    label: '活動管理' },
  { key: 'services',  label: '服務管理' },
  { key: 'products',  label: '商品管理' },
  { key: 'donations', label: '捐款管理' },
  { key: 'shipping',  label: '運費管理' },
]

// 從 route.query.tab 初始化，fallback 到 'events'
const activeTab = ref(
  VALID_TABS.includes(route.query.tab) ? route.query.tab : 'events'
)

// 切換 tab：更新 state + URL query（replace 不產生新歷史）
const setTab = (key) => {
  activeTab.value = key
  router.replace({ query: { ...route.query, tab: key } })
}

// 監聽 URL query 變化（例如瀏覽器上一頁/下一頁）
watch(() => route.query.tab, (val) => {
  if (val && VALID_TABS.includes(val) && val !== activeTab.value) {
    activeTab.value = val
  }
})

// ── 導航方法（帶 tab query 讓子頁面返回時恢復） ──
const goCreateActivity = () => {
  router.push({ name: 'app.temple.activity-create', params: { templeId: templeId.value } })
}
const goViewActivity = (id) => {
  router.push({ name: 'app.temple.activity-detail', params: { templeId: templeId.value, activityId: id } })
}
const goEditActivity = (id) => {
  router.push({ name: 'app.temple.activity-edit', params: { templeId: templeId.value, activityId: id } })
}
const goCreateService = () => {
  router.push({ name: 'app.temple.service-create', params: { templeId: templeId.value } })
}
const goViewService = (id) => {
  router.push({ name: 'app.temple.service-detail', params: { templeId: templeId.value, serviceId: id } })
}
const goEditService = (id) => {
  router.push({ name: 'app.temple.service-edit', params: { templeId: templeId.value, serviceId: id } })
}
const goDonationSettings = () => {
  router.push({ name: 'app.temple.donation-settings', params: { templeId: templeId.value } })
}
const goSelectProductType = () => {
  router.push({ name: 'app.temple.product-select', params: { templeId: templeId.value } })
}
const goViewProduct = (id) => {
  router.push({ name: 'app.temple.product-detail', params: { templeId: templeId.value, productId: id } })
}
const goEditProduct = (id) => {
  router.push({ name: 'app.temple.product-edit', params: { templeId: templeId.value, productId: id } })
}

// ── 狀態 badge ──
const statusClass = (s) => ({
  'badge-published': s === '已發佈',
  'badge-draft':     s === '草稿',
  'badge-scheduled': s === '排程中',
})

// ── 活動管理 ──
const eventFilter = reactive({ keyword: '', category: '', startDate: '', endDate: '' })
const eventCategories = ['法會', '慶典', '遶境']
const events = ref([
  { id: 1, name: '春節祈福法會', category: '法會', startDate: '2024-02-10', endDate: '2024-02-15', status: '已發佈' },
  { id: 3, name: '中元普渡法會', category: '法會', startDate: '2024-08-18', endDate: '2024-08-20', status: '草稿' },
  { id: 4, name: '獨立服務', category: '遶境', startDate: '2024-03-25', endDate: '2024-03-26', status: '排程中' },
])
const filteredEvents = computed(() => events.value.filter(e => {
  if (eventFilter.keyword && !e.name.includes(eventFilter.keyword)) return false
  if (eventFilter.category && e.category !== eventFilter.category) return false
  return true
}))
const eventNames = computed(() => events.value.map(e => e.name))

// ── 服務管理 ──
const serviceFilter = reactive({ keyword: '', category: '', minPrice: '', maxPrice: '', startDate: '', endDate: '', event: '', status: '' })
const serviceCategories = ['法會服務', '一般服務']
const services = ref([
  { id: 1, name: '普渡法會供品', price: 500,  startDate: '2024-07-01', endDate: '2024-08-20', event: '中元普渡法會', registered: 15, capacity: 20,  status: '已發佈' },
  { id: 2, name: '普渡供品代辦', price: 300,  startDate: '2024-07-01', endDate: '2024-08-20', event: '中元普渡法會', registered: 8,  capacity: 15,  status: '已發佈' },
  { id: 3, name: '祈福點燈',     price: 1000, startDate: '2024-01-01', endDate: '2024-12-31', event: '',           registered: 45, capacity: 108, status: '已發佈' },
  { id: 4, name: '法會報名',     price: 800,  startDate: '2024-03-01', endDate: '2024-03-25', event: '春節祈福法會', registered: 12, capacity: 30,  status: '排程中' },
])

// ── 商品管理 ──
const productFilter = reactive({ keyword: '', category: '', minPrice: '', maxPrice: '', onDate: '', offDate: '', event: '', permanent: false })
const productCategories = ['法器', '香品', '福袋', '護身符']
const products = ref([
  { id: 1, name: '平安福袋',   spec: '小福袋', price: 200,  onDate: '2024-01-01', offDate: null,         event: '',         stock: null,        status: '已發佈' },
  { id: 2, name: '平安福袋',   spec: '大福袋', price: 500,  onDate: '2024-01-01', offDate: null,         event: '',         stock: null,        status: '已發佈' },
  { id: 3, name: '媽祖護身符', spec: '標準款', price: 300,  onDate: '2024-01-01', offDate: null,         event: '',         stock: null,        status: '已發佈' },
  { id: 4, name: '檀香環香',   spec: '一盒',   price: 180,  onDate: '2024-01-01', offDate: null,         event: '',         stock: '167 / 500', status: '已發佈' },
  { id: 5, name: '春節供品組', spec: '基本組', price: 800,  onDate: '2024-01-20', offDate: '2024-02-20', event: '春節祈福法會', stock: '45 / 100',  status: '排程中' },
])

// ── 捐款管理 ──
const donationFilter = reactive({ keyword: '', startDate: '', endDate: '', category: '', minAmount: '', maxAmount: '' })
const donationCategories = ['一般捐款', '建廟基金', '功德金', '修繕基金']
const donationRanking = ref([
  { name: '王大明', amount: '150k' },
  { name: '李美華', amount: '120k' },
  { name: '陳志強', amount: '98k' },
])
const donations = ref([
  { id: 1, donor: '王大明', payer: '王大明', category: '一般捐款', amount: 5000,  date: '2024-02-20' },
  { id: 2, donor: '李美華', payer: '李志明', category: '建廟基金', amount: 10000, date: '2024-02-18' },
  { id: 3, donor: '陳志強', payer: '陳志強', category: '功德金',   amount: 3000,  date: '2024-02-15' },
  { id: 4, donor: '張美玲', payer: '張美玲', category: '修繕基金', amount: 2000,  date: '2024-02-10' },
])

// ── 運費管理 ──
let tierIdCounter = 3
const shippingTiers = ref([
  { id: 1, min: 0,    max: 500,  fee: 100, isAbove: false },
  { id: 2, min: 501,  max: 1000, fee: 60,  isAbove: false },
  { id: 3, min: 1001, max: 1000, fee: 0,   isAbove: true  },
])
const tierPreview = (tier) => {
  if (tier.isAbove) return `訂單金額 $${tier.min} 以上，運費 $${tier.fee}`
  return `訂單金額 $${tier.min} - $${tier.max}，運費 $${tier.fee}`
}
const addTier = () => {
  const last = shippingTiers.value[shippingTiers.value.length - 1]
  shippingTiers.value.push({ id: ++tierIdCounter, min: last ? Number(last.max) + 1 : 0, max: 0, fee: 0, isAbove: false })
}
const removeTier = (idx) => { shippingTiers.value.splice(idx, 1) }
const onAboveChange = (tier) => { if (tier.isAbove) tier.max = tier.min }
const resetShipping = () => {
  shippingTiers.value = [
    { id: 1, min: 0,    max: 500,  fee: 100, isAbove: false },
    { id: 2, min: 501,  max: 1000, fee: 60,  isAbove: false },
    { id: 3, min: 1001, max: 1000, fee: 0,   isAbove: true  },
  ]
}
</script>

<style scoped>
.activity-mgmt {
  padding: 24px 32px 80px;
  min-height: 100%;
  background: #F3F4F6;
}

/* 麵包屑 */

/* Tab */
.tab-nav {
  display: flex;
  border-bottom: 2px solid #e8e8e8;
  margin-bottom: 24px;
}
.tab-btn {
  padding: 10px 24px;
  background: none;
  border: none;
  font-size: 14px;
  color: #888;
  cursor: pointer;
  position: relative;
  font-weight: 500;
  transition: color 0.2s;
  white-space: nowrap;
}
.tab-btn:hover { color: #E8572A; }
.tab-btn.active { color: #E8572A; font-weight: 600; }
.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 0; right: 0;
  height: 2px;
  background: #E8572A;
  border-radius: 2px 2px 0 0;
}

/* 按鈕 */
.btn-primary {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 20px; background: #E8572A; color: #fff;
  border: none; border-radius: 8px; font-size: 14px; font-weight: 500;
  cursor: pointer; transition: background 0.2s;
}
.btn-primary:hover { background: #d14a1f; }
.btn-secondary {
  display: inline-flex; align-items: center;
  padding: 9px 20px; background: #fff; color: #555;
  border: 1px solid #ddd; border-radius: 8px; font-size: 14px; font-weight: 500;
  cursor: pointer; transition: background 0.2s;
}
.btn-secondary:hover { background: #f5f5f5; }
.btn-settings { background: #E8572A; }
.btn-save { background: #E8572A; }
.btn-save:disabled { background: #f0b09a; cursor: not-allowed; }
.toolbar { margin-bottom: 20px; }

/* 篩選網格 */
.filter-grid { display: grid; gap: 12px 16px; margin-bottom: 16px; }
.filter-grid-4 { grid-template-columns: repeat(4, 1fr); }
.filter-label { font-size: 13px; color: #555; margin-bottom: 6px; font-weight: 500; }
.search-wrap {
  display: flex; align-items: center; gap: 8px;
  background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 8px 12px;
}
.search-icon { font-size: 13px; color: #aaa; flex-shrink: 0; }
.filter-input {
  width: 100%; padding: 9px 12px; border: 1px solid #ddd; border-radius: 8px;
  font-size: 14px; color: #333; background: #fff; box-sizing: border-box; transition: border-color 0.2s;
}
.filter-input:focus { outline: none; border-color: #E8572A; }
.filter-date::placeholder { color: #aaa; }
.search-wrap .filter-input { border: none; padding: 0; outline: none; box-shadow: none; }
.search-wrap .filter-input:focus { box-shadow: none; }
.filter-select {
  width: 100%; padding: 9px 32px 9px 12px; border: 1px solid #ddd; border-radius: 8px;
  font-size: 14px; color: #333; background: #fff; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 10px center;
  cursor: pointer; box-sizing: border-box;
}
.filter-select:focus { outline: none; border-color: #E8572A; }
.checkbox-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; color: #333; cursor: pointer; padding: 9px 0;
}
.checkbox-label input { accent-color: #E8572A; width: 15px; height: 15px; }

/* 匯出列 */
.export-bar { display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 16px; }
.btn-export {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; background: #fff; border: 1px solid #ddd; border-radius: 8px;
  font-size: 13px; color: #555; cursor: pointer; transition: background 0.15s;
}
.btn-export:hover { background: #f5f5f5; }

/* 表格 */
.table-wrap { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 20px; }
.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table thead tr { background: #fafafa; border-bottom: 1px solid #eee; }
.data-table th { padding: 13px 16px; text-align: left; font-weight: 600; color: #555; font-size: 13px; white-space: nowrap; }
.data-table tbody tr { border-bottom: 1px solid #f0f0f0; transition: background 0.15s; }
.data-table tbody tr:last-child { border-bottom: none; }
.data-table tbody tr:hover { background: #fafafa; }
.data-table td { padding: 14px 16px; color: #333; vertical-align: middle; }
.td-bold { font-weight: 600; }
.td-orange { color: #E8572A; font-weight: 600; }
.col-action { text-align: right; white-space: nowrap; }
.icon-btn {
  background: none; border: none; cursor: pointer;
  font-size: 14px; padding: 4px 5px; border-radius: 5px; transition: background 0.15s; opacity: 0.65;
}
.icon-btn:hover { background: #f0f0f0; opacity: 1; }
.icon-btn.del:hover { background: #fff0f0; }

/* badge */
.badge { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.badge-published  { background: #e6f9f0; color: #27a163; }
.badge-draft      { background: #f5f5f5; color: #888; }
.badge-scheduled  { background: #fff8e6; color: #d4860a; }

/* 分頁 */
.pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 4px; }
.page-btn { padding: 8px 16px; background: #fff; border: 1px solid #e0e0e0; border-radius: 20px; font-size: 13px; color: #555; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
.page-btn:hover { border-color: #E8572A; color: #E8572A; }
.page-num { min-width: 36px; text-align: center; padding: 8px 12px; }
.page-num.active { background: #E8572A; border-color: #E8572A; color: #fff; font-weight: 600; }

/* 捐款統計 */
.stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1.4fr; gap: 16px; margin-bottom: 24px; }
.stat-card { background: #fff; border-radius: 14px; padding: 24px 28px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.stat-label { font-size: 13px; color: #888; margin-bottom: 12px; }
.stat-value { font-size: 1.9rem; font-weight: 700; color: #1a1a1a; }
.stat-orange { color: #E8572A; }
.stat-ranking { padding: 20px 24px; }
.stat-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.btn-more { padding: 4px 14px; border: 1px solid #E8572A; border-radius: 20px; color: #E8572A; font-size: 12px; background: none; cursor: pointer; transition: background 0.15s; }
.btn-more:hover { background: #fff3ef; }
.ranking-list { display: flex; flex-direction: column; gap: 10px; }
.ranking-row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; }
.ranking-no { color: #333; font-weight: 500; }
.ranking-amount { color: #E8572A; font-weight: 600; }

/* 運費管理 */
.shipping-tab { max-width: 100%; }
.section-title { font-size: 1.4rem; font-weight: 700; color: #1a1a1a; margin: 0 0 8px; }
.section-desc { font-size: 13px; color: #777; margin: 0 0 24px; }
.tier-card { background: #fff; border-radius: 14px; padding: 24px 28px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.tier-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.tier-title { font-size: 15px; font-weight: 600; color: #222; }
.tier-delete { background: none; border: none; color: #e53e3e; font-size: 16px; cursor: pointer; padding: 2px 6px; border-radius: 4px; transition: background 0.15s; line-height: 1; }
.tier-delete:hover { background: #fff0f0; }
.tier-fields { display: grid; grid-template-columns: 1fr 1.6fr 1fr; gap: 16px; align-items: end; margin-bottom: 16px; }
.tier-label { font-size: 13px; color: #555; margin-bottom: 6px; display: block; font-weight: 500; }
.tier-input { width: 100%; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; color: #333; box-sizing: border-box; transition: border-color 0.2s; }
.tier-input:focus { outline: none; border-color: #E8572A; }
.tier-input:disabled { background: #f5f5f5; color: #aaa; }
.tier-field-max { display: flex; flex-direction: column; }
.tier-field-max > label { margin-bottom: 6px; font-size: 13px; color: #555; font-weight: 500; }
.tier-max-row { display: flex; align-items: center; gap: 10px; }
.tier-input-max { flex: 1; }
.above-label { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #444; margin-top: 8px; cursor: pointer; }
.above-checkbox { accent-color: #E8572A; width: 14px; height: 14px; }
.tier-preview { font-size: 13px; color: #888; padding-top: 12px; border-top: 1px dashed #eee; }
.btn-add-tier { display: block; width: 200px; margin: 8px auto 24px; padding: 10px 0; background: none; border: 1px dashed #ccc; border-radius: 20px; font-size: 14px; color: #888; cursor: pointer; text-align: center; transition: border-color 0.2s, color 0.2s; }
.btn-add-tier:hover { border-color: #E8572A; color: #E8572A; }
.shipping-actions { display: flex; justify-content: flex-end; gap: 12px; margin-bottom: 32px; }
.shipping-notice { background: #eef3ff; border-radius: 12px; padding: 20px 24px; }
.notice-title { font-weight: 700; color: #3355cc; margin-bottom: 12px; font-size: 14px; }
.shipping-notice p { font-size: 13px; color: #334; margin: 0 0 8px; line-height: 1.7; }
.shipping-notice p:last-child { margin: 0; }
.shipping-notice strong { color: #223; }
</style>
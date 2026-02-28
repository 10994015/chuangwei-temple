<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// ── Tab ──
const activeTab = ref('basic')
const tabs = [
  { key: 'basic',  label: '基本資料' },
  { key: 'deity',  label: '神尊管理' },
  { key: 'branch', label: '分靈管理' },
  { key: 'asset',  label: '資產管理' },
]

// ══════════════════════════════════════
// 基本資料
// ══════════════════════════════════════
const basicInfo = ref({
  name: '武德宮',
  address: '雲林縣北港鎮華勝路330號',
  contact: '林總幹事',
  phone: '0912-345-678',
  templePhone: '05-782-1445',
  email: 'service@wude.org.tw',
  openHours: '06:00 - 22:00',
  taxId: '-',
  govReg: '-',
  story: '北港武德宮，位於臺灣雲林縣北港鎮，是臺灣規模最大的財神廟之一。主祀五路武財神，香火鼎盛，信徒眾多。廟貌宏偉，建築精美，不僅是信仰中心，也是當地的文化地標。',
  photo: null,
})

const socialInfo = ref({
  facebook: 'https://www.facebook.com/wudegong',
  instagram: 'https://www.instagram.com/wudegong',
  line: '@wudegong',
})

// ══════════════════════════════════════
// 神尊管理
// ══════════════════════════════════════
const deitySearch = ref('')
const deityTypeFilter = ref('全部類型')
const deityTypeOptions = ['全部類型', '主祀神', '配祀神']

const deities = ref([
  { id: 1, name: '武財神', type: '主祀神', source: '北港朝天宮', birthday: '農曆三月十五日' },
  { id: 2, name: '黑虎將軍', type: '配祀神', source: '嘉義城隍廟', birthday: '農曆六月初六' },
])

const filteredDeities = computed(() => {
  return deities.value.filter(d => {
    const matchSearch = !deitySearch.value ||
      d.name.includes(deitySearch.value) || d.source.includes(deitySearch.value)
    const matchType = deityTypeFilter.value === '全部類型' || d.type === deityTypeFilter.value
    return matchSearch && matchType
  })
})

const showDeityTypeDropdown = ref(false)

const handleDeleteDeity = (id) => {
  if (confirm('確定要刪除此神尊資料嗎？')) {
    deities.value = deities.value.filter(d => d.id !== id)
  }
}

// ══════════════════════════════════════
// 分靈管理
// ══════════════════════════════════════
const branchSearch = ref('')

const branches = ref([
  { id: 1, deity: '武財神',  date: '2020-05-15', offerer: '陳信徒', location: '台北市大安區' },
  { id: 2, deity: '黑虎將軍', date: '2021-08-20', offerer: '林先生', location: '新北市板橋區' },
])

const filteredBranches = computed(() => {
  if (!branchSearch.value) return branches.value
  const q = branchSearch.value
  return branches.value.filter(b =>
    b.deity.includes(q) || b.offerer.includes(q) || b.location.includes(q)
  )
})

const handleDeleteBranch = (id) => {
  if (confirm('確定要刪除此分靈資料嗎？')) {
    branches.value = branches.value.filter(b => b.id !== id)
  }
}

// ══════════════════════════════════════
// 資產管理
// ══════════════════════════════════════
const assetSearch = ref('')

const assets = ref([
  { id: 1, name: '香爐',  donor: '陳信徒', qty: 3, date: '2023-01-15' },
  { id: 2, name: '神桌',  donor: '林董事', qty: 1, date: '2022-08-20' },
  { id: 3, name: '供桌布', donor: '宮廟採買', qty: 5, date: '2023-06-10' },
])

const filteredAssets = computed(() => {
  if (!assetSearch.value) return assets.value
  const q = assetSearch.value
  return assets.value.filter(a =>
    a.name.includes(q) || a.donor.includes(q)
  )
})

const handleDeleteAsset = (id) => {
  if (confirm('確定要刪除此資產資料嗎？')) {
    assets.value = assets.value.filter(a => a.id !== id)
  }
}
</script>

<template>
  <div class="temple-info-view">
    <!-- 麵包屑 -->
    <div class="breadcrumb">
      <span class="breadcrumb-link">後台管理</span>
      <span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-current">宮廟資料管理</span>
    </div>

    <!-- Tab 列 -->
    <div class="tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ════════ 基本資料 ════════ -->
    <template v-if="activeTab === 'basic'">
      <!-- 基本資料卡 -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">基本資料</h2>
          <button class="btn-edit">
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
            編輯資料
          </button>
        </div>

        <div class="info-grid">
          <div class="info-field full">
            <div class="field-label">宮廟名稱</div>
            <div class="field-value">{{ basicInfo.name }}</div>
          </div>
          <div class="info-field full">
            <div class="field-label">地址</div>
            <div class="field-value">{{ basicInfo.address }}</div>
          </div>
          <div class="info-field">
            <div class="field-label">聯絡人</div>
            <div class="field-value">{{ basicInfo.contact }}</div>
          </div>
          <div class="info-field">
            <div class="field-label">聯絡電話</div>
            <div class="field-value">{{ basicInfo.phone }}</div>
          </div>
          <div class="info-field">
            <div class="field-label">宮廟電話</div>
            <div class="field-value">{{ basicInfo.templePhone }}</div>
          </div>
          <div class="info-field">
            <div class="field-label">Email</div>
            <div class="field-value">{{ basicInfo.email }}</div>
          </div>
          <div class="info-field">
            <div class="field-label">開放時間</div>
            <div class="field-value">{{ basicInfo.openHours }}</div>
          </div>
          <div class="info-field">
            <div class="field-label">統編（選填）</div>
            <div class="field-value">{{ basicInfo.taxId }}</div>
          </div>
          <div class="info-field full">
            <div class="field-label">政府登記文號（選填）</div>
            <div class="field-value">{{ basicInfo.govReg }}</div>
          </div>
          <div class="info-field full">
            <div class="field-label">宮廟故事</div>
            <div class="field-value">{{ basicInfo.story }}</div>
          </div>
          <div class="info-field full">
            <div class="field-label">宮廟照片</div>
            <div class="photo-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 社群資訊卡 -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">社群資訊</h2>
          <button class="btn-edit">
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
            編輯資料
          </button>
        </div>
        <div class="info-grid">
          <div class="info-field">
            <div class="field-label">Facebook 粉絲專頁</div>
            <div class="field-value">{{ socialInfo.facebook }}</div>
          </div>
          <div class="info-field">
            <div class="field-label">Instagram 帳號</div>
            <div class="field-value">{{ socialInfo.instagram }}</div>
          </div>
          <div class="info-field">
            <div class="field-label">Line 官方帳號 ID</div>
            <div class="field-value">{{ socialInfo.line }}</div>
          </div>
        </div>
      </div>
    </template>

    <!-- ════════ 神尊管理 ════════ -->
    <template v-if="activeTab === 'deity'">
      <!-- 工具列 -->
      <div class="toolbar">
        <button class="btn-add">
          <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/></svg>
          新增神尊
        </button>
        <div class="toolbar-right">
          <div class="search-box">
            <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
            </svg>
            <input v-model="deitySearch" class="search-input" placeholder="搜尋神尊稱謂或分靈來源..." />
          </div>
          <!-- 類型篩選 -->
          <div class="select-wrapper" @click.stop>
            <button class="select-btn" @click="showDeityTypeDropdown = !showDeityTypeDropdown">
              {{ deityTypeFilter }}
              <svg class="chevron" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
            </button>
            <div v-if="showDeityTypeDropdown" class="select-dropdown">
              <button
                v-for="opt in deityTypeOptions" :key="opt"
                class="select-option" :class="{ active: deityTypeFilter === opt }"
                @click="deityTypeFilter = opt; showDeityTypeDropdown = false"
              >{{ opt }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 表格 -->
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>神尊稱謂</th>
              <th>主祀/配祀</th>
              <th>分靈來源</th>
              <th>神尊誕辰</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in filteredDeities" :key="d.id">
              <td class="bold">{{ d.name }}</td>
              <td>{{ d.type }}</td>
              <td>{{ d.source }}</td>
              <td>{{ d.birthday }}</td>
              <td>
                <div class="action-btns">
                  <button class="icon-btn" title="查看"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg></button>
                  <button class="icon-btn" title="編輯"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg></button>
                  <button class="icon-btn danger" title="刪除" @click="handleDeleteDeity(d.id)"><svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg></button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredDeities.length === 0">
              <td colspan="5" class="empty-row">尚無資料</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ════════ 分靈管理 ════════ -->
    <template v-if="activeTab === 'branch'">
      <div class="toolbar">
        <button class="btn-add">
          <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/></svg>
          新增分靈
        </button>
        <div class="toolbar-right">
          <div class="search-box">
            <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
            </svg>
            <input v-model="branchSearch" class="search-input" placeholder="搜尋神尊、恭奉者或恭奉地..." />
          </div>
        </div>
      </div>

      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>本廟分靈神尊</th>
              <th>分靈日期</th>
              <th>恭奉者</th>
              <th>恭奉地</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in filteredBranches" :key="b.id">
              <td class="bold">{{ b.deity }}</td>
              <td>{{ b.date }}</td>
              <td>{{ b.offerer }}</td>
              <td>{{ b.location }}</td>
              <td>
                <div class="action-btns">
                  <button class="icon-btn" title="查看"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg></button>
                  <button class="icon-btn" title="編輯"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg></button>
                  <button class="icon-btn danger" title="刪除" @click="handleDeleteBranch(b.id)"><svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg></button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredBranches.length === 0">
              <td colspan="5" class="empty-row">尚無資料</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ════════ 資產管理 ════════ -->
    <template v-if="activeTab === 'asset'">
      <div class="toolbar">
        <button class="btn-add">
          <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/></svg>
          新增資產
        </button>
        <div class="toolbar-right">
          <div class="search-box">
            <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
            </svg>
            <input v-model="assetSearch" class="search-input" placeholder="搜尋物品名稱、捐贈者或存放地點..." />
          </div>
        </div>
      </div>

      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>物品名稱</th>
              <th>捐贈或採買者</th>
              <th>數量</th>
              <th>捐贈日期</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in filteredAssets" :key="a.id">
              <td class="bold">{{ a.name }}</td>
              <td>{{ a.donor }}</td>
              <td>{{ a.qty }}</td>
              <td>{{ a.date }}</td>
              <td>
                <div class="action-btns">
                  <button class="icon-btn" title="查看"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg></button>
                  <button class="icon-btn" title="編輯"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg></button>
                  <button class="icon-btn danger" title="刪除" @click="handleDeleteAsset(a.id)"><svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg></button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredAssets.length === 0">
              <td colspan="5" class="empty-row">尚無資料</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

  </div>
</template>

<style scoped lang="scss">
.temple-info-view {
  padding: 20px 28px 48px;
  background: #f3f4f6;
  min-height: 100%;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// ── 麵包屑 ──
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}
.breadcrumb-link {
  color: #6b7280;
  cursor: pointer;
  &:hover { color: #E8572A; }
}
.breadcrumb-sep { color: #9ca3af; font-size: 16px; }
.breadcrumb-current { color: #E8572A; font-weight: 500; }

// ── Tab 列 ──
.tab-bar {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #e5e7eb;
}

.tab-btn {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 15px;
  color: #6b7280;
  cursor: pointer;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  transition: all 0.15s;
  margin-bottom: -1px;

  &:hover { color: #374151; }

  &.active {
    color: #E8572A;
    border-bottom-color: #E8572A;
    font-weight: 500;
  }
}

// ── 卡片 ──
.card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.btn-edit {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  background: transparent;
  border: 1.5px solid #E8572A;
  border-radius: 20px;
  color: #E8572A;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  transition: all 0.2s;
  &:hover { background: #fff7f3; }
  svg { width: 14px; height: 14px; }
}

// ── 資訊格 ──
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 0 24px 20px;
}

.info-field {
  padding: 14px 0;

  &.full { grid-column: 1 / -1; }
}

.field-label {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 6px;
}

.field-value {
  font-size: 15px;
  color: #1f2937;
  line-height: 1.6;
}

// ── 照片佔位 ──
.photo-placeholder {
  margin-top: 8px;
  width: 100%;
  height: 200px;
  background: #f3f4f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d1d5db;

  svg { width: 48px; height: 48px; }
}

// ── 工具列 ──
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: #E8572A;
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  transition: background 0.2s;
  white-space: nowrap;
  &:hover { background: #d94b1f; }
  svg { width: 16px; height: 16px; }
}

// ── 搜尋框 ──
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0 14px;
  height: 40px;
  min-width: 280px;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: #E8572A;
    box-shadow: 0 0 0 2px rgba(232,87,42,0.08);
  }
}
.search-icon { width: 15px; height: 15px; color: #9ca3af; flex-shrink: 0; }
.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #374151;
  background: transparent;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  &::placeholder { color: #9ca3af; }
}

// ── 類型下拉 ──
.select-wrapper { position: relative; }

.select-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  white-space: nowrap;
  &:hover { border-color: #d1d5db; }
}
.chevron { width: 14px; height: 14px; color: #9ca3af; }

.select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  min-width: 120px;
  z-index: 100;
  overflow: hidden;
}
.select-option {
  width: 100%;
  padding: 9px 14px;
  background: none;
  border: none;
  text-align: left;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  &:hover { background: #f9fafb; }
  &.active { color: #E8572A; font-weight: 500; background: #fff7f3; }
}

// ── 表格卡 ──
.table-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th {
    padding: 12px 20px;
    text-align: left;
    color: #6b7280;
    font-weight: 400;
    font-size: 13px;
    border-bottom: 1px solid #f3f4f6;
    background: #ffffff;
  }

  td {
    padding: 16px 20px;
    color: #374151;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: middle;
  }

  tbody tr:last-child td { border-bottom: none; }
  tbody tr:hover td { background: #fafafa; }
}

.bold { font-weight: 600; color: #1f2937; }

.empty-row {
  text-align: center;
  color: #9ca3af;
  padding: 40px !important;
}

// ── 操作按鈕 ──
.action-btns {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  color: #9ca3af;
  display: flex;
  align-items: center;
  transition: color 0.15s;
  svg { width: 17px; height: 17px; }
  &:hover { color: #374151; }
  &.danger:hover { color: #ef4444; }
}

@media (max-width: 768px) {
  .temple-info-view { padding: 16px; }
  .info-grid { grid-template-columns: 1fr; }
  .toolbar { flex-wrap: wrap; }
  .search-box { min-width: 100%; }
}
</style>
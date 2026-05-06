<template>
  <div class="tmpl-mgmt">
    <div class="breadcrumb">
      <span class="bc-root">香客帳號管理</span>
      <span class="bc-sep">›</span>
      <span class="bc-current">網站模板管理</span>
    </div>

    <div class="page-header">
      <h1 class="page-title">網站模板管理</h1>
    </div>

    <!-- Tab 導航 -->
    <div class="tab-nav">
      <button
        v-for="tab in tabs" :key="tab.key"
        class="tab-btn" :class="{ active: activeTab === tab.key }"
        @click="setTab(tab.key)"
      >{{ tab.label }}</button>
    </div>

    <!-- ===== 模板管理 ===== -->
    <div v-if="activeTab === 'templates'" class="tab-content">

      <!-- 篩選列 -->
      <div class="filter-bar">
        <div class="filter-field filter-field--wide">
          <label class="filter-label">搜尋名稱</label>
          <div class="filter-search">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="search-icon-svg">
              <circle cx="6" cy="6" r="4.5" stroke="#aaa" stroke-width="1.5"/>
              <path d="M10 10l2.5 2.5" stroke="#aaa" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <input v-model="tmplName" type="text" placeholder="搜尋模板名稱" class="search-input" @keydown.enter="fetchTemplates" />
          </div>
        </div>
        <div class="filter-field filter-field--wide">
          <label class="filter-label">模板 ID</label>
          <div class="filter-search">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="search-icon-svg">
              <circle cx="6" cy="6" r="4.5" stroke="#aaa" stroke-width="1.5"/>
              <path d="M10 10l2.5 2.5" stroke="#aaa" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <input v-model="tmplWebTemplateId" type="text" placeholder="輸入模板 ID" class="search-input" @keydown.enter="fetchTemplates" />
          </div>
        </div>
        <div class="filter-field">
          <label class="filter-label">方案層級</label>
          <select v-model="tmplLevel" class="filter-select" @change="fetchTemplates">
            <option value="">全部</option>
            <option value="FREE">FREE</option>
            <option value="PRO">PRO</option>
            <option value="ENTERPRISE">ENTERPRISE</option>
          </select>
        </div>
        <div class="filter-field">
          <label class="filter-label">狀態</label>
          <select v-model="tmplStatus" class="filter-select" @change="fetchTemplates">
            <option value="">全部</option>
            <option value="OPEN">啟用</option>
            <option value="INVALID">停用</option>
          </select>
        </div>
        <button class="btn-search" @click="fetchTemplates">搜尋</button>
      </div>

      <!-- 統計列 -->
      <div class="result-bar">
        <span class="result-count">共 <b>{{ tmplTotal }}</b> 筆</span>
        <button class="btn-create" @click="router.push({ name: 'app.cms.customer-template-create' })">＋ 新建模板</button>
        <div class="sort-wrap">
          <select v-model="tmplSortBy" class="sort-select" @change="fetchTemplates">
            <option value="createdAt">建立時間</option>
            <option value="name">名稱</option>
            <option value="level">方案層級</option>
            <option value="status">狀態</option>
          </select>
          <select v-model="tmplSortOrder" class="sort-select" @change="fetchTemplates">
            <option value="DESC">由新到舊</option>
            <option value="ASC">由舊到新</option>
          </select>
        </div>
      </div>

      <!-- 載入中 -->
      <div v-if="tmplLoading" class="loading-row">載入中...</div>

      <!-- 卡片格 -->
      <div v-else-if="tmplList.length > 0" class="card-grid">
        <div v-for="item in tmplList" :key="item.id" class="template-card" @click="router.push({ name: 'app.cms.customer-template-detail', params: { templateId: item.id } })" style="cursor:pointer">
          <!-- 封面圖 -->
          <div class="card-cover">
            <img v-if="item.coverImgUrl" :src="item.coverImgUrl" :alt="item.name" class="cover-img" />
            <div v-else class="cover-placeholder">
              <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
                <rect width="40" height="40" rx="8" fill="#f3f4f6"/>
                <path d="M10 28l8-8 5 5 4-4 8 8H10z" fill="#d1d5db"/>
                <circle cx="14" cy="16" r="3" fill="#d1d5db"/>
              </svg>
              <span>無封面</span>
            </div>
            <span class="cover-badge" :class="item.status === 'OPEN' ? 'badge-green' : 'badge-red'">
              {{ item.status === 'OPEN' ? '啟用' : '停用' }}
            </span>
          </div>

          <!-- 卡片內容 -->
          <div class="card-body">
            <div class="card-title">{{ item.name }}</div>
            <div v-if="item.categoryName" class="card-category">{{ item.categoryName }}</div>
            <div class="card-desc">{{ item.description || '（無描述）' }}</div>
            <div class="card-meta">
              <span class="meta-tag" :class="levelClass(item.level)">{{ item.level }}</span>
              <span v-if="item.reviewStatus" class="badge" :class="rvStatusClass(item.reviewStatus)">{{ rvStatusLabel(item.reviewStatus) }}</span>
            </div>
            <div class="card-info">
              <span>建立者：{{ item.createdByName || '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空狀態 -->
      <div v-else class="empty-state">
        <svg viewBox="0 0 64 64" fill="none" width="64" height="64">
          <rect width="64" height="64" rx="16" fill="#f3f4f6"/>
          <path d="M16 44l12-12 8 8 6-6 12 12H16z" fill="#e5e7eb"/>
          <circle cx="22" cy="24" r="5" fill="#e5e7eb"/>
        </svg>
        <p>目前沒有符合條件的模板</p>
      </div>

      <!-- 分頁 -->
      <div v-if="tmplTotalPages > 1" class="pagination">
        <button class="page-btn" :disabled="tmplPage === 1" @click="goTmplPage(tmplPage - 1)">上一頁</button>
        <button
          v-for="p in tmplTotalPages" :key="p"
          class="page-btn" :class="{ active: p === tmplPage }"
          @click="goTmplPage(p)"
        >{{ p }}</button>
        <button class="page-btn" :disabled="tmplPage === tmplTotalPages" @click="goTmplPage(tmplPage + 1)">下一頁</button>
      </div>
    </div>

    <!-- ===== 審核管理 ===== -->
    <div v-if="activeTab === 'review'" class="tab-content">
      <div class="filter-bar">
        <div class="filter-field filter-field--wide">
          <label class="filter-label">模板 ID</label>
          <div class="filter-search">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="search-icon-svg">
              <circle cx="6" cy="6" r="4.5" stroke="#aaa" stroke-width="1.5"/>
              <path d="M10 10l2.5 2.5" stroke="#aaa" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <input v-model="rvWebTemplateId" type="text" placeholder="輸入模板 ID" class="search-input" @keydown.enter="fetchReview" />
          </div>
        </div>
        <button class="btn-search" @click="fetchReview" :disabled="!rvWebTemplateId.trim()">搜尋</button>
      </div>

      <!-- 載入中 -->
      <div v-if="rvLoading" class="loading-row">載入中...</div>

      <!-- 查詢結果卡片 -->
      <div v-else-if="rvResult" class="rv-card">
        <div class="rv-card-header">
          <div class="rv-card-title">{{ rvResult.name || '-' }}</div>
          <span class="badge" :class="rvStatusClass(rvResult.status)">{{ rvStatusLabel(rvResult.status) }}</span>
        </div>

        <div v-if="rvResult.coverImgUrl" class="rv-cover">
          <img :src="rvResult.coverImgUrl" :alt="rvResult.name" class="rv-cover-img" />
        </div>

        <div class="rv-grid">
          <div class="rv-row">
            <span class="rv-label">審查 ID</span>
            <span class="rv-value rv-id">{{ rvResult.id }}</span>
          </div>
          <div class="rv-row">
            <span class="rv-label">模板 ID</span>
            <span class="rv-value rv-id">{{ rvResult.webTemplateId }}</span>
          </div>
          <div class="rv-row">
            <span class="rv-label">模板名稱</span>
            <span class="rv-value">{{ rvResult.name || '-' }}</span>
          </div>
          <div class="rv-row">
            <span class="rv-label">描述</span>
            <span class="rv-value">{{ rvResult.description || '-' }}</span>
          </div>
          <div class="rv-row">
            <span class="rv-label">方案層級</span>
            <span class="rv-value">
              <span class="meta-tag" :class="levelClass(rvResult.level)">{{ rvResult.level || '-' }}</span>
            </span>
          </div>
          <div class="rv-row">
            <span class="rv-label">字型</span>
            <span class="rv-value" :style="{ fontFamily: rvResult.frontFamily }">{{ rvResult.frontFamily || '-' }}</span>
          </div>
          <div class="rv-row">
            <span class="rv-label">審核狀態</span>
            <span class="rv-value">
              <span class="badge" :class="rvStatusClass(rvResult.status)">{{ rvStatusLabel(rvResult.status) }}</span>
            </span>
          </div>
          <div class="rv-row">
            <span class="rv-label">備註</span>
            <span class="rv-value">{{ rvResult.note || '-' }}</span>
          </div>
          <div class="rv-row">
            <span class="rv-label">建立者</span>
            <span class="rv-value">{{ rvResult.createdBy || '-' }}</span>
          </div>
          <div class="rv-row">
            <span class="rv-label">送審時間</span>
            <span class="rv-value">{{ formatDate(rvResult.createdAt) }}</span>
          </div>
          <div class="rv-row">
            <span class="rv-label">更新時間</span>
            <span class="rv-value">{{ formatDate(rvResult.updatedAt) }}</span>
          </div>
        </div>
      </div>

      <!-- 尚未搜尋 / 查無結果 -->
      <div v-else-if="rvSearched" class="empty-state">
        <p>查無此模板的審查記錄</p>
      </div>
      <div v-else class="rv-hint">輸入模板 ID 後點擊搜尋，即可查看該模板最新的審查狀態。</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axiosClient from '@/axios'

const router = useRouter()

const tabs = [
  { key: 'templates', label: '模板管理' },
  { key: 'review',    label: '審核管理' },
]
const activeTab = ref('templates')

const setTab = (key) => {
  activeTab.value = key
  if (key === 'templates') fetchTemplates()
}

// ── 模板管理 ──
const tmplList          = ref([])
const tmplLoading       = ref(false)
const tmplWebTemplateId = ref('')
const tmplName          = ref('')
const tmplLevel         = ref('')
const tmplStatus        = ref('')
const tmplSortBy        = ref('createdAt')
const tmplSortOrder     = ref('DESC')
const tmplPage          = ref(1)
const tmplPageSize      = ref(12)
const tmplTotal         = ref(0)
const tmplTotalPages    = ref(1)

const fetchTemplates = async () => {
  tmplLoading.value = true
  try {
    const res = await axiosClient.get('/frontend/web-template/', {
      params: {
        webTemplateId: tmplWebTemplateId.value || undefined,
        name:          tmplName.value          || undefined,
        level:         tmplLevel.value         || undefined,
        status:        tmplStatus.value        || undefined,
        sortBy:        tmplSortBy.value,
        sortOrder:     tmplSortOrder.value,
        page:          tmplPage.value,
        pageSize:      tmplPageSize.value,
      },
    })
    const data = res.data?.data || {}
    console.log('customer template list:', data)
    tmplList.value       = data.data || []
    tmplTotal.value      = data.total ?? 0
    tmplTotalPages.value = data.totalPages ?? 1
  } catch (e) {
    console.error('獲取模板列表失敗:', e)
    tmplList.value = []
  } finally {
    tmplLoading.value = false
  }
}

const goTmplPage = (p) => { tmplPage.value = p; fetchTemplates() }

const levelClass = (level) => ({
  FREE:       'tag-free',
  PRO:        'tag-pro',
  ENTERPRISE: 'tag-enterprise',
}[level] ?? '')

// ── 審核管理 ──
const rvWebTemplateId = ref('')
const rvLoading       = ref(false)
const rvResult        = ref(null)
const rvSearched      = ref(false)

const fetchReview = async () => {
  const id = rvWebTemplateId.value.trim()
  if (!id) return
  rvLoading.value = true
  rvResult.value  = null
  rvSearched.value = false
  try {
    const res = await axiosClient.get(`/frontend/web-template/${id}/review`)
    console.log('customer template review:', res.data)
    rvResult.value = res.data?.data || null
  } catch (e) {
    console.error('獲取審查記錄失敗:', e)
    rvResult.value = null
  } finally {
    rvLoading.value  = false
    rvSearched.value = true
  }
}

const rvStatusLabel = (s) => ({
  PENDING:       '待審核',
  IN_REVIEW:     '審核中',
  RE_REVIEW:     '重新審核',
  REVIEW_FAILED: '審核失敗',
  APPROVED:      '已通過',
  NEED_RESUBMIT: '需重新提交',
}[s] ?? s)

const rvStatusClass = (s) => ({
  PENDING:       'badge-yellow',
  IN_REVIEW:     'badge-blue',
  RE_REVIEW:     'badge-orange',
  REVIEW_FAILED: 'badge-red',
  APPROVED:      'badge-green',
  NEED_RESUBMIT: 'badge-orange',
}[s] ?? '')

const formatDate = (d) => d ? new Date(d).toLocaleDateString('zh-TW') : '-'

onMounted(fetchTemplates)
</script>

<style scoped lang="scss">
.tmpl-mgmt {
  padding: 24px 32px 60px;
  min-height: 100%;
  background: #f3f4f6;
}

/* 麵包屑 */
.breadcrumb { font-size: 13px; color: #999; margin-bottom: 24px; }
.bc-sep { margin: 0 6px; }
.bc-current { color: #E8572A; font-weight: 500; }

.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 700; color: #1f2937; margin: 0; }

/* Tab */
.tab-nav {
  display: flex;
  gap: 4px;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 20px;
}
.tab-btn {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { color: #E8572A; }
  &.active { color: #E8572A; border-bottom-color: #E8572A; }
}

/* 篩選列 */
.filter-bar {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
}
.filter-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 130px;
  &--wide { min-width: 200px; }
}
.filter-label { font-size: 12px; color: #6b7280; font-weight: 500; }
.filter-search { position: relative; display: flex; align-items: center; }
.search-icon-svg { position: absolute; left: 10px; pointer-events: none; }
.search-input {
  width: 100%;
  padding: 8px 10px 8px 30px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  &:focus { border-color: #E8572A; }
}
.filter-select {
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  background: #fff;
  &:focus { border-color: #E8572A; }
}
.btn-search {
  padding: 8px 20px;
  background: #E8572A;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  align-self: flex-end;
  white-space: nowrap;
  transition: background 0.2s;
  &:hover { background: #d14a1f; }
}

/* 統計列 */
.result-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.result-count { font-size: 13px; color: #6b7280; b { color: #1f2937; } }
.btn-create {
  padding: 8px 18px;
  background: #E8572A;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #d14a1f; }
}
.result-info  { font-size: 13px; color: #6b7280; margin-bottom: 12px; b { color: #1f2937; } }
.sort-wrap { display: flex; gap: 8px; }
.sort-select {
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  background: #fff;
  outline: none;
  color: #374151;
  cursor: pointer;
  &:focus { border-color: #E8572A; }
}

/* 卡片格 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}
.template-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s, transform 0.2s;
  &:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.1); transform: translateY(-2px); }
}
.card-cover {
  position: relative;
  width: 100%;
  height: 160px;
  background: #f9fafb;
  overflow: hidden;
}
.cover-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cover-placeholder {
  width: 100%; height: 100%;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
  background: #f3f4f6;
  span { font-size: 12px; color: #9ca3af; }
}
.cover-badge {
  position: absolute; top: 10px; right: 10px;
  padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;
}
.card-body {
  padding: 14px 16px;
  flex: 1;
  display: flex; flex-direction: column; gap: 6px;
}
.card-title { font-size: 15px; font-weight: 700; color: #1f2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-category { font-size: 11px; color: #9ca3af; margin-top: -2px; }
.card-desc {
  font-size: 12px; color: #6b7280; line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 36px;
}
.card-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
.meta-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.tag-free       { background: #e0f2fe; color: #0369a1; }
.tag-pro        { background: #ede9fe; color: #6d28d9; }
.tag-enterprise { background: #fef3c7; color: #92400e; }
.tag-type       { background: #f1f5f9; color: #475569; }
.tag-creator    { background: #f1f5f9; color: #475569; }
.card-info {
  display: flex; justify-content: space-between;
  font-size: 11px; color: #9ca3af; margin-top: auto; padding-top: 8px; border-top: 1px solid #f3f4f6;
}

/* 空狀態 / 載入 */
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 60px 24px; color: #9ca3af; gap: 12px;
  p { font-size: 14px; margin: 0; }
}
.loading-row { text-align: center; padding: 60px; color: #9ca3af; font-size: 14px; }

/* 表格（審核 tab） */
.table-wrap {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  th, td { padding: 12px 16px; text-align: left; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
  th { background: #f9fafb; color: #6b7280; font-weight: 600; white-space: nowrap; }
  tbody tr:hover { background: #fafafa; }
  tbody tr:last-child td { border-bottom: none; }
}
.td-bold { font-weight: 500; color: #1f2937; }
.td-desc { max-width: 200px; color: #6b7280; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.td-note { max-width: 160px; color: #6b7280; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.empty-cell { text-align: center; padding: 40px !important; color: #9ca3af; }

.badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
/* 審查結果卡片 */
.rv-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}
.rv-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  background: #fafafa;
}
.rv-card-title { font-size: 16px; font-weight: 700; color: #1f2937; }
.rv-cover { border-bottom: 1px solid #f3f4f6; max-height: 200px; overflow: hidden; }
.rv-cover-img { width: 100%; object-fit: cover; display: block; max-height: 200px; }
.rv-grid { padding: 8px 0; }
.rv-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 20px;
  border-bottom: 1px solid #f9fafb;
  &:last-child { border-bottom: none; }
}
.rv-label { flex-shrink: 0; width: 80px; font-size: 12px; color: #9ca3af; font-weight: 500; padding-top: 2px; }
.rv-value  { flex: 1; font-size: 13px; color: #1f2937; word-break: break-all; }
.rv-id     { font-family: monospace; font-size: 11px; color: #6b7280; }
.rv-hint   { text-align: center; padding: 48px 24px; font-size: 14px; color: #9ca3af; }

.badge-green  { background: #dcfce7; color: #16a34a; }
.badge-red    { background: #fee2e2; color: #dc2626; }
.badge-yellow { background: #fef9c3; color: #ca8a04; }
.badge-blue   { background: #dbeafe; color: #1d4ed8; }
.badge-orange { background: #ffedd5; color: #c2410c; }

/* 分頁 */
.pagination {
  display: flex; align-items: center; gap: 6px; margin-top: 24px; justify-content: center;
}
.page-btn {
  padding: 6px 12px; border: 1px solid #e5e7eb; background: #fff; border-radius: 6px; font-size: 13px; cursor: pointer; transition: all 0.15s;
  &:hover:not(:disabled) { border-color: #E8572A; color: #E8572A; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &.active { background: #E8572A; border-color: #E8572A; color: #fff; }
}
</style>

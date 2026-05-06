<template>
  <div class="template-mgmt">
    <AppBreadcrumb :items="breadcrumbs" />

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
        <div class="filter-field">
          <label class="filter-label">類型</label>
          <select v-model="tmplType" class="filter-select" @change="fetchTemplates">
            <option value="">全部</option>
            <option value="TEMPLE">TEMPLE</option>
            <option value="PLATFORM_VENDOR">PLATFORM_VENDOR</option>
          </select>
        </div>
        <div class="filter-field">
          <label class="filter-label">建立來源</label>
          <select v-model="tmplCreatorType" class="filter-select" @change="fetchTemplates">
            <option value="">全部</option>
            <option value="USER">USER</option>
            <option value="SYSTEM">SYSTEM</option>
          </select>
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
        <button class="btn-create" @click="router.push({ name: 'app.temple.template-create', params: { templeId } })">
          ＋ 新增模板
        </button>
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
        <div v-for="item in tmplList" :key="item.id" class="template-card">
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
            <!-- 狀態浮標 -->
            <span class="cover-badge" :class="item.status === 'OPEN' ? 'badge-green' : 'badge-red'">
              {{ item.status === 'OPEN' ? '啟用' : '停用' }}
            </span>
          </div>

          <!-- 卡片內容 -->
          <div class="card-body">
            <div class="card-title">{{ item.name }}</div>
            <div class="card-desc">{{ item.description || '（無描述）' }}</div>
            <div class="card-meta">
              <span class="meta-tag" :class="levelClass(item.level)">{{ item.level }}</span>
              <span class="meta-tag tag-type">{{ item.type }}</span>
              <span class="meta-tag tag-creator">{{ item.creatorType }}</span>
            </div>
            <div class="card-info">
              <span>建立者：{{ item.createdByName || '-' }}</span>
              <span>{{ formatDate(item.createdAt) }}</span>
            </div>
          </div>

          <!-- 操作列 -->
          <div class="card-actions">
            <button class="btn-card-action btn-view" title="查看" @click="goDetail(item.id)">
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>
              查看
            </button>
            <button
              class="btn-card-action"
              :class="item.status === 'OPEN' ? 'btn-danger' : 'btn-success'"
              @click="toggleTmplStatus(item)"
            >{{ item.status === 'OPEN' ? '停用' : '啟用' }}</button>
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

    <!-- ===== 模板審核 ===== -->
    <div v-if="activeTab === 'review'" class="tab-content">
      <div class="filter-bar">
        <div class="filter-field filter-field--wide">
          <label class="filter-label">模板 ID</label>
          <div class="filter-search">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="search-icon-svg">
              <circle cx="6" cy="6" r="4.5" stroke="#aaa" stroke-width="1.5"/>
              <path d="M10 10l2.5 2.5" stroke="#aaa" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <input v-model="rvWebTemplateId" type="text" placeholder="輸入模板 ID" class="search-input" @keydown.enter="fetchReviews" />
          </div>
        </div>
        <div class="filter-field">
          <label class="filter-label">審核狀態</label>
          <select v-model="rvStatus" class="filter-select" @change="fetchReviews">
            <option value="">全部</option>
            <option value="PENDING">待審核</option>
            <option value="IN_REVIEW">審核中</option>
            <option value="RE_REVIEW">重新審核</option>
            <option value="REVIEW_FAILED">審核失敗</option>
            <option value="APPROVED">已通過</option>
            <option value="NEED_RESUBMIT">需重新提交</option>
          </select>
        </div>
        <div class="filter-field">
          <label class="filter-label">排序</label>
          <select v-model="rvSortBy" class="filter-select" @change="fetchReviews">
            <option value="createdAt">建立時間</option>
            <option value="status">狀態</option>
          </select>
        </div>
        <div class="filter-field">
          <label class="filter-label">順序</label>
          <select v-model="rvSortOrder" class="filter-select" @change="fetchReviews">
            <option value="DESC">由新到舊</option>
            <option value="ASC">由舊到新</option>
          </select>
        </div>
        <button class="btn-search" @click="fetchReviews">搜尋</button>
      </div>

      <div class="result-info">
        共 <b>{{ rvTotal }}</b> 筆
      </div>

      <div class="table-wrap">
        <div v-if="rvLoading" class="loading-row">載入中...</div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>模板名稱</th>
              <th>描述</th>
              <th>方案層級</th>
              <th>審核狀態</th>
              <th>備註</th>
              <th>建立者</th>
              <th>建立時間</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="rvList.length === 0">
              <td colspan="7" class="empty-cell">暫無資料</td>
            </tr>
            <tr v-for="item in rvList" :key="item.id">
              <td class="td-bold">{{ item.name || '-' }}</td>
              <td class="td-desc">{{ item.description || '-' }}</td>
              <td>
                <span class="meta-tag" :class="levelClass(item.level)">{{ item.level || '-' }}</span>
              </td>
              <td>
                <span class="badge" :class="rvStatusClass(item.status)">{{ rvStatusLabel(item.status) }}</span>
              </td>
              <td class="td-note">{{ item.note || '-' }}</td>
              <td>{{ item.createdBy || '-' }}</td>
              <td>{{ formatDate(item.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="rvTotalPages > 1" class="pagination">
        <button class="page-btn" :disabled="rvPage === 1" @click="goRvPage(rvPage - 1)">上一頁</button>
        <button
          v-for="p in rvTotalPages" :key="p"
          class="page-btn" :class="{ active: p === rvPage }"
          @click="goRvPage(p)"
        >{{ p }}</button>
        <button class="page-btn" :disabled="rvPage === rvTotalPages" @click="goRvPage(rvPage + 1)">下一頁</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'
import axiosClient from '@/axios'

const route    = useRoute()
const router   = useRouter()
const templeId = route.params.templeId

const breadcrumbs = [
  { text: '宮廟後台', to: `/${templeId}/dashboard` },
  { text: '網站模板管理', to: null },
]

const tabs = [
  { key: 'templates', label: '模板管理' },
  { key: 'review',    label: '模板審核' },
]
const activeTab = ref('templates')

const setTab = (key) => {
  activeTab.value = key
  if (key === 'templates') fetchTemplates()
  else fetchReviews()
}

// ── 模板管理 ──
const tmplList        = ref([])
const tmplLoading     = ref(false)
const tmplName        = ref('')
const tmplType        = ref('')
const tmplCreatorType = ref('')
const tmplLevel       = ref('')
const tmplStatus      = ref('')
const tmplSortBy      = ref('createdAt')
const tmplSortOrder   = ref('DESC')
const tmplPage        = ref(1)
const tmplPageSize    = ref(12)
const tmplTotal       = ref(0)
const tmplTotalPages  = ref(1)

const fetchTemplates = async () => {
  tmplLoading.value = true
  try {
    const res = await axiosClient.get('/backend/web-template/', {
      params: {
        name:        tmplName.value        || undefined,
        type:        tmplType.value        || undefined,
        creatorType: tmplCreatorType.value || undefined,
        level:       tmplLevel.value       || undefined,
        status:      tmplStatus.value      || undefined,
        sortBy:      tmplSortBy.value,
        sortOrder:   tmplSortOrder.value,
        page:        tmplPage.value,
        pageSize:    tmplPageSize.value,
      },
    })
    const data = res.data?.data || {}
    console.log('web-template list:', data)
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

const goDetail = (id) => {
  router.push({ name: 'app.temple.template-detail', params: { templeId, templateId: id } })
}

const toggleTmplStatus = async (item) => {
  const next  = item.status === 'OPEN' ? 'INVALID' : 'OPEN'
  const label = next === 'INVALID' ? '停用' : '啟用'
  if (!confirm(`確定要${label}此模板嗎？`)) return
  try {
    await axiosClient.patch(`/backend/web-template/${item.id}/status`, { status: next })
    item.status = next
  } catch { alert('操作失敗，請稍後再試') }
}

const levelClass = (level) => ({
  FREE:       'tag-free',
  PRO:        'tag-pro',
  ENTERPRISE: 'tag-enterprise',
}[level] ?? '')

// ── 模板審核 ──
const rvList          = ref([])
const rvLoading       = ref(false)
const rvWebTemplateId = ref('')
const rvStatus        = ref('')
const rvSortBy        = ref('createdAt')
const rvSortOrder     = ref('DESC')
const rvPage          = ref(1)
const rvPageSize      = ref(20)
const rvTotal         = ref(0)
const rvTotalPages    = ref(1)

const fetchReviews = async () => {
  rvLoading.value = true
  try {
    const res = await axiosClient.get('/backend/web-template/review', {
      params: {
        webTemplateId: rvWebTemplateId.value || undefined,
        status:        rvStatus.value        || undefined,
        sortBy:        rvSortBy.value,
        sortOrder:     rvSortOrder.value,
        page:          rvPage.value,
        pageSize:      rvPageSize.value,
      },
    })
    const data = res.data?.data || {}
    console.log('web-template review:', data)
    rvList.value       = data.data || []
    rvTotal.value      = data.total ?? 0
    rvTotalPages.value = data.totalPages ?? 1
  } catch (e) {
    console.error('獲取審核列表失敗:', e)
    rvList.value = []
  } finally {
    rvLoading.value = false
  }
}

const goRvPage = (p) => { rvPage.value = p; fetchReviews() }

const rvStatusLabel = (s) => ({
  PENDING:        '待審核',
  IN_REVIEW:      '審核中',
  RE_REVIEW:      '重新審核',
  REVIEW_FAILED:  '審核失敗',
  APPROVED:       '已通過',
  NEED_RESUBMIT:  '需重新提交',
}[s] ?? s)

const rvStatusClass = (s) => ({
  PENDING:        'badge-yellow',
  IN_REVIEW:      'badge-blue',
  RE_REVIEW:      'badge-orange',
  REVIEW_FAILED:  'badge-red',
  APPROVED:       'badge-green',
  NEED_RESUBMIT:  'badge-orange',
}[s] ?? '')

const formatDate = (d) => d ? new Date(d).toLocaleDateString('zh-TW') : '-'

onMounted(fetchTemplates)
</script>

<style scoped lang="scss">
.template-mgmt {
  padding: 24px;
  max-width: 1400px;
}

.page-header { margin-bottom: 20px; }

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

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

/* 統計 + 排序列 */
.result-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.result-count {
  font-size: 13px;
  color: #6b7280;
  b { color: #1f2937; }
}

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

  &:hover {
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }
}

/* 封面 */
.card-cover {
  position: relative;
  width: 100%;
  height: 160px;
  background: #f9fafb;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #f3f4f6;

  span { font-size: 12px; color: #9ca3af; }
}

.cover-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

/* 卡片內容 */
.card-body {
  padding: 14px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-desc {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 36px;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.meta-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.tag-free       { background: #e0f2fe; color: #0369a1; }
.tag-pro        { background: #ede9fe; color: #6d28d9; }
.tag-enterprise { background: #fef3c7; color: #92400e; }
.tag-type       { background: #f1f5f9; color: #475569; }
.tag-creator    { background: #f1f5f9; color: #475569; }

.card-info {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #9ca3af;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #f3f4f6;
}

/* 卡片操作 */
.card-actions {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
}

.btn-card-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 7px 0;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s;
}

.btn-view {
  background: #fff;
  border-color: #e5e7eb;
  color: #374151;
  &:hover { border-color: #9ca3af; }
}

.btn-danger {
  background: #fee2e2;
  color: #dc2626;
  &:hover { background: #fecaca; }
}

.btn-success {
  background: #dcfce7;
  color: #16a34a;
  &:hover { background: #bbf7d0; }
}

/* 空狀態 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  color: #9ca3af;
  gap: 12px;

  p { font-size: 14px; margin: 0; }
}

/* 載入 */
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

  th, td {
    padding: 12px 16px;
    text-align: left;
    font-size: 13px;
    border-bottom: 1px solid #f3f4f6;
  }

  th {
    background: #f9fafb;
    color: #6b7280;
    font-weight: 600;
    white-space: nowrap;
  }

  tbody tr:hover { background: #fafafa; }
  tbody tr:last-child td { border-bottom: none; }
}

.td-bold { font-weight: 500; color: #1f2937; }
.empty-cell { text-align: center; padding: 40px !important; color: #9ca3af; }
.col-action { width: 120px; text-align: center; }
.td-desc { max-width: 200px; color: #6b7280; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.td-note { max-width: 160px; color: #6b7280; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.result-info { font-size: 13px; color: #6b7280; margin-bottom: 12px; b { color: #1f2937; } }

.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.badge-green  { background: #dcfce7; color: #16a34a; }
.badge-red    { background: #fee2e2; color: #dc2626; }
.badge-yellow { background: #fef9c3; color: #ca8a04; }
.badge-blue   { background: #dbeafe; color: #1d4ed8; }
.badge-orange { background: #ffedd5; color: #c2410c; }

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 15px;
  transition: background 0.15s;
  &:hover { background: #f3f4f6; }
}

/* 分頁 */
.pagination {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 24px;
  justify-content: center;
}

.page-btn {
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  &:hover:not(:disabled) { border-color: #E8572A; color: #E8572A; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &.active { background: #E8572A; border-color: #E8572A; color: #fff; }
}
</style>

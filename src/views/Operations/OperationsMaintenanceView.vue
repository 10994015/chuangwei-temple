<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOperationsStore } from '@/stores/operations'

const router = useRouter()
const route  = useRoute()

const operationsStore = useOperationsStore()

const activeTab = ref('account')
const tabs = [
  { key: 'account',   label: '帳號管理' },
  { key: 'roles',     label: '權限管理' },
  { key: 'oplog',     label: '操作日誌' },
  { key: 'loginlog',  label: '登入紀錄' },
  { key: 'password',  label: '修改密碼' },
]

// ── 帳號管理篩選 ──
const filterKeyword   = ref('')
const filterStatus    = ref('')
const currentPage     = ref(1)

const fmtDateTime = (val) => {
  if (!val) return '-'
  return val.slice(0, 16).replace('T', ' ')
}

const fmtDate = (val) => val ? val.slice(0, 10) : '-'

const loadAccounts = () => {
  operationsStore.fetchOperationUsers({
    q:        filterKeyword.value,
    status:   filterStatus.value,
    page:     currentPage.value,
    pageSize: 10,
  })
}

const onSearch = () => {
  currentPage.value = 1
  loadAccounts()
}

const goPage = (page) => {
  if (page >= 1 && page <= operationsStore.operationUsersTotalPages) {
    currentPage.value = page
    loadAccounts()
  }
}

// ── 權限管理篩選 ──
const roleFilterName  = ref('')
const roleFilterStatus = ref('')
const roleFilterDateStart = ref('')
const roleFilterDateEnd   = ref('')
const rolePage        = ref(1)
const expandedRoles   = ref(new Set())
const roleOptions     = ref([])

const loadRoles = () => {
  operationsStore.fetchRoles({
    name:     roleFilterName.value,
    page:     rolePage.value,
    pageSize: 10,
  })
}

const onRoleSearch = () => {
  rolePage.value = 1
  loadRoles()
}

const goRolePage = (page) => {
  if (page >= 1 && page <= operationsStore.rolesTotalPages) {
    rolePage.value = page
    loadRoles()
  }
}

const toggleRoleExpand = (roleId) => {
  if (expandedRoles.value.has(roleId)) {
    expandedRoles.value.delete(roleId)
  } else {
    expandedRoles.value.add(roleId)
  }
  expandedRoles.value = new Set(expandedRoles.value)
}

const confirmDeleteAccount = async (row) => {
  if (!confirm(`確定要刪除帳號「${row.name}」嗎？`)) return
  try {
    await operationsStore.deleteOperationUser(row.id)
    alert('刪除成功')
    loadAccounts()
  } catch (err) {
    console.error('刪除帳號失敗:', err)
    alert('刪除失敗')
  }
}

const confirmDeleteRole = async (row) => {
  if (!confirm(`確定要刪除角色「${row.roleName}」嗎？`)) return
  try {
    await operationsStore.deleteRole(row.roleId)
    loadRoles()
  } catch (err) {
    console.error('刪除角色失敗:', err)
    alert('刪除失敗')
  }
}

const loadRoleOptions = async () => {
  if (roleOptions.value.length === 0) {
    roleOptions.value = await operationsStore.fetchTenantPermissionRoles()
  }
}

watch(activeTab, (tab) => {
  if (tab === 'roles') { loadRoles(); loadRoleOptions() }
})

onMounted(async () => {
  const tabKeys = tabs.map(t => t.key)
  if (route.query.tab && tabKeys.includes(route.query.tab)) {
    activeTab.value = route.query.tab
  }
  if (activeTab.value === 'roles') loadRoleOptions()
  loadAccounts()
})
</script>

<template>
  <div class="maintenance-view">

    <!-- 麵包屑 -->
    <nav class="breadcrumb">
      <span>營運後台</span>
      <span class="sep">›</span>
      <span>營運權限</span>
      <span class="sep">›</span>
      <span class="current">帳號管理</span>
    </nav>

    <h1 class="page-title">營運權限</h1>

    <!-- 分頁標籤 -->
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

    <!-- ══ 帳號管理 ══ -->
    <template v-if="activeTab === 'account'">

      <!-- 篩選列 -->
      <div class="filter-row">
        <div class="filter-field">
          <label class="filter-label">關鍵字</label>
          <input
            v-model="filterKeyword"
            type="text"
            class="filter-input"
            placeholder="請輸入帳號或姓名"
            @keydown.enter="onSearch"
          />
        </div>
        <div class="filter-field">
          <label class="filter-label">狀態</label>
          <select v-model="filterStatus" class="filter-select" @change="onSearch">
            <option value="">選擇狀態</option>
            <option value="OPEN">啟用</option>
            <option value="INVALID">停用</option>
            <option value="LOCK">封鎖</option>
          </select>
        </div>
      </div>

      <!-- 新增按鈕 -->
      <div class="action-row">
        <button class="btn-add" @click="router.push({ name: 'app.operations.account-create' })">+ 新增權限帳號</button>
      </div>

      <!-- 表格 -->
      <div class="table-card">
        <div v-if="operationsStore.isOperationUsersLoading" class="loading-row">載入中...</div>
        <div class="table-wrap" v-else>
          <table class="data-table">
            <thead>
              <tr>
                <th class="th-check"><input type="checkbox" /></th>
                <th>姓名</th>
                <th>角色</th>
                <th>狀態</th>
                <th>最後更新</th>
                <th>建立日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="operationsStore.operationUsers.length === 0">
                <td colspan="7" class="td-empty">暫無資料</td>
              </tr>
              <tr v-for="row in operationsStore.operationUsers" :key="row.id">
                <td class="td-check"><input type="checkbox" /></td>
                <td>{{ row.name }}</td>
                <td>{{ row.roleName || '-' }}</td>
                <td>
                  <span class="badge" :class="row.status === 'OPEN' ? 'badge-active' : 'badge-inactive'">
                    {{ row.status === 'OPEN' ? '啟用' : row.status === 'INVALID' ? '停用' : '封鎖' }}
                  </span>
                </td>
                <td>{{ fmtDateTime(row.updatedAt) }}</td>
                <td>{{ fmtDate(row.createdAt) }}</td>
                <td>
                  <div class="action-btns">
                    <button class="icon-btn edit-btn" title="編輯" @click="router.push({ name: 'app.operations.account-edit', params: { userId: row.id } })">
                      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button class="icon-btn delete-btn" title="刪除" @click="confirmDeleteAccount(row)">
                      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination" v-if="!operationsStore.isOperationUsersLoading">
          <button class="page-btn" :disabled="currentPage === 1" @click="goPage(currentPage - 1)">上一頁</button>
          <template v-if="operationsStore.operationUsersTotalPages > 0">
            <button
              v-for="p in operationsStore.operationUsersTotalPages" :key="p"
              class="page-btn page-num"
              :class="{ current: p === currentPage }"
              @click="goPage(p)"
            >{{ p }}</button>
          </template>
          <button v-else class="page-btn page-num current">1</button>
          <button class="page-btn" :disabled="currentPage === operationsStore.operationUsersTotalPages || operationsStore.operationUsersTotalPages === 0" @click="goPage(currentPage + 1)">下一頁</button>
        </div>
      </div>
    </template>

    <!-- ══ 權限管理 ══ -->
    <template v-else-if="activeTab === 'roles'">
      <div class="filter-row">
        <div class="filter-field">
          <label class="filter-label">關鍵字</label>
          <input v-model="roleFilterName" type="text" class="filter-input" placeholder="請輸入關鍵字" @keydown.enter="onRoleSearch" />
        </div>
        <div class="filter-field">
          <label class="filter-label">角色</label>
          <select v-model="roleFilterName" class="filter-select" @change="onRoleSearch">
            <option value="">選擇角色</option>
            <option v-for="r in roleOptions" :key="r.roleId" :value="r.roleName">
              {{ r.roleName }}
            </option>
          </select>
        </div>
        <div class="filter-field">
          <label class="filter-label">狀態</label>
          <select v-model="roleFilterStatus" class="filter-select" @change="onRoleSearch">
            <option value="">選擇狀態</option>
            <option value="OPEN">啟用</option>
            <option value="INVALID">停用</option>
          </select>
        </div>
        <div class="filter-field date-range">
          <label class="filter-label">建立日期</label>
          <div class="date-row">
            <input v-model="roleFilterDateStart" type="date" class="filter-input date-input" />
            <span class="date-sep">~</span>
            <input v-model="roleFilterDateEnd" type="date" class="filter-input date-input" />
          </div>
        </div>
      </div>

      <div class="action-row">
        <button class="btn-add" @click="router.push({ name: 'app.operations.role-create' })">+ 新增權限角色</button>
      </div>

      <div class="table-card">
        <div v-if="operationsStore.isRolesLoading" class="loading-row">載入中...</div>
        <div class="table-wrap" v-else>
          <table class="data-table">
            <thead>
              <tr>
                <th>角色</th>
                <th>使用人數</th>
                <th>權限項目</th>
                <th>建立日期</th>
                <th>最後更新日期</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="operationsStore.roles.length === 0">
                <td colspan="7" class="td-empty">暫無資料</td>
              </tr>
              <template v-for="row in operationsStore.roles" :key="row.roleId">
                <tr>
                  <td>{{ row.roleName }}</td>
                  <td>{{ row.users?.length ?? 0 }}</td>
                  <td>
                    <button class="expand-btn" @click="toggleRoleExpand(row.roleId)">
                      向下展開
                      <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"
                        :style="{ transform: expandedRoles.has(row.roleId) ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </td>
                  <td>{{ fmtDate(row.createdAt) }}</td>
                  <td>{{ fmtDate(row.updatedAt) }}</td>
                  <td>
                    <span class="badge" :class="row.roleStatus === 'OPEN' ? 'badge-active' : 'badge-inactive'">
                      {{ row.roleStatus === 'OPEN' ? '啟用' : '停用' }}
                    </span>
                  </td>
                  <td>
                    <div class="action-btns">
                      <button class="icon-btn edit-btn" title="編輯" @click="router.push({ name: 'app.operations.role-edit', params: { roleId: row.roleId } })">
                        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                      </button>
                      <button class="icon-btn delete-btn" title="刪除" @click="confirmDeleteRole(row)">
                        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <!-- 展開的權限內容 -->
                <tr v-if="expandedRoles.has(row.roleId)" class="expand-row">
                  <td colspan="7">
                    <div class="permissions-wrap">
                      <div v-for="cat in row.permissions" :key="cat.category" class="perm-category">
                        <span class="perm-cat-name">{{ cat.category }}</span>
                        <span v-for="p in cat.permissions" :key="p.permissionId" class="perm-tag">
                          {{ p.permissionName }}（{{ p.mode }}）
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <div class="pagination" v-if="!operationsStore.isRolesLoading">
          <button class="page-btn" :disabled="rolePage === 1" @click="goRolePage(rolePage - 1)">上一頁</button>
          <template v-if="operationsStore.rolesTotalPages > 0">
            <button
              v-for="p in operationsStore.rolesTotalPages" :key="p"
              class="page-btn page-num"
              :class="{ current: p === rolePage }"
              @click="goRolePage(p)"
            >{{ p }}</button>
          </template>
          <button v-else class="page-btn page-num current">1</button>
          <button class="page-btn" :disabled="rolePage === operationsStore.rolesTotalPages || operationsStore.rolesTotalPages === 0" @click="goRolePage(rolePage + 1)">下一頁</button>
        </div>
      </div>
    </template>

    <!-- 其他頁籤佔位 -->
    <template v-else>
      <div class="stub-tab">尚未建置</div>
    </template>

  </div>

</template>

<style scoped lang="scss">
.maintenance-view {
  padding: 24px;
  background: #f3f4f6;
  min-height: 100%;
  font-family: 'Noto Sans TC', sans-serif;
}

// ── 麵包屑 ──
.breadcrumb {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 4px;

  .sep { color: #d1d5db; }
  .current { color: #E8572A; }
}

// ── 標題 ──
.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 20px 0;
}

// ── tab bar ──
.tab-bar {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 24px;
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
  font-family: 'Noto Sans TC', sans-serif;
  transition: color 0.15s, border-color 0.15s;

  &:hover { color: #374151; }

  &.active {
    color: #E8572A;
    border-bottom-color: #E8572A;
  }
}

// ── 篩選列 ──
.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 160px;

  &.date-range { min-width: 280px; }
}

.filter-label {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.filter-input {
  height: 38px;
  padding: 0 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  color: #374151;
  font-family: 'Noto Sans TC', sans-serif;
  outline: none;
  background: #fff;

  &:focus { border-color: #E8572A; }
}

.filter-select {
  height: 38px;
  padding: 0 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  color: #374151;
  font-family: 'Noto Sans TC', sans-serif;
  outline: none;
  background: #fff;
  cursor: pointer;

  &:focus { border-color: #E8572A; }
}

.date-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.date-input { min-width: 120px; }

.date-sep {
  font-size: 13px;
  color: #9ca3af;
  flex-shrink: 0;
}

// ── 新增按鈕 ──
.action-row {
  margin-bottom: 16px;
}

.btn-add {
  padding: 9px 18px;
  background: #E8572A;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Noto Sans TC', sans-serif;
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: #d04a20; }
}

// ── 表格 ──
.table-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.table-wrap { overflow-x: auto; }

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th {
    padding: 12px 16px;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: #6b7280;
    border-bottom: 1px solid #e5e7eb;
    white-space: nowrap;
    background: #fff;
  }

  td {
    padding: 16px;
    color: #374151;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: middle;
    white-space: nowrap;
  }

  tbody tr:last-child td { border-bottom: none; }
  tbody tr:hover td { background: #fafafa; }
}

.th-check, .td-check {
  width: 40px;
  padding-left: 16px !important;
}

.td-empty {
  text-align: center;
  color: #9ca3af;
  padding: 40px 0 !important;
}

.loading-row {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
  font-size: 14px;
}

// ── badge ──
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;

  &.badge-active   { background: #d1fae5; color: #065f46; }
  &.badge-inactive { background: #f3f4f6; color: #6b7280; }
}

// ── 操作按鈕 ──
.action-btns {
  display: flex;
  gap: 8px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.edit-btn {
  background: none;
  color: #6b7280;
  &:hover { background: #f3f4f6; color: #374151; }
}

.delete-btn {
  background: none;
  color: #ef4444;
  &:hover { background: #fee2e2; }
}

// ── 分頁 ──
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px;
  border-top: 1px solid #f3f4f6;
}

.page-btn {
  padding: 6px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  font-family: 'Noto Sans TC', sans-serif;
  transition: all 0.15s;

  &:hover:not(:disabled) { background: #f9fafb; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.page-num { min-width: 36px; text-align: center; }

.page-num.current {
  background: #E8572A;
  color: #fff;
  border-color: #E8572A;
}

// ── 展開按鈕 ──
.expand-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  font-family: 'Noto Sans TC', sans-serif;
  transition: background 0.15s;

  &:hover { background: #f9fafb; }
}

.expand-row td {
  background: #f9fafb;
  padding: 12px 16px !important;
}

.permissions-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.perm-category {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.perm-cat-name {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  min-width: 80px;
}

.perm-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 4px;
  font-size: 12px;
}

// ── 佔位 ──
.stub-tab {
  padding: 40px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

// ── Modal ──
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-box {
  background: #fff;
  border-radius: 12px;
  width: 540px;
  max-width: 95vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  font-family: 'Noto Sans TC', sans-serif;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 16px;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  &:hover { background: #f3f4f6; color: #374151; }
}

.modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.required { color: #ef4444; }

.form-input {
  height: 38px;
  padding: 0 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  font-family: 'Noto Sans TC', sans-serif;
  outline: none;

  &:focus { border-color: #E8572A; }
}

.form-select {
  height: 38px;
  padding: 0 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  font-family: 'Noto Sans TC', sans-serif;
  outline: none;
  background: #fff;
  cursor: pointer;

  &:focus { border-color: #E8572A; }
}

.radio-group {
  display: flex;
  gap: 20px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}

.perm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-add-perm {
  padding: 4px 12px;
  border: 1px solid #E8572A;
  border-radius: 6px;
  background: none;
  color: #E8572A;
  font-size: 13px;
  cursor: pointer;
  font-family: 'Noto Sans TC', sans-serif;
  &:hover { background: #fff5f2; }
}

.perm-empty {
  font-size: 13px;
  color: #9ca3af;
  text-align: center;
  padding: 12px 0;
}

.perm-row {
  display: flex;
  gap: 8px;
  align-items: center;

  .perm-id-input { flex: 1; }
  .perm-mode-select { width: 120px; flex-shrink: 0; }
}

.btn-remove-perm {
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  color: #9ca3af;
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
  flex-shrink: 0;
  &:hover { background: #fee2e2; color: #ef4444; }
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  padding: 8px 20px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  font-family: 'Noto Sans TC', sans-serif;
  &:hover { background: #f9fafb; }
}

.btn-save {
  padding: 8px 24px;
  border: none;
  border-radius: 8px;
  background: #E8572A;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Noto Sans TC', sans-serif;
  transition: background 0.15s;
  &:hover:not(:disabled) { background: #d04a20; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}
</style>

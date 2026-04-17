<template>
  <div class="account-management">
    <!-- 麵包屑 -->
    <AppBreadcrumb :items="breadcrumbs" />

    <!-- 頁面標題 -->
    <h1 class="page-title">帳號管理</h1>

    <!-- Tab 導航 -->
    <div class="tab-nav">
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

    <!-- 帳號管理 Tab -->
    <div v-if="activeTab === 'accounts'" class="tab-content">
      <!-- 工具列 -->
      <div class="toolbar">
        <button class="btn-primary" @click="openCreateAccount">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          新增帳號
        </button>
        <button class="btn-secondary-orange" @click="router.push({ name: 'app.temple.account-invite', params: { templeId } })">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5" cy="4" r="2.5" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="4" r="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M1 12c0-2.2 1.8-4 4-4M8 10h6M11 7v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          權限指派
        </button>
      </div>

      <!-- 篩選列 -->
      <div class="filter-bar">
        <div class="filter-field">
          <label class="filter-label">搜尋</label>
          <div class="filter-search">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="search-icon-svg"><circle cx="6" cy="6" r="4.5" stroke="#aaa" stroke-width="1.5"/><path d="M10 10l2.5 2.5" stroke="#aaa" stroke-width="1.5" stroke-linecap="round"/></svg>
            <input
              v-model="accountSearch"
              type="text"
              placeholder="搜尋帳號、Email 或姓名"
              class="search-input"
            />
          </div>
        </div>
        <div class="filter-field">
          <label class="filter-label">角色</label>
          <select v-model="accountRoleFilter" class="filter-select">
            <option value="">全部角色</option>
            <option v-for="r in roleOptions" :key="r.id" :value="r.id">{{ r.name }}</option>
          </select>
        </div>
        <div class="filter-field">
          <label class="filter-label">狀態</label>
          <select v-model="accountStatusFilter" class="filter-select">
            <option value="">全部狀態</option>
            <option value="OPEN">啟用</option>
            <option value="CLOSED">停用</option>
          </select>
        </div>
      </div>

      <!-- 表格 -->
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-check">
                <input type="checkbox" @change="toggleAllAccounts" :checked="allAccountsSelected" />
              </th>
              <th>姓名</th>
              <th>角色</th>
              <th>狀態</th>
              <th>最後登入</th>
              <th>建立日期</th>
              <th>最後更新</th>
              <th class="col-action">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="acc in pagedAccounts" :key="acc.id">
              <td class="col-check">
                <input type="checkbox" v-model="selectedAccounts" :value="acc.id" />
              </td>
              <td class="td-name">{{ acc.name }}</td>
              <td>{{ acc.roleName }}</td>
              <td>
                <span class="badge" :class="{
                  'badge-active':   acc.status === 'OPEN',
                  'badge-inactive': acc.status === 'INVALID',
                  'badge-lock':     acc.status === 'LOCK',
                }">
                  {{ { OPEN: '啟用中', INVALID: '停用', LOCK: '封鎖' }[acc.status] || acc.status }}
                </span>
              </td>
              <td>{{ fmtDatetime(acc.lastLoginAt) }}</td>
              <td>{{ fmtDate(acc.createdAt) }}</td>
              <td>{{ fmtDatetime(acc.updatedAt) }}</td>
              <td class="col-action">
                <button class="icon-btn edit" @click="editAccount(acc)" title="編輯">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" stroke="#888" stroke-width="1.4" stroke-linejoin="round"/></svg>
                </button>
                <button class="icon-btn delete" @click="deleteAccount(acc)" title="刪除">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 5h10M6 5V3h4v2M6 8v4M10 8v4M4 5l1 8h6l1-8" stroke="#e53e3e" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </td>
            </tr>
            <tr v-if="filteredAccounts.length === 0">
              <td colspan="8" class="empty-row">無符合條件的帳號</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分頁 -->
      <div class="pagination">
        <button class="page-btn" :disabled="accountPage === 1" @click="accountPage--">上一頁</button>
        <button
          v-for="p in accountTotalPages"
          :key="p"
          class="page-btn page-num"
          :class="{ active: accountPage === p }"
          @click="accountPage = p"
        >{{ p }}</button>
        <button class="page-btn" :disabled="accountPage === accountTotalPages" @click="accountPage++">下一頁</button>
      </div>
    </div>

    <!-- 權限管理 Tab -->
    <div v-if="activeTab === 'roles'" class="tab-content">
      <div class="toolbar">
        <button class="btn-primary" @click="openCreateRole">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          新增權限角色
        </button>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>角色</th>
              <th>權限項目</th>
              <th>最後更新日期</th>
              <th class="col-action">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in pagedRoles" :key="role.roleId">
              <td>
                <div class="role-name">{{ role.roleName }}</div>
                <div class="role-users">{{ role.users?.length ?? 0 }} 位使用者</div>
              </td>
              <td class="td-perms">
                <button class="expand-btn" @click="toggleRoleExpand(role.roleId)">
                  {{ expandedRoles.includes(role.roleId) ? '收合' : '展開權限' }}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="margin-left:4px;transition:transform 0.2s" :style="{ transform: expandedRoles.includes(role.roleId) ? 'rotate(180deg)' : 'none' }">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <div v-if="expandedRoles.includes(role.roleId)" class="perm-panel">
                  <div v-if="!role.permissions || role.permissions.length === 0" class="perm-empty">尚未設定任何權限</div>
                  <template v-else>
                    <div
                      v-for="group in role.permissions"
                      :key="group.category"
                      class="perm-category"
                    >
                      <div class="perm-cat-label">{{ group.category }}</div>
                      <div class="perm-tags">
                        <span v-for="p in group.permissions" :key="p.permissionId" class="perm-tag">
                          {{ p.permissionName }}
                        </span>
                      </div>
                    </div>
                  </template>
                </div>
              </td>
              <td>{{ fmtDate(role.updatedAt) }}</td>
              <td class="col-action">
                <button class="icon-btn edit" @click="editRole(role)" title="編輯">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" stroke="#888" stroke-width="1.4" stroke-linejoin="round"/></svg>
                </button>
                <button class="icon-btn delete" @click="deleteRole(role)" title="刪除">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 5h10M6 5V3h4v2M6 8v4M10 8v4M4 5l1 8h6l1-8" stroke="#e53e3e" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <button class="page-btn" :disabled="rolePage === 1" @click="rolePage--">上一頁</button>
        <button
          v-for="p in roleTotalPages"
          :key="p"
          class="page-btn page-num"
          :class="{ active: rolePage === p }"
          @click="rolePage = p"
        >{{ p }}</button>
        <button class="page-btn" :disabled="rolePage === roleTotalPages" @click="rolePage++">下一頁</button>
      </div>
    </div>


    <!-- Modal：新增/編輯帳號 -->
    <div v-if="showAccountModal" class="modal-overlay" @click.self="showAccountModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>編輯帳號</h3>
          <button class="modal-close" @click="showAccountModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">姓名 <span class="required">*</span></label>
            <input v-model="accountForm.name" type="text" class="form-input" placeholder="請輸入姓名" />
          </div>
          <div class="form-group">
            <label class="form-label">Email <span class="required">*</span></label>
            <input v-model="accountForm.email" type="email" class="form-input" placeholder="請輸入 Email" />
          </div>
          <div class="form-group">
            <label class="form-label">角色 <span class="required">*</span></label>
            <select v-model="accountForm.role" class="form-input">
              <option value="">請選擇角色</option>
              <option v-for="r in roleOptions" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">狀態</label>
            <select v-model="accountForm.status" class="form-input">
              <option value="啟用">啟用</option>
              <option value="停用">停用</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showAccountModal = false">取消</button>
          <button class="btn-primary" @click="saveAccount">儲存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'

const fmtDate = (val) => {
  if (!val) return ''
  return val.slice(0, 10)
}
const fmtDatetime = (val) => {
  if (!val) return ''
  const d = new Date(val)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
import { useRouter, useRoute } from 'vue-router'
import { useAccountStore } from '@/stores/account'

const router = useRouter()
const route  = useRoute()
const templeId = route.params.templeId

const breadcrumbs = [
  { text: '後台管理' },
  { text: '帳號管理' },
]

const accountStore = useAccountStore()

// ==================== Tab ====================
const tabs = [
  { key: 'accounts', label: '帳號管理' },
  { key: 'roles',    label: '權限管理' },
]
const activeTab = ref(route.query.tab || 'accounts')

// ==================== 帳號管理 ====================
const accountSearch       = ref('')
const accountRoleFilter   = ref('')
const accountStatusFilter = ref('')
const selectedAccounts    = ref([])
const accountPage         = ref(1)
const PAGE_SIZE           = 10

onMounted(async () => {
  await Promise.all([
    accountStore.fetchAccounts(templeId, { page: 1, pageSize: PAGE_SIZE }),
    accountStore.fetchPermissionRoles(templeId),
    accountStore.fetchAuthRoles(templeId, { page: 1, pageSize: ROLE_PAGE_SIZE }),
  ])
})

const fetchWithFilters = (page = accountPage.value) =>
  accountStore.fetchAccounts(templeId, {
    q:        accountSearch.value,
    status:   accountStatusFilter.value,
    roleId:   accountRoleFilter.value,
    page,
    pageSize: PAGE_SIZE,
  })

// 篩選條件變動時重新拉 API
watch([accountSearch, accountRoleFilter, accountStatusFilter], async () => {
  accountPage.value = 1
  await fetchWithFilters(1)
})

// 換頁時重新拉 API
watch(accountPage, async (page) => {
  await fetchWithFilters(page)
})

const pagedAccounts     = computed(() => accountStore.formattedAccounts)
const accountTotalPages = computed(() => accountStore.pagination.totalPages)
const filteredAccounts  = computed(() => accountStore.accounts)

const roleOptions = computed(() =>
  accountStore.permissionRoles.map(r => ({ id: r.roleId, name: r.roleName }))
)

const allAccountsSelected = computed(() =>
  accountStore.accounts.length > 0 &&
  accountStore.accounts.every(a => selectedAccounts.value.includes(a.id))
)

const toggleAllAccounts = (e) => {
  if (e.target.checked) {
    selectedAccounts.value = accountStore.accounts.map(a => a.id)
  } else {
    selectedAccounts.value = []
  }
}

// 帳號 Modal（編輯用）
const showAccountModal = ref(false)
const editingAccount   = ref(null)
const accountForm      = reactive({ name: '', email: '', role: '', status: 'OPEN' })

const openCreateAccount = () => {
  router.push({ name: 'app.temple.account-create', params: { templeId } })
}

const editAccount = (acc) => {
  router.push({ name: 'app.temple.account-edit', params: { templeId, userId: acc.id } })
}

const saveAccount = async () => {
  if (!accountForm.name || !accountForm.role) {
    alert('請填寫必填欄位')
    return
  }
  if (editingAccount.value) {
    const result = await accountStore.updateAccountPermissionRole(
      templeId,
      editingAccount.value.id,
      { permissionRole: accountForm.role }
    )
    if (!result.success) {
      alert(result.error || '儲存失敗')
      return
    }
    await fetchWithFilters()
  }
  showAccountModal.value = false
}

const deleteAccount = async (acc) => {
  if (!confirm(`確定要移除帳號「${acc.name}」嗎？`)) return
  const result = await accountStore.deleteAccount(templeId, acc.id)
  if (result.success) {
    alert(`帳號「${acc.name}」已移除`)
  } else {
    alert(result.error || '移除失敗')
  }
}

// ==================== 權限管理 ====================
const rolePage       = ref(1)
const ROLE_PAGE_SIZE = 10
const pagedRoles     = computed(() => accountStore.authRoles)
const roleTotalPages = computed(() => accountStore.authRolesTotalPages || 1)

const fetchRolesPage = (page = rolePage.value) =>
  accountStore.fetchAuthRoles(templeId, { page, pageSize: ROLE_PAGE_SIZE })

watch(rolePage, (page) => fetchRolesPage(page))

const expandedRoles = ref([])
const toggleRoleExpand = (id) => {
  const idx = expandedRoles.value.indexOf(id)
  if (idx === -1) expandedRoles.value.push(id)
  else expandedRoles.value.splice(idx, 1)
}


const openCreateRole = () => {
  router.push({ name: 'app.temple.role-create', params: { templeId } })
}

const editRole = (role) => {
  router.push({ name: 'app.temple.role-edit', params: { templeId, roleId: role.roleId } })
}

const deleteRole = async (role) => {
  if (!confirm(`確定要刪除角色「${role.roleName}」嗎？`)) return
  const result = await accountStore.deleteAuthRole(templeId, role.roleId)
  if (result.success) {
    alert(`角色「${role.roleName}」已刪除`)
    await fetchRolesPage()
  } else {
    alert(result.error || '刪除失敗')
  }
}


</script>

<style scoped>
.account-management {
  padding: 24px 32px;
  min-height: 100%;
  background: #F3F4F6;
}

/* 頁面標題 */
.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 20px 0;
}

/* Tab 導航 */
.tab-nav {
  display: flex;
  gap: 0;
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
  transition: color 0.2s;
  font-weight: 500;
}
.tab-btn:hover { color: #E8572A; }
.tab-btn.active {
  color: #E8572A;
  font-weight: 600;
}
.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #E8572A;
  border-radius: 2px 2px 0 0;
}

/* 工具列 */
.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: #E8572A;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}
.btn-primary:hover { background: #d14a1f; transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }

.btn-secondary-orange {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: #fff;
  color: #E8572A;
  border: 1.5px solid #E8572A;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-secondary-orange:hover { background: #fef6f3; }

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: #fff;
  color: #555;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-secondary:hover { background: #f5f5f5; }

/* 篩選列 */
.filter-bar {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-field:first-child {
  flex: 1;
  min-width: 240px;
}

.filter-label {
  font-size: 13px;
  color: #555;
  font-weight: 500;
}

.filter-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 9px 14px;
}
.filter-search:focus-within { border-color: #E8572A; }

.search-icon-svg { flex-shrink: 0; }

.search-input {
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  width: 100%;
  background: transparent;
}

.filter-select {
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 9px 36px 9px 12px;
  font-size: 14px;
  color: #333;
  background: #fff;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  min-width: 140px;
}
.filter-select:focus { outline: none; border-color: #E8572A; }

.filter-input {
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 9px 14px;
  font-size: 14px;
  color: #333;
  background: #fff;
  min-width: 160px;
}
.filter-input:focus { outline: none; border-color: #E8572A; }

/* 表格 */
.table-wrap {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table thead tr {
  background: #fff;
  border-bottom: 1px solid #eee;
}

.data-table th {
  padding: 14px 16px;
  text-align: left;
  font-weight: 600;
  color: #555;
  font-size: 13px;
  white-space: nowrap;
}

.data-table tbody tr {
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.15s;
}
.data-table tbody tr:last-child { border-bottom: none; }
.data-table tbody tr:hover { background: #fafafa; }

.data-table td {
  padding: 16px 16px;
  color: #333;
  vertical-align: middle;
}

.col-check { width: 48px; }
.col-action { width: 150px; }

.td-name { font-weight: 500; color: #1a1a1a; }

.badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.badge-active   { background: #e6f9f0; color: #27a163; }
.badge-inactive { background: #f5f5f5; color: #999; }
.badge-lock     { background: #fde8e8; color: #e53e3e; }

.empty-row {
  text-align: center;
  color: #aaa;
  padding: 40px 0 !important;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 7px;
  border-radius: 6px;
  transition: background 0.15s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.icon-btn:hover { background: #f0f0f0; }
.icon-btn.delete:hover { background: #fff0f0; }

/* 權限管理 */
.role-name { font-weight: 600; color: #333; }
.role-users { font-size: 12px; color: #999; margin-top: 2px; }

.td-perms {
  width: 480px;
  min-width: 480px;
  max-width: 480px;
  vertical-align: top;
  padding-top: 12px !important;
  padding-bottom: 12px !important;
}

.expand-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s;
  white-space: nowrap;
}
.expand-btn:hover { background: #f0f0f0; }

.perm-panel {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.perm-empty {
  font-size: 13px;
  color: #bbb;
  padding: 8px 0;
}

.perm-category { display: flex; flex-direction: column; gap: 6px; }

.perm-cat-label {
  font-size: 11px;
  font-weight: 600;
  color: #E8572A;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.perm-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.perm-tag {
  display: inline-block;
  padding: 3px 10px;
  background: #fff5f2;
  color: #c0440f;
  border: 1px solid #f9c4b0;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}


/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: 14px;
  width: 480px;
  max-width: 95vw;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
}
.modal-header h3 { margin: 0; font-size: 16px; font-weight: 600; color: #222; }

.modal-close {
  background: none;
  border: none;
  font-size: 18px;
  color: #aaa;
  cursor: pointer;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 4px;
}
.modal-close:hover { color: #555; background: #f0f0f0; }

.modal-body { padding: 20px 24px; }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
}

/* 分頁 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.page-btn {
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 13px;
  color: #555;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.page-btn:hover:not(:disabled) { border-color: #E8572A; color: #E8572A; }
.page-btn:disabled { color: #ccc; border-color: #eee; cursor: not-allowed; }

.page-num { min-width: 36px; text-align: center; padding: 8px 12px; }
.page-num.active {
  background: #E8572A;
  border-color: #E8572A;
  color: #fff;
  font-weight: 600;
}
</style>
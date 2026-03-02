<template>
  <div class="account-management">
    <!-- 麵包屑 -->
    <div class="breadcrumb">
      <span class="bc-root">後台管理</span>
      <span class="bc-sep">›</span>
      <span class="bc-current">帳號管理</span>
    </div>

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

    <!-- ===== 帳號管理 Tab ===== -->
    <div v-if="activeTab === 'accounts'" class="tab-content">
      <!-- 工具列 -->
      <div class="toolbar">
        <button class="btn-primary" @click="openCreateAccount">
          <span class="btn-icon">＋</span> 新增帳號
        </button>
      </div>

      <!-- 篩選 -->
      <div class="filter-bar">
        <div class="filter-search">
          <span class="search-icon">🔍</span>
          <input
            v-model="accountSearch"
            type="text"
            placeholder="搜尋帳號、Email 或姓名"
            class="search-input"
          />
        </div>
        <div class="filter-select-wrap">
          <label class="filter-label">角色</label>
          <select v-model="accountRoleFilter" class="filter-select">
            <option value="">全部角色</option>
            <option v-for="r in roleOptions" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>
        <div class="filter-select-wrap">
          <label class="filter-label">狀態</label>
          <select v-model="accountStatusFilter" class="filter-select">
            <option value="">全部狀態</option>
            <option value="啟用">啟用</option>
            <option value="停用">停用</option>
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
              <td>{{ acc.role }}</td>
              <td>
                <span class="badge" :class="acc.status === '啟用' ? 'badge-active' : 'badge-inactive'">
                  {{ acc.status }}
                </span>
              </td>
              <td>{{ acc.lastLogin }}</td>
              <td>{{ acc.createdAt }}</td>
              <td>{{ acc.updatedAt }}</td>
              <td class="col-action">
                <button class="icon-btn edit" @click="editAccount(acc)" title="編輯">✏️</button>
                <button class="icon-btn delete" @click="deleteAccount(acc)" title="刪除">🗑️</button>
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

    <!-- ===== 權限管理 Tab ===== -->
    <div v-if="activeTab === 'roles'" class="tab-content">
      <div class="toolbar">
        <button class="btn-primary" @click="openCreateRole">
          <span class="btn-icon">＋</span> 新增權限角色
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
            <tr v-for="role in pagedRoles" :key="role.id">
              <td>
                <div class="role-name">{{ role.name }}</div>
                <div class="role-users">{{ role.userCount }} 位使用者</div>
              </td>
              <td class="td-perms">
                <button class="expand-btn" @click="toggleRoleExpand(role.id)">
                  {{ expandedRoles.includes(role.id) ? '收合內容' : '向下展開' }}
                  <span>{{ expandedRoles.includes(role.id) ? '∧' : '∨' }}</span>
                </button>
                <div v-if="expandedRoles.includes(role.id)" class="perm-tree">
                  <template v-for="group in permissionGroups" :key="group.label">
                    <div class="perm-group-label">{{ group.label }}</div>
                    <template v-for="item in group.children" :key="item.key">
                      <div class="perm-item" :class="{ 'perm-disabled': !role.permissions.includes(item.key) }">
                        <span class="perm-dot">•</span>
                        <span class="perm-item-label">{{ item.label }}</span>
                      </div>
                      <template v-if="item.children">
                        <div
                          v-for="child in item.children"
                          :key="child.key"
                          class="perm-child"
                          :class="{ 'perm-disabled': !role.permissions.includes(child.key) }"
                        >
                          <span class="perm-dash">-</span>
                          <span class="perm-item-label">{{ child.label }}</span>
                        </div>
                      </template>
                    </template>
                  </template>
                </div>
              </td>
              <td>{{ role.updatedAt }}</td>
              <td class="col-action">
                <button class="icon-btn edit" @click="editRole(role)" title="編輯">✏️</button>
                <button class="icon-btn delete" @click="deleteRole(role)" title="刪除">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分頁 -->
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

    <!-- ===== 修改密碼 Tab ===== -->
    <div v-if="activeTab === 'password'" class="tab-content password-tab">
      <div class="password-card">
        <h2 class="card-title">修改密碼</h2>

        <div class="form-group">
          <label class="form-label">舊密碼</label>
          <input
            v-model="passwordForm.oldPassword"
            type="password"
            class="form-input"
            placeholder="請輸入舊密碼"
          />
        </div>

        <div class="form-group">
          <label class="form-label">新密碼</label>
          <input
            v-model="passwordForm.newPassword"
            type="password"
            class="form-input"
            :class="{ 'input-error': passwordErrors.newPassword }"
            placeholder="請輸入新密碼"
          />
          <p class="input-hint">密碼需包含至少 8 個字元，含大小寫字母與數字</p>
          <p v-if="passwordErrors.newPassword" class="error-msg">{{ passwordErrors.newPassword }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">確認新密碼</label>
          <input
            v-model="passwordForm.confirmPassword"
            type="password"
            class="form-input"
            :class="{ 'input-error': passwordErrors.confirmPassword }"
            placeholder="請再次輸入新密碼"
          />
          <p v-if="passwordErrors.confirmPassword" class="error-msg">{{ passwordErrors.confirmPassword }}</p>
        </div>

        <div class="security-notice">
          <div class="notice-title">⚠️ 安全提示</div>
          <ul>
            <li>修改密碼後將登出所有裝置</li>
            <li>新密碼不可與前 3 次相同</li>
            <li>建議定期更換密碼以確保帳號安全</li>
          </ul>
        </div>

        <div class="card-actions">
          <button class="btn-primary" @click="handleChangePassword">確認修改</button>
          <button class="btn-secondary" @click="resetPasswordForm">取消</button>
        </div>
      </div>
    </div>

    <!-- ===== Modal：新增/編輯帳號 ===== -->
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
import { ref, computed, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// ==================== Tab ====================
const router = useRouter()
const route  = useRoute()
const tabs = [
  { key: 'accounts', label: '帳號管理' },
  { key: 'roles',    label: '權限管理' },
  { key: 'password', label: '修改密碼' },
]
const activeTab = ref('accounts')

// ==================== 帳號管理 ====================
const accountSearch       = ref('')
const accountRoleFilter   = ref('')
const accountStatusFilter = ref('')
const selectedAccounts    = ref([])

const accounts = ref([
  { id: 1, name: '王大明', role: '超級管理員', status: '啟用', lastLogin: '2026-02-25 10:30', createdAt: '2025-01-01', updatedAt: '2026-02-20 14:30' },
  { id: 2, name: '李小華', role: '編輯者',     status: '啟用', lastLogin: '2026-02-24 15:20', createdAt: '2025-02-15', updatedAt: '2026-02-22 10:15' },
  { id: 3, name: '張美玲', role: '客服人員',   status: '啟用', lastLogin: '2026-02-25 09:15', createdAt: '2025-03-01', updatedAt: '2026-02-18 16:45' },
  { id: 4, name: '陳師父', role: '解籤師',     status: '啟用', lastLogin: '2026-02-23 14:00', createdAt: '2025-01-20', updatedAt: '2026-02-10 11:20' },
  { id: 5, name: '林志明', role: '檢視者',     status: '停用', lastLogin: '2026-01-15 11:30', createdAt: '2025-04-10', updatedAt: '2026-01-15 11:30' },
])

const roleOptions = computed(() => [...new Set(accounts.value.map(a => a.role))])

const filteredAccounts = computed(() => {
  return accounts.value.filter(a => {
    const matchSearch = !accountSearch.value ||
      a.name.includes(accountSearch.value) ||
      a.role.includes(accountSearch.value)
    const matchRole   = !accountRoleFilter.value   || a.role   === accountRoleFilter.value
    const matchStatus = !accountStatusFilter.value || a.status === accountStatusFilter.value
    return matchSearch && matchRole && matchStatus
  })
})

const PAGE_SIZE = 10
const accountPage = ref(1)
const accountTotalPages = computed(() => Math.max(1, Math.ceil(filteredAccounts.value.length / PAGE_SIZE)))
const pagedAccounts = computed(() => {
  const start = (accountPage.value - 1) * PAGE_SIZE
  return filteredAccounts.value.slice(start, start + PAGE_SIZE)
})

// 篩選條件變動時重置頁碼
watch([accountSearch, accountRoleFilter, accountStatusFilter], () => { accountPage.value = 1 })

const allAccountsSelected = computed(() =>
  filteredAccounts.value.length > 0 &&
  filteredAccounts.value.every(a => selectedAccounts.value.includes(a.id))
)

const toggleAllAccounts = (e) => {
  if (e.target.checked) {
    selectedAccounts.value = filteredAccounts.value.map(a => a.id)
  } else {
    selectedAccounts.value = []
  }
}

// 帳號 Modal
const showAccountModal = ref(false)
const editingAccount   = ref(null)
const accountForm      = reactive({ name: '', email: '', role: '', status: '啟用' })

const openCreateAccount = () => {
  router.push({ name: 'app.temple.account-create', params: { templeId: route.params.templeId } })
}

const editAccount = (acc) => {
  editingAccount.value = acc
  Object.assign(accountForm, { name: acc.name, email: '', role: acc.role, status: acc.status })
  showAccountModal.value = true
}

const saveAccount = () => {
  if (!accountForm.name || !accountForm.role) {
    alert('請填寫必填欄位')
    return
  }
  if (editingAccount.value) {
    const idx = accounts.value.findIndex(a => a.id === editingAccount.value.id)
    if (idx !== -1) {
      accounts.value[idx] = {
        ...accounts.value[idx],
        name: accountForm.name,
        email: accountForm.email,
        role: accountForm.role,
        status: accountForm.status,
        updatedAt: new Date().toLocaleString('zh-TW').replace(/\//g, '-')
      }
    }
  }
  showAccountModal.value = false
}

const deleteAccount = (acc) => {
  if (confirm(`確定要刪除帳號「${acc.name}」嗎？`)) {
    accounts.value = accounts.value.filter(a => a.id !== acc.id)
  }
}

// ==================== 權限管理 ====================
// 權限群組定義（有父層標題 + 子項目）
const permissionGroups = [
  {
    label: '後台管理',
    children: [
      { label: '宮廟總覽', key: 'dashboard' },
      {
        label: '宮廟資料管理', key: 'temple-info-group',
        children: [
          { label: '基本資料', key: 'temple-basic' },
          { label: '神尊管理', key: 'temple-deity' },
          { label: '分靈管理', key: 'temple-branch' },
        ]
      },
      { label: '最新消息管理', key: 'news' },
      {
        label: '活動與上架管理', key: 'activity-group',
        children: [
          { label: '活動管理', key: 'events' },
          { label: '服務管理', key: 'services' },
          { label: '商品管理', key: 'products' },
          { label: '運費管理', key: 'shipping' },
        ]
      },
      { label: '集影牆管理', key: 'gallery' },
      {
        label: '印刷管理', key: 'print-group',
        children: [
          { label: '任務管理', key: 'print-tasks' },
        ]
      },
      { label: '訂單管理', key: 'orders' },
      { label: '帳號管理', key: 'accounts' },
    ]
  },
]

// 取得 role 已勾選的所有 key（包含子項）
const getAllPermKeys = (groups) => {
  const keys = []
  const walk = (items) => {
    for (const item of items) {
      keys.push(item.key)
      if (item.children) walk(item.children)
    }
  }
  walk(groups.flatMap(g => g.children))
  return keys
}

const allPermissions = getAllPermKeys(permissionGroups)

const roles = ref([
  { id: 1, name: '超級管理員', userCount: 1, updatedAt: '2026-02-20', permissions: allPermissions },
  { id: 2, name: '管理員',     userCount: 3, updatedAt: '2026-02-18', permissions: ['dashboard', 'temple-info-group', 'temple-basic', 'temple-deity', 'temple-branch', 'news', 'activity-group', 'events', 'services', 'products', 'shipping', 'gallery', 'orders', 'accounts'] },
  { id: 3, name: '編輯者',     userCount: 2, updatedAt: '2026-02-15', permissions: ['dashboard', 'news', 'gallery'] },
  { id: 4, name: '檢視者',     userCount: 1, updatedAt: '2026-02-10', permissions: ['dashboard'] },
  { id: 5, name: '解籤師',     userCount: 1, updatedAt: '2026-02-12', permissions: ['dashboard', 'print-group', 'print-tasks'] },
  { id: 6, name: '客服人員',   userCount: 1, updatedAt: '2026-02-08', permissions: ['dashboard', 'orders'] },
])

// 角色 Modal
const openCreateRole = () => {
  router.push({ name: 'app.temple.role-create', params: { templeId: route.params.templeId } })
}

const editRole = (role) => {
  router.push({ name: 'app.temple.role-edit', params: { templeId: route.params.templeId, roleId: role.id } })
}

const rolePage = ref(1)
const ROLE_PAGE_SIZE = 10
const roleTotalPages = computed(() => Math.max(1, Math.ceil(roles.value.length / ROLE_PAGE_SIZE)))
const pagedRoles = computed(() => {
  const start = (rolePage.value - 1) * ROLE_PAGE_SIZE
  return roles.value.slice(start, start + ROLE_PAGE_SIZE)
})

// 展開收合
const expandedRoles = ref([])
const toggleRoleExpand = (id) => {
  const idx = expandedRoles.value.indexOf(id)
  if (idx === -1) expandedRoles.value.push(id)
  else expandedRoles.value.splice(idx, 1)
}



const deleteRole = (role) => {
  if (confirm(`確定要刪除角色「${role.name}」嗎？`)) {
    roles.value = roles.value.filter(r => r.id !== role.id)
  }
}

// ==================== 修改密碼 ====================
const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const passwordErrors = reactive({ newPassword: '', confirmPassword: '' })

const validatePassword = () => {
  passwordErrors.newPassword = ''
  passwordErrors.confirmPassword = ''
  let valid = true

  const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  if (!pwdRegex.test(passwordForm.newPassword)) {
    passwordErrors.newPassword = '密碼需至少 8 個字元，含大小寫字母與數字'
    valid = false
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = '兩次輸入的密碼不一致'
    valid = false
  }
  return valid
}

const handleChangePassword = () => {
  if (!passwordForm.oldPassword) { alert('請輸入舊密碼'); return }
  if (!validatePassword()) return
  alert('密碼已修改成功！')
  resetPasswordForm()
}

const resetPasswordForm = () => {
  Object.assign(passwordForm, { oldPassword: '', newPassword: '', confirmPassword: '' })
  Object.assign(passwordErrors, { newPassword: '', confirmPassword: '' })
}
</script>

<style scoped>
.account-management {
  padding: 24px 32px;
  min-height: 100%;
  background: #f8f8f6;
}

/* 麵包屑 */
.breadcrumb {
  font-size: 13px;
  color: #999;
  margin-bottom: 20px;
}
.bc-sep { margin: 0 6px; }
.bc-current { color: #333; font-weight: 500; }

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
  margin-bottom: 16px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  background: #E8572A;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}
.btn-primary:hover { background: #d14a1f; transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  background: #fff;
  color: #555;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-secondary:hover { background: #f5f5f5; }

.btn-icon { font-size: 16px; line-height: 1; }

/* 篩選列 */
.filter-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px 14px;
  min-width: 280px;
  flex: 1;
}
.search-icon { font-size: 14px; color: #aaa; }
.search-input {
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  width: 100%;
  background: transparent;
}

.filter-select-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-label { font-size: 13px; color: #666; white-space: nowrap; }
.filter-select {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px 32px 8px 12px;
  font-size: 14px;
  color: #333;
  background: #fff;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  min-width: 120px;
}
.filter-select:focus { outline: none; border-color: #E8572A; }

/* 表格 */
.table-wrap {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table thead tr {
  background: #fafafa;
  border-bottom: 1px solid #eee;
}

.data-table th {
  padding: 13px 16px;
  text-align: left;
  font-weight: 600;
  color: #555;
  font-size: 13px;
  white-space: nowrap;
}

.data-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.15s;
}
.data-table tbody tr:last-child { border-bottom: none; }
.data-table tbody tr:hover { background: #fafafa; }

.data-table td {
  padding: 14px 16px;
  color: #333;
  vertical-align: middle;
}

.col-check { width: 48px; }
.col-action { width: 100px; text-align: right; }

.td-name { font-weight: 500; }

.badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.badge-active   { background: #e6f9f0; color: #27a163; }
.badge-inactive { background: #f5f5f5; color: #999; }

.empty-row {
  text-align: center;
  color: #aaa;
  padding: 40px 0 !important;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 15px;
  padding: 4px 6px;
  border-radius: 6px;
  transition: background 0.15s;
  opacity: 0.7;
}
.icon-btn:hover { background: #f0f0f0; opacity: 1; }
.icon-btn.delete:hover { background: #fff0f0; }

/* 權限管理 */
.role-name { font-weight: 600; color: #333; }
.role-users { font-size: 12px; color: #999; margin-top: 2px; }

/* 權限欄固定寬度，防止展開時影響其他欄寬 */
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

.perm-tree {
  columns: 2;
  column-gap: 24px;
  font-size: 13px;
  line-height: 1.6;
}

.perm-group-label {
  font-weight: 700;
  color: #E8572A;
  font-size: 12px;
  margin-top: 8px;
  break-inside: avoid;
}
.perm-group-label:first-child { margin-top: 0; }

.perm-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 1px 0;
  break-inside: avoid;
}
.perm-child {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 1px 0 1px 12px;
  break-inside: avoid;
}
.perm-dot  { color: #E8572A; font-size: 10px; flex-shrink: 0; }
.perm-dash { color: #bbb; flex-shrink: 0; }
.perm-item-label { color: #333; }
.perm-disabled .perm-item-label { color: #ccc; text-decoration: line-through; }
.perm-disabled .perm-dot,
.perm-disabled .perm-dash { color: #ddd; }


/* 修改密碼 */
.password-tab {
  display: flex;
  justify-content: center;
}

.password-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px 48px;
  width: 100%;
  max-width: 560px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.card-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #222;
  margin: 0 0 28px 0;
}

.form-group { margin-bottom: 20px; }

.form-label {
  display: block;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
}
.required { color: #E8572A; margin-left: 2px; }

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
  background: #fff;
}
.form-input:focus {
  outline: none;
  border-color: #E8572A;
  box-shadow: 0 0 0 3px rgba(232, 87, 42, 0.1);
}
.form-input.input-error { border-color: #e53e3e; }

.input-hint { font-size: 12px; color: #999; margin-top: 6px; }
.error-msg  { font-size: 12px; color: #e53e3e; margin-top: 4px; }

.security-notice {
  background: #fffbeb;
  border: 1px solid #f6c445;
  border-radius: 10px;
  padding: 16px 20px;
  margin: 24px 0;
}
.notice-title {
  font-weight: 600;
  color: #92400e;
  margin-bottom: 10px;
  font-size: 14px;
}
.security-notice ul {
  margin: 0;
  padding-left: 18px;
  color: #92400e;
}
.security-notice li {
  font-size: 13px;
  line-height: 1.8;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
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

/* 權限 checkbox */
.perm-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}
.perm-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #444;
  cursor: pointer;
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  transition: background 0.15s, border-color 0.15s;
  user-select: none;
}
.perm-checkbox:hover { background: #fef6f3; border-color: #E8572A; }
.perm-checkbox input { accent-color: #E8572A; }

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
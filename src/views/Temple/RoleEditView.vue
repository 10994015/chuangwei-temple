<template>
  <div class="role-edit">
    <!-- 麵包屑 -->
    <div class="breadcrumb">
      <span class="bc-root">後台管理</span>
      <span class="bc-sep">›</span>
      <span class="bc-link" @click="handleBack">帳號管理</span>
    </div>

    <!-- 返回 -->
    <button class="back-btn" @click="handleBack">← 返回上一頁</button>

    <!-- 標題 -->
    <h1 class="page-title">{{ isEdit ? '編輯權限角色' : '新增權限角色' }}</h1>

    <!-- 主體卡片 -->
    <div class="main-card">
      <!-- 角色名稱 -->
      <div class="form-group">
        <label class="form-label">
          權限角色名稱
          <span class="required">*</span>
        </label>
        <input
          v-model="form.name"
          type="text"
          class="form-input"
          :class="{ 'input-error': errors.name }"
          placeholder="請輸入權限角色名稱"
        />
        <p v-if="errors.name" class="error-msg">{{ errors.name }}</p>
      </div>

      <!-- 啟用所有權限 -->
      <label class="enable-all-row">
        <input
          type="checkbox"
          :checked="isAllEnabled"
          :indeterminate.prop="isAllIndeterminate"
          @change="toggleAll($event.target.checked)"
        />
        <span>啟用所有權限</span>
      </label>

      <!-- 權限設定列表 -->
      <div class="perm-section-title">權限設定列表</div>

      <div class="perm-table-wrap">
        <table class="perm-table">
          <thead>
            <tr>
              <th class="col-system">系統</th>
              <th class="col-main">主功能</th>
              <th class="col-sub">次功能</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="system in permissionGroups" :key="system.key">
              <!-- 系統跨列 -->
              <template v-for="(item, itemIdx) in system.children" :key="item.key">
                <!-- 主功能沒有子項 -->
                <tr v-if="!item.children || item.children.length === 0">
                  <!-- 系統欄：只在第一個主功能顯示 -->
                  <td v-if="itemIdx === 0" :rowspan="getSystemRowspan(system)" class="td-system">
                    <label class="cb-row">
                      <input
                        type="checkbox"
                        :checked="isSystemChecked(system)"
                        :indeterminate.prop="isSystemIndeterminate(system)"
                        @change="toggleSystem(system, $event.target.checked)"
                      />
                      <span class="cb-label">{{ system.label }}</span>
                    </label>
                  </td>
                  <td class="td-main">
                    <label class="cb-row">
                      <input
                        type="checkbox"
                        :checked="form.permissions.includes(item.key)"
                        @change="toggleItem(item, $event.target.checked)"
                      />
                      <span class="cb-label">{{ item.label }}</span>
                    </label>
                  </td>
                  <td class="td-sub">
                    <span class="dash">-</span>
                  </td>
                </tr>

                <!-- 主功能有子項：主功能列 + 子項各一列 -->
                <template v-else>
                  <!-- 主功能那一行，子項各自一行 -->
                  <tr v-for="(child, childIdx) in item.children" :key="child.key">
                    <!-- 系統欄 -->
                    <td v-if="itemIdx === 0 && childIdx === 0" :rowspan="getSystemRowspan(system)" class="td-system">
                      <label class="cb-row">
                        <input
                          type="checkbox"
                          :checked="isSystemChecked(system)"
                          :indeterminate.prop="isSystemIndeterminate(system)"
                          @change="toggleSystem(system, $event.target.checked)"
                        />
                        <span class="cb-label">{{ system.label }}</span>
                      </label>
                    </td>
                    <!-- 主功能欄：只在子項第一列顯示 -->
                    <td v-if="childIdx === 0" :rowspan="item.children.length" class="td-main">
                      <label class="cb-row">
                        <input
                          type="checkbox"
                          :checked="isItemChecked(item)"
                          :indeterminate.prop="isItemIndeterminate(item)"
                          @change="toggleItem(item, $event.target.checked)"
                        />
                        <span class="cb-label">{{ item.label }}</span>
                      </label>
                    </td>
                    <!-- 次功能欄 -->
                    <td class="td-sub">
                      <label class="cb-row">
                        <input
                          type="checkbox"
                          v-model="form.permissions"
                          :value="child.key"
                        />
                        <span class="cb-label">{{ child.label }}</span>
                      </label>
                    </td>
                  </tr>
                </template>
              </template>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="page-actions">
      <button class="btn-primary" @click="handleSubmit">
        {{ isEdit ? '確認修改' : '確認新增' }}
      </button>
      <button class="btn-secondary" @click="handleBack">取消</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route  = useRoute()

const isEdit = computed(() => !!route.params.roleId)

// ==================== 權限樹定義 ====================
const permissionGroups = [
  {
    label: '後台管理', key: 'sys-backend',
    children: [
      { label: '宮廟總覽',     key: 'dashboard' },
      {
        label: '宮廟資料管理', key: 'temple-info',
        children: [
          { label: '基本資料', key: 'temple-basic' },
          { label: '神尊管理', key: 'temple-deity' },
          { label: '分靈管理', key: 'temple-branch' },
          { label: '資產管理', key: 'temple-assets' },
        ]
      },
      { label: '最新消息管理', key: 'news' },
      {
        label: '活動與上架管理', key: 'activity',
        children: [
          { label: '活動管理', key: 'events' },
          { label: '服務管理', key: 'services' },
          { label: '商品管理', key: 'products' },
          { label: '捐款管理', key: 'donations' },
          { label: '運費管理', key: 'shipping' },
        ]
      },
      { label: '集影牆管理',   key: 'gallery' },
      { label: '靈籤司管理',   key: 'divination' },
      {
        label: '印刷管理', key: 'print',
        children: [
          { label: '任務管理', key: 'print-tasks' },
          { label: '疏文管理', key: 'print-docs' },
        ]
      },
      { label: '訂單管理',     key: 'orders' },
      { label: '香客資料管理', key: 'customers' },
      { label: '線上光明燈管理', key: 'lanterns' },
      { label: '方案與帳單',   key: 'billing' },
      { label: '廣告管理',     key: 'ads' },
      {
        label: '帳號管理', key: 'account-mgmt',
        children: [
          { label: '帳號管理', key: 'account-list' },
          { label: '權限管理', key: 'role-mgmt' },
          { label: '修改密碼', key: 'change-password' },
        ]
      },
      
    ]
  },
  {
    label: '網站管理', key: 'sys-website',
    children: [
         { label: '網站管理',     key: 'sys-website' },
    ]
  },
]

// ==================== 表單 ====================
const form = reactive({
  name: '',
  permissions: []
})

const errors = reactive({ name: '' })

// 模擬：若是編輯模式，預填資料（實際串 API 後替換）
if (isEdit.value) {
  form.name = '管理員'
  form.permissions = ['dashboard', 'temple-basic', 'temple-deity', 'news', 'orders']
}

// ==================== checkbox 邏輯 ====================

// 取得某節點的所有葉節點 keys
const getLeafKeys = (item) => {
  if (!item.children || item.children.length === 0) return [item.key]
  return item.children.flatMap(c => getLeafKeys(c))
}

// 取得某節點自身 + 所有子孫 keys
const getAllKeys = (item) => {
  const keys = [item.key]
  if (item.children) item.children.forEach(c => keys.push(...getAllKeys(c)))
  return keys
}

// 系統層
const isSystemChecked = (system) => {
  const keys = system.children.flatMap(i => getAllKeys(i))
  return keys.length > 0 && keys.every(k => form.permissions.includes(k))
}
const isSystemIndeterminate = (system) => {
  const keys = system.children.flatMap(i => getAllKeys(i))
  const cnt = keys.filter(k => form.permissions.includes(k)).length
  return cnt > 0 && cnt < keys.length
}
const toggleSystem = (system, checked) => {
  const keys = system.children.flatMap(i => getAllKeys(i))
  if (checked) {
    keys.forEach(k => { if (!form.permissions.includes(k)) form.permissions.push(k) })
  } else {
    keys.forEach(k => {
      const idx = form.permissions.indexOf(k)
      if (idx !== -1) form.permissions.splice(idx, 1)
    })
  }
}

// 主功能層（有子項才用三態）
const isItemChecked = (item) => {
  const keys = getAllKeys(item)
  return keys.every(k => form.permissions.includes(k))
}
const isItemIndeterminate = (item) => {
  if (!item.children || item.children.length === 0) return false
  const keys = getAllKeys(item)
  const cnt = keys.filter(k => form.permissions.includes(k)).length
  return cnt > 0 && cnt < keys.length
}
const toggleItem = (item, checked) => {
  const keys = getAllKeys(item)
  if (checked) {
    keys.forEach(k => { if (!form.permissions.includes(k)) form.permissions.push(k) })
  } else {
    keys.forEach(k => {
      const idx = form.permissions.indexOf(k)
      if (idx !== -1) form.permissions.splice(idx, 1)
    })
  }
}

// 全選
const allKeys = computed(() =>
  permissionGroups.flatMap(s => s.children.flatMap(i => getAllKeys(i)))
)
const isAllEnabled = computed(() =>
  allKeys.value.length > 0 && allKeys.value.every(k => form.permissions.includes(k))
)
const isAllIndeterminate = computed(() => {
  const cnt = allKeys.value.filter(k => form.permissions.includes(k)).length
  return cnt > 0 && cnt < allKeys.value.length
})
const toggleAll = (checked) => {
  if (checked) {
    allKeys.value.forEach(k => { if (!form.permissions.includes(k)) form.permissions.push(k) })
  } else {
    form.permissions.splice(0)
  }
}

// ==================== rowspan 計算 ====================
// 系統欄的 rowspan = 該系統下所有主功能的列數總和
const getSystemRowspan = (system) => {
  return system.children.reduce((sum, item) => {
    if (!item.children || item.children.length === 0) return sum + 1
    return sum + item.children.length
  }, 0)
}

// ==================== 表單送出 ====================
const handleSubmit = () => {
  errors.name = ''
  if (!form.name.trim()) {
    errors.name = '請填寫權限角色名稱'
    return
  }
  // TODO: 串 API
  console.log('送出:', { name: form.name, permissions: form.permissions })
  alert(isEdit.value ? '已更新權限角色！' : '已新增權限角色！')
  handleBack()
}

const handleBack = () => {
  router.push({
    name: 'app.temple.account-management',
    params: { templeId: route.params.templeId }
  })
}
</script>

<style scoped>
.role-edit {
  padding: 24px 32px 80px;
  min-height: 100%;
  background: #f8f8f6;
}

/* 麵包屑 */
.breadcrumb {
  font-size: 13px;
  color: #999;
  margin-bottom: 16px;
}
.bc-sep { margin: 0 6px; }
.bc-link { color: #999; cursor: pointer; }
.bc-link:hover { color: #E8572A; text-decoration: underline; }

/* 返回按鈕 */
.back-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  margin-bottom: 16px;
  display: block;
  transition: color 0.15s;
}
.back-btn:hover { color: #E8572A; }

/* 頁面標題 */
.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 24px 0;
}

/* 主體卡片 */
.main-card {
  background: #fff;
  border-radius: 14px;
  padding: 32px 36px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
}

/* 表單 */
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
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-input:focus {
  outline: none;
  border-color: #E8572A;
  box-shadow: 0 0 0 3px rgba(232,87,42,0.1);
}
.form-input.input-error { border-color: #e53e3e; }
.error-msg { font-size: 12px; color: #e53e3e; margin-top: 4px; }

/* 啟用所有權限 */
.enable-all-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 20px;
  user-select: none;
}
.enable-all-row input { accent-color: #E8572A; width: 15px; height: 15px; cursor: pointer; }

/* 權限設定標題 */
.perm-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #222;
  margin-bottom: 12px;
}

/* 權限表格 */
.perm-table-wrap {
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  overflow: hidden;
}

.perm-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.perm-table thead tr {
  background: #f5f5f5;
}
.perm-table th {
  padding: 12px 20px;
  text-align: left;
  font-weight: 600;
  color: #555;
  font-size: 13px;
  border-bottom: 1px solid #e8e8e8;
}

.col-system { width: 220px; }
.col-main   { width: 360px; }
.col-sub    { }

.perm-table td {
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}
.perm-table tbody tr:last-child td { border-bottom: none; }

/* 系統欄有右邊框作分隔 */
.td-system {
  border-right: 1px solid #f0f0f0;
  vertical-align: top;
  padding-top: 16px !important;
  background: #fafafa;
}
.td-main {
  border-right: 1px solid #f0f0f0;
  vertical-align: top;
  padding-top: 16px !important;
}

/* checkbox 列 */
.cb-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.cb-row input {
  accent-color: #E8572A;
  width: 15px;
  height: 15px;
  cursor: pointer;
  flex-shrink: 0;
}
.cb-label { color: #333; }

.dash { color: #bbb; }

/* 底部操作 */
.page-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 28px;
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

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 28px;
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
</style>
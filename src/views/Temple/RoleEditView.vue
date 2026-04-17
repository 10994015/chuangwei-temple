<template>
  <div class="role-edit">
    <!-- 麵包屑 -->
    <AppBreadcrumb :items="breadcrumbs" />

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

      <!-- 狀態 -->
      <div class="form-group">
        <label class="form-label">狀態</label>
        <div class="radio-group">
          <label class="radio-row">
            <input type="radio" v-model="form.status" value="OPEN" />
            <span>啟用</span>
          </label>
          <label class="radio-row">
            <input type="radio" v-model="form.status" value="INVALID" />
            <span>停用</span>
          </label>
        </div>
      </div>

      <!-- 權限設定 -->
      <div class="perm-section-title">權限設定</div>

      <div v-if="accountStore.isLoadingPermissions" class="loading-text">載入權限清單中...</div>

      <div v-else-if="accountStore.allPermissions.length === 0" class="empty-text">無可用權限</div>

      <div v-else class="perm-table-wrap">
        <table class="perm-table">
          <thead>
            <tr>
              <th class="col-cat">類別</th>
              <th class="col-name">權限項目</th>
              <th class="col-mode">存取層級</th>
            </tr>
          </thead>
          <tbody>
            <!-- allPermissions 已是分組格式 [{ category, permissions:[{id,name,mode:[]}] }] -->
            <template v-for="group in accountStore.allPermissions" :key="group.category">
              <tr v-for="(perm, idx) in group.permissions" :key="perm.id">
                <td v-if="idx === 0" :rowspan="group.permissions.length" class="td-cat">
                  {{ group.category }}
                </td>
                <td class="td-name">{{ perm.name }}</td>
                <td class="td-mode">
                  <div class="mode-options">
                    <label class="mode-radio">
                      <input
                        type="radio"
                        :name="`mode-${perm.id}`"
                        :checked="!form.permissions[perm.id]"
                        @change="setMode(perm.id, null)"
                      />
                      <span>不開放</span>
                    </label>
                    <label class="mode-radio">
                      <input
                        type="radio"
                        :name="`mode-${perm.id}`"
                        :checked="form.permissions[perm.id] === 'FULL'"
                        @change="setMode(perm.id, 'FULL')"
                      />
                      <span>完整</span>
                    </label>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="page-actions">
      <button class="btn-primary" @click="handleSubmit" :disabled="accountStore.isSavingRole">
        <span v-if="accountStore.isSavingRole">{{ isEdit ? '儲存中...' : '建立中...' }}</span>
        <span v-else>{{ isEdit ? '確認修改' : '確認新增' }}</span>
      </button>
      <button class="btn-secondary" @click="handleBack">取消</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'
import { useAccountStore } from '@/stores/account'

const router       = useRouter()
const route        = useRoute()
const accountStore = useAccountStore()
const templeId     = route.params.templeId
const roleId       = route.params.roleId

const isEdit = computed(() => !!roleId)

// ==================== 表單 ====================
const form = reactive({
  name:        '',
  status:      'OPEN',
  permissions: {}, // { [permissionId]: 'FULL' | null }
})

const errors = reactive({ name: '' })

const setMode = (permissionId, mode) => {
  if (mode === null) {
    delete form.permissions[permissionId]
  } else {
    form.permissions[permissionId] = mode
  }
}

// ==================== 初始化 ====================
onMounted(async () => {
  await accountStore.fetchAllPermissions(templeId)

  if (isEdit.value) {
    const data = await accountStore.fetchAuthRoleById(templeId, roleId)
    if (data) {
      form.name   = data.roleName   || ''
      form.status = data.roleStatus || 'OPEN'
      // data.permissions 是分組格式 [{ category, permissions: [{permissionId, mode}] }]
      for (const group of (data.permissions || [])) {
        for (const p of (group.permissions || [])) {
          if (p.mode) form.permissions[p.permissionId] = p.mode
        }
      }
    }
  }
})

// ==================== 送出 ====================
const handleSubmit = async () => {
  errors.name = ''
  if (!form.name.trim()) {
    errors.name = '請填寫權限角色名稱'
    return
  }

  // 只送有 mode 的項目（空值 = 不開放，不送給後端）
  const rolePermissions = Object.entries(form.permissions)
    .filter(([, mode]) => mode)
    .map(([permissionId, mode]) => ({ permissionId, mode }))

  const payload = {
    name:            form.name.trim(),
    status:          form.status,
    rolePermissions,
  }

  const result = isEdit.value
    ? await accountStore.updateAuthRole(templeId, roleId, payload)
    : await accountStore.createAuthRole(templeId, payload)

  if (result.success) {
    alert(isEdit.value ? '已更新權限角色' : '已新增權限角色')
    handleBack()
  } else {
    alert(result.error || '操作失敗，請再試一次')
  }
}

const handleBack = () => {
  router.push({
    name: 'app.temple.account-management',
    params: { templeId },
    query: { tab: 'roles' },
  })
}

const breadcrumbs = computed(() => [
  { text: '後台管理' },
  { text: '帳號管理', onClick: handleBack },
  { text: isEdit.value ? '編輯權限角色' : '新增權限角色' },
])
</script>

<style scoped>
.role-edit {
  padding: 24px 32px 80px;
  min-height: 100%;
  background: #F3F4F6;
}

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

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 24px 0;
}

.main-card {
  background: #fff;
  border-radius: 14px;
  padding: 32px 36px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
}

.form-group { margin-bottom: 24px; }

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

.radio-group { display: flex; gap: 24px; }
.radio-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  user-select: none;
}
.radio-row input { accent-color: #E8572A; width: 15px; height: 15px; cursor: pointer; }

.perm-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #222;
  margin-bottom: 12px;
}

.loading-text, .empty-text {
  font-size: 14px;
  color: #aaa;
  padding: 24px 0;
}

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

.perm-table thead tr { background: #f5f5f5; }
.perm-table th {
  padding: 12px 20px;
  text-align: left;
  font-weight: 600;
  color: #555;
  font-size: 13px;
  border-bottom: 1px solid #e8e8e8;
}

.col-cat  { width: 180px; }
.col-name { min-width: 200px; }
.col-mode { width: 180px; }

.perm-table td {
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}
.perm-table tbody tr:last-child td { border-bottom: none; }

.td-cat {
  border-right: 1px solid #f0f0f0;
  vertical-align: top;
  padding-top: 14px !important;
  background: #fafafa;
  font-weight: 500;
  color: #555;
}

.td-name { color: #333; }

.mode-options {
  display: flex;
  gap: 16px;
}

.mode-radio {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-size: 13px;
  color: #444;
  user-select: none;
}
.mode-radio input { accent-color: #E8572A; width: 14px; height: 14px; cursor: pointer; }

.page-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
}

.btn-primary {
  padding: 10px 28px;
  background: #E8572A;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover:not(:disabled) { background: #d14a1f; }
.btn-primary:disabled { background: #f0a080; cursor: not-allowed; }

.btn-secondary {
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

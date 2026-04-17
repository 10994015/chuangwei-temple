<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOperationsStore } from '@/stores/operations'

const router = useRouter()
const route  = useRoute()
const operationsStore = useOperationsStore()

const isEdit  = computed(() => !!route.params.roleId)
const isSaving = ref(false)
const isLoading = ref(true)

const form = ref({
  name:            '',
  status:          'OPEN',
  rolePermissions: [], // [{ permissionId, mode }]
})

// 系統所有權限（依 category 分組）
const systemPermissions = ref([]) // [{ category, permissions: [{ id, name, mode: [] }] }]

// 已選的 permissionId Set
const selectedIds = computed(() => new Set(form.value.rolePermissions.map(p => p.permissionId)))

const getMode = (permissionId) => {
  return form.value.rolePermissions.find(p => p.permissionId === permissionId)?.mode || ''
}

const togglePermission = (perm, mode) => {
  const idx = form.value.rolePermissions.findIndex(p => p.permissionId === perm.id)
  if (idx !== -1) {
    if (form.value.rolePermissions[idx].mode === mode) {
      // 已選同 mode，取消
      form.value.rolePermissions.splice(idx, 1)
    } else {
      // 切換 mode
      form.value.rolePermissions[idx].mode = mode
    }
  } else {
    form.value.rolePermissions.push({ permissionId: perm.id, mode })
  }
}

const isSelected = (permId, mode) => {
  const found = form.value.rolePermissions.find(p => p.permissionId === permId)
  return found?.mode === mode
}

const save = async () => {
  if (!form.value.name.trim()) { alert('請填寫角色名稱'); return }
  isSaving.value = true
  try {
    const body = {
      name:            form.value.name.trim(),
      status:          form.value.status,
      rolePermissions: form.value.rolePermissions,
    }
    if (isEdit.value) {
      await operationsStore.updateRole(route.params.roleId, body)
    } else {
      await operationsStore.createRole(body)
    }
    router.push({ name: 'app.operations.maintenance' })
  } catch (err) {
    console.error('儲存失敗:', err)
    alert('儲存失敗，請確認資料後重試')
  } finally {
    isSaving.value = false
  }
}

const cancel = () => {
  router.push({ name: 'app.operations.maintenance' })
}

onMounted(async () => {
  try {
    const [sysPerms] = await Promise.all([
      operationsStore.fetchSystemPermissions(),
      isEdit.value ? operationsStore.fetchRole(route.params.roleId) : Promise.resolve(null),
    ])
    systemPermissions.value = sysPerms

    if (isEdit.value) {
      const detail = await operationsStore.fetchRole(route.params.roleId)
      if (detail) {
        form.value.name   = detail.roleName
        form.value.status = detail.roleStatus
        form.value.rolePermissions = (detail.permissions || []).flatMap(cat =>
          cat.permissions.map(p => ({ permissionId: p.permissionId, mode: p.mode }))
        )
      }
    }
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="role-form-view">
    <!-- 麵包屑 -->
    <nav class="breadcrumb">
      <span class="link" @click="router.push('/operations')">營運後台</span>
      <span class="sep">›</span>
      <span class="link" @click="cancel">營運權限</span>
      <span class="sep">›</span>
      <span class="current">{{ isEdit ? '編輯權限角色' : '新增權限角色' }}</span>
    </nav>

    <h1 class="page-title">{{ isEdit ? '編輯權限角色' : '新增權限角色' }}</h1>

    <div v-if="isLoading" class="loading">載入中...</div>

    <template v-else>
      <div class="form-card">

        <!-- 角色名稱 -->
        <div class="form-section">
          <div class="form-field">
            <label class="form-label">角色名稱 <span class="required">*</span></label>
            <input v-model="form.name" type="text" class="form-input" placeholder="請輸入角色名稱" style="max-width: 360px;" />
          </div>

          <!-- 狀態 -->
          <div class="form-field">
            <label class="form-label">狀態</label>
            <div class="radio-group">
              <label class="radio-item">
                <input type="radio" v-model="form.status" value="OPEN" /> 啟用
              </label>
              <label class="radio-item">
                <input type="radio" v-model="form.status" value="INVALID" /> 停用
              </label>
            </div>
          </div>
        </div>

        <!-- 權限設定 -->
        <div class="perm-section">
          <h2 class="section-title">權限設定</h2>
          <p class="section-desc">點擊 FULL / READONLY 來選擇該項目的權限模式，再次點擊相同模式則取消選取。</p>

          <div v-if="systemPermissions.length === 0" class="perm-empty">無可用權限資料</div>

          <div v-for="cat in systemPermissions" :key="cat.category" class="perm-category">
            <div class="cat-title">{{ cat.category }}</div>
            <div class="perm-list">
              <div v-for="perm in cat.permissions" :key="perm.id" class="perm-row">
                <span class="perm-name">{{ perm.name }}</span>
                <div class="mode-btns">
                  <button
                    v-for="mode in perm.mode"
                    :key="mode"
                    class="mode-btn"
                    :class="{ selected: isSelected(perm.id, mode), full: mode === 'FULL', readonly: mode === 'READONLY' }"
                    @click="togglePermission(perm, mode)"
                  >
                    {{ mode }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="form-actions">
        <button class="btn-cancel" @click="cancel">取消</button>
        <button class="btn-save" @click="save" :disabled="isSaving">
          {{ isSaving ? '儲存中...' : '儲存' }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.role-form-view {
  padding: 24px;
  background: #f3f4f6;
  min-height: 100%;
  font-family: 'Noto Sans TC', sans-serif;
}

.breadcrumb {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 4px;

  .sep { color: #d1d5db; }
  .current { color: #E8572A; }
  .link { cursor: pointer; &:hover { color: #374151; } }
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 24px;
}

.loading {
  text-align: center;
  padding: 60px;
  color: #9ca3af;
}

.form-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  margin-bottom: 16px;
}

.form-section {
  padding: 24px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  height: 40px;
  padding: 0 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  font-family: 'Noto Sans TC', sans-serif;
  outline: none;
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

// ── 權限設定 ──
.perm-section {
  padding: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px;
}

.section-desc {
  font-size: 12px;
  color: #9ca3af;
  margin: 0 0 20px;
}

.perm-empty {
  text-align: center;
  color: #9ca3af;
  padding: 24px 0;
}

.perm-category {
  margin-bottom: 20px;
}

.cat-title {
  font-size: 13px;
  font-weight: 700;
  color: #E8572A;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f3f4f6;
}

.perm-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.perm-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 8px;
  background: #f9fafb;
}

.perm-name {
  font-size: 14px;
  color: #374151;
}

.mode-btns {
  display: flex;
  gap: 6px;
}

.mode-btn {
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: 'Noto Sans TC', sans-serif;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #6b7280;

  &:hover { border-color: #9ca3af; }

  &.selected.full {
    background: #E8572A;
    border-color: #E8572A;
    color: #fff;
  }

  &.selected.readonly {
    background: #3b82f6;
    border-color: #3b82f6;
    color: #fff;
  }
}

// ── 操作按鈕 ──
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  padding: 9px 24px;
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
  padding: 9px 28px;
  border: none;
  border-radius: 8px;
  background: #E8572A;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Noto Sans TC', sans-serif;
  transition: background 0.15s;
  &:hover:not(:disabled) { background: #d04a20; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}
</style>

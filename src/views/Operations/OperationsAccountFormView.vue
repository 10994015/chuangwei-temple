<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOperationsStore } from '@/stores/operations'

const router = useRouter()
const route  = useRoute()
const operationsStore = useOperationsStore()

const isEdit    = computed(() => !!route.params.userId)
const isLoading = ref(true)
const isSaving  = ref(false)

// 新增用欄位
const createForm = ref({
  credential: '',
  email:      '',
  name:       '',
  roleId:     '',
})

// 編輯用欄位（只有 name / status）
const editForm = ref({
  name:   '',
  status: 'OPEN',
})

// 角色清單
const roleOptions = ref([])

const cancel = () => router.push({ name: 'app.operations.maintenance', query: { tab: 'account' } })

const save = async () => {
  if (isEdit.value) {
    if (!editForm.value.name.trim()) { alert('請填寫姓名'); return }
  } else {
    if (!createForm.value.credential.trim()) { alert('請填寫帳號'); return }
    if (!createForm.value.email.trim())      { alert('請填寫信箱'); return }
    if (!createForm.value.name.trim())       { alert('請填寫姓名'); return }
  }

  isSaving.value = true
  try {
    if (isEdit.value) {
      await operationsStore.updateOperationUser(route.params.userId, {
        name:   editForm.value.name.trim(),
        status: editForm.value.status,
      })
      alert('帳號編輯成功')
    } else {
      await operationsStore.createOperationUser({
        credential: createForm.value.credential.trim(),
        email:      createForm.value.email.trim(),
        name:       createForm.value.name.trim(),
        roleId:     createForm.value.roleId || undefined,
      })
      alert('帳號新增成功')
    }
    router.push({ name: 'app.operations.maintenance', query: { tab: 'account' } })
  } catch (err) {
    console.error('儲存失敗:', err)
    alert('儲存失敗，請確認資料後重試')
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  try {
    // 撈角色清單（tenantId = null → tid = 'null'）
    roleOptions.value = await operationsStore.fetchTenantPermissionRoles()

    // 編輯時撈現有資料
    if (isEdit.value) {
      const users = operationsStore.operationUsers
      const found = users.find(u => u.id === route.params.userId)
      if (found) {
        editForm.value.name   = found.name
        editForm.value.status = found.status
      }
    }
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="account-form-view">
    <nav class="breadcrumb">
      <span class="link" @click="router.push('/operations')">營運後台</span>
      <span class="sep">›</span>
      <span class="link" @click="cancel">營運權限</span>
      <span class="sep">›</span>
      <span class="current">{{ isEdit ? '編輯帳號' : '新增帳號' }}</span>
    </nav>

    <div class="back-row">
      <button class="btn-back" @click="cancel">
        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" /></svg>
        返回
      </button>
    </div>
    <h1 class="page-title">{{ isEdit ? '編輯帳號' : '新增帳號' }}</h1>

    <div v-if="isLoading" class="loading">載入中...</div>

    <template v-else>
      <div class="form-card">

        <!-- ── 新增表單 ── -->
        <template v-if="!isEdit">
          <div class="form-field">
            <label class="form-label">帳號 <span class="required">*</span></label>
            <input v-model="createForm.credential" type="text" class="form-input" placeholder="請輸入帳號" />
          </div>
          <div class="form-field">
            <label class="form-label">信箱 <span class="required">*</span></label>
            <input v-model="createForm.email" type="email" class="form-input" placeholder="請輸入信箱" />
            <p class="form-hint">新增成功後系統將發送通知信至此信箱</p>
          </div>
          <div class="form-field">
            <label class="form-label">姓名 <span class="required">*</span></label>
            <input v-model="createForm.name" type="text" class="form-input" placeholder="請輸入姓名" />
          </div>
          <div class="form-field">
            <label class="form-label">角色</label>
            <select v-model="createForm.roleId" class="form-select">
              <option value="">請選擇角色（選填）</option>
              <option v-for="role in roleOptions" :key="role.roleId" :value="role.roleId">
                {{ role.roleName }}
              </option>
            </select>
          </div>
        </template>

        <!-- ── 編輯表單 ── -->
        <template v-else>
          <div class="form-field">
            <label class="form-label">姓名 <span class="required">*</span></label>
            <input v-model="editForm.name" type="text" class="form-input" placeholder="請輸入姓名" />
          </div>
          <div class="form-field">
            <label class="form-label">狀態</label>
            <div class="radio-group">
              <label class="radio-item">
                <input type="radio" v-model="editForm.status" value="OPEN" /> 啟用
              </label>
              <label class="radio-item">
                <input type="radio" v-model="editForm.status" value="INVALID" /> 停用
              </label>
              <label class="radio-item">
                <input type="radio" v-model="editForm.status" value="LOCK" /> 封鎖
              </label>
            </div>
          </div>
        </template>
      </div>

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
.account-form-view {
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

.back-row {
  margin-bottom: 12px;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  font-family: 'Noto Sans TC', sans-serif;
  &:hover { background: #f9fafb; }
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
  padding: 28px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 560px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
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

.form-select {
  height: 40px;
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

.form-hint {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
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

.form-actions {
  display: flex;
  gap: 10px;
  max-width: 560px;
  justify-content: flex-end;
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

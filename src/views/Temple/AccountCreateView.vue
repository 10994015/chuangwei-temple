<template>
  <div class="account-create">
    <!-- 麵包屑 -->
    <AppBreadcrumb :items="breadcrumbs" />

    <!-- 返回 -->
    <button class="back-btn" @click="handleBack">← 返回上一頁</button>

    <!-- 標題 -->
    <h1 class="page-title">{{ isEditMode ? '編輯帳號' : '新增帳號' }}</h1>

    <!-- 表單卡片 -->
    <div class="main-card">
      <!-- 角色 -->
      <div class="form-group">
        <label class="form-label">角色 <span class="required">*</span></label>
        <div class="select-wrap">
          <select
            v-model="form.role"
            class="form-input form-select"
            :class="{ 'input-error': errors.role }"
          >
            <option value="">請選擇角色</option>
            <option v-for="r in roleOptions" :key="r.id" :value="r.id">{{ r.name }}</option>
          </select>
        </div>
        <p v-if="errors.role" class="error-msg">{{ errors.role }}</p>
      </div>

      <!-- 姓名 -->
      <div class="form-group">
        <label class="form-label">姓名 <span class="required">*</span></label>
        <input
          v-model="form.name"
          type="text"
          class="form-input"
          :class="{ 'input-error': errors.name, 'input-disabled': isEditMode }"
          :disabled="isEditMode"
          placeholder="請輸入姓名"
        />
        <p v-if="errors.name" class="error-msg">{{ errors.name }}</p>
      </div>

      <!-- 帳號 -->
      <div class="form-group">
        <label class="form-label">帳號 <span class="required">*</span></label>
        <input
          v-model="form.username"
          type="text"
          class="form-input"
          :class="{ 'input-error': errors.username, 'input-disabled': isEditMode }"
          :disabled="isEditMode"
          placeholder="請輸入帳號"
        />
        <p v-if="errors.username" class="error-msg">{{ errors.username }}</p>
      </div>

      <!-- Email -->
      <div class="form-group">
        <label class="form-label">Email <span class="required">*</span></label>
        <input
          v-model="form.email"
          type="email"
          class="form-input"
          :class="{ 'input-error': errors.email, 'input-disabled': isEditMode }"
          :disabled="isEditMode"
          placeholder="example@temple.com"
        />
        <p v-if="errors.email" class="error-msg">{{ errors.email }}</p>
      </div>

      <!-- 底部操作 -->
      <div class="card-actions">
        <button class="btn-primary" @click="handleSubmit" :disabled="isSubmitting">
          <span v-if="isSubmitting">{{ isEditMode ? '儲存中...' : '建立中...' }}</span>
          <span v-else>{{ isEditMode ? '確認儲存' : '確認新增' }}</span>
        </button>
        <button class="btn-secondary" @click="handleBack">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAccountStore } from '@/stores/account'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'

const router       = useRouter()
const route        = useRoute()
const accountStore = useAccountStore()
const templeId     = route.params.templeId
const userId       = route.params.userId   // 有值代表編輯模式

const isEditMode   = computed(() => !!userId)
const isSubmitting = ref(false)

const roleOptions = computed(() =>
  accountStore.permissionRoles.map(r => ({ id: r.roleId, name: r.roleName }))
)

onMounted(async () => {
  await accountStore.fetchPermissionRoles(templeId)
  if (isEditMode.value) {
    const data = await accountStore.fetchAccountById(templeId, userId)
    if (data) {
      form.role     = data.roleId       || ''
      form.name     = data.name         || ''
      form.username = data.credential   || ''
      form.email    = data.email        || ''
    }
  }
})

const form = reactive({
  role:     '',
  name:     '',
  username: '',
  email:    '',
})

const errors = reactive({
  role:     '',
  name:     '',
  username: '',
  email:    '',
})

const validate = () => {
  let valid = true
  errors.role     = ''
  errors.name     = ''
  errors.username = ''
  errors.email    = ''

  if (!form.role)          { errors.role     = '請選擇角色';           valid = false }
  if (!form.name.trim())   { errors.name     = '請輸入姓名';           valid = false }
  if (!form.username.trim()) { errors.username = '請輸入帳號';         valid = false }
  if (!form.email.trim())  { errors.email    = '請輸入 Email';         valid = false }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Email 格式不正確'
    valid = false
  }

  return valid
}

const handleSubmit = async () => {
  if (!validate()) return

  isSubmitting.value = true
  try {
    if (isEditMode.value) {
      const result = await accountStore.updateAccountPermissionRole(templeId, userId, { roleId: form.role })
      if (result.success) {
        alert('帳號角色已更新')
        handleBack()
      } else {
        alert(result.error || '更新失敗，請再試一次')
      }
    } else {
      const payload = {
        credential: form.username,
        name:       form.name,
        email:      form.email,
        roleId:     form.role,
      }
      const result = await accountStore.createAccount(templeId, payload)
      if (result.success) {
        alert('帳號已建立')
        handleBack()
      } else {
        alert(result.error || '新增帳號失敗，請再試一次')
      }
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleBack = () => {
  router.push({
    name: 'app.temple.account-management',
    params: { templeId: route.params.templeId }
  })
}

const breadcrumbs = computed(() => [
  { text: '後台管理' },
  { text: '帳號管理', onClick: handleBack },
  { text: isEditMode.value ? '編輯帳號' : '新增帳號' },
])
</script>

<style scoped>
.account-create {
  padding: 24px 32px 80px;
  min-height: 100%;
  background: #F3F4F6;
}

/* 返回 */
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
  margin: 0 0 6px 0;
}
.page-subtitle {
  font-size: 13px;
  color: #E8572A;
  margin: 0 0 24px 0;
}

/* 主體卡片 */
.main-card {
  background: #fff;
  border-radius: 14px;
  padding: 32px 36px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  max-width: 100%;
}

/* 表單 */
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
  padding: 11px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #fff;
}
.form-input:focus {
  outline: none;
  border-color: #E8572A;
  box-shadow: 0 0 0 3px rgba(232,87,42,0.1);
}
.form-input.input-error    { border-color: #e53e3e; }
.form-input.input-disabled { background: #f5f5f5; color: #888; cursor: not-allowed; }

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  cursor: pointer;
}
.form-select option[value=""] { color: #aaa; }

.error-msg { font-size: 12px; color: #e53e3e; margin-top: 5px; }

/* 卡片底部操作 */
.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px solid #f0f0f0;
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
  transition: background 0.2s, transform 0.1s;
}
.btn-primary:hover:not(:disabled) { background: #d14a1f; transform: translateY(-1px); }
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
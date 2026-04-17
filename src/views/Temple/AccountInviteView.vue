<template>
  <div class="account-invite">
    <AppBreadcrumb :items="breadcrumbs" />
    <button class="back-btn" @click="handleBack">← 返回上一頁</button>
    <h1 class="page-title">權限指派</h1>

    <div class="main-card">
      <p class="card-desc">輸入帳號名稱搜尋系統帳號，選取後送出邀請加入此宮廟。</p>

      <!-- 搜尋輸入 -->
      <div class="form-group">
        <label class="form-label">搜尋帳號 <span class="required">*</span></label>
        <div class="search-wrap" ref="searchWrapRef">
          <input
            v-model="keyword"
            type="text"
            class="form-input"
            placeholder="請輸入帳號（credential）"
            autocomplete="off"
            @input="onInput"
            @focus="showDropdown = searchResults.length > 0"
            @keydown.esc="showDropdown = false"
          />
          <div v-if="isSearching" class="dropdown-loading">搜尋中...</div>
          <ul v-else-if="showDropdown && searchResults.length > 0" class="dropdown">
            <li
              v-for="user in searchResults"
              :key="user.id"
              class="dropdown-item"
              @mousedown.prevent="selectUser(user)"
            >
              <span class="item-credential">{{ user.credential }}</span>
              <span class="item-name">{{ user.name }}</span>
              <span class="item-email">{{ user.email }}</span>
            </li>
          </ul>
          <div v-else-if="showDropdown && searched && searchResults.length === 0" class="dropdown-empty">
            查無符合帳號
          </div>
        </div>
        <p v-if="errors.credential" class="error-msg">{{ errors.credential }}</p>
      </div>

      <!-- 已選帳號預覽 -->
      <div v-if="selectedUser" class="selected-card">
        <div class="selected-label">已選取帳號</div>
        <div class="selected-row">
          <span class="sel-credential">{{ selectedUser.credential }}</span>
          <span class="sel-name">{{ selectedUser.name }}</span>
          <span class="sel-email">{{ selectedUser.email }}</span>
          <button class="sel-clear" @click="clearSelection">✕</button>
        </div>
      </div>

      <!-- 操作 -->
      <div class="card-actions">
        <button class="btn-primary" @click="handleSubmit" :disabled="isSubmitting">
          <span v-if="isSubmitting">送出中...</span>
          <span v-else>送出邀請</span>
        </button>
        <button class="btn-secondary" @click="handleBack">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'
import { useAccountStore } from '@/stores/account'

const router       = useRouter()
const route        = useRoute()
const accountStore = useAccountStore()
const templeId     = route.params.templeId

const keyword       = ref('')
const searchResults = ref([])
const selectedUser  = ref(null)
const isSearching   = ref(false)
const isSubmitting  = ref(false)
const showDropdown  = ref(false)
const searched      = ref(false)
const errors        = reactive({ credential: '' })

let debounceTimer = null

const onInput = () => {
  selectedUser.value = null
  searched.value = false
  clearTimeout(debounceTimer)
  if (!keyword.value.trim()) {
    searchResults.value = []
    showDropdown.value = false
    return
  }
  debounceTimer = setTimeout(async () => {
    isSearching.value = true
    showDropdown.value = true
    searchResults.value = await accountStore.searchAllAccounts(templeId, keyword.value.trim())
    searched.value = true
    isSearching.value = false
  }, 400)
}

const selectUser = (user) => {
  selectedUser.value = user
  keyword.value = user.credential
  showDropdown.value = false
}

const clearSelection = () => {
  selectedUser.value = null
  keyword.value = ''
  searchResults.value = []
  searched.value = false
}

const handleSubmit = async () => {
  errors.credential = ''
  if (!selectedUser.value) {
    errors.credential = '請從下拉清單選取一個帳號'
    return
  }
  isSubmitting.value = true
  try {
    const result = await accountStore.inviteExistingUser(templeId, {
      credential: selectedUser.value.credential,
    })
    if (result.success) {
      alert(`邀請已送出！系統將寄送邀請信至「${selectedUser.value.email}」`)
      handleBack()
    } else {
      alert(result.error || '送出邀請失敗，請再試一次')
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleBack = () => {
  router.push({
    name: 'app.temple.account-management',
    params: { templeId },
  })
}

const breadcrumbs = computed(() => [
  { text: '後台管理' },
  { text: '帳號管理', onClick: handleBack },
  { text: '權限指派' },
])
</script>

<style scoped>
.account-invite {
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
  max-width: 600px;
}

.card-desc {
  font-size: 13px;
  color: #888;
  margin: 0 0 24px;
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

.search-wrap { position: relative; }

.form-input {
  width: 100%;
  padding: 11px 16px;
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

.dropdown, .dropdown-loading, .dropdown-empty {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  z-index: 100;
}

.dropdown {
  list-style: none;
  margin: 0;
  padding: 4px 0;
  max-height: 240px;
  overflow-y: auto;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 13px;
}
.dropdown-item:hover { background: #fff5f2; }

.item-credential { font-weight: 600; color: #1a1a1a; min-width: 100px; }
.item-name { color: #555; }
.item-email { color: #aaa; margin-left: auto; font-size: 12px; }

.dropdown-loading, .dropdown-empty {
  padding: 14px 16px;
  font-size: 13px;
  color: #aaa;
  text-align: center;
}

.error-msg { font-size: 12px; color: #e53e3e; margin-top: 5px; }

/* 已選帳號 */
.selected-card {
  background: #fff8f5;
  border: 1px solid #f9c4b0;
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 24px;
}

.selected-label {
  font-size: 12px;
  color: #E8572A;
  font-weight: 600;
  margin-bottom: 8px;
}

.selected-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.sel-credential { font-weight: 600; color: #1a1a1a; }
.sel-name  { color: #555; }
.sel-email { color: #aaa; font-size: 13px; margin-left: auto; }

.sel-clear {
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  font-size: 14px;
  padding: 2px 6px;
  border-radius: 4px;
  transition: color 0.15s;
}
.sel-clear:hover { color: #e53e3e; }

/* 操作 */
.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
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

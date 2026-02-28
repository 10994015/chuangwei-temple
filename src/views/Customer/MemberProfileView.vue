<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 麵包屑
const breadcrumbs = computed(() => {
  return [
    { label: '香客帳號管理', path: '/customer-account' },
    { label: '會員資料', path: null }
  ]
})

// 個人資訊（模擬資料，實際應從 API 取得）
const profile = ref({
  name: '陳大明',
  gender: '男',
  birthday: '1990/05/20',
  lunarBirthday: '庚午(馬) 79 年四月廿六日',
  idNumber: 'F12*******',
  phone: '0912-345-678',
  email: 'chen@example.com',
  address: '台北市信義區信義路五段 7 號'
})

// 家人資料
const familyMembers = ref([
  {
    id: 1,
    name: '王小明',
    gender: '男',
    birthday: '1985/03/15',
    lunarBirthday: '乙丑(牛) 74 年正月廿五日',
    address: '台北市中正區中山路 100 號',
    email: 'wang@example.com',
    phone: '0912-345-678'
  }
])

// 公司資料
const companies = ref([
  {
    id: 1,
    name: '宮掌櫃科技有限公司',
    taxId: '12345678',
    phone: '02-1234-5678',
    address: '台北市信義區信義路五段 7 號',
    contactName: '陳大明',
    contactAddress: '台北市信義區信義路五段 7 號'
  }
])

// 編輯狀態
const showEditProfile = ref(false)
const showAddFamily = ref(false)
const showAddCompany = ref(false)
const editingFamilyId = ref(null)
const editingCompanyId = ref(null)

// 處理編輯個人資料
const handleEditProfile = () => {
  showEditProfile.value = true
}

// 處理新增家人
const handleAddFamily = () => {
  showAddFamily.value = true
}

// 處理刪除家人
const handleDeleteFamily = (id) => {
  if (confirm('確定要刪除此家人資料嗎？')) {
    familyMembers.value = familyMembers.value.filter(m => m.id !== id)
  }
}

// 處理編輯家人
const handleEditFamily = (id) => {
  editingFamilyId.value = id
}

// 處理新增公司
const handleAddCompany = () => {
  showAddCompany.value = true
}

// 處理刪除公司
const handleDeleteCompany = (id) => {
  if (confirm('確定要刪除此公司資料嗎？')) {
    companies.value = companies.value.filter(c => c.id !== id)
  }
}

// 處理修改密碼
const handleChangePassword = () => {
  alert('修改密碼功能')
}
</script>

<template>
  <div class="member-profile">
    <!-- 麵包屑 -->
    <div class="breadcrumb">
      <span
        v-for="(crumb, index) in breadcrumbs"
        :key="index"
        class="breadcrumb-item"
      >
        <span
          v-if="crumb.path"
          class="breadcrumb-link"
          @click="$router.push(crumb.path)"
        >{{ crumb.label }}</span>
        <span v-else class="breadcrumb-current">{{ crumb.label }}</span>
        <span v-if="index < breadcrumbs.length - 1" class="breadcrumb-sep">›</span>
      </span>
    </div>

    <!-- 個人資訊卡片 -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">個人資訊</h2>
        <button class="btn-edit" @click="handleEditProfile">
          <svg viewBox="0 0 20 20" fill="currentColor" class="edit-icon">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          編輯資料
        </button>
      </div>

      <div class="profile-grid">
        <div class="profile-field">
          <div class="field-label">姓名</div>
          <div class="field-value">{{ profile.name }}</div>
        </div>
        <div class="profile-field">
          <div class="field-label">性別</div>
          <div class="field-value">{{ profile.gender }}</div>
        </div>
        <div class="profile-field">
          <div class="field-label">生日</div>
          <div class="field-value">
            {{ profile.birthday }}
            <div class="lunar-date">{{ profile.lunarBirthday }}</div>
          </div>
        </div>
        <div class="profile-field">
          <div class="field-label">身分證字號</div>
          <div class="field-value">{{ profile.idNumber }}</div>
        </div>
        <div class="profile-field">
          <div class="field-label">手機</div>
          <div class="field-value">{{ profile.phone }}</div>
        </div>
        <div class="profile-field">
          <div class="field-label">Email</div>
          <div class="field-value">{{ profile.email }}</div>
        </div>
        <div class="profile-field full-width">
          <div class="field-label">地址</div>
          <div class="field-value">{{ profile.address }}</div>
        </div>
      </div>
    </div>

    <!-- 家人資訊卡片 -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">家人資訊</h2>
        <button class="btn-add" @click="handleAddFamily">
          <svg viewBox="0 0 20 20" fill="currentColor" class="add-icon">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          新增家人
        </button>
      </div>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>姓名</th>
              <th>性別</th>
              <th>生日</th>
              <th>地址</th>
              <th>信箱</th>
              <th>電話</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in familyMembers" :key="member.id">
              <td>{{ member.name }}</td>
              <td>{{ member.gender }}</td>
              <td>
                {{ member.birthday }}
                <div class="lunar-date">{{ member.lunarBirthday }}</div>
              </td>
              <td>{{ member.address }}</td>
              <td>{{ member.email }}</td>
              <td>{{ member.phone }}</td>
              <td>
                <div class="action-btns">
                  <button class="icon-btn" @click="handleEditFamily(member.id)">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button class="icon-btn danger" @click="handleDeleteFamily(member.id)">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="familyMembers.length === 0">
              <td colspan="7" class="empty-row">尚無家人資料</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 公司資訊卡片 -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">公司資訊</h2>
        <button class="btn-add" @click="handleAddCompany">
          <svg viewBox="0 0 20 20" fill="currentColor" class="add-icon">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          新增公司
        </button>
      </div>

      <p class="card-note">
        僅限公司負責人才可使用公司名義報名宮廟服務為公司祈福，一般職員無需填寫
      </p>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>公司名稱</th>
              <th>統一編號</th>
              <th>公司電話</th>
              <th>公司地址</th>
              <th>負責人姓名</th>
              <th>負責人地址</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="company in companies" :key="company.id">
              <td>{{ company.name }}</td>
              <td>{{ company.taxId }}</td>
              <td>{{ company.phone }}</td>
              <td>{{ company.address }}</td>
              <td>{{ company.contactName }}</td>
              <td>{{ company.contactAddress }}</td>
              <td>
                <div class="action-btns">
                  <button class="icon-btn" @click="editingCompanyId = company.id">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button class="icon-btn danger" @click="handleDeleteCompany(company.id)">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="companies.length === 0">
              <td colspan="7" class="empty-row">尚無公司資料</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 隱私與安全 -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">隱私與安全</h2>
      </div>
      <div class="card-body-pad">
        <button class="btn-primary" @click="handleChangePassword">
          修改密碼
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.member-profile {
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  background: #f3f4f6;
  min-height: 100%;
}

// ========== 麵包屑 ==========
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.breadcrumb-link {
  color: #6b7280;
  cursor: pointer;

  &:hover {
    color: #E8572A;
  }
}

.breadcrumb-current {
  color: #E8572A;
  font-weight: 500;
}

.breadcrumb-sep {
  color: #9ca3af;
  font-size: 16px;
}

// ========== 卡片 ==========
.card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.card-note {
  padding: 0 24px;
  margin: 12px 0 0 0;
  font-size: 13px;
  color: #E8572A;
}

.card-body-pad {
  padding: 20px 24px;
}

// ========== 按鈕 ==========
.btn-edit {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  background: transparent;
  border: 1.5px solid #E8572A;
  border-radius: 20px;
  color: #E8572A;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  transition: all 0.2s;

  &:hover {
    background: #fff7f3;
  }

  .edit-icon {
    width: 14px;
    height: 14px;
  }
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  background: transparent;
  border: 1.5px solid #E8572A;
  border-radius: 20px;
  color: #E8572A;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  transition: all 0.2s;

  &:hover {
    background: #fff7f3;
  }

  .add-icon {
    width: 16px;
    height: 16px;
  }
}

.btn-primary {
  padding: 8px 20px;
  background: #E8572A;
  border: none;
  border-radius: 20px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  transition: background 0.2s;

  &:hover {
    background: #d94b1f;
  }
}

// ========== 個人資訊 ==========
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  padding: 8px 0;
}

.profile-field {
  padding: 16px 24px;

  &.full-width {
    grid-column: 1 / -1;
  }
}

.field-label {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 6px;
}

.field-value {
  font-size: 15px;
  color: #1f2937;
  font-weight: 400;
}

.lunar-date {
  font-size: 13px;
  color: #E8572A;
  margin-top: 4px;
}

// ========== 表格 ==========
.table-wrapper {
  overflow-x: auto;
  padding: 16px 0 8px 0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th {
    text-align: left;
    padding: 8px 16px;
    color: #6b7280;
    font-weight: 500;
    font-size: 13px;
    white-space: nowrap;
  }

  td {
    padding: 12px 16px;
    color: #1f2937;
    border-top: 1px solid #f3f4f6;
    vertical-align: top;
  }

  tbody tr:hover {
    background: #fafafa;
  }
}

.empty-row {
  text-align: center;
  color: #9ca3af;
  padding: 24px !important;
}

// ========== 操作按鈕 ==========
.action-btns {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #9ca3af;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    color: #374151;
  }

  &.danger {
    &:hover {
      color: #ef4444;
    }
  }
}

@media (max-width: 768px) {
  .member-profile {
    padding: 16px;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
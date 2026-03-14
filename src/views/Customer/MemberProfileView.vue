<template>
  <div class="member-profile-page">
    <!-- 麵包屑 -->
    <div class="breadcrumb">
      <span class="bc-root">香客帳號管理</span>
      <span class="bc-sep">›</span>
      <span class="bc-current">會員資料</span>
    </div>

    <!-- ═══════════════════════════════
         個人資訊
    ═══════════════════════════════ -->
    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">個人資訊</h2>
        <!-- 閱讀模式：顯示編輯資料按鈕 -->
        <div class="header-actions" v-if="!personalEditing">
          <button class="btn-edit-outline" @click="startEditPersonal">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style="flex-shrink:0">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
            編輯資料
          </button>
        </div>
        <!-- 編輯模式：顯示儲存/取消 -->
        <div class="header-actions" v-else>
          <button class="btn-primary" @click="savePersonal">儲存變更</button>
          <button class="btn-cancel-outline" @click="cancelPersonal">取消變更</button>
        </div>
      </div>

      <!-- 閱讀模式 -->
      <div class="view-grid" v-if="!personalEditing">
        <div class="view-field">
          <div class="view-label">姓名</div>
          <div class="view-value">{{ personal.name }}</div>
        </div>
        <div class="view-field">
          <div class="view-label">性別</div>
          <div class="view-value">{{ personal.gender }}</div>
        </div>
        <div class="view-field">
          <div class="view-label">生日</div>
          <div class="view-value">
            {{ personal.birthday }}
            <div v-if="personal.birthday" class="lunar-text">{{ getLunar(personal.birthday) }}</div>
          </div>
        </div>
        <div class="view-field">
          <div class="view-label">身分證字號</div>
          <div class="view-value">{{ personal.idNumber }}</div>
        </div>
        <div class="view-field">
          <div class="view-label">手機</div>
          <div class="view-value">{{ personal.phone }}</div>
        </div>
        <div class="view-field">
          <div class="view-label">Email</div>
          <div class="view-value">{{ personal.email }}</div>
        </div>
        <div class="view-field full-width">
          <div class="view-label">地址</div>
          <div class="view-value">{{ personal.address }}</div>
        </div>
      </div>

      <!-- 編輯模式 -->
      <div class="form-grid" v-else>
        <div class="form-group">
          <label class="form-label">姓名</label>
          <input v-model="personalDraft.name" class="form-input" placeholder="請輸入姓名" />
        </div>
        <div class="form-group">
          <label class="form-label">性別</label>
          <div class="select-wrap">
            <select v-model="personalDraft.gender" class="form-select">
              <option value="男">男</option>
              <option value="女">女</option>
              <option value="其他">其他</option>
            </select>
            <span class="select-arrow">▾</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">生日</label>
          <input v-model="personalDraft.birthday" class="form-input" placeholder="年/月/日" />
          <div v-if="personalDraft.birthday" class="lunar-text">{{ getLunar(personalDraft.birthday) }}</div>
        </div>
        <div class="form-group">
          <label class="form-label">身分證字號</label>
          <input v-model="personalDraft.idNumber" class="form-input" placeholder="請輸入身分證字號" />
        </div>
        <div class="form-group">
          <label class="form-label">手機</label>
          <input v-model="personalDraft.phone" class="form-input" placeholder="請輸入手機" />
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input v-model="personalDraft.email" class="form-input" placeholder="請輸入 Email" />
        </div>
        <div class="form-group full-width">
          <label class="form-label">地址</label>
          <input v-model="personalDraft.address" class="form-input" placeholder="請輸入地址" />
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════
         家人資訊
    ═══════════════════════════════ -->
    <div class="section-card">
      <h2 class="section-title">家人資訊</h2>

      <!-- 新增/編輯表單 -->
      <div class="sub-form" v-if="familyFormVisible">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">姓名</label>
            <input v-model="familyForm.name" class="form-input" placeholder="請輸入姓名" />
          </div>
          <div class="form-group">
            <label class="form-label">性別</label>
            <div class="select-wrap">
              <select v-model="familyForm.gender" class="form-select">
                <option value="男">男</option>
                <option value="女">女</option>
                <option value="其他">其他</option>
              </select>
              <span class="select-arrow">▾</span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">生日</label>
            <input v-model="familyForm.birthday" class="form-input" placeholder="年 /月/日" />
            <div v-if="familyForm.birthday" class="lunar-text">{{ getLunar(familyForm.birthday) }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">電話</label>
            <input v-model="familyForm.phone" class="form-input" placeholder="請輸入電話" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="familyForm.email" class="form-input" placeholder="請輸入 Email" />
          </div>
          <div class="form-group">
            <label class="form-label">地址</label>
            <input v-model="familyForm.address" class="form-input" placeholder="請輸入地址" />
          </div>
        </div>
        <div class="sub-form-actions">
          <button class="btn-primary" @click="saveFamily">
            {{ familyEditIndex !== null ? '儲存變更' : '新增' }}
          </button>
          <button class="btn-cancel-outline" @click="cancelFamily">
            {{ familyEditIndex !== null ? '取消變更' : '取消新增' }}
          </button>
        </div>
      </div>

      <!-- 新增按鈕（表單隱藏時顯示） -->
      <button v-if="!familyFormVisible" class="btn-add-row" @click="openFamilyAdd">
        + 新增家人
      </button>

      <!-- 列表 -->
      <table class="data-table" v-if="familyList.length > 0">
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
          <tr v-for="(item, idx) in familyList" :key="idx">
            <td>{{ item.name }}</td>
            <td>{{ item.gender }}</td>
            <td>
              <div>{{ item.birthday }}</div>
              <div class="lunar-text-sm">{{ getLunar(item.birthday) }}</div>
            </td>
            <td>{{ item.address }}</td>
            <td>{{ item.email }}</td>
            <td>{{ item.phone }}</td>
            <td class="ops-cell">
              <button class="op-btn" @click="editFamily(idx)" title="編輯">✏</button>
              <button class="op-btn op-btn-del" @click="deleteFamily(idx)" title="刪除">🗑</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ═══════════════════════════════
         公司資訊
    ═══════════════════════════════ -->
    <div class="section-card">
      <h2 class="section-title">公司資訊</h2>
      <p class="section-hint">僅限公司負責人才可使用公司名義報名宮廟服務為公司祈福，一般職員無需填寫</p>

      <!-- 新增/編輯表單 -->
      <div class="sub-form" v-if="companyFormVisible">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">公司名稱</label>
            <input v-model="companyForm.name" class="form-input" placeholder="請輸入公司名稱" />
          </div>
          <div class="form-group">
            <label class="form-label">統一編號</label>
            <input v-model="companyForm.taxId" class="form-input" placeholder="請輸入統一編號" />
          </div>
          <div class="form-group">
            <label class="form-label">公司電話</label>
            <input v-model="companyForm.phone" class="form-input" placeholder="請輸入公司電話" />
          </div>
          <div class="form-group">
            <label class="form-label">公司地址</label>
            <input v-model="companyForm.address" class="form-input" placeholder="請輸入公司地址" />
          </div>
          <div class="form-group">
            <label class="form-label">負責人姓名</label>
            <input v-model="companyForm.ownerName" class="form-input" placeholder="請輸入負責人姓名" />
          </div>
          <div class="form-group">
            <label class="form-label">負責人地址</label>
            <input v-model="companyForm.ownerAddress" class="form-input" placeholder="請輸入負責人地址" />
          </div>
        </div>
        <div class="sub-form-actions">
          <button class="btn-primary" @click="saveCompany">
            {{ companyEditIndex !== null ? '儲存變更' : '新增' }}
          </button>
          <button class="btn-cancel-outline" @click="cancelCompany">
            {{ companyEditIndex !== null ? '取消變更' : '取消新增' }}
          </button>
        </div>
      </div>

      <!-- 新增按鈕 -->
      <button v-if="!companyFormVisible" class="btn-add-row" @click="openCompanyAdd">
        + 新增公司
      </button>

      <!-- 列表 -->
      <table class="data-table" v-if="companyList.length > 0">
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
          <tr v-for="(item, idx) in companyList" :key="idx">
            <td>{{ item.name }}</td>
            <td>{{ item.taxId }}</td>
            <td>{{ item.phone }}</td>
            <td>{{ item.address }}</td>
            <td>{{ item.ownerName }}</td>
            <td>{{ item.ownerAddress }}</td>
            <td class="ops-cell">
              <button class="op-btn" @click="editCompany(idx)" title="編輯">✏</button>
              <button class="op-btn op-btn-del" @click="deleteCompany(idx)" title="刪除">🗑</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// ── 個人資訊 ──
const personal = reactive({
  name: '陳大明',
  gender: '男',
  birthday: '1990/05/20',
  idNumber: 'F12*******',
  phone: '0912-345-678',
  email: 'chen@example.com',
  address: '台北市信義區信義路五段 7 號',
})

const personalEditing = ref(false)
const personalDraft = reactive({ ...personal })

const startEditPersonal = () => {
  Object.assign(personalDraft, personal)
  personalEditing.value = true
}
const savePersonal = () => {
  Object.assign(personal, personalDraft)
  personalEditing.value = false
  console.log('個人資訊儲存', personal)
}
const cancelPersonal = () => {
  personalEditing.value = false
}

// ── 農曆轉換（簡易示範，實際應引入農曆套件）──
const lunarSamples = {
  '1990/05/20': '庚午(馬) 79 年四月廿六日',
  '1985/03/15': '乙丑(牛) 74 年正月廿五日',
  '1984/05/27': '乙亥(豬) 84 年五月廿七日',
}
const getLunar = (dateStr) => {
  return lunarSamples[dateStr] || ''
}

// ── 家人資訊 ──
const familyList = ref([
  { name: '王小明', gender: '男', birthday: '1985/03/15', address: '台北市中正區中山路 100 號', email: 'wang@example.com', phone: '0912-345-678' },
])
const familyFormVisible = ref(false)
const familyEditIndex = ref(null)
const familyForm = reactive({ name: '', gender: '男', birthday: '', phone: '', email: '', address: '' })

const openFamilyAdd = () => {
  familyEditIndex.value = null
  Object.assign(familyForm, { name: '', gender: '男', birthday: '', phone: '', email: '', address: '' })
  familyFormVisible.value = true
}
const editFamily = (idx) => {
  familyEditIndex.value = idx
  Object.assign(familyForm, { ...familyList.value[idx] })
  familyFormVisible.value = true
}
const saveFamily = () => {
  if (familyEditIndex.value !== null) {
    Object.assign(familyList.value[familyEditIndex.value], { ...familyForm })
  } else {
    familyList.value.push({ ...familyForm })
  }
  familyFormVisible.value = false
  familyEditIndex.value = null
}
const cancelFamily = () => {
  familyFormVisible.value = false
  familyEditIndex.value = null
}
const deleteFamily = (idx) => {
  familyList.value.splice(idx, 1)
}

// ── 公司資訊 ──
const companyList = ref([
  { name: '宮掌櫃科技有限公司', taxId: '12345678', phone: '02-1234-5678', address: '台北市信義區信義路五段 7 號', ownerName: '陳大明', ownerAddress: '台北市信義區信義路五段 7 號' },
])
const companyFormVisible = ref(false)
const companyEditIndex = ref(null)
const companyForm = reactive({ name: '', taxId: '', phone: '', address: '', ownerName: '', ownerAddress: '' })

const openCompanyAdd = () => {
  companyEditIndex.value = null
  Object.assign(companyForm, { name: '', taxId: '', phone: '', address: '', ownerName: '', ownerAddress: '' })
  companyFormVisible.value = true
}
const editCompany = (idx) => {
  companyEditIndex.value = idx
  Object.assign(companyForm, { ...companyList.value[idx] })
  companyFormVisible.value = true
}
const saveCompany = () => {
  if (companyEditIndex.value !== null) {
    Object.assign(companyList.value[companyEditIndex.value], { ...companyForm })
  } else {
    companyList.value.push({ ...companyForm })
  }
  companyFormVisible.value = false
  companyEditIndex.value = null
}
const cancelCompany = () => {
  companyFormVisible.value = false
  companyEditIndex.value = null
}
const deleteCompany = (idx) => {
  companyList.value.splice(idx, 1)
}
</script>

<style scoped>
.member-profile-page {
  padding: 24px 32px 60px;
  min-height: 100%;
  background: #F3F4F6;
}

/* 麵包屑 */
.breadcrumb { font-size: 13px; color: #999; margin-bottom: 24px; }
.bc-sep { margin: 0 6px; }
.bc-current { color: #E8572A; font-weight: 500; }

/* 區塊卡片 */
.section-card {
  background: #fff;
  border-radius: 16px;
  padding: 28px 32px 32px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  margin-bottom: 24px;
}

/* 區塊標題列 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}
.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 20px;
}
.section-header .section-title { margin-bottom: 0; }

.section-hint {
  font-size: 13px;
  color: #E8572A;
  margin: -12px 0 20px;
}

/* 操作按鈕群 */
.header-actions { display: flex; gap: 10px; }

/* 閱讀模式 grid */
.view-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}
.view-field {
  padding: 16px 4px;
}
.view-field.full-width { grid-column: 1 / -1; }
.view-label { font-size: 13px; color: #aaa; margin-bottom: 6px; }
.view-value { font-size: 15px; color: #1a1a1a; }

/* 編輯資料按鈕（橘色 outline 圓角） */
.btn-edit-outline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: #fff;
  border: 1.5px solid #E8572A;
  border-radius: 50px;
  color: #E8572A;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}
.btn-edit-outline:hover { background: #fff3ef; }

/* 表單 grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 32px;
}
.form-group { display: flex; flex-direction: column; }
.form-group.full-width { grid-column: 1 / -1; }
.form-label { font-size: 12px; color: #aaa; margin-bottom: 6px; }

/* 輸入框 */
.form-input {
  padding: 11px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 50px;
  font-size: 14px;
  color: #333;
  background: #fff;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
  width: 100%;
}
.form-input:focus {
  border-color: #E8572A;
  box-shadow: 0 0 0 3px rgba(232,87,42,0.08);
}

/* Select */
.select-wrap { position: relative; }
.form-select {
  width: 100%;
  padding: 11px 40px 11px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 50px;
  font-size: 14px;
  color: #333;
  background: #fff;
  appearance: none;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.form-select:focus { border-color: #E8572A; }
.select-arrow {
  position: absolute;
  right: 16px; top: 50%;
  transform: translateY(-50%);
  color: #aaa; pointer-events: none; font-size: 12px;
}

/* 農曆文字 */
.lunar-text {
  font-size: 13px;
  color: #E8572A;
  margin-top: 6px;
  padding-left: 4px;
}
.lunar-text-sm {
  font-size: 12px;
  color: #E8572A;
  margin-top: 2px;
}

/* 按鈕 */
.btn-primary {
  padding: 9px 22px;
  background: #E8572A;
  color: #fff;
  border: none;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}
.btn-primary:hover { background: #d14a1f; }

.btn-cancel-outline {
  padding: 9px 22px;
  background: #fff;
  color: #555;
  border: 1px solid #ddd;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}
.btn-cancel-outline:hover { background: #f5f5f5; }

/* 子表單（家人/公司新增編輯） */
.sub-form {
  background: #f8f8f8;
  border-radius: 14px;
  padding: 24px 28px;
  margin-bottom: 24px;
}
.sub-form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

/* 新增按鈕（沒有表單時顯示） */
.btn-add-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: none;
  border: 1.5px dashed #d0d0d0;
  border-radius: 50px;
  color: #888;
  font-size: 13px;
  cursor: pointer;
  margin-bottom: 20px;
  transition: border-color 0.2s, color 0.2s;
}
.btn-add-row:hover { border-color: #E8572A; color: #E8572A; }

/* 資料 table */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  margin-top: 8px;
}
.data-table th {
  text-align: left;
  padding: 10px 12px;
  color: #888;
  font-weight: 500;
  font-size: 13px;
  border-bottom: 1px solid #f0f0f0;
}
.data-table td {
  padding: 14px 12px;
  color: #333;
  border-bottom: 1px solid #f8f8f8;
  vertical-align: top;
}
.data-table tbody tr:last-child td { border-bottom: none; }

/* 操作欄 */
.ops-cell {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}
.op-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 15px;
  padding: 4px;
  color: #aaa;
  transition: color 0.15s;
  line-height: 1;
}
.op-btn:hover { color: #E8572A; }
.op-btn-del:hover { color: #e53e3e; }

/* ========== RWD ========== */
@media (max-width: 768px) {
  .member-profile-page {
    padding: 16px 16px 40px;
  }

  .section-card {
    padding: 20px 18px 24px;
    border-radius: 12px;
  }

  .section-header {
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;
  }

  .section-header .section-title {
    margin-bottom: 0;
  }

  .view-grid {
    grid-template-columns: 1fr;
  }

  .view-field.full-width {
    grid-column: 1;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .form-group.full-width {
    grid-column: 1;
  }

  .sub-form {
    padding: 16px 14px;
  }

  /* 表格橫向捲動 */
  .data-table {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    white-space: nowrap;
  }

  .data-table th,
  .data-table td {
    padding: 10px 10px;
  }
}

@media (max-width: 480px) {
  .member-profile-page {
    padding: 12px 12px 32px;
  }

  .section-card {
    padding: 16px 14px 20px;
  }

  .header-actions {
    flex-wrap: wrap;
    gap: 8px;
  }

  .btn-primary,
  .btn-cancel-outline,
  .btn-edit-outline {
    padding: 8px 14px;
    font-size: 13px;
  }

  .sub-form-actions {
    flex-wrap: wrap;
  }
}
</style>
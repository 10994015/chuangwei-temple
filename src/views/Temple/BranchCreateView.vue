<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const templeId = route.params.templeId

// 模擬已有神尊清單（實際應從 API 取得）
const deityOptions = ref([
  { id: 1, name: '武財神' },
  { id: 2, name: '黑虎將軍' },
])

const form = ref({
  deityId: '',
  date: '',
  offerer: '',
  location: '',
  phone: '',
  address: '',
})

const goBack = () => {
  router.push({ name: 'app.temple.temple-info', params: { templeId } })
}

const handleSubmit = () => {
  if (!form.value.deityId || !form.value.offerer) {
    alert('請填寫必填欄位')
    return
  }
  alert('新增成功！')
  goBack()
}
</script>

<template>
  <div class="branch-create-view">
    <!-- 麵包屑 -->
    <div class="breadcrumb">
      <span class="bc-link">後台管理</span>
      <span class="bc-sep">›</span>
      <span class="bc-link" @click="goBack">宮廟資料管理</span>
      <span class="bc-sep">›</span>
      <span class="bc-current">新增分靈</span>
    </div>

    <!-- Tab 列 -->
    <div class="tab-bar">
      <button class="tab-btn" @click="goBack">基本資料</button>
      <button class="tab-btn" @click="goBack">神尊管理</button>
      <button class="tab-btn active">分靈管理</button>
      <button class="tab-btn" @click="goBack">資產管理</button>
    </div>

    <!-- 返回 -->
    <div class="back-link" @click="goBack">
      <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
      返回上一頁
    </div>

    <!-- 表單卡片 -->
    <div class="form-card">
      <h2 class="form-title">分靈資訊</h2>

      <div class="form-grid">
        <!-- 本廟分靈神尊 -->
        <div class="form-field">
          <label class="form-label">本廟分靈神尊 <em class="req">*</em></label>
          <div class="select-wrap">
            <select v-model="form.deityId" class="form-select">
              <option value="" disabled>請選擇神尊</option>
              <option v-for="d in deityOptions" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>
            <svg class="select-arrow" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
          </div>
        </div>

        <!-- 分靈日期 -->
        <div class="form-field">
          <label class="form-label">分靈日期</label>
          <input v-model="form.date" class="form-input" placeholder="年 /月/日" />
        </div>

        <!-- 恭奉者 -->
        <div class="form-field">
          <label class="form-label">恭奉者 <em class="req">*</em></label>
          <input v-model="form.offerer" class="form-input" placeholder="請輸入恭奉者" />
        </div>

        <!-- 恭奉地 -->
        <div class="form-field">
          <label class="form-label">恭奉地</label>
          <input v-model="form.location" class="form-input" placeholder="請輸入恭奉地" />
        </div>

        <!-- 聯絡電話（半寬） -->
        <div class="form-field">
          <label class="form-label">聯絡電話</label>
          <input v-model="form.phone" class="form-input" placeholder="請輸入連絡電話" />
        </div>

        <!-- 聯絡地址（全寬） -->
        <div class="form-field full">
          <label class="form-label">聯絡地址</label>
          <input v-model="form.address" class="form-input" placeholder="請輸入聯絡地址" />
        </div>
      </div>

      <!-- 底部按鈕 -->
      <div class="form-actions">
        <button class="btn-submit" @click="handleSubmit">確認新增</button>
        <button class="btn-cancel" @click="goBack">取消</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.branch-create-view {
  padding: 20px 28px 48px;
  background: #f3f4f6;
  min-height: 100%;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.breadcrumb { display: flex; align-items: center; gap: 4px; font-size: 14px; }
.bc-link { color: #6b7280; cursor: pointer; &:hover { color: #E8572A; } }
.bc-sep { color: #9ca3af; font-size: 16px; }
.bc-current { color: #E8572A; font-weight: 500; }

.tab-bar { display: flex; border-bottom: 1px solid #e5e7eb; }
.tab-btn {
  padding: 10px 20px; background: none; border: none; border-bottom: 2px solid transparent;
  font-size: 15px; color: #6b7280; cursor: pointer; font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  transition: all 0.15s; margin-bottom: -1px;
  &:hover { color: #374151; }
  &.active { color: #E8572A; border-bottom-color: #E8572A; font-weight: 500; }
}

.back-link {
  display: inline-flex; align-items: center; gap: 4px; font-size: 14px;
  color: #6b7280; cursor: pointer; width: fit-content; transition: color 0.15s;
  &:hover { color: #E8572A; }
  svg { width: 16px; height: 16px; }
}

.form-card { background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); padding: 28px 32px 32px; }
.form-title { font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 28px; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px 28px; }
.form-field { display: flex; flex-direction: column; gap: 8px; &.full { grid-column: 1 / -1; } }
.form-label { font-size: 14px; color: #374151; font-weight: 500; }
.req { font-style: normal; color: #E8572A; }

.form-input {
  width: 100%; padding: 10px 16px; border: 1px solid #e5e7eb; border-radius: 8px;
  font-size: 14px; color: #1f2937; background: #fff;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif; box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s;
  &::placeholder { color: #9ca3af; }
  &:focus { outline: none; border-color: #E8572A; box-shadow: 0 0 0 2px rgba(232,87,42,0.08); }
}

.select-wrap { position: relative; }
.form-select {
  width: 100%; padding: 10px 40px 10px 16px; border: 1px solid #e5e7eb; border-radius: 8px;
  font-size: 14px; color: #1f2937; background: #fff; appearance: none;
  font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif; cursor: pointer; box-sizing: border-box; transition: border-color 0.2s;
  &:focus { outline: none; border-color: #E8572A; box-shadow: 0 0 0 2px rgba(232,87,42,0.08); }
}
.select-arrow {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  width: 16px; height: 16px; color: #9ca3af; pointer-events: none;
}

.form-actions {
  display: flex; justify-content: flex-end; align-items: center; gap: 12px;
  margin-top: 32px; padding-top: 20px; border-top: 1px solid #f3f4f6;
}
.btn-submit {
  padding: 10px 28px; background: #E8572A; color: #fff; border: none; border-radius: 20px;
  font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  transition: background 0.2s; &:hover { background: #d94b1f; }
}
.btn-cancel {
  padding: 10px 28px; background: #fff; color: #374151; border: 1.5px solid #e5e7eb; border-radius: 20px;
  font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'Microsoft YaHei', '微軟正黑體', sans-serif;
  transition: all 0.2s; &:hover { border-color: #d1d5db; background: #f9fafb; }
}

@media (max-width: 768px) {
  .branch-create-view { padding: 16px; }
  .form-grid { grid-template-columns: 1fr; }
  .form-card { padding: 20px 16px; }
}
</style>
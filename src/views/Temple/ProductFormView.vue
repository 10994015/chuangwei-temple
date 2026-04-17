<template>
  <div class="product-form-page">
    <AppBreadcrumb :items="breadcrumbs" />

    <!-- 返回按鈕 -->
    <button class="back-btn" @click="goBack">
      <span class="back-arrow">‹</span> 返回上一頁
    </button>

    <!-- 主卡片 -->
    <div class="form-card">
      <h2 class="form-title">{{ isEdit ? '編輯商品' : '新增商品' }}</h2>

      <!-- 商品名稱 & 商品類別 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">商品名稱 <span class="required">*</span></label>
          <input v-model="form.name" class="form-input" :class="{ error: errors.name }" placeholder="例：平安福袋" />
          <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
        </div>
        <div class="form-group">
          <label class="form-label">商品類別 <span class="required">*</span></label>
          <div class="input-with-btn">
            <div class="select-wrap" :class="{ error: errors.category }">
              <select v-model="form.category" class="form-select">
                <option value="">選擇商品類別</option>
                <option v-for="c in productCategories" :key="c.value" :value="c.value">{{ c.label }}</option>
              </select>
              <span class="select-arrow">▾</span>
            </div>
            <button class="btn-manage" type="button"><span class="manage-icon">⚙</span> 商品類別管理</button>
          </div>
          <span v-if="errors.category" class="error-msg">{{ errors.category }}</span>
        </div>
      </div>

      <!-- 關聯活動 & 標籤類別 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">關聯活動</label>
          <div class="select-wrap">
            <select v-model="form.event" class="form-select">
              <option value="">不關聯活動（一般商品）</option>
              <option v-for="e in events" :key="e.id" :value="e.id">{{ e.name }}</option>
            </select>
            <span class="select-arrow">▾</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">標籤類別</label>
          <div class="input-with-btn">
            <div class="select-wrap">
              <select v-model="form.tags" class="form-select" multiple>
                <option value="">點擊選擇標籤...</option>
                <option v-for="t in tagOptions" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
              <span class="select-arrow">▾</span>
            </div>
            <button class="btn-manage" type="button"><span class="manage-icon">⚙</span> 標籤管理</button>
          </div>
        </div>
      </div>

      <!-- 上架時間 & 下架時間 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">上架時間</label>
          <input v-model="form.startTime" class="form-input" placeholder="年 /月/日" :disabled="form.isPermanent" />
        </div>
        <div class="form-group">
          <label class="form-label">下架時間</label>
          <input v-model="form.endTime" class="form-input" placeholder="年 /月/日" :disabled="form.isPermanent" />
        </div>
      </div>

      <!-- 常駐商品 checkbox -->
      <div class="form-row">
        <div class="form-group full-width">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.isPermanent" class="checkbox-input" />
            常駐商品（勾選後將忽略上下架時間限制）
          </label>
        </div>
      </div>

      <!-- 規格設定標題 -->
      <div class="section-title">規格設定</div>

      <!-- 規格卡片列表 -->
      <div class="specs-list">
        <div v-for="(spec, idx) in form.specs" :key="spec.id" class="spec-card">
          <!-- 右上角關閉 -->
          <button class="spec-close" type="button" @click="removeSpec(idx)">✕</button>

          <!-- 規格名稱（全寬） -->
          <div class="spec-block">
            <label class="spec-label">規格名稱 <span class="required">*</span></label>
            <input v-model="spec.name" class="form-input" placeholder="輸入規格名稱（如：大、中、小）" />
          </div>

          <!-- 商品價格 & 庫存數量 -->
          <div class="spec-row-2col">
            <div class="spec-block">
              <label class="spec-label">商品價格（元）<span class="required">*</span></label>
              <input v-model="spec.price" type="number" class="form-input" placeholder="0" />
            </div>
            <div class="spec-block">
              <label class="spec-label">庫存數量</label>
              <input v-model="spec.quantity" type="number" class="form-input" placeholder="0" />
              <span class="spec-hint">填寫 0 表示無庫存限制</span>
            </div>
          </div>

          <div class="spec-divider"></div>

          <!-- 運費設定 & 公司行號是否可以購買（並排兩欄） -->
          <div class="spec-row-2col">
            <div class="spec-block">
              <label class="spec-label">運費設定</label>
              <div class="spec-checks-vertical">
                <label class="checkbox-label">
                  <input type="checkbox" :checked="spec.shippingType === 'none'" @change="spec.shippingType = 'none'" class="checkbox-input" />
                  無運費
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" :checked="spec.shippingType === 'standard'" @change="spec.shippingType = 'standard'" class="checkbox-input" />
                  普通運費（包含於訂單總金額內一次計算）
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" :checked="spec.shippingType === 'special'" @change="spec.shippingType = 'special'" class="checkbox-input" />
                  特殊運費（不包含於訂單總金額，單獨計算）
                </label>
                <div v-if="spec.shippingType === 'special'" class="special-fee-wrap">
                  <label class="spec-label">特殊運費金額（元）</label>
                  <input v-model="spec.specialFee" type="number" class="form-input special-fee-input" placeholder="0" />
                </div>
              </div>
            </div>
            <div class="spec-block">
              <label class="spec-label">公司行號是否可以購買</label>
              <div class="spec-checks-vertical">
                <label class="checkbox-label">
                  <input type="checkbox" :checked="spec.companyAllowed === true" @change="spec.companyAllowed = true" class="checkbox-input" />
                  是
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" :checked="spec.companyAllowed === false" @change="spec.companyAllowed = false" class="checkbox-input" />
                  否
                </label>
              </div>
            </div>
          </div>

          <div class="spec-divider"></div>

          <!-- 商品圖片 -->
          <div class="spec-block">
            <label class="spec-label">商品圖片</label>
            <div class="image-upload-area">
              <div v-for="(img, imgIdx) in spec.images" :key="imgIdx" class="image-preview">
                <img :src="img.url" alt="preview" />
                <button class="image-remove" type="button" @click="removeImage(spec, imgIdx)">✕</button>
              </div>
              <label v-if="spec.images.length < 9" class="image-upload-btn" :for="`img-upload-${spec.id}`">
                <span class="upload-plus">+</span>
                <span class="upload-text">新增圖片</span>
                <input :id="`img-upload-${spec.id}`" type="file" accept="image/*" multiple style="display:none" @change="handleImageUpload(spec, $event)" />
              </label>
            </div>
            <div class="image-hint">最多可上傳 9 張圖片，建議尺寸 800x800 像素</div>
          </div>
        </div>
      </div>

      <!-- 新增規格按鈕（獨立虛線框） -->
      <button class="btn-add-spec" type="button" @click="addSpec">+ 新增規格</button>

      <!-- 商品說明 -->
      <div class="form-row" style="margin-top: 24px;">
        <div class="form-group full-width">
          <label class="form-label">商品說明</label>
          <textarea v-model="form.description" class="form-textarea" placeholder="請輸入商品詳細說明..." rows="6"></textarea>
        </div>
      </div>
    </div>

    <!-- 底部操作列 -->
    <div class="form-actions">
      <button class="btn-primary" type="button" @click="handleSubmit">{{ isEdit ? '確認修改' : '確認新增' }}</button>
      <button class="btn-draft" type="button" @click="saveDraft">儲存為草稿</button>
      <button class="btn-cancel" type="button" @click="goBack">取消</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'

const route = useRoute()
const router = useRouter()

const templeId  = computed(() => route.params.templeId)
const productId = computed(() => route.params.productId)
const productType = computed(() => route.query.type || 'self')
const isEdit    = computed(() => !!productId.value)

const breadcrumbs = computed(() => [
  { text: '後台管理' },
  { text: '活動與上架管理', onClick: goBack },
  { text: isEdit.value ? '編輯商品' : '新增商品' },
])

const productCategories = ref([
  { value: 'gift',     label: '禮品' },
  { value: 'incense',  label: '香品' },
  { value: 'souvenir', label: '紀念品' },
  { value: 'general',  label: '一般商品' },
])

const events = ref([
  { id: 1, name: '春節祈福法會' },
  { id: 2, name: '中元普渡法會' },
])

const tagOptions = ref([
  { value: 'hot',       label: '熱門' },
  { value: 'recommend', label: '推薦' },
  { value: 'new',       label: '新上架' },
  { value: 'limited',   label: '限量' },
])

const form = reactive({
  name: '',
  category: '',
  event: '',
  tags: [],
  startTime: '',
  endTime: '',
  isPermanent: false,
  specs: [],
  description: '',
})

const errors = reactive({ name: '', category: '' })

let specIdCounter = 0

const addSpec = () => {
  form.specs.push({
    id: ++specIdCounter,
    name: '',
    price: '',
    quantity: '',
    companyAllowed: false,
    shippingType: 'none',
    specialFee: '',
    images: [],
  })
}

const removeSpec = (idx) => { form.specs.splice(idx, 1) }

const onUnlimitedQtyChange = (spec) => {} // kept for compat

const removeImage = (spec, imgIdx) => { spec.images.splice(imgIdx, 1) }

const handleImageUpload = (spec, event) => {
  const files = Array.from(event.target.files)
  const remaining = 9 - spec.images.length
  files.slice(0, remaining).forEach(file => {
    const url = URL.createObjectURL(file)
    spec.images.push({ url, file })
  })
  event.target.value = ''
}

const validate = () => {
  errors.name = ''
  errors.category = ''
  let valid = true
  if (!form.name.trim()) { errors.name = '請輸入商品名稱'; valid = false }
  if (!form.category) { errors.category = '請選擇商品類別'; valid = false }
  return valid
}

const handleSubmit = () => {
  if (!validate()) return
  console.log('提交商品', form)
  goBack()
}

const saveDraft = () => {
  console.log('儲存草稿', form)
  goBack()
}

const goBack = () => {
  router.push({ name: 'app.temple.activity-management', params: { templeId: templeId.value }, query: { tab: 'products' } })
}

onMounted(() => {
  // 編輯模式才載入資料，新增模式不預設展開規格
  if (isEdit.value) {
    // TODO: 呼叫 API 取得商品資料並填入 form
  }
})
</script>

<style scoped>
.product-form-page {
  padding: 24px 32px 40px;
  min-height: 100%;
  background: #F3F4F6;
}

/* 返回 */
.back-btn {
  display: inline-flex; align-items: center; gap: 4px;
  background: none; border: none; color: #555; font-size: 14px;
  cursor: pointer; margin-bottom: 24px; padding: 0; transition: color 0.2s;
}
.back-btn:hover { color: #E8572A; }
.back-arrow { font-size: 18px; line-height: 1; }

/* 主卡片 */
.form-card {
  background: #fff; border-radius: 16px; padding: 36px 40px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
}
.form-title { font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin: 0 0 32px; }

/* 表單列 */
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px 32px; margin-bottom: 20px; }
.form-group { display: flex; flex-direction: column; }
.form-group.full-width { grid-column: 1 / -1; }
.form-label { font-size: 13px; font-weight: 500; color: #444; margin-bottom: 8px; }
.required { color: #E8572A; margin-left: 2px; }

/* 輸入框 */
.form-input {
  padding: 11px 16px; border: 1px solid #e0e0e0; border-radius: 10px;
  font-size: 14px; color: #333; background: #fff; outline: none;
  transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; width: 100%;
}
.form-input:focus { border-color: #E8572A; box-shadow: 0 0 0 3px rgba(232,87,42,0.08); }
.form-input.error { border-color: #e53e3e; }
.form-input:disabled { background: #f5f5f5; color: #aaa; cursor: not-allowed; }

.form-textarea {
  padding: 12px 16px; border: 1px solid #e0e0e0; border-radius: 10px;
  font-size: 14px; color: #333; background: #fff; resize: vertical; outline: none;
  transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box;
  width: 100%; font-family: inherit; line-height: 1.6;
}
.form-textarea:focus { border-color: #E8572A; box-shadow: 0 0 0 3px rgba(232,87,42,0.08); }

/* Select */
.select-wrap { position: relative; flex: 1; }
.form-select {
  width: 100%; padding: 11px 40px 11px 16px; border: 1px solid #e0e0e0;
  border-radius: 10px; font-size: 14px; color: #333; background: #fff;
  appearance: none; cursor: pointer; outline: none;
  transition: border-color 0.2s; box-sizing: border-box;
}
.form-select:focus { border-color: #E8572A; }
.select-wrap.error .form-select { border-color: #e53e3e; }
.select-arrow {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  color: #aaa; pointer-events: none; font-size: 12px;
}

/* 帶按鈕的輸入 */
.input-with-btn { display: flex; align-items: stretch; gap: 10px; }
.btn-manage {
  display: inline-flex; align-items: center; gap: 5px; padding: 0 16px;
  background: #fff; border: 1.5px solid #E8572A; border-radius: 10px;
  color: #E8572A; font-size: 13px; font-weight: 500; cursor: pointer;
  white-space: nowrap; transition: background 0.15s;
}
.btn-manage:hover { background: #fff3ef; }
.manage-icon { font-size: 13px; }

/* Checkbox */
.checkbox-label { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: #444; user-select: none; }
.checkbox-input { accent-color: #E8572A; width: 15px; height: 15px; cursor: pointer; flex-shrink: 0; }

/* 錯誤訊息 */
.error-msg { font-size: 12px; color: #e53e3e; margin-top: 4px; }

/* 規格標題 */
.section-title { font-size: 15px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px; }

/* 規格列表 */
.specs-list { display: flex; flex-direction: column; gap: 0; }

/* 規格卡片 */
.spec-card {
  position: relative;
  background: #fff; border: 1px solid #e8e8e8; border-radius: 14px;
  padding: 28px 32px; margin-bottom: 16px;
}
.spec-close {
  position: absolute; top: 16px; right: 16px;
  background: none; border: none; color: #e53e3e;
  font-size: 16px; cursor: pointer; padding: 4px 6px;
  border-radius: 4px; line-height: 1; transition: background 0.15s;
}
.spec-close:hover { background: #fff0f0; }

.spec-block { display: flex; flex-direction: column; margin-bottom: 0; }
.spec-label { font-size: 13px; font-weight: 500; color: #555; margin-bottom: 8px; }

.spec-row-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 32px; margin-bottom: 0; }
.spec-hint { font-size: 12px; color: #aaa; margin-top: 6px; }

.spec-sub-check { margin-top: 8px; font-size: 13px; color: #888; }
.spec-divider { height: 1px; background: #f0f0f0; margin: 20px 0; }

.spec-checks-vertical { display: flex; flex-direction: column; gap: 10px; padding-top: 4px; }

/* 圖片上傳 */
.image-upload-area { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; }

.image-preview {
  position: relative; width: 160px; height: 160px;
  border-radius: 12px; overflow: hidden; border: 1px solid #e0e0e0;
}
.image-preview img { width: 100%; height: 100%; object-fit: cover; }
.image-remove {
  position: absolute; top: 6px; right: 6px;
  background: rgba(0,0,0,0.45); color: white; border: none;
  border-radius: 50%; width: 22px; height: 22px; font-size: 11px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}

.image-upload-btn {
  width: 160px; height: 280px;
  border: 1.5px dashed #c8c8c8; border-radius: 14px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  cursor: pointer; background: #f8f8f8;
  transition: border-color 0.2s, background 0.2s; gap: 8px;
}
.image-upload-btn:hover { border-color: #E8572A; background: #fff8f6; }
.upload-plus { font-size: 22px; color: #bbb; line-height: 1; }
.upload-text { font-size: 13px; color: #aaa; }
.image-hint { font-size: 12px; color: #aaa; margin-top: 8px; }

.special-fee-wrap { margin-top: 10px; padding-left: 24px; }
.special-fee-input { max-width: 200px; }

/* 新增規格按鈕 */
.btn-add-spec {
  display: block; width: 100%; padding: 18px; margin-top: 16px;
  background: #fff; border: 1.5px dashed #d0d0d0; border-radius: 14px;
  color: #888; font-size: 14px; cursor: pointer; text-align: center;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}
.btn-add-spec:hover { border-color: #E8572A; color: #E8572A; background: #fff8f6; }

/* 底部操作列 */
.form-actions { display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-top: 28px; padding-bottom: 40px; }

.btn-primary { padding: 10px 28px; background: #E8572A; color: #fff; border: none; border-radius: 50px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover { background: #d14a1f; }

.btn-draft { padding: 10px 24px; background: #fff; color: #555; border: 1px solid #ddd; border-radius: 50px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.2s; }
.btn-draft:hover { background: #f5f5f5; }

.btn-cancel { padding: 10px 24px; background: #fff; color: #555; border: 1px solid #ddd; border-radius: 50px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.2s; }
.btn-cancel:hover { background: #f5f5f5; }
</style>
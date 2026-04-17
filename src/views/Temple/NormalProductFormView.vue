<template>
  <div class="wizard-page">
    <AppBreadcrumb :items="breadcrumbs" />

    <!-- 步驟3 才顯示返回上一步 -->
    <button v-if="currentStep > 1" class="back-btn" @click="prevStep">
      <span class="back-arrow">←</span> 返回上一步
    </button>
    <!-- 步驟1 顯示返回上一頁 -->
    <button v-else class="back-btn" @click="goBack">
      <span class="back-arrow">←</span> 返回上一頁
    </button>

    <!-- 頁面標題 -->
    <h1 class="page-title">新增普通商品</h1>

    <!-- 步驟指示器 -->
    <div class="stepper">
      <div v-for="(step, idx) in steps" :key="idx" class="stepper-item">
        <div class="step-dot" :class="{
          'active': currentStep === idx + 1,
          'done':   currentStep > idx + 1
        }">{{ idx + 1 }}</div>
        <span class="step-label" :class="{
          'active': currentStep === idx + 1,
          'done':   currentStep > idx + 1
        }">{{ step }}</span>
        <div v-if="idx < steps.length - 1" class="step-line" :class="{ 'done': currentStep > idx + 1 }"></div>
      </div>
    </div>

    <!-- ===================== 步驟 1：選擇商品類型 ===================== -->
    <div v-if="currentStep === 1" class="step-card">
      <div class="step-card-title">步驟 1：選擇商品類型</div>

      <!-- 搜尋 -->
      <div class="type-search-wrap">
        <input v-model="typeSearch" class="type-search-input" placeholder="搜尋商品類型..." />
      </div>

      <!-- 類型格子 -->
      <div class="type-grid">
        <button
          v-for="t in filteredTypes"
          :key="t"
          class="type-btn"
          :class="{ selected: selectedType === t }"
          @click="selectedType = t"
        >{{ t }}</button>
      </div>
    </div>

    <!-- ===================== 步驟 2：選擇設計 ===================== -->
    <div v-if="currentStep === 2" class="step-card">
      <div class="step-card-title">選擇設計範本</div>
      <div class="step-card-desc">請選擇一個設計範本作為商品頁面的視覺風格</div>

      <div class="design-grid">
        <div
          v-for="d in designs"
          :key="d.id"
          class="design-card"
          :class="{ selected: selectedDesign === d.id }"
          @click="selectedDesign = d.id"
        >
          <div class="design-img-wrap">
            <img :src="d.img" :alt="d.name" class="design-img" />
            <div v-if="selectedDesign === d.id" class="design-check">✓</div>
          </div>
          <div class="design-info">
            <div class="design-name" :class="{ selected: selectedDesign === d.id }">{{ d.name }}</div>
            <div class="design-desc">{{ d.desc }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===================== 步驟 3：填寫商品資訊 ===================== -->
    <div v-if="currentStep === 3" class="step-card">
      <div class="step-card-title">步驟 3：填寫商品資訊</div>

      <!-- 商品名稱 & 商品類別 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">商品名稱 <span class="required">*</span></label>
          <input v-model="form.name" class="form-input" :class="{ error: errors.name }" placeholder="例：平安福袋" />
          <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
        </div>
        <div class="form-group">
          <label class="form-label">商品類別 <span class="required">*</span></label>
          <div class="select-wrap">
            <select v-model="form.category" class="form-select" disabled>
              <option :value="selectedType">{{ selectedType }}</option>
            </select>
            <span class="select-arrow">▾</span>
          </div>
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

      <!-- 常駐商品 -->
      <div class="form-row">
        <div class="form-group full-width">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.isPermanent" class="checkbox-input" />
            常駐商品（勾選後將忽略上下架時間限制）
          </label>
        </div>
      </div>

      <!-- 規格設定 -->
      <div class="section-title">規格設定</div>

      <div class="specs-list">
        <div v-for="(spec, idx) in form.specs" :key="spec.id" class="spec-card">
          <button class="spec-close" type="button" @click="removeSpec(idx)">✕</button>

          <!-- 規格名稱 -->
          <div class="spec-block">
            <label class="spec-label">規格名稱 <span class="required">*</span></label>
            <input v-model="spec.name" class="form-input" placeholder="輸入規格名稱（如：大、中、小）" />
          </div>

          <!-- 價格 & 庫存 -->
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

          <!-- 運費設定 -->
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

          <div class="spec-divider"></div>

          <!-- 商品圖片 -->
          <div class="spec-block">
            <label class="spec-label">商品圖片</label>
            <div class="image-upload-area">
              <!-- 設計範本圖（自動帶入，不可刪除） -->
              <div v-if="idx === 0 && selectedDesignObj" class="image-preview design-preview">
                <img :src="selectedDesignObj.img" alt="設計範本" />
                <div class="design-badge">設計範本</div>
              </div>
              <!-- 使用者上傳圖片 -->
              <div v-for="(img, imgIdx) in spec.images" :key="imgIdx" class="image-preview">
                <img :src="img.url" alt="preview" />
                <button class="image-remove" type="button" @click="removeImage(spec, imgIdx)">✕</button>
              </div>
              <!-- 上傳按鈕 -->
              <label v-if="totalImgs(spec, idx) < 9" class="image-upload-btn" :for="`img-upload-${spec.id}`">
                <span class="upload-plus">+</span>
                <span class="upload-text">新增圖片</span>
                <input :id="`img-upload-${spec.id}`" type="file" accept="image/*" multiple style="display:none" @change="handleImageUpload(spec, $event)" />
              </label>
            </div>
            <div class="image-hint">
              <span v-if="idx === 0 && selectedDesignObj">設計範本圖片已自動添加，最多可再上傳 {{ 9 - 1 - spec.images.length }} 張圖片，建議尺寸 800x800 像素</span>
              <span v-else>最多可上傳 9 張圖片，建議尺寸 800x800 像素</span>
            </div>
          </div>
        </div>
      </div>

      <button class="btn-add-spec" type="button" @click="addSpec">+ 新增規格</button>

      <!-- 商品說明 -->
      <div class="form-row" style="margin-top: 24px;">
        <div class="form-group full-width">
          <label class="form-label">商品說明</label>
          <textarea v-model="form.description" class="form-textarea" placeholder="請輸入商品詳細說明..." rows="5"></textarea>
        </div>
      </div>
    </div>

    <!-- ===================== 底部操作列 ===================== -->
    <div class="wizard-actions">
      <!-- 步驟 1 & 2 -->
      <template v-if="currentStep < 3">
        <button class="btn-primary" @click="nextStep">下一步</button>
        <button class="btn-cancel" @click="goBack">取消</button>
      </template>
      <!-- 步驟 3 -->
      <template v-else>
        <button class="btn-primary" @click="handleSubmit">確認新增</button>
        <button class="btn-draft" @click="saveDraft">儲存草稿</button>
        <button class="btn-cancel" @click="prevStep">返回上一步</button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'

const route  = useRoute()
const router = useRouter()
const templeId = computed(() => route.params.templeId)

const breadcrumbs = [
  { text: '後台管理' },
  { text: '活動與上架管理', onClick: () => router.push({ name: 'app.temple.activity-management', params: { templeId: templeId.value }, query: { tab: 'products' } }) },
  { text: '新增普通商品' },
]

// ── 步驟控制 ──
const steps = ['選擇商品類型', '選擇設計', '填寫商品資訊']
const currentStep = ref(1)

const nextStep = () => {
  if (currentStep.value === 1 && !selectedType.value) return
  if (currentStep.value === 2 && !selectedDesign.value) return
  if (currentStep.value < 3) currentStep.value++
}
const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--
}

// ── 步驟 1：商品類型 ──
const typeSearch = ref('')
const selectedType = ref('')
const allTypes = ['御守', '平安符', '線香', '蠟燭', '桌飾', '服飾', '帽子', '其他']
const filteredTypes = computed(() =>
  typeSearch.value
    ? allTypes.filter(t => t.includes(typeSearch.value))
    : allTypes
)

// ── 步驟 2：設計範本 ──
const selectedDesign = ref('')

// 使用 Unsplash 公開圖作為範本預覽（temple/traditional/flower/bamboo themes）
const designs = ref([
  {
    id: 'classic-red',
    name: '經典紅金款',
    desc: '傳統喜慶配色，適合節慶與祈福商品',
    img: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=600&q=80',
  },
  {
    id: 'fresh-elegant',
    name: '清新素雅款',
    desc: '簡潔淡雅風格，適合日常結緣品',
    img: 'https://images.unsplash.com/photo-1490750967868-88df5691cc11?w=600&q=80',
  },
  {
    id: 'modern-minimal',
    name: '現代簡約款',
    desc: '現代幾何設計，適合年輕族群',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  },
  {
    id: 'retro-vintage',
    name: '復古懷舊款',
    desc: '古典紋飾風格，富含文化底蘊',
    img: 'https://images.unsplash.com/photo-1578321271678-1a5e0e4e8c0c?w=600&q=80',
  },
  {
    id: 'floral-pattern',
    name: '花卉圖案款',
    desc: '優雅花卉元素，適合祈福類商品',
    img: 'https://images.unsplash.com/photo-1490750967868-88df5691cc11?w=600&q=80',
  },
  {
    id: 'temple-cloud',
    name: '祥雲紋路款',
    desc: '吉祥雲紋設計，寓意平安順遂',
    img: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&q=80',
  },
])

const selectedDesignObj = computed(() => designs.value.find(d => d.id === selectedDesign.value))

// ── 步驟 3：表單 ──
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
    shippingType: 'none',
    specialFee: '',
    companyAllowed: false,
    images: [],
  })
}
const removeSpec = (idx) => { form.specs.splice(idx, 1) }

// 計算某規格的總圖片數（含設計範本）
const totalImgs = (spec, idx) => {
  const base = (idx === 0 && selectedDesignObj.value) ? 1 : 0
  return base + spec.images.length
}

const removeImage = (spec, imgIdx) => { spec.images.splice(imgIdx, 1) }
const handleImageUpload = (spec, event, idx) => {
  const files = Array.from(event.target.files)
  const used = totalImgs(spec, idx ?? 0)
  const remaining = 9 - used
  files.slice(0, remaining).forEach(file => {
    spec.images.push({ url: URL.createObjectURL(file), file })
  })
  event.target.value = ''
}

const validate = () => {
  errors.name = ''
  let valid = true
  if (!form.name.trim()) { errors.name = '請輸入商品名稱'; valid = false }
  return valid
}

const handleSubmit = () => {
  if (!validate()) return
  console.log('提交普通商品', { type: selectedType.value, design: selectedDesign.value, form })
  router.push({ name: 'app.temple.activity-management', params: { templeId: templeId.value }, query: { tab: 'products' } })
}
const saveDraft = () => {
  console.log('儲存草稿')
  router.push({ name: 'app.temple.activity-management', params: { templeId: templeId.value }, query: { tab: 'products' } })
}
const goBack = () => {
  router.push({ name: 'app.temple.activity-management', params: { templeId: templeId.value }, query: { tab: 'products' } })
}

// 進入步驟3時，自動同步商品類別 & 預設一個規格
const onEnterStep3 = () => {
  form.category = selectedType.value
  if (form.specs.length === 0) addSpec()
}
// 監聽步驟變化
import { watch } from 'vue'
watch(currentStep, (val) => {
  if (val === 3) onEnterStep3()
})
</script>

<style scoped>
.wizard-page {
  padding: 24px 32px 80px;
  min-height: 100%;
  background: #F3F4F6;
}

/* 返回 */
.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: none; border: none; color: #555; font-size: 14px;
  cursor: pointer; margin-bottom: 16px; padding: 0; transition: color 0.2s;
}
.back-btn:hover { color: #E8572A; }
.back-arrow { font-size: 16px; }

/* 頁面標題 */
.page-title {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 28px;
}

/* 步驟指示器 */
.stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 36px;
}
.stepper-item {
  display: flex;
  align-items: center;
  gap: 0;
}
.step-dot {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #aaa;
  font-size: 14px;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: background 0.3s, color 0.3s;
}
.step-dot.active { background: #E8572A; color: #fff; }
.step-dot.done   { background: #E8572A; color: #fff; }

.step-label {
  font-size: 13px;
  color: #aaa;
  font-weight: 500;
  margin: 0 10px;
  white-space: nowrap;
  transition: color 0.3s;
}
.step-label.active { color: #E8572A; font-weight: 600; }
.step-label.done   { color: #E8572A; }

.step-line {
  width: 60px;
  height: 2px;
  background: #e0e0e0;
  flex-shrink: 0;
  transition: background 0.3s;
}
.step-line.done { background: #E8572A; }

/* 步驟卡片 */
.step-card {
  background: #fff;
  border-radius: 16px;
  padding: 36px 40px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  margin-bottom: 0;
}
.step-card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 20px;
}
.step-card-desc {
  font-size: 13px;
  color: #888;
  margin-bottom: 24px;
  margin-top: -12px;
}

/* ── 步驟1：商品類型 ── */
.type-search-wrap { margin-bottom: 20px; }
.type-search-input {
  width: 100%;
  padding: 11px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  color: #333;
  background: #fff;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}
.type-search-input:focus { border-color: #E8572A; }

.type-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.type-btn {
  padding: 18px 12px;
  background: #fff;
  border: 1.5px solid #e0e0e0;
  border-radius: 14px;
  font-size: 15px;
  color: #333;
  font-weight: 500;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}
.type-btn:hover { border-color: #E8572A; color: #E8572A; background: #fff8f6; }
.type-btn.selected { border-color: #E8572A; color: #E8572A; background: #fff8f6; font-weight: 700; }

/* ── 步驟2：設計範本 ── */
.design-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.design-card {
  border: 2px solid #e8e8e8;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #fff;
}
.design-card:hover { border-color: #E8572A; box-shadow: 0 2px 12px rgba(232,87,42,0.1); }
.design-card.selected { border-color: #E8572A; box-shadow: 0 2px 16px rgba(232,87,42,0.15); }

.design-img-wrap { position: relative; aspect-ratio: 4/3; overflow: hidden; }
.design-img { width: 100%; height: 100%; object-fit: cover; display: block; }

.design-check {
  position: absolute; top: 12px; right: 12px;
  width: 28px; height: 28px;
  background: #E8572A; color: #fff;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700;
}

.design-info { padding: 16px 18px; }
.design-name { font-size: 15px; font-weight: 700; color: #222; margin-bottom: 4px; }
.design-name.selected { color: #E8572A; }
.design-desc { font-size: 13px; color: #888; }

/* ── 步驟3：表單 ── */
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px 32px; margin-bottom: 20px; }
.form-group { display: flex; flex-direction: column; }
.form-group.full-width { grid-column: 1 / -1; }
.form-label { font-size: 13px; font-weight: 500; color: #444; margin-bottom: 8px; }
.required { color: #E8572A; margin-left: 2px; }

.form-input {
  padding: 11px 16px; border: 1px solid #e0e0e0; border-radius: 10px;
  font-size: 14px; color: #333; background: #fff; outline: none;
  transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; width: 100%;
}
.form-input:focus { border-color: #E8572A; box-shadow: 0 0 0 3px rgba(232,87,42,0.08); }
.form-input.error { border-color: #e53e3e; }
.form-input:disabled { background: #f5f5f5; color: #555; cursor: default; }

.form-textarea {
  padding: 12px 16px; border: 1px solid #e0e0e0; border-radius: 10px;
  font-size: 14px; color: #333; background: #fff; resize: vertical; outline: none;
  transition: border-color 0.2s; box-sizing: border-box; width: 100%; font-family: inherit; line-height: 1.6;
}
.form-textarea:focus { border-color: #E8572A; box-shadow: 0 0 0 3px rgba(232,87,42,0.08); }

.select-wrap { position: relative; flex: 1; }
.form-select {
  width: 100%; padding: 11px 40px 11px 16px; border: 1px solid #e0e0e0;
  border-radius: 10px; font-size: 14px; color: #333; background: #fff;
  appearance: none; cursor: pointer; outline: none;
  transition: border-color 0.2s; box-sizing: border-box;
}
.form-select:focus { border-color: #E8572A; }
.form-select:disabled { background: #f5f5f5; color: #555; cursor: default; }
.select-arrow { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: #aaa; pointer-events: none; font-size: 12px; }

.input-with-btn { display: flex; align-items: stretch; gap: 10px; }
.btn-manage {
  display: inline-flex; align-items: center; gap: 5px; padding: 0 16px;
  background: #fff; border: 1.5px solid #E8572A; border-radius: 10px;
  color: #E8572A; font-size: 13px; font-weight: 500; cursor: pointer;
  white-space: nowrap; transition: background 0.15s;
}
.btn-manage:hover { background: #fff3ef; }
.manage-icon { font-size: 13px; }

.checkbox-label { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: #444; user-select: none; }
.checkbox-input { accent-color: #E8572A; width: 15px; height: 15px; cursor: pointer; flex-shrink: 0; }
.error-msg { font-size: 12px; color: #e53e3e; margin-top: 4px; }

/* 規格 */
.section-title { font-size: 15px; font-weight: 700; color: #1a1a1a; margin: 28px 0 16px; }
.specs-list { display: flex; flex-direction: column; gap: 0; }
.spec-card {
  position: relative;
  background: #fff; border: 1px solid #e8e8e8; border-radius: 14px;
  padding: 28px 32px; margin-bottom: 16px;
}
.spec-close {
  position: absolute; top: 16px; right: 16px;
  background: none; border: none; color: #e53e3e;
  font-size: 16px; cursor: pointer; padding: 4px 6px;
  border-radius: 4px; transition: background 0.15s;
}
.spec-close:hover { background: #fff0f0; }

.spec-block { display: flex; flex-direction: column; margin-bottom: 0; }
.spec-label { font-size: 13px; font-weight: 500; color: #555; margin-bottom: 8px; }
.spec-hint { font-size: 12px; color: #aaa; margin-top: 6px; }
.spec-row-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 32px; margin-bottom: 0; }
.spec-divider { height: 1px; background: #f0f0f0; margin: 20px 0; }
.spec-checks-vertical { display: flex; flex-direction: column; gap: 10px; padding-top: 4px; }

/* 圖片 */
.image-upload-area { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; }
.image-preview {
  position: relative; width: 180px; height: 180px;
  border-radius: 12px; overflow: hidden; border: 1px solid #e0e0e0;
}
.image-preview img { width: 100%; height: 100%; object-fit: cover; }
.image-remove {
  position: absolute; top: 6px; right: 6px;
  background: rgba(0,0,0,0.45); color: white; border: none;
  border-radius: 50%; width: 22px; height: 22px; font-size: 11px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}
/* 設計範本圖：底部有 badge */
.design-preview { cursor: default; }
.design-badge {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: rgba(30,30,30,0.68);
  color: #fff; font-size: 12px; font-weight: 600;
  text-align: center; padding: 5px 0;
}
.image-upload-btn {
  width: 180px; height: 260px;
  border: 1.5px dashed #c8c8c8; border-radius: 14px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  cursor: pointer; background: #f8f8f8;
  transition: border-color 0.2s, background 0.2s; gap: 8px;
}
.image-upload-btn:hover { border-color: #E8572A; background: #fff8f6; }
.upload-plus { font-size: 22px; color: #bbb; }
.upload-text { font-size: 13px; color: #aaa; }
.image-hint { font-size: 12px; color: #aaa; margin-top: 8px; }

.special-fee-wrap { margin-top: 10px; padding-left: 24px; }
.special-fee-input { max-width: 200px; }

/* 新增規格按鈕 */
.btn-add-spec {
  display: block; width: 100%; padding: 18px; margin-top: 0;
  background: #fff; border: 1.5px dashed #d0d0d0; border-radius: 14px;
  color: #888; font-size: 14px; cursor: pointer; text-align: center;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}
.btn-add-spec:hover { border-color: #E8572A; color: #E8572A; background: #fff8f6; }

/* 底部操作 */
.wizard-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 28px;
  padding-bottom: 40px;
}
.btn-primary {
  padding: 10px 32px; background: #E8572A; color: #fff;
  border: none; border-radius: 50px; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: background 0.2s;
}
.btn-primary:hover { background: #d14a1f; }
.btn-draft {
  padding: 10px 24px; background: #fff; color: #555;
  border: 1px solid #ddd; border-radius: 50px; font-size: 14px;
  cursor: pointer; transition: background 0.2s;
}
.btn-draft:hover { background: #f5f5f5; }
.btn-cancel {
  padding: 10px 24px; background: #fff; color: #555;
  border: 1px solid #ddd; border-radius: 50px; font-size: 14px;
  cursor: pointer; transition: background 0.2s;
}
.btn-cancel:hover { background: #f5f5f5; }
</style>
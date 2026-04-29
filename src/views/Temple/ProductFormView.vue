<template>
  <div class="product-form-page">
    <AppBreadcrumb :items="breadcrumbs" />

    <button class="back-btn" @click="goBack">
      <span class="back-arrow">‹</span> 返回上一頁
    </button>

    <div class="form-card">
      <h2 class="form-title">{{ isEdit ? '編輯商品' : '新增商品' }}</h2>

      <!-- 商品名稱 & 商品項目 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">商品名稱 <span class="required">*</span></label>
          <input v-model="form.nameZhTw" class="form-input" :class="{ error: errors.nameZhTw }" placeholder="請輸入商品名稱" />
          <span v-if="errors.nameZhTw" class="error-msg">{{ errors.nameZhTw }}</span>
        </div>
        <div class="form-group">
          <label class="form-label">商品項目</label>
          <div class="select-wrap">
            <select v-model="form.itemId" class="form-select">
              <option value="">請選擇商品項目</option>
              <option v-for="item in productItems" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
            <span class="select-arrow">▾</span>
          </div>
        </div>
      </div>

      <!-- 商品類別 & 關聯活動 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">商品類別 <span class="required">*</span></label>
          <div class="input-with-btn">
            <div class="select-wrap" :class="{ error: errors.categoryId }">
              <select v-model="form.categoryId" class="form-select">
                <option value="">點擊選擇類別...</option>
                <option v-for="c in productCategories" :key="c.value" :value="c.value">{{ c.label }}</option>
              </select>
              <span class="select-arrow">▾</span>
            </div>
            <button class="btn-manage" type="button" @click="openCategoryModal"><span class="manage-icon">⚙</span> 商品類別管理</button>
          </div>
          <span v-if="errors.categoryId" class="error-msg">{{ errors.categoryId }}</span>
        </div>
        <div class="form-group">
          <label class="form-label">關聯活動（可多選）</label>
          <MultiSelectTag v-model="form.eventIds" :options="bindableEventOptions" placeholder="點擊選擇活動..." />
        </div>
      </div>

      <!-- 疏文 & 感謝狀 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">疏文</label>
          <div class="select-wrap">
            <select v-model="form.ritualDocumentId" class="form-select">
              <option :value="null">無疏文</option>
              <option v-for="s in ritualDocuments" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
            <span class="select-arrow">▾</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">感謝狀</label>
          <div class="select-wrap">
            <select v-model="form.certificateId" class="form-select">
              <option :value="null">無感謝狀</option>
              <option v-for="c in certificates" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <span class="select-arrow">▾</span>
          </div>
        </div>
      </div>

      <!-- 是否開發票 & 標籤類別 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">是否開發票</label>
          <label class="checkbox-label" style="padding-top:4px">
            <input type="checkbox" v-model="form.isInvoiceSupported" class="checkbox-input" />
            開發票
          </label>
        </div>
        <div class="form-group">
          <label class="form-label">標籤類別（可多選）</label>
          <div class="input-with-btn">
            <MultiSelectTag v-model="form.tags" :options="tagOptions" placeholder="點擊選擇標籤..." style="flex:1" />
            <button class="btn-manage" type="button" @click="openTagModal"><span class="manage-icon">⚙</span> 標籤管理</button>
          </div>
        </div>
      </div>

      <!-- 上架時間 & 下架時間 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">上架時間</label>
          <input v-model="form.publishAt" type="datetime-local" class="form-input" :disabled="form.isPermanent" />
        </div>
        <div class="form-group">
          <label class="form-label">下架時間</label>
          <input v-model="form.unpublishAt" type="datetime-local" class="form-input" :disabled="form.isPermanent" />
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

      <!-- 商品主圖 -->
      <div class="section-title">商品主圖</div>
      <div class="main-image-section">
        <div class="image-upload-area">
          <div v-for="(img, imgIdx) in mainImages" :key="imgIdx" class="image-preview">
            <img :src="img.url" alt="preview" />
            <button class="image-remove" type="button" @click="removeMainImage(imgIdx)">✕</button>
          </div>
          <label v-if="mainImages.length < 5 && !isMainUploading" class="image-upload-btn" for="main-img-upload">
            <span class="upload-plus">+</span>
            <span class="upload-text">新增圖片</span>
            <input id="main-img-upload" type="file" accept="image/*" multiple style="display:none" @change="handleMainImageUpload" />
          </label>
          <div v-if="isMainUploading" class="image-upload-btn uploading">
            <span class="upload-text">上傳中...</span>
          </div>
        </div>
        <div class="image-hint">最多可上傳 5 張圖片</div>
      </div>

      <!-- 規格設定 -->
      <div class="section-title">規格設定</div>
      <div class="specs-list">
        <div v-for="(spec, idx) in form.specs" :key="spec.id" class="spec-card">
          <button class="spec-close" type="button" @click="removeSpec(idx)">✕</button>

          <div class="spec-block">
            <label class="spec-label">規格名稱 <span class="required">*</span></label>
            <input v-model="spec.nameZhTw" class="form-input" placeholder="例如：大、中、小..." />
          </div>

          <div class="spec-row-2col">
            <div class="spec-block">
              <label class="spec-label">商品價格（元）<span class="required">*</span></label>
              <input v-model.number="spec.price" type="number" class="form-input" placeholder="0" />
            </div>
            <div class="spec-block">
              <label class="spec-label">庫存數量 <span class="required">*</span></label>
              <input v-model.number="spec.stock" type="number" class="form-input" placeholder="0" :disabled="spec.unlimitedStock" />
              <label class="checkbox-label spec-sub-check">
                <input type="checkbox" v-model="spec.unlimitedStock" class="checkbox-input" @change="onUnlimitedStockChange(spec)" />
                無限制庫存
              </label>
            </div>
          </div>

          <div class="spec-divider"></div>

          <div class="spec-block">
            <label class="spec-label">公司行號是否可以購買</label>
            <div class="spec-checks-vertical">
              <label class="checkbox-label">
                <input type="checkbox" :checked="spec.isCompanyPurchasable === true" @change="spec.isCompanyPurchasable = true" class="checkbox-input" />
                是
              </label>
              <label class="checkbox-label">
                <input type="checkbox" :checked="spec.isCompanyPurchasable === false" @change="spec.isCompanyPurchasable = false" class="checkbox-input" />
                否
              </label>
            </div>
          </div>

          <div class="spec-divider"></div>

          <div class="spec-block">
            <label class="spec-label">運費設定</label>
            <div class="spec-checks-vertical">
              <label class="checkbox-label">
                <input type="checkbox" :checked="spec.shippingMode === 'FREE'" @change="spec.shippingMode = 'FREE'" class="checkbox-input" />
                無運費
              </label>
              <label class="checkbox-label">
                <input type="checkbox" :checked="spec.shippingMode === 'STANDARD'" @change="spec.shippingMode = 'STANDARD'" class="checkbox-input" />
                普通運費（包含於訂單總金額內一次計算）
              </label>
              <label class="checkbox-label">
                <input type="checkbox" :checked="spec.shippingMode === 'SPECIAL'" @change="spec.shippingMode = 'SPECIAL'" class="checkbox-input" />
                特殊運費（不包含於訂單總金額，單獨計算）
              </label>
            </div>
            <div v-if="spec.shippingMode === 'SPECIAL'" class="special-fee-row">
              <label class="spec-label">特殊運費金額（元）</label>
              <input v-model.number="spec.specialShippingFee" type="number" class="form-input special-fee-input" placeholder="0" />
            </div>
          </div>

          <div class="spec-divider"></div>

          <!-- 規格圖片 -->
          <div class="spec-block">
            <label class="spec-label">規格圖片</label>
            <div class="image-upload-area">
              <div v-for="(img, imgIdx) in spec.images" :key="imgIdx" class="image-preview">
                <img :src="img.url" alt="preview" />
                <button class="image-remove" type="button" @click="removeSpecImage(spec, imgIdx)">✕</button>
              </div>
              <label v-if="spec.images.length < 5" class="image-upload-btn" :for="`img-upload-${spec.id}`">
                <span class="upload-plus">+</span>
                <span class="upload-text">新增圖片</span>
                <input :id="`img-upload-${spec.id}`" type="file" accept="image/*" multiple style="display:none" @change="handleSpecImageUpload(spec, $event)" />
              </label>
            </div>
            <div class="image-hint">最多可上傳 5 張圖片</div>
          </div>
        </div>
      </div>

      <button class="btn-add-spec" type="button" @click="addSpec">+ 新增規格</button>

      <!-- 商品說明 -->
      <div class="form-row" style="margin-top: 24px;">
        <div class="form-group full-width">
          <label class="form-label">商品說明</label>
          <textarea v-model="form.depictionZhTw" class="form-textarea" placeholder="請輸入商品說明" rows="5"></textarea>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button class="btn-primary" type="button" @click="handleSubmit('OPEN')" :disabled="isSaving">
        {{ isSaving ? '送出中...' : (isEdit ? '確認修改' : '確認新增') }}
      </button>
      <button class="btn-draft" type="button" @click="handleSubmit('DRAFT')" :disabled="isSaving">新增草稿</button>
      <button class="btn-cancel" type="button" @click="goBack">取消</button>
    </div>

    <!-- 商品類別管理 Modal -->
    <div v-if="showCategoryModal" class="modal-overlay" @click.self="showCategoryModal = false">
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">商品類別管理</span>
          <button class="modal-close" type="button" @click="showCategoryModal = false">✕</button>
        </div>
        <div class="modal-search-wrap">
          <svg class="modal-search-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="categorySearch" class="modal-search-input" placeholder="搜尋類別..." />
        </div>
        <div v-if="!isAddingCategory" class="modal-add-btn" @click="startAddCategory">＋ 新增類別</div>
        <div v-else class="modal-add-row">
          <input v-model="newCategoryName" class="modal-add-input" placeholder="輸入類別名稱" @keydown.enter="confirmAddCategory" ref="newCategoryInputRef" />
          <button class="btn-confirm-cat" type="button" @click="confirmAddCategory">確認</button>
          <button class="btn-cancel-cat" type="button" @click="cancelAddCategory">取消</button>
        </div>
        <div class="modal-list">
          <div v-for="cat in filteredCategories" :key="cat.value" class="modal-list-item">
            <template v-if="editingCategoryId === cat.value">
              <input v-model="editingCategoryName" class="modal-add-input" @keydown.enter="confirmEditCategory(cat)" />
              <button class="btn-confirm-cat" type="button" @click="confirmEditCategory(cat)">確認</button>
              <button class="btn-cancel-cat" type="button" @click="editingCategoryId = null">取消</button>
            </template>
            <template v-else>
              <span class="modal-cat-name">{{ cat.label }}</span>
              <div class="modal-cat-actions">
                <button class="modal-icon-btn" type="button" @click="startEditCategory(cat)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="modal-icon-btn del" type="button" @click="deleteCategory(cat.value)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            </template>
          </div>
          <div v-if="filteredCategories.length === 0" class="modal-empty">無符合類別</div>
        </div>
        <div class="modal-footer">
          <button class="btn-modal-done" type="button" @click="showCategoryModal = false">完成</button>
        </div>
      </div>
    </div>

    <!-- 標籤管理 Modal -->
    <div v-if="showTagModal" class="modal-overlay" @click.self="showTagModal = false">
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">標籤管理</span>
          <button class="modal-close" type="button" @click="showTagModal = false">✕</button>
        </div>
        <div class="modal-search-wrap">
          <svg class="modal-search-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="tagSearch" class="modal-search-input" placeholder="搜尋標籤..." />
        </div>
        <div v-if="!isAddingTag" class="modal-add-btn" @click="startAddTag">＋ 新增標籤</div>
        <div v-else class="modal-add-row">
          <input v-model="newTagName" class="modal-add-input" placeholder="輸入標籤名稱" @keydown.enter="confirmAddTag" ref="newTagInputRef" />
          <button class="btn-confirm-cat" type="button" @click="confirmAddTag">確認</button>
          <button class="btn-cancel-cat" type="button" @click="cancelAddTag">取消</button>
        </div>
        <div class="modal-list">
          <div v-for="tag in filteredTags" :key="tag.value" class="modal-list-item">
            <template v-if="editingTagId === tag.value">
              <input v-model="editingTagName" class="modal-add-input" @keydown.enter="confirmEditTag(tag)" />
              <button class="btn-confirm-cat" type="button" @click="confirmEditTag(tag)">確認</button>
              <button class="btn-cancel-cat" type="button" @click="editingTagId = null">取消</button>
            </template>
            <template v-else>
              <span class="modal-cat-name">{{ tag.label }}</span>
              <div class="modal-cat-actions">
                <button class="modal-icon-btn" type="button" @click="startEditTag(tag)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="modal-icon-btn del" type="button" @click="deleteTag(tag.value)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            </template>
          </div>
          <div v-if="filteredTags.length === 0" class="modal-empty">無符合標籤</div>
        </div>
        <div class="modal-footer">
          <button class="btn-modal-done" type="button" @click="showTagModal = false">完成</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'
import MultiSelectTag from '@/components/MultiSelectTag.vue'
import { useTempleStore } from '@/stores/temple'

const route = useRoute()
const router = useRouter()
const templeStore = useTempleStore()

const templeId  = computed(() => route.params.templeId)
const productId = computed(() => route.params.productId)
const isEdit    = computed(() => !!productId.value)
const isSaving  = ref(false)

const breadcrumbs = computed(() => [
  { text: '後台管理' },
  { text: '活動與上架管理', onClick: goBack },
  { text: isEdit.value ? '編輯商品' : '新增商品' },
])

// ── 下拉選項 ──
const productCategories = ref([])

const productItems = ref([])

const bindableEvents = ref([])
const bindableEventOptions = computed(() => bindableEvents.value.map(e => ({ value: e.id, label: e.nameZhTw })))

const ritualDocuments = ref([])
const certificates    = ref([])

const tagOptions      = ref([])
const labelParentId   = ref(null)

// ── 主圖 ──
const mainImages    = ref([])
const isMainUploading = ref(false)

const handleMainImageUpload = async (e) => {
  const files = Array.from(e.target.files)
  if (!files.length) return
  const remaining = 5 - mainImages.value.length
  const toUpload = files.slice(0, remaining)
  e.target.value = ''

  const previews = toUpload.map(file => ({ url: URL.createObjectURL(file), file, id: null }))
  mainImages.value.push(...previews)

  isMainUploading.value = true
  try {
    const results = await templeStore.uploadMainImages(templeId.value, toUpload)
    results.forEach((res, i) => {
      const target = previews[i]
      const idx = mainImages.value.indexOf(target)
      if (idx !== -1) mainImages.value[idx] = { url: res.publicFileUrl, file: null, id: res.id }
    })
  } catch (err) {
    console.error('主圖上傳失敗:', err)
    previews.forEach(p => {
      const idx = mainImages.value.indexOf(p)
      if (idx !== -1) mainImages.value.splice(idx, 1)
    })
    alert('圖片上傳失敗，請稍後再試')
  } finally {
    isMainUploading.value = false
  }
}

const removeMainImage = (idx) => mainImages.value.splice(idx, 1)

// ── 規格 ──
let specIdCounter = 1
const defaultSpec = () => ({
  id: specIdCounter++,
  nameZhTw: '',
  price: '',
  stock: '',
  unlimitedStock: false,
  isCompanyPurchasable: false,
  shippingMode: 'FREE',
  specialShippingFee: 0,
  images: [],
})

const form = reactive({
  status:             'OPEN',
  nameZhTw:           '',
  nameZhCn:           '',
  nameEnUs:           '',
  itemId:             '',
  categoryId:         '',
  eventIds:           [],
  ritualDocumentId:   null,
  certificateId:      null,
  isInvoiceSupported: false,
  tags:               [],
  publishAt:          '',
  unpublishAt:        '',
  isPermanent:        false,
  depictionZhTw:      '',
  depictionZhCn:      '',
  depictionEnUs:      '',
  specs:              [defaultSpec()],
})

const errors = reactive({ nameZhTw: '', categoryId: '' })

const validate = () => {
  errors.nameZhTw  = form.nameZhTw.trim()  ? '' : '請填寫商品名稱'
  errors.categoryId = form.categoryId       ? '' : '請選擇商品類別'
  return !errors.nameZhTw && !errors.categoryId
}

const onUnlimitedStockChange = (spec) => {
  if (spec.unlimitedStock) spec.stock = ''
}

const addSpec    = () => form.specs.push(defaultSpec())
const removeSpec = (idx) => { if (form.specs.length > 1) form.specs.splice(idx, 1) }

const handleSpecImageUpload = async (spec, e) => {
  const files = Array.from(e.target.files)
  if (!files.length) return
  const remaining = 5 - spec.images.length
  const toUpload  = files.slice(0, remaining)
  e.target.value = ''

  const previews = toUpload.map(file => ({ url: URL.createObjectURL(file), file, id: null }))
  spec.images.push(...previews)

  try {
    const results = await templeStore.uploadSkuImages(templeId.value, toUpload)
    results.forEach((res, i) => {
      const target = previews[i]
      const idx = spec.images.indexOf(target)
      if (idx !== -1) spec.images[idx] = { url: res.publicFileUrl, file: null, id: res.id }
    })
  } catch (err) {
    console.error('規格圖片上傳失敗:', err)
    previews.forEach(p => {
      const idx = spec.images.indexOf(p)
      if (idx !== -1) spec.images.splice(idx, 1)
    })
    alert('圖片上傳失敗，請稍後再試')
  }
}

const removeSpecImage = (spec, idx) => spec.images.splice(idx, 1)

// ── 時間格式 ──
const toApiDateTime = (val) => val ? val.replace('T', ' ') + ':00' : null
const isValidDatetime = (v) => !!v && v.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(v)

// ── 填入既有資料（編輯模式）──
const fillForm = (data) => {
  form.status             = data.status || 'OPEN'
  form.nameZhTw           = data.nameZhTw || ''
  form.nameZhCn           = data.nameZhCn || ''
  form.nameEnUs           = data.nameEnUs || ''
  form.depictionZhTw      = data.depictionZhTw || ''
  form.depictionZhCn      = data.depictionZhCn || ''
  form.depictionEnUs      = data.depictionEnUs || ''
  form.isInvoiceSupported = data.isInvoiceSupported ?? false
  form.itemId             = data.itemId || ''
  form.categoryId         = data.categoryId || ''
  form.ritualDocumentId   = data.ritualDocumentId || null
  form.certificateId      = data.certificateId || null
  form.tags               = data.tags || []
  form.eventIds           = (data.events || []).map(e => e.id)
  form.publishAt          = isValidDatetime(data.publishAt)  ? data.publishAt.replace(' ', 'T').slice(0, 16)  : ''
  form.unpublishAt        = isValidDatetime(data.unpublishAt) ? data.unpublishAt.replace(' ', 'T').slice(0, 16) : ''
  form.isPermanent        = !isValidDatetime(data.publishAt) && !isValidDatetime(data.unpublishAt)
  mainImages.value        = (data.imgs || []).map(img => ({ url: img.url, file: null, id: img.id }))
  form.specs = (data.skus || []).map(sku => ({
    id:                   specIdCounter++,
    skuId:                sku.id || null,
    nameZhTw:             sku.nameZhTw || '',
    price:                sku.price ?? '',
    stock:                sku.stock === -1 ? '' : (sku.stock ?? ''),
    unlimitedStock:       sku.stock === -1,
    isCompanyPurchasable: sku.isCompanyPurchasable ?? false,
    shippingMode:         sku.shippingMode || 'FREE',
    specialShippingFee:   sku.specialShippingFee ?? 0,
    images:               (sku.imgs || []).map(img => ({ url: img.url, file: null, id: img.id })),
  }))
}

// ── 送出 ──
const buildPayload = (status) => ({
  itemId:             form.itemId     || undefined,
  categoryId:         form.categoryId || undefined,
  eventIds:           form.eventIds,
  ritualDocumentId:   form.ritualDocumentId   || undefined,
  certificateId:      form.certificateId      || undefined,
  status:             status || form.status,
  isInvoiceSupported: form.isInvoiceSupported,
  nameZhTw:           form.nameZhTw,
  nameZhCn:           form.nameZhCn || undefined,
  nameEnUs:           form.nameEnUs  || undefined,
  depictionZhTw:      form.depictionZhTw,
  depictionZhCn:      form.depictionZhCn || undefined,
  depictionEnUs:      form.depictionEnUs  || undefined,
  publishAt:          form.isPermanent ? null : toApiDateTime(form.publishAt),
  unpublishAt:        form.isPermanent ? null : toApiDateTime(form.unpublishAt),
  imgIds:             mainImages.value.map(img => img.id).filter(id => id !== null),
  skus: form.specs.map(spec => ({
    ...(spec.skuId ? { id: spec.skuId } : {}),
    nameZhTw:             spec.nameZhTw,
    price:                Number(spec.price),
    stock:                spec.unlimitedStock ? -1 : Number(spec.stock),
    isCompanyPurchasable: spec.isCompanyPurchasable,
    shippingMode:         spec.shippingMode,
    specialShippingFee:   spec.shippingMode === 'SPECIAL' ? Number(spec.specialShippingFee) : 0,
    imgIds:               spec.images.map(img => img.id).filter(id => id !== null),
  })),
})

const handleSubmit = async (status) => {
  if (!validate()) return
  isSaving.value = true
  try {
    const payload = buildPayload(status)
    if (isEdit.value) {
      console.log('PATCH 商品 payload:', JSON.stringify(payload, null, 2))
      await templeStore.updatePhysicalProduct(templeId.value, productId.value, payload)
      alert('商品更新成功')
    } else {
      await templeStore.createPhysicalProduct(templeId.value, payload)
      alert(status === 'DRAFT' ? '草稿已儲存' : '商品新增成功')
    }
    goBack()
  } catch (err) {
    console.error(isEdit.value ? '商品更新失敗:' : '商品新增失敗:', err)
    alert(err?.response?.data?.message || '操作失敗，請稍後再試')
  } finally {
    isSaving.value = false
  }
}

const goBack = () => {
  router.push({ name: 'app.temple.activity-management', params: { templeId: templeId.value }, query: { tab: 'products' } })
}

onMounted(async () => {
  const tasks = [
    templeStore.fetchBindableEvents(templeId.value)
      .then(r => { bindableEvents.value = r }),
    templeStore.fetchProductItems(templeId.value)
      .then(r => { productItems.value = r.map(i => ({ value: i.id, label: i.name })) }),
    templeStore.fetchProductCategories(templeId.value)
      .then(r => { productCategories.value = r.map(i => ({ value: i.id, label: i.name })) }),
    templeStore.fetchRitualDocuments(templeId.value)
      .then(r => { ritualDocuments.value = r.map(i => ({ id: i.id, name: i.name })) }),
    templeStore.fetchCertificates(templeId.value)
      .then(r => { certificates.value = r.map(i => ({ id: i.id, name: i.name })) }),
    templeStore.fetchLabelCategories(templeId.value)
      .then(r => { if (r.length) labelParentId.value = r[0].parentId; tagOptions.value = r.map(i => ({ value: i.id, label: i.name })) }),
  ]
  if (isEdit.value) {
    tasks.push(
      templeStore.fetchPhysicalProduct(templeId.value, productId.value)
        .then(data => { if (data) fillForm(data) })
    )
  }
  await Promise.all(tasks)
})

// ── 商品類別管理 Modal ──
const showCategoryModal   = ref(false)
const categorySearch      = ref('')
const isAddingCategory    = ref(false)
const newCategoryName     = ref('')
const newCategoryInputRef = ref(null)
const editingCategoryId   = ref(null)
const editingCategoryName = ref('')
let   catIdCounter        = 5

const filteredCategories = computed(() =>
  productCategories.value.filter(c =>
    !categorySearch.value || c.label.includes(categorySearch.value)
  )
)

const openCategoryModal = () => {
  categorySearch.value = ''
  isAddingCategory.value = false
  newCategoryName.value = ''
  editingCategoryId.value = null
  showCategoryModal.value = true
}

const startAddCategory = async () => {
  isAddingCategory.value = true
  await nextTick()
  newCategoryInputRef.value?.focus()
}

const confirmAddCategory = async () => {
  const name = newCategoryName.value.trim()
  if (!name) return
  try {
    if (!form.itemId) { alert('請先選擇商品項目，再新增商品類別'); return }
    await templeStore.createProductCategory(templeId.value, { name, parentId: form.itemId })
    const list = await templeStore.fetchProductCategories(templeId.value)
    productCategories.value = list.map(i => ({ value: i.id, label: i.name }))
    newCategoryName.value  = ''
    isAddingCategory.value = false
  } catch (err) {
    alert(err?.response?.data?.message || '新增類別失敗，請稍後再試')
  }
}

const cancelAddCategory = () => {
  newCategoryName.value  = ''
  isAddingCategory.value = false
}

const startEditCategory = (cat) => {
  editingCategoryId.value   = cat.value
  editingCategoryName.value = cat.label
}

const confirmEditCategory = (cat) => {
  const name = editingCategoryName.value.trim()
  if (!name) return
  const target = productCategories.value.find(c => c.value === cat.value)
  if (target) target.label = name
  editingCategoryId.value = null
}

const deleteCategory = (id) => {
  productCategories.value = productCategories.value.filter(c => c.value !== id)
  if (form.categoryId === id) form.categoryId = ''
}

// ── 標籤管理 Modal ──
const showTagModal   = ref(false)
const tagSearch      = ref('')
const isAddingTag    = ref(false)
const newTagName     = ref('')
const newTagInputRef = ref(null)
const editingTagId   = ref(null)
const editingTagName = ref('')

const filteredTags = computed(() =>
  tagOptions.value.filter(t =>
    !tagSearch.value || t.label.includes(tagSearch.value)
  )
)

const openTagModal = () => {
  tagSearch.value    = ''
  isAddingTag.value  = false
  newTagName.value   = ''
  editingTagId.value = null
  showTagModal.value = true
}

const startAddTag = async () => {
  isAddingTag.value = true
  await nextTick()
  newTagInputRef.value?.focus()
}

const confirmAddTag = async () => {
  const name = newTagName.value.trim()
  if (!name) return
  try {
    await templeStore.createLabelCategory(templeId.value, { name, parentId: labelParentId.value })
    const list = await templeStore.fetchLabelCategories(templeId.value)
    if (list.length) labelParentId.value = list[0].parentId
    tagOptions.value  = list.map(i => ({ value: i.id, label: i.name }))
    newTagName.value  = ''
    isAddingTag.value = false
  } catch (err) {
    alert(err?.response?.data?.message || '新增標籤失敗，請稍後再試')
  }
}

const cancelAddTag = () => {
  newTagName.value  = ''
  isAddingTag.value = false
}

const startEditTag = (tag) => {
  editingTagId.value   = tag.value
  editingTagName.value = tag.label
}

const confirmEditTag = (tag) => {
  const name = editingTagName.value.trim()
  if (!name) return
  const target = tagOptions.value.find(t => t.value === tag.value)
  if (target) {
    const oldValue = target.value
    target.label = name
    target.value = name
    const idx = form.tags.indexOf(oldValue)
    if (idx !== -1) form.tags.splice(idx, 1, name)
  }
  editingTagId.value = null
}

const deleteTag = (value) => {
  tagOptions.value = tagOptions.value.filter(t => t.value !== value)
  form.tags = form.tags.filter(v => v !== value)
}
</script>

<style scoped>
.product-form-page {
  padding: 24px 32px 40px;
  min-height: 100%;
  background: #F3F4F6;
}

.back-btn {
  display: inline-flex; align-items: center; gap: 4px;
  background: none; border: none; color: #555; font-size: 14px;
  cursor: pointer; margin-bottom: 24px; padding: 0; transition: color 0.2s;
}
.back-btn:hover { color: #E8572A; }
.back-arrow { font-size: 18px; line-height: 1; }

.form-card {
  background: #fff; border-radius: 16px; padding: 36px 40px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
}

.form-title {
  font-size: 20px; font-weight: 700; color: #1f2937;
  margin: 0 0 28px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 28px;
  margin-bottom: 20px;
}

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full-width { grid-column: 1 / -1; }

.form-label { font-size: 13px; font-weight: 600; color: #374151; }
.required { color: #E8572A; margin-left: 2px; }

.form-input {
  padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px;
  font-size: 14px; color: #1f2937; outline: none; transition: border-color 0.2s;
  background: #fff;
}
.form-input:focus { border-color: #E8572A; }
.form-input.error { border-color: #ef4444; }
.form-input:disabled { background: #f9fafb; color: #9ca3af; }

.select-wrap { position: relative; flex: 1; }
.form-select {
  width: 100%; padding: 9px 32px 9px 12px; border: 1px solid #e5e7eb;
  border-radius: 8px; font-size: 14px; color: #1f2937; outline: none;
  background: #fff; appearance: none; cursor: pointer;
}
.form-select:focus { border-color: #E8572A; }
.select-arrow {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  color: #9ca3af; pointer-events: none; font-size: 12px;
}

.input-with-btn { display: flex; gap: 8px; align-items: flex-start; }
.btn-manage {
  display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;
  padding: 9px 14px; border: 1px solid #e5e7eb; border-radius: 8px;
  background: #fff; font-size: 13px; color: #374151; cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.btn-manage:hover { border-color: #E8572A; color: #E8572A; }
.manage-icon { font-size: 14px; }

.checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #374151; cursor: pointer; }
.checkbox-input { width: 16px; height: 16px; cursor: pointer; accent-color: #E8572A; }

.field-hint { font-size: 12px; color: #9ca3af; }
.error-msg  { font-size: 12px; color: #ef4444; }

.form-textarea {
  width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px;
  font-size: 14px; color: #1f2937; outline: none; resize: vertical;
  font-family: inherit; transition: border-color 0.2s; box-sizing: border-box;
}
.form-textarea:focus { border-color: #E8572A; }

/* 主圖 */
.section-title {
  font-size: 15px; font-weight: 700; color: #1f2937;
  margin: 28px 0 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f3f4f6;
}
.main-image-section { margin-bottom: 8px; }
.image-upload-area { display: flex; flex-wrap: wrap; gap: 10px; }
.image-preview {
  position: relative; width: 100px; height: 100px;
  border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;
}
.image-preview img { width: 100%; height: 100%; object-fit: cover; }
.image-remove {
  position: absolute; top: 4px; right: 4px;
  width: 20px; height: 20px; border-radius: 50%;
  background: rgba(0,0,0,0.5); color: #fff; border: none;
  font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.image-upload-btn {
  width: 100px; height: 100px; border: 1.5px dashed #d1d5db; border-radius: 8px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  cursor: pointer; transition: border-color 0.2s; gap: 4px;
}
.image-upload-btn:hover { border-color: #E8572A; }
.image-upload-btn.uploading { cursor: default; }
.upload-plus { font-size: 22px; color: #9ca3af; line-height: 1; }
.upload-text { font-size: 12px; color: #9ca3af; }
.image-hint { font-size: 12px; color: #9ca3af; margin-top: 8px; }

/* 規格 */
.specs-list { display: flex; flex-direction: column; gap: 16px; }
.spec-card {
  position: relative; background: #f9fafb; border: 1px solid #e5e7eb;
  border-radius: 12px; padding: 24px;
}
.spec-close {
  position: absolute; top: 12px; right: 14px;
  background: none; border: none; font-size: 16px; color: #9ca3af; cursor: pointer;
}
.spec-close:hover { color: #ef4444; }
.spec-block { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.spec-block:last-child { margin-bottom: 0; }
.spec-label { font-size: 13px; font-weight: 600; color: #374151; }
.spec-row-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.spec-checks-vertical { display: flex; flex-direction: column; gap: 8px; }
.spec-sub-check { margin-top: 6px; font-size: 13px; }
.spec-divider { border: none; border-top: 1px solid #e5e7eb; margin: 14px 0; }
.special-fee-row { margin-top: 10px; display: flex; flex-direction: column; gap: 6px; }
.special-fee-input { max-width: 200px; }

.btn-add-spec {
  width: 100%; margin-top: 12px; padding: 14px;
  border: 1.5px dashed #d1d5db; border-radius: 12px;
  background: transparent; font-size: 14px; color: #6b7280;
  cursor: pointer; transition: border-color 0.2s, color 0.2s;
}
.btn-add-spec:hover { border-color: #E8572A; color: #E8572A; }

/* Actions */
.form-actions {
  display: flex; align-items: center; gap: 12px;
  margin-top: 24px; padding-bottom: 20px;
}
.btn-primary {
  padding: 10px 28px; background: #E8572A; color: #fff;
  border: none; border-radius: 50px; font-size: 15px;
  font-weight: 600; cursor: pointer; transition: background 0.2s;
}
.btn-primary:hover:not(:disabled) { background: #d04a20; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-draft {
  padding: 10px 24px; background: #fff; color: #E8572A;
  border: 1.5px solid #E8572A; border-radius: 50px; font-size: 14px;
  font-weight: 500; cursor: pointer; transition: background 0.2s;
}
.btn-draft:hover:not(:disabled) { background: #fff5f2; }
.btn-draft:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-cancel {
  padding: 10px 24px; background: #fff; color: #555;
  border: 1px solid #ddd; border-radius: 50px; font-size: 14px;
  font-weight: 500; cursor: pointer; transition: background 0.2s;
}
.btn-cancel:hover { background: #f5f5f5; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-box {
  background: #fff; border-radius: 16px; width: 480px; max-width: 92vw;
  max-height: 80vh; display: flex; flex-direction: column;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 12px;
}
.modal-title { font-size: 18px; font-weight: 700; color: #1f2937; }
.modal-close {
  background: none; border: none; font-size: 18px; color: #9ca3af;
  cursor: pointer; line-height: 1; padding: 2px 6px;
}
.modal-close:hover { color: #374151; }
.modal-search-wrap {
  display: flex; align-items: center; gap: 8px;
  margin: 0 24px 12px; padding: 8px 14px;
  border: 1px solid #e5e7eb; border-radius: 20px; background: #f9fafb;
}
.modal-search-icon { color: #9ca3af; flex-shrink: 0; }
.modal-search-input {
  flex: 1; border: none; outline: none; background: transparent;
  font-size: 14px; color: #374151;
}
.modal-add-btn {
  margin: 0 24px 4px; padding: 12px;
  border: 1.5px dashed #d1d5db; border-radius: 10px;
  text-align: center; font-size: 14px; color: #6b7280;
  cursor: pointer; transition: border-color 0.2s, color 0.2s;
}
.modal-add-btn:hover { border-color: #E8572A; color: #E8572A; }
.modal-add-row {
  display: flex; align-items: center; gap: 8px;
  margin: 0 24px 8px; padding: 4px 0;
}
.modal-add-input {
  flex: 1; padding: 8px 12px; border: 1.5px solid #E8572A;
  border-radius: 8px; font-size: 14px; outline: none;
}
.btn-confirm-cat {
  padding: 8px 16px; background: #E8572A; color: #fff;
  border: none; border-radius: 8px; font-size: 14px; cursor: pointer; white-space: nowrap;
}
.btn-confirm-cat:hover { background: #d04a20; }
.btn-cancel-cat {
  padding: 8px 14px; background: #fff; color: #555;
  border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; cursor: pointer; white-space: nowrap;
}
.btn-cancel-cat:hover { background: #f5f5f5; }
.modal-list { flex: 1; overflow-y: auto; padding: 8px 24px; }
.modal-list-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border: 1px solid #e5e7eb; border-radius: 10px;
  margin-bottom: 8px; gap: 8px;
}
.modal-cat-name { font-size: 14px; color: #1f2937; flex: 1; }
.modal-cat-actions { display: flex; gap: 8px; }
.modal-icon-btn {
  background: none; border: none; cursor: pointer; color: #9ca3af;
  padding: 4px; display: flex; align-items: center; border-radius: 4px;
}
.modal-icon-btn:hover { color: #374151; }
.modal-icon-btn.del:hover { color: #ef4444; }
.modal-empty { font-size: 14px; color: #9ca3af; text-align: center; padding: 20px 0; }
.modal-footer {
  padding: 16px 24px; border-top: 1px solid #f3f4f6;
  display: flex; justify-content: flex-end;
}
.btn-modal-done {
  padding: 10px 28px; background: #E8572A; color: #fff;
  border: none; border-radius: 50px; font-size: 15px;
  font-weight: 600; cursor: pointer;
}
.btn-modal-done:hover { background: #d04a20; }
</style>

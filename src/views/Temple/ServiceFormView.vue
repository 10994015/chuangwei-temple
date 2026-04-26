<template>
  <div class="service-form-page">
    <AppBreadcrumb :items="breadcrumbs" />

    <button class="back-btn" @click="goBack">
      <span class="back-arrow">‹</span> 返回上一頁
    </button>

    <div class="form-card">
      <h2 class="form-title">{{ isEdit ? '編輯服務資訊' : '新增服務' }}</h2>

      <!-- 服務名稱 & 服務項目 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">服務名稱 <span class="required">*</span></label>
          <input v-model="form.nameZhTw" class="form-input" :class="{ error: errors.nameZhTw }" placeholder="請輸入服務名稱" />
          <span v-if="errors.nameZhTw" class="error-msg">{{ errors.nameZhTw }}</span>
        </div>
        <div class="form-group">
          <label class="form-label">服務項目</label>
          <div class="select-wrap">
            <select v-model="form.itemId" class="form-select">
              <option value="">請選擇服務項目</option>
              <option v-for="item in serviceItems" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
            <span class="select-arrow">▾</span>
          </div>
        </div>
      </div>

      <!-- 服務類別 & 關聯活動 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">服務類別 <span class="required">*</span></label>
          <div class="input-with-btn">
            <div class="select-wrap" :class="{ error: errors.categoryId }">
              <select v-model="form.categoryId" class="form-select">
                <option value="">點擊選擇類別...</option>
                <option v-for="c in serviceCategories" :key="c.value" :value="c.value">{{ c.label }}</option>
              </select>
              <span class="select-arrow">▾</span>
            </div>
            <button class="btn-manage" type="button" @click="openCategoryModal"><span class="manage-icon">⚙</span> 服務類別管理</button>
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

      <!-- 常駐服務 -->
      <div class="form-row">
        <div class="form-group full-width">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.isPermanent" class="checkbox-input" />
            常駐服務（勾選後將忽略上下架時間限制）
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
            <input v-model="spec.nameZhTw" class="form-input" placeholder="例如：大、中、小、收驚服務、光明燈..." />
          </div>

          <div class="spec-row-2col">
            <div class="spec-block">
              <label class="spec-label">服務價格（元）<span class="required">*</span></label>
              <input v-model.number="spec.price" type="number" class="form-input" placeholder="0" />
            </div>
            <div class="spec-block">
              <label class="spec-label">報名數量 <span class="required">*</span></label>
              <input v-model.number="spec.stock" type="number" class="form-input" placeholder="0" :disabled="spec.unlimitedQty" />
              <label class="checkbox-label spec-sub-check">
                <input type="checkbox" v-model="spec.unlimitedQty" class="checkbox-input" @change="onUnlimitedQtyChange(spec)" />
                無限制報名數量
              </label>
            </div>
          </div>

          <div class="spec-divider"></div>

          <!-- 公司行號是否可以購買 -->
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

          <!-- 運費設定 -->
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

      <!-- 服務說明 -->
      <div class="form-row" style="margin-top: 24px;">
        <div class="form-group full-width">
          <label class="form-label">服務說明</label>
          <textarea v-model="form.depictionZhTw" class="form-textarea" placeholder="請輸入服務說明" rows="5"></textarea>
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

    <!-- 服務類別管理 Modal -->
    <div v-if="showCategoryModal" class="modal-overlay" @click.self="showCategoryModal = false">
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">服務類別管理</span>
          <button class="modal-close" type="button" @click="showCategoryModal = false">✕</button>
        </div>

        <!-- 搜尋 -->
        <div class="modal-search-wrap">
          <svg class="modal-search-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="categorySearch" class="modal-search-input" placeholder="搜尋類別..." />
        </div>

        <!-- 新增類別按鈕 / 輸入列 -->
        <div v-if="!isAddingCategory" class="modal-add-btn" @click="startAddCategory">
          ＋ 新增類別
        </div>
        <div v-else class="modal-add-row">
          <input v-model="newCategoryName" class="modal-add-input" placeholder="輸入類別名稱" @keydown.enter="confirmAddCategory" ref="newCategoryInputRef" />
          <button class="btn-confirm-cat" type="button" @click="confirmAddCategory">確認</button>
          <button class="btn-cancel-cat" type="button" @click="cancelAddCategory">取消</button>
        </div>

        <!-- 類別列表 -->
        <div class="modal-list">
          <div
            v-for="cat in filteredCategories"
            :key="cat.value"
            class="modal-list-item"
          >
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

        <div v-if="!isAddingTag" class="modal-add-btn" @click="startAddTag">
          ＋ 新增標籤
        </div>
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

const templeId = computed(() => route.params.templeId)
const serviceId = computed(() => route.params.serviceId)
const isEdit = computed(() => !!serviceId.value)
const isSaving = ref(false)

const breadcrumbs = computed(() => [
  { text: '後台管理' },
  { text: '活動與上架管理', onClick: goBack },
  { text: isEdit.value ? '編輯服務' : '新增服務' },
])

const serviceCategories = ref([])

// ── 服務類別管理 Modal ──
const showCategoryModal   = ref(false)
const categorySearch      = ref('')
const isAddingCategory    = ref(false)
const newCategoryName     = ref('')
const newCategoryInputRef = ref(null)
const editingCategoryId   = ref(null)
const editingCategoryName = ref('')


const filteredCategories = computed(() =>
  serviceCategories.value.filter(c =>
    !categorySearch.value || c.label.includes(categorySearch.value)
  )
)

const openCategoryModal = () => {
  categorySearch.value    = ''
  isAddingCategory.value  = false
  newCategoryName.value   = ''
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
    if (!form.itemId) { alert('請先選擇服務項目，再新增服務類別'); return }
    await templeStore.createServiceCategory(templeId.value, { name, parentId: form.itemId })
    const list = await templeStore.fetchServiceCategories(templeId.value)
    serviceCategories.value = list.map(i => ({ value: i.id, label: i.name }))
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
  const target = serviceCategories.value.find(c => c.value === cat.value)
  if (target) target.label = name
  editingCategoryId.value = null
}

const deleteCategory = (id) => {
  serviceCategories.value = serviceCategories.value.filter(c => c.value !== id)
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
    // 同步更新 form.tags 中舊值
    const idx = form.tags.indexOf(oldValue)
    if (idx !== -1) form.tags.splice(idx, 1, name)
  }
  editingTagId.value = null
}

const deleteTag = (value) => {
  tagOptions.value = tagOptions.value.filter(t => t.value !== value)
  form.tags = form.tags.filter(v => v !== value)
}

const serviceItems = ref([])

const bindableEvents = ref([])
const bindableEventOptions = computed(() =>
  bindableEvents.value.map(e => ({ value: e.id, label: e.nameZhTw }))
)

const ritualDocuments = ref([
  { id: 1, name: '標準疏文' },
  { id: 2, name: '自訂疏文' },
])

const certificates = ref([
  { id: 1, name: '標準感謝狀' },
])

const tagOptions    = ref([])
const labelParentId = ref(null)

const mainImages = ref([])

const form = reactive({
  itemId: '',
  nameZhTw: '',
  categoryId: '',
  eventIds: [],
  ritualDocumentId: null,
  certificateId: null,
  isInvoiceSupported: false,
  tags: [],
  publishAt: '',
  unpublishAt: '',
  isPermanent: false,
  depictionZhTw: '',
  specs: [],
})

const errors = reactive({ nameZhTw: '' })


let specIdCounter = 0

const addSpec = () => {
  form.specs.push({
    id: ++specIdCounter,
    nameZhTw: '',
    price: '',
    stock: '',
    unlimitedQty: false,
    isCompanyPurchasable: false,
    shippingMode: 'FREE',
    specialShippingFee: 0,
    images: [],
  })
}

const removeSpec = (idx) => form.specs.splice(idx, 1)

const onUnlimitedQtyChange = (spec) => {
  spec.stock = spec.unlimitedQty ? -1 : ''
}

const isMainUploading = ref(false)

const handleMainImageUpload = async (event) => {
  const files = Array.from(event.target.files)
  const remaining = 5 - mainImages.value.length
  const toUpload = files.slice(0, remaining)
  event.target.value = ''
  if (!toUpload.length) return

  // 先顯示本地預覽
  const previews = toUpload.map(file => ({ url: URL.createObjectURL(file), file, id: null }))
  mainImages.value.push(...previews)

  isMainUploading.value = true
  try {
    const results = await templeStore.uploadMainImages(templeId.value, toUpload)
    // 把回傳的 id 和 url 填回對應的預覽項目
    results.forEach((res, i) => {
      const target = previews[i]
      const idx = mainImages.value.indexOf(target)
      if (idx !== -1) {
        mainImages.value[idx] = { url: res.publicFileUrl, file: null, id: res.id }
      }
    })
  } catch (err) {
    console.error('主圖上傳失敗:', err)
    // 移除上傳失敗的預覽
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

const handleSpecImageUpload = async (spec, event) => {
  const files = Array.from(event.target.files)
  const remaining = 5 - spec.images.length
  const toUpload = files.slice(0, remaining)
  event.target.value = ''
  if (!toUpload.length) return

  const previews = toUpload.map(file => ({ url: URL.createObjectURL(file), file, id: null }))
  spec.images.push(...previews)

  try {
    const results = await templeStore.uploadSkuImages(templeId.value, toUpload)
    results.forEach((res, i) => {
      const target = previews[i]
      const idx = spec.images.indexOf(target)
      if (idx !== -1) {
        spec.images[idx] = { url: res.publicFileUrl, file: null, id: res.id }
      }
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

const removeSpecImage = (spec, imgIdx) => spec.images.splice(imgIdx, 1)

const validate = () => {
  errors.nameZhTw = ''
  let valid = true
  if (!form.nameZhTw.trim()) { errors.nameZhTw = '請輸入服務名稱'; valid = false }
  return valid
}

// datetime-local 回傳 "2026-04-01T10:00"，API 要 "2026-04-01 10:00:00"
const toApiDateTime = (val) => {
  if (!val) return null
  return val.replace('T', ' ') + (val.length === 16 ? ':00' : '')
}

const buildPayload = (status) => ({
  itemId: form.itemId,
  categoryId: form.categoryId,
  eventIds: form.eventIds,
  ritualDocumentId: form.ritualDocumentId || null,
  certificateId: form.certificateId || null,
  isInvoiceSupported: form.isInvoiceSupported,
  nameZhTw: form.nameZhTw,
  depictionZhTw: form.depictionZhTw,
  publishAt: form.isPermanent ? null : toApiDateTime(form.publishAt),
  unpublishAt: form.isPermanent ? null : toApiDateTime(form.unpublishAt),
  imgIds: mainImages.value.map(img => img.id).filter(id => id !== null),
  status,
  tags: form.tags,
  skus: form.specs.map(spec => ({
    nameZhTw: spec.nameZhTw,
    price: Number(spec.price),
    stock: spec.unlimitedQty ? -1 : Number(spec.stock),
    isCompanyPurchasable: spec.isCompanyPurchasable,
    shippingMode: spec.shippingMode,
    specialShippingFee: spec.shippingMode === 'SPECIAL' ? Number(spec.specialShippingFee) : 0,
    imgIds: spec.images.map(img => img.id).filter(id => id !== null),
  })),
})

const handleSubmit = async (status) => {
  if (!validate()) return
  isSaving.value = true
  try {
    const payload = buildPayload(status)
    console.log('送出 payload:', JSON.stringify(payload, null, 2))
    if (isEdit.value) {
      await templeStore.updateService(templeId.value, serviceId.value, payload)
      alert('服務更新成功')
    } else {
      await templeStore.createService(templeId.value, payload)
      alert(status === 'DRAFT' ? '草稿已儲存' : '服務新增成功')
    }
    goBack()
  } catch (err) {
    console.error('服務操作失敗:', err)
    alert(err?.response?.data?.message || '操作失敗，請稍後再試')
  } finally {
    isSaving.value = false
  }
}

const goBack = () => {
  router.push({ name: 'app.temple.activity-management', params: { templeId: templeId.value } })
}

onMounted(async () => {
  templeStore.fetchServiceItems(templeId.value)
    .then(r => { serviceItems.value = r.map(i => ({ value: i.id, label: i.name })) })
  templeStore.fetchServiceCategories(templeId.value)
    .then(r => { serviceCategories.value = r.map(i => ({ value: i.id, label: i.name })) })
  templeStore.fetchLabelCategories(templeId.value)
    .then(r => { if (r.length) labelParentId.value = r[0].parentId; tagOptions.value = r.map(i => ({ value: i.id, label: i.name })) })

  // 載入可綁定活動（編輯帶 productId，新增不帶）
  bindableEvents.value = await templeStore.fetchBindableEvents(
    templeId.value,
    serviceId.value || null,
  )

  if (isEdit.value) {
    try {
      const data = await templeStore.fetchService(templeId.value, serviceId.value)
      if (!data) return
      form.nameZhTw           = data.nameZhTw || ''
      form.depictionZhTw      = data.depictionZhTw || ''
      form.isInvoiceSupported = data.isInvoiceSupported ?? false
      form.eventIds           = (data.events || []).map(e => e.id)
      form.publishAt          = data.publishAt ? data.publishAt.replace(' ', 'T').slice(0, 16) : ''
      form.unpublishAt        = data.unpublishAt ? data.unpublishAt.replace(' ', 'T').slice(0, 16) : ''
      form.isPermanent        = !data.publishAt && !data.unpublishAt

      mainImages.value = (data.imgs || []).map(img => ({ url: img.url, file: null, id: img.id }))

      form.specs = (data.skus || []).map(sku => ({
        id: ++specIdCounter,
        nameZhTw: sku.nameZhTw || '',
        price: sku.price ?? '',
        stock: sku.stock === -1 ? '' : (sku.stock ?? ''),
        unlimitedQty: sku.stock === -1,
        isCompanyPurchasable: sku.isCompanyPurchasable ?? false,
        shippingMode: sku.shippingMode || 'FREE',
        specialShippingFee: sku.specialShippingFee ?? 0,
        images: (sku.imgs || []).map(img => ({ url: img.url, file: null, id: img.id })),
      }))
    } catch (err) {
      console.error('載入服務資料失敗:', err)
    }
  }
})
</script>

<style scoped>
.service-form-page {
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
.form-title { font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin: 0 0 32px; }

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
.form-input:disabled { background: #f5f5f5; color: #aaa; cursor: not-allowed; }

.form-textarea {
  padding: 12px 16px; border: 1px solid #e0e0e0; border-radius: 10px;
  font-size: 14px; color: #333; background: #fff; resize: vertical;
  outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box; width: 100%; font-family: inherit; line-height: 1.6;
}
.form-textarea:focus { border-color: #E8572A; box-shadow: 0 0 0 3px rgba(232,87,42,0.08); }

.select-wrap { position: relative; flex: 1; }
.form-select {
  width: 100%; padding: 11px 40px 11px 16px; border: 1px solid #e0e0e0;
  border-radius: 10px; font-size: 14px; color: #333; background: #fff;
  appearance: none; cursor: pointer; outline: none;
  transition: border-color 0.2s; box-sizing: border-box;
}
.form-select[multiple] { padding: 8px 12px; height: auto; appearance: auto; }
.form-select:focus { border-color: #E8572A; }
.select-wrap.error .form-select { border-color: #e53e3e; }
.select-arrow {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  color: #aaa; pointer-events: none; font-size: 12px;
}

.field-hint { font-size: 12px; color: #aaa; margin-top: 4px; }

.input-with-btn { display: flex; align-items: stretch; gap: 10px; }
.btn-manage {
  display: inline-flex; align-items: center; gap: 5px; padding: 0 16px;
  background: #fff; border: 1.5px solid #E8572A; border-radius: 10px;
  color: #E8572A; font-size: 13px; font-weight: 500; cursor: pointer;
  white-space: nowrap; transition: background 0.15s;
}
.btn-manage:hover { background: #fff3ef; }
.manage-icon { font-size: 13px; }

.checkbox-label {
  display: inline-flex; align-items: center; gap: 8px;
  cursor: pointer; font-size: 14px; color: #444; user-select: none;
}
.checkbox-input {
  accent-color: #E8572A; width: 15px; height: 15px; cursor: pointer; flex-shrink: 0;
}

.error-msg { font-size: 12px; color: #e53e3e; margin-top: 4px; }

.section-title { font-size: 15px; font-weight: 700; color: #1a1a1a; margin: 28px 0 16px; }

/* 主圖上傳 */
.main-image-section { margin-bottom: 8px; }

/* 規格卡片 */
.specs-list { display: flex; flex-direction: column; gap: 0; }

.spec-card {
  position: relative;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 14px;
  padding: 28px 32px;
  margin-bottom: 16px;
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

.spec-row-2col {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 16px 32px; margin-bottom: 0;
}

.spec-sub-check { margin-top: 8px; font-size: 13px; color: #888; }

.spec-divider { height: 1px; background: #f0f0f0; margin: 20px 0; }

.spec-checks-vertical { display: flex; flex-direction: column; gap: 10px; padding-top: 4px; }

.special-fee-row { margin-top: 14px; display: flex; flex-direction: column; gap: 6px; }
.special-fee-input { max-width: 200px; }

/* 圖片上傳 */
.image-upload-area { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; }

.image-preview {
  position: relative; width: 200px; height: 200px;
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
  width: 200px; height: 200px;
  border: 1.5px dashed #c8c8c8; border-radius: 16px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  cursor: pointer; background: #f8f8f8;
  transition: border-color 0.2s, background 0.2s; gap: 8px;
}
.image-upload-btn:hover { border-color: #E8572A; background: #fff8f6; }
.image-upload-btn.uploading { cursor: default; border-color: #e0e0e0; background: #f8f8f8; }
.upload-plus { font-size: 22px; color: #bbb; line-height: 1; }
.upload-text { font-size: 13px; color: #aaa; }
.image-hint { font-size: 12px; color: #aaa; margin-top: 8px; }

.btn-add-spec {
  display: block; width: 100%;
  padding: 18px; margin-top: 16px;
  background: #fff;
  border: 1.5px dashed #d0d0d0; border-radius: 14px;
  color: #888; font-size: 14px; cursor: pointer;
  text-align: center; transition: border-color 0.2s, color 0.2s, background 0.2s;
}
.btn-add-spec:hover { border-color: #E8572A; color: #E8572A; background: #fff8f6; }

.form-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 28px;
  padding-bottom: 40px;
}

.btn-primary {
  padding: 10px 28px; background: #E8572A; color: #fff;
  border: none; border-radius: 50px; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: background 0.2s;
}
.btn-primary:hover:not(:disabled) { background: #d14a1f; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-draft {
  padding: 10px 24px; background: #fff; color: #555;
  border: 1px solid #ddd; border-radius: 50px; font-size: 14px;
  font-weight: 500; cursor: pointer; transition: background 0.2s;
}
.btn-draft:hover:not(:disabled) { background: #f5f5f5; }
.btn-draft:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-cancel {
  padding: 10px 24px; background: #fff; color: #555;
  border: 1px solid #ddd; border-radius: 50px; font-size: 14px;
  font-weight: 500; cursor: pointer; transition: background 0.2s;
}
.btn-cancel:hover { background: #f5f5f5; }

/* ── 服務類別管理 Modal ── */
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
.modal-search-icon { font-size: 14px; color: #9ca3af; }
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
.modal-list {
  flex: 1; overflow-y: auto; padding: 8px 24px;
}
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
  transition: color 0.2s;
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

<template>
  <div class="lamp-form-page">
    <AppBreadcrumb :items="breadcrumbs" />

    <button class="back-btn" @click="goBack">
      <span class="back-arrow">‹</span> 返回上一頁
    </button>

    <div class="form-card">
      <h2 class="form-title">新增燈種</h2>

      <!-- 燈種名稱 / 項目 / 服務類別 -->
      <div class="form-row form-row-3">
        <div class="form-group">
          <label class="form-label">燈種名稱 <span class="required">*</span></label>
          <input v-model="form.nameZhTw" class="form-input" :class="{ error: errors.nameZhTw }" placeholder="請輸入燈種名稱" />
          <span v-if="errors.nameZhTw" class="error-msg">{{ errors.nameZhTw }}</span>
        </div>
        <div class="form-group">
          <label class="form-label">項目 <span class="required">*</span></label>
          <div class="select-wrap">
            <select v-model="form.itemId" class="form-select" :class="{ error: errors.itemId }">
              <option value="">點擊選擇項目...</option>
              <option v-for="item in items" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
            <span class="select-arrow">▾</span>
          </div>
          <span v-if="errors.itemId" class="error-msg">{{ errors.itemId }}</span>
        </div>
        <div class="form-group">
          <label class="form-label">服務類別 <span class="required">*</span></label>
          <div class="input-with-btn">
            <div class="select-wrap" style="flex:1">
              <select v-model="form.categoryId" class="form-select" :class="{ error: errors.categoryId }">
                <option value="">點擊選擇類別...</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
              <span class="select-arrow">▾</span>
            </div>
            <button class="btn-manage" type="button" @click="openCategoryModal">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 1 0 4.93 19.07 10 10 0 0 0 19.07 4.93z"/></svg>
              服務類別管理
            </button>
          </div>
          <span v-if="errors.categoryId" class="error-msg">{{ errors.categoryId }}</span>
        </div>
      </div>

      <!-- 關聯活動 / 標籤類別 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">關聯活動</label>
          <MultiSelectTag v-model="form.eventIds" :options="events" placeholder="點擊選擇活動..." />
        </div>
        <div class="form-group">
          <label class="form-label">標籤類別</label>
          <div class="input-with-btn">
            <div style="flex:1">
              <MultiSelectTag v-model="form.tagIds" :options="tags" placeholder="點擊選擇標籤..." />
            </div>
            <button class="btn-manage" type="button" @click="openTagModal">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 1 0 4.93 19.07 10 10 0 0 0 19.07 4.93z"/></svg>
              標籤管理
            </button>
          </div>
        </div>
      </div>

      <!-- 上架時間 / 下架時間 / 是否開發票 -->
      <div class="form-row form-row-3">
        <div class="form-group">
          <label class="form-label">上架時間</label>
          <input v-model="form.publishAt" type="datetime-local" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">下架時間</label>
          <input v-model="form.unpublishAt" type="datetime-local" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">是否開發票</label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.isInvoiceSupported" class="checkbox-input" />
            開發票
          </label>
        </div>
      </div>

      <!-- 特殊號設定 -->
      <div class="section-title">特殊號設定（選填）</div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">特殊號碼設定（以逗號間隔）</label>
          <input v-model="form.specialSlotNumbers" class="form-input" placeholder="888,1688,..." />
        </div>
        <div class="form-group">
          <label class="form-label">特殊號商品價格（元）</label>
          <input v-model.number="form.specialSlotPrice" type="number" min="0" class="form-input" placeholder="0" />
        </div>
      </div>
    </div>

    <!-- 商品頁設定 -->
    <div class="form-card">
      <div class="section-title" style="margin-top:0">商品頁設定</div>

      <div class="sub-label">商品頁首圖</div>
      <div class="image-upload-area">
        <div v-for="(img, idx) in mainImages" :key="idx" class="image-preview">
          <img :src="img.url" alt="preview" />
          <button class="image-remove" type="button" @click="removeMainImage(idx)">✕</button>
        </div>
        <label v-if="mainImages.length < 1 && !isMainUploading" class="image-upload-btn" for="main-img-upload">
          <span class="upload-plus">+</span>
          <span class="upload-text">新增圖片</span>
          <input id="main-img-upload" type="file" accept="image/*" style="display:none" @change="handleMainImageUpload" />
        </label>
        <div v-if="isMainUploading" class="image-upload-btn uploading">
          <span class="upload-text">上傳中...</span>
        </div>
      </div>
      <div class="image-hint">建議尺寸 800x600 像素</div>

      <div class="form-group" style="margin-top:20px">
        <label class="form-label">燈種說明</label>
        <textarea v-model="form.depictionZhTw" class="form-textarea" placeholder="請輸入說明文字..." rows="4"></textarea>
      </div>
    </div>

    <!-- 規格設定 -->
    <div class="form-card">
      <div class="section-title" style="margin-top:0">規格設定</div>

      <div v-for="(spec, idx) in form.specs" :key="idx" class="spec-card">
        <div class="spec-name-badge">{{ spec.nameZhTw }}</div>

        <!-- 商品價格 / 光明燈頁面選號加價 -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">商品價格（元）<span class="required">*</span></label>
            <input v-model.number="spec.price" type="number" min="0" class="form-input" placeholder="0" />
          </div>
          <div class="form-group">
            <label class="form-label">光明燈頁面選號加價（元）</label>
            <input v-model.number="spec.slotSelectFee" type="number" min="0" class="form-input" placeholder="0" />
          </div>
        </div>

        <!-- 公司行號 -->
        <div>
          <div class="sub-label">公司行號是否可以購買</div>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" v-model="spec.isCompanyPurchasable" :value="true" class="radio-input" />
              是
            </label>
            <label class="radio-label">
              <input type="radio" v-model="spec.isCompanyPurchasable" :value="false" class="radio-input" />
              否
            </label>
          </div>
        </div>

        <!-- 規格圖片 -->
        <div class="sub-label" style="margin-top:16px">規格圖片</div>
        <div class="image-upload-area">
          <div v-for="(img, imgIdx) in spec.images" :key="imgIdx" class="image-preview">
            <img :src="img.url" alt="preview" />
            <button class="image-remove" type="button" @click="removeSpecImage(idx, imgIdx)">✕</button>
          </div>
          <label v-if="spec.images.length < 1 && !spec.isUploading" class="image-upload-btn" :for="`spec-img-${idx}`">
            <span class="upload-plus">+</span>
            <span class="upload-text">新增圖片</span>
            <input :id="`spec-img-${idx}`" type="file" accept="image/*" style="display:none" @change="handleSpecImageUpload($event, idx)" />
          </label>
          <div v-if="spec.isUploading" class="image-upload-btn uploading">
            <span class="upload-text">上傳中...</span>
          </div>
        </div>
        <div class="image-hint">建議尺寸 800x800 像素</div>
      </div>
    </div>

    <!-- 服務類別管理 Modal -->
    <div v-if="showCategoryModal" class="modal-overlay" @click.self="showCategoryModal = false">
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">服務類別管理</span>
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
          <div v-for="cat in filteredCategories" :key="cat.id" class="modal-list-item">
            <template v-if="editingCategoryId === cat.id">
              <input v-model="editingCategoryName" class="modal-add-input" @keydown.enter="confirmEditCategory(cat)" />
              <button class="btn-confirm-cat" type="button" @click="confirmEditCategory(cat)">確認</button>
              <button class="btn-cancel-cat" type="button" @click="editingCategoryId = null">取消</button>
            </template>
            <template v-else>
              <span class="modal-cat-name">{{ cat.name }}</span>
              <div class="modal-cat-actions">
                <button class="modal-icon-btn" type="button" @click="startEditCategory(cat)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="modal-icon-btn del" type="button" @click="deleteCategory(cat.id)">
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

    <div class="form-actions">
      <button class="btn-primary" type="button" @click="handleSubmit('OPEN')" :disabled="isSaving">
        {{ isSaving ? '送出中...' : '確認新增' }}
      </button>
      <button class="btn-draft" type="button" @click="handleSubmit('DRAFT')" :disabled="isSaving">儲存為草稿</button>
      <button class="btn-cancel" type="button" @click="goBack">取消</button>
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
const isSaving = ref(false)

const breadcrumbs = computed(() => [
  { text: '後台管理' },
  { text: '活動與上架管理', onClick: goBack },
  { text: '新增燈種' },
])

// ── 假資料 ──
const items = ref([
  { id: 'item-001', name: '光明燈' },
  { id: 'item-002', name: '太歲燈' },
  { id: 'item-003', name: '平安燈' },
])
const categories = ref([
  { id: 'cat-001', name: '光明燈服務' },
  { id: 'cat-002', name: '太歲服務' },
  { id: 'cat-003', name: '平安服務' },
])
const events = ref([])
const tags          = ref([])
const labelParentId = ref(null)

// ── 主圖 ──
const mainImages     = ref([])
const isMainUploading = ref(false)

const handleMainImageUpload = async (event) => {
  const file = event.target.files[0]
  event.target.value = ''
  if (!file) return
  const preview = { url: URL.createObjectURL(file), file, id: null }
  mainImages.value = [preview]
  isMainUploading.value = true
  try {
    const results = await templeStore.uploadMainImages(templeId.value, [file])
    if (results[0]) mainImages.value = [{ url: results[0].publicFileUrl, file: null, id: results[0].id }]
  } catch {
    mainImages.value = []
    alert('圖片上傳失敗，請稍後再試')
  } finally { isMainUploading.value = false }
}
const removeMainImage = () => { mainImages.value = [] }

// ── 規格圖片上傳 ──
const handleSpecImageUpload = async (event, specIdx) => {
  const file = event.target.files[0]
  event.target.value = ''
  if (!file) return
  const spec = form.specs[specIdx]
  const preview = { url: URL.createObjectURL(file), file, id: null }
  spec.images = [preview]
  spec.isUploading = true
  try {
    const results = await templeStore.uploadSkuImages(templeId.value, [file])
    if (results[0]) spec.images = [{ url: results[0].publicFileUrl, file: null, id: results[0].id }]
  } catch {
    spec.images = []
    alert('圖片上傳失敗，請稍後再試')
  } finally { spec.isUploading = false }
}
const removeSpecImage = (specIdx, imgIdx) => { form.specs[specIdx].images.splice(imgIdx, 1) }

// ── 表單 ──
const newSpec = (name) => ({
  nameZhTw:            name,
  price:               0,
  slotSelectFee:       0,
  isCompanyPurchasable: false,
  images:              [],
  isUploading:         false,
})

const form = reactive({
  nameZhTw:           '',
  itemId:             '',
  categoryId:         '',
  eventIds:           [],
  tagIds:             [],
  publishAt:          '',
  unpublishAt:        '',
  isInvoiceSupported: false,
  specialSlotNumbers: '',
  specialSlotPrice:   0,
  depictionZhTw:      '',
  specs: [
    newSpec('經典號'),
    newSpec('選位號'),
    newSpec('特殊號'),
  ],
})

const errors = reactive({ nameZhTw: '', itemId: '', categoryId: '' })

const validate = () => {
  errors.nameZhTw   = form.nameZhTw.trim()  ? '' : '請填寫燈種名稱'
  errors.itemId     = form.itemId            ? '' : '請選擇項目'
  errors.categoryId = form.categoryId        ? '' : '請選擇服務類別'
  return !errors.nameZhTw && !errors.itemId && !errors.categoryId
}

const handleSubmit = async (status) => {
  if (!validate()) return
  isSaving.value = true
  try {
    const payload = {
      nameZhTw:    form.nameZhTw,
      itemId:      form.itemId,
      categoryId:  form.categoryId,
      eventIds:    form.eventIds,
      publishAt:   form.publishAt   ? form.publishAt.replace('T', ' ')   + ':00' : null,
      unpublishAt: form.unpublishAt ? form.unpublishAt.replace('T', ' ') + ':00' : null,
      depictionZhTw:      form.depictionZhTw,
      isInvoiceSupported: form.isInvoiceSupported,
      ritualDocumentId:   null,
      certificateId:      null,
      status,
      specialSlotNumberJson: form.specialSlotNumbers
        ? form.specialSlotNumbers.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      imgIds: mainImages.value.map(i => i.id).filter(id => id !== null),
      skus: form.specs.map(s => ({
        nameZhTw:             s.nameZhTw,
        price:                Number(s.price),
        stock:                0,
        shippingMode:         'FREE',
        specialShippingFee:   null,
        isCompanyPurchasable: s.isCompanyPurchasable,
        imgIds:               s.images.map(i => i.id).filter(id => id !== null),
      })),
    }
    await templeStore.createLampProduct(templeId.value, payload)
    alert(status === 'DRAFT' ? '草稿已儲存' : '燈種新增成功')
    goBack()
  } catch (err) {
    console.error('燈種新增失敗:', err)
    alert(err?.response?.data?.message || '操作失敗，請稍後再試')
  } finally { isSaving.value = false }
}

// ── 服務類別管理 Modal ──
const showCategoryModal   = ref(false)
const categorySearch      = ref('')
const isAddingCategory    = ref(false)
const newCategoryName     = ref('')
const newCategoryInputRef = ref(null)
const editingCategoryId   = ref(null)
const editingCategoryName = ref('')
let   catIdCounter        = 100

const filteredCategories = computed(() =>
  categories.value.filter(c => !categorySearch.value || c.name.includes(categorySearch.value))
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
const confirmAddCategory = () => {
  const name = newCategoryName.value.trim()
  if (!name) return
  categories.value.push({ id: `cat-${catIdCounter++}`, name })
  newCategoryName.value  = ''
  isAddingCategory.value = false
}
const cancelAddCategory = () => {
  newCategoryName.value  = ''
  isAddingCategory.value = false
}
const startEditCategory = (cat) => {
  editingCategoryId.value   = cat.id
  editingCategoryName.value = cat.name
}
const confirmEditCategory = (cat) => {
  const name = editingCategoryName.value.trim()
  if (!name) return
  const target = categories.value.find(c => c.id === cat.id)
  if (target) target.name = name
  editingCategoryId.value = null
}
const deleteCategory = (id) => {
  categories.value = categories.value.filter(c => c.id !== id)
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
  tags.value.filter(t => !tagSearch.value || t.label.includes(tagSearch.value))
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
    tags.value        = list.map(i => ({ value: i.id, label: i.name }))
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
  const target = tags.value.find(t => t.value === tag.value)
  if (target) target.label = name
  editingTagId.value = null
}
const deleteTag = (value) => {
  tags.value = tags.value.filter(t => t.value !== value)
  form.tagIds = form.tagIds.filter(v => v !== value)
}

const goBack = () => {
  router.push({ name: 'app.temple.activity-management', params: { templeId: templeId.value }, query: { tab: 'lanterns' } })
}

onMounted(async () => {
  const data = await templeStore.fetchBindableEvents(templeId.value)
  events.value = data.map(e => ({ value: e.id, label: e.nameZhTw }))
  templeStore.fetchLabelCategories(templeId.value)
    .then(r => { if (r.length) labelParentId.value = r[0].parentId; tags.value = r.map(i => ({ value: i.id, label: i.name })) })
})
</script>

<style scoped>
.lamp-form-page { padding: 24px 32px 60px; min-height: 100%; background: #F3F4F6; }
.back-btn { display: inline-flex; align-items: center; gap: 4px; background: none; border: none; color: #E8572A; font-size: 14px; cursor: pointer; margin-bottom: 16px; padding: 0; font-weight: 500; }
.back-btn:hover { opacity: 0.75; }
.back-arrow { font-size: 16px; }
.form-card { background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 20px; }
.form-title { font-size: 1.2rem; font-weight: 700; color: #1a1a1a; margin: 0 0 28px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.form-row-3 { grid-template-columns: 1fr 1fr 1.4fr; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 500; color: #555; }
.required { color: #E8572A; }
.form-input { padding: 10px 14px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 14px; color: #333; background: #fff; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
.form-input:focus { border-color: #E8572A; box-shadow: 0 0 0 3px rgba(232,87,42,0.08); }
.form-input.error { border-color: #e53e3e; }
.error-msg { font-size: 12px; color: #e53e3e; }
.select-wrap { position: relative; }
.form-select { width: 100%; padding: 10px 36px 10px 14px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 14px; color: #333; background: #fff; appearance: none; outline: none; cursor: pointer; }
.form-select.error { border-color: #e53e3e; }
.form-select:focus { border-color: #E8572A; }
.select-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #888; font-size: 12px; }
.input-with-btn { display: flex; gap: 8px; align-items: flex-start; }
.btn-manage { display: flex; align-items: center; gap: 5px; padding: 10px 14px; background: #fff; border: 1px solid #E8572A; border-radius: 10px; font-size: 13px; color: #E8572A; cursor: pointer; white-space: nowrap; flex-shrink: 0; transition: background 0.2s; }
.btn-manage:hover { background: #fff5f2; }
.section-title { font-size: 15px; font-weight: 600; color: #1a1a1a; margin: 0 0 16px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0; }
.sub-label { font-size: 13px; font-weight: 500; color: #555; margin-bottom: 8px; }
.image-upload-area { display: flex; flex-wrap: wrap; gap: 12px; }
.image-preview { position: relative; width: 120px; height: 120px; border-radius: 10px; overflow: hidden; border: 1px solid #e0e0e0; }
.image-preview img { width: 100%; height: 100%; object-fit: cover; }
.image-remove { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.45); color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.image-upload-btn { width: 120px; height: 120px; border: 1.5px dashed #c8c8c8; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; background: #fafafa; gap: 4px; transition: border-color 0.2s; }
.image-upload-btn:hover { border-color: #E8572A; background: #fff8f6; }
.image-upload-btn.uploading { cursor: default; }
.upload-plus { font-size: 24px; color: #bbb; line-height: 1; }
.upload-text { font-size: 12px; color: #aaa; }
.image-hint { font-size: 12px; color: #aaa; margin-top: 6px; }
.form-textarea { padding: 12px 14px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 14px; color: #333; resize: vertical; outline: none; width: 100%; box-sizing: border-box; font-family: inherit; }
.form-textarea:focus { border-color: #E8572A; box-shadow: 0 0 0 3px rgba(232,87,42,0.08); }
/* 規格 */
.spec-card { border: 1px solid #eee; border-radius: 12px; padding: 24px; margin-bottom: 16px; background: #fafafa; }
.spec-name-badge { display: inline-block; padding: 4px 14px; background: #E8572A; color: #fff; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
.radio-group { display: flex; flex-direction: row; gap: 24px; }
.radio-label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #333; cursor: pointer; }
.radio-input { accent-color: #E8572A; width: 15px; height: 15px; cursor: pointer; }
.checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #333; cursor: pointer; padding-top: 4px; }
.checkbox-input { width: 15px; height: 15px; accent-color: #E8572A; cursor: pointer; }
/* 底部操作 */
.form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-bottom: 20px; }
.btn-primary { padding: 10px 28px; background: #E8572A; color: #fff; border: none; border-radius: 50px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover:not(:disabled) { background: #d14a1f; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-draft { padding: 10px 24px; background: #fff; color: #E8572A; border: 1px solid #E8572A; border-radius: 50px; font-size: 14px; font-weight: 500; cursor: pointer; }
.btn-draft:hover:not(:disabled) { background: #fff5f2; }
.btn-cancel { padding: 10px 24px; background: #fff; color: #555; border: 1px solid #ddd; border-radius: 50px; font-size: 14px; font-weight: 500; cursor: pointer; }
.btn-cancel:hover { background: #f5f5f5; }
/* ── Modals ── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-box { background: #fff; border-radius: 16px; width: 480px; max-width: 92vw; max-height: 80vh; display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 12px; }
.modal-title { font-size: 18px; font-weight: 700; color: #1f2937; }
.modal-close { background: none; border: none; font-size: 18px; color: #9ca3af; cursor: pointer; line-height: 1; padding: 2px 6px; }
.modal-close:hover { color: #374151; }
.modal-search-wrap { display: flex; align-items: center; gap: 8px; margin: 0 24px 12px; padding: 8px 14px; border: 1px solid #e5e7eb; border-radius: 20px; background: #f9fafb; }
.modal-search-icon { color: #9ca3af; }
.modal-search-input { flex: 1; border: none; outline: none; background: transparent; font-size: 14px; color: #374151; }
.modal-add-btn { margin: 0 24px 4px; padding: 12px; border: 1.5px dashed #d1d5db; border-radius: 10px; text-align: center; font-size: 14px; color: #6b7280; cursor: pointer; transition: border-color 0.2s, color 0.2s; }
.modal-add-btn:hover { border-color: #E8572A; color: #E8572A; }
.modal-add-row { display: flex; align-items: center; gap: 8px; margin: 0 24px 8px; padding: 4px 0; }
.modal-add-input { flex: 1; padding: 8px 12px; border: 1.5px solid #E8572A; border-radius: 8px; font-size: 14px; outline: none; }
.btn-confirm-cat { padding: 8px 16px; background: #E8572A; color: #fff; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; white-space: nowrap; }
.btn-confirm-cat:hover { background: #d04a20; }
.btn-cancel-cat { padding: 8px 14px; background: #fff; color: #555; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; cursor: pointer; white-space: nowrap; }
.btn-cancel-cat:hover { background: #f5f5f5; }
.modal-list { flex: 1; overflow-y: auto; padding: 8px 24px; }
.modal-list-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border: 1px solid #e5e7eb; border-radius: 10px; margin-bottom: 8px; gap: 8px; }
.modal-cat-name { font-size: 14px; color: #1f2937; flex: 1; }
.modal-cat-actions { display: flex; gap: 8px; }
.modal-icon-btn { background: none; border: none; cursor: pointer; color: #9ca3af; padding: 4px; display: flex; align-items: center; border-radius: 4px; transition: color 0.2s; }
.modal-icon-btn:hover { color: #374151; }
.modal-icon-btn.del:hover { color: #ef4444; }
.modal-empty { font-size: 14px; color: #9ca3af; text-align: center; padding: 20px 0; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #f3f4f6; display: flex; justify-content: flex-end; }
.btn-modal-done { padding: 10px 28px; background: #E8572A; color: #fff; border: none; border-radius: 50px; font-size: 15px; font-weight: 600; cursor: pointer; }
.btn-modal-done:hover { background: #d04a20; }
</style>

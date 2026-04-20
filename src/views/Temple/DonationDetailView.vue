<template>
  <div class="donation-detail-page">
    <AppBreadcrumb :items="breadcrumbs" />

    <button class="back-btn" @click="goBack">
      <span class="back-arrow">‹</span> 返回上一頁
    </button>

    <div v-if="isLoading" class="loading-state">載入中...</div>

    <template v-else>
      <div class="form-card">
        <div class="card-header">
          <div style="display:flex;align-items:center;gap:12px">
            <h2 class="form-title" style="margin:0">捐款商品資訊</h2>
            <span v-if="!isEditing" class="badge" :class="form.status === 'OPEN' ? 'badge-published' : 'badge-draft'">
              {{ form.status === 'OPEN' ? '上架' : '下架' }}
            </span>
          </div>
          <button v-if="!isEditing" class="btn-edit" @click="isEditing = true">
            <span>✎</span> 編輯資料
          </button>
          <button v-else class="btn-cancel-top" @click="cancelEdit">取消</button>
        </div>

        <!-- 捐款名稱 -->
        <div class="form-row">
          <div class="form-group full-width">
            <label class="form-label">捐款名稱</label>
            <input v-if="isEditing" v-model="form.nameZhTw" class="form-input" placeholder="請輸入捐款名稱" />
            <div v-else class="field-value">{{ form.nameZhTw || '-' }}</div>
          </div>
        </div>

        <!-- 疏文 & 感謝狀 -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">疏文</label>
            <template v-if="isEditing">
              <div class="select-wrap">
                <select v-model="form.ritualDocumentId" class="form-select">
                  <option :value="null">無疏文</option>
                  <option v-for="s in ritualDocuments" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
                <span class="select-arrow">▾</span>
              </div>
            </template>
            <div v-else class="field-value">{{ getLabelById(ritualDocuments, form.ritualDocumentId, 'id', 'name') || '無疏文' }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">感謝狀</label>
            <template v-if="isEditing">
              <div class="select-wrap">
                <select v-model="form.certificateId" class="form-select">
                  <option :value="null">無感謝狀</option>
                  <option v-for="c in certificates" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
                <span class="select-arrow">▾</span>
              </div>
            </template>
            <div v-else class="field-value">{{ getLabelById(certificates, form.certificateId, 'id', 'name') || '無感謝狀' }}</div>
          </div>
        </div>

        <!-- 發佈狀態 & 是否開發票 -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">發佈狀態</label>
            <template v-if="isEditing">
              <div class="select-wrap">
                <select v-model="form.status" class="form-select">
                  <option value="OPEN">上架</option>
                  <option value="CLOSE">下架</option>
                </select>
                <span class="select-arrow">▾</span>
              </div>
            </template>
            <div v-else class="field-value">
              <span class="badge" :class="form.status === 'OPEN' ? 'badge-published' : 'badge-draft'">
                {{ form.status === 'OPEN' ? '上架' : '下架' }}
              </span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">是否開發票</label>
            <template v-if="isEditing">
              <label class="checkbox-label" style="padding-top:4px">
                <input type="checkbox" v-model="form.isInvoiceSupported" class="checkbox-input" />
                開發票
              </label>
            </template>
            <div v-else class="field-value">{{ form.isInvoiceSupported ? '是' : '否' }}</div>
          </div>
        </div>

        <!-- 標籤類別 -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">標籤類別</label>
            <template v-if="isEditing">
              <div class="input-with-btn">
                <MultiSelectTag v-model="form.tags" :options="tagOptions" placeholder="點擊選擇標籤..." style="flex:1" />
                <button class="btn-manage" type="button" @click="openTagModal"><span class="manage-icon">⚙</span> 標籤管理</button>
              </div>
            </template>
            <div v-else class="field-value">{{ form.tags.length ? form.tags.join('、') : '-' }}</div>
          </div>
          <div class="form-group">
            <!-- 空欄位 -->
          </div>
        </div>

        <!-- 上架時間 & 下架時間 -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">上架時間</label>
            <input v-if="isEditing" v-model="form.publishAt" type="datetime-local" class="form-input" :disabled="form.isPermanent" />
            <div v-else class="field-value">{{ form.publishAt ? form.publishAt.replace('T', ' ') : '常駐' }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">下架時間</label>
            <input v-if="isEditing" v-model="form.unpublishAt" type="datetime-local" class="form-input" :disabled="form.isPermanent" />
            <div v-else class="field-value">{{ form.unpublishAt ? form.unpublishAt.replace('T', ' ') : '常駐' }}</div>
          </div>
        </div>

        <!-- 常駐 -->
        <div v-if="isEditing" class="form-row">
          <div class="form-group full-width">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.isPermanent" class="checkbox-input" />
              常駐捐款（勾選後將忽略上下架時間限制）
            </label>
          </div>
        </div>

        <!-- 商品主圖 -->
        <div class="section-title">商品主圖</div>
        <div class="main-image-section">
          <div class="image-upload-area">
            <div v-for="(img, imgIdx) in mainImages" :key="imgIdx" class="image-preview">
              <img :src="img.url" alt="preview" />
              <button v-if="isEditing" class="image-remove" type="button" @click="removeMainImage(imgIdx)">✕</button>
            </div>
            <label v-if="isEditing && mainImages.length < 5 && !isMainUploading" class="image-upload-btn" for="main-img-upload">
              <span class="upload-plus">+</span>
              <span class="upload-text">新增圖片</span>
              <input id="main-img-upload" type="file" accept="image/*" multiple style="display:none" @change="handleMainImageUpload" />
            </label>
            <div v-if="isMainUploading" class="image-upload-btn uploading">
              <span class="upload-text">上傳中...</span>
            </div>
            <div v-if="!isEditing && mainImages.length === 0" class="field-value">無圖片</div>
          </div>
          <div v-if="isEditing" class="image-hint">最多可上傳 5 張圖片</div>
        </div>

        <!-- 捐款說明 -->
        <div class="form-row" style="margin-top:24px">
          <div class="form-group full-width">
            <label class="form-label">捐款說明</label>
            <textarea v-if="isEditing" v-model="form.depictionZhTw" class="form-textarea" rows="5" placeholder="請輸入捐款說明"></textarea>
            <div v-else class="field-value pre-wrap">{{ form.depictionZhTw || '-' }}</div>
          </div>
        </div>
      </div>

      <div v-if="isEditing" class="form-actions">
        <button class="btn-primary" type="button" @click="handleSubmit" :disabled="isSaving">
          {{ isSaving ? '送出中...' : '確認修改' }}
        </button>
        <button class="btn-cancel" type="button" @click="cancelEdit">取消</button>
      </div>
    </template>

    <!-- 捐款類別管理 Modal -->
    <div v-if="showCategoryModal" class="modal-overlay" @click.self="showCategoryModal = false">
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">捐款類別管理</span>
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

const route  = useRoute()
const router = useRouter()
const templeStore = useTempleStore()

const templeId   = computed(() => route.params.templeId)
const donationId = computed(() => route.params.donationId)

const isLoading = ref(true)
const isEditing = ref(false)
const isSaving  = ref(false)

const breadcrumbs = computed(() => [
  { text: '後台管理' },
  { text: '活動與上架管理', onClick: goBack },
  { text: '捐款商品詳情' },
])

const donationCategories = ref([
  { value: 1, label: '一般捐款' },
  { value: 2, label: '建廟基金' },
  { value: 3, label: '功德金' },
  { value: 4, label: '修繕基金' },
])

const donationItems = ref([
  { value: 'item-001', label: '線上捐款' },
  { value: 'item-002', label: '功德金' },
  { value: 'item-003', label: '建廟捐款' },
])

const ritualDocuments = ref([{ id: 1, name: '標準疏文' }, { id: 2, name: '自訂疏文' }])
const certificates    = ref([{ id: 1, name: '標準感謝狀' }])
const tagOptions      = ref([
  { value: '熱門', label: '熱門' },
  { value: '推薦', label: '推薦' },
  { value: '新上架', label: '新上架' },
  { value: '限量', label: '限量' },
])

const getLabelById = (list, id, keyField = 'value', labelField = 'label') => {
  if (!id && id !== 0) return '-'
  const found = list.find(i => i[keyField] === id)
  return found ? found[labelField] : id
}

const mainImages      = ref([])
const isMainUploading = ref(false)

const handleMainImageUpload = async (event) => {
  const files = Array.from(event.target.files)
  const toUpload = files.slice(0, 5 - mainImages.value.length)
  event.target.value = ''
  if (!toUpload.length) return
  const previews = toUpload.map(f => ({ url: URL.createObjectURL(f), file: f, id: null }))
  mainImages.value.push(...previews)
  isMainUploading.value = true
  try {
    const results = await templeStore.uploadMainImages(templeId.value, toUpload)
    results.forEach((res, i) => {
      const idx = mainImages.value.indexOf(previews[i])
      if (idx !== -1) mainImages.value[idx] = { url: res.publicFileUrl, file: null, id: res.id }
    })
  } catch {
    previews.forEach(p => { const idx = mainImages.value.indexOf(p); if (idx !== -1) mainImages.value.splice(idx, 1) })
    alert('圖片上傳失敗，請稍後再試')
  } finally { isMainUploading.value = false }
}
const removeMainImage = (idx) => mainImages.value.splice(idx, 1)

const form = reactive({
  status: '', nameZhTw: '', itemId: '', categoryId: '',
  ritualDocumentId: null, certificateId: null,
  isInvoiceSupported: false, tags: [],
  publishAt: '', unpublishAt: '', isPermanent: false,
  depictionZhTw: '',
})

const isValidDatetime = (v) => !!v && v.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(v)

const fillForm = (data) => {
  console.log('捐款商品詳情 data:', data)
  form.status             = data.status || ''
  form.nameZhTw           = data.nameZhTw || ''
  form.depictionZhTw      = data.depictionZhTw || ''
  form.isInvoiceSupported = data.isInvoiceSupported ?? false
  form.itemId             = data.itemId || ''
  form.categoryId         = data.categoryId || ''
  form.ritualDocumentId   = data.ritualDocumentId || null
  form.certificateId      = data.certificateId || null
  form.tags               = data.tags || []
  form.publishAt          = isValidDatetime(data.publishAt)  ? data.publishAt.replace(' ', 'T').slice(0, 16)  : ''
  form.unpublishAt        = isValidDatetime(data.unpublishAt) ? data.unpublishAt.replace(' ', 'T').slice(0, 16) : ''
  form.isPermanent        = !isValidDatetime(data.publishAt) && !isValidDatetime(data.unpublishAt)
  mainImages.value        = (data.imgs || []).map(img => ({ url: img.url, file: null, id: img.id }))
}

const toApiDateTime = (val) => val ? val.replace('T', ' ') + ':00' : null

const buildPayload = () => ({
  itemId:             form.itemId           || undefined,
  categoryId:         form.categoryId       || undefined,
  eventIds:           [],
  ritualDocumentId:   form.ritualDocumentId || undefined,
  certificateId:      form.certificateId    || undefined,
  nameZhTw:           form.nameZhTw,
  depictionZhTw:      form.depictionZhTw,
  status:             form.status,
  isInvoiceSupported: form.isInvoiceSupported,
  publishAt:          form.isPermanent ? null : toApiDateTime(form.publishAt),
  unpublishAt:        form.isPermanent ? null : toApiDateTime(form.unpublishAt),
  imgIds:             mainImages.value.map(img => img.id).filter(id => id !== null),
  skus:               [],
})

const handleSubmit = async () => {
  isSaving.value = true
  try {
    const payload = buildPayload()
    console.log('PATCH 捐款商品 payload:', JSON.stringify(payload, null, 2))
    await templeStore.updateDonationProduct(templeId.value, donationId.value, payload)
    alert('捐款商品更新成功')
    isEditing.value = false
  } catch (err) {
    console.error('捐款商品更新失敗:', err)
    alert('操作失敗，請稍後再試')
  } finally { isSaving.value = false }
}

const cancelEdit = async () => {
  try {
    const data = await templeStore.fetchDonationProduct(templeId.value, donationId.value)
    if (data) fillForm(data)
  } catch {}
  isEditing.value = false
}

const goBack = () => {
  router.push({ name: 'app.temple.activity-management', params: { templeId: templeId.value }, query: { tab: 'donations' } })
}

onMounted(async () => {
  try {
    const data = await templeStore.fetchDonationProduct(templeId.value, donationId.value)
    if (data) fillForm(data)
  } catch (err) {
    console.error('載入捐款商品資料失敗:', err)
  } finally { isLoading.value = false }
})

// ── 捐款類別管理 Modal ──
const showCategoryModal   = ref(false)
const categorySearch      = ref('')
const isAddingCategory    = ref(false)
const newCategoryName     = ref('')
const newCategoryInputRef = ref(null)
const editingCategoryId   = ref(null)
const editingCategoryName = ref('')
let   catIdCounter        = 5

const filteredCategories = computed(() =>
  donationCategories.value.filter(c => !categorySearch.value || c.label.includes(categorySearch.value))
)
const openCategoryModal = () => {
  categorySearch.value = ''; isAddingCategory.value = false
  newCategoryName.value = ''; editingCategoryId.value = null
  showCategoryModal.value = true
}
const startAddCategory    = async () => { isAddingCategory.value = true; await nextTick(); newCategoryInputRef.value?.focus() }
const confirmAddCategory  = () => {
  const name = newCategoryName.value.trim(); if (!name) return
  donationCategories.value.push({ value: catIdCounter++, label: name })
  newCategoryName.value = ''; isAddingCategory.value = false
}
const cancelAddCategory   = () => { newCategoryName.value = ''; isAddingCategory.value = false }
const startEditCategory   = (cat) => { editingCategoryId.value = cat.value; editingCategoryName.value = cat.label }
const confirmEditCategory = (cat) => {
  const name = editingCategoryName.value.trim(); if (!name) return
  const target = donationCategories.value.find(c => c.value === cat.value)
  if (target) target.label = name
  editingCategoryId.value = null
}
const deleteCategory = (id) => {
  donationCategories.value = donationCategories.value.filter(c => c.value !== id)
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
  tagOptions.value.filter(t => !tagSearch.value || t.label.includes(tagSearch.value))
)
const openTagModal   = () => { tagSearch.value = ''; isAddingTag.value = false; newTagName.value = ''; editingTagId.value = null; showTagModal.value = true }
const startAddTag    = async () => { isAddingTag.value = true; await nextTick(); newTagInputRef.value?.focus() }
const confirmAddTag  = () => {
  const name = newTagName.value.trim(); if (!name) return
  tagOptions.value.push({ value: name, label: name })
  newTagName.value = ''; isAddingTag.value = false
}
const cancelAddTag   = () => { newTagName.value = ''; isAddingTag.value = false }
const startEditTag   = (tag) => { editingTagId.value = tag.value; editingTagName.value = tag.label }
const confirmEditTag = (tag) => {
  const name = editingTagName.value.trim(); if (!name) return
  const target = tagOptions.value.find(t => t.value === tag.value)
  if (target) {
    const oldValue = target.value; target.label = name; target.value = name
    const idx = form.tags.indexOf(oldValue); if (idx !== -1) form.tags.splice(idx, 1, name)
  }
  editingTagId.value = null
}
const deleteTag = (value) => {
  tagOptions.value = tagOptions.value.filter(t => t.value !== value)
  form.tags = form.tags.filter(v => v !== value)
}
</script>

<style scoped>
.donation-detail-page { padding: 24px 32px 60px; min-height: 100%; background: #F3F4F6; }
.back-btn { display: inline-flex; align-items: center; gap: 4px; background: none; border: none; color: #E8572A; font-size: 14px; cursor: pointer; margin-bottom: 16px; padding: 0; font-weight: 500; }
.back-btn:hover { opacity: 0.75; }
.back-arrow { font-size: 16px; }
.loading-state { text-align: center; padding: 60px; color: #aaa; font-size: 15px; }
.form-card { background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 24px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 1px solid #f0f0f0; }
.form-title { font-size: 1.2rem; font-weight: 700; color: #1a1a1a; }
.btn-edit { display: flex; align-items: center; gap: 6px; padding: 8px 18px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; color: #555; cursor: pointer; font-weight: 500; transition: background 0.2s; }
.btn-edit:hover { background: #eee; }
.btn-cancel-top { padding: 8px 18px; background: #fff; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; color: #888; cursor: pointer; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 20px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full-width { grid-column: 1 / -1; }
.form-label { font-size: 13px; font-weight: 500; color: #555; }
.form-input { padding: 11px 16px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 14px; color: #333; background: #fff; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
.form-input:focus { border-color: #E8572A; box-shadow: 0 0 0 3px rgba(232,87,42,0.08); }
.form-input:disabled { background: #f5f5f5; color: #aaa; }
.form-textarea { padding: 12px 16px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 14px; color: #333; resize: vertical; outline: none; width: 100%; box-sizing: border-box; font-family: inherit; }
.form-textarea:focus { border-color: #E8572A; box-shadow: 0 0 0 3px rgba(232,87,42,0.08); }
.field-value { font-size: 14px; color: #333; padding: 4px 0; min-height: 24px; }
.field-value.pre-wrap { white-space: pre-wrap; }
.select-wrap { position: relative; }
.form-select { width: 100%; padding: 11px 36px 11px 16px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 14px; color: #333; background: #fff; appearance: none; outline: none; cursor: pointer; }
.form-select:focus { border-color: #E8572A; }
.select-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #888; font-size: 12px; }
.checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #333; cursor: pointer; }
.checkbox-input { width: 16px; height: 16px; accent-color: #E8572A; cursor: pointer; }
.input-with-btn { display: flex; gap: 8px; align-items: flex-start; }
.btn-manage { display: flex; align-items: center; gap: 4px; padding: 10px 14px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 10px; font-size: 13px; color: #555; cursor: pointer; white-space: nowrap; transition: background 0.2s; flex-shrink: 0; }
.btn-manage:hover { background: #eee; }
.manage-icon { font-size: 14px; }
.badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.badge-published { background: #d1fae5; color: #065f46; }
.badge-draft { background: #f3f4f6; color: #6b7280; }
.section-title { font-size: 15px; font-weight: 600; color: #1a1a1a; margin: 28px 0 16px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0; }
.main-image-section { margin-bottom: 8px; }
.image-upload-area { display: flex; flex-wrap: wrap; gap: 12px; }
.image-preview { position: relative; width: 120px; height: 120px; border-radius: 10px; overflow: hidden; border: 1px solid #e0e0e0; }
.image-preview img { width: 100%; height: 100%; object-fit: cover; }
.image-remove { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.45); color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.image-upload-btn { width: 120px; height: 120px; border: 1.5px dashed #c8c8c8; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; background: #fafafa; gap: 4px; transition: border-color 0.2s; }
.image-upload-btn:hover { border-color: #E8572A; background: #fff8f6; }
.image-upload-btn.uploading { cursor: default; }
.upload-plus { font-size: 24px; color: #bbb; line-height: 1; }
.upload-text { font-size: 12px; color: #aaa; }
.image-hint { font-size: 12px; color: #aaa; margin-top: 8px; }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-bottom: 20px; }
.btn-primary { padding: 10px 28px; background: #E8572A; color: #fff; border: none; border-radius: 50px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover:not(:disabled) { background: #d14a1f; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-cancel { padding: 10px 24px; background: #fff; color: #555; border: 1px solid #ddd; border-radius: 50px; font-size: 14px; font-weight: 500; cursor: pointer; }
.btn-cancel:hover { background: #f5f5f5; }
/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-box { background: #fff; border-radius: 16px; width: 480px; max-height: 80vh; display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px 16px; border-bottom: 1px solid #f0f0f0; }
.modal-title { font-size: 15px; font-weight: 700; color: #1a1a1a; }
.modal-close { background: none; border: none; font-size: 16px; color: #888; cursor: pointer; }
.modal-search-wrap { display: flex; align-items: center; gap: 8px; margin: 16px 24px 8px; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 8px; }
.modal-search-icon { color: #aaa; flex-shrink: 0; }
.modal-search-input { flex: 1; border: none; outline: none; font-size: 14px; color: #333; }
.modal-add-btn { margin: 8px 24px; padding: 10px; border: 1.5px dashed #d0d0d0; border-radius: 8px; text-align: center; color: #888; font-size: 14px; cursor: pointer; transition: border-color 0.2s, color 0.2s; }
.modal-add-btn:hover { border-color: #E8572A; color: #E8572A; }
.modal-add-row { display: flex; gap: 8px; align-items: center; margin: 8px 24px; }
.modal-add-input { flex: 1; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; outline: none; }
.modal-add-input:focus { border-color: #E8572A; }
.btn-confirm-cat { padding: 7px 14px; background: #E8572A; color: #fff; border: none; border-radius: 8px; font-size: 13px; cursor: pointer; white-space: nowrap; }
.btn-cancel-cat { padding: 7px 14px; background: #f5f5f5; color: #555; border: 1px solid #ddd; border-radius: 8px; font-size: 13px; cursor: pointer; white-space: nowrap; }
.modal-list { flex: 1; overflow-y: auto; padding: 8px 24px; }
.modal-list-item { display: flex; align-items: center; gap: 8px; padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
.modal-cat-name { flex: 1; font-size: 14px; color: #333; }
.modal-cat-actions { display: flex; gap: 6px; }
.modal-icon-btn { background: none; border: none; padding: 4px; border-radius: 6px; cursor: pointer; color: #888; display: flex; align-items: center; }
.modal-icon-btn:hover { background: #f0f0f0; color: #333; }
.modal-icon-btn.del:hover { background: #fff0f0; color: #e53e3e; }
.modal-empty { text-align: center; color: #aaa; font-size: 14px; padding: 20px 0; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; }
.btn-modal-done { padding: 8px 24px; background: #E8572A; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
</style>

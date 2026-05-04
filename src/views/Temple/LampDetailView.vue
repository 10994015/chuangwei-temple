<template>
  <div class="lamp-form-page">
    <AppBreadcrumb :items="breadcrumbs" />

    <button class="back-btn" @click="goBack">
      <span class="back-arrow">‹</span> 返回上一頁
    </button>

    <div v-if="isLoading" class="loading-state">載入中...</div>

    <template v-else>
      <!-- 基本資訊 -->
      <div class="form-card">
        <div class="card-header">
          <div style="display:flex;align-items:center;gap:12px">
            <h2 class="form-title" style="margin:0">燈種資訊</h2>
            <span v-if="!isEditing" class="badge" :class="form.status === 'OPEN' ? 'badge-published' : 'badge-draft'">
              {{ form.status === 'OPEN' ? '上架' : '下架' }}
            </span>
          </div>
          <button v-if="!isEditing" class="btn-edit" @click="isEditing = true">
            <span>✎</span> 編輯資料
          </button>
          <button v-else class="btn-cancel-top" @click="cancelEdit">取消</button>
        </div>

        <!-- 燈種名稱 / 服務項目 / 服務類別 -->
        <div class="form-row form-row-3">
          <div class="form-group">
            <label class="form-label">燈種名稱</label>
            <input v-if="isEditing" v-model="form.nameZhTw" class="form-input" placeholder="請輸入燈種名稱" />
            <div v-else class="field-value">{{ form.nameZhTw || '-' }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">服務項目</label>
            <template v-if="isEditing">
              <div class="select-wrap">
                <select v-model="form.itemId" class="form-select">
                  <option value="">點擊選擇服務項目...</option>
                  <option v-for="item in serviceItems" :key="item.id" :value="item.id">{{ item.name }}</option>
                </select>
                <span class="select-arrow">▾</span>
              </div>
            </template>
            <div v-else class="field-value">{{ getNameById(serviceItems, form.itemId) }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">服務類別</label>
            <template v-if="isEditing">
              <div class="select-wrap">
                <select v-model="form.categoryId" class="form-select">
                  <option value="">點擊選擇類別...</option>
                  <option v-for="c in serviceCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
                <span class="select-arrow">▾</span>
              </div>
            </template>
            <div v-else class="field-value">{{ getNameById(serviceCategories, form.categoryId) }}</div>
          </div>
        </div>

        <!-- 關聯活動 / 標籤類別 -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">關聯活動</label>
            <template v-if="isEditing">
              <MultiSelectTag v-model="form.eventIds" :options="bindableEventOptions" placeholder="點擊選擇活動..." />
            </template>
            <div v-else class="field-value">{{ getEventNames(form.eventIds) }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">標籤類別</label>
            <template v-if="isEditing">
              <MultiSelectTag v-model="form.tagIds" :options="tagOptions" placeholder="點擊選擇標籤..." />
            </template>
            <div v-else class="field-value">{{ form.tagIds.length ? form.tagIds.join('、') : '-' }}</div>
          </div>
        </div>

        <!-- 上架時間 / 下架時間 / 是否開發票 -->
        <div class="form-row form-row-3">
          <div class="form-group">
            <label class="form-label">上架時間</label>
            <input v-if="isEditing" v-model="form.publishAt" type="datetime-local" class="form-input" />
            <div v-else class="field-value">{{ form.publishAt || '-' }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">下架時間</label>
            <input v-if="isEditing" v-model="form.unpublishAt" type="datetime-local" class="form-input" />
            <div v-else class="field-value">{{ form.unpublishAt || '-' }}</div>
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

        <!-- 發佈狀態 -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">發佈狀態</label>
            <template v-if="isEditing">
              <div class="select-wrap">
                <select v-model="form.status" class="form-select">
                  <option value="OPEN">上架</option>
                  <option value="DRAFT">草稿</option>
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
        </div>

        <!-- 商品主圖 -->
        <div class="section-title">商品主圖</div>
        <div class="main-image-section">
          <div class="image-upload-area">
            <div v-for="(img, imgIdx) in mainImages" :key="imgIdx" class="image-preview">
              <img :src="img.url" alt="preview" />
              <button v-if="isEditing" class="image-remove" type="button" @click="removeMainImage(imgIdx)">✕</button>
            </div>
            <label v-if="isEditing && mainImages.length < 1 && !isMainUploading" class="image-upload-btn" for="main-img-upload">
              <span class="upload-plus">+</span>
              <span class="upload-text">新增圖片</span>
              <input id="main-img-upload" type="file" accept="image/*" style="display:none" @change="handleMainImageUpload" />
            </label>
            <div v-if="isMainUploading" class="image-upload-btn uploading">
              <span class="upload-text">上傳中...</span>
            </div>
            <div v-if="!isEditing && !mainImages.length" class="field-value">無圖片</div>
          </div>
          <div v-if="isEditing" class="image-hint">建議尺寸 800x600 像素</div>
        </div>

        <!-- 燈種說明 -->
        <div class="form-row" style="margin-top:24px">
          <div class="form-group full-width">
            <label class="form-label">燈種說明</label>
            <textarea v-if="isEditing" v-model="form.depictionZhTw" class="form-textarea" rows="4" placeholder="請輸入說明文字..."></textarea>
            <div v-else class="field-value pre-wrap">{{ form.depictionZhTw || '-' }}</div>
          </div>
        </div>
      </div>

      <!-- 規格設定 -->
      <div class="form-card">
        <div class="section-title" style="margin-top:0">規格設定</div>

        <div v-for="(spec, idx) in form.specs" :key="idx" class="spec-card">
          <div class="spec-name-badge">{{ spec.nameZhTw }}</div>

          <!-- 商品價格 -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">商品價格（元）</label>
              <input v-if="isEditing" v-model.number="spec.price" type="number" min="0" class="form-input" placeholder="0" />
              <div v-else class="field-value">NT$ {{ Number(spec.price).toLocaleString() }}</div>
            </div>
            <div class="form-group">
              <label class="form-label">庫存數量</label>
              <input v-if="isEditing" v-model.number="spec.stock" type="number" min="0" class="form-input" placeholder="0" />
              <div v-else class="field-value">{{ spec.stock }}</div>
            </div>
          </div>

          <!-- 特殊號設定 -->
          <template v-if="spec.nameZhTw === '特殊號'">
            <div class="section-title" style="margin-top:16px;margin-bottom:8px;font-size:14px">特殊號設定（選填）</div>
            <div class="form-group" style="margin-bottom:16px">
              <label class="form-label">特殊號碼設定（以逗號間隔）</label>
              <input v-if="isEditing" v-model="specialSlotNumbers" class="form-input" placeholder="888,1688,..." />
              <div v-else class="field-value">{{ specialSlotNumbers || '-' }}</div>
            </div>
          </template>

          <!-- 公司行號 -->
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label">公司行號是否可以購買</label>
            <template v-if="isEditing">
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" v-model="spec.isCompanyPurchasable" :value="true" class="radio-input" /> 是
                </label>
                <label class="radio-label">
                  <input type="radio" v-model="spec.isCompanyPurchasable" :value="false" class="radio-input" /> 否
                </label>
              </div>
            </template>
            <div v-else class="field-value">{{ spec.isCompanyPurchasable ? '是' : '否' }}</div>
          </div>

          <!-- 規格圖片 -->
          <div class="form-group">
            <label class="form-label">規格圖片</label>
            <div class="image-upload-area">
              <div v-for="(img, imgIdx) in spec.images" :key="imgIdx" class="image-preview">
                <img :src="img.url" alt="preview" />
                <button v-if="isEditing" class="image-remove" type="button" @click="removeSpecImage(idx, imgIdx)">✕</button>
              </div>
              <label v-if="isEditing && spec.images.length < 1 && !spec.isUploading" class="image-upload-btn" :for="`spec-img-${idx}`">
                <span class="upload-plus">+</span>
                <span class="upload-text">新增圖片</span>
                <input :id="`spec-img-${idx}`" type="file" accept="image/*" style="display:none" @change="handleSpecImageUpload($event, idx)" />
              </label>
              <div v-if="spec.isUploading" class="image-upload-btn uploading">
                <span class="upload-text">上傳中...</span>
              </div>
              <div v-if="!isEditing && !spec.images.length" class="field-value">無圖片</div>
            </div>
            <div v-if="isEditing" class="image-hint">建議尺寸 800x800 像素</div>
          </div>
        </div>
      </div>

      <!-- 底部按鈕（編輯模式才顯示） -->
      <div v-if="isEditing" class="form-actions">
        <button class="btn-primary" type="button" @click="handleSubmit" :disabled="isSaving">
          {{ isSaving ? '送出中...' : '確認修改' }}
        </button>
        <button class="btn-cancel" type="button" @click="cancelEdit">取消</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'
import MultiSelectTag from '@/components/MultiSelectTag.vue'
import { useTempleStore } from '@/stores/temple'

const route = useRoute()
const router = useRouter()
const templeStore = useTempleStore()

const templeId = computed(() => route.params.templeId)
const lampId   = computed(() => route.params.lampId)

const isLoading = ref(true)
const isEditing = ref(false)
const isSaving  = ref(false)

const breadcrumbs = computed(() => [
  { text: '後台管理' },
  { text: '活動與上架管理', onClick: goBack },
  { text: '燈種詳情' },
])

const serviceItems      = ref([])
const serviceCategories = ref([])
const bindableEvents    = ref([])
const bindableEventOptions = computed(() => bindableEvents.value.map(e => ({ value: e.id, label: e.nameZhTw || e.name })))
const tagOptions        = ref([])

const mainImages      = ref([])
const isMainUploading = ref(false)
const specialSlotNumbers = ref('')

const form = reactive({
  nameZhTw:           '',
  itemId:             '',
  categoryId:         '',
  eventIds:           [],
  tagIds:             [],
  publishAt:          '',
  unpublishAt:        '',
  isInvoiceSupported: false,
  status:             '',
  depictionZhTw:      '',
  specs:              [],
})

// ── helpers ──
const getNameById = (list, id) => {
  if (!id) return '-'
  const found = list.find(i => i.id === id)
  return found ? found.name : id
}
const eventNamesMap = ref({})
const getEventNames = (ids) => {
  if (!ids || !ids.length) return '-'
  return ids.map(id => {
    const e = bindableEvents.value.find(ev => ev.id === id)
    return e ? (e.nameZhTw || e.name) : (eventNamesMap.value[id] || id)
  }).join('、')
}

// ── 圖片上傳 ──
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
const removeMainImage = (idx) => mainImages.value.splice(idx, 1)

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
const removeSpecImage = (specIdx, imgIdx) => form.specs[specIdx].images.splice(imgIdx, 1)

// ── fillForm ──
const toInputDateTime = (val) => val ? val.replace(' ', 'T').slice(0, 16) : ''

const fillForm = (data) => {
  form.nameZhTw           = data.nameZhTw || data.name || ''
  form.itemId             = data.itemId || ''
  form.categoryId         = data.categoryId || ''
  form.status             = data.status || ''
  form.isInvoiceSupported = data.isInvoiceSupported ?? false
  form.depictionZhTw      = data.depictionZhTw || ''
  form.publishAt          = toInputDateTime(data.publishAt)
  form.unpublishAt        = toInputDateTime(data.unpublishAt)
  form.eventIds           = (data.events || []).map(e => e.id)
  form.tagIds             = (data.tags || []).map(t => t.name || t)
  const namesMap = {}
  ;(data.events || []).forEach(e => { namesMap[e.id] = e.name || e.nameZhTw || '' })
  eventNamesMap.value = namesMap
  mainImages.value = (data.imgs || []).map(img => ({ url: img.url || img.publicFileUrl, file: null, id: img.id }))
  specialSlotNumbers.value = (data.specialSlotNumberJson || []).join(',')
  form.specs = (data.skus || []).map(sku => ({
    skuId:               sku.id || null,
    nameZhTw:            sku.nameZhTw || '',
    price:               sku.price ?? 0,
    stock:               sku.stock ?? 0,
    isCompanyPurchasable: sku.isCompanyPurchasable ?? false,
    shippingMode:        sku.shippingMode || 'FREE',
    images:              (sku.imgs || []).map(img => ({ url: img.url || img.publicFileUrl, file: null, id: img.id })),
    isUploading:         false,
  }))
}

// ── cancelEdit ──
let originalData = null
const cancelEdit = () => {
  if (originalData) fillForm(originalData)
  isEditing.value = false
}

// ── handleSubmit ──
const toApiDateTime = (val) => {
  if (!val) return null
  return val.replace('T', ' ') + (val.length === 16 ? ':00' : '')
}

const handleSubmit = async () => {
  isSaving.value = true
  try {
    const payload = {
      nameZhTw:           form.nameZhTw,
      itemId:             form.itemId || undefined,
      categoryId:         form.categoryId || undefined,
      eventIds:           form.eventIds,
      publishAt:          toApiDateTime(form.publishAt),
      unpublishAt:        toApiDateTime(form.unpublishAt),
      depictionZhTw:      form.depictionZhTw,
      isInvoiceSupported: form.isInvoiceSupported,
      status:             form.status,
      specialSlotNumberJson: specialSlotNumbers.value
        ? specialSlotNumbers.value.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      imgIds: mainImages.value.map(i => i.id).filter(id => id !== null),
      skus: form.specs.map(s => ({
        ...(s.skuId ? { id: s.skuId } : {}),
        nameZhTw:             s.nameZhTw,
        price:                Number(s.price),
        stock:                Number(s.stock),
        shippingMode:         s.shippingMode || 'FREE',
        specialShippingFee:   null,
        isCompanyPurchasable: s.isCompanyPurchasable,
        imgIds:               s.images.map(i => i.id).filter(id => id !== null),
      })),
    }
    await templeStore.updateLamp(templeId.value, lampId.value, payload)
    alert('燈種更新成功')
    isEditing.value = false
    originalData = JSON.parse(JSON.stringify({ ...payload, imgs: mainImages.value, skus: form.specs, events: form.eventIds.map(id => ({ id })), specialSlotNumberJson: payload.specialSlotNumberJson }))
  } catch (err) {
    console.error('燈種更新失敗:', err)
    alert(err?.response?.data?.message || '操作失敗，請稍後再試')
  } finally { isSaving.value = false }
}

const goBack = () => {
  router.push({ name: 'app.temple.activity-management', params: { templeId: templeId.value }, query: { tab: 'lamp' } })
}

onMounted(async () => {
  try {
    const [data] = await Promise.all([
      templeStore.fetchLamp(templeId.value, lampId.value),
      templeStore.fetchServiceItems(templeId.value).then(r => { serviceItems.value = r }),
      templeStore.fetchServiceCategories(templeId.value).then(r => { serviceCategories.value = r }),
      templeStore.fetchBindableEvents(templeId.value).then(r => { bindableEvents.value = r }),
      templeStore.fetchLabelCategories(templeId.value).then(r => {
        tagOptions.value = r.map(t => ({ value: t.name, label: t.name }))
      }),
    ])
    if (data) {
      originalData = data
      fillForm(data)
    }
  } catch (err) {
    console.error('載入燈種失敗:', err)
    alert('載入資料失敗，請稍後再試')
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.lamp-form-page { padding: 24px 32px 60px; min-height: 100%; background: #F3F4F6; }
.back-btn { display: inline-flex; align-items: center; gap: 4px; background: none; border: none; color: #E8572A; font-size: 14px; cursor: pointer; margin-bottom: 16px; padding: 0; font-weight: 500; }
.back-btn:hover { opacity: 0.75; }
.back-arrow { font-size: 16px; }
.loading-state { text-align: center; padding: 60px; color: #888; }
.form-card { background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 24px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.form-title { font-size: 1.2rem; font-weight: 700; color: #1a1a1a; margin: 0 0 28px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 20px; }
.form-row-3 { grid-template-columns: 1fr 1fr 1fr; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full-width { grid-column: 1 / -1; }
.form-label { font-size: 13px; font-weight: 500; color: #555; }
.form-input { padding: 11px 16px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 14px; color: #333; background: #fff; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
.form-input:focus { border-color: #E8572A; box-shadow: 0 0 0 3px rgba(232,87,42,0.08); }
.form-input:disabled { background: #f5f5f5; color: #aaa; }
.form-textarea { padding: 11px 16px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 14px; color: #333; outline: none; resize: vertical; box-sizing: border-box; width: 100%; }
.form-textarea:focus { border-color: #E8572A; }
.form-select { width: 100%; padding: 11px 36px 11px 16px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 14px; color: #333; background: #fff; appearance: none; outline: none; cursor: pointer; }
.form-select:focus { border-color: #E8572A; }
.select-wrap { position: relative; }
.select-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #888; font-size: 12px; }
.field-value { font-size: 14px; color: #333; padding: 8px 0; min-height: 38px; }
.field-value.pre-wrap { white-space: pre-wrap; }
.section-title { font-size: 15px; font-weight: 600; color: #1a1a1a; margin: 28px 0 16px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; }
.badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.badge-published { background: #e6f4ea; color: #1a7f37; }
.badge-draft { background: #f0f0f0; color: #888; }
.btn-edit { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; background: #fff; border: 1px solid #E8572A; color: #E8572A; border-radius: 50px; font-size: 14px; font-weight: 500; cursor: pointer; }
.btn-edit:hover { background: #fff5f2; }
.btn-cancel-top { padding: 8px 18px; background: #fff; border: 1px solid #ddd; color: #555; border-radius: 50px; font-size: 14px; cursor: pointer; }
.checkbox-label { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; color: #333; cursor: pointer; }
.checkbox-input { width: 15px; height: 15px; accent-color: #E8572A; cursor: pointer; }
.radio-group { display: flex; gap: 20px; padding-top: 4px; }
.radio-label { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; color: #333; cursor: pointer; }
.radio-input { accent-color: #E8572A; cursor: pointer; }
.main-image-section { margin-bottom: 8px; }
.image-upload-area { display: flex; flex-wrap: wrap; gap: 12px; }
.image-preview { position: relative; width: 100px; height: 100px; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0; }
.image-preview img { width: 100%; height: 100%; object-fit: cover; }
.image-remove { position: absolute; top: 4px; right: 4px; width: 22px; height: 22px; background: rgba(0,0,0,0.55); color: #fff; border: none; border-radius: 50%; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.image-upload-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100px; height: 100px; border: 1.5px dashed #ccc; border-radius: 8px; cursor: pointer; background: #fafafa; transition: border-color 0.2s; }
.image-upload-btn:hover { border-color: #E8572A; }
.image-upload-btn.uploading { cursor: default; }
.upload-plus { font-size: 22px; color: #aaa; line-height: 1; }
.upload-text { font-size: 12px; color: #aaa; margin-top: 4px; }
.image-hint { font-size: 12px; color: #aaa; margin-top: 6px; }
.spec-card { background: #fafafa; border: 1px solid #eee; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
.spec-name-badge { display: inline-block; padding: 4px 14px; background: #E8572A; color: #fff; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-bottom: 20px; }
.btn-primary { padding: 10px 28px; background: #E8572A; color: #fff; border: none; border-radius: 50px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover:not(:disabled) { background: #d14a1f; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-cancel { padding: 10px 24px; background: #fff; color: #555; border: 1px solid #ddd; border-radius: 50px; font-size: 14px; font-weight: 500; cursor: pointer; }
.btn-cancel:hover { background: #f5f5f5; }
</style>

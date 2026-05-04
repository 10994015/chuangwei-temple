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

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'
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

const ritualDocuments = ref([])
const certificates    = ref([])

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
  status: '', nameZhTw: '',
  itemId: '', categoryId: '', eventIds: [],
  ritualDocumentId: null, certificateId: null,
  isInvoiceSupported: false,
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
  form.eventIds           = (data.events || []).map(e => e.id)
  // GET 回傳 ritualDocument/certificate 為名稱字串，ID 欄位名為 ritualDocumentId/certificateId
  form.ritualDocumentId   = data.ritualDocumentId || null
  form.certificateId      = data.certificateId || null
  form.publishAt          = isValidDatetime(data.publishAt)   ? data.publishAt.replace(' ', 'T').slice(0, 16)  : ''
  form.unpublishAt        = isValidDatetime(data.unpublishAt) ? data.unpublishAt.replace(' ', 'T').slice(0, 16) : ''
  form.isPermanent        = !isValidDatetime(data.publishAt) && !isValidDatetime(data.unpublishAt)
  mainImages.value        = (data.imgs || []).map(img => ({ url: img.url, file: null, id: img.id }))
}

const toApiDateTime = (val) => val ? val.replace('T', ' ') + ':00' : null

const buildPayload = () => ({
  itemId:             form.itemId     || undefined,
  categoryId:         form.categoryId || undefined,
  eventIds:           form.eventIds,
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
    alert(err?.response?.data?.message || '操作失敗，請稍後再試')
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
  templeStore.fetchRitualDocuments(templeId.value)
    .then(r => { ritualDocuments.value = r.map(i => ({ id: i.id, name: i.name })) })
    .catch(e => console.warn('[DonationDetail] fetchRitualDocuments 失敗:', e))
  templeStore.fetchCertificates(templeId.value)
    .then(r => { certificates.value = r.map(i => ({ id: i.id, name: i.name })) })
    .catch(e => console.warn('[DonationDetail] fetchCertificates 失敗:', e))
  try {
    console.log('[DonationDetail] templeId:', templeId.value, 'donationId:', donationId.value)
    const data = await templeStore.fetchDonationProduct(templeId.value, donationId.value)
    console.log('[DonationDetail] fetchDonationProduct 回傳:', data)
    if (data) fillForm(data)
    else console.warn('[DonationDetail] data 為 null，fillForm 未執行')
  } catch (err) {
    console.error('[DonationDetail] 載入捐款商品資料失敗:', err)
    alert('載入資料失敗：' + (err?.response?.data?.message || err?.message || '請稍後再試'))
  } finally { isLoading.value = false }
})

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
</style>

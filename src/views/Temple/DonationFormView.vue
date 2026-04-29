<template>
  <div class="donation-form-page">
    <AppBreadcrumb :items="breadcrumbs" />

    <button class="back-btn" @click="goBack">
      <span class="back-arrow">‹</span> 返回上一頁
    </button>

    <div class="form-card">
      <h2 class="form-title">新增捐款商品</h2>

      <!-- 捐款名稱 -->
      <div class="form-row">
        <div class="form-group full-width">
          <label class="form-label">捐款名稱 <span class="required">*</span></label>
          <input v-model="form.nameZhTw" class="form-input" :class="{ error: errors.nameZhTw }" placeholder="請輸入捐款名稱" />
          <span v-if="errors.nameZhTw" class="error-msg">{{ errors.nameZhTw }}</span>
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

      <!-- 是否開發票 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">是否開發票</label>
          <label class="checkbox-label" style="padding-top:4px">
            <input type="checkbox" v-model="form.isInvoiceSupported" class="checkbox-input" />
            開發票
          </label>
        </div>
        <div class="form-group"></div>
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

      <!-- 常駐 -->
      <div class="form-row">
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

      <!-- 捐款說明 -->
      <div class="form-row" style="margin-top: 24px;">
        <div class="form-group full-width">
          <label class="form-label">捐款說明</label>
          <textarea v-model="form.depictionZhTw" class="form-textarea" placeholder="請輸入捐款說明" rows="5"></textarea>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button class="btn-primary" type="button" @click="handleSubmit('OPEN')" :disabled="isSaving">
        {{ isSaving ? '送出中...' : '確認新增' }}
      </button>
      <button class="btn-draft" type="button" @click="handleSubmit('DRAFT')" :disabled="isSaving">新增草稿</button>
      <button class="btn-cancel" type="button" @click="goBack">取消</button>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'
import { useTempleStore } from '@/stores/temple'

const route = useRoute()
const router = useRouter()
const templeStore = useTempleStore()

const templeId = computed(() => route.params.templeId)
const isSaving = ref(false)

const breadcrumbs = computed(() => [
  { text: '後台管理' },
  { text: '活動與上架管理', onClick: goBack },
  { text: '新增捐款商品' },
])

const ritualDocuments = ref([])
const certificates    = ref([])

// ── 主圖 ──
const mainImages = ref([])
const isMainUploading = ref(false)

const handleMainImageUpload = async (event) => {
  const files = Array.from(event.target.files)
  const toUpload = files.slice(0, 5 - mainImages.value.length)
  event.target.value = ''
  if (!toUpload.length) return
  const previews = toUpload.map(file => ({ url: URL.createObjectURL(file), file, id: null }))
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

// ── 表單 ──
const form = reactive({
  nameZhTw:           '',
  ritualDocumentId:   null,
  certificateId:      null,
  isInvoiceSupported: false,
  publishAt:          '',
  unpublishAt:        '',
  isPermanent:        false,
  depictionZhTw:      '',
})

const errors = reactive({ nameZhTw: '' })

const validate = () => {
  errors.nameZhTw = form.nameZhTw.trim() ? '' : '請填寫捐款名稱'
  return !errors.nameZhTw
}

const toApiDateTime = (val) => val ? val.replace('T', ' ') + ':00' : null

const buildPayload = (status) => ({
  eventIds:           [],
  ritualDocumentId:   form.ritualDocumentId   || undefined,
  certificateId:      form.certificateId      || undefined,
  nameZhTw:           form.nameZhTw,
  depictionZhTw:      form.depictionZhTw,
  status,
  isInvoiceSupported: form.isInvoiceSupported,
  publishAt:          form.isPermanent ? null : toApiDateTime(form.publishAt),
  unpublishAt:        form.isPermanent ? null : toApiDateTime(form.unpublishAt),
  imgIds:             mainImages.value.map(img => img.id).filter(id => id !== null),
  skus:               [],
})

const handleSubmit = async (status) => {
  if (!validate()) return
  isSaving.value = true
  try {
    const payload = buildPayload(status)
    console.log('新增捐款 payload:', JSON.stringify(payload, null, 2))
    await templeStore.createDonationProduct(templeId.value, payload)
    alert(status === 'DRAFT' ? '草稿已儲存' : '捐款商品新增成功')
    goBack()
  } catch (err) {
    console.error('捐款商品新增失敗:', err)
    alert(err?.response?.data?.message || '操作失敗，請稍後再試')
  } finally { isSaving.value = false }
}

const goBack = () => {
  router.push({ name: 'app.temple.activity-management', params: { templeId: templeId.value }, query: { tab: 'donations' } })
}

onMounted(() => {
  templeStore.fetchRitualDocuments(templeId.value)
    .then(r => { ritualDocuments.value = r.map(i => ({ id: i.id, name: i.name })) })
  templeStore.fetchCertificates(templeId.value)
    .then(r => { certificates.value = r.map(i => ({ id: i.id, name: i.name })) })
})

</script>

<style scoped>
.donation-form-page { padding: 24px 32px 60px; min-height: 100%; background: #F3F4F6; }
.back-btn { display: inline-flex; align-items: center; gap: 4px; background: none; border: none; color: #E8572A; font-size: 14px; cursor: pointer; margin-bottom: 16px; padding: 0; font-weight: 500; }
.back-btn:hover { opacity: 0.75; }
.back-arrow { font-size: 16px; }
.form-card { background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 24px; }
.form-title { font-size: 1.2rem; font-weight: 700; color: #1a1a1a; margin: 0 0 28px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 20px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full-width { grid-column: 1 / -1; }
.form-label { font-size: 13px; font-weight: 500; color: #555; }
.required { color: #E8572A; margin-left: 2px; }
.form-input { padding: 11px 16px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 14px; color: #333; background: #fff; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
.form-input:focus { border-color: #E8572A; box-shadow: 0 0 0 3px rgba(232,87,42,0.08); }
.form-input.error { border-color: #e53e3e; }
.form-input:disabled { background: #f5f5f5; color: #aaa; cursor: not-allowed; }
.error-msg { font-size: 12px; color: #e53e3e; }
.select-wrap { position: relative; flex: 1; }
.form-select { width: 100%; padding: 11px 36px 11px 16px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 14px; color: #333; background: #fff; appearance: none; outline: none; cursor: pointer; }
.form-select:focus { border-color: #E8572A; }
.select-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #888; font-size: 12px; }
.field-hint { font-size: 12px; color: #aaa; margin-top: 2px; }
.checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #333; cursor: pointer; }
.checkbox-input { width: 16px; height: 16px; accent-color: #E8572A; cursor: pointer; }
.input-with-btn { display: flex; gap: 8px; align-items: flex-start; }
.btn-manage { display: flex; align-items: center; gap: 4px; padding: 10px 14px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 10px; font-size: 13px; color: #555; cursor: pointer; white-space: nowrap; transition: background 0.2s; flex-shrink: 0; }
.btn-manage:hover { background: #eee; }
.manage-icon { font-size: 14px; }
.section-title { font-size: 15px; font-weight: 600; color: #1a1a1a; margin: 28px 0 16px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0; }
.main-image-section { margin-bottom: 8px; }
.image-upload-area { display: flex; flex-wrap: wrap; gap: 12px; }
.image-preview { position: relative; width: 120px; height: 120px; border-radius: 10px; overflow: hidden; border: 1px solid #e0e0e0; }
.image-preview img { width: 100%; height: 100%; object-fit: cover; }
.image-remove { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.45); color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.image-upload-btn { width: 120px; height: 120px; border: 1.5px dashed #c8c8c8; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; background: #fafafa; transition: border-color 0.2s; gap: 4px; }
.image-upload-btn:hover { border-color: #E8572A; background: #fff8f6; }
.image-upload-btn.uploading { cursor: default; }
.upload-plus { font-size: 24px; color: #bbb; line-height: 1; }
.upload-text { font-size: 12px; color: #aaa; }
.image-hint { font-size: 12px; color: #aaa; margin-top: 8px; }
.form-textarea { padding: 12px 16px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 14px; color: #333; resize: vertical; outline: none; width: 100%; box-sizing: border-box; font-family: inherit; }
.form-textarea:focus { border-color: #E8572A; box-shadow: 0 0 0 3px rgba(232,87,42,0.08); }
.form-actions { display: flex; justify-content: flex-end; align-items: center; gap: 12px; padding-bottom: 20px; }
.btn-primary { padding: 10px 28px; background: #E8572A; color: #fff; border: none; border-radius: 50px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover:not(:disabled) { background: #d14a1f; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-draft { padding: 10px 24px; background: #fff; color: #E8572A; border: 1px solid #E8572A; border-radius: 50px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.2s; }
.btn-draft:hover:not(:disabled) { background: #fff5f2; }
.btn-cancel { padding: 10px 24px; background: #fff; color: #555; border: 1px solid #ddd; border-radius: 50px; font-size: 14px; font-weight: 500; cursor: pointer; }
.btn-cancel:hover { background: #f5f5f5; }
</style>

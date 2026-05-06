<template>
  <div class="tmpl-detail">
    <div class="breadcrumb">
      <span class="bc-link" @click="router.push({ name: 'app.cms.customer-template-management' })">網站模板管理</span>
      <span class="bc-sep">›</span>
      <span class="bc-current">模板詳細資訊</span>
    </div>

    <div v-if="isLoading" class="loading-state">載入中...</div>

    <template v-else-if="detail">
      <!-- 頁頭 -->
      <div class="detail-header">
        <div class="header-left">
          <h1 class="page-title">{{ detail.name }}</h1>
          <div class="header-tags">
            <span class="meta-tag" :class="levelClass(detail.level)">{{ detail.level }}</span>
            <span class="meta-tag tag-type">{{ detail.type }}</span>
            <span class="meta-tag tag-creator">{{ detail.creatorType }}</span>
            <span class="status-badge" :class="detail.status === 'OPEN' ? 'badge-green' : 'badge-red'">
              {{ detail.status === 'OPEN' ? '啟用' : '停用' }}
            </span>
            <span v-if="detail.reviewStatus" class="badge" :class="rvStatusClass(detail.reviewStatus)">
              {{ rvStatusLabel(detail.reviewStatus) }}
            </span>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-outline" @click="router.back()">← 返回列表</button>
          <button class="btn-edit" @click="goEditTemplate">✏️ 編輯模板內容</button>
        </div>
      </div>

      <!-- 主要內容：封面 + 基本資訊 -->
      <div class="detail-body">
        <div class="cover-card">
          <label for="cover-img-upload" class="cover-upload-label" :class="{ uploading: coverUploading }">
            <!-- 已有封面（原始或剛上傳） -->
            <img v-if="currentCoverImgUrl" :src="currentCoverImgUrl" :alt="detail.name" class="cover-img" />
            <!-- 無封面佔位 -->
            <div v-else class="cover-placeholder">
              <svg viewBox="0 0 64 64" fill="none" width="64" height="64">
                <rect width="64" height="64" rx="12" fill="#f3f4f6"/>
                <path d="M12 44l14-14 10 10 8-8 14 14H12z" fill="#e5e7eb"/>
                <circle cx="20" cy="24" r="6" fill="#e5e7eb"/>
              </svg>
              <span>無封面圖</span>
            </div>
            <!-- Hover 遮罩 -->
            <div v-if="coverUploading" class="cover-overlay">上傳中...</div>
            <div v-else class="cover-overlay cover-overlay--hover">
              <span class="cover-overlay-icon">📷</span>
              <span>{{ currentCoverImgUrl ? '更換封面' : '上傳封面' }}</span>
            </div>
            <input id="cover-img-upload" type="file" accept="image/*" style="display:none"
              @change="handleCoverUpload" :disabled="coverUploading" />
          </label>
          <div v-if="currentCoverImgId" class="cover-uploaded-hint">已更換，送審時將自動帶入</div>
        </div>

        <div class="info-card">
          <div class="card-header">基本資訊</div>
          <div class="info-grid">
            <div class="info-row"><span class="info-label">模板 ID</span><span class="info-value info-id">{{ detail.id }}</span></div>
            <div class="info-row"><span class="info-label">分類</span><span class="info-value">{{ detail.categoryName || detail.categoryId || '-' }}</span></div>
            <div class="info-row"><span class="info-label">模板名稱</span><span class="info-value">{{ detail.name }}</span></div>
            <div class="info-row"><span class="info-label">描述</span><span class="info-value">{{ detail.description || '-' }}</span></div>
            <div class="info-row"><span class="info-label">類型</span><span class="info-value">{{ detail.type }}</span></div>
            <div class="info-row">
              <span class="info-label">方案層級</span>
              <span class="info-value"><span class="meta-tag" :class="levelClass(detail.level)">{{ detail.level }}</span></span>
            </div>
            <div class="info-row"><span class="info-label">建立來源</span><span class="info-value">{{ detail.creatorType }}</span></div>
            <div class="info-row"><span class="info-label">字型</span><span class="info-value" :style="{ fontFamily: detail.frontFamily }">{{ detail.frontFamily || '-' }}</span></div>
            <div class="info-row">
              <span class="info-label">狀態</span>
              <span class="info-value">
                <span class="status-badge" :class="detail.status === 'OPEN' ? 'badge-green' : 'badge-red'">{{ detail.status === 'OPEN' ? '啟用' : '停用' }}</span>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">審核狀態</span>
              <span class="info-value">
                <span v-if="detail.reviewStatus" class="badge" :class="rvStatusClass(detail.reviewStatus)">{{ rvStatusLabel(detail.reviewStatus) }}</span>
                <span v-else>-</span>
              </span>
            </div>
            <div class="info-row"><span class="info-label">建立者</span><span class="info-value">{{ detail.createdByName || '-' }}</span></div>
          </div>
        </div>
      </div>

      <!-- ═══════════════ 審查管理區塊 ═══════════════ -->
      <div class="review-section">
        <div class="section-title-row">
          <h2 class="section-title">審查管理</h2>
          <!-- 審查狀態允許新建/編輯時顯示切換按鈕 -->
          <template v-if="canEditReview">
            <button v-if="!showReviewForm" class="btn-outline" @click="openReviewForm">
              {{ review ? '✏️ 編輯審查資料' : '＋ 建立審查' }}
            </button>
            <button v-else class="btn-outline" @click="showReviewForm = false">取消</button>
          </template>
        </div>

        <!-- 現有審查資訊 -->
        <div v-if="review && !showReviewForm" class="review-card">
          <!-- 狀態提示 -->
          <div class="review-status-bar" :class="rvBarClass(review.status)">
            <span class="badge" :class="rvStatusClass(review.status)">{{ rvStatusLabel(review.status) }}</span>
            <span v-if="review.status === 'IN_REVIEW'" class="status-hint">審查進行中，請耐心等待</span>
            <span v-else-if="review.status === 'APPROVED'" class="status-hint">🎉 審查已通過！</span>
            <span v-else-if="review.status === 'REVIEW_FAILED'" class="status-hint">審查未通過，請修改後重新提交</span>
            <span v-else-if="review.status === 'NEED_RESUBMIT'" class="status-hint">需要重新提交，請修改後再試</span>
            <span v-else-if="review.status === 'PENDING'" class="status-hint">已建立審查草稿，記得送出審查</span>
          </div>

          <div class="review-grid">
            <div class="info-row"><span class="info-label">審查 ID</span><span class="info-value info-id">{{ review.id }}</span></div>
            <div class="info-row"><span class="info-label">名稱</span><span class="info-value">{{ review.name || '-' }}</span></div>
            <div class="info-row"><span class="info-label">描述</span><span class="info-value">{{ review.description || '-' }}</span></div>
            <div class="info-row">
              <span class="info-label">方案層級</span>
              <span class="info-value"><span class="meta-tag" :class="levelClass(review.level)">{{ review.level || '-' }}</span></span>
            </div>
            <div class="info-row"><span class="info-label">字型</span><span class="info-value" :style="{ fontFamily: review.frontFamily }">{{ review.frontFamily || '-' }}</span></div>
            <div class="info-row"><span class="info-label">備註</span><span class="info-value">{{ review.note || '-' }}</span></div>
            <div class="info-row"><span class="info-label">送審時間</span><span class="info-value">{{ formatDate(review.createdAt) }}</span></div>
            <div class="info-row"><span class="info-label">更新時間</span><span class="info-value">{{ formatDate(review.updatedAt) }}</span></div>
          </div>

          <!-- 操作按鈕：送出審查 -->
          <div v-if="canSubmitReview" class="review-actions">
            <button class="btn-submit-review" @click="handleSubmitReview" :disabled="submitting">
              {{ submitting ? '送出中...' : '📤 送出審查' }}
            </button>
          </div>
        </div>

        <!-- 尚無審查記錄 -->
        <div v-else-if="!review && !showReviewForm" class="review-empty">
          尚無審查記錄，點擊「建立審查」開始申請上架審查
        </div>

        <!-- 建立 / 編輯審查表單 -->
        <div v-if="showReviewForm" class="review-form-card">
          <div class="form-card-header">{{ review ? '編輯審查資料' : '建立審查申請' }}</div>
          <div class="rv-form-body">
            <div class="form-group">
              <label class="form-label required">名稱</label>
              <input v-model="rvForm.name" class="form-input" placeholder="請輸入送審名稱" />
            </div>
            <div class="form-group">
              <label class="form-label required">方案層級</label>
              <div class="select-wrap">
                <select v-model="rvForm.level" class="form-select">
                  <option value="">請選擇</option>
                  <option value="FREE">FREE</option>
                  <option value="PRO">PRO</option>
                  <option value="ENTERPRISE">ENTERPRISE</option>
                </select>
                <span class="select-arrow">▾</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">字型</label>
              <div class="select-wrap">
                <select v-model="rvForm.frontFamily" class="form-select">
                  <option value="">請選擇字型</option>
                  <optgroup label="繁體中文">
                    <option value="IBM Plex Sans TC">IBM Plex Sans TC</option>
                    <option value="LXGW WenKai Mono TC">LXGW WenKai Mono TC</option>
                    <option value="Noto Sans TC">Noto Sans TC</option>
                    <option value="Noto Serif TC">Noto Serif TC</option>
                  </optgroup>
                  <optgroup label="簡體中文">
                    <option value="Noto Sans SC">Noto Sans SC</option>
                    <option value="Noto Serif SC">Noto Serif SC</option>
                    <option value="IBM Plex Sans SC">IBM Plex Sans SC</option>
                  </optgroup>
                </select>
                <span class="select-arrow">▾</span>
              </div>
            </div>
            <div class="form-group form-group--full">
              <label class="form-label">描述</label>
              <textarea v-model="rvForm.description" class="form-textarea" rows="3" placeholder="請輸入送審描述" />
            </div>
          </div>
          <div class="rv-form-footer">
            <button class="btn-outline" @click="showReviewForm = false">取消</button>
            <button class="btn-save-draft" @click="handleSaveReview" :disabled="submitting">
              {{ submitting ? '儲存中...' : (review ? '更新草稿' : '建立草稿') }}
            </button>
            <button class="btn-submit-review" @click="handleSaveAndSubmit" :disabled="submitting">
              {{ submitting ? '處理中...' : '儲存並送出審查' }}
            </button>
          </div>
        </div>
      </div>

    </template>

    <div v-else class="empty-state">查無此模板資料</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axiosClient from '@/axios'

const route      = useRoute()
const router     = useRouter()
const templateId = route.params.templateId

// ── 模板詳情 ──
const detail    = ref(null)
const isLoading = ref(false)

const fetchDetail = async () => {
  isLoading.value = true
  try {
    const res = await axiosClient.get(`/frontend/web-template/${templateId}`)
    detail.value = res.data?.data || null
  } catch (e) {
    console.error('獲取模板詳情失敗:', e)
    detail.value = null
  } finally {
    isLoading.value = false
  }
}

// ── 審查記錄 ──
const review = ref(null)

const fetchReview = async () => {
  try {
    const res = await axiosClient.get(`/frontend/web-template/${templateId}/review`)
    review.value = res.data?.data || null
  } catch {
    review.value = null
  }
}

// 允許編輯的狀態（含 null = 尚無審查）
const canEditReview = computed(() => {
  const s = review.value?.status
  return !s || ['PENDING', 'RE_REVIEW', 'REVIEW_FAILED', 'NEED_RESUBMIT'].includes(s)
})

// 允許送出審查的狀態
const canSubmitReview = computed(() => {
  const s = review.value?.status
  return s && ['PENDING', 'RE_REVIEW', 'REVIEW_FAILED', 'NEED_RESUBMIT'].includes(s)
})

// ── 封面圖（主頁面上傳，送審時自動帶入）──
const coverUploading    = ref(false)
const currentCoverImgUrl = ref('')
const currentCoverImgId  = ref('')

const handleCoverUpload = async (event) => {
  const file = event.target.files[0]
  event.target.value = ''
  if (!file) return
  currentCoverImgUrl.value = URL.createObjectURL(file)
  coverUploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await axiosClient.post('/frontend/web-template/cover-img', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const data = res.data?.data?.[0] || res.data?.data
    if (data?.id) {
      currentCoverImgId.value  = data.id
      currentCoverImgUrl.value = data.fileUrl || currentCoverImgUrl.value
    } else {
      throw new Error('上傳回應格式異常')
    }
  } catch (e) {
    currentCoverImgUrl.value = detail.value?.coverImgUrl || ''
    currentCoverImgId.value  = ''
    alert(e.response?.data?.message || '封面上傳失敗，請稍後再試')
  } finally {
    coverUploading.value = false
  }
}

// ── 審查表單 ──
const showReviewForm = ref(false)
const submitting     = ref(false)
const rvForm = reactive({ name: '', level: '', description: '', frontFamily: '' })

const openReviewForm = () => {
  const src = review.value || detail.value
  rvForm.name        = src?.name        || ''
  rvForm.level       = src?.level       || ''
  rvForm.description = src?.description || ''
  rvForm.frontFamily = src?.frontFamily || ''
  showReviewForm.value = true
}

const buildPayload = () => {
  const p = {
    name:        rvForm.name.trim()        || undefined,
    level:       rvForm.level             || undefined,
    description: rvForm.description.trim() || undefined,
    frontFamily: rvForm.frontFamily       || undefined,
    coverImgId:  currentCoverImgId.value  || undefined,
  }
  Object.keys(p).forEach(k => p[k] === undefined && delete p[k])
  return p
}

// 建立或更新草稿
const handleSaveReview = async () => {
  submitting.value = true
  try {
    if (review.value) {
      await axiosClient.patch(`/frontend/web-template/${templateId}/review`, buildPayload())
      alert('審查資料已更新')
    } else {
      const res = await axiosClient.post(`/frontend/web-template/${templateId}/review`, buildPayload())
      console.log('建立審查:', res.data)
      alert('審查草稿已建立')
    }
    showReviewForm.value = false
    await fetchReview()
  } catch (e) {
    alert(e.response?.data?.message || '操作失敗，請稍後再試')
  } finally {
    submitting.value = false
  }
}

// 儲存並直接送出審查
const handleSaveAndSubmit = async () => {
  submitting.value = true
  try {
    if (review.value) {
      await axiosClient.patch(`/frontend/web-template/${templateId}/review`, buildPayload())
    } else {
      await axiosClient.post(`/frontend/web-template/${templateId}/review`, buildPayload())
    }
    await axiosClient.patch(`/frontend/web-template/${templateId}/review/submit`)
    alert('審查已送出！')
    showReviewForm.value = false
    await fetchReview()
  } catch (e) {
    alert(e.response?.data?.message || '送出失敗，請稍後再試')
  } finally {
    submitting.value = false
  }
}

// 單獨送出審查（若有新封面先更新草稿再 submit）
const handleSubmitReview = async () => {
  if (!confirm('確定要送出審查申請嗎？')) return
  submitting.value = true
  try {
    if (currentCoverImgId.value) {
      await axiosClient.patch(`/frontend/web-template/${templateId}/review`, { coverImgId: currentCoverImgId.value })
    }
    await axiosClient.patch(`/frontend/web-template/${templateId}/review/submit`)
    alert('審查已送出！')
    await fetchReview()
  } catch (e) {
    alert(e.response?.data?.message || '送出失敗，請稍後再試')
  } finally {
    submitting.value = false
  }
}

const goEditTemplate = () => {
  router.push({
    name: 'app.cms.frontend-template-editor',
    query: { frontendTemplateMode: 'true', templateId: detail.value.id },
  })
}

// ── 工具函式 ──
const levelClass = (level) => ({
  FREE: 'tag-free', PRO: 'tag-pro', ENTERPRISE: 'tag-enterprise',
}[level] ?? '')

const rvStatusLabel = (s) => ({
  PENDING: '待審核', IN_REVIEW: '審核中', RE_REVIEW: '重新審核',
  REVIEW_FAILED: '審核失敗', APPROVED: '已通過', NEED_RESUBMIT: '需重新提交',
}[s] ?? s)

const rvStatusClass = (s) => ({
  PENDING: 'badge-yellow', IN_REVIEW: 'badge-blue', RE_REVIEW: 'badge-orange',
  REVIEW_FAILED: 'badge-red', APPROVED: 'badge-green', NEED_RESUBMIT: 'badge-orange',
}[s] ?? '')

const rvBarClass = (s) => ({
  APPROVED: 'bar-green', REVIEW_FAILED: 'bar-red', NEED_RESUBMIT: 'bar-orange',
  IN_REVIEW: 'bar-blue', PENDING: 'bar-gray', RE_REVIEW: 'bar-orange',
}[s] ?? '')

const formatDate = (d) => d ? new Date(d).toLocaleString('zh-TW') : '-'

onMounted(async () => {
  await fetchDetail()
  currentCoverImgUrl.value = detail.value?.coverImgUrl || ''
  await fetchReview()
})
</script>

<style scoped lang="scss">
.tmpl-detail {
  padding: 24px 32px 60px;
  min-height: 100%;
  background: #f3f4f6;
}

/* 麵包屑 */
.breadcrumb { font-size: 13px; color: #999; margin-bottom: 24px; }
.bc-sep { margin: 0 6px; }
.bc-link { color: #E8572A; cursor: pointer; &:hover { text-decoration: underline; } }
.bc-current { color: #374151; font-weight: 500; }

/* 頁頭 */
.detail-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; margin-bottom: 24px; flex-wrap: wrap;
}
.header-left { display: flex; flex-direction: column; gap: 10px; }
.page-title { font-size: 22px; font-weight: 700; color: #1f2937; margin: 0; }
.header-tags { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.header-actions { display: flex; gap: 10px; align-items: center; flex-shrink: 0; }

.btn-edit {
  padding: 8px 16px; background: #E8572A; border: none; border-radius: 8px;
  font-size: 13px; font-weight: 600; color: #fff; cursor: pointer;
  transition: background 0.2s; &:hover { background: #d14a1f; }
}
.btn-outline {
  padding: 8px 16px; background: #fff; border: 1.5px solid #e5e7eb;
  border-radius: 8px; font-size: 13px; color: #374151; cursor: pointer;
  transition: all 0.15s; &:hover { border-color: #9ca3af; }
}

/* 主體雙欄 */
.detail-body {
  display: grid; grid-template-columns: 280px 1fr;
  gap: 20px; align-items: start; margin-bottom: 24px;
}
.cover-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
.cover-img { width: 100%; display: block; object-fit: cover; }
.cover-placeholder {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 10px; padding: 40px 0; background: #f9fafb;
  span { font-size: 13px; color: #9ca3af; }
}

/* 資訊卡片 */
.info-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
.card-header {
  padding: 14px 20px; font-size: 14px; font-weight: 600; color: #1f2937;
  border-bottom: 1px solid #f3f4f6; background: #fafafa;
}
.info-grid { padding: 8px 0; }
.info-row {
  display: flex; align-items: flex-start; gap: 12px; padding: 10px 20px;
  border-bottom: 1px solid #f9fafb; &:last-child { border-bottom: none; }
}
.info-label { flex-shrink: 0; width: 80px; font-size: 12px; color: #9ca3af; font-weight: 500; padding-top: 2px; }
.info-value { flex: 1; font-size: 13px; color: #1f2937; word-break: break-all; }
.info-id { font-family: monospace; font-size: 11px; color: #6b7280; }

/* ═══════ 審查管理區塊 ═══════ */
.review-section { margin-top: 0; }

.section-title-row {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;
}
.section-title { font-size: 18px; font-weight: 700; color: #1f2937; margin: 0; }

/* 審查記錄卡片 */
.review-card {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;
}

.review-status-bar {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 20px; border-bottom: 1px solid #f3f4f6;
  &.bar-green  { background: #f0fdf4; }
  &.bar-red    { background: #fef2f2; }
  &.bar-orange { background: #fff7ed; }
  &.bar-blue   { background: #eff6ff; }
  &.bar-gray   { background: #f9fafb; }
}
.status-hint { font-size: 13px; color: #6b7280; }

.review-grid { padding: 8px 0; }

.review-actions {
  padding: 14px 20px; border-top: 1px solid #f3f4f6; background: #fafafa;
  display: flex; justify-content: flex-end;
}

.review-empty {
  background: #fff; border: 1.5px dashed #e5e7eb; border-radius: 12px;
  padding: 40px; text-align: center; font-size: 14px; color: #9ca3af;
}

/* 審查表單 */
.review-form-card {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;
}
.form-card-header {
  padding: 14px 20px; font-size: 14px; font-weight: 600; color: #1f2937;
  border-bottom: 1px solid #f3f4f6; background: #fafafa;
}
.rv-form-body {
  padding: 20px 24px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px 24px;
}
.form-group { display: flex; flex-direction: column; gap: 6px; &--full { grid-column: 1 / -1; } }
.form-label {
  font-size: 13px; font-weight: 500; color: #374151;
  &.required::after { content: ' *'; color: #E8572A; }
}
.form-input, .form-select, .form-textarea {
  padding: 9px 12px; border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 14px; color: #1f2937; background: #fff; outline: none;
  transition: border-color 0.15s; font-family: inherit;
  &:focus { border-color: #E8572A; box-shadow: 0 0 0 3px rgba(232,87,42,0.08); }
}
.form-textarea { resize: vertical; min-height: 80px; }
.select-wrap { position: relative; }
.form-select { width: 100%; padding-right: 32px; appearance: none; cursor: pointer; }
.select-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; font-size: 12px; }

.rv-form-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 14px 24px; border-top: 1px solid #f3f4f6; background: #fafafa;
}

.btn-save-draft {
  padding: 9px 20px; background: #fff; color: #374151; border: 1.5px solid #d1d5db;
  border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;
  transition: all 0.15s;
  &:hover:not(:disabled) { border-color: #9ca3af; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}
.btn-submit-review {
  padding: 9px 22px; background: #E8572A; color: #fff; border: none;
  border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
  transition: background 0.2s;
  &:hover:not(:disabled) { background: #d14a1f; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}

/* Tags / Badges */
.meta-tag { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; }
.tag-free       { background: #e0f2fe; color: #0369a1; }
.tag-pro        { background: #ede9fe; color: #6d28d9; }
.tag-enterprise { background: #fef3c7; color: #92400e; }
.tag-type       { background: #f1f5f9; color: #475569; }
.tag-creator    { background: #f1f5f9; color: #475569; }

.status-badge { display: inline-block; padding: 3px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.badge        { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
.badge-green  { background: #dcfce7; color: #16a34a; }
.badge-red    { background: #fee2e2; color: #dc2626; }
.badge-yellow { background: #fef9c3; color: #ca8a04; }
.badge-blue   { background: #dbeafe; color: #1d4ed8; }
.badge-orange { background: #ffedd5; color: #c2410c; }

/* 封面上傳 */
.cover-upload-label {
  display: block; position: relative; cursor: pointer; overflow: hidden;
  &.uploading { cursor: wait; }
  &:hover .cover-overlay--hover { opacity: 1; }
}
.cover-overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; color: #fff; font-size: 13px; font-weight: 500;
  &--hover { opacity: 0; transition: opacity 0.2s; }
}
.cover-overlay-icon { font-size: 22px; }
.cover-uploaded-hint {
  padding: 6px 10px; font-size: 11px; color: #16a34a; text-align: center;
  background: #dcfce7; border-top: 1px solid #bbf7d0;
}

.loading-state { text-align: center; padding: 80px; color: #9ca3af; font-size: 14px; }
.empty-state   { text-align: center; padding: 80px; color: #9ca3af; font-size: 14px; }

@media (max-width: 768px) {
  .tmpl-detail { padding: 16px 16px 40px; }
  .detail-body { grid-template-columns: 1fr; }
  .rv-form-body { grid-template-columns: 1fr; }
}
</style>

<template>
  <div class="template-detail">
    <AppBreadcrumb :items="breadcrumbs" />

    <!-- 載入中 -->
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
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-outline" @click="router.back()">← 返回列表</button>
          <button class="btn-edit-template" @click="goEditTemplate">
            ✏️ 編輯模板內容
          </button>
          <button
            class="btn-toggle"
            :class="detail.status === 'OPEN' ? 'btn-danger' : 'btn-success'"
            @click="toggleStatus"
          >{{ detail.status === 'OPEN' ? '停用此模板' : '啟用此模板' }}</button>
        </div>
      </div>

      <!-- 主要內容 -->
      <div class="detail-body">

        <!-- 左側：基本資訊 -->
        <div class="info-card">
          <div class="card-header">基本資訊</div>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">模板 ID</span>
              <span class="info-value info-id">{{ detail.id }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">分類 ID</span>
              <span class="info-value info-id">{{ detail.categoryId || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">模板名稱</span>
              <span class="info-value">{{ detail.name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">描述</span>
              <span class="info-value">{{ detail.description || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">類型</span>
              <span class="info-value">{{ detail.type }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">方案層級</span>
              <span class="info-value">
                <span class="meta-tag" :class="levelClass(detail.level)">{{ detail.level }}</span>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">建立來源</span>
              <span class="info-value">{{ detail.creatorType }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">字型</span>
              <span class="info-value" :style="{ fontFamily: detail.frontFamily }">
                {{ detail.frontFamily || '-' }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">狀態</span>
              <span class="info-value">
                <span class="status-badge" :class="detail.status === 'OPEN' ? 'badge-green' : 'badge-red'">
                  {{ detail.status === 'OPEN' ? '啟用' : '停用' }}
                </span>
              </span>
            </div>
          </div>
        </div>

        <!-- 右側：頁面列表 -->
        <div class="pages-card">
          <div class="card-header">
            頁面列表
            <span class="page-count">共 {{ detail.pages?.length ?? 0 }} 頁</span>
          </div>

          <div v-if="!detail.pages || detail.pages.length === 0" class="empty-pages">
            尚未設定任何頁面
          </div>

          <div v-else class="pages-list">
            <div
              v-for="page in detail.pages"
              :key="page.code"
              class="page-item"
              :class="{ 'is-open': openPage === page.code }"
            >
              <!-- 頁面標題列 -->
              <div class="page-row" @click="togglePage(page.code)">
                <div class="page-info">
                  <span class="page-code">{{ page.code }}</span>
                  <span class="page-slug">/{{ page.slug }}</span>
                </div>
                <div class="page-right">
                  <span class="content-chip" :class="page.publishedContentJson?.length ? 'chip-green' : 'chip-gray'">
                    已發佈 {{ page.publishedContentJson?.length ?? 0 }} 個區塊
                  </span>
                  <span class="content-chip chip-blue">
                    草稿 {{ page.draftContentJson?.length ?? 0 }} 個區塊
                  </span>
                  <svg
                    class="chevron"
                    :class="{ rotated: openPage === page.code }"
                    viewBox="0 0 20 20" fill="currentColor" width="16" height="16"
                  >
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>

              <!-- 展開：JSON 預覽 -->
              <div v-if="openPage === page.code" class="page-detail">
                <div class="json-section">
                  <div class="json-label">已發佈內容（publishedContentJson）</div>
                  <pre class="json-pre">{{ formatJson(page.publishedContentJson) }}</pre>
                </div>
                <div class="json-section">
                  <div class="json-label">草稿內容（draftContentJson）</div>
                  <pre class="json-pre">{{ formatJson(page.draftContentJson) }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </template>

    <!-- 找不到 -->
    <div v-else class="empty-state">查無此模板資料</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'
import axiosClient from '@/axios'

const route      = useRoute()
const router     = useRouter()
const templeId   = route.params.templeId
const templateId = route.params.templateId

const breadcrumbs = [
  { text: '宮廟後台',    to: `/${templeId}/dashboard` },
  { text: '網站模板管理', to: `/${templeId}/template-management` },
  { text: '模板詳細資訊', to: null },
]

const detail    = ref(null)
const isLoading = ref(false)
const openPage  = ref(null)

const fetchDetail = async () => {
  isLoading.value = true
  try {
    const res = await axiosClient.get(`/backend/web-template/${templateId}`)
    detail.value = res.data?.data || null
  } catch (e) {
    console.error('獲取模板詳情失敗:', e)
    detail.value = null
  } finally {
    isLoading.value = false
  }
}

const goEditTemplate = () => {
  router.push({
    name: 'app.temple.page-editor',
    params: { templeId },
    query: { backendTemplateMode: 'true', templateId: detail.value.id },
  })
}

const toggleStatus = async () => {
  const next  = detail.value.status === 'OPEN' ? 'INVALID' : 'OPEN'
  const label = next === 'INVALID' ? '停用' : '啟用'
  if (!confirm(`確定要${label}此模板嗎？`)) return
  try {
    await axiosClient.patch(`/backend/web-template/${templateId}/status`, { status: next })
    detail.value.status = next
  } catch { alert('操作失敗，請稍後再試') }
}

const togglePage = (code) => {
  openPage.value = openPage.value === code ? null : code
}

const levelClass = (level) => ({
  FREE:       'tag-free',
  PRO:        'tag-pro',
  ENTERPRISE: 'tag-enterprise',
}[level] ?? '')

const formatJson = (val) => {
  if (!val || (Array.isArray(val) && val.length === 0)) return '（空）'
  try { return JSON.stringify(val, null, 2) } catch { return String(val) }
}

onMounted(fetchDetail)
</script>

<style scoped lang="scss">
.template-detail {
  padding: 24px;
  max-width: 1200px;
}

/* 頁頭 */
.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.header-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-shrink: 0;
}

.btn-outline {
  padding: 8px 16px;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { border-color: #9ca3af; }
}

.btn-toggle {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-edit-template {
  padding: 8px 16px;
  background: #E8572A;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #d14a1f; }
}

.btn-danger  { background: #fee2e2; color: #dc2626; &:hover { background: #fecaca; } }
.btn-success { background: #dcfce7; color: #16a34a; &:hover { background: #bbf7d0; } }

/* 主體雙欄 */
.detail-body {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 20px;
  align-items: start;
}

/* 通用卡片 */
.info-card,
.pages-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  border-bottom: 1px solid #f3f4f6;
  background: #fafafa;
}

.page-count {
  font-size: 12px;
  font-weight: 400;
  color: #9ca3af;
}

/* 基本資訊 */
.info-grid {
  padding: 8px 0;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 20px;
  border-bottom: 1px solid #f9fafb;

  &:last-child { border-bottom: none; }
}

.info-label {
  flex-shrink: 0;
  width: 80px;
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
  padding-top: 2px;
}

.info-value {
  flex: 1;
  font-size: 13px;
  color: #1f2937;
  word-break: break-all;
}

.info-id {
  font-family: monospace;
  font-size: 11px;
  color: #6b7280;
}

/* 頁面列表 */
.empty-pages {
  padding: 40px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

.pages-list {
  padding: 8px 0;
}

.page-item {
  border-bottom: 1px solid #f3f4f6;
  &:last-child { border-bottom: none; }
}

.page-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: #f9fafb; }
}

.page-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-code {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: monospace;
}

.page-slug {
  font-size: 13px;
  color: #6b7280;
}

.page-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.content-chip {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 10px;
}

.chip-green { background: #dcfce7; color: #16a34a; }
.chip-blue  { background: #dbeafe; color: #1d4ed8; }
.chip-gray  { background: #f1f5f9; color: #64748b; }

.chevron {
  color: #9ca3af;
  transition: transform 0.2s;
  flex-shrink: 0;

  &.rotated { transform: rotate(180deg); }
}

/* JSON 展開區 */
.page-detail {
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.json-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.json-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.json-pre {
  background: #1e293b;
  color: #e2e8f0;
  font-size: 11px;
  font-family: monospace;
  padding: 12px 16px;
  border-radius: 8px;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

/* Badge / Tag */
.meta-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.tag-free       { background: #e0f2fe; color: #0369a1; }
.tag-pro        { background: #ede9fe; color: #6d28d9; }
.tag-enterprise { background: #fef3c7; color: #92400e; }
.tag-type       { background: #f1f5f9; color: #475569; }
.tag-creator    { background: #f1f5f9; color: #475569; }

.status-badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge-green { background: #dcfce7; color: #16a34a; }
.badge-red   { background: #fee2e2; color: #dc2626; }

/* 狀態 */
.loading-state {
  text-align: center;
  padding: 80px;
  color: #9ca3af;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 80px;
  color: #9ca3af;
  font-size: 14px;
}

/* RWD */
@media (max-width: 900px) {
  .detail-body { grid-template-columns: 1fr; }
}
</style>

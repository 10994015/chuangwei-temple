<template>
  <div class="product-detail-page">
    <AppBreadcrumb :items="breadcrumbs" />

    <button class="back-btn" @click="goBack">
      <span class="back-arrow">‹</span> 返回上一頁
    </button>

    <div v-if="isLoading" class="loading-state">載入中...</div>

    <template v-else>
      <div class="form-card">
        <div class="card-header">
          <div style="display:flex;align-items:center;gap:12px">
            <h2 class="form-title" style="margin:0">商品資訊</h2>
            <span v-if="!isEditing" class="badge" :class="form.status === 'OPEN' ? 'badge-published' : 'badge-draft'">
              {{ form.status === 'OPEN' ? '上架' : '下架' }}
            </span>
          </div>
          <button v-if="!isEditing" class="btn-edit" @click="isEditing = true">
            <span>✎</span> 編輯資料
          </button>
          <button v-else class="btn-cancel-top" @click="cancelEdit">取消</button>
        </div>

        <!-- 商品名稱 & 商品項目 -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">商品名稱</label>
            <input v-if="isEditing" v-model="form.nameZhTw" class="form-input" placeholder="請輸入商品名稱" />
            <div v-else class="field-value">{{ form.nameZhTw || '-' }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">商品項目</label>
            <template v-if="isEditing">
              <div class="select-wrap">
                <select v-model="form.itemId" class="form-select">
                  <option value="">請選擇商品項目</option>
                  <option v-for="item in productItems" :key="item.value" :value="item.value">{{ item.label }}</option>
                </select>
                <span class="select-arrow">▾</span>
              </div>
            </template>
            <div v-else class="field-value">{{ getLabelById(productItems, form.itemId) }}</div>
          </div>
        </div>

        <!-- 商品類別 & 關聯活動 -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">商品類別</label>
            <template v-if="isEditing">
              <div class="input-with-btn">
                <div class="select-wrap">
                  <select v-model="form.categoryId" class="form-select">
                    <option value="">點擊選擇類別...</option>
                    <option v-for="c in productCategories" :key="c.value" :value="c.value">{{ c.label }}</option>
                  </select>
                  <span class="select-arrow">▾</span>
                </div>
                <button class="btn-manage" type="button" @click="openCategoryModal"><span class="manage-icon">⚙</span> 商品類別管理</button>
              </div>
            </template>
            <div v-else class="field-value">{{ getLabelById(productCategories, form.categoryId) }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">關聯活動</label>
            <template v-if="isEditing">
              <MultiSelectTag v-model="form.eventIds" :options="bindableEventOptions" placeholder="點擊選擇活動..." />
            </template>
            <div v-else class="field-value">{{ getEventNames(form.eventIds) }}</div>
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
          <div class="form-group"></div>
        </div>

        <!-- 上架時間 & 下架時間 -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">上架時間</label>
            <input v-if="isEditing" v-model="form.publishAt" type="datetime-local" class="form-input" :disabled="form.isPermanent" />
            <div v-else class="field-value">{{ form.isPermanent ? '常駐商品' : (form.publishAt || '-') }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">下架時間</label>
            <input v-if="isEditing" v-model="form.unpublishAt" type="datetime-local" class="form-input" :disabled="form.isPermanent" />
            <div v-else class="field-value">{{ form.isPermanent ? '常駐商品' : (form.unpublishAt || '-') }}</div>
          </div>
        </div>

        <!-- 常駐商品 -->
        <div class="form-row">
          <div class="form-group full-width">
            <template v-if="isEditing">
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.isPermanent" class="checkbox-input" />
                常駐商品（勾選後將忽略上下架時間限制）
              </label>
            </template>
            <div v-else class="field-value">{{ form.isPermanent ? '常駐商品' : '非常駐商品' }}</div>
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
            <div v-if="!isEditing && !mainImages.length" class="field-value">無圖片</div>
          </div>
          <div v-if="isEditing" class="image-hint">最多可上傳 5 張圖片</div>
        </div>

        <!-- 規格設定 -->
        <div class="section-title">規格設定</div>
        <div class="specs-list">
          <div v-for="(spec, idx) in form.specs" :key="spec.id" class="spec-card">
            <button v-if="isEditing" class="spec-close" type="button" @click="removeSpec(idx)">✕</button>

            <div class="spec-block">
              <label class="spec-label">規格名稱</label>
              <input v-if="isEditing" v-model="spec.nameZhTw" class="form-input" placeholder="例如：大、中、小..." />
              <div v-else class="field-value">{{ spec.nameZhTw || '-' }}</div>
            </div>

            <div class="spec-row-2col">
              <div class="spec-block">
                <label class="spec-label">商品價格（元）</label>
                <input v-if="isEditing" v-model.number="spec.price" type="number" class="form-input" placeholder="0" />
                <div v-else class="field-value">NT$ {{ Number(spec.price || 0).toLocaleString() }}</div>
              </div>
              <div class="spec-block">
                <label class="spec-label">庫存數量</label>
                <template v-if="isEditing">
                  <input v-model.number="spec.stock" type="number" class="form-input" placeholder="0" :disabled="spec.unlimitedStock" />
                  <label class="checkbox-label spec-sub-check">
                    <input type="checkbox" v-model="spec.unlimitedStock" class="checkbox-input" @change="onUnlimitedStockChange(spec)" />
                    無限制庫存
                  </label>
                </template>
                <div v-else class="field-value">{{ spec.unlimitedStock ? '無限制' : spec.stock }}</div>
              </div>
            </div>

            <div class="spec-divider"></div>

            <div class="spec-block">
              <label class="spec-label">公司行號是否可以購買</label>
              <template v-if="isEditing">
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
              </template>
              <div v-else class="field-value">{{ spec.isCompanyPurchasable ? '是' : '否' }}</div>
            </div>

            <div class="spec-divider"></div>

            <div class="spec-block">
              <label class="spec-label">運費設定</label>
              <template v-if="isEditing">
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
              </template>
              <div v-else class="field-value">
                {{ shippingMap[spec.shippingMode] || spec.shippingMode }}
                <span v-if="spec.shippingMode === 'SPECIAL'">（NT$ {{ spec.specialShippingFee }}）</span>
              </div>
            </div>

            <div class="spec-divider"></div>

            <div class="spec-block">
              <label class="spec-label">規格圖片</label>
              <div class="image-upload-area">
                <div v-for="(img, imgIdx) in spec.images" :key="imgIdx" class="image-preview">
                  <img :src="img.url" alt="preview" />
                  <button v-if="isEditing" class="image-remove" type="button" @click="removeSpecImage(spec, imgIdx)">✕</button>
                </div>
                <label v-if="isEditing && spec.images.length < 5" class="image-upload-btn" :for="`img-upload-${spec.id}`">
                  <span class="upload-plus">+</span>
                  <span class="upload-text">新增圖片</span>
                  <input :id="`img-upload-${spec.id}`" type="file" accept="image/*" multiple style="display:none" @change="handleSpecImageUpload(spec, $event)" />
                </label>
                <div v-if="!isEditing && !spec.images.length" class="field-value">無圖片</div>
              </div>
              <div v-if="isEditing" class="image-hint">最多可上傳 5 張圖片</div>
            </div>
          </div>
        </div>

        <button v-if="isEditing" class="btn-add-spec" type="button" @click="addSpec">+ 新增規格</button>

        <!-- 商品說明 -->
        <div class="form-row" style="margin-top:24px">
          <div class="form-group full-width">
            <label class="form-label">商品說明</label>
            <textarea v-if="isEditing" v-model="form.depictionZhTw" class="form-textarea" placeholder="請輸入商品說明" rows="5"></textarea>
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

const route  = useRoute()
const router = useRouter()
const templeStore = useTempleStore()

const templeId  = computed(() => route.params.templeId)
const productId = computed(() => route.params.productId)

const isLoading = ref(true)
const isEditing = ref(false)
const isSaving  = ref(false)

const breadcrumbs = computed(() => [
  { text: '後台管理' },
  { text: '活動與上架管理', onClick: goBack },
  { text: '商品詳情' },
])

// ── 下拉選項 ──
const productCategories = ref([])

const productItems = ref([])

const bindableEvents  = ref([])
const bindableEventOptions = computed(() => bindableEvents.value.map(e => ({ value: e.id, label: e.nameZhTw })))
const ritualDocuments = ref([])
const certificates    = ref([])
const tagOptions    = ref([])
const labelParentId = ref(null)

const shippingMap = { FREE: '無運費', STANDARD: '普通運費', SPECIAL: '特殊運費' }

const getLabelById = (list, id, keyField = 'value', labelField = 'label') => {
  if (!id && id !== 0) return '-'
  const found = list.find(i => i[keyField] === id)
  return found ? found[labelField] : id
}
const eventNamesMap = ref({})  // id -> name，從 GET 詳情 API 快取
const getEventNames = (ids) => {
  if (!ids || !ids.length) return '-'
  return ids.map(id => {
    const e = bindableEvents.value.find(ev => ev.id === id)
    return e ? (e.nameZhTw || e.name) : (eventNamesMap.value[id] || id)
  }).join('、')
}

// ── 主圖 ──
const mainImages      = ref([])
const isMainUploading = ref(false)

const handleMainImageUpload = async (event) => {
  const files    = Array.from(event.target.files)
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

const handleSpecImageUpload = async (spec, event) => {
  const files    = Array.from(event.target.files)
  const toUpload = files.slice(0, 5 - spec.images.length)
  event.target.value = ''
  if (!toUpload.length) return
  const previews = toUpload.map(f => ({ url: URL.createObjectURL(f), file: f, id: null }))
  spec.images.push(...previews)
  try {
    const results = await templeStore.uploadSkuImages(templeId.value, toUpload)
    results.forEach((res, i) => {
      const idx = spec.images.indexOf(previews[i])
      if (idx !== -1) spec.images[idx] = { url: res.publicFileUrl, file: null, id: res.id }
    })
  } catch {
    previews.forEach(p => { const idx = spec.images.indexOf(p); if (idx !== -1) spec.images.splice(idx, 1) })
    alert('圖片上傳失敗，請稍後再試')
  }
}
const removeSpecImage = (spec, imgIdx) => spec.images.splice(imgIdx, 1)

// ── 規格 ──
let specIdCounter = 0

const form = reactive({
  status: '', nameZhTw: '', itemId: '', categoryId: '',
  eventIds: [], ritualDocumentId: null, certificateId: null,
  isInvoiceSupported: false, tags: [],
  publishAt: '', unpublishAt: '', isPermanent: false,
  depictionZhTw: '', specs: [],
})

const onUnlimitedStockChange = (spec) => { if (spec.unlimitedStock) spec.stock = '' }
const addSpec    = () => form.specs.push({ id: ++specIdCounter, nameZhTw: '', price: '', stock: '', unlimitedStock: false, isCompanyPurchasable: false, shippingMode: 'FREE', specialShippingFee: 0, images: [] })
const removeSpec = (idx) => form.specs.splice(idx, 1)

// 判斷是否為合法 datetime 字串（非 "string" 等佔位值）
const isValidDatetime = (v) => !!v && v.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(v)

// ── 資料填入 ──
const fillForm = (data) => {
  form.status             = data.status || ''
  form.nameZhTw           = data.nameZhTw || ''
  form.depictionZhTw      = data.depictionZhTw || ''
  form.isInvoiceSupported = data.isInvoiceSupported ?? false
  form.itemId             = data.itemId || ''
  form.categoryId         = data.categoryId || ''
  form.ritualDocumentId   = data.ritualDocumentId || null
  form.certificateId      = data.certificateId || null
  form.tags               = data.tags || []
  form.eventIds           = (data.events || []).map(e => e.id)
  // 快取活動名稱（API events 用 name 欄位）
  const namesMap = {}
  ;(data.events || []).forEach(e => { namesMap[e.id] = e.name || e.nameZhTw || '' })
  eventNamesMap.value = namesMap
  form.publishAt          = isValidDatetime(data.publishAt)  ? data.publishAt.replace(' ', 'T').slice(0, 16)  : ''
  form.unpublishAt        = isValidDatetime(data.unpublishAt) ? data.unpublishAt.replace(' ', 'T').slice(0, 16) : ''
  form.isPermanent        = !isValidDatetime(data.publishAt) && !isValidDatetime(data.unpublishAt)
  mainImages.value        = (data.imgs || []).map(img => ({ url: img.url, file: null, id: img.id }))
  form.specs = (data.skus || []).map(sku => ({
    id:                   ++specIdCounter,
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
const toApiDateTime = (val) => val ? val.replace('T', ' ') + (val.length === 16 ? ':00' : '') : null

const buildPayload = () => ({
  itemId:             form.itemId     || undefined,
  categoryId:         form.categoryId || undefined,
  eventIds:           form.eventIds,
  ritualDocumentId:   form.ritualDocumentId   || undefined,
  certificateId:      form.certificateId      || undefined,
  status:             form.status,
  isInvoiceSupported: form.isInvoiceSupported,
  nameZhTw:           form.nameZhTw,
  depictionZhTw:      form.depictionZhTw,
  publishAt:          form.isPermanent ? null : toApiDateTime(form.publishAt),
  unpublishAt:        form.isPermanent ? null : toApiDateTime(form.unpublishAt),
  imgIds:             mainImages.value.map(img => img.id).filter(id => id !== null),
  skus: form.specs.map(spec => ({
    nameZhTw:             spec.nameZhTw,
    price:                Number(spec.price),
    stock:                spec.unlimitedStock ? -1 : Number(spec.stock),
    isCompanyPurchasable: spec.isCompanyPurchasable,
    shippingMode:         spec.shippingMode,
    specialShippingFee:   spec.shippingMode === 'SPECIAL' ? Number(spec.specialShippingFee) : 0,
    imgIds:               spec.images.map(img => img.id).filter(id => id !== null),
  })),
})

const handleSubmit = async () => {
  isSaving.value = true
  try {
    await templeStore.updatePhysicalProduct(templeId.value, productId.value, buildPayload())
    alert('商品更新成功')
    isEditing.value = false
  } catch (err) {
    console.error('商品更新失敗:', err)
    alert(err?.response?.data?.message || '操作失敗，請稍後再試')
  } finally { isSaving.value = false }
}

const cancelEdit = async () => {
  try {
    const data = await templeStore.fetchPhysicalProduct(templeId.value, productId.value)
    if (data) fillForm(data)
  } catch {}
  isEditing.value = false
}

const goBack = () => {
  router.push({ name: 'app.temple.activity-management', params: { templeId: templeId.value }, query: { tab: 'products' } })
}

onMounted(async () => {
  try {
    const [data] = await Promise.all([
      templeStore.fetchPhysicalProduct(templeId.value, productId.value),
      templeStore.fetchBindableEvents(templeId.value).then(r => { bindableEvents.value = r }),
      templeStore.fetchProductItems(templeId.value).then(r => { productItems.value = r.map(i => ({ value: i.id, label: i.name })) }),
      templeStore.fetchProductCategories(templeId.value).then(r => { productCategories.value = r.map(i => ({ value: i.id, label: i.name })) }),
      templeStore.fetchLabelCategories(templeId.value).then(r => { if (r.length) labelParentId.value = r[0].parentId; tagOptions.value = r.map(i => ({ value: i.id, label: i.name })) }),
      templeStore.fetchRitualDocuments(templeId.value).then(r => { ritualDocuments.value = r.map(i => ({ id: i.id, name: i.name })) }),
      templeStore.fetchCertificates(templeId.value).then(r => { certificates.value = r.map(i => ({ id: i.id, name: i.name })) }),
    ])
    console.log('商品詳情 data:', data)
    if (data) fillForm(data)
  } catch (err) {
    console.error('載入商品資料失敗:', err)
  } finally { isLoading.value = false }
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
  productCategories.value.filter(c => !categorySearch.value || c.label.includes(categorySearch.value))
)
const openCategoryModal   = () => { categorySearch.value = ''; isAddingCategory.value = false; newCategoryName.value = ''; editingCategoryId.value = null; showCategoryModal.value = true }
const startAddCategory    = async () => { isAddingCategory.value = true; await nextTick(); newCategoryInputRef.value?.focus() }
const confirmAddCategory  = async () => {
  const name = newCategoryName.value.trim()
  if (!name) return
  try {
    if (!form.itemId) { alert('請先選擇商品項目，再新增商品類別'); return }
    await templeStore.createProductCategory(templeId.value, { name, parentId: form.itemId })
    const list = await templeStore.fetchProductCategories(templeId.value)
    productCategories.value = list.map(i => ({ value: i.id, label: i.name }))
    newCategoryName.value = ''
    isAddingCategory.value = false
  } catch (err) {
    alert(err?.response?.data?.message || '新增類別失敗，請稍後再試')
  }
}
const cancelAddCategory   = () => { newCategoryName.value = ''; isAddingCategory.value = false }
const startEditCategory   = (cat) => { editingCategoryId.value = cat.value; editingCategoryName.value = cat.label }
const confirmEditCategory = (cat) => { const name = editingCategoryName.value.trim(); if (!name) return; const t = productCategories.value.find(c => c.value === cat.value); if (t) t.label = name; editingCategoryId.value = null }
const deleteCategory      = (id) => { productCategories.value = productCategories.value.filter(c => c.value !== id); if (form.categoryId === id) form.categoryId = '' }

// ── 標籤管理 Modal ──
const showTagModal   = ref(false)
const tagSearch      = ref('')
const isAddingTag    = ref(false)
const newTagName     = ref('')
const newTagInputRef = ref(null)
const editingTagId   = ref(null)
const editingTagName = ref('')

const filteredTags  = computed(() => tagOptions.value.filter(t => !tagSearch.value || t.label.includes(tagSearch.value)))
const openTagModal  = () => { tagSearch.value = ''; isAddingTag.value = false; newTagName.value = ''; editingTagId.value = null; showTagModal.value = true }
const startAddTag   = async () => { isAddingTag.value = true; await nextTick(); newTagInputRef.value?.focus() }
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
const cancelAddTag  = () => { newTagName.value = ''; isAddingTag.value = false }
const startEditTag  = (tag) => { editingTagId.value = tag.value; editingTagName.value = tag.label }
const confirmEditTag = (tag) => {
  const name = editingTagName.value.trim(); if (!name) return
  const t = tagOptions.value.find(t => t.value === tag.value)
  if (t) { const old = t.value; t.label = name; t.value = name; const idx = form.tags.indexOf(old); if (idx !== -1) form.tags.splice(idx, 1, name) }
  editingTagId.value = null
}
const deleteTag = (value) => { tagOptions.value = tagOptions.value.filter(t => t.value !== value); form.tags = form.tags.filter(v => v !== value) }
</script>

<style scoped>
.product-detail-page { padding: 24px 32px 40px; min-height: 100%; background: #F3F4F6; }
.back-btn { display: inline-flex; align-items: center; gap: 4px; background: none; border: none; color: #555; font-size: 14px; cursor: pointer; margin-bottom: 24px; padding: 0; transition: color 0.2s; }
.back-btn:hover { color: #E8572A; }
.back-arrow { font-size: 18px; line-height: 1; }
.loading-state { text-align: center; padding: 60px; color: #9ca3af; }
.form-card { background: #fff; border-radius: 16px; padding: 36px 40px; box-shadow: 0 1px 6px rgba(0,0,0,0.06); }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
.form-title { font-size: 20px; font-weight: 700; color: #1f2937; }
.badge { display: inline-block; padding: 2px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.badge-published { background: #d1fae5; color: #065f46; }
.badge-draft     { background: #f3f4f6; color: #6b7280; }
.btn-edit { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; border: 1.5px solid #E8572A; border-radius: 8px; background: #fff; color: #E8572A; font-size: 13px; font-weight: 600; cursor: pointer; }
.btn-edit:hover { background: #fff5f2; }
.btn-cancel-top { padding: 8px 18px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; color: #374151; font-size: 13px; cursor: pointer; }
.btn-cancel-top:hover { background: #f5f5f5; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px 28px; margin-bottom: 20px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full-width { grid-column: 1 / -1; }
.form-label { font-size: 13px; font-weight: 600; color: #374151; }
.field-value { font-size: 14px; color: #1f2937; padding: 9px 0; min-height: 38px; }
.field-value.pre-wrap { white-space: pre-wrap; }
.field-hint { font-size: 12px; color: #9ca3af; }
.form-input { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; color: #1f2937; outline: none; transition: border-color 0.2s; }
.form-input:focus { border-color: #E8572A; }
.form-input:disabled { background: #f9fafb; color: #9ca3af; }
.select-wrap { position: relative; flex: 1; }
.form-select { width: 100%; padding: 9px 32px 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; color: #1f2937; outline: none; background: #fff; appearance: none; cursor: pointer; }
.form-select:focus { border-color: #E8572A; }
.select-arrow { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; font-size: 12px; }
.input-with-btn { display: flex; gap: 8px; align-items: flex-start; }
.btn-manage { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; padding: 9px 14px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 13px; color: #374151; cursor: pointer; }
.btn-manage:hover { border-color: #E8572A; color: #E8572A; }
.manage-icon { font-size: 14px; }
.checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #374151; cursor: pointer; }
.checkbox-input { width: 16px; height: 16px; cursor: pointer; accent-color: #E8572A; }
.form-textarea { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; color: #1f2937; outline: none; resize: vertical; font-family: inherit; box-sizing: border-box; }
.form-textarea:focus { border-color: #E8572A; }
.section-title { font-size: 15px; font-weight: 700; color: #1f2937; margin: 28px 0 16px; padding-bottom: 10px; border-bottom: 1px solid #f3f4f6; }
.main-image-section { margin-bottom: 8px; }
.image-upload-area { display: flex; flex-wrap: wrap; gap: 10px; }
.image-preview { position: relative; width: 100px; height: 100px; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
.image-preview img { width: 100%; height: 100%; object-fit: cover; }
.image-remove { position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; border-radius: 50%; background: rgba(0,0,0,0.5); color: #fff; border: none; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.image-upload-btn { width: 100px; height: 100px; border: 1.5px dashed #d1d5db; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; gap: 4px; }
.image-upload-btn:hover { border-color: #E8572A; }
.upload-plus { font-size: 22px; color: #9ca3af; line-height: 1; }
.upload-text { font-size: 12px; color: #9ca3af; }
.image-hint { font-size: 12px; color: #9ca3af; margin-top: 8px; }
.specs-list { display: flex; flex-direction: column; gap: 16px; }
.spec-card { position: relative; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; }
.spec-close { position: absolute; top: 12px; right: 14px; background: none; border: none; font-size: 16px; color: #9ca3af; cursor: pointer; }
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
.btn-add-spec { width: 100%; margin-top: 12px; padding: 14px; border: 1.5px dashed #d1d5db; border-radius: 12px; background: transparent; font-size: 14px; color: #6b7280; cursor: pointer; }
.btn-add-spec:hover { border-color: #E8572A; color: #E8572A; }
.form-actions { display: flex; align-items: center; gap: 12px; margin-top: 24px; }
.btn-primary { padding: 10px 28px; background: #E8572A; color: #fff; border: none; border-radius: 50px; font-size: 15px; font-weight: 600; cursor: pointer; }
.btn-primary:hover:not(:disabled) { background: #d04a20; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-cancel { padding: 10px 24px; background: #fff; color: #555; border: 1px solid #ddd; border-radius: 50px; font-size: 14px; font-weight: 500; cursor: pointer; }
.btn-cancel:hover { background: #f5f5f5; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-box { background: #fff; border-radius: 16px; width: 480px; max-width: 92vw; max-height: 80vh; display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 12px; }
.modal-title { font-size: 18px; font-weight: 700; color: #1f2937; }
.modal-close { background: none; border: none; font-size: 18px; color: #9ca3af; cursor: pointer; padding: 2px 6px; }
.modal-close:hover { color: #374151; }
.modal-search-wrap { display: flex; align-items: center; gap: 8px; margin: 0 24px 12px; padding: 8px 14px; border: 1px solid #e5e7eb; border-radius: 20px; background: #f9fafb; }
.modal-search-icon { color: #9ca3af; flex-shrink: 0; }
.modal-search-input { flex: 1; border: none; outline: none; background: transparent; font-size: 14px; color: #374151; }
.modal-add-btn { margin: 0 24px 4px; padding: 12px; border: 1.5px dashed #d1d5db; border-radius: 10px; text-align: center; font-size: 14px; color: #6b7280; cursor: pointer; }
.modal-add-btn:hover { border-color: #E8572A; color: #E8572A; }
.modal-add-row { display: flex; align-items: center; gap: 8px; margin: 0 24px 8px; }
.modal-add-input { flex: 1; padding: 8px 12px; border: 1.5px solid #E8572A; border-radius: 8px; font-size: 14px; outline: none; }
.btn-confirm-cat { padding: 8px 16px; background: #E8572A; color: #fff; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; white-space: nowrap; }
.btn-confirm-cat:hover { background: #d04a20; }
.btn-cancel-cat { padding: 8px 14px; background: #fff; color: #555; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; cursor: pointer; white-space: nowrap; }
.btn-cancel-cat:hover { background: #f5f5f5; }
.modal-list { flex: 1; overflow-y: auto; padding: 8px 24px; }
.modal-list-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border: 1px solid #e5e7eb; border-radius: 10px; margin-bottom: 8px; gap: 8px; }
.modal-cat-name { font-size: 14px; color: #1f2937; flex: 1; }
.modal-cat-actions { display: flex; gap: 8px; }
.modal-icon-btn { background: none; border: none; cursor: pointer; color: #9ca3af; padding: 4px; display: flex; align-items: center; border-radius: 4px; }
.modal-icon-btn:hover { color: #374151; }
.modal-icon-btn.del:hover { color: #ef4444; }
.modal-empty { font-size: 14px; color: #9ca3af; text-align: center; padding: 20px 0; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #f3f4f6; display: flex; justify-content: flex-end; }
.btn-modal-done { padding: 10px 28px; background: #E8572A; color: #fff; border: none; border-radius: 50px; font-size: 15px; font-weight: 600; cursor: pointer; }
.btn-modal-done:hover { background: #d04a20; }
</style>

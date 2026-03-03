<template>
  <div class="activity-form-page">
    <nav class="breadcrumb">
      後台管理
      <span class="sep">›</span>
      <router-link :to="{ name: 'app.temple.activity-management', params: { templeId } }" class="bc-link">
        活動與上架管理
      </router-link>
    </nav>

    <button class="back-btn" @click="$router.back()">← 返回上一頁</button>

    <div class="card">
      <h2 class="card-title">{{ isEdit ? '編輯活動資訊' : '新增活動' }}</h2>

      <div class="form-body">
        <!-- 第一行：活動名稱 + 活動類別 -->
        <div class="form-row">
          <div class="form-group">
            <label>活動名稱 <span class="req">*</span></label>
            <input v-model="form.name" type="text" class="input" placeholder="請輸入活動名稱" />
            <span v-if="errors.name" class="err-msg">{{ errors.name }}</span>
          </div>
          <div class="form-group">
            <label>活動類別 <span class="req">*</span></label>
            <div class="select-row">
              <div class="select-wrap">
                <select v-model="form.categoryId" class="input select">
                  <option value="">點擊選擇類別...</option>
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
                <span class="sel-arrow">›</span>
              </div>
              <button class="action-btn" type="button" @click="showCategoryModal = true">
                ⚙ 活動類別管理
              </button>
            </div>
            <span v-if="errors.categoryId" class="err-msg">{{ errors.categoryId }}</span>
          </div>
        </div>

        <!-- 第二行：活動地點 + 標籤類別 -->
        <div class="form-row">
          <div class="form-group">
            <label>活動地點 <span class="req">*</span></label>
            <input v-model="form.location" type="text" class="input" placeholder="例如：正殿大廳" />
            <span v-if="errors.location" class="err-msg">{{ errors.location }}</span>
          </div>
          <div class="form-group">
            <label>標籤類別</label>
            <div class="select-row">
              <div class="select-wrap">
                <select v-model="form.tagId" class="input select">
                  <option value="">點擊選擇標籤...</option>
                  <option v-for="t in tags" :key="t.id" :value="t.id">{{ t.name }}</option>
                </select>
                <span class="sel-arrow">›</span>
              </div>
              <button class="action-btn" type="button" @click="showTagModal = true">
                ⚙ 標籤管理
              </button>
            </div>
          </div>
        </div>

        <!-- 第三行：開始時間 + 結束時間 -->
        <div class="form-row">
          <div class="form-group">
            <label>開始時間 <span class="req">*</span></label>
            <input v-model="form.startTime" type="datetime-local" class="input" />
            <span v-if="errors.startTime" class="err-msg">{{ errors.startTime }}</span>
          </div>
          <div class="form-group">
            <label>結束時間 <span class="req">*</span></label>
            <input v-model="form.endTime" type="datetime-local" class="input" />
            <span v-if="errors.endTime" class="err-msg">{{ errors.endTime }}</span>
          </div>
        </div>

        <!-- 發佈時間 -->
        <div class="form-row">
          <div class="form-group half">
            <label>發佈時間 <span class="req">*</span></label>
            <input
              v-model="form.publishTime"
              type="datetime-local"
              class="input"
              :disabled="form.publishNow"
            />
            <span v-if="errors.publishTime" class="err-msg">{{ errors.publishTime }}</span>
          </div>
        </div>

        <!-- 即時發佈 -->
        <div class="form-row">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.publishNow" />
            即時發佈
          </label>
        </div>

        <!-- 活動說明 -->
        <div class="form-row">
          <div class="form-group full">
            <label>活動說明</label>
            <textarea v-model="form.description" class="input textarea" placeholder="請輸入活動說明"></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- 封面圖片 -->
    <div class="card img-card">
      <span class="section-label">封面圖片</span>
      <div
        class="upload-zone"
        :class="{ 'drag-over': isDragging }"
        @click="fileInput?.click()"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
      >
        <div v-if="form.coverPreview" class="preview-wrapper">
          <img :src="form.coverPreview" class="cover-preview" alt="封面預覽" />
          <button class="remove-img" type="button" @click.stop="removeCover">✕</button>
        </div>
        <div v-else class="upload-ph">
          <div class="upload-icon">⬆</div>
          <p>點擊或拖曳圖片至此上傳</p>
          <p class="upload-hint">支援 JPG, PNG 格式</p>
        </div>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png"
        style="display:none"
        @change="handleFileChange"
      />
    </div>

    <!-- 底部操作 -->
    <div class="footer-actions">
      <button class="btn btn-primary" type="button" @click="handleSubmit">
        {{ isEdit ? '確認修改' : '確認新增' }}
      </button>
      <button class="btn btn-outline" type="button" @click="handleSaveDraft">儲存為草稿</button>
      <button class="btn btn-ghost" type="button" @click="$router.back()">取消</button>
    </div>

    <!-- 類別管理 Modal -->
    <teleport to="body">
      <div v-if="showCategoryModal" class="modal-overlay" @click.self="showCategoryModal = false">
        <div class="modal">
          <div class="modal-head">
            <h3>活動類別管理</h3>
            <button class="modal-close" @click="showCategoryModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div v-for="(c, i) in categories" :key="c.id" class="tag-item">
              <span>{{ c.name }}</span>
              <button class="tag-del" @click="categories.splice(i, 1)">✕</button>
            </div>
            <div class="tag-add-row">
              <input
                v-model="newCategoryName"
                type="text"
                class="input"
                style="border-radius:8px"
                placeholder="新增類別"
                @keyup.enter="addCategory"
              />
              <button class="btn btn-primary btn-sm" @click="addCategory">新增</button>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 標籤管理 Modal -->
    <teleport to="body">
      <div v-if="showTagModal" class="modal-overlay" @click.self="showTagModal = false">
        <div class="modal">
          <div class="modal-head">
            <h3>標籤管理</h3>
            <button class="modal-close" @click="showTagModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div v-for="(t, i) in tags" :key="t.id" class="tag-item">
              <span>{{ t.name }}</span>
              <button class="tag-del" @click="tags.splice(i, 1)">✕</button>
            </div>
            <div class="tag-add-row">
              <input
                v-model="newTagName"
                type="text"
                class="input"
                style="border-radius:8px"
                placeholder="新增標籤"
                @keyup.enter="addTag"
              />
              <button class="btn btn-primary btn-sm" @click="addTag">新增</button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const templeId = computed(() => route.params.templeId)
const activityId = computed(() => route.params.activityId)
const isEdit = computed(() => !!activityId.value)

// ==================== 表單狀態 ====================

const form = reactive({
  name: '',
  categoryId: '',
  location: '',
  tagId: '',
  startTime: '',
  endTime: '',
  publishTime: '',
  publishNow: false,
  description: '',
  coverPreview: null,
  coverFile: null,
})

const errors = reactive({
  name: '',
  categoryId: '',
  location: '',
  startTime: '',
  endTime: '',
  publishTime: '',
})

// ==================== 類別 / 標籤 ====================

let idCounter = 10
const categories = ref([
  { id: 1, name: '法會' },
  { id: 2, name: '慶典' },
  { id: 3, name: '遶境' },
  { id: 4, name: '祈福' },
])
const tags = ref([
  { id: 1, name: '重要' },
  { id: 2, name: '限額' },
  { id: 3, name: '免費' },
  { id: 4, name: '需報名' },
])

const showCategoryModal = ref(false)
const showTagModal = ref(false)
const newCategoryName = ref('')
const newTagName = ref('')

const addCategory = () => {
  const name = newCategoryName.value.trim()
  if (name) {
    categories.value.push({ id: ++idCounter, name })
    newCategoryName.value = ''
  }
}

const addTag = () => {
  const name = newTagName.value.trim()
  if (name) {
    tags.value.push({ id: ++idCounter, name })
    newTagName.value = ''
  }
}

// ==================== 圖片上傳 ====================

const fileInput = ref(null)
const isDragging = ref(false)

const loadPreview = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    form.coverPreview = e.target.result
    form.coverFile = file
  }
  reader.readAsDataURL(file)
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) loadPreview(file)
}

const handleDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
    loadPreview(file)
  }
}

const removeCover = () => {
  form.coverPreview = null
  form.coverFile = null
  if (fileInput.value) fileInput.value.value = ''
}

// ==================== 驗證 ====================

const validate = () => {
  let valid = true
  const required = ['name', 'categoryId', 'location', 'startTime', 'endTime']
  const labels = { name: '活動名稱', categoryId: '活動類別', location: '活動地點', startTime: '開始時間', endTime: '結束時間' }
  required.forEach(key => {
    errors[key] = form[key] ? '' : `請填寫${labels[key]}`
    if (!form[key]) valid = false
  })
  if (!form.publishNow && !form.publishTime) {
    errors.publishTime = '請選擇發佈時間或勾選即時發佈'
    valid = false
  } else {
    errors.publishTime = ''
  }
  return valid
}

// ==================== 提交 ====================

const handleSubmit = () => {
  if (!validate()) return
  // TODO: call API
  console.log('submit', { ...form })
  router.push({
    name: 'app.temple.activity-detail',
    params: { templeId: templeId.value, activityId: activityId.value || 'new' }
  })
}

const handleSaveDraft = () => {
  // TODO: call API with status=draft
  console.log('save draft', { ...form })
}

// ==================== 編輯模式：載入資料 ====================

onMounted(() => {
  if (isEdit.value) {
    // TODO: fetch activity by activityId and populate form
    // 模擬預填資料
    Object.assign(form, {
      name: '春節祈福法會',
      categoryId: 1,
      location: '本宮大殿',
      tagId: 1,
      startTime: '2024-02-10T08:00',
      endTime: '2024-02-15T18:00',
      publishTime: '2024-02-01T09:00',
      publishNow: false,
      description: `本宮將於農曆春節期間舉辦祈福法會，歡迎信眾前來參拜。
活動時間：農曆正月初一至初五
活動地點：本宮大殿`,
      coverPreview: null,
    })
  }
})
</script>

<style scoped>
.activity-form-page {
  padding: 24px 32px 60px;
  background: #f0f2f5;
  min-height: 100%;
}

/* breadcrumb */
.breadcrumb { font-size: 13px; color: #999; margin-bottom: 16px; }
.breadcrumb .sep { margin: 0 6px; }
.bc-link { color: #E8572A; text-decoration: none; font-weight: 500; }
.bc-link:hover { text-decoration: underline; }

/* back */
.back-btn {
  background: none; border: none; cursor: pointer;
  color: #555; font-size: 13px; padding: 0;
  margin-bottom: 20px; display: flex; align-items: center; gap: 4px;
}
.back-btn:hover { color: #E8572A; }

/* card */
.card {
  background: #fff; border-radius: 14px;
  padding: 32px 36px; margin-bottom: 16px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.06);
}
.card-title { font-size: 20px; font-weight: 700; color: #1a1a1a; margin: 0 0 28px; }

/* form */
.form-body { display: flex; flex-direction: column; gap: 0; }
.form-row { display: flex; gap: 24px; margin-bottom: 20px; align-items: flex-start; }
.form-group { flex: 1; }
.form-group.half { flex: 0 0 calc(50% - 12px); }
.form-group.full { flex: 1 0 100%; }

.form-group label {
  display: block; font-size: 13px; font-weight: 500;
  color: #444; margin-bottom: 8px;
}
.req { color: #E8572A; }

.input {
  width: 100%; padding: 10px 16px;
  border: 1px solid #e0e0e0; border-radius: 999px;
  font-size: 14px; color: #333; outline: none; background: #fff;
  transition: border-color 0.2s; box-sizing: border-box;
  font-family: inherit; appearance: none;
}
.input:focus { border-color: #E8572A; box-shadow: 0 0 0 3px rgba(232,87,42,0.1); }
.input:disabled { background: #f5f5f5; color: #aaa; cursor: not-allowed; }
.textarea { border-radius: 12px; resize: vertical; min-height: 100px; }

.select-row { display: flex; gap: 10px; align-items: center; }
.select-wrap { position: relative; flex: 1; }
.select-wrap .select { padding-right: 36px; cursor: pointer; }
.sel-arrow {
  position: absolute; right: 14px; top: 50%;
  transform: translateY(-50%) rotate(90deg);
  color: #999; pointer-events: none; font-size: 16px;
}

.action-btn {
  white-space: nowrap; padding: 10px 16px;
  border: 1.5px solid #E8572A; border-radius: 999px;
  background: transparent; color: #E8572A;
  font-size: 13px; font-weight: 500; cursor: pointer;
  display: flex; align-items: center; gap: 6px;
  transition: all 0.2s; font-family: inherit;
}
.action-btn:hover { background: rgba(232,87,42,0.08); }

.checkbox-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; color: #444; cursor: pointer;
}
.checkbox-label input[type="checkbox"] {
  width: 16px; height: 16px; accent-color: #E8572A;
}

.err-msg { display: block; font-size: 12px; color: #E8572A; margin-top: 5px; }

/* image card */
.img-card { padding: 24px 36px; }
.section-label {
  display: block; font-size: 13px; font-weight: 500;
  color: #444; margin-bottom: 12px;
}
.upload-zone {
  border: 2px dashed #ccc; border-radius: 10px;
  min-height: 160px; display: flex; align-items: center;
  justify-content: center; cursor: pointer; transition: all 0.2s;
  overflow: hidden; position: relative;
}
.upload-zone:hover, .upload-zone.drag-over {
  border-color: #E8572A; background: rgba(232,87,42,0.02);
}
.upload-ph { text-align: center; color: #999; }
.upload-icon { font-size: 28px; color: #bbb; margin-bottom: 8px; }
.upload-ph p { margin: 4px 0; font-size: 14px; }
.upload-hint { font-size: 12px; color: #bbb; }
.preview-wrapper { width: 100%; position: relative; }
.cover-preview { width: 100%; max-height: 220px; object-fit: cover; display: block; }
.remove-img {
  position: absolute; top: 8px; right: 8px; width: 28px; height: 28px;
  border: none; border-radius: 50%; background: rgba(0,0,0,0.5);
  color: #fff; cursor: pointer; font-size: 13px;
  display: flex; align-items: center; justify-content: center;
}

/* footer */
.footer-actions { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 0; }
.btn {
  padding: 10px 28px; border-radius: 999px;
  font-size: 14px; font-weight: 500; cursor: pointer;
  border: none; transition: all 0.2s; font-family: inherit;
}
.btn-primary { background: #E8572A; color: #fff; }
.btn-primary:hover { background: #d14a1f; }
.btn-outline { background: #fff; border: 1.5px solid #ccc; color: #444; }
.btn-outline:hover { border-color: #999; }
.btn-ghost { background: transparent; color: #666; }
.btn-ghost:hover { background: #f0f0f0; }
.btn-sm { padding: 8px 16px; font-size: 13px; }

/* modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.35);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal {
  background: #fff; border-radius: 14px; width: 420px; max-width: 90vw;
  box-shadow: 0 8px 40px rgba(0,0,0,0.18); overflow: hidden;
}
.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 16px; border-bottom: 1px solid #f0f0f0;
}
.modal-head h3 { margin: 0; font-size: 16px; font-weight: 600; }
.modal-close {
  background: none; border: none; cursor: pointer;
  font-size: 18px; color: #aaa; line-height: 1;
}
.modal-close:hover { color: #333; }
.modal-body { padding: 20px 24px 24px; max-height: 60vh; overflow-y: auto; }
.tag-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 12px; border-radius: 8px; background: #f8f8f8; margin-bottom: 8px;
}
.tag-del { background: none; border: none; cursor: pointer; color: #ccc; font-size: 13px; }
.tag-del:hover { color: #E8572A; }
.tag-add-row { display: flex; gap: 10px; margin-top: 12px; }
</style>
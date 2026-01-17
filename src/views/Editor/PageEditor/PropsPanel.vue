<template>
  <aside class="props-panel">
    <div class="panel-header">
      <h3>屬性設定</h3>
    </div>

    <div class="panel-content">
      <!-- 底圖屬性 -->
      <div v-if="selectedCanvas" class="props-section">
        <h4>底圖設定</h4>

        <div class="form-group">
          <label>底圖名稱</label>
          <input
            v-model="selectedCanvas.name"
            type="text"
            placeholder="請輸入底圖名稱"
          />
        </div>

        <div class="form-group">
          <label>底圖類型</label>
          <input
            :value="getCanvasTypeName(selectedCanvas.type)"
            type="text"
            disabled
          />
        </div>

        <div v-if="selectedCanvas.type === 'customize'" class="form-group">
          <label>背景圖片（電腦版）</label>
          <button class="btn-upload" @click="handleUploadBackground">
            {{ selectedCanvas.background?.desktop ? '更換背景' : '上傳背景' }}
          </button>
          <p v-if="selectedCanvas.background?.desktop" class="hint-text">
            ✓ 已上傳背景圖片
          </p>
          <p class="hint-text">建議尺寸：1920×1080</p>
        </div>
      </div>

      <!-- 框架屬性 -->
      <div v-else-if="selectedFrame" class="props-section">
        <h4>框架設定</h4>

        <div class="form-group">
          <label>框架名稱</label>
          <input :value="selectedFrame.name" type="text" disabled />
        </div>

        <div class="form-group">
          <label>版面配置</label>
          <input :value="selectedFrame.layout" type="text" disabled />
        </div>

        <div v-if="selectedFrame.properties" class="form-group">
          <label>內距設定</label>
          <div class="padding-grid">
            <div class="padding-item">
              <label>上</label>
              <input
                v-model="selectedFrame.properties['padding-top']"
                type="text"
                placeholder="5%"
              />
            </div>
            <div class="padding-item">
              <label>右</label>
              <input
                v-model="selectedFrame.properties['padding-right']"
                type="text"
                placeholder="5%"
              />
            </div>
            <div class="padding-item">
              <label>下</label>
              <input
                v-model="selectedFrame.properties['padding-bottom']"
                type="text"
                placeholder="5%"
              />
            </div>
            <div class="padding-item">
              <label>左</label>
              <input
                v-model="selectedFrame.properties['padding-left']"
                type="text"
                placeholder="5%"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 元件屬性 -->
      <div v-else-if="selectedElement" class="props-section">
        <h4>{{ selectedElement.name }} 設定</h4>

        <!-- 文字元件 -->
        <template v-if="selectedElement.type === 'text'">
          <div class="form-group">
            <label>文字內容</label>
            <textarea
              v-model="selectedElement.content.text"
              rows="5"
              placeholder="輸入文字內容"
            ></textarea>
          </div>

          <div class="form-group">
            <label>文字大小</label>
            <select v-model="selectedElement.content.fontSize">
              <option value="12px">12px - 極小</option>
              <option value="14px">14px - 小</option>
              <option value="16px">16px - 中</option>
              <option value="18px">18px - 中大</option>
              <option value="20px">20px - 大</option>
              <option value="24px">24px - 特大</option>
              <option value="32px">32px - 超大</option>
              <option value="48px">48px - 標題</option>
            </select>
          </div>

          <div class="form-group">
            <label>文字顏色</label>
            <div class="color-picker">
              <input
                v-model="selectedElement.content.color"
                type="color"
                class="color-input"
              />
              <input
                v-model="selectedElement.content.color"
                type="text"
                class="color-text"
                placeholder="#333333"
              />
            </div>
          </div>

          <div class="form-group">
            <label>對齊位置</label>
            <div class="align-grid">
              <button
                v-for="position in alignPositions"
                :key="position.value"
                :class="['align-btn', { active: selectedElement.content.align === position.value }]"
                @click="selectedElement.content.align = position.value"
                :title="position.label"
              >
                <span class="dot"></span>
              </button>
            </div>
          </div>
        </template>

        <!-- 圖片元件 -->
        <template v-if="selectedElement.type === 'image'">
          <div class="form-group">
            <label>圖片</label>
            <button class="btn-upload" @click="handleUploadImage">
              {{ selectedElement.content.src ? '更換圖片' : '上傳圖片' }}
            </button>
            <p v-if="selectedElement.content.src" class="hint-text">
              ✓ 已上傳圖片
            </p>
          </div>

          <div class="form-group">
            <label>圖片說明（Alt）</label>
            <input
              v-model="selectedElement.content.alt"
              type="text"
              placeholder="輸入圖片說明"
            />
          </div>
        </template>

        <!-- 按鈕元件 -->
        <template v-if="selectedElement.type === 'button'">
          <div class="form-group">
            <label>按鈕文字</label>
            <input
              v-model="selectedElement.content.text"
              type="text"
              placeholder="按鈕文字"
            />
          </div>

          <div class="form-group">
            <label>文字顏色</label>
            <div class="color-picker">
              <input
                v-model="selectedElement.content.textColor"
                type="color"
                class="color-input"
              />
              <input
                v-model="selectedElement.content.textColor"
                type="text"
                class="color-text"
              />
            </div>
          </div>

          <div class="form-group">
            <label>背景顏色</label>
            <div class="color-picker">
              <input
                v-model="selectedElement.content.bgColor"
                type="color"
                class="color-input"
              />
              <input
                v-model="selectedElement.content.bgColor"
                type="text"
                class="color-text"
              />
            </div>
          </div>

          <div class="form-group">
            <label>連結網址</label>
            <input
              v-model="selectedElement.content.link"
              type="text"
              placeholder="https://example.com"
            />
          </div>
        </template>

        <!-- 橫線、直線元件 -->
        <template v-if="selectedElement.type === 'h-line' || selectedElement.type === 'v-line'">
          <div class="form-group">
            <label>線條顏色</label>
            <div class="color-picker">
              <input
                v-model="selectedElement.content.color"
                type="color"
                class="color-input"
              />
              <input
                v-model="selectedElement.content.color"
                type="text"
                class="color-text"
              />
            </div>
          </div>

          <div class="form-group">
            <label>線條粗細</label>
            <select v-model="selectedElement.content.thickness">
              <option value="1px">1px - 極細</option>
              <option value="2px">2px - 細</option>
              <option value="3px">3px - 中</option>
              <option value="4px">4px - 粗</option>
              <option value="5px">5px - 特粗</option>
            </select>
          </div>
        </template>

        <!-- 輪播圖片元件 -->
        <template v-if="selectedElement.type === 'carousel'">
          <div class="form-group">
            <label>輪播圖片</label>
            <button class="btn-upload" @click="handleUploadCarousel">
              新增圖片
            </button>
            
            <div v-if="selectedElement.content.images && selectedElement.content.images.length" class="image-list">
              <div
                v-for="(img, idx) in selectedElement.content.images"
                :key="idx"
                class="image-item"
              >
                <span class="image-name">圖片 {{ idx + 1 }}</span>
                <button
                  class="btn-remove"
                  @click="handleRemoveImage(idx)"
                  title="移除"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>自動播放</label>
            <div class="toggle-group">
              <label class="toggle">
                <input
                  v-model="selectedElement.content.autoPlay"
                  type="checkbox"
                />
                <span class="toggle-label">啟用自動播放</span>
              </label>
            </div>
          </div>

          <div v-if="selectedElement.content.autoPlay" class="form-group">
            <label>播放間隔（毫秒）</label>
            <input
              v-model.number="selectedElement.content.interval"
              type="number"
              placeholder="3000"
              min="1000"
              step="500"
            />
          </div>
        </template>

        <!-- Google 地圖元件 -->
        <template v-if="selectedElement.type === 'map'">
          <div class="form-group">
            <label>地址</label>
            <input
              v-model="selectedElement.content.address"
              type="text"
              placeholder="輸入地址"
            />
          </div>

          <div class="form-group">
            <label>緯度</label>
            <input
              v-model.number="selectedElement.content.lat"
              type="number"
              step="0.000001"
              placeholder="25.033"
            />
          </div>

          <div class="form-group">
            <label>經度</label>
            <input
              v-model.number="selectedElement.content.lng"
              type="number"
              step="0.000001"
              placeholder="121.565"
            />
          </div>

          <div class="form-group">
            <label>縮放級別</label>
            <input
              v-model.number="selectedElement.content.zoom"
              type="number"
              min="1"
              max="20"
              placeholder="15"
            />
          </div>
        </template>

        <!-- 相簿預覽元件 -->
        <template v-if="selectedElement.type === 'album'">
          <div class="form-group">
            <label>相簿標題</label>
            <input
              v-model="selectedElement.content.title"
              type="text"
              placeholder="相簿預覽"
            />
          </div>

          <div class="form-group">
            <label>選擇相簿</label>
            <select v-model="selectedElement.content.albumId">
              <option :value="null">請選擇相簿</option>
              <option value="album-1">活動相簿 1</option>
              <option value="album-2">活動相簿 2</option>
              <option value="album-3">活動相簿 3</option>
            </select>
          </div>

          <div class="form-group">
            <label>欄位數量</label>
            <select v-model.number="selectedElement.content.columns">
              <option :value="2">2 欄</option>
              <option :value="3">3 欄</option>
              <option :value="4">4 欄</option>
            </select>
          </div>

          <div class="form-group">
            <label>最多顯示</label>
            <input
              v-model.number="selectedElement.content.maxDisplay"
              type="number"
              min="3"
              max="12"
              placeholder="6"
            />
          </div>
        </template>
      </div>

      <!-- 空狀態 -->
      <div v-else class="empty-state">
        <div class="empty-icon">⚙️</div>
        <p>請選擇底圖、框架或元件</p>
        <small>即可在此編輯屬性</small>
      </div>
    </div>
  </aside>
</template>

<script setup>
// ==================== Props ====================
const props = defineProps({
  selectedCanvas: {
    type: Object,
    default: null
  },
  selectedFrame: {
    type: Object,
    default: null
  },
  selectedElement: {
    type: Object,
    default: null
  }
})

// ==================== Emits ====================
const emit = defineEmits([
  'upload-background',
  'upload-image',
  'upload-carousel'
])

// ==================== 數據 ====================

// 對齊位置選項
const alignPositions = [
  { value: 'top-left', label: '左上' },
  { value: 'top-center', label: '中上' },
  { value: 'top-right', label: '右上' },
  { value: 'center-left', label: '左中' },
  { value: 'center', label: '正中' },
  { value: 'center-right', label: '右中' },
  { value: 'bottom-left', label: '左下' },
  { value: 'bottom-center', label: '中下' },
  { value: 'bottom-right', label: '右下' }
]

// ==================== 方法 ====================

// 獲取底圖類型名稱
const getCanvasTypeName = (type) => {
  const map = {
    header: '頁首',
    content: '內容',
    footer: '頁尾',
    customize: '自訂'
  }
  return map[type] || type
}

// 上傳底圖背景
const handleUploadBackground = () => {
  emit('upload-background')
}

// 上傳圖片
const handleUploadImage = () => {
  emit('upload-image')
}

// 上傳輪播圖片
const handleUploadCarousel = () => {
  emit('upload-carousel')
}

// 移除輪播圖片
const handleRemoveImage = (index) => {
  if (props.selectedElement?.content?.images) {
    props.selectedElement.content.images.splice(index, 1)
  }
}
</script>

<style scoped>
.props-panel {
  width: 320px;
  flex-shrink: 0;
  background: #fff;
  border-left: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid #e5e5e5;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.props-section h4 {
  margin: 0 0 20px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  padding-bottom: 12px;
  border-bottom: 2px solid #E8572A;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #E8572A;
}

.form-group input:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.form-group textarea {
  resize: vertical;
  line-height: 1.5;
}

.color-picker {
  display: flex;
  gap: 8px;
}

.color-input {
  width: 50px;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
}

.color-input:focus {
  border-color: #E8572A;
}

.color-text {
  flex: 1;
}

.align-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.align-btn {
  aspect-ratio: 1;
  border: 2px solid #ddd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  display: flex;
  padding: 8px;
  transition: all 0.2s;
}

.align-btn:hover {
  border-color: #E8572A;
  background: #fffaf8;
}

.align-btn.active {
  border-color: #E8572A;
  background: #E8572A;
}

.align-btn .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ddd;
}

.align-btn.active .dot {
  background: #fff;
}

.align-btn:nth-child(1) { align-items: flex-start; justify-content: flex-start; }
.align-btn:nth-child(2) { align-items: flex-start; justify-content: center; }
.align-btn:nth-child(3) { align-items: flex-start; justify-content: flex-end; }
.align-btn:nth-child(4) { align-items: center; justify-content: flex-start; }
.align-btn:nth-child(5) { align-items: center; justify-content: center; }
.align-btn:nth-child(6) { align-items: center; justify-content: flex-end; }
.align-btn:nth-child(7) { align-items: flex-end; justify-content: flex-start; }
.align-btn:nth-child(8) { align-items: flex-end; justify-content: center; }
.align-btn:nth-child(9) { align-items: flex-end; justify-content: flex-end; }

.padding-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.padding-item label {
  font-size: 11px;
  margin-bottom: 4px;
  color: #999;
}

.padding-item input {
  padding: 6px 8px;
  font-size: 13px;
}

.btn-upload {
  width: 100%;
  padding: 10px;
  border: 2px dashed #E8572A;
  border-radius: 6px;
  background: #FFF5F2;
  color: #E8572A;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-upload:hover {
  background: #E8572A;
  color: #fff;
  border-style: solid;
}

.hint-text {
  margin: 8px 0 0;
  font-size: 12px;
  color: #999;
}

.image-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f8f8f8;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
}

.image-name {
  flex: 1;
}

.btn-remove {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #999;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-remove:hover {
  color: #dc3545;
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.toggle input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.toggle-label {
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0 0 8px;
  font-size: 15px;
  color: #666;
}

.empty-state small {
  font-size: 13px;
  color: #999;
}

.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.panel-content::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}
</style>
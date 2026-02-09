<template>
  <div class="props-panel">
    <div class="panel-header">
      <h3>屬性設定</h3>
    </div>

    <div class="panel-body">
      <!-- 未選擇任何項目 -->
      <div v-if="!selectedBasemap && !selectedFrame && !selectedElement && !selectedCell" class="empty-state">
        <div class="empty-icon">⚙️</div>
        <p>請選擇底圖、框架或元件</p>
        <p class="hint">點擊畫布中的項目來編輯屬性</p>
      </div>

      <!-- ✅ 選擇了格子（調整 padding） -->
      <div v-else-if="selectedCell" class="props-section">
        <h4 class="section-title">格子間距設定</h4>
        
        <div class="padding-controls">
          <div class="padding-visual">
            <div class="padding-box">
              <div class="padding-input-group top">
                <label>上</label>
                <input 
                  v-model.number="cellPadding.top" 
                  type="number" 
                  min="0"
                  max="200"
                  step="5"
                  class="padding-input"
                  @input="updateCellPadding"
                />
              </div>
              
              <div class="padding-sides">
                <div class="padding-input-group left">
                  <label>左</label>
                  <input 
                    v-model.number="cellPadding.left" 
                    type="number" 
                    min="0"
                    max="200"
                    step="5"
                    class="padding-input"
                    @input="updateCellPadding"
                  />
                </div>
                
                <div class="content-preview">
                  內容區域
                </div>
                
                <div class="padding-input-group right">
                  <label>右</label>
                  <input 
                    v-model.number="cellPadding.right" 
                    type="number" 
                    min="0"
                    max="200"
                    step="5"
                    class="padding-input"
                    @input="updateCellPadding"
                  />
                </div>
              </div>
              
              <div class="padding-input-group bottom">
                <label>下</label>
                <input 
                  v-model.number="cellPadding.bottom" 
                  type="number" 
                  min="0"
                  max="200"
                  step="5"
                  class="padding-input"
                  @input="updateCellPadding"
                />
              </div>
            </div>
          </div>
          
          <div class="padding-presets">
            <button @click="setCellPadding(0)" class="preset-btn">無間距</button>
            <button @click="setCellPadding(10)" class="preset-btn">小</button>
            <button @click="setCellPadding(20)" class="preset-btn">中</button>
            <button @click="setCellPadding(40)" class="preset-btn">大</button>
          </div>
        </div>
      </div>

      <!-- 選擇了底圖 -->
      <div v-else-if="selectedBasemap" class="props-section">
        <h4 class="section-title">底圖設定</h4>
        
        <div class="prop-group">
          <label>底圖類型</label>
          <input 
            :value="selectedBasemap.bg_type" 
            type="text" 
            class="prop-input"
            disabled
          />
        </div>
      </div>

      <!-- 選擇了框架 -->
      <div v-else-if="selectedFrame" class="props-section">
        <h4 class="section-title">框架設定</h4>
        
        <div class="prop-group">
          <label>框架類型</label>
          <input 
            :value="selectedFrame.type" 
            type="text" 
            class="prop-input"
            disabled
          />
        </div>
      </div>

      <!-- 選擇了元件 -->
      <div v-else-if="selectedElement" class="props-section">
        <!-- Logo 元件 -->
        <template v-if="selectedElement.type === 'logo'">
          <h4 class="section-title">Logo 設定</h4>
          
          <div class="prop-group">
            <label>Logo 圖片</label>
            <div class="image-upload">
              <img 
                v-if="selectedElement.data?.src" 
                :src="selectedElement.data.src" 
                alt="Logo 預覽"
                class="preview-image logo-preview"
              />
              <div v-else class="no-image">
                <span>尚未上傳 Logo</span>
              </div>
              <button @click="handleUploadLogo" class="upload-btn">
                {{ selectedElement.data?.src ? '更換 Logo' : '上傳 Logo' }}
              </button>
            </div>
          </div>
        </template>

        <!-- TEXT 元件 -->
        <template v-else-if="selectedElement.element?.type === 'TEXT'">
          <h4 class="section-title">文字設定</h4>
          
          <div class="prop-group">
            <label>文字內容</label>
            <textarea 
              v-model="selectedElement.element.value.text" 
              class="prop-textarea"
              rows="6"
              placeholder="輸入文字內容（支援 HTML）"
            ></textarea>
          </div>

          <!-- ✅ Metadata 樣式設定 -->
          <div class="metadata-section">
            <h5 class="subsection-title">樣式設定</h5>
            
            <!-- 文字顏色 -->
            <div class="prop-group">
              <label>文字顏色</label>
              <div class="color-input-group">
                <input 
                  v-model="elementMetadata.color" 
                  type="color" 
                  class="prop-color"
                  @input="updateMetadata"
                />
                <input 
                  v-model="elementMetadata.color" 
                  type="text" 
                  class="prop-input color-text"
                  placeholder="#000000"
                  @input="updateMetadata"
                />
                <button @click="elementMetadata.color = null; updateMetadata()" class="clear-btn" title="清除">✕</button>
              </div>
            </div>

            <!-- 字體大小 -->
            <div class="prop-group">
              <label>字體大小</label>
              <div class="input-with-unit">
                <input 
                  v-model="elementMetadata.font_size" 
                  type="text" 
                  class="prop-input"
                  placeholder="16px"
                  @input="updateMetadata"
                />
                <span class="unit-hint">例如: 16px, 1.5rem</span>
              </div>
            </div>

            <!-- 字體粗細 -->
            <div class="prop-group">
              <label>字體粗細</label>
              <select 
                v-model="elementMetadata.font_weight" 
                class="prop-select"
                @change="updateMetadata"
              >
                <option :value="null">預設</option>
                <option value="normal">正常 (400)</option>
                <option value="500">中等 (500)</option>
                <option value="600">半粗 (600)</option>
                <option value="bold">粗體 (700)</option>
              </select>
            </div>

            <!-- 文字對齊 -->
            <div class="prop-group">
              <label>文字對齊</label>
              <div class="align-buttons">
                <button 
                  @click="elementMetadata.text_align = 'left'; updateMetadata()" 
                  class="align-btn"
                  :class="{ active: elementMetadata.text_align === 'left' }"
                  title="靠左"
                >
                  ≡
                </button>
                <button 
                  @click="elementMetadata.text_align = 'center'; updateMetadata()" 
                  class="align-btn"
                  :class="{ active: elementMetadata.text_align === 'center' }"
                  title="置中"
                >
                  ≡
                </button>
                <button 
                  @click="elementMetadata.text_align = 'right'; updateMetadata()" 
                  class="align-btn"
                  :class="{ active: elementMetadata.text_align === 'right' }"
                  title="靠右"
                >
                  ≡
                </button>
                <button 
                  @click="elementMetadata.text_align = null; updateMetadata()" 
                  class="align-btn clear"
                  title="清除"
                >
                  ✕
                </button>
              </div>
            </div>

            <!-- 背景顏色 -->
            <div class="prop-group">
              <label>背景顏色</label>
              <div class="color-input-group">
                <input 
                  v-model="elementMetadata.background_color" 
                  type="color" 
                  class="prop-color"
                  @input="updateMetadata"
                />
                <input 
                  v-model="elementMetadata.background_color" 
                  type="text" 
                  class="prop-input color-text"
                  placeholder="transparent"
                  @input="updateMetadata"
                />
                <button @click="elementMetadata.background_color = null; updateMetadata()" class="clear-btn" title="清除">✕</button>
              </div>
            </div>
          </div>
        </template>

        <!-- IMG 元件 -->
        <template v-else-if="selectedElement.element?.type === 'IMG'">
          <h4 class="section-title">圖片設定</h4>
          
          <div class="prop-group">
            <label>圖片</label>
            <div class="image-upload">
              <img 
                v-if="selectedElement.element.value?.src"
                :src="selectedElement.element.value.src" 
                alt="圖片預覽"
                class="preview-image"
              />
              <div v-else class="no-image">
                <span>尚未上傳圖片</span>
              </div>
              <button @click="handleUploadImage" class="upload-btn">
                {{ selectedElement.element.value?.src ? '更換圖片' : '上傳圖片' }}
              </button>
            </div>
          </div>

          <!-- ✅ Metadata 樣式設定 -->
          <div class="metadata-section">
            <h5 class="subsection-title">樣式設定</h5>
            
            <!-- 寬度 -->
            <div class="prop-group">
              <label>寬度</label>
              <div class="input-with-unit">
                <input 
                  v-model="elementMetadata.width" 
                  type="text" 
                  class="prop-input"
                  placeholder="100%, 500px, auto"
                  @input="updateMetadata"
                />
                <span class="unit-hint">例如: 100%, 500px, auto</span>
              </div>
            </div>

            <!-- 高度 -->
            <div class="prop-group">
              <label>高度</label>
              <div class="input-with-unit">
                <input 
                  v-model="elementMetadata.height" 
                  type="text" 
                  class="prop-input"
                  placeholder="auto, 300px"
                  @input="updateMetadata"
                />
                <span class="unit-hint">例如: auto, 300px</span>
              </div>
            </div>
          </div>
        </template>

        <!-- BUTTON 元件 -->
        <template v-else-if="selectedElement.element?.type === 'BUTTON'">
          <h4 class="section-title">按鈕設定</h4>
          
          <div class="prop-group">
            <label>按鈕文字</label>
            <input 
              v-model="selectedElement.element.value.text" 
              type="text" 
              class="prop-input"
              placeholder="輸入按鈕文字"
            />
          </div>

          <div class="prop-group">
            <label>連結網址</label>
            <input 
              v-model="selectedElement.element.value.url" 
              type="text" 
              class="prop-input"
              placeholder="輸入連結 (例如: https://example.com)"
            />
          </div>

          <!-- ✅ Metadata 樣式設定 -->
          <div class="metadata-section">
            <h5 class="subsection-title">樣式設定</h5>
            
            <!-- 文字顏色 -->
            <div class="prop-group">
              <label>文字顏色</label>
              <div class="color-input-group">
                <input 
                  v-model="elementMetadata.color" 
                  type="color" 
                  class="prop-color"
                  @input="updateMetadata"
                />
                <input 
                  v-model="elementMetadata.color" 
                  type="text" 
                  class="prop-input color-text"
                  placeholder="#ffffff"
                  @input="updateMetadata"
                />
                <button @click="elementMetadata.color = null; updateMetadata()" class="clear-btn" title="清除">✕</button>
              </div>
            </div>

            <!-- 背景顏色 -->
            <div class="prop-group">
              <label>背景顏色</label>
              <div class="color-input-group">
                <input 
                  v-model="elementMetadata.background_color" 
                  type="color" 
                  class="prop-color"
                  @input="updateMetadata"
                />
                <input 
                  v-model="elementMetadata.background_color" 
                  type="text" 
                  class="prop-input color-text"
                  placeholder="#E8572A"
                  @input="updateMetadata"
                />
                <button @click="elementMetadata.background_color = null; updateMetadata()" class="clear-btn" title="清除">✕</button>
              </div>
            </div>

            <!-- 字體大小 -->
            <div class="prop-group">
              <label>字體大小</label>
              <div class="input-with-unit">
                <input 
                  v-model="elementMetadata.font_size" 
                  type="text" 
                  class="prop-input"
                  placeholder="16px"
                  @input="updateMetadata"
                />
                <span class="unit-hint">例如: 16px, 1rem</span>
              </div>
            </div>

            <!-- 字體粗細 -->
            <div class="prop-group">
              <label>字體粗細</label>
              <select 
                v-model="elementMetadata.font_weight" 
                class="prop-select"
                @change="updateMetadata"
              >
                <option :value="null">預設</option>
                <option value="normal">正常 (400)</option>
                <option value="500">中等 (500)</option>
                <option value="600">半粗 (600)</option>
                <option value="bold">粗體 (700)</option>
              </select>
            </div>
          </div>
        </template>

        <!-- H_LINE 元件 -->
        <template v-else-if="selectedElement.element?.type === 'H_LINE'">
          <h4 class="section-title">水平線設定</h4>
          
          <div class="prop-group">
            <label>顏色</label>
            <input 
              v-model="selectedElement.element.value.color" 
              type="color" 
              class="prop-color"
            />
          </div>

          <div class="prop-group">
            <label>粗細</label>
            <input 
              v-model="selectedElement.element.value.thickness" 
              type="text" 
              class="prop-input"
              placeholder="例如: 2px"
            />
          </div>
        </template>

        <!-- V_LINE 元件 -->
        <template v-else-if="selectedElement.element?.type === 'V_LINE'">
          <h4 class="section-title">垂直線設定</h4>
          
          <div class="prop-group">
            <label>顏色</label>
            <input 
              v-model="selectedElement.element.value.color" 
              type="color" 
              class="prop-color"
            />
          </div>

          <div class="prop-group">
            <label>粗細</label>
            <input 
              v-model="selectedElement.element.value.thickness" 
              type="text" 
              class="prop-input"
              placeholder="例如: 2px"
            />
          </div>
        </template>

        <!-- CAROUSEL 元件 -->
        <template v-else-if="selectedElement.element?.type === 'CAROUSEL'">
          <h4 class="section-title">輪播設定</h4>
          
          <!-- 輪播高度 -->
          <div class="prop-group">
            <label>輪播高度</label>
            <div class="height-selector">
              <input 
                v-model.number="carouselHeight" 
                type="number" 
                class="prop-input"
                min="200"
                max="800"
                step="50"
                @input="updateCarouselSettings"
              />
              <span class="unit">px</span>
            </div>
            <div class="height-presets">
              <button 
                v-for="preset in heightPresets" 
                :key="preset.value"
                @click="setCarouselHeight(preset.value)"
                class="preset-btn"
                :class="{ active: carouselHeight === preset.value }"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>
          
          <!-- 輪播圖片列表 -->
          <div class="prop-group">
            <label>輪播圖片 ({{ carouselImages.length }})</label>
            
            <div v-if="carouselImages.length > 0" class="carousel-images-list">
              <div 
                v-for="(image, index) in carouselImages" 
                :key="index"
                class="carousel-image-item"
              >
                <img :src="image" :alt="`圖片 ${index + 1}`" class="carousel-thumbnail" />
                <button 
                  @click="removeCarouselImage(index)" 
                  class="remove-image-btn"
                  title="刪除圖片"
                >
                  ✕
                </button>
              </div>
            </div>

            <button @click="addCarouselImage" class="upload-btn">
              ＋ 新增圖片
            </button>
          </div>

          <!-- 自動播放 -->
          <div class="prop-group">
            <label class="checkbox-label">
              <input 
                v-model="carouselAutoPlay" 
                type="checkbox"
                @change="updateCarouselSettings"
              />
              <span>自動播放</span>
            </label>
          </div>

          <!-- 播放間隔 -->
          <div class="prop-group" v-if="carouselAutoPlay">
            <label>播放間隔 (毫秒)</label>
            <input 
              v-model.number="carouselInterval" 
              type="number" 
              class="prop-input"
              min="1000"
              step="500"
              @input="updateCarouselSettings"
            />
          </div>
        </template>

        <!-- 未知元件類型 -->
        <template v-else>
          <h4 class="section-title">元件資訊</h4>
          <div class="prop-group">
            <label>元件類型</label>
            <input 
              :value="selectedElement.element?.type || 'Unknown'" 
              type="text" 
              class="prop-input"
              disabled
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  selectedBasemap: {
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
  },
  selectedCell: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update-logo', 'update-cell-padding'])

// Logo 相關的響應式數據
const logoAlt = ref('')
const logoWidth = ref('')
const logoHeight = ref('')

// CAROUSEL 相關的響應式數據
const carouselImages = ref([])
const carouselAutoPlay = ref(true)
const carouselInterval = ref(3000)
const carouselHeight = ref(400)

// ✅ 格子 padding 響應式數據
const cellPadding = ref({
  top: 20,
  right: 20,
  bottom: 20,
  left: 20
})

// ✅ 元件 metadata 響應式數據
const elementMetadata = ref({
  color: null,
  font_size: null,
  font_weight: null,
  text_align: null,
  width: null,
  height: null,
  background_color: null
})

// 高度預設選項
const heightPresets = [
  { label: '小', value: 300 },
  { label: '中', value: 400 },
  { label: '大', value: 500 },
  { label: '特大', value: 600 }
]

// 監聽選中元件的變化
watch(() => props.selectedElement, (newVal) => {
  // Logo
  if (newVal?.type === 'logo' && newVal.data) {
    logoAlt.value = newVal.data.alt || 'Logo'
    logoWidth.value = newVal.data.width || '120px'
    logoHeight.value = newVal.data.height || 'auto'
  }
  
  // CAROUSEL
  if (newVal?.element?.type === 'CAROUSEL') {
    const value = newVal.element.value || {}
    carouselImages.value = value.images || []
    carouselAutoPlay.value = value.autoPlay !== false
    carouselInterval.value = value.interval || 3000
    carouselHeight.value = value.height || 400
  }

  // ✅ 載入元件的 metadata
  if (newVal?.element?.metadata) {
    elementMetadata.value = {
      color: newVal.element.metadata.color || null,
      font_size: newVal.element.metadata.font_size || null,
      font_weight: newVal.element.metadata.font_weight || null,
      text_align: newVal.element.metadata.text_align || null,
      width: newVal.element.metadata.width || null,
      height: newVal.element.metadata.height || null,
      background_color: newVal.element.metadata.background_color || null
    }
  } else {
    // 重置為空
    elementMetadata.value = {
      color: null,
      font_size: null,
      font_weight: null,
      text_align: null,
      width: null,
      height: null,
      background_color: null
    }
  }
}, { immediate: true, deep: true })

// ✅ 監聽選中格子的變化
watch(() => props.selectedCell, (newVal) => {
  if (newVal) {
    const element = newVal.frame?.elements?.[newVal.cellIndex]
    
    if (element?.padding) {
      cellPadding.value = { ...element.padding }
    } else {
      // 默認值
      cellPadding.value = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }
    }
    
    console.log('✓ 格子 padding 已載入:', cellPadding.value)
  }
}, { immediate: true, deep: true })

// 額外監聽 CAROUSEL 的 images 陣列變化
watch(() => props.selectedElement?.element?.value?.images, (newImages) => {
  if (props.selectedElement?.element?.type === 'CAROUSEL' && newImages) {
    carouselImages.value = [...newImages]
    console.log('✓ 圖片陣列已同步:', carouselImages.value.length, '張')
  }
}, { deep: true })

// ==================== ✅ Metadata 更新 ====================

const updateMetadata = () => {
  if (props.selectedElement?.element) {
    if (!props.selectedElement.element.metadata) {
      props.selectedElement.element.metadata = {}
    }
    
    // 更新 metadata
    props.selectedElement.element.metadata = {
      ...elementMetadata.value
    }
    
    console.log('✓ Metadata 已更新:', props.selectedElement.element.metadata)
  }
}

// ==================== Logo 操作 ====================

const handleUploadLogo = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        emit('update-logo', {
          src: event.target.result,
          id: null,
          alt: logoAlt.value || 'Logo',
          width: logoWidth.value || '120px',
          height: logoHeight.value || 'auto'
        })
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

// ==================== 圖片操作 ====================

const handleUploadImage = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (props.selectedElement?.element?.value) {
          props.selectedElement.element.value.src = event.target.result
          props.selectedElement.element.value.id = null
        }
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

// ==================== CAROUSEL 操作 ====================

const addCarouselImage = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('圖片大小不能超過 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const imageData = event.target.result
        
        // 確保 value 和 images 存在
        if (!props.selectedElement.element.value) {
          props.selectedElement.element.value = {}
        }
        if (!props.selectedElement.element.value.images) {
          props.selectedElement.element.value.images = []
        }
        
        // 添加到 element.value.images
        props.selectedElement.element.value.images.push(imageData)
        
        // 手動更新本地響應式數據（確保視圖立即更新）
        carouselImages.value = [...props.selectedElement.element.value.images]
        
        console.log('✓ 圖片已添加，共', carouselImages.value.length, '張')
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

const removeCarouselImage = (index) => {
  if (confirm('確定要刪除這張圖片嗎？')) {
    // 從 element.value.images 刪除
    if (props.selectedElement?.element?.value?.images) {
      props.selectedElement.element.value.images.splice(index, 1)
      
      // 手動更新本地響應式數據（確保視圖立即更新）
      carouselImages.value = [...props.selectedElement.element.value.images]
    }
    
    console.log('✓ 圖片已刪除，剩餘', carouselImages.value.length, '張')
  }
}

const updateCarouselSettings = () => {
  if (props.selectedElement?.element?.value) {
    props.selectedElement.element.value.autoPlay = carouselAutoPlay.value
    props.selectedElement.element.value.interval = carouselInterval.value
    props.selectedElement.element.value.height = carouselHeight.value
    
    console.log('✓ 輪播設定已更新:', {
      autoPlay: carouselAutoPlay.value,
      interval: carouselInterval.value,
      height: carouselHeight.value
    })
  }
}

const setCarouselHeight = (height) => {
  carouselHeight.value = height
  updateCarouselSettings()
}

// ==================== 格子 Padding 操作 ====================

const updateCellPadding = () => {
  if (props.selectedCell) {
    emit('update-cell-padding', {
      frame: props.selectedCell.frame,
      cellIndex: props.selectedCell.cellIndex,
      padding: { ...cellPadding.value }
    })
  }
}

const setCellPadding = (value) => {
  cellPadding.value = {
    top: value,
    right: value,
    bottom: value,
    left: value
  }
  updateCellPadding()
}
</script>

<style lang="scss" scoped>
.props-panel {
  width: 320px;
  background: #fff;
  border-left: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid #e5e5e5;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #999;

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  p {
    margin: 8px 0;
    font-size: 14px;
  }

  .hint {
    font-size: 12px;
    color: #bbb;
  }
}

.props-section {
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-title {
  margin: 0 0 20px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 2px solid #E8572A;
}

// ✅ Metadata 子區塊標題
.subsection-title {
  margin: 20px 0 12px;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e5e5;
}

.metadata-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px dashed #e5e5e5;
}

.prop-group {
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 500;
    color: #666;
  }
}

.prop-input,
.prop-textarea,
.prop-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #E8572A;
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
}

.prop-textarea {
  resize: vertical;
  font-family: 'Courier New', monospace;
  line-height: 1.5;
}

.prop-color {
  width: 60px;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

// ✅ 顏色輸入組
.color-input-group {
  display: flex;
  gap: 8px;
  align-items: center;

  .prop-color {
    flex-shrink: 0;
  }

  .color-text {
    flex: 1;
  }

  .clear-btn {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    padding: 0;
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    color: #999;
    transition: all 0.2s;

    &:hover {
      background: #e8e8e8;
      color: #666;
    }
  }
}

// ✅ 帶單位的輸入框
.input-with-unit {
  .unit-hint {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    color: #999;
  }
}

// ✅ 對齊按鈕組
.align-buttons {
  display: flex;
  gap: 8px;

  .align-btn {
    flex: 1;
    padding: 8px;
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #e8e8e8;
      border-color: #ccc;
    }

    &.active {
      background: #E8572A;
      border-color: #E8572A;
      color: #fff;
    }

    &.clear {
      flex: 0 0 40px;
      font-size: 14px;
      color: #999;

      &:hover {
        background: #e8e8e8;
        color: #666;
      }
    }
  }
}

.image-upload {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-image {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.logo-preview {
  max-height: 100px;
  object-fit: contain;
  background: #f9f9f9;
  padding: 10px;
}

.no-image {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
  border: 2px dashed #ddd;
  border-radius: 4px;
  color: #999;
  font-size: 13px;
}

.upload-btn {
  padding: 8px 16px;
  background: #E8572A;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #d14a1f;
  }
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  
  span {
    font-size: 13px;
    color: #666;
  }
}

.height-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .prop-input {
    flex: 1;
  }
  
  .unit {
    font-size: 13px;
    color: #666;
    font-weight: 500;
  }
}

.height-presets {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 12px;
}

.preset-btn {
  padding: 8px 12px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e8e8e8;
    border-color: #ccc;
  }
  
  &.active {
    background: #E8572A;
    border-color: #E8572A;
    color: #fff;
    font-weight: 500;
  }
}

.carousel-images-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.carousel-image-item {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid #ddd;
  transition: border-color 0.2s;
  
  &:hover {
    border-color: #E8572A;
    
    .remove-image-btn {
      opacity: 1;
    }
  }
}

.carousel-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(220, 38, 38, 0.9);
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
  
  &:hover {
    background: #dc2626;
    transform: scale(1.1);
  }
}

// Padding 控制樣式
.padding-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.padding-visual {
  background: #f9f9f9;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 20px;
}

.padding-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.padding-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  
  label {
    font-size: 12px;
    color: #666;
    min-width: 24px;
    margin: 0;
  }
  
  &.top, &.bottom {
    justify-content: center;
  }
  
  &.left {
    justify-content: flex-start;
  }
  
  &.right {
    justify-content: flex-end;
  }
}

.padding-input {
  width: 70px;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
  outline: none;
  
  &:focus {
    border-color: #E8572A;
  }
}

.padding-sides {
  display: flex;
  align-items: center;
  gap: 12px;
}

.content-preview {
  flex: 1;
  height: 80px;
  background: #fff;
  border: 2px dashed #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #999;
}

.padding-presets {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.panel-body::-webkit-scrollbar {
  width: 6px;
}

.panel-body::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.panel-body::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
  
  &:hover {
    background: #ccc;
  }
}
</style>
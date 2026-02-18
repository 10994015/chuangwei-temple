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
        <!-- ✅ 自訂框架 (FRAME 開頭) -->
        <template v-if="selectedFrame.type && selectedFrame.type.startsWith('FRAME')">
          <h4 class="section-title">自訂框架設定</h4>
          
          <div class="prop-group">
            <label>框架類型</label>
            <input 
              :value="selectedFrame.type" 
              type="text" 
              class="prop-input"
              disabled
            />
          </div>

          <!-- ✅ 框架寬度設定 -->
          <div class="metadata-section">
            <h5 class="subsection-title">框架寬度</h5>
            
            <div class="prop-group">
              <label>最大寬度</label>
              <div class="input-with-unit">
                <input 
                  v-model="frameWidth" 
                  type="text" 
                  class="prop-input"
                  placeholder="1200px"
                  @input="updateFrameWidth"
                />
                <span class="unit-hint">例如: 1200px, 100%, 80vw</span>
              </div>
            </div>

            <div class="width-presets">
              <button @click="setFrameWidth('900px')" class="preset-btn">窄</button>
              <button @click="setFrameWidth('1200px')" class="preset-btn">中</button>
              <button @click="setFrameWidth('1400px')" class="preset-btn">寬</button>
              <button @click="setFrameWidth('100%')" class="preset-btn">全寬</button>
            </div>
          </div>
        </template>
        
        <!-- ✅ 首圖框架 (FIRST_PICTURE) -->
        <template v-else-if="selectedFrame.type === 'FIRST_PICTURE'">
          <h4 class="section-title">首圖設定</h4>
          
          <!-- 背景圖片 -->
          <div class="prop-group">
            <label>背景圖片</label>
            <div class="image-upload">
              <!-- ✅ Loading 狀態 -->
              <div v-if="isUploadingHeroBackground" class="uploading-state">
                <div class="spinner"></div>
                <span>上傳中...</span>
              </div>
              
              <!-- ✅ 預覽圖片 -->
              <img 
                v-else-if="selectedFrame.data?.hero_bg_img_src"
                :src="selectedFrame.data.hero_bg_img_src" 
                alt="背景預覽"
                class="preview-image"
              />
              
              <!-- ✅ 無圖片狀態 -->
              <div v-else class="no-image">
                <span>尚未上傳背景圖片</span>
              </div>
              
              <button 
                @click="handleUploadHeroBackground" 
                class="upload-btn"
                :disabled="isUploadingHeroBackground"
              >
                <template v-if="isUploadingHeroBackground">上傳中...</template>
                <template v-else>
                  {{ selectedFrame.data?.hero_bg_img_src ? '更換背景' : '上傳背景' }}
                </template>
              </button>
            </div>
          </div>
          
          <!-- 標題 -->
          <div class="prop-group">
            <label>標題</label>
            <input 
              v-model="heroTitle" 
              type="text" 
              class="prop-input"
              placeholder="輸入首圖標題"
              @input="updateHeroData"
            />
          </div>
          
          <!-- 副標題 -->
          <div class="prop-group">
            <label>副標題</label>
            <textarea 
              v-model="heroSubtitle" 
              class="prop-textarea"
              rows="3"
              placeholder="輸入首圖副標題"
              @input="updateHeroData"
            ></textarea>
          </div>
          
          <!-- 樣式設定區塊 -->
          <div class="metadata-section">
            <h5 class="subsection-title">樣式設定</h5>
            
            <!-- 首圖高度 -->
            <div class="prop-group">
              <label>首圖高度</label>
              <div class="height-selector">
                <input 
                  v-model="heroHeight" 
                  type="text" 
                  class="prop-input"
                  placeholder="600px"
                  @input="updateHeroData"
                />
                <span class="unit-hint">例如: 600px, 80vh</span>
              </div>
              <div class="height-presets">
                <button @click="setHeroHeight('500px')" class="preset-btn">小</button>
                <button @click="setHeroHeight('600px')" class="preset-btn">中</button>
                <button @click="setHeroHeight('700px')" class="preset-btn">大</button>
                <button @click="setHeroHeight('100vh')" class="preset-btn">全螢幕</button>
              </div>
            </div>
            
            <!-- 遮罩透明度 -->
            <div class="prop-group">
              <label>遮罩透明度 ({{ overlayOpacity }}%)</label>
              <input 
                v-model.number="overlayOpacity" 
                type="range" 
                min="0"
                max="100"
                class="prop-slider"
                @input="updateHeroData"
              />
              <div class="slider-labels">
                <span>透明</span>
                <span>不透明</span>
              </div>
            </div>
            
            <!-- 遮罩顏色 -->
            <div class="prop-group">
              <label>遮罩顏色</label>
              <div class="color-input-group">
                <input 
                  v-model="overlayColor" 
                  type="color" 
                  class="prop-color"
                  @input="updateHeroData"
                />
                <input 
                  v-model="overlayColor" 
                  type="text" 
                  class="prop-input color-text"
                  placeholder="#000000"
                  @input="updateHeroData"
                />
              </div>
            </div>
            
            <!-- 文字框圓角 -->
            <div class="prop-group">
              <label>文字框圓角</label>
              <div class="input-with-unit">
                <input 
                  v-model="textBoxBorderRadius" 
                  type="text" 
                  class="prop-input"
                  placeholder="12px"
                  @input="updateHeroData"
                />
                <span class="unit-hint">例如: 0px, 12px, 20px</span>
              </div>
            </div>
            
            <!-- 標題顏色 -->
            <div class="prop-group">
              <label>標題顏色</label>
              <div class="color-input-group">
                <input 
                  v-model="titleColor" 
                  type="color" 
                  class="prop-color"
                  @input="updateHeroData"
                />
                <input 
                  v-model="titleColor" 
                  type="text" 
                  class="prop-input color-text"
                  placeholder="#333333"
                  @input="updateHeroData"
                />
              </div>
            </div>
            
            <!-- 標題字體大小 -->
            <div class="prop-group">
              <label>標題字體大小</label>
              <div class="input-with-unit">
                <input 
                  v-model="titleFontSize" 
                  type="text" 
                  class="prop-input"
                  placeholder="48px"
                  @input="updateHeroData"
                />
                <span class="unit-hint">例如: 36px, 48px, 3rem</span>
              </div>
            </div>
            
            <!-- 副標題顏色 -->
            <div class="prop-group">
              <label>副標題顏色</label>
              <div class="color-input-group">
                <input 
                  v-model="subtitleColor" 
                  type="color" 
                  class="prop-color"
                  @input="updateHeroData"
                />
                <input 
                  v-model="subtitleColor" 
                  type="text" 
                  class="prop-input color-text"
                  placeholder="#666666"
                  @input="updateHeroData"
                />
              </div>
            </div>
            
            <!-- 副標題字體大小 -->
            <div class="prop-group">
              <label>副標題字體大小</label>
              <div class="input-with-unit">
                <input 
                  v-model="subtitleFontSize" 
                  type="text" 
                  class="prop-input"
                  placeholder="20px"
                  @input="updateHeroData"
                />
                <span class="unit-hint">例如: 16px, 20px, 1.25rem</span>
              </div>
            </div>
          </div>
        </template>

        <!-- ✅ 輪播牆 (CAROUSEL_WALL) -->
        <template v-else-if="selectedFrame.type === 'CAROUSEL_WALL'">
          <h4 class="section-title">輪播牆設定</h4>

          <div class="prop-group">
            <label>輪播圖片 ({{ carouselWallImages.length }} 張)</label>

            <!-- 圖片縮圖列表 -->
            <div v-if="carouselWallImages.length > 0" class="carousel-images-list">
              <div
                v-for="(img, index) in carouselWallImages"
                :key="img.id || index"
                class="carousel-image-item"
              >
                <img
                  :src="img.src"
                  :alt="`圖片 ${index + 1}`"
                  class="carousel-thumbnail"
                />
                <button
                  class="remove-image-btn"
                  @click="removeCarouselWallImage(index)"
                  title="刪除圖片"
                >
                  ✕
                </button>
              </div>
            </div>

            <!-- 無圖片時的空狀態 -->
            <div v-else class="no-image">
              <span>尚未上傳圖片</span>
            </div>

            <!-- 上傳按鈕 -->
            <button
              @click="handleUploadCarouselWall"
              class="upload-btn"
              :disabled="isUploadingCarouselWall"
            >
              <template v-if="isUploadingCarouselWall">
                <span class="btn-spinner"></span>上傳中...
              </template>
              <template v-else>＋ 新增圖片</template>
            </button>
          </div>
        </template>
        
        <!-- ✅ 其他框架類型 -->
        <template v-else>
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
        </template>
      </div>

      <!-- 選擇了元件 -->
      <div v-else-if="selectedElement" class="props-section">
        <!-- Logo 元件 -->
        <template v-if="selectedElement.type === 'logo'">
          <h4 class="section-title">Logo 設定</h4>
          
          <div class="prop-group">
            <label>Logo 圖片</label>
            <div class="image-upload">
              <!-- ✅ Loading 狀態 -->
              <div v-if="isUploadingLogo" class="uploading-state">
                <div class="spinner"></div>
                <span>上傳中...</span>
              </div>
              
              <!-- ✅ 預覽圖片 - 使用本地響應式狀態 -->
              <img 
                v-else-if="localLogoSrc" 
                :src="localLogoSrc" 
                :alt="selectedElement.frame?.data?.temple_name || 'Logo'"
                class="preview-image logo-preview"
                @error="handleLogoImageError"
              />
              
              <!-- ✅ 無圖片狀態 -->
              <div v-else class="no-image">
                <span>尚未上傳 Logo</span>
              </div>
              
              <button 
                @click="handleUploadLogo" 
                class="upload-btn"
                :disabled="isUploadingLogo"
              >
                <template v-if="isUploadingLogo">上傳中...</template>
                <template v-else>
                  {{ localLogoSrc ? '更換 Logo' : '上傳 Logo' }}
                </template>
              </button>
            </div>
            
            <!-- ✅ Debug 資訊（開發時可用） -->
            <div v-if="false" class="debug-info">
              <small>
                Local Logo: {{ localLogoSrc ? '有' : '無' }}<br>
                Frame Logo: {{ selectedElement.frame?.data?.logo_img_src ? '有' : '無' }}<br>
                Data Logo: {{ selectedElement.data?.src ? '有' : '無' }}
              </small>
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

          <!-- ✅ 新增：元件間距設定 -->
          <div class="padding-section">
            <h5 class="subsection-title">元件間距</h5>
            
            <div class="padding-controls">
              <div class="padding-visual">
                <div class="padding-box">
                  <div class="padding-input-group top">
                    <label>上</label>
                    <input 
                      v-model.number="elementPadding.top" 
                      type="number" 
                      min="0"
                      max="200"
                      step="5"
                      class="padding-input"
                      @input="updateElementPadding"
                    />
                  </div>
                  
                  <div class="padding-sides">
                    <div class="padding-input-group left">
                      <label>左</label>
                      <input 
                        v-model.number="elementPadding.left" 
                        type="number" 
                        min="0"
                        max="200"
                        step="5"
                        class="padding-input"
                        @input="updateElementPadding"
                      />
                    </div>
                    
                    <div class="content-preview">
                      內容區域
                    </div>
                    
                    <div class="padding-input-group right">
                      <label>右</label>
                      <input 
                        v-model.number="elementPadding.right" 
                        type="number" 
                        min="0"
                        max="200"
                        step="5"
                        class="padding-input"
                        @input="updateElementPadding"
                      />
                    </div>
                  </div>
                  
                  <div class="padding-input-group bottom">
                    <label>下</label>
                    <input 
                      v-model.number="elementPadding.bottom" 
                      type="number" 
                      min="0"
                      max="200"
                      step="5"
                      class="padding-input"
                      @input="updateElementPadding"
                    />
                  </div>
                </div>
              </div>
              
              <div class="padding-presets">
                <button @click="setElementPadding(0)" class="preset-btn">無間距</button>
                <button @click="setElementPadding(10)" class="preset-btn">小</button>
                <button @click="setElementPadding(20)" class="preset-btn">中</button>
                <button @click="setElementPadding(40)" class="preset-btn">大</button>
              </div>
            </div>
          </div>

          <!-- ✅ 新增：元件寬度設定 -->
          <div class="width-section">
            <h5 class="subsection-title">元件寬度</h5>
            
            <div class="prop-group">
              <label>最大寬度</label>
              <div class="input-with-unit">
                <input 
                  v-model="elementWidth" 
                  type="text" 
                  class="prop-input"
                  placeholder="100%"
                  @input="updateElementWidth"
                />
                <span class="unit-hint">例如: 100%, 80%, 500px</span>
              </div>
            </div>

            <div class="width-presets">
              <button @click="setElementWidth('50%')" class="preset-btn">半寬</button>
              <button @click="setElementWidth('80%')" class="preset-btn">窄</button>
              <button @click="setElementWidth('100%')" class="preset-btn">全寬</button>
              <button @click="setElementWidth('auto')" class="preset-btn">自動</button>
            </div>
          </div>
        </template>

        <!-- IMG 元件 -->
        <template v-else-if="selectedElement.element?.type === 'IMG'">
          <h4 class="section-title">圖片設定</h4>
          
          <div class="prop-group">
            <label>圖片</label>
            <div class="image-upload">
              <!-- ✅ Loading 狀態 -->
              <div v-if="isUploadingImage" class="uploading-state">
                <div class="spinner"></div>
                <span>上傳中...</span>
              </div>
              
              <!-- ✅ 預覽圖片 -->
              <img 
                v-else-if="selectedElement.element.value?.src"
                :src="selectedElement.element.value.src" 
                alt="圖片預覽"
                class="preview-image"
              />
              
              <!-- ✅ 無圖片狀態 -->
              <div v-else class="no-image">
                <span>尚未上傳圖片</span>
              </div>
              
              <button 
                @click="handleUploadImage" 
                class="upload-btn"
                :disabled="isUploadingImage"
              >
                <template v-if="isUploadingImage">上傳中...</template>
                <template v-else>
                  {{ selectedElement.element.value?.src ? '更換圖片' : '上傳圖片' }}
                </template>
              </button>
            </div>
          </div>

          <!-- ✅ 新增：Alt 文字設定 -->
          <div class="prop-group">
            <label>Alt 文字（替代文字）</label>
            <input 
              v-model="imageAlt" 
              type="text" 
              class="prop-input"
              placeholder="描述圖片內容，用於無障礙輔助"
              @input="updateImageAlt"
            />
            <span class="hint-text">用於螢幕閱讀器和圖片無法顯示時</span>
          </div>

          <!-- ✅ Metadata 樣式設定 -->
          <div class="metadata-section">
            <h5 class="subsection-title">樣式設定</h5>
            
            <!-- ✅ 圖片對齊 -->
            <div class="prop-group">
              <label>圖片對齊</label>
              <div class="align-buttons">
                <button 
                  @click="elementMetadata.text_align = 'left'; updateMetadata()" 
                  class="align-btn"
                  :class="{ active: elementMetadata.text_align === 'left' }"
                  title="靠左"
                >
                  ⬅
                </button>
                <button 
                  @click="elementMetadata.text_align = 'center'; updateMetadata()" 
                  class="align-btn"
                  :class="{ active: elementMetadata.text_align === 'center' }"
                  title="置中"
                >
                  ↔
                </button>
                <button 
                  @click="elementMetadata.text_align = 'right'; updateMetadata()" 
                  class="align-btn"
                  :class="{ active: elementMetadata.text_align === 'right' }"
                  title="靠右"
                >
                  ➡
                </button>
                <button 
                  @click="elementMetadata.text_align = null; updateMetadata()" 
                  class="align-btn clear"
                  title="清除（預設靠左）"
                >
                  ✕
                </button>
              </div>
            </div>
            
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

          <!-- ✅ 新增：元件間距設定 -->
          <div class="padding-section">
            <h5 class="subsection-title">元件間距</h5>
            
            <div class="padding-controls">
              <div class="padding-visual">
                <div class="padding-box">
                  <div class="padding-input-group top">
                    <label>上</label>
                    <input 
                      v-model.number="elementPadding.top" 
                      type="number" 
                      min="0"
                      max="200"
                      step="5"
                      class="padding-input"
                      @input="updateElementPadding"
                    />
                  </div>
                  
                  <div class="padding-sides">
                    <div class="padding-input-group left">
                      <label>左</label>
                      <input 
                        v-model.number="elementPadding.left" 
                        type="number" 
                        min="0"
                        max="200"
                        step="5"
                        class="padding-input"
                        @input="updateElementPadding"
                      />
                    </div>
                    
                    <div class="content-preview">
                      內容區域
                    </div>
                    
                    <div class="padding-input-group right">
                      <label>右</label>
                      <input 
                        v-model.number="elementPadding.right" 
                        type="number" 
                        min="0"
                        max="200"
                        step="5"
                        class="padding-input"
                        @input="updateElementPadding"
                      />
                    </div>
                  </div>
                  
                  <div class="padding-input-group bottom">
                    <label>下</label>
                    <input 
                      v-model.number="elementPadding.bottom" 
                      type="number" 
                      min="0"
                      max="200"
                      step="5"
                      class="padding-input"
                      @input="updateElementPadding"
                    />
                  </div>
                </div>
              </div>
              
              <div class="padding-presets">
                <button @click="setElementPadding(0)" class="preset-btn">無間距</button>
                <button @click="setElementPadding(10)" class="preset-btn">小</button>
                <button @click="setElementPadding(20)" class="preset-btn">中</button>
                <button @click="setElementPadding(40)" class="preset-btn">大</button>
              </div>
            </div>
          </div>

          <!-- ✅ 新增：元件寬度設定 -->
          <div class="width-section">
            <h5 class="subsection-title">元件寬度</h5>
            
            <div class="prop-group">
              <label>最大寬度</label>
              <div class="input-with-unit">
                <input 
                  v-model="elementWidth" 
                  type="text" 
                  class="prop-input"
                  placeholder="100%"
                  @input="updateElementWidth"
                />
                <span class="unit-hint">例如: 100%, 80%, 500px</span>
              </div>
            </div>

            <div class="width-presets">
              <button @click="setElementWidth('50%')" class="preset-btn">半寬</button>
              <button @click="setElementWidth('80%')" class="preset-btn">窄</button>
              <button @click="setElementWidth('100%')" class="preset-btn">全寬</button>
              <button @click="setElementWidth('auto')" class="preset-btn">自動</button>
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

          <!-- ✅ 新增：元件間距設定 -->
          <div class="padding-section">
            <h5 class="subsection-title">元件間距</h5>
            
            <div class="padding-controls">
              <div class="padding-visual">
                <div class="padding-box">
                  <div class="padding-input-group top">
                    <label>上</label>
                    <input 
                      v-model.number="elementPadding.top" 
                      type="number" 
                      min="0"
                      max="200"
                      step="5"
                      class="padding-input"
                      @input="updateElementPadding"
                    />
                  </div>
                  
                  <div class="padding-sides">
                    <div class="padding-input-group left">
                      <label>左</label>
                      <input 
                        v-model.number="elementPadding.left" 
                        type="number" 
                        min="0"
                        max="200"
                        step="5"
                        class="padding-input"
                        @input="updateElementPadding"
                      />
                    </div>
                    
                    <div class="content-preview">
                      內容區域
                    </div>
                    
                    <div class="padding-input-group right">
                      <label>右</label>
                      <input 
                        v-model.number="elementPadding.right" 
                        type="number" 
                        min="0"
                        max="200"
                        step="5"
                        class="padding-input"
                        @input="updateElementPadding"
                      />
                    </div>
                  </div>
                  
                  <div class="padding-input-group bottom">
                    <label>下</label>
                    <input 
                      v-model.number="elementPadding.bottom" 
                      type="number" 
                      min="0"
                      max="200"
                      step="5"
                      class="padding-input"
                      @input="updateElementPadding"
                    />
                  </div>
                </div>
              </div>
              
              <div class="padding-presets">
                <button @click="setElementPadding(0)" class="preset-btn">無間距</button>
                <button @click="setElementPadding(10)" class="preset-btn">小</button>
                <button @click="setElementPadding(20)" class="preset-btn">中</button>
                <button @click="setElementPadding(40)" class="preset-btn">大</button>
              </div>
            </div>
          </div>

          <!-- ✅ 新增：元件寬度設定 -->
          <div class="width-section">
            <h5 class="subsection-title">元件寬度</h5>
            
            <div class="prop-group">
              <label>最大寬度</label>
              <div class="input-with-unit">
                <input 
                  v-model="elementWidth" 
                  type="text" 
                  class="prop-input"
                  placeholder="100%"
                  @input="updateElementWidth"
                />
                <span class="unit-hint">例如: 100%, 80%, 500px</span>
              </div>
            </div>

            <div class="width-presets">
              <button @click="setElementWidth('50%')" class="preset-btn">半寬</button>
              <button @click="setElementWidth('80%')" class="preset-btn">窄</button>
              <button @click="setElementWidth('100%')" class="preset-btn">全寬</button>
              <button @click="setElementWidth('auto')" class="preset-btn">自動</button>
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

          <!-- ✅ 新增：元件間距設定 -->
          <div class="padding-section">
            <h5 class="subsection-title">元件間距</h5>
            
            <div class="padding-controls">
              <div class="padding-visual">
                <div class="padding-box">
                  <div class="padding-input-group top">
                    <label>上</label>
                    <input 
                      v-model.number="elementPadding.top" 
                      type="number" 
                      min="0"
                      max="200"
                      step="5"
                      class="padding-input"
                      @input="updateElementPadding"
                    />
                  </div>
                  
                  <div class="padding-sides">
                    <div class="padding-input-group left">
                      <label>左</label>
                      <input 
                        v-model.number="elementPadding.left" 
                        type="number" 
                        min="0"
                        max="200"
                        step="5"
                        class="padding-input"
                        @input="updateElementPadding"
                      />
                    </div>
                    
                    <div class="content-preview">
                      內容區域
                    </div>
                    
                    <div class="padding-input-group right">
                      <label>右</label>
                      <input 
                        v-model.number="elementPadding.right" 
                        type="number" 
                        min="0"
                        max="200"
                        step="5"
                        class="padding-input"
                        @input="updateElementPadding"
                      />
                    </div>
                  </div>
                  
                  <div class="padding-input-group bottom">
                    <label>下</label>
                    <input 
                      v-model.number="elementPadding.bottom" 
                      type="number" 
                      min="0"
                      max="200"
                      step="5"
                      class="padding-input"
                      @input="updateElementPadding"
                    />
                  </div>
                </div>
              </div>
              
              <div class="padding-presets">
                <button @click="setElementPadding(0)" class="preset-btn">無間距</button>
                <button @click="setElementPadding(10)" class="preset-btn">小</button>
                <button @click="setElementPadding(20)" class="preset-btn">中</button>
                <button @click="setElementPadding(40)" class="preset-btn">大</button>
              </div>
            </div>
          </div>

          <!-- ✅ 新增：元件寬度設定 -->
          <div class="width-section">
            <h5 class="subsection-title">元件寬度</h5>
            
            <div class="prop-group">
              <label>最大寬度</label>
              <div class="input-with-unit">
                <input 
                  v-model="elementWidth" 
                  type="text" 
                  class="prop-input"
                  placeholder="100%"
                  @input="updateElementWidth"
                />
                <span class="unit-hint">例如: 100%, 80%, 500px</span>
              </div>
            </div>

            <div class="width-presets">
              <button @click="setElementWidth('50%')" class="preset-btn">半寬</button>
              <button @click="setElementWidth('80%')" class="preset-btn">窄</button>
              <button @click="setElementWidth('100%')" class="preset-btn">全寬</button>
              <button @click="setElementWidth('auto')" class="preset-btn">自動</button>
            </div>
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

          <!-- ✅ 新增：元件間距設定 -->
          <div class="padding-section">
            <h5 class="subsection-title">元件間距</h5>
            
            <div class="padding-controls">
              <div class="padding-visual">
                <div class="padding-box">
                  <div class="padding-input-group top">
                    <label>上</label>
                    <input 
                      v-model.number="elementPadding.top" 
                      type="number" 
                      min="0"
                      max="200"
                      step="5"
                      class="padding-input"
                      @input="updateElementPadding"
                    />
                  </div>
                  
                  <div class="padding-sides">
                    <div class="padding-input-group left">
                      <label>左</label>
                      <input 
                        v-model.number="elementPadding.left" 
                        type="number" 
                        min="0"
                        max="200"
                        step="5"
                        class="padding-input"
                        @input="updateElementPadding"
                      />
                    </div>
                    
                    <div class="content-preview">
                      內容區域
                    </div>
                    
                    <div class="padding-input-group right">
                      <label>右</label>
                      <input 
                        v-model.number="elementPadding.right" 
                        type="number" 
                        min="0"
                        max="200"
                        step="5"
                        class="padding-input"
                        @input="updateElementPadding"
                      />
                    </div>
                  </div>
                  
                  <div class="padding-input-group bottom">
                    <label>下</label>
                    <input 
                      v-model.number="elementPadding.bottom" 
                      type="number" 
                      min="0"
                      max="200"
                      step="5"
                      class="padding-input"
                      @input="updateElementPadding"
                    />
                  </div>
                </div>
              </div>
              
              <div class="padding-presets">
                <button @click="setElementPadding(0)" class="preset-btn">無間距</button>
                <button @click="setElementPadding(10)" class="preset-btn">小</button>
                <button @click="setElementPadding(20)" class="preset-btn">中</button>
                <button @click="setElementPadding(40)" class="preset-btn">大</button>
              </div>
            </div>
          </div>

          <!-- ✅ 新增：元件寬度設定 -->
          <div class="width-section">
            <h5 class="subsection-title">元件寬度</h5>
            
            <div class="prop-group">
              <label>最大寬度</label>
              <div class="input-with-unit">
                <input 
                  v-model="elementWidth" 
                  type="text" 
                  class="prop-input"
                  placeholder="100%"
                  @input="updateElementWidth"
                />
                <span class="unit-hint">例如: 100%, 80%, 500px</span>
              </div>
            </div>

            <div class="width-presets">
              <button @click="setElementWidth('50%')" class="preset-btn">半寬</button>
              <button @click="setElementWidth('80%')" class="preset-btn">窄</button>
              <button @click="setElementWidth('100%')" class="preset-btn">全寬</button>
              <button @click="setElementWidth('auto')" class="preset-btn">自動</button>
            </div>
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
                :key="image.id || index"
                class="carousel-image-item"
              >
                <img :src="image.src || image" :alt="`圖片 ${index + 1}`" class="carousel-thumbnail" />
                <button 
                  @click="removeCarouselImage(index)" 
                  class="remove-image-btn"
                  title="刪除圖片"
                >
                  ✕
                </button>
              </div>
            </div>

            <button 
              @click="addCarouselImage" 
              class="upload-btn"
              :disabled="isUploadingCarousel"
            >
              <template v-if="isUploadingCarousel">
                <span class="btn-spinner"></span>
                上傳中...
              </template>
              <template v-else>
                ＋ 新增圖片
              </template>
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

          <!-- ✅ 新增：元件間距設定 -->
          <div class="padding-section">
            <h5 class="subsection-title">元件間距</h5>
            
            <div class="padding-controls">
              <div class="padding-visual">
                <div class="padding-box">
                  <div class="padding-input-group top">
                    <label>上</label>
                    <input 
                      v-model.number="elementPadding.top" 
                      type="number" 
                      min="0"
                      max="200"
                      step="5"
                      class="padding-input"
                      @input="updateElementPadding"
                    />
                  </div>
                  
                  <div class="padding-sides">
                    <div class="padding-input-group left">
                      <label>左</label>
                      <input 
                        v-model.number="elementPadding.left" 
                        type="number" 
                        min="0"
                        max="200"
                        step="5"
                        class="padding-input"
                        @input="updateElementPadding"
                      />
                    </div>
                    
                    <div class="content-preview">
                      內容區域
                    </div>
                    
                    <div class="padding-input-group right">
                      <label>右</label>
                      <input 
                        v-model.number="elementPadding.right" 
                        type="number" 
                        min="0"
                        max="200"
                        step="5"
                        class="padding-input"
                        @input="updateElementPadding"
                      />
                    </div>
                  </div>
                  
                  <div class="padding-input-group bottom">
                    <label>下</label>
                    <input 
                      v-model.number="elementPadding.bottom" 
                      type="number" 
                      min="0"
                      max="200"
                      step="5"
                      class="padding-input"
                      @input="updateElementPadding"
                    />
                  </div>
                </div>
              </div>
              
              <div class="padding-presets">
                <button @click="setElementPadding(0)" class="preset-btn">無間距</button>
                <button @click="setElementPadding(10)" class="preset-btn">小</button>
                <button @click="setElementPadding(20)" class="preset-btn">中</button>
                <button @click="setElementPadding(40)" class="preset-btn">大</button>
              </div>
            </div>
          </div>

          <!-- ✅ 新增：元件寬度設定 -->
          <div class="width-section">
            <h5 class="subsection-title">元件寬度</h5>
            
            <div class="prop-group">
              <label>最大寬度</label>
              <div class="input-with-unit">
                <input 
                  v-model="elementWidth" 
                  type="text" 
                  class="prop-input"
                  placeholder="100%"
                  @input="updateElementWidth"
                />
                <span class="unit-hint">例如: 100%, 80%, 500px</span>
              </div>
            </div>

            <div class="width-presets">
              <button @click="setElementWidth('50%')" class="preset-btn">半寬</button>
              <button @click="setElementWidth('80%')" class="preset-btn">窄</button>
              <button @click="setElementWidth('100%')" class="preset-btn">全寬</button>
              <button @click="setElementWidth('auto')" class="preset-btn">自動</button>
            </div>
          </div>
        </template>

        <!-- MAP 元件 -->
        <template v-else-if="selectedElement.element?.type === 'MAP'">
          <h4 class="section-title">地圖設定</h4>
          
          <!-- 地址 -->
          <div class="prop-group">
            <label>地址</label>
            <textarea 
              v-model="mapAddress" 
              class="prop-textarea"
              rows="2"
              placeholder="輸入地址（例如：台北市中山區南京東路一段1號）"
              @input="updateMapData"
            ></textarea>
          </div>

          <!-- 經緯度 -->
          <div class="metadata-section">
            <h5 class="subsection-title">經緯度設定</h5>
            
            <div class="prop-group">
              <label>緯度 (Latitude)</label>
              <input 
                v-model.number="mapLat" 
                type="number" 
                class="prop-input"
                placeholder="25.033"
                step="0.001"
                @input="updateMapData"
              />
              <span class="hint-text">台灣範圍約在 21.9 ~ 25.3</span>
            </div>

            <div class="prop-group">
              <label>經度 (Longitude)</label>
              <input 
                v-model.number="mapLng" 
                type="number" 
                class="prop-input"
                placeholder="121.565"
                step="0.001"
                @input="updateMapData"
              />
              <span class="hint-text">台灣範圍約在 120.0 ~ 122.0</span>
            </div>

            <div class="prop-group">
              <label>縮放級別 ({{ mapZoom }})</label>
              <input 
                v-model.number="mapZoom" 
                type="range" 
                min="10"
                max="18"
                class="prop-slider"
                @input="updateMapData"
              />
              <div class="slider-labels">
                <span>遠</span>
                <span>近</span>
              </div>
            </div>

            <div class="zoom-presets">
              <button @click="setMapZoom(12)" class="preset-btn" :class="{ active: mapZoom === 12 }">城市</button>
              <button @click="setMapZoom(15)" class="preset-btn" :class="{ active: mapZoom === 15 }">街區</button>
              <button @click="setMapZoom(17)" class="preset-btn" :class="{ active: mapZoom === 17 }">建築</button>
            </div>
          </div>

          <!-- 元件間距設定 -->
          <div class="padding-section">
            <h5 class="subsection-title">元件間距</h5>
            
            <div class="padding-controls">
              <div class="padding-visual">
                <div class="padding-box">
                  <div class="padding-input-group top">
                    <label>上</label>
                    <input 
                      v-model.number="elementPadding.top" 
                      type="number" 
                      min="0"
                      max="200"
                      step="5"
                      class="padding-input"
                      @input="updateElementPadding"
                    />
                  </div>
                  
                  <div class="padding-sides">
                    <div class="padding-input-group left">
                      <label>左</label>
                      <input 
                        v-model.number="elementPadding.left" 
                        type="number" 
                        min="0"
                        max="200"
                        step="5"
                        class="padding-input"
                        @input="updateElementPadding"
                      />
                    </div>
                    
                    <div class="content-preview">
                      內容區域
                    </div>
                    
                    <div class="padding-input-group right">
                      <label>右</label>
                      <input 
                        v-model.number="elementPadding.right" 
                        type="number" 
                        min="0"
                        max="200"
                        step="5"
                        class="padding-input"
                        @input="updateElementPadding"
                      />
                    </div>
                  </div>
                  
                  <div class="padding-input-group bottom">
                    <label>下</label>
                    <input 
                      v-model.number="elementPadding.bottom" 
                      type="number" 
                      min="0"
                      max="200"
                      step="5"
                      class="padding-input"
                      @input="updateElementPadding"
                    />
                  </div>
                </div>
              </div>
              
              <div class="padding-presets">
                <button @click="setElementPadding(0)" class="preset-btn">無間距</button>
                <button @click="setElementPadding(10)" class="preset-btn">小</button>
                <button @click="setElementPadding(20)" class="preset-btn">中</button>
                <button @click="setElementPadding(40)" class="preset-btn">大</button>
              </div>
            </div>
          </div>

          <!-- 元件寬度設定 -->
          <div class="width-section">
            <h5 class="subsection-title">元件寬度</h5>
            
            <div class="prop-group">
              <label>最大寬度</label>
              <div class="input-with-unit">
                <input 
                  v-model="elementWidth" 
                  type="text" 
                  class="prop-input"
                  placeholder="100%"
                  @input="updateElementWidth"
                />
                <span class="unit-hint">例如: 100%, 80%, 500px</span>
              </div>
            </div>

            <div class="width-presets">
              <button @click="setElementWidth('50%')" class="preset-btn">半寬</button>
              <button @click="setElementWidth('80%')" class="preset-btn">窄</button>
              <button @click="setElementWidth('100%')" class="preset-btn">全寬</button>
              <button @click="setElementWidth('auto')" class="preset-btn">自動</button>
            </div>
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

      <!-- ✅ 選擇了空格子（保留，用於顯示提示） -->
      <div v-else-if="selectedCell" class="props-section">
        <h4 class="section-title">空格子</h4>
        <div class="empty-cell-hint">
          <p>此格子尚未放置元件</p>
          <p class="hint">從左側拖曳元件至格子中</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, inject } from 'vue'
import { useRoute } from 'vue-router'

// ✅ 注入 pageEditorStore
const pageEditorStore = inject('pageEditorStore')
const route = useRoute()

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
const isUploadingLogo = ref(false)
const localLogoSrc = ref(null)

// ✅ 圖片上傳 loading 狀態
const isUploadingImage = ref(false)
const isUploadingHeroBackground = ref(false)
const isUploadingCarousel = ref(false)

// ✅ CAROUSEL_WALL 輪播牆
const carouselWallImages = ref([])
const isUploadingCarouselWall = ref(false)

// CAROUSEL 元件相關
const carouselImages = ref([])
const carouselAutoPlay = ref(true)
const carouselInterval = ref(3000)
const carouselHeight = ref(400)

// ✅ 首圖 (FIRST_PICTURE) 相關
const heroTitle = ref('')
const heroSubtitle = ref('')
const heroHeight = ref('600px')
const overlayOpacity = ref(40)
const overlayColor = ref('#000000')
const textBoxBorderRadius = ref('12px')
const titleColor = ref('#333333')
const titleFontSize = ref('48px')
const subtitleColor = ref('#666666')
const subtitleFontSize = ref('20px')

// ✅ 元件 padding
const elementPadding = ref({ top: 20, right: 20, bottom: 20, left: 20 })

// ✅ 元件寬度
const elementWidth = ref('100%')

// ✅ 元件 metadata
const elementMetadata = ref({
  color: null,
  font_size: null,
  font_weight: null,
  text_align: null,
  width: null,
  height: null,
  background_color: null
})

// ✅ IMG 元件 alt 文字
const imageAlt = ref('')

// ✅ 框架寬度設定
const frameWidth = ref('1200px')

// ✅ MAP 元件
const mapAddress = ref('')
const mapLat = ref(25.033)
const mapLng = ref(121.565)
const mapZoom = ref(15)

// 高度預設選項
const heightPresets = [
  { label: '小', value: 300 },
  { label: '中', value: 400 },
  { label: '大', value: 500 },
  { label: '特大', value: 600 }
]

// ==================== 監聽選中元件 ====================

watch(() => props.selectedElement, (newVal) => {
  if (newVal?.type === 'logo' && newVal.data) {
    logoAlt.value = newVal.data.alt || 'Logo'
    logoWidth.value = newVal.data.width || '120px'
    logoHeight.value = newVal.data.height || 'auto'
  }
  
  if (newVal?.element?.type === 'CAROUSEL') {
    const value = newVal.element.value || {}
    carouselImages.value = value.images || []
    carouselAutoPlay.value = value.autoPlay !== false
    carouselInterval.value = value.interval || 3000
    carouselHeight.value = value.height || 400
  }

  // ✅ MAP 元件
  if (newVal?.element?.type === 'MAP') {
    const value = newVal.element.value || {}
    mapAddress.value = value.address || ''
    mapLat.value = value.lat !== undefined ? value.lat : 25.033
    mapLng.value = value.lng !== undefined ? value.lng : 121.565
    mapZoom.value = value.zoom !== undefined ? value.zoom : 15
  }

  if (newVal?.element?.type === 'IMG') {
    imageAlt.value = newVal.element.value?.alt || ''
  } else {
    imageAlt.value = ''
  }

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
    elementMetadata.value = {
      color: null, font_size: null, font_weight: null,
      text_align: null, width: null, height: null, background_color: null
    }
  }

  elementPadding.value = newVal?.element?.padding
    ? { ...newVal.element.padding }
    : { top: 20, right: 20, bottom: 20, left: 20 }

  elementWidth.value = newVal?.element?.width || '100%'

}, { immediate: true, deep: true })

watch(() => props.selectedElement?.data, (newData) => {
  if (props.selectedElement?.type === 'logo' && newData) {
    console.log('✓ Logo data 變化檢測:', newData)
  }
}, { deep: true })

watch(
  () => props.selectedElement?.frame?.data?.logo_img_src,
  (newSrc) => {
    if (props.selectedElement?.type === 'logo') {
      localLogoSrc.value = newSrc || null
    }
  },
  { immediate: true }
)

watch(
  () => props.selectedElement?.type,
  (newType) => {
    if (newType === 'logo') {
      localLogoSrc.value = props.selectedElement?.frame?.data?.logo_img_src || null
    }
  },
  { immediate: true }
)

watch(() => props.selectedElement?.element?.value?.images, (newImages) => {
  if (props.selectedElement?.element?.type === 'CAROUSEL' && newImages) {
    carouselImages.value = [...newImages]
  }
}, { deep: true })

// ==================== 監聽選中框架 ====================

watch(() => props.selectedFrame, (newVal) => {
  // 自訂框架寬度
  if (newVal?.type?.startsWith('FRAME')) {
    frameWidth.value = newVal.metadata?.frame_width || '1200px'
  }

  // 首圖資料
  if (newVal?.type === 'FIRST_PICTURE' && newVal.data) {
    heroTitle.value = newVal.data.hero_title || ''
    heroSubtitle.value = newVal.data.hero_subtitle || ''
    heroHeight.value = newVal.data.hero_height || '600px'
    overlayOpacity.value = newVal.data.overlay_opacity !== undefined ? newVal.data.overlay_opacity : 40
    overlayColor.value = newVal.data.overlay_color || '#000000'
    textBoxBorderRadius.value = newVal.data.text_box_border_radius || '12px'
    titleColor.value = newVal.data.title_color || '#333333'
    titleFontSize.value = newVal.data.title_font_size || '48px'
    subtitleColor.value = newVal.data.subtitle_color || '#666666'
    subtitleFontSize.value = newVal.data.subtitle_font_size || '20px'
  }

  // ✅ 輪播牆資料
  if (newVal?.type === 'CAROUSEL_WALL') {
    carouselWallImages.value = Array.isArray(newVal.data?.caroisel_wall_imgs)
      ? [...newVal.data.caroisel_wall_imgs]
      : []
    console.log('✓ 輪播牆圖片已載入:', carouselWallImages.value.length, '張')
  }

}, { immediate: true, deep: true })

// ==================== 框架寬度更新 ====================

const updateFrameWidth = () => {
  if (props.selectedFrame) {
    if (!props.selectedFrame.metadata) props.selectedFrame.metadata = {}
    props.selectedFrame.metadata.frame_width = frameWidth.value
  }
}

const setFrameWidth = (width) => {
  frameWidth.value = width
  updateFrameWidth()
}

// ==================== Metadata 更新 ====================

const updateMetadata = () => {
  if (props.selectedElement?.element) {
    if (!props.selectedElement.element.metadata) props.selectedElement.element.metadata = {}
    props.selectedElement.element.metadata = { ...elementMetadata.value }
  }
}

const updateImageAlt = () => {
  if (props.selectedElement?.element?.type === 'IMG') {
    if (!props.selectedElement.element.value) props.selectedElement.element.value = {}
    props.selectedElement.element.value.alt = imageAlt.value
  }
}

// ==================== 元件 Padding 更新 ====================

const updateElementPadding = () => {
  if (props.selectedElement?.element) {
    if (!props.selectedElement.element.padding) props.selectedElement.element.padding = {}
    props.selectedElement.element.padding = { ...elementPadding.value }
    emit('update-cell-padding', {
      frame: props.selectedElement.frame,
      cellIndex: props.selectedElement.cellIndex,
      padding: { ...elementPadding.value }
    })
  }
}

const setElementPadding = (value) => {
  elementPadding.value = { top: value, right: value, bottom: value, left: value }
  updateElementPadding()
}

// ==================== 元件寬度更新 ====================

const updateElementWidth = () => {
  if (props.selectedElement?.element) {
    props.selectedElement.element.width = elementWidth.value
    adjustSiblingCellsWidth()
  }
}

const adjustSiblingCellsWidth = () => {
  const frame = props.selectedElement?.frame
  const cellIndex = props.selectedElement?.cellIndex
  if (!frame || cellIndex === undefined) return
  const frameType = frame.type
  if (!frameType || !frameType.startsWith('FRAME')) return
  let layout = frameType.replace(/^FRAME/, '').replace(/^[-_]/, '').replace(/-/g, '_')
  const singleRowLayouts = ['1_1', '1_2', '1_3', '1_4']
  if (!singleRowLayouts.includes(layout)) return
  const rowCells = getRowCells(layout, cellIndex)
  if (rowCells.length <= 1) return
  if (!frame.elements) frame.elements = []
  const currentWidth = parseWidth(elementWidth.value)
  if (currentWidth === null || currentWidth >= 100) return
  const remainingWidth = 100 - currentWidth
  const otherCellsCount = rowCells.length - 1
  const widthPerCell = remainingWidth / otherCellsCount
  rowCells.forEach(index => {
    if (index !== cellIndex && frame.elements[index]?.type) {
      frame.elements[index].width = widthPerCell.toFixed(1) + '%'
    }
  })
}

const parseWidth = (widthStr) => {
  if (!widthStr || widthStr === 'auto') return null
  if (widthStr.includes('%')) {
    const num = parseFloat(widthStr)
    return isNaN(num) ? null : num
  }
  return null
}

const getRowCells = (layout, currentIndex) => {
  switch (layout) {
    case '1_1': return [0]
    case '1_2': return [0, 1]
    case '1_3': return [0, 1, 2]
    case '1_4': return [0, 1, 2, 3]
    default: return [currentIndex]
  }
}

const setElementWidth = (width) => {
  elementWidth.value = width
  updateElementWidth()
}

// ==================== Logo 操作 ====================

const handleUploadLogo = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      isUploadingLogo.value = true
      pageEditorStore.markFileForDeletion(props.selectedElement?.frame?.data?.logo_img_id)
      const uploadedFile = await pageEditorStore.uploadImage(file)
      if (!uploadedFile) { alert('Logo 上傳失敗，請稍後再試'); return }
      localLogoSrc.value = uploadedFile.fileDir
      emit('update-logo', { id: uploadedFile.id, src: uploadedFile.fileDir })
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error('❌ Logo 上傳失敗:', error)
      alert('Logo 上傳失敗: ' + error.message)
    } finally {
      isUploadingLogo.value = false
    }
  }
  input.click()
}

const handleLogoImageError = (e) => {
  console.error('❌ Logo 圖片載入失敗:', e.target.src)
  alert('Logo 圖片載入失敗，請重新上傳')
}

// ==================== 圖片操作 ====================

const handleUploadImage = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      isUploadingImage.value = true
      pageEditorStore.markFileForDeletion(props.selectedElement?.element?.value?.id)
      const uploadedFile = await pageEditorStore.uploadImage(file)
      if (!uploadedFile) { alert('圖片上傳失敗，請稍後再試'); return }
      if (props.selectedElement?.element?.value) {
        props.selectedElement.element.value.id = uploadedFile.id
        props.selectedElement.element.value.src = uploadedFile.fileDir
      }
    } catch (error) {
      console.error('❌ 圖片上傳失敗:', error)
      alert('圖片上傳失敗: ' + error.message)
    } finally {
      isUploadingImage.value = false
    }
  }
  input.click()
}

// ==================== CAROUSEL 元件操作 ====================

const addCarouselImage = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true  // ✅ 支援多選
  
  input.onchange = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    
    try {
      isUploadingCarousel.value = true
      console.log(`📤 開始上傳 ${files.length} 張輪播圖片...`)
      
      // ✅ 確保 value 和 images 陣列存在
      if (!props.selectedElement.element.value) props.selectedElement.element.value = {}
      if (!props.selectedElement.element.value.images) props.selectedElement.element.value.images = []
      
      // ✅ 依序上傳每張圖片
      for (const file of files) {
        const uploadedFile = await pageEditorStore.uploadImage(file)
        if (!uploadedFile) {
          console.warn(`⚠️ 圖片 ${file.name} 上傳失敗，跳過`)
          continue
        }
        
        // ✅ 儲存完整資料（id + src）
        props.selectedElement.element.value.images.push({
          id: uploadedFile.id,
          src: uploadedFile.fileDir
        })
      }
      
      // ✅ 同步本地響應式陣列
      carouselImages.value = [...props.selectedElement.element.value.images]
      
      console.log('✓ 輪播圖片已新增，共', carouselImages.value.length, '張')
    } catch (error) {
      console.error('❌ 輪播圖片上傳失敗:', error)
      alert('輪播圖片上傳失敗: ' + error.message)
    } finally {
      isUploadingCarousel.value = false
    }
  }
  input.click()
}

const removeCarouselImage = (index) => {
  if (!confirm('確定要刪除這張圖片嗎？')) return
  
  const images = props.selectedElement?.element?.value?.images
  if (!images) return
  
  // ✅ 標記舊檔案 ID 待刪除
  const removedImg = images[index]
  if (removedImg?.id) {
    pageEditorStore.markFileForDeletion(removedImg.id)
  }
  
  images.splice(index, 1)
  carouselImages.value = [...images]
  
  console.log('✓ 輪播圖片已刪除，剩餘', carouselImages.value.length, '張')
}

const updateCarouselSettings = () => {
  if (props.selectedElement?.element?.value) {
    props.selectedElement.element.value.autoPlay = carouselAutoPlay.value
    props.selectedElement.element.value.interval = carouselInterval.value
    props.selectedElement.element.value.height = carouselHeight.value
  }
}

const setCarouselHeight = (height) => {
  carouselHeight.value = height
  updateCarouselSettings()
}

// ==================== 首圖操作 ====================

const updateHeroData = () => {
  if (props.selectedFrame?.data) {
    props.selectedFrame.data.hero_title = heroTitle.value
    props.selectedFrame.data.hero_subtitle = heroSubtitle.value
    props.selectedFrame.data.hero_height = heroHeight.value
    props.selectedFrame.data.overlay_opacity = overlayOpacity.value
    props.selectedFrame.data.overlay_color = overlayColor.value
    props.selectedFrame.data.text_box_border_radius = textBoxBorderRadius.value
    props.selectedFrame.data.title_color = titleColor.value
    props.selectedFrame.data.title_font_size = titleFontSize.value
    props.selectedFrame.data.subtitle_color = subtitleColor.value
    props.selectedFrame.data.subtitle_font_size = subtitleFontSize.value
  }
}

const setHeroHeight = (height) => {
  heroHeight.value = height
  updateHeroData()
}

const handleUploadHeroBackground = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      isUploadingHeroBackground.value = true
      pageEditorStore.markFileForDeletion(props.selectedFrame?.data?.hero_bg_img_id)
      const uploadedFile = await pageEditorStore.uploadImage(file)
      if (!uploadedFile) { alert('首圖背景上傳失敗，請稍後再試'); return }
      if (props.selectedFrame?.data) {
        props.selectedFrame.data.hero_bg_img_id = uploadedFile.id
        props.selectedFrame.data.hero_bg_img_src = uploadedFile.fileDir
      }
    } catch (error) {
      console.error('❌ 首圖背景上傳失敗:', error)
      alert('首圖背景上傳失敗: ' + error.message)
    } finally {
      isUploadingHeroBackground.value = false
    }
  }
  input.click()
}

// ==================== ✅ 輪播牆操作 ====================

const handleUploadCarouselWall = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true  // ✅ 支援多選
  
  input.onchange = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    
    try {
      isUploadingCarouselWall.value = true
      console.log(`📤 開始上傳 ${files.length} 張輪播牆圖片...`)

      // ✅ 確保 frame.data 與 caroisel_wall_imgs 陣列存在
      if (!props.selectedFrame.data) props.selectedFrame.data = {}
      if (!Array.isArray(props.selectedFrame.data.caroisel_wall_imgs)) {
        props.selectedFrame.data.caroisel_wall_imgs = []
      }

      // ✅ 依序上傳每張圖片
      for (const file of files) {
        const uploadedFile = await pageEditorStore.uploadImage(file)
        if (!uploadedFile) {
          console.warn(`⚠️ 圖片 ${file.name} 上傳失敗，跳過`)
          continue
        }

        // 新增圖片項目（後端格式：id + src）
        const newImage = {
          id: uploadedFile.id,
          src: uploadedFile.fileDir
        }
        props.selectedFrame.data.caroisel_wall_imgs.push(newImage)
      }

      // ✅ 同步本地響應式陣列
      carouselWallImages.value = [...props.selectedFrame.data.caroisel_wall_imgs]

      console.log('✓ 輪播牆圖片已新增，共', carouselWallImages.value.length, '張')
    } catch (error) {
      console.error('❌ 輪播牆圖片上傳失敗:', error)
      alert('輪播牆圖片上傳失敗: ' + error.message)
    } finally {
      isUploadingCarouselWall.value = false
    }
  }
  input.click()
}

const removeCarouselWallImage = (index) => {
  if (!confirm('確定要刪除這張圖片嗎？')) return
  const imgs = props.selectedFrame?.data?.caroisel_wall_imgs
  if (!imgs) return

  // ✅ 標記待刪除
  const removedImg = imgs[index]
  if (removedImg?.id) {
    pageEditorStore.markFileForDeletion(removedImg.id)
  }

  imgs.splice(index, 1)
  carouselWallImages.value = [...imgs]

  console.log('✓ 輪播牆圖片已刪除，剩餘', carouselWallImages.value.length, '張')
}

// ==================== MAP 元件操作 ====================

const updateMapData = () => {
  if (props.selectedElement?.element?.value) {
    props.selectedElement.element.value.address = mapAddress.value
    props.selectedElement.element.value.lat = mapLat.value
    props.selectedElement.element.value.lng = mapLng.value
    props.selectedElement.element.value.zoom = mapZoom.value
  }
}

const setMapZoom = (zoom) => {
  mapZoom.value = zoom
  updateMapData()
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

.hint-text {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #999;
  font-style: italic;
}

.empty-cell-hint {
  padding: 40px 20px;
  text-align: center;
  color: #999;

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
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-title {
  margin: 0 0 20px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 2px solid #E8572A;
}

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

.padding-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px dashed #e5e5e5;
}

.width-section {
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

  &:focus { border-color: #E8572A; }
  &:disabled { background: #f5f5f5; cursor: not-allowed; }
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

.color-input-group {
  display: flex;
  gap: 8px;
  align-items: center;

  .prop-color { flex-shrink: 0; }
  .color-text { flex: 1; }

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

    &:hover { background: #e8e8e8; color: #666; }
  }
}

.input-with-unit {
  .unit-hint {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    color: #999;
  }
}

.width-hint {
  margin-top: 8px;
  margin-bottom: 0;
  font-size: 12px;
  color: #666;
  background: #f0f8ff;
  padding: 8px 12px;
  border-radius: 4px;
  border-left: 3px solid #4a90e2;
  line-height: 1.4;
}

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

    &:hover { background: #e8e8e8; border-color: #ccc; }
    &.active { background: #E8572A; border-color: #E8572A; color: #fff; }
    &.clear {
      flex: 0 0 40px;
      font-size: 14px;
      color: #999;
      &:hover { background: #e8e8e8; color: #666; }
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

.uploading-state {
  width: 100%;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
  border: 2px solid #E8572A;
  border-radius: 4px;
  color: #E8572A;
  font-size: 13px;
  gap: 12px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #E8572A;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.btn-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 6px;
  vertical-align: middle;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

  &:hover:not(:disabled) { background: #d14a1f; }
  &:disabled { background: #ccc; cursor: not-allowed; opacity: 0.6; }
}

.debug-info {
  margin-top: 8px;
  padding: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  font-family: monospace;
  
  small { font-size: 11px; color: #666; line-height: 1.6; }
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  
  input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
  span { font-size: 13px; color: #666; }
}

.height-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .prop-input { flex: 1; }
  .unit { font-size: 13px; color: #666; font-weight: 500; }
}

.height-presets,
.width-presets,
.zoom-presets {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 12px;
}

.zoom-presets {
  grid-template-columns: repeat(3, 1fr);
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
  
  &:hover { background: #e8e8e8; border-color: #ccc; }
  &.active { background: #E8572A; border-color: #E8572A; color: #fff; font-weight: 500; }
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
    .remove-image-btn { opacity: 1; }
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
  
  &:hover { background: #dc2626; transform: scale(1.1); }
}

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
  
  label { font-size: 12px; color: #666; min-width: 24px; margin: 0; }
  &.top, &.bottom { justify-content: center; }
  &.left { justify-content: flex-start; }
  &.right { justify-content: flex-end; }
}

.padding-input {
  width: 70px;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
  outline: none;
  
  &:focus { border-color: #E8572A; }
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

.panel-body::-webkit-scrollbar { width: 6px; }
.panel-body::-webkit-scrollbar-track { background: #f1f1f1; }
.panel-body::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
  &:hover { background: #ccc; }
}

.prop-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e5e5e5;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #E8572A;
    cursor: pointer;
    transition: all 0.2s;
    &:hover { transform: scale(1.2); box-shadow: 0 0 0 4px rgba(232, 87, 42, 0.1); }
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #E8572A;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    &:hover { transform: scale(1.2); box-shadow: 0 0 0 4px rgba(232, 87, 42, 0.1); }
  }
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  span { font-size: 11px; color: #999; }
}
</style>
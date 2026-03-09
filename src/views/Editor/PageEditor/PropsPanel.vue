<template>
  <div class="props-panel" :class="{ 'is-collapsed': isCollapsed }">

    <!-- ===== 新增：收合按鈕 ===== -->
    <button class="collapse-btn" @click="isCollapsed = !isCollapsed" :title="isCollapsed ? '展開' : '收合'">
      <svg class="collapse-icon" :class="{ 'is-flipped': isCollapsed }"
        width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2.5"
        stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>

    <!-- ===== 新增：收合時的垂直標題 ===== -->
    <div v-if="isCollapsed" class="collapsed-label">屬性設定</div>

    <!-- ===== 新增：展開時的完整內容包裝 ===== -->
    <template v-if="!isCollapsed">

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
            :value="selectedBasemap.bgType" 
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
                  placeholder="1200（）"
                  @input="updateFrameWidth"
                />
              </div>
            </div>

            <div class="width-presets">
              <button @click="setFrameWidth('900')" class="preset-btn">窄</button>
              <button @click="setFrameWidth('1200')" class="preset-btn">中</button>
              <button @click="setFrameWidth('1400')" class="preset-btn">寬</button>
              <button @click="setFrameWidth('100%')" class="preset-btn">全寬</button>
            </div>
          </div>
        </template>
        
        <!-- ✅ 首圖框架 (FIRST_PICTURE) -->
        <template v-else-if="selectedFrame.type === 'FIRST_PICTURE'">
          <h4 class="section-title">首圖設定</h4>
          
          <div class="prop-group">
            <label>背景圖片</label>
            <div class="image-upload">
              <div v-if="isUploadingHeroBackground" class="uploading-state">
                <div class="spinner"></div>
                <span>上傳中...</span>
              </div>
              <img 
                v-else-if="selectedFrame.data?.heroBgImgSrc"
                :src="selectedFrame.data.heroBgImgSrc" 
                alt="背景預覽"
                class="preview-image"
              />
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
                  {{ selectedFrame.data?.heroBgImgSrc ? '更換背景' : '上傳背景' }}
                </template>
              </button>
            </div>
          </div>
          
          <div class="prop-group">
            <label>標題</label>
            <input v-model="heroTitle" type="text" class="prop-input" placeholder="輸入首圖標題" @input="updateHeroData" />
          </div>
          
          <div class="prop-group">
            <label>副標題</label>
            <textarea v-model="heroSubtitle" class="prop-textarea" rows="3" placeholder="輸入首圖副標題" @input="updateHeroData"></textarea>
          </div>
          
          <div class="metadata-section">
            <h5 class="subsection-title">樣式設定</h5>
            
            <div class="prop-group">
              <label>首圖高度</label>
              <div class="height-selector">
                <input v-model="heroHeight" type="text" class="prop-input" placeholder="600（）" @input="updateHeroData" />
              </div>
              <div class="height-presets">
                <button @click="setHeroHeight('500')" class="preset-btn">小</button>
                <button @click="setHeroHeight('600')" class="preset-btn">中</button>
                <button @click="setHeroHeight('700')" class="preset-btn">大</button>
                <button @click="setHeroHeight('100vh')" class="preset-btn">全螢幕</button>
              </div>
            </div>
            
            <div class="prop-group">
              <label>遮罩透明度 ({{ overlayOpacity }}%)</label>
              <input v-model.number="overlayOpacity" type="range" min="0" max="100" class="prop-slider" @input="updateHeroData" />
              <div class="slider-labels"><span>透明</span><span>不透明</span></div>
            </div>
            
            <div class="prop-group">
              <label>遮罩顏色</label>
              <div class="color-input-group">
                <input v-model="overlayColor" type="color" class="prop-color" @input="updateHeroData" />
                <input v-model="overlayColor" type="text" class="prop-input color-text" placeholder="#000000" @input="updateHeroData" />
              </div>
            </div>
            
            <div class="prop-group">
              <label>文字框圓角</label>
              <div class="input-with-unit">
                <input v-model="textBoxBorderRadius" type="text" class="prop-input" placeholder="12（）" @input="updateHeroData" />
              </div>
            </div>
            
            <div class="prop-group">
              <label>標題顏色</label>
              <div class="color-input-group">
                <input v-model="titleColor" type="color" class="prop-color" @input="updateHeroData" />
                <input v-model="titleColor" type="text" class="prop-input color-text" placeholder="#333333" @input="updateHeroData" />
              </div>
            </div>
            
            <div class="prop-group">
              <label>標題字體大小</label>
              <div class="input-with-unit">
                <input v-model="titleFontSize" type="text" class="prop-input" placeholder="48（）" @input="updateHeroData" />
              </div>
            </div>
            
            <div class="prop-group">
              <label>副標題顏色</label>
              <div class="color-input-group">
                <input v-model="subtitleColor" type="color" class="prop-color" @input="updateHeroData" />
                <input v-model="subtitleColor" type="text" class="prop-input color-text" placeholder="#666666" @input="updateHeroData" />
              </div>
            </div>
            
            <div class="prop-group">
              <label>副標題字體大小</label>
              <div class="input-with-unit">
                <input v-model="subtitleFontSize" type="text" class="prop-input" placeholder="20（）" @input="updateHeroData" />
              </div>
            </div>
          </div>
        </template>

        <!-- ✅ 輪播牆 (CAROUSEL_WALL) -->
        <template v-else-if="selectedFrame.type === 'CAROUSEL_WALL'">
          <h4 class="section-title">輪播牆設定</h4>

          <div class="prop-group">
            <label>輪播高度</label>
            <div class="height-selector">
              <input v-model.number="carouselWallHeight" type="number" class="prop-input" min="200" max="1000" step="50" @input="updateCarouselWallSettings" />
              <span class="unit">px</span>
            </div>
            <div class="height-presets">
              <button @click="setCarouselWallHeight(400)" class="preset-btn" :class="{ active: carouselWallHeight === 400 }">小</button>
              <button @click="setCarouselWallHeight(600)" class="preset-btn" :class="{ active: carouselWallHeight === 600 }">中</button>
              <button @click="setCarouselWallHeight(800)" class="preset-btn" :class="{ active: carouselWallHeight === 800 }">大</button>
              <button @click="setCarouselWallHeight(1000)" class="preset-btn" :class="{ active: carouselWallHeight === 1000 }">特大</button>
            </div>
          </div>

          <div class="prop-group">
            <label class="checkbox-label">
              <input v-model="carouselWallAutoPlay" type="checkbox" @change="updateCarouselWallSettings" />
              <span>自動播放</span>
            </label>
          </div>

          <div class="prop-group" v-if="carouselWallAutoPlay">
            <label>播放間隔 (毫秒)</label>
            <input v-model.number="carouselWallInterval" type="number" class="prop-input" min="1000" step="500" @input="updateCarouselWallSettings" />
            <span class="unit-hint">建議 3000–8000 毫秒</span>
          </div>

          <div class="prop-group" style="margin-top: 24px;">
            <label>輪播圖片 ({{ carouselWallImages.length }} 張)</label>
            <div v-if="carouselWallImages.length > 0" class="carousel-images-list-vertical">
              <div
                v-for="(img, index) in carouselWallImages"
                :key="img.id || index"
                class="carousel-image-card"
                :class="{ 'drag-over': carouselWallDragOver === index }"
                draggable="true"
                @dragstart="onCarouselWallDragStart(index)"
                @dragover.prevent="carouselWallDragOver = index"
                @dragleave="carouselWallDragOver = null"
                @drop.prevent="onCarouselWallDrop(index)"
                @dragend="carouselWallDragOver = null"
              >
                <!-- 圖片預覽列 -->
                <div class="card-image-row">
                  <div class="drag-handle card-drag">⠿</div>
                  <img :src="img.src" :alt="`圖片 ${index + 1}`" class="card-thumbnail" />
                  <span class="card-index">第 {{ index + 1 }} 張</span>
                  <button class="remove-image-btn card-remove" @click="removeCarouselWallImage(index)" title="刪除圖片">✕</button>
                </div>
                <!-- 標題 -->
                <div class="card-field">
                  <label class="card-label">標題</label>
                  <input
                    :value="img.title || ''"
                    type="text"
                    class="prop-input card-input"
                    placeholder="此張圖片的標題（選填）"
                    @input="updateCarouselWallImageField(index, 'title', $event.target.value)"
                  />
                </div>
                <!-- 副標題 -->
                <div class="card-field">
                  <label class="card-label">副標題</label>
                  <textarea
                    :value="img.subtitle || ''"
                    class="prop-textarea card-textarea"
                    rows="2"
                    placeholder="此張圖片的副標題（選填）"
                    @input="updateCarouselWallImageField(index, 'subtitle', $event.target.value)"
                  ></textarea>
                </div>
                <!-- 樣式設定（可折疊） -->
                <div class="card-field card-style-toggle" @click="toggleCardStyle(index)">
                  <span class="card-label">樣式設定</span>
                  <span class="card-toggle-icon">{{ expandedCardStyles.includes(index) ? '▲' : '▼' }}</span>
                </div>
                <template v-if="expandedCardStyles.includes(index)">
                  <!-- 遮罩透明度 -->
                  <div class="card-field">
                    <label class="card-label">遮罩透明度 ({{ img.overlayOpacity ?? 40 }}%)</label>
                    <input
                      :value="img.overlayOpacity ?? 40"
                      type="range" min="0" max="100"
                      class="prop-slider card-slider"
                      @input="updateCarouselWallImageField(index, 'overlayOpacity', Number($event.target.value))"
                    />
                    <div class="slider-labels"><span>透明</span><span>不透明</span></div>
                  </div>
                  <!-- 遮罩顏色 -->
                  <div class="card-field">
                    <label class="card-label">遮罩顏色</label>
                    <div class="color-input-group">
                      <input
                        :value="img.overlayColor || '#000000'"
                        type="color" class="prop-color"
                        @input="updateCarouselWallImageField(index, 'overlayColor', $event.target.value)"
                      />
                      <input
                        :value="img.overlayColor || '#000000'"
                        type="text" class="prop-input color-text" placeholder="#000000"
                        @input="updateCarouselWallImageField(index, 'overlayColor', $event.target.value)"
                      />
                    </div>
                  </div>
                  <!-- 標題顏色 -->
                  <div class="card-field">
                    <label class="card-label">標題顏色</label>
                    <div class="color-input-group">
                      <input
                        :value="img.titleColor || '#ffffff'"
                        type="color" class="prop-color"
                        @input="updateCarouselWallImageField(index, 'titleColor', $event.target.value)"
                      />
                      <input
                        :value="img.titleColor || '#ffffff'"
                        type="text" class="prop-input color-text" placeholder="#ffffff"
                        @input="updateCarouselWallImageField(index, 'titleColor', $event.target.value)"
                      />
                    </div>
                  </div>
                  <!-- 標題字體大小 -->
                  <div class="card-field">
                    <label class="card-label">標題字體大小</label>
                    <div class="input-with-suffix">
                      <input
                        :value="img.titleFontSize ?? 48"
                        type="number" class="prop-input" placeholder="48" min="12"
                        @input="updateCarouselWallImageField(index, 'titleFontSize', Number($event.target.value))"
                      />
                      <span class="input-suffix">px</span>
                    </div>
                  </div>
                  <!-- 副標題顏色 -->
                  <div class="card-field">
                    <label class="card-label">副標題顏色</label>
                    <div class="color-input-group">
                      <input
                        :value="img.subtitleColor || '#eeeeee'"
                        type="color" class="prop-color"
                        @input="updateCarouselWallImageField(index, 'subtitleColor', $event.target.value)"
                      />
                      <input
                        :value="img.subtitleColor || '#eeeeee'"
                        type="text" class="prop-input color-text" placeholder="#eeeeee"
                        @input="updateCarouselWallImageField(index, 'subtitleColor', $event.target.value)"
                      />
                    </div>
                  </div>
                  <!-- 副標題字體大小 -->
                  <div class="card-field">
                    <label class="card-label">副標題字體大小</label>
                    <div class="input-with-suffix">
                      <input
                        :value="img.subtitleFontSize ?? 20"
                        type="number" class="prop-input" placeholder="20" min="10"
                        @input="updateCarouselWallImageField(index, 'subtitleFontSize', Number($event.target.value))"
                      />
                      <span class="input-suffix">px</span>
                    </div>
                  </div>
                </template>
              </div>
            </div>
            <div v-else class="no-image"><span>尚未上傳圖片</span></div>
            <button @click="handleUploadCarouselWall" class="upload-btn" :disabled="isUploadingCarouselWall">
              <template v-if="isUploadingCarouselWall"><span class="btn-spinner"></span>上傳中...</template>
              <template v-else>＋ 新增圖片</template>
            </button>
          </div>
        </template>
        
        <!-- ✅ 頁尾 (FOOTER) -->
        <template v-else-if="selectedFrame.type === 'FOOTER'">
          <h4 class="section-title">頁尾設定</h4>

          <div class="metadata-section">
            <h5 class="subsection-title">背景色</h5>
            <div class="prop-group">
              <label>背景顏色</label>
              <div class="color-input-group">
                <input v-model="footerBgColor" type="color" class="prop-color" @input="updateFooterStyle" />
                <input v-model="footerBgColor" type="text" class="prop-input color-text" placeholder="#2d2d2d" @input="updateFooterStyle" />
              </div>
              <div class="color-quick-btns" style="margin-top:10px;">
                <button @click="footerBgColor='#2d2d2d'; updateFooterStyle()" class="preset-btn" :class="{ active: footerBgColor==='#2d2d2d' }">深灰</button>
                <button @click="footerBgColor='#1a1a2e'; updateFooterStyle()" class="preset-btn" :class="{ active: footerBgColor==='#1a1a2e' }">深藍</button>
                <button @click="footerBgColor='#3b1f0a'; updateFooterStyle()" class="preset-btn" :class="{ active: footerBgColor==='#3b1f0a' }">深褐</button>
                <button @click="footerBgColor='#1b2a1b'; updateFooterStyle()" class="preset-btn" :class="{ active: footerBgColor==='#1b2a1b' }">深綠</button>
              </div>
            </div>
          </div>

          <div class="metadata-section">
            <h5 class="subsection-title">文字色</h5>
            <div class="prop-group">
              <label>文字顏色</label>
              <div class="color-input-group">
                <input v-model="footerTextColor" type="color" class="prop-color" @input="updateFooterStyle" />
                <input v-model="footerTextColor" type="text" class="prop-input color-text" placeholder="#ffffff" @input="updateFooterStyle" />
              </div>
              <div class="color-quick-btns" style="margin-top:10px;">
                <button @click="footerTextColor='#ffffff'; updateFooterStyle()" class="preset-btn" :class="{ active: footerTextColor==='#ffffff' }">白色</button>
                <button @click="footerTextColor='#f5d9b0'; updateFooterStyle()" class="preset-btn" :class="{ active: footerTextColor==='#f5d9b0' }">金色</button>
                <button @click="footerTextColor='#a8d8a8'; updateFooterStyle()" class="preset-btn" :class="{ active: footerTextColor==='#a8d8a8' }">淺綠</button>
                <button @click="footerTextColor='#adc8e6'; updateFooterStyle()" class="preset-btn" :class="{ active: footerTextColor==='#adc8e6' }">淺藍</button>
              </div>
            </div>
          </div>
        </template>

        <!-- ✅ 捐款區 (INDEX_DONATION) -->
        <template v-else-if="selectedFrame.type === 'INDEX_DONATION'">
          <h4 class="section-title">捐款區設定</h4>

          <div class="metadata-section">
            <h5 class="subsection-title">背景色</h5>
            <div class="prop-group">
              <label>背景顏色 / 漸層</label>
              <div class="color-input-group">
                <input v-model="donationBgColorA" type="color" class="prop-color" @input="updateDonationStyle" />
                <input v-model="donationBgColorA" type="text" class="prop-input color-text" placeholder="#8b7355" @input="updateDonationStyle" />
              </div>
              <div class="color-input-group" style="margin-top: 8px;">
                <input v-model="donationBgColorB" type="color" class="prop-color" @input="updateDonationStyle" />
                <input v-model="donationBgColorB" type="text" class="prop-input color-text" placeholder="#a0826d（漸層第二色，留空為純色）" @input="updateDonationStyle" />
              </div>
              <span class="unit-hint">設定兩個顏色會產生漸層，只設一個則為純色</span>
            </div>
          </div>

          <div class="metadata-section">
            <h5 class="subsection-title">文字色</h5>
            <div class="prop-group">
              <label>文字顏色</label>
              <div class="color-input-group">
                <input v-model="donationTextColor" type="color" class="prop-color" @input="updateDonationStyle" />
                <input v-model="donationTextColor" type="text" class="prop-input color-text" placeholder="#ffffff" @input="updateDonationStyle" />
              </div>
            </div>
            <div class="color-quick-btns">
              <button @click="donationTextColor = '#ffffff'; updateDonationStyle()" class="preset-btn" :class="{ active: donationTextColor === '#ffffff' }">白色</button>
              <button @click="donationTextColor = '#333333'; updateDonationStyle()" class="preset-btn" :class="{ active: donationTextColor === '#333333' }">深色</button>
              <button @click="donationTextColor = '#f5d9b0'; updateDonationStyle()" class="preset-btn" :class="{ active: donationTextColor === '#f5d9b0' }">金色</button>
              <button @click="donationTextColor = '#fde68a'; updateDonationStyle()" class="preset-btn" :class="{ active: donationTextColor === '#fde68a' }">黃色</button>
            </div>
          </div>
        </template>

        <!-- ✅ 其他系統框架類型 -->
        <template v-else>
          <h4 class="section-title">框架設定</h4>
          <div class="prop-group">
            <label>框架類型</label>
            <input :value="selectedFrame.type" type="text" class="prop-input" disabled />
          </div>

          <!-- 文字色主題 -->
          <div class="metadata-section">
            <h5 class="subsection-title">文字色主題</h5>
            <div class="prop-group">
              <label>選擇主題</label>
              <div class="theme-buttons">
                <button
                  v-for="t in textThemeOptions" :key="t.value"
                  class="theme-btn"
                  :class="{ active: systemFrameTextTheme === t.value }"
                  :style="{ borderColor: systemFrameTextTheme === t.value ? '#E8572A' : 'transparent' }"
                  @click="setSystemFrameTheme(t.value)"
                  type="button"
                >
                  <div class="theme-btn-swatch" :style="{ background: t.bg, color: t.fg }">
                    <div class="theme-btn-dots">
                      <span class="dot" :style="{ background: t.fg }"></span>
                      <span class="dot" :style="{ background: t.fg, opacity: '0.5' }"></span>
                      <span class="dot" :style="{ background: t.fg, opacity: '0.25' }"></span>
                    </div>
                    <span style="font-size:10px; opacity:0.8;">Aa</span>
                  </div>
                  <div class="theme-btn-label" :style="{ color: t.labelColor || '#555' }">{{ t.label }}</div>
                </button>
              </div>
            </div>

            <!-- 自訂色 -->
            <div v-if="systemFrameTextTheme === 'custom'" class="prop-group">
              <label>自訂文字顏色</label>
              <div class="color-input-group">
                <input v-model="systemFrameTextColor" type="color" class="prop-color" @input="updateSystemFrameTheme" />
                <input v-model="systemFrameTextColor" type="text" class="prop-input color-text" placeholder="#333333" @input="updateSystemFrameTheme" />
              </div>
            </div>

            <!-- 預覽說明 -->
            <div class="theme-preview-hint">
              <span class="hint-icon">💡</span>
              <p>主題會套用到此框架內所有標題、內文、卡片背景等文字元素。</p>
            </div>
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
              <div v-if="isUploadingLogo" class="uploading-state"><div class="spinner"></div><span>上傳中...</span></div>
              <img v-else-if="localLogoSrc" :src="localLogoSrc" :alt="selectedElement.frame?.data?.temple_name || 'Logo'" class="preview-image logo-preview" @error="handleLogoImageError" />
              <div v-else class="no-image"><span>尚未上傳 Logo</span></div>
              <button @click="handleUploadLogo" class="upload-btn" :disabled="isUploadingLogo">
                <template v-if="isUploadingLogo">上傳中...</template>
                <template v-else>{{ localLogoSrc ? '更換 Logo' : '上傳 Logo' }}</template>
              </button>
            </div>
          </div>
        </template>

        <!-- TEXT 元件 -->
        <template v-else-if="selectedElement.element?.type === 'TEXT'">
          <h4 class="section-title">文字設定</h4>
          <div class="prop-group">
            <label>文字內容</label>
            <!-- 捐款區的標題/內文是純文字，不用富文字編輯器 -->
            <template v-if="selectedElement.element?.id === 'donationTitle'">
              <input v-model="selectedElement.element.value.text" type="text" class="prop-input" placeholder="輸入標題" />
            </template>
            <template v-else-if="selectedElement.element?.id === 'donationBrief'">
              <textarea v-model="selectedElement.element.value.text" class="prop-textarea" rows="4" placeholder="輸入內文"></textarea>
            </template>
            <template v-else>
              <RichTextEditor v-model="selectedElement.element.value.text" />
            </template>
          </div>
          <div class="metadata-section">
            <h5 class="subsection-title">樣式設定</h5>
            <div class="prop-group">
              <label>文字顏色</label>
              <div class="color-input-group">
                <input v-model="elementMetadata.color" type="color" class="prop-color" @input="updateMetadata" />
                <input v-model="elementMetadata.color" type="text" class="prop-input color-text" placeholder="#000000" @input="updateMetadata" />
                <button @click="elementMetadata.color = null; updateMetadata()" class="clear-btn" title="清除">✕</button>
              </div>
            </div>
            <div class="prop-group">
              <label>字體大小</label>
              <div class="font-size-row">
                <input v-model="elementMetadata.fontSize" type="text" class="prop-input font-size-input" placeholder="16" @input="updateMetadata" />
                <div class="font-size-presets">
                  <button @click="elementMetadata.fontSize = '12'; updateMetadata()" class="preset-btn" :class="{ active: elementMetadata.fontSize === '12' }">小</button>
                  <button @click="elementMetadata.fontSize = '16'; updateMetadata()" class="preset-btn" :class="{ active: elementMetadata.fontSize === '16' }">中</button>
                  <button @click="elementMetadata.fontSize = '24'; updateMetadata()" class="preset-btn" :class="{ active: elementMetadata.fontSize === '24' }">大</button>
                  <button @click="elementMetadata.fontSize = '36'; updateMetadata()" class="preset-btn" :class="{ active: elementMetadata.fontSize === '36' }">超大</button>
                </div>
              </div>
            </div>
            <div class="prop-group">
              <label>字體粗細 <span class="label-value">{{ elementMetadata.fontWeight ?? '預設' }}</span></label>
              <input v-model.number="elementMetadata.fontWeight" type="range" min="300" max="900" step="100" class="prop-slider" @input="updateMetadata" />
              <div class="font-weight-labels">
                <span>300</span><span>400</span><span>500</span><span>600</span><span>700</span><span>800</span><span>900</span>
              </div>
            </div>
            <div class="prop-group">
              <label>文字對齊</label>
              <div class="align-buttons">
                <button @click="elementMetadata.textAlign = 'left'; updateMetadata()" class="align-btn" :class="{ active: elementMetadata.textAlign === 'left' }">靠左</button>
                <button @click="elementMetadata.textAlign = 'center'; updateMetadata()" class="align-btn" :class="{ active: elementMetadata.textAlign === 'center' }">置中</button>
                <button @click="elementMetadata.textAlign = 'right'; updateMetadata()" class="align-btn" :class="{ active: elementMetadata.textAlign === 'right' }">靠右</button>
                <button @click="elementMetadata.textAlign = null; updateMetadata()" class="align-btn clear">✕</button>
              </div>
            </div>
            <div class="prop-group">
              <label>背景顏色</label>
              <div class="color-input-group">
                <input v-model="elementMetadata.backgroundColor" type="color" class="prop-color" @input="updateMetadata" />
                <input v-model="elementMetadata.backgroundColor" type="text" class="prop-input color-text" placeholder="transparent" @input="updateMetadata" />
                <button @click="elementMetadata.backgroundColor = null; updateMetadata()" class="clear-btn" title="清除">✕</button>
              </div>
            </div>
          </div>
          <div class="padding-section">
            <h5 class="subsection-title">元件間距</h5>
            <div class="padding-controls">
              <div class="padding-visual"><div class="padding-box">
                <div class="padding-input-group top"><label>上</label><input v-model.number="elementPadding.top" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                <div class="padding-sides">
                  <div class="padding-input-group left"><label>左</label><input v-model.number="elementPadding.left" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                  <div class="content-preview">內容區域</div>
                  <div class="padding-input-group right"><label>右</label><input v-model.number="elementPadding.right" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                </div>
                <div class="padding-input-group bottom"><label>下</label><input v-model.number="elementPadding.bottom" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
              </div></div>
              <div class="padding-presets">
                <button @click="setElementPadding(0)" class="preset-btn">無間距</button>
                <button @click="setElementPadding(10)" class="preset-btn">小</button>
                <button @click="setElementPadding(20)" class="preset-btn">中</button>
                <button @click="setElementPadding(40)" class="preset-btn">大</button>
              </div>
            </div>
          </div>
          <div class="width-section">
            <h5 class="subsection-title">元件寬度</h5>
            <div class="prop-group">
              <label>最大寬度</label>
              <div class="input-with-suffix">
                <input v-model="elementWidth" type="number" class="prop-input" placeholder="100" min="1" max="100" @input="updateElementWidthDebounced" />
                <span class="input-suffix">%</span>
              </div>
            </div>
            <div class="width-presets">
              <button @click="setElementWidth('50')" class="preset-btn">半寬</button>
              <button @click="setElementWidth('80')" class="preset-btn">窄</button>
              <button @click="setElementWidth('100')" class="preset-btn">全寬</button>
            </div>
          </div>
        </template>

        <!-- IMG 元件 -->
        <template v-else-if="selectedElement.element?.type === 'IMG'">
          <h4 class="section-title">圖片設定</h4>
          <div class="prop-group">
            <label>圖片</label>
            <div class="image-upload">
              <div v-if="isUploadingImage" class="uploading-state"><div class="spinner"></div><span>上傳中...</span></div>
              <img v-else-if="selectedElement.element.value?.src" :src="selectedElement.element.value.src" alt="圖片預覽" class="preview-image" />
              <div v-else class="no-image"><span>尚未上傳圖片</span></div>
              <button @click="handleUploadImage" class="upload-btn" :disabled="isUploadingImage">
                <template v-if="isUploadingImage">上傳中...</template>
                <template v-else>{{ selectedElement.element.value?.src ? '更換圖片' : '上傳圖片' }}</template>
              </button>
            </div>
          </div>
          <div class="metadata-section">
            <h5 class="subsection-title">樣式設定</h5>
            <div class="prop-group">
              <label>圖片對齊</label>
              <div class="align-buttons">
                <button @click="elementMetadata.textAlign = 'left'; updateMetadata()" class="align-btn" :class="{ active: elementMetadata.textAlign === 'left' }">靠左</button>
                <button @click="elementMetadata.textAlign = 'center'; updateMetadata()" class="align-btn" :class="{ active: elementMetadata.textAlign === 'center' }">置中</button>
                <button @click="elementMetadata.textAlign = 'right'; updateMetadata()" class="align-btn" :class="{ active: elementMetadata.textAlign === 'right' }">靠右</button>
                <button @click="elementMetadata.textAlign = null; updateMetadata()" class="align-btn clear">✕</button>
              </div>
            </div>
            <div class="prop-group">
              <label>寬度</label>
              <div class="input-with-suffix">
                <input v-model="imgWidth" type="number" class="prop-input" placeholder="500" min="1" @input="updateImgSize" />
                <span class="input-suffix">px</span>
              </div>
            </div>
            <div class="prop-group">
              <label>高度</label>
              <div class="input-with-suffix">
                <input v-model="imgHeight" type="number" class="prop-input" placeholder="auto" min="1" @input="updateImgSize" />
                <span class="input-suffix">px</span>
              </div>
              <span class="unit-hint">留空則為 auto</span>
            </div>
          </div>
          <div class="padding-section">
            <h5 class="subsection-title">元件間距</h5>
            <div class="padding-controls">
              <div class="padding-visual"><div class="padding-box">
                <div class="padding-input-group top"><label>上</label><input v-model.number="elementPadding.top" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                <div class="padding-sides">
                  <div class="padding-input-group left"><label>左</label><input v-model.number="elementPadding.left" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                  <div class="content-preview">內容區域</div>
                  <div class="padding-input-group right"><label>右</label><input v-model.number="elementPadding.right" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                </div>
                <div class="padding-input-group bottom"><label>下</label><input v-model.number="elementPadding.bottom" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
              </div></div>
              <div class="padding-presets">
                <button @click="setElementPadding(0)" class="preset-btn">無間距</button>
                <button @click="setElementPadding(10)" class="preset-btn">小</button>
                <button @click="setElementPadding(20)" class="preset-btn">中</button>
                <button @click="setElementPadding(40)" class="preset-btn">大</button>
              </div>
            </div>
          </div>
          <div class="width-section">
            <h5 class="subsection-title">元件寬度</h5>
            <div class="prop-group">
              <label>最大寬度</label>
              <div class="input-with-suffix">
                <input v-model="elementWidth" type="number" class="prop-input" placeholder="100" min="1" max="100" @input="updateElementWidthDebounced" />
                <span class="input-suffix">%</span>
              </div>
            </div>
            <div class="width-presets">
              <button @click="setElementWidth('50')" class="preset-btn">半寬</button>
              <button @click="setElementWidth('80')" class="preset-btn">窄</button>
              <button @click="setElementWidth('100')" class="preset-btn">全寬</button>
            </div>
          </div>
        </template>

        <!-- BUTTON 元件 -->
        <template v-else-if="selectedElement.element?.type === 'BUTTON'">
          <h4 class="section-title">按鈕設定</h4>
          <div class="prop-group"><label>按鈕文字</label><input v-model="selectedElement.element.value.text" type="text" class="prop-input" placeholder="輸入按鈕文字" /></div>
          <div class="prop-group"><label>連結網址</label><input v-model="selectedElement.element.value.url" type="text" class="prop-input" placeholder="輸入連結 (例如: https://example.com)" /></div>
          <div class="metadata-section">
            <h5 class="subsection-title">樣式設定</h5>
            <div class="prop-group">
              <label>文字顏色</label>
              <div class="color-input-group">
                <input v-model="elementMetadata.color" type="color" class="prop-color" @input="updateMetadata" />
                <input v-model="elementMetadata.color" type="text" class="prop-input color-text" placeholder="#ffffff" @input="updateMetadata" />
                <button @click="elementMetadata.color = null; updateMetadata()" class="clear-btn" title="清除">✕</button>
              </div>
            </div>
            <div class="prop-group">
              <label>背景顏色</label>
              <div class="color-input-group">
                <input v-model="elementMetadata.backgroundColor" type="color" class="prop-color" @input="updateMetadata" />
                <input v-model="elementMetadata.backgroundColor" type="text" class="prop-input color-text" placeholder="#E8572A" @input="updateMetadata" />
                <button @click="elementMetadata.backgroundColor = null; updateMetadata()" class="clear-btn" title="清除">✕</button>
              </div>
            </div>
            <div class="prop-group">
              <label>字體大小</label>
              <div class="font-size-row">
                <input v-model="elementMetadata.fontSize" type="text" class="prop-input font-size-input" placeholder="16" @input="updateMetadata" />
                <div class="font-size-presets">
                  <button @click="elementMetadata.fontSize = '12'; updateMetadata()" class="preset-btn" :class="{ active: elementMetadata.fontSize === '12' }">小</button>
                  <button @click="elementMetadata.fontSize = '16'; updateMetadata()" class="preset-btn" :class="{ active: elementMetadata.fontSize === '16' }">中</button>
                  <button @click="elementMetadata.fontSize = '24'; updateMetadata()" class="preset-btn" :class="{ active: elementMetadata.fontSize === '24' }">大</button>
                  <button @click="elementMetadata.fontSize = '36'; updateMetadata()" class="preset-btn" :class="{ active: elementMetadata.fontSize === '36' }">超大</button>
                </div>
              </div>
            </div>
            <div class="prop-group">
              <label>字體粗細 <span class="label-value">{{ elementMetadata.fontWeight ?? '預設' }}</span></label>
              <input v-model.number="elementMetadata.fontWeight" type="range" min="300" max="900" step="100" class="prop-slider" @input="updateMetadata" />
              <div class="font-weight-labels">
                <span>300</span><span>400</span><span>500</span><span>600</span><span>700</span><span>800</span><span>900</span>
              </div>
            </div>
          </div>
          <div class="padding-section">
            <h5 class="subsection-title">元件間距</h5>
            <div class="padding-controls">
              <div class="padding-visual"><div class="padding-box">
                <div class="padding-input-group top"><label>上</label><input v-model.number="elementPadding.top" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                <div class="padding-sides">
                  <div class="padding-input-group left"><label>左</label><input v-model.number="elementPadding.left" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                  <div class="content-preview">內容區域</div>
                  <div class="padding-input-group right"><label>右</label><input v-model.number="elementPadding.right" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                </div>
                <div class="padding-input-group bottom"><label>下</label><input v-model.number="elementPadding.bottom" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
              </div></div>
              <div class="padding-presets">
                <button @click="setElementPadding(0)" class="preset-btn">無間距</button>
                <button @click="setElementPadding(10)" class="preset-btn">小</button>
                <button @click="setElementPadding(20)" class="preset-btn">中</button>
                <button @click="setElementPadding(40)" class="preset-btn">大</button>
              </div>
            </div>
          </div>
          <div class="width-section">
            <h5 class="subsection-title">元件寬度</h5>
            <div class="prop-group">
              <label>最大寬度</label>
              <div class="input-with-suffix">
                <input v-model="elementWidth" type="number" class="prop-input" placeholder="100" min="1" max="100" @input="updateElementWidthDebounced" />
                <span class="input-suffix">%</span>
              </div>
            </div>
            <div class="width-presets">
              <button @click="setElementWidth('50')" class="preset-btn">半寬</button>
              <button @click="setElementWidth('80')" class="preset-btn">窄</button>
              <button @click="setElementWidth('100')" class="preset-btn">全寬</button>
            </div>
          </div>
        </template>

        <!-- HORIZON_LINE 元件 -->
        <template v-else-if="selectedElement.element?.type === 'HORIZON_LINE'">
          <h4 class="section-title">水平線設定</h4>
          <div class="prop-group"><label>顏色</label><input v-model="selectedElement.element.value.color" type="color" class="prop-color" /></div>
          <div class="prop-group"><label>粗細</label><input v-model="selectedElement.element.value.thickness" type="text" class="prop-input" placeholder="" /></div>
          <div class="padding-section">
            <h5 class="subsection-title">元件間距</h5>
            <div class="padding-controls">
              <div class="padding-visual"><div class="padding-box">
                <div class="padding-input-group top"><label>上</label><input v-model.number="elementPadding.top" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                <div class="padding-sides">
                  <div class="padding-input-group left"><label>左</label><input v-model.number="elementPadding.left" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                  <div class="content-preview">內容區域</div>
                  <div class="padding-input-group right"><label>右</label><input v-model.number="elementPadding.right" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                </div>
                <div class="padding-input-group bottom"><label>下</label><input v-model.number="elementPadding.bottom" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
              </div></div>
              <div class="padding-presets">
                <button @click="setElementPadding(0)" class="preset-btn">無間距</button>
                <button @click="setElementPadding(10)" class="preset-btn">小</button>
                <button @click="setElementPadding(20)" class="preset-btn">中</button>
                <button @click="setElementPadding(40)" class="preset-btn">大</button>
              </div>
            </div>
          </div>
          <div class="width-section">
            <h5 class="subsection-title">元件寬度</h5>
            <div class="prop-group"><label>最大寬度</label><div class="input-with-suffix"><input v-model="elementWidth" type="number" class="prop-input" placeholder="100" min="1" max="100" @input="updateElementWidthDebounced" /><span class="input-suffix">%</span></div></div>
            <div class="width-presets"><button @click="setElementWidth('50')" class="preset-btn">半寬</button><button @click="setElementWidth('80')" class="preset-btn">窄</button><button @click="setElementWidth('100')" class="preset-btn">全寬</button></div>
          </div>
        </template>

        <!-- VERTICAL_LINE 元件 -->
        <template v-else-if="selectedElement.element?.type === 'VERTICAL_LINE'">
          <h4 class="section-title">垂直線設定</h4>
          <div class="prop-group"><label>顏色</label><input v-model="selectedElement.element.value.color" type="color" class="prop-color" /></div>
          <div class="prop-group"><label>粗細</label><input v-model="selectedElement.element.value.thickness" type="text" class="prop-input" placeholder="2（）" /></div>
          <div class="padding-section">
            <h5 class="subsection-title">元件間距</h5>
            <div class="padding-controls">
              <div class="padding-visual"><div class="padding-box">
                <div class="padding-input-group top"><label>上</label><input v-model.number="elementPadding.top" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                <div class="padding-sides">
                  <div class="padding-input-group left"><label>左</label><input v-model.number="elementPadding.left" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                  <div class="content-preview">內容區域</div>
                  <div class="padding-input-group right"><label>右</label><input v-model.number="elementPadding.right" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                </div>
                <div class="padding-input-group bottom"><label>下</label><input v-model.number="elementPadding.bottom" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
              </div></div>
              <div class="padding-presets">
                <button @click="setElementPadding(0)" class="preset-btn">無間距</button>
                <button @click="setElementPadding(10)" class="preset-btn">小</button>
                <button @click="setElementPadding(20)" class="preset-btn">中</button>
                <button @click="setElementPadding(40)" class="preset-btn">大</button>
              </div>
            </div>
          </div>
          <div class="width-section">
            <h5 class="subsection-title">元件寬度</h5>
            <div class="prop-group"><label>最大寬度</label><div class="input-with-suffix"><input v-model="elementWidth" type="number" class="prop-input" placeholder="100" min="1" max="100" @input="updateElementWidthDebounced" /><span class="input-suffix">%</span></div></div>
            <div class="width-presets"><button @click="setElementWidth('50')" class="preset-btn">半寬</button><button @click="setElementWidth('80')" class="preset-btn">窄</button><button @click="setElementWidth('100')" class="preset-btn">全寬</button></div>
          </div>
        </template>

        <!-- CAROUSEL 元件 -->
        <template v-else-if="selectedElement.element?.type === 'CAROUSEL_IMG'">
          <h4 class="section-title">輪播設定</h4>
          <div class="prop-group">
            <label>輪播高度</label>
            <div class="height-selector">
              <input v-model.number="carouselHeight" type="number" class="prop-input" min="200" max="800" step="50" @input="updateCarouselSettings" />
              <span class="unit">px</span>
            </div>
            <div class="height-presets">
              <button v-for="preset in heightPresets" :key="preset.value" @click="setCarouselHeight(preset.value)" class="preset-btn" :class="{ active: carouselHeight === preset.value }">{{ preset.label }}</button>
            </div>
          </div>
          <div class="prop-group">
            <label>輪播圖片 ({{ carouselImages.length }})</label>
            <div v-if="carouselImages.length > 0" class="carousel-images-list">
              <div
                v-for="(image, index) in carouselImages"
                :key="image.id || index"
                class="carousel-image-item"
                :class="{ 'drag-over': carouselDragOver === index }"
                draggable="true"
                @dragstart="onCarouselDragStart(index)"
                @dragover.prevent="carouselDragOver = index"
                @dragleave="carouselDragOver = null"
                @drop.prevent="onCarouselDrop(index)"
                @dragend="carouselDragOver = null"
              >
                <div class="drag-handle">⠿</div>
                <img :src="image.src || image" :alt="`圖片 ${index + 1}`" class="carousel-thumbnail" />
                <button @click="removeCarouselImage(index)" class="remove-image-btn" title="刪除圖片">✕</button>
              </div>
            </div>
            <button @click="addCarouselImage" class="upload-btn" :disabled="isUploadingCarousel">
              <template v-if="isUploadingCarousel"><span class="btn-spinner"></span>上傳中...</template>
              <template v-else>＋ 新增圖片</template>
            </button>
          </div>
          <div class="prop-group"><label class="checkbox-label"><input v-model="carouselAutoPlay" type="checkbox" @change="updateCarouselSettings" /><span>自動播放</span></label></div>
          <div class="prop-group" v-if="carouselAutoPlay"><label>播放間隔 (毫秒)</label><input v-model.number="carouselInterval" type="number" class="prop-input" min="1000" step="500" @input="updateCarouselSettings" /></div>
          <div class="padding-section">
            <h5 class="subsection-title">元件間距</h5>
            <div class="padding-controls">
              <div class="padding-visual"><div class="padding-box">
                <div class="padding-input-group top"><label>上</label><input v-model.number="elementPadding.top" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                <div class="padding-sides">
                  <div class="padding-input-group left"><label>左</label><input v-model.number="elementPadding.left" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                  <div class="content-preview">內容區域</div>
                  <div class="padding-input-group right"><label>右</label><input v-model.number="elementPadding.right" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                </div>
                <div class="padding-input-group bottom"><label>下</label><input v-model.number="elementPadding.bottom" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
              </div></div>
              <div class="padding-presets">
                <button @click="setElementPadding(0)" class="preset-btn">無間距</button>
                <button @click="setElementPadding(10)" class="preset-btn">小</button>
                <button @click="setElementPadding(20)" class="preset-btn">中</button>
                <button @click="setElementPadding(40)" class="preset-btn">大</button>
              </div>
            </div>
          </div>
          <div class="width-section">
            <h5 class="subsection-title">元件寬度</h5>
            <div class="prop-group"><label>最大寬度</label><div class="input-with-suffix"><input v-model="elementWidth" type="number" class="prop-input" placeholder="100" min="1" max="100" @input="updateElementWidthDebounced" /><span class="input-suffix">%</span></div></div>
            <div class="width-presets"><button @click="setElementWidth('50')" class="preset-btn">半寬</button><button @click="setElementWidth('80')" class="preset-btn">窄</button><button @click="setElementWidth('100')" class="preset-btn">全寬</button></div>
          </div>
        </template>

        <!-- GOOGLE_MAP 元件 -->
        <template v-else-if="selectedElement.element?.type === 'GOOGLE_MAP'">
          <h4 class="section-title">地圖設定</h4>
          <div class="prop-group"><label>地址</label><input v-model="mapAddress" type="text" class="prop-input" placeholder="輸入地址，例如：台北市信義區信義路五段7號" @input="updateMapData" /></div>
          <div class="prop-group"><label>緯度 (Latitude)</label><input v-model.number="mapLat" type="number" class="prop-input" placeholder="25.033" step="0.001" @input="updateMapData" /><span class="hint-text">台灣範圍約在 21.9 ~ 25.3</span></div>
          <div class="prop-group"><label>經度 (Longitude)</label><input v-model.number="mapLng" type="number" class="prop-input" placeholder="121.565" step="0.001" @input="updateMapData" /><span class="hint-text">台灣範圍約在 120.0 ~ 122.0</span></div>
          <div class="prop-group">
            <label>縮放級別 ({{ mapZoom }})</label>
            <input v-model.number="mapZoom" type="range" min="10" max="18" class="prop-slider" @input="updateMapData" />
            <div class="slider-labels"><span>遠</span><span>近</span></div>
          </div>
          <div class="zoom-presets">
            <button @click="setMapZoom(12)" class="preset-btn" :class="{ active: mapZoom === 12 }">城市</button>
            <button @click="setMapZoom(15)" class="preset-btn" :class="{ active: mapZoom === 15 }">街區</button>
            <button @click="setMapZoom(17)" class="preset-btn" :class="{ active: mapZoom === 17 }">建築</button>
          </div>
          <div class="padding-section">
            <h5 class="subsection-title">元件間距</h5>
            <div class="padding-controls">
              <div class="padding-visual"><div class="padding-box">
                <div class="padding-input-group top"><label>上</label><input v-model.number="elementPadding.top" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                <div class="padding-sides">
                  <div class="padding-input-group left"><label>左</label><input v-model.number="elementPadding.left" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                  <div class="content-preview">內容區域</div>
                  <div class="padding-input-group right"><label>右</label><input v-model.number="elementPadding.right" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                </div>
                <div class="padding-input-group bottom"><label>下</label><input v-model.number="elementPadding.bottom" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
              </div></div>
              <div class="padding-presets">
                <button @click="setElementPadding(0)" class="preset-btn">無間距</button>
                <button @click="setElementPadding(10)" class="preset-btn">小</button>
                <button @click="setElementPadding(20)" class="preset-btn">中</button>
                <button @click="setElementPadding(40)" class="preset-btn">大</button>
              </div>
            </div>
          </div>
          <div class="width-section">
            <h5 class="subsection-title">元件寬度</h5>
            <div class="prop-group"><label>最大寬度</label><div class="input-with-suffix"><input v-model="elementWidth" type="number" class="prop-input" placeholder="100" min="1" max="100" @input="updateElementWidthDebounced" /><span class="input-suffix">%</span></div></div>
            <div class="width-presets"><button @click="setElementWidth('50')" class="preset-btn">半寬</button><button @click="setElementWidth('80')" class="preset-btn">窄</button><button @click="setElementWidth('100')" class="preset-btn">全寬</button></div>
          </div>
        </template>

        <!-- 未知元件類型 -->
        <template v-else>
          <h4 class="section-title">元件資訊</h4>
          <div class="prop-group"><label>元件類型</label><input :value="selectedElement.element?.type || 'Unknown'" type="text" class="prop-input" disabled /></div>
        </template>
      </div>

      <!-- ✅ 選擇了空格子 -->
      <div v-else-if="selectedCell" class="props-section">
        <h4 class="section-title">空格子</h4>
        <div class="empty-cell-hint">
          <p>此格子尚未放置元件</p>
          <p class="hint">從左側拖曳元件至格子中</p>
        </div>
      </div>
    </div>

    </template><!-- end v-if="!isCollapsed" -->
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useRoute } from 'vue-router'
import RichTextEditor from './elements/RichTextEditor.vue'

const pageEditorStore = inject('pageEditorStore')
const route = useRoute()

const props = defineProps({
  selectedBasemap: { type: Object, default: null },
  selectedFrame: { type: Object, default: null },
  selectedElement: { type: Object, default: null },
  selectedCell: { type: Object, default: null }
})

const emit = defineEmits(['update-logo', 'update-cell-padding'])

// ==================== 收合狀態（新增）====================
const isCollapsed = ref(false)

// ==================== 工具函數 ====================

const ensureUnit = (value, defaultValue = '') => {
  if (value === null || value === undefined || value === '') return defaultValue
  if (typeof value === 'number') return value + 'px'
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return defaultValue
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return trimmed + 'px'
    return trimmed
  }
  return defaultValue
}

const stripPx = (value) => {
  if (!value) return ''
  const str = String(value).trim()
  if (/^-?\d+(\.\d+)?px$/.test(str)) return str.slice(0, -2)
  return str
}

const stripPercent = (value) => {
  if (!value) return '100'
  const str = String(value).trim()
  if (str.includes('%')) return str.replace('%', '')
  if (str === 'auto') return '100'
  return str
}

const normalizeFontWeight = (value) => {
  if (!value) return 400
  if (value === 'normal') return 400
  if (value === 'bold') return 700
  const n = parseInt(value)
  if (!isNaN(n)) return n
  return 400
}

// ==================== 響應式狀態 ====================

const logoAlt = ref('')
const logoWidth = ref('')
const logoHeight = ref('')
const isUploadingLogo = ref(false)
const localLogoSrc = ref(null)

const isUploadingImage = ref(false)
const isUploadingHeroBackground = ref(false)
const isUploadingCarousel = ref(false)

// computed 直接讀 props，任何欄位變動都能響應，且不重建陣列避免重渲染
const carouselWallImages = computed(() =>
  Array.isArray(props.selectedFrame?.data?.caroiselWallImgs)
    ? props.selectedFrame.data.caroiselWallImgs
    : []
)
const isUploadingCarouselWall = ref(false)
const carouselWallHeight = ref(600)
const carouselWallAutoPlay = ref(true)
const carouselWallInterval = ref(5000)
const expandedCardStyles = ref([])

const carouselImages = ref([])
const carouselAutoPlay = ref(true)
const carouselInterval = ref(3000)
const carouselHeight = ref(400)

const heroTitle = ref('')
const heroSubtitle = ref('')
const heroHeight = ref('600')
const overlayOpacity = ref(40)
const overlayColor = ref('#000000')
const textBoxBorderRadius = ref('12')
const titleColor = ref('#333333')
const titleFontSize = ref('48')
const subtitleColor = ref('#666666')
const subtitleFontSize = ref('20')

const elementPadding = ref({ top: 20, right: 20, bottom: 20, left: 20 })
const elementWidth = ref('100')

const elementMetadata = ref({
  color: null,
  fontSize: null,
  fontWeight: 400,
  textAlign: null,
  width: null,
  height: null,
  backgroundColor: null
})

const imageAlt = ref('')
const imgWidth = ref('')
const imgHeight = ref('')
const frameWidth = ref('1200')

// ==================== 頁尾樣式 ====================
const footerBgColor   = ref('#2d2d2d')
const footerTextColor = ref('#ffffff')

const updateFooterStyle = () => {
  if (!props.selectedFrame?.data) return
  props.selectedFrame.data.footerBgColor   = footerBgColor.value
  props.selectedFrame.data.footerTextColor = footerTextColor.value
}

// ==================== 捐款區樣式 ====================
const donationBgColorA = ref('#8b7355')
const donationBgColorB = ref('#a0826d')
const donationTextColor = ref('#ffffff')

const updateDonationStyle = () => {
  if (!props.selectedFrame?.data) return
  // 背景：若 B 有值就做漸層，否則純色
  const a = donationBgColorA.value || '#8b7355'
  const b = donationBgColorB.value?.trim()
  props.selectedFrame.data.donationBgColor = b
    ? `linear-gradient(135deg, ${a} 0%, ${b} 100%)`
    : a
  props.selectedFrame.data.donationTextColor = donationTextColor.value
}

// ==================== 系統框架文字主題 ====================
const systemFrameTextTheme = ref('light')
const systemFrameTextColor = ref('#333333')

const textThemeOptions = [
  { value: 'light',  label: '☀️ 亮版', bg: '#f8f8f8',                               fg: '#333333', labelColor: '#444' },
  { value: 'dark',   label: '🌙 暗版', bg: '#1a1a2e',                               fg: '#f0f0f0', labelColor: '#444' },
  { value: 'sepia',  label: '📜 復古', bg: '#fdf0dc',                               fg: '#4a3728', labelColor: '#7a5830' },
  { value: 'custom', label: '🎨 自訂', bg: 'linear-gradient(135deg,#ffe0d0,#ffd0f0)', fg: '#c04060', labelColor: '#c04060' },
]

const setSystemFrameTheme = (theme) => {
  systemFrameTextTheme.value = theme
  updateSystemFrameTheme()
}

const updateSystemFrameTheme = () => {
  if (!props.selectedFrame) return
  if (!props.selectedFrame.data) props.selectedFrame.data = {}
  props.selectedFrame.data.textTheme = systemFrameTextTheme.value
  if (systemFrameTextTheme.value === 'custom') {
    props.selectedFrame.data.textColor = systemFrameTextColor.value
  }
}
const mapAddress = ref('')
const mapLat = ref(25.033)
const mapLng = ref(121.565)
const mapZoom = ref(15)

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
  
  if (newVal?.element?.type === 'CAROUSEL_IMG') {
    const value = newVal.element.value || {}
    carouselImages.value = value.imgs || []
    carouselAutoPlay.value = value.autoPlay !== false
    carouselInterval.value = value.interval || 3000
    carouselHeight.value = value.height || 400
  }

  if (newVal?.element?.type === 'GOOGLE_MAP') {
    const value = newVal.element.value || {}
    mapAddress.value = value.address || ''
    mapLat.value = value.lat !== undefined ? value.lat : 25.033
    mapLng.value = value.lng !== undefined ? value.lng : 121.565
    mapZoom.value = value.zoom !== undefined ? value.zoom : 15
  }

  if (newVal?.element?.type === 'IMG') {
    imageAlt.value = newVal.element.value?.alt || ''
    imgWidth.value = stripPx(newVal.element.metadata?.width || '')
    imgHeight.value = stripPx(newVal.element.metadata?.height || '')
  } else {
    imageAlt.value = ''
    imgWidth.value = ''
    imgHeight.value = ''
  }

  if (newVal?.element?.metadata) {
    const m = newVal.element.metadata
    elementMetadata.value = {
      color: m.color || null,
      fontSize: stripPx(m.fontSize || m.font_size) || null,
      fontWeight: normalizeFontWeight(m.fontWeight || m.font_weight),
      textAlign: m.textAlign || m.text_align || null,
      width: m.width || null,
      height: m.height || null,
      backgroundColor: m.backgroundColor || m.background_color || null
    }
  } else {
    elementMetadata.value = {
      color: null, fontSize: null, fontWeight: 400,
      textAlign: null, width: null, height: null, backgroundColor: null
    }
  }

  elementPadding.value = newVal?.element?.padding
    ? { ...newVal.element.padding }
    : { top: 20, right: 20, bottom: 20, left: 20 }

  elementWidth.value = stripPercent(newVal?.element?.width || '100%')

}, { immediate: true, deep: true })

watch(() => props.selectedElement?.data, (newData) => {
  if (props.selectedElement?.type === 'logo' && newData) {
    console.log('✓ Logo data 變化檢測:', newData)
  }
}, { deep: true })

watch(
  () => props.selectedElement?.frame?.data?.logoImgSrc,
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
      localLogoSrc.value = props.selectedElement?.frame?.data?.logoImgSrc || null
    }
  },
  { immediate: true }
)

watch(() => props.selectedElement?.element?.value?.imgs, (newImgs) => {
  if (props.selectedElement?.element?.type === 'CAROUSEL_IMG' && newImgs) {
    carouselImages.value = [...newImgs]
  }
}, { deep: true })

// ==================== 監聽選中框架 ====================

watch(() => props.selectedFrame, (newVal) => {
  if (newVal?.type?.startsWith('FRAME')) {
    frameWidth.value = stripPx(newVal.metadata?.frameWidth || '1200px')
  }

  if (newVal?.type === 'FIRST_PICTURE' && newVal.data) {
    heroTitle.value = newVal.data.heroTitle || ''
    heroSubtitle.value = newVal.data.heroSubtitle || ''
    heroHeight.value = stripPx(newVal.data.heroHeight || '600px')
    overlayOpacity.value = newVal.data.overlayOpacity !== undefined ? newVal.data.overlayOpacity : 40
    overlayColor.value = newVal.data.overlayColor || '#000000'
    textBoxBorderRadius.value = stripPx(newVal.data.textBoxBorderRadius || '12px')
    titleColor.value = newVal.data.titleColor || '#333333'
    titleFontSize.value = stripPx(newVal.data.titleFontSize || '48px')
    subtitleColor.value = newVal.data.subtitleColor || '#666666'
    subtitleFontSize.value = stripPx(newVal.data.subtitleFontSize || '20px')
  }

  // 同步系統框架主題狀態
  if (newVal && !newVal.type?.startsWith('FRAME') &&
      newVal.type !== 'FIRST_PICTURE' && newVal.type !== 'CAROUSEL_WALL') {
    systemFrameTextTheme.value = newVal.data?.textTheme || 'light'
    systemFrameTextColor.value = newVal.data?.textColor || '#333333'
  }

  if (newVal?.type === 'CAROUSEL_WALL') {
    carouselWallHeight.value = newVal.data?.carouselWallHeight ?? 600
    carouselWallAutoPlay.value = newVal.data?.carouselWallAutoPlay ?? true
    carouselWallInterval.value = newVal.data?.carouselWallInterval ?? 5000
    // 注意：expandedCardStyles 不在這裡重置，避免 deep watch 每次 data 變動都清空
  }

  if (newVal?.type === 'FOOTER') {
    footerBgColor.value   = newVal.data?.footerBgColor   || '#2d2d2d'
    footerTextColor.value = newVal.data?.footerTextColor || '#ffffff'
  }

  if (newVal?.type === 'INDEX_DONATION') {
    const bg = newVal.data?.donationBgColor || 'linear-gradient(135deg, #8b7355 0%, #a0826d 100%)'
    const gradMatch = bg.match(/linear-gradient\([^,]+,\s*(#[\da-fA-F]+)[^,]*,\s*(#[\da-fA-F]+)/)
    if (gradMatch) {
      donationBgColorA.value = gradMatch[1]
      donationBgColorB.value = gradMatch[2]
    } else {
      donationBgColorA.value = bg.startsWith('#') ? bg : '#8b7355'
      donationBgColorB.value = ''
    }
    donationTextColor.value = newVal.data?.donationTextColor || '#ffffff'
  }

}, { immediate: true, deep: true })

// 只有在切換到不同 frame（物件參考改變）時，才重置展開狀態
watch(() => props.selectedFrame, () => {
  expandedCardStyles.value = []
})

// ==================== 框架寬度更新 ====================

const updateFrameWidth = () => {
  if (props.selectedFrame) {
    if (!props.selectedFrame.metadata) props.selectedFrame.metadata = {}
    props.selectedFrame.metadata.frameWidth = ensureUnit(frameWidth.value, '1200px')
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
    props.selectedElement.element.metadata = {
      ...elementMetadata.value,
      fontSize: ensureUnit(elementMetadata.value.fontSize, null),
      width: ensureUnit(elementMetadata.value.width, null),
      height: ensureUnit(elementMetadata.value.height, null),
    }
  }
}

const updateImageAlt = () => {
  if (props.selectedElement?.element?.type === 'IMG') {
    if (!props.selectedElement.element.value) props.selectedElement.element.value = {}
    props.selectedElement.element.value.alt = imageAlt.value
  }
}

const updateImgSize = () => {
  if (props.selectedElement?.element?.type !== 'IMG') return
  if (!props.selectedElement.element.metadata) props.selectedElement.element.metadata = {}
  props.selectedElement.element.metadata.width = imgWidth.value ? imgWidth.value + 'px' : null
  props.selectedElement.element.metadata.height = imgHeight.value ? imgHeight.value + 'px' : null
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

const debounce = (fn, delay) => {
  let timer = null
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

const updateElementWidth = () => {
  if (props.selectedElement?.element) {
    const raw = String(elementWidth.value).trim()
    const finalWidth = raw ? raw + '%' : '100%'
    props.selectedElement.element.width = finalWidth
    adjustSiblingCellsWidth()
  }
}

const updateElementWidthDebounced = debounce(updateElementWidth, 200)

const adjustSiblingCellsWidth = () => {
  const frame = props.selectedElement?.frame
  const cellIndex = props.selectedElement?.cellIndex
  if (!frame || cellIndex === undefined) return
  const frameType = frame.type
  if (!frameType) return

  let layout
  if (frameType.startsWith('FRAME')) {
    layout = frameType.replace(/^FRAME/, '').replace(/^[-_]/, '').replace(/-/g, '_')
  } else if (['A', 'B', 'C', 'D'].includes(frameType)) {
    layout = frameType
  } else {
    return
  }

  if (!frame.elements) frame.elements = []

  const currentWidth = parseFloat(elementWidth.value)
  if (isNaN(currentWidth) || currentWidth <= 0 || currentWidth >= 100) return

  const compositeMap = {
    'A': { leftCells: [0], rightCells: [1, 2] },
    'B': { leftCells: [0, 1], rightCells: [2] },
    'C': { leftCells: [0], rightCells: [1, 2, 3] },
    'D': { leftCells: [0, 1, 2], rightCells: [3] },
  }

  if (compositeMap[layout]) {
    const { leftCells, rightCells } = compositeMap[layout]
    const isLeft = leftCells.includes(cellIndex)
    const sameSideCells = isLeft ? leftCells : rightCells
    const otherSideCells = isLeft ? rightCells : leftCells

    const otherWidth = (100 - currentWidth).toFixed(1) + '%'
    const newWidth = currentWidth.toFixed(1) + '%'

    sameSideCells.forEach(idx => {
      if (idx !== cellIndex && frame.elements[idx]?.type) {
        frame.elements[idx].width = newWidth
      }
    })
    otherSideCells.forEach(idx => {
      if (frame.elements[idx]?.type) frame.elements[idx].width = otherWidth
    })
    return
  }

  const rowCells = getRowCells(layout, cellIndex)
  if (rowCells.length <= 1) return
  const remainingWidth = 100 - currentWidth
  const otherCellsCount = rowCells.length - 1
  const widthPerCell = remainingWidth / otherCellsCount
  rowCells.forEach(index => {
    if (index !== cellIndex && frame.elements[index]?.type) {
      frame.elements[index].width = widthPerCell.toFixed(1) + '%'
    }
  })
}

const getRowCells = (layout, currentIndex) => {
  switch (layout) {
    case '1_1': return [0]
    case '1_2': return [0, 1]
    case '1_3': return [0, 1, 2]
    case '1_4': return [0, 1, 2, 3]
    case '2_2': {
      const row = currentIndex < 2 ? 0 : 1
      const start = row * 2
      return [start, start + 1]
    }
    case '2_3': {
      const row = currentIndex < 3 ? 0 : 1
      const start = row * 3
      return [start, start + 1, start + 2]
    }
    case '2_4': {
      const row = currentIndex < 4 ? 0 : 1
      const start = row * 4
      return [start, start + 1, start + 2, start + 3]
    }
    case 'A': return currentIndex === 0 ? [0] : [1, 2]
    case 'B': return currentIndex === 2 ? [2] : [0, 1]
    case 'C': return currentIndex === 0 ? [0] : [1, 2, 3]
    case 'D': return currentIndex === 3 ? [3] : [0, 1, 2]
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
      pageEditorStore.markFileForDeletion(props.selectedElement?.frame?.data?.logoImgId)
      const uploadedFile = await pageEditorStore.uploadImage(file)
      if (!uploadedFile) { alert('Logo 上傳失敗，請稍後再試'); return }
      localLogoSrc.value = uploadedFile.fileUrl
      emit('update-logo', { id: uploadedFile.id, src: uploadedFile.fileUrl })
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
        props.selectedElement.element.value.src = uploadedFile.fileUrl
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
  input.multiple = true
  
  input.onchange = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    
    try {
      isUploadingCarousel.value = true
      if (!props.selectedElement.element.value) props.selectedElement.element.value = {}
      if (!props.selectedElement.element.value.imgs) props.selectedElement.element.value.imgs = []
      
      for (const file of files) {
        const uploadedFile = await pageEditorStore.uploadImage(file)
        if (!uploadedFile) continue
        props.selectedElement.element.value.imgs.push({ id: uploadedFile.id, src: uploadedFile.fileUrl })
      }
      
      carouselImages.value = [...props.selectedElement.element.value.imgs]
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
  const imgs = props.selectedElement?.element?.value?.imgs
  if (!imgs) return
  const removedImg = imgs[index]
  if (removedImg?.id) pageEditorStore.markFileForDeletion(removedImg.id)
  imgs.splice(index, 1)
  carouselImages.value = [...imgs]
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
    props.selectedFrame.data.heroTitle = heroTitle.value
    props.selectedFrame.data.heroSubtitle = heroSubtitle.value
    props.selectedFrame.data.heroHeight = ensureUnit(heroHeight.value, '600px')
    props.selectedFrame.data.overlayOpacity = overlayOpacity.value
    props.selectedFrame.data.overlayColor = overlayColor.value
    props.selectedFrame.data.textBoxBorderRadius = ensureUnit(textBoxBorderRadius.value, '12px')
    props.selectedFrame.data.titleColor = titleColor.value
    props.selectedFrame.data.titleFontSize = ensureUnit(titleFontSize.value, '48px')
    props.selectedFrame.data.subtitleColor = subtitleColor.value
    props.selectedFrame.data.subtitleFontSize = ensureUnit(subtitleFontSize.value, '20px')
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
      pageEditorStore.markFileForDeletion(props.selectedFrame?.data?.heroBgImgId)
      const uploadedFile = await pageEditorStore.uploadImage(file)
      if (!uploadedFile) { alert('首圖背景上傳失敗，請稍後再試'); return }
      if (props.selectedFrame?.data) {
        props.selectedFrame.data.heroBgImgId = uploadedFile.id
        props.selectedFrame.data.heroBgImgSrc = uploadedFile.fileUrl
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

// ==================== 輪播牆操作 ====================

const updateCarouselWallSettings = () => {
  if (props.selectedFrame?.data) {
    props.selectedFrame.data.carouselWallHeight = carouselWallHeight.value
    props.selectedFrame.data.carouselWallAutoPlay = carouselWallAutoPlay.value
    props.selectedFrame.data.carouselWallInterval = carouselWallInterval.value
  }
}

const setCarouselWallHeight = (height) => {
  carouselWallHeight.value = height
  updateCarouselWallSettings()
}

const handleUploadCarouselWall = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  
  input.onchange = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    
    try {
      isUploadingCarouselWall.value = true
      if (!props.selectedFrame.data) props.selectedFrame.data = {}
      if (!Array.isArray(props.selectedFrame.data.caroiselWallImgs)) {
        props.selectedFrame.data.caroiselWallImgs = []
      }

      for (const file of files) {
        const uploadedFile = await pageEditorStore.uploadImage(file)
        if (!uploadedFile) continue
        props.selectedFrame.data.caroiselWallImgs.push({ id: uploadedFile.id, src: uploadedFile.fileUrl })
      }
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
  const imgs = props.selectedFrame?.data?.caroiselWallImgs
  if (!imgs) return
  const removedImg = imgs[index]
  if (removedImg?.id) pageEditorStore.markFileForDeletion(removedImg.id)
  imgs.splice(index, 1)
}

const updateCarouselWallImageField = (index, field, value) => {
  const imgs = props.selectedFrame?.data?.caroiselWallImgs
  if (!imgs || !imgs[index]) return
  imgs[index][field] = value
}

const toggleCardStyle = (index) => {
  const pos = expandedCardStyles.value.indexOf(index)
  if (pos === -1) expandedCardStyles.value.push(index)
  else expandedCardStyles.value.splice(pos, 1)
}

// ==================== 輪播牆拖曳排序 ====================

const carouselWallDragOver = ref(null)
const carouselWallDragIndex = ref(null)

const onCarouselWallDragStart = (index) => {
  carouselWallDragIndex.value = index
}

const onCarouselWallDrop = (toIndex) => {
  const fromIndex = carouselWallDragIndex.value
  if (fromIndex === null || fromIndex === toIndex) return
  const imgs = props.selectedFrame?.data?.caroiselWallImgs
  if (!imgs) return
  const moved = imgs.splice(fromIndex, 1)[0]
  imgs.splice(toIndex, 0, moved)
  carouselWallDragIndex.value = null
  carouselWallDragOver.value = null
}

// ==================== 輪播元件拖曳排序 ====================

const carouselDragOver = ref(null)
const carouselDragIndex = ref(null)

const onCarouselDragStart = (index) => {
  carouselDragIndex.value = index
}

const onCarouselDrop = (toIndex) => {
  const fromIndex = carouselDragIndex.value
  if (fromIndex === null || fromIndex === toIndex) return
  const imgs = props.selectedElement?.element?.value?.imgs
  if (!imgs) return
  const moved = imgs.splice(fromIndex, 1)[0]
  imgs.splice(toIndex, 0, moved)
  carouselImages.value = [...imgs]
  carouselDragIndex.value = null
  carouselDragOver.value = null
}

// ==================== GOOGLE_MAP 元件操作 ====================

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
  position: relative; /* 新增 */
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1); /* 新增 */
}

/* ===== 新增：收合狀態 ===== */
.props-panel.is-collapsed {
  width: 36px;
}

/* ===== 新增：收合按鈕 ===== */
.collapse-btn {
  position: absolute;
  top: 50%;
  left: -22px;
  transform: translateY(-50%);
  z-index: 10;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #e5e5e5;
  background: #fff;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: all 0.2s;
  padding: 0;
  flex-shrink: 0;
}

.collapse-btn:hover {
  background: #E8572A;
  border-color: #E8572A;
  color: #fff;
  box-shadow: 0 4px 12px rgba(232, 87, 42, 0.3);
}

.collapse-icon {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: block;
}

/* PropsPanel 展開時箭頭朝右 (>)，收合後朝左 (<) */
.collapse-icon.is-flipped {
  transform: rotate(180deg);
}

/* ===== 新增：收合時垂直標題 ===== */
.collapsed-label {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  font-size: 13px;
  font-weight: 600;
  color: #999;
  letter-spacing: 2px;
  margin: auto;
  user-select: none;
  white-space: nowrap;
}

/* ===== 以下全部與原版相同，未做任何修改 ===== */
.panel-header {
  padding: 20px;
  border-bottom: 1px solid #e5e5e5;
  h3 { margin: 0; font-size: 16px; font-weight: 600; color: #333; }
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
  .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
  p { margin: 8px 0; font-size: 14px; }
  .hint { font-size: 12px; color: #bbb; }
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
  p { margin: 8px 0; font-size: 14px; }
  .hint { font-size: 12px; color: #bbb; }
}

.props-section { animation: fadeIn 0.2s; }

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

.metadata-section { margin-top: 24px; padding-top: 20px; border-top: 2px dashed #e5e5e5; }
.padding-section { margin-top: 24px; padding-top: 20px; border-top: 2px dashed #e5e5e5; }
.width-section { margin-top: 24px; padding-top: 20px; border-top: 2px dashed #e5e5e5; }

.prop-group {
  margin-bottom: 20px;
  label { display: block; margin-bottom: 8px; font-size: 13px; font-weight: 500; color: #666; }
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
  .unit-hint { display: block; margin-top: 4px; font-size: 11px; color: #999; }

.color-quick-btns {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-top: 10px;
}

// ==================== 文字色主題按鈕 ====================
.theme-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.theme-btn {
  padding: 0;
  border: 2px solid #e5e5e5;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  background: #fff;

  .theme-btn-swatch {
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .theme-btn-dots {
    display: flex;
    gap: 3px;
    align-items: center;
  }

  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
  }

  .theme-btn-label {
    padding: 6px 4px;
    font-size: 12px;
    font-weight: 600;
    background: rgba(0,0,0,0.04);
    border-top: 1px solid rgba(0,0,0,0.06);
    color: #555;
    white-space: nowrap;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: #ccc;
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }

  &.active {
    border-color: #E8572A;
    box-shadow: 0 0 0 3px rgba(232,87,42,0.15);

    .theme-btn-label {
      background: rgba(232,87,42,0.08);
      color: #E8572A;
    }
  }
}
.theme-preview-hint {
  margin-top: 12px;
  padding: 10px 12px;
  background: #fffbf5;
  border: 1px solid #f0e0c8;
  border-radius: 6px;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  p { margin: 0; font-size: 11px; color: #a07840; line-height: 1.6; }
  .hint-icon { flex-shrink: 0; font-size: 13px; margin-top: 1px; }
}
}

.input-with-suffix {
  display: flex;
  align-items: stretch;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: #E8572A;
  }

  .prop-input {
    border: none;
    border-radius: 0;
    flex: 1;
    min-width: 0;

    &:focus {
      border-color: transparent;
      box-shadow: none;
    }
  }

  .input-suffix {
    padding: 0 12px;
    background: #f5f5f5;
    color: #555;
    font-size: 13px;
    font-weight: 600;
    border-left: 1px solid #ddd;
    display: flex;
    align-items: center;
    user-select: none;
  }
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
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    &:hover { background: #e8e8e8; border-color: #ccc; }
    &.active { background: #E8572A; border-color: #E8572A; color: #fff; }
    &.clear { flex: 0 0 40px; font-size: 14px; color: #999; &:hover { background: #e8e8e8; color: #666; } }
  }
}

.image-upload { display: flex; flex-direction: column; gap: 12px; }

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

.width-presets {
  grid-template-columns: repeat(3, 1fr);
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

// 輪播牆圖片卡片（垂直列表，帶標題/副標題輸入）
.carousel-images-list-vertical {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.carousel-image-card {
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s;
  background: #fafafa;
  &:hover { border-color: #E8572A; }
  &.drag-over { border-color: #E8572A; border-style: dashed; opacity: 0.7; }
}

.card-image-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: #f0f0f0;
  border-bottom: 1px solid #e5e5e5;
  cursor: grab;
  &:active { cursor: grabbing; }
}

.card-drag {
  position: static;
  opacity: 1;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  font-size: 16px;
  background: rgba(0,0,0,0.15);
  &:hover { opacity: 1; }
}

.card-thumbnail {
  width: 56px;
  height: 36px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
  border: 1px solid #ddd;
}

.card-index {
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  color: #555;
}

.card-remove {
  position: static;
  opacity: 1;
  flex-shrink: 0;
  &:hover { background: #dc2626; transform: scale(1.1); }
}

.card-field {
  padding: 8px 10px 6px;
  border-bottom: 1px solid #ebebeb;
  &:last-child { border-bottom: none; }
}

.card-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #888;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-input {
  font-size: 12px !important;
  padding: 6px 8px !important;
}

.card-textarea {
  font-size: 12px !important;
  padding: 6px 8px !important;
  resize: none;
}

.card-style-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: #f0f0f0;
  padding: 8px 10px !important;
  user-select: none;
  &:hover { background: #e8e8e8; }
  .card-label { margin: 0; color: #555; }
}

.card-toggle-icon {
  font-size: 10px;
  color: #888;
}

.card-slider {
  width: 100%;
}

.carousel-image-item {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid #ddd;
  transition: border-color 0.2s;
  cursor: grab;
  &:hover { border-color: #E8572A; .remove-image-btn { opacity: 1; } .drag-handle { opacity: 1; } }
  &.drag-over { border-color: #E8572A; border-style: dashed; opacity: 0.6; }
  &:active { cursor: grabbing; }
}

.drag-handle {
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 2;
  width: 22px;
  height: 22px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.2s;
  cursor: grab;
  user-select: none;
}

.carousel-thumbnail { width: 100%; height: 100%; object-fit: cover; display: block; }

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

.padding-controls { display: flex; flex-direction: column; gap: 20px; }

.padding-visual {
  background: #f9f9f9;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 20px;
}

.padding-box { display: flex; flex-direction: column; gap: 12px; }

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

.padding-sides { display: flex; align-items: center; gap: 12px; }

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

.font-weight-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  span { font-size: 11px; color: #999; }
}

.label-value {
  font-weight: normal;
  color: #E8572A;
  font-size: 12px;
  margin-left: 6px;
}

.font-size-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
  .font-size-input { width: 70px; flex-shrink: 0; }
  .font-size-presets {
    display: flex;
    gap: 4px;
    flex: 1;
    .preset-btn { flex: 1; padding: 8px 2px; font-size: 12px; }
  }
}

.unit-hint { display: block; margin-top: 4px; font-size: 11px; color: #999; }

.color-quick-btns {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-top: 10px;
}
</style>
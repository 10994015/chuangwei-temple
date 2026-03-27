<template>
  <div class="props-panel" :class="{ 'is-collapsed': isCollapsed }">

    <button class="collapse-btn" @click="isCollapsed = !isCollapsed" :title="isCollapsed ? t('propsPanel.expand') : t('propsPanel.collapse')">
      <svg class="collapse-icon" :class="{ 'is-flipped': isCollapsed }"
        width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2.5"
        stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>

    <div v-if="isCollapsed" class="collapsed-label">{{ t('propsPanel.panelTitle') }}</div>

    <template v-if="!isCollapsed">

    <div class="panel-header">
      <h3>{{ t('propsPanel.panelTitle') }}</h3>
    </div>

    <div class="panel-body">
      <div v-if="!selectedBasemap && !selectedFrame && !selectedElement && !selectedCell" class="empty-state">
        <div class="empty-icon">⚙️</div>
        <p>{{ t('propsPanel.emptyHint') }}</p>
        <p class="hint">{{ t('propsPanel.emptyHintSub') }}</p>
      </div>

      <div v-else-if="selectedBasemap" class="props-section">
        <h4 class="section-title">{{ t('propsPanel.basemapSettings') }}</h4>
        <div class="prop-group">
          <label>{{ t('propsPanel.basemapType') }}</label>
          <input :value="selectedBasemap.bgType" type="text" class="prop-input" disabled />
        </div>
      </div>

      <div v-else-if="selectedFrame" class="props-section">

        <template v-if="selectedFrame.type && selectedFrame.type.startsWith('FRAME')">
          <h4 class="section-title">{{ t('propsPanel.customFrameSettings') }}</h4>
          <div class="prop-group">
            <label>{{ t('propsPanel.frameType') }}</label>
            <input :value="selectedFrame.type" type="text" class="prop-input" disabled />
          </div>
          <div class="metadata-section">
            <h5 class="subsection-title">{{ t('propsPanel.frameWidthSection') }}</h5>
            <div class="prop-group">
              <label>{{ t('propsPanel.maxWidth') }}</label>
              <div class="input-with-unit">
                <input v-model="frameWidth" type="text" class="prop-input" placeholder="1200（）" @input="updateFrameWidth" />
              </div>
            </div>
            <div class="width-presets">
              <button @click="setFrameWidth('900')" class="preset-btn">{{ t('propsPanel.presetNarrow') }}</button>
              <button @click="setFrameWidth('1200')" class="preset-btn">{{ t('propsPanel.presetMedium') }}</button>
              <button @click="setFrameWidth('1400')" class="preset-btn">{{ t('propsPanel.presetWide') }}</button>
              <button @click="setFrameWidth('100%')" class="preset-btn">{{ t('propsPanel.presetFull') }}</button>
            </div>
          </div>
        </template>

        <template v-else-if="selectedFrame.type === 'FIRST_PICTURE'">
          <h4 class="section-title">{{ t('propsPanel.heroSettings') }}</h4>
          <div class="prop-group">
            <label>{{ t('propsPanel.bgImage') }}</label>
            <div class="image-upload">
              <div v-if="isUploadingHeroBackground" class="uploading-state">
                <div class="spinner"></div>
                <span>{{ t('propsPanel.uploading') }}</span>
              </div>
              <img v-else-if="selectedFrame.data?.heroBgImgSrc" :src="selectedFrame.data.heroBgImgSrc" :alt="t('propsPanel.bgPreviewAlt')" class="preview-image" />
              <div v-else class="no-image"><span>{{ t('propsPanel.noBgImage') }}</span></div>
              <button @click="handleUploadHeroBackground" class="upload-btn" :disabled="isUploadingHeroBackground">
                <template v-if="isUploadingHeroBackground">{{ t('propsPanel.uploading') }}</template>
                <template v-else>{{ selectedFrame.data?.heroBgImgSrc ? t('propsPanel.changeBg') : t('propsPanel.uploadBg') }}</template>
              </button>
            </div>
          </div>
          <div class="prop-group">
            <label>{{ t('propsPanel.titleLabel') }}</label>
            <input v-model="heroTitle" type="text" class="prop-input" :placeholder="t('propsPanel.titlePlaceholder')" @input="updateHeroData" />
          </div>
          <div class="prop-group">
            <label>{{ t('propsPanel.subtitleLabel') }}</label>
            <textarea v-model="heroSubtitle" class="prop-textarea" rows="3" :placeholder="t('propsPanel.subtitlePlaceholder')" @input="updateHeroData"></textarea>
          </div>
          <div class="metadata-section">
            <h5 class="subsection-title">{{ t('propsPanel.styleSettings') }}</h5>
            <div class="prop-group">
              <label>{{ t('propsPanel.heroHeight') }}</label>
              <div class="height-selector">
                <input v-model="heroHeight" type="text" class="prop-input" placeholder="600（）" @input="updateHeroData" />
              </div>
              <div class="height-presets">
                <button @click="setHeroHeight('500')" class="preset-btn">{{ t('propsPanel.sizeSmall') }}</button>
                <button @click="setHeroHeight('600')" class="preset-btn">{{ t('propsPanel.sizeMedium') }}</button>
                <button @click="setHeroHeight('700')" class="preset-btn">{{ t('propsPanel.sizeLarge') }}</button>
                <button @click="setHeroHeight('100vh')" class="preset-btn">{{ t('propsPanel.sizeFullscreen') }}</button>
              </div>
            </div>
            <div class="prop-group">
              <label>{{ t('propsPanel.overlayOpacityLabel', { n: overlayOpacity }) }}</label>
              <input v-model.number="overlayOpacity" type="range" min="0" max="100" class="prop-slider" @input="updateHeroData" />
              <div class="slider-labels"><span>{{ t('propsPanel.transparent') }}</span><span>{{ t('propsPanel.opaque') }}</span></div>
            </div>
            <div class="prop-group">
              <label>{{ t('propsPanel.overlayColor') }}</label>
              <div class="color-input-group">
                <input v-model="overlayColor" type="color" class="prop-color" @input="updateHeroData" />
                <input v-model="overlayColor" type="text" class="prop-input color-text" placeholder="#000000" @input="updateHeroData" />
              </div>
            </div>
            <div class="prop-group">
              <label>{{ t('propsPanel.textBoxRadius') }}</label>
              <div class="input-with-unit">
                <input v-model="textBoxBorderRadius" type="text" class="prop-input" placeholder="12（）" @input="updateHeroData" />
              </div>
            </div>
            <div class="prop-group">
              <label>{{ t('propsPanel.titleColor') }}</label>
              <div class="color-input-group">
                <input v-model="titleColor" type="color" class="prop-color" @input="updateHeroData" />
                <input v-model="titleColor" type="text" class="prop-input color-text" placeholder="#333333" @input="updateHeroData" />
              </div>
            </div>
            <div class="prop-group">
              <label>{{ t('propsPanel.titleFontSize') }}</label>
              <div class="input-with-unit">
                <input v-model="titleFontSize" type="text" class="prop-input" placeholder="48（）" @input="updateHeroData" />
              </div>
            </div>
            <div class="prop-group">
              <label>{{ t('propsPanel.subtitleColor') }}</label>
              <div class="color-input-group">
                <input v-model="subtitleColor" type="color" class="prop-color" @input="updateHeroData" />
                <input v-model="subtitleColor" type="text" class="prop-input color-text" placeholder="#666666" @input="updateHeroData" />
              </div>
            </div>
            <div class="prop-group">
              <label>{{ t('propsPanel.subtitleFontSize') }}</label>
              <div class="input-with-unit">
                <input v-model="subtitleFontSize" type="text" class="prop-input" placeholder="20（）" @input="updateHeroData" />
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="selectedFrame.type === 'CAROUSEL_WALL'">
          <h4 class="section-title">{{ t('propsPanel.carouselWallSettings') }}</h4>
          <div class="prop-group">
            <label>{{ t('propsPanel.carouselHeight') }}</label>
            <div class="height-selector">
              <input v-model.number="carouselWallHeight" type="number" class="prop-input" min="200" max="1000" step="50" @input="updateCarouselWallSettings" />
              <span class="unit">px</span>
            </div>
            <div class="height-presets">
              <button @click="setCarouselWallHeight(400)" class="preset-btn" :class="{ active: carouselWallHeight === 400 }">{{ t('propsPanel.sizeSmall') }}</button>
              <button @click="setCarouselWallHeight(600)" class="preset-btn" :class="{ active: carouselWallHeight === 600 }">{{ t('propsPanel.sizeMedium') }}</button>
              <button @click="setCarouselWallHeight(800)" class="preset-btn" :class="{ active: carouselWallHeight === 800 }">{{ t('propsPanel.sizeLarge') }}</button>
              <button @click="setCarouselWallHeight(1000)" class="preset-btn" :class="{ active: carouselWallHeight === 1000 }">{{ t('propsPanel.sizeXL') }}</button>
            </div>
          </div>
          <div class="prop-group">
            <label class="checkbox-label">
              <input v-model="carouselWallAutoPlay" type="checkbox" @change="updateCarouselWallSettings" />
              <span>{{ t('propsPanel.autoPlay') }}</span>
            </label>
          </div>
          <div class="prop-group" v-if="carouselWallAutoPlay">
            <label>{{ t('propsPanel.playInterval') }}</label>
            <input v-model.number="carouselWallInterval" type="number" class="prop-input" min="1000" step="500" @input="updateCarouselWallSettings" />
            <span class="unit-hint">{{ t('propsPanel.intervalHint') }}</span>
          </div>
          <div class="prop-group" style="margin-top: 24px;">
            <label>{{ t('propsPanel.carouselWallImgCount', { n: carouselWallImages.length }) }}</label>
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
                <div class="card-image-row">
                  <div class="drag-handle card-drag">⠿</div>
                  <img :src="img.src" :alt="t('propsPanel.imgAlt', { n: index + 1 })" class="card-thumbnail" />
                  <span class="card-index">{{ t('propsPanel.imgIndex', { n: index + 1 }) }}</span>
                  <button class="remove-image-btn card-remove" @click="removeCarouselWallImage(index)" :title="t('propsPanel.deleteImg')">✕</button>
                </div>
                <div class="card-field">
                  <label class="card-label">{{ t('propsPanel.cardTitle') }}</label>
                  <input :value="img.title || ''" type="text" class="prop-input card-input" :placeholder="t('propsPanel.cardTitlePlaceholder')" @input="updateCarouselWallImageField(index, 'title', $event.target.value)" />
                </div>
                <div class="card-field">
                  <label class="card-label">{{ t('propsPanel.cardSubtitle') }}</label>
                  <textarea :value="img.subtitle || ''" class="prop-textarea card-textarea" rows="2" :placeholder="t('propsPanel.cardSubtitlePlaceholder')" @input="updateCarouselWallImageField(index, 'subtitle', $event.target.value)"></textarea>
                </div>
                <div class="card-field card-style-toggle" @click="toggleCardStyle(index)">
                  <span class="card-label">{{ t('propsPanel.cardStyle') }}</span>
                  <span class="card-toggle-icon">{{ expandedCardStyles.includes(index) ? '▲' : '▼' }}</span>
                </div>
                <template v-if="expandedCardStyles.includes(index)">
                  <div class="card-field">
                    <label class="card-label">{{ t('propsPanel.overlayOpacityLabel', { n: img.overlayOpacity ?? 40 }) }}</label>
                    <input :value="img.overlayOpacity ?? 40" type="range" min="0" max="100" class="prop-slider card-slider" @input="updateCarouselWallImageField(index, 'overlayOpacity', Number($event.target.value))" />
                    <div class="slider-labels"><span>{{ t('propsPanel.transparent') }}</span><span>{{ t('propsPanel.opaque') }}</span></div>
                  </div>
                  <div class="card-field">
                    <label class="card-label">{{ t('propsPanel.overlayColor') }}</label>
                    <div class="color-input-group">
                      <input :value="img.overlayColor || '#000000'" type="color" class="prop-color" @input="updateCarouselWallImageField(index, 'overlayColor', $event.target.value)" />
                      <input :value="img.overlayColor || '#000000'" type="text" class="prop-input color-text" placeholder="#000000" @input="updateCarouselWallImageField(index, 'overlayColor', $event.target.value)" />
                    </div>
                  </div>
                  <div class="card-field">
                    <label class="card-label">{{ t('propsPanel.titleColor') }}</label>
                    <div class="color-input-group">
                      <input :value="img.titleColor || '#ffffff'" type="color" class="prop-color" @input="updateCarouselWallImageField(index, 'titleColor', $event.target.value)" />
                      <input :value="img.titleColor || '#ffffff'" type="text" class="prop-input color-text" placeholder="#ffffff" @input="updateCarouselWallImageField(index, 'titleColor', $event.target.value)" />
                    </div>
                  </div>
                  <div class="card-field">
                    <label class="card-label">{{ t('propsPanel.titleFontSize') }}</label>
                    <div class="input-with-suffix">
                      <input :value="img.titleFontSize ?? 48" type="number" class="prop-input" placeholder="48" min="12" @input="updateCarouselWallImageField(index, 'titleFontSize', Number($event.target.value))" />
                      <span class="input-suffix">px</span>
                    </div>
                  </div>
                  <div class="card-field">
                    <label class="card-label">{{ t('propsPanel.subtitleColor') }}</label>
                    <div class="color-input-group">
                      <input :value="img.subtitleColor || '#eeeeee'" type="color" class="prop-color" @input="updateCarouselWallImageField(index, 'subtitleColor', $event.target.value)" />
                      <input :value="img.subtitleColor || '#eeeeee'" type="text" class="prop-input color-text" placeholder="#eeeeee" @input="updateCarouselWallImageField(index, 'subtitleColor', $event.target.value)" />
                    </div>
                  </div>
                  <div class="card-field">
                    <label class="card-label">{{ t('propsPanel.subtitleFontSize') }}</label>
                    <div class="input-with-suffix">
                      <input :value="img.subtitleFontSize ?? 20" type="number" class="prop-input" placeholder="20" min="10" @input="updateCarouselWallImageField(index, 'subtitleFontSize', Number($event.target.value))" />
                      <span class="input-suffix">px</span>
                    </div>
                  </div>
                </template>
              </div>
            </div>
            <div v-else class="no-image"><span>{{ t('propsPanel.noImage') }}</span></div>
            <button @click="handleUploadCarouselWall" class="upload-btn" :disabled="isUploadingCarouselWall">
              <template v-if="isUploadingCarouselWall"><span class="btn-spinner"></span>{{ t('propsPanel.uploading') }}</template>
              <template v-else>{{ t('propsPanel.addImage') }}</template>
            </button>
          </div>
        </template>

        <template v-else-if="selectedFrame.type === 'FOOTER'">
          <h4 class="section-title">{{ t('propsPanel.footerSettings') }}</h4>
          <div class="metadata-section">
            <h5 class="subsection-title">{{ t('propsPanel.bgColorSection') }}</h5>
            <div class="prop-group">
              <label>{{ t('propsPanel.bgColor') }}</label>
              <div class="color-input-group">
                <input v-model="footerBgColor" type="color" class="prop-color" @input="updateFooterStyle" />
                <input v-model="footerBgColor" type="text" class="prop-input color-text" placeholder="#2d2d2d" @input="updateFooterStyle" />
              </div>
              <div class="color-quick-btns" style="margin-top:10px;">
                <button @click="footerBgColor='#2d2d2d'; updateFooterStyle()" class="preset-btn" :class="{ active: footerBgColor==='#2d2d2d' }">{{ t('propsPanel.colorDarkGray') }}</button>
                <button @click="footerBgColor='#1a1a2e'; updateFooterStyle()" class="preset-btn" :class="{ active: footerBgColor==='#1a1a2e' }">{{ t('propsPanel.colorDarkBlue') }}</button>
                <button @click="footerBgColor='#3b1f0a'; updateFooterStyle()" class="preset-btn" :class="{ active: footerBgColor==='#3b1f0a' }">{{ t('propsPanel.colorDarkBrown') }}</button>
                <button @click="footerBgColor='#1b2a1b'; updateFooterStyle()" class="preset-btn" :class="{ active: footerBgColor==='#1b2a1b' }">{{ t('propsPanel.colorDarkGreen') }}</button>
              </div>
            </div>
          </div>
          <div class="metadata-section">
            <h5 class="subsection-title">{{ t('propsPanel.textColorSection') }}</h5>
            <div class="prop-group">
              <label>{{ t('propsPanel.textColor') }}</label>
              <div class="color-input-group">
                <input v-model="footerTextColor" type="color" class="prop-color" @input="updateFooterStyle" />
                <input v-model="footerTextColor" type="text" class="prop-input color-text" placeholder="#ffffff" @input="updateFooterStyle" />
              </div>
              <div class="color-quick-btns" style="margin-top:10px;">
                <button @click="footerTextColor='#ffffff'; updateFooterStyle()" class="preset-btn" :class="{ active: footerTextColor==='#ffffff' }">{{ t('propsPanel.colorWhite') }}</button>
                <button @click="footerTextColor='#f5d9b0'; updateFooterStyle()" class="preset-btn" :class="{ active: footerTextColor==='#f5d9b0' }">{{ t('propsPanel.colorGold') }}</button>
                <button @click="footerTextColor='#a8d8a8'; updateFooterStyle()" class="preset-btn" :class="{ active: footerTextColor==='#a8d8a8' }">{{ t('propsPanel.colorLightGreen') }}</button>
                <button @click="footerTextColor='#adc8e6'; updateFooterStyle()" class="preset-btn" :class="{ active: footerTextColor==='#adc8e6' }">{{ t('propsPanel.colorLightBlue') }}</button>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="selectedFrame.type === 'INDEX_DONATION'">
          <h4 class="section-title">{{ t('propsPanel.donationSettings') }}</h4>
          <div class="metadata-section">
            <h5 class="subsection-title">{{ t('propsPanel.bgColorSection') }}</h5>
            <div class="prop-group">
              <label>{{ t('propsPanel.bgGradient') }}</label>
              <div class="color-input-group">
                <input v-model="donationBgColorA" type="color" class="prop-color" @input="updateDonationStyle" />
                <input v-model="donationBgColorA" type="text" class="prop-input color-text" placeholder="#8b7355" @input="updateDonationStyle" />
              </div>
              <div class="color-input-group" style="margin-top: 8px;">
                <input v-model="donationBgColorB" type="color" class="prop-color" @input="updateDonationStyle" />
                <input v-model="donationBgColorB" type="text" class="prop-input color-text" placeholder="#a0826d" @input="updateDonationStyle" />
              </div>
              <span class="unit-hint">{{ t('propsPanel.gradientHint') }}</span>
            </div>
          </div>
          <div class="metadata-section">
            <h5 class="subsection-title">{{ t('propsPanel.textColorSection') }}</h5>
            <div class="prop-group">
              <label>{{ t('propsPanel.textColor') }}</label>
              <div class="color-input-group">
                <input v-model="donationTextColor" type="color" class="prop-color" @input="updateDonationStyle" />
                <input v-model="donationTextColor" type="text" class="prop-input color-text" placeholder="#ffffff" @input="updateDonationStyle" />
              </div>
            </div>
            <div class="color-quick-btns">
              <button @click="donationTextColor = '#ffffff'; updateDonationStyle()" class="preset-btn" :class="{ active: donationTextColor === '#ffffff' }">{{ t('propsPanel.colorWhite') }}</button>
              <button @click="donationTextColor = '#333333'; updateDonationStyle()" class="preset-btn" :class="{ active: donationTextColor === '#333333' }">{{ t('propsPanel.colorDark') }}</button>
              <button @click="donationTextColor = '#f5d9b0'; updateDonationStyle()" class="preset-btn" :class="{ active: donationTextColor === '#f5d9b0' }">{{ t('propsPanel.colorGold') }}</button>
              <button @click="donationTextColor = '#fde68a'; updateDonationStyle()" class="preset-btn" :class="{ active: donationTextColor === '#fde68a' }">{{ t('propsPanel.colorYellow') }}</button>
            </div>
          </div>
        </template>

        <!-- 光明燈 (BRIGHT_LAMP) -->
        <template v-else-if="selectedFrame.type === 'BRIGHT_LAMP'">
          <h4 class="section-title">光明燈設定</h4>

          <div class="metadata-section">
            <h5 class="subsection-title">背景圖片</h5>
            <div class="prop-group">
              <div class="image-upload">
                <div v-if="isUploadingBrightLampBg" class="uploading-state">
                  <div class="spinner"></div>
                  <span>上傳中...</span>
                </div>
                <img
                  v-else-if="selectedFrame.data?.bgImgSrc"
                  :src="selectedFrame.data.bgImgSrc"
                  alt="背景預覽"
                  class="preview-image"
                />
                <div v-else class="no-image"><span>尚未上傳背景圖</span></div>
                <button @click="handleUploadBrightLampBg" class="upload-btn" :disabled="isUploadingBrightLampBg">
                  {{ isUploadingBrightLampBg ? '上傳中...' : (selectedFrame.data?.bgImgSrc ? '更換背景圖' : '上傳背景圖') }}
                </button>
              </div>
            </div>
          </div>

          <div class="metadata-section">
            <h5 class="subsection-title">主神像</h5>
            <div class="prop-group">
              <div class="image-upload">
                <div v-if="isUploadingBrightLampMain" class="uploading-state">
                  <div class="spinner"></div>
                  <span>上傳中...</span>
                </div>
                <img
                  v-else-if="selectedFrame.data?.mainImgSrc"
                  :src="selectedFrame.data.mainImgSrc"
                  alt="主神像預覽"
                  class="preview-image"
                />
                <div v-else class="no-image"><span>尚未上傳主神像</span></div>
                <button @click="handleUploadBrightLampMain" class="upload-btn" :disabled="isUploadingBrightLampMain">
                  {{ isUploadingBrightLampMain ? '上傳中...' : (selectedFrame.data?.mainImgSrc ? '更換主神像' : '上傳主神像') }}
                </button>
              </div>
            </div>
          </div>

          <div class="metadata-section">
            <h5 class="subsection-title">面板邊框</h5>
            <div class="prop-group">
              <div class="border-options">
                <div
                  class="border-option"
                  :class="{ active: (selectedFrame.data?.borderOption ?? 'border') === 'border' }"
                  @click="setBrightLampOption('borderOption', 'border')"
                >
                  <img src="/images/bright-light/border.png" alt="邊框" class="option-preview" />
                  <span>預設邊框</span>
                </div>
              </div>
            </div>
          </div>

          <div class="metadata-section">
            <h5 class="subsection-title">燈柱</h5>
            <div class="prop-group">
              <div class="border-options">
                <div
                  class="border-option"
                  :class="{ active: (selectedFrame.data?.pillarOption ?? 'pillar') === 'pillar' }"
                  @click="setBrightLampOption('pillarOption', 'pillar')"
                >
                  <img src="/images/bright-light/pillar.png" alt="燈柱" class="option-preview option-preview--pillar" />
                  <span>預設燈柱</span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <h4 class="section-title">{{ t('propsPanel.frameSettings') }}</h4>
          <div class="prop-group">
            <label>{{ t('propsPanel.frameType') }}</label>
            <input :value="selectedFrame.type" type="text" class="prop-input" disabled />
          </div>
          <div class="metadata-section">
            <h5 class="subsection-title">{{ t('propsPanel.textColorTheme') }}</h5>
            <div class="prop-group">
              <label>{{ t('propsPanel.selectTheme') }}</label>
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
            <div v-if="systemFrameTextTheme === 'custom'" class="prop-group">
              <label>{{ t('propsPanel.customTextColor') }}</label>
              <div class="color-input-group">
                <input v-model="systemFrameTextColor" type="color" class="prop-color" @input="updateSystemFrameTheme" />
                <input v-model="systemFrameTextColor" type="text" class="prop-input color-text" placeholder="#333333" @input="updateSystemFrameTheme" />
              </div>
            </div>
            <div class="theme-preview-hint">
              <span class="hint-icon">💡</span>
              <p>{{ t('propsPanel.themeHint') }}</p>
            </div>
          </div>
        </template>
      </div>

      <div v-else-if="selectedElement" class="props-section">
        <template v-if="selectedElement.type === 'logo'">
          <h4 class="section-title">{{ t('propsPanel.logoSettings') }}</h4>
          <div class="prop-group">
            <label>{{ t('propsPanel.logoImg') }}</label>
            <div class="image-upload">
              <div v-if="isUploadingLogo" class="uploading-state"><div class="spinner"></div><span>{{ t('propsPanel.uploading') }}</span></div>
              <img v-else-if="localLogoSrc" :src="localLogoSrc" :alt="selectedElement.frame?.data?.temple_name || 'Logo'" class="preview-image logo-preview" @error="handleLogoImageError" />
              <div v-else class="no-image"><span>{{ t('propsPanel.noLogo') }}</span></div>
              <button @click="handleUploadLogo" class="upload-btn" :disabled="isUploadingLogo">
                <template v-if="isUploadingLogo">{{ t('propsPanel.uploading') }}</template>
                <template v-else>{{ localLogoSrc ? t('propsPanel.changeLogo') : t('propsPanel.uploadLogo') }}</template>
              </button>
              <button v-if="localLogoSrc" @click="handleDeleteLogoFromPanel" class="delete-logo-btn">
                {{ t('propsPanel.deleteLogo') }}
              </button>
            </div>
          </div>
        </template>

        <template v-else-if="selectedElement.element?.type === 'TEXT'">
          <h4 class="section-title">{{ t('propsPanel.textSettings') }}</h4>
          <div class="prop-group">
            <label>{{ t('propsPanel.textContent') }}</label>
            <template v-if="selectedElement.element?.id === 'donationTitle'">
              <input v-model="selectedElement.element.value.text" type="text" class="prop-input" :placeholder="t('propsPanel.titleInputPlaceholder')" />
            </template>
            <template v-else-if="selectedElement.element?.id === 'donationBrief'">
              <textarea v-model="selectedElement.element.value.text" class="prop-textarea" rows="4" :placeholder="t('propsPanel.briefInputPlaceholder')"></textarea>
            </template>
            <template v-else>
              <RichTextEditor v-model="selectedElement.element.value.text" />
            </template>
          </div>
          <div class="metadata-section">
            <h5 class="subsection-title">{{ t('propsPanel.styleSettings') }}</h5>
            <div class="prop-group">
              <label>{{ t('propsPanel.elementTextColor') }}</label>
              <div class="color-input-group">
                <input v-model="elementMetadata.color" type="color" class="prop-color" @input="updateMetadata" />
                <input v-model="elementMetadata.color" type="text" class="prop-input color-text" placeholder="#000000" @input="updateMetadata" />
                <button @click="elementMetadata.color = null; updateMetadata()" class="clear-btn" :title="t('propsPanel.clearBtn')">✕</button>
              </div>
            </div>
            <div class="prop-group">
              <label>{{ t('propsPanel.fontSize') }}</label>
              <div class="font-size-row">
                <input v-model="elementMetadata.fontSize" type="text" class="prop-input font-size-input" placeholder="16" @input="updateMetadata" />
                <div class="font-size-presets">
                  <button @click="elementMetadata.fontSize = '12'; updateMetadata()" class="preset-btn" :class="{ active: elementMetadata.fontSize === '12' }">{{ t('propsPanel.sizeSmall') }}</button>
                  <button @click="elementMetadata.fontSize = '16'; updateMetadata()" class="preset-btn" :class="{ active: elementMetadata.fontSize === '16' }">{{ t('propsPanel.sizeMedium') }}</button>
                  <button @click="elementMetadata.fontSize = '24'; updateMetadata()" class="preset-btn" :class="{ active: elementMetadata.fontSize === '24' }">{{ t('propsPanel.sizeLarge') }}</button>
                  <button @click="elementMetadata.fontSize = '36'; updateMetadata()" class="preset-btn" :class="{ active: elementMetadata.fontSize === '36' }">{{ t('propsPanel.sizeXXL') }}</button>
                </div>
              </div>
            </div>
            <div class="prop-group">
              <label>{{ t('propsPanel.fontWeight') }} <span class="label-value">{{ elementMetadata.fontWeight ?? t('propsPanel.fontWeightDefault') }}</span></label>
              <input v-model.number="elementMetadata.fontWeight" type="range" min="300" max="900" step="100" class="prop-slider" @input="updateMetadata" />
              <div class="font-weight-labels"><span>300</span><span>400</span><span>500</span><span>600</span><span>700</span><span>800</span><span>900</span></div>
            </div>
            <div class="prop-group">
              <label>{{ t('propsPanel.textAlign') }}</label>
              <div class="align-buttons">
                <button @click="elementMetadata.textAlign = 'left'; updateMetadata()" class="align-btn" :class="{ active: elementMetadata.textAlign === 'left' }">{{ t('propsPanel.alignLeft') }}</button>
                <button @click="elementMetadata.textAlign = 'center'; updateMetadata()" class="align-btn" :class="{ active: elementMetadata.textAlign === 'center' }">{{ t('propsPanel.alignCenter') }}</button>
                <button @click="elementMetadata.textAlign = 'right'; updateMetadata()" class="align-btn" :class="{ active: elementMetadata.textAlign === 'right' }">{{ t('propsPanel.alignRight') }}</button>
                <button @click="elementMetadata.textAlign = null; updateMetadata()" class="align-btn clear">✕</button>
              </div>
            </div>
            <div class="prop-group">
              <label>{{ t('propsPanel.backgroundColor') }}</label>
              <div class="color-input-group">
                <input v-model="elementMetadata.backgroundColor" type="color" class="prop-color" @input="updateMetadata" />
                <input v-model="elementMetadata.backgroundColor" type="text" class="prop-input color-text" placeholder="transparent" @input="updateMetadata" />
                <button @click="elementMetadata.backgroundColor = null; updateMetadata()" class="clear-btn" :title="t('propsPanel.clearBtn')">✕</button>
              </div>
            </div>
          </div>
          <div class="padding-section">
            <h5 class="subsection-title">{{ t('propsPanel.elementSpacing') }}</h5>
            <div class="padding-controls">
              <div class="padding-visual"><div class="padding-box">
                <div class="padding-input-group top"><label>{{ t('propsPanel.paddingTop') }}</label><input v-model.number="elementPadding.top" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                <div class="padding-sides">
                  <div class="padding-input-group left"><label>{{ t('propsPanel.paddingLeft') }}</label><input v-model.number="elementPadding.left" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                  <div class="content-preview">{{ t('propsPanel.contentArea') }}</div>
                  <div class="padding-input-group right"><label>{{ t('propsPanel.paddingRight') }}</label><input v-model.number="elementPadding.right" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                </div>
                <div class="padding-input-group bottom"><label>{{ t('propsPanel.paddingBottom') }}</label><input v-model.number="elementPadding.bottom" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
              </div></div>
              <div class="padding-presets">
                <button @click="setElementPadding(0)" class="preset-btn">{{ t('propsPanel.paddingNone') }}</button>
                <button @click="setElementPadding(10)" class="preset-btn">{{ t('propsPanel.sizeSmall') }}</button>
                <button @click="setElementPadding(20)" class="preset-btn">{{ t('propsPanel.sizeMedium') }}</button>
                <button @click="setElementPadding(40)" class="preset-btn">{{ t('propsPanel.sizeLarge') }}</button>
              </div>
            </div>
          </div>
          <div class="width-section">
            <h5 class="subsection-title">{{ t('propsPanel.elementWidth') }}</h5>
            <div class="prop-group">
              <label>{{ t('propsPanel.maxWidth') }}</label>
              <div class="input-with-suffix">
                <input v-model="elementWidth" type="number" class="prop-input" placeholder="100" min="1" max="100" @input="updateElementWidthDebounced" />
                <span class="input-suffix">%</span>
              </div>
            </div>
            <div class="width-presets">
              <button @click="setElementWidth('50')" class="preset-btn">{{ t('propsPanel.halfWidth') }}</button>
              <button @click="setElementWidth('80')" class="preset-btn">{{ t('propsPanel.presetNarrow') }}</button>
              <button @click="setElementWidth('100')" class="preset-btn">{{ t('propsPanel.presetFull') }}</button>
            </div>
          </div>
        </template>

        <template v-else-if="selectedElement.element?.type === 'IMG'">
          <h4 class="section-title">{{ t('propsPanel.imgSettings') }}</h4>
          <div class="prop-group">
            <label>{{ t('propsPanel.imgLabel') }}</label>
            <div class="image-upload">
              <div v-if="isUploadingImage" class="uploading-state"><div class="spinner"></div><span>{{ t('propsPanel.uploading') }}</span></div>
              <img v-else-if="selectedElement.element.value?.src" :src="selectedElement.element.value.src" :alt="t('propsPanel.imgPreviewAlt')" class="preview-image" />
              <div v-else class="no-image"><span>{{ t('propsPanel.noImgUploaded') }}</span></div>
              <button @click="handleUploadImage" class="upload-btn" :disabled="isUploadingImage">
                <template v-if="isUploadingImage">{{ t('propsPanel.uploading') }}</template>
                <template v-else>{{ selectedElement.element.value?.src ? t('propsPanel.changeImage') : t('propsPanel.uploadImage') }}</template>
              </button>
            </div>
          </div>
          <div class="metadata-section">
            <h5 class="subsection-title">{{ t('propsPanel.styleSettings') }}</h5>
            <div class="prop-group">
              <label>{{ t('propsPanel.imgAlign') }}</label>
              <div class="align-buttons">
                <button @click="elementMetadata.textAlign = 'left'; updateMetadata()" class="align-btn" :class="{ active: elementMetadata.textAlign === 'left' }">{{ t('propsPanel.alignLeft') }}</button>
                <button @click="elementMetadata.textAlign = 'center'; updateMetadata()" class="align-btn" :class="{ active: elementMetadata.textAlign === 'center' }">{{ t('propsPanel.alignCenter') }}</button>
                <button @click="elementMetadata.textAlign = 'right'; updateMetadata()" class="align-btn" :class="{ active: elementMetadata.textAlign === 'right' }">{{ t('propsPanel.alignRight') }}</button>
                <button @click="elementMetadata.textAlign = null; updateMetadata()" class="align-btn clear">✕</button>
              </div>
            </div>
            <div class="prop-group">
              <label>{{ t('propsPanel.width') }}</label>
              <div class="input-with-suffix">
                <input v-model="imgWidth" type="number" class="prop-input" placeholder="500" min="1" @input="updateImgSize" />
                <span class="input-suffix">px</span>
              </div>
            </div>
            <div class="prop-group">
              <label>{{ t('propsPanel.height') }}</label>
              <div class="input-with-suffix">
                <input v-model="imgHeight" type="number" class="prop-input" placeholder="auto" min="1" @input="updateImgSize" />
                <span class="input-suffix">px</span>
              </div>
              <span class="unit-hint">{{ t('propsPanel.autoHint') }}</span>
            </div>
          </div>
          <div class="padding-section">
            <h5 class="subsection-title">{{ t('propsPanel.elementSpacing') }}</h5>
            <div class="padding-controls">
              <div class="padding-visual"><div class="padding-box">
                <div class="padding-input-group top"><label>{{ t('propsPanel.paddingTop') }}</label><input v-model.number="elementPadding.top" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                <div class="padding-sides">
                  <div class="padding-input-group left"><label>{{ t('propsPanel.paddingLeft') }}</label><input v-model.number="elementPadding.left" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                  <div class="content-preview">{{ t('propsPanel.contentArea') }}</div>
                  <div class="padding-input-group right"><label>{{ t('propsPanel.paddingRight') }}</label><input v-model.number="elementPadding.right" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                </div>
                <div class="padding-input-group bottom"><label>{{ t('propsPanel.paddingBottom') }}</label><input v-model.number="elementPadding.bottom" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
              </div></div>
              <div class="padding-presets">
                <button @click="setElementPadding(0)" class="preset-btn">{{ t('propsPanel.paddingNone') }}</button>
                <button @click="setElementPadding(10)" class="preset-btn">{{ t('propsPanel.sizeSmall') }}</button>
                <button @click="setElementPadding(20)" class="preset-btn">{{ t('propsPanel.sizeMedium') }}</button>
                <button @click="setElementPadding(40)" class="preset-btn">{{ t('propsPanel.sizeLarge') }}</button>
              </div>
            </div>
          </div>
          <div class="width-section">
            <h5 class="subsection-title">{{ t('propsPanel.elementWidth') }}</h5>
            <div class="prop-group">
              <label>{{ t('propsPanel.maxWidth') }}</label>
              <div class="input-with-suffix">
                <input v-model="elementWidth" type="number" class="prop-input" placeholder="100" min="1" max="100" @input="updateElementWidthDebounced" />
                <span class="input-suffix">%</span>
              </div>
            </div>
            <div class="width-presets">
              <button @click="setElementWidth('50')" class="preset-btn">{{ t('propsPanel.halfWidth') }}</button>
              <button @click="setElementWidth('80')" class="preset-btn">{{ t('propsPanel.presetNarrow') }}</button>
              <button @click="setElementWidth('100')" class="preset-btn">{{ t('propsPanel.presetFull') }}</button>
            </div>
          </div>
        </template>

        <template v-else-if="selectedElement.element?.type === 'BUTTON'">
          <h4 class="section-title">{{ t('propsPanel.btnSettings') }}</h4>
          <div class="prop-group"><label>{{ t('propsPanel.btnText') }}</label><input v-model="selectedElement.element.value.text" type="text" class="prop-input" :placeholder="t('propsPanel.btnTextPlaceholder')" /></div>
          <div class="prop-group">
            <label>{{ t('propsPanel.linkUrl') }}</label>
            <select v-model="buttonLinkType" class="prop-select internal-link-select">
              <option value="__custom__">自訂網址</option>
              <option
                v-for="page in internalPageOptions"
                :key="page.slug"
                :value="page.slug"
              >
                {{ page.label }}
              </option>
            </select>
            <input
              v-if="isCustomButtonLink"
              v-model="selectedElement.element.value.url"
              type="text"
              class="prop-input"
              style="margin-top: 8px;"
              :placeholder="t('propsPanel.linkUrlPlaceholder')"
            />
          </div>
          <div class="metadata-section">
            <h5 class="subsection-title">{{ t('propsPanel.styleSettings') }}</h5>
            <div class="prop-group">
              <label>{{ t('propsPanel.elementTextColor') }}</label>
              <div class="color-input-group">
                <input v-model="elementMetadata.color" type="color" class="prop-color" @input="updateMetadata" />
                <input v-model="elementMetadata.color" type="text" class="prop-input color-text" placeholder="#ffffff" @input="updateMetadata" />
                <button @click="elementMetadata.color = null; updateMetadata()" class="clear-btn" :title="t('propsPanel.clearBtn')">✕</button>
              </div>
            </div>
            <div class="prop-group">
              <label>{{ t('propsPanel.backgroundColor') }}</label>
              <div class="color-input-group">
                <input v-model="elementMetadata.backgroundColor" type="color" class="prop-color" @input="updateMetadata" />
                <input v-model="elementMetadata.backgroundColor" type="text" class="prop-input color-text" placeholder="#E8572A" @input="updateMetadata" />
                <button @click="elementMetadata.backgroundColor = null; updateMetadata()" class="clear-btn" :title="t('propsPanel.clearBtn')">✕</button>
              </div>
            </div>
            <div class="prop-group">
              <label>{{ t('propsPanel.fontSize') }}</label>
              <div class="font-size-row">
                <input v-model="elementMetadata.fontSize" type="text" class="prop-input font-size-input" placeholder="16" @input="updateMetadata" />
                <div class="font-size-presets">
                  <button @click="elementMetadata.fontSize = '12'; updateMetadata()" class="preset-btn" :class="{ active: elementMetadata.fontSize === '12' }">{{ t('propsPanel.sizeSmall') }}</button>
                  <button @click="elementMetadata.fontSize = '16'; updateMetadata()" class="preset-btn" :class="{ active: elementMetadata.fontSize === '16' }">{{ t('propsPanel.sizeMedium') }}</button>
                  <button @click="elementMetadata.fontSize = '24'; updateMetadata()" class="preset-btn" :class="{ active: elementMetadata.fontSize === '24' }">{{ t('propsPanel.sizeLarge') }}</button>
                  <button @click="elementMetadata.fontSize = '36'; updateMetadata()" class="preset-btn" :class="{ active: elementMetadata.fontSize === '36' }">{{ t('propsPanel.sizeXXL') }}</button>
                </div>
              </div>
            </div>
            <div class="prop-group">
              <label>{{ t('propsPanel.fontWeight') }} <span class="label-value">{{ elementMetadata.fontWeight ?? t('propsPanel.fontWeightDefault') }}</span></label>
              <input v-model.number="elementMetadata.fontWeight" type="range" min="300" max="900" step="100" class="prop-slider" @input="updateMetadata" />
              <div class="font-weight-labels"><span>300</span><span>400</span><span>500</span><span>600</span><span>700</span><span>800</span><span>900</span></div>
            </div>
          </div>
          <div class="padding-section">
            <h5 class="subsection-title">{{ t('propsPanel.elementSpacing') }}</h5>
            <div class="padding-controls">
              <div class="padding-visual"><div class="padding-box">
                <div class="padding-input-group top"><label>{{ t('propsPanel.paddingTop') }}</label><input v-model.number="elementPadding.top" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                <div class="padding-sides">
                  <div class="padding-input-group left"><label>{{ t('propsPanel.paddingLeft') }}</label><input v-model.number="elementPadding.left" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                  <div class="content-preview">{{ t('propsPanel.contentArea') }}</div>
                  <div class="padding-input-group right"><label>{{ t('propsPanel.paddingRight') }}</label><input v-model.number="elementPadding.right" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                </div>
                <div class="padding-input-group bottom"><label>{{ t('propsPanel.paddingBottom') }}</label><input v-model.number="elementPadding.bottom" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
              </div></div>
              <div class="padding-presets">
                <button @click="setElementPadding(0)" class="preset-btn">{{ t('propsPanel.paddingNone') }}</button>
                <button @click="setElementPadding(10)" class="preset-btn">{{ t('propsPanel.sizeSmall') }}</button>
                <button @click="setElementPadding(20)" class="preset-btn">{{ t('propsPanel.sizeMedium') }}</button>
                <button @click="setElementPadding(40)" class="preset-btn">{{ t('propsPanel.sizeLarge') }}</button>
              </div>
            </div>
          </div>
          <div class="width-section">
            <h5 class="subsection-title">{{ t('propsPanel.elementWidth') }}</h5>
            <div class="prop-group"><label>{{ t('propsPanel.maxWidth') }}</label><div class="input-with-suffix"><input v-model="elementWidth" type="number" class="prop-input" placeholder="100" min="1" max="100" @input="updateElementWidthDebounced" /><span class="input-suffix">%</span></div></div>
            <div class="width-presets"><button @click="setElementWidth('50')" class="preset-btn">{{ t('propsPanel.halfWidth') }}</button><button @click="setElementWidth('80')" class="preset-btn">{{ t('propsPanel.presetNarrow') }}</button><button @click="setElementWidth('100')" class="preset-btn">{{ t('propsPanel.presetFull') }}</button></div>
          </div>
        </template>

        <template v-else-if="selectedElement.element?.type === 'HORIZON_LINE'">
          <h4 class="section-title">{{ t('propsPanel.hlineSettings') }}</h4>
          <div class="prop-group"><label>{{ t('propsPanel.color') }}</label><input v-model="selectedElement.element.value.color" type="color" class="prop-color" /></div>
          <div class="prop-group"><label>{{ t('propsPanel.thickness') }}</label><input v-model="selectedElement.element.value.thickness" type="text" class="prop-input" placeholder="" /></div>
          <div class="padding-section">
            <h5 class="subsection-title">{{ t('propsPanel.elementSpacing') }}</h5>
            <div class="padding-controls">
              <div class="padding-visual"><div class="padding-box">
                <div class="padding-input-group top"><label>{{ t('propsPanel.paddingTop') }}</label><input v-model.number="elementPadding.top" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                <div class="padding-sides">
                  <div class="padding-input-group left"><label>{{ t('propsPanel.paddingLeft') }}</label><input v-model.number="elementPadding.left" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                  <div class="content-preview">{{ t('propsPanel.contentArea') }}</div>
                  <div class="padding-input-group right"><label>{{ t('propsPanel.paddingRight') }}</label><input v-model.number="elementPadding.right" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                </div>
                <div class="padding-input-group bottom"><label>{{ t('propsPanel.paddingBottom') }}</label><input v-model.number="elementPadding.bottom" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
              </div></div>
              <div class="padding-presets">
                <button @click="setElementPadding(0)" class="preset-btn">{{ t('propsPanel.paddingNone') }}</button>
                <button @click="setElementPadding(10)" class="preset-btn">{{ t('propsPanel.sizeSmall') }}</button>
                <button @click="setElementPadding(20)" class="preset-btn">{{ t('propsPanel.sizeMedium') }}</button>
                <button @click="setElementPadding(40)" class="preset-btn">{{ t('propsPanel.sizeLarge') }}</button>
              </div>
            </div>
          </div>
          <div class="width-section">
            <h5 class="subsection-title">{{ t('propsPanel.elementWidth') }}</h5>
            <div class="prop-group"><label>{{ t('propsPanel.maxWidth') }}</label><div class="input-with-suffix"><input v-model="elementWidth" type="number" class="prop-input" placeholder="100" min="1" max="100" @input="updateElementWidthDebounced" /><span class="input-suffix">%</span></div></div>
            <div class="width-presets"><button @click="setElementWidth('50')" class="preset-btn">{{ t('propsPanel.halfWidth') }}</button><button @click="setElementWidth('80')" class="preset-btn">{{ t('propsPanel.presetNarrow') }}</button><button @click="setElementWidth('100')" class="preset-btn">{{ t('propsPanel.presetFull') }}</button></div>
          </div>
        </template>

        <template v-else-if="selectedElement.element?.type === 'VERTICAL_LINE'">
          <h4 class="section-title">{{ t('propsPanel.vlineSettings') }}</h4>
          <div class="prop-group"><label>{{ t('propsPanel.color') }}</label><input v-model="selectedElement.element.value.color" type="color" class="prop-color" /></div>
          <div class="prop-group"><label>{{ t('propsPanel.thickness') }}</label><input v-model="selectedElement.element.value.thickness" type="text" class="prop-input" placeholder="2（）" /></div>
          <div class="padding-section">
            <h5 class="subsection-title">{{ t('propsPanel.elementSpacing') }}</h5>
            <div class="padding-controls">
              <div class="padding-visual"><div class="padding-box">
                <div class="padding-input-group top"><label>{{ t('propsPanel.paddingTop') }}</label><input v-model.number="elementPadding.top" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                <div class="padding-sides">
                  <div class="padding-input-group left"><label>{{ t('propsPanel.paddingLeft') }}</label><input v-model.number="elementPadding.left" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                  <div class="content-preview">{{ t('propsPanel.contentArea') }}</div>
                  <div class="padding-input-group right"><label>{{ t('propsPanel.paddingRight') }}</label><input v-model.number="elementPadding.right" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                </div>
                <div class="padding-input-group bottom"><label>{{ t('propsPanel.paddingBottom') }}</label><input v-model.number="elementPadding.bottom" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
              </div></div>
              <div class="padding-presets">
                <button @click="setElementPadding(0)" class="preset-btn">{{ t('propsPanel.paddingNone') }}</button>
                <button @click="setElementPadding(10)" class="preset-btn">{{ t('propsPanel.sizeSmall') }}</button>
                <button @click="setElementPadding(20)" class="preset-btn">{{ t('propsPanel.sizeMedium') }}</button>
                <button @click="setElementPadding(40)" class="preset-btn">{{ t('propsPanel.sizeLarge') }}</button>
              </div>
            </div>
          </div>
          <div class="width-section">
            <h5 class="subsection-title">{{ t('propsPanel.elementWidth') }}</h5>
            <div class="prop-group"><label>{{ t('propsPanel.maxWidth') }}</label><div class="input-with-suffix"><input v-model="elementWidth" type="number" class="prop-input" placeholder="100" min="1" max="100" @input="updateElementWidthDebounced" /><span class="input-suffix">%</span></div></div>
            <div class="width-presets"><button @click="setElementWidth('50')" class="preset-btn">{{ t('propsPanel.halfWidth') }}</button><button @click="setElementWidth('80')" class="preset-btn">{{ t('propsPanel.presetNarrow') }}</button><button @click="setElementWidth('100')" class="preset-btn">{{ t('propsPanel.presetFull') }}</button></div>
          </div>
        </template>

        <template v-else-if="selectedElement.element?.type === 'CAROUSEL_IMG'">
          <h4 class="section-title">{{ t('propsPanel.carouselSettings') }}</h4>
          <div class="prop-group">
            <label>{{ t('propsPanel.carouselHeight') }}</label>
            <div class="height-selector">
              <input v-model.number="carouselHeight" type="number" class="prop-input" min="200" max="800" step="50" @input="updateCarouselSettings" />
              <span class="unit">px</span>
            </div>
            <div class="height-presets">
              <button v-for="preset in heightPresets" :key="preset.value" @click="setCarouselHeight(preset.value)" class="preset-btn" :class="{ active: carouselHeight === preset.value }">{{ preset.label }}</button>
            </div>
          </div>
          <div class="prop-group">
            <label>{{ t('propsPanel.carouselImgCount', { n: carouselImages.length }) }}</label>
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
                <img :src="image.src || image" :alt="t('propsPanel.imgAlt', { n: index + 1 })" class="carousel-thumbnail" />
                <button @click="removeCarouselImage(index)" class="remove-image-btn" :title="t('propsPanel.deleteImg')">✕</button>
              </div>
            </div>
            <button @click="addCarouselImage" class="upload-btn" :disabled="isUploadingCarousel">
              <template v-if="isUploadingCarousel"><span class="btn-spinner"></span>{{ t('propsPanel.uploading') }}</template>
              <template v-else>{{ t('propsPanel.addImage') }}</template>
            </button>
          </div>
          <div class="prop-group"><label class="checkbox-label"><input v-model="carouselAutoPlay" type="checkbox" @change="updateCarouselSettings" /><span>{{ t('propsPanel.autoPlay') }}</span></label></div>
          <div class="prop-group" v-if="carouselAutoPlay"><label>{{ t('propsPanel.playInterval') }}</label><input v-model.number="carouselInterval" type="number" class="prop-input" min="1000" step="500" @input="updateCarouselSettings" /></div>
          <div class="padding-section">
            <h5 class="subsection-title">{{ t('propsPanel.elementSpacing') }}</h5>
            <div class="padding-controls">
              <div class="padding-visual"><div class="padding-box">
                <div class="padding-input-group top"><label>{{ t('propsPanel.paddingTop') }}</label><input v-model.number="elementPadding.top" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                <div class="padding-sides">
                  <div class="padding-input-group left"><label>{{ t('propsPanel.paddingLeft') }}</label><input v-model.number="elementPadding.left" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                  <div class="content-preview">{{ t('propsPanel.contentArea') }}</div>
                  <div class="padding-input-group right"><label>{{ t('propsPanel.paddingRight') }}</label><input v-model.number="elementPadding.right" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                </div>
                <div class="padding-input-group bottom"><label>{{ t('propsPanel.paddingBottom') }}</label><input v-model.number="elementPadding.bottom" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
              </div></div>
              <div class="padding-presets">
                <button @click="setElementPadding(0)" class="preset-btn">{{ t('propsPanel.paddingNone') }}</button>
                <button @click="setElementPadding(10)" class="preset-btn">{{ t('propsPanel.sizeSmall') }}</button>
                <button @click="setElementPadding(20)" class="preset-btn">{{ t('propsPanel.sizeMedium') }}</button>
                <button @click="setElementPadding(40)" class="preset-btn">{{ t('propsPanel.sizeLarge') }}</button>
              </div>
            </div>
          </div>
          <div class="width-section">
            <h5 class="subsection-title">{{ t('propsPanel.elementWidth') }}</h5>
            <div class="prop-group"><label>{{ t('propsPanel.maxWidth') }}</label><div class="input-with-suffix"><input v-model="elementWidth" type="number" class="prop-input" placeholder="100" min="1" max="100" @input="updateElementWidthDebounced" /><span class="input-suffix">%</span></div></div>
            <div class="width-presets"><button @click="setElementWidth('50')" class="preset-btn">{{ t('propsPanel.halfWidth') }}</button><button @click="setElementWidth('80')" class="preset-btn">{{ t('propsPanel.presetNarrow') }}</button><button @click="setElementWidth('100')" class="preset-btn">{{ t('propsPanel.presetFull') }}</button></div>
          </div>
        </template>

        <template v-else-if="selectedElement.element?.type === 'GOOGLE_MAP'">
          <h4 class="section-title">{{ t('propsPanel.mapSettings') }}</h4>
          <div class="prop-group"><label>{{ t('propsPanel.mapAddress') }}</label><input v-model="mapAddress" type="text" class="prop-input" :placeholder="t('propsPanel.mapAddressPlaceholder')" @input="updateMapData" /></div>
          <div class="prop-group"><label>{{ t('propsPanel.mapLat') }}</label><input v-model.number="mapLat" type="number" class="prop-input" placeholder="25.033" step="0.001" @input="updateMapData" /><span class="hint-text">{{ t('propsPanel.mapLatHint') }}</span></div>
          <div class="prop-group"><label>{{ t('propsPanel.mapLng') }}</label><input v-model.number="mapLng" type="number" class="prop-input" placeholder="121.565" step="0.001" @input="updateMapData" /><span class="hint-text">{{ t('propsPanel.mapLngHint') }}</span></div>
          <div class="prop-group">
            <label>{{ t('propsPanel.zoomLevel', { n: mapZoom }) }}</label>
            <input v-model.number="mapZoom" type="range" min="10" max="18" class="prop-slider" @input="updateMapData" />
            <div class="slider-labels"><span>{{ t('propsPanel.zoomFar') }}</span><span>{{ t('propsPanel.zoomNear') }}</span></div>
          </div>
          <div class="zoom-presets">
            <button @click="setMapZoom(12)" class="preset-btn" :class="{ active: mapZoom === 12 }">{{ t('propsPanel.zoomCity') }}</button>
            <button @click="setMapZoom(15)" class="preset-btn" :class="{ active: mapZoom === 15 }">{{ t('propsPanel.zoomDistrict') }}</button>
            <button @click="setMapZoom(17)" class="preset-btn" :class="{ active: mapZoom === 17 }">{{ t('propsPanel.zoomBuilding') }}</button>
          </div>
          <div class="padding-section">
            <h5 class="subsection-title">{{ t('propsPanel.elementSpacing') }}</h5>
            <div class="padding-controls">
              <div class="padding-visual"><div class="padding-box">
                <div class="padding-input-group top"><label>{{ t('propsPanel.paddingTop') }}</label><input v-model.number="elementPadding.top" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                <div class="padding-sides">
                  <div class="padding-input-group left"><label>{{ t('propsPanel.paddingLeft') }}</label><input v-model.number="elementPadding.left" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                  <div class="content-preview">{{ t('propsPanel.contentArea') }}</div>
                  <div class="padding-input-group right"><label>{{ t('propsPanel.paddingRight') }}</label><input v-model.number="elementPadding.right" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
                </div>
                <div class="padding-input-group bottom"><label>{{ t('propsPanel.paddingBottom') }}</label><input v-model.number="elementPadding.bottom" type="number" min="0" max="200" step="5" class="padding-input" @input="updateElementPadding" /></div>
              </div></div>
              <div class="padding-presets">
                <button @click="setElementPadding(0)" class="preset-btn">{{ t('propsPanel.paddingNone') }}</button>
                <button @click="setElementPadding(10)" class="preset-btn">{{ t('propsPanel.sizeSmall') }}</button>
                <button @click="setElementPadding(20)" class="preset-btn">{{ t('propsPanel.sizeMedium') }}</button>
                <button @click="setElementPadding(40)" class="preset-btn">{{ t('propsPanel.sizeLarge') }}</button>
              </div>
            </div>
          </div>
          <div class="width-section">
            <h5 class="subsection-title">{{ t('propsPanel.elementWidth') }}</h5>
            <div class="prop-group"><label>{{ t('propsPanel.maxWidth') }}</label><div class="input-with-suffix"><input v-model="elementWidth" type="number" class="prop-input" placeholder="100" min="1" max="100" @input="updateElementWidthDebounced" /><span class="input-suffix">%</span></div></div>
            <div class="width-presets"><button @click="setElementWidth('50')" class="preset-btn">{{ t('propsPanel.halfWidth') }}</button><button @click="setElementWidth('80')" class="preset-btn">{{ t('propsPanel.presetNarrow') }}</button><button @click="setElementWidth('100')" class="preset-btn">{{ t('propsPanel.presetFull') }}</button></div>
          </div>
        </template>

        <template v-else>
          <h4 class="section-title">{{ t('propsPanel.elementInfo') }}</h4>
          <div class="prop-group"><label>{{ t('propsPanel.elementType') }}</label><input :value="selectedElement.element?.type || 'Unknown'" type="text" class="prop-input" disabled /></div>
        </template>
      </div>

      <div v-else-if="selectedCell" class="props-section">
        <h4 class="section-title">{{ t('propsPanel.emptyCell') }}</h4>
        <div class="empty-cell-hint">
          <p>{{ t('propsPanel.emptyCellHint') }}</p>
          <p class="hint">{{ t('propsPanel.emptyCellSub') }}</p>
        </div>
      </div>
    </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import RichTextEditor from './elements/RichTextEditor.vue'

const pageEditorStore = inject('pageEditorStore')
const route = useRoute()
const { t } = useI18n()

const props = defineProps({
  selectedBasemap: { type: Object, default: null },
  selectedFrame: { type: Object, default: null },
  selectedElement: { type: Object, default: null },
  selectedCell: { type: Object, default: null }
})

const emit = defineEmits(['update-logo', 'delete-logo', 'update-cell-padding'])

const isCollapsed = ref(false)

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

const logoAlt = ref('')
const logoWidth = ref('')
const logoHeight = ref('')
const isUploadingLogo = ref(false)
const localLogoSrc = ref(null)

const isUploadingImage = ref(false)
const isUploadingHeroBackground = ref(false)
const isUploadingCarousel = ref(false)
const isUploadingBrightLampBg = ref(false)
const isUploadingBrightLampMain = ref(false)

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

const footerBgColor = ref('#2d2d2d')
const footerTextColor = ref('#ffffff')

const updateFooterStyle = () => {
  if (!props.selectedFrame?.data) return
  props.selectedFrame.data.footerBgColor = footerBgColor.value
  props.selectedFrame.data.footerTextColor = footerTextColor.value
}

const donationBgColorA = ref('#8b7355')
const donationBgColorB = ref('#a0826d')
const donationTextColor = ref('#ffffff')

const updateDonationStyle = () => {
  if (!props.selectedFrame?.data) return
  const a = donationBgColorA.value || '#8b7355'
  const b = donationBgColorB.value?.trim()
  props.selectedFrame.data.donationBgColor = b
    ? `linear-gradient(135deg, ${a} 0%, ${b} 100%)`
    : a
  props.selectedFrame.data.donationTextColor = donationTextColor.value
}

const systemFrameTextTheme = ref('light')
const systemFrameTextColor = ref('#333333')

const textThemeOptions = computed(() => [
  { value: 'light',  label: t('propsPanel.themeLight'), bg: '#f8f8f8',                                fg: '#333333', labelColor: '#444' },
  { value: 'dark',   label: t('propsPanel.themeDark'),  bg: '#1a1a2e',                                fg: '#f0f0f0', labelColor: '#444' },
  { value: 'sepia',  label: t('propsPanel.themeSepia'), bg: '#fdf0dc',                                fg: '#4a3728', labelColor: '#7a5830' },
  { value: 'custom', label: t('propsPanel.themeCustom'),bg: 'linear-gradient(135deg,#ffe0d0,#ffd0f0)', fg: '#c04060', labelColor: '#c04060' },
])

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
const internalPageOptions = computed(() => {
  const tabs = pageEditorStore.headerTabs || []
  return tabs.map(tab => ({
    label: tab.name || tab.slug,
    slug: tab.slug,
  }))
})

// 判斷目前連結類型：'__custom__' 或 internalSlug 值
const buttonLinkType = computed({
  get() {
    const slug = props.selectedElement?.element?.value?.internalSlug
    if (slug && internalPageOptions.value.some(p => p.slug === slug)) return slug
    return '__custom__'
  },
  set(val) {
    const elementValue = props.selectedElement?.element?.value
    if (!elementValue) return
    if (val === '__custom__') {
      elementValue.internalSlug = ''
    } else {
      elementValue.internalSlug = val
      elementValue.url = ''
    }
  }
})

const isCustomButtonLink = computed(() => buttonLinkType.value === '__custom__')
const mapAddress = ref('')
const mapLat = ref(25.033)
const mapLng = ref(121.565)
const mapZoom = ref(15)

const heightPresets = computed(() => [
  { label: t('propsPanel.sizeSmall'),  value: 300 },
  { label: t('propsPanel.sizeMedium'), value: 400 },
  { label: t('propsPanel.sizeLarge'),  value: 500 },
  { label: t('propsPanel.sizeXL'),     value: 600 },
])

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
    elementMetadata.value = { color: null, fontSize: null, fontWeight: 400, textAlign: null, width: null, height: null, backgroundColor: null }
  }
  elementPadding.value = newVal?.element?.padding
    ? { ...newVal.element.padding }
    : { top: 20, right: 20, bottom: 20, left: 20 }
  elementWidth.value = stripPercent(newVal?.element?.width || '100%')
}, { immediate: true, deep: true })

watch(() => props.selectedElement?.data, (newData) => {
  if (props.selectedElement?.type === 'logo' && newData) {
    console.log('Logo data 變化檢測:', newData)
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
  if (newVal && !newVal.type?.startsWith('FRAME') &&
      newVal.type !== 'FIRST_PICTURE' && newVal.type !== 'CAROUSEL_WALL' && newVal.type !== 'BRIGHT_LAMP') {
    systemFrameTextTheme.value = newVal.data?.textTheme || 'light'
    systemFrameTextColor.value = newVal.data?.textColor || '#333333'
  }
  if (newVal?.type === 'CAROUSEL_WALL') {
    carouselWallHeight.value = newVal.data?.carouselWallHeight ?? 600
    carouselWallAutoPlay.value = newVal.data?.carouselWallAutoPlay ?? true
    carouselWallInterval.value = newVal.data?.carouselWallInterval ?? 5000
  }
  if (newVal?.type === 'FOOTER') {
    footerBgColor.value = newVal.data?.footerBgColor || '#2d2d2d'
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

watch(() => props.selectedFrame, () => {
  expandedCardStyles.value = []
})

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
      if (idx !== cellIndex && frame.elements[idx]?.type) frame.elements[idx].width = newWidth
    })
    otherSideCells.forEach(idx => {
      if (frame.elements[idx]?.type) frame.elements[idx].width = otherWidth
    })
    return
  }
  const rowCells = getRowCells(layout, cellIndex)
  if (rowCells.length <= 1) return
  const remainingWidth = 100 - currentWidth
  const widthPerCell = remainingWidth / (rowCells.length - 1)
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
    case '2_2': { const row = currentIndex < 2 ? 0 : 1; const start = row * 2; return [start, start + 1] }
    case '2_3': { const row = currentIndex < 3 ? 0 : 1; const start = row * 3; return [start, start + 1, start + 2] }
    case '2_4': { const row = currentIndex < 4 ? 0 : 1; const start = row * 4; return [start, start + 1, start + 2, start + 3] }
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

const handleUploadLogo = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      isUploadingLogo.value = true
      const uploadedFile = await pageEditorStore.uploadImage(file)
      if (!uploadedFile) { alert('Logo 上傳失敗，請稍後再試'); return }
      localLogoSrc.value = uploadedFile.fileUrl
      emit('update-logo', { id: uploadedFile.id, src: uploadedFile.fileUrl })
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error('Logo 上傳失敗:', error)
      alert('Logo 上傳失敗: ' + error.message)
    } finally {
      isUploadingLogo.value = false
    }
  }
  input.click()
}

const handleLogoImageError = (e) => {
  console.error('Logo 圖片載入失敗:', e.target.src)
  alert('Logo 圖片載入失敗，請重新上傳')
}

const handleDeleteLogoFromPanel = () => {
  localLogoSrc.value = null
  emit('delete-logo')
}

const handleUploadImage = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      isUploadingImage.value = true
      const uploadedFile = await pageEditorStore.uploadImage(file)
      if (!uploadedFile) { alert('圖片上傳失敗，請稍後再試'); return }
      if (props.selectedElement?.element?.value) {
        props.selectedElement.element.value.id = uploadedFile.id
        props.selectedElement.element.value.src = uploadedFile.fileUrl
      }
    } catch (error) {
      console.error('圖片上傳失敗:', error)
      alert('圖片上傳失敗: ' + error.message)
    } finally {
      isUploadingImage.value = false
    }
  }
  input.click()
}

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
      console.error('輪播圖片上傳失敗:', error)
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
      const uploadedFile = await pageEditorStore.uploadImage(file)
      if (!uploadedFile) { alert('首圖背景上傳失敗，請稍後再試'); return }
      if (props.selectedFrame?.data) {
        props.selectedFrame.data.heroBgImgId = uploadedFile.id
        props.selectedFrame.data.heroBgImgSrc = uploadedFile.fileUrl
      }
    } catch (error) {
      console.error('首圖背景上傳失敗:', error)
      alert('首圖背景上傳失敗: ' + error.message)
    } finally {
      isUploadingHeroBackground.value = false
    }
  }
  input.click()
}

const handleUploadBrightLampBg = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      isUploadingBrightLampBg.value = true
      const uploaded = await pageEditorStore.uploadImage(file)
      if (!uploaded) { alert('上傳失敗，請稍後再試'); return }
      if (props.selectedFrame?.data) {
        props.selectedFrame.data.bgImgId  = uploaded.id
        props.selectedFrame.data.bgImgSrc = uploaded.fileUrl
      }
    } catch (err) {
      console.error('背景圖上傳失敗:', err)
      alert('上傳失敗：' + err.message)
    } finally {
      isUploadingBrightLampBg.value = false
    }
  }
  input.click()
}

const handleUploadBrightLampMain = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      isUploadingBrightLampMain.value = true
      const uploaded = await pageEditorStore.uploadImage(file)
      if (!uploaded) { alert('上傳失敗，請稍後再試'); return }
      if (props.selectedFrame?.data) {
        props.selectedFrame.data.mainImgId  = uploaded.id
        props.selectedFrame.data.mainImgSrc = uploaded.fileUrl
      }
    } catch (err) {
      console.error('主神像上傳失敗:', err)
      alert('上傳失敗：' + err.message)
    } finally {
      isUploadingBrightLampMain.value = false
    }
  }
  input.click()
}

const setBrightLampOption = (field, value) => {
  if (!props.selectedFrame?.data) return
  props.selectedFrame.data[field] = value
}

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
      console.error('輪播牆圖片上傳失敗:', error)
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

const carouselWallDragOver = ref(null)
const carouselWallDragIndex = ref(null)

const onCarouselWallDragStart = (index) => { carouselWallDragIndex.value = index }

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

const carouselDragOver = ref(null)
const carouselDragIndex = ref(null)

const onCarouselDragStart = (index) => { carouselDragIndex.value = index }

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
  position: relative;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.props-panel.is-collapsed { width: 36px; }

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
  &:hover { background: #E8572A; border-color: #E8572A; color: #fff; box-shadow: 0 4px 12px rgba(232, 87, 42, 0.3); }
}

.collapse-icon {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: block;
  &.is-flipped { transform: rotate(180deg); }
}

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
}

.color-quick-btns {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-top: 10px;
}

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

  .theme-btn-dots { display: flex; gap: 3px; align-items: center; }
  .dot { width: 5px; height: 5px; border-radius: 50%; }

  .theme-btn-label {
    padding: 6px 4px;
    font-size: 12px;
    font-weight: 600;
    background: rgba(0,0,0,0.04);
    border-top: 1px solid rgba(0,0,0,0.06);
    color: #555;
    white-space: nowrap;
  }

  &:hover { transform: translateY(-2px); border-color: #ccc; box-shadow: 0 4px 12px rgba(0,0,0,0.12); }

  &.active {
    border-color: #E8572A;
    box-shadow: 0 0 0 3px rgba(232,87,42,0.15);
    .theme-btn-label { background: rgba(232,87,42,0.08); color: #E8572A; }
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

.input-with-suffix {
  display: flex;
  align-items: stretch;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  transition: border-color 0.2s;
  &:focus-within { border-color: #E8572A; }
  .prop-input { border: none; border-radius: 0; flex: 1; min-width: 0; &:focus { border-color: transparent; box-shadow: none; } }
  .input-suffix { padding: 0 12px; background: #f5f5f5; color: #555; font-size: 13px; font-weight: 600; border-left: 1px solid #ddd; display: flex; align-items: center; user-select: none; }
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

.logo-preview { max-height: 100px; object-fit: contain; background: #f9f9f9; padding: 10px; }

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

.delete-logo-btn {
  padding: 8px 16px;
  background: #fff;
  color: #e53935;
  border: 1px solid #e53935;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: #ffeaea; }
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

.width-presets { grid-template-columns: repeat(3, 1fr); }
.zoom-presets { grid-template-columns: repeat(3, 1fr); }

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
}

.card-thumbnail { width: 56px; height: 36px; object-fit: cover; border-radius: 4px; flex-shrink: 0; border: 1px solid #ddd; }
.card-index { flex: 1; font-size: 12px; font-weight: 600; color: #555; }

.remove-image-btn.card-remove {
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

.card-input { font-size: 12px !important; padding: 6px 8px !important; }
.card-textarea { font-size: 12px !important; padding: 6px 8px !important; resize: none; }

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

.card-toggle-icon { font-size: 10px; color: #888; }
.card-slider { width: 100%; }

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

.padding-presets { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }

.panel-body::-webkit-scrollbar { width: 6px; }
.panel-body::-webkit-scrollbar-track { background: #f1f1f1; }
.panel-body::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; &:hover { background: #ccc; } }

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

.slider-labels { display: flex; justify-content: space-between; margin-top: 4px; span { font-size: 11px; color: #999; } }
.font-weight-labels { display: flex; justify-content: space-between; margin-top: 4px; span { font-size: 11px; color: #999; } }
.label-value { font-weight: normal; color: #E8572A; font-size: 12px; margin-left: 6px; }

.font-size-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
  .font-size-input { width: 70px; flex-shrink: 0; }
  .font-size-presets { display: flex; gap: 4px; flex: 1; .preset-btn { flex: 1; padding: 8px 2px; font-size: 12px; } }
}

.unit-hint { display: block; margin-top: 4px; font-size: 11px; color: #999; }

/* 光明燈：邊框 / 柱子選項 */
.border-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.border-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  color: #666;
  &:hover { border-color: #E8572A; }
  &.active { border-color: #E8572A; background: rgba(232, 87, 42, 0.05); color: #E8572A; font-weight: 500; }
}

.option-preview {
  width: 80px;
  height: 48px;
  object-fit: contain;
  border-radius: 4px;
}

.option-preview--pillar {
  width: 32px;
  height: 64px;
  object-fit: contain;
}
.internal-link-select {
  font-size: 13px;
  color: #555;
  background: #fafafa;
  border-color: #ddd;
  cursor: pointer;
}
</style>
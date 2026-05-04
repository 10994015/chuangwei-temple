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
                  <img :src="img.srcDesktop || img.src" :alt="t('propsPanel.imgAlt', { n: index + 1 })" class="card-thumbnail" />
                  <span class="card-index">{{ t('propsPanel.imgIndex', { n: index + 1 }) }}</span>
                  <button class="remove-image-btn card-remove" @click="removeCarouselWallImage(index)" :title="t('propsPanel.deleteImg')">✕</button>
                </div>
                <!-- 三裝置圖片上傳 -->
                <div class="device-img-section">
                  <div v-for="slot in carouselDeviceSlots" :key="slot.key" class="device-img-row">
                    <span class="device-tag">{{ slot.label }}</span>
                    <template v-if="img[slot.key]">
                      <img :src="img[slot.key]" class="device-thumb" />
                      <button class="device-remove-btn" @click="removeCarouselWallDeviceImg(index, slot.key)">✕</button>
                    </template>
                    <button
                      v-else
                      class="device-upload-btn"
                      :disabled="carouselWallUploadingSlot?.index === index && carouselWallUploadingSlot?.key === slot.key"
                      @click="uploadCarouselWallDeviceImg(index, slot.key)"
                    >
                      {{ (carouselWallUploadingSlot?.index === index && carouselWallUploadingSlot?.key === slot.key) ? '上傳中...' : '上傳' }}
                    </button>
                  </div>
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

        <template v-else-if="selectedFrame.type === 'PV_CAROUSEL_WALL'">
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
                  <img v-if="img.srcDesktop || img.src" :src="img.srcDesktop || img.src" :alt="t('propsPanel.imgAlt', { n: index + 1 })" class="card-thumbnail" />
                  <span class="card-index">{{ t('propsPanel.imgIndex', { n: index + 1 }) }}</span>
                  <button class="remove-image-btn card-remove" @click="removeCarouselWallImage(index)" :title="t('propsPanel.deleteImg')">✕</button>
                </div>
                <!-- 三裝置圖片上傳 -->
                <div class="device-img-section">
                  <div v-for="slot in carouselDeviceSlots" :key="slot.key" class="device-img-row">
                    <span class="device-tag">{{ slot.label }}</span>
                    <template v-if="img[slot.key]">
                      <img :src="img[slot.key]" class="device-thumb" />
                      <button class="device-remove-btn" @click="removeCarouselWallDeviceImg(index, slot.key)">✕</button>
                    </template>
                    <button
                      v-else
                      class="device-upload-btn"
                      :disabled="carouselWallUploadingSlot?.index === index && carouselWallUploadingSlot?.key === slot.key"
                      @click="uploadCarouselWallDeviceImg(index, slot.key)"
                    >
                      {{ (carouselWallUploadingSlot?.index === index && carouselWallUploadingSlot?.key === slot.key) ? '上傳中...' : '上傳' }}
                    </button>
                  </div>
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

        <template v-else-if="selectedFrame.type === 'FOOTER' || selectedFrame.type === 'PV_FOOTER'">
          <h4 class="section-title">{{ t('propsPanel.footerSettings') }}</h4>

          <!-- Logo 圖片 -->
          <div class="metadata-section">
            <h5 class="subsection-title">Logo 圖片</h5>
            <div class="prop-group">
              <div class="image-upload">
                <div v-if="isUploadingFooterLogo" class="uploading-state">
                  <div class="spinner"></div>
                  <span>上傳中...</span>
                </div>
                <img v-else-if="selectedFrame.data?.logoImgSrc" :src="selectedFrame.data.logoImgSrc" alt="Logo 預覽" class="preview-image logo-preview" />
                <div v-else class="no-image"><span>尚未上傳 Logo</span></div>
                <button @click="handleUploadFooterLogo" class="upload-btn" :disabled="isUploadingFooterLogo">
                  {{ isUploadingFooterLogo ? '上傳中...' : (selectedFrame.data?.logoImgSrc ? '更換 Logo' : '上傳 Logo') }}
                </button>
                <button v-if="selectedFrame.data?.logoImgSrc" @click="removeFooterLogo" class="delete-logo-btn">移除 Logo</button>
              </div>
            </div>
          </div>

          <!-- 聯絡資訊 -->
          <div class="metadata-section">
            <h5 class="subsection-title">聯絡我們</h5>
            <div class="prop-group">
              <label>地址</label>
              <input v-model="footerAddress" type="text" class="prop-input" placeholder="請輸入地址" @input="updateFooterContact" />
            </div>
            <div class="prop-group">
              <label>電話</label>
              <input v-model="footerPhone" type="text" class="prop-input" placeholder="請輸入電話" @input="updateFooterContact" />
            </div>
          </div>

          <!-- 背景色 -->
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
          <!-- 文字色 -->
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
        <template v-else-if="selectedFrame.type === 'PV_PORTAL_PICTURE'">
          <h4 class="section-title">品牌首頁設定</h4>

          <!-- 未選取子區塊時顯示提示 -->
          <template v-if="!pvSubSection">
            <div class="pv-fp-section-hint">
              <p>點擊畫面上的區塊進行編輯</p>
              <div class="pv-fp-section-btns">
                <button class="pv-fp-section-btn" @click="pvSubSection = 'logo'">Logo 區塊</button>
                <button class="pv-fp-section-btn" @click="pvSubSection = 'hero'">主標題區塊</button>
                <button class="pv-fp-section-btn" @click="pvSubSection = 'buttons'">按鈕區塊</button>
              </div>
            </div>
            <div class="metadata-section">
              <h5 class="subsection-title">Copyright 文字</h5>
              <div class="prop-group">
                <input v-model="pvFpCopyright" type="text" class="prop-input" placeholder="Copyright © 2025 ..." @input="updatePvFpData" />
              </div>
            </div>
          </template>

          <!-- Logo 區塊 -->
          <template v-else-if="pvSubSection === 'logo'">
            <button class="pv-fp-back-btn" @click="pvSubSection = null">← 返回</button>
            <h5 class="subsection-title" style="margin-top: 12px;">Logo 圖片</h5>
            <div class="prop-group">
              <div class="image-upload">
                <div v-if="isUploadingPvFpLogo" class="uploading-state">
                  <div class="spinner"></div>
                  <span>上傳中...</span>
                </div>
                <img v-else-if="selectedFrame.data?.logoImgSrc" :src="selectedFrame.data.logoImgSrc" alt="Logo 預覽" class="preview-image logo-preview" />
                <div v-else class="no-image"><span>尚未上傳 Logo</span></div>
                <button @click="handleUploadPvFpLogo" class="upload-btn" :disabled="isUploadingPvFpLogo">
                  {{ isUploadingPvFpLogo ? '上傳中...' : (selectedFrame.data?.logoImgSrc ? '更換 Logo' : '上傳 Logo') }}
                </button>
                <button v-if="selectedFrame.data?.logoImgSrc" @click="removePvFpLogo" class="delete-logo-btn">移除 Logo</button>
              </div>
            </div>
            <div class="prop-group">
              <label>寬度（px，留空自動）</label>
              <div class="input-with-suffix">
                <input v-model="pvFpLogoWidth" type="number" class="prop-input" placeholder="自動" min="1" @input="updatePvFpData" />
                <span class="input-suffix">px</span>
              </div>
            </div>
            <div class="prop-group">
              <label>高度（px，留空自動）</label>
              <div class="input-with-suffix">
                <input v-model="pvFpLogoHeight" type="number" class="prop-input" placeholder="自動" min="1" @input="updatePvFpData" />
                <span class="input-suffix">px</span>
              </div>
            </div>
            <div class="metadata-section">
              <h5 class="subsection-title">品牌名稱</h5>
              <div class="prop-group">
                <label>文字（留空不顯示）</label>
                <input v-model="pvFpBrandName" type="text" class="prop-input" placeholder="宮掌櫃" @input="updatePvFpData" />
              </div>
              <div class="prop-group">
                <label>顏色</label>
                <div class="color-input-group">
                  <input :value="pvFpBrandColor" type="color" class="prop-color" @input="pvFpBrandColor = $event.target.value; updatePvFpData()" />
                  <input v-model="pvFpBrandColor" type="text" class="prop-input color-text" placeholder="#E8572A" @input="updatePvFpData" />
                </div>
              </div>
            </div>
            <div class="padding-section">
              <h5 class="subsection-title">區塊間距</h5>
              <div class="padding-controls">
                <div class="padding-visual"><div class="padding-box">
                  <div class="padding-input-group top"><label>上</label><input v-model.number="pvFpLogoPadding.top" type="number" min="0" max="200" step="4" class="padding-input" @input="updatePvFpPadding('logo')" /></div>
                  <div class="padding-sides">
                    <div class="padding-input-group left"><label>左</label><input v-model.number="pvFpLogoPadding.left" type="number" min="0" max="200" step="4" class="padding-input" @input="updatePvFpPadding('logo')" /></div>
                    <div class="content-preview">Logo</div>
                    <div class="padding-input-group right"><label>右</label><input v-model.number="pvFpLogoPadding.right" type="number" min="0" max="200" step="4" class="padding-input" @input="updatePvFpPadding('logo')" /></div>
                  </div>
                  <div class="padding-input-group bottom"><label>下</label><input v-model.number="pvFpLogoPadding.bottom" type="number" min="0" max="200" step="4" class="padding-input" @input="updatePvFpPadding('logo')" /></div>
                </div></div>
                <div class="padding-presets">
                  <button @click="setPvFpPadding('logo', 0)" class="preset-btn">無</button>
                  <button @click="setPvFpPadding('logo', 16)" class="preset-btn">小</button>
                  <button @click="setPvFpPadding('logo', 32)" class="preset-btn">中</button>
                  <button @click="setPvFpPadding('logo', 56)" class="preset-btn">大</button>
                </div>
              </div>
            </div>
          </template>

          <!-- 主標題區塊 -->
          <template v-else-if="pvSubSection === 'hero'">
            <button class="pv-fp-back-btn" @click="pvSubSection = null">← 返回</button>
            <h5 class="subsection-title" style="margin-top: 12px;">標題圖片（圖在文字上方）</h5>
            <div class="prop-group">
              <div class="image-upload">
                <div v-if="isUploadingPvFpHeroImg" class="uploading-state">
                  <div class="spinner"></div>
                  <span>上傳中...</span>
                </div>
                <img v-else-if="selectedFrame.data?.heroImgSrc" :src="selectedFrame.data.heroImgSrc" alt="標題圖預覽" class="preview-image" />
                <div v-else class="no-image"><span>尚未上傳標題圖</span></div>
                <button @click="handleUploadPvFpHeroImg" class="upload-btn" :disabled="isUploadingPvFpHeroImg">
                  {{ isUploadingPvFpHeroImg ? '上傳中...' : (selectedFrame.data?.heroImgSrc ? '更換標題圖' : '上傳標題圖') }}
                </button>
                <button v-if="selectedFrame.data?.heroImgSrc" @click="removePvFpHeroImg" class="delete-logo-btn">移除標題圖</button>
              </div>
            </div>
            <div class="prop-group">
              <label>圖片寬度（px，留空 100%）</label>
              <div class="input-with-suffix">
                <input v-model="pvFpHeroImgWidth" type="number" class="prop-input" placeholder="100%" min="1" @input="updatePvFpData" />
                <span class="input-suffix">px</span>
              </div>
            </div>
            <div class="prop-group">
              <label>圖片高度（px，留空自動）</label>
              <div class="input-with-suffix">
                <input v-model="pvFpHeroImgHeight" type="number" class="prop-input" placeholder="自動" min="1" @input="updatePvFpData" />
                <span class="input-suffix">px</span>
              </div>
            </div>
            <div class="metadata-section">
              <h5 class="subsection-title">標題文字</h5>
              <div class="prop-group">
                <label>文字（留空不顯示，可用 \n 換行）</label>
                <textarea v-model="pvFpTitle" class="prop-textarea" rows="3" placeholder="在宮掌櫃，&#10;遇見你的神明" @input="updatePvFpData"></textarea>
              </div>
              <div class="prop-group">
                <label>文字大小（px，留空預設 64px）</label>
                <div class="input-with-suffix">
                  <input v-model="pvFpTitleFontSize" type="number" class="prop-input" placeholder="64" min="12" @input="updatePvFpData" />
                  <span class="input-suffix">px</span>
                </div>
              </div>
              <div class="prop-group">
                <label>文字顏色</label>
                <div class="color-input-group">
                  <input :value="pvFpTitleColor" type="color" class="prop-color" @input="pvFpTitleColor = $event.target.value; updatePvFpData()" />
                  <input v-model="pvFpTitleColor" type="text" class="prop-input color-text" placeholder="#1a1a1a" @input="updatePvFpData" />
                </div>
              </div>
            </div>
            <div class="padding-section">
              <h5 class="subsection-title">區塊間距</h5>
              <div class="padding-controls">
                <div class="padding-visual"><div class="padding-box">
                  <div class="padding-input-group top"><label>上</label><input v-model.number="pvFpHeroPadding.top" type="number" min="0" max="200" step="4" class="padding-input" @input="updatePvFpPadding('hero')" /></div>
                  <div class="padding-sides">
                    <div class="padding-input-group left"><label>左</label><input v-model.number="pvFpHeroPadding.left" type="number" min="0" max="200" step="4" class="padding-input" @input="updatePvFpPadding('hero')" /></div>
                    <div class="content-preview">主標題</div>
                    <div class="padding-input-group right"><label>右</label><input v-model.number="pvFpHeroPadding.right" type="number" min="0" max="200" step="4" class="padding-input" @input="updatePvFpPadding('hero')" /></div>
                  </div>
                  <div class="padding-input-group bottom"><label>下</label><input v-model.number="pvFpHeroPadding.bottom" type="number" min="0" max="200" step="4" class="padding-input" @input="updatePvFpPadding('hero')" /></div>
                </div></div>
                <div class="padding-presets">
                  <button @click="setPvFpPadding('hero', 0)" class="preset-btn">無</button>
                  <button @click="setPvFpPadding('hero', 16)" class="preset-btn">小</button>
                  <button @click="setPvFpPadding('hero', 32)" class="preset-btn">中</button>
                  <button @click="setPvFpPadding('hero', 56)" class="preset-btn">大</button>
                </div>
              </div>
            </div>
          </template>

          <!-- 按鈕區塊 -->
          <template v-else-if="pvSubSection === 'buttons'">
            <button class="pv-fp-back-btn" @click="pvSubSection = null">← 返回</button>
            <h5 class="subsection-title" style="margin-top: 12px;">按鈕列表</h5>
            <div v-for="(btn, i) in pvFpButtons" :key="i" class="pv-fp-btn-editor">
              <div class="pv-fp-btn-header">
                <span class="pv-fp-btn-label">按鈕 {{ i + 1 }}</span>
                <button class="pv-fp-btn-remove" @click="removePvFpButton(i)">✕</button>
              </div>
              <div class="prop-group">
                <label>文字</label>
                <input v-model="btn.text" type="text" class="prop-input" placeholder="按鈕文字" @input="updatePvFpData" />
              </div>
              <div class="prop-group">
                <label>連結</label>
                <select
                  v-model="pvFpBtnLinkTypes[i]"
                  class="prop-select internal-link-select"
                  @change="onPvFpBtnLinkTypeChange(i, $event.target.value)"
                >
                  <option value="__custom__">自訂網址</option>
                  <option
                    v-for="page in internalPageOptions"
                    :key="page.slug"
                    :value="page.slug"
                  >{{ page.label }}</option>
                </select>
                <input
                  v-if="pvFpBtnLinkTypes[i] === '__custom__'"
                  v-model="btn.url"
                  type="text"
                  class="prop-input"
                  style="margin-top: 8px;"
                  placeholder="https://..."
                  @input="updatePvFpData"
                />
              </div>
              <div class="prop-group">
                <label>顏色（留空套用全域色）</label>
                <div class="color-input-group">
                  <input :value="btn.color || pvFpBtnColor" type="color" class="prop-color" @input="btn.color = $event.target.value; updatePvFpData()" />
                  <input v-model="btn.color" type="text" class="prop-input color-text" placeholder="#E8572A" @input="updatePvFpData" />
                  <button @click="btn.color = null; updatePvFpData()" class="clear-btn" title="使用全域顏色">✕</button>
                </div>
              </div>
            </div>
            <button class="upload-btn" style="margin-top: 8px;" @click="addPvFpButton">+ 新增按鈕</button>
            <div class="metadata-section">
              <h5 class="subsection-title">全域按鈕顏色</h5>
              <div class="prop-group">
                <div class="color-input-group">
                  <input :value="pvFpBtnColor" type="color" class="prop-color" @input="pvFpBtnColor = $event.target.value; updatePvFpData()" />
                  <input v-model="pvFpBtnColor" type="text" class="prop-input color-text" placeholder="#E8572A" @input="updatePvFpData" />
                </div>
                <span class="unit-hint">未設定個別顏色的按鈕將套用此顏色</span>
              </div>
            </div>
            <div class="padding-section">
              <h5 class="subsection-title">區塊間距</h5>
              <div class="padding-controls">
                <div class="padding-visual"><div class="padding-box">
                  <div class="padding-input-group top"><label>上</label><input v-model.number="pvFpButtonsPadding.top" type="number" min="0" max="200" step="4" class="padding-input" @input="updatePvFpPadding('buttons')" /></div>
                  <div class="padding-sides">
                    <div class="padding-input-group left"><label>左</label><input v-model.number="pvFpButtonsPadding.left" type="number" min="0" max="200" step="4" class="padding-input" @input="updatePvFpPadding('buttons')" /></div>
                    <div class="content-preview">按鈕</div>
                    <div class="padding-input-group right"><label>右</label><input v-model.number="pvFpButtonsPadding.right" type="number" min="0" max="200" step="4" class="padding-input" @input="updatePvFpPadding('buttons')" /></div>
                  </div>
                  <div class="padding-input-group bottom"><label>下</label><input v-model.number="pvFpButtonsPadding.bottom" type="number" min="0" max="200" step="4" class="padding-input" @input="updatePvFpPadding('buttons')" /></div>
                </div></div>
                <div class="padding-presets">
                  <button @click="setPvFpPadding('buttons', 0)" class="preset-btn">無</button>
                  <button @click="setPvFpPadding('buttons', 16)" class="preset-btn">小</button>
                  <button @click="setPvFpPadding('buttons', 32)" class="preset-btn">中</button>
                  <button @click="setPvFpPadding('buttons', 56)" class="preset-btn">大</button>
                </div>
              </div>
            </div>
          </template>

        </template>

        <!-- PV_CUSTOM_FRAME1：點擊卡片後才顯示編輯 -->
        <template v-else-if="selectedFrame.type === 'PV_CUSTOM_FRAME1'">
          <h4 class="section-title">數位生態系統框架</h4>
          <div class="cf1-hint">
            <p>點擊畫布上的卡片以編輯其內容</p>
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

        <!-- PV_CUSTOM_FRAME1 卡片編輯 -->
        <template v-if="selectedElement.element?.type === 'CF1_ITEM'">
          <h4 class="section-title">
            {{ ['宮廟地圖 (大卡)', '靈籤司 (右欄)', '主平台服務 (左下)', '宮廟網站建置 (右下)'][selectedElement.element.itemIndex] }}
          </h4>

          <div class="prop-group">
            <label>標題</label>
            <RichTextEditor
              :model-value="cf1Items[selectedElement.element.itemIndex]?.title"
              @update:modelValue="cf1Items[selectedElement.element.itemIndex].title = $event; updateCf1()"
            />
          </div>

          <div class="prop-group">
            <label>說明文字</label>
            <RichTextEditor
              :model-value="cf1Items[selectedElement.element.itemIndex]?.description"
              @update:modelValue="cf1Items[selectedElement.element.itemIndex].description = $event; updateCf1()"
            />
          </div>

          <template v-if="selectedElement.element.itemIndex === 0 || selectedElement.element.itemIndex === 1">
            <div class="prop-group">
              <label>圖片</label>
              <div v-if="cf1Items[selectedElement.element.itemIndex]?.image" class="cf1-image-preview">
                <img :src="cf1Items[selectedElement.element.itemIndex].image" class="cf1-preview-img" />
                <button class="remove-img-btn" @click="removeCf1Image(selectedElement.element.itemIndex)">移除</button>
              </div>
              <button v-else class="upload-btn" :disabled="cf1Uploading[selectedElement.element.itemIndex]" @click="handleUploadCf1Image(selectedElement.element.itemIndex)">
                <template v-if="cf1Uploading[selectedElement.element.itemIndex]"><span class="btn-spinner"></span>上傳中...</template>
                <template v-else>上傳圖片</template>
              </button>
            </div>
            <div class="prop-group">
              <label>圖片尺寸</label>
              <div class="cf1-size-row">
                <div class="cf1-size-field">
                  <span class="cf1-size-label">寬</span>
                  <input
                    type="number"
                    class="prop-input cf1-size-input"
                    placeholder="自動"
                    :value="cf1Items[selectedElement.element.itemIndex]?.imageWidth"
                    @input="cf1Items[selectedElement.element.itemIndex].imageWidth = $event.target.value ? Number($event.target.value) : null; updateCf1()"
                  />
                  <span class="cf1-size-unit">px</span>
                </div>
                <div class="cf1-size-field">
                  <span class="cf1-size-label">高</span>
                  <input
                    type="number"
                    class="prop-input cf1-size-input"
                    placeholder="自動"
                    :value="cf1Items[selectedElement.element.itemIndex]?.imageHeight"
                    @input="cf1Items[selectedElement.element.itemIndex].imageHeight = $event.target.value ? Number($event.target.value) : null; updateCf1()"
                  />
                  <span class="cf1-size-unit">px</span>
                </div>
              </div>
            </div>
            <div class="prop-group">
              <label>圓角</label>
              <div class="cf1-size-field">
                <input
                  type="number"
                  class="prop-input cf1-size-input"
                  placeholder="0"
                  :value="cf1Items[selectedElement.element.itemIndex]?.imageBorderRadius"
                  @input="cf1Items[selectedElement.element.itemIndex].imageBorderRadius = $event.target.value ? Number($event.target.value) : null; updateCf1()"
                />
                <span class="cf1-size-unit">px</span>
              </div>
            </div>
            <div class="prop-group">
              <label>邊框</label>
              <div class="cf1-size-row">
                <div class="cf1-size-field">
                  <span class="cf1-size-label">粗細</span>
                  <input
                    type="number"
                    class="prop-input cf1-size-input"
                    placeholder="0"
                    :value="cf1Items[selectedElement.element.itemIndex]?.imageBorderWidth"
                    @input="cf1Items[selectedElement.element.itemIndex].imageBorderWidth = $event.target.value ? Number($event.target.value) : null; updateCf1()"
                  />
                  <span class="cf1-size-unit">px</span>
                </div>
                <div class="cf1-size-field">
                  <span class="cf1-size-label">顏色</span>
                  <div class="color-input-group" style="flex:1">
                    <input
                      type="color"
                      class="prop-color"
                      :value="cf1Items[selectedElement.element.itemIndex]?.imageBorderColor || '#000000'"
                      @input="cf1Items[selectedElement.element.itemIndex].imageBorderColor = $event.target.value; updateCf1()"
                    />
                    <input
                      type="text"
                      class="prop-input color-text"
                      placeholder="#000000"
                      :value="cf1Items[selectedElement.element.itemIndex]?.imageBorderColor"
                      @input="cf1Items[selectedElement.element.itemIndex].imageBorderColor = $event.target.value; updateCf1()"
                    />
                  </div>
                </div>
              </div>
            </div>
          <div class="padding-section">
            <h5 class="subsection-title">區塊內距 <span class="padding-device-badge">{{ paddingDeviceLabel }}</span></h5>
            <div class="padding-controls">
              <div class="padding-visual"><div class="padding-box">
                <div class="padding-input-group top">
                  <label>上</label>
                  <input type="number" min="0" max="200" step="4" class="padding-input"
                    :value="cf1Items[selectedElement.element.itemIndex]?.padding?.[paddingDeviceKey]?.top ?? 0"
                    @input="setCf1Padding(selectedElement.element.itemIndex, 'top', $event.target.value)"
                  />
                </div>
                <div class="padding-sides">
                  <div class="padding-input-group left">
                    <label>左</label>
                    <input type="number" min="0" max="200" step="4" class="padding-input"
                      :value="cf1Items[selectedElement.element.itemIndex]?.padding?.[paddingDeviceKey]?.left ?? 0"
                      @input="setCf1Padding(selectedElement.element.itemIndex, 'left', $event.target.value)"
                    />
                  </div>
                  <div class="content-preview">卡片</div>
                  <div class="padding-input-group right">
                    <label>右</label>
                    <input type="number" min="0" max="200" step="4" class="padding-input"
                      :value="cf1Items[selectedElement.element.itemIndex]?.padding?.[paddingDeviceKey]?.right ?? 0"
                      @input="setCf1Padding(selectedElement.element.itemIndex, 'right', $event.target.value)"
                    />
                  </div>
                </div>
                <div class="padding-input-group bottom">
                  <label>下</label>
                  <input type="number" min="0" max="200" step="4" class="padding-input"
                    :value="cf1Items[selectedElement.element.itemIndex]?.padding?.[paddingDeviceKey]?.bottom ?? 0"
                    @input="setCf1Padding(selectedElement.element.itemIndex, 'bottom', $event.target.value)"
                  />
                </div>
              </div></div>
              <div class="padding-presets">
                <button class="preset-btn" @click="['top','right','bottom','left'].forEach(f => setCf1Padding(selectedElement.element.itemIndex, f, 0))">無</button>
                <button class="preset-btn" @click="['top','right','bottom','left'].forEach(f => setCf1Padding(selectedElement.element.itemIndex, f, 8))">小</button>
                <button class="preset-btn" @click="['top','right','bottom','left'].forEach(f => setCf1Padding(selectedElement.element.itemIndex, f, 16))">中</button>
                <button class="preset-btn" @click="['top','right','bottom','left'].forEach(f => setCf1Padding(selectedElement.element.itemIndex, f, 32))">大</button>
              </div>
            </div>
          </div>
          </template>
        </template>

        <template v-else-if="selectedElement.type === 'logo'">
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
                <input :value="elementMetadata.color || '#000000'" type="color" class="prop-color" @input="elementMetadata.color = $event.target.value; updateMetadata()" />
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
                <input :value="elementMetadata.backgroundColor || '#ffffff'" type="color" class="prop-color" @input="elementMetadata.backgroundColor = $event.target.value; updateMetadata()" />
                <input v-model="elementMetadata.backgroundColor" type="text" class="prop-input color-text" placeholder="transparent" @input="updateMetadata" />
                <button @click="elementMetadata.backgroundColor = null; updateMetadata()" class="clear-btn" :title="t('propsPanel.clearBtn')">✕</button>
              </div>
            </div>
          </div>
          <div class="padding-section">
            <h5 class="subsection-title">{{ t('propsPanel.elementSpacing') }} <span class="padding-device-badge">{{ paddingDeviceLabel }}</span></h5>
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
            <h5 class="subsection-title">{{ t('propsPanel.elementSpacing') }} <span class="padding-device-badge">{{ paddingDeviceLabel }}</span></h5>
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
                <input :value="elementMetadata.color || '#000000'" type="color" class="prop-color" @input="elementMetadata.color = $event.target.value; updateMetadata()" />
                <input v-model="elementMetadata.color" type="text" class="prop-input color-text" placeholder="#ffffff" @input="updateMetadata" />
                <button @click="elementMetadata.color = null; updateMetadata()" class="clear-btn" :title="t('propsPanel.clearBtn')">✕</button>
              </div>
            </div>
            <div class="prop-group">
              <label>{{ t('propsPanel.backgroundColor') }}</label>
              <div class="color-input-group">
                <input :value="elementMetadata.backgroundColor || '#ffffff'" type="color" class="prop-color" @input="elementMetadata.backgroundColor = $event.target.value; updateMetadata()" />
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
            <div class="prop-group">
              <label>{{ t('propsPanel.borderRadius') }}</label>
              <div class="font-size-row">
                <input v-model="elementMetadata.borderRadius" type="number" min="0" max="999" class="prop-input font-size-input" placeholder="6" @input="updateMetadata" />
                <div class="font-size-presets">
                  <button @click="elementMetadata.borderRadius = '0';   updateMetadata()" class="preset-btn" :class="{ active: elementMetadata.borderRadius === '0'   }">直角</button>
                  <button @click="elementMetadata.borderRadius = '6';   updateMetadata()" class="preset-btn" :class="{ active: elementMetadata.borderRadius === '6'   }">小</button>
                  <button @click="elementMetadata.borderRadius = '20';  updateMetadata()" class="preset-btn" :class="{ active: elementMetadata.borderRadius === '20'  }">中</button>
                  <button @click="elementMetadata.borderRadius = '999'; updateMetadata()" class="preset-btn" :class="{ active: elementMetadata.borderRadius === '999' }">圓</button>
                </div>
              </div>
            </div>
          </div>
          <div class="padding-section">
            <h5 class="subsection-title">{{ t('propsPanel.elementSpacing') }} <span class="padding-device-badge">{{ paddingDeviceLabel }}</span></h5>
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
          <div class="prop-group"><label>{{ t('propsPanel.color') }}</label><input :value="selectedElement.element.value.color || '#000000'" type="color" class="prop-color" @input="selectedElement.element.value.color = $event.target.value" /></div>
          <div class="prop-group"><label>{{ t('propsPanel.thickness') }}</label><input v-model="selectedElement.element.value.thickness" type="text" class="prop-input" placeholder="" /></div>
          <div class="padding-section">
            <h5 class="subsection-title">{{ t('propsPanel.elementSpacing') }} <span class="padding-device-badge">{{ paddingDeviceLabel }}</span></h5>
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
          <div class="prop-group"><label>{{ t('propsPanel.color') }}</label><input :value="selectedElement.element.value.color || '#000000'" type="color" class="prop-color" @input="selectedElement.element.value.color = $event.target.value" /></div>
          <div class="prop-group"><label>{{ t('propsPanel.thickness') }}</label><input v-model="selectedElement.element.value.thickness" type="text" class="prop-input" placeholder="2（）" /></div>
          <div class="padding-section">
            <h5 class="subsection-title">{{ t('propsPanel.elementSpacing') }} <span class="padding-device-badge">{{ paddingDeviceLabel }}</span></h5>
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
            <h5 class="subsection-title">{{ t('propsPanel.elementSpacing') }} <span class="padding-device-badge">{{ paddingDeviceLabel }}</span></h5>
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
        <template v-else-if="selectedElement.element?.type === 'ACCORDION'">
          <h4 class="section-title">手風琴設定</h4>

          <div class="metadata-section">
            <h5 class="subsection-title">標題樣式</h5>
            <div class="prop-group">
              <label>標題顏色</label>
              <div class="color-input-group">
                <input :value="elementMetadata.color || '#333333'" type="color" class="prop-color"
                  @input="elementMetadata.color = $event.target.value; updateMetadata()" />
                <input v-model="elementMetadata.color" type="text" class="prop-input color-text"
                  placeholder="#333333" @input="updateMetadata" />
                <button @click="elementMetadata.color = null; updateMetadata()" class="clear-btn">✕</button>
              </div>
            </div>
            <div class="prop-group">
              <label>標題大小（px）</label>
              <div class="input-with-suffix">
                <input v-model="accordionTitleFontSize" type="number" class="prop-input"
                  placeholder="16" min="10" @input="updateAccordionStyle" />
                <span class="input-suffix">px</span>
              </div>
            </div>
            <div class="prop-group">
              <label>內容顏色</label>
              <div class="color-input-group">
                <input :value="accordionContentColor" type="color" class="prop-color"
                  @input="accordionContentColor = $event.target.value; updateAccordionStyle()" />
                <input v-model="accordionContentColor" type="text" class="prop-input color-text"
                  placeholder="#555555" @input="updateAccordionStyle" />
              </div>
            </div>
            <div class="prop-group">
              <label>內容大小（px）</label>
              <div class="input-with-suffix">
                <input v-model="accordionContentFontSize" type="number" class="prop-input"
                  placeholder="15" min="10" @input="updateAccordionStyle" />
                <span class="input-suffix">px</span>
              </div>
            </div>
            <div class="prop-group">
              <label class="checkbox-label">
                <input v-model="accordionDefaultOpen" type="checkbox" @change="updateAccordionStyle" />
                <span>預設展開第一項</span>
              </label>
            </div>
          </div>

          <div class="metadata-section">
            <h5 class="subsection-title">項目列表</h5>
            <div
              v-for="(item, i) in accordionItems"
              :key="i"
              class="pv-fp-btn-editor"
              :class="{ 'drag-over': accordionDragOver === i }"
              draggable="true"
              @dragstart="accordionDragIndex = i"
              @dragover.prevent="accordionDragOver = i"
              @dragleave="accordionDragOver = null"
              @drop.prevent="onAccordionDrop(i)"
              @dragend="accordionDragIndex = null; accordionDragOver = null"
            >
              <div
                class="pv-fp-btn-header accordion-item-header"
                @click="toggleAccordionItem(i)"
              >
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="drag-handle-text" @click.stop>⠿</span>
                  <span class="pv-fp-btn-label">
                    {{ item.title || `項目 ${i + 1}` }}
                  </span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <svg
                    class="accordion-item-chevron"
                    :class="{ 'is-open': expandedAccordionItems.includes(i) }"
                    width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2.5"
                    stroke-linecap="round" stroke-linejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                  <button class="pv-fp-btn-remove" @click.stop="removeAccordionItem(i)">✕</button>
                </div>
              </div>

              <template v-if="expandedAccordionItems.includes(i)">
                <div class="prop-group" style="padding: 0 12px 0; margin-top: 12px;">
                  <label>標題</label>
                  <input v-model="item.title" type="text" class="prop-input"
                    placeholder="輸入標題" @input="updateAccordionItems" />
                </div>
                <div class="prop-group" style="padding: 0 12px 12px;">
                  <label>內容</label>
                  <RichTextEditor v-model="item.content" @update:modelValue="updateAccordionItems" />
                </div>
              </template>
            </div>

            <button class="upload-btn" style="margin-top: 8px;" @click="addAccordionItem">
              + 新增項目
            </button>
          </div>

          <div class="padding-section">
            <h5 class="subsection-title">{{ t('propsPanel.elementSpacing') }} <span class="padding-device-badge">{{ paddingDeviceLabel }}</span></h5>
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
            <h5 class="subsection-title">{{ t('propsPanel.elementSpacing') }} <span class="padding-device-badge">{{ paddingDeviceLabel }}</span></h5>
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
const currentDevice   = inject('currentDevice', ref('desktop'))

// 裝置對應後端欄位名稱
const DEVICE_KEY_MAP = { desktop: 'pc', tablet: 'tablet', mobile: 'phone' }
const paddingDeviceKey   = computed(() => DEVICE_KEY_MAP[currentDevice.value] || 'pc')
const paddingDeviceLabel = computed(() => ({ desktop: '電腦版', tablet: '平板版', mobile: '手機版' }[currentDevice.value] || '電腦版'))

// 從 padding 物件取出指定裝置的值（相容舊版扁平結構）
const getDevicePadding = (padding, key) => {
  if (!padding) return { top: 20, right: 20, bottom: 20, left: 20 }
  // 新版巢狀結構
  if (padding.pc !== undefined || padding.tablet !== undefined || padding.phone !== undefined) {
    const sub = padding[key]
    return sub ? { ...sub } : { top: 20, right: 20, bottom: 20, left: 20 }
  }
  // 舊版扁平結構
  return { top: padding.top ?? 20, right: padding.right ?? 20, bottom: padding.bottom ?? 20, left: padding.left ?? 20 }
}
const route = useRoute()
const { t } = useI18n()

const props = defineProps({
  selectedBasemap: { type: Object, default: null },
  selectedFrame:   { type: Object, default: null },
  selectedElement: { type: Object, default: null },
  selectedCell:    { type: Object, default: null }
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

const isUploadingPvFpLogo = ref(false)
const isUploadingPvFpHeroImg = ref(false)
const pvFpBrandName    = ref('')
const pvFpBrandColor   = ref('#E8572A')
const pvFpLogoWidth    = ref('')
const pvFpLogoHeight   = ref('')
const pvFpTitle        = ref('')
const pvFpTitleColor   = ref('#1a1a1a')
const pvFpHeroImgWidth  = ref('')
const pvFpHeroImgHeight = ref('')
const pvFpBgColor      = ref('#ffffff')
const pvFpBtnColor     = ref('#E8572A')
const pvFpCopyright    = ref('')
const pvFpButtons      = ref([])
const pvFpTitleFontSize = ref('')
const pvSubSection      = ref(null)
const pvFpLogoPadding    = ref({ top: 0, right: 0, bottom: 0, left: 0 })
const pvFpHeroPadding    = ref({ top: 0, right: 0, bottom: 0, left: 0 })
const pvFpButtonsPadding = ref({ top: 0, right: 0, bottom: 0, left: 0 })
const pvFpBtnLinkTypes   = ref([])

// PV_CUSTOM_FRAME1
const cf1Items           = ref([
  { title: '', description: '', image: null, imageId: null, imageWidth: null, imageHeight: null, imageBorderRadius: null, imageBorderWidth: null, imageBorderColor: null, padding: { pc: { top: 0, right: 0, bottom: 0, left: 0 }, tablet: { top: 0, right: 0, bottom: 0, left: 0 }, phone: { top: 0, right: 0, bottom: 0, left: 0 } } },
  { title: '', description: '', image: null, imageId: null, imageWidth: null, imageHeight: null, imageBorderRadius: null, imageBorderWidth: null, imageBorderColor: null, padding: { pc: { top: 0, right: 0, bottom: 0, left: 0 }, tablet: { top: 0, right: 0, bottom: 0, left: 0 }, phone: { top: 0, right: 0, bottom: 0, left: 0 } } },
  { title: '', description: '', image: null, imageId: null, imageWidth: null, imageHeight: null, imageBorderRadius: null, imageBorderWidth: null, imageBorderColor: null, padding: { pc: { top: 0, right: 0, bottom: 0, left: 0 }, tablet: { top: 0, right: 0, bottom: 0, left: 0 }, phone: { top: 0, right: 0, bottom: 0, left: 0 } } },
  { title: '', description: '', image: null, imageId: null, imageWidth: null, imageHeight: null, imageBorderRadius: null, imageBorderWidth: null, imageBorderColor: null, padding: { pc: { top: 0, right: 0, bottom: 0, left: 0 }, tablet: { top: 0, right: 0, bottom: 0, left: 0 }, phone: { top: 0, right: 0, bottom: 0, left: 0 } } },
])
const cf1Uploading = ref([false, false, false, false])

const accordionItems           = ref([])
const accordionTitleFontSize   = ref('')
const accordionContentColor    = ref('#555555')
const accordionContentFontSize = ref('')
const accordionDefaultOpen     = ref(false)
const accordionDragIndex = ref(null)
const accordionDragOver  = ref(null)
const expandedAccordionItems = ref([0])

const carouselWallImages = computed(() =>
  Array.isArray(props.selectedFrame?.data?.caroiselWallImgs)
    ? props.selectedFrame.data.caroiselWallImgs
    : []
)
const isUploadingCarouselWall = ref(false)
const carouselWallHeight = ref(600)
const carouselDeviceSlots = [
  { key: 'srcDesktop', label: '🖥 電腦' },
  { key: 'srcTablet',  label: '📱 平板' },
  { key: 'srcMobile',  label: '📱 手機' },
]
const carouselWallUploadingSlot = ref(null)
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
const footerAddress = ref('')
const footerPhone = ref('')
const isUploadingFooterLogo = ref(false)

const updateFooterStyle = () => {
  if (!props.selectedFrame?.data) return
  props.selectedFrame.data.footerBgColor = footerBgColor.value
  props.selectedFrame.data.footerTextColor = footerTextColor.value
}

const updateFooterContact = () => {
  if (!props.selectedFrame?.data) return
  props.selectedFrame.data.tenantAddress = footerAddress.value
  props.selectedFrame.data.tenantPhone   = footerPhone.value
}

const handleUploadFooterLogo = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      isUploadingFooterLogo.value = true
      const uploaded = await pageEditorStore.uploadImage(file)
      if (!uploaded) { alert('上傳失敗，請稍後再試'); return }
      if (props.selectedFrame?.data) {
        props.selectedFrame.data.logoImgId  = uploaded.id
        props.selectedFrame.data.logoImgSrc = uploaded.fileUrl
      }
    } catch (err) {
      alert('上傳失敗：' + err.message)
    } finally {
      isUploadingFooterLogo.value = false
    }
  }
  input.click()
}

const removeFooterLogo = () => {
  if (!props.selectedFrame?.data) return
  props.selectedFrame.data.logoImgId  = null
  props.selectedFrame.data.logoImgSrc = null
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
  { value: 'light',  label: t('propsPanel.themeLight'), bg: '#f8f8f8',                                 fg: '#333333', labelColor: '#444' },
  { value: 'dark',   label: t('propsPanel.themeDark'),  bg: '#1a1a2e',                                 fg: '#f0f0f0', labelColor: '#444' },
  { value: 'sepia',  label: t('propsPanel.themeSepia'), bg: '#fdf0dc',                                 fg: '#4a3728', labelColor: '#7a5830' },
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
  return tabs.map(tab => ({ label: tab.name || tab.slug, slug: tab.slug }))
})

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
    logoAlt.value    = newVal.data.alt    || 'Logo'
    logoWidth.value  = newVal.data.width  || '120px'
    logoHeight.value = newVal.data.height || 'auto'
  }
  if (newVal?.element?.type === 'CAROUSEL_IMG') {
    const value = newVal.element.value || {}
    carouselImages.value  = value.imgs     || []
    carouselAutoPlay.value = value.autoPlay !== false
    carouselInterval.value = value.interval || 3000
    carouselHeight.value   = value.height   || 400
  }
  if (newVal?.element?.type === 'GOOGLE_MAP') {
    const value = newVal.element.value || {}
    mapAddress.value = value.address || ''
    mapLat.value = value.lat !== undefined ? value.lat : 25.033
    mapLng.value = value.lng !== undefined ? value.lng : 121.565
    mapZoom.value = value.zoom !== undefined ? value.zoom : 15
  }
  if (newVal?.element?.type === 'ACCORDION') {
    const value   = newVal.element.value   || {}
    const content = newVal.element.content || {}
    accordionItems.value         = Array.isArray(value.items) ? value.items.map(i => ({ ...i })) : [{ title: '', content: '' }]
    accordionTitleFontSize.value   = content.titleFontSize   ? String(content.titleFontSize)   : ''
    accordionContentColor.value    = content.contentColor    || '#555555'
    accordionContentFontSize.value = content.contentFontSize ? String(content.contentFontSize) : ''
    accordionDefaultOpen.value     = content.defaultOpen     ?? false
  }
  if (newVal?.element?.type === 'IMG') {
    imageAlt.value  = newVal.element.value?.alt || ''
    imgWidth.value  = stripPx(newVal.element.metadata?.width  || '')
    imgHeight.value = stripPx(newVal.element.metadata?.height || '')
  } else {
    imageAlt.value  = ''
    imgWidth.value  = ''
    imgHeight.value = ''
  }
  if (newVal?.element?.metadata) {
    const m = newVal.element.metadata
    elementMetadata.value = {
      color:           m.color           || null,
      fontSize:        stripPx(m.fontSize || m.font_size) || null,
      fontWeight:      normalizeFontWeight(m.fontWeight || m.font_weight),
      textAlign:       m.textAlign || m.text_align || null,
      width:           m.width           || null,
      height:          m.height          || null,
      backgroundColor: m.backgroundColor || m.background_color || null,
      borderRadius:    stripPx(m.borderRadius) || null,
    }
  } else {
    elementMetadata.value = { color: null, fontSize: null, fontWeight: 400, textAlign: null, width: null, height: null, backgroundColor: null, borderRadius: null }
  }
  elementPadding.value = getDevicePadding(newVal?.element?.padding, paddingDeviceKey.value)
  elementWidth.value = stripPercent(newVal?.element?.width || '100%')
}, { immediate: true, deep: true })

// 切換裝置預覽時，自動更新顯示該裝置對應的 padding 數值
watch(paddingDeviceKey, (key) => {
  elementPadding.value = getDevicePadding(props.selectedElement?.element?.padding, key)
})

watch(
  () => props.selectedElement?.frame?.data?.logoImgSrc,
  (newSrc) => {
    if (props.selectedElement?.type === 'logo') localLogoSrc.value = newSrc || null
  },
  { immediate: true }
)

watch(
  () => props.selectedElement?.type,
  (newType) => {
    if (newType === 'logo') localLogoSrc.value = props.selectedElement?.frame?.data?.logoImgSrc || null
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
    heroTitle.value           = newVal.data.heroTitle    || ''
    heroSubtitle.value        = newVal.data.heroSubtitle || ''
    heroHeight.value          = stripPx(newVal.data.heroHeight          || '600px')
    overlayOpacity.value      = newVal.data.overlayOpacity !== undefined ? newVal.data.overlayOpacity : 40
    overlayColor.value        = newVal.data.overlayColor        || '#000000'
    textBoxBorderRadius.value = stripPx(newVal.data.textBoxBorderRadius || '12px')
    titleColor.value          = newVal.data.titleColor          || '#333333'
    titleFontSize.value       = stripPx(newVal.data.titleFontSize       || '48px')
    subtitleColor.value       = newVal.data.subtitleColor       || '#666666'
    subtitleFontSize.value    = stripPx(newVal.data.subtitleFontSize    || '20px')
  }
  if (newVal?.type === 'PV_PORTAL_PICTURE') {
    const d = newVal.data || {}
    pvFpBrandName.value    = d.brandName != null ? d.brandName : (d.tenantName ?? '')
    pvFpBrandColor.value   = d.brandColor   || '#E8572A'
    pvFpLogoWidth.value    = d.logoWidth    ? String(d.logoWidth)    : ''
    pvFpLogoHeight.value   = d.logoHeight   ? String(d.logoHeight)   : ''
    pvFpTitle.value        = d.heroTitle    || ''
    pvFpTitleColor.value   = d.titleColor   || '#1a1a1a'
    pvFpTitleFontSize.value = d.titleFontSize ? String(d.titleFontSize) : ''
    pvFpHeroImgWidth.value  = d.heroImgWidth  ? String(d.heroImgWidth)  : ''
    pvFpHeroImgHeight.value = d.heroImgHeight ? String(d.heroImgHeight) : ''
    pvFpBgColor.value      = d.bgColor      || '#ffffff'
    pvFpBtnColor.value     = d.btnColor     || '#E8572A'
    pvFpCopyright.value    = d.copyright    || ''
    if (Array.isArray(d.buttons) && d.buttons.length > 0) {
      pvFpButtons.value = d.buttons.map(b => ({ ...b }))
    } else {
      pvFpButtons.value = [
        { text: '靈籤司',  url: '#', color: null },
        { text: '宮廟地圖', url: '#', color: null },
        { text: '進入首頁', url: '#', color: null },
      ]
      d.buttons = pvFpButtons.value.map(b => ({ ...b }))
    }
    const lp = d.logoPadding    || {}
    const hp = d.heroPadding    || {}
    const bp = d.buttonsPadding || {}
    pvFpLogoPadding.value    = { top: lp.top ?? 0, right: lp.right ?? 0, bottom: lp.bottom ?? 0, left: lp.left ?? 0 }
    pvFpHeroPadding.value    = { top: hp.top ?? 0, right: hp.right ?? 0, bottom: hp.bottom ?? 0, left: hp.left ?? 0 }
    pvFpButtonsPadding.value = { top: bp.top ?? 0, right: bp.right ?? 0, bottom: bp.bottom ?? 0, left: bp.left ?? 0 }
    pvFpBtnLinkTypes.value = pvFpButtons.value.map(b => {
      if (b.internalSlug && internalPageOptions.value.some(p => p.slug === b.internalSlug)) {
        return b.internalSlug
      }
      return '__custom__'
    })
  }
  if (newVal && !newVal.type?.startsWith('FRAME') &&
      newVal.type !== 'FIRST_PICTURE' && newVal.type !== 'PV_PORTAL_PICTURE' &&
      newVal.type !== 'CAROUSEL_WALL'  && newVal.type !== 'PV_CAROUSEL_WALL' && newVal.type !== 'BRIGHT_LAMP') {
    systemFrameTextTheme.value = newVal.data?.textTheme || 'light'
    systemFrameTextColor.value = newVal.data?.textColor || '#333333'
  }
  if (newVal?.type === 'CAROUSEL_WALL' || newVal?.type === 'PV_CAROUSEL_WALL') {
    carouselWallHeight.value   = newVal.data?.carouselWallHeight   ?? 600
    carouselWallAutoPlay.value = newVal.data?.carouselWallAutoPlay ?? true
    carouselWallInterval.value = newVal.data?.carouselWallInterval ?? 5000
  }
  if (newVal?.type === 'FOOTER' || newVal?.type === 'PV_FOOTER') {
    footerBgColor.value   = newVal.data?.footerBgColor   || '#2d2d2d'
    footerTextColor.value = newVal.data?.footerTextColor || '#ffffff'
    footerAddress.value   = newVal.data?.tenantAddress   || ''
    footerPhone.value     = newVal.data?.tenantPhone     || ''
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
  if (newVal?.type === 'PV_CUSTOM_FRAME1') {
    const DEFAULT = [
      { title: '宮廟地圖',     description: '整合全台宮廟資訊，提供地理搜尋、神明分類、活動查詢等多元曝光管道。', image: null, imageId: null, imageWidth: null, imageHeight: null, imageBorderRadius: null, imageBorderWidth: null, imageBorderColor: null, padding: { pc: { top: 0, right: 0, bottom: 0, left: 0 }, tablet: { top: 0, right: 0, bottom: 0, left: 0 }, phone: { top: 0, right: 0, bottom: 0, left: 0 } } },
      { title: '靈籤司',       description: '解籤後智能推薦宮廟，將線上求籤信眾精準導流至實地參拜。',              image: null, imageId: null, imageWidth: null, imageHeight: null, imageBorderRadius: null, imageBorderWidth: null, imageBorderColor: null, padding: { pc: { top: 0, right: 0, bottom: 0, left: 0 }, tablet: { top: 0, right: 0, bottom: 0, left: 0 }, phone: { top: 0, right: 0, bottom: 0, left: 0 } } },
      { title: '主平台服務',   description: '匯聚宮廟完整資訊，成為信眾探索文化、查詢活動的一站式入口。',          image: null, imageId: null, imageWidth: null, imageHeight: null, imageBorderRadius: null, imageBorderWidth: null, imageBorderColor: null, padding: { pc: { top: 0, right: 0, bottom: 0, left: 0 }, tablet: { top: 0, right: 0, bottom: 0, left: 0 }, phone: { top: 0, right: 0, bottom: 0, left: 0 } } },
      { title: '宮廟網站建置', description: '協助建置專屬數位門戶，提供客製化功能與獨立經營數位社群能力。',          image: null, imageId: null, imageWidth: null, imageHeight: null, imageBorderRadius: null, imageBorderWidth: null, imageBorderColor: null, padding: { pc: { top: 0, right: 0, bottom: 0, left: 0 }, tablet: { top: 0, right: 0, bottom: 0, left: 0 }, phone: { top: 0, right: 0, bottom: 0, left: 0 } } },
    ]
    const src = newVal.data?.items || []
    cf1Items.value = DEFAULT.map((def, i) => ({ ...def, ...(src[i] || {}) }))
  }
}, { immediate: true, deep: true })

watch(() => props.selectedFrame, () => {
  expandedCardStyles.value = []
})

// 點擊 CF1 卡片後，selectedElement 帶有 frame 資料，從中載入 cf1Items
watch(() => props.selectedElement, (newVal) => {
  if (newVal?.element?.type === 'CF1_ITEM') {
    const frame = newVal.frame
    const DEFAULT = [
      { title: '宮廟地圖',     description: '整合全台宮廟資訊，提供地理搜尋、神明分類、活動查詢等多元曝光管道。', image: null, imageId: null, imageWidth: null, imageHeight: null, imageBorderRadius: null, imageBorderWidth: null, imageBorderColor: null, padding: { pc: { top: 0, right: 0, bottom: 0, left: 0 }, tablet: { top: 0, right: 0, bottom: 0, left: 0 }, phone: { top: 0, right: 0, bottom: 0, left: 0 } } },
      { title: '靈籤司',       description: '解籤後智能推薦宮廟，將線上求籤信眾精準導流至實地參拜。',              image: null, imageId: null, imageWidth: null, imageHeight: null, imageBorderRadius: null, imageBorderWidth: null, imageBorderColor: null, padding: { pc: { top: 0, right: 0, bottom: 0, left: 0 }, tablet: { top: 0, right: 0, bottom: 0, left: 0 }, phone: { top: 0, right: 0, bottom: 0, left: 0 } } },
      { title: '主平台服務',   description: '匯聚宮廟完整資訊，成為信眾探索文化、查詢活動的一站式入口。',          image: null, imageId: null, imageWidth: null, imageHeight: null, imageBorderRadius: null, imageBorderWidth: null, imageBorderColor: null, padding: { pc: { top: 0, right: 0, bottom: 0, left: 0 }, tablet: { top: 0, right: 0, bottom: 0, left: 0 }, phone: { top: 0, right: 0, bottom: 0, left: 0 } } },
      { title: '宮廟網站建置', description: '協助建置專屬數位門戶，提供客製化功能與獨立經營數位社群能力。',          image: null, imageId: null, imageWidth: null, imageHeight: null, imageBorderRadius: null, imageBorderWidth: null, imageBorderColor: null, padding: { pc: { top: 0, right: 0, bottom: 0, left: 0 }, tablet: { top: 0, right: 0, bottom: 0, left: 0 }, phone: { top: 0, right: 0, bottom: 0, left: 0 } } },
    ]
    const src = frame?.data?.items || []
    cf1Items.value = DEFAULT.map((def, i) => ({ ...def, ...(src[i] || {}) }))
  }
}, { immediate: true })

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
      fontSize:     ensureUnit(elementMetadata.value.fontSize,     null),
      width:        ensureUnit(elementMetadata.value.width,        null),
      height:       ensureUnit(elementMetadata.value.height,       null),
      borderRadius: ensureUnit(elementMetadata.value.borderRadius, null),
    }
  }
}

const updateImgSize = () => {
  if (props.selectedElement?.element?.type !== 'IMG') return
  if (!props.selectedElement.element.metadata) props.selectedElement.element.metadata = {}
  props.selectedElement.element.metadata.width  = imgWidth.value  ? imgWidth.value  + 'px' : null
  props.selectedElement.element.metadata.height = imgHeight.value ? imgHeight.value + 'px' : null
}

const updateElementPadding = () => {
  if (props.selectedElement?.element) {
    const el  = props.selectedElement.element
    const key = paddingDeviceKey.value
    // 確保 padding 是巢狀結構
    if (!el.padding || el.padding.pc === undefined) {
      const flat = el.padding || {}
      el.padding = {
        pc:     { top: flat.top ?? 20, right: flat.right ?? 20, bottom: flat.bottom ?? 20, left: flat.left ?? 20 },
        tablet: { top: flat.top ?? 20, right: flat.right ?? 20, bottom: flat.bottom ?? 20, left: flat.left ?? 20 },
        phone:  { top: flat.top ?? 20, right: flat.right ?? 20, bottom: flat.bottom ?? 20, left: flat.left ?? 20 },
      }
    }
    el.padding[key] = { ...elementPadding.value }
    emit('update-cell-padding', {
      frame:     props.selectedElement.frame,
      cellIndex: props.selectedElement.cellIndex,
      padding:   { ...el.padding }
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
    'A': { leftCells: [0],    rightCells: [1, 2] },
    'B': { leftCells: [0, 1], rightCells: [2] },
    'C': { leftCells: [0],    rightCells: [1, 2, 3] },
    'D': { leftCells: [0, 1, 2], rightCells: [3] },
  }
  if (compositeMap[layout]) {
    const { leftCells, rightCells } = compositeMap[layout]
    const isLeft = leftCells.includes(cellIndex)
    const sameSideCells  = isLeft ? leftCells  : rightCells
    const otherSideCells = isLeft ? rightCells : leftCells
    const otherWidth = (100 - currentWidth).toFixed(1) + '%'
    const newWidth   = currentWidth.toFixed(1) + '%'
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
  const widthPerCell   = remainingWidth / (rowCells.length - 1)
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
    default:   return [currentIndex]
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
      alert('Logo 上傳失敗: ' + error.message)
    } finally {
      isUploadingLogo.value = false
    }
  }
  input.click()
}

const handleLogoImageError = () => {
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
        props.selectedElement.element.value.id  = uploadedFile.id
        props.selectedElement.element.value.src = uploadedFile.fileUrl
      }
    } catch (error) {
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
  imgs.splice(index, 1)
  carouselImages.value = [...imgs]
}

const updateCarouselSettings = () => {
  if (props.selectedElement?.element?.value) {
    props.selectedElement.element.value.autoPlay = carouselAutoPlay.value
    props.selectedElement.element.value.interval = carouselInterval.value
    props.selectedElement.element.value.height   = carouselHeight.value
  }
}

const setCarouselHeight = (height) => {
  carouselHeight.value = height
  updateCarouselSettings()
}

const updateHeroData = () => {
  if (props.selectedFrame?.data) {
    props.selectedFrame.data.heroTitle           = heroTitle.value
    props.selectedFrame.data.heroSubtitle        = heroSubtitle.value
    props.selectedFrame.data.heroHeight          = ensureUnit(heroHeight.value, '600px')
    props.selectedFrame.data.overlayOpacity      = overlayOpacity.value
    props.selectedFrame.data.overlayColor        = overlayColor.value
    props.selectedFrame.data.textBoxBorderRadius = ensureUnit(textBoxBorderRadius.value, '12px')
    props.selectedFrame.data.titleColor          = titleColor.value
    props.selectedFrame.data.titleFontSize       = ensureUnit(titleFontSize.value, '48px')
    props.selectedFrame.data.subtitleColor       = subtitleColor.value
    props.selectedFrame.data.subtitleFontSize    = ensureUnit(subtitleFontSize.value, '20px')
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
        props.selectedFrame.data.heroBgImgId  = uploadedFile.id
        props.selectedFrame.data.heroBgImgSrc = uploadedFile.fileUrl
      }
    } catch (error) {
      alert('首圖背景上傳失敗: ' + error.message)
    } finally {
      isUploadingHeroBackground.value = false
    }
  }
  input.click()
}


const updateCarouselWallSettings = () => {
  if (props.selectedFrame?.data) {
    props.selectedFrame.data.carouselWallHeight   = carouselWallHeight.value
    props.selectedFrame.data.carouselWallAutoPlay = carouselWallAutoPlay.value
    props.selectedFrame.data.carouselWallInterval = carouselWallInterval.value
  }
}

const setCarouselWallHeight = (height) => {
  carouselWallHeight.value = height
  updateCarouselWallSettings()
}

// PV_CUSTOM_FRAME1 helpers
const getCf1Frame = () => props.selectedFrame ?? props.selectedElement?.frame ?? null

const updateCf1 = () => {
  const frame = getCf1Frame()
  if (!frame) return
  if (!frame.data) frame.data = {}
  frame.data.items = cf1Items.value.map(item => ({ ...item }))
}

const handleUploadCf1Image = async (index) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      cf1Uploading.value[index] = true
      const uploaded = await pageEditorStore.uploadImage(file)
      if (!uploaded) return
      cf1Items.value[index] = { ...cf1Items.value[index], image: uploaded.fileUrl, imageId: uploaded.id }
      updateCf1()
    } catch (err) {
      alert('圖片上傳失敗：' + err.message)
    } finally {
      cf1Uploading.value[index] = false
    }
  }
  input.click()
}

const setCf1Padding = (index, field, value) => {
  const item = cf1Items.value[index]
  if (!item) return
  if (!item.padding) item.padding = {}
  const key = paddingDeviceKey.value
  if (!item.padding[key]) item.padding[key] = { top: 0, right: 0, bottom: 0, left: 0 }
  item.padding[key][field] = value !== '' ? Number(value) : 0
  updateCf1()
}

const removeCf1Image = (index) => {
  cf1Items.value[index] = { ...cf1Items.value[index], image: null, imageId: null }
  updateCf1()
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
        props.selectedFrame.data.caroiselWallImgs.push({ id: uploadedFile.id, src: uploadedFile.fileUrl, srcDesktop: uploadedFile.fileUrl })
      }
    } catch (error) {
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
  imgs.splice(index, 1)
}

const uploadCarouselWallDeviceImg = (index, key) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      carouselWallUploadingSlot.value = { index, key }
      const uploaded = await pageEditorStore.uploadImage(file)
      if (!uploaded) { alert('上傳失敗，請稍後再試'); return }
      const imgs = props.selectedFrame?.data?.caroiselWallImgs
      if (imgs && imgs[index]) {
        imgs[index][key] = uploaded.fileUrl
        if (!imgs[index].src) imgs[index].src = uploaded.fileUrl
      }
    } catch (err) {
      alert('上傳失敗：' + err.message)
    } finally {
      carouselWallUploadingSlot.value = null
    }
  }
  input.click()
}

const removeCarouselWallDeviceImg = (index, key) => {
  const imgs = props.selectedFrame?.data?.caroiselWallImgs
  if (imgs && imgs[index]) {
    delete imgs[index][key]
  }
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
  carouselWallDragOver.value  = null
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
  carouselImages.value    = [...imgs]
  carouselDragIndex.value = null
  carouselDragOver.value  = null
}

const updateMapData = () => {
  if (props.selectedElement?.element?.value) {
    props.selectedElement.element.value.address = mapAddress.value
    props.selectedElement.element.value.lat     = mapLat.value
    props.selectedElement.element.value.lng     = mapLng.value
    props.selectedElement.element.value.zoom    = mapZoom.value
  }
}

const setMapZoom = (zoom) => {
  mapZoom.value = zoom
  updateMapData()
}

const updateAccordionStyle = () => {
  if (!props.selectedElement?.element) return
  if (!props.selectedElement.element.content) props.selectedElement.element.content = {}
  const c = props.selectedElement.element.content
  c.titleColor      = elementMetadata.value.color || null
  c.titleFontSize   = accordionTitleFontSize.value   ? Number(accordionTitleFontSize.value)   : null
  c.contentColor    = accordionContentColor.value
  c.contentFontSize = accordionContentFontSize.value ? Number(accordionContentFontSize.value) : null
  c.defaultOpen     = accordionDefaultOpen.value
}

const updateAccordionItems = () => {
  if (!props.selectedElement?.element) return
  if (!props.selectedElement.element.value) props.selectedElement.element.value = {}
  props.selectedElement.element.value.items = accordionItems.value.map(i => ({ ...i }))
}

const addAccordionItem = () => {
  accordionItems.value.push({ title: '', content: '' })
  expandedAccordionItems.value.push(accordionItems.value.length - 1)
  updateAccordionItems()
}
const toggleAccordionItem = (index) => {
  const pos = expandedAccordionItems.value.indexOf(index)
  if (pos === -1) expandedAccordionItems.value.push(index)
  else expandedAccordionItems.value.splice(pos, 1)
}
const removeAccordionItem = (index) => {
  accordionItems.value.splice(index, 1)
  updateAccordionItems()
}
const onAccordionDrop = (toIndex) => {
  const fromIndex = accordionDragIndex.value
  if (fromIndex === null || fromIndex === toIndex) return
  const items = [...accordionItems.value]
  const moved = items.splice(fromIndex, 1)[0]
  items.splice(toIndex, 0, moved)
  accordionItems.value = items
  updateAccordionItems()
  accordionDragIndex.value = null
  accordionDragOver.value  = null
}
const updatePvFpData = () => {
  if (!props.selectedFrame?.data) return
  const d = props.selectedFrame.data
  d.brandName     = pvFpBrandName.value
  d.brandColor    = pvFpBrandColor.value
  d.logoWidth     = pvFpLogoWidth.value    ? Number(pvFpLogoWidth.value)    : null
  d.logoHeight    = pvFpLogoHeight.value   ? Number(pvFpLogoHeight.value)   : null
  d.heroTitle     = pvFpTitle.value
  d.titleColor    = pvFpTitleColor.value
  d.titleFontSize = pvFpTitleFontSize.value ? Number(pvFpTitleFontSize.value) : null
  d.heroImgWidth  = pvFpHeroImgWidth.value  ? Number(pvFpHeroImgWidth.value)  : null
  d.heroImgHeight = pvFpHeroImgHeight.value ? Number(pvFpHeroImgHeight.value) : null
  d.bgColor       = pvFpBgColor.value
  d.btnColor      = pvFpBtnColor.value
  d.copyright     = pvFpCopyright.value
  d.buttons       = pvFpButtons.value.map(b => ({ ...b }))
}

const addPvFpButton = () => {
  pvFpButtons.value.push({ text: '新按鈕', url: '#', color: null, internalSlug: '' })
  pvFpBtnLinkTypes.value.push('__custom__')
  updatePvFpData()
}

const removePvFpButton = (index) => {
  pvFpButtons.value.splice(index, 1)
  pvFpBtnLinkTypes.value.splice(index, 1)
  updatePvFpData()
}

const handleUploadPvFpLogo = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      isUploadingPvFpLogo.value = true
      const uploaded = await pageEditorStore.uploadImage(file)
      if (!uploaded) { alert('上傳失敗，請稍後再試'); return }
      if (props.selectedFrame?.data) {
        props.selectedFrame.data.logoImgId  = uploaded.id
        props.selectedFrame.data.logoImgSrc = uploaded.fileUrl
      }
    } catch (err) {
      alert('上傳失敗：' + err.message)
    } finally {
      isUploadingPvFpLogo.value = false
    }
  }
  input.click()
}

const removePvFpLogo = () => {
  if (!props.selectedFrame?.data) return
  props.selectedFrame.data.logoImgId  = null
  props.selectedFrame.data.logoImgSrc = null
}

const handleUploadPvFpHeroImg = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      isUploadingPvFpHeroImg.value = true
      const uploaded = await pageEditorStore.uploadImage(file)
      if (!uploaded) { alert('上傳失敗，請稍後再試'); return }
      if (props.selectedFrame?.data) {
        props.selectedFrame.data.heroImgId  = uploaded.id
        props.selectedFrame.data.heroImgSrc = uploaded.fileUrl
      }
    } catch (err) {
      alert('上傳失敗：' + err.message)
    } finally {
      isUploadingPvFpHeroImg.value = false
    }
  }
  input.click()
}

const removePvFpHeroImg = () => {
  if (!props.selectedFrame?.data) return
  props.selectedFrame.data.heroImgId  = null
  props.selectedFrame.data.heroImgSrc = null
}

const onPvFpBtnLinkTypeChange = (i, val) => {
  const btn = pvFpButtons.value[i]
  if (!btn) return
  pvFpBtnLinkTypes.value[i] = val
  if (val === '__custom__') {
    btn.internalSlug = ''
  } else {
    btn.internalSlug = val
    btn.url = ''
  }
  updatePvFpData()
}

const updatePvFpPadding = (section) => {
  if (!props.selectedFrame?.data) return
  const refMap = { logo: pvFpLogoPadding, hero: pvFpHeroPadding, buttons: pvFpButtonsPadding }
  const keyMap = { logo: 'logoPadding', hero: 'heroPadding', buttons: 'buttonsPadding' }
  props.selectedFrame.data[keyMap[section]] = { ...refMap[section].value }
}

const setPvFpPadding = (section, value) => {
  const refMap = { logo: pvFpLogoPadding, hero: pvFpHeroPadding, buttons: pvFpButtonsPadding }
  refMap[section].value = { top: value, right: value, bottom: value, left: value }
  updatePvFpPadding(section)
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
  display: flex;
  align-items: center;
  gap: 6px;
}

.padding-device-badge {
  font-size: 11px;
  font-weight: 500;
  color: #E8572A;
  background: rgba(232, 87, 42, 0.08);
  border-radius: 4px;
  padding: 1px 6px;
  margin-left: auto;
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
.pv-fp-btn-editor {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  background: #fafafa;
}

.pv-fp-btn-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.pv-fp-btn-label {
  font-size: 13px;
  font-weight: 600;
  color: #555;
}

.pv-fp-btn-remove {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  &:hover { background: #fee2e2; color: #dc3545; }
}

.pv-fp-section-hint {
  padding: 16px;
  background: #fafafa;
  border: 1px dashed #ddd;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 20px;
 
  p {
    margin: 0 0 12px;
    font-size: 13px;
    color: #888;
  }
}
 
.pv-fp-section-btns {
  display: flex;
  gap: 8px;
  justify-content: center;
}
 
.pv-fp-section-btn {
  padding: 8px 14px;
  background: #fff;
  border: 1px solid #E8572A;
  border-radius: 20px;
  color: #E8572A;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
 
  &:hover {
    background: #E8572A;
    color: #fff;
  }
}
 
.pv-fp-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
 
  &:hover {
    background: #e8e8e8;
    color: #333;
  }
}
.drag-handle-text {
  font-size: 16px;
  color: #bbb;
  cursor: grab;
  user-select: none;
  &:active { cursor: grabbing; }
}

.pv-fp-btn-editor.drag-over {
  border-color: #E8572A;
  border-style: dashed;
  opacity: 0.7;
}
.accordion-item-header {
  cursor: pointer;
  user-select: none;
  &:hover {
    background: #f5f5f5;
    border-radius: 6px;
  }
}

.accordion-item-chevron {
  color: #aaa;
  transition: transform 0.2s ease;
  flex-shrink: 0;
  &.is-open {
    transform: rotate(180deg);
    color: #E8572A;
  }
}

.cf1-size-row {
  display: flex;
  gap: 8px;
}

.cf1-size-field {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.cf1-size-label {
  font-size: 12px;
  color: #888;
  flex-shrink: 0;
}

.cf1-size-input {
  flex: 1;
  min-width: 0;
}

.cf1-size-unit {
  font-size: 12px;
  color: #aaa;
  flex-shrink: 0;
}

.cf1-hint {
  padding: 20px 12px;
  text-align: center;
  color: #999;
  font-size: 13px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px dashed #ddd;
  margin-top: 8px;

  p { margin: 0; }
}

.cf1-item-section {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
  margin-bottom: 4px;

  &:last-child { border-bottom: none; }
}

.cf1-image-preview {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cf1-preview-img {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #eee;
}

.remove-img-btn {
  padding: 4px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  font-size: 12px;
  color: #999;
  cursor: pointer;
  &:hover { border-color: #dc3545; color: #dc3545; }
}

.device-img-section {
  padding: 6px 10px 8px;
  border-top: 1px solid #ebebeb;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.device-img-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.device-tag {
  font-size: 11px;
  color: #666;
  min-width: 48px;
  flex-shrink: 0;
}

.device-thumb {
  width: 44px;
  height: 28px;
  object-fit: cover;
  border-radius: 3px;
  border: 1px solid #ddd;
  flex-shrink: 0;
}

.device-remove-btn {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: rgba(220, 38, 38, 0.85);
  color: #fff;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  &:hover { background: #dc2626; }
}

.device-upload-btn {
  font-size: 11px;
  padding: 3px 8px;
  border: 1px dashed #bbb;
  border-radius: 4px;
  background: #fafafa;
  color: #555;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
  &:hover:not(:disabled) { border-color: #E8572A; color: #E8572A; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}
</style>
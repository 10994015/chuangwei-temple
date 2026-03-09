<template>
  <div 
    class="custom-frame"
    :class="[
      `layout-${frameLayout}`, 
      { 
        'is-selected': isFrameSelected,
        'is-dragging': isDragging
      }
    ]"
    @click.stop="handleFrameClick"
  >
    <!-- ✅ 刪除框架按鈕（只在框架被選中且沒有元件時顯示） -->
    <button
      v-if="isFrameSelected && !hasAnyElement && frame.isDeletable"
      class="delete-frame-btn"
      @click.stop="handleDeleteFrame"
      title="刪除框架"
    >
      ✕
    </button>

    <!-- ✅ 新增 container 來限制內容最大寬度，支持動態寬度 -->
    <div class="frame-container" :style="frameContainerStyle">

      <!-- ✅ 雙層框架：兩排各自獨立，高度互不影響 -->
      <template v-if="isDoubleRowLayout">
        <!-- 第一排 -->
        <div class="double-row" :style="doubleRowStyle">
          <div
            v-for="(element, index) in doubleRowSplit.row1"
            :key="`row1-cell-${index}`"
            class="grid-cell"
            :class="{ 
              'has-element': element && element.type,
              'is-selected': isElementSelected(index) || isCellSelected(index),
              'empty-cell': !element || !element.type
            }"
            :style="{ padding: getCellPadding(element), flex: getCellFlex(element), minWidth: 0 }"
            @click.stop="handleCellClick(index, element)"
            @dragover="handleDragOver($event, index)"
            @dragleave="handleDragLeave"
            @drop="handleDrop($event, index)"
          >
            <!-- 有元件：顯示元件內容 -->
            <div v-if="element && element.type" class="element-content">
              <!-- IMG 元件 -->
              <div v-if="element.type === 'IMG'" class="element-image" :style="getImageContainerStyle(element)">
                <img 
                  v-if="element.value?.src" 
                  :src="element.value.src" 
                  :alt="element.value?.alt || '圖片'"
                  class="element-img"
                  :style="getElementStyle(element)"
                />
                <div v-else class="placeholder-image">
                  <img
                    src="https://images.unsplash.com/photo-1548013146-72479768bada?w=1280&h=300&fit=crop"
                    alt="placeholder"
                    class="placeholder-img"
                  />
                  <div class="placeholder-overlay">
                    <span>🖼️</span>
                    <p>請在右側上傳圖片</p>
                  </div>
                </div>
              </div>

              <!-- TEXT 元件 -->
              <div 
                v-else-if="element.type === 'TEXT'" 
                class="element-text"
                :style="getElementStyle(element)"
                v-html="element.value?.text || '文字內容'"
              ></div>

              <!-- BUTTON 元件 -->
              <div v-else-if="element.type === 'BUTTON'" class="element-button">
                <a 
                  :href="element.value?.url || '#'" 
                  class="button-link"
                  :style="getButtonStyle(element)"
                  @click.prevent
                >
                  {{ element.value?.text || '按鈕' }}
                </a>
              </div>

              <!-- HORIZON_LINE 元件 -->
              <div v-else-if="element.type === 'HORIZON_LINE'" class="element-hline">
                <hr :style="{ 
                  borderColor: element.value?.color || '#ddd',
                  borderWidth: element.value?.thickness || '2px'
                }" />
              </div>

              <!-- VERTICAL_LINE 元件 -->
              <div v-else-if="element.type === 'VERTICAL_LINE'" class="element-vline">
                <div class="vertical-line" :style="{ 
                  backgroundColor: element.value?.color || '#ddd',
                  width: element.value?.thickness || '2px'
                }"></div>
              </div>

              <!-- CAROUSEL_IMG 元件 -->
              <div v-else-if="element.type === 'CAROUSEL_IMG'" class="element-carousel">
                <CarouselElement 
                  :content="element.value"
                  :element="element"
                  :key="`carousel-r1-${index}-${element.value?.imgs?.length || 0}`"
                />
              </div>

              <!-- GOOGLE_MAP 元件 -->
              <div v-else-if="element.type === 'GOOGLE_MAP'" class="element-map">
                <MapElement 
                  :content="{
                    address: element.value?.address || '',
                    lat: element.value?.lat || 25.033,
                    lng: element.value?.lng || 121.565,
                    zoom: element.value?.zoom || 15
                  }"
                  :element="element"
                  :key="`map-r1-${index}-${element.value?.lat}-${element.value?.lng}`"
                />
              </div>

              <!-- ALBUM 元件 -->
              <div v-else-if="element.type === 'ALBUM'" class="element-card-wrapper">
                <AlbumCard 
                  :content="{
                    image: element.value?.image || null,
                    tag: element.value?.tag || '相簿封面',
                    title: element.value?.title || '相簿標題',
                    description: element.value?.description || ''
                  }"
                  :element="element"
                />
              </div>

              <!-- PRODUCT_CARD 商品卡片 -->
              <div v-else-if="element.type === 'PRODUCT_CARD'" class="element-card-wrapper">
                <ProductCard 
                  :content="{
                    image: element.value?.image || null,
                    tag: element.value?.tag || '法會活動',
                    title: element.value?.title || '商品標題',
                    date: element.value?.date || '2024-08-22'
                  }"
                  :element="element"
                />
              </div>

              <!-- SERVICE_CARD 服務卡片 -->
              <div v-else-if="element.type === 'SERVICE_CARD'" class="element-card-wrapper">
                <ServiceCard 
                  :content="{
                    image: element.value?.image || null,
                    tag: element.value?.tag || '祈福服務',
                    title: element.value?.title || '服務標題',
                    date: element.value?.date || '2024-08-22'
                  }"
                  :element="element"
                />
              </div>

              <!-- EVENT_CARD 活動卡片 -->
              <div v-else-if="element.type === 'EVENT_CARD'" class="element-card-wrapper">
                <EventCard 
                  :content="{
                    image: element.value?.image || null,
                    tag: element.value?.tag || '法會活動',
                    title: element.value?.title || '中元普渡法會',
                    description: element.value?.description || '2024年中元普渡法會活動紀錄'
                  }"
                  :element="element"
                />
              </div>

              <!-- 未知類型 -->
              <div v-else class="element-unknown">
                <span>未知元件：{{ element.type }}</span>
              </div>

              <!-- 刪除按鈕 -->
              <button 
                class="delete-element-btn"
                @click.stop="handleDeleteElement(index)"
                title="刪除元件"
              >
                ✕
              </button>
            </div>

            <!-- 沒有元件：顯示空格子 -->
            <div v-else class="empty-cell" :class="{ 'drag-over': dragOverCell === index }">
              <span class="drop-hint">📦 拖曳元件至此</span>
            </div>
          </div>
        </div>

        <!-- 第二排 -->
        <div class="double-row" :style="doubleRowStyle">
          <div
            v-for="(element, rIndex) in doubleRowSplit.row2"
            :key="`row2-cell-${rIndex}`"
            class="grid-cell"
            :class="{ 
              'has-element': element && element.type,
              'is-selected': isElementSelected(doubleLayoutCols + rIndex) || isCellSelected(doubleLayoutCols + rIndex),
              'empty-cell': !element || !element.type
            }"
            :style="{ padding: getCellPadding(element), flex: getCellFlex(element), minWidth: 0 }"
            @click.stop="handleCellClick(doubleLayoutCols + rIndex, element)"
            @dragover="handleDragOver($event, doubleLayoutCols + rIndex)"
            @dragleave="handleDragLeave"
            @drop="handleDrop($event, doubleLayoutCols + rIndex)"
          >
            <!-- 有元件：顯示元件內容 -->
            <div v-if="element && element.type" class="element-content">
              <!-- IMG 元件 -->
              <div v-if="element.type === 'IMG'" class="element-image" :style="getImageContainerStyle(element)">
                <img 
                  v-if="element.value?.src" 
                  :src="element.value.src" 
                  :alt="element.value?.alt || '圖片'"
                  class="element-img"
                  :style="getElementStyle(element)"
                />
                <div v-else class="placeholder-image">
                  <img
                    src="https://images.unsplash.com/photo-1548013146-72479768bada?w=1280&h=300&fit=crop"
                    alt="placeholder"
                    class="placeholder-img"
                  />
                  <div class="placeholder-overlay">
                    <span>🖼️</span>
                    <p>請在右側上傳圖片</p>
                  </div>
                </div>
              </div>

              <!-- TEXT 元件 -->
              <div 
                v-else-if="element.type === 'TEXT'" 
                class="element-text"
                :style="getElementStyle(element)"
                v-html="element.value?.text || '文字內容'"
              ></div>

              <!-- BUTTON 元件 -->
              <div v-else-if="element.type === 'BUTTON'" class="element-button">
                <a 
                  :href="element.value?.url || '#'" 
                  class="button-link"
                  :style="getButtonStyle(element)"
                  @click.prevent
                >
                  {{ element.value?.text || '按鈕' }}
                </a>
              </div>

              <!-- HORIZON_LINE 元件 -->
              <div v-else-if="element.type === 'HORIZON_LINE'" class="element-hline">
                <hr :style="{ 
                  borderColor: element.value?.color || '#ddd',
                  borderWidth: element.value?.thickness || '2px'
                }" />
              </div>

              <!-- VERTICAL_LINE 元件 -->
              <div v-else-if="element.type === 'VERTICAL_LINE'" class="element-vline">
                <div class="vertical-line" :style="{ 
                  backgroundColor: element.value?.color || '#ddd',
                  width: element.value?.thickness || '2px'
                }"></div>
              </div>

              <!-- CAROUSEL_IMG 元件 -->
              <div v-else-if="element.type === 'CAROUSEL_IMG'" class="element-carousel">
                <CarouselElement 
                  :content="element.value"
                  :element="element"
                  :key="`carousel-r2-${rIndex}-${element.value?.imgs?.length || 0}`"
                />
              </div>

              <!-- GOOGLE_MAP 元件 -->
              <div v-else-if="element.type === 'GOOGLE_MAP'" class="element-map">
                <MapElement 
                  :content="{
                    address: element.value?.address || '',
                    lat: element.value?.lat || 25.033,
                    lng: element.value?.lng || 121.565,
                    zoom: element.value?.zoom || 15
                  }"
                  :element="element"
                  :key="`map-r2-${rIndex}-${element.value?.lat}-${element.value?.lng}`"
                />
              </div>

              <!-- ALBUM 元件 -->
              <div v-else-if="element.type === 'ALBUM'" class="element-card-wrapper">
                <AlbumCard 
                  :content="{
                    image: element.value?.image || null,
                    tag: element.value?.tag || '相簿封面',
                    title: element.value?.title || '相簿標題',
                    description: element.value?.description || ''
                  }"
                  :element="element"
                />
              </div>

              <!-- PRODUCT_CARD 商品卡片 -->
              <div v-else-if="element.type === 'PRODUCT_CARD'" class="element-card-wrapper">
                <ProductCard 
                  :content="{
                    image: element.value?.image || null,
                    tag: element.value?.tag || '法會活動',
                    title: element.value?.title || '商品標題',
                    date: element.value?.date || '2024-08-22'
                  }"
                  :element="element"
                />
              </div>

              <!-- SERVICE_CARD 服務卡片 -->
              <div v-else-if="element.type === 'SERVICE_CARD'" class="element-card-wrapper">
                <ServiceCard 
                  :content="{
                    image: element.value?.image || null,
                    tag: element.value?.tag || '祈福服務',
                    title: element.value?.title || '服務標題',
                    date: element.value?.date || '2024-08-22'
                  }"
                  :element="element"
                />
              </div>

              <!-- EVENT_CARD 活動卡片 -->
              <div v-else-if="element.type === 'EVENT_CARD'" class="element-card-wrapper">
                <EventCard 
                  :content="{
                    image: element.value?.image || null,
                    tag: element.value?.tag || '法會活動',
                    title: element.value?.title || '中元普渡法會',
                    description: element.value?.description || '2024年中元普渡法會活動紀錄'
                  }"
                  :element="element"
                />
              </div>

              <!-- 未知類型 -->
              <div v-else class="element-unknown">
                <span>未知元件：{{ element.type }}</span>
              </div>

              <!-- 刪除按鈕 -->
              <button 
                class="delete-element-btn"
                @click.stop="handleDeleteElement(doubleLayoutCols + rIndex)"
                title="刪除元件"
              >
                ✕
              </button>
            </div>

            <!-- 沒有元件：顯示空格子 -->
            <div v-else class="empty-cell" :class="{ 'drag-over': dragOverCell === (doubleLayoutCols + rIndex) }">
              <span class="drop-hint">📦 拖曳元件至此</span>
            </div>
          </div>
        </div>
      </template>

      <!-- ✅ 複合框架 A/B/C/D：左右欄 flex，右側各列高度彼此獨立，除非被左欄撐開 -->
      <template v-else-if="isCompositeLayout && compositeInfo">
        <div class="composite-frame">
          <!-- 左欄 -->
          <div class="composite-col composite-col--left" :style="{ width: compositeInfo.leftWidth }">
            <div
              v-for="idx in compositeInfo.leftCells"
              :key="`composite-left-${idx}`"
              class="grid-cell composite-cell"
              :class="{
                'has-element': displayElements[idx] && displayElements[idx].type,
                'is-selected': isElementSelected(idx) || isCellSelected(idx),
                'empty-cell': !displayElements[idx] || !displayElements[idx].type
              }"
              :style="{ padding: getCellPadding(displayElements[idx]) }"
              @click.stop="handleCellClick(idx, displayElements[idx])"
              @dragover="handleDragOver($event, idx)"
              @dragleave="handleDragLeave"
              @drop="handleDrop($event, idx)"
            >
              <div v-if="displayElements[idx] && displayElements[idx].type" class="element-content">
                <div v-if="displayElements[idx].type === 'IMG'" class="element-image" :style="getImageContainerStyle(displayElements[idx])">
                  <img v-if="displayElements[idx].value?.src" :src="displayElements[idx].value.src" :alt="displayElements[idx].value?.alt || '圖片'" class="element-img" :style="getElementStyle(displayElements[idx])" />
                  <div v-else class="placeholder-image">
                    <img src="https://images.unsplash.com/photo-1548013146-72479768bada?w=1280&h=300&fit=crop" alt="placeholder" class="placeholder-img" />
                    <div class="placeholder-overlay"><span>🖼️</span><p>請在右側上傳圖片</p></div>
                  </div>
                </div>
                <div v-else-if="displayElements[idx].type === 'TEXT'" class="element-text" :style="getElementStyle(displayElements[idx])" v-html="displayElements[idx].value?.text || '文字內容'"></div>
                <div v-else-if="displayElements[idx].type === 'BUTTON'" class="element-button">
                  <a :href="displayElements[idx].value?.url || '#'" class="button-link" :style="getButtonStyle(displayElements[idx])" @click.prevent>{{ displayElements[idx].value?.text || '按鈕' }}</a>
                </div>
                <div v-else-if="displayElements[idx].type === 'HORIZON_LINE'" class="element-hline">
                  <hr :style="{ borderColor: displayElements[idx].value?.color || '#ddd', borderWidth: displayElements[idx].value?.thickness || '2px' }" />
                </div>
                <div v-else-if="displayElements[idx].type === 'VERTICAL_LINE'" class="element-vline">
                  <div class="vertical-line" :style="{ backgroundColor: displayElements[idx].value?.color || '#ddd', width: displayElements[idx].value?.thickness || '2px' }"></div>
                </div>
                <div v-else-if="displayElements[idx].type === 'CAROUSEL_IMG'" class="element-carousel">
                  <CarouselElement :content="displayElements[idx].value" :element="displayElements[idx]" :key="`carousel-cl-${idx}-${displayElements[idx].value?.imgs?.length || 0}`" />
                </div>
                <div v-else-if="displayElements[idx].type === 'GOOGLE_MAP'" class="element-map">
                  <MapElement :content="{ address: displayElements[idx].value?.address || '', lat: displayElements[idx].value?.lat || 25.033, lng: displayElements[idx].value?.lng || 121.565, zoom: displayElements[idx].value?.zoom || 15 }" :element="displayElements[idx]" :key="`map-cl-${idx}-${displayElements[idx].value?.lat}-${displayElements[idx].value?.lng}`" />
                </div>
                <div v-else-if="displayElements[idx].type === 'ALBUM'" class="element-card-wrapper">
                  <AlbumCard :content="{ image: displayElements[idx].value?.image || null, tag: displayElements[idx].value?.tag || '相簿封面', title: displayElements[idx].value?.title || '相簿標題', description: displayElements[idx].value?.description || '' }" :element="displayElements[idx]" />
                </div>
                <div v-else-if="displayElements[idx].type === 'PRODUCT_CARD'" class="element-card-wrapper">
                  <ProductCard :content="{ image: displayElements[idx].value?.image || null, tag: displayElements[idx].value?.tag || '法會活動', title: displayElements[idx].value?.title || '商品標題', date: displayElements[idx].value?.date || '2024-08-22' }" :element="displayElements[idx]" />
                </div>
                <div v-else-if="displayElements[idx].type === 'SERVICE_CARD'" class="element-card-wrapper">
                  <ServiceCard :content="{ image: displayElements[idx].value?.image || null, tag: displayElements[idx].value?.tag || '祈福服務', title: displayElements[idx].value?.title || '服務標題', date: displayElements[idx].value?.date || '2024-08-22' }" :element="displayElements[idx]" />
                </div>
                <div v-else-if="displayElements[idx].type === 'EVENT_CARD'" class="element-card-wrapper">
                  <EventCard :content="{ image: displayElements[idx].value?.image || null, tag: displayElements[idx].value?.tag || '法會活動', title: displayElements[idx].value?.title || '中元普渡法會', description: displayElements[idx].value?.description || '2024年中元普渡法會活動紀錄' }" :element="displayElements[idx]" />
                </div>
                <div v-else class="element-unknown"><span>未知元件：{{ displayElements[idx].type }}</span></div>
                <button class="delete-element-btn" @click.stop="handleDeleteElement(idx)" title="刪除元件">✕</button>
              </div>
              <div v-else class="empty-cell" :class="{ 'drag-over': dragOverCell === idx }">
                <span class="drop-hint">📦 拖曳元件至此</span>
              </div>
            </div>
          </div>

          <!-- 右欄：flex column，各列高度彼此獨立 -->
          <div class="composite-col composite-col--right">
            <div
              v-for="idx in compositeInfo.rightCells"
              :key="`composite-right-${idx}`"
              class="grid-cell composite-cell"
              :class="{
                'has-element': displayElements[idx] && displayElements[idx].type,
                'is-selected': isElementSelected(idx) || isCellSelected(idx),
                'empty-cell': !displayElements[idx] || !displayElements[idx].type
              }"
              :style="{ padding: getCellPadding(displayElements[idx]) }"
              @click.stop="handleCellClick(idx, displayElements[idx])"
              @dragover="handleDragOver($event, idx)"
              @dragleave="handleDragLeave"
              @drop="handleDrop($event, idx)"
            >
              <div v-if="displayElements[idx] && displayElements[idx].type" class="element-content">
                <div v-if="displayElements[idx].type === 'IMG'" class="element-image" :style="getImageContainerStyle(displayElements[idx])">
                  <img v-if="displayElements[idx].value?.src" :src="displayElements[idx].value.src" :alt="displayElements[idx].value?.alt || '圖片'" class="element-img" :style="getElementStyle(displayElements[idx])" />
                  <div v-else class="placeholder-image">
                    <img src="https://images.unsplash.com/photo-1548013146-72479768bada?w=1280&h=300&fit=crop" alt="placeholder" class="placeholder-img" />
                    <div class="placeholder-overlay"><span>🖼️</span><p>請在右側上傳圖片</p></div>
                  </div>
                </div>
                <div v-else-if="displayElements[idx].type === 'TEXT'" class="element-text" :style="getElementStyle(displayElements[idx])" v-html="displayElements[idx].value?.text || '文字內容'"></div>
                <div v-else-if="displayElements[idx].type === 'BUTTON'" class="element-button">
                  <a :href="displayElements[idx].value?.url || '#'" class="button-link" :style="getButtonStyle(displayElements[idx])" @click.prevent>{{ displayElements[idx].value?.text || '按鈕' }}</a>
                </div>
                <div v-else-if="displayElements[idx].type === 'HORIZON_LINE'" class="element-hline">
                  <hr :style="{ borderColor: displayElements[idx].value?.color || '#ddd', borderWidth: displayElements[idx].value?.thickness || '2px' }" />
                </div>
                <div v-else-if="displayElements[idx].type === 'VERTICAL_LINE'" class="element-vline">
                  <div class="vertical-line" :style="{ backgroundColor: displayElements[idx].value?.color || '#ddd', width: displayElements[idx].value?.thickness || '2px' }"></div>
                </div>
                <div v-else-if="displayElements[idx].type === 'CAROUSEL_IMG'" class="element-carousel">
                  <CarouselElement :content="displayElements[idx].value" :element="displayElements[idx]" :key="`carousel-cr-${idx}-${displayElements[idx].value?.imgs?.length || 0}`" />
                </div>
                <div v-else-if="displayElements[idx].type === 'GOOGLE_MAP'" class="element-map">
                  <MapElement :content="{ address: displayElements[idx].value?.address || '', lat: displayElements[idx].value?.lat || 25.033, lng: displayElements[idx].value?.lng || 121.565, zoom: displayElements[idx].value?.zoom || 15 }" :element="displayElements[idx]" :key="`map-cr-${idx}-${displayElements[idx].value?.lat}-${displayElements[idx].value?.lng}`" />
                </div>
                <div v-else-if="displayElements[idx].type === 'ALBUM'" class="element-card-wrapper">
                  <AlbumCard :content="{ image: displayElements[idx].value?.image || null, tag: displayElements[idx].value?.tag || '相簿封面', title: displayElements[idx].value?.title || '相簿標題', description: displayElements[idx].value?.description || '' }" :element="displayElements[idx]" />
                </div>
                <div v-else-if="displayElements[idx].type === 'PRODUCT_CARD'" class="element-card-wrapper">
                  <ProductCard :content="{ image: displayElements[idx].value?.image || null, tag: displayElements[idx].value?.tag || '法會活動', title: displayElements[idx].value?.title || '商品標題', date: displayElements[idx].value?.date || '2024-08-22' }" :element="displayElements[idx]" />
                </div>
                <div v-else-if="displayElements[idx].type === 'SERVICE_CARD'" class="element-card-wrapper">
                  <ServiceCard :content="{ image: displayElements[idx].value?.image || null, tag: displayElements[idx].value?.tag || '祈福服務', title: displayElements[idx].value?.title || '服務標題', date: displayElements[idx].value?.date || '2024-08-22' }" :element="displayElements[idx]" />
                </div>
                <div v-else-if="displayElements[idx].type === 'EVENT_CARD'" class="element-card-wrapper">
                  <EventCard :content="{ image: displayElements[idx].value?.image || null, tag: displayElements[idx].value?.tag || '法會活動', title: displayElements[idx].value?.title || '中元普渡法會', description: displayElements[idx].value?.description || '2024年中元普渡法會活動紀錄' }" :element="displayElements[idx]" />
                </div>
                <div v-else class="element-unknown"><span>未知元件：{{ displayElements[idx].type }}</span></div>
                <button class="delete-element-btn" @click.stop="handleDeleteElement(idx)" title="刪除元件">✕</button>
              </div>
              <div v-else class="empty-cell" :class="{ 'drag-over': dragOverCell === idx }">
                <span class="drop-hint">📦 拖曳元件至此</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 單層框架（1_1 / 1_2 / 1_3 / 1_4） -->
      <div v-else class="frame-grid" :style="gridStyle">
        <template v-for="(element, index) in displayElements" :key="`cell-${index}`">
          <!-- 渲染格子 -->
          <div 
            class="grid-cell"
            :class="{ 
              'has-element': element && element.type,
              'is-selected': isElementSelected(index) || isCellSelected(index),
              'empty-cell': !element || !element.type
            }"
            :style="{
              padding: getCellPadding(element)
            }"
            @click.stop="handleCellClick(index, element)"
            @dragover="handleDragOver($event, index)"
            @dragleave="handleDragLeave"
            @drop="handleDrop($event, index)"
          >
            <!-- 有元件：顯示元件內容 -->
            <div v-if="element && element.type" class="element-content">
              <!-- IMG 元件 -->
              <div v-if="element.type === 'IMG'" class="element-image" :style="getImageContainerStyle(element)">
                <img 
                  v-if="element.value?.src" 
                  :src="element.value.src" 
                  :alt="element.value?.alt || '圖片'"
                  class="element-img"
                  :style="getElementStyle(element)"
                />
                <div v-else class="placeholder-image">
                  <img
                    src="https://images.unsplash.com/photo-1548013146-72479768bada?w=1280&h=300&fit=crop"
                    alt="placeholder"
                    class="placeholder-img"
                  />
                  <div class="placeholder-overlay">
                    <span>🖼️</span>
                    <p>請在右側上傳圖片</p>
                  </div>
                </div>
              </div>

              <!-- TEXT 元件 -->
              <div 
                v-else-if="element.type === 'TEXT'" 
                class="element-text"
                :style="getElementStyle(element)"
                v-html="element.value?.text || '文字內容'"
              ></div>

              <!-- BUTTON 元件 -->
              <div v-else-if="element.type === 'BUTTON'" class="element-button">
                <a 
                  :href="element.value?.url || '#'" 
                  class="button-link"
                  :style="getButtonStyle(element)"
                  @click.prevent
                >
                  {{ element.value?.text || '按鈕' }}
                </a>
              </div>

              <!-- HORIZON_LINE 元件 -->
              <div v-else-if="element.type === 'HORIZON_LINE'" class="element-hline">
                <hr :style="{ 
                  borderColor: element.value?.color || '#ddd',
                  borderWidth: element.value?.thickness || '2px'
                }" />
              </div>

              <!-- VERTICAL_LINE 元件 -->
              <div v-else-if="element.type === 'VERTICAL_LINE'" class="element-vline">
                <div class="vertical-line" :style="{ 
                  backgroundColor: element.value?.color || '#ddd',
                  width: element.value?.thickness || '2px'
                }"></div>
              </div>

              <!-- CAROUSEL_IMG 元件 -->
              <div v-else-if="element.type === 'CAROUSEL_IMG'" class="element-carousel">
                <CarouselElement 
                  :content="element.value"
                  :element="element"
                  :key="`carousel-${index}-${element.value?.imgs?.length || 0}-${element.value?.imgs?.[element.value.imgs.length - 1]?.id || 'empty'}`"
                />
              </div>

              <!-- GOOGLE_MAP 元件 -->
              <div v-else-if="element.type === 'GOOGLE_MAP'" class="element-map">
                <MapElement 
                  :content="{
                    address: element.value?.address || '',
                    lat: element.value?.lat || 25.033,
                    lng: element.value?.lng || 121.565,
                    zoom: element.value?.zoom || 15
                  }"
                  :element="element"
                  :key="`map-${index}-${element.value?.lat}-${element.value?.lng}`"
                />
              </div>

              <!-- ALBUM 元件 -->
              <div v-else-if="element.type === 'ALBUM'" class="element-card-wrapper">
                <AlbumCard 
                  :content="{
                    image: element.value?.image || null,
                    tag: element.value?.tag || '相簿封面',
                    title: element.value?.title || '相簿標題',
                    description: element.value?.description || ''
                  }"
                  :element="element"
                />
              </div>

              <!-- PRODUCT_CARD 商品卡片 -->
              <div v-else-if="element.type === 'PRODUCT_CARD'" class="element-card-wrapper">
                <ProductCard 
                  :content="{
                    image: element.value?.image || null,
                    tag: element.value?.tag || '法會活動',
                    title: element.value?.title || '商品標題',
                    date: element.value?.date || '2024-08-22'
                  }"
                  :element="element"
                />
              </div>

              <!-- SERVICE_CARD 服務卡片 -->
              <div v-else-if="element.type === 'SERVICE_CARD'" class="element-card-wrapper">
                <ServiceCard 
                  :content="{
                    image: element.value?.image || null,
                    tag: element.value?.tag || '祈福服務',
                    title: element.value?.title || '服務標題',
                    date: element.value?.date || '2024-08-22'
                  }"
                  :element="element"
                />
              </div>

              <!-- EVENT_CARD 活動卡片 -->
              <div v-else-if="element.type === 'EVENT_CARD'" class="element-card-wrapper">
                <EventCard 
                  :content="{
                    image: element.value?.image || null,
                    tag: element.value?.tag || '法會活動',
                    title: element.value?.title || '中元普渡法會',
                    description: element.value?.description || '2024年中元普渡法會活動紀錄'
                  }"
                  :element="element"
                />
              </div>

              <!-- 未知類型 -->
              <div v-else class="element-unknown">
                <span>未知元件：{{ element.type }}</span>
              </div>

              <!-- 刪除按鈕 -->
              <button 
                class="delete-element-btn"
                @click.stop="handleDeleteElement(index)"
                title="刪除元件"
              >
                ✕
              </button>
            </div>

            <!-- 沒有元件：顯示空格子 -->
            <div v-else class="empty-cell" :class="{ 'drag-over': dragOverCell === index }">
              <span class="drop-hint">📦 拖曳元件至此</span>
            </div>
          </div>
        </template>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CarouselElement from './elements/CarouselElement.vue'
import MapElement from './elements/MapElement.vue'
import AlbumCard from './elements/AlbumCard.vue'
import ProductCard from './elements/ProductCard.vue'
import ServiceCard from './elements/ServiceCard.vue'
import EventCard from './elements/EventCard.vue'

const props = defineProps({
  frame: {
    type: Object,
    required: true
  },
  basemap: {
    type: Object,
    required: true
  },
  basemapIndex: {
    type: Number,
    required: true
  },
  selectedElement: {
    type: Object,
    default: null
  },
  selectedCell: {
    type: Object,
    default: null
  },
  selectedFrame: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'select-frame',
  'select-element',
  'select-cell',
  'drop-to-cell',
  'delete-element',
  'delete-frame'
])

// 拖曳狀態
const dragOverCell = ref(null)

// ✅ 全局拖曳狀態
const isDragging = ref(false)

// ✅ 監聽全局拖曳事件
if (typeof window !== 'undefined') {
  window.addEventListener('dragstart', () => {
    isDragging.value = true
  })
  
  window.addEventListener('dragend', () => {
    isDragging.value = false
    dragOverCell.value = null
  })
  
  window.addEventListener('drop', () => {
    isDragging.value = false
    dragOverCell.value = null
  })
}

// 框架佈局類型
const frameLayout = computed(() => {
  if (!props.frame || !props.frame.type) {
    console.warn('⚠️ 框架缺少 type 屬性:', props.frame)
    return 'A'
  }
  
  const type = props.frame.type
  
  if (type.startsWith('FRAME')) {
    let layout = type.replace(/^FRAME/, '')
    layout = layout.replace(/^[-_]/, '')
    layout = layout.replace(/-/g, '_')
    
    console.log(`✓ 框架類型解析: ${type} → ${layout}`)
    return layout
  }
  
  return type
})

// 根據框架類型決定格子數量
const cellCount = computed(() => {
  const layout = frameLayout.value
  
  switch (layout) {
    case 'A':
    case 'B':
      return 3
    case 'C':
    case 'D':
      return 4
    case '1_1':
      return 1
    case '1_2':
      return 2
    case '1_3':
      return 3
    case '1_4':
      return 4
    case '2_2':
      return 4
    case '2_3':
      return 6
    case '2_4':
      return 8
    default:
      console.warn('⚠️ 未知框架佈局:', layout)
      return 4
  }
})

// 顯示用的元件陣列
const displayElements = computed(() => {
  const elements = props.frame.elements || []
  const result = [...elements]
  
  while (result.length < cellCount.value) {
    result.push(null)
  }
  
  return result.slice(0, cellCount.value)
})

// ✅ 檢查是否有任何元件（用於控制刪除按鈕顯示）
const hasAnyElement = computed(() => {
  const elements = props.frame.elements || []
  return elements.some(el => el && el.type)
})

// ✅ 雙層框架：欄數
const doubleLayoutCols = computed(() => {
  switch (frameLayout.value) {
    case '2_2': return 2
    case '2_3': return 3
    case '2_4': return 4
    default: return 0
  }
})

// ✅ 雙層框架：是否為雙層
const isDoubleRowLayout = computed(() => doubleLayoutCols.value > 0)

// ✅ 雙層框架：拆成兩排
const doubleRowSplit = computed(() => {
  if (!isDoubleRowLayout.value) return null
  const cols = doubleLayoutCols.value
  const els = displayElements.value
  return {
    row1: els.slice(0, cols),
    row2: els.slice(cols, cols * 2)
  }
})

// ✅ 雙層框架：每排的 flex 樣式
const doubleRowStyle = computed(() => ({
  display: 'flex',
  width: '100%'
}))

// ✅ 複合框架 A/B/C/D
const isCompositeLayout = computed(() => ['A', 'B', 'C', 'D'].includes(frameLayout.value))

const compositeInfo = computed(() => {
  const layout = frameLayout.value
  const els = displayElements.value
  const map = {
    'A': { leftCells: [0],       rightCells: [1, 2],    leftWidth: els[0]?.width || '66.7%' },
    'B': { leftCells: [0, 1],    rightCells: [2],       leftWidth: els[0]?.width || '33.3%' },
    'C': { leftCells: [0],       rightCells: [1, 2, 3], leftWidth: els[0]?.width || '66.7%' },
    'D': { leftCells: [0, 1, 2], rightCells: [3],       leftWidth: els[0]?.width || '33.3%' },
  }
  return map[layout] || null
})

// ✅ 框架容器樣式（支持自訂寬度）
const frameContainerStyle = computed(() => {
  const style = {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  }
  
  if (props.frame.metadata?.frameWidth) {
    style.maxWidth = props.frame.metadata.frameWidth
  }
  
  return style
})

// ✅ Grid 樣式 - 僅單層框架使用
const gridStyle = computed(() => {
  const layout = frameLayout.value
  const singleRowLayouts = ['1_1', '1_2', '1_3', '1_4']
  
  if (singleRowLayouts.includes(layout)) {
    const elements = displayElements.value
    const widths = elements.map(el => el && el.width ? el.width : '1fr')
    const columns = widths.join(' ')
    
    console.log(`✓ 動態 Grid 列寬 (${layout}):`, columns)
    
    return {
      display: 'grid',
      gridTemplateColumns: columns,
      gap: '0'
    }
  }
  
  console.warn('⚠️ 未知框架佈局 gridStyle:', layout)
  return {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0'
  }
})

// ✅ 是否選中框架
const isFrameSelected = computed(() => {
  return props.selectedFrame === props.frame
})

// 是否選中元件
const isElementSelected = (index) => {
  return props.selectedElement?.elementIndex === index && 
         props.selectedElement?.frame === props.frame
}

// ✅ 是否選中格子
const isCellSelected = (index) => {
  return props.selectedCell?.cellIndex === index && 
         props.selectedCell?.frame === props.frame
}

// ==================== ✅ 樣式相關方法 ====================

const getImageContainerStyle = (element) => {
  if (!element || !element.metadata) return {}
  const style = {}
  const _ta = element.metadata.textAlign || element.metadata.text_align
  if (_ta) style.textAlign = _ta
  return style
}

const getElementStyle = (element) => {
  if (!element || !element.metadata) return {}
  
  const metadata = element.metadata
  const style = {}
  
  if (metadata.color) style.color = metadata.color
  const _fontSize   = metadata.fontSize   || metadata.font_size
  const _fontWeight = metadata.fontWeight || metadata.font_weight
  const _textAlign  = metadata.textAlign  || metadata.text_align
  if (_fontSize)                          style.fontSize   = _fontSize
  if (_fontWeight)                        style.fontWeight = _fontWeight
  if (_textAlign && element.type !== 'IMG') style.textAlign = _textAlign
  if (metadata.width) style.width = metadata.width
  if (metadata.height) style.height = metadata.height
  const _bgColor = metadata.backgroundColor || metadata.background_color
  if (_bgColor) style.backgroundColor = _bgColor

  return style
}

const getButtonStyle = (element) => {
  if (!element || !element.metadata) return {}

  const metadata = element.metadata
  const style = {}

  if (metadata.color) style.color = metadata.color
  const _fontSize   = metadata.fontSize   || metadata.font_size
  const _fontWeight = metadata.fontWeight || metadata.font_weight
  const _bgColor    = metadata.backgroundColor || metadata.background_color
  if (_fontSize)   style.fontSize        = _fontSize
  if (_fontWeight) style.fontWeight      = _fontWeight
  if (_bgColor)    style.backgroundColor = _bgColor
  
  return style
}

// ==================== 事件處理 ====================

const handleFrameClick = () => {
  emit('select-frame', props.frame)
}

const handleCellClick = (index, element) => {
  if (element && element.type) {
    emit('select-element', {
      element: element,
      frame: props.frame,
      elementIndex: index,
      cellIndex: index
    })
  } else {
    emit('select-cell', {
      frame: props.frame,
      cellIndex: index
    })
    emit('select-frame', props.frame)
  }
}

const getCellPadding = (element) => {
  if (!element || !element.padding) {
    return '20px'
  }
  const { top = 20, right = 20, bottom = 20, left = 20 } = element.padding
  return `${top}px ${right}px ${bottom}px ${left}px`
}

const getCellFlex = (element) => {
  if (!element || !element.width) return '1'
  const w = element.width
  if (w === 'auto') return '1'
  return `0 0 ${w}`
}

const handleDragOver = (event, index) => {
  event.preventDefault()
  
  const element = displayElements.value[index]
  
  if (element && element.type) {
    event.dataTransfer.dropEffect = 'none'
    dragOverCell.value = null
  } else {
    event.dataTransfer.dropEffect = 'copy'
    dragOverCell.value = index
  }
}

const handleDragLeave = (event) => {
  event.preventDefault()
  dragOverCell.value = null
}

const handleDrop = (event, index) => {
  try {
    const data = event.dataTransfer.getData('application/json')
    if (!data) return
    
    const dragData = JSON.parse(data)
    console.log('📦 CustomFrame 收到 drop:', dragData.dragType)
    
    if (dragData.dragType !== 'element') {
      console.log('❌ 不是元件，讓事件冒泡到底圖處理')
      return
    }
    
    event.preventDefault()
    event.stopPropagation()
    dragOverCell.value = null
    
    console.log('📦 放置元件到格子 ' + index + ':', dragData)
    
    const element = displayElements.value[index]
    if (element && element.type) {
      alert('此格子已有元件')
      return
    }
    
    const newElement = createElementFromDrag(dragData, index)
    
    emit('drop-to-cell', {
      frame: props.frame,
      cellIndex: index,
      element: newElement
    })
    
  } catch (error) {
    console.error('❌ 處理拖放時發生錯誤:', error)
  }
}

const handleDeleteElement = (index) => {
  emit('delete-element', {
    frame: props.frame,
    elementIndex: index
  })
}

const handleDeleteFrame = () => {
  if (confirm('確定要刪除此框架嗎？')) {
    emit('delete-frame', {
      frame: props.frame,
      basemap: props.basemap,
      basemapIndex: props.basemapIndex
    })
  }
}

// 從拖曳數據創建元件
const createElementFromDrag = (dragData, index) => {
  const typeMap = {
    'text': 'TEXT',
    'image': 'IMG',
    'button': 'BUTTON',
    'h-line': 'HORIZON_LINE',
    'v-line': 'VERTICAL_LINE',
    'carousel': 'CAROUSEL_IMG',
    'map': 'GOOGLE_MAP',
    'product-card': 'PRODUCT_CARD',
    'service-card': 'SERVICE_CARD',
    'event-card': 'EVENT_CARD'
  }
  
  const apiType = typeMap[dragData.type] || dragData.type.toUpperCase()
  
  let value = {}
  
  switch (dragData.type) {
    case 'text':         value = { text: '<p>這是文字內容，點擊右側屬性面板進行編輯</p>' }; break
    case 'image':        value = { id: null, src: null, alt: '' }; break
    case 'button':       value = { text: '按鈕文字', url: '#' }; break
    case 'h-line':       value = { color: '#ddd', thickness: '2px' }; break
    case 'v-line':       value = { color: '#ddd', thickness: '2px' }; break
    case 'carousel':     value = { imgs: [], autoPlay: true, interval: 3000, height: 400 }; break
    case 'map':          value = { address: '台北市信義區信義路五段7號（台北 101）', lat: 25.0339639, lng: 121.5644722, zoom: 17 }; break
    case 'album':        value = { image: null, tag: '相簿封面', title: '相簿標題', description: '' }; break
    case 'product-card': value = { image: null, tag: '法會活動', title: '商品標題', date: '2024-08-22' }; break
    case 'service-card': value = { image: null, tag: '祈福服務', title: '服務標題', date: '2024-08-22' }; break
    case 'event-card':   value = { image: null, tag: '法會活動', title: '中元普渡法會', description: '2024年中元普渡法會活動紀錄' }; break
    default: value = {}
  }
  
  const initialWidth = getInitialCellWidth(frameLayout.value, index)
  
  console.log(`✓ 創建元件，佈局: ${frameLayout.value}, 初始寬度: ${initialWidth}`)
  
  return {
    type: apiType,
    value: value,
    metadata: {
      color: null,
      fontSize: null,
      fontWeight: null,
      textAlign: null,
      width: null,
      height: null,
      backgroundColor: null
    },
    padding: { top: 20, right: 20, bottom: 20, left: 20 },
    width: initialWidth
  }
}

const getInitialCellWidth = (layout, cellIndex) => {
  const singleRowLayouts = { '1_1': 1, '1_2': 2, '1_3': 3, '1_4': 4 }
  
  if (singleRowLayouts[layout]) {
    const cellsInRow = singleRowLayouts[layout]
    const existingElements = displayElements.value.filter(el => el && el.type)
    
    if (existingElements.length > 0) {
      let usedWidth = 0
      let elementsWithWidth = 0
      
      existingElements.forEach(el => {
        if (el.width && el.width.includes('%')) {
          const width = parseFloat(el.width)
          if (!isNaN(width)) { usedWidth += width; elementsWithWidth++ }
        }
      })
      
      const remainingWidth = 100 - usedWidth
      const remainingCells = cellsInRow - elementsWithWidth
      
      if (remainingCells > 0 && remainingWidth > 0) {
        return (remainingWidth / remainingCells).toFixed(1) + '%'
      }
    }
    
    return (100 / cellsInRow).toFixed(1) + '%'
  }

  const doubleRowCols = { '2_2': 2, '2_3': 3, '2_4': 4 }
  if (doubleRowCols[layout]) {
    const cols = doubleRowCols[layout]
    const row = cellIndex < cols ? 0 : 1
    const rowStart = row * cols
    const rowElements = displayElements.value.slice(rowStart, rowStart + cols)
    const existing = rowElements.filter(el => el && el.type)
    if (existing.length > 0) {
      let usedWidth = 0, elementsWithWidth = 0
      existing.forEach(el => {
        if (el.width && el.width.includes('%')) {
          const w = parseFloat(el.width)
          if (!isNaN(w)) { usedWidth += w; elementsWithWidth++ }
        }
      })
      const remainingWidth = 100 - usedWidth
      const remainingCells = cols - elementsWithWidth
      if (remainingCells > 0 && remainingWidth > 0) {
        return (remainingWidth / remainingCells).toFixed(1) + '%'
      }
    }
    return (100 / cols).toFixed(1) + '%'
  }
  
  const compositeLayoutInfo = {
    'A': { leftCells: [0],       rightCells: [1, 2],    defaultLeft: '66.7%', defaultRight: '33.3%' },
    'B': { leftCells: [0, 1],    rightCells: [2],       defaultLeft: '33.3%', defaultRight: '66.7%' },
    'C': { leftCells: [0],       rightCells: [1, 2, 3], defaultLeft: '66.7%', defaultRight: '33.3%' },
    'D': { leftCells: [0, 1, 2], rightCells: [3],       defaultLeft: '33.3%', defaultRight: '66.7%' },
  }
  if (compositeLayoutInfo[layout]) {
    const info = compositeLayoutInfo[layout]
    const isLeft = info.leftCells.includes(cellIndex)
    const allCells = isLeft ? info.leftCells : info.rightCells
    const els = displayElements.value
    for (const idx of allCells) {
      if (els[idx]?.width && els[idx].width.includes('%')) return els[idx].width
    }
    return isLeft ? info.defaultLeft : info.defaultRight
  }

  console.log(`✓ 非單行佈局 ${layout}: 默認 100%`)
  return '100%'
}
</script>

<style lang="scss" scoped>
.custom-frame {
  padding: 0;
  background: transparent;
  min-height: auto;
  position: relative;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 0 0 2px rgba(232, 87, 42, 0.2);
  }
  
  &.is-selected {
    box-shadow: 0 0 0 3px rgba(232, 87, 42, 0.5);
    
    .delete-frame-btn {
      opacity: 1;
    }
  }
}

.delete-frame-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  font-size: 16px;
  font-weight: bold;
  color: #666;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 100;
  
  &:hover {
    background: #dc3545;
    color: #fff;
    transform: scale(1.1);
  }
}

.frame-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.frame-grid {
  width: 100%;
}

.double-row {
  display: flex;
  width: 100%;
}

// ==================== ✅ 複合框架 A/B/C/D：flex 左右欄結構 ====================

.composite-frame {
  display: flex;
  width: 100%;
  align-items: stretch;  // 讓左右欄等高（左欄會被右側總高撐開，或反過來）
}

.composite-col {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  // 左欄只有一格時，撐滿整體高度
  &--left {
    .composite-cell:only-child {
      flex: 1;
    }
  }

  // 右欄：填滿剩餘寬度，各格 height: auto，高度彼此獨立
  &--right {
    flex: 1;
    flex-shrink: 1;

    .composite-cell {
      height: auto;  // ✅ 各格高度獨立，不會互相影響
    }
  }
}

.composite-cell {
  width: 100%;
  box-sizing: border-box;
}

// ==================== Grid Cell ====================

.grid-cell {
  min-height: auto;
  position: relative;
  border-radius: 8px;
  transition: all 0.2s;
  box-sizing: border-box;
  border: 2px solid transparent;
  
  &.has-element {
    cursor: pointer;
    
    &:hover {
      border-color: #E8572A;
    }
    
    &.is-selected {
      border-color: #E8572A;
      box-shadow: 0 0 0 3px rgba(232, 87, 42, 0.1);
    }
  }
  
  &.empty-cell.is-selected {
    border: 2px dashed #E8572A;
    background: rgba(232, 87, 42, 0.05);
  }
}

.element-content {
  position: relative;
  padding: 0;
  background: transparent;
  border-radius: 8px;
  
  &:hover .delete-element-btn {
    opacity: 1;
  }
}

.element-carousel {
  width: 100%;
  height: 100%;
}

.delete-element-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  font-size: 14px;
  font-weight: bold;
  color: #666;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
  
  &:hover {
    background: #dc3545;
    color: #fff;
    transform: scale(1.1);
  }
}

// ==================== 元件樣式 ====================

.element-image {
  width: 100%;
  
  .element-img {
    display: inline-block;
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    object-fit: cover;
    vertical-align: middle;
  }
  
  .placeholder-image {
    width: 100%;
    position: relative;
    border-radius: 4px;
    overflow: hidden;

    .placeholder-img {
      width: 100%;
      height: 100%;
      min-height: 200px;
      object-fit: cover;
      display: block;
      filter: brightness(0.7);
    }

    .placeholder-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.25);
      color: #fff;

      span {
        font-size: 36px;
        margin-bottom: 8px;
      }

      p {
        font-size: 13px;
        margin: 0;
        opacity: 0.9;
      }
    }
  }
}

.element-text {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  
  ::v-deep(p) {
    margin: 0 0 1em;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.element-button {
  display: flex;
  align-items: center;
  justify-content: center;
  
  .button-link {
    display: inline-block;
    padding: 12px 32px;
    background: #E8572A;
    color: #fff;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
    font-size: 16px;
    transition: background 0.2s;
    cursor: not-allowed;
    
    &:hover {
      background: #d14a1f;
    }
  }
}

.element-hline {
  padding: 20px 0;
  
  hr {
    border: none;
    border-top: 2px solid #ddd;
    margin: 0;
  }
}

.element-vline {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  min-height: 150px;
  
  .vertical-line {
    width: 2px;
    height: 100%;
    min-height: 100px;
    background: #ddd;
  }
}

.element-map {
  width: 100%;
}

.element-card-wrapper {
  width: 100%;
  height: auto;
}

.element-unknown {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #fff3cd;
  border: 2px dashed #ffc107;
  border-radius: 4px;
  color: #856404;
  font-size: 14px;
  min-height: 150px;
}

// ==================== 空格子樣式 ====================

.empty-cell {
  height: auto;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 2px dashed transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  .drop-hint {
    color: transparent;
    font-size: 14px;
    pointer-events: none;
    transition: all 0.2s;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.4);
    border-color: rgba(255, 255, 255, 0.6);
    
    .drop-hint {
      color: #999;
    }
  }
  
  &.drag-over {
    background: rgba(232, 87, 42, 0.15);
    border-color: #E8572A;
    border-width: 3px;
    border-style: solid;
    box-shadow: 0 0 0 4px rgba(232, 87, 42, 0.1);
    transform: scale(1.02);
    
    .drop-hint {
      color: #E8572A;
      transform: scale(1.1);
    }
  }
}

.custom-frame.is-dragging .empty-cell {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(200, 200, 200, 0.5);
  
  .drop-hint {
    color: #ccc;
  }
}
</style>
<template>
  <div class="activity-mgmt">
    <AppBreadcrumb :items="breadcrumbs" />

    <!-- Tab 導航 -->
    <div class="tab-nav">
      <button v-for="tab in tabs" :key="tab.key" class="tab-btn"
        :class="{ active: activeTab === tab.key }" @click="setTab(tab.key)">
        {{ tab.label }}
      </button>
    </div>

    <!-- ===== 活動管理 ===== -->
    <div v-if="activeTab === 'events'" class="tab-content">
      <div class="toolbar">
        <button class="btn-primary" @click="goCreateActivity">＋ 新增活動</button>
      </div>
      <div class="filter-grid filter-grid-4">
        <div class="filter-item">
          <div class="filter-label">關鍵字</div>
          <div class="search-wrap">
            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="eventFilter.keyword" class="filter-input" placeholder="搜尋活動名稱..." @keydown.enter="onEventSearch" />
          </div>
        </div>
        <div class="filter-item">
          <div class="filter-label">狀態</div>
          <select v-model="eventFilter.status" class="filter-select" @change="onEventSearch">
            <option value="">全部</option>
            <option value="PUBLISHED">已發佈</option>
            <option value="DRAFT">草稿</option>
            <option value="SCHEDULED">排程中</option>
            <option value="ARCHIVED">已封存</option>
          </select>
        </div>
      </div>
      <div class="export-bar">
        <button class="btn-export">⬇ 下載資料統計表</button>
        <button class="btn-export">⬇ 匯出當前篩選結果</button>
      </div>
      <div class="table-wrap">
        <div v-if="templeStore.isEventsLoading" class="loading-row">載入中...</div>
        <table v-else class="data-table">
          <thead><tr>
            <th>活動名稱</th><th>活動開始日期</th><th>活動結束日期</th><th>發佈狀態</th><th class="col-action">操作</th>
          </tr></thead>
          <tbody>
            <tr v-if="templeStore.events.length === 0">
              <td colspan="5" style="text-align:center; padding: 32px; color: #9ca3af;">暫無資料</td>
            </tr>
            <tr v-for="item in templeStore.events" :key="item.id">
              <td class="td-bold">{{ item.nameZhTw }}</td>
              <td>{{ item.startAt }}</td>
              <td>{{ item.endAt }}</td>
              <td><span class="badge" :class="eventStatusClass(item.status)">{{ eventStatusLabel(item.status) }}</span></td>
              <td class="col-action">
                <button class="icon-btn" @click="goViewActivity(item.id)">👁</button>
                <button class="icon-btn" @click="goEditActivity(item.id)">✏️</button>
                <button class="icon-btn del" @click="handleDeleteActivity(item.id)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="templeStore.eventsTotalPages > 1" class="pagination">
        <button class="page-btn" @click="goEventPage(eventPage - 1)" :disabled="eventPage === 1">上一頁</button>
        <button
          v-for="p in templeStore.eventsTotalPages" :key="p"
          class="page-btn page-num" :class="{ active: p === eventPage }"
          @click="goEventPage(p)"
        >{{ p }}</button>
        <button class="page-btn" @click="goEventPage(eventPage + 1)" :disabled="eventPage === templeStore.eventsTotalPages">下一頁</button>
      </div>
    </div>

    <!-- ===== 服務管理 ===== -->
    <div v-if="activeTab === 'services'" class="tab-content">
      <div class="toolbar">
        <button class="btn-primary" @click="goCreateService">＋ 新增服務</button>
      </div>
      <div class="filter-grid filter-grid-4">
        <div class="filter-item">
          <div class="filter-label">關鍵字</div>
          <div class="search-wrap">
            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="serviceFilter.keyword" class="filter-input" placeholder="搜尋服務名稱..." @keydown.enter="onServiceSearch" />
          </div>
        </div>
        <div class="filter-item">
          <div class="filter-label">服務類別</div>
          <select v-model="serviceFilter.category" class="filter-select" @change="onServiceSearch">
            <option value="">全部類別</option>
            <option value="1">法事</option>
            <option value="2">祈福</option>
            <option value="3">祭祀</option>
          </select>
        </div>
        <div class="filter-item">
          <div class="filter-label">最低價格</div>
          <input v-model="serviceFilter.minPrice" type="number" class="filter-input" placeholder="最低價格" @change="onServiceSearch" />
        </div>
        <div class="filter-item">
          <div class="filter-label">最高價格</div>
          <input v-model="serviceFilter.maxPrice" type="number" class="filter-input" placeholder="最高價格" @change="onServiceSearch" />
        </div>
        <div class="filter-item">
          <div class="filter-label">商品建立時間起</div>
          <input v-model="serviceFilter.startDate" type="date" class="filter-input filter-date" @change="onServiceSearch" />
        </div>
        <div class="filter-item">
          <div class="filter-label">商品建立時間迄</div>
          <input v-model="serviceFilter.endDate" type="date" class="filter-input filter-date" @change="onServiceSearch" />
        </div>
        <div class="filter-item">
          <div class="filter-label">關聯活動</div>
          <select v-model="serviceFilter.event" class="filter-select" @change="onServiceSearch">
            <option value="">全部</option>
            <option v-for="e in templeStore.events" :key="e.id" :value="e.id">{{ e.nameZhTw }}</option>
          </select>
        </div>
        <div class="filter-item">
          <div class="filter-label">發佈狀態</div>
          <select v-model="serviceFilter.status" class="filter-select" @change="onServiceSearch">
            <option value="">全部狀態</option>
            <option value="OPEN">上架</option>
            <option value="CLOSE">下架</option>
          </select>
        </div>
      </div>
      <div class="export-bar">
        <button class="btn-export">⬇ 下載資料統計表</button>
        <button class="btn-export">⬇ 匯出當前篩選結果</button>
      </div>
      <div class="table-wrap">
        <div v-if="templeStore.isServicesLoading" class="loading-row">載入中...</div>
        <table v-else class="data-table">
          <thead><tr>
            <th>服務名稱</th><th>價格</th><th>商品數量</th><th>開始日期</th><th>結束日期</th><th>關聯活動</th><th>報名人數</th><th>發佈狀態</th><th class="col-action">操作</th>
          </tr></thead>
          <tbody>
            <tr v-if="templeStore.services.length === 0">
              <td colspan="9" style="text-align:center; padding: 32px; color: #9ca3af;">暫無資料</td>
            </tr>
            <tr v-for="item in templeStore.services" :key="item.id">
              <td class="td-bold">{{ item.nameZhTw }}</td>
              <td>{{ item.price ?? '-' }}</td>
              <td>{{ item.allStock ?? '-' }}</td>
              <td>{{ item.startAt ? item.startAt.slice(0, 10).replace(/-/g, '/') : '-' }}</td>
              <td>{{ item.endAt ? item.endAt.slice(0, 10).replace(/-/g, '/') : '-' }}</td>
              <td>{{ item.events?.map(e => e.name).join('、') || '-' }}</td>
              <td>{{ item.registrationCount ?? '-' }}</td>
              <td>
                <span class="badge" :class="item.status === 'OPEN' ? 'badge-published' : 'badge-draft'">
                  {{ item.status === 'OPEN' ? '上架' : '下架' }}
                </span>
              </td>
              <td class="col-action">
                <button class="icon-btn" @click="goViewService(item.id)">👁</button>
                <button class="icon-btn" @click="goEditService(item.id)">✏️</button>
                <button class="icon-btn del" @click="handleDeleteService(item.id)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination" v-if="!templeStore.isServicesLoading">
        <button class="page-btn" :disabled="servicePage === 1" @click="goServicePage(servicePage - 1)">上一頁</button>
        <template v-if="templeStore.servicesTotalPages > 0">
          <button v-for="p in templeStore.servicesTotalPages" :key="p" class="page-btn page-num" :class="{ active: p === servicePage }" @click="goServicePage(p)">{{ p }}</button>
        </template>
        <button v-else class="page-btn page-num active">1</button>
        <button class="page-btn" :disabled="servicePage === templeStore.servicesTotalPages || templeStore.servicesTotalPages === 0" @click="goServicePage(servicePage + 1)">下一頁</button>
      </div>
    </div>

    <!-- ===== 商品管理 ===== -->
    <div v-if="activeTab === 'products'" class="tab-content">
      <div class="toolbar">
        <button class="btn-primary" @click="goSelectProductType">＋ 新增商品</button>
      </div>
      <div class="filter-grid filter-grid-4">
        <div class="filter-item">
          <div class="filter-label">關鍵字</div>
          <div class="search-wrap">
            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="productFilter.keyword" class="filter-input" placeholder="搜尋商品或規格名稱..." @keydown.enter="onProductSearch" />
          </div>
        </div>
        <div class="filter-item">
          <div class="filter-label">商品類別</div>
          <select v-model="productFilter.category" class="filter-select" @change="onProductSearch">
            <option value="">全部分類</option>
            <option v-for="c in productCategories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="filter-item">
          <div class="filter-label">最低價格</div>
          <input v-model="productFilter.minPrice" type="number" class="filter-input" placeholder="最低價格" @change="onProductSearch" />
        </div>
        <div class="filter-item">
          <div class="filter-label">最高價格</div>
          <input v-model="productFilter.maxPrice" type="number" class="filter-input" placeholder="最高價格" @change="onProductSearch" />
        </div>
        <div class="filter-item">
          <div class="filter-label">上架日期</div>
          <input v-model="productFilter.onDate" type="date" class="filter-input filter-date" @change="onProductSearch" />
        </div>
        <div class="filter-item">
          <div class="filter-label">下架日期</div>
          <input v-model="productFilter.offDate" type="date" class="filter-input filter-date" @change="onProductSearch" />
        </div>
        <div class="filter-item">
          <div class="filter-label">關聯活動</div>
          <select v-model="productFilter.event" class="filter-select" @change="onProductSearch">
            <option value="">全部</option>
            <option v-for="e in templeStore.events" :key="e.id" :value="e.id">{{ e.nameZhTw }}</option>
          </select>
        </div>
        <div class="filter-item">
          <div class="filter-label">篩選條件</div>
          <label class="checkbox-label">
            <input type="checkbox" v-model="productFilter.permanent" @change="onProductSearch" />
            常駐商品
          </label>
        </div>
      </div>
      <div class="export-bar">
        <button class="btn-export">⬇ 下載資料統計表</button>
        <button class="btn-export">⬇ 匯出當前篩選結果</button>
      </div>
      <div class="table-wrap">
        <div v-if="templeStore.isPhysicalProductsLoading" class="loading-row">載入中...</div>
        <table v-else class="data-table">
          <thead><tr>
            <th>商品名稱</th><th>上架日期</th><th>下架日期</th><th>關聯活動</th><th>發佈狀態</th><th class="col-action">操作</th>
          </tr></thead>
          <tbody>
            <tr v-if="templeStore.physicalProducts.length === 0">
              <td colspan="6" style="text-align:center; padding: 32px; color: #9ca3af;">暫無資料</td>
            </tr>
            <tr v-for="item in templeStore.physicalProducts" :key="item.id">
              <td class="td-bold">{{ item.nameZhTw }}</td>
              <td>{{ item.publishAt ? item.publishAt.slice(0, 10).replace(/-/g, '/') : '-' }}</td>
              <td>{{ item.unpublishAt ? item.unpublishAt.slice(0, 10).replace(/-/g, '/') : '常駐' }}</td>
              <td>{{ item.events?.map(e => e.name).join('、') || '-' }}</td>
              <td>
                <span class="badge" :class="item.status === 'OPEN' ? 'badge-published' : 'badge-draft'">
                  {{ item.status === 'OPEN' ? '上架' : '下架' }}
                </span>
              </td>
              <td class="col-action">
                <button class="icon-btn" @click="goViewProduct(item.id)">👁</button>
                <button class="icon-btn" @click="goEditProduct(item.id)">✏️</button>
                <button class="icon-btn del" @click="handleDeleteProduct(item.id)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination" v-if="!templeStore.isPhysicalProductsLoading">
        <button class="page-btn" :disabled="productPage === 1" @click="goProductPage(productPage - 1)">上一頁</button>
        <template v-if="templeStore.physicalProductsTotalPages > 0">
          <button v-for="p in templeStore.physicalProductsTotalPages" :key="p" class="page-btn page-num" :class="{ active: p === productPage }" @click="goProductPage(p)">{{ p }}</button>
        </template>
        <button v-else class="page-btn page-num active">1</button>
        <button class="page-btn" :disabled="productPage === templeStore.physicalProductsTotalPages || templeStore.physicalProductsTotalPages === 0" @click="goProductPage(productPage + 1)">下一頁</button>
      </div>
    </div>

    <!-- ===== 捐款管理 ===== -->
    <div v-if="activeTab === 'donations'" class="tab-content">
      <!-- 統計卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">本月捐款總額</div>
          <div class="stat-value stat-orange">NT$ 18,000</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">本月捐款筆數</div>
          <div class="stat-value">3 筆</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">累計總額</div>
          <div class="stat-value">NT$ 856k</div>
        </div>
        <div class="stat-card stat-ranking">
          <div class="stat-card-header">
            <span class="stat-label">捐款人排名紀錄</span>
            <button class="btn-more">查看更多</button>
          </div>
          <div class="ranking-list">
            <div v-for="(r, i) in donationRanking" :key="i" class="ranking-row">
              <span class="ranking-no">{{ i + 1 }}. {{ r.name }}</span>
              <span class="ranking-amount">NT$ {{ r.amount }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="toolbar">
        <button class="btn-primary" @click="goCreateDonation">+ 新增捐款商品</button>
      </div>

      <div class="filter-grid filter-grid-4">
        <div class="filter-item">
          <div class="filter-label">關鍵字</div>
          <div class="search-wrap">
            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="donationFilter.keyword" class="filter-input" placeholder="搜尋捐款人、付款人、訂單編號..." @keydown.enter="onDonationSearch" />
          </div>
        </div>
        <div class="filter-item">
          <div class="filter-label">起始日期</div>
          <input v-model="donationFilter.startDate" type="date" class="filter-input filter-date" @change="onDonationSearch" />
        </div>
        <div class="filter-item">
          <div class="filter-label">商品建立時間迄</div>
          <input v-model="donationFilter.endDate" type="date" class="filter-input filter-date" @change="onDonationSearch" />
        </div>
      </div>

      <div class="export-bar">
        <button class="btn-export">⬇ 下載資料統計表</button>
        <button class="btn-export">⬇ 匯出當前篩選結果</button>
      </div>

      <div class="table-wrap">
        <div v-if="templeStore.isDonationProductsLoading" class="loading-row">載入中...</div>
        <table v-else class="data-table">
          <thead><tr>
            <th>商品名稱</th><th>上架時間</th><th>下架時間</th><th>是否開發票</th><th>發佈狀態</th><th class="col-action">操作</th>
          </tr></thead>
          <tbody>
            <tr v-if="templeStore.donationProducts.length === 0">
              <td colspan="6" style="text-align:center; padding: 32px; color: #9ca3af;">暫無資料</td>
            </tr>
            <tr v-for="item in templeStore.donationProducts" :key="item.id">
              <td class="td-bold">{{ item.nameZhTw }}</td>
              <td>{{ item.publishAt ? item.publishAt.slice(0, 10).replace(/-/g, '/') : '-' }}</td>
              <td>{{ item.unpublishAt ? item.unpublishAt.slice(0, 10).replace(/-/g, '/') : '常駐' }}</td>
              <td>{{ item.isInvoiceSupported ? '是' : '否' }}</td>
              <td>
                <span class="badge" :class="item.status === 'OPEN' ? 'badge-published' : 'badge-draft'">
                  {{ item.status === 'OPEN' ? '上架' : '下架' }}
                </span>
              </td>
              <td class="col-action">
                <button class="icon-btn" title="查看" @click="goViewDonation(item.id)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="icon-btn del" @click="handleDeleteDonation(item.id)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <button class="page-btn" :disabled="donationPage <= 1" @click="goDonationPage(donationPage - 1)">上一頁</button>
        <button v-for="p in templeStore.donationProductsTotalPages" :key="p"
          class="page-btn page-num" :class="{ active: p === donationPage }" @click="goDonationPage(p)">{{ p }}</button>
        <button class="page-btn" :disabled="donationPage >= templeStore.donationProductsTotalPages" @click="goDonationPage(donationPage + 1)">下一頁</button>
      </div>
    </div>

    <!-- ===== 運費管理 ===== -->
    <div v-if="activeTab === 'shipping'" class="tab-content">
      <div class="toolbar">
        <button class="btn-primary" @click="goCreateShippingRule">＋ 新增運費規則</button>
      </div>

      <div v-if="templeStore.isShippingRulesLoading" class="loading-state">載入中...</div>

      <template v-else>
        <div v-if="templeStore.shippingRules.length === 0" class="empty-state">尚無運費規則</div>

        <div v-else class="folder-list">
          <div
            v-for="(rule, idx) in templeStore.shippingRules"
            :key="rule.id"
            class="folder-item"
            :class="{ open: expandedRules.has(rule.id), 'drag-over': dragOverIndex === idx }"
            draggable="true"
            @dragstart="onDragStart(idx)"
            @dragover.prevent="onDragOver(idx)"
            @dragleave="onDragLeave"
            @drop="onDrop(idx)"
            @dragend="onDragEnd"
          >
            <!-- 資料夾標題列 -->
            <div class="folder-header" @click="toggleRule(rule.id)">
              <span class="drag-handle" @click.stop title="拖曳排序">⠿</span>
              <span class="folder-arrow">{{ expandedRules.has(rule.id) ? '▾' : '▸' }}</span>
              <span class="folder-name">{{ rule.name }}</span>
              <span class="folder-type">{{ shippingTypeLabel(rule.type) }}</span>
              <span class="badge" :class="rule.status === 'OPEN' ? 'badge-published' : 'badge-draft'">
                {{ rule.status === 'OPEN' ? '啟用' : '停用' }}
              </span>
              <div class="folder-actions" @click.stop>
                <button class="icon-btn" @click="goViewShippingRule(rule.id)">✏️</button>
                <button class="icon-btn del" @click="handleDeleteShippingRule(rule.id)">🗑️</button>
              </div>
            </div>

            <!-- 展開內容：tiers -->
            <div v-if="expandedRules.has(rule.id)" class="folder-body">
              <div v-if="rule.type === 'TIERED' && rule.tiers && rule.tiers.length">
                <table class="tier-table">
                  <thead>
                    <tr>
                      <th>最低金額 (元)</th>
                      <th>最高金額 (元)</th>
                      <th>運費 (元)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="tier in rule.tiers" :key="tier.id">
                      <td>{{ tier.minValue }}</td>
                      <td>{{ tier.maxValue === null ? '以上' : tier.maxValue }}</td>
                      <td>{{ tier.fee }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else-if="rule.type === 'FLAT'" class="flat-desc">
                固定運費，無級距設定
              </div>
              <div v-else-if="rule.type === 'FREE'" class="flat-desc">
                免運費
              </div>
              <div v-else class="flat-desc">無資料</div>
            </div>
          </div>
        </div>
      </template>

      <div class="shipping-info-box">
        <div class="shipping-info-title">💡 運費計算說明</div>
        <p><strong>普通運費：</strong>系統會依據訂單總金額自動套用對應級距的運費。例如訂單金額為 $800，則套用級距 2 的運費 $60。</p>
        <p><strong>特殊運費：</strong>若訂單中包含標註為「特殊運費」的商品，則該商品將使用其獨立設定的運費，不受普通運費級距影響。</p>
        <p><strong>混合運費：</strong>當訂單同時包含普通商品與特殊商品時，系統將分別計算並加總兩種運費。</p>
      </div>
    </div>

    <!-- ===== 數位光明燈管理 ===== -->
    <div v-if="activeTab === 'lanterns'" class="tab-content">
      <div class="toolbar">
        <button class="btn-primary" @click="goCreateLamp">＋ 新增燈種</button>
        <button class="btn-secondary">↑ 增加燈位數量</button>
      </div>
      <div class="filter-grid filter-grid-4">
        <div class="filter-item">
          <div class="filter-label">關鍵字</div>
          <div class="search-wrap">
            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="lampFilter.keyword" class="filter-input" placeholder="搜尋燈種名稱..." @keydown.enter="onLampSearch" />
          </div>
        </div>
        <div class="filter-item">
          <div class="filter-label">燈種類別</div>
          <select v-model="lampFilter.category" class="filter-select" @change="onLampSearch">
            <option value="">全部類別</option>
          </select>
        </div>
        <div class="filter-item">
          <div class="filter-label">最低價格</div>
          <input v-model="lampFilter.minPrice" type="number" class="filter-input" placeholder="最低價格" @change="onLampSearch" />
        </div>
        <div class="filter-item">
          <div class="filter-label">最高價格</div>
          <input v-model="lampFilter.maxPrice" type="number" class="filter-input" placeholder="最高價格" @change="onLampSearch" />
        </div>
        <div class="filter-item">
          <div class="filter-label">商品建立時間起</div>
          <input v-model="lampFilter.startDate" type="date" class="filter-input filter-date" @change="onLampSearch" />
        </div>
        <div class="filter-item">
          <div class="filter-label">商品建立時間迄</div>
          <input v-model="lampFilter.endDate" type="date" class="filter-input filter-date" @change="onLampSearch" />
        </div>
        <div class="filter-item">
          <div class="filter-label">關聯活動</div>
          <select v-model="lampFilter.event" class="filter-select" @change="onLampSearch">
            <option value="">全部</option>
            <option v-for="e in templeStore.events" :key="e.id" :value="e.id">{{ e.nameZhTw }}</option>
          </select>
        </div>
        <div class="filter-item">
          <div class="filter-label">發佈狀態</div>
          <select v-model="lampFilter.status" class="filter-select" @change="onLampSearch">
            <option value="">全部狀態</option>
            <option value="OPEN">上架</option>
            <option value="CLOSE">下架</option>
          </select>
        </div>
      </div>
      <div class="export-bar">
        <button class="btn-export">⬇ 下載資料統計表</button>
        <button class="btn-export">⬇ 匯出當前篩選結果</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr>
            <th>燈種名稱</th>
            <th>關聯活動</th>
            <th>是否開發票</th>
            <th>發佈狀態</th>
            <th class="col-action">操作</th>
          </tr></thead>
          <tbody>
            <tr v-if="templeStore.isLampProductsLoading">
              <td colspan="5" style="text-align:center;color:#aaa;padding:32px">載入中...</td>
            </tr>
            <tr v-else-if="templeStore.lampProducts.length === 0">
              <td colspan="5" style="text-align:center;color:#aaa;padding:32px">尚無燈種資料</td>
            </tr>
            <tr v-for="item in templeStore.lampProducts" :key="item.id">
              <td class="td-bold">{{ item.nameZhTw }}</td>
              <td>{{ item.events?.map(e => e.name).join('、') || '-' }}</td>
              <td>{{ item.isInvoiceSupported ? '是' : '否' }}</td>
              <td><span class="badge" :class="lanternStatusClass(item.status)">{{ lanternStatusLabel(item.status) }}</span></td>
              <td class="col-action">
                <button class="icon-btn" @click="goViewLamp(item.id)">👁</button>
                <button class="icon-btn" @click="goViewLamp(item.id)">✏️</button>
                <button class="icon-btn del" @click="handleDeleteLamp(item.id)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="templeStore.lampProductsTotalPages > 1" class="pagination">
        <button class="page-btn" @click="goLampPage(lampPage - 1)" :disabled="lampPage === 1">上一頁</button>
        <button
          v-for="p in templeStore.lampProductsTotalPages" :key="p"
          class="page-btn page-num" :class="{ active: p === lampPage }"
          @click="goLampPage(p)"
        >{{ p }}</button>
        <button class="page-btn" @click="goLampPage(lampPage + 1)" :disabled="lampPage === templeStore.lampProductsTotalPages">下一頁</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'
import { useTempleStore } from '@/stores/temple'

const route = useRoute()
const router = useRouter()
const templeId = computed(() => route.params.templeId)
const templeStore = useTempleStore()

const breadcrumbs = [
  { text: '後台管理' },
  { text: '活動與上架管理' },
]

const VALID_TABS = ['events', 'services', 'products', 'donations', 'shipping', 'lanterns']

const tabs = [
  { key: 'events',    label: '活動管理' },
  { key: 'services',  label: '服務管理' },
  { key: 'products',  label: '商品管理' },
  { key: 'donations', label: '捐款管理' },
  { key: 'lanterns',  label: '數位光明燈管理' },
  { key: 'shipping',  label: '運費管理' },
]

// 從 route.query.tab 初始化，fallback 到 'events'
const activeTab = ref(
  VALID_TABS.includes(route.query.tab) ? route.query.tab : 'events'
)

// 切換 tab：更新 state + URL query（replace 不產生新歷史）
const setTab = (key) => {
  activeTab.value = key
  router.replace({ query: { ...route.query, tab: key } })
}

// 監聽 URL query 變化（例如瀏覽器上一頁/下一頁）
watch(() => route.query.tab, (val) => {
  if (val && VALID_TABS.includes(val) && val !== activeTab.value) {
    activeTab.value = val
  }
})

watch(activeTab, (tab) => {
  if (tab === 'events')    loadEvents()
  if (tab === 'services')  loadServices()
  if (tab === 'products')  loadProducts()
  if (tab === 'donations') loadDonations()
  if (tab === 'shipping')  loadShippingRules()
  if (tab === 'lanterns')  loadLamps()
})

onMounted(() => {
  if (activeTab.value === 'events')    loadEvents()
  if (activeTab.value === 'services')  loadServices()
  if (activeTab.value === 'products')  loadProducts()
  if (activeTab.value === 'donations') loadDonations()
  if (activeTab.value === 'shipping')  loadShippingRules()
  if (activeTab.value === 'lanterns')  loadLamps()
})

// ── 導航方法（帶 tab query 讓子頁面返回時恢復） ──
const goCreateActivity = () => {
  router.push({ name: 'app.temple.activity-create', params: { templeId: templeId.value } })
}
const goViewActivity = (id) => {
  router.push({ name: 'app.temple.activity-detail', params: { templeId: templeId.value, activityId: id } })
}
const goEditActivity = (id) => {
  router.push({ name: 'app.temple.activity-edit', params: { templeId: templeId.value, activityId: id } })
}
const goCreateService = () => {
  router.push({ name: 'app.temple.service-create', params: { templeId: templeId.value } })
}
const goViewService = (id) => {
  router.push({ name: 'app.temple.service-detail', params: { templeId: templeId.value, serviceId: id } })
}
const goEditService = (id) => {
  router.push({ name: 'app.temple.service-edit', params: { templeId: templeId.value, serviceId: id } })
}
const handleDeleteService = async (id) => {
  if (!confirm('確定要刪除此服務嗎？')) return
  try {
    await templeStore.deleteService(templeId.value, id)
    alert('刪除成功！')
    loadServices()
  } catch (err) {
    console.error('刪除服務失敗:', err)
    alert(err?.response?.data?.message || '刪除失敗，請稍後再試')
  }
}

const handleDeleteActivity = async (id) => {
  if (!confirm('確定要刪除此活動嗎？')) return
  try {
    await templeStore.deleteEvent(templeId.value, id)
    alert('刪除成功！')
    loadEvents()
  } catch (err) {
    console.error('刪除活動失敗:', err)
    alert(err?.response?.data?.message || '刪除失敗，請稍後再試')
  }
}

const handleDeleteProduct = async (id) => {
  if (!confirm('確定要刪除此商品嗎？')) return
  try {
    await templeStore.deletePhysicalProduct(templeId.value, id)
    alert('刪除成功！')
    loadProducts()
  } catch (err) {
    console.error('刪除商品失敗:', err)
    alert(err?.response?.data?.message || '刪除失敗，請稍後再試')
  }
}

const handleDeleteDonation = async (id) => {
  if (!confirm('確定要刪除此捐款商品嗎？')) return
  try {
    await templeStore.deleteDonationProduct(templeId.value, id)
    alert('刪除成功！')
    loadDonations()
  } catch (err) {
    console.error('刪除捐款商品失敗:', err)
    alert(err?.response?.data?.message || '刪除失敗，請稍後再試')
  }
}

const goViewLamp = (id) => {
  router.push({ name: 'app.temple.lamp-detail', params: { templeId: templeId.value, lampId: id } })
}

const handleDeleteLamp = async (id) => {
  if (!confirm('確定要刪除此燈種嗎？')) return
  try {
    await templeStore.deleteLampProduct(templeId.value, id)
    alert('刪除成功！')
    loadLamps()
  } catch (err) {
    console.error('刪除燈種失敗:', err)
    alert(err?.response?.data?.message || '刪除失敗，請稍後再試')
  }
}
const goCreateDonation = () => {
  router.push({ name: 'app.temple.donation-create', params: { templeId: templeId.value } })
}
const goSelectProductType = () => {
  router.push({ name: 'app.temple.product-select', params: { templeId: templeId.value } })
}
const goViewProduct = (id) => {
  router.push({ name: 'app.temple.product-detail', params: { templeId: templeId.value, productId: id } })
}
const goEditProduct = (id) => {
  router.push({ name: 'app.temple.product-edit', params: { templeId: templeId.value, productId: id } })
}

// ── 活動管理 ──
const eventFilter = reactive({ keyword: '', status: '' })
const eventPage = ref(1)

const eventStatusLabel = (s) => {
  if (s === 'PUBLISHED') return '已發佈'
  if (s === 'DRAFT')     return '草稿'
  if (s === 'SCHEDULED') return '排程中'
  if (s === 'ARCHIVED')  return '已封存'
  return s
}
const eventStatusClass = (s) => ({
  'badge-published': s === 'PUBLISHED',
  'badge-draft':     s === 'DRAFT',
  'badge-scheduled': s === 'SCHEDULED',
})

const loadEvents = () => {
  templeStore.fetchEvents(templeId.value, {
    name:     eventFilter.keyword,
    status:   eventFilter.status,
    page:     eventPage.value,
    pageSize: 10,
  })
}

const onEventSearch = () => {
  eventPage.value = 1
  loadEvents()
}

let eventSearchTimer = null
watch(() => eventFilter.keyword, () => {
  clearTimeout(eventSearchTimer)
  eventSearchTimer = setTimeout(() => { onEventSearch() }, 400)
})

const goEventPage = (page) => {
  if (page >= 1 && page <= templeStore.eventsTotalPages) {
    eventPage.value = page
    loadEvents()
  }
}

// ── 服務管理 ──
const serviceFilter = reactive({ keyword: '', category: '', status: '', minPrice: '', maxPrice: '', startDate: '', endDate: '', event: '' })
const servicePage = ref(1)

const loadServices = () => {
  templeStore.fetchServices(templeId.value, {
    name:       serviceFilter.keyword   || undefined,
    categoryId: serviceFilter.category  || undefined,
    status:     serviceFilter.status    || undefined,
    eventId:    serviceFilter.event     || undefined,
    startAt:    serviceFilter.startDate || undefined,
    endAt:      serviceFilter.endDate   || undefined,
    minPrice:   serviceFilter.minPrice  || undefined,
    maxPrice:   serviceFilter.maxPrice  || undefined,
    page:       servicePage.value,
    pageSize:   10,
  })
}

const onServiceSearch = () => {
  servicePage.value = 1
  loadServices()
}

let serviceSearchTimer = null
watch(() => serviceFilter.keyword, () => {
  clearTimeout(serviceSearchTimer)
  serviceSearchTimer = setTimeout(() => { onServiceSearch() }, 400)
})

const goServicePage = (page) => {
  if (page >= 1 && page <= templeStore.servicesTotalPages) {
    servicePage.value = page
    loadServices()
  }
}

// ── 商品管理 ──
const productFilter = reactive({ keyword: '', category: '', minPrice: '', maxPrice: '', onDate: '', offDate: '', event: '', permanent: false })
const productCategories = ['法器', '香品', '福袋', '護身符']
const productPage = ref(1)

const loadProducts = () => {
  templeStore.fetchPhysicalProducts(templeId.value, {
    name:       productFilter.keyword  || undefined,
    categoryId: productFilter.category || undefined,
    eventId:    productFilter.event    || undefined,
    startAt:    productFilter.onDate   || undefined,
    endAt:      productFilter.offDate  || undefined,
    minPrice:   productFilter.minPrice || undefined,
    maxPrice:   productFilter.maxPrice || undefined,
    page:       productPage.value,
    pageSize:   10,
  })
}

const onProductSearch = () => {
  productPage.value = 1
  loadProducts()
}

let productSearchTimer = null
watch(() => productFilter.keyword, () => {
  clearTimeout(productSearchTimer)
  productSearchTimer = setTimeout(() => { onProductSearch() }, 400)
})

const goProductPage = (page) => {
  if (page >= 1 && page <= templeStore.physicalProductsTotalPages) {
    productPage.value = page
    loadProducts()
  }
}

// ── 捐款管理 ──
const donationFilter = reactive({ keyword: '', startDate: '', endDate: '', category: '', minAmount: '', maxAmount: '' })
const donationRanking = ref([
  { name: '王大明', amount: '150k' },
  { name: '李美華', amount: '120k' },
  { name: '陳志強', amount: '98k' },
])
const donationPage = ref(1)

const loadDonations = () => {
  templeStore.fetchDonationProducts(templeId.value, {
    name:    donationFilter.keyword   || undefined,
    startAt: donationFilter.startDate || undefined,
    endAt:   donationFilter.endDate   || undefined,
    page:       donationPage.value,
    pageSize:   10,
  })
}

const onDonationSearch = () => {
  donationPage.value = 1
  loadDonations()
}

const goDonationPage = (page) => {
  if (page >= 1 && page <= templeStore.donationProductsTotalPages) {
    donationPage.value = page
    loadDonations()
  }
}

const goViewDonation = (id) => {
  router.push({ name: 'app.temple.donation-detail', params: { templeId: templeId.value, donationId: id } })
}

let donationSearchTimer = null
watch(() => donationFilter.keyword, () => {
  clearTimeout(donationSearchTimer)
  donationSearchTimer = setTimeout(() => { onDonationSearch() }, 400)
})

// ── 運費管理 ──
const expandedRules = ref(new Set())

const toggleRule = (id) => {
  if (expandedRules.value.has(id)) {
    expandedRules.value.delete(id)
  } else {
    expandedRules.value.add(id)
  }
}

const shippingTypeLabel = (type) => {
  if (type === 'FLAT')   return '固定運費'
  if (type === 'TIERED') return '級距運費'
  if (type === 'FREE')   return '免運費'
  return type
}

const loadShippingRules = () => {
  templeStore.fetchShippingRules(templeId.value)
}

// ── 拖曳排序 ──
const dragFromIndex = ref(null)
const dragOverIndex = ref(null)

const onDragStart = (idx) => { dragFromIndex.value = idx }
const onDragOver  = (idx) => { dragOverIndex.value = idx }
const onDragLeave = ()    => { dragOverIndex.value = null }
const onDragEnd   = ()    => { dragFromIndex.value = null; dragOverIndex.value = null }

const onDrop = async (toIndex) => {
  const fromIndex = dragFromIndex.value
  dragOverIndex.value = null
  dragFromIndex.value = null
  if (fromIndex === null || fromIndex === toIndex) return

  // 本地先重排
  const rules = [...templeStore.shippingRules]
  const [moved] = rules.splice(fromIndex, 1)
  rules.splice(toIndex, 0, moved)
  templeStore.shippingRules.splice(0, templeStore.shippingRules.length, ...rules)

  // 呼叫 API，priority 為 1-based
  try {
    await templeStore.updateShippingRulePriority(templeId.value, moved.id, toIndex + 1)
  } catch (err) {
    console.error('更新排序失敗:', err)
    loadShippingRules() // 失敗時還原
  }
}

// ── 數位光明燈管理 ──
const lampFilter = reactive({ keyword: '', category: '', minPrice: '', maxPrice: '', startDate: '', endDate: '', event: '', status: '' })
const lampPage = ref(1)

const loadLamps = () => {
  templeStore.fetchLampProducts(templeId.value, {
    name:       lampFilter.keyword    || undefined,
    categoryId: lampFilter.category   || undefined,
    status:     lampFilter.status     || undefined,
    eventId:    lampFilter.event      || undefined,
    startAt:    lampFilter.startDate  || undefined,
    endAt:      lampFilter.endDate    || undefined,
    minPrice:   lampFilter.minPrice   || undefined,
    maxPrice:   lampFilter.maxPrice   || undefined,
    page:       lampPage.value,
    pageSize:   10,
  })
}

const onLampSearch = () => {
  lampPage.value = 1
  loadLamps()
}

let lampSearchTimer = null
watch(() => lampFilter.keyword, () => {
  clearTimeout(lampSearchTimer)
  lampSearchTimer = setTimeout(() => { onLampSearch() }, 400)
})

const goLampPage = (page) => {
  if (page >= 1 && page <= templeStore.lampProductsTotalPages) {
    lampPage.value = page
    loadLamps()
  }
}

const lanternStatusLabel = (status) => {
  const map = { OPEN: '上架中', FROZEN: '凍結', SCHEDULED: '排程中', DRAFT: '草稿', CLOSE: '已下架' }
  return map[status] || status
}
const lanternStatusClass = (status) => ({
  'badge-published':  status === 'OPEN',
  'badge-frozen':     status === 'FROZEN',
  'badge-scheduled':  status === 'SCHEDULED',
  'badge-draft':      status === 'DRAFT',
  'badge-closed':     status === 'CLOSE',
})

const goCreateShippingRule = () => {
  router.push({ name: 'app.temple.shipping-create', params: { templeId: templeId.value } })
}

const goCreateLamp = () => {
  router.push({ name: 'app.temple.lamp-create', params: { templeId: templeId.value } })
}

const goViewShippingRule = (id) => {
  router.push({ name: 'app.temple.shipping-detail', params: { templeId: templeId.value, ruleId: id } })
}

const handleDeleteShippingRule = async (id) => {
  if (!confirm('確定要刪除此運費規則嗎？')) return
  try {
    await templeStore.deleteShippingRule(templeId.value, id)
    alert('刪除成功')
    loadShippingRules()
  } catch (err) {
    console.error('刪除運費規則失敗:', err)
    alert(err?.response?.data?.message || '刪除失敗，請稍後再試')
  }
}
</script>

<style scoped>
.activity-mgmt {
  padding: 24px 32px 80px;
  min-height: 100%;
  background: #F3F4F6;
}

/* 麵包屑 */

/* Tab */
.tab-nav {
  display: flex;
  border-bottom: 2px solid #e8e8e8;
  margin-bottom: 24px;
}
.tab-btn {
  padding: 10px 24px;
  background: none;
  border: none;
  font-size: 14px;
  color: #888;
  cursor: pointer;
  position: relative;
  font-weight: 500;
  transition: color 0.2s;
  white-space: nowrap;
}
.tab-btn:hover { color: #E8572A; }
.tab-btn.active { color: #E8572A; font-weight: 600; }
.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 0; right: 0;
  height: 2px;
  background: #E8572A;
  border-radius: 2px 2px 0 0;
}

/* 按鈕 */
.btn-primary {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 20px; background: #E8572A; color: #fff;
  border: none; border-radius: 8px; font-size: 14px; font-weight: 500;
  cursor: pointer; transition: background 0.2s;
}
.btn-primary:hover { background: #d14a1f; }
.btn-secondary {
  display: inline-flex; align-items: center;
  padding: 9px 20px; background: #fff; color: #555;
  border: 1px solid #ddd; border-radius: 8px; font-size: 14px; font-weight: 500;
  cursor: pointer; transition: background 0.2s;
}
.btn-secondary:hover { background: #f5f5f5; }
.btn-settings { background: #E8572A; }
.btn-save { background: #E8572A; }
.btn-save:disabled { background: #f0b09a; cursor: not-allowed; }
.toolbar { margin-bottom: 20px; }

/* 篩選網格 */
.filter-grid { display: grid; gap: 12px 16px; margin-bottom: 16px; }
.filter-grid-4 { grid-template-columns: repeat(4, 1fr); }
.filter-label { font-size: 13px; color: #555; margin-bottom: 6px; font-weight: 500; }
.search-wrap {
  display: flex; align-items: center; gap: 8px;
  background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 8px 12px;
}
.search-icon { font-size: 13px; color: #aaa; flex-shrink: 0; }
.filter-input {
  width: 100%; padding: 9px 12px; border: 1px solid #ddd; border-radius: 8px;
  font-size: 14px; color: #333; background: #fff; box-sizing: border-box; transition: border-color 0.2s;
}
.filter-input:focus { outline: none; border-color: #E8572A; }
.filter-date::placeholder { color: #aaa; }
.search-wrap .filter-input { border: none; padding: 0; outline: none; box-shadow: none; }
.search-wrap .filter-input:focus { box-shadow: none; }
.btn-search {
  display: flex; align-items: center; gap: 5px; flex-shrink: 0;
  padding: 5px 12px; background: #E8572A; color: #fff; border: none;
  border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer;
  transition: background 0.2s;
}
.btn-search:hover { background: #c94a22; }
.btn-search svg { flex-shrink: 0; }
.filter-select {
  width: 100%; padding: 9px 32px 9px 12px; border: 1px solid #ddd; border-radius: 8px;
  font-size: 14px; color: #333; background: #fff; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 10px center;
  cursor: pointer; box-sizing: border-box;
}
.filter-select:focus { outline: none; border-color: #E8572A; }
.checkbox-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; color: #333; cursor: pointer; padding: 9px 0;
}
.checkbox-label input { accent-color: #E8572A; width: 15px; height: 15px; }

/* 匯出列 */
.export-bar { display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 16px; }
.btn-export {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; background: #fff; border: 1px solid #ddd; border-radius: 8px;
  font-size: 13px; color: #555; cursor: pointer; transition: background 0.15s;
}
.btn-export:hover { background: #f5f5f5; }

/* 表格 */
.table-wrap { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 20px; }
.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table thead tr { background: #fafafa; border-bottom: 1px solid #eee; }
.data-table th { padding: 13px 16px; text-align: left; font-weight: 600; color: #555; font-size: 13px; white-space: nowrap; }
.data-table tbody tr { border-bottom: 1px solid #f0f0f0; transition: background 0.15s; }
.data-table tbody tr:last-child { border-bottom: none; }
.data-table tbody tr:hover { background: #fafafa; }
.data-table td { padding: 14px 16px; color: #333; vertical-align: middle; }
.td-bold { font-weight: 600; }
.td-orange { color: #E8572A; font-weight: 600; }
.col-action { text-align: left; white-space: nowrap; }
.icon-btn {
  background: none; border: none; cursor: pointer;
  font-size: 14px; padding: 4px 5px; border-radius: 5px; transition: background 0.15s; opacity: 0.65;
}
.icon-btn:hover { background: #f0f0f0; opacity: 1; }
.icon-btn.del:hover { background: #fff0f0; }

/* badge */
.badge { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.badge-published  { background: #e6f9f0; color: #27a163; }
.badge-draft      { background: #f5f5f5; color: #888; }
.badge-scheduled  { background: #fff8e6; color: #d4860a; }
.badge-frozen     { background: #e0f2fe; color: #0369a1; }
.badge-closed     { background: #f3f4f6; color: #6b7280; }

/* 分頁 */
.pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 4px; }
.page-btn { padding: 8px 16px; background: #fff; border: 1px solid #e0e0e0; border-radius: 20px; font-size: 13px; color: #555; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
.page-btn:hover { border-color: #E8572A; color: #E8572A; }
.page-num { min-width: 36px; text-align: center; padding: 8px 12px; }
.page-num.active { background: #E8572A; border-color: #E8572A; color: #fff; font-weight: 600; }

/* 捐款統計 */
.stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1.4fr; gap: 16px; margin-bottom: 24px; }
.stat-card { background: #fff; border-radius: 14px; padding: 24px 28px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.stat-label { font-size: 13px; color: #888; margin-bottom: 12px; }
.stat-value { font-size: 1.9rem; font-weight: 700; color: #1a1a1a; }
.stat-orange { color: #E8572A; }
.stat-ranking { padding: 20px 24px; }
.stat-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.btn-more { padding: 4px 14px; border: 1px solid #E8572A; border-radius: 20px; color: #E8572A; font-size: 12px; background: none; cursor: pointer; transition: background 0.15s; }
.btn-more:hover { background: #fff3ef; }
.ranking-list { display: flex; flex-direction: column; gap: 10px; }
.ranking-row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; }
.ranking-no { color: #333; font-weight: 500; }
.ranking-amount { color: #E8572A; font-weight: 600; }

/* 運費管理 — folder 樣式 */
.folder-list { display: flex; flex-direction: column; gap: 10px; }
.folder-item { background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden; }
.folder-item[draggable="true"] { cursor: grab; }
.folder-item[draggable="true"]:active { cursor: grabbing; }
.folder-item.drag-over { outline: 2px dashed #E8572A; outline-offset: -2px; background: #fff8f5; border-radius: 12px; }
.drag-handle { font-size: 16px; color: #ccc; cursor: grab; padding: 0 2px; flex-shrink: 0; user-select: none; }
.drag-handle:hover { color: #E8572A; }
.folder-header {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 20px; cursor: pointer; user-select: none;
  transition: background 0.15s;
}
.folder-header:hover { background: #fafafa; }
.folder-item.open .folder-header { background: #fff8f5; }
.folder-arrow { font-size: 13px; color: #E8572A; width: 14px; flex-shrink: 0; }
.folder-name { flex: 1; font-size: 14px; font-weight: 600; color: #1a1a1a; }
.folder-type { font-size: 13px; color: #888; margin-right: 8px; }
.folder-actions { display: flex; gap: 4px; margin-left: 8px; }
.folder-body { border-top: 1px solid #f0f0f0; padding: 20px 24px; }
.tier-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.tier-table th { text-align: left; padding: 8px 12px; font-size: 13px; font-weight: 600; color: #555; background: #fafafa; border-bottom: 1px solid #eee; }
.tier-table td { padding: 10px 12px; color: #333; border-bottom: 1px solid #f5f5f5; }
.tier-table tr:last-child td { border-bottom: none; }
.flat-desc { font-size: 14px; color: #888; }
.loading-state { text-align: center; padding: 60px; color: #aaa; font-size: 14px; }
.empty-state { text-align: center; padding: 60px; color: #aaa; font-size: 14px; }
.shipping-info-box { background: #eef3ff; border: 1px solid #c7d7f9; border-radius: 12px; padding: 20px 24px; margin-top: 24px; }
.shipping-info-title { font-size: 14px; font-weight: 700; color: #3b5bdb; margin-bottom: 12px; }
.shipping-info-box p { margin: 0 0 8px; font-size: 13.5px; color: #374151; line-height: 1.7; }
.shipping-info-box p:last-child { margin-bottom: 0; }

</style>
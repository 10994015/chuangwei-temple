<template>
  <div class="shipping-detail-page">
    <AppBreadcrumb :items="breadcrumbs" />

    <button class="back-btn" @click="goBack">
      <span class="back-arrow">‹</span> 返回上一頁
    </button>

    <div v-if="isLoading" class="loading-state">載入中...</div>

    <template v-else>
      <div class="form-card">
        <div class="card-header">
          <div style="display:flex;align-items:center;gap:12px">
            <h2 class="form-title" style="margin:0">運費規則資訊</h2>
            <span v-if="!isEditing" class="badge" :class="form.status === 'OPEN' ? 'badge-published' : 'badge-draft'">
              {{ form.status === 'OPEN' ? '啟用' : '停用' }}
            </span>
          </div>
          <button v-if="!isEditing" class="btn-edit" @click="isEditing = true">
            <span>✎</span> 編輯資料
          </button>
          <button v-else class="btn-cancel-top" @click="cancelEdit">取消</button>
        </div>

        <!-- 規則名稱 -->
        <div class="form-row">
          <div class="form-group full-width">
            <label class="form-label">規則名稱</label>
            <input v-if="isEditing" v-model="form.name" class="form-input" placeholder="請輸入規則名稱" />
            <div v-else class="field-value">{{ form.name || '-' }}</div>
          </div>
        </div>

        <!-- 類型 & 狀態 -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">運費類型</label>
            <div class="field-value">{{ shippingTypeLabel(form.type) }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">狀態</label>
            <template v-if="isEditing">
              <div class="select-wrap">
                <select v-model="form.status" class="form-select">
                  <option value="OPEN">啟用</option>
                  <option value="INVALID">停用</option>
                </select>
                <span class="select-arrow">▾</span>
              </div>
            </template>
            <div v-else class="field-value">
              <span class="badge" :class="form.status === 'OPEN' ? 'badge-published' : 'badge-draft'">
                {{ form.status === 'OPEN' ? '啟用' : '停用' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Tiers -->
        <template v-if="form.type !== 'FREE'">
          <div class="section-title">運費級距</div>

          <!-- 檢視模式：table -->
          <template v-if="!isEditing">
            <table v-if="form.tiers.length" class="tier-table">
              <thead>
                <tr>
                  <th v-if="form.type === 'TIERED'">最低金額 (元)</th>
                  <th v-if="form.type === 'TIERED'">最高金額 (元)</th>
                  <th>運費 (元)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tier in form.tiers" :key="tier.tierId">
                  <td v-if="form.type === 'TIERED'">{{ tier.minValue }}</td>
                  <td v-if="form.type === 'TIERED'">{{ tier.maxValue === null ? '以上' : tier.maxValue }}</td>
                  <td>{{ tier.fee }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else class="field-value">無級距資料</div>
          </template>

          <!-- 編輯模式：cards -->
          <template v-else>
            <div v-for="(tier, idx) in form.tiers" :key="idx" class="tier-card">
              <div class="tier-header">
                <span class="tier-label-title">級距 {{ idx + 1 }}</span>
                <button class="tier-del" type="button" @click="removeTier(idx)">✕</button>
              </div>
              <div class="tier-fields" :class="{ 'tier-fields-flat': form.type === 'FLAT' }">
                <template v-if="form.type === 'TIERED'">
                  <div class="form-group">
                    <label class="form-label">最低金額 (元)</label>
                    <input v-model.number="tier.minValue" type="number" min="0" class="form-input" placeholder="0" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">最高金額 (元)</label>
                    <div class="max-row">
                      <input
                        v-model.number="tier.maxValue"
                        type="number" min="0"
                        class="form-input"
                        :disabled="tier.noMax"
                        :placeholder="tier.noMax ? '無上限' : ''"
                        style="flex:1"
                      />
                      <label class="above-label">
                        <input type="checkbox" v-model="tier.noMax" class="checkbox-input" @change="tier.noMax && (tier.maxValue = null)" />
                        以上
                      </label>
                    </div>
                  </div>
                </template>
                <div class="form-group">
                  <label class="form-label">運費 (元)</label>
                  <input v-model.number="tier.fee" type="number" min="0" class="form-input" placeholder="0" />
                </div>
              </div>
            </div>

            <button class="btn-add-tier" type="button" @click="addTier">＋ 新增級距</button>
          </template>
        </template>
      </div>

      <div v-if="isEditing" class="form-actions">
        <button class="btn-primary" type="button" @click="handleSubmit" :disabled="isSaving">
          {{ isSaving ? '送出中...' : '確認修改' }}
        </button>
        <button class="btn-cancel" type="button" @click="cancelEdit">取消</button>
      </div>
    </template>
  </div>

  <div class="shipping-info-box">
    <div class="shipping-info-title">💡 運費計算說明</div>
    <p><strong>普通運費：</strong>系統會依據訂單總金額自動套用對應級距的運費。例如訂單金額為 $800，則套用級距 2 的運費 $60。</p>
    <p><strong>特殊運費：</strong>若訂單中包含標註為「特殊運費」的商品，則該商品將使用其獨立設定的運費，不受普通運費級距影響。</p>
    <p><strong>混合運費：</strong>當訂單同時包含普通商品與特殊商品時，系統將分別計算並加總兩種運費。</p>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'
import { useTempleStore } from '@/stores/temple'

const route = useRoute()
const router = useRouter()
const templeStore = useTempleStore()

const templeId = computed(() => route.params.templeId)
const ruleId   = computed(() => route.params.ruleId)

const isLoading = ref(true)
const isEditing = ref(false)
const isSaving  = ref(false)

const breadcrumbs = computed(() => [
  { text: '後台管理' },
  { text: '活動與上架管理', onClick: goBack },
  { text: '運費規則詳情' },
])

const shippingTypeLabel = (type) => {
  if (type === 'FLAT')   return '固定運費'
  if (type === 'TIERED') return '級距運費'
  if (type === 'FREE')   return '免運費'
  return type
}

const form = reactive({
  name:   '',
  type:   'TIERED',
  status: 'OPEN',
  tiers:  [],
})

const fillForm = (data) => {
  console.log('運費規則詳情 data:', data)
  form.name   = data.name   || ''
  form.type   = data.type   || 'TIERED'
  form.status = data.status || 'OPEN'
  form.tiers  = (data.tiers || []).map(t => ({
    tierId:   t.id || null,
    minValue: t.minValue ?? 0,
    maxValue: t.maxValue ?? null,
    fee:      t.fee ?? 0,
    noMax:    t.maxValue === null,
  }))
}

const addTier = () => {
  form.tiers.push({ tierId: null, minValue: 0, maxValue: null, fee: 0, noMax: false })
}

const removeTier = (idx) => { form.tiers.splice(idx, 1) }

const cancelEdit = async () => {
  try {
    const data = await templeStore.fetchShippingRule(templeId.value, ruleId.value)
    if (data) fillForm(data)
  } catch {}
  isEditing.value = false
}

const handleSubmit = async () => {
  isSaving.value = true
  try {
    const tiers = form.type === 'FREE'
      ? []
      : form.tiers.map(t => ({
          ...(t.tierId ? { id: t.tierId } : {}),
          minValue: form.type === 'FLAT' ? null : t.minValue,
          maxValue: form.type === 'FLAT' ? null : (t.noMax ? null : t.maxValue),
          fee:      t.fee,
        }))
    const payload = {
      name:   form.name,
      type:   form.type,
      status: form.status,
      tiers,
    }
    console.log('PATCH 運費規則 payload:', JSON.stringify(payload, null, 2))
    await templeStore.updateShippingRule(templeId.value, ruleId.value, payload)
    alert('運費規則更新成功')
    isEditing.value = false
  } catch (err) {
    console.error('運費規則更新失敗:', err)
    alert(err?.response?.data?.message || '操作失敗，請稍後再試')
  } finally {
    isSaving.value = false
  }
}

const goBack = () => {
  router.push({ name: 'app.temple.activity-management', params: { templeId: templeId.value }, query: { tab: 'shipping' } })
}

onMounted(async () => {
  try {
    const data = await templeStore.fetchShippingRule(templeId.value, ruleId.value)
    if (data) fillForm(data)
  } catch (err) {
    console.error('載入運費規則失敗:', err)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.shipping-detail-page { padding: 24px 32px 60px; min-height: 100%; background: #F3F4F6; }
.back-btn { display: inline-flex; align-items: center; gap: 4px; background: none; border: none; color: #E8572A; font-size: 14px; cursor: pointer; margin-bottom: 16px; padding: 0; font-weight: 500; }
.back-btn:hover { opacity: 0.75; }
.back-arrow { font-size: 16px; }
.loading-state { text-align: center; padding: 60px; color: #aaa; font-size: 15px; }
.form-card { background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 24px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 1px solid #f0f0f0; }
.form-title { font-size: 1.2rem; font-weight: 700; color: #1a1a1a; }
.btn-edit { display: flex; align-items: center; gap: 6px; padding: 8px 18px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; color: #555; cursor: pointer; font-weight: 500; transition: background 0.2s; }
.btn-edit:hover { background: #eee; }
.btn-cancel-top { padding: 8px 18px; background: #fff; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; color: #888; cursor: pointer; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 20px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full-width { grid-column: 1 / -1; }
.form-label { font-size: 13px; font-weight: 500; color: #555; }
.form-input { padding: 11px 16px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 14px; color: #333; background: #fff; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
.form-input:focus { border-color: #E8572A; box-shadow: 0 0 0 3px rgba(232,87,42,0.08); }
.form-input:disabled { background: #f5f5f5; color: #aaa; }
.field-value { font-size: 14px; color: #333; padding: 4px 0; min-height: 24px; }
.select-wrap { position: relative; }
.form-select { width: 100%; padding: 11px 36px 11px 16px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 14px; color: #333; background: #fff; appearance: none; outline: none; cursor: pointer; }
.form-select:focus { border-color: #E8572A; }
.select-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #888; font-size: 12px; }
.badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.badge-published { background: #d1fae5; color: #065f46; }
.badge-draft { background: #f3f4f6; color: #6b7280; }
.section-title { font-size: 15px; font-weight: 600; color: #1a1a1a; margin: 28px 0 16px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0; }
.tier-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.tier-table th { text-align: left; padding: 8px 12px; font-size: 13px; font-weight: 600; color: #555; background: #fafafa; border-bottom: 1px solid #eee; }
.tier-table td { padding: 10px 12px; color: #333; border-bottom: 1px solid #f5f5f5; }
.tier-table tr:last-child td { border-bottom: none; }
.tier-card { background: #fafafa; border: 1px solid #eee; border-radius: 12px; padding: 20px; margin-bottom: 12px; }
.tier-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.tier-label-title { font-size: 14px; font-weight: 600; color: #333; }
.tier-del { background: none; border: none; color: #e53e3e; cursor: pointer; font-size: 14px; padding: 3px 7px; border-radius: 4px; transition: background 0.15s; }
.tier-del:hover { background: #fff0f0; }
.tier-fields { display: grid; grid-template-columns: 1fr 1.4fr 1fr; gap: 16px; }
.tier-fields-flat { grid-template-columns: 200px; }
.max-row { display: flex; align-items: center; gap: 10px; }
.above-label { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #555; cursor: pointer; white-space: nowrap; flex-shrink: 0; }
.checkbox-input { width: 15px; height: 15px; accent-color: #E8572A; cursor: pointer; }
.btn-add-tier { display: block; padding: 10px 20px; background: none; border: 1px dashed #ccc; border-radius: 8px; font-size: 13px; color: #888; cursor: pointer; transition: border-color 0.2s, color 0.2s; margin-top: 4px; }
.btn-add-tier:hover { border-color: #E8572A; color: #E8572A; }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-bottom: 20px; }
.shipping-info-box { background: #eef3ff; border: 1px solid #c7d7f9; border-radius: 12px; padding: 20px 24px; margin-top: 24px; }
.shipping-info-title { font-size: 14px; font-weight: 700; color: #3b5bdb; margin-bottom: 12px; }
.shipping-info-box p { margin: 0 0 8px; font-size: 13.5px; color: #374151; line-height: 1.7; }
.shipping-info-box p:last-child { margin-bottom: 0; }
.btn-primary { padding: 10px 28px; background: #E8572A; color: #fff; border: none; border-radius: 50px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover:not(:disabled) { background: #d14a1f; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-cancel { padding: 10px 24px; background: #fff; color: #555; border: 1px solid #ddd; border-radius: 50px; font-size: 14px; font-weight: 500; cursor: pointer; }
.btn-cancel:hover { background: #f5f5f5; }
</style>

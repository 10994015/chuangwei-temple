<template>
  <div class="shipping-form-page">
    <AppBreadcrumb :items="breadcrumbs" />

    <button class="back-btn" @click="goBack">
      <span class="back-arrow">‹</span> 返回上一頁
    </button>

    <div class="form-card">
      <h2 class="form-title">新增運費規則</h2>

      <!-- 規則名稱 -->
      <div class="form-row">
        <div class="form-group full-width">
          <label class="form-label">規則名稱 <span class="required">*</span></label>
          <input v-model="form.name" class="form-input" :class="{ error: errors.name }" placeholder="請輸入運費規則名稱" />
          <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
        </div>
      </div>

      <!-- 類型 & 狀態 -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">運費類型 <span class="required">*</span></label>
          <div class="select-wrap">
            <select v-model="form.type" class="form-select">
              <option value="TIERED">級距運費</option>
              <option value="FLAT">固定運費</option>
              <option value="FREE">免運費</option>
            </select>
            <span class="select-arrow">▾</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">狀態</label>
          <div class="select-wrap">
            <select v-model="form.status" class="form-select">
              <option value="OPEN">啟用</option>
              <option value="INVALID">停用</option>
            </select>
            <span class="select-arrow">▾</span>
          </div>
        </div>
      </div>

      <!-- Tiers -->
      <template v-if="form.type !== 'FREE'">
        <div class="section-title">
          運費級距
          <span v-if="errors.tiers" class="error-msg" style="margin-left:8px;font-size:12px;font-weight:400">{{ errors.tiers }}</span>
        </div>

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
    </div>

    <div class="form-actions">
      <button class="btn-primary" type="button" @click="handleSubmit" :disabled="isSaving">
        {{ isSaving ? '送出中...' : '確認新增' }}
      </button>
      <button class="btn-cancel" type="button" @click="goBack">取消</button>
    </div>

  <div class="shipping-info-box">
    <div class="shipping-info-title">💡 運費計算說明</div>
    <p><strong>普通運費：</strong>系統會依據訂單總金額自動套用對應級距的運費。例如訂單金額為 $800，則套用級距 2 的運費 $60。</p>
    <p><strong>特殊運費：</strong>若訂單中包含標註為「特殊運費」的商品，則該商品將使用其獨立設定的運費，不受普通運費級距影響。</p>
    <p><strong>混合運費：</strong>當訂單同時包含普通商品與特殊商品時，系統將分別計算並加總兩種運費。</p>
  </div>
</div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'
import { useTempleStore } from '@/stores/temple'

const route = useRoute()
const router = useRouter()
const templeStore = useTempleStore()

const templeId = computed(() => route.params.templeId)
const isSaving = ref(false)

const breadcrumbs = computed(() => [
  { text: '後台管理' },
  { text: '活動與上架管理', onClick: goBack },
  { text: '新增運費規則' },
])

const form = reactive({
  name:   '',
  type:   'TIERED',
  status: 'OPEN',
  tiers:  [{ minValue: 0, maxValue: null, fee: 0, noMax: false }],
})

const errors = reactive({ name: '', tiers: '' })

const addTier = () => {
  form.tiers.push({ minValue: 0, maxValue: null, fee: 0, noMax: false })
}

const removeTier = (idx) => { form.tiers.splice(idx, 1) }

const validate = () => {
  errors.name  = form.name.trim() ? '' : '請填寫規則名稱'
  errors.tiers = (form.type !== 'FREE' && form.tiers.length === 0) ? '請至少新增一個級距' : ''
  return !errors.name && !errors.tiers
}

const handleSubmit = async () => {
  if (!validate()) return
  isSaving.value = true
  try {
    const tiers = form.type === 'FREE'
      ? []
      : form.tiers.map(t => ({
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
    console.log('新增運費規則 payload:', JSON.stringify(payload, null, 2))
    await templeStore.createShippingRule(templeId.value, payload)
    alert('運費規則新增成功')
    goBack()
  } catch (err) {
    console.error('新增運費規則失敗:', err)
    alert(err?.response?.data?.message || '操作失敗，請稍後再試')
  } finally {
    isSaving.value = false
  }
}

const goBack = () => {
  router.push({ name: 'app.temple.activity-management', params: { templeId: templeId.value }, query: { tab: 'shipping' } })
}
</script>

<style scoped>
.shipping-form-page { padding: 24px 32px 60px; min-height: 100%; background: #F3F4F6; }
.back-btn { display: inline-flex; align-items: center; gap: 4px; background: none; border: none; color: #E8572A; font-size: 14px; cursor: pointer; margin-bottom: 16px; padding: 0; font-weight: 500; }
.back-btn:hover { opacity: 0.75; }
.back-arrow { font-size: 16px; }
.form-card { background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 24px; }
.form-title { font-size: 1.2rem; font-weight: 700; color: #1a1a1a; margin: 0 0 28px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 20px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full-width { grid-column: 1 / -1; }
.form-label { font-size: 13px; font-weight: 500; color: #555; }
.required { color: #E8572A; }
.form-input { padding: 11px 16px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 14px; color: #333; background: #fff; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
.form-input:focus { border-color: #E8572A; box-shadow: 0 0 0 3px rgba(232,87,42,0.08); }
.form-input.error { border-color: #e53e3e; }
.form-input:disabled { background: #f5f5f5; color: #aaa; }
.error-msg { font-size: 12px; color: #e53e3e; }
.select-wrap { position: relative; }
.form-select { width: 100%; padding: 11px 36px 11px 16px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 14px; color: #333; background: #fff; appearance: none; outline: none; cursor: pointer; }
.form-select:focus { border-color: #E8572A; }
.select-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #888; font-size: 12px; }
.section-title { font-size: 15px; font-weight: 600; color: #1a1a1a; margin: 28px 0 16px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; }
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

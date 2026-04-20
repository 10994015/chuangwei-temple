<template>
  <div class="ms-wrapper" ref="wrapperRef">
    <!-- 輸入框 -->
    <div class="ms-input" :class="{ open: isOpen, error: error }" @click="toggleDropdown">
      <span class="ms-placeholder">{{ placeholder }}</span>
      <svg class="ms-arrow" :class="{ rotated: isOpen }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
    </div>

    <!-- 已選 chips -->
    <div v-if="modelValue.length" class="ms-chips">
      <span v-for="val in modelValue" :key="val" class="ms-chip">
        {{ getLabelByValue(val) }}
        <button class="ms-chip-remove" type="button" @click.stop="remove(val)">✕</button>
      </span>
    </div>

    <!-- 下拉選單 -->
    <div v-if="isOpen" class="ms-dropdown">
      <div
        v-for="opt in options"
        :key="opt.value"
        class="ms-option"
        :class="{ selected: modelValue.includes(opt.value) }"
        @click.stop="toggle(opt.value)"
      >
        <span>{{ opt.label }}</span>
        <svg v-if="modelValue.includes(opt.value)" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div v-if="options.length === 0" class="ms-empty">無選項</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  options:    { type: Array, default: () => [] },  // [{ value, label }]
  placeholder:{ type: String, default: '點擊選擇...' },
  error:      { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const isOpen    = ref(false)
const wrapperRef = ref(null)

const getLabelByValue = (val) => {
  const found = props.options.find(o => o.value === val)
  return found ? found.label : val
}

const toggleDropdown = () => { isOpen.value = !isOpen.value }

const toggle = (val) => {
  const current = [...props.modelValue]
  const idx = current.indexOf(val)
  if (idx === -1) current.push(val)
  else current.splice(idx, 1)
  emit('update:modelValue', current)
}

const remove = (val) => {
  emit('update:modelValue', props.modelValue.filter(v => v !== val))
}

const onClickOutside = (e) => {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<style scoped>
.ms-wrapper { position: relative; width: 100%; }

.ms-input {
  display: flex; align-items: center; justify-content: space-between;
  padding: 11px 16px; border: 1px solid #e0e0e0; border-radius: 10px;
  background: #fff; cursor: pointer; user-select: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.ms-input:hover { border-color: #ccc; }
.ms-input.open { border-color: #E8572A; box-shadow: 0 0 0 3px rgba(232,87,42,0.08); border-radius: 10px 10px 0 0; }
.ms-input.error { border-color: #e53e3e; }

.ms-placeholder { font-size: 14px; color: #aaa; }

.ms-arrow { color: #888; transition: transform 0.2s; flex-shrink: 0; }
.ms-arrow.rotated { transform: rotate(180deg); }

.ms-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }

.ms-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; background: #E8572A; color: #fff;
  border-radius: 20px; font-size: 13px; font-weight: 500;
}
.ms-chip-remove {
  background: none; border: none; color: #fff; cursor: pointer;
  font-size: 10px; padding: 0; line-height: 1; opacity: 0.8;
  display: flex; align-items: center;
}
.ms-chip-remove:hover { opacity: 1; }

.ms-dropdown {
  position: absolute; top: 100%; left: 0; right: 0; z-index: 200;
  background: #fff; border: 1px solid #E8572A; border-top: none;
  border-radius: 0 0 10px 10px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  max-height: 220px; overflow-y: auto;
}

.ms-option {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; font-size: 14px; color: #333; cursor: pointer;
  transition: background 0.15s;
}
.ms-option:hover { background: #fff5f2; }
.ms-option.selected { color: #E8572A; font-weight: 500; }
.ms-option.selected svg { color: #E8572A; }

.ms-empty { padding: 12px 16px; font-size: 14px; color: #aaa; text-align: center; }
</style>

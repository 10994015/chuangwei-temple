<template>
  <div class="breadcrumb">
    <template v-for="(item, i) in items" :key="i">
      <span v-if="i > 0" class="bc-sep">›</span>
      <span v-if="i === items.length - 1" class="bc-current">{{ item.text }}</span>
      <router-link v-else-if="item.to" class="bc-link" :to="item.to">{{ item.text }}</router-link>
      <span v-else-if="item.onClick" class="bc-link" @click="item.onClick">{{ item.text }}</span>
      <span v-else class="bc-root">{{ item.text }}</span>
    </template>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
    // Each item: { text: string, to?: RouteLocation, onClick?: Function }
    // Last item is always rendered as current (no link)
  }
})
</script>

<style scoped>
.breadcrumb {
  font-size: 13px;
  color: #999;
  margin-bottom: 16px;
}
.bc-sep    { margin: 0 6px; }
.bc-root   { color: #999; }
.bc-link   { color: #999; cursor: pointer; transition: color 0.15s; text-decoration: none; }
.bc-link:hover { color: #E8572A; text-decoration: underline; }
.bc-current { color: #E8572A; font-weight: 500; }
</style>

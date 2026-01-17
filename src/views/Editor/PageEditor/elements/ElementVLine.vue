<template><div class="element-vline"><div :style="{ backgroundColor: data.color, width: data.thickness }"></div></div></template>
<script setup>defineProps({ data: { type: Object, required: true }})</script>
<style scoped>.element-vline { height: 100%; min-height: 150px; display: flex; justify-content: center; padding: 20px; } .element-vline > div { height: 100%; }</style>
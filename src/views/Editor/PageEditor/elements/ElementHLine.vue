<template><div class="element-hline"><hr :style="{ borderColor: data.color, borderWidth: data.thickness }" /></div></template>
<script setup>defineProps({ data: { type: Object, required: true }})</script>
<style scoped>.element-hline { padding: 20px; } .element-hline hr { width: 100%; margin: 0; border-style: solid; }</style>
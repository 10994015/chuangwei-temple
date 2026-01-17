<template><div class="elem-album"><p>📷 {{ data.title }}</p></div></template>
<script setup>defineProps({ data: { type: Object, required: true }})</script>
<style scoped>.elem-album { min-height: 200px; display: flex; align-items: center; justify-content: center; background: #f8f8f8; border-radius: 8px; } .elem-album p { margin: 0; font-size: 18px; color: #666; }</style>
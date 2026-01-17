<template>
  <div class="element-text" :style="getTextStyle()">
    {{ data.text }}
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const getTextStyle = () => {
  const alignMap = {
    'top-left': { alignItems: 'flex-start', justifyContent: 'flex-start' },
    'top-center': { alignItems: 'flex-start', justifyContent: 'center' },
    'top-right': { alignItems: 'flex-start', justifyContent: 'flex-end' },
    'center-left': { alignItems: 'center', justifyContent: 'flex-start' },
    'center': { alignItems: 'center', justifyContent: 'center' },
    'center-right': { alignItems: 'center', justifyContent: 'flex-end' },
    'bottom-left': { alignItems: 'flex-end', justifyContent: 'flex-start' },
    'bottom-center': { alignItems: 'flex-end', justifyContent: 'center' },
    'bottom-right': { alignItems: 'flex-end', justifyContent: 'flex-end' }
  }
  
  const align = alignMap[props.data.align] || alignMap['center']
  
  return {
    fontSize: props.data.fontSize,
    color: props.data.color,
    display: 'flex',
    ...align,
    minHeight: '100px',
    padding: '20px',
    wordBreak: 'break-word',
    lineHeight: '1.6'
  }
}
</script>

<style scoped>
.element-text {
  width: 100%;
}
</style>
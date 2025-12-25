<script setup>
import AppHeader from '@/components/Editor/AppHeader.vue'
</script>

<template>
    <div class="app">
        <AppHeader />
        <main class="main-content">
            <router-view></router-view>
        </main>
    </div>
</template>

<style scoped lang="scss">
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
}

.main-content {
  flex: 1;
  width: 100%;
}
</style>
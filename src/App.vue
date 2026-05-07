<template>
  <FactoryVisualization />
</template>

<script setup lang="ts">
import FactoryVisualization from './components/FactoryVisualization.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #1a1a2e;
}

:root {
  --color-primary: #00ff88;
  --color-warning: #ffa500;
  --color-danger: #ff4444;
  --color-text: #ffffff;
  --color-text-secondary: #888888;
  --color-bg: #1a1a2e;
  --color-bg-secondary: #16213e;
  --color-border: rgba(255, 255, 255, 0.1);
}
</style>

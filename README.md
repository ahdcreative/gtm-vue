# AHDCreative GMTVue

Vue 3 plugin for Google Tag Manager integration, powered by `@ahdcreative/gtm-core`.

## Features

*   🚀 **Easy Integration**: Simple `app.use()` installation.
*   🚦 **Router Support**: Automatic page view tracking.
*   📦 **Type-Safe**: Full TypeScript support.
*   🪝 **Composition API**: `useGtm()` hook for easy access.

## Installation

```bash
npm install @ahdcreative/gtm-vue
```

## Usage

### Setup (main.ts)

```typescript
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createGtm } from '@ahdcreative/gtm-vue'
import App from './App.vue'

const router = createRouter({ /* ... */ })
const app = createApp(App)

app.use(router)

app.use(createGtm({
  id: 'GTM-XXXXXX',
  vueRouter: router, // Optional: for auto-tracking
  enabled: true,
  debug: false
}))

app.mount('#app')
```

### Composition API

```typescript
<script setup lang="ts">
import { useGtm } from '@ahdcreative/gtm-vue'

const gtm = useGtm()

function trackEvent() {
  gtm.push({
    event: 'button_click',
    category: 'interaction',
    label: 'signup'
  })
}
</script>
```

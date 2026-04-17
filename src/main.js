import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initFBInstant } from './services/fbInstant'

async function boot() {
  const app = createApp(App)
  app.provide('fbInstant', { enabled: false })
  app.use(router).mount('#app')

  await initFBInstant()
}

boot()

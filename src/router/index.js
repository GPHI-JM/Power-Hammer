import { createRouter, createWebHashHistory } from 'vue-router'
import GameView from '../views/GameView.vue'

const router = createRouter({
  // Hash history keeps the single-page route stable inside Facebook's embedded
  // webview, where the full URL path can differ from local dev server URLs.
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'game', component: GameView },
  ],
})

export default router

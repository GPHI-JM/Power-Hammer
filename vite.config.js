import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * Ensures the Instant Games SDK is present in the built `index.html`.
 * Vite should preserve tags from the source `index.html`; this hook
 * re-injects the script if a future toolchain change ever drops it.
 */
function ensureFbInstantSdkPlugin() {
  const sdkTag =
    '<script src="https://connect.facebook.net/en_US/fbinstant.6.3.js"></script>'

  return {
    name: 'ensure-fb-instant-sdk',
    transformIndexHtml(html) {
      if (html.includes('fbinstant.6.3.js')) {
        return html
      }
      return html.replace('</head>', `    ${sdkTag}\n  </head>`)
    },
  }
}

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  plugins: [vue(), ensureFbInstantSdkPlugin()],
})

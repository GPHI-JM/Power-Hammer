// src/services/fbInstant.js
const FB_INIT_TIMEOUT_MS = 12000

async function runFacebookSdkStartupSequence() {
  await window.FBInstant.initializeAsync()
  if (window.FBInstant.setLoadingProgress) {
    window.FBInstant.setLoadingProgress(100)
  }
  await window.FBInstant.startGameAsync()
}

export async function initFBInstant() {
  if (!window.FBInstant) {
    console.warn('FBInstant not available — running in browser mode')
    return { enabled: false }
  }

  try {
    await Promise.race([
      runFacebookSdkStartupSequence(),
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('FBInstant init timeout (outside Instant Games or stalled SDK)'))
        }, FB_INIT_TIMEOUT_MS)
      }),
    ])
    return { enabled: true }
  } catch (error) {
    console.error('FBInstant init failed:', error)
    return { enabled: false }
  }
}
// src/services/fbInstant.js
const FB_INIT_TIMEOUT_MS = 12000

let fbInstantReady = false
let fbInstantEnabled = false
let fbInstantInitPromise = Promise.resolve(false)

async function runFacebookSdkStartupSequence() {
  await window.FBInstant.initializeAsync()
  if (window.FBInstant.setLoadingProgress) {
    window.FBInstant.setLoadingProgress(100)
  }
  await window.FBInstant.startGameAsync()
}

export function isFBInstantReady() {
  return fbInstantReady
}

export function isFBInstantEnabled() {
  return fbInstantEnabled
}

export function whenFBInstantReady() {
  return fbInstantInitPromise
}

export async function initFBInstant() {
  if (!window.FBInstant) {
    console.warn('FBInstant not available - running in browser mode')
    fbInstantReady = false
    fbInstantEnabled = false
    fbInstantInitPromise = Promise.resolve(false)
    return { enabled: false }
  }

  if (fbInstantReady) {
    fbInstantEnabled = true
    return { enabled: true }
  }

  fbInstantInitPromise = Promise.race([
    runFacebookSdkStartupSequence(),
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('FBInstant init timeout (outside Instant Games or stalled SDK)'))
      }, FB_INIT_TIMEOUT_MS)
    }),
  ])
    .then(() => {
      fbInstantReady = true
      fbInstantEnabled = true
      return true
    })
    .catch((error) => {
      fbInstantReady = false
      fbInstantEnabled = false
      const message = String(error?.message || '')
      if (!message.includes('FBInstant init timeout')) {
        console.warn('FBInstant init unavailable:', error)
      }
      return false
    })

  const enabled = await fbInstantInitPromise
  return { enabled }
}

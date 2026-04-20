<template>
  <div
    class="game-view"
    @pointerup="onGlobalPointerUp"
    @pointerleave="onGlobalPointerUp"
    @click="onGlobalScreenTap"
  >
    <div
      class="game-view__hammer-cursor"
      :class="{ 'game-view__hammer-cursor--swing': isSwinging }"
      :style="hammerCursorStyle"
      aria-hidden="true"
    />

    <header class="game-view__header">
      <h1 class="game-view__title">Hammer Challenge</h1>
      <div class="game-view__score">
        <span>Level {{ level }}</span>
        <span v-if="formattedLastStrike !== null">Last strike: {{ formattedLastStrike }}</span>
        <span
          class="game-view__total-score game-view__total-score--header-mobile"
          :class="{ 'game-view__score-pop': scorePopActive }"
        >Total {{ formattedDisplayTotal }}</span>
      </div>
    </header>

    <div class="game-view__machine">
      <div ref="phaserContainerRef" class="game-view__phaser" />
    </div>

    <div class="game-view__bottom-bar">
      <div class="game-view__smash-limit">
        <p class="smash-limit__label">Smash<br>Limit</p>
        <div class="smash-limit__pips">
          <span
            v-for="pipIndex in MAX_SMASHES"
            :key="pipIndex"
            class="smash-limit__pip"
            :class="{ 'smash-limit__pip--used': pipIndex > smashesLeft }"
          />
        </div>
        <p class="smash-limit__count" :class="{ 'smash-limit__count--empty': smashesLeft === 0 }">
          {{ smashesLeft }} left
        </p>
      </div>

      <PowerMeter
        ref="powerMeterRef"
        class="game-view__power-meter"
        :level="level"
        :speed="meterSpeed"
        :disabled="smashesLeft <= 0"
        :vertical="powerMeterVertical"
      />
    </div>

    <aside class="game-view__leaderboard">
      <div class="game-view__leaderboard-score" aria-label="Total score">
        <span class="game-view__leaderboard-score-label">Score</span>
        <span
          class="game-view__leaderboard-score-value"
          :class="{ 'game-view__score-pop': scorePopActive }"
        >{{ formattedDisplayTotal }}</span>
      </div>
      <Leaderboard :entries="leaderboardEntries" />
    </aside>

    <aside class="game-view__promo-rail" aria-label="Other games">
      <button
        v-for="game in promoGames"
        :key="game.id"
        type="button"
        :class="['promo-card', { 'promo-card--tekhen': game.id === 'tekhen' }]"
        :style="{ '--promo-accent': game.accent, '--promo-glow': game.glow }"
        @click="onPromoGameClick($event, game)"
      >
        <span
          v-if="game.id !== 'tekhen'"
          class="promo-card__shine"
          aria-hidden="true"
        />
        <span class="promo-card__badge">Hot</span>
        <template v-if="game.id === 'tekhen' && game.iconSrc">
          <div class="promo-card__tekhen-stack">
            <img
              class="promo-card__image promo-card__image--tekhen-left"
              :src="game.iconSrc"
              :alt="game.name"
            >
            <img
              class="promo-card__image promo-card__image--tekhen-right"
              :src="game.iconSrc"
              alt=""
              aria-hidden="true"
            >
          </div>
          <span class="promo-card__slice-trail" aria-hidden="true" />
          <span class="promo-card__slice-blade" aria-hidden="true" />
          <span class="promo-card__slice-flash" aria-hidden="true" />
          <span class="promo-card__slice-scar" aria-hidden="true" />
          <span class="promo-card__slice-crack" aria-hidden="true" />
          <span class="promo-card__slice-sparks" aria-hidden="true" />
          <span class="promo-card__slice-shard promo-card__slice-shard--a" aria-hidden="true" />
          <span class="promo-card__slice-shard promo-card__slice-shard--b" aria-hidden="true" />
          <span class="promo-card__slice-shard promo-card__slice-shard--c" aria-hidden="true" />
        </template>
        <img
          v-else-if="game.iconSrc"
          :src="game.iconSrc"
          :alt="game.name"
          class="promo-card__image"
        >
        <span v-else class="promo-card__icon" aria-hidden="true">{{ game.icon }}</span>
        <span v-if="!game.iconSrc" class="promo-card__title">{{ game.name }}</span>
      </button>
    </aside>



    <CongratulationsModal
      :show="showCongratulations || showExitPhoneModal"
      :variant="showExitPhoneModal ? 'exit' : 'congratulations'"
      :error-message="phoneVerificationError"
      @close="onClosePhoneModal"
      @clear-error="phoneVerificationError = ''"
      @verify="onVerifyPhone"
    />

    <ContinuePlayModal
      :show="showContinuePlay"
      @continue="onContinuePlay"
    />

    <Teleport to="body">
      <Transition name="perfect-hit">
        <div
          v-if="showPerfectHitCelebration"
          class="perfect-hit-overlay"
          aria-live="polite"
        >
          <div class="perfect-hit-overlay__panel">
            <p class="perfect-hit-overlay__kicker">100% Peak</p>
            <p class="perfect-hit-overlay__title">Max power</p>
            <p v-if="smashesLeft > 0" class="perfect-hit-overlay__hint">
              {{ smashesLeft }} smash{{ smashesLeft === 1 ? '' : 'es' }} left
            </p>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <div
        v-show="showPageNinetyFx"
        class="page-ninety-fx"
        aria-hidden="true"
      >
        <div class="page-ninety-fx__flash" />
        <div class="page-ninety-fx__ray-wrap page-ninety-fx__ray-wrap--1">
          <div class="page-ninety-fx__ray" />
        </div>
        <div class="page-ninety-fx__ray-wrap page-ninety-fx__ray-wrap--2">
          <div class="page-ninety-fx__ray" />
        </div>
        <div class="page-ninety-fx__ray-wrap page-ninety-fx__ray-wrap--3">
          <div class="page-ninety-fx__ray" />
        </div>
        <div class="page-ninety-fx__ray-wrap page-ninety-fx__ray-wrap--4">
          <div class="page-ninety-fx__ray" />
        </div>
        <div class="page-ninety-fx__ray-wrap page-ninety-fx__ray-wrap--5">
          <div class="page-ninety-fx__ray" />
        </div>
        <div class="page-ninety-fx__ray-wrap page-ninety-fx__ray-wrap--6">
          <div class="page-ninety-fx__ray page-ninety-fx__ray--short" />
        </div>
        <div class="page-ninety-fx__ray-wrap page-ninety-fx__ray-wrap--7">
          <div class="page-ninety-fx__ray page-ninety-fx__ray--short" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { createGame } from '../game/bootstrap'
import { emit, on, off } from '../game/EventBus'
import PowerMeter from '../components/PowerMeter.vue'
import Leaderboard from '../components/Leaderboard.vue'
import CongratulationsModal from '../components/CongratulationsModal.vue'
import ContinuePlayModal from '../components/ContinuePlayModal.vue'
import {
  playSmashSound,
  playTekhenSlashSound,
  resumeAllGameAudio,
  startBackgroundAmbience,
} from '../game/AudioSynthesizer'
import { formatScoreCompact, impactStrengthToPowerPoints } from '../utils/scorePower'
import {
  createPlaceholderLeaderboardEntries,
  fetchGameLeaderboardScores,
} from '../services/gameScores'
import {
  isValidPhilippineMobileNumber,
  sanitizePhilippineMobileNumber,
  verifyPhoneWithAxios,
} from '../services/phoneVerification'
import {
  isFBInstantEnabled,
  isFBInstantReady,
  whenFBInstantReady,
} from '../services/fbInstant'
import nfIcon from '../assets/icons/nf_icon.png'
import bfIcon from '../assets/icons/bf_icon.png'
import tekhenIcon from '../assets/icons/tekhen_icon.png'

const TEKHEN_SLASH_CYCLE_MS = 3000
const TEKHEN_FIRST_SLASH_DELAY_MS = TEKHEN_SLASH_CYCLE_MS * 0.7

const phaserContainerRef = ref(null)
let gameInstance = null
let phaserResizeObserver = null
let tekhenSlashTimeoutId = null
let tekhenSlashIntervalId = null
let playedSlashAfterFirstAudioGesture = false
let audioUnlocked = false

function unlockGameAudioFromUserGesture() {
  let shouldPlayImmediateSlash = false
  if (!playedSlashAfterFirstAudioGesture) {
    playedSlashAfterFirstAudioGesture = true
    shouldPlayImmediateSlash = true
  }
  if (!audioUnlocked) {
    audioUnlocked = true
    stopBackgroundAmbience = startBackgroundAmbience()
    startTekhenSlashSoundLoop()
  }
  void resumeAllGameAudio().then(() => {
    if (shouldPlayImmediateSlash) {
      playTekhenSlashSound()
    }
  })
}

function startTekhenSlashSoundLoop() {
  window.clearTimeout(tekhenSlashTimeoutId)
  window.clearInterval(tekhenSlashIntervalId)
  tekhenSlashTimeoutId = window.setTimeout(() => {
    void playTekhenSlashSound()
    tekhenSlashIntervalId = window.setInterval(() => {
      void playTekhenSlashSound()
    }, TEKHEN_SLASH_CYCLE_MS)
    tekhenSlashTimeoutId = null
  }, TEKHEN_FIRST_SLASH_DELAY_MS)
}

function stopTekhenSlashSoundLoop() {
  window.clearTimeout(tekhenSlashTimeoutId)
  window.clearInterval(tekhenSlashIntervalId)
  tekhenSlashTimeoutId = null
  tekhenSlashIntervalId = null
}

const powerMeterVertical = ref(false)
const isSwinging = ref(false)
let swingTimeoutId = null
const mouseX = ref(-500)
const mouseY = ref(-500)
const showCongratulations = ref(false)
const showExitPhoneModal = ref(false)
const showContinuePlay = ref(false)
const powerMeterRef = ref(null)
const showPageNinetyFx = ref(false)
let pageNinetyFxTimerId = null

function onPageNinetyEffects() {
  document.body.classList.add('page-ninety-shake')
  showPageNinetyFx.value = true
  window.clearTimeout(pageNinetyFxTimerId)
  pageNinetyFxTimerId = window.setTimeout(() => {
    document.body.classList.remove('page-ninety-shake')
    showPageNinetyFx.value = false
    pageNinetyFxTimerId = null
  }, 2400)
}

function onCongratulationsEvent() {
  if (smashesLeft.value > 0) {
    return
  }
  showContinuePlay.value = false
  phoneVerificationError.value = ''
  showCongratulations.value = true
}
const isVerifyingPhone = ref(false)
const phoneVerificationError = ref('')

const hammerCursorStyle = computed(() => ({
  left: `${mouseX.value}px`,
  top: `${mouseY.value}px`,
}))

const MAX_SMASHES = 3
const level = ref(1)
const meterSpeed = ref(2)
const lastStrikePower = ref(null)
const totalScore = ref(0)
const displayedScore = ref(0)
const scorePopActive = ref(false)
const showPerfectHitCelebration = ref(false)
const hasPerfectStrikeThisRound = ref(false)
const smashesLeft = ref(MAX_SMASHES)
let stopBackgroundAmbience = null
let scoreAnimationFrameId = null
const externalLeaderboardPlayers = ref([])
const formattedDisplayTotal = computed(() => formatScoreCompact(displayedScore.value))

const formattedLastStrike = computed(() =>
  lastStrikePower.value === null ? null : formatScoreCompact(lastStrikePower.value)
)

const leaderboardEntries = computed(() => {
  const others = externalLeaderboardPlayers.value.filter(
    (entry) => entry.name !== 'You'
  )
  const rows = [
    ...others.map((entry) => ({
      name: entry.name,
      numericScore: entry.score,
      displayScore: formatScoreCompact(entry.score),
    })),
    {
      name: 'You',
      numericScore: totalScore.value,
      displayScore: formattedDisplayTotal.value,
    },
  ]
  rows.sort((rowA, rowB) => {
    if (rowB.numericScore !== rowA.numericScore) {
      return rowB.numericScore - rowA.numericScore
    }
    return rowA.name.localeCompare(rowB.name)
  })
  return rows.map((row, index) => ({
    rank: index + 1,
    name: row.name,
    score: row.displayScore,
  }))
})

function stopScoreAnimation() {
  if (scoreAnimationFrameId !== null) {
    cancelAnimationFrame(scoreAnimationFrameId)
    scoreAnimationFrameId = null
  }
}

function triggerScorePop() {
  scorePopActive.value = true
  window.setTimeout(() => {
    scorePopActive.value = false
  }, 320)
}

function animateDisplayedScoreTo(targetTotal) {
  const target = Math.round(Number(targetTotal))
  const startValue = displayedScore.value
  if (startValue === target) {
    triggerScorePop()
    return
  }
  stopScoreAnimation()
  const durationMs = 480
  const startTime = performance.now()
  const delta = target - startValue
  function step(now) {
    const elapsed = now - startTime
    const t = Math.min(1, elapsed / durationMs)
    const eased = 1 - (1 - t) ** 3
    displayedScore.value = Math.round(startValue + delta * eased)
    if (t < 1) {
      scoreAnimationFrameId = requestAnimationFrame(step)
    } else {
      displayedScore.value = target
      scoreAnimationFrameId = null
      triggerScorePop()
    }
  }
  scoreAnimationFrameId = requestAnimationFrame(step)
}

function isPerfectStrike(impactStrength, strikePoints) {
  return strikePoints >= 10000 || impactStrength >= 0.9995
}

async function loadLeaderboardScores() {
  try {
    const rows = await fetchGameLeaderboardScores()
    const filtered = rows.filter((entry) => entry.name !== 'You')
    externalLeaderboardPlayers.value =
      filtered.length > 0
        ? filtered
        : createPlaceholderLeaderboardEntries(2)
  } catch (error) {
    console.warn('Leaderboard fetch failed.', error)
    externalLeaderboardPlayers.value = createPlaceholderLeaderboardEntries(2)
  }
}

const promoGames = [
  {
    id: 'tekhen',
    name: 'Tek Hen',
    iconSrc: tekhenIcon,
    appId: '2136783867072234',
    url: 'https://fb.gg/play/2136783867072234',
    accent: '#00e5ff',
    glow: 'rgba(0, 229, 255, 0.42)',
  },
  {
    id: 'net-flex',
    name: 'Net Flex',
    iconSrc: nfIcon,
    appId: '1431508008453701',
    url: 'https://fb.gg/play/1431508008453701',
    accent: '#39ff14',
    glow: 'rgba(57, 255, 20, 0.45)',
  },
  {
    id: 'bingo-fiesta',
    name: 'Bingo Fiesta',
    iconSrc: bfIcon,
    appId: '1463506198613599',
    url: 'https://fb.gg/play/1463506198613599',
    accent: '#ffe600',
    glow: 'rgba(255, 230, 0, 0.38)',
  },
]

function onClosePhoneModal() {
  showCongratulations.value = false
  showExitPhoneModal.value = false
}

async function onPromoGameClick(event, game) {
  if (!game?.appId) {
    return
  }

  event.preventDefault()

  if (isFBInstantEnabled() && window.FBInstant?.switchGameAsync) {
    try {
      if (!isFBInstantReady()) {
        await whenFBInstantReady()
      }

      if (isFBInstantReady()) {
        await window.FBInstant.switchGameAsync(String(game.appId))
        return
      }
    } catch (error) {
      if (game.url) {
        try {
          window.top.location.href = game.url
        } catch {
          window.location.href = game.url
        }
      }
      return
    }

    if (game.url) {
      try {
        window.top.location.href = game.url
      } catch {
        window.location.href = game.url
      }
    }
    return
  }

  if (game.url) {
    window.open(game.url, '_blank', 'noopener,noreferrer')
    return
  }
}

function onGlobalScreenTap(event) {
  if (
    showCongratulations.value ||
    showExitPhoneModal.value ||
    showContinuePlay.value
  ) {
    return
  }
  const target = event.target
  if (target.closest('.promo-card') || target.closest('[data-game-ui]')) {
    return
  }
  const meterComponent = powerMeterRef.value
  if (!meterComponent?.getImpactStrength) return
  if (smashesLeft.value <= 0) return
  const impactStrength = meterComponent.getImpactStrength()
  onStrike({ impactStrength })
}

function onStrike({ impactStrength }) {
  if (smashesLeft.value <= 0) return
  smashesLeft.value--
  const strikePoints = impactStrengthToPowerPoints(impactStrength)
  if (isPerfectStrike(impactStrength, strikePoints)) {
    showPerfectHitCelebration.value = true
    hasPerfectStrikeThisRound.value = true
  }
  lastStrikePower.value = strikePoints
  totalScore.value += strikePoints
  animateDisplayedScoreTo(totalScore.value)
  playSmashSound()
  emit('strike', { impactStrength })
  startSwingCursor()

  if (smashesLeft.value === 0) {
    window.setTimeout(() => {
      showPerfectHitCelebration.value = false
      showCongratulations.value = false
      showExitPhoneModal.value = true
    }, 900)
  }
}

function resetGame() {
  showCongratulations.value = false
  showExitPhoneModal.value = false
  showContinuePlay.value = false
  phoneVerificationError.value = ''
  lastStrikePower.value = null
  totalScore.value = 0
  stopScoreAnimation()
  displayedScore.value = 0
  showPerfectHitCelebration.value = false
  hasPerfectStrikeThisRound.value = false
  smashesLeft.value = MAX_SMASHES
  emit('resetGame', {})
}

function onContinuePlay() {
  resetGame()
}

async function onVerifyPhone(phone) {
  const sanitizedPhone = sanitizePhilippineMobileNumber(phone)
  if (isVerifyingPhone.value) return

  phoneVerificationError.value = ''

  if (!sanitizedPhone) {
    phoneVerificationError.value = 'Please enter your mobile number.'
    return
  }

  if (!isValidPhilippineMobileNumber(sanitizedPhone)) {
    phoneVerificationError.value =
      'Enter a valid Philippine mobile number starting with 9.'
    return
  }

  isVerifyingPhone.value = true

  try {
    const result = await verifyPhoneWithAxios(sanitizedPhone, totalScore.value)

    if (result?.success === true) {
      showCongratulations.value = false
      showExitPhoneModal.value = false
      showContinuePlay.value = true
      phoneVerificationError.value = ''
      void loadLeaderboardScores()
      return
    }

    if (result?.errorCode === 'ERR_PHONE_ALREADY_USED') {
      phoneVerificationError.value = 'Mobile Number Exist'
      return
    }

    if (String(result?.message ?? '').toLowerCase().includes('already used')) {
      phoneVerificationError.value = 'Mobile Number Exist'
      return
    }

    phoneVerificationError.value =
      result?.message ||
      result?.error ||
      'Verification failed. Please try again.'
  } catch (error) {
    const responseMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      ''

    const responseErrorCode = error?.response?.data?.errorCode

    if (
      responseErrorCode === 'ERR_PHONE_ALREADY_USED' ||
      responseMessage.toLowerCase().includes('already used')
    ) {
      phoneVerificationError.value = 'Mobile Number Exist'
    } else if (
      responseMessage.toLowerCase().includes('network error') ||
      responseMessage.toLowerCase().includes('failed to fetch') ||
      responseMessage.toLowerCase().includes('cors')
    ) {
      phoneVerificationError.value =
        'Verification temporarily unavailable. Please try again.'
    } else {
      phoneVerificationError.value =
        responseMessage || 'Verification failed. Please try again.'
    }

    console.error('Phone verification failed.', error)
  } finally {
    isVerifyingPhone.value = false
  }
}

function startSwingCursor() {
  isSwinging.value = true
  if (swingTimeoutId) clearTimeout(swingTimeoutId)
  swingTimeoutId = setTimeout(() => {
    isSwinging.value = false
    swingTimeoutId = null
  }, 180)
}

function onGlobalPointerUp() {
  if (swingTimeoutId) {
    clearTimeout(swingTimeoutId)
    swingTimeoutId = null
  }
  isSwinging.value = false
}

function updateHammerPositionFromClient(clientX, clientY) {
  mouseX.value = clientX
  mouseY.value = clientY
}

function onPointerMove(event) {
  updateHammerPositionFromClient(event.clientX, event.clientY)
}

function onPointerDown(event) {
  unlockGameAudioFromUserGesture()
  updateHammerPositionFromClient(event.clientX, event.clientY)
}

function onTouchStartUnlock() {
  unlockGameAudioFromUserGesture()
}

function onKeyDownUnlock(event) {
  if (event.repeat) return
  if (event.metaKey || event.ctrlKey || event.altKey) return
  unlockGameAudioFromUserGesture()
}

/**
 * "Stay in touch" (exit phone) only when: no smashes left, no 100% hit this round,
 * other modals closed, and user moves mouse off the document (not on tab switch).
 */
function shouldAllowStayInTouchModal() {
  if (
    showCongratulations.value ||
    showExitPhoneModal.value ||
    showContinuePlay.value
  ) {
    return false
  }
  if (smashesLeft.value > 0) return false
  if (hasPerfectStrikeThisRound.value) return false
  return true
}

function onDocumentMouseLeave(event) {
  if (event.relatedTarget != null) return
  if (!shouldAllowStayInTouchModal()) return
  showExitPhoneModal.value = true
}

onMounted(() => {
  const phaserHost = phaserContainerRef.value
  if (phaserHost) {
    gameInstance = createGame(phaserHost)
    if (gameInstance?.scale) {
      gameInstance.scale.refresh()
    }
    phaserResizeObserver = new ResizeObserver(() => {
      if (gameInstance?.scale) {
        gameInstance.scale.refresh()
      }
    })
    phaserResizeObserver.observe(phaserHost)
  }
  on('bellRang', () => {
    lastStrikePower.value = null
  })
  on('pageNinetyEffects', onPageNinetyEffects)
  on('congratulations', onCongratulationsEvent)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerdown', onPointerDown, { passive: true })
  window.addEventListener('touchstart', onTouchStartUnlock, { passive: true })
  window.addEventListener('keydown', onKeyDownUnlock, { passive: true })
  document.documentElement.addEventListener('mouseleave', onDocumentMouseLeave)
  void loadLeaderboardScores()
})

onUnmounted(() => {
  stopScoreAnimation()
  stopTekhenSlashSoundLoop()
  off('pageNinetyEffects', onPageNinetyEffects)
  off('congratulations', onCongratulationsEvent)
  document.body.classList.remove('page-ninety-shake')
  window.clearTimeout(pageNinetyFxTimerId)
  showPageNinetyFx.value = false
  document.documentElement.removeEventListener('mouseleave', onDocumentMouseLeave)
  if (phaserResizeObserver) {
    phaserResizeObserver.disconnect()
    phaserResizeObserver = null
  }
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerdown', onPointerDown)
  window.removeEventListener('touchstart', onTouchStartUnlock)
  window.removeEventListener('keydown', onKeyDownUnlock)
  if (swingTimeoutId) clearTimeout(swingTimeoutId)
  if (gameInstance) {
    gameInstance.destroy(true)
    gameInstance = null
  }
  if (stopBackgroundAmbience) {
    stopBackgroundAmbience()
    stopBackgroundAmbience = null
  }
})
</script>

<style scoped>
.game-view {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  background: transparent;
  cursor: none;
  touch-action: none;
  user-select: none;
}

.game-view__hammer-cursor {
  position: fixed;
  width: 150px;
  height: 150px;
  margin-left: -75px;
  margin-top: -75px;
  pointer-events: none;
  z-index: 9999;
  background-image: url('/hammer-cursor.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  transition: transform 0.12s ease-out;
}

.game-view__hammer-cursor--swing {
  transform: rotate(-30deg);
}

.game-view__header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 0.6rem 1rem;
  text-align: center;
  background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%);
  z-index: 2;
}

.game-view__title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: #ffb300;
  text-shadow: 0 0 16px rgba(255, 179, 0, 0.6);
  letter-spacing: 0.02em;
}

.game-view__score {
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: rgba(232, 228, 240, 0.9);
}

.game-view__score span + span {
  margin-left: 1rem;
}

.game-view__total-score--header-mobile {
  display: none;
}

.game-view__leaderboard-score {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.45rem;
  padding: 0.4rem 0.55rem;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 229, 255, 0.4);
  border-radius: 8px;
}

.game-view__leaderboard-score-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--neon-cyan);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.game-view__leaderboard-score-value {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--neon-yellow);
  text-shadow: 0 0 12px rgba(255, 235, 59, 0.35);
  display: inline-block;
  transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.game-view__score-pop {
  animation: gameViewScorePop 0.36s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes gameViewScorePop {
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  45% {
    transform: scale(1.14);
    filter: brightness(1.25);
  }
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
}

.perfect-hit-overlay {
  position: fixed;
  inset: 0;
  z-index: 9995;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: max(4.5rem, env(safe-area-inset-top, 0px)) 1rem 1rem;
  pointer-events: none;
}

.perfect-hit-overlay__panel {
  padding: 0.65rem 1.15rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(255, 61, 120, 0.92), rgba(255, 152, 0, 0.88));
  border: 2px solid rgba(255, 255, 255, 0.45);
  border-radius: 14px;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.2),
    0 8px 32px rgba(255, 45, 100, 0.45),
    0 0 48px rgba(255, 200, 0, 0.35);
  animation: perfectHitPanelPulse 1.2s ease-in-out infinite;
}

.perfect-hit-overlay__kicker {
  margin: 0;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.perfect-hit-overlay__title {
  margin: 0.2rem 0 0.15rem;
  font-size: 1.35rem;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 0 16px rgba(255, 255, 255, 0.5);
}

.perfect-hit-overlay__hint {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.92);
}

@keyframes perfectHitPanelPulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow:
      0 0 0 1px rgba(0, 0, 0, 0.2),
      0 8px 32px rgba(255, 45, 100, 0.45),
      0 0 48px rgba(255, 200, 0, 0.35);
  }
  50% {
    transform: scale(1.03);
    box-shadow:
      0 0 0 1px rgba(0, 0, 0, 0.2),
      0 10px 40px rgba(255, 45, 100, 0.6),
      0 0 56px rgba(255, 235, 100, 0.5);
  }
}

.perfect-hit-enter-active,
.perfect-hit-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.perfect-hit-enter-from,
.perfect-hit-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.game-view__machine {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: 0;
  background: rgba(0, 0, 0, 0.7);
}

.game-view__phaser {
  width: 100%;
  max-width: 420px;
  aspect-ratio: 420 / 560;
  max-height: 100%;
  border-radius: 12px;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.7);
  box-shadow:
    0 0 0 2px rgba(255, 179, 0, 0.4),
    0 0 40px rgba(255, 140, 0, 0.15),
    inset 0 0 60px rgba(0, 0, 0, 0.3);
}

.game-view__bottom-bar {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 2rem);
  max-width: 521px;
  z-index: 2;
  display: flex;
  align-items: stretch;
  gap: 0.75rem;
}

.game-view__power-meter {
  flex: 1;
  min-width: 0;
}

.game-view__smash-limit {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.75rem 0.85rem;
  background: var(--carnival-dark);
  border: 2px solid var(--neon-pink);
  border-radius: 12px;
  box-shadow: 0 0 16px rgba(255, 45, 146, 0.3);
}

.smash-limit__label {
  margin: 0;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--neon-pink);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  text-align: center;
  line-height: 1.2;
}

.smash-limit__pips {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.smash-limit__pip {
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--neon-pink);
  box-shadow: 0 0 8px var(--neon-pink);
  transition: background 0.2s, box-shadow 0.2s;
}

.smash-limit__pip--used {
  background: rgba(255, 45, 146, 0.15);
  box-shadow: none;
}

.smash-limit__count {
  margin: 0;
  font-size: 0.7rem;
  font-weight: 700;
  color: rgba(232, 228, 240, 0.8);
}

.smash-limit__count--empty {
  color: var(--neon-pink);
  text-shadow: 0 0 8px var(--neon-pink);
}

.game-view__leaderboard {
  position: absolute;
  top: 4.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 220px;
  z-index: 2;
}

.game-view__promo-rail {
  position: absolute;
  top: 5rem;
  right: 1rem;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  width: min(20vw, 140px);
}

.promo-card {
  position: relative;
  display: flex;
  min-height: 106px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0;
  font: inherit;
  color: #fff;
  text-align: left;
  appearance: none;
  -webkit-appearance: none;
  border: 1.5px solid var(--promo-accent);
  border-radius: 16px;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.24) 0%, transparent 28%),
    linear-gradient(160deg, rgba(0, 0, 0, 0.15), rgba(10, 8, 24, 0.84)),
    linear-gradient(135deg, color-mix(in srgb, var(--promo-accent) 32%, #050816), #101022 78%);
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.1) inset,
    0 0 20px var(--promo-glow),
    0 0 36px color-mix(in srgb, var(--promo-accent) 38%, transparent);
  isolation: isolate;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  transform: perspective(600px) rotateY(-8deg);
  transition: transform 0.18s ease, filter 0.18s ease, box-shadow 0.18s ease;
  animation: promoPulse 1.8s ease-in-out infinite alternate;
}

.promo-card::-moz-focus-inner {
  border: 0;
}

.promo-card:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.85);
  outline-offset: 2px;
}

.promo-card__image {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.promo-card__tekhen-stack {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  border-radius: inherit;
}

.promo-card__image--tekhen-left,
.promo-card__image--tekhen-right {
  transform-origin: center center;
}

.promo-card__image--tekhen-left {
  clip-path: polygon(0 0, 50.4% 0, 50.4% 100%, 0 100%);
  animation: promoTekhenLeftBreak 3s ease-out infinite;
}

.promo-card__image--tekhen-right {
  clip-path: polygon(49.6% 0, 100% 0, 100% 100%, 49.6% 100%);
  animation: promoTekhenRightBreak 3s ease-out infinite;
}

.promo-card__slice-trail {
  position: absolute;
  top: -35%;
  left: -95%;
  z-index: 2;
  width: 55%;
  height: 210%;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(200, 40, 40, 0.15) 38%,
    rgba(255, 120, 90, 0.35) 48%,
    rgba(255, 220, 200, 0.45) 50%,
    rgba(255, 100, 80, 0.22) 52%,
    transparent 62%
  );
  transform: rotate(-36deg);
  transform-origin: center center;
  mix-blend-mode: screen;
  filter: blur(2px);
  opacity: 0.85;
  animation: promoTekhenSwordSlash 3s ease-out infinite;
  animation-delay: 0.05s;
}

.promo-card__slice-blade {
  position: absolute;
  top: -32%;
  left: -90%;
  z-index: 3;
  width: 16%;
  height: 205%;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.25) 44%,
    rgba(255, 255, 255, 1) 49.5%,
    rgba(220, 245, 255, 0.98) 50.5%,
    rgba(255, 255, 255, 0.35) 54%,
    transparent 58%
  );
  transform: rotate(-36deg);
  transform-origin: center center;
  mix-blend-mode: plus-lighter;
  filter:
    drop-shadow(0 0 2px rgba(255, 255, 255, 0.95))
    drop-shadow(0 0 8px rgba(255, 60, 60, 0.55))
    drop-shadow(-2px 0 14px rgba(255, 200, 180, 0.4));
  animation: promoTekhenSwordSlash 3s cubic-bezier(0.2, 0.85, 0.15, 1) infinite;
}

.promo-card__slice-flash {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  border-radius: inherit;
  background: radial-gradient(
    circle at 50% 48%,
    rgba(255, 255, 255, 0.92) 0%,
    rgba(255, 240, 220, 0.35) 28%,
    transparent 58%
  );
  mix-blend-mode: screen;
  opacity: 0;
  animation: promoTekhenFlash 3s ease-out infinite;
}

.promo-card__slice-scar {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 4;
  width: 150%;
  height: 4px;
  margin: -2px 0 0 -75%;
  pointer-events: none;
  border-radius: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 0, 0, 0.5) 35%,
    rgba(255, 255, 255, 0.95) 50%,
    rgba(0, 0, 0, 0.45) 65%,
    transparent 100%
  );
  transform: rotate(-36deg);
  transform-origin: center center;
  mix-blend-mode: overlay;
  opacity: 0;
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.8));
  animation: promoTekhenScar 3s ease-out infinite;
}

.promo-card__slice-crack {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  border-radius: inherit;
  opacity: 0;
  mix-blend-mode: screen;
  background:
    linear-gradient(
      118deg,
      transparent 44%,
      rgba(255, 255, 255, 0.55) 49.2%,
      rgba(255, 255, 255, 0.2) 49.8%,
      transparent 51%
    ),
    linear-gradient(
      72deg,
      transparent 58%,
      rgba(255, 255, 255, 0.35) 61%,
      transparent 63.5%
    ),
    linear-gradient(
      152deg,
      transparent 32%,
      rgba(255, 255, 255, 0.22) 35%,
      transparent 38%
    );
  animation: promoTekhenCrack 3s ease-out infinite;
}

.promo-card__slice-sparks {
  position: absolute;
  left: 50%;
  top: 48%;
  z-index: 4;
  width: 6px;
  height: 6px;
  margin: -3px 0 0 -3px;
  pointer-events: none;
  border-radius: 50%;
  background: radial-gradient(circle, #fff 0%, rgba(255, 220, 120, 0.9) 45%, transparent 72%);
  mix-blend-mode: plus-lighter;
  opacity: 0;
  box-shadow:
    14px -10px 0 0 rgba(255, 255, 255, 0.95),
    -12px 12px 0 0 rgba(255, 200, 80, 0.9),
    18px 12px 0 0 rgba(255, 255, 220, 0.85),
    -16px -8px 0 0 rgba(255, 255, 255, 0.8),
    6px 18px 0 0 rgba(255, 180, 60, 0.75);
  animation: promoTekhenSparks 3s ease-out infinite;
}

.promo-card__slice-shard {
  position: absolute;
  z-index: 4;
  width: 5px;
  height: 10px;
  pointer-events: none;
  border-radius: 1px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(200, 220, 255, 0.45) 100%
  );
  mix-blend-mode: screen;
  opacity: 0;
}

.promo-card__slice-shard--a {
  top: 46%;
  left: 47%;
  animation: promoTekhenShardA 3s ease-out infinite;
}

.promo-card__slice-shard--b {
  top: 54%;
  left: 53%;
  animation: promoTekhenShardB 3s ease-out infinite;
}

.promo-card__slice-shard--c {
  top: 50%;
  left: 44%;
  animation: promoTekhenShardC 3s ease-out infinite;
}

.promo-card:hover {
  filter: brightness(1.1);
  transform: perspective(600px) rotateY(0deg) translateX(-4px) scale(1.03);
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.14) inset,
    0 0 26px var(--promo-glow),
    0 0 48px color-mix(in srgb, var(--promo-accent) 48%, transparent);
}

.promo-card__shine {
  position: absolute;
  inset: -20% auto auto -35%;
  width: 70%;
  height: 180%;
  background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.34), transparent);
  transform: rotate(26deg);
  animation: promoShine 2.2s linear infinite;
  pointer-events: none;
}

.promo-card__badge {
  position: absolute;
  top: 0.45rem;
  right: 0.45rem;
  z-index: 5;
  padding: 0.18rem 0.42rem;
  border-radius: 999px;
  background: #ff2d92;
  box-shadow: 0 0 12px rgba(255, 45, 146, 0.7);
  font-size: 0.58rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.promo-card__icon {
  position: absolute;
  top: 0.7rem;
  left: 0.7rem;
  display: grid;
  width: 2.65rem;
  height: 2.65rem;
  place-items: center;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.34);
  border: 2px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 0 16px color-mix(in srgb, var(--promo-accent) 55%, transparent);
  font-size: 0.92rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  color: var(--promo-accent);
}

.promo-card__title {
  position: relative;
  z-index: 1;
  font-size: 0.92rem;
  font-weight: 900;
  line-height: 1.05;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.45);
}

@keyframes promoPulse {
  from {
    box-shadow:
      0 0 0 2px rgba(255, 255, 255, 0.1) inset,
      0 0 18px var(--promo-glow),
      0 0 28px color-mix(in srgb, var(--promo-accent) 28%, transparent);
  }
  to {
    box-shadow:
      0 0 0 2px rgba(255, 255, 255, 0.16) inset,
      0 0 24px var(--promo-glow),
      0 0 42px color-mix(in srgb, var(--promo-accent) 42%, transparent);
  }
}

@keyframes promoTekhenSwordSlash {
  0%,
  68% {
    opacity: 0;
    transform: rotate(-36deg) translate3d(-145%, 0, 0);
  }
  69% {
    opacity: 0.95;
    transform: rotate(-36deg) translate3d(-42%, 0, 0);
  }
  70% {
    opacity: 1;
    transform: rotate(-36deg) translate3d(18%, 0, 0);
  }
  72% {
    opacity: 1;
    transform: rotate(-36deg) translate3d(295%, 0, 0);
  }
  73%,
  100% {
    opacity: 0;
    transform: rotate(-36deg) translate3d(310%, 0, 0);
  }
}

@keyframes promoTekhenLeftBreak {
  0%,
  66% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  67% {
    transform: translate3d(-2px, 2px, 0) rotate(-0.6deg);
  }
  68% {
    transform: translate3d(3px, -2px, 0) rotate(0.9deg);
  }
  69% {
    transform: translate3d(-5px, 2px, 0) rotate(-1.4deg);
  }
  70% {
    transform: translate3d(6px, -5px, 0) rotate(1.5deg);
  }
  71% {
    transform: translate3d(-11px, 1px, 0) rotate(-1.6deg);
  }
  72% {
    transform: translate3d(-14px, -3px, 0) rotate(-1.4deg);
  }
  73% {
    transform: translate3d(-9px, 3px, 0) rotate(-1deg);
  }
  74% {
    transform: translate3d(-5px, 2px, 0) rotate(-0.5deg);
  }
  75% {
    transform: translate3d(-2px, 1px, 0) rotate(-0.2deg);
  }
  76% {
    transform: translate3d(-1px, 0, 0);
  }
  77%,
  100% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
}

@keyframes promoTekhenRightBreak {
  0%,
  66% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  67% {
    transform: translate3d(2px, 2px, 0) rotate(0.6deg);
  }
  68% {
    transform: translate3d(-3px, -2px, 0) rotate(-0.9deg);
  }
  69% {
    transform: translate3d(5px, 2px, 0) rotate(1.4deg);
  }
  70% {
    transform: translate3d(-6px, -5px, 0) rotate(-1.5deg);
  }
  71% {
    transform: translate3d(11px, 1px, 0) rotate(1.6deg);
  }
  72% {
    transform: translate3d(14px, -3px, 0) rotate(1.4deg);
  }
  73% {
    transform: translate3d(9px, 3px, 0) rotate(1deg);
  }
  74% {
    transform: translate3d(5px, 2px, 0) rotate(0.5deg);
  }
  75% {
    transform: translate3d(2px, 1px, 0) rotate(0.2deg);
  }
  76% {
    transform: translate3d(1px, 0, 0);
  }
  77%,
  100% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
}

@keyframes promoTekhenFlash {
  0%,
  69% {
    opacity: 0;
  }
  70% {
    opacity: 0.88;
  }
  71.5% {
    opacity: 0.35;
  }
  73%,
  100% {
    opacity: 0;
  }
}

@keyframes promoTekhenScar {
  0%,
  69.5% {
    opacity: 0;
    transform: rotate(-36deg) scaleX(0.65);
  }
  70.5% {
    opacity: 1;
    transform: rotate(-36deg) scaleX(1);
  }
  76% {
    opacity: 0.55;
    transform: rotate(-36deg) scaleX(1);
  }
  82%,
  100% {
    opacity: 0;
    transform: rotate(-36deg) scaleX(1);
  }
}

@keyframes promoTekhenCrack {
  0%,
  69% {
    opacity: 0;
    transform: scale(0.96);
  }
  70% {
    opacity: 0.95;
    transform: scale(1);
  }
  74% {
    opacity: 0.75;
  }
  80%,
  100% {
    opacity: 0;
    transform: scale(1);
  }
}

@keyframes promoTekhenSparks {
  0%,
  69% {
    opacity: 0;
    transform: scale(0.2);
  }
  70% {
    opacity: 1;
    transform: scale(1.15);
  }
  72% {
    opacity: 0.85;
    transform: scale(1.45) translate3d(4px, -2px, 0);
  }
  74%,
  100% {
    opacity: 0;
    transform: scale(1.8) translate3d(10px, -6px, 0);
  }
}

@keyframes promoTekhenShardA {
  0%,
  69% {
    opacity: 0;
    transform: rotate(-36deg) translate3d(0, 0, 0) scale(0.3);
  }
  70% {
    opacity: 1;
    transform: rotate(-36deg) translate3d(-6px, -4px, 0) scale(1);
  }
  74% {
    opacity: 0;
    transform: rotate(-36deg) translate3d(-26px, -22px, 0) scale(0.35);
  }
  75%,
  100% {
    opacity: 0;
  }
}

@keyframes promoTekhenShardB {
  0%,
  69% {
    opacity: 0;
    transform: rotate(-18deg) translate3d(0, 0, 0) scale(0.3);
  }
  70.5% {
    opacity: 1;
    transform: rotate(-18deg) translate3d(8px, 2px, 0) scale(1);
  }
  74.5% {
    opacity: 0;
    transform: rotate(-18deg) translate3d(22px, 18px, 0) scale(0.3);
  }
  75.5%,
  100% {
    opacity: 0;
  }
}

@keyframes promoTekhenShardC {
  0%,
  69% {
    opacity: 0;
    transform: rotate(-52deg) translate3d(0, 0, 0) scale(0.25);
  }
  71% {
    opacity: 1;
    transform: rotate(-52deg) translate3d(4px, 6px, 0) scale(1);
  }
  75% {
    opacity: 0;
    transform: rotate(-52deg) translate3d(-18px, 20px, 0) scale(0.25);
  }
  76%,
  100% {
    opacity: 0;
  }
}

@keyframes promoShine {
  from {
    transform: translateX(-130%) rotate(26deg);
  }
  to {
    transform: translateX(260%) rotate(26deg);
  }
}

@media (max-width: 900px) {
  .game-view {
    min-height: 100dvh;
    padding: clamp(0.3rem, 0.8vw, 0.45rem) clamp(0.45rem, 1vw, 0.7rem) clamp(0.55rem, 1.2vw, 0.8rem);
    overflow: hidden;
  }

  .game-view__hammer-cursor {
    width: 112px;
    height: 112px;
    margin-left: -56px;
    margin-top: -56px;
  }

  .game-view__header {
    padding: clamp(0.3rem, 0.75vw, 0.42rem) clamp(0.55rem, 1vw, 0.72rem) clamp(0.18rem, 0.45vw, 0.24rem);
  }

  .game-view__title {
    font-size: 0.98rem;
  }

  .game-view__score {
    font-size: 0.62rem;
    line-height: 1.1;
  }

  .game-view__score span + span {
    margin-left: 0.45rem;
  }

  .game-view__total-score--header-mobile {
    display: inline;
    margin-left: 0.45rem;
    font-weight: 700;
    color: var(--neon-yellow);
  }

  .game-view__leaderboard {
    top: clamp(3.2rem, 6.2vh, 3.8rem);
    width: clamp(10.8rem, 61vw, 12rem);
  }

  .game-view__machine {
    width: min(100%, 360px);
    margin: clamp(2.55rem, 6.5vh, 3rem) auto 0;
    background: rgba(0, 0, 0, 0.72);
  }

  .game-view__phaser {
    width: 100%;
    max-width: 360px;
    aspect-ratio: 420 / 560;
    border-radius: 11px;
  }

  .game-view__promo-rail {
    top: clamp(3.05rem, 6.8vh, 3.75rem);
    right: clamp(0.28rem, 0.9vw, 0.6rem);
    width: clamp(4.25rem, 14vw, 4.85rem);
    gap: clamp(0.3rem, 0.8vw, 0.42rem);
  }

  .promo-card {
    min-height: clamp(72px, 14.5vw, 80px);
    border-radius: 12px;
    border-width: 1.5px;
  }

  .promo-card__badge {
    top: 0.25rem;
    right: 0.25rem;
    font-size: 0.52rem;
    padding: 0.14rem 0.36rem;
  }

  .game-view__bottom-bar {
    left: 50%;
    right: auto;
    bottom: clamp(0.38rem, 1vh, 0.62rem);
    width: min(calc(100% - clamp(0.7rem, 1.6vw, 1rem)), 521px);
    max-width: 521px;
    transform: translateX(-50%);
    gap: clamp(0.35rem, 0.8vw, 0.55rem);
  }

  .game-view__smash-limit {
    padding: clamp(0.42rem, 0.95vw, 0.55rem);
    gap: clamp(0.22rem, 0.55vw, 0.3rem);
  }

  .smash-limit__label {
    font-size: 0.54rem;
  }

  .smash-limit__pip {
    width: 15px;
    height: 15px;
  }

  .smash-limit__count {
    font-size: 0.6rem;
  }
}

.page-ninety-fx {
  position: fixed;
  inset: 0;
  /* Above CongratulationsModal (10000), below ContinuePlayModal (10100). */
  z-index: 10050;
  pointer-events: none;
  overflow: hidden;
}

.page-ninety-fx__flash {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 120% 55% at 50% 0%, rgba(255, 255, 255, 0.5), transparent 58%),
    radial-gradient(ellipse 90% 40% at 30% 10%, rgba(120, 220, 255, 0.35), transparent 50%),
    radial-gradient(ellipse 90% 40% at 70% 8%, rgba(200, 240, 255, 0.28), transparent 50%);
  opacity: 0;
  animation: page-ninety-flash 1.95s ease-out forwards;
}

.page-ninety-fx__ray-wrap {
  position: absolute;
  top: 0;
  transform-origin: top center;
}

.page-ninety-fx__ray-wrap--1 {
  left: 12%;
  transform: rotate(-8deg);
}

.page-ninety-fx__ray-wrap--1 .page-ninety-fx__ray {
  animation-delay: 0.02s;
}

.page-ninety-fx__ray-wrap--2 {
  left: 28%;
  transform: rotate(4deg);
}

.page-ninety-fx__ray-wrap--2 .page-ninety-fx__ray {
  width: 3px;
  animation-delay: 0.06s;
}

.page-ninety-fx__ray-wrap--3 {
  left: 48%;
  margin-left: -2px;
  transform: rotate(-2deg);
}

.page-ninety-fx__ray-wrap--4 {
  left: 62%;
  transform: rotate(7deg);
}

.page-ninety-fx__ray-wrap--4 .page-ninety-fx__ray {
  width: 3px;
  animation-delay: 0.05s;
}

.page-ninety-fx__ray-wrap--5 {
  left: 78%;
  transform: rotate(-5deg);
}

.page-ninety-fx__ray-wrap--5 .page-ninety-fx__ray {
  animation-delay: 0.08s;
}

.page-ninety-fx__ray-wrap--6 {
  left: 88%;
  transform: rotate(11deg);
}

.page-ninety-fx__ray-wrap--6 .page-ninety-fx__ray {
  width: 2px;
  animation-delay: 0.04s;
}

.page-ninety-fx__ray-wrap--7 {
  left: 6%;
  transform: rotate(14deg);
}

.page-ninety-fx__ray-wrap--7 .page-ninety-fx__ray {
  width: 2px;
  animation-delay: 0.1s;
}

.page-ninety-fx__ray {
  width: 4px;
  height: min(62vh, 520px);
  border-radius: 2px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(140, 220, 255, 0.55) 42%,
    rgba(80, 160, 255, 0.15) 78%,
    transparent 100%
  );
  filter: blur(0.6px) drop-shadow(0 0 14px rgba(255, 255, 255, 0.85));
  transform-origin: top center;
  opacity: 0;
  animation: page-ninety-ray 1.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.page-ninety-fx__ray--short {
  height: min(48vh, 400px);
}

.page-ninety-fx__ray-wrap--7 .page-ninety-fx__ray--short {
  height: min(44vh, 360px);
}

@keyframes page-ninety-flash {
  0% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  42% {
    opacity: 0.72;
  }
  68% {
    opacity: 0.35;
  }
  100% {
    opacity: 0;
  }
}

@keyframes page-ninety-ray {
  0% {
    opacity: 0;
    transform: scaleY(0.25) translateY(-12px);
  }
  22% {
    opacity: 1;
  }
  55% {
    opacity: 0.92;
    transform: scaleY(1) translateY(0);
  }
  82% {
    opacity: 0.45;
    transform: scaleY(1) translateY(0);
  }
  100% {
    opacity: 0;
    transform: scaleY(1) translateY(0);
  }
}

</style>

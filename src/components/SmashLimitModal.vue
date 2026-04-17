<template>
  <Teleport to="body">
    <Transition name="smash-modal">
      <div
        v-if="show"
        class="smash-limit-modal"
        role="dialog"
        aria-labelledby="smash-limit-title"
      >
        <div class="smash-limit-modal__backdrop" />
        <div class="smash-limit-modal__box">
          <div class="smash-limit-modal__icon">💥</div>

          <h2 id="smash-limit-title" class="smash-limit-modal__title">
            Out of Smashes!
          </h2>

          <p class="smash-limit-modal__text">
            You've used all your smashes this round.
          </p>

          <div v-if="retriesLeft > 0" class="smash-limit-modal__retry-section">
            <div class="smash-limit-modal__retry-pips">
              <span
                v-for="retryIndex in MAX_RETRIES"
                :key="retryIndex"
                class="smash-limit-modal__retry-pip"
                :class="{ 'smash-limit-modal__retry-pip--used': retryIndex > retriesLeft }"
              />
            </div>
            <p class="smash-limit-modal__retry-count">
              {{ retriesLeft }} {{ retriesLeft === 1 ? 'retry' : 'retries' }} remaining
            </p>
            <button
              type="button"
              class="smash-limit-modal__retry-btn"
              @click="$emit('retry')"
            >
              Retry
            </button>
          </div>

          <div v-else class="smash-limit-modal__gameover-section">
            <p class="smash-limit-modal__gameover-text">No retries left. Better luck next time!</p>
            <a
              href="https://bybet.ph/"
              target="_blank"
              rel="noopener noreferrer"
              class="smash-limit-modal__close-btn"
            >
              Try Again Next Time
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  show: { type: Boolean, default: false },
  retriesLeft: { type: Number, default: 0 },
  MAX_RETRIES: { type: Number, default: 3 },
})

defineEmits(['retry', 'close'])
</script>

<style scoped>
.smash-limit-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
}

.smash-limit-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
}

.smash-limit-modal__box {
  position: relative;
  padding: 2rem;
  max-width: 340px;
  width: 100%;
  background: linear-gradient(180deg, #1a0a24 0%, #2a0a0a 100%);
  border: 3px solid var(--neon-pink);
  border-radius: 16px;
  box-shadow: 0 0 40px rgba(255, 45, 146, 0.4);
  text-align: center;
}

.smash-limit-modal__icon {
  font-size: 3rem;
  line-height: 1;
  margin-bottom: 0.75rem;
}

.smash-limit-modal__title {
  margin: 0 0 0.5rem 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--neon-pink);
  text-shadow: 0 0 20px rgba(255, 45, 146, 0.6);
}

.smash-limit-modal__text {
  margin: 0 0 1.25rem 0;
  font-size: 0.95rem;
  color: rgba(232, 228, 240, 0.8);
}

.smash-limit-modal__retry-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.625rem;
}

.smash-limit-modal__retry-pips {
  display: flex;
  gap: 0.5rem;
}

.smash-limit-modal__retry-pip {
  display: block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--neon-pink);
  box-shadow: 0 0 6px var(--neon-pink);
  transition: background 0.2s, box-shadow 0.2s;
}

.smash-limit-modal__retry-pip--used {
  background: rgba(255, 45, 146, 0.15);
  box-shadow: none;
}

.smash-limit-modal__retry-count {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 700;
  color: rgba(232, 228, 240, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.smash-limit-modal__retry-btn {
  width: 100%;
  padding: 0.8rem 1.5rem;
  font-size: 1.05rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #e85c2b, #ff9800);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 0 18px rgba(232, 92, 43, 0.55);
  transition: filter 0.2s ease, transform 0.15s ease;
}

.smash-limit-modal__retry-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.smash-limit-modal__gameover-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.smash-limit-modal__gameover-text {
  margin: 0;
  font-size: 0.95rem;
  color: rgba(232, 228, 240, 0.7);
}

.smash-limit-modal__close-btn {
  display: block;
  width: 100%;
  padding: 0.8rem 1.5rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: #ffffff;
  background: var(--neon-yellow);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 0 16px rgba(255, 235, 59, 0.4);
  text-decoration: none;
  text-align: center;
  transition: filter 0.2s ease;
}

.smash-limit-modal__close-btn:hover {
  filter: brightness(1.1);
}

.smash-modal-enter-active,
.smash-modal-leave-active {
  transition: opacity 0.2s ease;
}

.smash-modal-enter-active .smash-limit-modal__box,
.smash-modal-leave-active .smash-limit-modal__box {
  transition: transform 0.2s ease;
}

.smash-modal-enter-from,
.smash-modal-leave-to {
  opacity: 0;
}

.smash-modal-enter-from .smash-limit-modal__box,
.smash-modal-leave-to .smash-limit-modal__box {
  transform: scale(0.9);
}
</style>

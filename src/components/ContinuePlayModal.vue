<template>
  <Teleport to="body">
    <Transition name="continue-modal">
      <div
        v-if="show"
        class="continue-play-modal"
        role="dialog"
        aria-labelledby="continue-play-title"
        @click.self="$emit('continue')"
      >
        <div class="continue-play-modal__backdrop" />
        <div class="continue-play-modal__box">
          <div class="continue-play-modal__icon">PLAY</div>

          <h2 id="continue-play-title" class="continue-play-modal__title">
            Verification Complete
          </h2>

          <p class="continue-play-modal__text">
            Your mobile number was verified successfully. Ready for another round?
          </p>

          <button
            type="button"
            class="continue-play-modal__button"
            @click="$emit('continue')"
          >
            Continue Play Again
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  show: { type: Boolean, default: false },
})

defineEmits(['continue'])
</script>

<style scoped>
.continue-play-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10100;
  padding: 1rem;
}

.continue-play-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.78);
}

.continue-play-modal__box {
  position: relative;
  width: 100%;
  max-width: 360px;
  padding: 2rem;
  text-align: center;
  background: linear-gradient(180deg, #10253b 0%, #0b1626 100%);
  border: 3px solid #00e5ff;
  border-radius: 16px;
  box-shadow: 0 0 36px rgba(0, 229, 255, 0.35);
}

.continue-play-modal__icon {
  margin-bottom: 0.85rem;
  font-size: 0.9rem;
  font-weight: 900;
  letter-spacing: 0.24em;
  color: #00e5ff;
  text-transform: uppercase;
}

.continue-play-modal__title {
  margin: 0 0 0.6rem 0;
  font-size: 1.55rem;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 0 0 16px rgba(0, 229, 255, 0.35);
}

.continue-play-modal__text {
  margin: 0 0 1.4rem 0;
  font-size: 0.98rem;
  color: rgba(232, 244, 255, 0.82);
  line-height: 1.45;
}

.continue-play-modal__button {
  width: 100%;
  padding: 0.85rem 1.25rem;
  font-size: 1rem;
  font-weight: 800;
  color: #08111b;
  background: linear-gradient(135deg, #00e5ff, #7af7c2);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.35);
  transition: filter 0.2s ease, transform 0.15s ease;
}

.continue-play-modal__button:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
}

.continue-modal-enter-active,
.continue-modal-leave-active {
  transition: opacity 0.2s ease;
}

.continue-modal-enter-active .continue-play-modal__box,
.continue-modal-leave-active .continue-play-modal__box {
  transition: transform 0.2s ease;
}

.continue-modal-enter-from,
.continue-modal-leave-to {
  opacity: 0;
}

.continue-modal-enter-from .continue-play-modal__box,
.continue-modal-leave-to .continue-play-modal__box {
  transform: scale(0.92);
}
</style>

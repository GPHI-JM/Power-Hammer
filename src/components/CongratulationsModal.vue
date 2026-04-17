<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="congratulations-modal"
        role="dialog"
        aria-labelledby="congratulations-title"
        @click.self="$emit('close')"
      >
        <div class="congratulations-modal__backdrop" />
        <div class="congratulations-modal__box">
          <h2 id="congratulations-title" class="congratulations-modal__title">
            {{ variant === 'exit' ? 'Stay in touch' : 'Congratulations!' }}
          </h2>
          <p v-if="variant === 'congratulations'" class="congratulations-modal__text">
            You hit 90% or above. Amazing strength!
          </p>
          <p v-else class="congratulations-modal__text">
            Enter your mobile number before you leave.
          </p>

          <div class="congratulations-modal__verify-form">
            <input
              v-model="mobileNumber"
              type="tel"
              inputmode="numeric"
              class="congratulations-modal__mobile-input"
              :class="{ 'congratulations-modal__mobile-input--error': errorMessage }"
              placeholder="Enter mobile number"
              maxlength="15"
              @input="$emit('clear-error')"
            />
            <p v-if="errorMessage" class="congratulations-modal__error">
              {{ errorMessage }}
            </p>
            <button
              type="button"
              class="congratulations-modal__verify"
              @click="$emit('verify', mobileNumber)"
            >
              Verify
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  show: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
  variant: {
    type: String,
    default: 'congratulations',
    validator: (value) => ['congratulations', 'exit'].includes(value),
  },
})

defineEmits(['close', 'verify', 'clear-error'])

const mobileNumber = ref('')
</script>

<style scoped>
.congratulations-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
}

.congratulations-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
}

.congratulations-modal__box {
  position: relative;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  background: linear-gradient(180deg, #2a1a4a 0%, #1a0a24 100%);
  border: 3px solid var(--neon-yellow);
  border-radius: 16px;
  box-shadow: 0 0 40px rgba(255, 235, 59, 0.4);
}

.congratulations-modal__title {
  margin: 0 0 0.75rem 0;
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--neon-yellow);
  text-align: center;
  text-shadow: 0 0 20px rgba(255, 235, 59, 0.6);
}

.congratulations-modal__text {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
  color: rgba(232, 228, 240, 0.95);
  text-align: center;
}

.congratulations-modal__verify-form {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin-bottom: 1rem;
}

.congratulations-modal__mobile-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 235, 59, 0.4);
  border-radius: 10px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

.congratulations-modal__mobile-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.congratulations-modal__mobile-input:focus {
  border-color: var(--neon-yellow);
  box-shadow: 0 0 10px rgba(255, 235, 59, 0.3);
}

.congratulations-modal__mobile-input--error {
  border-color: #ff6b6b;
  box-shadow: 0 0 10px rgba(255, 107, 107, 0.25);
}

.congratulations-modal__error {
  margin: -0.2rem 0 0;
  font-size: 0.85rem;
  color: #ff8f8f;
}

.congratulations-modal__verify {
  display: block;
  width: 100%;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #e85c2b, #ff9800);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 0 16px rgba(232, 92, 43, 0.5);
  transition: filter 0.2s ease;
}

.congratulations-modal__verify:hover {
  filter: brightness(1.1);
}


.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .congratulations-modal__box,
.modal-leave-active .congratulations-modal__box {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .congratulations-modal__box,
.modal-leave-to .congratulations-modal__box {
  transform: scale(0.9);
}
</style>

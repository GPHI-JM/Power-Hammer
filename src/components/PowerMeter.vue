<template>
  <div
    class="power-meter"
    :class="{
      'power-meter--disabled': disabled,
      'power-meter--vertical': vertical,
    }"
  >
    <p class="power-meter__label">Tap at the peak</p>
    <div class="power-meter__track">
      <div
        class="power-meter__fill"
        :style="fillStyle"
      />
      <div
        class="power-meter__marker"
        :style="markerStyle"
      />
    </div>
    <p class="power-meter__points" :style="percentStyle">{{ powerPoints }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { impactStrengthToPowerPoints } from '../utils/scorePower'

const props = defineProps({
  speed: { type: Number, default: 1.2 },
  level: { type: Number, default: 1 },
  disabled: { type: Boolean, default: false },
  vertical: { type: Boolean, default: false },
})

const meterValue = ref(0)
const direction = ref(1)
const animationFrameId = ref(null)
let lastTimestamp = 0

const levelMultiplier = computed(() => 1 + (props.level - 1) * 0.1)
const baseSpeed = computed(() => props.speed * levelMultiplier.value * 0.00045)

const fillStyle = computed(() => {
  const value = meterValue.value
  const green = Math.round(255 * (1 - value))
  const red = Math.round(255 * value)
  const backgroundColor = `rgb(${red}, ${green}, 80)`
  if (props.vertical) {
    return {
      width: '100%',
      height: `${value * 100}%`,
      top: 'auto',
      bottom: 0,
      left: 0,
      backgroundColor,
    }
  }
  return {
    width: `${value * 100}%`,
    backgroundColor,
  }
})

const markerStyle = computed(() => {
  const value = meterValue.value
  if (props.vertical) {
    return {
      left: 0,
      right: 0,
      top: 'auto',
      width: '100%',
      height: '5px',
      bottom: `calc(${value * 100}% - 2.5px)`,
      marginLeft: 0,
    }
  }
  return {
    left: `${value * 100}%`,
  }
})

const powerPoints = computed(() => impactStrengthToPowerPoints(meterValue.value))

const percentStyle = computed(() => {
  const value = meterValue.value
  let color
  if (value < 0.4) {
    color = '#00ff88'
  } else if (value < 0.7) {
    color = '#ffeb3b'
  } else if (value < 0.9) {
    color = '#ff9800'
  } else {
    color = '#ff2d55'
  }
  return { color, textShadow: `0 0 16px ${color}` }
})

function getImpactStrength() {
  return meterValue.value
}

defineExpose({
  getImpactStrength,
})

onMounted(() => {
  function tick(timestamp) {
    const delta = lastTimestamp === 0 ? 16 : Math.min(timestamp - lastTimestamp, 50)
    lastTimestamp = timestamp

    const highPowerSpeedMultiplier = meterValue.value > 0.7 ? 3 : 1
    const step = baseSpeed.value * delta * highPowerSpeedMultiplier

    let next = meterValue.value + step * direction.value
    if (next >= 1) {
      next = 1
      direction.value = -1
    } else if (next <= 0) {
      next = 0
      direction.value = 1
    }
    meterValue.value = next
    animationFrameId.value = requestAnimationFrame(tick)
  }
  animationFrameId.value = requestAnimationFrame(tick)
})

onUnmounted(() => {
  if (animationFrameId.value != null) cancelAnimationFrame(animationFrameId.value)
})
</script>

<style scoped>
.power-meter {
  padding: 1rem 1.5rem;
  background: var(--carnival-dark);
  border: 2px solid var(--neon-cyan);
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.3);
  transition: opacity 0.3s ease;
}

.power-meter--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.power-meter__label {
  margin: 0 0 0.5rem 0;
  font-weight: 700;
  color: var(--neon-yellow);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.power-meter__track {
  position: relative;
  height: 32px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  overflow: hidden;
}

.power-meter__fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  border-radius: 8px;
  transition: width 0.05s linear, background-color 0.05s linear;
}

.power-meter__marker {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4px;
  margin-left: -2px;
  background: #fff;
  box-shadow: 0 0 10px var(--neon-yellow);
  pointer-events: none;
  transition: left 0.05s linear;
}

.power-meter__points {
  margin: 0.5rem 0 0 0;
  font-size: 2rem;
  font-weight: 800;
  text-align: center;
  letter-spacing: 0.05em;
  transition: color 0.1s ease, text-shadow 0.1s ease;
}

@media (max-width: 900px) {
  .power-meter:not(.power-meter--vertical) {
    padding: 0.65rem 0.85rem;
  }

  .power-meter:not(.power-meter--vertical) .power-meter__label {
    font-size: 0.72rem;
    margin-bottom: 0.35rem;
  }

  .power-meter:not(.power-meter--vertical) .power-meter__track {
    height: 28px;
  }

  .power-meter:not(.power-meter--vertical) .power-meter__points {
    font-size: 1.45rem;
    margin-top: 0.35rem;
  }
}

@media (max-width: 480px) {
  .power-meter:not(.power-meter--vertical) .power-meter__points {
    font-size: 1.25rem;
  }
}

.power-meter--vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 0.5rem;
  max-width: 5.5rem;
  min-height: 0;
}

.power-meter--vertical .power-meter__label {
  margin: 0 0 0.4rem 0;
  font-size: 0.58rem;
  line-height: 1.15;
  text-align: center;
  letter-spacing: 0.04em;
  max-width: 4.5rem;
}

.power-meter--vertical .power-meter__track {
  width: 34px;
  height: clamp(120px, 32vh, 200px);
  margin: 0 auto;
}

.power-meter--vertical .power-meter__fill {
  transition: height 0.05s linear, background-color 0.05s linear;
}

.power-meter--vertical .power-meter__marker {
  transition: bottom 0.05s linear;
}

.power-meter--vertical .power-meter__points {
  margin: 0.4rem 0 0 0;
  font-size: 1.15rem;
}
</style>

<template>
  <div class="app">
    <div class="casino-machine-glow" aria-hidden="true">
      <span
        v-for="patch in machineGlowPatches"
        :key="patch.classSuffix"
        class="casino-machine-glow__blob"
        :class="`casino-machine-glow__blob--${patch.classSuffix}`"
        :style="{
          '--glow-delay': patch.delay,
          '--glow-duration': patch.duration,
        }"
      />
    </div>
    <div class="app__content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
const machineGlowPatches = [
  { classSuffix: 'l1', delay: '0s', duration: '7.2s' },
  { classSuffix: 'l2', delay: '0.9s', duration: '8.6s' },
  { classSuffix: 'l3', delay: '1.6s', duration: '6.4s' },
  { classSuffix: 'l4', delay: '2.4s', duration: '7.8s' },
  { classSuffix: 'r1', delay: '0.45s', duration: '7.5s' },
  { classSuffix: 'r2', delay: '1.2s', duration: '8.1s' },
  { classSuffix: 'r3', delay: '2s', duration: '6.1s' },
  { classSuffix: 'r4', delay: '2.8s', duration: '7.1s' },
  { classSuffix: 'c1', delay: '0.6s', duration: '10s' },
]
</script>

<style>
* {
  box-sizing: border-box;
}

html, body, #app, .app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  color: #e8e4f0;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  background-image: url('/bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

@keyframes page-ninety-shake {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  12% {
    transform: translate3d(-5px, 3px, 0) rotate(-0.4deg);
  }
  24% {
    transform: translate3d(5px, -3px, 0) rotate(0.35deg);
  }
  36% {
    transform: translate3d(-4px, -2px, 0) rotate(-0.25deg);
  }
  48% {
    transform: translate3d(4px, 2px, 0) rotate(0.2deg);
  }
  60% {
    transform: translate3d(-3px, 1px, 0);
  }
  72% {
    transform: translate3d(2px, -1px, 0);
  }
  84% {
    transform: translate3d(-1px, 0, 0);
  }
}

body.page-ninety-shake {
  animation: page-ninety-shake 1.85s ease-out both;
}

.app {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  --neon-green: #00ff88;
  --neon-pink: #ff2d92;
  --neon-yellow: #ffeb3b;
  --neon-cyan: #00e5ff;
  --carnival-purple: #4a1a6b;
  --carnival-dark: #1a0a24;
}

.app__content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.casino-machine-glow {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.casino-machine-glow__blob {
  position: absolute;
  width: min(24vw, 200px);
  height: min(40vh, 330px);
  border-radius: 50%;
  filter: blur(30px);
  mix-blend-mode: plus-lighter;
  opacity: 0.4;
  animation-timing-function: cubic-bezier(0.42, 0, 0.58, 1);
  animation-iteration-count: infinite;
  animation-delay: var(--glow-delay, 0s);
  animation-duration: var(--glow-duration, 7.5s);
}

.casino-machine-glow__blob--l1 {
  left: 2%;
  top: 14%;
  background: radial-gradient(
    ellipse 80% 90% at 40% 45%,
    rgba(255, 100, 200, 0.62),
    rgba(60, 240, 255, 0.3) 55%,
    transparent 72%
  );
  animation-name: casino-neon-flicker-a;
}

.casino-machine-glow__blob--l2 {
  left: 6%;
  top: 38%;
  width: min(20vw, 170px);
  height: min(34vh, 295px);
  background: radial-gradient(
    ellipse 75% 85% at 50% 50%,
    rgba(255, 230, 140, 0.55),
    rgba(255, 80, 180, 0.34) 50%,
    transparent 70%
  );
  animation-name: casino-neon-flicker-b;
}

.casino-machine-glow__blob--l3 {
  left: 1%;
  top: 58%;
  width: min(22vw, 185px);
  background: radial-gradient(
    ellipse 85% 80% at 35% 55%,
    rgba(40, 255, 230, 0.52),
    rgba(200, 130, 255, 0.3) 58%,
    transparent 74%
  );
  animation-name: casino-neon-flicker-c;
}

.casino-machine-glow__blob--l4 {
  left: 10%;
  top: 78%;
  width: min(18vw, 150px);
  height: min(30vh, 245px);
  background: radial-gradient(
    ellipse 70% 75% at 50% 40%,
    rgba(255, 160, 110, 0.58),
    rgba(255, 70, 160, 0.34) 52%,
    transparent 68%
  );
  animation-name: casino-neon-flicker-d;
}

.casino-machine-glow__blob--r1 {
  right: 2%;
  top: 14%;
  background: radial-gradient(
    ellipse 80% 90% at 60% 45%,
    rgba(255, 110, 210, 0.6),
    rgba(100, 220, 255, 0.32) 54%,
    transparent 72%
  );
  animation-name: casino-neon-flicker-b;
}

.casino-machine-glow__blob--r2 {
  right: 6%;
  top: 38%;
  width: min(20vw, 170px);
  height: min(34vh, 295px);
  background: radial-gradient(
    ellipse 75% 85% at 50% 50%,
    rgba(255, 220, 120, 0.54),
    rgba(255, 100, 200, 0.34) 50%,
    transparent 70%
  );
  animation-name: casino-neon-flicker-a;
}

.casino-machine-glow__blob--r3 {
  right: 1%;
  top: 58%;
  width: min(22vw, 185px);
  background: radial-gradient(
    ellipse 85% 80% at 65% 55%,
    rgba(50, 255, 220, 0.5),
    rgba(210, 140, 255, 0.32) 58%,
    transparent 74%
  );
  animation-name: casino-neon-flicker-d;
}

.casino-machine-glow__blob--r4 {
  right: 10%;
  top: 78%;
  width: min(18vw, 150px);
  height: min(30vh, 245px);
  background: radial-gradient(
    ellipse 70% 75% at 50% 40%,
    rgba(255, 150, 100, 0.56),
    rgba(255, 80, 170, 0.34) 52%,
    transparent 68%
  );
  animation-name: casino-neon-flicker-c;
}

.casino-machine-glow__blob--c1 {
  left: 50%;
  top: 8%;
  width: min(36vw, 290px);
  height: min(22vh, 210px);
  margin-left: min(-18vw, -145px);
  filter: blur(38px);
  background: radial-gradient(
    ellipse 100% 100% at 50% 100%,
    rgba(255, 240, 190, 0.22),
    rgba(255, 200, 230, 0.14) 45%,
    transparent 65%
  );
  mix-blend-mode: screen;
  animation-name: casino-neon-flicker-soft;
}

@keyframes casino-neon-flicker-a {
  0%,
  100% {
    opacity: 0.28;
    transform: scale(0.98) translate(0, 0);
  }
  25% {
    opacity: 0.48;
    transform: scale(1.02) translate(1px, -0.5px);
  }
  50% {
    opacity: 0.62;
    transform: scale(1.035) translate(-0.5px, 1px);
  }
  75% {
    opacity: 0.4;
    transform: scale(1.01) translate(0.5px, 0.5px);
  }
}

@keyframes casino-neon-flicker-b {
  0%,
  100% {
    opacity: 0.24;
    transform: scale(0.99) translate(0, 0);
  }
  25% {
    opacity: 0.44;
    transform: scale(1.025) translate(-1px, 0.5px);
  }
  50% {
    opacity: 0.58;
    transform: scale(1.04) translate(0.5px, -0.5px);
  }
  75% {
    opacity: 0.36;
    transform: scale(1.015) translate(0, 1px);
  }
}

@keyframes casino-neon-flicker-c {
  0%,
  100% {
    opacity: 0.26;
    transform: scale(1) translate(0, 0);
  }
  25% {
    opacity: 0.52;
    transform: scale(1.03) translate(0.5px, 1px);
  }
  50% {
    opacity: 0.64;
    transform: scale(1.02) translate(-1px, 0);
  }
  75% {
    opacity: 0.38;
    transform: scale(0.995) translate(0.5px, -0.5px);
  }
}

@keyframes casino-neon-flicker-d {
  0%,
  100% {
    opacity: 0.25;
    transform: scale(0.985) translate(0, 0);
  }
  25% {
    opacity: 0.46;
    transform: scale(1.02) translate(0, -1px);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.045) translate(1px, 0.5px);
  }
  75% {
    opacity: 0.34;
    transform: scale(1.01) translate(-0.5px, 0.5px);
  }
}

@keyframes casino-neon-flicker-soft {
  0%,
  100% {
    opacity: 0.14;
  }
  33% {
    opacity: 0.22;
  }
  66% {
    opacity: 0.28;
  }
}

@media (max-width: 480px) {
  .casino-machine-glow__blob {
    filter: blur(22px);
  }
}
</style>

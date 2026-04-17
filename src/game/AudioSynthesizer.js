/**
 * Creates a white-noise buffer of the given duration.
 */
function createNoiseBuffer(audioContext, durationSeconds) {
  const bufferSize = Math.floor(audioContext.sampleRate * durationSeconds)
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
  const samples = buffer.getChannelData(0)
  for (let sampleIndex = 0; sampleIndex < bufferSize; sampleIndex++) {
    samples[sampleIndex] = Math.random() * 2 - 1
  }
  return buffer
}

/**
 * Plays a single oscillator envelope layer and auto-stops it.
 */
function playOscillatorLayer(audioContext, destination, {
  type, startFrequencyHz, endFrequencyHz, peakGain, decaySeconds, delaySeconds = 0,
}) {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(startFrequencyHz, audioContext.currentTime + delaySeconds)
  if (endFrequencyHz) {
    oscillator.frequency.exponentialRampToValueAtTime(
      endFrequencyHz,
      audioContext.currentTime + delaySeconds + decaySeconds,
    )
  }
  gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  gainNode.gain.setValueAtTime(peakGain, audioContext.currentTime + delaySeconds)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + delaySeconds + decaySeconds)
  oscillator.connect(gainNode)
  gainNode.connect(destination)
  oscillator.start(audioContext.currentTime + delaySeconds)
  oscillator.stop(audioContext.currentTime + delaySeconds + decaySeconds)
}

/**
 * Synthesizes a loud hammer smash with:
 * - Heavy low-end thud (sine sweep)
 * - Thunder rumble (low sawtooth noise burst)
 * - Breaking/crack layer (filtered noise with mid-frequency snap)
 * - High-end shard shatter (high-pass noise tail)
 */
export function playSmashSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const masterGain = audioContext.createGain()
  masterGain.gain.value = 1.3
  masterGain.connect(audioContext.destination)

  // Layer 1: Heavy thud — deep sine sweep from 180Hz down to 28Hz
  playOscillatorLayer(audioContext, masterGain, {
    type: 'sine',
    startFrequencyHz: 180,
    endFrequencyHz: 28,
    peakGain: 1.0,
    decaySeconds: 0.35,
  })

  // Layer 2: Thunder sub-rumble — sawtooth sweep for the big boom
  playOscillatorLayer(audioContext, masterGain, {
    type: 'sawtooth',
    startFrequencyHz: 80,
    endFrequencyHz: 22,
    peakGain: 0.55,
    decaySeconds: 0.5,
  })

  // Layer 3: Thunder tail — low triangle sustain that fades out slowly
  playOscillatorLayer(audioContext, masterGain, {
    type: 'triangle',
    startFrequencyHz: 55,
    endFrequencyHz: 30,
    peakGain: 0.4,
    decaySeconds: 0.8,
    delaySeconds: 0.05,
  })

  // Layer 4: Breaking crack — broad noise burst filtered to a mid-frequency snap
  const crackBuffer = createNoiseBuffer(audioContext, 0.12)
  const crackSource = audioContext.createBufferSource()
  crackSource.buffer = crackBuffer
  const crackBandpass = audioContext.createBiquadFilter()
  crackBandpass.type = 'bandpass'
  crackBandpass.frequency.value = 1800
  crackBandpass.Q.value = 1.2
  const crackGain = audioContext.createGain()
  crackGain.gain.setValueAtTime(0.85, audioContext.currentTime)
  crackGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.12)
  crackSource.connect(crackBandpass)
  crackBandpass.connect(crackGain)
  crackGain.connect(masterGain)
  crackSource.start(audioContext.currentTime)

  // Layer 5: Shard shatter — high-pass noise tail (glass/wood splinter texture)
  const shatterBuffer = createNoiseBuffer(audioContext, 0.4)
  const shatterSource = audioContext.createBufferSource()
  shatterSource.buffer = shatterBuffer
  const shatterHighpass = audioContext.createBiquadFilter()
  shatterHighpass.type = 'highpass'
  shatterHighpass.frequency.value = 3500
  const shatterGain = audioContext.createGain()
  shatterGain.gain.setValueAtTime(0.5, audioContext.currentTime + 0.04)
  shatterGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4)
  shatterSource.connect(shatterHighpass)
  shatterHighpass.connect(shatterGain)
  shatterGain.connect(masterGain)
  shatterSource.start(audioContext.currentTime + 0.04)

  // Layer 6: Thunder rumble noise — deep filtered noise that decays slowly
  const thunderBuffer = createNoiseBuffer(audioContext, 1.2)
  const thunderSource = audioContext.createBufferSource()
  thunderSource.buffer = thunderBuffer
  const thunderLowpass = audioContext.createBiquadFilter()
  thunderLowpass.type = 'lowpass'
  thunderLowpass.frequency.value = 180
  const thunderGain = audioContext.createGain()
  thunderGain.gain.setValueAtTime(0.7, audioContext.currentTime + 0.02)
  thunderGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.2)
  thunderSource.connect(thunderLowpass)
  thunderLowpass.connect(thunderGain)
  thunderGain.connect(masterGain)
  thunderSource.start(audioContext.currentTime + 0.02)
}

let tekhenSlashAudioContext = null
let backgroundAmbienceAudioContext = null

/**
 * Creates the Tekhen slash AudioContext and resumes it. Must run from a user
 * gesture (e.g. pointerdown) so the browser allows playback.
 */
export function resumeTekhenSlashAudioContext() {
  if (!tekhenSlashAudioContext) {
    tekhenSlashAudioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (tekhenSlashAudioContext.state === 'suspended') {
    return tekhenSlashAudioContext.resume()
  }
  return Promise.resolve()
}

/**
 * Resumes the casino ambience AudioContext (same autoplay rules as Tekhen).
 */
export function resumeBackgroundAmbienceAudioContext() {
  if (!backgroundAmbienceAudioContext) {
    return Promise.resolve()
  }
  if (backgroundAmbienceAudioContext.state === 'suspended') {
    return backgroundAmbienceAudioContext.resume()
  }
  return Promise.resolve()
}

/**
 * Resumes every game Web Audio context in one call so a single user gesture
 * unlocks Tekhen slash and background ambience together.
 */
export function resumeAllGameAudio() {
  return Promise.all([
    resumeTekhenSlashAudioContext(),
    resumeBackgroundAmbienceAudioContext(),
  ]).then(() => undefined)
}

/**
 * Heavy "kapow" slash + thunder clap for Tekhen: rumble, echo boom, sub punch,
 * whoosh, crack, metallic tail, lightning snap, sword-clash grit.
 * If the AudioContext is not running (autoplay policy), schedules resume and returns
 * without blocking so the timer loop does not queue suspended awaits.
 */
export function playTekhenSlashSound() {
  if (!tekhenSlashAudioContext) {
    tekhenSlashAudioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  const audioContext = tekhenSlashAudioContext
  if (audioContext.state !== 'running') {
    void audioContext.resume()
    return
  }

  const masterGain = audioContext.createGain()
  masterGain.gain.value = 0.58
  masterGain.connect(audioContext.destination)

  // ── Thunder clap (runs with slash: rumble + crack + delayed boom) ────────
  const thunderRumbleBuffer = createNoiseBuffer(audioContext, 1.15)
  const thunderRumbleSource = audioContext.createBufferSource()
  thunderRumbleSource.buffer = thunderRumbleBuffer
  const thunderRumbleLowpass = audioContext.createBiquadFilter()
  thunderRumbleLowpass.type = 'lowpass'
  thunderRumbleLowpass.frequency.setValueAtTime(280, audioContext.currentTime + 0.02)
  thunderRumbleLowpass.frequency.exponentialRampToValueAtTime(48, audioContext.currentTime + 0.9)
  const thunderRumbleGain = audioContext.createGain()
  thunderRumbleGain.gain.setValueAtTime(0, audioContext.currentTime)
  thunderRumbleGain.gain.linearRampToValueAtTime(0.68, audioContext.currentTime + 0.028)
  thunderRumbleGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.12)
  thunderRumbleSource.connect(thunderRumbleLowpass)
  thunderRumbleLowpass.connect(thunderRumbleGain)
  thunderRumbleGain.connect(masterGain)
  thunderRumbleSource.start(audioContext.currentTime + 0.018)

  const thunderCrackBuffer = createNoiseBuffer(audioContext, 0.14)
  const thunderCrackSource = audioContext.createBufferSource()
  thunderCrackSource.buffer = thunderCrackBuffer
  const thunderCrackBandpass = audioContext.createBiquadFilter()
  thunderCrackBandpass.type = 'bandpass'
  thunderCrackBandpass.frequency.setValueAtTime(420, audioContext.currentTime + 0.02)
  thunderCrackBandpass.frequency.exponentialRampToValueAtTime(120, audioContext.currentTime + 0.1)
  thunderCrackBandpass.Q.value = 0.9
  const thunderCrackGain = audioContext.createGain()
  thunderCrackGain.gain.setValueAtTime(0.58, audioContext.currentTime + 0.022)
  thunderCrackGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.13)
  thunderCrackSource.connect(thunderCrackBandpass)
  thunderCrackBandpass.connect(thunderCrackGain)
  thunderCrackGain.connect(masterGain)
  thunderCrackSource.start(audioContext.currentTime + 0.022)

  const lightningSnapBuffer = createNoiseBuffer(audioContext, 0.048)
  const lightningSnapSource = audioContext.createBufferSource()
  lightningSnapSource.buffer = lightningSnapBuffer
  const lightningSnapBandpass = audioContext.createBiquadFilter()
  lightningSnapBandpass.type = 'bandpass'
  lightningSnapBandpass.frequency.setValueAtTime(9600, audioContext.currentTime + 0.004)
  lightningSnapBandpass.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.04)
  lightningSnapBandpass.Q.value = 2.4
  const lightningSnapGain = audioContext.createGain()
  lightningSnapGain.gain.setValueAtTime(0.46, audioContext.currentTime + 0.006)
  lightningSnapGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.046)
  lightningSnapSource.connect(lightningSnapBandpass)
  lightningSnapBandpass.connect(lightningSnapGain)
  lightningSnapGain.connect(masterGain)
  lightningSnapSource.start(audioContext.currentTime + 0.005)

  playOscillatorLayer(audioContext, masterGain, {
    type: 'sine',
    startFrequencyHz: 78,
    endFrequencyHz: 26,
    peakGain: 0.58,
    decaySeconds: 0.42,
    delaySeconds: 0.024,
  })

  const thunderEchoBuffer = createNoiseBuffer(audioContext, 0.62)
  const thunderEchoSource = audioContext.createBufferSource()
  thunderEchoSource.buffer = thunderEchoBuffer
  const thunderEchoLowpass = audioContext.createBiquadFilter()
  thunderEchoLowpass.type = 'lowpass'
  thunderEchoLowpass.frequency.value = 160
  const thunderEchoGain = audioContext.createGain()
  thunderEchoGain.gain.setValueAtTime(0, audioContext.currentTime + 0.085)
  thunderEchoGain.gain.linearRampToValueAtTime(0.42, audioContext.currentTime + 0.12)
  thunderEchoGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.68)
  thunderEchoSource.connect(thunderEchoLowpass)
  thunderEchoLowpass.connect(thunderEchoGain)
  thunderEchoGain.connect(masterGain)
  thunderEchoSource.start(audioContext.currentTime + 0.085)

  // ── "Kapow" body: deep sub punch (comic-book / heavy hit) ───────────────
  playOscillatorLayer(audioContext, masterGain, {
    type: 'sine',
    startFrequencyHz: 165,
    endFrequencyHz: 32,
    peakGain: 0.88,
    decaySeconds: 0.16,
  })

  playOscillatorLayer(audioContext, masterGain, {
    type: 'sine',
    startFrequencyHz: 95,
    endFrequencyHz: 42,
    peakGain: 0.62,
    decaySeconds: 0.12,
    delaySeconds: 0.006,
  })

  // Mid-weight slam (sawtooth adds grit)
  playOscillatorLayer(audioContext, masterGain, {
    type: 'sawtooth',
    startFrequencyHz: 220,
    endFrequencyHz: 58,
    peakGain: 0.38,
    decaySeconds: 0.1,
    delaySeconds: 0.004,
  })

  playOscillatorLayer(audioContext, masterGain, {
    type: 'square',
    startFrequencyHz: 195,
    endFrequencyHz: 58,
    peakGain: 0.24,
    decaySeconds: 0.082,
    delaySeconds: 0.01,
  })

  playOscillatorLayer(audioContext, masterGain, {
    type: 'square',
    startFrequencyHz: 920,
    endFrequencyHz: 205,
    peakGain: 0.16,
    decaySeconds: 0.058,
    delaySeconds: 0.019,
  })

  // Powerful slash whoosh: wide noise sweep (blade + air mass)
  const whooshBuffer = createNoiseBuffer(audioContext, 0.22)
  const whooshSource = audioContext.createBufferSource()
  whooshSource.buffer = whooshBuffer
  const whooshBandpass = audioContext.createBiquadFilter()
  whooshBandpass.type = 'bandpass'
  whooshBandpass.frequency.setValueAtTime(5200, audioContext.currentTime)
  whooshBandpass.frequency.exponentialRampToValueAtTime(380, audioContext.currentTime + 0.16)
  whooshBandpass.Q.value = 1.85
  const whooshGain = audioContext.createGain()
  whooshGain.gain.setValueAtTime(0.72, audioContext.currentTime)
  whooshGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2)
  whooshSource.connect(whooshBandpass)
  whooshBandpass.connect(whooshGain)
  whooshGain.connect(masterGain)
  whooshSource.start()

  // Second whoosh layer: lower band for "oomph"
  const whooshLowBuffer = createNoiseBuffer(audioContext, 0.18)
  const whooshLowSource = audioContext.createBufferSource()
  whooshLowSource.buffer = whooshLowBuffer
  const whooshLowpass = audioContext.createBiquadFilter()
  whooshLowpass.type = 'lowpass'
  whooshLowpass.frequency.setValueAtTime(900, audioContext.currentTime)
  whooshLowpass.frequency.exponentialRampToValueAtTime(140, audioContext.currentTime + 0.14)
  const whooshLowGain = audioContext.createGain()
  whooshLowGain.gain.setValueAtTime(0.48, audioContext.currentTime + 0.008)
  whooshLowGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.17)
  whooshLowSource.connect(whooshLowpass)
  whooshLowpass.connect(whooshLowGain)
  whooshLowGain.connect(masterGain)
  whooshLowSource.start(audioContext.currentTime + 0.008)

  // Instant crack / transient (the "POW" edge)
  const crackBuffer = createNoiseBuffer(audioContext, 0.035)
  const crackSource = audioContext.createBufferSource()
  crackSource.buffer = crackBuffer
  const crackBandpass = audioContext.createBiquadFilter()
  crackBandpass.type = 'bandpass'
  crackBandpass.frequency.value = 2800
  crackBandpass.Q.value = 4.5
  const crackGain = audioContext.createGain()
  crackGain.gain.setValueAtTime(0.75, audioContext.currentTime)
  crackGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.032)
  crackSource.connect(crackBandpass)
  crackBandpass.connect(crackGain)
  crackGain.connect(masterGain)
  crackSource.start()

  // Mid snap (impact meat)
  const snapBuffer = createNoiseBuffer(audioContext, 0.065)
  const snapSource = audioContext.createBufferSource()
  snapSource.buffer = snapBuffer
  const snapBandpass = audioContext.createBiquadFilter()
  snapBandpass.type = 'bandpass'
  snapBandpass.frequency.value = 1400
  snapBandpass.Q.value = 2.8
  const snapGain = audioContext.createGain()
  snapGain.gain.setValueAtTime(0.55, audioContext.currentTime + 0.01)
  snapGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.06)
  snapSource.connect(snapBandpass)
  snapBandpass.connect(snapGain)
  snapGain.connect(masterGain)
  snapSource.start(audioContext.currentTime + 0.01)

  // Bright metallic slash zing
  playOscillatorLayer(audioContext, masterGain, {
    type: 'triangle',
    startFrequencyHz: 5200,
    endFrequencyHz: 480,
    peakGain: 0.32,
    decaySeconds: 0.09,
  })

  playOscillatorLayer(audioContext, masterGain, {
    type: 'triangle',
    startFrequencyHz: 260,
    endFrequencyHz: 95,
    peakGain: 0.18,
    decaySeconds: 0.048,
    delaySeconds: 0.002,
  })

  // High air / spark tail
  const edgeBuffer = createNoiseBuffer(audioContext, 0.12)
  const edgeSource = audioContext.createBufferSource()
  edgeSource.buffer = edgeBuffer
  const edgeHighpass = audioContext.createBiquadFilter()
  edgeHighpass.type = 'highpass'
  edgeHighpass.frequency.value = 4200
  const edgeGain = audioContext.createGain()
  edgeGain.gain.setValueAtTime(0.28, audioContext.currentTime + 0.018)
  edgeGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.11)
  edgeSource.connect(edgeHighpass)
  edgeHighpass.connect(edgeGain)
  edgeGain.connect(masterGain)
  edgeSource.start(audioContext.currentTime + 0.018)
}

/**
 * Plays a short melodic chime ping at the given frequency.
 * Used for the slot-machine coin and win-jingle layers.
 */
function playCasinoChime(audioContext, destination, frequencyHz, delaySeconds, peakGain = 0.3) {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = frequencyHz
  gainNode.gain.setValueAtTime(0, audioContext.currentTime + delaySeconds)
  gainNode.gain.linearRampToValueAtTime(peakGain, audioContext.currentTime + delaySeconds + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + delaySeconds + 0.5)
  oscillator.connect(gainNode)
  gainNode.connect(destination)
  oscillator.start(audioContext.currentTime + delaySeconds)
  oscillator.stop(audioContext.currentTime + delaySeconds + 0.55)
}

/**
 * Starts a casino-style ambient soundscape:
 * - Slot machine win-jingle melody loop
 * - Coin clink sparkles
 * - Card shuffle hiss bursts
 * - Warm casino floor crowd bed
 * - Brass-style rhythmic pulse (like big-band casino music)
 *
 * Volume is 40% louder than the previous carnival ambience (master 0.078 → 0.109).
 * Returns a stop function.
 */
export function startBackgroundAmbience() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  backgroundAmbienceAudioContext = audioContext
  const masterGain = audioContext.createGain()
  masterGain.gain.value = 0.0
  masterGain.connect(audioContext.destination)

  // Fade in over 1.5s
  masterGain.gain.linearRampToValueAtTime(0.109, audioContext.currentTime + 1.5)

  const timeoutIds = []

  // ── Slot-machine win melody loop ──────────────────────────────────────────
  // Classic ascending arpeggio: C5 E5 G5 C6 (major triad, repeating)
  const slotMelodyNotes = [523, 659, 784, 1047]
  const slotMelodyIntervalMs = 2800

  function scheduleSlotMelody() {
    slotMelodyNotes.forEach((frequencyHz, noteIndex) => {
      playCasinoChime(audioContext, masterGain, frequencyHz, noteIndex * 0.18, 0.35)
    })
    // Add a small bonus trill at the end of each cycle
    playCasinoChime(audioContext, masterGain, 1319, slotMelodyNotes.length * 0.18 + 0.1, 0.2)
    playCasinoChime(audioContext, masterGain, 1047, slotMelodyNotes.length * 0.18 + 0.22, 0.15)

    const loopId = setTimeout(() => {
      if (audioContext.state === 'closed') return
      scheduleSlotMelody()
    }, slotMelodyIntervalMs)
    timeoutIds.push(loopId)
  }
  scheduleSlotMelody()

  // ── Coin clink sparkles ───────────────────────────────────────────────────
  // Random high metallic pings simulating coins dropping
  function scheduleNextCoinClink() {
    const delayMs = 300 + Math.random() * 900
    const clinkId = setTimeout(() => {
      if (audioContext.state === 'closed') return
      const coinFrequencyHz = 2200 + Math.random() * 1800
      playCasinoChime(audioContext, masterGain, coinFrequencyHz, 0, 0.18)
      // Double-clink for realism
      if (Math.random() > 0.4) {
        playCasinoChime(audioContext, masterGain, coinFrequencyHz * 1.08, 0.05, 0.12)
      }
      scheduleNextCoinClink()
    }, delayMs)
    timeoutIds.push(clinkId)
  }
  scheduleNextCoinClink()

  // ── Card shuffle hiss bursts ──────────────────────────────────────────────
  // Short bandpass noise bursts that mimic the sound of shuffling cards
  function scheduleNextCardShuffle() {
    const delayMs = 2000 + Math.random() * 3000
    const shuffleId = setTimeout(() => {
      if (audioContext.state === 'closed') return
      const shuffleBuffer = createNoiseBuffer(audioContext, 0.25)
      const shuffleSource = audioContext.createBufferSource()
      shuffleSource.buffer = shuffleBuffer
      const shuffleBandpass = audioContext.createBiquadFilter()
      shuffleBandpass.type = 'bandpass'
      shuffleBandpass.frequency.value = 1200 + Math.random() * 600
      shuffleBandpass.Q.value = 2.5
      const shuffleGain = audioContext.createGain()
      shuffleGain.gain.setValueAtTime(0.28, audioContext.currentTime)
      shuffleGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25)
      shuffleSource.connect(shuffleBandpass)
      shuffleBandpass.connect(shuffleGain)
      shuffleGain.connect(masterGain)
      shuffleSource.start()
      scheduleNextCardShuffle()
    }, delayMs)
    timeoutIds.push(shuffleId)
  }
  scheduleNextCardShuffle()

  // ── Warm casino floor crowd bed ───────────────────────────────────────────
  const crowdNoiseBuffer = createNoiseBuffer(audioContext, 4)
  const crowdNoiseSource = audioContext.createBufferSource()
  crowdNoiseSource.buffer = crowdNoiseBuffer
  crowdNoiseSource.loop = true
  const crowdLowpass = audioContext.createBiquadFilter()
  crowdLowpass.type = 'lowpass'
  crowdLowpass.frequency.value = 600
  const crowdGain = audioContext.createGain()
  crowdGain.gain.value = 0.14
  crowdNoiseSource.connect(crowdLowpass)
  crowdLowpass.connect(crowdGain)
  crowdGain.connect(masterGain)
  crowdNoiseSource.start()

  // ── Brass-style rhythmic pulse (big-band casino floor feel) ───────────────
  // Two oscillators detuned slightly for a fat brass chord effect
  const brassFrequencies = [
    { frequencyHz: 220, detuneHz: 2, gainLevel: 0.22 },
    { frequencyHz: 277, detuneHz: -2, gainLevel: 0.16 },
    { frequencyHz: 330, detuneHz: 1.5, gainLevel: 0.12 },
  ]
  const brassOscillators = brassFrequencies.map(({ frequencyHz, detuneHz, gainLevel }) => {
    const oscillator = audioContext.createOscillator()
    const partialGain = audioContext.createGain()
    oscillator.type = 'sawtooth'
    oscillator.frequency.value = frequencyHz + detuneHz
    partialGain.gain.value = gainLevel

    // Tremolo at 3.2 Hz for that big-band staccato rhythm
    const tremoloOscillator = audioContext.createOscillator()
    const tremoloGain = audioContext.createGain()
    tremoloOscillator.frequency.value = 3.2
    tremoloGain.gain.value = gainLevel * 0.7
    tremoloOscillator.connect(tremoloGain)
    tremoloGain.connect(partialGain.gain)
    tremoloOscillator.start()

    // Lowpass to round off the harsh sawtooth edge
    const brassFilter = audioContext.createBiquadFilter()
    brassFilter.type = 'lowpass'
    brassFilter.frequency.value = 800

    oscillator.connect(brassFilter)
    brassFilter.connect(partialGain)
    partialGain.connect(masterGain)
    oscillator.start()

    return { oscillator, tremoloOscillator }
  })

  return function stopBackgroundAmbience() {
    timeoutIds.forEach((id) => clearTimeout(id))
    masterGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1)
    setTimeout(() => {
      brassOscillators.forEach(({ oscillator, tremoloOscillator }) => {
        oscillator.stop()
        tremoloOscillator.stop()
      })
      crowdNoiseSource.stop()
      audioContext.close()
      backgroundAmbienceAudioContext = null
    }, 1100)
  }
}

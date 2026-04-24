import { Scene } from 'phaser'
import { emit, on, off } from '../EventBus'
import { impactStrengthToPowerPoints, formatScoreCompact } from '../../utils/scorePower.js'

const TOWER_WIDTH = 56
const TOWER_HEIGHT = 360
const BELL_Y_OFFSET = 44
const BASE_Y_OFFSET = 300
const PUCK_WIDTH = 72
const PUCK_HEIGHT = 96
const TOWER_COLOR = 0xe85c2b
const BASE_RED = 0xc62828
const BASE_GOLD = 0xffb300
const BELL_GOLD = 0xffc107
const BELL_LIGHT_RED = 0xf44336
const PUCK_TRAVEL_DURATION = 600

export default class MainScene extends Scene {
  constructor() {
    super({ key: 'MainScene' })
  }

  preload() {
    this.load.image('puck', './puck.png')
  }

  create() {
    const centerX = this.scale.width / 2
    const towerX = centerX
    const groundY = this.scale.height - 50

    this.towerBaseY = groundY - BASE_Y_OFFSET
    this.bellY = groundY - TOWER_HEIGHT - BELL_Y_OFFSET
    this.puckStartY = groundY
    this.puckTravelTop = this.bellY + 30

    const towerGraphics = this.add.graphics()
    towerGraphics.fillStyle(TOWER_COLOR, 1)
    towerGraphics.fillRoundedRect(towerX - TOWER_WIDTH / 2, groundY - TOWER_HEIGHT, TOWER_WIDTH, TOWER_HEIGHT, 6)
    towerGraphics.lineStyle(2, 0x1a1a1a)
    for (let row = 1; row <= 7; row++) {
      const y = groundY - TOWER_HEIGHT + (TOWER_HEIGHT * row) / 8
      towerGraphics.lineBetween(towerX - TOWER_WIDTH / 2, y, towerX + TOWER_WIDTH / 2, y)
    }

    const scoreLevels = [
      { y: 0.78, strength: 0.25 },
      { y: 0.56, strength: 0.5 },
      { y: 0.34, strength: 0.75 },
      { y: 0.12, strength: 0.9 },
    ]
    scoreLevels.forEach(({ y, strength }) => {
      const powerPoints = impactStrengthToPowerPoints(strength)
      const score = formatScoreCompact(powerPoints)
      const signY = groundY - TOWER_HEIGHT + TOWER_HEIGHT * y
      const signGraphics = this.add.graphics()
      signGraphics.fillStyle(0x2a2a2a, 1)
      signGraphics.fillRoundedRect(towerX - TOWER_WIDTH / 2 - 33, signY - 15, 46, 32, 4)
      signGraphics.lineStyle(2, 0xc62828)
      signGraphics.strokeRoundedRect(towerX - TOWER_WIDTH / 2 - 33, signY - 15, 46, 32, 4)
      const flame = this.add.graphics()
      flame.fillStyle(0xff9800, 1)
      flame.fillTriangle(
        towerX - TOWER_WIDTH / 2 - 10, signY - 14,
        towerX - TOWER_WIDTH / 2 - 2, signY - 22,
        towerX - TOWER_WIDTH / 2 + 6, signY - 14
      )
      const scoreText = this.add.text(towerX - TOWER_WIDTH / 2 - 10, signY - 6, String(score), {
        fontFamily: 'sans-serif',
        fontSize: 14,
        color: '#ffeb3b',
        fontStyle: 'bold',
      })
      scoreText.setOrigin(0.5, 0.5)
    })

    this.bellGraphics = this.add.graphics()
    this.bellGraphics.fillStyle(BELL_GOLD, 1)
    this.bellGraphics.fillCircle(towerX, this.bellY, 26)
    this.bellGraphics.lineStyle(2, 0xff8f00)
    this.bellGraphics.strokeCircle(towerX, this.bellY, 26)
    const redLight = this.add.graphics()
    redLight.fillStyle(BELL_LIGHT_RED, 1)
    redLight.fillCircle(towerX, this.bellY - 32, 6)
    this.redLight = redLight
    this.lightTween = this.tweens.addCounter({
      from: 0.4,
      to: 1,
      duration: 600,
      yoyo: true,
      repeat: -1,
    })

    const baseGraphics = this.add.graphics()
    const baseY = groundY + 2
    baseGraphics.fillStyle(BASE_RED, 1)
    baseGraphics.fillRoundedRect(towerX - 70, baseY, 140, 28, 6)
    baseGraphics.lineStyle(3, BASE_GOLD)
    baseGraphics.strokeRoundedRect(towerX - 70, baseY, 140, 28, 6)
    const baseLabel = this.add.text(towerX, baseY + 14, 'TEST YOUR STRENGTH', {
      fontFamily: 'sans-serif',
      fontSize: 11,
      color: '#ffffff',
      fontStyle: 'bold',
    })
    baseLabel.setOrigin(0.5, 0.5)
    baseLabel.setStroke('#ff9800', 2)

    this.puck = this.add.image(towerX + 20, this.puckStartY, 'puck')
    this.puck.setDisplaySize(PUCK_WIDTH, PUCK_HEIGHT)
    this.puck.setOrigin(0.5, 0.9)
    this.towerCenterX = towerX
    this.puckMoving = false
    this.bellRang = false
    this._resetTimer = null

    this._strikeHandler = (payload) => this.onStrike(payload)
    this._resetGameHandler = () => this.onResetGame()
    on('strike', this._strikeHandler)
    on('resetGame', this._resetGameHandler)
  }

  onStrike({ impactStrength }) {
    if (this.puckMoving) return
    this.puckMoving = true

    if (this._resetTimer) {
      this._resetTimer.remove(false)
      this._resetTimer = null
    }

    this.tweens.killTweensOf(this.puck)
    this.puck.y = this.puckStartY
    this.showImpactEffect()

    const travelRange = this.puckStartY - this.puckTravelTop
    const targetY = this.puckStartY - impactStrength * travelRange

    this.tweens.add({
      targets: this.puck,
      y: targetY,
      duration: PUCK_TRAVEL_DURATION,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.puckMoving = false
        if (impactStrength >= 0.9) {
          this.triggerCongratulations()
        } else {
          this._resetTimer = this.time.delayedCall(200, () => {
            this._resetTimer = null
            this.resetPuck()
          })
        }
      },
    })
  }

  triggerCongratulations() {
    emit('pageNinetyEffects', {})
    this.shakeBell()
    this.playBellSound()
    this.showBalloons()
    emit('congratulations', {})
    this.time.delayedCall(2500, () => this.resetPuck())
  }

  playBellSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()

    const bellPartials = [
      { frequencyMultiplier: 1.0, gainPeak: 0.6, decaySeconds: 2.5 },
      { frequencyMultiplier: 2.756, gainPeak: 0.4, decaySeconds: 1.8 },
      { frequencyMultiplier: 5.404, gainPeak: 0.25, decaySeconds: 1.2 },
      { frequencyMultiplier: 8.933, gainPeak: 0.15, decaySeconds: 0.8 },
    ]
    const fundamentalHz = 660

    bellPartials.forEach(({ frequencyMultiplier, gainPeak, decaySeconds }) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.value = fundamentalHz * frequencyMultiplier

      gainNode.gain.setValueAtTime(gainPeak, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + decaySeconds)

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + decaySeconds)
    })
  }

  shakeBell() {
    this.tweens.add({
      targets: this.bellGraphics,
      x: -10,
      duration: 80,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.bellGraphics.x = 0
      },
    })
  }

  showBalloons() {
    const leftBalloons = [0xff2d92, 0x00e5ff, 0xffeb3b, 0x00ff88]
    const rightBalloons = [0x00ff88, 0xffeb3b, 0x00e5ff, 0xff2d92]
    const centerX = this.scale.width / 2
    const startY = this.scale.height
    leftBalloons.forEach((color, index) => {
      const balloon = this.add.circle(centerX - 120 - index * 20, startY + 40, 18, color)
      balloon.setStrokeStyle(2, 0xffffff)
      this.tweens.add({
        targets: balloon,
        y: -50,
        x: centerX - 140 - index * 25,
        duration: 2000 + index * 200,
        ease: 'Quad.easeOut',
        delay: index * 80,
        onComplete: () => balloon.destroy(),
      })
    })
    rightBalloons.forEach((color, index) => {
      const balloon = this.add.circle(centerX + 120 + index * 20, startY + 40, 18, color)
      balloon.setStrokeStyle(2, 0xffffff)
      this.tweens.add({
        targets: balloon,
        y: -50,
        x: centerX + 140 + index * 25,
        duration: 2000 + index * 200,
        ease: 'Quad.easeOut',
        delay: index * 80,
        onComplete: () => balloon.destroy(),
      })
    })
  }

  showImpactEffect() {
    const centerX = this.scale.width / 2
    const baseY = this.puckStartY
    const flash = this.add.graphics()
    flash.fillStyle(0xffffff, 0.8)
    flash.fillCircle(centerX, baseY, 20)
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 150,
      onComplete: () => flash.destroy(),
    })
  }

  update() {
    if (this.redLight && this.lightTween) {
      this.redLight.setAlpha(this.lightTween.getValue())
    }
  }

  onResetGame() {
    this.resetPuck()
  }

  resetPuck() {
    if (this._resetTimer) {
      this._resetTimer.remove(false)
      this._resetTimer = null
    }
    this.tweens.killTweensOf(this.puck)
    this.puckMoving = false

    this.tweens.add({
      targets: this.puck,
      y: this.puckStartY,
      duration: 400,
      ease: 'Quad.easeInOut',
    })
  }

  destroy() {
    off('strike', this._strikeHandler)
    off('resetGame', this._resetGameHandler)
    super.destroy()
  }
}

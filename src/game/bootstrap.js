import Phaser from 'phaser'
import MainScene from './scenes/MainScene'

export function createGame(containerElement) {
  const config = {
    type: Phaser.AUTO,
    width: 420,
    height: 560,
    parent: containerElement,
    transparent: true,
    backgroundColor: 0x00000000,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 800 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [MainScene],
  }

  return new Phaser.Game(config)
}

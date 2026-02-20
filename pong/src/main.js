// Phaser.js 游戏入口
import Phaser from 'phaser'
import { GameScene } from './scenes/GameScene.js'

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [GameScene]
}

// 创建游戏实例
const game = new Phaser.Game(config)

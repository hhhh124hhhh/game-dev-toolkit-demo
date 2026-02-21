import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { GAME_CONFIG } from './config.js';

/**
 * 游戏配置
 */
const config = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },

  physics: {
    default: 'arcade',
    arcade: {
      debug: GAME_CONFIG.debug.showPath
    }
  },

  scene: [BootScene, MenuScene, GameScene, UIScene, GameOverScene]
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露到全局用于调试
if (typeof window !== 'undefined') {
  window.game = game;
}

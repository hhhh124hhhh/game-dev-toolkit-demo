/**
 * 3D Platformer 游戏入口
 *
 * CRITICAL: Enable3D 需要异步预加载 ammo.js
 */

import Phaser from 'phaser';
import { enable3d } from '@enable3d/phaser-extension';
import { GAME_CONFIG } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { GameScene3D } from './scenes/GameScene3D.js';
import { GameOverScene } from './scenes/GameOverScene.js';

// CRITICAL: Enable3D 必需的配置
const config = {
  type: Phaser.WEBGL,           // 必须是 WEBGL
  transparent: true,            // CRITICAL: 必须透明！
  // 注意: 不要设置 backgroundColor！
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height
  },
  scene: [BootScene, GameScene3D, GameOverScene],
  physics: {
    default: 'arcade',          // 2D 物理仍然可用
    arcade: {
      debug: GAME_CONFIG.debug
    }
  }
};

// 全局游戏状态
window.gameState = {
  score: 0,
  highScore: parseInt(localStorage.getItem('platformer3d_highscore') || '0'),
  coins: 0
};

// CRITICAL: 预加载 Enable3D 后再启动游戏（需要物理引擎）
window.addEventListener('load', () => {
  enable3d(() => {
    console.log('[Main] Enable3D initialized successfully');
    return new Phaser.Game(config);
  }).withPhysics('/ammo');  // 从本地加载物理引擎（自动查找 ammo.wasm.js）
});

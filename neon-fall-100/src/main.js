/**
 * 霓虹坠落 - 100层挑战
 * Neon Fall 100 - Main Entry
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  parent: 'game-container',
  backgroundColor: GAME_CONFIG.colors.background,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GAME_CONFIG.physics.gravity },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    pixelArt: false,
    antialias: true,
  },
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 全局游戏状态
window.gameState = {
  highScore: parseInt(localStorage.getItem('neonFallHighScore') || '0'),
  totalGames: parseInt(localStorage.getItem('neonFallTotalGames') || '0'),
  achievements: JSON.parse(localStorage.getItem('neonFallAchievements') || '[]'),
  soundEnabled: localStorage.getItem('neonFallSoundEnabled') !== 'false',
  musicEnabled: localStorage.getItem('neonFallMusicEnabled') !== 'false',
};

// 隐藏加载界面
window.addEventListener('load', () => {
  setTimeout(() => {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.classList.add('hidden');
      setTimeout(() => loading.remove(), 500);
    }
  }, 1000);
});

export default game;

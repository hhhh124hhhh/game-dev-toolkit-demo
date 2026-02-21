/**
 * Phaser Game Entry Point
 */

import Phaser from 'phaser';
import { GameConfig } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { IntroScene } from './scenes/IntroScene.js';
import { SettingsScene } from './scenes/SettingsScene.js';
import { GameScene } from './scenes/GameScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

// Game configuration
const config = {
  type: Phaser.AUTO,
  width: GameConfig.width,
  height: GameConfig.height,
  parent: 'game-container',
  backgroundColor: GameConfig.backgroundColor || '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GameConfig.gravity || 0 },
      debug: GameConfig.debug?.showHitboxes || false
    }
  },
  scene: [
    BootScene,
    MenuScene,
    IntroScene,
    SettingsScene,
    GameScene,
    PauseScene,
    GameOverScene
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// Create game instance
const game = new Phaser.Game(config);

// Global game state
window.gameState = {
  score: 0,
  highScore: parseInt(localStorage.getItem('highScore')) || 0,
  musicEnabled: localStorage.getItem('musicEnabled') !== 'false',
  soundEnabled: localStorage.getItem('soundEnabled') !== 'false'
};

// Handle visibility change
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.scene.pause('GameScene');
  } else {
    game.scene.resume('GameScene');
  }
});

export default game;

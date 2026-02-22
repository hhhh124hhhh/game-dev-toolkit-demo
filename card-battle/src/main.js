/**
 * Card Battle Game Entry Point
 * Slay the Spire style card game
 */

import Phaser from 'phaser';
import { GameConfig } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

// Game configuration
const config = {
  type: Phaser.AUTO,
  width: GameConfig.width,
  height: GameConfig.height,
  parent: 'game-container',
  backgroundColor: GameConfig.backgroundColor,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: GameConfig.debug || false
    }
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// Create game instance
const game = new Phaser.Game(config);

// Global game state
window.gameState = {
  playerHealth: 80,
  maxHealth: 100,
  gold: 0,
  floor: 1,
  wins: 0,
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

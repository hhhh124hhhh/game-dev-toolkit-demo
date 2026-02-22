/**
 * 游戏入口
 * 《暗影森林》Shadow Forest
 */

import Phaser from 'phaser';
import { PHASER_CONFIG } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

// 配置场景
const config = {
  ...PHASER_CONFIG,
  scene: [BootScene, MenuScene, GameScene, PauseScene, GameOverScene]
};

// 启动游戏
const game = new Phaser.Game(config);

// 开发模式下暴露到全局
if (import.meta.env.DEV) {
  window.game = game;
}

export default game;

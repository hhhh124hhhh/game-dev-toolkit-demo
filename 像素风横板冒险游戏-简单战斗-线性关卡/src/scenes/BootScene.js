/**
 * Boot Scene - Asset Loading
 *
 * 支持两种模式:
 * 1. 占位符模式 (useRealAssets = false) - 使用 Phaser.Graphics 绘制占位符
 * 2. 真实素材模式 (useRealAssets = true) - 加载生成的素材文件
 */

import Phaser from 'phaser';
import { GameConfig } from '../config.js';
import { PlaceholderFactory } from '../systems/PlaceholderFactory.js';

// 素材模式配置 - 由 asset_replacer.py 自动更新
// 初始为 false (占位符模式)，素材生成后改为 true
const useRealAssets = true; // 启用真实素材模式

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      font: '20px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    const percentText = this.add.text(width / 2, height / 2, '0%', {
      font: '18px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Loading progress
    this.load.on('progress', (value) => {
      percentText.setText(parseInt(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(width / 2 - 160, height / 2 - 10, 320 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // Load assets based on mode
    if (useRealAssets) {
      this.loadRealAssets();
    }
    // 占位符模式不需要预加载
  }

  /**
   * 加载真实素材文件
   */
  loadRealAssets() {
    // Player sprite - 加载动画精灵表
    this.load.spritesheet('player_idle', 'assets/images/player_idle.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet('player_walk', 'assets/images/player_walk.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet('player_jump', 'assets/images/player_jump.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet('player_attack', 'assets/images/player_attack.png', {
      frameWidth: 64,
      frameHeight: 64
    });

    // Enemies
    this.load.image('slime', 'assets/images/slime.png');
    this.load.image('flyer', 'assets/images/flyer.png');
    this.load.image('boss', 'assets/images/boss.png');

    // Platforms
    this.load.image('platform', 'assets/images/platform.png');
    this.load.image('platform_bounce', 'assets/images/platform_bounce.png');
    this.load.image('platform_moving', 'assets/images/platform_moving.png');
    this.load.image('platform_fragile', 'assets/images/platform_fragile.png');
    this.load.image('platform_teleport', 'assets/images/platform_teleport.png');
    this.load.image('platform_ice', 'assets/images/platform_ice.png');
    this.load.image('platform_vanish', 'assets/images/platform_vanish.png');

    // Collectibles
    this.load.image('coin', 'assets/images/coin.png');
    this.load.image('heart', 'assets/images/heart.png');
    this.load.image('powerup_jump', 'assets/images/powerup_jump.png');
    this.load.image('powerup_fly', 'assets/images/powerup_fly.png');
    this.load.image('powerup_shield', 'assets/images/powerup_shield.png');
    this.load.image('powerup_speed', 'assets/images/powerup_speed.png');

    // Background - 使用 bg-far 和 bg-near key 匹配 GameScene
    this.load.image('bg-far', 'assets/images/background.png');
    this.load.image('bg-near', 'assets/images/background.png');

    // Audio - 加载生成的音效
    this.load.audio('jump', 'assets/audio/jump.wav');
    this.load.audio('attack', 'assets/audio/attack.wav');
    this.load.audio('hit', 'assets/audio/hit.wav');
    this.load.audio('coin', 'assets/audio/coin.wav');
    this.load.audio('heal', 'assets/audio/heal.wav');
    this.load.audio('hurt', 'assets/audio/hurt.wav');
    this.load.audio('death', 'assets/audio/death.wav');
    this.load.audio('menu_select', 'assets/audio/menu_select.wav');
  }

  create() {
    // 如果使用占位符模式，生成占位符纹理
    if (!useRealAssets) {
      console.log('[BootScene] Using placeholder mode');
      PlaceholderFactory.createAll(this);
    } else {
      console.log('[BootScene] Using real assets mode');
    }

    // 创建玩家动画（占位符和真实素材都需要）
    this.createPlayerAnimations();

    // Initialize audio system
    this.sound.unlock();

    // Start menu scene
    this.scene.start('MenuScene');
  }

  /**
   * 创建玩家动画
   * 帧率优化: 统一使用12fps使动画更平滑
   */
  createPlayerAnimations() {
    // Idle 动画 - 稍慢一点更自然
    if (this.textures.exists('player_idle')) {
      this.anims.create({
        key: 'player_idle',
        frames: [
          { key: 'player_idle', frame: 0 },
          { key: 'player_idle', frame: 1 },
          { key: 'player_idle', frame: 2 },
          { key: 'player_idle', frame: 3 }
        ],
        frameRate: 10,
        repeat: -1
      });
    }

    // Walk 动画 - 提高帧率使行走更流畅
    if (this.textures.exists('player_walk')) {
      this.anims.create({
        key: 'player_walk',
        frames: [
          { key: 'player_walk', frame: 0 },
          { key: 'player_walk', frame: 1 },
          { key: 'player_walk', frame: 2 },
          { key: 'player_walk', frame: 3 }
        ],
        frameRate: 12,
        repeat: -1
      });
    }

    // Jump 动画 - 快速播放跳跃动作
    if (this.textures.exists('player_jump')) {
      this.anims.create({
        key: 'player_jump',
        frames: [
          { key: 'player_jump', frame: 0 },
          { key: 'player_jump', frame: 1 },
          { key: 'player_jump', frame: 2 },
          { key: 'player_jump', frame: 3 }
        ],
        frameRate: 15,
        repeat: 0
      });
    }

    // Attack 动画 - 快速攻击
    if (this.textures.exists('player_attack')) {
      this.anims.create({
        key: 'player_attack',
        frames: [
          { key: 'player_attack', frame: 0 },
          { key: 'player_attack', frame: 1 },
          { key: 'player_attack', frame: 2 },
          { key: 'player_attack', frame: 3 }
        ],
        frameRate: 16,
        repeat: 0
      });
    }

    console.log('[BootScene] Player animations created');
  }
}

/**
 * 启动场景 - 资源加载
 */

import { GAME_CONFIG } from '../config.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // 创建加载进度条
    this.createLoadingBar();

    // 加载真实素材
    this.loadRealAssets();
  }

  createLoadingBar() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 进度条背景
    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();

    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2, 320, 30);

    // 加载文字
    const loadingText = this.add.text(width / 2, height / 2 - 40, '加载中...', {
      font: '20px Arial',
      color: '#00ffff',
    });
    loadingText.setOrigin(0.5, 0.5);

    // 更新进度
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ffff, 1);
      progressBar.fillRect(width / 2 - 155, height / 2 + 5, 310 * value, 20);

      // 同步更新HTML加载条
      const htmlBar = document.getElementById('loading-bar');
      const htmlText = document.getElementById('loading-text');
      if (htmlBar) htmlBar.style.width = `${value * 100}%`;
      if (htmlText) htmlText.textContent = `加载中... ${Math.floor(value * 100)}%`;
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }

  loadRealAssets() {
    // 加载处理后的素材 (已裁切和缩放)
    // 角色 - 64x64
    this.load.image('player', 'images/processed/player.png');

    // 平台 - 120x40 (包含发光边距，核心区域 100x20)
    this.load.image('platform_normal', 'images/processed/platform_normal.png');
    this.load.image('platform_bounce', 'images/processed/platform_bounce.png');
    this.load.image('platform_moving', 'images/processed/platform_moving.png');
    this.load.image('platform_breakable', 'images/processed/platform_breakable.png');
    this.load.image('platform_vanish', 'images/processed/platform_vanish.png');
    this.load.image('platform_portal', 'images/processed/platform_portal.png');
    this.load.image('platform_ice', 'images/processed/platform_ice.png');

    // 能量球 - 32x32
    this.load.image('energy_doubleJump', 'images/processed/energy_doubleJump.png');
    this.load.image('energy_flying', 'images/processed/energy_flying.png');
    this.load.image('energy_shield', 'images/processed/energy_shield.png');
    this.load.image('energy_speedBoost', 'images/processed/energy_speedBoost.png');

    // 障碍物 - 40x40
    this.load.image('spike', 'images/processed/spike.png');

    // 背景 - 480x800
    this.load.image('background', 'images/processed/background.png');
  }

  create() {
    // 生成缺失的占位素材
    this.generateMissingAssets();

    // 跳转到主菜单
    this.scene.start('MenuScene');
  }

  generateMissingAssets() {
    // 生成玩家光晕 (匹配玩家缩放后的大小)
    const glow = this.make.graphics({ x: 0, y: 0, add: false });
    glow.fillStyle(0x00ffff, 0.3);
    glow.fillCircle(25, 25, 25);
    glow.generateTexture('playerGlow', 50, 50);
    glow.destroy();

    // 生成炸弹
    const bomb = this.make.graphics({ x: 0, y: 0, add: false });
    bomb.fillStyle(0x330000, 1);
    bomb.fillCircle(15, 15, 12);
    bomb.fillStyle(0xff0066, 1);
    bomb.fillCircle(15, 15, 8);
    bomb.fillStyle(0xffff00, 1);
    bomb.fillRect(14, 2, 3, 6);
    bomb.generateTexture('bomb', 30, 30);
    bomb.destroy();

    // 生成激光
    const laser = this.make.graphics({ x: 0, y: 0, add: false });
    laser.fillStyle(0xff0000, 1);
    laser.fillRect(0, 0, 10, 200);
    laser.fillStyle(0xff6666, 0.5);
    laser.fillRect(-3, 0, 16, 200);
    laser.generateTexture('laser', 10, 200);
    laser.destroy();

    // 生成粒子纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('particle', 8, 8);
    graphics.destroy();
  }
}

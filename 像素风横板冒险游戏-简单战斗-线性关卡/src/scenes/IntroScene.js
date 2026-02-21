/**
 * Intro Scene - Game Introduction
 * 开场动画场景 - 暗黑金色高级风格
 *
 * 设计 (遵循 3秒法则):
 * - 阶段1 (0-2s): 游戏Logo 淡入
 * - 阶段2 (2-4s): 标题动画
 * - 阶段3 (4-6s): "按任意键继续" 提示
 * - 总时长: 6-8秒，可跳过
 */

import Phaser from 'phaser';
import { GameConfig } from '../config.js';
import { SettingsManager } from '../systems/SettingsManager.js';
import { Colors, Fonts } from '../styles/GameStyles.js';

export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // 检查是否需要播放开场
    if (!SettingsManager.shouldPlayIntro()) {
      this.skipToIntro();
      return;
    }

    // 纯黑背景
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000);

    // 阶段控制
    this.currentPhase = 0;
    this.canSkip = false;

    // 创建各阶段元素 (初始隐藏)
    this.createIntroElements(width, height);

    // 播放开场动画序列
    this.playIntroSequence();

    // 跳过控制
    this.setupSkipControls();

    // 淡入
    this.cameras.main.fadeIn(300);
  }

  createIntroElements(width, height) {
    const centerX = width / 2;
    const centerY = height / 2;

    // 阶段1: Logo - 白色，简洁
    this.logo = this.add.text(centerX, centerY - 60, '像素冒险', {
      fontFamily: Fonts.pixel,
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0);

    this.logoSubtitle = this.add.text(centerX, centerY + 10, 'PIXEL ADVENTURE', {
      fontFamily: Fonts.primary,
      fontSize: '18px',
      color: Colors.css.gold,
    }).setOrigin(0.5).setAlpha(0);

    // 阶段2: 游戏副标题
    this.tagline = this.add.text(centerX, centerY + 60, '穿越像素世界的冒险之旅', {
      fontFamily: Fonts.primary,
      fontSize: '16px',
      color: '#cccccc',
    }).setOrigin(0.5).setAlpha(0);

    // 阶段3: 继续提示
    this.continueText = this.add.text(centerX, height - 80, '按任意键继续', {
      fontFamily: Fonts.primary,
      fontSize: '16px',
      color: Colors.css.gold,
    }).setOrigin(0.5).setAlpha(0);

    // 跳过提示
    this.skipText = this.add.text(width - 20, height - 20, '按任意键跳过', {
      fontFamily: Fonts.primary,
      fontSize: '12px',
      color: '#888888',
    }).setOrigin(1).setAlpha(0);
  }

  playIntroSequence() {
    // 阶段1: Logo 淡入 (0-1.5s)
    this.time.delayedCall(500, () => {
      this.tweens.add({
        targets: [this.logo, this.logoSubtitle],
        alpha: 1,
        duration: 1000,
        ease: 'Power2'
      });
    });

    // 阶段2: 副标题 (2-3s)
    this.time.delayedCall(2000, () => {
      this.currentPhase = 1;
      this.tweens.add({
        targets: this.tagline,
        alpha: 1,
        duration: 800,
        ease: 'Power2'
      });
    });

    // 阶段3: 继续提示 (4-5s)
    this.time.delayedCall(4000, () => {
      this.currentPhase = 2;
      this.canSkip = true;

      // 显示跳过提示
      this.tweens.add({
        targets: this.skipText,
        alpha: 1,
        duration: 300
      });

      // 继续提示显示
      this.tweens.add({
        targets: this.continueText,
        alpha: 1,
        duration: 500
      });
    });

    // 自动进入游戏 (8s后)
    this.time.delayedCall(8000, () => {
      if (this.scene.isActive()) {
        this.startGame();
      }
    });
  }

  setupSkipControls() {
    // 任意键跳过
    this.input.keyboard.on('keydown', () => {
      if (this.canSkip) {
        this.startGame();
      } else {
        this.fastForward();
      }
    });

    // 点击跳过
    this.input.on('pointerdown', () => {
      if (this.canSkip) {
        this.startGame();
      }
    });
  }

  fastForward() {
    // 快进显示所有元素
    this.logo.setAlpha(1);
    this.logoSubtitle.setAlpha(1);
    this.tagline.setAlpha(1);
    this.continueText.setAlpha(1);
    this.skipText.setAlpha(1);
    this.canSkip = true;

    // 停止所有 tweens
    this.tweens.killAll();
  }

  startGame() {
    // 标记开场已播放
    SettingsManager.markIntroPlayed();

    // 淡出
    this.cameras.main.fade(300, 0, 0, 0);

    this.time.delayedCall(300, () => {
      this.scene.start('GameScene');
    });
  }

  skipToIntro() {
    this.scene.start('GameScene');
  }
}

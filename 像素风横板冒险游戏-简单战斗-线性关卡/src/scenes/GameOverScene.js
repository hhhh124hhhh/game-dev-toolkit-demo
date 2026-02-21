/**
 * Game Over Scene
 * 游戏结束场景 - 暗黑金色高级风格
 */

import Phaser from 'phaser';
import { GameConfig } from '../config.js';
import { SettingsManager } from '../systems/SettingsManager.js';
import { Colors, Fonts, UIFactory } from '../styles/GameStyles.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // 半透明背景
    this.add.rectangle(width / 2, height / 2, width, height, Colors.bg.overlay, 0.9);

    // Game Over 标题 - 白色简洁
    this.add.text(width / 2, height * 0.2, '游戏结束', {
      fontFamily: Fonts.pixel,
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // 装饰线
    this.add.rectangle(width / 2, height * 0.3, width * 0.4, 2, Colors.gold, 0.5);

    // 分数 - 金色
    this.add.text(width / 2, height * 0.4, `得分: ${window.gameState.score}`, {
      fontFamily: Fonts.primary,
      fontSize: '18px',
      color: Colors.css.gold,
    }).setOrigin(0.5);

    // 最高分
    this.add.text(width / 2, height * 0.48, `最高分: ${window.gameState.highScore}`, {
      fontFamily: Fonts.primary,
      fontSize: '14px',
      color: '#888888',
    }).setOrigin(0.5);

    // 检查是否新纪录
    if (window.gameState.score >= window.gameState.highScore && window.gameState.score > 0) {
      this.add.text(width / 2, height * 0.56, '新纪录!', {
        fontFamily: Fonts.primary,
        fontSize: '16px',
        color: Colors.css.gold,
      }).setOrigin(0.5);
    }

    // 按钮
    const buttonY = height * 0.72;

    // 再来一次按钮
    UIFactory.createButton(
      this,
      width / 2,
      buttonY,
      '再来一次',
      () => this.restartGame(),
      { style: 'primary', width: 180 }
    );

    // 返回菜单按钮
    UIFactory.createButton(
      this,
      width / 2,
      buttonY + 55,
      '返回菜单',
      () => this.returnToMenu(),
      { style: 'secondary', width: 180 }
    );

    // 提示文字
    this.add.text(width / 2, height - 20, '空格/回车: 重试 | ESC: 菜单', {
      fontFamily: Fonts.primary,
      fontSize: '12px',
      color: '#888888',
    }).setOrigin(0.5);

    // 键盘输入
    this.input.keyboard.on('keydown-SPACE', () => {
      this.restartGame();
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.restartGame();
    });

    this.input.keyboard.on('keydown-ESC', () => {
      this.returnToMenu();
    });

    // 淡入
    this.cameras.main.fadeIn(300);
  }

  restartGame() {
    this.cameras.main.fade(200, 0, 0, 0);
    this.time.delayedCall(200, () => {
      window.gameState.score = 0;
      this.scene.start('GameScene');
    });
  }

  returnToMenu() {
    this.cameras.main.fade(200, 0, 0, 0);
    this.time.delayedCall(200, () => {
      window.gameState.score = 0;
      this.scene.start('MenuScene');
    });
  }
}

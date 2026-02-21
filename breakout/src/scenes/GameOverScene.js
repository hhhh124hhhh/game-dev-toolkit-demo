import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';

/**
 * GameOverScene - 游戏结束场景
 */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;

    this.cameras.main.setBackgroundColor(GAME_CONFIG.colors.background);

    const score = window.gameState?.finalScore || 0;
    const highScore = window.gameState?.highScore || 0;
    const victory = window.gameState?.victory || false;

    // 结果标题
    const titleText = victory ? '恭喜通关!' : '游戏结束';
    const titleColor = victory ? '#00ff88' : '#ff4757';

    this.add.text(centerX, 150, titleText, {
      fontSize: '56px',
      fontFamily: 'Arial, sans-serif',
      color: titleColor,
      fontStyle: 'bold',
      stroke: '#000033',
      strokeThickness: 4
    }).setOrigin(0.5);

    // 分数显示
    this.add.text(centerX, 250, '得分', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.add.text(centerX, 290, score.toString(), {
      fontSize: '64px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 最高分
    this.add.text(centerX, 370, `最高分: ${highScore}`, {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffd700'
    }).setOrigin(0.5);

    // 新纪录提示
    if (score === highScore && score > 0) {
      const newRecord = this.add.text(centerX, 420, '新纪录!', {
        fontSize: '32px',
        fontFamily: 'Arial, sans-serif',
        color: '#ff6b81',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.tweens.add({
        targets: newRecord,
        scale: 1.2,
        duration: 300,
        yoyo: true,
        repeat: -1
      });
    }

    // 重新开始按钮
    const restartButton = this.add.text(centerX, 480, '重新开始', {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: '#00d4ff',
      padding: { x: 25, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    restartButton.on('pointerover', () => {
      restartButton.setStyle({ backgroundColor: '#00a8cc' });
    });

    restartButton.on('pointerout', () => {
      restartButton.setStyle({ backgroundColor: '#00d4ff' });
    });

    restartButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    // 返回菜单按钮
    const menuButton = this.add.text(centerX, 540, '返回菜单', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#888888'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuButton.on('pointerover', () => {
      menuButton.setStyle({ color: '#ffffff' });
    });

    menuButton.on('pointerout', () => {
      menuButton.setStyle({ color: '#888888' });
    });

    menuButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    // 键盘控制
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('MenuScene');
    });

    this.input.keyboard.once('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
  }
}

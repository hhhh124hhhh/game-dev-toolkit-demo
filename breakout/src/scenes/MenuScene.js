import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';

/**
 * MenuScene - 主菜单场景
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;

    // 背景
    this.cameras.main.setBackgroundColor(GAME_CONFIG.colors.background);

    // 游戏标题
    this.add.text(centerX, 120, 'BREAKOUT', {
      fontSize: '64px',
      fontFamily: 'Arial, sans-serif',
      color: '#00d4ff',
      fontStyle: 'bold',
      stroke: '#003366',
      strokeThickness: 6
    }).setOrigin(0.5);

    // 副标题
    this.add.text(centerX, 180, '打砖块', {
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 最高分显示
    const highScore = window.gameState?.highScore || 0;
    this.add.text(centerX, 260, `最高分: ${highScore}`, {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffd700'
    }).setOrigin(0.5);

    // 开始按钮
    const startButton = this.add.text(centerX, 360, '点击开始', {
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: '#00d4ff',
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // 按钮交互效果
    startButton.on('pointerover', () => {
      startButton.setStyle({ backgroundColor: '#00a8cc' });
    });

    startButton.on('pointerout', () => {
      startButton.setStyle({ backgroundColor: '#00d4ff' });
    });

    startButton.on('pointerdown', () => {
      this.startGame();
    });

    // 操作说明
    this.add.text(centerX, 460, '操作说明:', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.add.text(centerX, 490, '← → 或 鼠标 移动挡板', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#888888'
    }).setOrigin(0.5);

    this.add.text(centerX, 520, '空格键 发射球', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#888888'
    }).setOrigin(0.5);

    // 键盘控制
    this.input.keyboard.once('keydown-SPACE', () => {
      this.startGame();
    });

    // 闪烁动画
    this.tweens.add({
      targets: startButton,
      alpha: 0.7,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  startGame() {
    // 重置游戏状态
    window.gameState.score = 0;
    window.gameState.level = 1;
    window.gameState.lives = 3;

    this.cameras.main.fade(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start('GameScene');
    });
  }
}

import { GAME_CONFIG, DEPTH } from '../config.js';

/**
 * GameOverScene - 游戏结束场景
 */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.finalWave = data.wave || 1;
  }

  create() {
    // 背景
    this.add.rectangle(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2,
      GAME_CONFIG.width,
      GAME_CONFIG.height,
      0x1a1a2e
    );

    // 游戏结束标题
    this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 3,
      '游戏结束',
      {
        fontSize: '56px',
        color: '#ff4444',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(DEPTH.UI);

    // 分数
    this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2 - 30,
      `最终分数: ${this.finalScore}`,
      {
        fontSize: '32px',
        color: '#ffffff'
      }
    ).setOrigin(0.5).setDepth(DEPTH.UI);

    // 波次
    this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2 + 20,
      `到达波次: ${this.finalWave}`,
      {
        fontSize: '24px',
        color: '#ffaa00'
      }
    ).setOrigin(0.5).setDepth(DEPTH.UI);

    // 重新开始按钮
    const restartBtn = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2 + 100,
      '重新开始',
      {
        fontSize: '28px',
        color: '#00ff00',
        backgroundColor: '#333333',
        padding: { x: 20, y: 10 }
      }
    ).setOrigin(0.5).setDepth(DEPTH.UI).setInteractive({ useHandCursor: true });

    restartBtn.on('pointerover', () => {
      restartBtn.setColor('#88ff88');
    });

    restartBtn.on('pointerout', () => {
      restartBtn.setColor('#00ff00');
    });

    restartBtn.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // 返回菜单按钮
    const menuBtn = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2 + 160,
      '返回菜单',
      {
        fontSize: '24px',
        color: '#aaaaaa',
        backgroundColor: '#333333',
        padding: { x: 20, y: 10 }
      }
    ).setOrigin(0.5).setDepth(DEPTH.UI).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerover', () => {
      menuBtn.setColor('#ffffff');
    });

    menuBtn.on('pointerout', () => {
      menuBtn.setColor('#aaaaaa');
    });

    menuBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    // 快捷键
    this.input.keyboard.once('keydown-R', () => {
      this.scene.start('GameScene');
    });

    this.input.keyboard.once('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
  }
}

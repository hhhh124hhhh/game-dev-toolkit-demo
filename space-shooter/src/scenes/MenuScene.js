import { GAME_CONFIG } from '../config.js';

/**
 * MenuScene - 主菜单场景
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const centerX = GAME_CONFIG.width / 2;
    const centerY = GAME_CONFIG.height / 2;

    // 背景星星
    this.createStars();

    // 游戏标题
    this.add.text(centerX, 150, '太空射击', {
      fontSize: '48px',
      fontFamily: 'Arial, sans-serif',
      color: '#00ffff',
      stroke: '#000033',
      strokeThickness: 6,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(centerX, 210, 'SPACE SHOOTER', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000033',
      strokeThickness: 3
    }).setOrigin(0.5);

    // 开始按钮
    const startButton = this.add.image(centerX, centerY + 50, 'button').setInteractive();
    const startText = this.add.text(centerX, centerY + 50, '开始游戏', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    startButton.on('pointerover', () => {
      startButton.setTint(0x88ccff);
      startText.setColor('#ffff00');
    });

    startButton.on('pointerout', () => {
      startButton.clearTint();
      startText.setColor('#ffffff');
    });

    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // 操作说明
    this.add.text(centerX, GAME_CONFIG.height - 120, '操作说明', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaaaa',
      stroke: '#000033',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.add.text(centerX, GAME_CONFIG.height - 80, '方向键 移动飞船\n空格 发射子弹', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#888888',
      align: 'center',
      stroke: '#000033',
      strokeThickness: 2
    }).setOrigin(0.5);

    // 版本信息
    this.add.text(GAME_CONFIG.width - 10, GAME_CONFIG.height - 10, 'v1.0.0', {
      fontSize: '12px',
      color: '#444444'
    }).setOrigin(1, 1);
  }

  /**
   * 创建背景星星
   */
  createStars() {
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, GAME_CONFIG.width);
      const y = Phaser.Math.Between(0, GAME_CONFIG.height);
      const size = Phaser.Math.Between(1, 3);
      const alpha = Phaser.Math.FloatBetween(0.3, 1);

      const star = this.add.circle(x, y, size, 0xffffff, alpha);

      // 闪烁动画
      this.tweens.add({
        targets: star,
        alpha: alpha * 0.3,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1
      });
    }
  }
}

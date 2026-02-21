import { GAME_CONFIG } from '../config.js';

/**
 * GameOverScene - 游戏结束场景
 */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalScore = data.score || 0;
  }

  create() {
    const centerX = GAME_CONFIG.width / 2;
    const centerY = GAME_CONFIG.height / 2;

    this.cameras.main.setBackgroundColor(GAME_CONFIG.colors.background);

    // 半透明遮罩
    this.add.rectangle(centerX, centerY, GAME_CONFIG.width, GAME_CONFIG.height, 0x000000, 0.7);

    // 游戏结束标题
    this.add.text(centerX, centerY - 120, '游戏结束', {
      fontSize: '48px',
      fontFamily: 'Arial, sans-serif',
      color: '#e94560',
      stroke: '#000033',
      strokeThickness: 6,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 最终分数
    this.add.text(centerX, centerY - 40, '最终分数', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.add.text(centerX, centerY + 10, this.finalScore.toString(), {
      fontSize: '64px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffff00',
      stroke: '#000033',
      strokeThickness: 4,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 评价
    let rating = '再接再厉';
    if (this.finalScore >= 5000) rating = '消除大师';
    else if (this.finalScore >= 3000) rating = '消除高手';
    else if (this.finalScore >= 1000) rating = '消除达人';

    this.add.text(centerX, centerY + 70, rating, {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 重新开始按钮
    const restartButton = this.add.image(centerX, centerY + 150, 'button').setInteractive();
    const restartText = this.add.text(centerX, centerY + 150, '再来一局', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    restartButton.on('pointerover', () => {
      restartButton.setTint(0x88ccff);
      restartText.setColor('#ffff00');
    });

    restartButton.on('pointerout', () => {
      restartButton.clearTint();
      restartText.setColor('#ffffff');
    });

    restartButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // 返回菜单按钮
    const menuButton = this.add.image(centerX, centerY + 220, 'button').setInteractive();
    const menuText = this.add.text(centerX, centerY + 220, '返回菜单', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    menuButton.on('pointerover', () => {
      menuButton.setTint(0x88ccff);
      menuText.setColor('#ffff00');
    });

    menuButton.on('pointerout', () => {
      menuButton.clearTint();
      menuText.setColor('#ffffff');
    });

    menuButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}

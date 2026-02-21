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

    // 背景
    this.cameras.main.setBackgroundColor(GAME_CONFIG.colors.background);

    // 创建背景装饰
    this.createBackgroundDecorations();

    // 游戏标题
    this.add.text(centerX, 150, '消除游戏', {
      fontSize: '56px',
      fontFamily: 'Arial, sans-serif',
      color: '#e94560',
      stroke: '#000033',
      strokeThickness: 6,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(centerX, 220, 'MATCH-3 PUZZLE', {
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

    this.add.text(centerX, GAME_CONFIG.height - 70, '点击选择宝石，再点击相邻宝石交换\n三个或以上相同宝石连成一线即可消除', {
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
   * 创建背景装饰
   */
  createBackgroundDecorations() {
    // 创建浮动的宝石装饰
    const decorTypes = [0, 1, 2, 3, 4, 5];

    for (let i = 0; i < 12; i++) {
      const x = Phaser.Math.Between(50, GAME_CONFIG.width - 50);
      const y = Phaser.Math.Between(50, GAME_CONFIG.height - 50);
      const type = Phaser.Math.RND.pick(decorTypes);
      const alpha = Phaser.Math.FloatBetween(0.1, 0.3);

      const gem = this.add.image(x, y, `gem_${type}`)
        .setAlpha(alpha)
        .setScale(0.8);

      // 浮动动画
      this.tweens.add({
        targets: gem,
        y: y + Phaser.Math.Between(-20, 20),
        alpha: alpha * 0.5,
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
}

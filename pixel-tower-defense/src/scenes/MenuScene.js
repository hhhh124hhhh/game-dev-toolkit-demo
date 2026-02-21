/**
 * MenuScene - 主菜单
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // 背景渐变效果
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 标题
    this.add.text(centerX, 100, 'PIXEL TOWER', {
      fontSize: '64px',
      fontFamily: 'Arial Black',
      color: '#00ff88',
      stroke: '#005533',
      strokeThickness: 8
    }).setOrigin(0.5);

    this.add.text(centerX, 170, 'DEFENSE', {
      fontSize: '48px',
      fontFamily: 'Arial Black',
      color: '#ff8800',
      stroke: '#884400',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(centerX, 220, '像素塔防', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 开始按钮
    const startButton = this.add.image(centerX, 320, 'button').setInteractive();
    const startText = this.add.text(centerX, 320, '开始游戏', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    startButton.on('pointerover', () => {
      startButton.setTint(0x88ccff);
    });
    startButton.on('pointerout', () => {
      startButton.clearTint();
    });
    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
      this.scene.launch('UIScene');
    });

    // 说明
    this.add.text(centerX, 420, '游戏说明:', {
      fontSize: '18px',
      color: '#888888'
    }).setOrigin(0.5);

    const instructions = [
      '• 点击网格放置防御塔',
      '• 阻止敌人到达终点',
      '• 击杀敌人获得金币',
      '• 生存尽可能多的波次'
    ];

    instructions.forEach((text, index) => {
      this.add.text(centerX, 450 + index * 25, text, {
        fontSize: '14px',
        color: '#666666'
      }).setOrigin(0.5);
    });

    // 版本信息
    this.add.text(centerX, 580, 'v1.0.0 | Made with Phaser 3', {
      fontSize: '12px',
      color: '#444444'
    }).setOrigin(0.5);
  }
}

/**
 * GameOverScene - 游戏结束场景
 */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.victory = data?.victory || false;
    this.wave = data?.wave || 0;
    this.kills = data?.kills || 0;
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // 背景
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 半透明遮罩
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.5);
    overlay.fillRect(0, 0, 800, 600);

    // 结果标题
    const titleText = this.victory ? '胜利!' : '游戏结束';
    const titleColor = this.victory ? '#00ff88' : '#ff4444';

    this.add.text(centerX, 150, titleText, {
      fontSize: '64px',
      fontFamily: 'Arial Black',
      color: titleColor,
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // 统计面板
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x333333, 0.9);
    panelBg.fillRoundedRect(centerX - 150, 220, 300, 180, 10);
    panelBg.lineStyle(2, 0x666666, 1);
    panelBg.strokeRoundedRect(centerX - 150, 220, 300, 180, 10);

    // 统计数据
    this.add.text(centerX, 250, '游戏统计', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(centerX, 300, `通过波次: ${this.wave}`, {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.add.text(centerX, 335, `击杀敌人: ${this.kills}`, {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 结果描述
    const descText = this.victory
      ? '恭喜! 你成功抵御了所有敌人的进攻!'
      : '敌人突破了防线...下次再接再厉!';

    this.add.text(centerX, 380, descText, {
      fontSize: '14px',
      color: '#888888',
      wordWrap: { width: 280 }
    }).setOrigin(0.5);

    // 重试按钮
    const retryButton = this.add.image(centerX - 100, 480, 'button').setInteractive();
    this.add.text(centerX - 100, 480, '重试', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    retryButton.on('pointerover', () => retryButton.setTint(0x88ccff));
    retryButton.on('pointerout', () => retryButton.clearTint());
    retryButton.on('pointerdown', () => {
      this.scene.start('GameScene');
      this.scene.launch('UIScene');
    });

    // 返回菜单按钮
    const menuButton = this.add.image(centerX + 100, 480, 'button').setInteractive();
    this.add.text(centerX + 100, 480, '主菜单', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    menuButton.on('pointerover', () => menuButton.setTint(0x88ccff));
    menuButton.on('pointerout', () => menuButton.clearTint());
    menuButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    // 添加闪烁效果
    this.tweens.add({
      targets: [retryButton, menuButton],
      alpha: 0.8,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }
}

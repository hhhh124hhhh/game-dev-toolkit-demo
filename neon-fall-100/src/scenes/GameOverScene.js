/**
 * 游戏结束场景
 */

import { GAME_CONFIG } from '../config.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalFloor = data.floor || 0;
    this.finalScore = data.score || 0;
    this.finalEnergy = data.energy || 0;
    this.finalTime = data.time || 0;
    this.isVictory = data.victory || false;
  }

  create() {
    const { width, height } = this.cameras.main;

    // 背景
    this.createBackground();

    // 结果显示
    this.createResultDisplay();

    // 按钮
    this.createButtons();

    // 粒子效果
    this.createParticles();

    // 淡入
    this.cameras.main.fadeIn(500);
  }

  createBackground() {
    const { width, height } = this.cameras.main;

    // 渐变背景
    const graphics = this.add.graphics();
    for (let i = 0; i < height; i++) {
      const ratio = i / height;
      const r = this.isVictory ? Math.floor(10 + ratio * 20) : Math.floor(20 + ratio * 20);
      const g = 10;
      const b = this.isVictory ? Math.floor(20 + ratio * 20) : 10;
      graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
      graphics.fillRect(0, i, width, 1);
    }

    // 网格线
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, this.isVictory ? 0xffff00 : 0xff0000, 0.1);
    for (let x = 0; x < width; x += 40) {
      gridGraphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 40) {
      gridGraphics.lineBetween(0, y, width, y);
    }
  }

  createResultDisplay() {
    const { width, height } = this.cameras.main;

    // 标题
    const titleText = this.isVictory ? '恭喜通关!' : '游戏结束';
    const titleColor = this.isVictory ? '#ffff00' : '#ff0066';

    this.title = this.add.text(width / 2, 100, titleText, {
      fontSize: '56px',
      fontFamily: 'Arial Black',
      color: titleColor,
      stroke: '#000000',
      strokeThickness: 4,
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: titleColor,
        blur: 20,
        fill: true,
      },
    });
    this.title.setOrigin(0.5);

    // 结果面板
    const panelY = height / 2 - 50;

    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.7);
    panel.fillRoundedRect(width / 2 - 150, panelY - 80, 300, 200, 15);
    panel.lineStyle(2, this.isVictory ? 0xffff00 : 0xff0066, 1);
    panel.strokeRoundedRect(width / 2 - 150, panelY - 80, 300, 200, 15);

    // 统计数据
    const stats = [
      `到达层数: ${this.finalFloor}`,
      `最终得分: ${this.finalScore}`,
      `收集能量: ${this.finalEnergy}`,
      `存活时间: ${Math.floor(this.finalTime)}秒`,
    ];

    stats.forEach((stat, index) => {
      const text = this.add.text(width / 2, panelY - 40 + index * 40, stat, {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#00ffff',
      });
      text.setOrigin(0.5);
    });

    // 最高分标记
    if (this.finalFloor >= window.gameState.highScore && this.finalFloor > 0) {
      const newRecord = this.add.text(width / 2, panelY + 130, '★ 新纪录! ★', {
        fontSize: '28px',
        fontFamily: 'Arial Black',
        color: '#ffff00',
      });
      newRecord.setOrigin(0.5);

      // 闪烁动画
      this.tweens.add({
        targets: newRecord,
        alpha: 0.5,
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    }

    // 评价
    this.showRating();
  }

  showRating() {
    const { width, height } = this.cameras.main;

    let rating = '';
    let ratingColor = '#888888';

    if (this.finalFloor >= 100) {
      rating = 'S - 百层王者!';
      ratingColor = '#ffff00';
    } else if (this.finalFloor >= 80) {
      rating = 'A - 绝地高手!';
      ratingColor = '#ff00ff';
    } else if (this.finalFloor >= 60) {
      rating = 'B - 挑战达人!';
      ratingColor = '#00ffff';
    } else if (this.finalFloor >= 40) {
      rating = 'C - 渐入佳境';
      ratingColor = '#00ff00';
    } else if (this.finalFloor >= 20) {
      rating = 'D - 初露锋芒';
      ratingColor = '#ff6600';
    } else {
      rating = 'E - 继续努力';
      ratingColor = '#ff0066';
    }

    const ratingText = this.add.text(width / 2, height - 200, rating, {
      fontSize: '36px',
      fontFamily: 'Arial Black',
      color: ratingColor,
    });
    ratingText.setOrigin(0.5);

    // 入场动画
    ratingText.setScale(0);
    this.tweens.add({
      targets: ratingText,
      scale: 1,
      duration: 500,
      delay: 500,
      ease: 'Back.easeOut',
    });
  }

  createButtons() {
    const { width, height } = this.cameras.main;
    const buttonY = height - 100;

    // 重新开始按钮
    this.retryButton = this.createNeonButton(width / 2 - 100, buttonY, '再来一次', () => {
      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene');
      });
    });

    // 返回菜单按钮
    this.menuButton = this.createNeonButton(width / 2 + 100, buttonY, '返回菜单', () => {
      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });
  }

  createNeonButton(x, y, text, callback) {
    const button = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRoundedRect(-80, -20, 160, 40, 8);
    bg.lineStyle(2, 0x00ffff, 1);
    bg.strokeRoundedRect(-80, -20, 160, 40, 8);

    const buttonText = this.add.text(0, 0, text, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#00ffff',
    });
    buttonText.setOrigin(0.5);

    button.add([bg, buttonText]);
    button.setSize(160, 40);
    button.setInteractive({ useHandCursor: true });

    button.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x00ffff, 0.2);
      bg.fillRoundedRect(-80, -20, 160, 40, 8);
      bg.lineStyle(3, 0x00ffff, 1);
      bg.strokeRoundedRect(-80, -20, 160, 40, 8);
      buttonText.setColor('#ffffff');
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x000000, 0.7);
      bg.fillRoundedRect(-80, -20, 160, 40, 8);
      bg.lineStyle(2, 0x00ffff, 1);
      bg.strokeRoundedRect(-80, -20, 160, 40, 8);
      buttonText.setColor('#00ffff');
    });

    button.on('pointerdown', callback);

    return button;
  }

  createParticles() {
    // 胜利粒子
    if (this.isVictory) {
      this.time.addEvent({
        delay: 200,
        callback: () => {
          const x = Phaser.Math.Between(0, this.cameras.main.width);
          const particle = this.add.circle(x, -10, 5, Phaser.Math.RND.pick([0xffff00, 0xff00ff, 0x00ffff]), 1);

          this.tweens.add({
            targets: particle,
            y: this.cameras.main.height + 50,
            x: x + Phaser.Math.Between(-50, 50),
            alpha: 0,
            duration: 3000,
            onComplete: () => particle.destroy(),
          });
        },
        loop: true,
      });
    }
  }
}

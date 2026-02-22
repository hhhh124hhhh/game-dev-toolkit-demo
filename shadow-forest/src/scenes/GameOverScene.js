/**
 * GameOverScene 游戏结束场景
 * 《暗影森林》Shadow Forest
 */

import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    // 接收游戏数据
    this.finalScore = data.score || 0;
    this.finalLevel = data.level || 1;
    this.killCount = data.kills || 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    // 背景
    this.add.image(width / 2, height / 2, 'background');

    // 半透明遮罩
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);

    // 游戏结束标题
    const title = this.add.text(width / 2, 120, '游戏结束', {
      fontFamily: 'Arial',
      fontSize: '56px',
      fontStyle: 'bold',
      fill: '#e74c3c',
      stroke: '#000000',
      strokeThickness: 6
    });
    title.setOrigin(0.5, 0.5);

    // 分数面板
    this.createScorePanel();

    // 重新开始按钮
    this.createButton(width / 2, 420, '重新开始', () => {
      this.scene.start('GameScene');
    });

    // 返回主菜单按钮
    this.createButton(width / 2, 500, '返回主菜单', () => {
      this.scene.start('MenuScene');
    });

    // 感谢游玩
    const thanks = this.add.text(width / 2, 570, '感谢游玩！', {
      fontFamily: 'Arial',
      fontSize: '16px',
      fill: '#888888'
    });
    thanks.setOrigin(0.5, 0.5);
  }

  createScorePanel() {
    const { width, height } = this.cameras.main;

    // 面板背景
    const panel = this.add.rectangle(width / 2, 260, 400, 180, 0x1a1a1a, 0.9);
    panel.setStrokeStyle(2, 0xffd700);

    // 标题
    const panelTitle = this.add.text(width / 2, 190, '战绩统计', {
      fontFamily: 'Arial',
      fontSize: '24px',
      fill: '#ffd700'
    });
    panelTitle.setOrigin(0.5, 0.5);

    // 分数
    const scoreText = this.add.text(width / 2, 230, `得分: ${this.finalScore}`, {
      fontFamily: 'Arial',
      fontSize: '28px',
      fill: '#ffffff'
    });
    scoreText.setOrigin(0.5, 0.5);

    // 等级
    const levelText = this.add.text(width / 2, 270, `最终等级: Lv.${this.finalLevel}`, {
      fontFamily: 'Arial',
      fontSize: '22px',
      fill: '#3498db'
    });
    levelText.setOrigin(0.5, 0.5);

    // 击杀数
    const killText = this.add.text(width / 2, 310, `击败敌人: ${this.killCount}`, {
      fontFamily: 'Arial',
      fontSize: '22px',
      fill: '#e74c3c'
    });
    killText.setOrigin(0.5, 0.5);

    // 评价
    const rating = this.calculateRating();
    const ratingText = this.add.text(width / 2, 350, `评价: ${rating}`, {
      fontFamily: 'Arial',
      fontSize: '24px',
      fontStyle: 'bold',
      fill: this.getRatingColor(rating)
    });
    ratingText.setOrigin(0.5, 0.5);
  }

  calculateRating() {
    const totalScore = this.finalScore + this.finalLevel * 100 + this.killCount * 50;

    if (totalScore >= 2000) return 'S';
    if (totalScore >= 1500) return 'A';
    if (totalScore >= 1000) return 'B';
    if (totalScore >= 500) return 'C';
    return 'D';
  }

  getRatingColor(rating) {
    const colors = {
      'S': '#ffd700',
      'A': '#e74c3c',
      'B': '#3498db',
      'C': '#2ecc71',
      'D': '#95a5a6'
    };
    return colors[rating] || '#ffffff';
  }

  createButton(x, y, text, callback) {
    const button = this.add.image(x, y, 'button');
    button.setInteractive({ useHandCursor: true });

    const buttonText = this.add.text(x, y, text, {
      fontFamily: 'Arial',
      fontSize: '20px',
      fill: '#ffffff'
    });
    buttonText.setOrigin(0.5, 0.5);

    // 悬停效果
    button.on('pointerover', () => {
      button.setTint(0xcccccc);
      buttonText.setScale(1.1);
    });

    button.on('pointerout', () => {
      button.clearTint();
      buttonText.setScale(1);
    });

    button.on('pointerdown', () => {
      button.setTint(0xaaaaaa);
    });

    button.on('pointerup', () => {
      button.clearTint();
      callback();
    });

    return { button, text: buttonText };
  }
}

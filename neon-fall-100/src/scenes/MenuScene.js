/**
 * 主菜单场景
 */

import { GAME_CONFIG, GameState } from '../config.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // 背景
    this.createBackground();

    // 标题
    this.createTitle();

    // 按钮
    this.createButtons();

    // 最高分显示
    this.createHighScoreDisplay();

    // 装饰动画
    this.createDecorations();
  }

  createBackground() {
    // 使用背景图片
    this.bgImage = this.add.image(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2,
      'background'
    );
    this.bgImage.setScale(
      GAME_CONFIG.width / this.bgImage.width,
      GAME_CONFIG.height / this.bgImage.height
    );

    // 网格线
    this.gridLines = [];
    for (let i = 0; i < 20; i++) {
      const line = this.add.graphics();
      line.lineStyle(1, 0x00ffff, 0.1);
      line.lineBetween(0, i * 50, GAME_CONFIG.width, i * 50);
      this.gridLines.push(line);
    }

    // 动态粒子
    this.particles = [];
    for (let i = 0; i < 30; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, GAME_CONFIG.width),
        Phaser.Math.Between(0, GAME_CONFIG.height),
        Phaser.Math.Between(1, 3),
        Phaser.Math.RND.pick([0x00ffff, 0xff00ff, 0xffff00]),
        0.5
      );
      this.particles.push(particle);
    }
  }

  createTitle() {
    const { width, height } = this.cameras.main;

    // 主标题
    this.title = this.add.text(width / 2, height / 3, '霓虹坠落', {
      fontSize: '64px',
      fontFamily: 'Arial Black, Arial',
      color: '#00ffff',
      stroke: '#00ffff',
      strokeThickness: 2,
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#00ffff',
        blur: 20,
        fill: true,
      },
    });
    this.title.setOrigin(0.5);

    // 副标题
    this.subtitle = this.add.text(width / 2, height / 3 + 60, '100层挑战', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ff00ff',
    });
    this.subtitle.setOrigin(0.5);

    // 标题动画
    this.tweens.add({
      targets: this.title,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  createButtons() {
    const { width, height } = this.cameras.main;
    const buttonY = height / 2 + 50;

    // 开始游戏按钮
    this.startButton = this.createNeonButton(
      width / 2,
      buttonY,
      '开始游戏',
      () => this.startGame()
    );

    // 控制说明按钮
    this.helpButton = this.createNeonButton(
      width / 2,
      buttonY + 70,
      '操作说明',
      () => this.showHelp()
    );

    // 成就按钮
    this.achievementButton = this.createNeonButton(
      width / 2,
      buttonY + 140,
      '成就',
      () => this.showAchievements()
    );
  }

  createNeonButton(x, y, text, callback) {
    const button = this.add.container(x, y);

    // 按钮背景
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRoundedRect(-100, -25, 200, 50, 10);
    bg.lineStyle(2, 0x00ffff, 1);
    bg.strokeRoundedRect(-100, -25, 200, 50, 10);

    // 按钮文字
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ffff',
    });
    buttonText.setOrigin(0.5);

    button.add([bg, buttonText]);
    button.setSize(200, 50);
    button.setInteractive({ useHandCursor: true });

    // 悬停效果
    button.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x00ffff, 0.2);
      bg.fillRoundedRect(-100, -25, 200, 50, 10);
      bg.lineStyle(3, 0x00ffff, 1);
      bg.strokeRoundedRect(-100, -25, 200, 50, 10);
      buttonText.setColor('#ffffff');
      buttonText.setScale(1.1);
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x000000, 0.7);
      bg.fillRoundedRect(-100, -25, 200, 50, 10);
      bg.lineStyle(2, 0x00ffff, 1);
      bg.strokeRoundedRect(-100, -25, 200, 50, 10);
      buttonText.setColor('#00ffff');
      buttonText.setScale(1);
    });

    button.on('pointerdown', callback);

    return button;
  }

  createHighScoreDisplay() {
    const { width, height } = this.cameras.main;

    this.highScoreText = this.add.text(
      width / 2,
      height - 80,
      `最高纪录: ${window.gameState.highScore} 层`,
      {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffff00',
      }
    );
    this.highScoreText.setOrigin(0.5);

    this.gamesText = this.add.text(
      width / 2,
      height - 50,
      `总游戏次数: ${window.gameState.totalGames}`,
      {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#888888',
      }
    );
    this.gamesText.setOrigin(0.5);
  }

  createDecorations() {
    // 粒子动画
    this.particles.forEach((particle) => {
      this.tweens.add({
        targets: particle,
        y: -50,
        x: `+=${Phaser.Math.Between(-100, 100)}`,
        alpha: 0,
        duration: Phaser.Math.Between(3000, 6000),
        repeat: -1,
        onRepeat: () => {
          particle.y = GAME_CONFIG.height + 50;
          particle.x = Phaser.Math.Between(0, GAME_CONFIG.width);
          particle.alpha = 0.5;
        },
      });
    });
  }

  startGame() {
    // 过渡动画
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene');
    });
  }

  showHelp() {
    const { width, height } = this.cameras.main;

    // 创建帮助面板
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    overlay.setInteractive();

    const panel = this.add.graphics();
    panel.fillStyle(0x111122, 0.95);
    panel.fillRoundedRect(width / 2 - 180, height / 2 - 200, 360, 400, 15);
    panel.lineStyle(2, 0x00ffff, 1);
    panel.strokeRoundedRect(width / 2 - 180, height / 2 - 200, 360, 400, 15);

    const helpTexts = [
      '【操作说明】',
      '',
      '← → 或 A D: 左右移动',
      '',
      '【平台类型】',
      '青色: 普通平台',
      '绿色: 弹跳平台',
      '紫色: 移动平台',
      '橙色: 破碎平台',
      '',
      '【目标】',
      '到达第100层!',
    ];

    const text = this.add.text(width / 2, height / 2 - 150, helpTexts, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#00ffff',
      align: 'center',
      lineSpacing: 8,
    });
    text.setOrigin(0.5, 0);

    // 关闭按钮
    const closeBtn = this.add.text(width / 2, height / 2 + 160, '[ 关闭 ]', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ff00ff',
    });
    closeBtn.setOrigin(0.5);
    closeBtn.setInteractive({ useHandCursor: true });

    const closeHelp = () => {
      overlay.destroy();
      panel.destroy();
      text.destroy();
      closeBtn.destroy();
    };

    closeBtn.on('pointerdown', closeHelp);
    overlay.on('pointerdown', closeHelp);
  }

  showAchievements() {
    const { width, height } = this.cameras.main;

    // 创建成就面板
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    overlay.setInteractive();

    const panel = this.add.graphics();
    panel.fillStyle(0x111122, 0.95);
    panel.fillRoundedRect(width / 2 - 180, height / 2 - 220, 360, 440, 15);
    panel.lineStyle(2, 0xff00ff, 1);
    panel.strokeRoundedRect(width / 2 - 180, height / 2 - 220, 360, 440, 15);

    const achievements = Object.entries(GAME_CONFIG.achievements);
    const unlocked = window.gameState.achievements;

    let text = '【成就】\n\n';
    achievements.forEach(([key, achievement]) => {
      const isUnlocked = unlocked.includes(key);
      text += `${isUnlocked ? '✓' : '○'} ${achievement.name}\n`;
      text += `   ${achievement.desc}\n\n`;
    });

    const achievementText = this.add.text(width / 2, height / 2 - 180, text, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#00ffff',
      align: 'left',
      lineSpacing: 4,
    });
    achievementText.setOrigin(0.5, 0);

    // 关闭按钮
    const closeBtn = this.add.text(width / 2, height / 2 + 180, '[ 关闭 ]', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ff00ff',
    });
    closeBtn.setOrigin(0.5);
    closeBtn.setInteractive({ useHandCursor: true });

    const closeAchievements = () => {
      overlay.destroy();
      panel.destroy();
      achievementText.destroy();
      closeBtn.destroy();
    };

    closeBtn.on('pointerdown', closeAchievements);
    overlay.on('pointerdown', closeAchievements);
  }

  update() {
    // 背景动画更新
    this.gridLines.forEach((line, index) => {
      line.y += 0.5;
      if (line.y > GAME_CONFIG.height) {
        line.y = -GAME_CONFIG.height;
      }
    });
  }
}

/**
 * Pause Scene - Pause Menu
 * 暂停菜单场景 - 暗黑金色高级风格
 *
 * 功能:
 * - 继续游戏
 * - 设置
 * - 返回主菜单
 */

import Phaser from 'phaser';
import { Colors, Fonts, UIFactory } from '../styles/GameStyles.js';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  init(data) {
    this.gameScene = data?.gameScene || 'GameScene';
  }

  create() {
    const { width, height } = this.cameras.main;

    // 半透明遮罩
    this.add.rectangle(width / 2, height / 2, width, height, Colors.bg.overlay, 0.9);

    // 暂停标题 - 白色简洁
    this.add.text(width / 2, height * 0.22, '游戏暂停', {
      fontFamily: Fonts.pixel,
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // 装饰线
    this.add.rectangle(width / 2, height * 0.32, width * 0.5, 2, Colors.gold, 0.5);

    // 菜单按钮
    const buttonSpacing = 55;
    const startY = height * 0.42;
    const centerX = width / 2;

    const buttons = [
      { text: '继续游戏', action: 'resume', style: 'primary' },
      { text: '游戏设置', action: 'settings', style: 'secondary' },
      { text: '返回菜单', action: 'menu', style: 'secondary' }
    ];

    this.menuButtons = [];
    this.selectedIndex = 0;

    buttons.forEach((config, index) => {
      const y = startY + index * buttonSpacing;
      const button = UIFactory.createButton(
        this,
        centerX,
        y,
        config.text,
        () => this.executeAction(config.action),
        { style: config.style, width: 180 }
      );

      button.setData('index', index);
      button.setData('action', config.action);
      this.menuButtons.push(button);
    });

    // 高亮第一个按钮
    this.highlightButton(0);

    // 提示文字
    this.add.text(width / 2, height - 25, 'ESC: 继续 | 方向键: 选择', {
      fontFamily: Fonts.primary,
      fontSize: '14px',
      color: '#888888',
    }).setOrigin(0.5);

    // 键盘控制
    this.setupKeyboardControls();

    // 淡入
    this.cameras.main.fadeIn(200);
  }

  highlightButton(index) {
    this.menuButtons.forEach((button, i) => {
      const bg = button.bg;
      const label = button.label;
      const action = button.getData('action');

      if (i === index) {
        // 高亮状态
        bg.setFillStyle(Colors.ui.buttonBgHover, 1);
        bg.setStrokeStyle(2, Colors.ui.buttonBorder);
        label.setColor('#ffffff');
      } else {
        // 普通状态
        bg.setFillStyle(Colors.ui.buttonBg, 1);
        const borderColor = action === 'resume' ? Colors.ui.buttonBorder : 0x666666;
        bg.setStrokeStyle(2, borderColor);
        label.setColor('#ffffff');
      }
    });

    this.selectedIndex = index;
  }

  setupKeyboardControls() {
    // 上/下导航
    this.input.keyboard.on('keydown-UP', () => {
      const newIndex = (this.selectedIndex - 1 + this.menuButtons.length) % this.menuButtons.length;
      this.highlightButton(newIndex);
    });

    this.input.keyboard.on('keydown-DOWN', () => {
      const newIndex = (this.selectedIndex + 1) % this.menuButtons.length;
      this.highlightButton(newIndex);
    });

    // 回车选择
    this.input.keyboard.on('keydown-ENTER', () => {
      const button = this.menuButtons[this.selectedIndex];
      const action = button.getData('action');
      this.executeAction(action);
    });

    // ESC 恢复游戏
    this.input.keyboard.on('keydown-ESC', () => {
      this.resumeGame();
    });
  }

  executeAction(action) {
    switch (action) {
      case 'resume':
        this.resumeGame();
        break;
      case 'settings':
        this.openSettings();
        break;
      case 'menu':
        this.returnToMenu();
        break;
    }
  }

  resumeGame() {
    this.cameras.main.fade(150, 0, 0, 0);

    this.time.delayedCall(150, () => {
      this.scene.resume(this.gameScene);
      this.scene.stop();
    });
  }

  openSettings() {
    this.scene.pause();
    this.scene.launch('SettingsScene', { returnScene: 'PauseScene' });
  }

  returnToMenu() {
    this.cameras.main.fade(200, 0, 0, 0);

    this.time.delayedCall(200, () => {
      this.scene.stop(this.gameScene);
      this.scene.start('MenuScene');
    });
  }
}

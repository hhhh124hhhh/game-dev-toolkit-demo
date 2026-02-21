/**
 * Menu Scene - Main Menu
 * 主菜单 - 暗黑金色高级风格
 *
 * 设计理念:
 * - 简约克制，高级感
 * - 无发光、无闪烁、无扫描线
 * - 清晰易读的文字
 */

import Phaser from 'phaser';
import { GameConfig } from '../config.js';
import { SettingsManager } from '../systems/SettingsManager.js';
import {
  Colors,
  Fonts,
  UIFactory,
  createSceneBackground,
} from '../styles/GameStyles.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // 加载设置
    this.settings = SettingsManager.getSettings();

    // 应用设置
    SettingsManager.applyToScene(this);

    // 简洁背景
    createSceneBackground(this, width, height);

    // 游戏标题
    this.createTitle(width, height);

    // 菜单按钮
    this.createMenuButtons(width, height);

    // 底部信息
    this.createFooter(width, height);

    // 键盘控制
    this.setupKeyboardControls();

    // 淡入效果
    this.cameras.main.fadeIn(300);
  }

  createTitle(width, height) {
    const titleContainer = this.add.container(width / 2, height * 0.25);

    // 主标题 - 白色，无发光
    const title = this.add.text(0, 0, '像素冒险', {
      fontFamily: Fonts.pixel,
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // 副标题 - 金色
    const subtitle = this.add.text(0, 45, 'PIXEL ADVENTURE', {
      fontFamily: Fonts.primary,
      fontSize: '18px',
      color: Colors.css.gold,
    }).setOrigin(0.5);

    titleContainer.add([title, subtitle]);
  }

  createMenuButtons(width, height) {
    const buttonSpacing = 60;
    const startY = height * 0.5;
    const centerX = width / 2;

    // 按钮配置
    const buttons = [
      { text: '开始游戏', scene: 'IntroScene', key: 'start', style: 'primary' },
      { text: '游戏设置', scene: 'SettingsScene', key: 'settings', style: 'secondary' }
    ];

    // 如果有存档，显示继续按钮
    if (this.settings.highScore > 0) {
      buttons.unshift({ text: '继续游戏', scene: 'GameScene', key: 'continue', style: 'primary' });
    }

    this.menuButtons = [];
    this.selectedIndex = 0;

    buttons.forEach((config, index) => {
      const y = startY + index * buttonSpacing;
      const button = UIFactory.createButton(
        this,
        centerX,
        y,
        config.text,
        () => {
          this.selectButton(config.scene, config.key);
        },
        { style: config.style }
      );

      button.setData('index', index);
      button.setData('config', config);
      this.menuButtons.push(button);
    });

    // 高亮第一个按钮
    this.highlightButton(0);
  }

  highlightButton(index) {
    // 播放菜单选择音效（仅在切换时播放）
    if (index !== this.selectedIndex && this.sound.get('menu_select')) {
      this.sound.play('menu_select', { volume: 0.5 });
    }

    this.menuButtons.forEach((button, i) => {
      const bg = button.bg;
      const label = button.label;
      const config = button.getData('config');

      if (i === index) {
        // 高亮状态
        bg.setFillStyle(Colors.ui.buttonBgHover, 1);
        bg.setStrokeStyle(2, Colors.ui.buttonBorder);
        label.setColor('#ffffff');
      } else {
        // 普通状态
        bg.setFillStyle(Colors.ui.buttonBg, 1);
        const borderColor = config.style === 'secondary' ? 0x666666 : Colors.ui.buttonBorder;
        bg.setStrokeStyle(2, borderColor);
        label.setColor('#ffffff');
      }
    });

    this.selectedIndex = index;
  }

  selectButton(scene, key) {
    // 播放确认音效
    if (this.sound.get('menu_select')) {
      this.sound.play('menu_select', { volume: 0.6 });
    }

    this.cameras.main.fade(200, 0, 0, 0);

    this.time.delayedCall(200, () => {
      if (scene === 'SettingsScene') {
        this.scene.start('SettingsScene', { returnScene: 'MenuScene' });
      } else {
        this.scene.start(scene);
      }
    });
  }

  createFooter(width, height) {
    // 最高分 - 金色
    const highScore = this.settings.highScore || 0;
    this.add.text(width / 2, height - 70, `最高分: ${highScore}`, {
      fontFamily: Fonts.primary,
      fontSize: '16px',
      color: Colors.css.gold,
    }).setOrigin(0.5);

    // 控制提示 - 白色
    this.add.text(width / 2, height - 40, '方向键: 选择 | 回车: 确认', {
      fontFamily: Fonts.primary,
      fontSize: '14px',
      color: '#cccccc',
    }).setOrigin(0.5);

    // 版本信息
    this.add.text(width - 15, height - 15, `v${GameConfig.gameVersion}`, {
      fontFamily: Fonts.primary,
      fontSize: '12px',
      color: '#888888',
    }).setOrigin(1);
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
      const config = button.getData('config');
      this.selectButton(config.scene, config.key);
    });

    // 空格快速开始
    this.input.keyboard.on('keydown-SPACE', () => {
      this.selectButton('IntroScene', 'start');
    });
  }
}

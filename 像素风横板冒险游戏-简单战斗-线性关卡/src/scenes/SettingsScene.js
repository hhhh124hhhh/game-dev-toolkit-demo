/**
 * Settings Scene
 * 设置场景 - 暗黑金色高级风格
 *
 * 设置类别:
 * - 音频: 主音量、音乐音量、音效音量
 * - 显示: 全屏、粒子效果、屏幕抖动
 * - 控制: 显示控制提示
 */

import Phaser from 'phaser';
import { GameConfig } from '../config.js';
import { SettingsManager } from '../systems/SettingsManager.js';
import {
  Colors,
  Fonts,
  UIFactory,
} from '../styles/GameStyles.js';

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });
  }

  init(data) {
    this.returnScene = data?.returnScene || 'MenuScene';
  }

  create() {
    const { width, height } = this.cameras.main;

    // 半透明背景
    this.add.rectangle(width / 2, height / 2, width, height, Colors.bg.overlay, 0.9);

    // 标题
    this.createTitle(width);

    // 加载当前设置
    this.settings = SettingsManager.getSettings();

    // 创建设置项
    let yPos = 100;
    const spacing = 55;
    const leftCol = width / 2 - 160;

    // === 音频设置 ===
    yPos = this.createSectionHeader(leftCol, yPos, '音频设置');
    yPos = this.createSlider(leftCol, yPos, '主音量', 'masterVolume', 0, 1);
    yPos = this.createSlider(leftCol, yPos, '音乐', 'musicVolume', 0, 1);
    yPos = this.createSlider(leftCol, yPos, '音效', 'sfxVolume', 0, 1);
    yPos += 20;

    // === 显示设置 ===
    yPos = this.createSectionHeader(leftCol, yPos, '显示设置');
    yPos = this.createToggle(leftCol, yPos, '全屏模式', 'fullscreen');
    yPos = this.createToggle(leftCol, yPos, '粒子效果', 'particles');
    yPos = this.createToggle(leftCol, yPos, '屏幕抖动', 'screenShake');
    yPos += 30;

    // === 按钮 ===
    const buttonY = height - 55;

    // 重置按钮
    UIFactory.createButton(
      this,
      width / 2 - 110,
      buttonY,
      '重置',
      () => this.resetSettings(),
      { style: 'secondary', width: 160 }
    );

    // 返回按钮
    UIFactory.createButton(
      this,
      width / 2 + 110,
      buttonY,
      '返回',
      () => this.goBack(),
      { style: 'primary', width: 160 }
    );

    // 提示文字
    this.add.text(width / 2, height - 15, '设置自动保存', {
      fontFamily: Fonts.primary,
      fontSize: '12px',
      color: '#888888',
    }).setOrigin(0.5);

    // 键盘控制
    this.input.keyboard.on('keydown-ESC', () => {
      this.goBack();
    });

    // 淡入
    this.cameras.main.fadeIn(200);
  }

  createTitle(width) {
    this.add.text(width / 2, 45, '游戏设置', {
      fontFamily: Fonts.pixel,
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);
  }

  createSectionHeader(x, y, text) {
    this.add.text(x, y, text, {
      fontFamily: Fonts.primary,
      fontSize: '16px',
      color: Colors.css.gold,
    }).setOrigin(0, 0.5);

    // 装饰线
    this.add.rectangle(x + 150, y + 18, 300, 1, Colors.gold, 0.3);

    return y + 45;
  }

  createSlider(x, y, label, settingKey, min, max) {
    const container = this.add.container(x, y);

    // 标签
    const labelText = this.add.text(0, 0, label, {
      fontFamily: Fonts.primary,
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);
    container.add(labelText);

    // 滑动条参数
    const sliderWidth = 180;
    const trackHeight = 10;
    const trackX = 150;

    // 滑动条轨道
    const track = this.add.rectangle(trackX, 0, sliderWidth, trackHeight, 0x2a2a2a, 1);
    container.add(track);

    // 填充条
    const currentValue = this.settings[settingKey];
    const fillWidth = ((currentValue - min) / (max - min)) * sliderWidth;
    const fill = this.add.rectangle(
      trackX - sliderWidth / 2 + fillWidth / 2,
      0,
      fillWidth,
      trackHeight - 2,
      Colors.gold,
      1
    );
    container.add(fill);

    // 滑块手柄
    const handleSize = 18;
    const handleX = trackX - sliderWidth / 2 + fillWidth;
    const handle = this.add.rectangle(handleX, 0, handleSize, handleSize, 0xffffff);
    handle.setStrokeStyle(2, Colors.gold);
    container.add(handle);

    // 数值显示
    const valueText = this.add.text(trackX + sliderWidth / 2 + 15, 0, Math.round(currentValue * 100) + '%', {
      fontFamily: Fonts.primary,
      fontSize: '14px',
      color: Colors.css.gold,
    }).setOrigin(0, 0.5);
    container.add(valueText);

    // 交互
    const hitArea = this.add.rectangle(trackX, 0, sliderWidth + 20, 30, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);

    let isDragging = false;

    const updateSlider = (pointerX) => {
      const startX = x + trackX - sliderWidth / 2;
      let newValue = (pointerX - startX) / sliderWidth;
      newValue = Phaser.Math.Clamp(newValue, 0, 1);
      const actualValue = min + newValue * (max - min);

      // 更新视觉
      const newFillWidth = newValue * sliderWidth;
      fill.setSize(newFillWidth, trackHeight - 2);
      fill.setPosition(trackX - sliderWidth / 2 + newFillWidth / 2, 0);
      handle.setPosition(trackX - sliderWidth / 2 + newFillWidth, 0);
      valueText.setText(Math.round(actualValue * 100) + '%');

      // 更新设置
      this.settings[settingKey] = actualValue;
      SettingsManager.set(settingKey, actualValue);

      // 应用音量
      if (settingKey === 'masterVolume' && this.sound) {
        this.sound.setVolume(actualValue);
      }
    };

    hitArea.on('pointerdown', (pointer) => {
      isDragging = true;
      updateSlider(pointer.x);
    });

    hitArea.on('pointermove', (pointer) => {
      if (isDragging) {
        updateSlider(pointer.x);
      }
    });

    this.input.on('pointerup', () => {
      isDragging = false;
    });

    return y + 45;
  }

  createToggle(x, y, label, settingKey) {
    const container = this.add.container(x, y);
    let value = this.settings[settingKey];

    // 标签
    const labelText = this.add.text(0, 0, label, {
      fontFamily: Fonts.primary,
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);
    container.add(labelText);

    // 开关参数
    const toggleWidth = 56;
    const toggleHeight = 28;
    const toggleX = 200;

    // 开关背景
    const bg = this.add.rectangle(toggleX, 0, toggleWidth, toggleHeight,
      value ? Colors.gold : 0x333333, 1);
    bg.setStrokeStyle(2, value ? Colors.gold : 0x555555);
    container.add(bg);

    // 开关手柄
    const handleSize = 20;
    const handleX = value ? toggleX + 12 : toggleX - 12;
    const handle = this.add.rectangle(handleX, 0, handleSize - 4, handleSize - 4, 0xffffff);
    container.add(handle);

    // 状态指示
    const statusText = this.add.text(toggleX + toggleWidth / 2 + 15, 0, value ? '开' : '关', {
      fontFamily: Fonts.primary,
      fontSize: '14px',
      color: value ? Colors.css.gold : '#888888',
    }).setOrigin(0, 0.5);
    container.add(statusText);

    // 交互
    bg.setInteractive({ useHandCursor: true });

    bg.on('pointerover', () => {
      bg.setStrokeStyle(2, Colors.css.goldLight);
    });

    bg.on('pointerout', () => {
      bg.setStrokeStyle(2, value ? Colors.gold : 0x555555);
    });

    bg.on('pointerdown', () => {
      value = !value;
      this.settings[settingKey] = value;
      SettingsManager.set(settingKey, value);

      // 更新视觉
      bg.setFillStyle(value ? Colors.gold : 0x333333);
      bg.setStrokeStyle(2, value ? Colors.gold : 0x555555);
      statusText.setText(value ? '开' : '关');
      statusText.setColor(value ? Colors.css.gold : '#888888');

      this.tweens.add({
        targets: handle,
        x: value ? toggleX + 12 : toggleX - 12,
        duration: 100,
      });

      // 应用全屏设置
      if (settingKey === 'fullscreen') {
        if (value) {
          this.scale.startFullscreen().catch(() => {});
        } else {
          this.scale.stopFullscreen();
        }
      }
    });

    return y + 45;
  }

  resetSettings() {
    SettingsManager.reset();
    this.settings = SettingsManager.getSettings();

    // 刷新场景
    this.cameras.main.fade(150, 0, 0, 0);
    this.time.delayedCall(150, () => {
      this.scene.restart({ returnScene: this.returnScene });
    });
  }

  goBack() {
    this.cameras.main.fade(150, 0, 0, 0);
    this.time.delayedCall(150, () => {
      this.scene.switch(this.returnScene);
    });
  }
}

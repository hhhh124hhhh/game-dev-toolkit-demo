/**
 * BootScene 启动场景
 * 《暗影森林》Shadow Forest
 *
 * 负责加载所有游戏资源
 */

import Phaser from 'phaser';
import { PlaceholderFactory } from '../systems/PlaceholderFactory.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // 创建加载进度条
    this.createLoadingBar();
  }

  createLoadingBar() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 进度条背景
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    // 进度条
    const progressBar = this.add.graphics();

    // 加载文字
    const loadingText = this.add.text(width / 2, height / 2 - 50, '加载中...', {
      fontFamily: 'Arial',
      fontSize: '20px',
      fill: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);

    // 百分比文字
    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontFamily: 'Arial',
      fontSize: '18px',
      fill: '#ffffff'
    });
    percentText.setOrigin(0.5, 0.5);

    // 监听加载进度
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xe74c3c, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      percentText.setText(Math.floor(value * 100) + '%');
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
  }

  create() {
    // 程序化生成所有素材
    PlaceholderFactory.createAllTextures(this);

    // 添加短暂延迟让用户看到加载完成
    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene');
    });
  }
}

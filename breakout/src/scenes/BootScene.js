import Phaser from 'phaser';
import { PlaceholderFactory } from '../systems/PlaceholderFactory.js';

/**
 * BootScene - 启动场景
 * 负责生成占位符素材和初始化
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // 显示加载文字
    const { width, height } = this.cameras.main;
    this.add.text(width / 2, height / 2, '加载中...', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  create() {
    // 生成所有占位符素材
    PlaceholderFactory.createAll(this);

    // 初始化全局状态
    if (!window.gameState) {
      window.gameState = {
        score: 0,
        highScore: 0,
        level: 1,
        lives: 3
      };
    }

    // 跳转到主菜单
    this.scene.start('MenuScene');
  }
}

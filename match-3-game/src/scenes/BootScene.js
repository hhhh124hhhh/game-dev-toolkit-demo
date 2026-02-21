import { PlaceholderFactory } from '../systems/PlaceholderFactory.js';

/**
 * BootScene - 资源加载场景
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // 显示加载文字
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.add.text(centerX, centerY, '加载中...', {
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  create() {
    // 创建占位符素材
    PlaceholderFactory.createAll(this);

    // 跳转到菜单
    this.scene.start('MenuScene');
  }
}

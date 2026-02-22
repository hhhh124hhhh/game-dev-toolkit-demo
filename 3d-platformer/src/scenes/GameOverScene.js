/**
 * GameOverScene - 游戏结束场景
 */

import { Scene3D } from '@enable3d/phaser-extension';

export class GameOverScene extends Scene3D {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init() {
    // CRITICAL: 必须在 init() 中调用 accessThirdDimension() 初始化 3D 环境
    this.accessThirdDimension();
  }

  async create() {
    const { width, height } = this.cameras.main;

    // 半透明背景
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

    // 游戏结束文字
    this.add.text(width / 2, height / 2 - 80, '游戏结束', {
      fontSize: '48px',
      fill: '#ff4444',
      fontFamily: 'Arial, Microsoft YaHei, sans-serif'
    }).setOrigin(0.5);

    // 分数显示
    this.add.text(width / 2, height / 2, `分数: ${window.gameState.score}`, {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial, Microsoft YaHei, sans-serif'
    }).setOrigin(0.5);

    // 最高分
    this.add.text(width / 2, height / 2 + 50, `最高分: ${window.gameState.highScore}`, {
      fontSize: '24px',
      fill: '#ffdd00',
      fontFamily: 'Arial, Microsoft YaHei, sans-serif'
    }).setOrigin(0.5);

    // 重新开始提示
    const restartText = this.add.text(width / 2, height / 2 + 120, '按 空格键 重新开始', {
      fontSize: '20px',
      fill: '#888888',
      fontFamily: 'Arial, Microsoft YaHei, sans-serif'
    }).setOrigin(0.5);

    // 闪烁动画
    this.tweens.add({
      targets: restartText,
      alpha: { from: 1, to: 0.3 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 输入监听
    this.input.keyboard.once('keydown-SPACE', () => {
      window.gameState.score = 0;
      this.scene.start('GameScene3D');
    });
  }
}

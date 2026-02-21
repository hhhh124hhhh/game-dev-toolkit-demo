import { GAME_CONFIG } from '../config.js';

// 获取 Phaser（全局或导入）
const PhaserLib = typeof Phaser !== 'undefined' ? Phaser : (await import('phaser')).default;

/**
 * Paddle - 游戏中的挡板实体
 */
export class Paddle extends PhaserLib.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'paddle');

    // 初始化属性
    this.width = GAME_CONFIG.paddle.width;
    this.height = GAME_CONFIG.paddle.height;
    this.speed = GAME_CONFIG.paddle.speed;

    // 添加到场景
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // 物理设置
    this.setCollideWorldBounds(true);
    this.setImmovable(true);
    this.body.immovable = true;

    // 初始速度为0
    this.body.velocity.x = 0;
  }

  /**
   * 更新挡板状态
   * @param {Object} cursors - 键盘输入光标
   */
  update(cursors) {
    // 重置速度
    this.body.velocity.x = 0;

    // 左移
    if (cursors.left.isDown) {
      this.body.velocity.x = -this.speed;
    }
    // 右移
    else if (cursors.right.isDown) {
      this.body.velocity.x = this.speed;
    }

    // 限制边界
    this.clampToBounds();
  }

  /**
   * 跟随鼠标/触摸指针
   * @param {number} pointerX - 指针X坐标
   */
  followPointer(pointerX) {
    this.x = pointerX;
    this.clampToBounds();
  }

  /**
   * 限制挡板在屏幕边界内
   */
  clampToBounds() {
    const minX = this.width / 2;
    const maxX = GAME_CONFIG.width - this.width / 2;

    this.x = PhaserLib.Math.Clamp(this.x, minX, maxX);
  }
}

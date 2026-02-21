import { GAME_CONFIG, BRICK_COLORS, BRICK_POINTS } from '../config.js';

// 获取 Phaser（全局或导入）
const PhaserLib = typeof Phaser !== 'undefined' ? Phaser : (await import('phaser')).default;

/**
 * Brick - 游戏中的砖块实体
 */
export class Brick extends PhaserLib.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} row - 行索引
   * @param {number} col - 列索引
   * @param {number} health - 生命值（默认1）
   */
  constructor(scene, x, y, row, col, health = 1) {
    // 根据行选择纹理
    const textureKey = Brick.getTextureKey(row, health);
    super(scene, x, y, textureKey);

    // 初始化属性
    this.width = GAME_CONFIG.bricks.width;
    this.height = GAME_CONFIG.bricks.height;

    // 存储数据
    this.setData('row', row);
    this.setData('col', col);
    this.setData('health', health);
    this.setData('color', BRICK_COLORS[row] || BRICK_COLORS[0]);
    this.setData('points', BRICK_POINTS[row] || BRICK_POINTS[0]);

    // 添加到场景
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // 静态物体
    this.setImmovable(true);
    this.body.immovable = true;
  }

  /**
   * 获取纹理键
   * @param {number} row - 行索引
   * @param {number} health - 生命值
   * @returns {string} 纹理键
   */
  static getTextureKey(row, health) {
    if (health === 3) return 'brick_gold';
    if (health === 2) return 'brick_strong';
    return `brick_${row % BRICK_COLORS.length}`;
  }

  /**
   * 击中砖块
   * @returns {boolean} 是否被销毁
   */
  hit() {
    const health = this.getData('health');
    const newHealth = health - 1;

    if (newHealth <= 0) {
      // 销毁
      this.destroy();
      return true;
    } else {
      // 减少生命值
      this.setData('health', newHealth);

      // 更新外观
      if (newHealth === 1) {
        // 变回普通砖块外观
        const row = this.getData('row');
        this.setTexture(`brick_${row % BRICK_COLORS.length}`);
      }

      return false;
    }
  }

  /**
   * 销毁砖块
   */
  destroy() {
    this.active = false;
    super.destroy();
  }
}

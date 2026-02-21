import { GEM_COLORS } from '../config.js';

/**
 * Gem - 宝石实体类
 * 表示棋盘上的单个宝石
 */
export class Gem {
  /**
   * @param {Phaser.Scene} scene - Phaser 场景
   * @param {number} offsetX - 棋盘X偏移
   * @param {number} offsetY - 棋盘Y偏移
   * @param {number} type - 宝石类型 (0-5)
   * @param {number} gridX - 网格X坐标
   * @param {number} gridY - 网格Y坐标
   */
  constructor(scene, offsetX, offsetY, type, gridX, gridY) {
    this.scene = scene;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.type = type;
    this.gridX = gridX;
    this.gridY = gridY;

    // 宝石尺寸
    this.tileSize = 64;

    // 计算屏幕位置
    this.x = offsetX + gridX * this.tileSize + this.tileSize / 2;
    this.y = offsetY + gridY * this.tileSize + this.tileSize / 2;

    // 状态
    this.isSelected = false;
    this.alpha = 1;
    this.scale = 1;
  }

  /**
   * 设置选中状态
   * @param {boolean} selected
   */
  setSelected(selected) {
    this.isSelected = selected;
    // 选中时放大，取消时恢复
    this.scale = selected ? 1.2 : 1;
  }

  /**
   * 播放消除动画
   */
  playDestroyAnimation() {
    this.scene.tweens.add({
      targets: this,
      scale: 0,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.destroy();
      }
    });
  }

  /**
   * 播放下落动画
   * @param {number} targetY - 目标Y坐标
   * @param {number} delay - 延迟时间
   */
  playFallAnimation(targetY, delay = 0) {
    this.scene.tweens.add({
      targets: this,
      y: targetY,
      duration: 200 + delay * 50,
      ease: 'Bounce.easeOut'
    });
  }

  /**
   * 更新网格位置
   * @param {number} gridX
   * @param {number} gridY
   */
  updateGridPosition(gridX, gridY) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.x = this.offsetX + gridX * this.tileSize + this.tileSize / 2;
    this.y = this.offsetY + gridY * this.tileSize + this.tileSize / 2;
  }

  /**
   * 获取宝石颜色
   * @returns {string} 十六进制颜色
   */
  getColor() {
    return GEM_COLORS[this.type] || '#ffffff';
  }

  /**
   * 销毁宝石
   */
  destroy() {
    this.alpha = 0;
    this.scale = 0;
  }

  /**
   * 重置状态
   */
  reset() {
    this.isSelected = false;
    this.alpha = 1;
    this.scale = 1;
  }
}

// 导出颜色常量供测试使用
export { GEM_COLORS };

/**
 * BulletPool - 子弹对象池
 *
 * 复用子弹对象，避免频繁创建/销毁导致的性能问题。
 * 基于最佳实践：使用 Phaser Group 实现对象池。
 */
export class BulletPool {
  /**
   * @param {Phaser.Scene} scene - 场景
   * @param {string} key - 纹理键名
   * @param {number} size - 池大小
   */
  constructor(scene, key, size) {
    this.scene = scene;
    this.key = key;
    this.size = size;

    // 使用 Phaser Group 创建对象池
    this.group = scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: size,
      runChildUpdate: true
    });

    // 预创建子弹
    for (let i = 0; i < size; i++) {
      const bullet = this.group.create(0, 0, key);
      bullet.setActive(false);
      bullet.setVisible(false);

      // 设置超出边界自动回收（需要物理体）
      if (bullet.body) {
        bullet.body.checkWorldBounds = true;
        bullet.body.worldBoundsOn = true;
      }
    }
  }

  /**
   * 发射子弹
   * @param {number} x - 起始 X 坐标
   * @param {number} y - 起始 Y 坐标
   * @param {number} velocityX - X 方向速度
   * @param {number} velocityY - Y 方向速度
   * @returns {Phaser.Physics.Arcade.Image|null} 子弹对象或 null（池已空）
   */
  fire(x, y, velocityX, velocityY) {
    const bullet = this.group.get(x, y);

    if (bullet) {
      bullet
        .setActive(true)
        .setVisible(true)
        .setVelocity(velocityX, velocityY);

      return bullet;
    }

    return null;
  }

  /**
   * 回收子弹
   * @param {Phaser.Physics.Arcade.Image} bullet - 要回收的子弹
   */
  recycle(bullet) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    bullet.setPosition(-100, -100);  // 移出屏幕
  }

  /**
   * 获取当前活跃的子弹数量
   * @returns {number}
   */
  getActiveCount() {
    return this.group.countActive(true);
  }

  /**
   * 获取所有活跃的子弹
   * @returns {Phaser.Physics.Arcade.Image[]}
   */
  getActiveBullets() {
    return this.group.getChildren().filter(b => b.active);
  }

  /**
   * 回收所有子弹
   */
  recycleAll() {
    this.group.getChildren().forEach(bullet => {
      if (bullet.active) {
        this.recycle(bullet);
      }
    });
  }
}

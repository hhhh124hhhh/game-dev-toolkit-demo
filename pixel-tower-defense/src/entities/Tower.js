import { TOWER_CONFIG } from '../config.js';

/**
 * Tower - 塔基类
 */
export class Tower {
  constructor(scene, type, gridX, gridY) {
    this.scene = scene;
    this.type = type;
    this.config = TOWER_CONFIG[type];

    // 状态初始化（防止 undefined bug）
    this.gridX = gridX;
    this.gridY = gridY;
    this.level = 1;
    this.lastFireTime = 0;
    this.target = null;
    this.isActive = true;

    // 计算像素位置
    const cellSize = 40;
    this.x = gridX * cellSize + cellSize / 2;
    this.y = gridY * cellSize + cellSize / 2;

    // 创建精灵
    this.sprite = scene.add.sprite(this.x, this.y, `tower_${type}`);
    this.sprite.setData('tower', this);
    this.sprite.setDepth(5);  // 塔在路径之上，敌人在塔之上

    // 范围指示器（默认隐藏）
    this.rangeIndicator = scene.add.graphics();
    this.rangeIndicator.setDepth(4);
    this.rangeIndicator.setVisible(false);
    this.drawRangeIndicator();
  }

  /**
   * 绘制范围指示器
   */
  drawRangeIndicator() {
    this.rangeIndicator.clear();
    this.rangeIndicator.lineStyle(2, 0x00ff88, 0.3);
    this.rangeIndicator.strokeCircle(this.x, this.y, this.getRange());
  }

  /**
   * 显示范围
   */
  showRange() {
    this.rangeIndicator.setVisible(true);
  }

  /**
   * 隐藏范围
   */
  hideRange() {
    this.rangeIndicator.setVisible(false);
  }

  /**
   * 获取当前范围
   */
  getRange() {
    return this.config.range * (1 + (this.level - 1) * 0.1);
  }

  /**
   * 获取当前伤害
   */
  getDamage() {
    return this.config.damage * (1 + (this.level - 1) * 0.2);
  }

  /**
   * 获取当前射速
   */
  getFireRate() {
    return this.config.fireRate * (1 - (this.level - 1) * 0.1);
  }

  /**
   * 寻找目标
   * @param {Enemy[]} enemies - 敌人数组
   * @returns {Enemy|null} 目标敌人
   */
  findTarget(enemies) {
    const range = this.getRange();

    // 找范围内的敌人
    const inRange = enemies.filter(enemy =>
      enemy.isAlive &&
      !enemy.reachedEnd &&
      enemy.isInRange(this.x, this.y, range)
    );

    if (inRange.length === 0) {
      this.target = null;
      return null;
    }

    // 选择最接近终点的敌人
    inRange.sort((a, b) => b.pathIndex - a.pathIndex);
    this.target = inRange[0];
    return this.target;
  }

  /**
   * 尝试攻击
   * @param {number} time - 当前时间
   * @param {Enemy[]} enemies - 敌人数组
   */
  tryFire(time, enemies) {
    if (!this.isActive) return;

    // 检查射速
    if (time - this.lastFireTime < this.getFireRate()) return;

    // 寻找目标
    const target = this.findTarget(enemies);
    if (!target) return;

    // 发射
    this.fire(target);
    this.lastFireTime = time;
  }

  /**
   * 发射攻击
   * @param {Enemy} target - 目标敌人
   */
  fire(target) {
    // 创建弹道
    this.createProjectile(target);
  }

  /**
   * 创建弹道
   */
  createProjectile(target) {
    const projectileType = this.getProjectileType();
    const projectile = this.scene.add.sprite(this.x, this.y - 10, `projectile_${projectileType}`);
    projectile.setDepth(15);  // 弹道在所有元素之上

    // 弹道飞行动画
    const duration = 200; // 毫秒

    this.scene.tweens.add({
      targets: projectile,
      x: target.sprite.x,
      y: target.sprite.y,
      duration: duration,
      onComplete: () => {
        this.onHit(target, projectile);
        projectile.destroy();
      }
    });
  }

  /**
   * 命中处理
   */
  onHit(target, projectile) {
    if (!target.isAlive) return;

    // 根据塔类型处理
    switch (this.type) {
      case 'arrow':
        target.takeDamage(this.getDamage());
        break;

      case 'mage':
      case 'cannon':
        // 范围伤害
        this.applySplashDamage(target);
        break;

      case 'slow':
        // 减速效果
        target.applySlow(this.config.slowFactor, this.config.slowDuration);
        break;
    }
  }

  /**
   * 范围伤害
   */
  applySplashDamage(target) {
    const splashRadius = this.config.splashRadius || 0;
    if (splashRadius === 0) {
      target.takeDamage(this.getDamage());
      return;
    }

    // 获取范围内所有敌人
    const enemies = this.scene.enemies || [];
    enemies.forEach(enemy => {
      if (enemy.isAlive && enemy.isInRange(target.sprite.x, target.sprite.y, splashRadius)) {
        enemy.takeDamage(this.getDamage());
      }
    });
  }

  /**
   * 获取弹道类型
   */
  getProjectileType() {
    switch (this.type) {
      case 'arrow': return 'arrow';
      case 'mage': return 'magic';
      case 'cannon': return 'cannon';
      default: return 'arrow';
    }
  }

  /**
   * 升级塔
   */
  upgrade() {
    if (this.level >= 3) return false; // 最高3级

    this.level++;
    this.drawRangeIndicator();

    // 升级视觉效果
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true
    });

    return true;
  }

  /**
   * 获取升级费用
   */
  getUpgradeCost() {
    if (this.level >= 3) return 0;
    return Math.floor(this.config.cost * 0.6 * this.level);
  }

  /**
   * 获取出售价格
   */
  getSellValue() {
    return Math.floor(this.config.cost * 0.5 * this.level);
  }

  /**
   * 销毁塔
   */
  destroy() {
    this.isActive = false;
    this.sprite.destroy();
    this.rangeIndicator.destroy();
  }
}

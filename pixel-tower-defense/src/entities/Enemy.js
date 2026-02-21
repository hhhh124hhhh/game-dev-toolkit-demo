import { ENEMY_CONFIG } from '../config.js';

/**
 * Enemy - 敌人实体
 */
export class Enemy {
  constructor(scene, type, path) {
    this.scene = scene;
    this.type = type;
    this.config = ENEMY_CONFIG[type];

    // 状态初始化（防止 undefined bug）
    this.health = this.config.health;
    this.maxHealth = this.config.health;
    this.speed = this.config.speed;
    this.reward = this.config.reward;
    this.path = path;
    this.pathIndex = 0;
    this.isAlive = true;
    this.reachedEnd = false;
    this.slowFactor = 1;
    this.slowTimer = null;

    // 创建精灵
    const startPos = path[0];
    this.sprite = scene.add.sprite(startPos[0], startPos[1], `enemy_${type}`);
    this.sprite.setData('enemy', this);
    this.sprite.setDepth(10);  // 确保敌人在路径和塔之上
    this.sprite.setScale(1.2); // 放大一点更容易看清

    console.log(`[Enemy] Created ${type} at (${startPos[0]}, ${startPos[1]})`);

    // 创建生命条
    this.createHealthBar();
  }

  /**
   * 创建生命条
   */
  createHealthBar() {
    const width = 30;
    const height = 4;
    const offsetY = -this.config.size / 2 - 8;

    this.healthBarBg = this.scene.add.graphics();
    this.healthBarFill = this.scene.add.graphics();
    this.healthBarBg.setDepth(11);  // 血条在敌人精灵之上
    this.healthBarFill.setDepth(12);

    this.updateHealthBar();
  }

  /**
   * 更新生命条显示
   */
  updateHealthBar() {
    const width = 30;
    const height = 4;
    const offsetY = -this.config.size / 2 - 8;
    const x = this.sprite.x - width / 2;
    const y = this.sprite.y + offsetY;

    // 背景
    this.healthBarBg.clear();
    this.healthBarBg.fillStyle(0x333333, 0.8);
    this.healthBarBg.fillRect(x, y, width, height);

    // 填充
    this.healthBarFill.clear();
    const healthPercent = this.health / this.maxHealth;
    const fillColor = healthPercent > 0.5 ? 0x00ff00 :
                      healthPercent > 0.25 ? 0xffff00 : 0xff0000;
    this.healthBarFill.fillStyle(fillColor, 1);
    this.healthBarFill.fillRect(x, y, width * healthPercent, height);
  }

  /**
   * 更新敌人状态
   * @param {number} delta - 时间增量（毫秒）
   */
  update(delta) {
    if (!this.isAlive || this.reachedEnd) return;

    // 检查是否到达路径点
    const target = this.path[this.pathIndex];
    if (!target) {
      this.reachedEnd = true;
      this.scene.events.emit('enemy-reached-end', this);
      // 到达终点后销毁精灵
      this.destroy();
      return;
    }

    const dx = target[0] - this.sprite.x;
    const dy = target[1] - this.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      // 到达当前路径点，移动到下一个
      this.pathIndex++;
    } else {
      // 向目标移动
      const actualSpeed = this.speed * this.slowFactor * (delta / 1000);
      const vx = (dx / distance) * actualSpeed;
      const vy = (dy / distance) * actualSpeed;

      this.sprite.x += vx;
      this.sprite.y += vy;
    }

    // 更新生命条位置
    this.updateHealthBar();
  }

  /**
   * 受到伤害
   * @param {number} damage - 伤害值
   */
  takeDamage(damage) {
    if (!this.isAlive) return;

    this.health -= damage;

    if (this.health <= 0) {
      this.die();
    }
  }

  /**
   * 减速效果
   * @param {number} factor - 减速因子 (0-1)
   * @param {number} duration - 持续时间（毫秒）
   */
  applySlow(factor, duration) {
    this.slowFactor = factor;

    // 清除之前的减速定时器
    if (this.slowTimer) {
      this.slowTimer.destroy();
    }

    // 设置减速结束定时器
    this.slowTimer = this.scene.time.delayedCall(duration, () => {
      this.slowFactor = 1;
    });
  }

  /**
   * 敌人死亡
   */
  die() {
    this.isAlive = false;

    // 通知场景
    this.scene.events.emit('enemy-killed', this);

    // 死亡动画
    this.scene.tweens.add({
      targets: [this.sprite, this.healthBarBg, this.healthBarFill],
      alpha: 0,
      scale: 1.5,
      duration: 200,
      onComplete: () => {
        this.destroy();
      }
    });
  }

  /**
   * 销毁敌人
   */
  destroy() {
    if (this.slowTimer) {
      this.slowTimer.destroy();
    }
    if (this.sprite && this.sprite.active) {
      this.sprite.destroy();
    }
    if (this.healthBarBg && this.healthBarBg.active) {
      this.healthBarBg.destroy();
    }
    if (this.healthBarFill && this.healthBarFill.active) {
      this.healthBarFill.destroy();
    }
  }

  /**
   * 获取位置
   */
  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  /**
   * 检查是否在范围内
   */
  isInRange(x, y, range) {
    const dx = this.sprite.x - x;
    const dy = this.sprite.y - y;
    return Math.sqrt(dx * dx + dy * dy) <= range;
  }
}

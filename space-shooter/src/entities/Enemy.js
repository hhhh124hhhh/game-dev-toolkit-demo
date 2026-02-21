import { ENEMY_CONFIG, BULLET_CONFIG, DEPTH } from '../config.js';

/**
 * Enemy - 敌人
 */
export class Enemy {
  constructor(scene, type, x, y) {
    this.scene = scene;
    this.type = type;
    this.config = ENEMY_CONFIG[type];

    // 状态初始化（防止 undefined bug）
    this.health = this.config.health;
    this.maxHealth = this.config.health;
    this.speed = this.config.speed;
    this.score = this.config.score;
    this.pattern = this.config.pattern;
    this.canShoot = this.config.canShoot;
    this.shootChance = this.config.shootChance;
    this.isAlive = true;
    this.startTime = scene.time.now;

    // 创建精灵
    this.sprite = scene.physics.add.image(x, y, `enemy_${type}`);
    this.sprite.setDepth(DEPTH.ENEMIES);
    this.sprite.setData('enemy', this);

    // 设置速度
    this.sprite.setVelocityY(this.speed);
  }

  /**
   * 更新敌人状态
   * @param {number} time - 当前时间
   * @param {number} playerX - 玩家 X 坐标（用于追踪模式）
   */
  update(time, playerX) {
    if (!this.isAlive || !this.sprite.active) return;

    // 应用移动模式
    this.applyPattern(time, playerX);

    // 检查是否超出屏幕
    if (this.sprite.y > this.scene.cameras.main.height + 50) {
      this.destroy();
      return;
    }

    // 敌人射击
    if (this.canShoot && Math.random() < this.shootChance) {
      this.shoot();
    }
  }

  /**
   * 应用移动模式
   */
  applyPattern(time, playerX) {
    const elapsed = time - this.startTime;

    switch (this.pattern) {
      case 'straight':
        // 直线向下，已设置
        break;

      case 'zigzag':
        // 左右摆动
        this.sprite.setVelocityX(Math.sin(elapsed * 0.005) * 100);
        break;

      case 'dive':
        // 追踪玩家
        const dx = playerX - this.sprite.x;
        this.sprite.setVelocityX(dx > 0 ? 50 : -50);
        break;

      case 'boss':
        // Boss 模式：水平移动
        if (this.sprite.y > 100) {
          this.sprite.setVelocityY(0);
          this.sprite.setVelocityX(Math.sin(elapsed * 0.002) * 100);
        }
        break;
    }
  }

  /**
   * 发射子弹
   */
  shoot() {
    const bulletPool = this.scene.enemyBulletPool;
    if (!bulletPool) return;

    bulletPool.fire(
      this.sprite.x,
      this.sprite.y + 20,
      0,
      BULLET_CONFIG.enemySpeed
    );
  }

  /**
   * 受到伤害
   * @param {number} damage - 伤害值
   */
  takeDamage(damage) {
    if (!this.isAlive) return;

    this.health -= damage;

    // 受击闪烁
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.5,
      duration: 50,
      yoyo: true,
      repeat: 1
    });

    if (this.health <= 0) {
      this.die();
    }
  }

  /**
   * 敌人死亡
   */
  die() {
    this.isAlive = false;

    // 通知场景
    this.scene.events.emit('enemy-killed', {
      enemy: this,
      score: this.score,
      x: this.sprite.x,
      y: this.sprite.y
    });

    // 爆炸效果
    this.createExplosion();

    // 销毁精灵
    this.sprite.destroy();
  }

  /**
   * 创建爆炸效果
   */
  createExplosion() {
    const explosion = this.scene.add.image(
      this.sprite.x,
      this.sprite.y,
      'explosion'
    ).setDepth(DEPTH.EXPLOSIONS);

    this.scene.tweens.add({
      targets: explosion,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => explosion.destroy()
    });
  }

  /**
   * 销毁敌人
   */
  destroy() {
    this.isAlive = false;
    if (this.sprite && this.sprite.active) {
      this.sprite.destroy();
    }
  }

  /**
   * 获取位置
   */
  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }
}

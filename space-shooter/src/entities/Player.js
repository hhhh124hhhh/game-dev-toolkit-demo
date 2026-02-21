import { PLAYER_CONFIG, BULLET_CONFIG, GAME_CONFIG, DEPTH } from '../config.js';

/**
 * Player - 玩家飞船
 */
export class Player {
  constructor(scene) {
    this.scene = scene;

    // 状态初始化（防止 undefined bug）
    this.lives = PLAYER_CONFIG.maxLives;
    this.score = 0;
    this.lastFireTime = 0;
    this.isInvincible = false;
    this.invincibleTimer = null;
    this.fireMultiplier = 1;
    this.fireMultiplierTimer = null;

    // 创建精灵
    this.sprite = scene.physics.add.image(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height - 80,
      'player_ship'
    );
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(DEPTH.PLAYER);
    this.sprite.setData('player', this);

    // 设置碰撞体大小
    this.sprite.body.setSize(30, 35);
  }

  /**
   * 处理输入
   * @param {Phaser.Types.Input.Keyboard.CursorKeys} cursors - 方向键
   * @param {Phaser.Input.Keyboard.Key} spaceKey - 空格键
   * @param {number} time - 当前时间
   */
  handleInput(cursors, spaceKey, time) {
    if (!this.sprite.active) return;

    // 水平移动
    if (cursors.left.isDown) {
      this.sprite.setVelocityX(-PLAYER_CONFIG.speed);
    } else if (cursors.right.isDown) {
      this.sprite.setVelocityX(PLAYER_CONFIG.speed);
    } else {
      this.sprite.setVelocityX(0);
    }

    // 垂直移动
    if (cursors.up.isDown) {
      this.sprite.setVelocityY(-PLAYER_CONFIG.speed);
    } else if (cursors.down.isDown) {
      this.sprite.setVelocityY(PLAYER_CONFIG.speed);
    } else {
      this.sprite.setVelocityY(0);
    }

    // 发射子弹
    if (spaceKey.isDown) {
      this.fire(time);
    }
  }

  /**
   * 发射子弹
   * @param {number} time - 当前时间
   */
  fire(time) {
    if (!this.sprite.active) return;

    // 检查射速
    if (time - this.lastFireTime < PLAYER_CONFIG.fireRate) return;

    // 从对象池获取子弹
    const bulletPool = this.scene.playerBulletPool;
    if (!bulletPool) return;

    const bullet = bulletPool.fire(
      this.sprite.x,
      this.sprite.y - 20,
      0,
      -BULLET_CONFIG.playerSpeed
    );

    if (bullet) {
      this.lastFireTime = time;

      // 双发效果
      if (this.fireMultiplier > 1) {
        bulletPool.fire(
          this.sprite.x - 15,
          this.sprite.y - 10,
          0,
          -BULLET_CONFIG.playerSpeed
        );
        bulletPool.fire(
          this.sprite.x + 15,
          this.sprite.y - 10,
          0,
          -BULLET_CONFIG.playerSpeed
        );
      }
    }
  }

  /**
   * 受到伤害
   */
  takeDamage() {
    if (this.isInvincible || !this.sprite.active) return;

    this.lives--;

    // 通知场景
    this.scene.events.emit('player-damaged', this.lives);

    if (this.lives <= 0) {
      this.die();
    } else {
      this.startInvincibility();
    }
  }

  /**
   * 开始无敌状态
   */
  startInvincibility() {
    this.isInvincible = true;

    // 闪烁效果
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: PLAYER_CONFIG.invincibleTime / 200,
      onComplete: () => {
        this.sprite.setAlpha(1);
        this.isInvincible = false;
      }
    });
  }

  /**
   * 收集道具
   * @param {string} type - 道具类型
   * @param {number} duration - 持续时间
   */
  collectPowerup(type, duration) {
    switch (type) {
      case 'heal':
        this.lives = Math.min(this.lives + 1, PLAYER_CONFIG.maxLives);
        this.scene.events.emit('player-healed', this.lives);
        break;

      case 'doubleFire':
        this.fireMultiplier = 2;
        if (this.fireMultiplierTimer) {
          this.fireMultiplierTimer.destroy();
        }
        this.fireMultiplierTimer = this.scene.time.delayedCall(duration, () => {
          this.fireMultiplier = 1;
        });
        break;

      case 'shield':
        this.isInvincible = true;
        if (this.invincibleTimer) {
          this.invincibleTimer.destroy();
        }
        this.invincibleTimer = this.scene.time.delayedCall(duration, () => {
          this.isInvincible = false;
        });
        break;
    }
  }

  /**
   * 玩家死亡
   */
  die() {
    this.sprite.setActive(false);
    this.sprite.setVisible(false);

    // 通知场景
    this.scene.events.emit('player-died');
  }

  /**
   * 重置玩家
   */
  reset() {
    this.lives = PLAYER_CONFIG.maxLives;
    this.score = 0;
    this.isInvincible = false;
    this.fireMultiplier = 1;

    this.sprite.setPosition(GAME_CONFIG.width / 2, GAME_CONFIG.height - 80);
    this.sprite.setActive(true);
    this.sprite.setVisible(true);
    this.sprite.setAlpha(1);
  }

  /**
   * 获取位置
   */
  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  /**
   * 销毁
   */
  destroy() {
    if (this.invincibleTimer) {
      this.invincibleTimer.destroy();
    }
    if (this.fireMultiplierTimer) {
      this.fireMultiplierTimer.destroy();
    }
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
}

import { GAME_CONFIG } from '../config.js';

// 获取 Phaser（全局或导入）
const PhaserLib = typeof Phaser !== 'undefined' ? Phaser : (await import('phaser')).default;

/**
 * Ball - 游戏中的球实体
 */
export class Ball extends PhaserLib.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'ball');

    // 初始化属性
    this.radius = GAME_CONFIG.ball.radius;
    this.isLaunched = false;

    // 添加到场景
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // 关键修复：设置圆形碰撞体
    this.body.setCircle(this.radius);

    // 物理设置
    this.setCollideWorldBounds(true);
    this.setBounce(1);
    this.body.onWorldBounds = true;

    // 初始速度为0
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
  }

  /**
   * 发射球
   * @param {number} speed - 发射速度
   */
  launch(speed = GAME_CONFIG.ball.speed) {
    if (this.isLaunched) return;

    this.isLaunched = true;

    // 随机角度向上发射 (-45 到 45 度)
    const angle = PhaserLib.Math.Between(-45, 45);

    // 从角度计算速度向量（向上发射）
    const rad = PhaserLib.Math.DegToRad(angle - 90);
    const clampedSpeed = Math.min(speed, GAME_CONFIG.ball.maxSpeed);

    this.body.velocity.x = Math.cos(rad) * clampedSpeed;
    this.body.velocity.y = Math.sin(rad) * clampedSpeed;
  }

  /**
   * 重置球位置
   * @param {number} x - 新X坐标
   * @param {number} y - 新Y坐标
   */
  reset(x, y) {
    this.x = x;
    this.y = y;
    this.isLaunched = false;
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
  }

  /**
   * 限制最大速度
   */
  limitSpeed() {
    const speed = Math.sqrt(
      this.body.velocity.x ** 2 + this.body.velocity.y ** 2
    );

    // 防止 NaN、0 或 Infinity
    if (!speed || !isFinite(speed) || speed <= GAME_CONFIG.ball.maxSpeed) {
      return;
    }

    const scale = GAME_CONFIG.ball.maxSpeed / speed;
    this.body.velocity.x *= scale;
    this.body.velocity.y *= scale;
  }
}

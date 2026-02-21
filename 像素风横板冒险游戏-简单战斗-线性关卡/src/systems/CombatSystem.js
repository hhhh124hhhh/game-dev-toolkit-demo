/**
 * Combat System
 * 战斗系统 - 处理攻击判定、伤害计算、击退效果
 *
 * 功能:
 * - 攻击框 vs 受击框判定
 * - 伤害计算
 * - 击退效果
 * - 无敌帧处理
 */

import { GameConfig, GameEvents } from '../config.js';

export class CombatSystem {
  constructor(scene) {
    this.scene = scene;

    // Groups for collision
    this.enemies = null;
    this.enemyProjectiles = null;

    // Player reference
    this.player = null;

    // Setup event listeners
    this.setupEvents();
  }

  setupEvents() {
    // Listen for player attack
    this.scene.events.on('player:attack', this.onPlayerAttack, this);

    // Listen for game events
    this.scene.events.once('shutdown', this.destroy, this);
  }

  setPlayer(player) {
    this.player = player;
  }

  setEnemies(enemies) {
    this.enemies = enemies;
  }

  setEnemyProjectiles(projectiles) {
    this.enemyProjectiles = projectiles;
  }

  // ============ Player Attack ============
  onPlayerAttack(attackHitbox) {
    if (!this.enemies) return;

    // Check overlap with all enemies
    this.enemies.getChildren().forEach(enemy => {
      if (!enemy.isAlive) return;

      // Check if attack hitbox overlaps with enemy
      const overlap = this.scene.physics.overlap(attackHitbox, enemy);

      if (overlap) {
        this.hitEnemy(enemy);
      }
    });
  }

  hitEnemy(enemy) {
    // Calculate knockback direction
    const knockbackDir = this.player.x < enemy.x ? 1 : -1;

    // Apply damage
    enemy.takeDamage(GameConfig.combat.attackDamage, knockbackDir);

    // 播放命中音效
    if (this.scene.sound.get('hit')) {
      this.scene.sound.play('hit', { volume: 0.5 });
    }

    // Play hit effect with enhanced particles
    this.playHitEffect(enemy.x, enemy.y);

    // Enhanced camera shake - stronger feedback
    this.scene.cameras.main.shake(100, 0.01);

    // Hit pause - brief freeze for impact feel
    this.applyHitPause(50);
  }

  /**
   * 击中暂停效果 - 短暂冻结增强打击感
   */
  applyHitPause(duration = 50) {
    // 暂停物理和时间
    this.scene.physics.pause();

    this.scene.time.delayedCall(duration, () => {
      this.scene.physics.resume();
    });
  }

  // ============ Enemy Attack ============
  checkEnemyCollisions() {
    if (!this.player || !this.player.isAlive) return;

    // Check enemy projectiles
    if (this.enemyProjectiles) {
      this.enemyProjectiles.getChildren().forEach(projectile => {
        if (!projectile.active) return;

        const overlap = this.scene.physics.overlap(projectile, this.player);
        if (overlap) {
          const knockbackDir = projectile.x < this.player.x ? 1 : -1;
          this.player.takeDamage(1, knockbackDir);
          projectile.destroy();
        }
      });
    }
  }

  // ============ Effects ============
  playHitEffect(x, y) {
    // 1. Flash effect at hit location (保持原有闪光)
    const flash = this.scene.add.circle(x, y, 20, 0xffffff, 0.8);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.5,
      duration: 150,
      onComplete: () => flash.destroy()
    });

    // 2. 命中火花粒子爆发
    this.createHitParticles(x, y);

    // 3. 冲击波环
    this.createImpactRing(x, y);
  }

  /**
   * 创建命中粒子爆发效果
   */
  createHitParticles(x, y) {
    // 检查纹理是否存在
    if (!this.scene.textures.exists('hit_spark')) {
      return;
    }

    // 创建粒子发射器
    const particles = this.scene.add.particles(x, y, 'hit_spark', {
      speed: { min: 150, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 300,
      quantity: 15,
      blendMode: 'ADD',
      emitting: false
    });

    // 一次性爆发
    particles.explode(15);

    // 自动销毁
    this.scene.time.delayedCall(400, () => {
      particles.destroy();
    });
  }

  /**
   * 创建冲击波环效果
   */
  createImpactRing(x, y) {
    const ring = this.scene.add.circle(x, y, 10, 0xffffff, 0);
    ring.setStrokeStyle(3, 0xffff00, 1);

    this.scene.tweens.add({
      targets: ring,
      radius: 40,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => ring.destroy()
    });
  }

  // ============ Update ============
  update() {
    // Check ongoing collisions
    this.checkEnemyCollisions();
  }

  // ============ Cleanup ============
  destroy() {
    this.scene.events.off('player:attack', this.onPlayerAttack, this);
  }
}

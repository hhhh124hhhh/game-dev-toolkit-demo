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

    // Play hit effect
    this.playHitEffect(enemy.x, enemy.y);

    // Camera shake
    this.scene.cameras.main.shake(50, 0.005);
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
    // Flash effect at hit location
    const flash = this.scene.add.circle(x, y, 20, 0xffffff, 0.8);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.5,
      duration: 150,
      onComplete: () => flash.destroy()
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

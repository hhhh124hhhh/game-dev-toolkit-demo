/**
 * Boss Enemy
 * Boss - 多阶段攻击敌人
 *
 * 行为:
 * - 阶段1 (70%+ HP): 缓慢移动 + 单次弹幕
 * - 阶段2 (30%-70% HP): 冲撞攻击 + 三连弹幕
 * - 阶段3 (<30% HP): 快速冲撞 + 弹幕风暴
 */

import { Enemy } from './Enemy.js';
import { GameConfig, GameEvents, EnemyState } from '../config.js';

export class Boss extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss', GameConfig.enemies.boss);

    // Boss specific
    this.phase = 1;
    this.attackCooldown = 0;
    this.isCharging = false;
    this.chargeTarget = null;
    this.projectiles = scene.physics.add.group();

    // Size
    this.setSize(48, 64);
    this.setOffset(8, 0);

    // Health bar
    this.createHealthBar();

    // Start patrolling
    this.stateMachine.setState(EnemyState.PATROL);
  }

  createHealthBar() {
    this.healthBarBg = this.scene.add.rectangle(this.x, this.y - 50, 60, 8, 0x333333);
    this.healthBarFill = this.scene.add.rectangle(this.x, this.y - 50, 58, 6, 0xff0000);
    this.healthBarBg.setDepth(100);
    this.healthBarFill.setDepth(101);
  }

  update(time, delta) {
    super.update(time, delta);

    // Update health bar position
    if (this.healthBarBg && this.healthBarFill) {
      this.healthBarBg.setPosition(this.x, this.y - 50);
      this.healthBarFill.setPosition(this.x, this.y - 50);

      // Update health bar width
      const healthPercent = this.health / this.config.health;
      this.healthBarFill.setSize(58 * healthPercent, 6);
    }

    // Update attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }

    // Update phase based on health
    this.updatePhase();

    // Contact damage
    if (this.player && this.isAlive && !this.isHurt) {
      if (this.scene.physics.overlap(this, this.player)) {
        const knockbackDir = this.player.x > this.x ? 1 : -1;
        this.player.takeDamage(this.config.damage, knockbackDir);
      }
    }
  }

  updatePhase() {
    const healthPercent = this.health / this.config.health;

    if (healthPercent <= 0.3 && this.phase < 3) {
      this.phase = 3;
      this.onPhaseChange(3);
    } else if (healthPercent <= 0.7 && this.phase < 2) {
      this.phase = 2;
      this.onPhaseChange(2);
    }
  }

  onPhaseChange(newPhase) {
    // Visual feedback for phase change
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 3
    });

    // Emit phase change event
    this.scene.events.emit('boss:phase', newPhase);
  }

  onPatrolEnter() {
    this.isCharging = false;
  }

  onPatrolUpdate(time, delta) {
    // Slow patrol movement
    const direction = this.getDirectionToPlayer();
    this.setVelocityX(direction * this.config.speed * 0.5);
    this.faceDirection(direction);

    // Attack when cooldown is ready
    if (this.attackCooldown <= 0 && this.isPlayerInRange(300)) {
      this.stateMachine.setState(EnemyState.ATTACK);
    }
  }

  onChaseEnter() {
    // Chase is used for charging attack
    this.isCharging = true;
  }

  onChaseUpdate(time, delta) {
    if (!this.isCharging || !this.chargeTarget) {
      this.stateMachine.setState(EnemyState.PATROL);
      return;
    }

    // Move towards charge target
    const dx = this.chargeTarget.x - this.x;
    const dy = this.chargeTarget.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 20) {
      this.setVelocity(
        (dx / distance) * GameConfig.enemies.boss.chargeSpeed,
        (dy / distance) * GameConfig.enemies.boss.chargeSpeed * 0.3
      );
    } else {
      // Reached charge target
      this.isCharging = false;
      this.stateMachine.setState(EnemyState.PATROL);
    }
  }

  onAttackEnter() {
    this.setVelocity(0, 0);

    // Choose attack based on phase
    if (this.phase === 1) {
      this.performProjectileAttack(1);
    } else if (this.phase === 2) {
      // 50% chance for charge, 50% for projectiles
      if (Math.random() > 0.5) {
        this.performChargeAttack();
      } else {
        this.performProjectileAttack(3);
      }
    } else {
      // Phase 3: aggressive
      this.performProjectileAttack(5);
      this.scene.time.delayedCall(500, () => {
        if (this.isAlive) this.performChargeAttack();
      });
    }

    // Set cooldown based on phase
    this.attackCooldown = this.phase === 3 ? 1500 : 2500;

    // Return to patrol after attack
    this.scene.time.delayedCall(1000, () => {
      if (this.isAlive && !this.isHurt) {
        this.stateMachine.setState(EnemyState.PATROL);
      }
    });
  }

  onAttackUpdate(time, delta) {
    // Attack is handled by timers in onAttackEnter
  }

  performProjectileAttack(count = 1) {
    if (!this.player) return;

    for (let i = 0; i < count; i++) {
      this.scene.time.delayedCall(i * 200, () => {
        if (!this.isAlive) return;

        const projectile = this.scene.add.circle(this.x, this.y, 8, 0xff6600);
        this.projectiles.add(projectile);
        projectile.body.setAllowGravity(false);

        // Aim at player with some randomness
        const angle = Phaser.Math.Angle.Between(
          this.x, this.y,
          this.player.x + Phaser.Math.Between(-50, 50),
          this.player.y + Phaser.Math.Between(-30, 30)
        );

        const speed = GameConfig.enemies.boss.projectileSpeed;
        this.scene.physics.velocityFromAngle(
          Phaser.Math.RadToDeg(angle),
          speed,
          projectile.body.velocity
        );

        // Destroy after 3 seconds
        this.scene.time.delayedCall(3000, () => {
          if (projectile.active) projectile.destroy();
        });
      });
    }
  }

  performChargeAttack() {
    if (!this.player) return;

    this.isCharging = true;
    this.chargeTarget = { x: this.player.x, y: this.player.y };
    this.stateMachine.setState(EnemyState.CHASE);

    // Visual indicator
    this.setTint(0xff0000);
    this.scene.time.delayedCall(200, () => {
      this.clearTint();
    });
  }

  die() {
    // Destroy projectiles
    this.projectiles.destroy(true);

    // Destroy health bar
    if (this.healthBarBg) this.healthBarBg.destroy();
    if (this.healthBarFill) this.healthBarFill.destroy();

    // Emit boss defeated event
    this.scene.events.emit(GameEvents.LEVEL_COMPLETE);

    super.die();
  }

  getProjectiles() {
    return this.projectiles;
  }
}

/**
 * Enemy Base Class
 * 敌人基类 - 所有敌人的父类
 *
 * 包含:
 * - 状态机管理 (IDLE, PATROL, CHASE, ATTACK, HURT, DEAD)
 * - 生命值和伤害
 * - 与玩家的交互
 */

import { EnemyState, GameEvents } from '../config.js';
import { StateMachine } from '../utils/StateMachine.js';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, config = {}) {
    super(scene, x, y, texture);

    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Store scene reference
    this.scene = scene;

    // Physics setup
    this.setCollideWorldBounds(true);
    this.body.setAllowGravity(true);

    // Default config
    this.config = {
      health: config.health || 1,
      damage: config.damage || 1,
      speed: config.speed || 80,
      chaseSpeed: config.chaseSpeed || 120,
      detectionRange: config.detectionRange || 150,
      attackRange: config.attackRange || 30,
      ...config
    };

    // Stats
    this.health = this.config.health;
    this.isAlive = true;
    this.facingRight = true;

    // Hurt state
    this.isHurt = false;
    this.hurtTimer = 0;
    this.knockbackDirection = 0;

    // Player reference (set by scene)
    this.player = null;

    // Setup state machine
    this.setupStateMachine();

    console.log('[Enemy] Created', texture, 'at', x, y, 'with speed:', this.config.speed);
  }

  setupStateMachine() {
    this.stateMachine = new StateMachine(EnemyState.IDLE, {
      [EnemyState.IDLE]: {
        onEnter: () => this.onIdleEnter(),
        onUpdate: (time, delta) => this.onIdleUpdate(time, delta)
      },
      [EnemyState.PATROL]: {
        onEnter: () => this.onPatrolEnter(),
        onUpdate: (time, delta) => this.onPatrolUpdate(time, delta)
      },
      [EnemyState.CHASE]: {
        onEnter: () => this.onChaseEnter(),
        onUpdate: (time, delta) => this.onChaseUpdate(time, delta)
      },
      [EnemyState.ATTACK]: {
        onEnter: () => this.onAttackEnter(),
        onUpdate: (time, delta) => this.onAttackUpdate(time, delta)
      },
      [EnemyState.HURT]: {
        onEnter: () => this.onHurtEnter(),
        onUpdate: (time, delta) => this.onHurtUpdate(time, delta)
      },
      [EnemyState.DEAD]: {
        onEnter: () => this.onDeadEnter(),
        onUpdate: () => {}
      }
    });
  }

  // ============ Main Update ============
  update(time, delta) {
    if (!this.isAlive) return;

    // Update state machine
    this.stateMachine.update(time, delta);

    // Update hurt state
    if (this.isHurt) {
      this.hurtTimer -= delta;
      if (this.hurtTimer <= 0) {
        this.isHurt = false;
        this.clearTint();
        if (this.health > 0) {
          this.stateMachine.setState(EnemyState.PATROL);
        }
      }
    }
  }

  setPlayer(player) {
    this.player = player;
  }

  // ============ Distance Helpers ============
  getDistanceToPlayer() {
    if (!this.player) return Infinity;
    return Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
  }

  getDirectionToPlayer() {
    if (!this.player) return 0;
    return this.player.x > this.x ? 1 : -1;
  }

  isPlayerInRange(range) {
    return this.getDistanceToPlayer() <= range;
  }

  // ============ Damage System ============
  takeDamage(amount = 1, knockbackDirection = 0) {
    if (this.isHurt || !this.isAlive) return;

    this.health -= amount;
    this.knockbackDirection = knockbackDirection;

    if (this.health <= 0) {
      this.die();
    } else {
      this.isHurt = true;
      this.hurtTimer = 300; // 300ms hurt duration
      this.stateMachine.setState(EnemyState.HURT);
    }
  }

  die() {
    this.isAlive = false;
    this.stateMachine.setState(EnemyState.DEAD);
    this.scene.events.emit(GameEvents.ENEMY_KILLED, this);

    // Death animation and cleanup
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: this.y - 30,
      duration: 300,
      onComplete: () => this.destroy()
    });
  }

  // ============ State Callbacks (Override in subclasses) ============
  onIdleEnter() {
    this.setVelocityX(0);
  }

  onIdleUpdate(time, delta) {
    // Default: switch to patrol after a short delay
    if (this.isPlayerInRange(this.config.detectionRange)) {
      this.stateMachine.setState(EnemyState.CHASE);
    }
  }

  onPatrolEnter() {
    // Override in subclass
  }

  onPatrolUpdate(time, delta) {
    // Override in subclass
  }

  onChaseEnter() {
    // Override in subclass
  }

  onChaseUpdate(time, delta) {
    // Override in subclass
  }

  onAttackEnter() {
    // Override in subclass
  }

  onAttackUpdate(time, delta) {
    // Override in subclass
  }

  onHurtEnter() {
    this.setTint(0xff0000);
    // Apply knockback
    this.setVelocity(this.knockbackDirection * 150, -100);
  }

  onHurtUpdate(time, delta) {
    // Wait for hurt timer to finish (handled in update)
  }

  onDeadEnter() {
    this.setVelocity(0, 0);
    this.body.setAllowGravity(false);
  }

  // ============ Face Direction ============
  faceDirection(direction) {
    this.facingRight = direction > 0;
    this.setFlipX(!this.facingRight);
  }
}

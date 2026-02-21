/**
 * Flyer Enemy
 * 飞行怪 - 悬浮追踪敌人
 *
 * 行为:
 * - 上下悬浮
 * - 追踪玩家
 * - 俯冲攻击
 */

import { Enemy } from './Enemy.js';
import { GameConfig, EnemyState } from '../config.js';

export class Flyer extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'flyer', GameConfig.enemies.flyer);

    // Flyer specific
    this.hoverY = y;
    this.hoverTime = 0;
    this.isDiving = false;
    this.diveTimer = 0;

    // 预警系统 - 发现玩家后先警告再追击
    this.alertTimer = 0;
    this.alertDuration = 500; // 500ms 预警时间
    this.isAlerting = false;

    // Size
    this.setSize(28, 24);
    this.setOffset(2, 4);

    // No gravity for flying enemy
    this.body.setAllowGravity(false);

    // Start patrolling (hovering)
    this.stateMachine.setState(EnemyState.PATROL);
  }

  update(time, delta) {
    super.update(time, delta);

    // Contact damage
    if (this.player && this.isAlive && !this.isHurt) {
      if (this.scene.physics.overlap(this, this.player)) {
        const knockbackDir = this.player.x > this.x ? 1 : -1;
        this.player.takeDamage(this.config.damage, knockbackDir);
      }
    }
  }

  onPatrolEnter() {
    this.isDiving = false;
  }

  onPatrolUpdate(time, delta) {
    // Hover animation
    this.hoverTime += delta * 0.005;
    const hoverOffset = Math.sin(this.hoverTime * GameConfig.enemies.flyer.hoverSpeed) *
                        GameConfig.enemies.flyer.hoverAmplitude;
    this.y = this.hoverY + hoverOffset;

    // Slow horizontal drift
    this.setVelocityX(this.facingRight ? this.config.speed * 0.3 : -this.config.speed * 0.3);

    // 预警系统 - 发现玩家后先警告再追击
    if (this.isPlayerInRange(this.config.detectionRange)) {
      if (!this.isAlerting) {
        // 开始预警
        this.isAlerting = true;
        this.alertTimer = this.alertDuration;
        // 显示警告效果（闪烁）
        this.setTint(0xffff00);
      } else {
        // 预警倒计时
        this.alertTimer -= delta;
        // 闪烁效果
        const flash = Math.sin(this.alertTimer * 0.02) > 0;
        this.setTint(flash ? 0xffff00 : 0xffffff);

        if (this.alertTimer <= 0) {
          // 预警结束，开始追击
          this.clearTint();
          this.isAlerting = false;
          this.stateMachine.setState(EnemyState.CHASE);
        }
      }
    } else {
      // 玩家离开检测范围，取消预警
      if (this.isAlerting) {
        this.isAlerting = false;
        this.clearTint();
      }
    }
  }

  onChaseEnter() {
    this.isDiving = false;
  }

  onChaseUpdate(time, delta) {
    if (!this.player || !this.player.isAlive) {
      this.stateMachine.setState(EnemyState.PATROL);
      return;
    }

    // Track player position
    const direction = this.getDirectionToPlayer();
    this.faceDirection(direction);

    // Move towards player
    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      this.setVelocity(
        (dx / distance) * this.config.chaseSpeed,
        (dy / distance) * this.config.chaseSpeed * 0.5
      );
    }

    // Dive attack when close enough
    if (this.isPlayerInRange(this.config.attackRange * 2)) {
      this.stateMachine.setState(EnemyState.ATTACK);
    }

    // Lose interest if player is too far
    if (!this.isPlayerInRange(this.config.detectionRange * 1.5)) {
      this.stateMachine.setState(EnemyState.PATROL);
    }
  }

  onAttackEnter() {
    this.isDiving = true;
    this.diveTimer = 500; // 500ms dive
  }

  onAttackUpdate(time, delta) {
    if (!this.player || !this.player.isAlive) {
      this.stateMachine.setState(EnemyState.PATROL);
      return;
    }

    // Dive towards player
    if (this.isDiving) {
      const direction = this.getDirectionToPlayer();
      this.setVelocity(
        direction * GameConfig.enemies.flyer.diveSpeed,
        GameConfig.enemies.flyer.diveSpeed * 0.5
      );

      this.diveTimer -= delta;
      if (this.diveTimer <= 0) {
        this.isDiving = false;
        this.stateMachine.setState(EnemyState.CHASE);
      }
    }
  }

  onHurtEnter() {
    super.onHurtEnter();
    this.isDiving = false;
    // Reset hover position after hurt
    this.scene.time.delayedCall(300, () => {
      this.hoverY = this.y;
    });
  }
}

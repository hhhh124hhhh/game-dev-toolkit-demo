/**
 * Slime Enemy
 * 史莱姆 - 地面巡逻敌人
 *
 * 行为:
 * - 左右巡逻
 * - 发现玩家后追击
 * - 接触造成伤害
 */

import { Enemy } from './Enemy.js';
import { GameConfig, EnemyState } from '../config.js';

export class Slime extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'slime', GameConfig.enemies.slime);

    // Slime specific
    this.patrolDirection = 1;
    this.patrolStartX = x;
    this.patrolDistance = GameConfig.enemies.slime.patrolDistance;

    // 转向冷却 - 防止快速反复转向导致卡住
    this.turnCooldown = 0;
    this.turnCooldownTime = 200; // 200ms 转向冷却

    // Size - set physics body size
    this.setSize(24, 20);
    this.setOffset(4, 12);

    // Start patrolling
    this.stateMachine.setState(EnemyState.PATROL);

    console.log('[Slime] Created at', x, y, '- player ref:', this.player);
  }

  setPlayer(player) {
    super.setPlayer(player);
    console.log('[Slime] setPlayer called - player:', player ? 'set' : 'null');
  }

  update(time, delta) {
    super.update(time, delta);

    // Contact damage
    if (this.player && this.isAlive && !this.isHurt) {
      const isOverlapping = this.scene.physics.overlap(this, this.player);
      if (isOverlapping) {
        const knockbackDir = this.player.x > this.x ? 1 : -1;
        console.log('[Slime] Overlap detected! Dealing damage to player. Player health before:', this.player.health);
        this.player.takeDamage(this.config.damage, knockbackDir);
        console.log('[Slime] Player health after:', this.player.health, 'isInvincible:', this.player.isInvincible);
      }
    }
  }

  onPatrolEnter() {
    // Start moving in patrol direction
    console.log('[Slime] onPatrolEnter, velocityX:', this.patrolDirection * this.config.speed);
    this.setVelocityX(this.patrolDirection * this.config.speed);
    this.faceDirection(this.patrolDirection);
  }

  onPatrolUpdate(time, delta) {
    // 更新转向冷却
    if (this.turnCooldown > 0) {
      this.turnCooldown -= delta;
    }

    // 检查是否需要转向（使用冷却防止快速反复转向）
    let shouldTurn = false;

    // Check patrol bounds
    if (Math.abs(this.x - this.patrolStartX) >= this.patrolDistance) {
      shouldTurn = true;
    }

    // Check for walls
    if (this.body.touching.left || this.body.touching.right) {
      shouldTurn = true;
    }

    // Edge detection: 如果前方没有地面，转向
    if (!this.hasGroundAhead(this.patrolDirection) && this.body.touching.down) {
      shouldTurn = true;
    }

    // 只有在冷却结束时才允许转向
    if (shouldTurn && this.turnCooldown <= 0) {
      this.patrolDirection *= -1;
      this.faceDirection(this.patrolDirection);
      this.turnCooldown = this.turnCooldownTime;
    }

    // Move
    this.setVelocityX(this.patrolDirection * this.config.speed);

    // Check for player detection
    if (this.isPlayerInRange(this.config.detectionRange)) {
      this.stateMachine.setState(EnemyState.CHASE);
    }
  }

  onChaseEnter() {
    // Chase the player
  }

  // 检查前方是否有地面
  hasGroundAhead(direction) {
    const aheadX = this.x + (direction * 25); // 前方25像素
    const aheadY = this.y + 20; // 脚下位置

    const platforms = this.scene.levelManager ? this.scene.levelManager.getPlatforms() : null;
    if (!platforms) return true; // 如果没有平台引用，假设有地面

    let hasGround = false;
    platforms.getChildren().forEach(platform => {
      const bounds = platform.getBounds();
      // 严格检查：前方点必须在平台范围内
      if (aheadX >= bounds.x && aheadX <= bounds.x + bounds.width &&
          aheadY >= bounds.y - 10 && aheadY <= bounds.y + bounds.height) {
        hasGround = true;
      }
    });
    return hasGround;
  }

  onChaseUpdate(time, delta) {
    if (!this.player || !this.player.isAlive) {
      this.stateMachine.setState(EnemyState.PATROL);
      return;
    }

    const direction = this.getDirectionToPlayer();

    // Edge detection: 不追击到坑里
    if (!this.hasGroundAhead(direction) && this.body.touching.down) {
      this.stateMachine.setState(EnemyState.PATROL);
      return;
    }

    // Wall detection: 撞墙时停止追击
    if ((direction > 0 && this.body.touching.right) ||
        (direction < 0 && this.body.touching.left)) {
      this.stateMachine.setState(EnemyState.PATROL);
      return;
    }

    this.setVelocityX(direction * this.config.chaseSpeed);
    this.faceDirection(direction);

    // Check attack range
    if (this.isPlayerInRange(this.config.attackRange)) {
      this.stateMachine.setState(EnemyState.ATTACK);
    }

    // Lose interest if player is too far
    if (!this.isPlayerInRange(this.config.detectionRange * 2)) {
      this.stateMachine.setState(EnemyState.PATROL);
    }
  }

  onAttackEnter() {
    // 继续移动追击玩家，不停止
    // 接触伤害在 update() 中通过 overlap 检测处理
  }

  onAttackUpdate(time, delta) {
    if (!this.player || !this.player.isAlive) {
      this.stateMachine.setState(EnemyState.PATROL);
      return;
    }

    const direction = this.getDirectionToPlayer();

    // Wall detection: 撞墙时停止攻击
    if ((direction > 0 && this.body.touching.right) ||
        (direction < 0 && this.body.touching.left)) {
      this.stateMachine.setState(EnemyState.PATROL);
      return;
    }

    // 在攻击范围内继续追击玩家
    this.setVelocityX(direction * this.config.chaseSpeed);
    this.faceDirection(direction);

    // 玩家离开攻击范围，切换回追击状态
    if (!this.isPlayerInRange(this.config.attackRange * 1.5)) {
      this.stateMachine.setState(EnemyState.CHASE);
    }

    // 玩家离开检测范围，切换回巡逻状态
    if (!this.isPlayerInRange(this.config.detectionRange * 2)) {
      this.stateMachine.setState(EnemyState.PATROL);
    }
  }
}

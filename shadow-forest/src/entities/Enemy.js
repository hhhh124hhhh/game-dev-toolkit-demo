/**
 * Enemy 敌人实体
 * 《暗影森林》Shadow Forest
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';

// 敌人状态枚举
export const EnemyState = {
  IDLE: 'idle',
  PATROL: 'patrol',
  CHASE: 'chase',
  ATTACK: 'attack',
  HURT: 'hurt',
  DEAD: 'dead'
};

export class Enemy {
  constructor(scene, x, y, config = {}) {
    this.scene = scene;
    this.sprite = null;

    // 属性 - 使用配置或默认值
    this.maxHealth = config.health || GAME_CONFIG.ENEMY.MAX_HEALTH;
    this.health = this.maxHealth;
    this.attack = config.attack || GAME_CONFIG.ENEMY.ATTACK;
    this.speed = config.speed || GAME_CONFIG.ENEMY.SPEED;

    // AI 配置
    this.detectionRange = config.detectionRange || GAME_CONFIG.ENEMY.DETECTION_RANGE;
    this.attackRange = config.attackRange || GAME_CONFIG.ENEMY.ATTACK_RANGE;
    this.patrolRange = config.patrolRange || GAME_CONFIG.ENEMY.PATROL_RANGE;

    // 经验奖励
    this.expReward = config.expReward || GAME_CONFIG.ENEMY.EXP_REWARD;

    // 状态机
    this.state = EnemyState.PATROL;
    this.facingRight = config.facingRight !== undefined ? config.facingRight : true;
    this.startX = x;

    // 冷却
    this.attackCooldown = 0;
    this.turnCooldown = 0;
    this.hurtCooldown = 0;

    // 创建精灵
    this.createSprite(x, y);

    // 血条配置
    this.healthBarWidth = 40;
    this.healthBarHeight = 4;
    this.healthBarOffsetY = -25;  // 敌人头顶上方
    this.healthBar = null;
    this.createHealthBar();
  }

  createHealthBar() {
    this.healthBar = this.scene.add.graphics();
    this.updateHealthBar();
  }

  updateHealthBar() {
    if (!this.healthBar || !this.sprite) return;

    this.healthBar.clear();

    const x = this.sprite.x - this.healthBarWidth / 2;
    const y = this.sprite.y + this.healthBarOffsetY;
    const healthPercent = this.health / this.maxHealth;

    // 背景（黑色边框）
    this.healthBar.fillStyle(0x000000, 0.8);
    this.healthBar.fillRect(x - 1, y - 1, this.healthBarWidth + 2, this.healthBarHeight + 2);

    // 根据生命值确定颜色（绿→黄→红）
    let color;
    if (healthPercent < 0.3) {
      color = 0xff0000;  // 红色 - 低血量
    } else if (healthPercent < 0.6) {
      color = 0xffff00;  // 黄色 - 中等血量
    } else {
      color = 0x00ff00;  // 绿色 - 高血量
    }

    // 填充血条
    const fillWidth = Math.floor(this.healthBarWidth * healthPercent);
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(x, y, fillWidth, this.healthBarHeight);
  }

  createSprite(x, y) {
    this.sprite = this.scene.physics.add.sprite(x, y, 'enemy');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setData('entity', this);

    // 设置碰撞体
    this.sprite.body.setSize(24, 24);
    this.sprite.body.setOffset(4, 4);
  }

  update(player, time, delta) {
    if (this.state === EnemyState.DEAD) return;

    // 更新冷却
    this.updateCooldowns(delta);

    // 根据状态执行行为
    switch (this.state) {
      case EnemyState.PATROL:
        this.onPatrolUpdate(time, delta);
        break;
      case EnemyState.CHASE:
        this.onChaseUpdate(player, time, delta);
        break;
      case EnemyState.ATTACK:
        this.onAttackUpdate(player, time, delta);
        break;
      case EnemyState.HURT:
        // 受伤状态不移动
        if (this.sprite && this.sprite.body) {
          this.sprite.body.setVelocityX(0);
        }
        break;
    }

    // 状态转换
    if (this.state !== EnemyState.HURT && this.state !== EnemyState.DEAD) {
      this.updateStateTransitions(player);
    }

    // 更新血条位置
    this.updateHealthBar();
  }

  updateCooldowns(delta) {
    if (this.attackCooldown > 0) this.attackCooldown -= delta;
    if (this.turnCooldown > 0) this.turnCooldown -= delta;
    if (this.hurtCooldown > 0) this.hurtCooldown -= delta;
  }

  onPatrolUpdate(time, delta) {
    // 安全检查
    if (!this.sprite || !this.sprite.body) return;

    const direction = this.facingRight ? 1 : -1;

    // 边缘检测 - 前方无地面时转向
    if (!this.hasGroundAhead(direction)) {
      this.turn();
      return;  // 立即转向，不继续移动
    }

    // 巡逻移动
    if (this.facingRight) {
      this.sprite.body.setVelocityX(this.speed);
      if (this.sprite.x > this.startX + this.patrolRange) {
        this.turn();
      }
    } else {
      this.sprite.body.setVelocityX(-this.speed);
      if (this.sprite.x < this.startX - this.patrolRange) {
        this.turn();
      }
    }

    // 更新朝向
    this.sprite.setFlipX(!this.facingRight);
  }

  onChaseUpdate(player, time, delta) {
    if (!player || !player.sprite) return;

    // 安全检查 sprite
    if (!this.sprite || !this.sprite.body) return;

    const direction = player.sprite.x > this.sprite.x ? 1 : -1;

    // 边缘检测 - 不追入坑中
    if (!this.hasGroundAhead(direction) && this.sprite.body.touching.down) {
      this.state = EnemyState.PATROL;
      return;
    }

    // 墙壁检测 - 撞墙停止追击
    if ((direction > 0 && this.sprite.body.touching.right) ||
        (direction < 0 && this.sprite.body.touching.left)) {
      this.state = EnemyState.PATROL;
      return;
    }

    // 追击移动（速度提升 1.5 倍）
    this.sprite.body.setVelocityX(direction * this.speed * 1.5);
    this.facingRight = direction > 0;
    this.sprite.setFlipX(!this.facingRight);

    // 注意：状态转换由 updateStateTransitions 统一处理
  }

  onAttackUpdate(player, time, delta) {
    // 安全检查
    if (!player || !player.sprite || player.isDead()) {
      this.state = EnemyState.PATROL;
      return;
    }

    // 安全检查 sprite
    if (!this.sprite || !this.sprite.body) {
      this.state = EnemyState.PATROL;
      return;
    }

    const direction = player.sprite.x > this.sprite.x ? 1 : -1;

    // 墙壁检测
    if ((direction > 0 && this.sprite.body.touching.right) ||
        (direction < 0 && this.sprite.body.touching.left)) {
      this.state = EnemyState.PATROL;
      return;
    }

    // 边缘检测 - 不追入坑中
    if (!this.hasGroundAhead(direction) && this.sprite.body.touching.down) {
      this.state = EnemyState.PATROL;
      return;
    }

    // 攻击时继续追击（不停止移动！）
    this.sprite.body.setVelocityX(direction * this.speed * 0.8);
    this.facingRight = direction > 0;
    this.sprite.setFlipX(!this.facingRight);

    // 注意：状态转换由 updateStateTransitions 统一处理
  }

  performAttack(player) {
    // 攻击现在由 GameScene 的 overlap 检测处理
    // 这里只做视觉效果
    if (this.sprite) {
      this.sprite.setTint(0xff6600);
      this.scene.time.delayedCall(100, () => {
        if (this.sprite && this.state !== EnemyState.DEAD) {
          this.sprite.clearTint();
        }
      });
    }
  }

  updateStateTransitions(player) {
    if (!player || !player.sprite) return;

    const distance = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      player.sprite.x, player.sprite.y
    );

    // PATROL → CHASE
    if (this.state === EnemyState.PATROL && distance < this.detectionRange) {
      this.state = EnemyState.CHASE;
      return;
    }

    // CHASE → ATTACK
    if (this.state === EnemyState.CHASE && distance < this.attackRange) {
      this.state = EnemyState.ATTACK;
      return;
    }

    // ATTACK → CHASE (玩家离开攻击范围)
    if (this.state === EnemyState.ATTACK && distance > this.attackRange * 1.5) {
      this.state = EnemyState.CHASE;
      return;
    }

    // CHASE → PATROL (丢失目标，使用滞后避免频繁切换)
    if (this.state === EnemyState.CHASE && distance > this.detectionRange * 2) {
      this.state = EnemyState.PATROL;
      return;
    }
  }

  hasGroundAhead(direction) {
    if (!this.sprite || !this.sprite.body) return true;  // 默认有地面，避免卡住

    // 检测点位置 - 在敌人前方下方
    const checkX = this.sprite.x + (direction * 40);
    const checkY = this.sprite.y + 40;  // 敌人脚下

    // 获取所有平台
    const platforms = this.scene.platforms;
    if (!platforms) return true;  // 安全默认值

    let hasGround = false;

    // 使用 getChildren 避免迭代问题
    const platformList = platforms.getChildren();

    for (let i = 0; i < platformList.length; i++) {
      const platform = platformList[i];
      if (!platform || !platform.active) continue;

      // 获取平台边界 - 使用 body 或 displayWidth/Height
      let halfWidth, halfHeight;
      if (platform.body) {
        halfWidth = platform.body.halfWidth || 32;
        halfHeight = platform.body.halfHeight || 16;
      } else {
        halfWidth = (platform.displayWidth || platform.width || 64) / 2;
        halfHeight = (platform.displayHeight || platform.height || 32) / 2;
      }

      const platformLeft = platform.x - halfWidth;
      const platformRight = platform.x + halfWidth;
      const platformTop = platform.y - halfHeight;

      // 检查检测点是否在平台上方
      if (checkX >= platformLeft && checkX <= platformRight) {
        // 检查垂直距离是否合理（平台在脚下附近）
        if (platformTop >= checkY - 15 && platformTop <= checkY + 40) {
          hasGround = true;
          break;  // 找到地面就退出
        }
      }
    }

    return hasGround;
  }

  turn() {
    if (this.turnCooldown > 0) return;

    this.facingRight = !this.facingRight;
    this.turnCooldown = 500; // 500ms 转向冷却
  }

  takeDamage(amount) {
    if (this.state === EnemyState.DEAD) return 0;

    this.health = Math.max(0, this.health - amount);

    // 更新血条显示
    this.updateHealthBar();

    // 受伤状态
    if (this.health > 0) {
      this.state = EnemyState.HURT;
      this.hurtCooldown = 300;

      // 受伤视觉反馈
      this.sprite.setTint(0xff0000);

      // 恢复
      this.scene.time.delayedCall(300, () => {
        if (this.state !== EnemyState.DEAD) {
          this.state = EnemyState.PATROL;
          this.sprite.clearTint();
        }
      });
    } else {
      // 死亡
      this.state = EnemyState.DEAD;
      this.die();
    }

    return amount;
  }

  die() {
    // 防止重复死亡
    if (this.state === EnemyState.DEAD) return;

    // 销毁血条
    if (this.healthBar) {
      this.healthBar.destroy();
      this.healthBar = null;
    }

    // 禁用物理
    if (this.sprite && this.sprite.body) {
      this.sprite.body.setVelocity(0, 0);
    }
    this.sprite.setActive(false);

    // 死亡动画 - 缩小并淡出
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      y: this.sprite.y - 30,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        // 完全销毁精灵
        if (this.sprite) {
          this.sprite.destroy();
          this.sprite = null;
        }
      }
    });

    // 掉落经验
    this.scene.events.emit('enemyDefeated', this);
  }

  isDead() {
    return this.health <= 0 || this.state === EnemyState.DEAD;
  }

  getExpReward() {
    return this.expReward;
  }

  // 重置敌人
  reset(x, y, config = {}) {
    this.health = config.health || this.maxHealth;
    this.state = EnemyState.PATROL;
    this.startX = x;
    this.facingRight = true;
    this.attackCooldown = 0;
    this.turnCooldown = 0;
    this.hurtCooldown = 0;

    this.sprite.setPosition(x, y);
    this.sprite.setActive(true);
    this.sprite.setVisible(true);
    this.sprite.setAlpha(1);
    this.sprite.clearTint();
  }
}

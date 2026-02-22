/**
 * Player 玩家实体
 * 《暗影森林》Shadow Forest
 */

import { GAME_CONFIG } from '../config.js';

export class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = null;

    // 基础属性 - 使用配置
    this.maxHealth = GAME_CONFIG.PLAYER.MAX_HEALTH;
    this.health = this.maxHealth;
    this.maxMana = GAME_CONFIG.PLAYER.MAX_MANA;
    this.mana = this.maxMana;
    this.attack = GAME_CONFIG.PLAYER.ATTACK;
    this.defense = GAME_CONFIG.PLAYER.DEFENSE;
    this.speed = GAME_CONFIG.PLAYER.SPEED;
    this.jumpForce = GAME_CONFIG.PLAYER.JUMP_FORCE;

    // 等级系统
    this.level = 1;
    this.exp = 0;
    this.expToNextLevel = GAME_CONFIG.LEVEL.BASE_EXP;

    // 技能
    this.skills = [];
    this.skillCooldowns = {};

    // 状态
    this.isAttacking = false;
    this.facingRight = true;
    this.invincible = false;
    this.invincibleTime = 0;

    // 创建精灵
    this.createSprite(x, y);
  }

  createSprite(x, y) {
    this.sprite = this.scene.physics.add.sprite(x, y, 'player');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setData('entity', this);

    // 设置碰撞体大小
    this.sprite.body.setSize(24, 40);
    this.sprite.body.setOffset(4, 8);
  }

  update(cursors) {
    if (!this.sprite || !this.sprite.body) return;

    // 重置水平速度
    let velocityX = 0;

    // 移动逻辑
    if (cursors.left.isDown) {
      velocityX = -this.speed;
      this.facingRight = false;
      this.sprite.setFlipX(true);
    } else if (cursors.right.isDown) {
      velocityX = this.speed;
      this.facingRight = true;
      this.sprite.setFlipX(false);
    }

    this.sprite.body.setVelocityX(velocityX);

    // 跳跃
    if (cursors.up.isDown && this.sprite.body.touching.down) {
      this.sprite.body.setVelocityY(this.jumpForce);
    }

    // 更新无敌状态
    if (this.invincible) {
      this.invincibleTime -= 16; // 假设 60fps
      if (this.invincibleTime <= 0) {
        this.invincible = false;
        this.sprite.clearTint();
      }
    }
  }

  takeDamage(amount) {
    if (this.invincible) return 0;

    // 计算实际伤害（防御减免）
    const actualDamage = Math.max(1, amount - this.defense);
    this.health = Math.max(0, this.health - actualDamage);

    // 设置无敌时间
    this.setInvincible(1000);

    // 视觉反馈
    this.sprite.setTint(0xff0000);

    return actualDamage;
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  useMana(amount) {
    if (this.mana >= amount) {
      this.mana -= amount;
      return true;
    }
    return false;
  }

  restoreMana(amount) {
    this.mana = Math.min(this.maxMana, this.mana + amount);
  }

  gainExp(amount) {
    this.exp += amount;

    // 检查升级
    while (this.exp >= this.expToNextLevel) {
      this.levelUp();
    }
  }

  levelUp() {
    // 消耗经验
    this.exp -= this.expToNextLevel;

    // 等级提升
    this.level++;

    // 更新下一级所需经验
    this.expToNextLevel = Math.floor(
      this.expToNextLevel * GAME_CONFIG.LEVEL.EXP_MULTIPLIER
    );

    // 属性提升
    this.maxHealth += GAME_CONFIG.LEVEL.HEALTH_BONUS;
    this.health = this.maxHealth; // 回满血
    this.attack += GAME_CONFIG.LEVEL.ATTACK_BONUS;
    this.defense += GAME_CONFIG.LEVEL.DEFENSE_BONUS;

    // 触发升级事件
    this.scene.events.emit('playerLevelUp', this.level);
  }

  setInvincible(duration) {
    this.invincible = true;
    this.invincibleTime = duration;
  }

  isDead() {
    return this.health <= 0;
  }

  attackEnemy(enemy) {
    if (this.isAttacking) return null;

    this.isAttacking = true;

    // 攻击后重置状态
    this.scene.time.delayedCall(300, () => {
      this.isAttacking = false;
    });

    // 返回攻击方向
    return this.facingRight ? 1 : -1;
  }

  // 获取玩家位置中心点
  getCenter() {
    return {
      x: this.sprite.x,
      y: this.sprite.y
    };
  }

  // 获取面向方向
  getFacingDirection() {
    return this.facingRight ? 1 : -1;
  }

  // 重置玩家状态
  reset(x, y) {
    this.health = this.maxHealth;
    this.mana = this.maxMana;
    this.exp = 0;
    this.level = 1;
    this.expToNextLevel = GAME_CONFIG.LEVEL.BASE_EXP;
    this.attack = GAME_CONFIG.PLAYER.ATTACK;
    this.defense = GAME_CONFIG.PLAYER.DEFENSE;
    this.invincible = false;
    this.isAttacking = false;

    if (this.sprite) {
      this.sprite.setPosition(x, y);
      this.sprite.clearTint();
      this.sprite.setActive(true);
      this.sprite.setVisible(true);
    }
  }
}

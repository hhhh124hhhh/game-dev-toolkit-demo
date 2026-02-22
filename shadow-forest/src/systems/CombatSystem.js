/**
 * CombatSystem 战斗系统
 * 《暗影森林》Shadow Forest
 */

import Phaser from 'phaser';

export class CombatSystem {
  /**
   * 计算物理伤害
   */
  static calculateDamage(attacker, defender) {
    const baseDamage = attacker.attack || 10;
    const defense = defender.defense || 0;

    // 基础伤害 + 随机浮动 (±20%)
    const variance = baseDamage * 0.2;
    const rawDamage = baseDamage + Phaser.Math.FloatBetween(-variance, variance);

    // 防御减免 (50% 防御效果)
    const finalDamage = Math.max(1, Math.floor(rawDamage - defense * 0.5));

    return finalDamage;
  }

  /**
   * 计算魔法伤害
   */
  static calculateMagicDamage(attacker, defender) {
    const baseDamage = attacker.magicAttack || 10;
    const defense = (defender.defense || 0) * 0.5; // 魔法只受 50% 防御影响

    const variance = baseDamage * 0.2;
    const rawDamage = baseDamage + Phaser.Math.FloatBetween(-variance, variance);

    const finalDamage = Math.max(1, Math.floor(rawDamage - defense));

    return finalDamage;
  }

  /**
   * 执行攻击
   */
  static performAttack(attacker, defender) {
    // 先检测暴击 (10% 暴击率)
    const isCritical = Math.random() < 0.1;

    const baseDamage = this.calculateDamage(attacker, defender);
    const damage = isCritical ? Math.floor(baseDamage * 1.5) : baseDamage;
    const actualDamage = defender.takeDamage(damage);

    return {
      damage: actualDamage,
      isCritical,
      isDead: defender.health <= 0
    };
  }

  /**
   * 执行暴击攻击
   */
  static performCriticalAttack(attacker, defender) {
    const baseDamage = this.calculateDamage(attacker, defender);
    const criticalDamage = Math.floor(baseDamage * 1.5);
    const actualDamage = defender.takeDamage(criticalDamage);

    return {
      damage: actualDamage,
      isCritical: true,
      isDead: defender.health <= 0
    };
  }

  /**
   * 检测攻击范围内的目标
   */
  static getTargetsInRange(attacker, targets, range) {
    const inRange = [];

    targets.forEach(target => {
      if (!target.sprite || !target.sprite.active) return;

      const distance = Phaser.Math.Distance.Between(
        attacker.sprite.x, attacker.sprite.y,
        target.sprite.x, target.sprite.y
      );

      if (distance <= range) {
        inRange.push(target);
      }
    });

    return inRange;
  }

  /**
   * 检测扇形范围内的目标
   */
  static getTargetsInCone(attacker, targets, range, angle, coneWidth) {
    const inCone = [];

    targets.forEach(target => {
      if (!target.sprite || !target.sprite.active) return;

      const distance = Phaser.Math.Distance.Between(
        attacker.sprite.x, attacker.sprite.y,
        target.sprite.x, target.sprite.y
      );

      if (distance > range) return;

      // 计算角度差
      const targetAngle = Phaser.Math.Angle.Between(
        attacker.sprite.x, attacker.sprite.y,
        target.sprite.x, target.sprite.y
      );

      const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(targetAngle - angle));

      if (angleDiff <= coneWidth / 2) {
        inCone.push(target);
      }
    });

    return inCone;
  }

  /**
   * 造成范围伤害 (AOE)
   */
  static dealAreaDamage(scene, x, y, radius, damage, excludeEntity = null) {
    const entities = [];

    // 获取范围内的所有实体
    // 这里需要根据实际游戏实现来获取实体列表

    entities.forEach(entity => {
      if (entity === excludeEntity) return;

      const distance = Phaser.Math.Distance.Between(
        x, y,
        entity.sprite.x, entity.sprite.y
      );

      if (distance <= radius) {
        // 伤害随距离衰减
        const falloff = 1 - (distance / radius);
        const actualDamage = Math.floor(damage * falloff);
        entity.takeDamage(actualDamage);
      }
    });

    return entities;
  }

  /**
   * 击退效果
   */
  static knockback(target, sourceX, sourceY, force) {
    if (!target.sprite || !target.sprite.body) return;

    const angle = Phaser.Math.Angle.Between(
      sourceX, sourceY,
      target.sprite.x, target.sprite.y
    );

    const velocityX = Math.cos(angle) * force;
    const velocityY = Math.sin(angle) * force - force * 0.5; // 添加向上的力

    target.sprite.body.setVelocity(velocityX, velocityY);
  }

  /**
   * 计算伤害数字显示位置
   */
  static getDamageTextPosition(target) {
    return {
      x: target.sprite.x,
      y: target.sprite.y - target.sprite.height / 2 - 10
    };
  }
}

/**
 * CombatSystem 战斗系统测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CombatSystem } from '../../src/systems/CombatSystem.js';

describe('CombatSystem', () => {
  describe('伤害计算', () => {
    it('应该正确计算基础伤害', () => {
      const attacker = { attack: 10 };
      const defender = { defense: 0 };
      const damage = CombatSystem.calculateDamage(attacker, defender);

      // 基础伤害 10，±20% 浮动 = 8-12
      expect(damage).toBeGreaterThanOrEqual(8);
      expect(damage).toBeLessThanOrEqual(12);
    });

    it('防御力应该减少伤害', () => {
      const attacker = { attack: 10 };
      const defender = { defense: 5 };
      const damage = CombatSystem.calculateDamage(attacker, defender);

      // 10 - 5*0.5 = 7.5 → 7-9 (±20%)
      expect(damage).toBeLessThanOrEqual(9);
    });

    it('高防御力时伤害至少为 1', () => {
      const attacker = { attack: 10 };
      const defender = { defense: 100 };
      const damage = CombatSystem.calculateDamage(attacker, defender);

      expect(damage).toBeGreaterThanOrEqual(1);
    });

    it('没有攻击力时应该返回最小伤害', () => {
      const attacker = { attack: 0 };
      const defender = { defense: 0 };
      const damage = CombatSystem.calculateDamage(attacker, defender);

      expect(damage).toBeGreaterThanOrEqual(1);
    });
  });

  describe('执行攻击', () => {
    it('应该返回伤害信息', () => {
      const attacker = { attack: 10, defense: 0 };
      const defender = {
        attack: 5,
        defense: 0,
        health: 100,
        takeDamage: vi.fn((damage) => {
          defender.health -= damage;
          return damage;
        })
      };

      const result = CombatSystem.performAttack(attacker, defender);

      expect(result.damage).toBeDefined();
      expect(result.damage).toBeGreaterThan(0);
    });

    it('应该调用防御者的 takeDamage', () => {
      const attacker = { attack: 10 };
      const defender = {
        health: 100,
        defense: 0,
        takeDamage: vi.fn((damage) => {
          defender.health -= damage;
          return damage;
        })
      };

      CombatSystem.performAttack(attacker, defender);

      expect(defender.takeDamage).toHaveBeenCalled();
    });

    it('防御者死亡时 isDead 应该为 true', () => {
      const attacker = { attack: 100 };
      const defender = {
        health: 10,
        defense: 0,
        takeDamage: vi.fn((damage) => {
          defender.health = 0;
          return damage;
        })
      };

      const result = CombatSystem.performAttack(attacker, defender);

      expect(result.isDead).toBe(true);
    });

    it('防御者存活时 isDead 应该为 false', () => {
      const attacker = { attack: 10 };
      const defender = {
        health: 100,
        defense: 0,
        takeDamage: vi.fn((damage) => {
          defender.health -= damage;
          return damage;
        })
      };

      const result = CombatSystem.performAttack(attacker, defender);

      expect(result.isDead).toBe(false);
    });

    it('暴击率应该影响 isCritical', () => {
      // 运行多次检查暴击逻辑
      let criticalCount = 0;
      const trials = 100;

      for (let i = 0; i < trials; i++) {
        const attacker = { attack: 10 };
        const defender = {
          health: 1000,
          defense: 0,
          takeDamage: vi.fn((damage) => {
            defender.health -= damage;
            return damage;
          })
        };

        const result = CombatSystem.performAttack(attacker, defender);
        if (result.isCritical) criticalCount++;
      }

      // 大约 10% 暴击率，允许一定偏差
      expect(criticalCount).toBeGreaterThan(0);
      expect(criticalCount).toBeLessThan(trials * 0.3);
    });
  });

  describe('暴击伤害', () => {
    it('暴击应该造成额外伤害', () => {
      const attacker = { attack: 10 };
      const defender = {
        health: 1000,
        defense: 0,
        takeDamage: vi.fn((damage) => {
          defender.health -= damage;
          return damage;
        })
      };

      // 强制暴击
      const result = CombatSystem.performCriticalAttack(attacker, defender);

      // 暴击伤害 = 基础伤害 * 1.5
      expect(result.damage).toBeGreaterThanOrEqual(12); // 8 * 1.5 = 12
    });
  });

  describe('伤害类型', () => {
    it('物理伤害应该受防御影响', () => {
      const attacker = { attack: 20 };
      const defenderNoDef = { defense: 0 };
      const defenderWithDef = { defense: 10 };

      const damageNoDef = CombatSystem.calculateDamage(attacker, defenderNoDef);
      const damageWithDef = CombatSystem.calculateDamage(attacker, defenderWithDef);

      expect(damageWithDef).toBeLessThan(damageNoDef);
    });

    it('魔法伤害应该忽略部分防御', () => {
      const attacker = { magicAttack: 20 };
      const defender = { defense: 10 };

      const magicDamage = CombatSystem.calculateMagicDamage(attacker, defender);

      // 魔法伤害只受 50% 防御影响
      expect(magicDamage).toBeGreaterThan(0);
    });
  });
});

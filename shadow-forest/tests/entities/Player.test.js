/**
 * Player 实体测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Player } from '../../src/entities/Player.js';
import { createMockScene, createMockSprite, createMockCursors } from '../setup.js';

describe('Player', () => {
  let scene;
  let player;

  beforeEach(() => {
    scene = createMockScene();
  });

  describe('初始化', () => {
    it('应该初始化所有状态变量', () => {
      player = new Player(scene, 100, 100);

      // CRITICAL: 验证所有实例变量已定义
      expect(player.health).toBeDefined();
      expect(player.maxHealth).toBeDefined();
      expect(player.mana).toBeDefined();
      expect(player.maxMana).toBeDefined();
      expect(player.attack).toBeDefined();
      expect(player.defense).toBeDefined();
      expect(player.speed).toBeDefined();
      expect(player.level).toBeDefined();
      expect(player.exp).toBeDefined();
      expect(player.expToNextLevel).toBeDefined();
    });

    it('应该从 1 级开始', () => {
      player = new Player(scene, 100, 100);
      expect(player.level).toBe(1);
    });

    it('应该初始化满血', () => {
      player = new Player(scene, 100, 100);
      expect(player.health).toBe(player.maxHealth);
    });

    it('应该初始化满魔法', () => {
      player = new Player(scene, 100, 100);
      expect(player.mana).toBe(player.maxMana);
    });

    it('应该初始化 0 经验', () => {
      player = new Player(scene, 100, 100);
      expect(player.exp).toBe(0);
    });

    it('应该有正确的默认属性值', () => {
      player = new Player(scene, 100, 100);
      expect(player.maxHealth).toBe(100);
      expect(player.maxMana).toBe(80);
      expect(player.attack).toBe(10);
      expect(player.defense).toBe(5);
      expect(player.speed).toBe(160);
    });
  });

  describe('移动', () => {
    beforeEach(() => {
      player = new Player(scene, 100, 100);
    });

    it('应该向左移动', () => {
      const cursors = createMockCursors();
      cursors.left.isDown = true;
      cursors.left.isUp = false;

      player.update(cursors);

      expect(player.sprite.body.setVelocityX).toHaveBeenCalledWith(-player.speed);
    });

    it('应该向右移动', () => {
      const cursors = createMockCursors();
      cursors.right.isDown = true;
      cursors.right.isUp = false;

      player.update(cursors);

      expect(player.sprite.body.setVelocityX).toHaveBeenCalledWith(player.speed);
    });

    it('没有输入时应该停止', () => {
      const cursors = createMockCursors();

      player.update(cursors);

      expect(player.sprite.body.setVelocityX).toHaveBeenCalledWith(0);
    });
  });

  describe('受伤', () => {
    beforeEach(() => {
      player = new Player(scene, 100, 100);
    });

    it('应该正确计算伤害', () => {
      const actualDamage = player.takeDamage(20);
      expect(actualDamage).toBeGreaterThanOrEqual(1);
    });

    it('防御力应该减少伤害', () => {
      player.defense = 5;
      const actualDamage = player.takeDamage(20);
      // 20 - 5 = 15 伤害
      expect(actualDamage).toBe(15);
    });

    it('伤害不应该让生命值低于 0', () => {
      player.takeDamage(1000);
      expect(player.health).toBe(0);
    });

    it('伤害至少为 1', () => {
      player.defense = 1000;
      const actualDamage = player.takeDamage(10);
      expect(actualDamage).toBeGreaterThanOrEqual(1);
    });

    it('受伤后应该返回实际伤害值', () => {
      const damage = player.takeDamage(15);
      expect(player.health).toBe(player.maxHealth - damage);
    });
  });

  describe('升级系统', () => {
    beforeEach(() => {
      player = new Player(scene, 100, 100);
    });

    it('应该正确计算升级所需经验', () => {
      player.level = 1;
      expect(player.expToNextLevel).toBe(100);
    });

    it('获得足够经验时应该升级', () => {
      player.level = 1;
      player.exp = 0;
      player.gainExp(100);
      expect(player.level).toBe(2);
    });

    it('升级后应该重置经验', () => {
      player.level = 1;
      player.exp = 0;
      player.gainExp(100);
      expect(player.exp).toBe(0);
    });

    it('升级后应该提升最大生命值', () => {
      const oldMaxHealth = player.maxHealth;
      player.gainExp(100);
      expect(player.maxHealth).toBe(oldMaxHealth + 10);
    });

    it('升级后应该提升攻击力', () => {
      const oldAttack = player.attack;
      player.gainExp(100);
      expect(player.attack).toBe(oldAttack + 2);
    });

    it('升级后应该提升防御力', () => {
      const oldDefense = player.defense;
      player.gainExp(100);
      expect(player.defense).toBe(oldDefense + 1);
    });

    it('升级后应该回满血', () => {
      player.health = 50;
      player.gainExp(100);
      expect(player.health).toBe(player.maxHealth);
    });

    it('多余经验应该保留', () => {
      player.level = 1;
      player.exp = 0;
      player.gainExp(150);
      expect(player.exp).toBe(50);
    });

    it('可以连续升级', () => {
      player.level = 1;
      player.exp = 0;
      player.gainExp(250); // 100 + 150 = 250, 应该升到 3 级
      expect(player.level).toBe(3);
    });
  });

  describe('死亡检测', () => {
    beforeEach(() => {
      player = new Player(scene, 100, 100);
    });

    it('生命值为 0 时应该死亡', () => {
      player.takeDamage(1000);
      expect(player.isDead()).toBe(true);
    });

    it('生命值大于 0 时应该存活', () => {
      expect(player.isDead()).toBe(false);
    });
  });

  describe('治疗', () => {
    beforeEach(() => {
      player = new Player(scene, 100, 100);
      player.health = 50;
    });

    it('应该正确治疗', () => {
      player.heal(30);
      expect(player.health).toBe(80);
    });

    it('治疗不应该超过最大生命值', () => {
      player.heal(100);
      expect(player.health).toBe(player.maxHealth);
    });
  });

  describe('魔法值', () => {
    beforeEach(() => {
      player = new Player(scene, 100, 100);
    });

    it('使用魔法应该消耗魔法值', () => {
      const result = player.useMana(20);
      expect(result).toBe(true);
      expect(player.mana).toBe(60);
    });

    it('魔法值不足时应该返回 false', () => {
      player.mana = 10;
      const result = player.useMana(20);
      expect(result).toBe(false);
      expect(player.mana).toBe(10);
    });

    it('恢复魔法值', () => {
      player.mana = 50;
      player.restoreMana(20);
      expect(player.mana).toBe(70);
    });

    it('魔法值不应该超过最大值', () => {
      player.mana = 70;
      player.restoreMana(20);
      expect(player.mana).toBe(player.maxMana);
    });
  });
});

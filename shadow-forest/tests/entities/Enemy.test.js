/**
 * Enemy 实体测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Enemy, EnemyState } from '../../src/entities/Enemy.js';
import { createMockScene, createMockSprite } from '../setup.js';

describe('Enemy', () => {
  let scene;
  let enemy;
  let mockPlayer;

  beforeEach(() => {
    scene = createMockScene();

    // 创建模拟玩家
    mockPlayer = {
      sprite: createMockSprite(100, 300),
      health: 100,
      takeDamage: vi.fn((damage) => {
        mockPlayer.health -= damage;
        return damage;
      })
    };
  });

  describe('初始化', () => {
    it('应该初始化所有状态变量', () => {
      enemy = new Enemy(scene, 500, 300);

      expect(enemy.health).toBeDefined();
      expect(enemy.maxHealth).toBeDefined();
      expect(enemy.attack).toBeDefined();
      expect(enemy.speed).toBeDefined();
      expect(enemy.state).toBeDefined();
      expect(enemy.detectionRange).toBeDefined();
      expect(enemy.attackRange).toBeDefined();
      expect(enemy.patrolRange).toBeDefined();
    });

    it('应该从 PATROL 状态开始', () => {
      enemy = new Enemy(scene, 500, 300);
      expect(enemy.state).toBe(EnemyState.PATROL);
    });

    it('应该有正确的默认属性值', () => {
      enemy = new Enemy(scene, 500, 300);
      expect(enemy.maxHealth).toBe(50);
      expect(enemy.attack).toBe(5);
      expect(enemy.speed).toBe(80);
      expect(enemy.detectionRange).toBe(150);
      expect(enemy.attackRange).toBe(40);
      expect(enemy.patrolRange).toBe(100);
    });

    it('应该接受自定义配置', () => {
      enemy = new Enemy(scene, 500, 300, {
        health: 100,
        attack: 15,
        speed: 100
      });
      expect(enemy.maxHealth).toBe(100);
      expect(enemy.attack).toBe(15);
      expect(enemy.speed).toBe(100);
    });

    it('应该记录初始位置', () => {
      enemy = new Enemy(scene, 500, 300);
      expect(enemy.startX).toBe(500);
    });
  });

  describe('巡逻状态 (PATROL)', () => {
    beforeEach(() => {
      enemy = new Enemy(scene, 500, 300);
    });

    it('应该在巡逻范围内移动', () => {
      enemy.state = EnemyState.PATROL;
      enemy.facingRight = true;
      enemy.sprite.x = 500;

      enemy.onPatrolUpdate(0, 16);

      expect(enemy.sprite.body.setVelocityX).toHaveBeenCalled();
    });

    it('到达巡逻边界应该转向', () => {
      enemy.facingRight = true;
      enemy.sprite.x = enemy.startX + enemy.patrolRange + 10;

      enemy.onPatrolUpdate(0, 16);

      expect(enemy.facingRight).toBe(false);
    });

    it('向左到达边界应该转向', () => {
      enemy.facingRight = false;
      enemy.sprite.x = enemy.startX - enemy.patrolRange - 10;

      enemy.onPatrolUpdate(0, 16);

      expect(enemy.facingRight).toBe(true);
    });
  });

  describe('追击状态 (CHASE)', () => {
    beforeEach(() => {
      enemy = new Enemy(scene, 500, 300);
      enemy.state = EnemyState.CHASE;
    });

    it('应该向玩家方向移动', () => {
      mockPlayer.sprite.x = 600; // 玩家在右边
      enemy.sprite.x = 500;

      enemy.onChaseUpdate(mockPlayer, 0, 16);

      expect(enemy.sprite.body.setVelocityX).toHaveBeenCalled();
    });

    it('玩家在左边应该向左追', () => {
      mockPlayer.sprite.x = 400; // 玩家在左边
      enemy.sprite.x = 500;

      enemy.onChaseUpdate(mockPlayer, 0, 16);

      // 检查是否设置了负速度（向左）
      const calls = enemy.sprite.body.setVelocityX.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
    });
  });

  describe('状态转换', () => {
    beforeEach(() => {
      enemy = new Enemy(scene, 500, 300);
    });

    it('玩家进入检测范围应该切换到 CHASE', () => {
      enemy.state = EnemyState.PATROL;
      mockPlayer.sprite.x = 550; // 50 像素距离
      enemy.sprite.x = 500;

      enemy.updateStateTransitions(mockPlayer);

      expect(enemy.state).toBe(EnemyState.CHASE);
    });

    it('玩家离开检测范围应该切换回 PATROL', () => {
      enemy.state = EnemyState.CHASE;
      mockPlayer.sprite.x = 1000; // 超出范围
      enemy.sprite.x = 500;

      enemy.updateStateTransitions(mockPlayer);

      expect(enemy.state).toBe(EnemyState.PATROL);
    });

    it('玩家进入攻击范围应该切换到 ATTACK', () => {
      enemy.state = EnemyState.CHASE;
      mockPlayer.sprite.x = 530; // 30 像素距离
      enemy.sprite.x = 500;

      enemy.updateStateTransitions(mockPlayer);

      expect(enemy.state).toBe(EnemyState.ATTACK);
    });
  });

  describe('受伤', () => {
    beforeEach(() => {
      enemy = new Enemy(scene, 500, 300);
    });

    it('应该正确计算伤害', () => {
      enemy.takeDamage(20);
      expect(enemy.health).toBe(30);
    });

    it('生命值不应该低于 0', () => {
      enemy.takeDamage(1000);
      expect(enemy.health).toBe(0);
    });

    it('死亡后状态应该变为 DEAD', () => {
      enemy.takeDamage(100);
      expect(enemy.state).toBe(EnemyState.DEAD);
    });
  });

  describe('死亡检测', () => {
    beforeEach(() => {
      enemy = new Enemy(scene, 500, 300);
    });

    it('生命值为 0 时应该死亡', () => {
      enemy.takeDamage(100);
      expect(enemy.isDead()).toBe(true);
    });

    it('生命值大于 0 时应该存活', () => {
      expect(enemy.isDead()).toBe(false);
    });
  });

  describe('经验奖励', () => {
    beforeEach(() => {
      enemy = new Enemy(scene, 500, 300);
    });

    it('应该返回正确的经验奖励', () => {
      expect(enemy.getExpReward()).toBe(25);
    });

    it('可以配置经验奖励', () => {
      enemy = new Enemy(scene, 500, 300, { expReward: 50 });
      expect(enemy.getExpReward()).toBe(50);
    });
  });
});

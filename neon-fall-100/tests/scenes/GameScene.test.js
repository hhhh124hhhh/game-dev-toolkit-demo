/**
 * GameScene Tests
 * 游戏场景测试 - 验证 TDD skill 的 bug 检测能力
 */

import { jest } from '@jest/globals';
import { GameScene } from '../../src/scenes/GameScene.js';
import { createTestScene, createMockSprite, createMockPlatform } from '../setup.js';

describe('GameScene', () => {
  // ============================================
  // 测试 1: 初始化（防止 undefined bug）- 核心测试
  // ============================================
  describe('init()', () => {
    let scene;

    beforeEach(() => {
      scene = createTestScene(GameScene);
    });

    it('should initialize all state variables', () => {
      // CRITICAL: 验证所有实例变量已定义
      // 这能防止类似 this.lastPlatformY = undefined 的 bug
      expect(scene.floorCount).toBeDefined();
      expect(scene.lastPlatformY).toBeDefined();  // ← 关键测试！
      expect(scene.score).toBeDefined();
      expect(scene.isGameOver).toBeDefined();
      expect(scene.isPaused).toBeDefined();
    });

    it('should start with floor count of 0', () => {
      expect(scene.floorCount).toBe(0);
    });

    it('should start with score of 0', () => {
      expect(scene.score).toBe(0);
    });

    it('should not be in game over state initially', () => {
      expect(scene.isGameOver).toBe(false);
    });

    it('should initialize numeric values as valid numbers', () => {
      // 防止 NaN bug
      expect(scene.floorCount).not.toBeNaN();
      expect(scene.score).not.toBeNaN();
      expect(scene.lastPlatformY).not.toBeNaN();
    });
  });

  // ============================================
  // 测试 2: 碰撞检测逻辑（需要更复杂的 mock）
  // ============================================
  describe('handlePlatformCollision()', () => {
    let scene;

    beforeEach(() => {
      scene = createTestScene(GameScene);
      // 完整的 mock 配置
      scene.floorText = { setText: jest.fn() };
      scene.jumpParticles = { setPosition: jest.fn(), explode: jest.fn() };
      scene.audioSystem = { playJump: jest.fn(), playLand: jest.fn() };
      scene.abilitySystem = { hasAbility: jest.fn(() => false) };
      scene.scoreText = { setText: jest.fn() };
    });

    it('should increment floor count when landing on new platform from above', () => {
      scene.lastPlatformY = 0;

      const mockPlayer = createMockSprite(100, 90, 100);  // 下落中 (velocityY > 0)
      const mockPlatform = createMockPlatform(100, 200);

      scene.handlePlatformCollision(mockPlayer, mockPlatform);

      expect(scene.floorCount).toBe(1);
      expect(scene.lastPlatformY).toBe(200);
    });

    it('should NOT increment floor count when moving up', () => {
      scene.lastPlatformY = 0;

      const mockPlayer = createMockSprite(100, 90, -100);  // 上升中 (velocityY < 0)
      const mockPlatform = createMockPlatform(100, 200);

      scene.handlePlatformCollision(mockPlayer, mockPlatform);

      expect(scene.floorCount).toBe(0);
    });

    it('should NOT increment floor for same platform (within 50px)', () => {
      scene.lastPlatformY = 200;

      const mockPlayer = createMockSprite(100, 190, 100);
      const mockPlatform = createMockPlatform(100, 200);

      scene.handlePlatformCollision(mockPlayer, mockPlatform);

      expect(scene.floorCount).toBe(0);  // 不重复计数
    });
  });

  // ============================================
  // 测试 3: 分数系统
  // ============================================
  describe('addScore()', () => {
    let scene;

    beforeEach(() => {
      scene = createTestScene(GameScene);
      scene.score = 0;
      // 添加 addScore 需要的 mock 属性
      scene.abilitySystem = { hasAbility: jest.fn(() => false) };
      scene.scoreText = { setText: jest.fn() };
    });

    it('should add points to score', () => {
      scene.addScore(100);
      expect(scene.score).toBe(100);
    });

    it('should accumulate score', () => {
      scene.addScore(100);
      scene.addScore(50);
      expect(scene.score).toBe(150);
    });

    it('should handle zero points', () => {
      scene.addScore(0);
      expect(scene.score).toBe(0);
    });
  });

  // ============================================
  // 测试 4: 暂停功能
  // ============================================
  describe('togglePause()', () => {
    let scene;

    beforeEach(() => {
      scene = createTestScene(GameScene);
      // 添加 togglePause 需要的 mock 属性
      scene.physics = { pause: jest.fn(), resume: jest.fn() };
      scene.showPauseMenu = jest.fn();
      scene.hidePauseMenu = jest.fn();
    });

    it('should toggle pause state', () => {
      expect(scene.isPaused).toBe(false);

      scene.togglePause();
      expect(scene.isPaused).toBe(true);

      scene.togglePause();
      expect(scene.isPaused).toBe(false);
    });
  });

  // ============================================
  // 测试 5: 边界条件
  // ============================================
  describe('Edge Cases', () => {
    let scene;

    beforeEach(() => {
      scene = createTestScene(GameScene);
      scene.abilitySystem = { hasAbility: jest.fn(() => false) };
      scene.floorText = { setText: jest.fn() };
      scene.scoreText = { setText: jest.fn() };
    });

    it('should handle negative score gracefully', () => {
      scene.score = 100;
      scene.addScore(-50);
      expect(scene.score).toBe(50);
    });

    it('should handle null platform in collision', () => {
      scene.lastPlatformY = 0;
      const mockPlayer = createMockSprite(100, 90, 100);

      // 注意：当前代码没有 null 检查，这是一个潜在的改进点
      expect(() => {
        scene.handlePlatformCollision(mockPlayer, null);
      }).toThrow();  // 期望抛出异常（因为当前代码不检查 null）
    });
  });
});

// ============================================
// 演示：如果 bug 未修复，测试会怎样失败
// ============================================
describe('Bug Detection Demo', () => {
  it('would fail if lastPlatformY was not initialized', () => {
    const scene = createTestScene(GameScene);

    // 这个测试验证了 bug 已经被修复
    // 如果 init() 中没有 this.lastPlatformY = 0;
    // 这个测试会失败：Received: undefined
    expect(scene.lastPlatformY).toBeDefined();
    expect(scene.lastPlatformY).toBe(0);
  });

  it('would fail if NaN was produced from undefined + number', () => {
    const scene = createTestScene(GameScene);

    // 模拟条件检查: platformSprite.y > this.lastPlatformY + 50
    // 如果 lastPlatformY 是 undefined，结果会是 NaN
    const platformY = 100;
    const result = platformY > scene.lastPlatformY + 50;

    // 因为 lastPlatformY = 0，所以 100 > 0 + 50 = true
    expect(result).toBe(true);

    // 如果 lastPlatformY 是 undefined：
    // 100 > undefined + 50 = 100 > NaN = false
    // 这就是为什么层数永远是 0 的原因
  });
});

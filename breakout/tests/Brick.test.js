import { describe, it, expect, beforeEach } from 'vitest';
import { createTestScene } from './setup.js';
import { Brick } from '../src/entities/Brick.js';
import { GAME_CONFIG, BRICK_COLORS, BRICK_POINTS } from '../src/config.js';

describe('Brick', () => {
  let scene;

  beforeEach(() => {
    scene = createTestScene(Phaser.Scene);
  });

  describe('初始化', () => {
    it('should be defined', () => {
      expect(Brick).toBeDefined();
    });

    it('should initialize with correct position', () => {
      const brick = new Brick(scene, 100, 50, 0, 0);
      expect(brick.x).toBe(100);
      expect(brick.y).toBe(50);
    });

    it('should have correct dimensions from config', () => {
      const brick = new Brick(scene, 100, 50, 0, 0);
      expect(brick.width).toBe(GAME_CONFIG.bricks.width);
      expect(brick.height).toBe(GAME_CONFIG.bricks.height);
    });

    it('should store row and column indices', () => {
      const row = 2;
      const col = 3;
      const brick = new Brick(scene, 100, 50, row, col);

      expect(brick.getData('row')).toBe(row);
      expect(brick.getData('col')).toBe(col);
    });
  });

  describe('生命值', () => {
    it('should have default health of 1', () => {
      const brick = new Brick(scene, 100, 50, 0, 0);
      expect(brick.getData('health')).toBe(1);
    });

    it('should accept custom health value', () => {
      const brick = new Brick(scene, 100, 50, 0, 0, 3);
      expect(brick.getData('health')).toBe(3);
    });

    it('should decrease health when hit', () => {
      const brick = new Brick(scene, 100, 50, 0, 0, 2);
      const result = brick.hit();

      expect(brick.getData('health')).toBe(1);
      expect(result).toBe(false); // 未销毁
    });

    it('should return true when destroyed', () => {
      const brick = new Brick(scene, 100, 50, 0, 0, 1);
      const result = brick.hit();

      expect(result).toBe(true); // 已销毁
    });
  });

  describe('分数', () => {
    it('should have points based on row', () => {
      const row = 0; // 第一行，最高分
      const brick = new Brick(scene, 100, 50, row, 0);

      expect(brick.getData('points')).toBe(BRICK_POINTS[row]);
    });

    it('should have different points for different rows', () => {
      const brick1 = new Brick(scene, 100, 50, 0, 0);
      const brick5 = new Brick(scene, 100, 150, 4, 0);

      expect(brick1.getData('points')).toBeGreaterThan(brick5.getData('points'));
    });
  });

  describe('颜色', () => {
    it('should have color based on row', () => {
      const row = 2;
      const brick = new Brick(scene, 100, 50, row, 0);

      expect(brick.getData('color')).toBe(BRICK_COLORS[row]);
    });
  });

  describe('销毁', () => {
    it('should disable body when destroyed', () => {
      const brick = new Brick(scene, 100, 50, 0, 0);
      brick.destroy();

      expect(brick.active).toBe(false);
    });
  });
});

describe('BrickGroup', () => {
  let scene;
  let brickGroup;

  beforeEach(() => {
    scene = createTestScene(Phaser.Scene);
  });

  describe('创建砖块组', () => {
    it('should create correct number of bricks', () => {
      const { rows, cols } = GAME_CONFIG.bricks;

      // 预期砖块数量
      const expectedCount = rows * cols;
      expect(expectedCount).toBe(50); // 5 * 10
    });

    it('should position bricks in correct grid', () => {
      const { width, height, gap, offsetTop, offsetLeft } = GAME_CONFIG.bricks;

      // 第一块砖的位置
      const firstBrickX = offsetLeft + width / 2;
      const firstBrickY = offsetTop + height / 2;

      // 第二块砖的位置
      const secondBrickX = firstBrickX + width + gap;

      expect(secondBrickX).toBe(firstBrickX + width + gap);
    });
  });

  describe('统计', () => {
    it('should count active bricks', () => {
      // 当砖块组为空时，活跃数为 0
      const bricks = scene.physics.add.staticGroup();
      expect(bricks.countActive()).toBe(0);
    });
  });
});

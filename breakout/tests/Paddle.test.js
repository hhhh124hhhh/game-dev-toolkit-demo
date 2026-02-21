import { describe, it, expect, beforeEach } from 'vitest';
import { createTestScene } from './setup.js';
import { Paddle } from '../src/entities/Paddle.js';
import { GAME_CONFIG } from '../src/config.js';

describe('Paddle', () => {
  let scene;
  let paddle;

  beforeEach(() => {
    scene = createTestScene(Phaser.Scene);
  });

  describe('初始化', () => {
    it('should be defined', () => {
      expect(Paddle).toBeDefined();
    });

    it('should initialize at correct position', () => {
      const x = 400;
      const y = 550;
      paddle = new Paddle(scene, x, y);
      expect(paddle.x).toBe(x);
      expect(paddle.y).toBe(y);
    });

    it('should have correct width from config', () => {
      paddle = new Paddle(scene, 400, 550);
      expect(paddle.width).toBe(GAME_CONFIG.paddle.width);
    });

    it('should have correct height from config', () => {
      paddle = new Paddle(scene, 400, 550);
      expect(paddle.height).toBe(GAME_CONFIG.paddle.height);
    });

    it('should be immovable', () => {
      paddle = new Paddle(scene, 400, 550);
      expect(paddle.body.immovable).toBe(true);
    });
  });

  describe('移动', () => {
    it('should move left when left key is pressed', () => {
      paddle = new Paddle(scene, 400, 550);

      // 模拟左键按下
      const cursors = scene.input.keyboard.createCursorKeys();
      cursors.left.isDown = true;

      paddle.update(cursors);

      expect(paddle.body.velocity.x).toBe(-GAME_CONFIG.paddle.speed);
    });

    it('should move right when right key is pressed', () => {
      paddle = new Paddle(scene, 400, 550);

      // 模拟右键按下
      const cursors = scene.input.keyboard.createCursorKeys();
      cursors.right.isDown = true;

      paddle.update(cursors);

      expect(paddle.body.velocity.x).toBe(GAME_CONFIG.paddle.speed);
    });

    it('should stop when no key is pressed', () => {
      paddle = new Paddle(scene, 400, 550);

      const cursors = scene.input.keyboard.createCursorKeys();
      paddle.update(cursors);

      expect(paddle.body.velocity.x).toBe(0);
    });
  });

  describe('边界限制', () => {
    it('should clamp position to left boundary', () => {
      paddle = new Paddle(scene, 400, 550);

      // 设置位置到左边界外
      paddle.x = 10;

      paddle.clampToBounds();

      const minX = paddle.width / 2;
      expect(paddle.x).toBeGreaterThanOrEqual(minX);
    });

    it('should clamp position to right boundary', () => {
      paddle = new Paddle(scene, 400, 550);

      // 设置位置到右边界外
      paddle.x = GAME_CONFIG.width + 100;

      paddle.clampToBounds();

      const maxX = GAME_CONFIG.width - paddle.width / 2;
      expect(paddle.x).toBeLessThanOrEqual(maxX);
    });
  });

  describe('鼠标控制', () => {
    it('should follow mouse x position', () => {
      paddle = new Paddle(scene, 400, 550);

      const pointerX = 300;
      paddle.followPointer(pointerX);

      expect(paddle.x).toBe(pointerX);
    });

    it('should clamp mouse position to bounds', () => {
      paddle = new Paddle(scene, 400, 550);

      // 超出右边界
      paddle.followPointer(GAME_CONFIG.width + 100);

      const maxX = GAME_CONFIG.width - paddle.width / 2;
      expect(paddle.x).toBeLessThanOrEqual(maxX);
    });
  });
});

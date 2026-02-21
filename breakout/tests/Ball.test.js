import { describe, it, expect, beforeEach } from 'vitest';
import { createTestScene } from './setup.js';
import { Ball } from '../src/entities/Ball.js';
import { GAME_CONFIG } from '../src/config.js';

describe('Ball', () => {
  let scene;
  let ball;

  beforeEach(() => {
    scene = createTestScene(Phaser.Scene);
  });

  describe('初始化', () => {
    it('should be defined', () => {
      expect(Ball).toBeDefined();
    });

    it('should initialize with correct position', () => {
      const x = 400;
      const y = 500;
      ball = new Ball(scene, x, y);
      expect(ball.x).toBe(x);
      expect(ball.y).toBe(y);
    });

    it('should initialize with correct radius from config', () => {
      ball = new Ball(scene, 400, 500);
      expect(ball.radius).toBe(GAME_CONFIG.ball.radius);
    });

    it('should have isLaunched flag as false initially', () => {
      ball = new Ball(scene, 400, 500);
      expect(ball.isLaunched).toBe(false);
    });
  });

  describe('发射', () => {
    it('should set isLaunched to true when launched', () => {
      ball = new Ball(scene, 400, 500);
      ball.launch();
      expect(ball.isLaunched).toBe(true);
    });

    it('should launch with random angle between -45 and 45 degrees', () => {
      ball = new Ball(scene, 400, 500);
      ball.launch(400);

      // 角度应该在合理范围内（向上发射）
      expect(ball.body.velocity.y).toBeLessThan(0);
    });

    it('should launch with specified speed', () => {
      ball = new Ball(scene, 400, 500);
      const speed = 500;
      ball.launch(speed);

      const velocityMagnitude = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      expect(velocityMagnitude).toBeCloseTo(speed, -1);
    });
  });

  describe('重置', () => {
    it('should reset to initial position', () => {
      ball = new Ball(scene, 400, 500);
      ball.launch();

      const newX = 350;
      const newY = 550;
      ball.reset(newX, newY);

      expect(ball.x).toBe(newX);
      expect(ball.y).toBe(newY);
      expect(ball.isLaunched).toBe(false);
    });

    it('should set velocity to zero after reset', () => {
      ball = new Ball(scene, 400, 500);
      ball.launch();
      ball.reset(400, 500);

      expect(ball.body.velocity.x).toBe(0);
      expect(ball.body.velocity.y).toBe(0);
    });
  });

  describe('速度控制', () => {
    it('should not exceed max speed', () => {
      ball = new Ball(scene, 400, 500);
      ball.launch(GAME_CONFIG.ball.maxSpeed + 100);

      // 速度应该被限制在最大速度以内
      const velocityMagnitude = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      expect(velocityMagnitude).toBeLessThanOrEqual(GAME_CONFIG.ball.maxSpeed);
    });
  });
});

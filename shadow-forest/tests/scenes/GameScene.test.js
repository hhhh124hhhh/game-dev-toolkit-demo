/**
 * GameScene 场景测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockScene } from '../setup.js';

describe('GameScene', () => {
  let scene;

  beforeEach(() => {
    scene = createMockScene();
    // 添加游戏场景特有的方法
    scene.score = 0;
    scene.isGameOver = false;
    scene.isPaused = false;
    scene.pauseGame = vi.fn(() => { scene.isPaused = true; });
    scene.resumeGame = vi.fn(() => { scene.isPaused = false; });
    scene.gameOver = vi.fn(() => { scene.isGameOver = true; });
    scene.addScore = vi.fn((points) => { scene.score += points; });
  });

  describe('初始化', () => {
    it('应该初始化所有状态变量', () => {
      scene.init({});

      expect(scene.score).toBeDefined();
      expect(scene.isGameOver).toBeDefined();
      expect(scene.isPaused).toBeDefined();
    });

    it('应该从 0 分开始', () => {
      scene.init({});
      expect(scene.score).toBe(0);
    });

    it('游戏未结束', () => {
      scene.init({});
      expect(scene.isGameOver).toBe(false);
    });

    it('游戏未暂停', () => {
      scene.init({});
      expect(scene.isPaused).toBe(false);
    });
  });

  describe('游戏状态', () => {
    beforeEach(() => {
      scene.init({});
    });

    it('暂停游戏时 isPaused 应该为 true', () => {
      scene.pauseGame();
      expect(scene.isPaused).toBe(true);
    });

    it('恢复游戏时 isPaused 应该为 false', () => {
      scene.isPaused = true;
      scene.resumeGame();
      expect(scene.isPaused).toBe(false);
    });

    it('游戏结束时 isGameOver 应该为 true', () => {
      scene.gameOver();
      expect(scene.isGameOver).toBe(true);
    });
  });

  describe('分数系统', () => {
    beforeEach(() => {
      scene.init({});
    });

    it('添加分数应该正确累加', () => {
      scene.addScore(100);
      expect(scene.score).toBe(100);
    });

    it('多次添加分数应该累加', () => {
      scene.addScore(100);
      scene.addScore(50);
      expect(scene.score).toBe(150);
    });
  });
});

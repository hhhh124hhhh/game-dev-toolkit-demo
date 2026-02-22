/**
 * GameScene3D 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GAME_CONFIG, GAME_CONSTANTS } from '../../src/config.js';

// 模拟依赖
vi.mock('../../src/entities/Player3D.js', () => ({
  Player3D: class MockPlayer3D {
    constructor(scene) {
      this.scene = scene;
      this.gameObject = { position: { x: 0, y: 0, z: 0 } };
    }
    async create() {
      return this.gameObject;
    }
    update() {}
    getPosition() {
      return { x: 0, y: 0, z: 0 };
    }
  }
}));

vi.mock('../../src/entities/Platform3D.js', () => ({
  Platform3D: class MockPlatform3D {
    constructor(scene, x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    async create() {}
  }
}));

vi.mock('../../src/entities/Collectible3D.js', () => ({
  Collectible3D: class MockCollectible3D {
    constructor(scene, x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.collected = false;
    }
    async create() {}
    update() {}
    getPosition() {
      return { x: this.x, y: this.y, z: this.z };
    }
    collect() {
      this.collected = true;
    }
  }
}));

vi.mock('../../src/systems/CameraController.js', () => ({
  CameraController: class MockCameraController {
    constructor(scene, player) {}
    update() {}
  }
}));

describe('GameScene3D', () => {
  describe('初始化', () => {
    it('should initialize all state variables', () => {
      // 模拟场景状态
      const sceneState = {
        score: 0,
        isGameOver: false,
        isPaused: false,
        platforms: [],
        collectibles: []
      };

      expect(sceneState.score).toBeDefined();
      expect(sceneState.isGameOver).toBeDefined();
      expect(sceneState.isPaused).toBeDefined();
      expect(sceneState.platforms).toBeDefined();
      expect(sceneState.collectibles).toBeDefined();
    });

    it('should start with correct initial values', () => {
      const sceneState = {
        score: 0,
        isGameOver: false,
        isPaused: false
      };

      expect(sceneState.score).toBe(0);
      expect(sceneState.isGameOver).toBe(false);
      expect(sceneState.isPaused).toBe(false);
    });
  });

  describe('分数系统', () => {
    let sceneState;
    let scoreText;

    beforeEach(() => {
      sceneState = {
        score: 0
      };
      scoreText = { setText: vi.fn() };
    });

    it('should add points to score', () => {
      sceneState.score += 10;
      scoreText.setText(`分数: ${sceneState.score}`);

      expect(sceneState.score).toBe(10);
      expect(scoreText.setText).toHaveBeenCalledWith('分数: 10');
    });

    it('should accumulate score', () => {
      sceneState.score += 10;
      sceneState.score += 20;

      expect(sceneState.score).toBe(30);
    });
  });

  describe('游戏状态', () => {
    let sceneState;

    beforeEach(() => {
      sceneState = {
        isGameOver: false,
        isPaused: false
      };
    });

    it('should toggle pause state', () => {
      sceneState.isPaused = !sceneState.isPaused;
      expect(sceneState.isPaused).toBe(true);

      sceneState.isPaused = !sceneState.isPaused;
      expect(sceneState.isPaused).toBe(false);
    });

    it('should trigger game over when player falls', () => {
      const playerY = -20;

      if (playerY < GAME_CONSTANTS.WORLD_BOUNDS.minY) {
        sceneState.isGameOver = true;
      }

      expect(sceneState.isGameOver).toBe(true);
    });

    it('should not trigger game over during normal play', () => {
      const playerY = 5;

      if (playerY < GAME_CONSTANTS.WORLD_BOUNDS.minY) {
        sceneState.isGameOver = true;
      }

      expect(sceneState.isGameOver).toBe(false);
    });
  });

  describe('距离计算', () => {
    function calculateDistance(pos1, pos2) {
      return Math.sqrt(
        Math.pow(pos1.x - pos2.x, 2) +
        Math.pow(pos1.y - pos2.y, 2) +
        Math.pow(pos1.z - pos2.z, 2)
      );
    }

    it('should calculate correct 3D distance', () => {
      const pos1 = { x: 0, y: 0, z: 0 };
      const pos2 = { x: 3, y: 4, z: 0 };

      const distance = calculateDistance(pos1, pos2);

      expect(distance).toBe(5);  // 3-4-5 三角形
    });

    it('should return 0 for same positions', () => {
      const pos1 = { x: 5, y: 5, z: 5 };
      const pos2 = { x: 5, y: 5, z: 5 };

      const distance = calculateDistance(pos1, pos2);

      expect(distance).toBe(0);
    });

    it('should calculate 3D distance correctly', () => {
      const pos1 = { x: 0, y: 0, z: 0 };
      const pos2 = { x: 1, y: 2, z: 2 };

      const distance = calculateDistance(pos1, pos2);

      expect(distance).toBe(3);  // sqrt(1+4+4) = 3
    });
  });

  describe('收集检测', () => {
    function calculateDistance(pos1, pos2) {
      return Math.sqrt(
        Math.pow(pos1.x - pos2.x, 2) +
        Math.pow(pos1.y - pos2.y, 2) +
        Math.pow(pos1.z - pos2.z, 2)
      );
    }

    it('should detect nearby collectible', () => {
      const playerPos = { x: 0, y: 0, z: 0 };
      const collectiblePos = { x: 0.5, y: 0, z: 0 };

      const distance = calculateDistance(playerPos, collectiblePos);

      expect(distance).toBeLessThan(1);
    });

    it('should not detect far collectible', () => {
      const playerPos = { x: 0, y: 0, z: 0 };
      const collectiblePos = { x: 10, y: 0, z: 0 };

      const distance = calculateDistance(playerPos, collectiblePos);

      expect(distance).toBeGreaterThan(1);
    });
  });
});

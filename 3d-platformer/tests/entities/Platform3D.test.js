/**
 * Platform3D 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Platform3D } from '../../src/entities/Platform3D.js';
import { createTestScene3D } from '../setup.js';
import { GAME_CONFIG } from '../../src/config.js';

describe('Platform3D', () => {
  let scene;
  let platform;

  beforeEach(() => {
    scene = createTestScene3D();
    platform = new Platform3D(scene, 5, 10, 3);
  });

  describe('初始化', () => {
    it('should store position correctly', () => {
      expect(platform.x).toBe(5);
      expect(platform.y).toBe(10);
      expect(platform.z).toBe(3);
    });

    it('should have null game object before create', () => {
      expect(platform.gameObject).toBeNull();
    });
  });

  describe('创建', () => {
    it('should create static box', async () => {
      await platform.create();

      expect(scene.third.physics.add.box).toHaveBeenCalledWith(
        { x: 5, y: 10, z: 3 },
        { width: GAME_CONFIG.platform.width, height: GAME_CONFIG.platform.height, depth: GAME_CONFIG.platform.depth },
        { collisionFlags: 1 }  // 静态物体
      );
    });

    it('should set material color', async () => {
      await platform.create();

      expect(platform.gameObject.material).toBeDefined();
    });
  });

  describe('third getter', () => {
    it('should return scene.third', () => {
      expect(platform.third).toBe(scene.third);
    });
  });
});

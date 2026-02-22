/**
 * Player3D 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Player3D } from '../../src/entities/Player3D.js';
import { createTestScene3D, createMockInput } from '../setup.js';
import { GAME_CONFIG } from '../../src/config.js';

describe('Player3D', () => {
  let scene;
  let player;

  beforeEach(async () => {
    scene = createTestScene3D();
    player = new Player3D(scene);
    await player.create();
  });

  describe('初始化', () => {
    it('should initialize with default values', () => {
      expect(player.isGrounded).toBe(false);
      expect(player.jumpCount).toBe(0);
    });

    it('should create capsule game object', () => {
      expect(scene.third.physics.add.capsule).toHaveBeenCalled();
    });
  });

  describe('移动', () => {
    it('should move forward when up key is pressed', () => {
      const cursors = createMockInput();
      const wasd = createMockInput();
      wasd.up.isDown = true;

      player.update(cursors, wasd);

      expect(player.gameObject.body.setVelocity).toHaveBeenCalled();
    });

    it('should move left when left key is pressed', () => {
      const cursors = createMockInput();
      const wasd = createMockInput();
      wasd.left.isDown = true;

      player.update(cursors, wasd);

      expect(player.gameObject.body.setVelocity).toHaveBeenCalled();
    });

    it('should not move when no key is pressed', () => {
      const cursors = createMockInput();
      const wasd = createMockInput();

      player.update(cursors, wasd);

      // 应该设置速度为 0
      expect(player.gameObject.body.setVelocity).toHaveBeenCalledWith(
        0,
        expect.any(Number),
        0
      );
    });
  });

  describe('跳跃', () => {
    it('should jump when grounded and space is pressed', () => {
      player.isGrounded = true;
      const cursors = createMockInput();
      const wasd = createMockInput();
      wasd.space.isDown = true;

      player.update(cursors, wasd);

      expect(player.gameObject.body.setVelocityY).toHaveBeenCalledWith(
        GAME_CONFIG.player.jumpForce
      );
    });

    it('should increment jump count when jumping', () => {
      player.isGrounded = true;
      player.jump(GAME_CONFIG.player.jumpForce);

      expect(player.jumpCount).toBe(1);
    });
  });

  describe('位置获取', () => {
    it('should return current position', () => {
      player.gameObject.position = { x: 5, y: 3, z: 2 };

      const pos = player.getPosition();

      expect(pos).toEqual({ x: 5, y: 3, z: 2 });
    });

    it('should return zero position when game object is null', () => {
      player.gameObject = null;

      const pos = player.getPosition();

      expect(pos).toEqual({ x: 0, y: 0, z: 0 });
    });
  });

  describe('销毁', () => {
    it('should destroy game object', () => {
      const gameObjectRef = player.gameObject;
      player.destroy();

      expect(gameObjectRef.destroy).toHaveBeenCalled();
      expect(player.gameObject).toBeNull();
    });
  });
});

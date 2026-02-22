/**
 * Player3D - 3D 玩家角色
 *
 * 功能: 移动、跳跃、物理碰撞
 */

import { GAME_CONFIG } from '../config.js';
import * as THREE from 'three';

export class Player3D {
  constructor(scene) {
    this.scene = scene;
    this.gameObject = null;
    this.isGrounded = false;
    this.jumpCount = 0;

    // 移动状态
    this.velocity = { x: 0, y: 0, z: 0 };
  }

  async create() {
    const { radius, height } = GAME_CONFIG.player;

    // 创建胶囊体角色
    this.gameObject = await this.scene.third.physics.add.capsule(
      { x: 0, y: 2, z: 0 },
      { radius, height },
      { mass: 1 }
    );

    // 设置物理属性
    this.gameObject.body.setFriction(0.5);
    this.gameObject.body.setRestitution(0);  // 不弹跳
    this.gameObject.body.setGravity(0, GAME_CONFIG.player.gravity, 0);

    // 设置颜色
    this.gameObject.material = new THREE.MeshStandardMaterial({
      color: GAME_CONFIG.colors.player
    });

    // 碰撞检测
    this.setupCollisionDetection();

    return this.gameObject;
  }

  setupCollisionDetection() {
    // 地面检测 - 使用射线
    this.scene.events.on('update', () => {
      this.checkGround();
    });
  }

  checkGround() {
    if (!this.gameObject || !this.gameObject.body) return;

    // 简单地面检测：检查 Y 速度是否接近 0 且 Y 位置接近地面
    const velY = this.gameObject.body.velocity.y;
    const posY = this.gameObject.position.y;

    // 如果 Y 速度接近 0 且在地面上方不高的位置，认为在地面上
    const wasGrounded = this.isGrounded;
    this.isGrounded = Math.abs(velY) < 0.5 && posY < 1;

    if (this.isGrounded && !wasGrounded) {
      this.jumpCount = 0;
    }
  }

  update(cursors, wasd) {
    if (!this.gameObject) return;

    const { moveSpeed, jumpForce, maxJumpCount } = GAME_CONFIG.player;
    const currentVel = this.gameObject.body.velocity;

    // 计算移动方向
    let moveX = 0;
    let moveZ = 0;

    if (cursors.left.isDown || wasd.left.isDown) moveX = -1;
    if (cursors.right.isDown || wasd.right.isDown) moveX = 1;
    if (cursors.up.isDown || wasd.up.isDown) moveZ = -1;
    if (cursors.down.isDown || wasd.down.isDown) moveZ = 1;

    // 设置水平速度
    this.gameObject.body.setVelocity(
      moveX * moveSpeed,
      currentVel.y,  // 保持 Y 速度（重力）
      moveZ * moveSpeed
    );

    // 跳跃
    if ((cursors.up.isDown || wasd.space.isDown) && this.canJump()) {
      this.jump(jumpForce);
    }
  }

  canJump() {
    return this.isGrounded || this.jumpCount < GAME_CONFIG.player.maxJumpCount;
  }

  jump(force) {
    this.gameObject.body.setVelocityY(force);
    this.jumpCount++;
    this.isGrounded = false;
  }

  getPosition() {
    if (!this.gameObject) return { x: 0, y: 0, z: 0 };
    return {
      x: this.gameObject.position.x,
      y: this.gameObject.position.y,
      z: this.gameObject.position.z
    };
  }

  destroy() {
    if (this.gameObject) {
      this.gameObject.destroy();
      this.gameObject = null;
    }
  }
}

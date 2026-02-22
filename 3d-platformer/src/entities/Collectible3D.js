/**
 * Collectible3D - 3D 收集物品（金币等）
 */

import { GAME_CONFIG } from '../config.js';
import * as THREE from 'three';

export class Collectible3D {
  constructor(scene, x, y, z) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.z = z;
    this.gameObject = null;
    this.collected = false;
    this.rotationY = 0;
  }

  async create() {
    const { radius } = GAME_CONFIG.collectible;

    // 创建旋转的金币（球体）
    this.gameObject = this.scene.third.add.sphere(
      { x: this.x, y: this.y, z: this.z },
      { radius }
    );

    // 金色材质
    this.gameObject.material = new THREE.MeshStandardMaterial({
      color: GAME_CONFIG.colors.collectible,
      metalness: 0.8,
      roughness: 0.2
    });

    return this.gameObject;
  }

  update(time) {
    if (this.collected || !this.gameObject) return;

    // 旋转动画
    this.rotationY += GAME_CONFIG.collectible.rotateSpeed * 0.016;
    this.gameObject.rotation.y = this.rotationY;

    // 上下浮动
    this.gameObject.position.y = this.y + Math.sin(time * 0.003) * 0.2;
  }

  collect() {
    if (this.collected) return;
    this.collected = true;

    // 播放收集动画
    this.scene.tweens.add({
      targets: this.gameObject.scale,
      x: 0,
      y: 0,
      z: 0,
      duration: 200,
      onComplete: () => {
        this.destroy();
      }
    });
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
      this.scene.third.scene.remove(this.gameObject);
      this.gameObject.geometry?.dispose();
      this.gameObject.material?.dispose();
      this.gameObject = null;
    }
  }
}

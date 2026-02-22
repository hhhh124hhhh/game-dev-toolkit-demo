/**
 * Platform3D - 3D 平台
 */

import { GAME_CONFIG } from '../config.js';
import * as THREE from 'three';

export class Platform3D {
  constructor(scene, x, y, z) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.z = z;
    this.gameObject = null;
  }

  async create() {
    const { width, height, depth } = GAME_CONFIG.platform;

    // 创建静态平台
    this.gameObject = this.third.physics.add.box(
      { x: this.x, y: this.y, z: this.z },
      { width, height, depth },
      { collisionFlags: 1 }  // 静态物体
    );

    // 设置材质
    this.gameObject.material = new THREE.MeshStandardMaterial({
      color: GAME_CONFIG.colors.platform
    });

    return this.gameObject;
  }

  // 简化 this.third 访问
  get third() {
    return this.scene.third;
  }
}

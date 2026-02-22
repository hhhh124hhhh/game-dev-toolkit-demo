/**
 * CameraController - 第三人称相机控制
 */

import { GAME_CONFIG } from '../config.js';
import * as THREE from 'three';

export class CameraController {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.offset = new THREE.Vector3(
      GAME_CONFIG.camera.offset.x,
      GAME_CONFIG.camera.offset.y,
      GAME_CONFIG.camera.offset.z
    );
  }

  update() {
    // 空值检查
    if (!this.player || !this.player.getPosition) return;
    
    const playerPos = this.player.getPosition();
    if (!playerPos) return;
    
    const targetPos = new THREE.Vector3(
      playerPos.x + this.offset.x,
      playerPos.y + this.offset.y,
      playerPos.z + this.offset.z
    );

    // 平滑跟随 (lerp)
    this.scene.third.camera.position.lerp(targetPos, GAME_CONFIG.camera.lerp);

    // 始终看向玩家
    this.scene.third.camera.lookAt(playerPos.x, playerPos.y, playerPos.z);
  }
}

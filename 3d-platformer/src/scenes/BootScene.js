/**
 * Boot Scene - 资源加载和场景初始化
 */

import { Scene3D } from '@enable3d/phaser-extension';

export class BootScene extends Scene3D {
  constructor() {
    super({ key: 'BootScene' });
  }

  init() {
    // CRITICAL: 必须在 init() 中调用 accessThirdDimension() 初始化 3D 环境
    this.accessThirdDimension();
  }

  async create() {
    console.log('[BootScene] Initializing 3D scene...');

    // CRITICAL: 使用 warpSpeed 快速配置场景
    // 自动添加: 地面、光源、天空、轨道控制
    await this.third.warpSpeed('-orbit');  // 不需要轨道控制

    // 物理引擎时间步长由 Enable3D 自动管理
    // 如需自定义，可通过 physics.config 配置

    // 设置相机初始位置
    this.third.camera.position.set(0, 10, 20);
    this.third.camera.lookAt(0, 0, 0);

    console.log('[BootScene] 3D scene initialized');

    // 启动主游戏场景
    this.scene.start('GameScene3D');
  }
}

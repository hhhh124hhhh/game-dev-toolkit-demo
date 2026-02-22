/**
 * 3D Platformer 游戏配置
 */

export const GAME_CONFIG = {
  // 显示设置
  width: 800,
  height: 600,
  debug: false,

  // 3D 相机设置
  camera: {
    fov: 60,
    near: 0.1,
    far: 1000,
    offset: { x: 0, y: 8, z: 15 },  // 第三人称偏移
    lerp: 0.1                        // 平滑跟随系数
  },

  // 玩家设置
  player: {
    moveSpeed: 8,
    jumpForce: 10,
    gravity: -20,
    radius: 0.5,
    height: 1.8,
    maxJumpCount: 1                  // 允许二段跳
  },

  // 平台设置
  platform: {
    width: 4,
    height: 0.5,
    depth: 4,
    gap: 6                           // 平台间距
  },

  // 收集物品设置
  collectible: {
    radius: 0.3,
    rotateSpeed: 2,
    value: 10
  },

  // 物理设置
  physics: {
    fixedTimeStep: 1 / 120,          // 防止穿透
    gravity: { x: 0, y: -20, z: 0 }
  },

  // 颜色配置
  colors: {
    ground: 0x333333,
    platform: 0x00ff88,
    player: 0xff6600,
    collectible: 0xffdd00,
    sky: 0x87ceeb
  }
};

// 游戏常量
export const GAME_CONSTANTS = {
  PLATFORM_COUNT: 15,
  COLLECTIBLE_COUNT: 20,
  WORLD_BOUNDS: {
    minX: -50,
    maxX: 50,
    minY: -10,
    maxY: 100,
    minZ: -50,
    maxZ: 50
  }
};

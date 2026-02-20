/**
 * 霓虹坠落 - 游戏配置
 * Neon Fall 100 - Game Configuration
 */

export const GAME_CONFIG = {
  // 游戏基础设置
  title: '霓虹坠落 - 100层挑战',
  version: '1.0.0',

  // 画布尺寸
  width: 480,
  height: 800,

  // 物理设置
  physics: {
    gravity: 800,
    playerSpeed: 300,
    jumpVelocity: -500,
    bounceVelocity: -700,  // 弹跳平台
    fallSpeed: 600,
  },

  // 平台设置
  platform: {
    width: 100,
    height: 20,
    minGap: 200,
    maxGap: 300,
    horizontalMargin: 40,
  },

  // 能力系统
  abilities: {
    fallBoost: {
      duration: 0,
      color: 0x00aaff,
      name: '下坠加速',
    },
    flying: {
      duration: 3000,
      color: 0xaa00ff,
      name: '飞行',
    },
    shield: {
      duration: 5000,
      color: 0xffaa00,
      name: '护盾',
    },
    speedBoost: {
      duration: 4000,
      color: 0xff0066,
      name: '加速',
    },
  },

  // 成就系统
  achievements: {
    firstSteps: { name: '初次尝试', desc: '到达第10层', target: 10 },
    halfway: { name: '半程达人', desc: '到达第50层', target: 50 },
    champion: { name: '百层王者', desc: '到达第100层', target: 100 },
    collector: { name: '能量收集者', desc: '收集50个能量', target: 50 },
    survivor: { name: '生存大师', desc: '存活5分钟', target: 300 },
  },

  // 难度曲线
  difficulty: {
    // 每10层增加的难度参数
    platformSpeedIncrease: 20,
    gapIncrease: 5,
    specialPlatformChance: 0.1,
  },

  // 颜色主题 (赛博朋克/霓虹风格)
  colors: {
    background: 0x0a0a0f,
    neonCyan: 0x00ffff,
    neonMagenta: 0xff00ff,
    neonYellow: 0xffff00,
    neonGreen: 0x00ff00,
    neonOrange: 0xff6600,
    neonPink: 0xff0066,
    neonBlue: 0x00aaff,
  },

  // 平台类型
  platformTypes: {
    normal: { color: 0x00ffff, bounce: false, moving: false, breakable: false },
    bounce: { color: 0x00ff00, bounce: true, moving: false, breakable: false },
    moving: { color: 0xff00ff, bounce: false, moving: true, breakable: false },
    breakable: { color: 0xff6600, bounce: false, moving: false, breakable: true },
    portal: { color: 0xaa00ff, bounce: false, moving: false, breakable: false, portal: true },
    ice: { color: 0x00aaff, bounce: false, moving: false, breakable: false, slippery: true },
    vanish: { color: 0xffff00, bounce: false, moving: false, breakable: false, vanishing: true },
  },

  // 音频设置
  audio: {
    musicVolume: 0.5,
    sfxVolume: 0.7,
  },
};

// 游戏状态
export const GameState = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
};

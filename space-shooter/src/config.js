// 游戏配置
export const GAME_CONFIG = {
  width: 600,
  height: 800,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

// 玩家配置
export const PLAYER_CONFIG = {
  speed: 300,
  fireRate: 200,      // 毫秒
  maxLives: 5,
  invincibleTime: 2000
};

// 子弹配置
export const BULLET_CONFIG = {
  playerSpeed: 500,
  enemySpeed: 300,
  poolSize: 50
};

// 敌人配置
export const ENEMY_CONFIG = {
  basic: {
    health: 1,
    speed: 100,
    score: 10,
    pattern: 'straight',
    canShoot: false,
    shootChance: 0
  },
  medium: {
    health: 2,
    speed: 80,
    score: 25,
    pattern: 'zigzag',
    canShoot: true,
    shootChance: 0.01
  },
  heavy: {
    health: 5,
    speed: 50,
    score: 50,
    pattern: 'straight',
    canShoot: true,
    shootChance: 0.02
  },
  boss: {
    health: 50,
    speed: 30,
    score: 200,
    pattern: 'boss',
    canShoot: true,
    shootChance: 0.05
  }
};

// 道具配置
export const POWERUP_CONFIG = {
  energy: {
    type: 'energy',
    effect: 'heal',
    value: 1,
    duration: 0,
    color: 0x00ff00
  },
  doubleFire: {
    type: 'doubleFire',
    effect: 'doubleFire',
    value: 2,
    duration: 5000,
    color: 0xffff00
  },
  shield: {
    type: 'shield',
    effect: 'shield',
    value: 1,
    duration: 3000,
    color: 0x00ffff
  }
};

// 波次配置
export const WAVE_CONFIG = [
  // Wave 1 - 简单入门
  { enemies: ['basic', 'basic', 'basic'], delay: 1500 },
  // Wave 2
  { enemies: ['basic', 'basic', 'basic', 'basic'], delay: 1200 },
  // Wave 3 - 引入中型机
  { enemies: ['basic', 'basic', 'medium'], delay: 1200 },
  // Wave 4
  { enemies: ['basic', 'medium', 'basic', 'medium'], delay: 1000 },
  // Wave 5 - 引入重型机
  { enemies: ['medium', 'medium', 'heavy'], delay: 1000 },
  // Wave 6
  { enemies: ['basic', 'medium', 'heavy', 'medium'], delay: 800 },
  // Wave 7
  { enemies: ['medium', 'heavy', 'medium', 'heavy'], delay: 800 },
  // Wave 8
  { enemies: ['heavy', 'medium', 'heavy', 'medium', 'heavy'], delay: 600 },
  // Wave 9
  { enemies: ['heavy', 'heavy', 'medium', 'medium', 'basic'], delay: 500 },
  // Wave 10 - Boss
  { enemies: ['boss'], delay: 0, isBossWave: true }
];

// 深度配置
export const DEPTH = {
  BACKGROUND: 0,
  STARS: 1,
  POWERUPS: 5,
  ENEMIES: 10,
  ENEMY_BULLETS: 11,
  PLAYER: 15,
  PLAYER_BULLETS: 16,
  EXPLOSIONS: 20,
  UI: 100
};

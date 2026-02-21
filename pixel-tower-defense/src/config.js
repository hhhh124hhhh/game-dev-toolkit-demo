/**
 * 游戏配置 - 基于塔防游戏最佳实践重新设计
 * 参考: https://www.gamedeveloper.com/production/i-designed-economies-for-150m-games-here-s-my-ultimate-handbook
 */
export const GAME_CONFIG = {
  // 游戏尺寸
  width: 800,
  height: 600,

  // 网格配置
  grid: {
    cellSize: 40,
    cols: 20,
    rows: 15
  },

  // 游戏平衡 - 基于最佳实践重新设计
  balance: {
    startGold: 200,           // 增加：能建4个箭塔
    startLives: 30,           // 增加：更多容错
    waveDelay: 8000,          // 增加：8秒准备时间
    spawnDelay: 1500,         // 增加：更慢的敌人生成
    waveBonusGold: 20,        // 新增：每波完成基础奖励
    interestRate: 0.1,        // 新增：10%利息
    maxInterest: 5            // 新增：最大利息5金/波
  },

  // 调试模式
  debug: {
    showPath: false,
    showGrid: false,
    showRange: false
  }
};

/**
 * 塔配置 - 递减回报原则
 * 高级塔成本不成比例高于伤害增加
 */
export const TOWER_CONFIG = {
  arrow: {
    name: '箭塔',
    cost: 50,
    damage: 10,
    range: 120,
    fireRate: 500,      // 毫秒
    color: 0x00ff88,
    description: '快速射击，单体伤害'
  },
  mage: {
    name: '魔法塔',
    cost: 80,           // 降低：100 → 80
    damage: 20,         // 调整：25 → 20
    range: 100,
    fireRate: 1000,
    splashRadius: 40,
    color: 0x8800ff,
    description: '范围伤害，中等攻速'
  },
  cannon: {
    name: '炮塔',
    cost: 120,          // 降低：150 → 120
    damage: 40,         // 调整：50 → 40
    range: 150,
    fireRate: 2000,
    splashRadius: 60,
    color: 0xff8800,
    description: '高伤害AOE，慢速'
  },
  slow: {
    name: '减速塔',
    cost: 60,           // 降低：75 → 60
    damage: 0,
    range: 100,
    fireRate: 800,
    slowFactor: 0.5,
    slowDuration: 2000,
    color: 0x00ffff,
    description: '减缓敌人移动速度50%'
  }
};

/**
 * 敌人配置 - 更平衡的数值
 * 遵循"平均3次尝试通关"原则
 */
export const ENEMY_CONFIG = {
  basic: {
    name: '小怪',
    health: 30,        // 降低：50 → 30
    speed: 50,         // 降低：60 → 50
    reward: 10,
    color: 0xff0000,
    size: 24
  },
  fast: {
    name: '快速敌人',
    health: 20,        // 降低：30 → 20
    speed: 80,         // 降低：120 → 80
    reward: 12,        // 调整：15 → 12
    color: 0xffff00,
    size: 20
  },
  tank: {
    name: '坦克',
    health: 100,       // 降低：200 → 100
    speed: 30,         // 降低：40 → 30
    reward: 25,        // 调整：30 → 25
    color: 0x880000,
    size: 40
  },
  boss: {
    name: 'Boss',
    health: 200,       // 降低：300 → 200
    speed: 35,         // 调整：40 → 35
    reward: 80,        // 调整：100 → 80
    color: 0xff00ff,
    size: 64
  }
};

/**
 * 波次配置 - 更平缓的难度曲线
 * 遵循"慢开始 → 建立紧张 → Boss高潮"原则
 * 每波包含：敌人数组、生成延迟、波次奖励
 */
export const WAVE_CONFIG = [
  // Wave 1 - 入门：2个弱敌人
  { enemies: ['basic', 'basic'], delay: 2000, bonusGold: 20 },
  // Wave 2 - 3个敌人
  { enemies: ['basic', 'basic', 'basic'], delay: 1800, bonusGold: 25 },
  // Wave 3 - 引入快速敌人
  { enemies: ['basic', 'fast', 'basic'], delay: 1500, bonusGold: 30 },
  // Wave 4 - 更多敌人
  { enemies: ['basic', 'basic', 'fast', 'basic'], delay: 1400, bonusGold: 35 },
  // Wave 5 - 小高潮：首次坦克
  { enemies: ['basic', 'tank', 'basic'], delay: 1500, bonusGold: 40 },
  // Wave 6 - 平静期：混合敌人
  { enemies: ['fast', 'basic', 'tank', 'basic'], delay: 1300, bonusGold: 45 },
  // Wave 7 - 更多快速敌人
  { enemies: ['fast', 'fast', 'basic', 'tank'], delay: 1200, bonusGold: 50 },
  // Wave 8 - 密集波
  { enemies: ['basic', 'fast', 'basic', 'fast', 'basic'], delay: 1000, bonusGold: 55 },
  // Wave 9 - Boss前奏
  { enemies: ['tank', 'fast', 'fast', 'tank'], delay: 1200, bonusGold: 60 },
  // Wave 10 - 大高潮：Boss!
  { enemies: ['boss'], delay: 0, isBossWave: true, bonusGold: 100 }
];

/**
 * 地图路径点（网格坐标）
 */
export const MAP_PATH = [
  { x: 0, y: 7 },
  { x: 5, y: 7 },
  { x: 5, y: 3 },
  { x: 10, y: 3 },
  { x: 10, y: 11 },
  { x: 15, y: 11 },
  { x: 15, y: 7 },
  { x: 20, y: 7 }
];

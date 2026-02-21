/**
 * Breakout 游戏配置
 */
export const GAME_CONFIG = {
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',

  paddle: {
    width: 120,
    height: 20,
    speed: 500,
    yOffset: 50  // 距离底部的距离
  },

  ball: {
    radius: 10,
    speed: 400,
    maxSpeed: 600
  },

  bricks: {
    rows: 5,
    cols: 10,
    width: 70,
    height: 25,
    gap: 4,
    offsetTop: 60,
    offsetLeft: 25
  },

  colors: {
    background: '#1a1a2e',
    paddle: '#00d4ff',
    ball: '#ffffff',
    text: '#ffffff',
    textShadow: '#000033'
  }
};

/**
 * 砖块颜色配置（按行）
 */
export const BRICK_COLORS = [
  '#ff4757',  // 红色 - 第1行（最高分）
  '#ff6b81',  // 粉红 - 第2行
  '#ffa502',  // 橙色 - 第3行
  '#2ed573',  // 绿色 - 第4行
  '#3742fa'   // 蓝色 - 第5行（最低分）
];

/**
 * 砖块分数配置（按行）
 */
export const BRICK_POINTS = [50, 40, 30, 20, 10];

/**
 * 游戏设置
 */
export const GAME_SETTINGS = {
  lives: 3,
  levels: 3,
  scoreMultiplier: 1.5  // 每关分数倍增
};

/**
 * 消除游戏配置
 * 结合 Pencil MCP 设计规格
 */

export const GAME_CONFIG = {
  width: 600,
  height: 800,
  backgroundColor: '#1a1a2e',

  grid: {
    rows: 8,
    cols: 8,
    gemSize: 60,        // 宝石尺寸 60x60（来自 Pencil）
    gemGap: 2,          // 宝石间距 2（来自 Pencil）
    padding: 10,        // 棋盘内边距（来自 Pencil）
    offsetX: 40,        // (600 - 8*62 - 10*2) / 2 = 40
    offsetY: 80         // 留出顶部 HUD 空间
  },

  gemTypes: 6,
  matchMin: 3,
  cascadeDelay: 200,

  colors: {
    background: '#1a1a2e',    // 保持不变
    board: '#0f0f23',         // 深黑蓝（来自 Pencil）
    text: '#ffffff',
    textShadow: '#000033',
    movesHighlight: '#00ff88' // 步数高亮颜色（来自 Pencil）
  }
};

/**
 * 宝石颜色 - 来自 Pencil MCP 设计
 * 索引: 0=红, 1=蓝, 2=绿, 3=黄, 4=紫, 5=橙
 */
export const GEM_COLORS = [
  '#ff4757',  // 0: 红色
  '#3742fa',  // 1: 蓝色
  '#2ed573',  // 2: 绿色
  '#ffa502',  // 3: 黄色
  '#a55eea',  // 4: 紫色
  '#ff6b81'   // 5: 橙色
];

export const SCORE_CONFIG = {
  match3: 100,
  match4: 200,
  match5: 500,
  cascadeMultiplier: 1.5
};

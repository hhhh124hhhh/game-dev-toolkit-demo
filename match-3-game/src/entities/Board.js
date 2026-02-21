import { MatchDetector } from '../systems/MatchDetector.js';

/**
 * Board - 游戏棋盘管理
 * 负责网格初始化、交换、下落、填充
 */
export class Board {
  /**
   * @param {number} rows - 行数
   * @param {number} cols - 列数
   * @param {number} gemTypes - 宝石类型数量
   */
  constructor(rows, cols, gemTypes) {
    this.rows = rows;
    this.cols = cols;
    this.gemTypes = gemTypes;
    this.grid = [];
    this.detector = new MatchDetector(rows, cols, 3);

    this.initializeGrid();
  }

  /**
   * 初始化网格，避免初始三连
   */
  initializeGrid() {
    this.grid = [];

    for (let row = 0; row < this.rows; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.cols; col++) {
        this.grid[row][col] = this.getRandomTypeWithoutMatch(row, col);
      }
    }
  }

  /**
   * 获取一个不会产生三连的随机类型
   * @param {number} row - 当前行
   * @param {number} col - 当前列
   * @returns {number} 宝石类型
   */
  getRandomTypeWithoutMatch(row, col) {
    const excludedTypes = new Set();

    // 检查左边两个是否相同
    if (col >= 2) {
      const left1 = this.grid[row][col - 1];
      const left2 = this.grid[row][col - 2];
      if (left1 !== null && left1 !== undefined && left1 === left2) {
        excludedTypes.add(left1);
      }
    }

    // 检查上面两个是否相同
    if (row >= 2) {
      const up1 = this.grid[row - 1][col];
      const up2 = this.grid[row - 2][col];
      if (up1 !== null && up1 !== undefined && up1 === up2) {
        excludedTypes.add(up1);
      }
    }

    // 从可用类型中随机选择
    const availableTypes = [];
    for (let t = 0; t < this.gemTypes; t++) {
      if (!excludedTypes.has(t)) {
        availableTypes.push(t);
      }
    }

    // 如果所有类型都被排除（极少情况），随机选一个
    if (availableTypes.length === 0) {
      return Math.floor(Math.random() * this.gemTypes);
    }

    return availableTypes[Math.floor(Math.random() * availableTypes.length)];
  }

  /**
   * 交换两个位置的宝石
   * @param {{row: number, col: number}} pos1
   * @param {{row: number, col: number}} pos2
   * @returns {boolean} 是否成功交换
   */
  swap(pos1, pos2) {
    // 检查是否相邻
    if (!this.detector.isAdjacent(pos1, pos2)) {
      return false;
    }

    // 交换
    const temp = this.grid[pos1.row][pos1.col];
    this.grid[pos1.row][pos1.col] = this.grid[pos2.row][pos2.col];
    this.grid[pos2.row][pos2.col] = temp;

    return true;
  }

  /**
   * 应用重力，让宝石下落
   */
  applyGravity() {
    for (let col = 0; col < this.cols; col++) {
      // 从下往上扫描，收集非空宝石
      const gems = [];
      for (let row = this.rows - 1; row >= 0; row--) {
        if (this.grid[row][col] !== null) {
          gems.push(this.grid[row][col]);
        }
      }

      // 从底部重新填充
      for (let row = this.rows - 1; row >= 0; row--) {
        const idx = this.rows - 1 - row;
        if (idx < gems.length) {
          this.grid[row][col] = gems[idx];
        } else {
          this.grid[row][col] = null;
        }
      }
    }
  }

  /**
   * 填充空位（顶部生成新宝石）
   */
  fillEmpty() {
    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row < this.rows; row++) {
        if (this.grid[row][col] === null) {
          this.grid[row][col] = Math.floor(Math.random() * this.gemTypes);
        }
      }
    }
  }

  /**
   * 移除匹配的宝石
   * @param {Array<{row: number, col: number}>} positions
   */
  removeMatches(positions) {
    for (const pos of positions) {
      this.grid[pos.row][pos.col] = null;
    }
  }

  /**
   * 获取指定位置的宝石类型
   * @param {number} row
   * @param {number} col
   * @returns {number|null}
   */
  getGem(row, col) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return null;
    }
    return this.grid[row][col];
  }

  /**
   * 设置指定位置的宝石类型
   * @param {number} row
   * @param {number} col
   * @param {number|null} type
   */
  setGem(row, col, type) {
    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      this.grid[row][col] = type;
    }
  }
}

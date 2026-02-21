/**
 * MatchDetector - 匹配检测系统
 * 使用滑动窗口算法检测水平/垂直三连
 */
export class MatchDetector {
  /**
   * @param {number} rows - 网格行数
   * @param {number} cols - 网格列数
   * @param {number} matchMin - 最小匹配数量（默认3）
   */
  constructor(rows, cols, matchMin = 3) {
    this.rows = rows;
    this.cols = cols;
    this.matchMin = matchMin;
  }

  /**
   * 查找网格中所有匹配
   * @param {Array<Array<number>>} grid - 2D宝石类型网格
   * @returns {Array<{type: number, positions: Array<{row: number, col: number}>}>}
   */
  findMatches(grid) {
    const matches = [];
    const visited = new Set();

    // 水平扫描
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col <= this.cols - this.matchMin; col++) {
        const type = grid[row][col];
        if (type === null || type === undefined) continue;

        const positions = [{ row, col }];
        let matchLength = 1;

        // 向右扫描
        for (let c = col + 1; c < this.cols; c++) {
          if (grid[row][c] === type) {
            positions.push({ row, col: c });
            matchLength++;
          } else {
            break;
          }
        }

        if (matchLength >= this.matchMin) {
          const key = positions.map(p => `${p.row},${p.col}`).sort().join('|');
          if (!visited.has(key)) {
            visited.add(key);
            matches.push({ type, positions: positions });
          }
        }
      }
    }

    // 垂直扫描
    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row <= this.rows - this.matchMin; row++) {
        const type = grid[row][col];
        if (type === null || type === undefined) continue;

        const positions = [{ row, col }];
        let matchLength = 1;

        // 向下扫描
        for (let r = row + 1; r < this.rows; r++) {
          if (grid[r][col] === type) {
            positions.push({ row: r, col });
            matchLength++;
          } else {
            break;
          }
        }

        if (matchLength >= this.matchMin) {
          const key = positions.map(p => `${p.row},${p.col}`).sort().join('|');
          if (!visited.has(key)) {
            visited.add(key);
            matches.push({ type, positions: positions });
          }
        }
      }
    }

    return matches;
  }

  /**
   * 检测指定位置附近的匹配（用于交换后检测）
   * @param {Array<Array<number>>} grid - 2D宝石类型网格
   * @param {number} col - 列索引
   * @param {number} row - 行索引
   * @returns {Array<{type: number, positions: Array<{row: number, col: number}>}>}
   */
  findMatchesAt(grid, col, row) {
    const type = grid[row][col];
    if (type === null || type === undefined) return [];

    const matches = [];

    // 水平检测
    const horizontalPositions = [{ row, col }];

    // 向左扫描
    for (let c = col - 1; c >= 0; c--) {
      if (grid[row][c] === type) {
        horizontalPositions.unshift({ row, col: c });
      } else {
        break;
      }
    }

    // 向右扫描
    for (let c = col + 1; c < this.cols; c++) {
      if (grid[row][c] === type) {
        horizontalPositions.push({ row, col: c });
      } else {
        break;
      }
    }

    if (horizontalPositions.length >= this.matchMin) {
      matches.push({ type, positions: horizontalPositions });
    }

    // 垂直检测
    const verticalPositions = [{ row, col }];

    // 向上扫描
    for (let r = row - 1; r >= 0; r--) {
      if (grid[r][col] === type) {
        verticalPositions.unshift({ row: r, col });
      } else {
        break;
      }
    }

    // 向下扫描
    for (let r = row + 1; r < this.rows; r++) {
      if (grid[r][col] === type) {
        verticalPositions.push({ row: r, col });
      } else {
        break;
      }
    }

    if (verticalPositions.length >= this.matchMin) {
      matches.push({ type, positions: verticalPositions });
    }

    return matches;
  }

  /**
   * 检查两个位置是否相邻
   * @param {{row: number, col: number}} pos1
   * @param {{row: number, col: number}} pos2
   * @returns {boolean}
   */
  isAdjacent(pos1, pos2) {
    const rowDiff = Math.abs(pos1.row - pos2.row);
    const colDiff = Math.abs(pos1.col - pos2.col);

    // 相邻意味着：行差1且列差0，或行差0且列差1
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  }
}

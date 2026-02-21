/**
 * Pathfinding - A* 寻路系统
 */
export class Pathfinding {
  /**
   * A* 寻路算法
   * @param {number[][]} grid - 网格 (0=可通过, 1=障碍)
   * @param {number[]} start - 起点 [x, y]
   * @param {number[]} end - 终点 [x, y]
   * @returns {number[][]} 路径数组 [[x,y], [x,y], ...]
   */
  static findPath(grid, start, end) {
    const rows = grid.length;
    const cols = grid[0].length;

    // 开放列表和关闭列表
    const openList = [];
    const closedList = new Set();

    // 节点信息
    const nodes = [];
    for (let y = 0; y < rows; y++) {
      nodes[y] = [];
      for (let x = 0; x < cols; x++) {
        nodes[y][x] = {
          x,
          y,
          g: 0,          // 从起点到当前节点的成本
          h: 0,          // 从当前节点到终点的估计成本
          f: 0,          // g + h
          parent: null
        };
      }
    }

    // 起点加入开放列表
    const startNode = nodes[start[1]][start[0]];
    openList.push(startNode);

    // 方向：上、下、左、右
    const directions = [
      [0, -1], [0, 1], [-1, 0], [1, 0]
    ];

    while (openList.length > 0) {
      // 找到 f 值最小的节点
      let currentIndex = 0;
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].f < openList[currentIndex].f) {
          currentIndex = i;
        }
      }
      const current = openList[currentIndex];

      // 到达终点
      if (current.x === end[0] && current.y === end[1]) {
        const path = [];
        let node = current;
        while (node) {
          path.unshift([node.x, node.y]);
          node = node.parent;
        }
        return path;
      }

      // 移动到关闭列表
      openList.splice(currentIndex, 1);
      closedList.add(`${current.x},${current.y}`);

      // 检查相邻节点
      for (const [dx, dy] of directions) {
        const nx = current.x + dx;
        const ny = current.y + dy;

        // 边界检查
        if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;

        // 障碍物检查
        if (grid[ny][nx] === 1) continue;

        // 已在关闭列表
        if (closedList.has(`${nx},${ny}`)) continue;

        const neighbor = nodes[ny][nx];
        const tentativeG = current.g + 1;

        // 检查是否需要更新
        const inOpenList = openList.includes(neighbor);
        if (!inOpenList || tentativeG < neighbor.g) {
          neighbor.g = tentativeG;
          neighbor.h = this.heuristic(nx, ny, end[0], end[1]);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = current;

          if (!inOpenList) {
            openList.push(neighbor);
          }
        }
      }
    }

    // 无法找到路径
    return [];
  }

  /**
   * 曼哈顿距离启发函数
   */
  static heuristic(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  /**
   * 从路径点生成平滑路径（像素坐标）
   * @param {number[][]} path - 网格路径
   * @param {number} cellSize - 网格大小
   * @returns {number[][]} 像素坐标路径
   */
  static toPixelPath(path, cellSize) {
    return path.map(([x, y]) => [
      x * cellSize + cellSize / 2,
      y * cellSize + cellSize / 2
    ]);
  }
}

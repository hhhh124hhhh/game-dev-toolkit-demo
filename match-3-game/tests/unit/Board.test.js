import { describe, it, expect, beforeEach } from 'vitest';

describe('Board', () => {
  let board;

  // Mock Board class will be imported after implementation
  beforeEach(async () => {
    // 动态导入以使用 mock
    const { Board } = await import('../../src/entities/Board.js');
    board = new Board(8, 8, 6);
  });

  describe('初始化', () => {
    it('应该创建指定大小的网格', async () => {
      const { Board } = await import('../../src/entities/Board.js');
      board = new Board(8, 8, 6);

      expect(board.rows).toBe(8);
      expect(board.cols).toBe(8);
      expect(board.grid.length).toBe(8);
      expect(board.grid[0].length).toBe(8);
    });

    it('初始化时不应该有三连', async () => {
      const { Board } = await import('../../src/entities/Board.js');
      board = new Board(8, 8, 6);

      // 检查水平三连
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 6; col++) {
          const type = board.grid[row][col];
          if (board.grid[row][col + 1] === type && board.grid[row][col + 2] === type) {
            expect.fail(`发现水平三连在位置 (${row}, ${col})`);
          }
        }
      }

      // 检查垂直三连
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 8; col++) {
          const type = board.grid[row][col];
          if (board.grid[row + 1][col] === type && board.grid[row + 2][col] === type) {
            expect.fail(`发现垂直三连在位置 (${row}, ${col})`);
          }
        }
      }
    });

    it('宝石类型应该在有效范围内', async () => {
      const { Board } = await import('../../src/entities/Board.js');
      board = new Board(8, 8, 6);

      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          expect(board.grid[row][col]).toBeGreaterThanOrEqual(0);
          expect(board.grid[row][col]).toBeLessThan(6);
        }
      }
    });
  });

  describe('交换功能', () => {
    it('应该能交换两个相邻的宝石', async () => {
      const { Board } = await import('../../src/entities/Board.js');
      board = new Board(8, 8, 6);

      const pos1 = { row: 0, col: 0 };
      const pos2 = { row: 0, col: 1 };

      const type1 = board.grid[pos1.row][pos1.col];
      const type2 = board.grid[pos2.row][pos2.col];

      board.swap(pos1, pos2);

      expect(board.grid[pos1.row][pos1.col]).toBe(type2);
      expect(board.grid[pos2.row][pos2.col]).toBe(type1);
    });

    it('不相邻的宝石不应该交换', async () => {
      const { Board } = await import('../../src/entities/Board.js');
      board = new Board(8, 8, 6);

      const pos1 = { row: 0, col: 0 };
      const pos2 = { row: 2, col: 2 };

      const type1 = board.grid[pos1.row][pos1.col];

      const result = board.swap(pos1, pos2);

      expect(result).toBe(false);
      expect(board.grid[pos1.row][pos1.col]).toBe(type1);
    });
  });

  describe('下落填充', () => {
    it('消除后上方的宝石应该下落', async () => {
      const { Board } = await import('../../src/entities/Board.js');
      board = new Board(8, 8, 6);

      // 手动设置一个消除场景：清除底部3行
      board.grid[5][0] = null;
      board.grid[6][0] = null;
      board.grid[7][0] = null;

      // 记录消除前第4行的宝石类型（应该落到最底部第7行）
      const bottomType = board.grid[4][0];

      board.applyGravity();

      // 第4行的宝石应该落到第7行（底部）
      expect(board.grid[7][0]).toBe(bottomType);
    });

    it('下落后顶部应该留空', async () => {
      const { Board } = await import('../../src/entities/Board.js');
      board = new Board(8, 8, 6);

      // 清除底部3行
      board.grid[5][0] = null;
      board.grid[6][0] = null;
      board.grid[7][0] = null;

      board.applyGravity();

      // 顶部3行应该为null（因为5个宝石下落到填满5-7，顶部3格留空）
      expect(board.grid[0][0]).toBe(null);
      expect(board.grid[1][0]).toBe(null);
      expect(board.grid[2][0]).toBe(null);
    });
  });

  describe('新宝石生成', () => {
    it('空位置应该填充新宝石', async () => {
      const { Board } = await import('../../src/entities/Board.js');
      board = new Board(8, 8, 6);

      // 清空一列
      for (let row = 0; row < 8; row++) {
        board.grid[row][0] = null;
      }

      board.fillEmpty();

      // 所有位置应该有宝石
      for (let row = 0; row < 8; row++) {
        expect(board.grid[row][0]).not.toBe(null);
        expect(board.grid[row][0]).toBeGreaterThanOrEqual(0);
        expect(board.grid[row][0]).toBeLessThan(6);
      }
    });
  });
});

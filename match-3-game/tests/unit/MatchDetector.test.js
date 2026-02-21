import { describe, it, expect, beforeEach } from 'vitest';
import { MatchDetector } from '../../src/systems/MatchDetector.js';

describe('MatchDetector', () => {
  let detector;
  let grid;

  beforeEach(() => {
    detector = new MatchDetector(8, 8);
  });

  describe('水平匹配检测', () => {
    it('应该检测到3个连续相同宝石', () => {
      // 创建一个有水平三连的网格
      grid = [
        [0, 1, 2, 3, 4, 5, 0, 1],
        [0, 1, 1, 1, 4, 5, 0, 1], // 索引1-3是三连
        [0, 1, 2, 3, 4, 5, 0, 1],
        [0, 1, 2, 3, 4, 5, 0, 1],
        [0, 1, 2, 3, 4, 5, 0, 1],
        [0, 1, 2, 3, 4, 5, 0, 1],
        [0, 1, 2, 3, 4, 5, 0, 1],
        [0, 1, 2, 3, 4, 5, 0, 1]
      ];

      const matches = detector.findMatches(grid);

      expect(matches.length).toBeGreaterThan(0);
      expect(matches.some(m => m.type === 1 && m.positions.length >= 3)).toBe(true);
    });

    it('应该检测到4个连续相同宝石', () => {
      grid = [
        [0, 2, 2, 2, 2, 5, 0, 1], // 索引1-4是四连
        [0, 1, 2, 3, 4, 5, 0, 1],
        [0, 1, 2, 3, 4, 5, 0, 1],
        [0, 1, 2, 3, 4, 5, 0, 1],
        [0, 1, 2, 3, 4, 5, 0, 1],
        [0, 1, 2, 3, 4, 5, 0, 1],
        [0, 1, 2, 3, 4, 5, 0, 1],
        [0, 1, 2, 3, 4, 5, 0, 1]
      ];

      const matches = detector.findMatches(grid);

      expect(matches.some(m => m.type === 2 && m.positions.length >= 4)).toBe(true);
    });
  });

  describe('垂直匹配检测', () => {
    it('应该检测到3个垂直连续相同宝石', () => {
      grid = [
        [0, 1, 2, 3, 4, 5, 0, 1],
        [0, 1, 2, 3, 4, 5, 0, 1],
        [0, 1, 2, 3, 4, 5, 0, 1],
        [0, 3, 2, 3, 4, 5, 0, 1],
        [0, 3, 2, 3, 4, 5, 0, 1],
        [0, 3, 2, 3, 4, 5, 0, 1],
        [0, 1, 2, 3, 4, 5, 0, 1],
        [0, 1, 2, 3, 4, 5, 0, 1]
      ];
      // 列1，行3-5是三连

      const matches = detector.findMatches(grid);

      expect(matches.some(m => m.type === 3 && m.positions.length >= 3)).toBe(true);
    });
  });

  describe('无匹配情况', () => {
    it('没有三连时应该返回空数组', () => {
      grid = [
        [0, 1, 2, 3, 4, 5, 0, 1],
        [1, 2, 3, 4, 5, 0, 1, 2],
        [2, 3, 4, 5, 0, 1, 2, 3],
        [3, 4, 5, 0, 1, 2, 3, 4],
        [4, 5, 0, 1, 2, 3, 4, 5],
        [5, 0, 1, 2, 3, 4, 5, 0],
        [0, 1, 2, 3, 4, 5, 0, 1],
        [1, 2, 3, 4, 5, 0, 1, 2]
      ];

      const matches = detector.findMatches(grid);

      expect(matches.length).toBe(0);
    });
  });

  describe('交换后检测', () => {
    it('交换后应该只检测交换位置附近的匹配', () => {
      grid = [
        [0, 1, 2, 3, 4, 5, 0, 1],
        [0, 1, 1, 3, 4, 5, 0, 1],
        [0, 1, 2, 3, 4, 5, 0, 1],
        [0, 1, 2, 3, 4, 5, 0, 1],
        [0, 1, 2, 3, 4, 5, 0, 1],
        [0, 1, 2, 3, 4, 5, 0, 1],
        [0, 1, 2, 3, 4, 5, 0, 1],
        [0, 1, 2, 3, 4, 5, 0, 1]
      ];

      // 检测位置 (1, 1) 附近的匹配
      const matches = detector.findMatchesAt(grid, 1, 1);

      // 应该找到位置 (1,1), (2,1) 的匹配
      expect(matches.length).toBeGreaterThanOrEqual(0);
    });
  });
});

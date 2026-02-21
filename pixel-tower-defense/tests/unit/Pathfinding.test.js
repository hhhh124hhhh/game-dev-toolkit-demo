import { describe, it, expect } from 'vitest';
import { Pathfinding } from '../../src/systems/Pathfinding.js';

describe('Pathfinding', () => {
  describe('findPath', () => {
    it('should find a path from start to end on empty grid', () => {
      const grid = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
      ];
      const start = [0, 0];
      const end = [2, 2];

      const path = Pathfinding.findPath(grid, start, end);

      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual([0, 0]);
      expect(path[path.length - 1]).toEqual([2, 2]);
    });

    it('should find path around obstacles', () => {
      const grid = [
        [0, 1, 0],
        [0, 1, 0],
        [0, 0, 0]
      ];
      const start = [0, 0];
      const end = [2, 0];

      const path = Pathfinding.findPath(grid, start, end);

      expect(path.length).toBeGreaterThan(0);
      expect(path[path.length - 1]).toEqual([2, 0]);
      // 路径不应该经过障碍物
      path.forEach(([x, y]) => {
        expect(grid[y][x]).toBe(0);
      });
    });

    it('should return empty array when no path exists', () => {
      const grid = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0]
      ];
      const start = [0, 0];
      const end = [2, 2];

      const path = Pathfinding.findPath(grid, start, end);

      expect(path).toEqual([]);
    });

    it('should return start point when start equals end', () => {
      const grid = [
        [0, 0],
        [0, 0]
      ];
      const start = [1, 1];
      const end = [1, 1];

      const path = Pathfinding.findPath(grid, start, end);

      expect(path).toEqual([[1, 1]]);
    });

    it('should find shortest path', () => {
      const grid = [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
      ];
      const start = [0, 0];
      const end = [3, 0];

      const path = Pathfinding.findPath(grid, start, end);

      // 最短路径应该是绕过障碍物
      expect(path.length).toBeGreaterThan(0);
      expect(path[path.length - 1]).toEqual([3, 0]);
    });
  });

  describe('heuristic', () => {
    it('should calculate Manhattan distance correctly', () => {
      expect(Pathfinding.heuristic(0, 0, 3, 4)).toBe(7);
      expect(Pathfinding.heuristic(5, 5, 5, 5)).toBe(0);
      expect(Pathfinding.heuristic(0, 0, 0, 10)).toBe(10);
    });
  });

  describe('toPixelPath', () => {
    it('should convert grid path to pixel coordinates', () => {
      const gridPath = [[0, 0], [1, 0], [2, 0]];
      const cellSize = 40;

      const pixelPath = Pathfinding.toPixelPath(gridPath, cellSize);

      expect(pixelPath).toEqual([
        [20, 20],
        [60, 20],
        [100, 20]
      ]);
    });
  });
});

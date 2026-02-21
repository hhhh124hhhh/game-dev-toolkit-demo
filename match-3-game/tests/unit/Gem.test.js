import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Phaser
vi.mock('phaser', () => ({
  default: {
    GameObjects: {
      Container: class MockContainer {
        constructor(scene, x, y) {
          this.scene = scene;
          this.x = x;
          this.y = y;
          this.alpha = 1;
          this.scale = 1;
        }
        add() { return this; }
        setPosition(x, y) { this.x = x; this.y = y; return this; }
        setAlpha(a) { this.alpha = a; return this; }
        setScale(s) { this.scale = s; return this; }
        destroy() {}
      }
    }
  }
}));

describe('Gem', () => {
  let mockScene;

  beforeEach(() => {
    mockScene = {
      add: {
        graphics: vi.fn(() => ({
          fillStyle: vi.fn(function() { return this; }),
          fillCircle: vi.fn(function() { return this; }),
          fillRoundedRect: vi.fn(function() { return this; }),
          generateTexture: vi.fn(),
          destroy: vi.fn()
        }))
      },
      tweens: {
        add: vi.fn()
      },
      time: {
        delayedCall: vi.fn()
      }
    };
  });

  describe('初始化', () => {
    it('应该正确存储宝石类型', async () => {
      const { Gem } = await import('../../src/entities/Gem.js');
      const gem = new Gem(mockScene, 0, 0, 2, 3, 4);

      expect(gem.type).toBe(2);
      expect(gem.gridX).toBe(3);
      expect(gem.gridY).toBe(4);
    });

    it('应该正确计算屏幕位置', async () => {
      const { Gem } = await import('../../src/entities/Gem.js');
      const tileSize = 64;
      const offsetX = 54;
      const offsetY = 100;

      const gem = new Gem(mockScene, offsetX, offsetY, 1, 2, 3);

      // 位置 = offset + grid * tileSize + tileSize/2
      const expectedX = offsetX + 2 * tileSize + tileSize / 2;
      const expectedY = offsetY + 3 * tileSize + tileSize / 2;

      expect(gem.x).toBe(expectedX);
      expect(gem.y).toBe(expectedY);
    });

    it('初始状态应该是未选中', async () => {
      const { Gem } = await import('../../src/entities/Gem.js');
      const gem = new Gem(mockScene, 0, 0, 0, 0, 0);

      expect(gem.isSelected).toBe(false);
    });
  });

  describe('选中状态', () => {
    it('setSelected(true) 应该设置选中状态', async () => {
      const { Gem } = await import('../../src/entities/Gem.js');
      const gem = new Gem(mockScene, 0, 0, 0, 0, 0);

      gem.setSelected(true);

      expect(gem.isSelected).toBe(true);
    });

    it('setSelected(false) 应该取消选中状态', async () => {
      const { Gem } = await import('../../src/entities/Gem.js');
      const gem = new Gem(mockScene, 0, 0, 0, 0, 0);
      gem.isSelected = true;

      gem.setSelected(false);

      expect(gem.isSelected).toBe(false);
    });
  });

  describe('消除动画', () => {
    it('playDestroyAnimation 应该触发动画', async () => {
      const { Gem } = await import('../../src/entities/Gem.js');
      const gem = new Gem(mockScene, 0, 0, 0, 0, 0);

      gem.playDestroyAnimation();

      expect(mockScene.tweens.add).toHaveBeenCalled();
    });
  });

  describe('颜色映射', () => {
    it('不同类型应该返回不同颜色', async () => {
      const { Gem, GEM_COLORS } = await import('../../src/entities/Gem.js');

      expect(GEM_COLORS[0]).toBe('#ff4757'); // 红色
      expect(GEM_COLORS[1]).toBe('#3742fa'); // 蓝色
      expect(GEM_COLORS[2]).toBe('#2ed573'); // 绿色
      expect(GEM_COLORS[3]).toBe('#ffa502'); // 黄色
      expect(GEM_COLORS[4]).toBe('#a55eea'); // 紫色
      expect(GEM_COLORS[5]).toBe('#ff6b81'); // 橙色
    });
  });
});

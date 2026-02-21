import { describe, it, expect, beforeEach, vi } from 'vitest';

// 先模拟全局 Phaser
class MockBullet {
  constructor() {
    this.active = false;
    this.visible = false;
    this.x = 0;
    this.y = 0;
    this.body = { velocity: { x: 0, y: 0 }, checkWorldBounds: false, worldBoundsOn: false };
  }

  setActive(value) { this.active = value; return this; }
  setVisible(value) { this.visible = value; return this; }
  setVelocity(x, y) { this.body.velocity.x = x; this.body.velocity.y = y; return this; }
  setVelocityX(x) { this.body.velocity.x = x; return this; }
  setVelocityY(y) { this.body.velocity.y = y; return this; }
  setPosition(x, y) { this.x = x; this.y = y; return this; }
}

global.Phaser = {
  Physics: {
    Arcade: {
      Image: MockBullet
    }
  }
};

// 导入后使用
import { BulletPool } from '../../src/systems/BulletPool.js';

describe('BulletPool', () => {
  let bulletPool;
  let mockScene;

  beforeEach(() => {
    // 模拟场景和 Group
    const children = [];

    mockScene = {
      physics: {
        add: {
          group: (config) => {
            const group = {
              config,
              children,
              maxSize: config.maxSize || -1,
              get: (x, y) => {
                const bullet = children.find(b => !b.active);
                if (bullet) {
                  bullet.x = x;
                  bullet.y = y;
                }
                return bullet || null;
              },
              countActive: (active) => children.filter(b => b.active === active).length,
              getChildren: () => children,
              create: (x, y, key) => {
                const bullet = new MockBullet();
                bullet.x = x;
                bullet.y = y;
                children.push(bullet);
                return bullet;
              }
            };
            return group;
          }
        }
      }
    };

    bulletPool = new BulletPool(mockScene, 'bullet', 10);
  });

  it('should create a pool with specified size', () => {
    expect(bulletPool.group.children.length).toBe(10);
  });

  it('should return a bullet when fire() is called', () => {
    const bullet = bulletPool.fire(100, 200, 0, -500);
    expect(bullet).toBeDefined();
    expect(bullet.x).toBe(100);
    expect(bullet.y).toBe(200);
  });

  it('should set bullet velocity when fire() is called', () => {
    const bullet = bulletPool.fire(100, 200, 0, -500);
    expect(bullet.body.velocity.x).toBe(0);
    expect(bullet.body.velocity.y).toBe(-500);
  });

  it('should return null when pool is exhausted', () => {
    // 消耗所有子弹
    for (let i = 0; i < 10; i++) {
      bulletPool.fire(i * 10, 0, 0, -500);
    }

    // 再次尝试发射，应该返回 null
    const bullet = bulletPool.fire(500, 0, 0, -500);
    expect(bullet).toBeNull();
  });

  it('should activate and show bullet when fire() is called', () => {
    const bullet = bulletPool.fire(100, 200, 0, -500);
    expect(bullet.active).toBe(true);
    expect(bullet.visible).toBe(true);
  });

  it('should track active bullet count', () => {
    expect(bulletPool.getActiveCount()).toBe(0);

    bulletPool.fire(100, 200, 0, -500);
    expect(bulletPool.getActiveCount()).toBe(1);

    bulletPool.fire(200, 200, 0, -500);
    expect(bulletPool.getActiveCount()).toBe(2);
  });

  it('should recycle bullets properly', () => {
    const bullet = bulletPool.fire(100, 200, 0, -500);
    expect(bullet.active).toBe(true);

    bulletPool.recycle(bullet);
    expect(bullet.active).toBe(false);
    expect(bullet.visible).toBe(false);
  });
});

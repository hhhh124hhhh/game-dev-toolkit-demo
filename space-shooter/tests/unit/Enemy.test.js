import { describe, it, expect, vi, beforeEach } from 'vitest';

// 模拟全局 Phaser
vi.mock('phaser', () => ({
  default: {
    Math: {
      Distance: {
        Between: (x1, y1, x2, y2) => Math.sqrt((x2-x1)**2 + (y2-y1)**2)
      }
    }
  }
}));

// 模拟依赖的配置
vi.mock('../../src/config.js', () => ({
  ENEMY_CONFIG: {
    basic: { health: 1, speed: 100, score: 10, pattern: 'straight', canShoot: false, shootChance: 0 },
    medium: { health: 2, speed: 80, score: 25, pattern: 'zigzag', canShoot: true, shootChance: 0.01 },
    heavy: { health: 5, speed: 50, score: 50, pattern: 'straight', canShoot: true, shootChance: 0.02 },
    boss: { health: 50, speed: 30, score: 200, pattern: 'boss', canShoot: true, shootChance: 0.05 }
  },
  BULLET_CONFIG: {
    enemySpeed: 300
  },
  DEPTH: {
    ENEMIES: 10,
    EXPLOSIONS: 20
  }
}));

// 创建模拟精灵
class MockSprite {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.active = true;
  }
  setDepth() { return this; }
  setData() { return this; }
  setVelocityX() { return this; }
  setVelocityY() { return this; }
  setVelocity() { return this; }
  destroy() { this.active = false; }
}

describe('Enemy', () => {
  let mockScene;

  beforeEach(() => {
    vi.clearAllMocks();

    mockScene = {
      physics: {
        add: {
          image: vi.fn((x, y) => new MockSprite(x, y))
        }
      },
      time: {
        now: 1000
      },
      tweens: {
        add: vi.fn()
      },
      events: {
        emit: vi.fn()
      },
      add: {
        image: vi.fn(() => ({
          setDepth: vi.fn(function() { return this; }),
          destroy: vi.fn()
        }))
      },
      cameras: {
        main: { height: 800 }
      }
    };

    // Mock enemyBulletPool
    mockScene.enemyBulletPool = {
      fire: vi.fn()
    };
  });

  describe('初始化', () => {
    it('basic 敌人应该有正确的配置', async () => {
      const { Enemy } = await import('../../src/entities/Enemy.js');
      const enemy = new Enemy(mockScene, 'basic', 100, 0);

      expect(enemy.type).toBe('basic');
      expect(enemy.health).toBe(1);
      expect(enemy.maxHealth).toBe(1);
      expect(enemy.speed).toBe(100);
      expect(enemy.score).toBe(10);
      expect(enemy.pattern).toBe('straight');
      expect(enemy.canShoot).toBe(false);
      expect(enemy.isAlive).toBe(true);
    });

    it('medium 敌人应该有正确的配置', async () => {
      const { Enemy } = await import('../../src/entities/Enemy.js');
      const enemy = new Enemy(mockScene, 'medium', 100, 0);

      expect(enemy.health).toBe(2);
      expect(enemy.speed).toBe(80);
      expect(enemy.score).toBe(25);
      expect(enemy.pattern).toBe('zigzag');
      expect(enemy.canShoot).toBe(true);
    });

    it('heavy 敌人应该有正确的配置', async () => {
      const { Enemy } = await import('../../src/entities/Enemy.js');
      const enemy = new Enemy(mockScene, 'heavy', 100, 0);

      expect(enemy.health).toBe(5);
      expect(enemy.speed).toBe(50);
      expect(enemy.score).toBe(50);
      expect(enemy.pattern).toBe('straight');
      expect(enemy.canShoot).toBe(true);
    });

    it('boss 敌人应该有正确的配置', async () => {
      const { Enemy } = await import('../../src/entities/Enemy.js');
      const enemy = new Enemy(mockScene, 'boss', 100, 0);

      expect(enemy.health).toBe(50);
      expect(enemy.speed).toBe(30);
      expect(enemy.score).toBe(200);
      expect(enemy.pattern).toBe('boss');
      expect(enemy.canShoot).toBe(true);
    });
  });

  describe('受伤和死亡', () => {
    it('受伤应该减少生命值', async () => {
      const { Enemy } = await import('../../src/entities/Enemy.js');
      const enemy = new Enemy(mockScene, 'medium', 100, 0);

      enemy.takeDamage(1);

      expect(enemy.health).toBe(1);
      expect(enemy.isAlive).toBe(true);
    });

    it('生命归零应该触发死亡', async () => {
      const { Enemy } = await import('../../src/entities/Enemy.js');
      const enemy = new Enemy(mockScene, 'basic', 100, 0);

      enemy.takeDamage(1);

      expect(enemy.health).toBe(0);
      expect(enemy.isAlive).toBe(false);
      expect(mockScene.events.emit).toHaveBeenCalledWith('enemy-killed', expect.objectContaining({
        enemy: enemy,
        score: 10
      }));
    });

    it('死亡后不应该再受伤', async () => {
      const { Enemy } = await import('../../src/entities/Enemy.js');
      const enemy = new Enemy(mockScene, 'basic', 100, 0);
      enemy.isAlive = false;

      enemy.takeDamage(1);

      // 生命值不变
      expect(enemy.health).toBe(1);
    });

    it('中型敌人需要两次攻击才能死亡', async () => {
      const { Enemy } = await import('../../src/entities/Enemy.js');
      const enemy = new Enemy(mockScene, 'medium', 100, 0);

      enemy.takeDamage(1);
      expect(enemy.isAlive).toBe(true);

      enemy.takeDamage(1);
      expect(enemy.isAlive).toBe(false);
    });
  });

  describe('射击', () => {
    it('不能射击的敌人不会发射子弹', async () => {
      const { Enemy } = await import('../../src/entities/Enemy.js');
      const enemy = new Enemy(mockScene, 'basic', 100, 0);
      enemy.canShoot = false;

      enemy.update(2000, 300);

      expect(mockScene.enemyBulletPool.fire).not.toHaveBeenCalled();
    });
  });

  describe('位置获取', () => {
    it('应该返回正确的位置', async () => {
      const { Enemy } = await import('../../src/entities/Enemy.js');
      const enemy = new Enemy(mockScene, 'basic', 150, 50);

      const pos = enemy.getPosition();

      expect(pos.x).toBe(150);
      expect(pos.y).toBe(50);
    });
  });

  describe('销毁', () => {
    it('destroy 应该正确销毁敌人', async () => {
      const { Enemy } = await import('../../src/entities/Enemy.js');
      const enemy = new Enemy(mockScene, 'basic', 100, 0);

      enemy.destroy();

      expect(enemy.isAlive).toBe(false);
    });
  });
});

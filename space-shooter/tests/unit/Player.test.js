import { describe, it, expect, vi, beforeEach } from 'vitest';

// 模拟全局 Phaser
global.Phaser = {
  Input: {
    Keyboard: {
      KeyCodes: {
        SPACE: 32
      }
    }
  }
};

// 模拟依赖的配置
vi.mock('../../src/config.js', () => ({
  PLAYER_CONFIG: {
    speed: 300,
    fireRate: 200,
    maxLives: 5,
    invincibleTime: 2000
  },
  BULLET_CONFIG: {
    playerSpeed: 500
  },
  GAME_CONFIG: {
    width: 600,
    height: 800
  },
  DEPTH: {
    PLAYER: 15
  }
}));

// 创建模拟精灵
class MockSprite {
  constructor() {
    this.x = 300;
    this.y = 720;
    this.active = true;
    this.visible = true;
    this.alpha = 1;
  }
  setCollideWorldBounds() { return this; }
  setDepth() { return this; }
  setData() { return this; }
  setSize() { return this; }
  setPosition(x, y) { this.x = x; this.y = y; return this; }
  setActive(val) { this.active = val; return this; }
  setVisible(val) { this.visible = val; return this; }
  setAlpha(val) { this.alpha = val; return this; }
  setVelocityX() { return this; }
  setVelocityY() { return this; }
  destroy() { this.active = false; }
  body = { setSize: vi.fn() };
}

describe('Player', () => {
  let mockScene;
  let player;

  beforeEach(() => {
    vi.clearAllMocks();

    mockScene = {
      physics: {
        add: {
          image: vi.fn(() => new MockSprite())
        }
      },
      time: {
        now: 0,
        delayedCall: vi.fn(() => ({ destroy: vi.fn() }))
      },
      tweens: {
        add: vi.fn()
      },
      events: {
        emit: vi.fn()
      },
      cameras: {
        main: { height: 800 }
      }
    };

    // 模拟 playerBulletPool
    mockScene.playerBulletPool = {
      fire: vi.fn(() => new MockSprite())
    };

    // 动态导入以使用 mock
    return import('../../src/entities/Player.js').then(module => {
      const Player = module.Player;
      player = new Player(mockScene);
    });
  });

  describe('初始化', () => {
    it('应该有正确的初始生命值', () => {
      expect(player.lives).toBe(5);
    });

    it('初始分数应该为 0', () => {
      expect(player.score).toBe(0);
    });

    it('初始不应该无敌', () => {
      expect(player.isInvincible).toBe(false);
    });

    it('火力倍数应该为 1', () => {
      expect(player.fireMultiplier).toBe(1);
    });
  });

  describe('受伤', () => {
    it('受伤应该减少生命值', async () => {
      const { Player } = await import('../../src/entities/Player.js');
      player = new Player(mockScene);
      player.takeDamage();
      expect(player.lives).toBe(4);
      expect(mockScene.events.emit).toHaveBeenCalledWith('player-damaged', 4);
    });

    it('无敌时不应该受伤', async () => {
      const { Player } = await import('../../src/entities/Player.js');
      player = new Player(mockScene);
      player.isInvincible = true;
      player.takeDamage();
      expect(player.lives).toBe(5);
    });

    it('生命归零应该触发死亡', async () => {
      const { Player } = await import('../../src/entities/Player.js');
      player = new Player(mockScene);
      player.lives = 1;
      player.takeDamage();
      expect(mockScene.events.emit).toHaveBeenCalledWith('player-died');
    });
  });

  describe('道具收集', () => {
    it('治疗道具应该恢复生命', async () => {
      const { Player } = await import('../../src/entities/Player.js');
      player = new Player(mockScene);
      player.lives = 3;
      player.collectPowerup('heal', 0);
      expect(player.lives).toBe(4);
      expect(mockScene.events.emit).toHaveBeenCalledWith('player-healed', 4);
    });

    it('生命值不超过最大值', async () => {
      const { Player } = await import('../../src/entities/Player.js');
      player = new Player(mockScene);
      player.lives = 5;
      player.collectPowerup('heal', 0);
      expect(player.lives).toBe(5);
    });

    it('双发道具应该提升火力', async () => {
      const { Player } = await import('../../src/entities/Player.js');
      player = new Player(mockScene);
      player.collectPowerup('doubleFire', 5000);
      expect(player.fireMultiplier).toBe(2);
    });

    it('护盾道具应该启用无敌', async () => {
      const { Player } = await import('../../src/entities/Player.js');
      player = new Player(mockScene);
      player.collectPowerup('shield', 3000);
      expect(player.isInvincible).toBe(true);
    });
  });

  describe('重置', () => {
    it('重置应该恢复初始状态', async () => {
      const { Player } = await import('../../src/entities/Player.js');
      player = new Player(mockScene);
      player.lives = 2;
      player.score = 100;
      player.isInvincible = true;
      player.fireMultiplier = 2;

      player.reset();

      expect(player.lives).toBe(5);
      expect(player.score).toBe(0);
      expect(player.isInvincible).toBe(false);
      expect(player.fireMultiplier).toBe(1);
    });
  });
});

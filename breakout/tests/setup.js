/**
 * 测试设置文件
 * 提供完整的 Phaser Mock
 */

// 模拟 Phaser 全局对象
const MockPhaser = {
  Physics: {
    Arcade: {
      Sprite: class MockSprite {
        constructor(scene, x, y, texture) {
          this.scene = scene;
          this.x = x;
          this.y = y;
          this.texture = texture;
          this.active = true;
          this.visible = true;
          this.width = 0;
          this.height = 0;
          this.body = {
            velocity: { x: 0, y: 0 },
            onWorldBounds: false,
            immovable: false,
            setCircle: vi.fn().mockReturnThis(),
            setSize: vi.fn().mockReturnThis(),
            setOffset: vi.fn().mockReturnThis()
          };
        }

        setCollideWorldBounds(value) {
          return this;
        }

        setBounce(value) {
          return this;
        }

        setImmovable(value) {
          this.body.immovable = value;
          return this;
        }

        setData(key, value) {
          if (!this._data) this._data = {};
          this._data[key] = value;
          return this;
        }

        getData(key) {
          return this._data?.[key];
        }

        setTexture(key) {
          this.texture = key;
          return this;
        }

        setTint(color) {
          return this;
        }

        disableBody(disableInWorld, hide) {
          this.active = false;
        }

        destroy() {
          this.active = false;
        }
      }
    }
  },
  Math: {
    Between: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    Clamp: (value, min, max) => Math.min(Math.max(value, min), max),
    DegToRad: (deg) => deg * Math.PI / 180
  },
  Input: {
    Keyboard: {
      KeyCodes: {
        LEFT: 37,
        RIGHT: 39,
        SPACE: 32
      }
    }
  },
  Display: {
    Color: {
      HexStringToColor: (hex) => ({
        color: parseInt(hex.replace('#', ''), 16)
      })
    }
  }
};

// 设置全局 Phaser
global.Phaser = MockPhaser;

// 模拟 Phaser 模块
import { vi } from 'vitest';

vi.mock('phaser', () => ({
  default: MockPhaser
}));

/**
 * 创建模拟场景
 */
export function createTestScene() {
  return {
    add: {
      existing: (obj) => obj,
      graphics: () => ({
        fillStyle: vi.fn().mockReturnThis(),
        fillRect: vi.fn().mockReturnThis(),
        fillRoundedRect: vi.fn().mockReturnThis(),
        fillCircle: vi.fn().mockReturnThis(),
        generateTexture: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
        lineStyle: vi.fn().mockReturnThis(),
        lineBetween: vi.fn().mockReturnThis()
      }),
      text: vi.fn(() => ({
        setOrigin: vi.fn().mockReturnThis(),
        setText: vi.fn()
      })),
      image: vi.fn(() => ({
        setOrigin: vi.fn().mockReturnThis(),
        setData: vi.fn(),
        getData: vi.fn()
      })),
      sprite: vi.fn(() => ({
        setOrigin: vi.fn().mockReturnThis(),
        setData: vi.fn(),
        getData: vi.fn()
      }))
    },

    physics: {
      add: {
        existing: (obj) => obj,
        sprite: vi.fn(() => ({
          setCollideWorldBounds: vi.fn().mockReturnThis(),
          setBounce: vi.fn().mockReturnThis(),
          setImmovable: vi.fn().mockReturnThis(),
          body: { velocity: { x: 0, y: 0 }, onWorldBounds: false, immovable: false }
        })),
        staticGroup: vi.fn(() => ({
          create: vi.fn(() => ({
            setData: vi.fn(),
            getData: vi.fn(() => 1),
            refreshBody: vi.fn(),
            disableBody: vi.fn(),
            setTint: vi.fn()
          })),
          countActive: vi.fn(() => 0)
        })),
        group: vi.fn(() => ({
          create: vi.fn()
        })),
        collider: vi.fn(),
        overlap: vi.fn()
      },
      world: {
        setBounds: vi.fn(),
        on: vi.fn()
      }
    },

    input: {
      keyboard: {
        createCursorKeys: () => ({
          left: { isDown: false },
          right: { isDown: false },
          up: { isDown: false },
          down: { isDown: false }
        }),
        addKey: () => ({ isDown: false })
      },
      on: vi.fn()
    },

    tweens: {
      add: vi.fn()
    },

    cameras: {
      main: {
        width: 800,
        height: 600,
        setBackgroundColor: vi.fn()
      }
    },

    scene: {
      start: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn()
    },

    sound: {
      play: vi.fn()
    },

    registry: {
      set: vi.fn(),
      get: vi.fn(() => 0)
    }
  };
}

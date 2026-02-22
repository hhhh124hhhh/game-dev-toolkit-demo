/**
 * 测试配置文件
 * 用于 Vitest 测试环境
 *
 * 注意：不直接导入 Phaser，使用 Mock 对象避免 Canvas 依赖
 */

import { vi } from 'vitest';

// Mock Phaser 全局对象
const MockPhaser = {
  AUTO: 0,
  CANVAS: 1,
  WEBGL: 2,
  HEADLESS: 3,
  Math: {
    FloatBetween: (min, max) => Math.random() * (max - min) + min,
    Between: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    Distance: {
      Between: (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    },
    Angle: {
      Between: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1),
      Wrap: (angle) => angle
    }
  },
  Display: {
    Color: {
      GetColor: (r, g, b) => (r << 16) | (g << 8) | b
    }
  },
  Input: {
    Keyboard: {
      KeyCodes: {
        J: 74,
        K: 75,
        ESC: 27,
        SPACE: 32,
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39
      },
      JustDown: vi.fn(() => false)
    }
  }
};

// 设置全局 Mock
globalThis.Phaser = MockPhaser;

/**
 * 创建 Mock 精灵
 */
export function createMockSprite(x = 0, y = 0, velocityX = 0, velocityY = 0) {
  return {
    x,
    y,
    width: 32,
    height: 32,
    active: true,
    visible: true,
    body: {
      velocity: { x: velocityX, y: velocityY },
      touching: { left: false, right: false, up: false, down: false },
      blocked: { left: false, right: false, up: false, down: false },
      setVelocity: vi.fn(),
      setVelocityX: vi.fn(function(vx) { this.velocity.x = vx; }),
      setVelocityY: vi.fn(function(vy) { this.velocity.y = vy; }),
      setBounce: vi.fn(),
      setCollideWorldBounds: vi.fn(),
      setGravityY: vi.fn(),
      setImmovable: vi.fn(),
      setSize: vi.fn(),
      setOffset: vi.fn(),
      enable: vi.fn()
    },
    setData: vi.fn(),
    getData: vi.fn((key) => undefined),
    setActive: vi.fn(function(active) { this.active = active; }),
    setVisible: vi.fn(function(visible) { this.visible = visible; }),
    setTexture: vi.fn(),
    setTint: vi.fn(),
    clearTint: vi.fn(),
    setAlpha: vi.fn(),
    setFlipX: vi.fn(),
    setFlipY: vi.fn(),
    setPosition: vi.fn(),
    destroy: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    anims: {
      play: vi.fn(),
      stop: vi.fn(),
      getProgress: vi.fn(() => 0)
    }
  };
}

/**
 * 创建 Mock 组
 */
export function createMockGroup() {
  const children = [];

  return {
    children: {
      iterate: vi.fn((callback) => children.forEach(callback)),
      getFirst: vi.fn(() => children[0]),
      entries: children
    },
    add: vi.fn((child) => children.push(child)),
    remove: vi.fn((child) => {
      const index = children.indexOf(child);
      if (index > -1) children.splice(index, 1);
    }),
    get: vi.fn(() => createMockSprite()),
    create: vi.fn((x, y, key) => {
      const sprite = createMockSprite(x, y);
      children.push(sprite);
      return sprite;
    }),
    clear: vi.fn(() => children.length = 0),
    getLength: vi.fn(() => children.length),
    countActive: vi.fn(() => children.filter(c => c.active).length)
  };
}

/**
 * 创建 Mock 图形
 */
export function createMockGraphics() {
  return {
    fillStyle: vi.fn(),
    fillRect: vi.fn(),
    fillRoundedRect: vi.fn(),
    strokeStyle: vi.fn(),
    strokeRect: vi.fn(),
    lineStyle: vi.fn(),
    lineBetween: vi.fn(),
    clear: vi.fn(),
    generateTexture: vi.fn(),
    destroy: vi.fn()
  };
}

/**
 * 创建 Mock 文本
 */
export function createMockText(text = '') {
  return {
    text,
    setText: vi.fn(function(t) { this.text = t; return this; }),
    setOrigin: vi.fn(),
    setPosition: vi.fn(),
    setAlpha: vi.fn(),
    setVisible: vi.fn(),
    setScale: vi.fn(),
    destroy: vi.fn()
  };
}

/**
 * 创建 Mock 光标键
 */
export function createMockCursors() {
  return {
    left: { isDown: false, isUp: true },
    right: { isDown: false, isUp: true },
    up: { isDown: false, isUp: true },
    down: { isDown: false, isUp: true },
    space: { isDown: false, isUp: true },
    shift: { isDown: false, isUp: true }
  };
}

/**
 * 创建 Mock 输入键
 */
export function createMockKey() {
  return {
    isDown: false,
    isUp: true,
    on: vi.fn(),
    off: vi.fn()
  };
}

/**
 * 创建 Mock 场景
 */
export function createMockScene() {
  const events = {
    callbacks: {},
    on: vi.fn((event, callback) => {
      events.callbacks[event] = callback;
    }),
    emit: vi.fn((event, ...args) => {
      if (events.callbacks[event]) {
        events.callbacks[event](...args);
      }
    })
  };

  return {
    physics: {
      add: {
        sprite: vi.fn((x, y, key) => createMockSprite(x, y)),
        staticGroup: vi.fn(() => createMockGroup()),
        group: vi.fn(() => createMockGroup()),
        collider: vi.fn(),
        overlap: vi.fn()
      },
      world: {
        enable: vi.fn()
      }
    },
    add: {
      graphics: vi.fn(() => createMockGraphics()),
      text: vi.fn((x, y, text, style) => createMockText(text)),
      image: vi.fn((x, y, key) => createMockSprite(x, y)),
      sprite: vi.fn((x, y, key) => createMockSprite(x, y)),
      container: vi.fn(() => ({ add: vi.fn(), setScrollFactor: vi.fn(), setDepth: vi.fn() })),
      rectangle: vi.fn(() => ({ setInteractive: vi.fn(), setStrokeStyle: vi.fn() }))
    },
    input: {
      keyboard: {
        createCursorKeys: vi.fn(() => createMockCursors()),
        addKey: vi.fn(() => createMockKey()),
        on: vi.fn()
      },
      on: vi.fn()
    },
    cameras: {
      main: {
        width: 800,
        height: 600,
        setBackgroundColor: vi.fn(),
        startFollow: vi.fn(),
        setBounds: vi.fn()
      }
    },
    time: {
      addEvent: vi.fn(),
      delayedCall: vi.fn((delay, callback) => {
        setTimeout(callback, 0);
      })
    },
    tweens: {
      add: vi.fn((config) => {
        if (config.onComplete) {
          setTimeout(config.onComplete, 0);
        }
      })
    },
    scene: {
      start: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      launch: vi.fn(),
      stop: vi.fn(),
      get: vi.fn(() => ({ resumeGame: vi.fn() }))
    },
    events,
    registry: {
      get: vi.fn(),
      set: vi.fn()
    }
  };
}

// 导出工具函数
export { vi };

// 全局可用的测试工具
globalThis.createMockScene = createMockScene;
globalThis.createMockSprite = createMockSprite;
globalThis.createMockGroup = createMockGroup;
globalThis.createMockCursors = createMockCursors;

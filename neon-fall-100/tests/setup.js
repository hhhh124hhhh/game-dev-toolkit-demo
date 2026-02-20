/**
 * Phaser Test Setup - Mock Version
 * 测试环境配置 - 使用 Mock 避免真实 Phaser 依赖
 */

import { jest, expect } from '@jest/globals';

// ============================================
// Global Phaser Mock - 必须在任何测试文件加载前定义
// ============================================
class MockScene {
  constructor(config) {
    this.sys = { game: { config: {} } };
  }

  init() {}
  preload() {}
  create() {}
  update() {}
}

const Phaser = {
  Scene: MockScene,
  Game: class {
    constructor(config) {
      this.config = config;
    }
  },
  HEADLESS: 3
};

// 将 Phaser 设为全局变量
globalThis.Phaser = Phaser;

// Mock window.gameState（游戏全局状态）
if (typeof window !== 'undefined') {
  window.gameState = {
    highScore: 0,
    achievements: [],
    totalGames: 0
  };
}

// Mock localStorage
if (typeof localStorage !== 'undefined') {
  localStorage.getItem = jest.fn(() => null);
  localStorage.setItem = jest.fn();
  localStorage.removeItem = jest.fn();
  localStorage.clear = jest.fn();
}

// Mock canvas context for jsdom
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = jest.fn((type) => {
    if (type === '2d') {
      return {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        font: '',
        textAlign: '',
        textBaseline: '',
        globalAlpha: 1,
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
        clearRect: jest.fn(),
        fillText: jest.fn(),
        measureText: jest.fn(() => ({ width: 100 })),
        drawImage: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        translate: jest.fn(),
        scale: jest.fn(),
        rotate: jest.fn(),
        beginPath: jest.fn(),
        closePath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        stroke: jest.fn(),
        createLinearGradient: jest.fn(() => ({
          addColorStop: jest.fn()
        }))
      };
    }
    return null;
  });
}

/**
 * 创建 Mock 场景基础对象
 */
function createMockSceneBase() {
  return {
    // 生命周期方法
    init: jest.fn(),
    preload: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),

    // 游戏对象
    add: {
      sprite: jest.fn(() => createMockSprite(0, 0)),
      image: jest.fn(() => createMockSprite(0, 0)),
      text: jest.fn(() => ({
        ...createMockSprite(0, 0),
        setText: jest.fn(),
        setOrigin: jest.fn(),
        setStyle: jest.fn()
      })),
      graphics: jest.fn(() => ({
        lineStyle: jest.fn(),
        strokeRect: jest.fn(),
        fillStyle: jest.fn(),
        fillRect: jest.fn(),
        clear: jest.fn()
      })),
      rectangle: jest.fn(() => createMockSprite(0, 0)),
      container: jest.fn(() => ({
        add: jest.fn(),
        setDepth: jest.fn()
      }))
    },

    // 物理系统
    physics: {
      add: {
        sprite: jest.fn(() => createMockSprite(0, 0)),
        staticGroup: jest.fn(() => ({
          create: jest.fn(() => createMockSprite(0, 0)),
          getChildren: jest.fn(() => []),
          refresh: jest.fn()
        })),
        group: jest.fn(() => ({
          create: jest.fn(() => createMockSprite(0, 0)),
          getChildren: jest.fn(() => []),
          getFirstDead: jest.fn(),
          killAndHide: jest.fn()
        })),
        collider: jest.fn()
      },
      world: {
        bounds: { width: 800, height: 600 }
      }
    },

    // 相机
    cameras: {
      main: {
        scrollY: 0,
        startX: 0,
        startY: 0,
        setBounds: jest.fn(),
        startFollow: jest.fn(),
        setZoom: jest.fn(),
        width: 800,
        height: 600
      }
    },

    // 输入
    input: {
      keyboard: {
        createCursorKeys: jest.fn(() => ({
          left: { isDown: false },
          right: { isDown: false },
          up: { isDown: false },
          down: { isDown: false },
          space: { isDown: false }
        })),
        addKey: jest.fn(() => ({ isDown: false })),
        on: jest.fn()
      },
      on: jest.fn()
    },

    // 时间
    time: {
      addEvent: jest.fn(),
      delayedCall: jest.fn(),
      now: 0
    },

    // 补间动画
    tweens: {
      add: jest.fn()
    },

    // 音频
    sound: {
      add: jest.fn(() => ({ play: jest.fn() })),
      play: jest.fn()
    },

    // 缓存
    cache: {
      json: { get: jest.fn() },
      image: { get: jest.fn() }
    },

    // 场景管理
    scene: {
      start: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      stop: jest.fn(),
      get: jest.fn()
    },

    // 尺寸
    scale: {
      width: 800,
      height: 600
    },

    // 事件
    events: {
      on: jest.fn(),
      emit: jest.fn()
    },

    // 工具方法
    sys: {
      game: {
        config: {}
      }
    }
  };
}

/**
 * 创建测试场景实例
 * 将 Mock 对象合并到场景实例上
 */
export function createTestScene(SceneClass, data = {}) {
  const mockBase = createMockSceneBase();

  // 创建场景实例
  const scene = new SceneClass();

  // 保存真实的 init 方法（在 Object.assign 之前）
  const realInit = scene.init;

  // 将所有 mock 属性合并到场景上（不包括 init/preload/create/update）
  const { init, preload, create, update, ...mockProps } = mockBase;
  Object.assign(scene, mockProps);

  // 调用真实的 init 生命周期
  if (typeof realInit === 'function') {
    realInit.call(scene, data);
  }

  return scene;
}

/**
 * 创建 Mock Sprite 用于碰撞测试
 */
export function createMockSprite(x, y, velocityY = 0) {
  return {
    x,
    y,
    width: 32,
    height: 32,
    active: true,
    visible: true,
    body: {
      velocity: { x: 0, y: velocityY },
      touching: { down: false, up: false, left: false, right: false },
      blocked: { down: false, up: false, left: false, right: false },
      enable: true,
      setVelocity: jest.fn(),
      setVelocityX: jest.fn(),
      setVelocityY: jest.fn(),
      setBounce: jest.fn(),
      setCollideWorldBounds: jest.fn(),
      setGravityY: jest.fn()
    },
    setData: jest.fn(),
    getData: jest.fn((key) => {
      if (key === 'platform') return { type: 'normal', onPlayerLand: jest.fn() };
      return undefined;
    }),
    setVelocity: jest.fn(),
    setVelocityX: jest.fn(),
    setVelocityY: jest.fn(),
    setOrigin: jest.fn(),
    setDepth: jest.fn(),
    setScale: jest.fn(),
    setAlpha: jest.fn(),
    destroy: jest.fn(),
    setTexture: jest.fn(),
    setFrame: jest.fn(),
    setInteractive: jest.fn(),
    on: jest.fn()
  };
}

/**
 * 创建 Mock 平台 Sprite
 */
export function createMockPlatform(x, y, type = 'normal') {
  const sprite = createMockSprite(x, y);
  sprite.y = y;
  sprite.getData = jest.fn((key) => {
    if (key === 'platform') return {
      type,
      onPlayerLand: jest.fn()
    };
    return undefined;
  });
  return sprite;
}

/**
 * 等待指定毫秒
 */
export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 模拟游戏循环更新
 */
export function simulateUpdate(scene, frames, fps = 60) {
  const delta = 1000 / fps;
  for (let i = 0; i < frames; i++) {
    if (typeof scene.update === 'function') {
      scene.update(i * delta, delta);
    }
  }
}

// Jest 自定义匹配器
expect.extend({
  toBeValidNumber(received) {
    const pass = typeof received === 'number' && !isNaN(received);
    return {
      pass,
      message: () => pass
        ? `expected ${received} not to be a valid number`
        : `expected ${received} to be a valid number (not NaN)`
    };
  },

  toHaveAllPropertiesDefined(received, properties) {
    const undefinedProps = properties.filter(prop => received[prop] === undefined);
    const pass = undefinedProps.length === 0;
    return {
      pass,
      message: () => pass
        ? `expected some properties to be undefined`
        : `expected all properties to be defined, but these are undefined: ${undefinedProps.join(', ')}`
    };
  }
});

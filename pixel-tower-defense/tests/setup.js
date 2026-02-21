import { vi } from 'vitest';

/**
 * 测试环境设置
 */

// 简单的 Phaser 模拟
const mockScene = {
  add: {
    sprite: vi.fn(() => ({
      setData: vi.fn(),
      setOrigin: vi.fn(() => this),
      setScale: vi.fn(() => this),
      setInteractive: vi.fn(() => this),
      setTint: vi.fn(),
      clearTint: vi.fn(),
      x: 0,
      y: 0,
      destroy: vi.fn()
    })),
    image: vi.fn(() => ({
      setData: vi.fn(),
      setOrigin: vi.fn(() => this),
      setScale: vi.fn(() => this),
      setInteractive: vi.fn(() => this),
      setTint: vi.fn(),
      clearTint: vi.fn(),
      setDepth: vi.fn(() => this),
      destroy: vi.fn()
    })),
    graphics: vi.fn(() => ({
      fillStyle: vi.fn(() => this),
      fillRect: vi.fn(),
      fillRoundedRect: vi.fn(),
      fillCircle: vi.fn(),
      fillTriangle: vi.fn(),
      lineStyle: vi.fn(() => this),
      strokeRoundedRect: vi.fn(),
      strokeCircle: vi.fn(),
      clear: vi.fn(),
      generateTexture: vi.fn(),
      destroy: vi.fn()
    })),
    text: vi.fn(() => ({
      setOrigin: vi.fn(() => this),
      destroy: vi.fn()
    })),
    container: vi.fn(() => ({
      add: vi.fn(),
      destroy: vi.fn()
    }))
  },
  time: {
    delayedCall: vi.fn((delay, callback) => ({
      destroy: vi.fn()
    })),
    addEvent: vi.fn(() => ({
      destroy: vi.fn()
    }))
  },
  tweens: {
    add: vi.fn()
  },
  cameras: {
    main: {
      width: 800,
      height: 600
    }
  },
  events: {
    emit: vi.fn(),
    on: vi.fn()
  },
  scene: {
    start: vi.fn(),
    stop: vi.fn(),
    launch: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    get: vi.fn()
  },
  input: {
    on: vi.fn(),
    keyboard: {
      on: vi.fn()
    }
  },
  load: {
    on: vi.fn()
  }
};

export function createMockScene() {
  return { ...mockScene };
}

export function createMockSprite(x = 0, y = 0) {
  return {
    x,
    y,
    setData: vi.fn(),
    getData: vi.fn(),
    destroy: vi.fn()
  };
}

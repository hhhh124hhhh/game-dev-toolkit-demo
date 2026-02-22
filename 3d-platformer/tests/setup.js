/**
 * Enable3D 测试设置
 *
 * CRITICAL: 必须完整模拟 Enable3D 的 API
 */

import { vi } from 'vitest';

// 模拟 THREE.js
vi.mock('three', () => {
  class MockVector3 {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    clone() {
      return new MockVector3(this.x, this.y, this.z);
    }
    add(v) {
      return new MockVector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }
    lerp(v, t) {
      this.x += (v.x - this.x) * t;
      this.y += (v.y - this.y) * t;
      this.z += (v.z - this.z) * t;
      return this;
    }
  }

  class MockMaterial {
    constructor(options) {
      this.options = options;
    }
  }

  return {
    default: {
      Vector3: MockVector3,
      MeshStandardMaterial: MockMaterial
    },
    Vector3: MockVector3,
    MeshStandardMaterial: MockMaterial
  };
});

// 模拟 Enable3D
vi.mock('enable3d/phaser-extension', () => {
  class MockScene3D {
    constructor(config) {
      this.config = config;
      this.third = this.createMockThird();
    }

    createMockThird() {
      const self = this;
      return {
        warpSpeed: vi.fn().mockResolvedValue(undefined),
        physics: {
          add: {
            capsule: vi.fn().mockResolvedValue(self.createMockGameObject()),
            box: vi.fn().mockResolvedValue(self.createMockGameObject()),
            sphere: vi.fn().mockResolvedValue(self.createMockGameObject()),
            ground: vi.fn().mockResolvedValue(self.createMockGameObject())
          },
          setFixedTimeStep: vi.fn(),
          raycast: vi.fn((from, to, callback) => {
            callback({ hasHit: false });
          }),
          pause: vi.fn(),
          resume: vi.fn()
        },
        camera: {
          position: {
            set: vi.fn(),
            lerp: vi.fn()
          },
          lookAt: vi.fn()
        },
        add: {
          sphere: vi.fn().mockReturnValue(self.createMockGameObject())
        },
        scene: {
          remove: vi.fn()
        }
      };
    }

    createMockGameObject() {
      return {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        body: {
          velocity: { x: 0, y: 0, z: 0 },
          setVelocity: vi.fn(),
          setVelocityY: vi.fn(),
          setFriction: vi.fn(),
          setRestitution: vi.fn(),
          setGravity: vi.fn()
        },
        material: null,
        name: '',
        destroy: vi.fn()
      };
    }
  }

  return {
    Scene3D: MockScene3D
  };
});

// 模拟 Phaser
const MockPhaser = {
  Math: {
    Between: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
  },
  Input: {
    Keyboard: {
      KeyCodes: {
        W: 87, A: 65, S: 83, D: 68, SPACE: 32,
        UP: 38, DOWN: 40, LEFT: 37, RIGHT: 39
      }
    }
  }
};

global.Phaser = MockPhaser;

/**
 * 创建测试用的 3D 场景 mock
 */
export function createTestScene3D() {
  const scene = {
    third: {
      warpSpeed: vi.fn().mockResolvedValue(undefined),
      physics: {
        add: {
          capsule: vi.fn().mockResolvedValue(createMockGameObject()),
          box: vi.fn().mockResolvedValue(createMockGameObject()),
          sphere: vi.fn().mockResolvedValue(createMockGameObject()),
          ground: vi.fn().mockResolvedValue(createMockGameObject())
        },
        setFixedTimeStep: vi.fn(),
        raycast: vi.fn((from, to, callback) => {
          callback({ hasHit: false });
        })
      },
      camera: {
        position: { set: vi.fn(), lerp: vi.fn() },
        lookAt: vi.fn()
      },
      add: {
        sphere: vi.fn().mockReturnValue(createMockGameObject())
      },
      scene: { remove: vi.fn() }
    },
    input: {
      keyboard: {
        createCursorKeys: () => ({
          left: { isDown: false },
          right: { isDown: false },
          up: { isDown: false },
          down: { isDown: false }
        }),
        addKeys: () => ({
          up: { isDown: false },
          down: { isDown: false },
          left: { isDown: false },
          right: { isDown: false },
          space: { isDown: false }
        }),
        on: vi.fn(),
        once: vi.fn()
      }
    },
    add: {
      text: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        setScrollFactor: vi.fn().mockReturnThis(),
        setText: vi.fn()
      }),
      rectangle: vi.fn()
    },
    tweens: {
      add: vi.fn()
    },
    cameras: {
      main: { width: 800, height: 600 }
    },
    time: {
      delayedCall: vi.fn((delay, callback) => callback())
    },
    events: {
      on: vi.fn()
    }
  };

  return scene;
}

function createMockGameObject() {
  return {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    body: {
      velocity: { x: 0, y: 0, z: 0 },
      setVelocity: vi.fn(),
      setVelocityY: vi.fn(),
      setFriction: vi.fn(),
      setRestitution: vi.fn(),
      setGravity: vi.fn()
    },
    material: null,
    destroy: vi.fn(),
    clone: vi.fn(function() {
      return { x: this.position.x, y: this.position.y, z: this.position.z };
    })
  };
}

/**
 * 创建 mock 输入
 */
export function createMockInput() {
  return {
    left: { isDown: false },
    right: { isDown: false },
    up: { isDown: false },
    down: { isDown: false },
    space: { isDown: false }
  };
}

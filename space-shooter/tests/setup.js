import { vi } from 'vitest';

// 模拟 Phaser 全局对象
global.Phaser = {
  Physics: {
    Arcade: {
      Image: class MockImage {
        constructor(scene, x, y, texture) {
          this.scene = scene;
          this.x = x;
          this.y = y;
          this.texture = texture;
          this.active = true;
          this.visible = true;
          this.body = { velocity: { x: 0, y: 0 } };
        }
        setActive(value) { this.active = value; return this; }
        setVisible(value) { this.visible = value; return this; }
        setVelocity(x, y) { this.body.velocity.x = x; this.body.velocity.y = y; return this; }
        setVelocityX(x) { this.body.velocity.x = x; return this; }
        setVelocityY(y) { this.body.velocity.y = y; return this; }
        setPosition(x, y) { this.x = x; this.y = y; return this; }
        disableBody(disable) { this.active = false; this.visible = false; return this; }
      }
    }
  },
  Math: {
    Between: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    FloatBetween: (min, max) => Math.random() * (max - min) + min
  }
};

// 模拟 console.log 以减少测试输出
global.console = {
  ...console,
  log: vi.fn()
};

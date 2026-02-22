/**
 * Phaser Mock
 * 用于测试环境的 Phaser 模块 Mock
 */

// Mock Phaser
const Phaser = {
  AUTO: 0,
  CANVAS: 1,
  WEBGL: 2,
  HEADLESS: 3,

  // Game 类
  Game: class Game {
    constructor(config) {
      this.config = config;
      this.scene = {
        add: () => {},
        start: () => {},
        pause: () => {},
        resume: () => {},
        launch: () => {},
        stop: () => {}
      };
    }
  },

  // Math 工具
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

  // Display 工具
  Display: {
    Color: {
      GetColor: (r, g, b) => (r << 16) | (g << 8) | b
    }
  },

  // Input
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
      JustDown: (key) => key && key.isDown
    }
  },

  // Scale
  Scale: {
    FIT: 0,
    CENTER_BOTH: 1
  }
};

export default Phaser;
export const AUTO = Phaser.AUTO;
export const CANVAS = Phaser.CANVAS;
export const WEBGL = Phaser.WEBGL;
export const HEADLESS = Phaser.HEADLESS;
export const Game = Phaser.Game;
export const Math = Phaser.Math;
export const Display = Phaser.Display;
export const Input = Phaser.Input;
export const Scale = Phaser.Scale;

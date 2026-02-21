// Vitest setup for match-3 game tests
import { vi } from 'vitest';

// Mock Phaser globally
global.Phaser = {
  Math: {
    Distance: {
      Between: (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    },
    Between: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
  },
  Input: {
    Keyboard: {
      KeyCodes: {}
    }
  }
};

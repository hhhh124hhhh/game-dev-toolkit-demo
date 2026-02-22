import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/'
      ],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    },
    // 排除 Phaser 相关测试，使用 Mock
    exclude: [
      '**/node_modules/**',
      '**/dist/**'
    ],
    // Mock Phaser 模块
    deps: {
      inline: []
    },
    // 静默 Phaser 相关的警告
    onConsoleLog: (log) => {
      if (log.includes('HTMLCanvasElement')) return false;
      return true;
    }
  },
  resolve: {
    alias: {
      // 将 Phaser 重定向到 Mock
      phaser: './tests/__mocks__/phaser.js'
    }
  }
});

import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
          three: ['three']
        }
      }
    }
  },
  server: {
    port: 5173,
    open: true,
    // 确保静态资源正确服务
    fs: {
      strict: false
    }
  },
  // 显式配置 public 目录
  publicDir: 'public',
  // Enable3D 需要预构建所有 CJS 依赖
  optimizeDeps: {
    include: [
      '@enable3d/phaser-extension',
      '@yandeu/events',
      'matter-js'
    ]
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/']
    }
  }
});

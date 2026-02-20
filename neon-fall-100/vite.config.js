import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  // 将 assets 目录作为静态资源目录
  publicDir: 'assets',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
    host: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});

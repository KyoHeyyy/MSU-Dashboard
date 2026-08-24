import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    host: '0.0.0.0',
    proxy: {
      '/navigator': {
        target: 'https://msu.io',
        changeOrigin: true,
        secure: true
      },
      '/api/msu': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
        secure: false
      }
    }
  }
});

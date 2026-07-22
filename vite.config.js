import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    proxy: {
      '/navigator': {
        target: 'https://msu.io',
        changeOrigin: true,
        secure: true
      }
    }
  }
});

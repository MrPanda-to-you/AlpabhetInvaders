import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@systems': resolve(__dirname, 'src/systems'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@assets': resolve(__dirname, 'assets')
    }
  },
  server: {
    port: 5173,
    open: false
  }
});

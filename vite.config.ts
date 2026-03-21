import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@fate/types': resolve(__dirname, './src/types/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
  },
});

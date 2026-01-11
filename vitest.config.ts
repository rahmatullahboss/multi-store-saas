import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['node_modules', 'android', 'ios', '.wrangler'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['app/**/*.ts', 'app/**/*.tsx', 'server/**/*.ts'],
      exclude: [
        'node_modules',
        '**/*.test.ts',
        '**/*.test.tsx',
        'app/routes/**/*.tsx', // UI routes
      ],
    },
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app'),
      '@db': path.resolve(__dirname, './db'),
    },
  },
});

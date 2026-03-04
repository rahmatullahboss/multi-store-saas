import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['**/node_modules/**', 'android', 'ios', '.wrangler', 'e2e', 'app/tests/performance/api-load.test.ts'],
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
    // Fix for React version mismatch in tests
    alias: [
      { find: 'react', replacement: path.resolve(__dirname, 'node_modules/react') },
      { find: 'react-dom', replacement: path.resolve(__dirname, 'node_modules/react-dom') },
      { find: 'react/jsx-runtime', replacement: path.resolve(__dirname, 'node_modules/react/jsx-runtime') },
    ],
    environmentOptions: {
      happyDOM: {
        settings: {
          disableJavaScriptFileLoading: true,
          disableJavaScriptEvaluation: true,
          disableCSSFileLoading: true,
          disableIframePageLoading: true,
          disableComputedStyleRendering: true,
        },
      },
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app'),
      '@db': path.resolve(__dirname, './db'),
      '@server': path.resolve(__dirname, './server'),
    },
  },
});

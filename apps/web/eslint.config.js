import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
      },
    },
  },
  {
    files: ['e2e/**/*.ts'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',

      // React
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'prefer-const': 'warn',
    },
  },
  {
    // Workers & server: allow console.log (they run server-side on Cloudflare edge)
    files: ['workers/**/*.ts', 'server/**/*.ts', 'server/**/*.tsx'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    // Tests & E2E: relax rules
    files: ['tests/**/*.ts', 'tests/**/*.tsx', 'test/**/*.ts', 'e2e/**/*.ts', 'app/tests/**/*.ts', 'app/tests/**/*.tsx'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    // Themes & store templates: many props are part of a shared interface contract
    files: [
      'app/themes/**/*.ts',
      'app/themes/**/*.tsx',
      'app/components/store-templates/**/*.ts',
      'app/components/store-templates/**/*.tsx',
      'app/components/store-layouts/**/*.ts',
      'app/components/store-layouts/**/*.tsx',
      'app/components/store-sections/**/*.ts',
      'app/components/store-sections/**/*.tsx',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' }],
    },
  },
  {
    // Routes & services: server-side code with complex types
    files: [
      'app/routes/**/*.ts',
      'app/routes/**/*.tsx',
      'app/services/**/*.ts',
      'app/utils/**/*.ts',
      'app/utils/**/*.tsx',
      'app/lib/**/*.ts',
      'app/lib/**/*.tsx',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
  {
    // Landing builder: complex component with many in-progress features
    files: [
      'app/components/landing-builder/**/*.ts',
      'app/components/landing-builder/**/*.tsx',
      'app/components/landing/**/*.ts',
      'app/components/landing/**/*.tsx',
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    // Core app infrastructure: contexts, hooks, root, entries - complex types
    files: [
      'app/contexts/**/*.ts',
      'app/contexts/**/*.tsx',
      'app/hooks/**/*.ts',
      'app/hooks/**/*.tsx',
      'app/entry.client.tsx',
      'app/entry.server.tsx',
      'app/root.tsx',
      'app/templates/**/*.ts',
      'app/templates/**/*.tsx',
      'app/components/ui/**/*.ts',
      'app/components/ui/**/*.tsx',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
  {
    // Landing page templates: shared interface contracts with many optional props
    files: [
      'app/components/templates/**/*.ts',
      'app/components/templates/**/*.tsx',
      'app/components/store/**/*.ts',
      'app/components/store/**/*.tsx',
      'app/components/lead-gen/**/*.ts',
      'app/components/lead-gen/**/*.tsx',
      'app/components/store-builder/**/*.ts',
      'app/components/store-builder/**/*.tsx',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: [
      'node_modules/**',
      'build/**',
      'public/build/**',
      '.wrangler/**',
      'playwright-report/**',
      'test-results/**',
      'functions/**',
      '.cache/**',
      'android/**',
      'ios/**',
      'public/sw.js',
      '*.config.js',
      '*.config.ts',
      '**/*.min.js',
      '**/*.d.ts',
    ],
  }
);

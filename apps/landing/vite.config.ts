import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],
  ssr: {
    resolve: {
      conditions: ['workerd', 'worker', 'browser'],
    },
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    // CRITICAL: Force ALL React references (Vite + wrangler) to use landing's
    // local React 18, NOT the monorepo root's React 19.
    // Without this, wrangler's esbuild resolves `from "react"` to the root
    // React 19, creating elements with shape {$$typeof, type, key, ref, props}
    // that React 18's renderer doesn't recognize — causing "Objects are not
    // valid as a React child" error.
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime'),
      'react-dom/server': path.resolve(__dirname, 'node_modules/react-dom/server'),
    },
  },
});

import { reactRouter } from '@react-router/dev/vite';
import { cloudflareDevProxy } from '@react-router/dev/vite/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// CDN base URL for static assets in production
// This serves JS/CSS/images from the main Pages domain, reducing Worker CPU usage
const CDN_BASE_URL = '/';
const IS_E2E = process.env.E2E === '1' || process.env.NODE_ENV === 'test' || !!process.env.CI;

export default defineConfig({
  server: {
    // Multi-tenant local dev + E2E:
    // allow subdomain routing like http://mystore.localhost:5173
    // (Vite otherwise blocks unknown Host headers).
    host: true,
    // Use env override for E2E to avoid port conflicts with an already-running dev server.
    port: Number(process.env.PORT || 5173),
    strictPort: true,
    // Vite 5/6 host-check: allow *.localhost for tenant subdomains.
    // Keep this tight (not "all") to avoid accidentally exposing dev server.
    allowedHosts: ['.localhost', 'localhost', '127.0.0.1'],
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
    },
  },
  // In production, assets are served from the Worker via ASSETS binding
  // HTML from subdomains will reference assets from the main domain (if configured) or same origin
  base: CDN_BASE_URL,

  plugins: [
    // cloudflareDevProxyVitePlugin MUST come before remix plugin
    // Only enable in local dev — skip in production builds and CI
    ...(
      !process.env.NODE_ENV ||
      (process.env.NODE_ENV === 'development' && !process.env.CI && !process.env.WRANGLER_CI)
        ? [cloudflareDevProxy()]
        : []
    ),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    // Sentry plugin disabled for faster builds
    // Uncomment when Sentry integration is needed
    // sentryVitePlugin({
    //   org: "ozzyl",
    //   project: "javascript-remix",
    //   authToken: process.env.SENTRY_AUTH_TOKEN,
    //   sourcemaps: {
    //     filesToDeleteAfterUpload: ["./build/**/*.map"],
    //   },
    // }),
  ],
  build: {
    // Target modern browsers to reduce legacy polyfills/transforms
    target: 'es2020',
    sourcemap: false, // Disable source maps in production for faster builds
    minify: true,
    rollupOptions: {
      // Capacitor packages are dynamically imported only in mobile context
      // and are not installed for the web build
      external: [
        '@capacitor/status-bar',
        '@capacitor/splash-screen',
        '@capacitor/network',
        '@capacitor/app',
        '@capacitor/push-notifications',
      ],
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        // Split heavy client-only libraries into separate chunks
        // IMPORTANT: Never put react/react-dom in separate chunks - causes hydration errors!
        manualChunks(id) {
          // CRITICAL: Keep React in the main bundle - never split it!
          // This prevents duplicate React instances which cause Error #418
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-is/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return undefined; // Let Rollup handle naturally (stays in main bundle)
          }

          // GrapesJS and related plugins - ~1.4MB
          if (id.includes('grapesjs')) {
            return 'grapesjs';
          }
        },
      },
    },
  },
  esbuild: {
    target: 'es2020',
  },
  ssr: {
    // CRITICAL: Workers have no node_modules at runtime.
    // Force Vite to bundle ALL npm packages into the SSR build.
    // Without this, React/react-dom/etc are left as bare `import "react"`
    // which resolves to null in Workers, causing useMemo/useState crashes.
    noExternal: true,
    resolve: {
      conditions: ['workerd', 'worker', 'browser'],
      externalConditions: ['workerd', 'worker'],
    },
    // Externalize heavy client-only dependencies from SSR bundle
    // These are only needed on the client side (lazy loaded)
    external: [
      // Sentry SDK — relies on browser/Node APIs that crash in workerd.
      // Must be externalized so the SSR build uses no-op stubs instead.
      '@sentry/remix',
      '@sentry/cloudflare',
      '@sentry/node',
      // Heavy PDF library - offloaded to PDF_SERVICE worker
      'jspdf',
      'jspdf-autotable',
      // GrapesJS - client-only page builder
      'grapesjs',
      'grapesjs-blocks-basic',
      'grapesjs-plugin-forms',
      // TipTap editor
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@tiptap/extension-link',
      '@tiptap/extension-placeholder',
      '@tiptap/extension-text-align',
      // D3 libraries used by recharts
      'd3-shape',
      'd3-scale',
      'd3-path',
      'd3-array',
      'd3-color',
      'd3-format',
      'd3-interpolate',
      'd3-time',
      'd3-time-format',
    ],
  },
  resolve: {
    mainFields: ['browser', 'module', 'main'],
    // Deduplicate React to prevent multiple instances (causes SSR useMemo/useState null errors)
    // Especially important when react-i18next or other libs bundle their own React ref
    dedupe: ['react', 'react-dom', 'react-i18next', 'i18next'],
  },
  optimizeDeps: {
    // E2E/dev-server reliability: refresh optimized deps to avoid "missing chunk" flakes.
    ...(IS_E2E ? { force: true } : null),
    include: ['lucide-react'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
});

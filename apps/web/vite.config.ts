import { vitePlugin as remix, cloudflareDevProxyVitePlugin } from '@remix-run/dev';
import tailwindcss from '@tailwindcss/vite';
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// CDN base URL for static assets in production
// This serves JS/CSS/images from the main Pages domain, reducing Worker CPU usage
const CDN_BASE_URL = '/';

export default defineConfig({
  server: {
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
    cloudflareDevProxyVitePlugin(),
    tailwindcss(),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
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
    sourcemap: false, // Disable source maps in production for faster builds
    minify: true,
    rollupOptions: {
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
          // Recharts - ~315KB (but NOT its React dependencies)
          if (id.includes('recharts') && !id.includes('react')) {
            return 'recharts';
          }
          // D3 libraries (used by recharts) - separate chunk
          if (id.includes('d3-')) {
            return 'd3';
          }
          // TipTap/ProseMirror - ~370KB
          if (id.includes('@tiptap') || id.includes('prosemirror')) {
            return 'tiptap';
          }
        },
      },
    },
  },
  ssr: {
    resolve: {
      conditions: ['workerd', 'worker', 'browser'],
      externalConditions: ['workerd', 'worker'],
    },
    // Externalize heavy client-only dependencies from SSR bundle
    // These will be resolved at runtime (client-side only)
    // NOTE: recharts removed from external - using dynamic imports with hydration checks instead
    external: [
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
  },
  optimizeDeps: {
    include: ['lucide-react'],
  },
});

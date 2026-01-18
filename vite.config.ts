import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin,
} from "@remix-run/dev";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// CDN base URL for static assets in production
// This serves JS/CSS/images from the main Pages domain, reducing Worker CPU usage
const CDN_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://multi-store-saas.pages.dev/'
  : '/';

export default defineConfig({
  // In production, assets are served from CDN domain
  // This means HTML from subdomains will reference assets from the main domain
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
  ],
  build: {
    minify: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        // Split heavy client-only libraries into separate chunks
        manualChunks(id) {
          // GrapesJS and related plugins - ~1.4MB
          if (id.includes('grapesjs')) {
            return 'grapesjs';
          }
          // Recharts - ~315KB
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'recharts';
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
      conditions: ["workerd", "worker", "browser"],
      externalConditions: ["workerd", "worker"],
    },
    // Externalize heavy client-only dependencies from SSR bundle
    // These will be resolved at runtime (client-side only)
    external: [
      'grapesjs',
      'grapesjs-blocks-basic',
      'grapesjs-plugin-forms',
      'recharts',
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
    mainFields: ["browser", "module", "main"],
  },
  optimizeDeps: {
    include: ["lucide-react"],
  },
});

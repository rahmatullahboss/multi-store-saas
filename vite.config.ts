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
    // Ensure consistent asset naming for caching
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  ssr: {
    resolve: {
      conditions: ["workerd", "worker", "browser"],
      externalConditions: ["workerd", "worker"],
    },
  },
  resolve: {
    mainFields: ["browser", "module", "main"],
  },
  optimizeDeps: {
    include: ["lucide-react"],
  },
});

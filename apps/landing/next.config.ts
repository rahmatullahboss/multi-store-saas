import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-bec31ee88a08441a8824ab94bb973c04.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'assets.ozzyl.com',
      },
    ],
  },

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Turbopack configuration (Next.js 16+)
  turbopack: {},

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // Next.js 16 Partial Pre-Rendering (PPR) - enables instant static shell with streaming dynamic content
  cacheComponents: true,
};

export default nextConfig;

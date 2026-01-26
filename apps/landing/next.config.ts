/** @type {import('next').NextConfig} */
const nextConfig = {
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

  // Enable SWC minification (faster than Terser)
  swcMinify: true,

  // Optimize chunks
  webpack: (config: any, { isServer }: any) => {
    if (!isServer) {
      // Split vendor chunks
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for react, react-dom
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Framer Motion in separate chunk
            motion: {
              name: 'motion',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
              priority: 30,
              enforce: true,
            },
            // Lucide icons
            icons: {
              name: 'icons',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](lucide-react)[\\/]/,
              priority: 25,
              enforce: true,
            },
            // Other libs
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name: 'lib',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      };
    }
    return config;
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;

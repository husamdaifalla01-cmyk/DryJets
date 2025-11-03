/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Production optimization
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // Image optimization
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    domains: [], // Add any external image domains here
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    NEXT_PUBLIC_WEB_ADMIN_URL: process.env.NEXT_PUBLIC_WEB_ADMIN_URL || 'http://localhost:3004',
  },

  // Experimental features for Vercel deployment
  experimental: {
    optimizeCss: true,
  },

  // Production output optimization
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;

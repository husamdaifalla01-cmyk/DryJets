/** @type {import('next').NextConfig} */
const { withContentlayer } = require('next-contentlayer2');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@dryjets/ui', '@dryjets/database', '@dryjets/types'],

  // Image optimization
  images: {
    domains: [
      'localhost',
      'dryjets.com',
      'storage.googleapis.com',
      's3.amazonaws.com',
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/consumer/dashboard',
        permanent: false,
      },
    ];
  },
};

module.exports = withContentlayer(nextConfig);

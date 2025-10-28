import type { NextConfig } from "next";

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';
const PORT = parseInt(process.env.PORT || '3001', 10); // Using port 3001 as 3000 is in use

const nextConfig: NextConfig = {
  // Enable standalone output for Docker builds
  output: 'standalone',
  
  // Note: devServer is not a valid option in Next.js 13+
  // The development server port is now configured via the -p flag in package.json
  
  // API rewrites for development
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${API_BASE_URL}/api/v1/:path*`,
      },
    ];
  },
  
  // Enable React Strict Mode in development
  reactStrictMode: process.env.NODE_ENV !== 'production',
  
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cibng.org',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
    ],
  },
  
  // Webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Custom webpack configurations can go here
    
    // In development, you might want to enable Fast Refresh
    if (dev && !isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        // Only ignore node_modules in development to improve performance
        ignored: ['**/node_modules/**'],
      };
    }
    
    return config;
  },
  
  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${PORT}`, // Using port 3001
  },
  
  // TypeScript configuration
  typescript: {
    // Enable type checking during build
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  
  // ESLint configuration
  eslint: {
    // Only run ESLint during builds in production
    ignoreDuringBuilds: process.env.NODE_ENV !== 'production',
  },
  
  // Enable production source maps
  productionBrowserSourceMaps: true,
  
  // Configure CORS headers
  async headers() {
    return [
      {
        source: '/api/v1/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { 
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

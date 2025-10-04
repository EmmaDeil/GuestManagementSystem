import type { NextConfig } from "next";
import path from "path";

const nodeEnv = process.env.NODE_ENV || 'development';
const isDevelopment = nodeEnv === 'development';
const isProduction = nodeEnv === 'production';

console.log('🔧 Next.js Configuration');
console.log('═══════════════════════════════════════');
console.log(`📝 NODE_ENV: ${nodeEnv}`);
console.log(`🔧 Is Development: ${isDevelopment}`);
console.log(`🚀 Is Production: ${isProduction}`);
console.log(`🔗 NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL || 'not set'}`);
console.log(`🌐 NEXT_PUBLIC_CLIENT_URL: ${process.env.NEXT_PUBLIC_CLIENT_URL || 'not set'}`);

const nextConfig: NextConfig = {
  // Fix the workspace root warning by explicitly setting the project root
  outputFileTracingRoot: path.join(__dirname, "../"),
  
  // Use standalone output for production deployment
  output: isProduction ? 'standalone' : undefined,
  trailingSlash: true,
  
  // Image optimization
  images: {
    unoptimized: isProduction, // Disable optimization in production for simpler deployment
  },
  
  // Proxy API requests to backend (only in development)
  ...(isDevelopment && {
    async rewrites() {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      console.log(`🔄 Development API Proxy: /api/* → ${backendUrl}/api/*`);
      
      return [
        {
          source: "/api/:path*",
          destination: `${backendUrl}/api/:path*`,
        },
      ];
    },
  }),
  
  // Environment variables
  env: {
    CUSTOM_KEY: "my-value",
    BUILD_TIME: new Date().toISOString(),
    BUILD_ENV: nodeEnv,
  },
  
  // TypeScript configuration
  typescript: {
    // Don't allow production builds with type errors
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    // Don't allow production builds with ESLint errors
    ignoreDuringBuilds: false,
  },
};

console.log(`🏗️  Output Mode: ${nextConfig.output || 'default'}`);
console.log(`🖼️  Image Optimization: ${nextConfig.images?.unoptimized ? 'disabled' : 'enabled'}`);
console.log('═══════════════════════════════════════');

export default nextConfig;

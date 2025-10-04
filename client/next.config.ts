import type { NextConfig } from "next";
import path from "path";

const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // Fix the workspace root warning by explicitly setting the project root
  outputFileTracingRoot: path.join(__dirname, "../"),
  
  // Use different output strategy based on environment
  // For development: normal Next.js server
  // For production: standalone for Render deployment
  output: isDevelopment ? undefined : 'standalone',
  trailingSlash: true,
  
  // Image optimization
  images: {
    unoptimized: !isDevelopment,
  },
  
  // Proxy API requests to backend (only in development)
  ...(isDevelopment && {
    async rewrites() {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:5000/api/:path*",
        },
      ];
    },
  }),
  
  // Environment variables
  env: {
    CUSTOM_KEY: "my-value",
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

export default nextConfig;

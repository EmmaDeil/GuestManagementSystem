import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix the workspace root warning by explicitly setting the project root
  outputFileTracingRoot: path.join(__dirname, "../"),
  
  // Enable static export for single-service deployment in production
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  trailingSlash: true,
  
  // Proxy API requests to backend (only in development)
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:5000/api/:path*",
        },
      ];
    }
    return [];
  },
  
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

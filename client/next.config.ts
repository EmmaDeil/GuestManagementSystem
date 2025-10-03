import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix the workspace root warning by explicitly setting the project root
  outputFileTracingRoot: path.join(__dirname, "../"),
  
  // Proxy API requests to backend
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
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

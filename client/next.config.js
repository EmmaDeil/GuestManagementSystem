/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone build for better performance in production
  output: "standalone",

  // Optimize images
  images: {
    unoptimized: true, // For Render deployment
  },

  // Environment variables validation
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Ensure proper page discovery
  pageExtensions: ["tsx", "ts", "jsx", "js"],

  // Security headers for production
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

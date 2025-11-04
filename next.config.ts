import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: require("path").join(__dirname),
  experimental: {
    // Enable Server Actions
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;

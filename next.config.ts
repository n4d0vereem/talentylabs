import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: require("path").join(__dirname),
  experimental: {
    // Enable Server Actions
    serverActions: {
      allowedOrigins: ["localhost:3000"],
      bodySizeLimit: "50mb", // Augmenter la limite pour les uploads
    },
  },
  // Augmenter la limite pour les API routes
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};

export default nextConfig;

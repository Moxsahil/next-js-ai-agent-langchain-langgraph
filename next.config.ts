import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ⛔ Skip TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Optional: You can also skip ESLint (only affects development if you run `next lint`)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Add other config options here
};

export default nextConfig;

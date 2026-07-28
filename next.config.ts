import type { NextConfig } from "next";

const nextConfig: any = {
  compress: true,
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    esmExternals: false, // Switch back to Webpack and disable Turbopack
  },
  webpack: (config) => {
    // Add Web Worker support for @ffmpeg/ffmpeg
    config.module.rules.push({
      test: /\.worker\.(js|ts)$/,
      use: {
        loader: "worker-loader",
        options: {
          filename: "[name].[contenthash].worker.js",
        },
      },
    });

    // Adjust public path to fix import.meta.url issues
    config.output.publicPath = path.join(config.output.publicPath || "/", "_next/");

    return config;
  },
};

export default nextConfig;

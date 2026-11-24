import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  async redirects() {
    return [
      { source: "/plan", destination: "/about/plan", permanent: true },
      { source: "/media-kit", destination: "/inventory", permanent: true },
      { source: "/planner", destination: "/campaigns/new", permanent: true },
      { source: "/pilot", destination: "/pilots", permanent: true },
      { source: "/revenue", destination: "/forecast", permanent: true },
      { source: "/sources", destination: "/about/sources", permanent: true },
    ];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

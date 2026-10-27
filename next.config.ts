import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static build: every page is plain HTML/JS/CSS that the service worker can precache for offline use.
  output: "export",
  // Emit `/lessons/index.html` so pages resolve the same way on any static host and in the offline cache.
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
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

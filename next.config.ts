import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Without this, Next blocks /_next/* dev resources when the site is opened
  // from another device on the LAN, so no JS loads and the page is inert.
  allowedDevOrigins: ["192.168.0.180", "192.168.0.128", "*.local"],
  // Placeholder photography until DIAL's own images are collected.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "deifkwefumgah.cloudfront.net" }],
  },
  // Self-hosted font files are versioned in their names (`.v1`), so they can
  // be cached forever; public/ files otherwise revalidate on every visit.
  async headers() {
    return [
      {
        source: "/fonts/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;

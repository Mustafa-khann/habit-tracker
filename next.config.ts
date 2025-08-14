import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export as a fully static site so Electron can load it from file://
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;

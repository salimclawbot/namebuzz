import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    "remark-gfm",
    "rehype-raw",
    "rehype-slug",
    "rehype-autolink-headings",
  ],
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@analytics-kit/react",
    "@analytics-kit/core",
    "@analytics-kit/next",
    "@analytics-kit/connector-mock",
    "@analytics-kit/connector-vercel",
  ],
  serverExternalPackages: ["shiki", "@shikijs/engine-oniguruma"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;

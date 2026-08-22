import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(appDir, "../..");

const aliases = {
  "@analytics-kit/react/styles.css": path.join(repoRoot, "packages/react/src/styles.css"),
  "@analytics-kit/react": path.join(repoRoot, "packages/react/src/index.ts"),
  "@analytics-kit/core": path.join(repoRoot, "packages/core/src/index.ts"),
  "@analytics-kit/next": path.join(repoRoot, "packages/next/src/index.ts"),
  "@analytics-kit/connector-mock": path.join(repoRoot, "packages/connector-mock/src/index.ts"),
  "@analytics-kit/connector-vercel": path.join(repoRoot, "packages/connector-vercel/src/index.ts"),
};

const nextConfig: NextConfig = {
  outputFileTracingRoot: repoRoot,
  transpilePackages: [
    "@analytics-kit/react",
    "@analytics-kit/core",
    "@analytics-kit/next",
    "@analytics-kit/connector-mock",
    "@analytics-kit/connector-vercel",
  ],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  turbopack: {
    resolveAlias: aliases,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      ...aliases,
    };
    return config;
  },
};

export default nextConfig;

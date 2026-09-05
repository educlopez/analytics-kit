import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@wingtics/react",
    "@wingtics/core",
    "@wingtics/next",
    "@wingtics/connector-mock",
    "@wingtics/connector-vercel",
  ],
  serverExternalPackages: ["shiki", "@shikijs/engine-oniguruma"],
};

export default nextConfig;

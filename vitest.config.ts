import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@analytics-kit/core": path.resolve("packages/core/src/index.ts"),
      "@analytics-kit/react": path.resolve("packages/react/src/index.ts"),
      "@analytics-kit/next": path.resolve("packages/next/src/index.ts"),
      "@analytics-kit/connector-mock": path.resolve("packages/connector-mock/src/index.ts"),
      "@analytics-kit/connector-plausible": path.resolve(
        "packages/connector-plausible/src/index.ts",
      ),
      "@analytics-kit/connector-vercel": path.resolve("packages/connector-vercel/src/index.ts"),
      "@analytics-kit/connector-ga4": path.resolve("packages/connector-ga4/src/index.ts"),
      "@analytics-kit/connector-umami": path.resolve("packages/connector-umami/src/index.ts"),
      "@analytics-kit/connector-posthog": path.resolve("packages/connector-posthog/src/index.ts"),
    },
  },
});

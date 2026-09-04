import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    // The site carries real logic now — Accept negotiation and the derived
    // markdown representations — so its tests run alongside the packages'.
    include: ["packages/**/*.test.ts", "src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@wingtics/core": path.resolve("packages/core/src/index.ts"),
      "@wingtics/react": path.resolve("packages/react/src/index.ts"),
      "@wingtics/next": path.resolve("packages/next/src/index.ts"),
      "@wingtics/connector-mock": path.resolve("packages/connector-mock/src/index.ts"),
      "@wingtics/connector-plausible": path.resolve("packages/connector-plausible/src/index.ts"),
      "@wingtics/connector-vercel": path.resolve("packages/connector-vercel/src/index.ts"),
      "@wingtics/connector-ga4": path.resolve("packages/connector-ga4/src/index.ts"),
      "@wingtics/connector-umami": path.resolve("packages/connector-umami/src/index.ts"),
      "@wingtics/connector-posthog": path.resolve("packages/connector-posthog/src/index.ts"),
      "@": path.resolve("src"),
    },
  },
});

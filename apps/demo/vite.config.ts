import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

function githubPagesSpaFallback() {
  return {
    name: "github-pages-spa-fallback",
    closeBundle() {
      const index = path.resolve(root, "dist/index.html");
      if (fs.existsSync(index)) {
        fs.copyFileSync(index, path.resolve(root, "dist/404.html"));
      }
    },
  };
}

export default defineConfig({
  base: process.env.VITE_BASE || "/",
  plugins: [react(), tailwindcss(), githubPagesSpaFallback()],
  resolve: {
    alias: [
      {
        find: "@analytics-kit/react/styles.css",
        replacement: path.resolve(root, "../../packages/react/src/styles.css"),
      },
      {
        find: "@analytics-kit/core",
        replacement: path.resolve(root, "../../packages/core/src/index.ts"),
      },
      {
        find: "@analytics-kit/react",
        replacement: path.resolve(root, "../../packages/react/src/index.ts"),
      },
      {
        find: "@analytics-kit/connector-mock",
        replacement: path.resolve(root, "../../packages/connector-mock/src/index.ts"),
      },
      {
        find: "@analytics-kit/connector-vercel",
        replacement: path.resolve(root, "../../packages/connector-vercel/src/index.ts"),
      },
    ],
  },
});

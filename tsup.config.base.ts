import { defineConfig, type Options } from "tsup";

export function packageConfig(options: Options = {}) {
  return defineConfig({
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
    target: "es2022",
    external: [/^@analytics-kit\//, "react", "react-dom", "react/jsx-runtime"],
    ...options,
  });
}

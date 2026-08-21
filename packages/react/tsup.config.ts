import { readFile, writeFile } from "node:fs/promises";
import { packageConfig } from "../../tsup.config.base";

export default packageConfig({
  async onSuccess() {
    for (const file of ["dist/index.js", "dist/index.cjs"]) {
      const source = await readFile(file, "utf8");
      if (!source.startsWith('"use client"')) {
        await writeFile(file, `"use client";\n${source}`);
      }
    }
  },
});

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "public/r");
const site = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  "https://analytics-kit-demo.vercel.app"
)
  .replace(/\/$/, "")
  .replace(/^(?!https?:\/\/)/, "https://");

const rewriteSite = (value) =>
  value
    .replaceAll("https://educlopez.github.io/analytics-kit", site)
    .replaceAll("https://analytics-kit-demo.vercel.app", site);

const registry = JSON.parse(await readFile(path.join(root, "registry.json"), "utf8"));
registry.homepage = `${site}/`;

await mkdir(outputDir, { recursive: true });

const catalog = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: registry.name,
  homepage: registry.homepage,
  items: [],
};

for (const item of registry.items) {
  const built = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    ...item,
    files: [],
    registryDependencies: item.registryDependencies?.map(rewriteSite),
  };

  for (const file of item.files ?? []) {
    const source = await readFile(path.join(root, file.path), "utf8");
    built.files.push({ ...file, content: source });
  }

  catalog.items.push({
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    categories: item.categories,
  });

  await writeFile(path.join(outputDir, `${item.name}.json`), `${JSON.stringify(built, null, 2)}\n`);
}

await writeFile(path.join(outputDir, "registry.json"), `${JSON.stringify(catalog, null, 2)}\n`);

console.log(`Wrote ${catalog.items.length} registry items to ${path.relative(root, outputDir)}`);

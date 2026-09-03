"use client";

import { CodeBlock } from "@/site/CodeBlock";
import { useRegistryCommand } from "@/site/useRegistryCommand";
import type { CatalogItem } from "./items";

export function CodePanel({
  item,
  usage,
  dirty,
}: {
  item: CatalogItem;
  usage: string;
  dirty: boolean;
}) {
  const registry = useRegistryCommand(item.registry ?? "dashboard");
  const npm = item.dependencies.map((dep) => dep.name).join(" ");
  const install = item.registry ? registry : `pnpm add ${npm}`;

  return (
    <div className="mt-5 grid gap-6">
      <CodeBlock
        code={install}
        lang="bash"
        title={item.registry ? "shadcn" : "pnpm"}
        copyId="cli"
      />
      <CodeBlock code={`pnpm add ${npm}`} lang="bash" title="package" copyId="pkg" />
      <CodeBlock
        code={usage}
        lang="tsx"
        title={dirty ? "usage (customized)" : "usage"}
        copyId="usage"
      />
      <section>
        <h2 className="text-subheading-xs text-text-soft-400 mb-4 uppercase">Dependencies</h2>
        <ul className="flex flex-wrap gap-1.5">
          {item.dependencies.map((dep) => (
            <li
              key={dep.name}
              className="border-stroke-soft-200 rounded-10 flex items-baseline gap-2 border px-2.5 py-1.5"
            >
              <code className="text-text-strong-950 font-mono text-xs">{dep.name}</code>
              <span className="text-text-soft-400 text-xs">{dep.version}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

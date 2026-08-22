"use client";

import { CodeBlock } from "../site/CodeBlock";
import { useRegistryCommand } from "../site/useRegistryCommand";
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
    <div className="code-panel">
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
      <section className="catalog-section deps-section">
        <h2>Dependencies</h2>
        <ul className="dep-list">
          {item.dependencies.map((dep) => (
            <li key={dep.name}>
              <code>{dep.name}</code>
              <span>{dep.version}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

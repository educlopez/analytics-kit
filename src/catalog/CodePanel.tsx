"use client";

import { useCopy } from "../site/useCopy";
import { useRegistryCommand } from "../site/useRegistryCommand";
import type { CatalogItem } from "./items";

function CopyBlock({
  id,
  label,
  hint,
  value,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
}) {
  const { copied, copy } = useCopy();

  return (
    <div className="code-block">
      <div className="code-block-head">
        <div>
          <h3>{label}</h3>
          {hint ? <p>{hint}</p> : null}
        </div>
        <button type="button" onClick={() => void copy(value, id)}>
          {copied === id ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="snippet">
        <code>{value}</code>
      </pre>
    </div>
  );
}

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
      <CopyBlock
        id="cli"
        label="CLI"
        hint={
          item.registry ? "shadcn registry item for this component." : "Install the React package."
        }
        value={install}
      />
      <CopyBlock
        id="pkg"
        label="Package"
        hint="Add the kit, then import the component."
        value={`pnpm add ${npm}`}
      />
      <CopyBlock
        id="usage"
        label="Usage"
        hint={dirty ? "Reflects the knobs in Customize." : "Default props for this component."}
        value={usage}
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

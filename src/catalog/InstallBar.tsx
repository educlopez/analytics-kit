"use client";

import { useCopy } from "../site/useCopy";
import { useRegistryCommand } from "../site/useRegistryCommand";

export function InstallBar({ registry, snippet }: { registry?: string; snippet: string }) {
  const command = useRegistryCommand(registry ?? "dashboard");
  const npm = "pnpm add @analytics-kit/react";
  const { copied, copy } = useCopy();
  const install = registry ? command : npm;

  return (
    <div className="install-stack">
      <button type="button" className="install" onClick={() => void copy(install, "install")}>
        <span>$</span>
        <code>{install}</code>
        <em>{copied === "install" ? "Copied" : "Install"}</em>
      </button>
      <button type="button" className="install" onClick={() => void copy(snippet, "snippet")}>
        <span>&lt;/&gt;</span>
        <code>{snippet}</code>
        <em>{copied === "snippet" ? "Copied" : "Copy"}</em>
      </button>
    </div>
  );
}

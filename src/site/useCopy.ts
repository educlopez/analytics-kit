import { useState } from "react";

export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (value: string, which: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(which);
    window.setTimeout(() => setCopied(null), 1600);
  };

  return { copied, copy };
}

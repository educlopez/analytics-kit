"use client";

import { useEffect, useState } from "react";
import { highlight, type CodeLang } from "./highlight";
import { useCopy } from "./useCopy";

export function CodeBlock({
  code,
  lang,
  title,
  copyId,
}: {
  code: string;
  lang: CodeLang;
  title?: string;
  copyId?: string;
}) {
  const { copied, copy } = useCopy();
  const [html, setHtml] = useState<string | null>(null);
  const id = copyId ?? title ?? lang;

  useEffect(() => {
    let cancelled = false;
    void highlight(code, lang).then((next) => {
      if (!cancelled) setHtml(next);
    });
    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  return (
    <div className="code-frame">
      <div className="code-frame-bar">
        <span>{title ?? lang}</span>
        <button type="button" onClick={() => void copy(code, id)}>
          {copied === id ? "Copied" : "Copy"}
        </button>
      </div>
      {html ? (
        <div className="code-frame-body" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className="snippet">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}

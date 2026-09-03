"use client";

import { useEffect, useState } from "react";
import { RiCheckLine, RiFileCopyLine } from "@remixicon/react";
import * as Button from "@/components/ui/button";
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
  const done = copied === id;

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
    <div className="border-stroke-soft-200 min-w-0 overflow-hidden rounded-2xl border">
      <div className="border-stroke-soft-200 bg-bg-weak-25 flex items-center justify-between gap-3 border-b py-1.5 pr-1.5 pl-4">
        <span className="text-text-soft-400 font-mono text-xs">{title ?? lang}</span>
        <Button.Root
          variant="neutral"
          mode="ghost"
          size="xsmall"
          className="rounded-10 cursor-pointer"
          onClick={() => void copy(code, id)}
        >
          <Button.Icon as={done ? RiCheckLine : RiFileCopyLine} />
          {done ? "Copied" : "Copy"}
        </Button.Root>
      </div>
      {/* Shiki paints its own background; the wrapper only owns the frame. */}
      {html ? (
        <div
          className="ak-code no-scrollbar overflow-x-auto text-[13px] leading-[1.65] [&_pre]:m-0 [&_pre]:p-4"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="no-scrollbar m-0 overflow-x-auto bg-[#101010] p-4 text-[13px] leading-[1.65] text-[#ededed]">
          <code className="block min-w-max">{code}</code>
        </pre>
      )}
    </div>
  );
}

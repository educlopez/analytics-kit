"use client";

import { RiCheckLine, RiFileCopyLine } from "@remixicon/react";
import * as Button from "@/components/ui/button";
import { useCopy } from "@/site/useCopy";

/**
 * A shell command with a copy affordance. The command scrolls rather than
 * truncating: on a phone these are ~700px of text in a ~270px box, and an
 * ellipsis hides the half that matters with no way to reach it.
 */
export function CopyCommand({ command, id }: { command: string; id: string }) {
  const { copied, copy } = useCopy();
  const done = copied === id;

  return (
    <div className="border-stroke-soft-200 bg-bg-weak-25 flex w-full min-w-0 items-center gap-3 rounded-xl border p-1.5 pl-3.5">
      <span className="text-text-soft-400 font-mono text-sm select-none">$</span>
      <code className="text-text-strong-950 no-scrollbar min-w-0 flex-1 overflow-x-auto font-mono text-sm whitespace-nowrap">
        {command}
      </code>
      <Button.Root
        variant="neutral"
        mode="stroke"
        size="xsmall"
        className="rounded-10 shrink-0 cursor-pointer"
        onClick={() => void copy(command, id)}
      >
        <Button.Icon as={done ? RiCheckLine : RiFileCopyLine} />
        {done ? "Copied" : "Copy"}
      </Button.Root>
    </div>
  );
}

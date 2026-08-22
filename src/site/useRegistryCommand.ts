"use client";

import { useEffect, useState } from "react";

export function useRegistryCommand(item = "dashboard") {
  const [command, setCommand] = useState(`pnpm dlx shadcn@latest add /r/${item}.json`);

  useEffect(() => {
    setCommand(`pnpm dlx shadcn@latest add ${window.location.origin}/r/${item}.json`);
  }, [item]);

  return command;
}

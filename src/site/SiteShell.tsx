"use client";

import type { ReactNode } from "react";
import { Footer } from "@/blocks/Footer";
import { Navigation } from "@/blocks/Navigation";
import { ThemeProvider } from "@/site/theme";

export { useSite } from "@/site/theme";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <a
        className="bg-bg-strong-950 text-text-white-0 text-label-sm rounded-10 absolute top-3 left-3 z-500 -translate-y-[160%] px-3.5 py-2 transition-transform focus:translate-y-0"
        href="#content"
      >
        Skip to content
      </a>
      <div className="bg-bg-white-0 flex min-h-dvh flex-col">
        <Navigation />
        <main id="content" className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

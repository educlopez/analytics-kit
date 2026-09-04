"use client";

/**
 * Adapted from AlignUI Pro "Navigation 01". The upstream block carries a
 * mega-menu; this site has four flat destinations, so the dropdown is dropped
 * and the theme switch takes the "Sign in" slot.
 */

import { useEffect, useRef, useState } from "react";
import { RiCloseFill, RiGithubFill, RiMenu3Fill, RiMoonLine, RiSunLine } from "@remixicon/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Button from "@/components/ui/button";
import { BrandMark } from "@/site/BrandMark";
import { SiteSearch } from "@/site/SiteSearch";
import { useSite } from "@/site/theme";
import { cn } from "@/utils/cn";

const nav: { label: string; href: string }[] = [
  { label: "Docs", href: "/docs" },
  { label: "Components", href: "/components" },
  { label: "Demo", href: "/demo" },
];

function useActive(href: string) {
  const pathname = usePathname();
  const pathOnly = href.split("#")[0] || "/";
  if (href.includes("#")) return false;
  if (pathOnly === "/") return pathname === "/";
  return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
}

function NavLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate: () => void;
}) {
  const active = useActive(href);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "text-label-md lg:text-label-sm lg:rounded-10 hover:bg-bg-weak-50 hover:text-text-strong-950 flex h-16 w-full items-center gap-2 rounded-none px-6 transition-all duration-300 lg:h-8 lg:w-auto lg:px-3",
        active ? "text-text-strong-950 lg:bg-bg-weak-50" : "text-text-sub-600",
      )}
    >
      {label}
    </Link>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const { theme, setTheme } = useSite();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsMenuOpen(false);
      // The panel is display:none once closed, so focus would fall to <body>.
      toggleRef.current?.focus();
    };
    const mq = window.matchMedia("(min-width: 1024px)");
    const onDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setIsMenuOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onDesktop);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onDesktop);
    };
  }, [isMenuOpen]);

  return (
    <header className="border-stroke-soft-200 bg-bg-white-0 sticky top-0 z-400 flex h-16 w-full items-center justify-between gap-6 border-b px-6 py-4.5 pr-4.5 lg:h-18 lg:px-11 lg:py-5">
      <div className="flex flex-1 items-center gap-6 lg:order-1">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark className="text-primary-base h-6 w-auto" />
          <span className="text-label-md text-text-strong-950">Wingtics</span>
        </Link>

        <nav
          aria-label="Primary"
          className={cn(
            "bg-bg-white-0 fixed top-16 left-0 flex h-[calc(100dvh-149px)] w-full flex-col items-center overflow-auto transition-all duration-300 lg:static lg:h-auto lg:w-auto lg:flex-row lg:gap-1 lg:overflow-visible lg:bg-transparent",
            isMenuOpen ? "visible opacity-100" : "invisible opacity-0 lg:visible lg:opacity-100",
          )}
          data-state={isMenuOpen ? "open" : "closed"}
        >
          {nav.map((item) => (
            <div
              key={item.label}
              className="border-stroke-soft-200 w-full border-b last:border-b-0 lg:w-auto lg:border-b-0"
            >
              <NavLink
                href={item.href}
                label={item.label}
                onNavigate={() => setIsMenuOpen(false)}
              />
            </div>
          ))}
          <div className="border-stroke-soft-200 w-full border-b last:border-b-0 lg:w-auto lg:border-b-0">
            <a
              href="https://github.com/educlopez/analytics-kit"
              className="text-text-sub-600 text-label-md lg:text-label-sm lg:rounded-10 hover:bg-bg-weak-50 hover:text-text-strong-950 flex h-16 w-full items-center gap-2 rounded-none px-6 transition-all duration-300 lg:h-8 lg:w-auto lg:px-3"
            >
              <RiGithubFill className="size-4.5 lg:hidden" />
              GitHub
            </a>
          </div>
        </nav>
      </div>

      <div
        className={cn(
          "border-stroke-soft-200 bg-bg-white-0 fixed bottom-0 left-0 flex w-full items-center gap-3.5 border-t px-6 py-5.5 transition-all duration-300 lg:relative lg:order-3 lg:w-auto lg:gap-3 lg:border-t-0 lg:bg-transparent lg:px-0 lg:py-0",
          isMenuOpen ? "visible opacity-100" : "invisible opacity-0 lg:visible lg:opacity-100",
        )}
        data-state={isMenuOpen ? "open" : "closed"}
      >
        <Button.Root
          variant="neutral"
          mode="stroke"
          size="medium"
          className="rounded-10 w-full lg:h-8 lg:w-auto"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Button.Icon as={theme === "dark" ? RiSunLine : RiMoonLine} />
          {theme === "dark" ? "Light" : "Dark"}
        </Button.Root>
        <Button.Root
          variant="primary"
          mode="filled"
          size="medium"
          asChild
          className="rounded-10 w-full lg:h-8 lg:w-auto"
        >
          <Link href="/docs">Get started</Link>
        </Button.Root>
      </div>

      <div className="flex items-center gap-2 lg:order-2">
        <SiteSearch />
        <Button.Root
          ref={toggleRef}
          className="rounded-10 lg:hidden"
          variant="neutral"
          mode="ghost"
          size="xsmall"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
          <Button.Icon
            as={isMenuOpen ? RiCloseFill : RiMenu3Fill}
            className="text-text-sub-600 size-5"
          />
        </Button.Root>
      </div>
    </header>
  );
}

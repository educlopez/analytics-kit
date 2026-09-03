import type { ReactNode } from "react";

/**
 * The site's wide reading layout: navigation on the left, the page in the
 * middle, a context column on the right. The columns collapse one at a time —
 * the right column drops under the middle below `xl`, the left turns into
 * `mobileNav` below `lg` — because a 220 + main + 328 row needs real width
 * before the middle column is worth looking at.
 */
export function ThreeColumn({
  nav,
  mobileNav,
  aside,
  children,
}: {
  nav?: ReactNode;
  mobileNav?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1720px] px-6 pb-16 lg:px-8 lg:pb-24">
      <div className="flex flex-col lg:flex-row lg:gap-10 xl:gap-12">
        {nav}
        <div className="flex min-w-0 flex-1 flex-col xl:flex-row xl:gap-10">
          <div className="min-w-0 flex-1">
            {mobileNav}
            {children}
          </div>
          {aside}
        </div>
      </div>
    </div>
  );
}

/** Shared shell for the left rail, so both shells sit on the same grid. */
export function ThreeColumnNav({ label, children }: { label: string; children: ReactNode }) {
  return (
    <aside
      className="no-scrollbar sticky top-24 hidden w-[220px] shrink-0 grid-cols-1 gap-px self-start overflow-y-auto py-8 lg:grid lg:max-h-[calc(100dvh-8rem)]"
      aria-label={label}
    >
      {children}
    </aside>
  );
}

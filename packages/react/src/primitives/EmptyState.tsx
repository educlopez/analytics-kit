import type { ReactNode } from "react";
import { cn } from "../lib/cn.js";
import { EMPTY_STATE_VARIANTS, type EmptyStateVariant } from "../charts/variants.js";

/** Neutral placeholder mark, so a call site gets a shape without shipping an icon set. */
function DefaultGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 14.5l3.2-3.4 2.5 2.4L17 9" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/**
 * Nothing to show, said properly.
 *
 * `Unsupported` covers exactly one cause — the provider cannot answer the
 * query — and every other empty result was left to each call site, which is
 * how a dashboard ends up with five different ways of saying "no data". This
 * carries the four things an empty state owes the reader: what is missing, why,
 * a mark to make it read as deliberate, and the way out.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  variant = "panel",
  className,
}: {
  title: string;
  /** Why it is empty, and what would fill it. */
  description?: string;
  /** Defaults to a neutral mark; pass `null` to drop it entirely. */
  icon?: ReactNode | null;
  /** The way out — a button, a link, a range reset. */
  action?: ReactNode;
  /**
   * `panel` centres it in a bordered card, for a whole widget body. `dashed`
   * does the same with a dashed edge, which reads as a slot waiting to be
   * filled rather than a failure. `inline` is a single left-aligned row for a
   * table or list body. `compact` is the smallest form, for a metric tile.
   */
  variant?: EmptyStateVariant;
  className?: string;
}) {
  const showIcon = icon !== null && variant !== "compact";
  return (
    <div className={cn("ak-empty", `ak-empty-${variant}`, className)}>
      {showIcon ? <span className="ak-empty-icon">{icon ?? <DefaultGlyph />}</span> : null}
      <div className="ak-empty-body">
        <p className="ak-empty-title">{title}</p>
        {description ? <p className="ak-empty-desc">{description}</p> : null}
      </div>
      {action ? <div className="ak-empty-action">{action}</div> : null}
    </div>
  );
}

export { EMPTY_STATE_VARIANTS };
export type { EmptyStateVariant };

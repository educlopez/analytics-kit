import { useEffect, useState, type ReactNode } from "react";
import type { QueryStatus } from "../hooks.js";

/** Shapes the loading skeleton so it matches the widget's real layout and avoids layout shift. */
export type WidgetKind = "metric" | "chart" | "list" | "table" | "donut" | "tracker";

export interface WidgetFrameProps {
  title: string;
  description?: string;
  status: QueryStatus;
  missing?: string[];
  error?: Error;
  span?: number;
  className?: string;
  children?: ReactNode;
  trailing?: ReactNode;
  /** Loading skeleton shape. Defaults to the compact "metric" layout. */
  kind?: WidgetKind;
  /** True when `children` render sample/mock data instead of a live result. */
  sample?: boolean;
  /** Shown as a "Retry" action on the error state, when provided. */
  onRetry?: () => void;
  /** Rows the real list/table will render, so the skeleton reserves the same height. */
  rows?: number;
  /** Cells the real tracker will render, one per bucket in the active range. */
  cells?: number;
  /**
   * Heading level for the title, 2-6.
   *
   * A widget cannot know where it sits in the host's outline. Inside a
   * dashboard `h3` is right; dropped straight under a page's `h1` it skips a
   * level, which is a real accessibility defect and not a cosmetic one. The
   * default keeps existing markup unchanged.
   */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

export function WidgetFrame({
  title,
  description,
  status,
  missing = [],
  error,
  span,
  className,
  children,
  trailing,
  kind = "metric",
  sample = false,
  onRetry,
  rows,
  cells,
  headingLevel = 3,
}: WidgetFrameProps) {
  const Heading = `h${headingLevel}` as const;
  const slow = useSlowLoading(status === "loading");
  const pending = status === "loading" || status === "idle";

  return (
    <section
      className={["ak-widget", className].filter(Boolean).join(" ")}
      data-ak-status={status}
      data-ak-sample={sample ? "true" : undefined}
      style={span ? { gridColumn: `span ${span}` } : undefined}
    >
      <header className="ak-widget-header">
        <div>
          <Heading className="ak-widget-title">
            {title}
            {sample ? (
              <span className="ak-sample-badge">
                Sample
                <span className="ak-sr-only"> data, not this site&rsquo;s real numbers</span>
              </span>
            ) : null}
          </Heading>
          {description ? <p className="ak-widget-desc">{description}</p> : null}
        </div>
        {trailing}
      </header>
      {/* Sighted users read the state from the skeleton or the error card; without a
          live region nobody else is told the widget ever resolved. */}
      <div className="ak-widget-body" aria-busy={pending} aria-live="polite">
        {pending ? <Skeleton kind={kind} slow={slow} rows={rows} cells={cells} /> : null}
        {status === "unsupported" ? <Unsupported missing={missing} /> : null}
        {status === "error" ? <ErrorState error={error} onRetry={onRetry} /> : null}
        {status === "success" ? children : null}
      </div>
    </section>
  );
}

/** Flags a loading state that's taking longer than usual, without adding motion. */
function useSlowLoading(active: boolean, delayMs = 4000): boolean {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!active) {
      setSlow(false);
      return;
    }
    const id = setTimeout(() => setSlow(true), delayMs);
    return () => clearTimeout(id);
  }, [active, delayMs]);

  return slow;
}

export function Skeleton({
  kind = "metric",
  slow = false,
  rows,
  cells,
}: {
  kind?: WidgetKind;
  slow?: boolean;
  rows?: number;
  cells?: number;
}) {
  return (
    <div className="ak-skeleton-wrap">
      {/* Only the placeholder shapes are decorative. The slow-load note has to stay
          readable, since a stalled load is exactly when it matters most. */}
      <div aria-hidden="true">
        <SkeletonShape kind={kind} rows={rows} cells={cells} />
      </div>
      {slow ? <p className="ak-skel-note ak-muted">Still loading…</p> : null}
    </div>
  );
}

function SkeletonShape({ kind, rows, cells }: { kind: WidgetKind; rows?: number; cells?: number }) {
  if (kind === "chart") {
    return (
      <div className="ak-skeleton ak-skel-chart">
        <div className="ak-skel-line ak-skel-lg" />
        <div className="ak-skel-block" />
      </div>
    );
  }
  if (kind === "donut") {
    // PieChart stacks a full-width chart above the legend, so the skeleton has to
    // stack too — a side-by-side ring would preview a layout that never renders.
    return (
      <div className="ak-skeleton ak-skel-donut">
        <div className="ak-skel-ring" />
        <div className="ak-skel-legend">
          {Array.from({ length: Math.max(1, rows ?? 3) }, (_, i) => (
            <div key={i} className="ak-skel-line" />
          ))}
        </div>
      </div>
    );
  }
  if (kind === "tracker") {
    return (
      <div className="ak-skeleton ak-skel-tracker">
        {Array.from({ length: Math.max(1, cells ?? 28) }, (_, i) => (
          <span key={i} className="ak-skel-cell" />
        ))}
      </div>
    );
  }
  if (kind === "table" || kind === "list") {
    return (
      <div className="ak-skeleton ak-skel-rows">
        {Array.from({ length: Math.max(1, rows ?? 5) }, (_, i) => (
          <div key={i} className="ak-skel-row">
            <div className="ak-skel-line ak-skel-row-label" />
            <div className="ak-skel-line ak-skel-row-value" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="ak-skeleton">
      <div className="ak-skel-line ak-skel-lg" />
      <div className="ak-skel-line" />
    </div>
  );
}

export function Unsupported({ missing }: { missing: string[] }) {
  return (
    <div className="ak-unsupported">
      <p>Not available with this analytics provider.</p>
      {missing.length ? <p className="ak-muted">Missing: {missing.join(", ")}</p> : null}
    </div>
  );
}

/** Raw provider messages leak internals and read nothing like the rest of the UI. */
function errorCopy(error?: Error): string {
  const code = (error as { code?: string } | undefined)?.code;
  if (code === "AUTH") return "The provider rejected these credentials.";
  if (code === "RATE_LIMIT") return "The provider is rate-limiting this dashboard.";
  if (code === "NETWORK") return "Could not reach the provider.";
  if (code === "PROVIDER") return "The provider could not answer this query.";
  return "Could not load analytics.";
}

function ErrorState({ error, onRetry }: { error?: Error; onRetry?: () => void }) {
  return (
    <div className="ak-error" role="alert">
      <p className="ak-muted">{errorCopy(error)}</p>
      {onRetry ? (
        <button type="button" className="ak-retry" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function MetricValue({
  value,
  label,
  delta,
}: {
  value: string;
  label?: string;
  delta?: { text: string; positive: boolean } | null;
}) {
  return (
    <div className="ak-metric">
      <div className="ak-metric-value">{value}</div>
      <div className="ak-metric-meta">
        {label ? <span className="ak-muted">{label}</span> : null}
        {delta ? (
          <span className={delta.positive ? "ak-delta-up" : "ak-delta-down"}>{delta.text}</span>
        ) : null}
      </div>
    </div>
  );
}

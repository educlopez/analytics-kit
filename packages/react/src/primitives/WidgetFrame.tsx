import type { ReactNode } from "react";
import type { QueryStatus } from "../hooks.js";

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
}: WidgetFrameProps) {
  return (
    <section
      className={["ak-widget", className].filter(Boolean).join(" ")}
      data-ak-status={status}
      style={span ? { gridColumn: `span ${span}` } : undefined}
    >
      <header className="ak-widget-header">
        <div>
          <h3 className="ak-widget-title">{title}</h3>
          {description ? <p className="ak-widget-desc">{description}</p> : null}
        </div>
        {trailing}
      </header>
      <div className="ak-widget-body">
        {status === "loading" || status === "idle" ? <Skeleton /> : null}
        {status === "unsupported" ? <Unsupported missing={missing} /> : null}
        {status === "error" ? (
          <p className="ak-muted">{error?.message ?? "Could not load analytics."}</p>
        ) : null}
        {status === "success" ? children : null}
      </div>
    </section>
  );
}

export function Skeleton() {
  return (
    <div className="ak-skeleton" aria-hidden="true">
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

import { formatNumber } from "./chart.js";

/**
 * Usage against a ceiling.
 *
 * None of the cartesian marks express a *limit* — they express a quantity. A
 * metered product needs the ceiling to be part of the drawing, not a caption.
 */
export function QuotaBar({
  used,
  limit,
  label,
  projected,
  resetsIn,
  className,
}: {
  used: number;
  limit: number;
  label?: string;
  /** Expected usage by the end of the period, drawn as a ghost extension. */
  projected?: number;
  /** Free-text countdown, e.g. "26 days". */
  resetsIn?: string;
  className?: string;
}) {
  if (limit <= 0) return <p className="ak-muted">A quota needs a positive limit.</p>;

  const share = used / limit;
  const over = share > 1;
  // The track is scaled to whichever is larger, so going over the limit stays
  // visible instead of silently pinning at 100%.
  const ceiling = Math.max(limit, used, projected ?? 0);
  const pct = (value: number) => `${(value / ceiling) * 100}%`;
  const ghost = projected != null && projected > used ? projected : null;

  return (
    <div className={className}>
      <div className="ak-quota-head">
        <span className="ak-quota-label">{label ?? "Usage"}</span>
        <span className="ak-quota-count">
          {formatNumber(used)} of {formatNumber(limit)}
        </span>
      </div>
      <div
        className="ak-quota-track"
        role="progressbar"
        aria-valuenow={Math.round(share * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Usage"}
      >
        {ghost ? <span className="ak-quota-ghost" style={{ width: pct(ghost) }} /> : null}
        <span
          className={over ? "ak-quota-fill ak-quota-over" : "ak-quota-fill"}
          style={{ width: pct(used) }}
        />
        <span className="ak-quota-limit" style={{ left: pct(limit) }} />
      </div>
      <div className="ak-quota-foot">
        <span>{Math.round(share * 100)}% used</span>
        {resetsIn ? <span>Resets in {resetsIn}</span> : null}
      </div>
    </div>
  );
}

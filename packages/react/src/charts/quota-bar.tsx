import { formatNumber } from "./chart.js";
import { QUOTA_BAR_VARIANTS, type QuotaBarVariant } from "./variants.js";

const SEGMENTS = 20;
const STEP_MARKS = [0.25, 0.5, 0.75];

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
  variant = "bar",
  className,
}: {
  used: number;
  limit: number;
  label?: string;
  /** Expected usage by the end of the period, drawn as a ghost extension. */
  projected?: number;
  /** Free-text countdown, e.g. "26 days". */
  resetsIn?: string;
  /**
   * `bar` is one continuous track. `segments` meters it into discrete blocks,
   * the way a plan allowance is usually read. `steps` keeps the track but adds
   * quarter marks. `compact` drops the header and footer so the bar fits inside
   * a metric card.
   */
  variant?: QuotaBarVariant;
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
  const compact = variant === "compact";

  return (
    <div className={className}>
      {compact ? null : (
        <div className="ak-quota-head">
          <span className="ak-quota-label">{label ?? "Usage"}</span>
          <span className="ak-quota-count">
            {formatNumber(used)} of {formatNumber(limit)}
          </span>
        </div>
      )}
      {variant === "segments" ? (
        <div
          className="ak-quota-segments"
          role="progressbar"
          aria-valuenow={Math.round(share * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label ?? "Usage"}
        >
          {Array.from({ length: SEGMENTS }, (_, index) => {
            // A block lights up once usage passes its right edge, so a
            // part-filled allowance never reads as a full one.
            const edge = ((index + 1) / SEGMENTS) * ceiling;
            const filled = used >= edge;
            const projectedOnly = !filled && ghost != null && ghost >= edge;
            const beyondLimit = edge > limit;
            return (
              <span
                key={index}
                className={[
                  "ak-quota-segment",
                  filled ? "ak-quota-segment-on" : "",
                  projectedOnly ? "ak-quota-segment-ghost" : "",
                  filled && beyondLimit ? "ak-quota-over" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            );
          })}
        </div>
      ) : (
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
          {variant === "steps"
            ? STEP_MARKS.map((mark) => (
                <span
                  key={mark}
                  className="ak-quota-step"
                  style={{ left: `${(mark * limit * 100) / ceiling}%` }}
                />
              ))
            : null}
          <span className="ak-quota-limit" style={{ left: pct(limit) }} />
        </div>
      )}
      {compact ? (
        <div className="ak-quota-foot">
          <span>
            {formatNumber(used)} / {formatNumber(limit)}
          </span>
          <span>{Math.round(share * 100)}%</span>
        </div>
      ) : (
        <div className="ak-quota-foot">
          <span>{Math.round(share * 100)}% used</span>
          {resetsIn ? <span>Resets in {resetsIn}</span> : null}
        </div>
      )}
    </div>
  );
}

export { QUOTA_BAR_VARIANTS };
export type { QuotaBarVariant };

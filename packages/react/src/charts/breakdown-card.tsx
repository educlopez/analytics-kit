import type { ReactNode } from "react";
import { formatNumber } from "./chart.js";
import { BREAKDOWN_CARD_VARIANTS, type BreakdownCardVariant } from "./variants.js";

export interface BreakdownCardRow {
  key: string;
  label?: string;
  value: number;
  /**
   * A second value column. Providers that separate uniques from raw counts
   * report both, and showing one without the other is the classic dashboard
   * ambiguity.
   */
  secondary?: number;
  /** Leading mark: a flag, a favicon, a provider glyph. */
  icon?: ReactNode;
}

export interface BreakdownCardTab {
  id: string;
  label: string;
}

/**
 * A breakdown as a card: header, optional dimension tabs, rows carrying their
 * own magnitude, and the affordances a real provider panel has.
 *
 * The list marks (`RankedList`, `BarList`) draw rows and nothing else — the
 * card, the tabs and the overflow affordances were always left to the host to
 * rebuild. Every capability here is a prop, so a panel can start as bare rows
 * and grow into the full thing without changing component.
 */
export function BreakdownCard({
  rows,
  title,
  tabs,
  activeTab,
  onTabChange,
  valueLabel = "Visitors",
  secondaryLabel,
  display = "value",
  variant = "bars",
  fadeLast = false,
  onExpand,
  expandLabel = "Show all",
  actions,
  emptyLabel = "No breakdown data.",
  className,
}: {
  rows: BreakdownCardRow[];
  /** Header text. Ignored when `tabs` is given — the tabs are the header. */
  title?: string;
  /** Dimension switcher. Rendered as a tablist; the host owns the state. */
  tabs?: BreakdownCardTab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  /** Right-aligned column heading for `value`. */
  valueLabel?: string;
  /** Right-aligned column heading for `secondary`. Omit to hide the column. */
  secondaryLabel?: string;
  /** `value` prints the number, `share` its percentage, `both` prints each. */
  display?: "value" | "share" | "both";
  /**
   * `bars` puts the magnitude behind the label. `split` moves it to its own
   * track under the label. `plain` drops it, for a dense list where the numbers
   * carry the comparison. `heat` tints the whole row instead of measuring it,
   * which survives a narrow column that a bar cannot.
   */
  variant?: BreakdownCardVariant;
  /** Fade the last row, the honest signal that the list is truncated. */
  fadeLast?: boolean;
  /** Adds the expand affordance under the rows. */
  onExpand?: () => void;
  expandLabel?: string;
  /** Toolbar revealed on hover/focus of the card. */
  actions?: ReactNode;
  emptyLabel?: string;
  className?: string;
}) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const max = Math.max(...rows.map((row) => row.value), 1);
  const showSecondary = secondaryLabel != null;

  return (
    <div className={`ak-bcard${className ? ` ${className}` : ""}`}>
      <div className="ak-bcard-head">
        {tabs?.length ? (
          <div className="ak-bcard-tabs" role="tablist" aria-label={title ?? "Dimension"}>
            {tabs.map((tab) => {
              const selected = tab.id === (activeTab ?? tabs[0]?.id);
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={selected ? "ak-bcard-tab is-active" : "ak-bcard-tab"}
                  onClick={() => onTabChange?.(tab.id)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="ak-bcard-title">{title}</p>
        )}
        <div className="ak-bcard-cols">
          <span>{valueLabel}</span>
          {showSecondary ? <span>{secondaryLabel}</span> : null}
        </div>
      </div>

      {rows.length ? (
        <>
          <ul className={`ak-bcard-rows ak-bcard-${variant}`}>
            {rows.map((row, index) => {
              const share = total > 0 ? row.value / total : 0;
              const last = index === rows.length - 1;
              return (
                <li
                  key={row.key}
                  className={`ak-bcard-row${fadeLast && last ? " is-faded" : ""}`}
                  // `heat` has no bar to read, so the row's own tint carries the
                  // magnitude and has to scale with it.
                  style={variant === "heat" ? { opacity: 0.45 + share * 0.55 } : undefined}
                >
                  <span className="ak-bcard-main">
                    {variant === "bars" ? (
                      <span
                        className="ak-bcard-fill"
                        style={{ width: `${(row.value / max) * 100}%` }}
                        aria-hidden="true"
                      />
                    ) : null}
                    {row.icon ? <span className="ak-bcard-icon">{row.icon}</span> : null}
                    <span className="ak-bcard-label" title={row.label ?? row.key}>
                      {row.label ?? row.key}
                    </span>
                  </span>
                  {variant === "split" ? (
                    <span className="ak-bcard-track" aria-hidden="true">
                      <span
                        className="ak-bcard-track-fill"
                        style={{ width: `${(row.value / max) * 100}%` }}
                      />
                    </span>
                  ) : null}
                  <span className="ak-bcard-values">
                    {display !== "value" ? (
                      <b className="ak-bcard-share">{Math.round(share * 100)}%</b>
                    ) : null}
                    {display !== "share" ? (
                      <b className="ak-bcard-value">{formatNumber(row.value)}</b>
                    ) : null}
                    {showSecondary ? (
                      <b className="ak-bcard-secondary">
                        {row.secondary == null ? "—" : formatNumber(row.secondary)}
                      </b>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
          {onExpand ? (
            <div className="ak-bcard-expand">
              <button type="button" onClick={onExpand}>
                {expandLabel}
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <p className="ak-muted">{emptyLabel}</p>
      )}

      {actions ? <div className="ak-bcard-actions">{actions}</div> : null}
    </div>
  );
}

export { BREAKDOWN_CARD_VARIANTS };
export type { BreakdownCardVariant };

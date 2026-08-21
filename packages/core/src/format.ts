import { getMetric, type MetricId } from "./metrics.js";

export function formatMetric(id: MetricId, value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  const def = getMetric(id);
  const unit = def?.unit;
  if (unit === "percent") return `${formatNumber(value, value >= 10 ? 0 : 1)}%`;
  if (unit === "seconds") return formatDuration(value);
  if (unit === "usd") return formatCurrency(value);
  return formatNumber(value, def?.kind === "ratio" ? 2 : 0);
}

export function formatNumber(value: number, digits = 0): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 10_000) return `${(value / 1_000).toFixed(1)}k`;
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits && abs < 10 ? digits : 0,
  }).format(value);
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const rem = Math.round(seconds % 60);
  if (minutes < 60) return rem ? `${minutes}m ${rem}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const min = minutes % 60;
  return min ? `${hours}h ${min}m` : `${hours}h`;
}

export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
}

export function formatDelta(percent: number | null): string {
  if (percent == null) return "—";
  const rounded = Math.abs(percent) >= 10 ? percent.toFixed(0) : percent.toFixed(1);
  const sign = percent > 0 ? "+" : "";
  return `${sign}${rounded}%`;
}

export const DATE_RANGE_PRESETS = [
  "today",
  "24h",
  "7d",
  "28d",
  "30d",
  "90d",
  "12mo",
  "month",
  "year",
] as const;

export type DateRangePreset = (typeof DATE_RANGE_PRESETS)[number];

export type DateRangeInput = DateRangePreset | { from: string | Date; to: string | Date };

export interface AbsoluteRange {
  from: Date;
  to: Date;
  preset?: DateRangePreset;
}

const DAY_MS = 86_400_000;

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function endOfDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999),
  );
}

export function resolveRange(input: DateRangeInput, now = new Date()): AbsoluteRange {
  if (typeof input !== "string") {
    return {
      from: input.from instanceof Date ? input.from : new Date(input.from),
      to: input.to instanceof Date ? input.to : new Date(input.to),
    };
  }

  const end = endOfDay(now);
  const today = startOfDay(now);

  switch (input) {
    case "today":
      return { from: today, to: end, preset: input };
    case "24h":
      return { from: new Date(now.getTime() - DAY_MS), to: now, preset: input };
    case "7d":
      return { from: startOfDay(new Date(today.getTime() - 6 * DAY_MS)), to: end, preset: input };
    case "28d":
      return { from: startOfDay(new Date(today.getTime() - 27 * DAY_MS)), to: end, preset: input };
    case "30d":
      return { from: startOfDay(new Date(today.getTime() - 29 * DAY_MS)), to: end, preset: input };
    case "90d":
      return { from: startOfDay(new Date(today.getTime() - 89 * DAY_MS)), to: end, preset: input };
    case "12mo": {
      const from = new Date(
        Date.UTC(today.getUTCFullYear() - 1, today.getUTCMonth(), today.getUTCDate()),
      );
      return { from, to: end, preset: input };
    }
    case "month":
      return {
        from: new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)),
        to: end,
        preset: input,
      };
    case "year":
      return {
        from: new Date(Date.UTC(today.getUTCFullYear(), 0, 1)),
        to: end,
        preset: input,
      };
    default:
      return { from: startOfDay(new Date(today.getTime() - 6 * DAY_MS)), to: end, preset: "7d" };
  }
}

export function previousRange(range: AbsoluteRange): AbsoluteRange {
  const duration = range.to.getTime() - range.from.getTime();
  return {
    from: new Date(range.from.getTime() - duration - 1),
    to: new Date(range.from.getTime() - 1),
  };
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function enumerateDays(from: Date, to: Date): string[] {
  const days: string[] = [];
  const cursor = startOfDay(from);
  const last = startOfDay(to);
  while (cursor.getTime() <= last.getTime()) {
    days.push(toIsoDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

export function defaultGranularity(range: AbsoluteRange): "hour" | "day" | "week" | "month" {
  const days = (range.to.getTime() - range.from.getTime()) / DAY_MS;
  if (days <= 2) return "hour";
  if (days <= 90) return "day";
  if (days <= 366) return "week";
  return "month";
}

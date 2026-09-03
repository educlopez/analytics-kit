import { PROVIDER_MARKS } from "./provider-marks";
import { cn } from "@/utils/cn";

/**
 * A provider's brand mark, drawn in `currentColor` so a row of them reads as
 * one set instead of six different brand palettes. Falls back to nothing when
 * an id has no mark — "Mock" is ours, not a vendor.
 */
export function ProviderMark({ id, className }: { id: string; className?: string }) {
  const mark = PROVIDER_MARKS[id];
  if (!mark) return null;
  return (
    <svg
      viewBox={mark.viewBox}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={mark.label}
    >
      <path d={mark.path} />
    </svg>
  );
}

/** Mark plus name, for lists where the name still has to be readable. */
export function ProviderBadge({
  id,
  label,
  className,
  markClassName,
}: {
  id: string;
  label?: string;
  className?: string;
  markClassName?: string;
}) {
  const mark = PROVIDER_MARKS[id];
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <ProviderMark id={id} className={cn("size-4 shrink-0", markClassName)} />
      <span>{label ?? mark?.label ?? id}</span>
    </span>
  );
}

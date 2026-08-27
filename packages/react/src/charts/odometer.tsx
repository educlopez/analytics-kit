"use client";

import { useEffect, useRef, useState } from "react";
import { formatNumber } from "./chart.js";

/**
 * A number that rolls to its new value instead of being replaced.
 *
 * Reads as live rather than re-rendered. Tabular figures throughout, so the
 * width never changes mid-roll and nothing around it reflows.
 */
export function Odometer({
  value,
  duration = 600,
  className,
}: {
  value: number;
  /** Roll time in ms. Ignored under prefers-reduced-motion. */
  duration?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(value);
  const frame = useRef<number | null>(null);
  const from = useRef(value);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced || duration <= 0) {
      setShown(value);
      return;
    }

    // Animate from what is on screen, not from the previous prop: a change
    // arriving mid-roll continues from where the digits actually are.
    const start = performance.now();
    const origin = from.current;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // Ease-out: fast commitment, gentle settle. No overshoot — nothing here
      // was flicked.
      const eased = 1 - Math.pow(1 - t, 3);
      const next = origin + (value - origin) * eased;
      setShown(next);
      from.current = next;
      if (t < 1) frame.current = requestAnimationFrame(step);
    };

    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current != null) cancelAnimationFrame(frame.current);
    };
  }, [value, duration]);

  return (
    <span className={className ? `ak-odometer ${className}` : "ak-odometer"}>
      {formatNumber(shown)}
    </span>
  );
}

"use client";

import { useState } from "react";
import { RiEqualizer2Line, RiRefreshLine, RiSidebarUnfoldLine } from "@remixicon/react";
import { DialRoot } from "dialkit";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import * as Button from "@/components/ui/button";
import type { AnalyticsTheme } from "@analytics-kit/react";
import { cn } from "@/utils/cn";
import "dialkit/styles.css";

const PANEL_WIDTH = 328;

/**
 * The knobs sit beside the preview rather than under it, so a change and its
 * effect are visible at once. The column collapses to a single button because
 * the preview is the point on a narrow desktop window; below `xl` the panel
 * stacks under the preview instead, where a 328px sidebar would squeeze the
 * chart to nothing.
 */
export function ControlPanel({
  open,
  onOpenChange,
  onReset,
  dirty,
  theme,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReset: () => void;
  dirty: boolean;
  theme: AnalyticsTheme;
}) {
  const reduceMotion = useReducedMotion();
  // The width animation needs a clipping box; an open select dropdown needs
  // there to be none. So the clip exists only while the width is moving.
  const [animating, setAnimating] = useState(false);
  const transition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, visualDuration: 0.34, bounce: 0.18 };

  // Default (sync) mode on purpose: `popLayout` takes the exiting panel out of
  // flow, which drops it out of the clipping box and lets it sweep across the
  // props table on the way out.
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.aside
          key="panel"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: PANEL_WIDTH, opacity: 1 }}
          exit={{ width: 0, opacity: 0, pointerEvents: "none" }}
          transition={transition}
          onAnimationStart={() => setAnimating(true)}
          onAnimationComplete={() => setAnimating(false)}
          className={cn(
            "mt-8 shrink-0 self-start xl:mt-0 xl:pt-14",
            animating ? "overflow-hidden" : "overflow-visible",
          )}
          aria-label="Customize"
        >
          <div style={{ width: PANEL_WIDTH }} className="ak-dial-sticky flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-subheading-xs text-text-soft-400 uppercase">Customize</span>
              <div className="flex items-center gap-1.5">
                {dirty ? (
                  <Button.Root
                    variant="neutral"
                    mode="stroke"
                    size="xxsmall"
                    className="rounded-10 cursor-pointer"
                    onClick={onReset}
                  >
                    <Button.Icon as={RiRefreshLine} />
                    Reset
                  </Button.Root>
                ) : null}
                <Button.Root
                  variant="neutral"
                  mode="ghost"
                  size="xxsmall"
                  className="rounded-10 cursor-pointer"
                  onClick={() => onOpenChange(false)}
                >
                  <Button.Icon as={RiSidebarUnfoldLine} />
                  Hide
                </Button.Root>
              </div>
            </div>
            {/* Deliberately no frame, no height cap and no scroller: DialKit
                draws its own card, hugs its controls, and renders its select
                dropdowns as children — so any overflow box of ours clipped the
                open option list. Height is handled by `.ak-dial-sticky` in
                site.css instead. */}
            <DialRoot mode="inline" theme={theme} productionEnabled />
          </div>
        </motion.aside>
      ) : (
        <motion.div
          key="toggle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
          className="mt-8 shrink-0 self-start xl:mt-0 xl:pt-14"
        >
          <Button.Root
            variant="neutral"
            mode="stroke"
            size="xsmall"
            className="rounded-10 ak-dial-sticky cursor-pointer"
            onClick={() => onOpenChange(true)}
          >
            <Button.Icon as={RiEqualizer2Line} />
            Customize
          </Button.Root>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

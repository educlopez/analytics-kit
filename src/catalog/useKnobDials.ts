"use client";

import { useDialKitController, type DialConfig } from "dialkit";
import type { CatalogItem } from "./items";
import {
  PREVIEW_GAPS,
  PREVIEW_METRICS,
  PREVIEW_SCALES,
  defaultKnobs,
  itemControls,
  knobsEqual,
  type PreviewGaps,
  type PreviewKnobs,
  type PreviewMetric,
  type PreviewScale,
} from "./knobs";

/**
 * DialKit auto-detects a control from the shape of each config entry, so the
 * knob set is described once here rather than as a tree of JSX controls:
 * `[default, min, max, step]` becomes a slider, a boolean a toggle, and
 * `{ type: 'select' }` a dropdown.
 */
function dialConfig(item: CatalogItem): DialConfig {
  const controls = itemControls(item.slug);
  const defaults = defaultKnobs(item);
  const config: DialConfig = {};

  if (controls.variant && item.variants.length) {
    config.variant = { type: "select", options: [...item.variants], default: defaults.variant };
  }
  if (controls.metric) {
    config.metric = { type: "select", options: [...PREVIEW_METRICS], default: defaults.metric };
  }
  if (controls.height) config.height = [defaults.height, 72, 360, 8];
  if (controls.columns) config.columns = [defaults.columns, 2, 6, 1];
  if (controls.showRange) config.showRange = defaults.showRange;
  if (controls.treatments) {
    config.treatments = {
      emphasizeLast: defaults.emphasizeLast,
      previous: defaults.compare,
      annotations: defaults.annotations,
      brush: defaults.brush,
      gaps: { type: "select", options: [...PREVIEW_GAPS], default: defaults.gaps },
    };
  }
  if (controls.scale) {
    config.scale = { type: "select", options: [...PREVIEW_SCALES], default: defaults.scale };
  }

  return config;
}

type Values = Record<string, unknown>;

function bool(values: Values, key: string, fallback: boolean) {
  return typeof values[key] === "boolean" ? (values[key] as boolean) : fallback;
}

function num(values: Values, key: string, fallback: number) {
  return typeof values[key] === "number" ? (values[key] as number) : fallback;
}

function str<T extends string>(values: Values, key: string, allowed: readonly T[], fallback: T): T {
  const value = values[key];
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

/**
 * Bridges the dial panel back to the typed knob object the previews and the
 * generated usage snippet already expect. Values the current component does not
 * expose fall back to its defaults, so a config with fewer controls stays valid.
 */
export function useKnobDials(item: CatalogItem): {
  knobs: PreviewKnobs;
  dirty: boolean;
  reset: () => void;
} {
  const defaults = defaultKnobs(item);
  const controller = useDialKitController(item.title, dialConfig(item), {
    // One panel per component: switching pages must not inherit the last one's
    // values, and the slug is the only stable id available here.
    id: `catalog-${item.slug}`,
  });
  const values = controller.values as Values;
  const treatments = (values.treatments as Values | undefined) ?? {};

  const knobs: PreviewKnobs = {
    variant: str(
      values,
      "variant",
      item.variants,
      defaults.variant as (typeof item.variants)[number],
    ),
    metric: str(values, "metric", PREVIEW_METRICS, defaults.metric) as PreviewMetric,
    height: num(values, "height", defaults.height),
    columns: num(values, "columns", defaults.columns),
    showRange: bool(values, "showRange", defaults.showRange),
    emphasizeLast: bool(treatments, "emphasizeLast", defaults.emphasizeLast),
    compare: bool(treatments, "previous", defaults.compare),
    annotations: bool(treatments, "annotations", defaults.annotations),
    brush: bool(treatments, "brush", defaults.brush),
    gaps: str(treatments, "gaps", PREVIEW_GAPS, defaults.gaps) as PreviewGaps,
    scale: str(values, "scale", PREVIEW_SCALES, defaults.scale) as PreviewScale,
  };

  return {
    knobs,
    dirty: !knobsEqual(knobs, defaults),
    reset: () => controller.resetValues(),
  };
}

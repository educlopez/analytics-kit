"use client";

import { useDialKitController, type DialConfig } from "dialkit";
import {
  PREVIEW_THEME_DEFAULTS,
  PREVIEW_THEME_KEYS,
  defaultTheme,
  themeDirty,
  type PreviewTheme,
} from "./knobs";

/**
 * Only the slots the component on screen paints with. The accent stays: unlike
 * a series colour there is never a question of which thing it changes.
 */
function themeConfig(slots: number[]): DialConfig {
  const config: DialConfig = {
    accent: { type: "color", default: PREVIEW_THEME_DEFAULTS.accent },
  };
  for (const index of slots) {
    const key = `chart${index}` as keyof typeof PREVIEW_THEME_DEFAULTS;
    config[key] = { type: "color", default: PREVIEW_THEME_DEFAULTS[key] };
  }
  return config;
}

/**
 * The colour tokens, as their own panel.
 *
 * A second controller rather than a folder inside each component's panel: the
 * id is fixed instead of per-slug, so a colour picked on one component is still
 * picked on the next one. These are not that component's props — they are the
 * tokens every component reads — and giving them their own panel says so.
 */
export function useThemeDials(slots: number[]): {
  theme: PreviewTheme;
  dirty: boolean;
  reset: () => void;
} {
  const controller = useDialKitController("Colors", themeConfig(slots), {
    id: "catalog-theme",
    // Persisted, unlike the per-component knobs. A brand colour is something
    // you set once and keep; the in-memory store alone loses it on any full
    // page load, which for a statically generated site is every hard refresh.
    persist: { key: "analytics-kit-colors", storage: "localStorage" },
  });
  const values = controller.values as Record<string, unknown>;

  const theme = defaultTheme();
  for (const key of PREVIEW_THEME_KEYS) {
    const value = values[key];
    // A picker can only produce a colour string, but the store is untyped and a
    // stale persisted value would otherwise reach an inline style.
    if (typeof value === "string" && value.trim()) theme[key] = value;
  }

  return { theme, dirty: themeDirty(theme, slots), reset: () => controller.resetValues() };
}

import type { CSSProperties } from "react";

/** Named looks for every widget. Swap without rewriting charts. */
export type AnalyticsStyleName = "editorial" | "ink" | "shadcn";

export interface AnalyticsStyleTokens {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  up: string;
  down: string;
  radius: string;
  shadow: string;
  font: string;
  headingFont: string;
}

export type AnalyticsStyleOverrides = Partial<AnalyticsStyleTokens>;

export type AnalyticsTheme = "dark" | "light";

const TOKEN_TO_VAR: Record<keyof AnalyticsStyleTokens, string> = {
  bg: "--ak-bg",
  surface: "--ak-surface",
  surface2: "--ak-surface-2",
  border: "--ak-border",
  text: "--ak-text",
  muted: "--ak-muted",
  accent: "--ak-accent",
  chart1: "--ak-chart-1",
  chart2: "--ak-chart-2",
  chart3: "--ak-chart-3",
  chart4: "--ak-chart-4",
  chart5: "--ak-chart-5",
  up: "--ak-up",
  down: "--ak-down",
  radius: "--ak-radius",
  shadow: "--ak-shadow",
  font: "--ak-font",
  headingFont: "--ak-heading-font",
};

const SANS = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
const SERIF = 'Newsreader, "Times New Roman", ui-serif, Georgia, serif';
const GEIST = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

/**
 * Presets distilled from the libraries we studied:
 * - editorial: paper/ink product look (Lassie-like, current landing)
 * - ink: original Analytics Kit dashboard (cool navy surfaces)
 * - shadcn: zinc tokens that sit next to shadcn/ui + shadcn charts
 */
export const ANALYTICS_STYLES: Record<
  AnalyticsStyleName,
  Record<AnalyticsTheme, AnalyticsStyleTokens>
> = {
  editorial: {
    light: {
      bg: "#f9f8f5",
      surface: "#ffffff",
      surface2: "#f3f0e9",
      border: "#e3ddcf",
      text: "#1a1613",
      muted: "#605852",
      accent: "#1d779b",
      chart1: "#1d779b",
      chart2: "#297c3b",
      chart3: "#c45c26",
      chart4: "#7c6a4a",
      chart5: "#5b4a8a",
      up: "#297c3b",
      down: "#c23b3b",
      radius: "18px",
      shadow: "0 18px 50px rgb(18 12 8 / 0.08)",
      font: SANS,
      headingFont: SERIF,
    },
    dark: {
      bg: "#120c08",
      surface: "#241e1a",
      surface2: "#342e2b",
      border: "rgb(249 248 245 / 0.12)",
      text: "#f9f8f5",
      muted: "#cdc5b1",
      accent: "#6dc8e4",
      chart1: "#6dc8e4",
      chart2: "#6cda76",
      chart3: "#e8a15a",
      chart4: "#c4b48a",
      chart5: "#b4a7ff",
      up: "#6cda76",
      down: "#f87274",
      radius: "18px",
      shadow: "0 18px 50px rgb(0 0 0 / 0.4)",
      font: SANS,
      headingFont: SERIF,
    },
  },
  ink: {
    light: {
      bg: "#f5f7fb",
      surface: "#ffffff",
      surface2: "#eef2f7",
      border: "rgba(15, 23, 42, 0.1)",
      text: "#0f172a",
      muted: "#64748b",
      accent: "#2563eb",
      chart1: "#2563eb",
      chart2: "#0f9f6e",
      chart3: "#f59e0b",
      chart4: "#7c3aed",
      chart5: "#ef4444",
      up: "#16a34a",
      down: "#ef4444",
      radius: "18px",
      shadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
      font: SANS,
      headingFont: SANS,
    },
    dark: {
      bg: "#0b0f14",
      surface: "#141b24",
      surface2: "#1b2430",
      border: "rgba(255, 255, 255, 0.08)",
      text: "#eef3f8",
      muted: "#8b9bb0",
      accent: "#6ea8ff",
      chart1: "#6ea8ff",
      chart2: "#7ee0c6",
      chart3: "#f5c16c",
      chart4: "#b4a7ff",
      chart5: "#f07178",
      up: "#3dd68c",
      down: "#ff6b7a",
      radius: "18px",
      shadow: "0 18px 40px rgba(0, 0, 0, 0.28)",
      font: SANS,
      headingFont: SANS,
    },
  },
  shadcn: {
    light: {
      bg: "#fafafa",
      surface: "#ffffff",
      surface2: "#f4f4f5",
      border: "#e4e4e7",
      text: "#09090b",
      muted: "#71717a",
      accent: "#18181b",
      chart1: "oklch(0.646 0.222 41.116)",
      chart2: "oklch(0.6 0.118 184.704)",
      chart3: "oklch(0.398 0.07 227.392)",
      chart4: "oklch(0.828 0.189 84.429)",
      chart5: "oklch(0.769 0.188 70.08)",
      up: "#16a34a",
      down: "#dc2626",
      radius: "0.75rem",
      shadow: "0 1px 3px rgb(0 0 0 / 0.08)",
      font: GEIST,
      headingFont: GEIST,
    },
    dark: {
      bg: "#09090b",
      surface: "#18181b",
      surface2: "#27272a",
      border: "#3f3f46",
      text: "#fafafa",
      muted: "#a1a1aa",
      accent: "#e4e4e7",
      chart1: "oklch(0.488 0.243 264.376)",
      chart2: "oklch(0.696 0.17 162.48)",
      chart3: "oklch(0.769 0.188 70.08)",
      chart4: "oklch(0.627 0.265 303.9)",
      chart5: "oklch(0.645 0.246 16.439)",
      up: "#4ade80",
      down: "#f87171",
      radius: "0.75rem",
      shadow: "0 8px 24px rgb(0 0 0 / 0.4)",
      font: GEIST,
      headingFont: GEIST,
    },
  },
};

export const ANALYTICS_STYLE_META: Record<
  AnalyticsStyleName,
  { title: string; description: string }
> = {
  editorial: {
    title: "Editorial",
    description: "Stone paper, serif headings, ink buttons. The Analytics Kit landing.",
  },
  ink: {
    title: "Ink",
    description: "Cool navy surfaces. The original dashboard chrome.",
  },
  shadcn: {
    title: "shadcn",
    description: "Zinc tokens and chart-1…5 so widgets sit next to shadcn/ui.",
  },
};

export function resolveAnalyticsStyle(
  name: AnalyticsStyleName,
  theme: AnalyticsTheme,
  overrides?: AnalyticsStyleOverrides,
): AnalyticsStyleTokens {
  return { ...ANALYTICS_STYLES[name][theme], ...overrides };
}

export function tokensToCssVars(tokens: AnalyticsStyleOverrides): CSSProperties {
  const style: Record<string, string> = {};
  for (const [key, value] of Object.entries(tokens) as Array<
    [keyof AnalyticsStyleTokens, string | undefined]
  >) {
    if (!value) continue;
    style[TOKEN_TO_VAR[key]] = value;
  }
  return style as CSSProperties;
}

export const CHART_PALETTE = [
  "var(--ak-chart-1)",
  "var(--ak-chart-2)",
  "var(--ak-chart-3)",
  "var(--ak-chart-4)",
  "var(--ak-chart-5)",
] as const;

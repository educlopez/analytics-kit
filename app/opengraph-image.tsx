import { ImageResponse } from "next/og";

export const alt = "Analytics Kit — one dashboard, any analytics tool";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Deterministic sample curve. No Math.random, so the card never changes between builds. */
function curve(width: number, height: number, points = 46): string {
  const values = Array.from({ length: points }, (_, i) => {
    // Three frequencies so it reads as traffic rather than as a sine wave.
    const wave = Math.sin(i / 3.1) * 14 + Math.sin(i / 1.7) * 7 + Math.sin(i / 0.83) * 3.5;
    return 46 + wave + (i / points) * 20;
  });
  // Normalised to the real min/max rather than a guessed divisor, so the curve
  // always fills the band instead of hugging the middle.
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  return values
    .map((value, i) => {
      const x = (i / (points - 1)) * width;
      const y = height - 8 - ((value - min) / span) * (height - 16);
      return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join("");
}

export default function OpengraphImage() {
  const w = 1040;
  const h = 210;
  const line = curve(w, h);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#f9f8f5",
        padding: 72,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "#070503",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: 16, height: 16, borderRadius: 4, background: "#f9f8f5" }} />
        </div>
        <div style={{ fontSize: 30, color: "#1a1613", letterSpacing: "-0.01em" }}>
          Analytics Kit
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          style={{
            fontSize: 74,
            lineHeight: 1.05,
            letterSpacing: "-0.035em",
            color: "#1a1613",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>One dashboard.</span>
          <span>Any analytics tool.</span>
        </div>
        <div style={{ fontSize: 27, color: "#4f4843", maxWidth: 820 }}>
          Provider-agnostic React widgets. Swap Vercel, Plausible, GA4, Umami or PostHog and keep
          the same charts.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <defs>
            <linearGradient id="og-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#1d779b" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#1d779b" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${line} L${w},${h} L0,${h} Z`} fill="url(#og-fill)" />
          <path d={line} fill="none" stroke="#1d779b" strokeWidth={4} />
        </svg>
        <div style={{ display: "flex", gap: 28, fontSize: 23, color: "#4f4843" }}>
          <span>23 chart types</span>
          <span>·</span>
          <span>5 connectors</span>
          <span>·</span>
          <span>shadcn registry</span>
          <span>·</span>
          <span>MIT</span>
        </div>
      </div>
    </div>,
    size,
  );
}

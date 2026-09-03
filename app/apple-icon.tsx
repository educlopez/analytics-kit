import { ImageResponse } from "next/og";

// iOS ignores SVG icons, puts the artwork on its own rounded tile and does not
// honour transparency, so this one is a PNG on an opaque ground. White with the
// blue isotipo, which is how the mark appears in the site's own header.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
      }}
    >
      <svg width={104} height={104} viewBox="0 0 32 32" fill="#335cff">
        <g transform="translate(5.67 0) scale(0.6667)">
          <path d="m0 17.8433 30.9054-17.8433-.8189 12.6994-26.32053 15.1961z" />
          <path d="m3.76562 27.8951 21.73568-12.5492-.8189 12.6994-17.15081 9.902z" opacity="0.5" />
          <path d="m7.5293 37.9477 12.566-7.255-.8189 12.6994-7.9811 4.6079z" opacity="0.25" />
        </g>
      </svg>
    </div>,
    size,
  );
}

import { ImageResponse } from "next/og";

// iOS ignores SVG icons and puts the artwork on its own rounded tile, so this
// one is a PNG and fills the square edge to edge rather than repeating the
// favicon's corner radius.
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
        background: "#070503",
      }}
    >
      <div
        style={{
          width: 104,
          height: 104,
          borderRadius: 24,
          background: "#f9f8f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: 56, height: 56, borderRadius: 12, background: "#070503" }} />
      </div>
    </div>,
    size,
  );
}

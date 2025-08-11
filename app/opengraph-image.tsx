// app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  // Use a simple linear-gradient (the @vercel/og parser is picky with radial syntax)
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ffd6f2 0%, #ffffff 40%, #e8f1ff 100%)",
          fontSize: 96,
          fontWeight: 900,
          letterSpacing: -2,
          fontFamily:
            "Inter, system-ui, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji",
        }}
      >
        super<span style={{ color: "#ff0aa7" }}>N</span>ova2177
      </div>
    ),
    size
  );
}

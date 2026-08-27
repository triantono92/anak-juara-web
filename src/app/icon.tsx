// Next.js App Router icon — dikompilasi jadi /favicon.ico dan link icon di <head>
// Ukuran 32×32 untuk favicon browser tab.
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const STAR =
  "M16 2l3.2 9.8H29l-8.2 6 3.2 9.8L16 22.1 4 27.6l3.2-9.8L-1 12h9.8L16 2z";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          backgroundColor: "#3EA8DE",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg viewBox="-2 0 30 28" width={20} height={20}>
          <path d={STAR} fill="#F5C33B" />
        </svg>
      </div>
    ),
    { ...size },
  );
}

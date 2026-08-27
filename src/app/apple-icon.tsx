// Next.js App Router apple-icon — dikompilasi jadi apple-touch-icon (180×180)
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const STAR =
  "M90 10l21 64h67l-54 39 21 64-55-40-55 40 21-64L2 74h67L90 10z";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          backgroundColor: "#3EA8DE",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg viewBox="0 0 180 180" width={110} height={110}>
          <path d={STAR} fill="#F5C33B" />
        </svg>
      </div>
    ),
    { ...size },
  );
}

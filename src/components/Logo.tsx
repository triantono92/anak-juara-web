// Logo Anak Juara — sesuai spesifikasi branding di README.md
//
// variant "light" (default): kotak brand-blue + bintang kuning + wordmark ANAK/JUARA
// variant "dark": pill navy + bintang kuning + teks "Anak Juara" putih (untuk background gelap)

const STAR_PATH =
  "M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z";

export function Logo({
  size = "md",
  variant = "light",
}: {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
}) {
  const boxSize = { sm: 32, md: 44, lg: 60 }[size];
  const starSize = Math.round(boxSize * 0.52);
  const textPx = { sm: 11, md: 14, lg: 19 }[size];
  const gap = { sm: 6, md: 8, lg: 10 }[size];

  if (variant === "dark") {
    // Pill navy: ikon bintang kecil + teks "Anak Juara" putih — satu baris
    const pillH = { sm: 28, md: 36, lg: 48 }[size];
    const pillPx = { sm: 10, md: 14, lg: 18 }[size];
    const starSzD = Math.round(pillH * 0.44);
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: pillPx * 0.6,
          backgroundColor: "#17395B",
          borderRadius: 999,
          height: pillH,
          paddingLeft: pillPx,
          paddingRight: pillPx,
        }}
      >
        <svg viewBox="0 0 24 24" width={starSzD} height={starSzD} fill="#F5C33B">
          <path d={STAR_PATH} />
        </svg>
        <span
          style={{
            fontFamily: "var(--font-baloo), sans-serif",
            fontWeight: 700,
            fontSize: textPx,
            color: "#ffffff",
            lineHeight: 1,
            letterSpacing: "0.01em",
          }}
        >
          Anak Juara
        </span>
      </div>
    );
  }

  // Variant light: kotak brand-blue radius 20px + bintang + wordmark bertumpuk
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap }}>
      {/* Kotak logo */}
      <div
        style={{
          width: boxSize,
          height: boxSize,
          backgroundColor: "#3EA8DE",
          borderRadius: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg viewBox="0 0 24 24" width={starSize} height={starSize} fill="#F5C33B">
          <path d={STAR_PATH} />
        </svg>
      </div>
      {/* Wordmark bertumpuk */}
      <div style={{ lineHeight: 1, display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontFamily: "var(--font-baloo), sans-serif",
            fontWeight: 600,
            fontSize: textPx,
            color: "#527193",
            lineHeight: 1.15,
          }}
        >
          ANAK
        </span>
        <span
          style={{
            fontFamily: "var(--font-baloo), sans-serif",
            fontWeight: 800,
            fontSize: textPx,
            color: "#F58634",
            lineHeight: 1.15,
          }}
        >
          JUARA
        </span>
      </div>
    </div>
  );
}

import type { MissionKategori } from "@/lib/types";

const KATEGORI_CONFIG: Record<MissionKategori, { bg: string; text: string; abbr: string }> = {
  Ibadah:  { bg: "#C8F0E5", text: "#1F8F76", abbr: "IB" },
  Belajar: { bg: "#E2D9FB", text: "#6B4FD1", abbr: "BL" },
  Rumah:   { bg: "#FFD9B8", text: "#C25E12", abbr: "RH" },
  Sehat:   { bg: "#BFE4F7", text: "#1B7FB8", abbr: "SH" },
  Sekolah: { bg: "#FFE9B0", text: "#8A6100", abbr: "SK" },
  Netral:  { bg: "#EEF3F7", text: "#8AA3BB", abbr: "NT" },
};

export function CategoryIcon({
  kategori,
  size = 40,
}: {
  kategori: MissionKategori;
  size?: number;
}) {
  const cfg = KATEGORI_CONFIG[kategori] ?? KATEGORI_CONFIG.Netral;
  return (
    <div
      className="rounded-xl flex items-center justify-center font-display font-bold flex-shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: cfg.bg,
        color: cfg.text,
        fontSize: size * 0.3,
      }}
    >
      {cfg.abbr}
    </div>
  );
}

export function getCategoryConfig(kategori: MissionKategori) {
  return KATEGORI_CONFIG[kategori] ?? KATEGORI_CONFIG.Netral;
}

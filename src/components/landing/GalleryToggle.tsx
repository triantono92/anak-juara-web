"use client";

import { useState } from "react";

const ANAK_CARDS = [
  {
    icon: "🏠",
    title: "Dashboard",
    desc: "Sapaan, saldo bintang, rentetan hari, progres misi hari ini, dan peringatan misi terlambat.",
    points: [
      "Statistik bintang/rentetan/level",
      "Kartu merah untuk misi lewat batas",
      "Target hadiah terdekat",
    ],
    color: "#1B7FB8",
    softBg: "#BFE4F7",
  },
  {
    icon: "✅",
    title: "Misi",
    desc: "Daftar misi hari ini per kategori, dengan tombol selesai dan pengiriman bukti foto.",
    points: [
      "Tab hari ini & riwayat 30 hari",
      "Filter kategori: ibadah, belajar, rumah",
      "Kirim bukti foto untuk misi tertentu",
    ],
    color: "#1F8F76",
    softBg: "#C8F0E5",
  },
  {
    icon: "📅",
    title: "Jadwal kegiatan",
    desc: "Timeline dari subuh sampai waktu tidur, lengkap dengan status Selesai, Sekarang, dan Nanti.",
    points: [
      "Tujuh hari, jadwal sekolah & akhir pekan",
      "Blok waktu tertaut ke misi berpoin",
      "Bonus bintang bila semua tepat waktu",
    ],
    color: "#6B4FD1",
    softBg: "#E2D9FB",
  },
  {
    icon: "🎁",
    title: "Hadiah & rapor",
    desc: "Toko hadiah dengan harga bintang, plus rapor mingguan yang mudah dibaca anak.",
    points: [
      "Status hadiah: tukar/diproses/terkunci",
      "Bar bintang per hari",
      "Nilai A–C per kategori",
    ],
    color: "#C25E12",
    softBg: "#FFD9B8",
  },
];

const ORTU_CARDS = [
  {
    icon: "✔️",
    title: "Persetujuan",
    desc: "Satu antrean untuk bukti misi, permintaan tukar hadiah, dan anggota keluarga baru.",
    points: [
      "Lihat foto bukti sebelum menyetujui",
      "Tolak atau setujui sekali ketuk",
      "Opsi setujui otomatis untuk misi tanpa bukti",
    ],
    color: "#1B7FB8",
    softBg: "#BFE4F7",
  },
  {
    icon: "📋",
    title: "Master misi",
    desc: "Buat dan ubah misi: nama, poin, jadwal harian atau mingguan, anak yang kena, wajib bukti.",
    points: [
      "Ubah lewat panel geser, tanpa pindah halaman",
      "Aktif/nonaktif per misi",
      "Statistik poin rata-rata otomatis",
    ],
    color: "#1F8F76",
    softBg: "#C8F0E5",
  },
  {
    icon: "🗓️",
    title: "Master jadwal & hadiah",
    desc: "Susun blok waktu tiap anak per hari dan kelola katalog hadiah beserta stoknya.",
    points: [
      "Salin jadwal Senin ke Selasa–Jumat",
      "Tautkan blok waktu ke misi",
      "Batas penukaran per minggu",
    ],
    color: "#6B4FD1",
    softBg: "#E2D9FB",
  },
  {
    icon: "👨‍👩‍👧",
    title: "Anggota & laporan",
    desc: "Kelola anak, Ayah, Bunda, dan wali; baca tren bulanan beserta ringkasan otomatis.",
    points: [
      "Undangan Ayah, Bunda, dan Wali lewat email",
      "Heatmap konsistensi 28 hari",
      "Unduh PDF atau kirim ke anak",
    ],
    color: "#C25E12",
    softBg: "#FFD9B8",
  },
];

export function GalleryToggle() {
  const [tab, setTab] = useState<"anak" | "ortu">("anak");
  const cards = tab === "anak" ? ANAK_CARDS : ORTU_CARDS;

  return (
    <div>
      {/* Toggle pill */}
      <div className="flex justify-center mb-8">
        <div
          className="inline-flex bg-white rounded-2xl p-1 gap-1"
          style={{ border: "2px solid #E1EAF2", boxShadow: "0 2px 0 #E9EFF5" }}
        >
          <button
            onClick={() => setTab("anak")}
            className="px-5 py-2 rounded-xl text-sm font-bold transition-all"
            style={
              tab === "anak"
                ? { backgroundColor: "#3EA8DE", color: "#fff" }
                : { color: "#8AA3BB" }
            }
          >
            Tampilan Anak
          </button>
          <button
            onClick={() => setTab("ortu")}
            className="px-5 py-2 rounded-xl text-sm font-bold transition-all"
            style={
              tab === "ortu"
                ? { backgroundColor: "#17395B", color: "#fff" }
                : { color: "#8AA3BB" }
            }
          >
            Tampilan Orang Tua
          </button>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-3xl p-5"
            style={{ border: "2px solid #E1EAF2", boxShadow: "0 4px 0 #E9EFF5" }}
          >
            {/* Icon */}
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl mb-4"
              style={{ backgroundColor: card.softBg }}
            >
              {card.icon}
            </div>
            <h3
              className="font-bold text-base mb-2"
              style={{ fontFamily: "var(--font-baloo), sans-serif", color: "#17395B" }}
            >
              {card.title}
            </h3>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "#6B87A3" }}>
              {card.desc}
            </p>
            <ul className="space-y-2">
              {card.points.map((point) => (
                <li key={point} className="flex items-start gap-2 text-xs" style={{ color: "#527193" }}>
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-[9px]"
                    style={{ backgroundColor: card.softBg, color: card.color }}
                  >
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

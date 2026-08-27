import Link from "next/link";
import { Logo } from "@/components/Logo";
import { GalleryToggle } from "@/components/landing/GalleryToggle";
import { FaqAccordion } from "@/components/landing/FaqAccordion";

// ─── Phone mockup helpers ──────────────────────────────────────────────────

function PhoneMockup({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width: 200,
        height: 380,
        borderRadius: 32,
        border: "2px solid #E1EAF2",
        backgroundColor: "#fff",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(23,57,91,0.12)",
        flexShrink: 0,
        position: "relative",
        ...style,
      }}
    >
      {/* Notch */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          width: 56,
          height: 8,
          borderRadius: 99,
          backgroundColor: "#E1EAF2",
          zIndex: 10,
        }}
      />
      <div style={{ paddingTop: 28 }}>{children}</div>
    </div>
  );
}

function PhoneDashboard() {
  return (
    <PhoneMockup>
      {/* Top bar */}
      <div style={{ padding: "6px 14px 10px", backgroundColor: "#fff" }}>
        <div style={{ fontSize: 9, color: "#8AA3BB", marginBottom: 2 }}>Selamat pagi ☀️</div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: "#17395B",
            fontFamily: "var(--font-baloo), sans-serif",
          }}
        >
          Aira
        </div>
      </div>
      {/* Stars card */}
      <div style={{ padding: "0 10px 8px" }}>
        <div
          style={{
            backgroundColor: "#17395B",
            borderRadius: 16,
            padding: "10px 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 8, color: "#8AA3BB", marginBottom: 2 }}>Bintang</div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#F5C33B",
                fontFamily: "var(--font-baloo), sans-serif",
                lineHeight: 1,
              }}
            >
              ★ 240
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 8, color: "#8AA3BB", marginBottom: 2 }}>Rentetan</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#35C0A0" }}>🔥 7 hari</div>
          </div>
        </div>
      </div>
      {/* Mission items */}
      <div style={{ padding: "0 10px" }}>
        <div style={{ fontSize: 8, color: "#8AA3BB", marginBottom: 6, fontWeight: 700 }}>
          MISI HARI INI
        </div>
        {[
          { name: "Sholat Subuh", pts: "+20", done: true, color: "#C8F0E5", tc: "#1F8F76" },
          { name: "Baca 15 menit", pts: "+15", done: true, color: "#C8F0E5", tc: "#1F8F76" },
          { name: "Kerjakan PR", pts: "+25", done: false, color: "#BFE4F7", tc: "#1B7FB8" },
          { name: "Merapikan kamar", pts: "+10", done: false, color: "#FFD9B8", tc: "#C25E12" },
        ].map((m) => (
          <div
            key={m.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 5,
              padding: "5px 8px",
              borderRadius: 10,
              backgroundColor: m.done ? "#F6FCF9" : "#F9FBFD",
              border: "1px solid #E1EAF2",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: m.done ? "#35C0A0" : "#E1EAF2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {m.done && (
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </div>
            <span
              style={{
                fontSize: 8,
                fontWeight: 600,
                color: m.done ? "#8AA3BB" : "#17395B",
                textDecoration: m.done ? "line-through" : "none",
                flex: 1,
              }}
            >
              {m.name}
            </span>
            <span
              style={{
                fontSize: 8,
                fontWeight: 700,
                color: m.tc,
                backgroundColor: m.color,
                padding: "1px 5px",
                borderRadius: 6,
              }}
            >
              {m.pts}
            </span>
          </div>
        ))}
      </div>
    </PhoneMockup>
  );
}

function PhonePersetujuan() {
  return (
    <PhoneMockup style={{ backgroundColor: "#F6F9FC" }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "8px 14px 10px",
          borderBottom: "1px solid #E1EAF2",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: "#17395B",
            fontFamily: "var(--font-baloo), sans-serif",
          }}
        >
          Persetujuan
        </div>
        <div style={{ fontSize: 8, color: "#8AA3BB" }}>3 menunggu konfirmasi</div>
      </div>
      <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          {
            name: "Aira",
            mission: "Sholat Subuh",
            type: "Foto bukti",
            pts: "+20",
            color: "#C8F0E5",
            tc: "#1F8F76",
          },
          {
            name: "Rafi",
            mission: "Baca buku",
            type: "Rekaman suara",
            pts: "+15",
            color: "#BFE4F7",
            tc: "#1B7FB8",
          },
          {
            name: "Aira",
            mission: "Kuis Matematika",
            type: "Kuis · 90%",
            pts: "+25",
            color: "#E2D9FB",
            tc: "#6B4FD1",
          },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#fff",
              borderRadius: 14,
              padding: "8px 10px",
              border: "1px solid #E1EAF2",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 6,
              }}
            >
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#17395B" }}>
                  {item.name} · {item.mission}
                </div>
                <div
                  style={{
                    fontSize: 7,
                    color: item.tc,
                    backgroundColor: item.color,
                    padding: "1px 5px",
                    borderRadius: 5,
                    display: "inline-block",
                    marginTop: 2,
                  }}
                >
                  {item.type}
                </div>
              </div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#1F8F76",
                  backgroundColor: "#C8F0E5",
                  padding: "2px 6px",
                  borderRadius: 6,
                }}
              >
                {item.pts}
              </div>
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              <button
                style={{
                  flex: 1,
                  padding: "4px 0",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: "#17395B",
                  color: "#fff",
                  fontSize: 7,
                  fontWeight: 700,
                  cursor: "default",
                }}
              >
                ✓ Setujui
              </button>
              <button
                style={{
                  flex: 1,
                  padding: "4px 0",
                  borderRadius: 8,
                  border: "1px solid #E1EAF2",
                  backgroundColor: "#fff",
                  color: "#8AA3BB",
                  fontSize: 7,
                  fontWeight: 700,
                  cursor: "default",
                }}
              >
                ✗ Tolak
              </button>
            </div>
          </div>
        ))}
      </div>
    </PhoneMockup>
  );
}

function PhoneJadwal() {
  return (
    <PhoneMockup style={{ backgroundColor: "#F6F9FC" }}>
      <div
        style={{
          backgroundColor: "#fff",
          padding: "8px 14px 10px",
          borderBottom: "1px solid #E1EAF2",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: "#17395B",
            fontFamily: "var(--font-baloo), sans-serif",
          }}
        >
          Jadwal
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
          {["S", "S", "R", "K", "J", "S", "M"].map((d, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "3px 0",
                borderRadius: 8,
                fontSize: 7,
                fontWeight: 700,
                backgroundColor: i === 2 ? "#17395B" : "transparent",
                color: i === 2 ? "#fff" : i >= 5 ? "#F58634" : "#8AA3BB",
              }}
            >
              {d}
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
        {[
          { time: "05:00", name: "Sholat Subuh", dur: "15m", color: "#C8F0E5", tc: "#1F8F76", status: "done" as const },
          { time: "06:30", name: "Sarapan & siap", dur: "30m", color: "#BFE4F7", tc: "#1B7FB8", status: "done" as const },
          { time: "07:00", name: "Berangkat sekolah", dur: "30m", color: "#BFE4F7", tc: "#1B7FB8", status: "now" as const },
          { time: "15:00", name: "Belajar mandiri", dur: "60m", color: "#E2D9FB", tc: "#6B4FD1", status: "next" as const },
          { time: "17:00", name: "Olahraga", dur: "45m", color: "#FFD9B8", tc: "#C25E12", status: "next" as const },
        ].map((block) => (
          <div
            key={block.time}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <div style={{ fontSize: 7, color: "#8AA3BB", width: 26, flexShrink: 0, textAlign: "right" }}>
              {block.time}
            </div>
            <div
              style={{
                flex: 1,
                padding: "5px 8px",
                borderRadius: 10,
                backgroundColor: block.status === "now" ? block.tc : "#fff",
                border: block.status === "now" ? "none" : "1px solid #E1EAF2",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: block.status === "now" ? "#fff" : "#17395B",
                }}
              >
                {block.name}
              </span>
              <span
                style={{
                  fontSize: 7,
                  padding: "1px 5px",
                  borderRadius: 5,
                  backgroundColor: block.status === "done" ? block.color : block.status === "now" ? "rgba(255,255,255,0.25)" : block.color,
                  color: block.status === "done" ? block.tc : block.status === "now" ? "#fff" : block.tc,
                  fontWeight: 600,
                }}
              >
                {block.status === "done" ? "✓" : block.status === "now" ? "▶" : block.dur}
              </span>
            </div>
          </div>
        ))}
      </div>
    </PhoneMockup>
  );
}

// ─── Section: Features ────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: "✅",
    color: "#1F8F76",
    softBg: "#C8F0E5",
    title: "Master misi fleksibel",
    desc: "Buat misi harian atau mingguan, atur poin, tentukan siapa yang kena, dan wajibkan bukti foto bila perlu.",
  },
  {
    icon: "📅",
    color: "#1B7FB8",
    softBg: "#BFE4F7",
    title: "Jadwal kegiatan harian",
    desc: "Blok waktu dari subuh sampai tidur, tertaut ke misi. Anak tahu apa yang harus dilakukan sekarang.",
  },
  {
    icon: "⭐",
    color: "#C25E12",
    softBg: "#FFD9B8",
    title: "Bintang & toko hadiah",
    desc: "Poin terkumpul jadi hadiah nyata: pengalaman atau barang, dengan stok dan batas mingguan.",
  },
  {
    icon: "☑️",
    color: "#6B4FD1",
    softBg: "#E2D9FB",
    title: "Satu antrean persetujuan",
    desc: "Bukti misi, permintaan hadiah, dan anggota baru masuk satu inbox. Setujui sekali ketuk.",
  },
  {
    icon: "⏰",
    color: "#E4573C",
    softBg: "#FFF0EC",
    title: "Deteksi misi terlambat",
    desc: "Misi yang lewat batas waktu langsung muncul di dashboard anak, lengkap dengan tombol susul.",
  },
  {
    icon: "📊",
    color: "#17395B",
    softBg: "#E1EAF2",
    title: "Laporan yang dibaca",
    desc: "Tren mingguan, heatmap konsistensi, nilai per kategori, dan ringkasan naratif otomatis.",
  },
];

// ─── Section: How it works ───────────────────────────────────────────────

const STEPS = [
  {
    n: "1",
    title: "Orang tua daftar",
    desc: "Satu akun keluarga, langsung aktif — tidak perlu kode atau verifikasi tambahan.",
  },
  {
    n: "2",
    title: "Tambah anak & misi",
    desc: "Masukkan nama anak, pilih avatar, susun misi dan blok jadwal hariannya.",
  },
  {
    n: "3",
    title: "Anak masuk pakai akun sendiri",
    desc: "Email dan password dibuatkan orang tua lewat Master Anggota — tinggal diberi tahu ke anak.",
  },
  {
    n: "4",
    title: "Setujui & baca laporan",
    desc: "Bukti masuk antrean, bintang bertambah, laporan bulanan terisi sendiri.",
  },
];

// ─── Section: Testimonials ───────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name: "Rina",
    sub: "Bunda 2 anak · Bandung",
    quote:
      "Dulu tiap sore saya harus mengingatkan tiga hal berulang. Sekarang anak yang membuka jadwalnya sendiri.",
    dark: false,
  },
  {
    name: "Adi",
    sub: "Ayah 3 anak · Surabaya",
    quote:
      "Yang paling berguna itu laporan bulanan. Saya jadi tahu kategori mana yang benar-benar turun, bukan cuma merasa.",
    dark: true,
  },
  {
    name: "Sari",
    sub: "Bunda 1 anak · Yogyakarta",
    quote:
      "Aira suka bagian bintangnya. Hadiahnya kami buat pengalaman, bukan barang — jadi tetap hemat.",
    dark: false,
  },
];

// ─── Footer links ─────────────────────────────────────────────────────────

const FOOTER_COLS = [
  {
    title: "Produk",
    links: ["Fitur", "Tampilan anak", "Tampilan orang tua"],
  },
  {
    title: "Panduan",
    links: ["Menyusun misi", "Menentukan poin", "Ide hadiah hemat", "Membaca laporan"],
  },
  {
    title: "Bantuan",
    links: ["Pusat bantuan", "Lupa password", "Reset password anak", "Hubungi kami"],
  },
  {
    title: "Legal",
    links: ["Syarat layanan", "Privasi data anak", "Keamanan"],
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF7EC", fontFamily: "var(--font-body)" }}>
      {/* ── 1. NAVBAR ────────────────────────────────��────────────────── */}
      <nav
        className="sticky top-0 z-50"
        style={{ backgroundColor: "rgba(255,247,236,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid #F0E5D6" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Logo size="md" />

          {/* Nav links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-6">
            {["Fitur", "Tampilan", "Cara kerja", "Tanya jawab"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                className="text-sm font-semibold transition-colors text-[#527193] hover:text-[#17395B]"
              >
                {item}
              </a>
            ))}
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: "#C8F0E5", color: "#1F8F76" }}
            >
              Gratis
            </span>
          </div>

          {/* Right buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/masuk"
              className="text-sm font-bold px-4 py-2 rounded-xl transition-colors hidden sm:block"
              style={{ color: "#17395B" }}
            >
              Masuk
            </Link>
            <Link
              href="/daftar"
              className="text-sm font-bold px-4 py-2 rounded-xl text-white"
              style={{ backgroundColor: "#F58634", boxShadow: "0 3px 0 #C25E12" }}
            >
              Daftar Keluarga
            </Link>
          </div>
        </div>
      </nav>

      {/* ── 2. HERO ──────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-12 lg:pt-24 lg:pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left: text */}
          <div className="flex-1 min-w-0">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-6"
              style={{ backgroundColor: "#FFF0C2", color: "#C25E12", border: "1.5px solid #F5C33B" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "#F5C33B" }}
              />
              anakjuara.online · gratis, selamanya
            </div>

            <h1
              className="font-extrabold leading-[1.1] mb-5"
              style={{
                fontFamily: "var(--font-baloo), sans-serif",
                fontSize: "clamp(32px, 5vw, 52px)",
                color: "#17395B",
              }}
            >
              Catat performa anak,{" "}
              <br className="hidden sm:block" />
              tanpa{" "}
              <span style={{ color: "#F58634" }}>drama harian.</span>
            </h1>

            <p
              className="text-base leading-relaxed mb-8 max-w-lg"
              style={{ color: "#527193" }}
            >
              Misi harian, jadwal kegiatan, bintang, dan laporan performa dalam satu
              aplikasi keluarga. Anak jadi semangat karena jelas targetnya — orang tua
              punya data, bukan tebakan.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link
                href="/daftar"
                className="font-bold text-base px-8 py-4 rounded-2xl text-white text-center"
                style={{ backgroundColor: "#F58634", boxShadow: "0 4px 0 #C25E12" }}
              >
                Daftar Keluarga
              </Link>
              <Link
                href="/masuk"
                className="font-bold text-base px-8 py-4 rounded-2xl text-center"
                style={{
                  color: "#17395B",
                  border: "2px solid #17395B",
                  backgroundColor: "transparent",
                }}
              >
                Masuk
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3">
              {/* Stacked avatars */}
              <div className="flex -space-x-2">
                {[
                  { initial: "A", bg: "#BFE4F7", color: "#1B7FB8" },
                  { initial: "F", bg: "#C8F0E5", color: "#1F8F76" },
                  { initial: "N", bg: "#FFD9B8", color: "#C25E12" },
                  { initial: "R", bg: "#E2D9FB", color: "#6B4FD1" },
                ].map((av) => (
                  <div
                    key={av.initial}
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                    style={{
                      backgroundColor: av.bg,
                      color: av.color,
                      border: "2px solid #FFF7EC",
                    }}
                  >
                    {av.initial}
                  </div>
                ))}
              </div>
              <p className="text-xs font-semibold" style={{ color: "#8AA3BB" }}>
                Dipakai keluarga untuk anak usia 6–13 tahun.
                <br />
                Satu akun orang tua, banyak anak.
              </p>
            </div>
          </div>

          {/* Right: phone mockups */}
          <div className="flex-shrink-0 relative flex items-center justify-center" style={{ height: 420 }}>
            {/* Back phone */}
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 40,
                transform: "rotate(6deg) translateX(20px)",
                opacity: 0.85,
                zIndex: 1,
              }}
            >
              <PhoneJadwal />
            </div>
            {/* Middle phone */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 20,
                transform: "rotate(-5deg) translateX(-20px)",
                opacity: 0.9,
                zIndex: 2,
              }}
            >
              <PhonePersetujuan />
            </div>
            {/* Front phone */}
            <div style={{ position: "relative", zIndex: 3 }}>
              <PhoneDashboard />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. STAT STRIP ────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div
          className="rounded-3xl px-6 py-6"
          style={{ backgroundColor: "#17395B" }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { num: "16", label: "Halaman siap pakai" },
              { num: "★ 420", label: "Rata bintang / bulan" },
              { num: "86%", label: "Konsistensi misi harian" },
              { num: "Gratis", label: "Semua fitur, tanpa batas" },
            ].map((s) => (
              <div key={s.label} className="text-center py-2">
                <div
                  className="font-extrabold leading-none mb-1"
                  style={{
                    fontFamily: "var(--font-baloo), sans-serif",
                    fontSize: "clamp(22px, 3vw, 30px)",
                    color: "#F5C33B",
                  }}
                >
                  {s.num}
                </div>
                <div className="text-xs font-semibold" style={{ color: "#8AA3BB" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. GALLERY (TAMPILAN) ─────────────────────────────────────────── */}
      <section
        id="tampilan"
        className="py-16 lg:py-20"
        style={{ backgroundColor: "#F6F9FC" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2
              className="font-extrabold mb-3"
              style={{
                fontFamily: "var(--font-baloo), sans-serif",
                fontSize: "clamp(24px, 4vw, 36px)",
                color: "#17395B",
              }}
            >
              Dua tampilan, satu keluarga.
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "#527193" }}>
              Anak melihat versi yang ceria dan sederhana. Orang tua melihat versi yang
              padat data dan bisa mengatur semuanya.
            </p>
          </div>
          <GalleryToggle />
        </div>
      </section>

      {/* ── 5. FITUR ─────────────────────────────────────────────────────── */}
      <section id="fitur" className="py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2
              className="font-extrabold mb-3"
              style={{
                fontFamily: "var(--font-baloo), sans-serif",
                fontSize: "clamp(24px, 4vw, 36px)",
                color: "#17395B",
              }}
            >
              Semua yang dibutuhkan untuk konsisten.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-3xl p-6"
                style={{ border: "2px solid #E1EAF2", boxShadow: "0 4px 0 #E9EFF5" }}
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl mb-4"
                  style={{ backgroundColor: f.softBg }}
                >
                  {f.icon}
                </div>
                <h3
                  className="font-bold text-base mb-2"
                  style={{ fontFamily: "var(--font-baloo), sans-serif", color: "#17395B" }}
                >
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6B87A3" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. CARA KERJA ────────────────────────────────────────────────── */}
      <section
        id="cara-kerja"
        className="py-16 lg:py-20"
        style={{ backgroundColor: "#EBF5FC" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header card */}
          <div
            className="rounded-3xl p-8 lg:p-10 mb-8"
            style={{ backgroundColor: "#3EA8DE" }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <h2
                className="font-extrabold text-white"
                style={{
                  fontFamily: "var(--font-baloo), sans-serif",
                  fontSize: "clamp(22px, 4vw, 34px)",
                }}
              >
                Empat langkah,
                <br />
                mulai hari ini.
              </h2>
              <a
                href="https://anakjuara.online"
                className="font-bold text-sm px-5 py-2.5 rounded-xl whitespace-nowrap"
                style={{ backgroundColor: "#17395B", color: "#fff" }}
              >
                Buka anakjuara.online
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STEPS.map((step) => (
                <div
                  key={step.n}
                  className="rounded-2xl p-5"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base mb-3"
                    style={{
                      fontFamily: "var(--font-baloo), sans-serif",
                      backgroundColor: "#17395B",
                      color: "#F5C33B",
                    }}
                  >
                    {step.n}
                  </div>
                  <h3
                    className="font-bold text-white text-sm mb-1.5"
                    style={{ fontFamily: "var(--font-baloo), sans-serif" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. TESTIMONI ─────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2
              className="font-extrabold mb-2"
              style={{
                fontFamily: "var(--font-baloo), sans-serif",
                fontSize: "clamp(22px, 4vw, 34px)",
                color: "#17395B",
              }}
            >
              Cerita dari keluarga
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-3xl p-6"
                style={{
                  backgroundColor: t.dark ? "#17395B" : "#fff",
                  border: t.dark ? "none" : "2px solid #E1EAF2",
                  boxShadow: "0 4px 0 " + (t.dark ? "#0D2540" : "#E9EFF5"),
                }}
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} style={{ color: "#F5C33B", fontSize: 14 }}>★</span>
                  ))}
                </div>
                <p
                  className="text-sm leading-relaxed mb-5"
                  style={{ color: t.dark ? "rgba(255,255,255,0.9)" : "#527193" }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{
                      backgroundColor: t.dark ? "rgba(255,255,255,0.15)" : "#BFE4F7",
                      color: t.dark ? "#fff" : "#1B7FB8",
                    }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <div
                      className="font-bold text-sm"
                      style={{ color: t.dark ? "#fff" : "#17395B" }}
                    >
                      {t.name}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: t.dark ? "rgba(255,255,255,0.55)" : "#8AA3BB" }}
                    >
                      {t.sub}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. FAQ ───────────────────────────────────────────────────────── */}
      <section
        id="tanya-jawab"
        className="py-16 lg:py-20"
        style={{ backgroundColor: "#F6F9FC" }}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2
              className="font-extrabold mb-2"
              style={{
                fontFamily: "var(--font-baloo), sans-serif",
                fontSize: "clamp(22px, 4vw, 34px)",
                color: "#17395B",
              }}
            >
              Pertanyaan umum
            </h2>
          </div>
          <FaqAccordion />
        </div>
      </section>

      {/* ── 9. CTA BESAR ─────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div
            className="rounded-3xl p-8 lg:p-14 text-center"
            style={{ backgroundColor: "#3EA8DE" }}
          >
            <h2
              className="font-extrabold text-white mb-3"
              style={{
                fontFamily: "var(--font-baloo), sans-serif",
                fontSize: "clamp(24px, 4vw, 40px)",
              }}
            >
              Coba satu minggu. Lihat bedanya di rumah.
            </h2>
            <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.85)" }}>
              Setup dua menit: daftar, tambah anak, pilih lima misi pertama. Gratis
              sepenuhnya — tanpa biaya, tanpa kartu kredit.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/daftar"
                className="font-bold text-base px-8 py-4 rounded-2xl text-white"
                style={{ backgroundColor: "#17395B", boxShadow: "0 4px 0 #0D2540" }}
              >
                Daftar Keluarga
              </Link>
              <button
                className="font-bold text-base px-8 py-4 rounded-2xl"
                style={{
                  color: "#fff",
                  border: "2px solid rgba(255,255,255,0.6)",
                  backgroundColor: "transparent",
                }}
              >
                Lihat demo layar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. FOOTER ───────────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: "#17395B" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-8">
          {/* Top row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
            {/* Brand col */}
            <div className="lg:col-span-1">
              <Logo size="md" />
              <p className="text-xs leading-relaxed mt-4" style={{ color: "#8AA3BB" }}>
                Aplikasi keluarga untuk mengukur dan mencatat performa anak. Data anak
                tidak dibagikan ke pihak ketiga.
              </p>
              <p className="text-xs font-semibold mt-3" style={{ color: "#527193" }}>
                anakjuara.online
              </p>
            </div>

            {/* Link cols */}
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <div
                  className="text-xs font-bold uppercase tracking-wide mb-3"
                  style={{ color: "#527193" }}
                >
                  {col.title}
                </div>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-xs font-medium transition-colors"
                        style={{ color: "#8AA3BB" }}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom row */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p className="text-xs" style={{ color: "#527193" }}>
              © 2026 Anak Juara. Dibuat untuk keluarga Indonesia.
            </p>
            <div className="flex gap-4">
              {[
                {
                  label: "Instagram",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  ),
                },
                {
                  label: "WhatsApp",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  ),
                },
                {
                  label: "Email",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  ),
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="transition-colors"
                  style={{ color: "#527193" }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

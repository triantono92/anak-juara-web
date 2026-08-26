import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-page-bg">
      {/* Bezel / phone frame feel on desktop */}
      <div className="w-full max-w-[480px] min-h-screen bg-white flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-5 pt-6 pb-3">
          <Logo size="md" />
          <Link
            href="/masuk"
            className="text-sm font-bold text-navy border border-[#dce8f2] rounded-full px-4 py-1.5"
          >
            Masuk
          </Link>
        </header>

        {/* Hero */}
        <div className="flex-1 px-6 pt-10 pb-6 flex flex-col">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#EBF5EC] text-green rounded-full px-3 py-1.5 text-xs font-bold mb-6 self-start">
            <span className="w-1.5 h-1.5 rounded-full bg-green" />
            Gratis untuk 1 keluarga
          </div>

          <h1 className="font-display font-extrabold text-navy text-[30px] leading-[1.1] mb-4">
            Catat performa anak,{" "}
            <span className="text-orange">tanpa drama</span>{" "}
            harian.
          </h1>
          <p className="text-muted-2 text-sm mb-8 leading-relaxed">
            Anak juara bukan terjadi sendiri. Atur misi harian, pantau jadwal, beri hadiah nyata
            — semua dalam satu aplikasi keluarga.
          </p>

          {/* CTA */}
          <div className="flex flex-col gap-3 mb-10">
            <Link
              href="/daftar"
              className="w-full bg-orange text-white font-bold text-base py-4 rounded-2xl text-center btn-chunky"
            >
              Daftar Keluarga
            </Link>
            <Link
              href="/masuk"
              className="w-full border-2 border-navy text-navy font-bold text-base py-4 rounded-2xl text-center"
            >
              Masuk
            </Link>
          </div>
          <p className="text-center text-xs text-muted mb-10">
            Daftar dilakukan oleh orang tua · anak masuk pakai kode keluarga
          </p>

          {/* Steps */}
          <div className="space-y-3">
            {[
              { n: "1", title: "Atur misi", desc: "Buat misi harian & jadwal kegiatan anak" },
              { n: "2", title: "Anak kerjakan", desc: "Kirim bukti foto, rekam, atau jawab kuis" },
              { n: "3", title: "Tukar & lihat laporan", desc: "Hadiah nyata + rapor visual mingguan" },
            ].map((s) => (
              <div key={s.n} className="flex items-start gap-4 bg-[#f7fafc] rounded-2xl p-4">
                <div className="w-9 h-9 rounded-xl bg-brand-blue flex items-center justify-center text-white font-display font-bold text-base flex-shrink-0">
                  {s.n}
                </div>
                <div>
                  <div className="font-bold text-navy text-sm">{s.title}</div>
                  <div className="text-muted text-xs mt-0.5">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-navy text-white px-6 py-5 flex items-center justify-between">
          <span className="text-sm font-bold">anakjuara.online</span>
          <a href="mailto:bantuan@anakjuara.online" className="text-sm text-[#8aafcd]">
            Bantuan
          </a>
        </footer>
      </div>
    </div>
  );
}

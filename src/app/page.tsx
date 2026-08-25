import Link from "next/link";
import { Award } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-neutral px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-line shadow-xl p-8 flex flex-col items-center text-center gap-3">
        <Award size={44} className="text-amber" />
        <h1 className="font-display font-extrabold text-2xl text-ink">Anak Juara</h1>
        <p className="text-sm text-ink-soft">
          Kelola misi harian, kumpulkan bintang, tukar hadiah — bareng keluarga.
        </p>
        <div className="flex flex-col gap-2.5 w-full mt-4">
          <Link
            href="/anak/login"
            className="w-full bg-coral text-white font-bold text-sm py-3 rounded-xl"
          >
            Masuk sebagai Anak
          </Link>
          <Link
            href="/ortu/login"
            className="w-full bg-ink text-white font-bold text-sm py-3 rounded-xl"
          >
            Masuk sebagai Orang Tua
          </Link>
        </div>
      </div>
    </div>
  );
}

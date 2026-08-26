"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

export default function MasukOrtuPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const handleMasuk = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setErr("Email atau kata sandi salah.");
      return;
    }
    router.push("/ortu/persetujuan");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-bg px-5 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <Logo size="md" />
        </div>

        <div className="bg-white rounded-3xl p-6 card-shadow">
          <h2 className="font-display font-bold text-navy text-xl mb-5">
            Masuk sebagai orang tua
          </h2>
          <form className="space-y-3" onSubmit={handleMasuk}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full border-2 border-border-color rounded-2xl px-4 py-3 text-sm font-semibold focus:border-brand-blue focus:outline-none"
            />
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata sandi"
                required
                minLength={6}
                className="w-full border-2 border-border-color rounded-2xl px-4 py-3 pr-11 text-sm font-semibold focus:border-brand-blue focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              >
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded"
                />
                Ingat saya
              </label>
              <button type="button" className="text-brand-blue-dark font-bold">
                Lupa sandi?
              </button>
            </div>
            {err && <div className="text-red-danger text-sm font-semibold">{err}</div>}
            <button
              disabled={busy}
              className="w-full bg-navy text-white font-bold text-sm py-3.5 rounded-2xl btn-chunky disabled:opacity-50"
            >
              {busy ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>

        {/* Anak card */}
        <div className="bg-white rounded-2xl p-4 card-shadow flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center font-bold text-orange text-lg">
            ★
          </div>
          <div className="flex-1 text-sm">
            <div className="font-bold text-navy">Anak yang mau masuk?</div>
            <Link href="/masuk" className="text-brand-blue-dark font-semibold">
              Pindah ke mode anak dengan PIN
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

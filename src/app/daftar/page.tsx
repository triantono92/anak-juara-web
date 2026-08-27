"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

type ParentRole = "bunda" | "ayah" | "wali";

export default function DaftarPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState<ParentRole>("bunda");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const handleDaftar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      setErr("Setujui syarat & ketentuan terlebih dahulu.");
      return;
    }
    setBusy(true);
    setErr("");
    const { data: signUp, error: signUpErr } = await supabase.auth.signUp({ email, password });
    if (signUpErr || !signUp.user) {
      setBusy(false);
      setErr(signUpErr?.message || "Gagal mendaftar.");
      return;
    }
    const res = await fetch("/api/family/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        familyName: `Keluarga ${name.split(" ")[0]}`,
        parentName: name,
        parentRole: role,
      }),
    });
    if (!res.ok) {
      await supabase.auth.signOut();
      setBusy(false);
      const d = await res.json().catch(() => ({}));
      setErr(d.error || "Gagal membuat keluarga.");
      return;
    }
    await supabase.auth.signOut();
    setBusy(false);
    router.push("/masuk");
    router.refresh();
  };

  const ROLES: { value: ParentRole; label: string }[] = [
    { value: "bunda", label: "Bunda" },
    { value: "ayah", label: "Ayah" },
    { value: "wali", label: "Wali" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-bg px-5 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <Logo size="md" />
        </div>

        <div className="bg-white rounded-3xl p-6 card-shadow">
          <div className="flex items-center gap-2 mb-5">
            <span className="bg-navy text-white text-[10px] font-bold px-2 py-1 rounded-full">
              ORANG TUA
            </span>
            <h2 className="font-display font-bold text-navy text-xl">Buat akun keluarga</h2>
          </div>
          <form className="space-y-3" onSubmit={handleDaftar}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap"
              required
              className="w-full border-2 border-border-color rounded-2xl px-4 py-3 text-sm font-semibold focus:border-brand-blue focus:outline-none"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full border-2 border-border-color rounded-2xl px-4 py-3 text-sm font-semibold focus:border-brand-blue focus:outline-none"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nomor WhatsApp"
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
            {/* Role selector */}
            <div className="flex gap-2 bg-[#f0f5f9] rounded-2xl p-1">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                    role === r.value ? "bg-white text-navy shadow-sm" : "text-muted"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            {/* Agree */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 rounded"
              />
              <span className="text-xs text-muted-2">
                Saya setuju dengan syarat & ketentuan dan kebijakan privasi data anak
              </span>
            </label>
            {err && <div className="text-red-danger text-sm font-semibold">{err}</div>}
            <button
              disabled={busy}
              className="w-full bg-navy text-white font-bold text-sm py-3.5 rounded-2xl btn-chunky disabled:opacity-50"
            >
              {busy ? "Memproses..." : "Buat Akun"}
            </button>
          </form>
        </div>

        <div className="text-center text-sm text-muted">
          Sudah punya akun?{" "}
          <Link href="/masuk" className="font-bold text-brand-blue-dark">
            Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}

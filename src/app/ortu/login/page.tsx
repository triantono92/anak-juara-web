"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OrtuLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"masuk" | "daftar">("masuk");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const handleMasuk = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setErr("Email atau kata sandi salah.");
    router.push("/ortu/persetujuan");
    router.refresh();
  };

  const handleDaftar = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    // 1. Buat akun Supabase Auth untuk ortu.
    const { data: signUp, error: signUpErr } = await supabase.auth.signUp({ email, password });
    if (signUpErr || !signUp.user) {
      setBusy(false);
      return setErr(signUpErr?.message || "Gagal mendaftar.");
    }
    // 2. Buat keluarga + baris app_users (role 'ortu') lewat route API
    //    (pakai service-role di server supaya bisa insert lintas-tabel dengan aman).
    const res = await fetch("/api/family/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: signUp.user.id, familyName, parentName: name }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return setErr(data.error || "Gagal membuat keluarga.");
    }
    router.push("/ortu/persetujuan");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-neutral px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-line shadow-xl p-8 flex flex-col gap-4">
        <h1 className="font-display font-bold text-lg text-ink text-center">
          {mode === "masuk" ? "Masuk sebagai Orang Tua" : "Buat Akun Keluarga"}
        </h1>

        <form className="flex flex-col gap-3" onSubmit={mode === "masuk" ? handleMasuk : handleDaftar}>
          {mode === "daftar" && (
            <>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama kamu"
                className="border border-line rounded-xl px-3 py-2.5 text-sm font-semibold"
                required
              />
              <input
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Nama keluarga (mis. Keluarga Handoko)"
                className="border border-line rounded-xl px-3 py-2.5 text-sm font-semibold"
                required
              />
            </>
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="border border-line rounded-xl px-3 py-2.5 text-sm font-semibold"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Kata sandi"
            className="border border-line rounded-xl px-3 py-2.5 text-sm font-semibold"
            required
            minLength={6}
          />
          {err && <div className="text-stempel text-xs font-semibold">{err}</div>}
          <button disabled={busy} className="bg-ink text-white font-bold text-sm py-3 rounded-xl disabled:opacity-60">
            {busy ? "Memproses..." : mode === "masuk" ? "Masuk" : "Daftar & Buat Keluarga"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "masuk" ? "daftar" : "masuk");
            setErr("");
          }}
          className="text-xs font-bold text-coral text-center"
        >
          {mode === "masuk" ? "Belum punya akun? Daftar di sini" : "Sudah punya akun? Masuk"}
        </button>
      </div>
    </div>
  );
}

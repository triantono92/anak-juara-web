"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ChevronLeft } from "lucide-react";

type Member = {
  id: string;
  name: string;
  role: "anak" | "ortu";
  avatar_color: string;
  username: string;
  parent_role: string | null;
  member_status: string;
  age: number | null;
  stars: number;
};

type Family = { id: string; name: string; invite_code: string };

export default function MasukPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [codeChars, setCodeChars] = useState(["", "", "", ""]);
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [selected, setSelected] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const code = codeChars.join("").toUpperCase();

  const handleCodeSubmit = async () => {
    if (code.length < 4) { setErr("Masukkan 4 karakter kode keluarga."); return; }
    setLoading(true); setErr("");
    const res = await fetch(`/api/family/members?code=${code}`);
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr(d.error || "Kode tidak ditemukan.");
      return;
    }
    const data = await res.json();
    setFamily(data.family);
    setMembers(data.members);
    setSelected(null);
    setStep(2);
  };

  const handleProceed = () => {
    if (!selected) return;
    if (selected.role === "anak") {
      router.push(
        `/masuk/anak?code=${encodeURIComponent(code)}&username=${encodeURIComponent(selected.username)}&name=${encodeURIComponent(selected.name)}`
      );
    } else {
      router.push(`/masuk/ortu`);
    }
  };

  // Inisial avatar dari nama
  const initials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  // Handle 4-box code input
  const inputRefs: (HTMLInputElement | null)[] = [null, null, null, null];
  const setRef = (i: number) => (el: HTMLInputElement | null) => {
    inputRefs[i] = el;
  };

  const handleCharInput = (i: number, val: string) => {
    const char = val.replace(/[^a-zA-Z0-9]/g, "").slice(-1).toUpperCase();
    const next = [...codeChars];
    next[i] = char;
    setCodeChars(next);
    if (char && i < 3) {
      setTimeout(() => inputRefs[i + 1]?.focus(), 10);
    }
  };

  const handleCharKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codeChars[i] && i > 0) {
      const next = [...codeChars];
      next[i - 1] = "";
      setCodeChars(next);
      setTimeout(() => inputRefs[i - 1]?.focus(), 10);
    }
    if (e.key === "Enter") handleCodeSubmit();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page-bg px-5 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="md" />
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8">
          <div className="h-1.5 flex-1 rounded-full bg-brand-blue" />
          <div className={`h-1.5 flex-1 rounded-full ${step === 2 ? "bg-brand-blue" : "bg-[#dce8f5]"}`} />
        </div>

        {step === 1 && (
          <div className="bg-white rounded-3xl p-6 card-shadow space-y-5">
            <div>
              <h2 className="font-display font-bold text-navy text-xl mb-1">Masukkan kode keluarga</h2>
              <p className="text-muted text-sm">Kode 4 karakter dari orang tuamu</p>
            </div>
            {/* 4-box code input */}
            <div className="flex gap-3 justify-center">
              {codeChars.map((ch, i) => (
                <input
                  key={i}
                  ref={setRef(i)}
                  value={ch}
                  maxLength={1}
                  onChange={(e) => handleCharInput(i, e.target.value)}
                  onKeyDown={(e) => handleCharKey(i, e)}
                  className="w-16 h-16 text-center text-2xl font-display font-bold text-navy border-2 border-border-color rounded-2xl focus:border-brand-blue focus:outline-none uppercase"
                  placeholder="·"
                />
              ))}
            </div>
            <div className="bg-[#EAF1F7] rounded-2xl p-3 text-sm text-muted-2">
              Lupa kode? Cek di halaman{" "}
              <span className="font-bold text-navy">Master Anggota</span> aplikasi orang tua.
            </div>
            {err && <div className="text-red-danger text-sm font-semibold">{err}</div>}
            <button
              disabled={loading || code.length < 4}
              onClick={handleCodeSubmit}
              className="w-full bg-navy text-white font-bold text-sm py-3.5 rounded-2xl btn-chunky disabled:opacity-50"
            >
              {loading ? "Mencari..." : "Lanjut"}
            </button>
            <div className="text-center text-sm text-muted">
              Belum punya keluarga?{" "}
              <Link href="/daftar" className="font-bold text-brand-blue-dark">
                Daftar
              </Link>
            </div>
          </div>
        )}

        {step === 2 && family && (
          <div className="bg-white rounded-3xl p-6 card-shadow space-y-5">
            {/* Back button */}
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-muted text-sm"
            >
              <ChevronLeft size={16} /> Ganti kode keluarga
            </button>
            {/* Family badge */}
            <div className="inline-flex items-center gap-2 bg-[#EAF1F7] rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-green" />
              <span className="text-xs font-bold text-navy">
                Keluarga {family.invite_code.toUpperCase()} · {family.name}
              </span>
            </div>
            <h2 className="font-display font-bold text-navy text-xl">Masuk sebagai siapa?</h2>

            {/* Anak group */}
            {members.filter((m) => m.role === "anak").length > 0 && (
              <div>
                <div className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Anak</div>
                <div className="space-y-2">
                  {members
                    .filter((m) => m.role === "anak")
                    .map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelected(m)}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-colors ${
                          selected?.id === m.id
                            ? "border-brand-blue bg-[#EBF5FC]"
                            : "border-border-color bg-white"
                        }`}
                      >
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
                          style={{
                            backgroundColor: m.avatar_color + "33",
                            color: m.avatar_color,
                          }}
                        >
                          {initials(m.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-navy text-sm">{m.name}</div>
                          <div className="text-muted text-xs">
                            {m.age ? `${m.age} tahun · ` : ""}masuk dengan PIN
                          </div>
                        </div>
                        {selected?.id === m.id && (
                          <div className="w-5 h-5 rounded-full bg-brand-blue flex items-center justify-center">
                            <svg viewBox="0 0 12 12" fill="white" width={10} height={10}>
                              <path
                                d="M2 6l3 3 5-5"
                                stroke="white"
                                strokeWidth={1.5}
                                fill="none"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Orang tua group */}
            {members.filter((m) => m.role === "ortu").length > 0 && (
              <div>
                <div className="text-xs font-bold text-muted uppercase tracking-widest mb-2">
                  Orang tua
                </div>
                <div className="space-y-2">
                  {members
                    .filter((m) => m.role === "ortu")
                    .map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelected(m)}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-colors ${
                          selected?.id === m.id
                            ? "border-navy bg-[#EDF0F5]"
                            : "border-border-color bg-white"
                        }`}
                      >
                        <div className="w-11 h-11 rounded-2xl bg-navy flex items-center justify-center font-display font-bold text-sm flex-shrink-0 text-white">
                          {initials(m.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-navy text-sm">{m.name}</div>
                          <div className="text-muted text-xs capitalize">
                            {m.parent_role ?? "ortu"}
                            {m.member_status === "pemilik" ? " · pemilik" : ""}
                          </div>
                        </div>
                        {selected?.id === m.id && (
                          <div className="w-5 h-5 rounded-full bg-navy flex items-center justify-center">
                            <svg viewBox="0 0 12 12" fill="white" width={10} height={10}>
                              <path
                                d="M2 6l3 3 5-5"
                                stroke="white"
                                strokeWidth={1.5}
                                fill="none"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                </div>
              </div>
            )}

            <button
              disabled={!selected}
              onClick={handleProceed}
              className={`w-full font-bold text-sm py-3.5 rounded-2xl btn-chunky ${
                selected
                  ? selected.role === "anak"
                    ? "bg-brand-blue text-white"
                    : "bg-navy text-white"
                  : "bg-[#e1eaf2] text-muted cursor-not-allowed"
              }`}
            >
              {!selected
                ? "Pilih profil dulu"
                : selected.role === "anak"
                ? `Masuk sebagai ${selected.name}`
                : "Lanjut ke kata sandi"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

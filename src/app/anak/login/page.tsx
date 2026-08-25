"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, ChevronLeft } from "lucide-react";

export default function AnakLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"kode" | "pin">("kode");
  const [familyCode, setFamilyCode] = useState("");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submitPin = async (finalPin: string) => {
    setBusy(true);
    setErr("");
    const res = await fetch("/api/child-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ familyCode, username, pin: finalPin }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error || "Login gagal, coba lagi.");
      setPin("");
      return;
    }
    router.push("/anak/misi");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-neutral px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-line shadow-xl p-8 flex flex-col items-center text-center gap-4">
        <Award size={40} className="text-amber" />
        <h1 className="font-display font-bold text-lg text-ink">Masuk sebagai Anak</h1>

        {step === "kode" && (
          <form
            className="w-full flex flex-col gap-3 text-left"
            onSubmit={(e) => {
              e.preventDefault();
              if (familyCode.trim() && username.trim()) setStep("pin");
            }}
          >
            <div>
              <label className="text-xs font-bold text-ink-soft block mb-1">Kode Keluarga</label>
              <input
                value={familyCode}
                onChange={(e) => setFamilyCode(e.target.value)}
                placeholder="mis. a1b2c3"
                className="w-full border border-line rounded-xl px-3 py-2.5 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-ink-soft block mb-1">Nama Pengguna</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="mis. kayla"
                className="w-full border border-line rounded-xl px-3 py-2.5 text-sm font-semibold"
              />
            </div>
            <button className="w-full bg-coral text-white font-bold text-sm py-3 rounded-xl mt-1">
              Lanjut
            </button>
          </form>
        )}

        {step === "pin" && (
          <div className="w-full flex flex-col items-center gap-4">
            <button
              onClick={() => {
                setStep("kode");
                setPin("");
                setErr("");
              }}
              className="self-start text-ink-soft text-sm flex items-center gap-1"
            >
              <ChevronLeft size={16} /> Ganti akun
            </button>
            <div className="text-sm font-bold text-ink">Masukkan PIN, {username}</div>
            <div className="flex gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full border-2 ${
                    i < pin.length ? "bg-coral border-coral" : "border-[#c3ccdc]"
                  }`}
                />
              ))}
            </div>
            {err && <div className="text-stempel text-xs font-semibold">{err}</div>}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[220px]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button
                  key={n}
                  disabled={busy}
                  onClick={() => {
                    const next = (pin + n).slice(0, 4);
                    setPin(next);
                    if (next.length === 4) setTimeout(() => submitPin(next), 120);
                  }}
                  className="aspect-square rounded-full border border-line bg-white font-mono-brand font-bold text-lg"
                >
                  {n}
                </button>
              ))}
              <div />
              <button
                disabled={busy}
                onClick={() => {
                  const next = (pin + "0").slice(0, 4);
                  setPin(next);
                  if (next.length === 4) setTimeout(() => submitPin(next), 120);
                }}
                className="aspect-square rounded-full border border-line bg-white font-mono-brand font-bold text-lg"
              >
                0
              </button>
              <button
                onClick={() => setPin(pin.slice(0, -1))}
                className="aspect-square rounded-full border-none bg-transparent text-ink-soft"
              >
                ⌫
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

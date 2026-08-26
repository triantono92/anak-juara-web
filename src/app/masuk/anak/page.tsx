"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import Link from "next/link";

function PinContent() {
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code") ?? "";
  const username = params.get("username") ?? "";
  const name = params.get("name") ?? username;

  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submitPin = async (finalPin: string) => {
    setBusy(true);
    setErr("");
    const res = await fetch("/api/child-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ familyCode: code, username, pin: finalPin }),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr(d.error || "PIN salah, coba lagi.");
      setPin("");
      return;
    }
    router.push("/anak");
    router.refresh();
  };

  const tap = (digit: string) => {
    if (busy) return;
    const next = (pin + digit).slice(0, 4);
    setPin(next);
    if (next.length === 4) setTimeout(() => submitPin(next), 120);
  };

  const del = () => setPin((p) => p.slice(0, -1));

  // Initials from name
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-5 py-10">
      <div className="w-full max-w-sm flex flex-col items-center gap-7">
        <Logo size="md" />

        {/* Avatar */}
        <div className="w-20 h-20 rounded-3xl bg-brand-blue flex items-center justify-center font-display font-bold text-3xl text-white">
          {initials}
        </div>
        <div className="text-center">
          <h2 className="font-display font-bold text-navy text-xl">Selamat datang kembali!</h2>
          <div className="text-muted text-sm mt-1">{name}</div>
        </div>

        {/* PIN dots */}
        <div className="flex gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                i < pin.length ? "bg-brand-blue border-brand-blue" : "border-[#c3d8e8]"
              }`}
            />
          ))}
        </div>

        {err && (
          <div className="text-red-danger text-sm font-semibold text-center">{err}</div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => tap(String(n))}
              className="h-14 rounded-2xl bg-white border border-border-color font-display font-bold text-xl text-navy shadow-sm active:bg-[#f0f5fa]"
            >
              {n}
            </button>
          ))}
          <div />
          <button
            onClick={() => tap("0")}
            className="h-14 rounded-2xl bg-white border border-border-color font-display font-bold text-xl text-navy shadow-sm active:bg-[#f0f5fa]"
          >
            0
          </button>
          <button
            onClick={del}
            className="h-14 rounded-2xl text-muted text-xl flex items-center justify-center"
          >
            ←
          </button>
        </div>

        <Link href="/masuk" className="text-sm text-muted-2 underline">
          Masuk sebagai Ayah / Bunda
        </Link>
      </div>
    </div>
  );
}

export default function MasukAnakPage() {
  return (
    <Suspense>
      <PinContent />
    </Suspense>
  );
}

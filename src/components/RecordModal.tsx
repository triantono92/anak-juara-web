"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { TopBar } from "@/components/TopBar";

export function RecordModal({
  missionName,
  onClose,
  onDone,
}: {
  missionName: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [state, setState] = useState<"idle" | "recording" | "preview">("idle");
  const [sec, setSec] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  const start = async () => {
    setSec(0);
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      // Mic tidak tersedia/diizinkan — tetap lanjut sebagai timer saja.
    }
    setState("recording");
    timerRef.current = setInterval(() => setSec((s) => s + 1), 1000);
  };

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setState("preview");
  };

  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-[360px] bg-white rounded-[28px] overflow-hidden">
        <TopBar title={missionName} onBack={onClose} />
        <div className="flex flex-col items-center justify-center gap-6 px-6 py-10">
          <div
            className={`w-32 h-32 rounded-full border-4 flex items-center justify-center ${
              state === "recording" ? "border-ungu animate-pulse" : "border-ungu-soft"
            }`}
          >
            <span className="font-mono-brand text-2xl font-bold text-ink">
              {mm}:{ss}
            </span>
          </div>
          <div className="text-xs font-bold text-ink-soft text-center">
            {state === "idle" && "Tekan tombol untuk mulai merekam"}
            {state === "recording" && "🔴 Sedang merekam..."}
            {state === "preview" && "✅ Selesai, siap dikirim ke Ortu"}
          </div>
          {state === "idle" && (
            <button
              onClick={start}
              className="w-16 h-16 rounded-full bg-stempel text-white flex items-center justify-center shadow-lg"
            >
              <Mic size={22} />
            </button>
          )}
          {state === "recording" && (
            <button
              onClick={stop}
              className="w-16 h-16 rounded-full bg-stempel text-white flex items-center justify-center shadow-lg"
            >
              <Square size={20} />
            </button>
          )}
          {state === "preview" && (
            <div className="flex gap-2 w-full max-w-[220px]">
              <button
                onClick={() => setState("idle")}
                className="flex-1 border border-line font-bold text-xs py-2.5 rounded-xl"
              >
                Ulangi
              </button>
              <button onClick={onDone} className="flex-1 bg-coral text-white font-bold text-xs py-2.5 rounded-xl">
                Kirim ke Ortu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Brain, Mic, Check, X, Clock, Loader2 } from "lucide-react";
import type { Mission, Submission } from "@/lib/types";
import { compressImageToBase64 } from "@/lib/imageCompress";
import { RecordModal } from "@/components/RecordModal";
import { QuizModal } from "@/components/QuizModal";

const TYPE_BG = { foto: "bg-coral-soft", rekam: "bg-ungu-soft", kuis: "bg-amber-soft" } as const;

export function MissionCard({
  mission,
  submission,
  date,
}: {
  mission: Mission;
  submission: Submission | null;
  date: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [quizFile, setQuizFile] = useState<File | null>(null);
  const [recordOpen, setRecordOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const quizFileRef = useRef<HTMLInputElement>(null);

  const submitFoto = async (file: File) => {
    setBusy(true);
    try {
      const { base64, mediaType } = await compressImageToBase64(file);
      const up = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mediaType }),
      }).then((r) => r.json());
      if (up.error) throw new Error(up.error);

      await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId: mission.id, verifyType: "foto", date, photoUrl: up.url }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const submitRekam = async () => {
    await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ missionId: mission.id, verifyType: "rekam", date }),
    });
    setRecordOpen(false);
    router.refresh();
  };

  return (
    <div className="bg-card border border-line rounded-2xl p-3.5 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-xl ${TYPE_BG[mission.verify_type]} flex items-center justify-center text-lg flex-shrink-0`}
        >
          {mission.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-ink text-[13.5px]">{mission.name}</div>
          <div className="text-[11px] text-ink-soft font-medium">
            Jam berapa pun sebelum {mission.deadline_time}
          </div>
        </div>
        <div className="font-mono-brand text-[11px] font-bold text-amber">+{mission.stars}⭐</div>
      </div>

      {!submission && mission.verify_type === "foto" && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && submitFoto(e.target.files[0])}
          />
          <button
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="mt-2.5 w-full bg-coral text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
            {busy ? "Memproses..." : "Upload Bukti Foto"}
          </button>
        </>
      )}

      {!submission && mission.verify_type === "kuis" && (
        <>
          <input
            ref={quizFileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && setQuizFile(e.target.files[0])}
          />
          <button
            onClick={() => quizFileRef.current?.click()}
            className="mt-2.5 w-full bg-amber text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5"
          >
            <Brain size={13} /> Upload Materi
          </button>
        </>
      )}

      {!submission && mission.verify_type === "rekam" && (
        <button
          onClick={() => setRecordOpen(true)}
          className="mt-2.5 w-full bg-ungu text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5"
        >
          <Mic size={13} /> Mulai Rekam
        </button>
      )}

      {submission?.status === "pending" && (
        <div className="mt-2.5 inline-flex items-center gap-1.5 bg-amber-soft text-[#8a6a05] text-[10.5px] font-bold px-2.5 py-1.5 rounded-full">
          <Clock size={12} /> Menunggu Ortu
        </div>
      )}
      {submission?.status === "rejected" && (
        <div className="mt-2.5 inline-flex items-center gap-1.5 bg-stempel-soft text-stempel text-[10.5px] font-bold px-2.5 py-1.5 rounded-full">
          <X size={12} /> Ditolak — coba lagi
        </div>
      )}
      {submission?.status === "approved" && (
        <div className="mt-2.5 inline-flex items-center gap-1.5 bg-hijau-soft text-hijau text-[10.5px] font-bold px-2.5 py-1.5 rounded-full">
          <Check size={12} /> Disetujui, +{submission.stars_awarded} Bintang diterima
        </div>
      )}
      {submission?.status === "auto_done" && (
        <div className="mt-2.5 inline-flex items-center gap-1.5 bg-ungu-soft text-ungu text-[10.5px] font-bold px-2.5 py-1.5 rounded-full">
          🤖 Auto dinilai · {submission.score}/{submission.quiz_json?.length} · +{submission.stars_awarded}⭐
        </div>
      )}

      {recordOpen && (
        <RecordModal missionName={mission.name} onClose={() => setRecordOpen(false)} onDone={submitRekam} />
      )}
      {quizFile && (
        <QuizModal
          mission={mission}
          file={quizFile}
          date={date}
          onClose={() => setQuizFile(null)}
          onDone={() => {
            setQuizFile(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

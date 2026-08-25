"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { compressImageToBase64 } from "@/lib/imageCompress";
import type { Mission, QuizQuestion } from "@/lib/types";

export function QuizModal({
  mission,
  file,
  date,
  onClose,
  onDone,
}: {
  mission: Mission;
  file: File;
  date: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<"loading" | "soal" | "hasil" | "error">("loading");
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [error, setError] = useState("");
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { base64, mediaType } = await compressImageToBase64(file, 900, 0.75);
      if (cancelled) return;
      setPreview(`data:${mediaType};base64,${base64}`);
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      });
      const data = await res.json();
      if (cancelled) return;
      if (!res.ok) {
        setError(data.error || "Gagal membuat soal otomatis.");
        setPhase("error");
        return;
      }
      setQuiz(data.quiz);
      setPhase("soal");
    })();
    return () => {
      cancelled = true;
    };
  }, [file]);

  const next = async () => {
    if (sel === null || !quiz) return;
    const nowAnswers = [...answers, sel === quiz[qi].correctIndex];
    setAnswers(nowAnswers);
    setSel(null);
    if (qi + 1 < quiz.length) {
      setQi(qi + 1);
      return;
    }
    const score = nowAnswers.filter(Boolean).length;
    setPhase("hasil");
    await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        missionId: mission.id,
        verifyType: "kuis",
        date,
        quiz,
        score,
        answersCorrect: nowAnswers,
      }),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-[360px] bg-white rounded-[28px] overflow-hidden max-h-[85vh] flex flex-col">
        <TopBar title={mission.name} onBack={onClose} />
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {phase === "loading" && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-10">
              {preview && <img src={preview} alt="materi" className="w-16 h-16 object-cover rounded-xl" />}
              <Loader2 size={30} className="animate-spin text-amber" />
              <div className="font-bold text-ink text-sm">Membuat soal dari materimu…</div>
              <div className="text-xs text-ink-soft">Ditenagai Claude, tunggu sebentar</div>
            </div>
          )}
          {phase === "error" && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4 py-10">
              <AlertCircle size={30} className="text-stempel" />
              <div className="text-sm font-bold text-ink">{error}</div>
              <button onClick={onClose} className="text-xs font-bold text-coral mt-2">
                Tutup
              </button>
            </div>
          )}
          {phase === "soal" && quiz && (
            <div>
              <div className="text-[10.5px] font-bold text-ink-soft mb-1.5">
                Soal {qi + 1} dari {quiz.length}
              </div>
              <div className="h-1.5 bg-[#eef1f6] rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-amber rounded-full transition-all"
                  style={{ width: `${((qi + 1) / quiz.length) * 100}%` }}
                />
              </div>
              <div className="font-bold text-ink text-[15px] mb-4">{quiz[qi].question}</div>
              <div className="space-y-2">
                {quiz[qi].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setSel(i)}
                    className={`w-full text-left border rounded-xl px-3.5 py-3 text-[12.5px] font-semibold ${
                      sel === i ? "border-amber bg-amber-soft text-[#8a6a05]" : "border-line text-ink"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <button
                disabled={sel === null}
                onClick={next}
                className="w-full mt-5 bg-amber disabled:bg-[#e3e8f0] text-white font-bold text-xs py-3 rounded-xl"
              >
                {qi === quiz.length - 1 ? "Selesai" : "Lanjut"}
              </button>
            </div>
          )}
          {phase === "hasil" && (
            <div className="flex flex-col items-center text-center gap-2 pt-8">
              <div className="text-xs font-bold text-ink-soft">Kuis selesai</div>
              <div className="font-mono-brand text-4xl font-bold text-ink">
                {answers.filter(Boolean).length}/{quiz?.length}
              </div>
              <div className="text-xs font-bold text-ink-soft">Jawaban benar</div>
              <div className="bg-ungu-soft text-ungu font-bold text-xs px-3.5 py-2 rounded-full mt-2">
                🤖 Auto dinilai · +{mission.stars} Bintang masuk
              </div>
              <button onClick={onDone} className="bg-coral text-white font-bold text-xs py-2.5 px-6 rounded-xl mt-5">
                Kembali ke Beranda
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

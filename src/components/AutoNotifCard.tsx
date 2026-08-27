"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Submission, Mission, AppUser } from "@/lib/types";

export function AutoNotifCard({
  sub,
  mission,
  child,
}: {
  sub: Submission;
  mission?: Mission;
  child?: AppUser;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl p-3 card-shadow">
      <div className="flex gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-ungu-soft text-ungu flex items-center justify-center text-sm flex-shrink-0">
          🧠
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-navy text-[12px]">
            {child?.name} menyelesaikan {mission?.name}
          </div>
          <div className="text-[10px] text-muted font-semibold">
            Skor {sub.score}/{sub.quiz_json?.length} · +{sub.stars_awarded}⭐ otomatis masuk
          </div>
          <button onClick={() => setOpen(!open)} className="text-[10px] font-bold text-ungu mt-1 flex items-center gap-0.5">
            Lihat detail jawaban <ChevronDown size={11} className={open ? "rotate-180" : ""} />
          </button>
          {open && (
            <div className="mt-2 pt-2 border-t border-dashed border-border-color space-y-1">
              {sub.quiz_json?.map((q, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10.5px] font-semibold text-muted">
                  <span className={sub.answers_correct?.[i] ? "text-hijau" : "text-stempel"}>
                    {sub.answers_correct?.[i] ? "✓" : "✕"}
                  </span>
                  {q.question}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

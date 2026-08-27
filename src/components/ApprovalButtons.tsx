"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ApprovalButtons({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const act = async (action: "approve" | "reject") => {
    setBusy(true);
    await fetch(`/api/submissions/${submissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    router.refresh();
  };

  return (
    <div className="flex gap-1.5">
      <button
        disabled={busy}
        onClick={() => act("reject")}
        className="flex-1 border border-border-color text-muted font-bold text-[10.5px] py-1.5 rounded-lg disabled:opacity-60"
      >
        Tolak
      </button>
      <button
        disabled={busy}
        onClick={() => act("approve")}
        className="flex-1 bg-green text-white font-bold text-[10.5px] py-1.5 rounded-lg disabled:opacity-60"
      >
        Setujui ✓
      </button>
    </div>
  );
}

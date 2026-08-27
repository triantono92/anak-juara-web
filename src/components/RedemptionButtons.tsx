"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveRedemption, rejectRedemption } from "@/app/ortu/(app)/persetujuan/actions";

export function RedemptionButtons({ redemptionId }: { redemptionId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const act = async (action: "approve" | "reject") => {
    setBusy(true);
    try {
      if (action === "approve") {
        await approveRedemption(redemptionId);
      } else {
        await rejectRedemption(redemptionId);
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        disabled={busy}
        onClick={() => act("reject")}
        className="flex-1 border-2 border-border-color text-muted font-bold text-xs px-4 py-2 rounded-xl disabled:opacity-60"
      >
        Tolak
      </button>
      <button
        disabled={busy}
        onClick={() => act("approve")}
        className="flex-1 bg-green text-white font-bold text-xs px-4 py-2 rounded-xl btn-chunky disabled:opacity-60"
      >
        Setujui tukar
      </button>
    </div>
  );
}

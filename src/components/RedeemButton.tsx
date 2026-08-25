"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RedeemButton({
  rewardId,
  cost,
  currentStars,
}: {
  rewardId: string;
  cost: number;
  currentStars: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const enough = currentStars >= cost;

  return (
    <button
      disabled={!enough || busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/redemptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rewardId }),
        });
        setBusy(false);
        router.refresh();
      }}
      className={`text-[10.5px] font-bold py-1.5 rounded-lg ${
        enough ? "bg-hijau text-white" : "bg-[#eef1f6] text-ink-soft"
      }`}
    >
      {busy ? "Menukar..." : enough ? "Tukar" : `Kurang ${cost - currentStars}⭐`}
    </button>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toggleReward } from "@/app/ortu/(app)/hadiah/actions";

export function RewardToggle({ id, active, isWali = false }: { id: string; active: boolean; isWali?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (isWali) return null;

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleReward(id, active);
          router.refresh();
        })
      }
      className={`w-8 h-[19px] rounded-full relative transition-colors ${active ? "bg-green" : "bg-border-color"}`}
    >
      <span
        className={`absolute top-[2px] w-[15px] h-[15px] bg-white rounded-full transition-transform ${
          active ? "translate-x-[17px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

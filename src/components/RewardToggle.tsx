"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toggleReward } from "@/app/ortu/(app)/hadiah/actions";

export function RewardToggle({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleReward(id, active);
          router.refresh();
        })
      }
      className={`w-8 h-[19px] rounded-full relative transition-colors ${active ? "bg-hijau" : "bg-[#e3e8f0]"}`}
    >
      <span
        className={`absolute top-[2px] w-[15px] h-[15px] bg-white rounded-full transition-transform ${
          active ? "translate-x-[17px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

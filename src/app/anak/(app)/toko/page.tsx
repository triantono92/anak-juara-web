import { redirect } from "next/navigation";
import { Gift } from "lucide-react";
import { getChildSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { RedeemButton } from "@/components/RedeemButton";
import type { Reward } from "@/lib/types";

export default async function TokoPage() {
  const session = await getChildSession();
  if (!session) redirect("/anak/login");

  const supabase = createServiceClient();
  const { data: child } = await supabase.from("app_users").select("stars").eq("id", session.childId).single();
  const { data: rewards } = await supabase
    .from("rewards")
    .select("*")
    .eq("family_id", session.familyId)
    .eq("active", true);

  const myRewards: Reward[] = (rewards ?? []).filter(
    (r: Reward) => r.assigned_to === "all" || r.assigned_to === session.childId,
  );
  const stars = child?.stars ?? 0;

  return (
    <div className="px-4 pb-4 pt-4">
      <div className="bg-gradient-to-br from-ink to-ink-soft rounded-2xl p-4 text-white flex items-center justify-between mb-3">
        <div>
          <div className="text-[11px] opacity-75 font-semibold">Saldo Bintang Kamu</div>
          <div className="font-mono-brand text-xl font-bold mt-0.5">⭐ {stars}</div>
        </div>
        <Gift size={26} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {myRewards.map((r) => (
          <div key={r.id} className="bg-card border border-line rounded-2xl p-3 flex flex-col gap-2">
            <div className="text-2xl">{r.icon}</div>
            <div className="font-bold text-ink text-xs leading-tight">{r.name}</div>
            <div className="font-mono-brand text-[10.5px] font-bold text-amber">{r.stars_cost} ⭐</div>
            <RedeemButton rewardId={r.id} cost={r.stars_cost} currentStars={stars} />
          </div>
        ))}
        {myRewards.length === 0 && (
          <div className="col-span-2 text-xs text-ink-soft text-center py-6">Belum ada hadiah tersedia.</div>
        )}
      </div>
    </div>
  );
}

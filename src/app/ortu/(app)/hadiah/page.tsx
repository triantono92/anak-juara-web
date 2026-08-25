import { redirect } from "next/navigation";
import { getParentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RewardForm } from "@/components/RewardForm";
import { RewardToggle } from "@/components/RewardToggle";
import type { Reward, AppUser } from "@/lib/types";

export default async function HadiahManagerPage() {
  const user = await getParentUser();
  if (!user) redirect("/ortu/login");

  const supabase = await createClient();
  const { data: rewards } = await supabase.from("rewards").select("*").order("stars_cost");
  const { data: family } = await supabase.from("app_users").select("*").eq("role", "anak");

  return (
    <div className="px-4 py-4">
      <div className="font-display font-bold text-ink text-base mb-3">Kelola Hadiah</div>
      <div className="space-y-2.5 mb-4">
        {(rewards as Reward[] | null)?.map((r) => (
          <div key={r.id} className="bg-card border border-line rounded-2xl p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-soft flex items-center justify-center text-sm flex-shrink-0">{r.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-ink text-xs">{r.name}</div>
              <div className="text-[10px] text-ink-soft font-semibold">
                Kategori: {r.category} ·{" "}
                {r.assigned_to === "all" ? "Semua Anak" : (family as AppUser[] | null)?.find((f) => f.id === r.assigned_to)?.name}
              </div>
            </div>
            <div className="font-mono-brand text-[11px] font-bold text-amber">⭐{r.stars_cost}</div>
            <RewardToggle id={r.id} active={r.active} />
          </div>
        ))}
        {(!rewards || rewards.length === 0) && <div className="text-xs text-ink-soft text-center py-4">Belum ada hadiah.</div>}
      </div>
      <RewardForm kids={(family as AppUser[]) ?? []} />
    </div>
  );
}

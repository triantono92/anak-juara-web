import { redirect } from "next/navigation";
import { getChildSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { RedeemButton } from "@/components/RedeemButton";
import type { Reward } from "@/lib/types";
import Link from "next/link";

export default async function HadiahPage() {
  const session = await getChildSession();
  if (!session) redirect("/masuk");

  const supabase = createServiceClient();
  const [{ data: child }, { data: rewards }, { data: redemptions }] = await Promise.all([
    supabase.from("app_users").select("stars").eq("id", session.childId).single(),
    supabase
      .from("rewards")
      .select("*")
      .eq("family_id", session.familyId)
      .eq("active", true),
    supabase
      .from("redemptions")
      .select("reward_id, status")
      .eq("child_id", session.childId)
      .order("timestamp", { ascending: false }),
  ]);

  const stars = child?.stars ?? 0;
  const myRewards: Reward[] = (rewards ?? []).filter(
    (r: Reward) => r.assigned_to === "all" || r.assigned_to === session.childId,
  );

  const pendingIds = new Set(
    (redemptions ?? [])
      .filter(
        (r: { reward_id: string; status: string }) => r.status === "menunggu",
      )
      .map((r: { reward_id: string }) => r.reward_id),
  );

  const targetReward = myRewards.find((r) => r.stars_cost > stars);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-yellow px-4 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div className="font-display font-bold text-navy text-xl">Toko Hadiah</div>
          <Link href="/anak/laporan" className="text-navy/70 text-xs font-bold underline">
            Riwayat
          </Link>
        </div>
        {/* Saldo */}
        <div className="mt-3 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center font-bold text-navy text-lg">
            &#9733;
          </div>
          <div>
            <div className="font-display font-bold text-navy text-2xl">{stars}</div>
            <div className="text-navy/60 text-[10px] font-semibold">bintang tersedia</div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Progress kartu target */}
        {targetReward && (
          <div className="bg-navy rounded-2xl p-4 text-white">
            <div className="text-xs opacity-70 mb-1">Target selanjutnya</div>
            <div className="font-bold text-sm mb-2">{targetReward.name}</div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white/20 rounded-full h-2">
                <div
                  className="bg-yellow rounded-full h-2"
                  style={{
                    width: `${Math.min(100, (stars / targetReward.stars_cost) * 100)}%`,
                  }}
                />
              </div>
              <span className="text-yellow text-xs font-bold whitespace-nowrap">
                &#9733; {stars} / {targetReward.stars_cost}
              </span>
            </div>
          </div>
        )}

        {/* Grid hadiah */}
        <div className="grid grid-cols-2 gap-3">
          {myRewards.map((r) => {
            const canAfford = stars >= r.stars_cost;
            const isPending = pendingIds.has(r.id);
            return (
              <div
                key={r.id}
                className={`bg-white rounded-2xl p-3 card-shadow flex flex-col gap-2 ${
                  isPending
                    ? "border-2 border-orange"
                    : !canAfford
                      ? "opacity-60"
                      : ""
                }`}
              >
                {/* Placeholder gambar */}
                <div
                  className="w-full aspect-square rounded-xl"
                  style={{
                    background:
                      "repeating-linear-gradient(135deg, #f0f5fa 0 10px, #e1eaf2 10px 20px)",
                  }}
                />
                <div className="font-bold text-navy text-xs leading-tight">{r.name}</div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow font-bold text-xs">&#9733;</span>
                  <span className="font-display font-bold text-navy text-sm">
                    {r.stars_cost}
                  </span>
                </div>
                {isPending ? (
                  <div className="text-[10px] font-bold text-orange bg-[#FEF3DC] rounded-lg px-2 py-1 text-center">
                    Diproses...
                  </div>
                ) : (
                  <RedeemButton rewardId={r.id} cost={r.stars_cost} currentStars={stars} />
                )}
              </div>
            );
          })}
          {myRewards.length === 0 && (
            <div className="col-span-2 text-center py-10 text-muted text-sm">
              Belum ada hadiah tersedia.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

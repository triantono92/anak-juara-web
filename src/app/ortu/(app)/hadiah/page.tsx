import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentAppUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RewardToggle } from "@/components/RewardToggle";
import { RewardForm } from "@/components/RewardForm";
import type { Reward, AppUser, Redemption } from "@/lib/types";

export default async function HadiahManagerPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== "ortu") redirect("/masuk");
  const isWali = user.parentRole === "wali";

  const params = await searchParams;
  const filter = params.filter ?? "semua";

  const supabase = await createClient();
  const [{ data: rewards }, { data: family }, { data: redemptions }] =
    await Promise.all([
      supabase.from("rewards").select("*").order("stars_cost"),
      supabase.from("app_users").select("*").eq("role", "anak"),
      supabase.from("redemptions").select("*"),
    ]);

  const rewardList = (rewards as Reward[] | null) ?? [];
  const kids = (family as AppUser[] | null) ?? [];
  const redemptionList = (redemptions as Redemption[] | null) ?? [];

  // Stats
  const totalStarsBeredar = kids.reduce((s, k) => s + k.stars, 0);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const ditukarBulanIni = redemptionList
    .filter((r) => new Date(r.timestamp) >= monthStart)
    .reduce((s, r) => s + r.stars_spent, 0);

  const FILTERS = [
    { key: "semua", label: "Semua" },
    { key: "Privilege", label: "Privilege" },
    { key: "Barang", label: "Barang" },
    { key: "Uang", label: "Uang" },
  ];

  const filteredRewards =
    filter === "semua"
      ? rewardList
      : rewardList.filter((r) => r.category === filter);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white px-4 pt-5 pb-0 card-shadow sticky top-0 z-10">
        <div className="font-display font-bold text-navy text-xl mb-3">
          Kelola Hadiah
        </div>

        {/* Stats */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 bg-grey-bg rounded-xl px-3 py-2.5 text-center">
            <div className="font-display font-bold text-navy text-lg">
              ★{totalStarsBeredar}
            </div>
            <div className="text-muted text-[10px] font-semibold">
              Bintang beredar
            </div>
          </div>
          <div className="flex-1 bg-grey-bg rounded-xl px-3 py-2.5 text-center">
            <div className="font-display font-bold text-navy text-lg">
              ★{ditukarBulanIni}
            </div>
            <div className="text-muted text-[10px] font-semibold">
              Ditukar bulan ini
            </div>
          </div>
          <div className="flex-1 bg-grey-bg rounded-xl px-3 py-2.5 text-center">
            <div className="font-display font-bold text-navy text-lg">
              {rewardList.filter((r) => r.active).length}
            </div>
            <div className="text-muted text-[10px] font-semibold">
              Hadiah aktif
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 overflow-x-auto pb-3">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={`/ortu/hadiah?filter=${f.key}`}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold border-2 ${
                filter === f.key
                  ? "border-navy bg-navy text-white"
                  : "border-border-color text-muted bg-white"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Daftar hadiah */}
        {filteredRewards.map((r: Reward) => {
          const assignedKid =
            r.assigned_to === "all"
              ? null
              : kids.find((k) => k.id === r.assigned_to);
          return (
            <div
              key={r.id}
              className={`bg-white rounded-2xl p-4 card-shadow flex items-center gap-3 ${
                !r.active ? "opacity-60" : ""
              }`}
            >
              {/* Thumbnail placeholder */}
              <div className="w-12 h-12 rounded-xl bg-[#FFF0E5] flex items-center justify-center flex-shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  width={24}
                  height={24}
                  fill="none"
                >
                  <rect
                    x="2"
                    y="7"
                    width="20"
                    height="5"
                    rx="2"
                    stroke="#F58634"
                    strokeWidth="1.8"
                  />
                  <rect
                    x="3"
                    y="12"
                    width="18"
                    height="10"
                    rx="2"
                    stroke="#F58634"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M12 7v15"
                    stroke="#F58634"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M12 7c0-2-2-4 0-4s0 4 0 4M12 7c0-2 2-4 0-4"
                    stroke="#F58634"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-navy text-sm">{r.name}</div>
                <div className="text-muted text-xs">
                  ★ {r.stars_cost} · {r.category}
                  {assignedKid ? ` · ${assignedKid.name}` : " · Semua"}
                  {r.stok !== null ? ` · Stok: ${r.stok}` : ""}
                  {r.batas_per_minggu !== null
                    ? ` · Maks ${r.batas_per_minggu}/minggu`
                    : ""}
                </div>
              </div>
              <RewardToggle id={r.id} active={r.active} isWali={isWali} />
            </div>
          );
        })}

        {filteredRewards.length === 0 && (
          <div className="text-center py-8 text-muted text-sm">
            Belum ada hadiah {filter !== "semua" ? `kategori ${filter}` : ""}.
          </div>
        )}

        {/* Tombol tambah */}
        {!isWali && <RewardForm kids={kids} />}
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { getParentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ApprovalButtons } from "@/components/ApprovalButtons";
import { RedemptionButtons } from "@/components/RedemptionButtons";
import type { Submission, Mission, AppUser, Redemption } from "@/lib/types";

export default async function PersetujuanPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await getParentUser();
  if (!user) redirect("/masuk");

  const params = await searchParams;
  const tab = params.tab ?? "semua";

  const supabase = await createClient();

  const [
    { data: pendingSubmissions },
    { data: missions },
    { data: family },
    { data: pendingRedemptions },
    { data: pendingMembers },
  ] = await Promise.all([
    supabase
      .from("submissions")
      .select("*")
      .eq("status", "pending")
      .order("timestamp", { ascending: false }),
    supabase.from("missions").select("*"),
    supabase.from("app_users").select("*"),
    supabase
      .from("redemptions")
      .select("*, rewards(name, stars_cost)")
      .eq("status", "menunggu")
      .order("timestamp", { ascending: false }),
    supabase.from("app_users").select("*").eq("member_status", "menunggu"),
  ]);

  const missionOf = (id: string) =>
    (missions as Mission[] | null)?.find((m) => m.id === id);
  const childOf = (id: string) =>
    (family as AppUser[] | null)?.find((f) => f.id === id);

  const submissionList = (pendingSubmissions as Submission[] | null) ?? [];
  const redemptionList = (pendingRedemptions as (Redemption & { rewards?: { name: string; stars_cost: number } })[] | null) ?? [];
  const memberList = (pendingMembers as AppUser[] | null) ?? [];

  const totalPending =
    submissionList.length + redemptionList.length + memberList.length;

  const TABS = [
    { key: "semua", label: "Semua" },
    { key: "bukti", label: "Bukti misi" },
    { key: "hadiah", label: "Hadiah" },
    { key: "akun", label: "Akun" },
  ];

  const showBukti = tab === "semua" || tab === "bukti";
  const showHadiah = tab === "semua" || tab === "hadiah";
  const showAkun = tab === "semua" || tab === "akun";

  return (
    <div className="flex flex-col min-h-full">
      {/* Header sticky */}
      <div className="bg-white px-4 pt-5 pb-0 card-shadow sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="font-display font-bold text-navy text-xl">Persetujuan</div>
          {totalPending > 0 && (
            <span className="bg-orange text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {totalPending} menunggu
            </span>
          )}
        </div>
        {/* Filter tabs */}
        <div className="flex gap-1 overflow-x-auto pb-3">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/ortu/persetujuan?tab=${t.key}`}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold border-2 ${
                tab === t.key
                  ? "border-navy bg-navy text-white"
                  : "border-border-color text-muted bg-white"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3">
        {/* Bukti misi */}
        {showBukti &&
          submissionList.map((s: Submission) => {
            const mission = missionOf(s.mission_id);
            const child = childOf(s.child_id);
            const initials = (child?.name ?? "AN")
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <div key={s.id} className="bg-white rounded-2xl p-4 card-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
                    style={{
                      backgroundColor: (child?.avatar_color ?? "#3EA8DE") + "33",
                      color: child?.avatar_color ?? "#3EA8DE",
                    }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-navy text-sm">
                      {child?.name} · {mission?.name}
                    </div>
                    <div className="text-muted text-xs">
                      Bukti {s.verify_type} ·{" "}
                      {new Date(s.timestamp).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      · ★ {mission?.stars}
                    </div>
                  </div>
                </div>
                {s.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.photo_url}
                    className="w-full h-32 object-cover rounded-xl mb-3"
                    alt="bukti"
                  />
                )}
                {s.verify_type === "rekam" && !s.photo_url && (
                  <div className="bg-[#EEF3F7] rounded-xl h-14 flex items-center justify-center mb-3">
                    <span className="text-muted text-sm font-semibold">
                      Rekaman audio
                    </span>
                  </div>
                )}
                <ApprovalButtons submissionId={s.id} />
              </div>
            );
          })}

        {/* Penukaran hadiah */}
        {showHadiah &&
          redemptionList.map(
            (
              r: Redemption & {
                rewards?: { name: string; stars_cost: number };
              }
            ) => {
              const child = childOf(r.child_id);
              const initials = (child?.name ?? "AN")
                .split(" ")
                .map((w: string) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              const rewardName = r.reward_name || r.rewards?.name || "Hadiah";
              const cost = r.stars_spent || r.rewards?.stars_cost || 0;
              return (
                <div key={r.id} className="bg-white rounded-2xl p-4 card-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
                      style={{
                        backgroundColor:
                          (child?.avatar_color ?? "#3EA8DE") + "33",
                        color: child?.avatar_color ?? "#3EA8DE",
                      }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-navy text-sm">
                        {child?.name} ingin tukar hadiah
                      </div>
                      <div className="text-muted text-xs">
                        {rewardName} · ★ {cost} · sisa{" "}
                        {child?.stars ?? 0} bintang
                      </div>
                    </div>
                  </div>
                  <RedemptionButtons redemptionId={r.id} />
                </div>
              );
            }
          )}

        {/* Anggota baru */}
        {showAkun &&
          memberList.map((m: AppUser) => {
            const initials = m.name
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <div key={m.id} className="bg-white rounded-2xl p-4 card-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF3F7] flex items-center justify-center font-display font-bold text-sm flex-shrink-0 text-muted">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-navy text-sm">
                      Akun baru: {m.name}
                    </div>
                    <div className="text-muted text-xs">
                      {m.role === "anak"
                        ? `Anak${m.age ? `, ${m.age} th` : ""}`
                        : `${m.parent_role ?? "ortu"}`}{" "}
                      · status menunggu
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        {/* Empty state */}
        {totalPending === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-[#C8F5EC] flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" width={32} height={32} fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="#35C0A0"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="font-display font-bold text-navy text-lg mb-1">
              Semua sudah beres!
            </div>
            <div className="text-muted text-sm">
              Tidak ada yang menunggu persetujuan
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

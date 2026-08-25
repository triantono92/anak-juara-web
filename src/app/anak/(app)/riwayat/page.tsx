import { redirect } from "next/navigation";
import { getChildSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { Submission, Redemption, Mission } from "@/lib/types";

export default async function RiwayatPage() {
  const session = await getChildSession();
  if (!session) redirect("/anak/login");

  const supabase = createServiceClient();
  const [{ data: submissions }, { data: redemptions }, { data: missions }] = await Promise.all([
    supabase.from("submissions").select("*").eq("child_id", session.childId).order("timestamp", { ascending: false }).limit(20),
    supabase.from("redemptions").select("*").eq("child_id", session.childId).order("timestamp", { ascending: false }).limit(20),
    supabase.from("missions").select("id, name").eq("family_id", session.familyId),
  ]);

  const missionName = (id: string) => (missions as Pick<Mission, "id" | "name">[] | null)?.find((m) => m.id === id)?.name ?? "Misi";

  const history = [
    ...(submissions ?? []).map((s: Submission) => ({
      ts: s.timestamp,
      title: missionName(s.mission_id),
      meta:
        s.status === "approved"
          ? "Disetujui"
          : s.status === "rejected"
            ? "Ditolak"
            : s.status === "auto_done"
              ? `Auto dinilai · ${s.score}/${s.quiz_json?.length}`
              : "Menunggu",
      pts: s.status === "rejected" || s.status === "pending" ? 0 : s.stars_awarded,
    })),
    ...(redemptions ?? []).map((r: Redemption) => ({
      ts: r.timestamp,
      title: `Tukar: ${r.reward_name}`,
      meta: "",
      pts: -r.stars_spent,
    })),
  ].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

  return (
    <div className="px-4 pb-4 pt-4">
      <div className="font-display font-bold text-ink text-base mb-3">Riwayat Aktivitas</div>
      <div className="space-y-1.5">
        {history.length === 0 && <div className="text-xs text-ink-soft">Belum ada aktivitas.</div>}
        {history.map((h, i) => (
          <div key={i} className="bg-card border border-line rounded-xl px-3 py-2 flex items-center justify-between">
            <div className="min-w-0">
              <div className="font-bold text-ink text-[11px] truncate">{h.title}</div>
              {h.meta && <div className="text-[9.5px] text-ink-soft font-semibold">{h.meta}</div>}
            </div>
            <div className={`font-mono-brand text-[10.5px] font-bold flex-shrink-0 ${h.pts < 0 ? "text-stempel" : "text-amber"}`}>
              {h.pts >= 0 ? "+" : ""}
              {h.pts}⭐
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

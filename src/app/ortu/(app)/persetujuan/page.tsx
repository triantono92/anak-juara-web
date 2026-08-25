import { redirect } from "next/navigation";
import { Check, Mic } from "lucide-react";
import { getParentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ApprovalButtons } from "@/components/ApprovalButtons";
import { AutoNotifCard } from "@/components/AutoNotifCard";
import type { Submission, Mission, AppUser } from "@/lib/types";

export default async function PersetujuanPage() {
  const user = await getParentUser();
  if (!user) redirect("/ortu/login");

  const supabase = await createClient();

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*")
    .in("status", ["pending", "auto_done"])
    .order("timestamp", { ascending: false });

  const { data: missions } = await supabase.from("missions").select("*");
  const { data: family } = await supabase.from("app_users").select("*");

  const missionOf = (id: string) => (missions as Mission[] | null)?.find((m) => m.id === id);
  const childOf = (id: string) => (family as AppUser[] | null)?.find((f) => f.id === id);

  const pending = (submissions ?? []).filter((s: Submission) => s.status === "pending");
  const autoNotifs = (submissions ?? []).filter((s: Submission) => s.status === "auto_done").slice(0, 8);

  return (
    <div className="px-4 py-4 space-y-5">
      <div>
        <div className="font-bold text-ink text-sm mb-2.5 flex items-center gap-1.5 font-display">
          <Check size={15} /> Perlu Aksi Kamu
        </div>
        {pending.length === 0 && <div className="text-xs text-ink-soft py-4">Tidak ada yang menunggu persetujuan 🎉</div>}
        <div className="space-y-2.5">
          {pending.map((s: Submission) => {
            const mission = missionOf(s.mission_id);
            const child = childOf(s.child_id);
            return (
              <div key={s.id} className="bg-card border border-line rounded-2xl p-3 flex gap-3">
                {s.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.photo_url} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" alt="bukti" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-ungu-soft flex items-center justify-center flex-shrink-0">
                    <Mic size={18} className="text-ungu" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-ink text-xs">{mission?.name}</div>
                  <div className="text-[10px] text-ink-soft font-semibold mb-2">
                    {child?.name} · +{mission?.stars}⭐
                  </div>
                  <ApprovalButtons submissionId={s.id} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="font-bold text-ink text-sm mb-2.5 font-display">🤖 Info Terbaru</div>
        {autoNotifs.length === 0 && <div className="text-xs text-ink-soft">Belum ada kuis yang selesai.</div>}
        <div className="space-y-2">
          {autoNotifs.map((s: Submission) => (
            <AutoNotifCard key={s.id} sub={s} mission={missionOf(s.mission_id)} child={childOf(s.child_id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

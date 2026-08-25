import { redirect } from "next/navigation";
import { getParentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MissionForm } from "@/components/MissionForm";
import type { Mission, AppUser } from "@/lib/types";

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export default async function MisiManagerPage() {
  const user = await getParentUser();
  if (!user) redirect("/ortu/login");

  const supabase = await createClient();
  const { data: missions } = await supabase.from("missions").select("*").order("created_at", { ascending: false });
  const { data: family } = await supabase.from("app_users").select("*").eq("role", "anak");

  return (
    <div className="px-4 py-4">
      <div className="font-display font-bold text-ink text-base mb-3">Kelola Misi</div>
      <div className="space-y-2.5 mb-4">
        {(missions as Mission[] | null)?.map((m) => (
          <div key={m.id} className="bg-card border border-line rounded-2xl p-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#eef1f6] flex items-center justify-center text-sm flex-shrink-0">
                {m.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-ink text-xs">{m.name}</div>
                <div className="text-[10px] text-ink-soft font-semibold">
                  Verifikasi: {m.verify_type} · Sebelum {m.deadline_time}
                </div>
              </div>
              <div className="font-mono-brand text-[11px] font-bold text-amber">⭐{m.stars}</div>
            </div>
            <div className="flex gap-1 mt-2">
              {DAYS.map((d, i) => (
                <span
                  key={i}
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[8.5px] font-bold ${
                    m.days.includes(i) ? "bg-hijau-soft text-hijau" : "bg-[#f4f6fa] text-[#c3ccdc]"
                  }`}
                >
                  {d[0]}
                </span>
              ))}
            </div>
          </div>
        ))}
        {(!missions || missions.length === 0) && (
          <div className="text-xs text-ink-soft text-center py-4">Belum ada misi.</div>
        )}
      </div>
      <MissionForm kids={(family as AppUser[]) ?? []} />
    </div>
  );
}

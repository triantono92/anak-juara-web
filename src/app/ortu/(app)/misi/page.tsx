import { redirect } from "next/navigation";
import { getParentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MissionForm } from "@/components/MissionForm";
import { OrtuMissionCard } from "@/components/OrtuMissionCard";
import type { Mission, AppUser } from "@/lib/types";

export default async function MisiManagerPage() {
  const user = await getParentUser();
  if (!user) redirect("/ortu/login");

  const supabase = await createClient();
  const { data: missions } = await supabase
    .from("missions")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: family } = await supabase
    .from("app_users")
    .select("*")
    .eq("role", "anak");

  const kids = (family as AppUser[]) ?? [];

  return (
    <div className="px-4 py-4">
      <div className="font-display font-bold text-ink text-base mb-3">Kelola Misi</div>
      <div className="space-y-2.5 mb-4">
        {(missions as Mission[] | null)?.map((m) => (
          <OrtuMissionCard key={m.id} mission={m} kids={kids} />
        ))}
        {(!missions || missions.length === 0) && (
          <div className="text-xs text-ink-soft text-center py-4">Belum ada misi.</div>
        )}
      </div>
      <MissionForm kids={kids} />
    </div>
  );
}

import { redirect } from "next/navigation";
import { getChildSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/Avatar";
import { StarPill } from "@/components/StarPill";
import { MissionCard } from "@/components/MissionCard";
import { LogoutButton } from "@/components/LogoutButton";
import type { Mission, Submission } from "@/lib/types";

const todayIdx = () => (new Date().getDay() + 6) % 7; // 0=Senin
const todayStr = () => new Date().toISOString().slice(0, 10);

export default async function MisiPage() {
  const session = await getChildSession();
  if (!session) redirect("/anak/login");

  const supabase = createServiceClient();

  const { data: child } = await supabase
    .from("app_users")
    .select("id, name, avatar_color, stars")
    .eq("id", session.childId)
    .single();

  const { data: missions } = await supabase
    .from("missions")
    .select("*")
    .eq("family_id", session.familyId)
    .eq("active", true);

  const today = todayStr();
  const todayIndex = todayIdx();
  const myMissions: Mission[] = (missions ?? []).filter(
    (m: Mission) => m.assigned_to.includes(session.childId) && m.days.includes(todayIndex),
  );

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*")
    .eq("child_id", session.childId)
    .eq("date", today);

  const subByMission = new Map<string, Submission>((submissions ?? []).map((s: Submission) => [s.mission_id, s]));

  if (!child) redirect("/anak/login");

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2.5">
          <Avatar name={child.name} color={child.avatar_color} size={40} />
          <div>
            <div className="font-display font-bold text-ink text-base">Halo, {child.name}! 👋</div>
            <LogoutButton />
          </div>
        </div>
        <StarPill value={child.stars} />
      </div>

      <div className="px-4 pb-4 pt-2 space-y-3">
        <div className="font-display font-bold text-ink text-[17px] mb-1">Misi Hari Ini</div>
        {myMissions.length === 0 && (
          <div className="text-sm text-ink-soft py-6 text-center">
            Tidak ada misi terjadwal hari ini 🎉
          </div>
        )}
        {myMissions.map((m) => (
          <MissionCard key={m.id} mission={m} submission={subByMission.get(m.id) ?? null} date={today} />
        ))}
      </div>
    </div>
  );
}

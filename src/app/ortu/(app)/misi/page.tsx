import { redirect } from "next/navigation";
import { getParentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Mission, AppUser } from "@/lib/types";
import { OrtuMisiClient } from "@/components/OrtuMisiClient";

export default async function OrtuMisiPage() {
  const user = await getParentUser();
  if (!user) redirect("/masuk");

  const supabase = await createClient();
  const [{ data: missions }, { data: family }] = await Promise.all([
    supabase
      .from("missions")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("app_users").select("*").eq("role", "anak"),
  ]);

  const missionList = (missions as Mission[] | null) ?? [];
  const kids = (family as AppUser[] | null) ?? [];

  const activeMissions = missionList.filter((m) => m.active);
  const dailyMissions = missionList.filter(
    (m) => m.active && (m.grup ?? "Harian") === "Harian"
  );
  const avgStars =
    activeMissions.length > 0
      ? Math.round(
          activeMissions.reduce((s, m) => s + m.stars, 0) /
            activeMissions.length
        )
      : 0;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white px-4 pt-5 pb-4 card-shadow">
        <div className="font-display font-bold text-navy text-xl mb-4">
          Master Misi
        </div>
        {/* Stats */}
        <div className="flex gap-2">
          <div className="flex-1 bg-grey-bg rounded-xl px-3 py-2.5 text-center">
            <div className="font-display font-bold text-navy text-lg">
              {activeMissions.length}
            </div>
            <div className="text-muted text-[10px] font-semibold">Misi aktif</div>
          </div>
          <div className="flex-1 bg-grey-bg rounded-xl px-3 py-2.5 text-center">
            <div className="font-display font-bold text-navy text-lg">
              {dailyMissions.length}
            </div>
            <div className="text-muted text-[10px] font-semibold">Harian</div>
          </div>
          <div className="flex-1 bg-grey-bg rounded-xl px-3 py-2.5 text-center">
            <div className="font-display font-bold text-navy text-lg">
              ★{avgStars}
            </div>
            <div className="text-muted text-[10px] font-semibold">Rata poin</div>
          </div>
        </div>
      </div>

      <OrtuMisiClient missions={missionList} kids={kids} />
    </div>
  );
}

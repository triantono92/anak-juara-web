import { redirect } from "next/navigation";
import { getChildSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { Submission, MissionKategori } from "@/lib/types";

const GRADE = (pct: number) =>
  pct >= 90 ? "A" : pct >= 75 ? "B" : pct >= 60 ? "C" : "D";

export default async function LaporanPage() {
  const session = await getChildSession();
  if (!session) redirect("/masuk");

  const supabase = createServiceClient();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [{ data: child }, { data: submissions }, { data: allMissions }] = await Promise.all([
    supabase.from("app_users").select("name, stars").eq("id", session.childId).single(),
    supabase
      .from("submissions")
      .select("*")
      .eq("child_id", session.childId)
      .gte("date", sevenDaysAgo.toISOString().slice(0, 10))
      .order("date"),
    supabase
      .from("missions")
      .select("id, name, kategori")
      .eq("family_id", session.familyId),
  ]);

  const missionMap = new Map(
    (allMissions ?? []).map(
      (m: { id: string; name: string; kategori?: string }) => [m.id, m],
    ),
  );

  // Hitung statistik per hari (7 hari terakhir)
  const dayLabels: string[] = [];
  const dayStars: number[] = [];
  const maxStars = { val: 0, idx: 0 };
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().slice(0, 10);
    const dayName = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"][d.getDay()];
    dayLabels.push(dayName);
    const subs = (submissions ?? []).filter(
      (s: Submission) =>
        s.date === dateStr && ["approved", "auto_done"].includes(s.status),
    );
    const stars = subs.reduce((sum: number, s: Submission) => sum + s.stars_awarded, 0);
    dayStars.push(stars);
    if (stars > maxStars.val) {
      maxStars.val = stars;
      maxStars.idx = 6 - i;
    }
  }

  const totalDone = (submissions ?? []).filter((s: Submission) =>
    ["approved", "auto_done"].includes(s.status),
  ).length;
  const totalSubs = (submissions ?? []).length;
  const consistency = totalSubs > 0 ? Math.round((totalDone / totalSubs) * 100) : 0;
  const totalStars = dayStars.reduce((a, b) => a + b, 0);

  // Per kategori
  const katMap = new Map<MissionKategori, { done: number; total: number }>();
  (submissions ?? []).forEach((s: Submission) => {
    const m = missionMap.get(s.mission_id);
    const k = ((m as { kategori?: string } | undefined)?.kategori ?? "Netral") as MissionKategori;
    if (!katMap.has(k)) katMap.set(k, { done: 0, total: 0 });
    katMap.get(k)!.total++;
    if (["approved", "auto_done"].includes(s.status)) katMap.get(k)!.done++;
  });

  const KATCOLOR: Record<string, string> = {
    Ibadah: "#1F8F76",
    Belajar: "#6B4FD1",
    Rumah: "#C25E12",
    Sehat: "#1B7FB8",
    Sekolah: "#8A6100",
    Netral: "#8AA3BB",
  };

  const barMax = Math.max(...dayStars, 1);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-green text-white px-4 pt-5 pb-4">
        <div className="font-display font-bold text-xl mb-1">Raporku</div>
        <div className="text-white/80 text-xs">7 hari terakhir</div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Summary card */}
        <div className="bg-green rounded-2xl p-4 text-white">
          <div className="font-bold text-sm mb-1">Kerja bagus, {child?.name}!</div>
          <div className="text-xs opacity-80">
            {totalDone} dari {totalSubs} misi selesai · {consistency}% konsisten
          </div>
        </div>

        {/* Bar chart */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="font-bold text-navy text-sm mb-3">Bintang per hari</div>
          <div className="flex items-end gap-2 h-24">
            {dayStars.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-lg"
                  style={{
                    height: `${Math.max(4, (s / barMax) * 80)}px`,
                    backgroundColor: i === maxStars.idx ? "#F58634" : "#BFE4F7",
                  }}
                />
                <div className="text-[9px] text-muted font-bold">{dayLabels[i]}</div>
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-yellow font-bold mt-2">
            &#9733; {totalStars} bintang minggu ini
          </div>
        </div>

        {/* Per kategori */}
        {katMap.size > 0 && (
          <div className="bg-white rounded-2xl p-4 card-shadow">
            <div className="font-bold text-navy text-sm mb-3">Nilai per kategori</div>
            <div className="space-y-2.5">
              {[...katMap.entries()].map(([k, v]) => {
                const pct = v.total > 0 ? Math.round((v.done / v.total) * 100) : 0;
                return (
                  <div key={k} className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: KATCOLOR[k] }}
                    />
                    <div className="text-xs text-navy font-semibold w-16 flex-shrink-0">
                      {k}
                    </div>
                    <div className="flex-1 bg-[#f0f5f9] rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: KATCOLOR[k] }}
                      />
                    </div>
                    <div className="text-xs font-bold text-navy w-5 text-right">
                      {GRADE(pct)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Riwayat terbaru */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="font-bold text-navy text-sm mb-3">Riwayat terbaru</div>
          <div className="space-y-2">
            {(submissions ?? []).length === 0 && (
              <div className="text-center py-4 text-muted text-sm">
                Belum ada aktivitas.
              </div>
            )}
            {(submissions ?? []).slice(0, 8).map((s: Submission) => {
              const m = missionMap.get(s.mission_id);
              const good = ["approved", "auto_done"].includes(s.status);
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      good ? "bg-green" : "bg-muted"
                    }`}
                  />
                  <div className="flex-1 text-xs text-navy truncate">
                    {(m as { name: string } | undefined)?.name ?? "Misi"}
                  </div>
                  <div
                    className={`text-xs font-bold ${good ? "text-green" : "text-muted"}`}
                  >
                    {good ? `+${s.stars_awarded}` : "\u00d7"}&#9733;
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

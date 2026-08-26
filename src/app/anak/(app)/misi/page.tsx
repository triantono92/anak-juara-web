import { redirect } from "next/navigation";
import { getChildSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { MissionCard } from "@/components/MissionCard";
import Link from "next/link";
import type { Mission, Submission, MissionKategori } from "@/lib/types";

const todayIdx = () => (new Date().getDay() + 6) % 7;
const todayStr = () => new Date().toISOString().slice(0, 10);

export default async function MisiPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; kategori?: string }>;
}) {
  const session = await getChildSession();
  if (!session) redirect("/masuk");
  const params = await searchParams;
  const tab = params.tab ?? "hari-ini";
  const activeKat = params.kategori ?? "Semua";

  const supabase = createServiceClient();
  const today = todayStr();
  const todayIndex = todayIdx();

  const [{ data: child }, { data: missions }, { data: submissions }] = await Promise.all([
    supabase.from("app_users").select("stars").eq("id", session.childId).single(),
    supabase.from("missions").select("*").eq("family_id", session.familyId).eq("active", true),
    supabase.from("submissions").select("*").eq("child_id", session.childId).eq("date", today),
  ]);

  const allMissions: Mission[] = missions ?? [];
  const myMissions = allMissions.filter(
    (m) => m.assigned_to.includes(session.childId) && m.days.includes(todayIndex),
  );

  const filteredMissions =
    activeKat === "Semua"
      ? myMissions
      : myMissions.filter((m) => (m.kategori ?? "Netral") === activeKat);

  const subMap = new Map(
    (submissions ?? []).map((s: Submission) => [s.mission_id, s]),
  );

  const usedKat = [
    ...new Set(myMissions.map((m) => m.kategori ?? "Netral")),
  ] as MissionKategori[];

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-brand-blue text-white px-4 pt-5 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="font-display font-bold text-xl">Misiku</div>
          <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
            <span className="text-yellow font-bold text-sm">&#9733;</span>
            <span className="font-display font-bold text-sm">{child?.stars ?? 0}</span>
          </div>
        </div>
        {/* Tab */}
        <div className="flex gap-1 bg-white/15 rounded-xl p-1 mt-3">
          {[
            { key: "hari-ini", label: "Hari ini" },
            { key: "riwayat", label: "Riwayat" },
          ].map((t) => (
            <Link
              key={t.key}
              href={`/anak/misi?tab=${t.key}`}
              className={`flex-1 text-center py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === t.key ? "bg-white text-brand-blue" : "text-white/80"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {tab === "hari-ini" && (
        <div className="flex-1 p-4 space-y-3">
          {/* Kategori filter */}
          {usedKat.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              <Link
                href="/anak/misi?tab=hari-ini&kategori=Semua"
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border-2 ${
                  activeKat === "Semua"
                    ? "bg-navy text-white border-navy"
                    : "border-border-color text-muted bg-white"
                }`}
              >
                Semua {myMissions.length}
              </Link>
              {usedKat.map((k) => (
                <Link
                  key={k}
                  href={`/anak/misi?tab=hari-ini&kategori=${k}`}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border-2 ${
                    activeKat === k
                      ? "bg-navy text-white border-navy"
                      : "border-border-color text-muted bg-white"
                  }`}
                >
                  {k}
                </Link>
              ))}
            </div>
          )}

          {filteredMissions.length === 0 && (
            <div className="text-center py-10 text-muted text-sm">
              Tidak ada misi hari ini
            </div>
          )}
          {filteredMissions.map((m) => (
            <MissionCard
              key={m.id}
              mission={m}
              submission={subMap.get(m.id) ?? null}
              date={today}
            />
          ))}
        </div>
      )}

      {tab === "riwayat" && (
        <MisiRiwayat childId={session.childId} familyId={session.familyId} />
      )}
    </div>
  );
}

async function MisiRiwayat({
  childId,
  familyId,
}: {
  childId: string;
  familyId: string;
}) {
  const supabase = createServiceClient();
  const [{ data: submissions }, { data: missions }] = await Promise.all([
    supabase
      .from("submissions")
      .select("*")
      .eq("child_id", childId)
      .order("timestamp", { ascending: false })
      .limit(30),
    supabase.from("missions").select("id, name, kategori").eq("family_id", familyId),
  ]);

  const missionMap = new Map(
    (missions ?? []).map((m: { id: string; name: string; kategori?: string }) => [
      m.id,
      m,
    ]),
  );

  return (
    <div className="p-4 space-y-2">
      {(submissions ?? []).length === 0 && (
        <div className="text-center py-10 text-muted text-sm">Belum ada riwayat.</div>
      )}
      {(submissions ?? []).map((s: Submission) => {
        const m = missionMap.get(s.mission_id);
        const isGood = ["approved", "auto_done"].includes(s.status);
        const isTolak = s.status === "rejected";
        return (
          <div
            key={s.id}
            className="bg-white rounded-2xl px-4 py-3 card-shadow flex items-center gap-3"
          >
            <div
              className={`w-2 h-8 rounded-full flex-shrink-0 ${
                isGood ? "bg-green" : isTolak ? "bg-red-danger" : "bg-muted"
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-navy text-xs truncate">
                {m?.name ?? "Misi"}
              </div>
              <div className="text-muted text-[10px]">
                {s.status === "approved"
                  ? "Disetujui"
                  : s.status === "rejected"
                    ? "Ditolak"
                    : s.status === "auto_done"
                      ? "Auto dinilai"
                      : "Menunggu"}
                {" · "}
                {new Date(s.timestamp).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })}
              </div>
            </div>
            <div
              className={`font-bold text-sm flex-shrink-0 ${
                isGood ? "text-green" : "text-muted"
              }`}
            >
              {isGood ? `+${s.stars_awarded}` : "0"}&#9733;
            </div>
          </div>
        );
      })}
    </div>
  );
}

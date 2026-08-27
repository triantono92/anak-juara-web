import { redirect } from "next/navigation";
import { getChildSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import { AnakLogoutButton } from "@/components/AnakLogoutButton";
import type { Mission, Submission } from "@/lib/types";

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function todayIdx() { return (new Date().getDay() + 6) % 7; }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function formatDate(d: Date) {
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]}`;
}

export default async function AnakDashboardPage() {
  const session = await getChildSession();
  if (!session) redirect("/masuk");

  const supabase = createServiceClient();
  const today = todayStr();
  const todayIndex = todayIdx();

  const [{ data: child }, { data: allMissions }, { data: submissions }, { data: rewards }] =
    await Promise.all([
      supabase
        .from("app_users")
        .select("name, stars, level, streak, avatar_color")
        .eq("id", session.childId)
        .single(),
      supabase
        .from("missions")
        .select("*")
        .eq("family_id", session.familyId)
        .eq("active", true),
      supabase
        .from("submissions")
        .select("*")
        .eq("child_id", session.childId)
        .eq("date", today),
      supabase
        .from("rewards")
        .select("stars_cost, name")
        .eq("family_id", session.familyId)
        .eq("active", true)
        .order("stars_cost"),
    ]);

  if (!child) redirect("/masuk");

  const myMissions: Mission[] = (allMissions ?? []).filter(
    (m: Mission) =>
      m.assigned_to.includes(session.childId) && m.days.includes(todayIndex),
  );

  const subMap = new Map(
    (submissions ?? []).map((s: Submission) => [s.mission_id, s]),
  );

  const doneCount = myMissions.filter((m) => {
    const sub = subMap.get(m.id);
    return sub && ["approved", "auto_done"].includes(sub.status);
  }).length;

  const overdueCount = myMissions.filter((m) => {
    const sub = subMap.get(m.id);
    if (sub) return false;
    const [h, min] = (m.deadline_time as string).split(":").map(Number);
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes() > h * 60 + min;
  }).length;

  const upcomingMissions = myMissions.filter((m) => !subMap.has(m.id)).slice(0, 2);

  const stars = child.stars ?? 0;
  const level = (child as { level?: number }).level ?? 1;
  const streak = (child as { streak?: number }).streak ?? 0;

  const nextReward = (rewards ?? []).find(
    (r: { stars_cost: number; name: string }) => r.stars_cost > stars,
  );

  return (
    <div className="p-4 space-y-3">
      {/* Kartu biru sapaan */}
      <div className="bg-brand-blue rounded-3xl p-4 text-white">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm opacity-80">{formatDate(new Date())}</div>
          <AnakLogoutButton />
        </div>
        <div className="font-display font-bold text-xl mb-3">Hai, {child.name}!</div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="font-display font-bold text-lg">{stars}</div>
            <div className="text-[10px] opacity-75">Bintang</div>
          </div>
          <div className="w-px bg-white/20" />
          <div className="text-center">
            <div className="font-display font-bold text-lg">{streak}</div>
            <div className="text-[10px] opacity-75">Rentetan</div>
          </div>
          <div className="w-px bg-white/20" />
          <div className="text-center">
            <div className="font-display font-bold text-lg">Lv {level}</div>
            <div className="text-[10px] opacity-75">Level</div>
          </div>
        </div>
      </div>

      {/* Kartu progres misi */}
      {myMissions.length > 0 && (
        <div className="bg-orange rounded-3xl p-4 text-white">
          <div className="text-sm opacity-80 mb-1">Misi hari ini</div>
          <div className="font-display font-bold text-lg mb-2">
            {doneCount} dari {myMissions.length} selesai
          </div>
          <div className="w-full bg-white/30 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all"
              style={{
                width:
                  myMissions.length > 0
                    ? `${(doneCount / myMissions.length) * 100}%`
                    : "0%",
              }}
            />
          </div>
          <Link
            href="/anak/misi"
            className="mt-3 block text-center bg-white/20 rounded-xl py-2 text-sm font-bold"
          >
            Kerjakan misi
          </Link>
        </div>
      )}

      {/* Kartu merah misi terlambat */}
      {overdueCount > 0 && (
        <div className="bg-red-danger rounded-3xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold">
              !
            </div>
            <span className="font-bold text-sm">{overdueCount} misi terlambat</span>
          </div>
          <div className="text-xs opacity-80 mb-2">Deadline sudah terlewat hari ini</div>
          <Link
            href="/anak/misi"
            className="block text-center bg-white/20 rounded-xl py-2 text-sm font-bold"
          >
            Susul sekarang
          </Link>
        </div>
      )}

      {/* Misi terdekat */}
      {upcomingMissions.length > 0 && (
        <div className="bg-white rounded-3xl p-4 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="font-display font-bold text-navy text-sm">Misi terdekat</div>
            <Link href="/anak/misi" className="text-xs font-bold text-brand-blue-dark">
              Lihat semua
            </Link>
          </div>
          <div className="space-y-2">
            {upcomingMissions.map((m: Mission) => (
              <div key={m.id} className="flex items-center gap-3 py-1">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-[10px] flex-shrink-0"
                  style={{
                    backgroundColor:
                      m.kategori === "Ibadah"
                        ? "#C8F0E5"
                        : m.kategori === "Belajar"
                          ? "#E2D9FB"
                          : "#FFD9B8",
                    color:
                      m.kategori === "Ibadah"
                        ? "#1F8F76"
                        : m.kategori === "Belajar"
                          ? "#6B4FD1"
                          : "#C25E12",
                  }}
                >
                  {(m.kategori ?? "NT").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-navy text-xs truncate">{m.name}</div>
                  <div className="text-muted text-[10px]">Sebelum {m.deadline_time}</div>
                </div>
                <div className="font-bold text-yellow text-xs flex-shrink-0">
                  &#9733; {m.stars}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kartu hadiah target */}
      {nextReward && (
        <div className="bg-navy rounded-3xl p-4 text-white">
          <div className="text-xs opacity-75 mb-1">Target hadiah</div>
          <div className="font-display font-bold text-sm mb-2">{nextReward.name}</div>
          <div className="text-xs opacity-80">
            Kurang{" "}
            <span className="font-bold text-yellow">
              {nextReward.stars_cost - stars} bintang
            </span>{" "}
            lagi
          </div>
          <div className="w-full bg-white/20 rounded-full h-1.5 mt-2">
            <div
              className="bg-yellow rounded-full h-1.5"
              style={{
                width: `${Math.min(100, (stars / nextReward.stars_cost) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

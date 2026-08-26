import { redirect } from "next/navigation";
import { getChildSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { ScheduleBlock, MissionKategori } from "@/lib/types";
import { getCategoryConfig } from "@/components/CategoryIcon";

const HARI_PENDEK = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const HARI_PANJANG = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

function currentDay() {
  return (new Date().getDay() + 6) % 7; // 0=Senin
}

export default async function JadwalPage({
  searchParams,
}: {
  searchParams: Promise<{ hari?: string }>;
}) {
  const session = await getChildSession();
  if (!session) redirect("/masuk");
  const params = await searchParams;
  const selectedHari =
    params.hari !== undefined ? parseInt(params.hari) : currentDay();

  const supabase = createServiceClient();
  const [{ data: blocks }, { data: child }, { data: missions }] = await Promise.all([
    supabase
      .from("schedule_blocks")
      .select("*")
      .eq("child_id", session.childId)
      .eq("hari", selectedHari)
      .eq("aktif", true)
      .order("jam_mulai"),
    supabase.from("app_users").select("stars").eq("id", session.childId).single(),
    supabase
      .from("missions")
      .select("id, name, stars")
      .eq("family_id", session.familyId),
  ]);

  const missionMap = new Map(
    (missions ?? []).map((m: { id: string; name: string; stars: number }) => [
      m.id,
      m,
    ]),
  );

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const today = currentDay();

  function blockStatus(block: ScheduleBlock): "selesai" | "sekarang" | "nanti" {
    const [h, m] = block.jam_mulai.split(":").map(Number);
    const startMin = h * 60 + m;
    const endMin = startMin + block.durasi_menit;
    if (selectedHari < today) return "selesai";
    if (selectedHari > today) return "nanti";
    if (nowMinutes >= endMin) return "selesai";
    if (nowMinutes >= startMin) return "sekarang";
    return "nanti";
  }

  const doneBlocks = (blocks ?? []).filter(
    (b: ScheduleBlock) => blockStatus(b) === "selesai",
  ).length;
  const totalBlocks = (blocks ?? []).length;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-brand-blue text-white px-4 pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-display font-bold text-xl">Jadwalku</div>
          <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
            <span className="text-yellow font-bold text-sm">&#9733;</span>
            <span className="font-display font-bold text-sm">{child?.stars ?? 0}</span>
          </div>
        </div>
        {/* Hari chips */}
        <div className="flex gap-1.5">
          {HARI_PENDEK.map((h, i) => (
            <Link
              key={i}
              href={`/anak/jadwal?hari=${i}`}
              className={`flex-1 text-center py-2 rounded-xl text-[10px] font-bold transition-all ${
                selectedHari === i
                  ? "bg-white text-brand-blue"
                  : i >= 5
                    ? "bg-orange/30 text-white/90"
                    : "text-white/70"
              }`}
            >
              {h}
            </Link>
          ))}
        </div>
      </div>

      {/* Stats card */}
      {totalBlocks > 0 && (
        <div className="px-4 pt-4">
          <div className="bg-white rounded-2xl p-4 card-shadow flex items-center gap-4">
            <div className="flex-1">
              <div className="font-display font-bold text-navy text-base">
                {HARI_PANJANG[selectedHari]}
              </div>
              <div className="text-muted text-xs mt-0.5">
                {doneBlocks} dari {totalBlocks} kegiatan sudah jalan
              </div>
            </div>
            {/* Lingkaran persentase */}
            <div className="w-12 h-12 relative flex-shrink-0">
              <svg viewBox="0 0 44 44" width={48} height={48}>
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="none"
                  stroke="#E1EAF2"
                  strokeWidth="4"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="none"
                  stroke="#35C0A0"
                  strokeWidth="4"
                  strokeDasharray={`${totalBlocks > 0 ? (doneBlocks / totalBlocks) * 113.1 : 0} 113.1`}
                  strokeLinecap="round"
                  transform="rotate(-90 22 22)"
                />
                <text
                  x="22"
                  y="26"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#17395B"
                >
                  {totalBlocks > 0 ? Math.round((doneBlocks / totalBlocks) * 100) : 0}%
                </text>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1 px-4 py-4">
        {(blocks ?? []).length === 0 ? (
          <div className="text-center py-10 text-muted text-sm">
            Belum ada jadwal untuk hari ini.
          </div>
        ) : (
          <div className="relative pl-16">
            {/* Garis vertikal */}
            <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-border-color" />
            <div className="space-y-4">
              {(blocks as ScheduleBlock[]).map((block) => {
                const status = blockStatus(block);
                const catCfg = getCategoryConfig(block.kategori as MissionKategori);
                const lineColor =
                  status === "selesai"
                    ? "#35C0A0"
                    : status === "sekarang"
                      ? "#F58634"
                      : "#E1EAF2";
                const relatedMissions = (block.mission_ids ?? [])
                  .map((id) => missionMap.get(id))
                  .filter(Boolean);

                return (
                  <div key={block.id} className="relative flex items-start gap-3">
                    {/* Jam */}
                    <div className="absolute -left-16 pt-3 text-right w-12">
                      <span className="text-[11px] font-bold text-navy">
                        {block.jam_mulai.slice(0, 5)}
                      </span>
                      <br />
                      <span className="text-[9px] text-muted">{block.durasi_menit}m</span>
                    </div>
                    {/* Garis status */}
                    <div
                      className="absolute -left-[9px] top-3 w-1 rounded-full"
                      style={{ height: "80%", backgroundColor: lineColor }}
                    />
                    {/* Kartu */}
                    <div
                      className={`flex-1 bg-white rounded-2xl p-3 card-shadow ml-2 ${
                        status === "sekarang" ? "border-2 border-orange" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[10px] flex-shrink-0"
                          style={{ backgroundColor: catCfg.bg, color: catCfg.text }}
                        >
                          {catCfg.abbr}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-navy text-sm">{block.nama}</div>
                          {relatedMissions.length > 0 && (
                            <div className="text-muted text-[10px] mt-0.5">
                              {relatedMissions
                                .map((m) => `${m!.name} · \u2605${m!.stars}`)
                                .join(", ")}
                            </div>
                          )}
                        </div>
                        <div
                          className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                            status === "selesai"
                              ? "bg-[#C8F5EC] text-green"
                              : status === "sekarang"
                                ? "bg-[#FEF0DC] text-orange"
                                : "bg-[#EEF3F7] text-muted"
                          }`}
                        >
                          {status === "selesai"
                            ? "Selesai"
                            : status === "sekarang"
                              ? "Sekarang"
                              : "Nanti"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bonus card */}
        {totalBlocks > 0 && (
          <div className="mt-4 bg-navy rounded-2xl p-4 text-white">
            <div className="font-bold text-sm mb-1">Bonus jika semua tepat waktu</div>
            <div className="text-yellow font-display font-bold text-base">
              &#9733; 10 bintang ekstra!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

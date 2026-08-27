import { redirect } from "next/navigation";
import { getParentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AppUser, ScheduleBlock, Mission } from "@/lib/types";
import { OrtuJadwalClient } from "@/components/OrtuJadwalClient";

const HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function currentDay() {
  return (new Date().getDay() + 6) % 7;
}

export default async function OrtuJadwalPage({
  searchParams,
}: {
  searchParams: Promise<{ hari?: string; childId?: string }>;
}) {
  const user = await getParentUser();
  if (!user) redirect("/masuk");

  const params = await searchParams;

  const supabase = await createClient();
  const [{ data: kids }, { data: missions }] = await Promise.all([
    supabase.from("app_users").select("*").eq("role", "anak"),
    supabase
      .from("missions")
      .select("id, name, stars, kategori")
      .eq("active", true),
  ]);

  const childrenList = (kids as AppUser[] | null) ?? [];
  const selectedChildId = params.childId ?? childrenList[0]?.id ?? "";
  const selectedHari =
    params.hari !== undefined ? parseInt(params.hari) : currentDay();

  let blocks: ScheduleBlock[] = [];
  if (selectedChildId) {
    const { data } = await supabase
      .from("schedule_blocks")
      .select("*")
      .eq("child_id", selectedChildId)
      .eq("hari", selectedHari)
      .order("jam_mulai");
    blocks = (data as ScheduleBlock[] | null) ?? [];
  }

  const missionList = (missions as Mission[] | null) ?? [];

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white px-4 pt-5 pb-4 card-shadow">
        <div className="font-display font-bold text-navy text-xl mb-4">
          Master Jadwal
        </div>

        {/* Pemilih anak */}
        {childrenList.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {childrenList.map((c) => (
              <a
                key={c.id}
                href={`/ortu/jadwal?childId=${c.id}&hari=${selectedHari}`}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold border-2 ${
                  selectedChildId === c.id
                    ? "border-navy bg-navy text-white"
                    : "border-border-color text-muted"
                }`}
              >
                {c.name}
              </a>
            ))}
          </div>
        )}

        {/* Pemilih hari */}
        <div className="flex gap-1">
          {HARI.map((h, i) => (
            <a
              key={i}
              href={`/ortu/jadwal?childId=${selectedChildId}&hari=${i}`}
              className={`flex-1 text-center py-2 rounded-xl text-[10px] font-bold ${
                selectedHari === i
                  ? "bg-navy text-white"
                  : i >= 5
                  ? "bg-orange/10 text-orange"
                  : "bg-grey-bg text-muted"
              }`}
            >
              {h}
            </a>
          ))}
        </div>
      </div>

      {childrenList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted">
          <div className="text-sm font-semibold">Belum ada anak terdaftar</div>
          <div className="text-xs mt-1">
            Tambah anak di halaman Anggota terlebih dahulu
          </div>
        </div>
      ) : (
        <OrtuJadwalClient
          blocks={blocks}
          selectedChildId={selectedChildId}
          selectedHari={selectedHari}
          missions={missionList}
        />
      )}
    </div>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentAppUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { OrtuLogoutModal } from "@/components/OrtuLogoutModal";
import type { AppUser, Mission, Submission } from "@/lib/types";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function weekAgoStr() {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return d.toISOString().slice(0, 10);
}
function todayDayIdx() {
  return (new Date().getDay() + 6) % 7;
}
function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
function parentRoleLabel(role: string | null) {
  if (role === "ayah") return "Ayah";
  if (role === "bunda") return "Bunda";
  if (role === "wali") return "Wali";
  return "Ortu";
}

export default async function OrtuDashboardPage() {
  const user = await getCurrentAppUser();
  if (!user || user.role !== "ortu") redirect("/masuk");

  const supabase = await createClient();
  const today = todayStr();
  const weekAgo = weekAgoStr();
  const todayIdx = todayDayIdx();

  const [
    { data: familyRow },
    { data: members },
    { data: pendingSubmissions },
    { data: weekSubs },
    { data: pendingRedemptions },
    { data: missions },
    { data: rewards },
    { data: todayBlocks },
  ] = await Promise.all([
    supabase.from("families").select("name").single(),
    supabase
      .from("app_users")
      .select("id, name, role, stars, avatar_color, member_status, parent_role, age, streak")
      .order("created_at"),
    supabase.from("submissions").select("id").eq("status", "pending"),
    supabase
      .from("submissions")
      .select("id, child_id, mission_id, date, status")
      .gte("date", weekAgo)
      .lte("date", today),
    supabase.from("redemptions").select("id").eq("status", "menunggu"),
    supabase
      .from("missions")
      .select("id, name, assigned_to, days, deadline_time, stars, kategori")
      .eq("active", true),
    supabase.from("rewards").select("id").eq("active", true),
    supabase.from("schedule_blocks").select("id").eq("hari", todayIdx).eq("aktif", true),
  ]);

  const memberList = (members as AppUser[] | null) ?? [];
  const activeMissions = (missions as Mission[] | null) ?? [];
  const weekSubmissions = (weekSubs as Submission[] | null) ?? [];
  const todaySubmissions = weekSubmissions.filter((s) => s.date === today);
  const pendingMembers = memberList.filter((m) => m.member_status === "menunggu");

  const totalPending =
    (pendingSubmissions?.length ?? 0) +
    (pendingRedemptions?.length ?? 0) +
    pendingMembers.length;

  const activeKids = memberList.filter(
    (m) => m.role === "anak" && m.member_status === "aktif",
  );
  const familyName = (familyRow as { name: string } | null)?.name ?? "Keluarga";
  const roleLabel = parentRoleLabel(user.parentRole);

  // Consistency% over last 7 days
  let expectedCount = 0;
  let completedCount = 0;
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  });
  for (const d of last7Days) {
    const dayIdx2 = (d.getDay() + 6) % 7;
    const dateStr = d.toISOString().slice(0, 10);
    for (const kid of activeKids) {
      const kidMissionsDay = activeMissions.filter(
        (m) =>
          (m.days as number[]).includes(dayIdx2) &&
          (m.assigned_to as string[]).includes(kid.id),
      );
      expectedCount += kidMissionsDay.length;
      const kidDone = weekSubmissions.filter(
        (s) =>
          s.date === dateStr &&
          s.child_id === kid.id &&
          ["approved", "auto_done"].includes(s.status) &&
          kidMissionsDay.some((m) => m.id === s.mission_id),
      );
      completedCount += kidDone.length;
    }
  }
  const consistencyPct =
    expectedCount > 0 ? Math.round((completedCount / expectedCount) * 100) : 100;

  // Overdue missions today
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  let overdueCount = 0;
  for (const kid of activeKids) {
    const kidMissionsToday = activeMissions.filter(
      (m) =>
        (m.days as number[]).includes(todayIdx) &&
        (m.assigned_to as string[]).includes(kid.id),
    );
    for (const m of kidMissionsToday) {
      const [h, min] = (m.deadline_time as string).split(":").map(Number);
      const deadlineMinutes = h * 60 + min;
      const todaySub = todaySubmissions.find(
        (s) => s.child_id === kid.id && s.mission_id === m.id,
      );
      if (!todaySub && deadlineMinutes < nowMinutes) {
        overdueCount++;
      }
    }
  }

  // Per-child performance today
  const childPerformance = activeKids.map((kid) => {
    const kidMissionsToday = activeMissions.filter(
      (m) =>
        (m.days as number[]).includes(todayIdx) &&
        (m.assigned_to as string[]).includes(kid.id),
    );
    const done = kidMissionsToday.filter((m) => {
      const sub = todaySubmissions.find(
        (s) => s.child_id === kid.id && s.mission_id === m.id,
      );
      return sub && ["approved", "auto_done"].includes(sub.status);
    }).length;
    return {
      id: kid.id,
      name: kid.name,
      color: kid.avatar_color,
      stars: kid.stars,
      done,
      total: kidMissionsToday.length,
    };
  });

  // Narrative summary
  const narrativeLine =
    expectedCount > 0
      ? `${activeKids.length} anak menyelesaikan ${consistencyPct}% misi pekan ini (${completedCount} dari ${expectedCount} jadwal).`
      : `${activeKids.length} anak aktif, belum ada misi dijadwalkan pekan ini.`;
  const narrativePending =
    totalPending > 0
      ? ` Ada ${totalPending} pengajuan menunggu persetujuan.`
      : " Semua pengajuan sudah ditangani.";

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white px-4 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
            style={{
              backgroundColor: user.avatarColor + "33",
              color: user.avatarColor,
            }}
          >
            {initials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-navy text-base leading-tight">
              {user.name}
            </div>
            <div className="text-muted text-xs font-semibold">
              {roleLabel} · {familyName}
            </div>
          </div>
          <OrtuLogoutModal />
        </div>
      </div>

      <div className="p-4 space-y-3 pb-6">
        {/* Pending approval banner */}
        {totalPending > 0 && (
          <Link
            href="/ortu/persetujuan"
            className="flex items-center gap-3 bg-orange rounded-2xl px-4 py-3"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-display font-bold text-white text-sm flex-shrink-0">
              {totalPending}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white text-sm">Menunggu persetujuan</div>
              <div className="text-white/80 text-xs">Ketuk untuk tinjau</div>
            </div>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18l6-6-6-6"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        )}

        {/* 3 stat cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white rounded-2xl p-3 card-shadow text-center">
            <div className="font-display font-bold text-navy text-xl">
              {consistencyPct}%
            </div>
            <div className="text-muted text-[10px] font-semibold leading-tight mt-0.5">
              Konsistensi
            </div>
          </div>
          <div className="bg-white rounded-2xl p-3 card-shadow text-center">
            <div className="font-display font-bold text-navy text-xl">
              {activeMissions.length}
            </div>
            <div className="text-muted text-[10px] font-semibold leading-tight mt-0.5">
              Misi aktif
            </div>
          </div>
          <div
            className={`rounded-2xl p-3 card-shadow text-center ${
              overdueCount > 0 ? "bg-red-danger" : "bg-white"
            }`}
          >
            <div
              className={`font-display font-bold text-xl ${
                overdueCount > 0 ? "text-white" : "text-navy"
              }`}
            >
              {overdueCount}
            </div>
            <div
              className={`text-[10px] font-semibold leading-tight mt-0.5 ${
                overdueCount > 0 ? "text-white/80" : "text-muted"
              }`}
            >
              Terlambat
            </div>
          </div>
        </div>

        {/* Per-child performance */}
        {childPerformance.length > 0 && (
          <div className="bg-white rounded-2xl p-4 card-shadow">
            <div className="font-display font-bold text-navy text-sm mb-3">
              Progres hari ini
            </div>
            <div className="space-y-3">
              {childPerformance.map((child) => {
                const pct =
                  child.total > 0 ? (child.done / child.total) * 100 : 0;
                return (
                  <div key={child.id} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-bold text-xs flex-shrink-0"
                      style={{
                        backgroundColor: child.color + "33",
                        color: child.color,
                      }}
                    >
                      {initials(child.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-navy text-xs">
                          {child.name}
                        </span>
                        <span className="text-muted text-[10px]">
                          {child.total > 0
                            ? `${child.done}/${child.total}`
                            : "Tidak ada misi"}
                        </span>
                      </div>
                      <div className="w-full bg-[#EEF3F7] rounded-full h-1.5">
                        <div
                          className="bg-brand-blue rounded-full h-1.5 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs font-bold text-yellow flex-shrink-0">
                      ★ {child.stars}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Kelola cepat 2×2 grid */}
        <div>
          <div className="font-display font-bold text-navy text-sm mb-2">
            Kelola cepat
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href="/ortu/misi"
              className="bg-white rounded-2xl p-4 card-shadow flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E2D9FB] flex items-center justify-center flex-shrink-0">
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#6B4FD1" strokeWidth="2" />
                  <circle cx="12" cy="12" r="5" stroke="#6B4FD1" strokeWidth="2" />
                  <circle cx="12" cy="12" r="1.5" fill="#6B4FD1" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-navy text-xs">Misi</div>
                <div className="text-muted text-[10px]">
                  {activeMissions.length} aktif
                </div>
              </div>
            </Link>
            <Link
              href="/ortu/jadwal"
              className="bg-white rounded-2xl p-4 card-shadow flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#C8F0E5] flex items-center justify-center flex-shrink-0">
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="16"
                    rx="3"
                    stroke="#1F8F76"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 3v4M16 3v4"
                    stroke="#1F8F76"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path d="M3 9h18" stroke="#1F8F76" strokeWidth="2" />
                  <rect
                    x="7"
                    y="13"
                    width="3"
                    height="3"
                    rx="0.5"
                    fill="#1F8F76"
                  />
                </svg>
              </div>
              <div>
                <div className="font-bold text-navy text-xs">Jadwal</div>
                <div className="text-muted text-[10px]">
                  {todayBlocks?.length ?? 0} blok hari ini
                </div>
              </div>
            </Link>
            <Link
              href="/ortu/hadiah"
              className="bg-white rounded-2xl p-4 card-shadow flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFF0E5] flex items-center justify-center flex-shrink-0">
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="10"
                    width="18"
                    height="11"
                    rx="2"
                    stroke="#C25E12"
                    strokeWidth="2"
                  />
                  <rect
                    x="2"
                    y="7"
                    width="20"
                    height="5"
                    rx="2"
                    stroke="#C25E12"
                    strokeWidth="2"
                  />
                  <path d="M12 7v14" stroke="#C25E12" strokeWidth="2" />
                  <path
                    d="M12 7c0 0-2-4 0-4s2 4 0 4"
                    stroke="#C25E12"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <div className="font-bold text-navy text-xs">Hadiah</div>
                <div className="text-muted text-[10px]">
                  {rewards?.length ?? 0} tersedia
                </div>
              </div>
            </Link>
            <Link
              href="/ortu/anggota"
              className="bg-white rounded-2xl p-4 card-shadow flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E2EEF8] flex items-center justify-center flex-shrink-0">
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <circle cx="9" cy="7" r="4" stroke="#17395B" strokeWidth="2" />
                  <path
                    d="M3 20c0-3.314 2.686-6 6-6s6 2.686 6 6"
                    stroke="#17395B"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M16 11c1.657 0 3 1.343 3 3"
                    stroke="#17395B"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M19 14c1.105 0 2 .895 2 2v4"
                    stroke="#17395B"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <div className="font-bold text-navy text-xs">Anggota</div>
                <div className="text-muted text-[10px]">
                  {memberList.filter((m) => m.member_status === "aktif").length} aktif
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Navy narrative summary */}
        <div className="bg-navy rounded-2xl p-4 text-white">
          <div className="text-[10px] font-bold opacity-60 mb-1.5 uppercase tracking-widest">
            Ringkasan pekan ini
          </div>
          <div className="text-sm leading-relaxed opacity-90">
            {narrativeLine}
            {narrativePending}
          </div>
        </div>
      </div>
    </div>
  );
}

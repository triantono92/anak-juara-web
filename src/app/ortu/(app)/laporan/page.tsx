import { redirect } from "next/navigation";
import Link from "next/link";
import { getParentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LaporanPrintButton } from "@/components/LaporanPrintButton";
import type { AppUser, Submission, Redemption } from "@/lib/types";

function startOfWeekN(d: Date, weeksBack: number) {
  const day = (d.getDay() + 6) % 7;
  const res = new Date(d);
  res.setDate(d.getDate() - day - weeksBack * 7);
  res.setHours(0, 0, 0, 0);
  return res;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfPrevMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() - 1, 1);
}

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ childId?: string }>;
}) {
  const user = await getParentUser();
  if (!user) redirect("/masuk");

  const params = await searchParams;
  const supabase = await createClient();

  const [{ data: family }, { data: submissions }, { data: redemptions }] =
    await Promise.all([
      supabase.from("app_users").select("*").eq("role", "anak"),
      supabase.from("submissions").select("*"),
      supabase.from("redemptions").select("*"),
    ]);

  const children = (family as AppUser[] | null) ?? [];
  const selectedChildId = params.childId ?? children[0]?.id ?? "";
  const child = children.find((c) => c.id === selectedChildId);

  const allSubs = (submissions as Submission[] | null) ?? [];
  const allRedemptions = (redemptions as Redemption[] | null) ?? [];

  const childSubs = allSubs.filter((s) => s.child_id === selectedChildId);
  const doneStatuses = ["approved", "auto_done"];
  const doneSubs = childSubs.filter((s) => doneStatuses.includes(s.status));

  const now = new Date();
  const monthStart = startOfMonth(now);
  const prevMonthStart = startOfPrevMonth(now);

  const thisMonthDone = doneSubs.filter(
    (s) => new Date(s.timestamp) >= monthStart
  );
  const prevMonthDone = doneSubs.filter(
    (s) =>
      new Date(s.timestamp) >= prevMonthStart &&
      new Date(s.timestamp) < monthStart
  );

  const thisMonthStars = thisMonthDone.reduce((s, sub) => s + sub.stars_awarded, 0);
  const prevMonthStars = prevMonthDone.reduce((s, sub) => s + sub.stars_awarded, 0);
  const starsDiff = thisMonthStars - prevMonthStars;

  // Konsistensi: berapa persen hari dalam sebulan ini ada misi selesai
  const daysInMonth = now.getDate();
  const activeDays = new Set(
    thisMonthDone.map((s) => new Date(s.timestamp).toDateString())
  ).size;
  const konsistensi =
    daysInMonth > 0 ? Math.round((activeDays / daysInMonth) * 100) : 0;

  // Data bar chart 4 minggu terakhir
  const weeks = [3, 2, 1, 0].map((weeksBack) => {
    const weekStart = startOfWeekN(now, weeksBack);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    const count = doneSubs.filter(
      (s) =>
        new Date(s.timestamp) >= weekStart &&
        new Date(s.timestamp) < weekEnd
    ).length;
    return { label: `M${4 - weeksBack}`, count };
  });

  const maxWeekCount = Math.max(...weeks.map((w) => w.count), 1);

  // Heatmap 28 hari terakhir
  const heatmapDays = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (27 - i));
    d.setHours(0, 0, 0, 0);
    const nextD = new Date(d);
    nextD.setDate(d.getDate() + 1);
    const count = doneSubs.filter((s) => {
      const t = new Date(s.timestamp);
      return t >= d && t < nextD;
    }).length;
    return { date: d, count };
  });

  const maxHeatCount = Math.max(...heatmapDays.map((d) => d.count), 1);

  // Naratif
  let naratif = "";
  if (!child) {
    naratif = "Pilih anak untuk melihat laporan.";
  } else if (konsistensi >= 80) {
    naratif = `${child.name} sangat konsisten bulan ini (${konsistensi}%)! Total ${thisMonthStars} bintang dikumpulkan.`;
  } else if (konsistensi >= 50) {
    naratif = `${child.name} cukup aktif bulan ini (${konsistensi}%). Terus semangat!`;
  } else {
    naratif = `${child.name} baru aktif ${konsistensi}% hari bulan ini. Yuk semangat lagi!`;
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white px-4 pt-5 pb-4 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="font-display font-bold text-navy text-xl">Laporan</div>
          <LaporanPrintButton />
        </div>

        {/* Pemilih anak */}
        {children.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {children.map((c) => (
              <Link
                key={c.id}
                href={`/ortu/laporan?childId=${c.id}`}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold border-2 ${
                  selectedChildId === c.id
                    ? "border-navy bg-navy text-white"
                    : "border-border-color text-muted"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* 3 stat chips */}
        <div className="flex gap-2">
          <div className="flex-1 bg-white rounded-2xl p-3.5 card-shadow text-center">
            <div className="font-display font-bold text-navy text-2xl">
              {konsistensi}%
            </div>
            <div className="text-muted text-[10px] font-semibold">Konsisten</div>
          </div>
          <div className="flex-1 bg-white rounded-2xl p-3.5 card-shadow text-center">
            <div className="font-display font-bold text-navy text-2xl">
              ★{thisMonthStars}
            </div>
            <div className="text-muted text-[10px] font-semibold">Bulan ini</div>
          </div>
          <div className="flex-1 bg-white rounded-2xl p-3.5 card-shadow text-center">
            <div
              className={`font-display font-bold text-2xl ${
                starsDiff >= 0 ? "text-green" : "text-red-danger"
              }`}
            >
              {starsDiff >= 0 ? "+" : ""}
              {starsDiff}
            </div>
            <div className="text-muted text-[10px] font-semibold">vs bln lalu</div>
          </div>
        </div>

        {/* Bar chart 4 minggu */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="font-bold text-navy text-sm mb-4">Tren 4 Minggu</div>
          <div className="flex items-end gap-3 h-28">
            {weeks.map((w) => (
              <div key={w.label} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs font-bold text-navy">{w.count}</div>
                <div
                  className="w-full bg-navy rounded-t-lg transition-all"
                  style={{
                    height: `${Math.max(4, (w.count / maxWeekCount) * 80)}px`,
                    minHeight: 4,
                  }}
                />
                <div className="text-[10px] text-muted font-semibold">
                  {w.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap 28 hari */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="font-bold text-navy text-sm mb-3">Aktivitas 28 Hari</div>
          <div className="grid grid-cols-7 gap-1">
            {["S", "M", "R", "K", "J", "S", "M"].map((d, i) => (
              <div
                key={i}
                className="text-center text-[9px] font-bold text-muted"
              >
                {d}
              </div>
            ))}
            {heatmapDays.map((d, i) => {
              const intensity =
                d.count === 0
                  ? 0
                  : Math.max(0.2, d.count / maxHeatCount);
              return (
                <div
                  key={i}
                  className="aspect-square rounded-md"
                  style={{
                    backgroundColor:
                      d.count === 0
                        ? "#F6F9FC"
                        : `rgba(53, 192, 160, ${intensity})`,
                  }}
                  title={`${d.date.toLocaleDateString("id-ID")}: ${d.count} misi`}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-2 justify-end">
            <span className="text-[9px] text-muted">Sedikit</span>
            {[0.15, 0.4, 0.65, 0.9].map((o) => (
              <div
                key={o}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: `rgba(53, 192, 160, ${o})` }}
              />
            ))}
            <span className="text-[9px] text-muted">Banyak</span>
          </div>
        </div>

        {/* Kartu naratif */}
        <div className="bg-navy rounded-2xl p-4 text-white">
          <div className="font-display font-bold text-base mb-2">Ringkasan</div>
          <div className="text-sm opacity-90 leading-relaxed">{naratif}</div>
          {child && (
            <div className="flex gap-4 mt-3 pt-3 border-t border-white/20">
              <div>
                <div className="text-xs opacity-70">Saldo saat ini</div>
                <div className="font-bold">★ {child.stars}</div>
              </div>
              <div>
                <div className="text-xs opacity-70">Level</div>
                <div className="font-bold">{child.level}</div>
              </div>
              <div>
                <div className="text-xs opacity-70">Streak</div>
                <div className="font-bold">{child.streak} hari</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

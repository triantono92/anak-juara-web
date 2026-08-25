import { redirect } from "next/navigation";
import { getParentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/Avatar";
import type { AppUser, Submission, Redemption } from "@/lib/types";

// Hitung batas minggu ini (Senin) tanpa dependency tambahan.
function startOfWeek(d: Date) {
  const day = (d.getDay() + 6) % 7; // 0 = Senin
  const res = new Date(d);
  res.setDate(d.getDate() - day);
  res.setHours(0, 0, 0, 0);
  return res;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default async function LaporanPage() {
  const user = await getParentUser();
  if (!user) redirect("/ortu/login");

  const supabase = await createClient();
  const { data: family } = await supabase.from("app_users").select("*").eq("role", "anak");
  const { data: submissions } = await supabase.from("submissions").select("*");
  const { data: redemptions } = await supabase.from("redemptions").select("*");

  const now = new Date();
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const children = (family as AppUser[] | null) ?? [];
  const allSubs = (submissions as Submission[] | null) ?? [];
  const allRedemptions = (redemptions as Redemption[] | null) ?? [];

  return (
    <div className="px-4 py-4">
      <div className="font-display font-bold text-ink text-base mb-1">Laporan</div>
      <div className="text-[11px] text-ink-soft font-semibold mb-4">
        Dihitung langsung dari riwayat aktivitas — selalu akurat, bukan angka tersimpan terpisah.
      </div>

      <div className="space-y-4">
        {children.map((child) => {
          const subs = allSubs.filter((s) => s.child_id === child.id);
          const doneStatuses = ["approved", "auto_done"];

          const weekDone = subs.filter(
            (s) => doneStatuses.includes(s.status) && new Date(s.timestamp) >= weekStart,
          );
          const monthDone = subs.filter(
            (s) => doneStatuses.includes(s.status) && new Date(s.timestamp) >= monthStart,
          );
          const weekStars = weekDone.reduce((sum, s) => sum + s.stars_awarded, 0);
          const monthStars = monthDone.reduce((sum, s) => sum + s.stars_awarded, 0);

          const pending = subs.filter((s) => s.status === "pending").length;
          const rejected = subs.filter((s) => s.status === "rejected").length;

          const spent = allRedemptions
            .filter((r) => r.child_id === child.id)
            .reduce((sum, r) => sum + r.stars_spent, 0);

          return (
            <div key={child.id} className="bg-card border border-line rounded-2xl p-3.5">
              <div className="flex items-center gap-2.5 mb-3">
                <Avatar name={child.name} color={child.avatar_color} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-ink text-sm">{child.name}</div>
                  <div className="text-[10.5px] text-ink-soft font-semibold">
                    Saldo saat ini: {child.stars}⭐
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-hijau-soft rounded-xl px-3 py-2">
                  <div className="text-[9.5px] font-bold text-hijau">Minggu Ini</div>
                  <div className="font-mono-brand font-bold text-ink text-sm">
                    {weekDone.length} misi · {weekStars}⭐
                  </div>
                </div>
                <div className="bg-ungu-soft rounded-xl px-3 py-2">
                  <div className="text-[9.5px] font-bold text-ungu">Bulan Ini</div>
                  <div className="font-mono-brand font-bold text-ink text-sm">
                    {monthDone.length} misi · {monthStars}⭐
                  </div>
                </div>
              </div>

              <div className="flex gap-3 text-[10.5px] font-semibold text-ink-soft pt-1">
                <span>⏳ {pending} menunggu</span>
                <span>✕ {rejected} ditolak</span>
                <span>🎁 {spent}⭐ ditukar total</span>
              </div>
            </div>
          );
        })}
        {children.length === 0 && (
          <div className="text-xs text-ink-soft text-center py-6">Belum ada anak terdaftar.</div>
        )}
      </div>
    </div>
  );
}

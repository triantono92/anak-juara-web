import { redirect } from "next/navigation";
import { getParentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { OrtuAnggotaClient } from "@/components/OrtuAnggotaClient";
import type { AppUser, MemberStatus } from "@/lib/types";

function StatusBadge({ status, isCurrentUser }: { status: MemberStatus; isCurrentUser: boolean }) {
  if (isCurrentUser) {
    return (
      <span className="bg-navy text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
        Pemilik
      </span>
    );
  }
  if (status === "aktif") {
    return (
      <span className="bg-[#C8F5EC] text-[#1F8F76] text-[10px] font-bold px-2.5 py-1 rounded-full">
        Aktif
      </span>
    );
  }
  if (status === "menunggu") {
    return (
      <span className="bg-[#FFF0E5] text-orange text-[10px] font-bold px-2.5 py-1 rounded-full">
        Menunggu
      </span>
    );
  }
  return null;
}

function InitialsAvatar({
  name,
  color,
  size = 40,
}: {
  name: string;
  color: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="rounded-xl flex items-center justify-center font-display font-bold flex-shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: color + "33",
        color,
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
}

export default async function AnggotaPage() {
  const user = await getParentUser();
  if (!user) redirect("/masuk");

  const supabase = await createClient();
  const [{ data: family }, { data: familyRow }] = await Promise.all([
    supabase.from("app_users").select("*").order("created_at"),
    supabase.from("families").select("invite_code, name").limit(1).single(),
  ]);

  const members = (family as AppUser[] | null) ?? [];
  const kids = members.filter((m) => m.role === "anak");
  const parents = members.filter((m) => m.role === "ortu");

  // Find current user's app_user record by id
  const currentMember = members.find((m) => m.id === user!.id);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white px-4 pt-5 pb-4 card-shadow">
        <div className="font-display font-bold text-navy text-xl mb-4">
          Anggota Keluarga
        </div>

        {/* Kartu kode keluarga */}
        {familyRow && (
          <div className="bg-navy rounded-2xl p-4 text-white">
            <div className="text-xs font-semibold opacity-70 mb-1">
              Kode Keluarga
            </div>
            <div className="font-display font-bold text-2xl tracking-widest mb-3">
              {familyRow.invite_code}
            </div>
            <div className="text-xs opacity-70">
              Bagikan kode ini ke anggota keluarga untuk bergabung
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Tombol tambah */}
        <OrtuAnggotaClient />

        {/* Grup Anak */}
        {kids.length > 0 && (
          <div>
            <div className="text-xs font-bold text-muted uppercase tracking-wide mb-2 px-1">
              Anak ({kids.length})
            </div>
            <div className="space-y-2">
              {kids.map((m: AppUser) => (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl p-4 card-shadow flex items-center gap-3"
                >
                  <InitialsAvatar
                    name={m.name}
                    color={m.avatar_color}
                    size={44}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-navy text-sm">{m.name}</div>
                    <div className="text-muted text-xs">
                      {m.age ? `${m.age} tahun · ` : ""}★ {m.stars} bintang
                      {m.streak > 0 ? ` · ${m.streak} hari beruntun` : ""}
                    </div>
                  </div>
                  <StatusBadge
                    status={m.member_status}
                    isCurrentUser={false}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grup Orang Tua & Wali */}
        {parents.length > 0 && (
          <div>
            <div className="text-xs font-bold text-muted uppercase tracking-wide mb-2 px-1">
              Orang Tua & Wali ({parents.length})
            </div>
            <div className="space-y-2">
              {parents.map((m: AppUser) => (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl p-4 card-shadow flex items-center gap-3"
                >
                  <InitialsAvatar
                    name={m.name}
                    color={m.avatar_color || "#17395B"}
                    size={44}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-navy text-sm">{m.name}</div>
                    <div className="text-muted text-xs capitalize">
                      {m.parent_role ?? "Ortu"}
                    </div>
                  </div>
                  <StatusBadge
                    status={m.member_status}
                    isCurrentUser={currentMember?.id === m.id}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {members.length === 0 && (
          <div className="text-center py-8 text-muted text-sm">
            Belum ada anggota terdaftar.
          </div>
        )}
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getParentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/Avatar";
import { AddChildForm } from "@/components/AddChildForm";
import type { AppUser } from "@/lib/types";

export default async function AnggotaPage() {
  const user = await getParentUser();
  if (!user) redirect("/ortu/login");

  const supabase = await createClient();
  const { data: family } = await supabase.from("app_users").select("*").order("created_at");
  const { data: familyRow } = await supabase.from("families").select("invite_code, name").limit(1).single();

  return (
    <div className="px-4 py-4">
      <div className="font-display font-bold text-ink text-base mb-1">Kelola Anggota</div>
      {familyRow && (
        <div className="bg-amber-soft border border-[#f3dfa0] text-[#8a6a05] text-xs font-bold rounded-xl px-3 py-2 mb-3">
          Kode Keluarga: <span className="font-mono-brand">{familyRow.invite_code}</span> — anak pakai kode ini di
          halaman login.
        </div>
      )}
      <div className="space-y-2.5 mb-4">
        {(family as AppUser[] | null)?.map((m) => (
          <div key={m.id} className="bg-card border border-line rounded-2xl p-3 flex items-center gap-3">
            <Avatar name={m.name} color={m.avatar_color} size={40} />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-ink text-xs">{m.name}</div>
              <div className="text-[10px] text-ink-soft font-semibold">@{m.username}</div>
            </div>
            {m.role === "anak" ? (
              <span className="font-mono-brand text-[11px] font-bold text-amber">⭐{m.stars}</span>
            ) : (
              <span className="text-[9px] font-bold bg-[#eef1f6] text-ink-soft px-2 py-1 rounded-full">Ortu</span>
            )}
          </div>
        ))}
      </div>
      <AddChildForm />
    </div>
  );
}

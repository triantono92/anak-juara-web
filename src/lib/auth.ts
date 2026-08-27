import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { ParentRole } from "@/lib/types";

export type AppUserSession = {
  id: string;
  familyId: string;
  role: "ortu" | "anak";
  name: string;
  email: string | null;
  avatarColor: string;
  stars: number;
  parentRole: ParentRole | null; // hanya untuk role === "ortu"
};

/**
 * Ambil user yang sedang login (anak MAUPUN ortu) dari Supabase Auth session.
 * Menggantikan getChildSession() dan getParentUser() yang lama.
 * Kembalikan null kalau belum login atau tidak ada baris di app_users.
 */
// cache() deduplicates calls within a single request — layout + page both call this
// but only one supabase.auth.getUser() network round-trip is made per render.
export const getCurrentAppUser = cache(async (): Promise<AppUserSession | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("app_users")
    .select("id, family_id, role, name, avatar_color, stars, parent_role")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) return null;
  return {
    id: data.id,
    familyId: data.family_id,
    role: data.role as "ortu" | "anak",
    name: data.name,
    email: user.email ?? null,
    avatarColor: data.avatar_color,
    stars: data.stars ?? 0,
    parentRole: (data.parent_role as ParentRole | null) ?? null,
  };
});

/**
 * Pastikan user adalah ortu dengan hak edit penuh (bukan Wali).
 * Lempar error jika belum login, bukan ortu, atau role-nya "wali".
 * Dipakai di semua server action yang mengubah master data
 * (misi, hadiah, jadwal, anggota).
 */
export async function requireEditAccess(): Promise<AppUserSession> {
  const u = await getCurrentAppUser();
  if (!u || u.role !== "ortu") throw new Error("Belum login sebagai ortu.");
  if (u.parentRole === "wali") {
    throw new Error("Wali hanya bisa menyetujui — tidak bisa mengubah misi, hadiah, jadwal, atau data anggota.");
  }
  return u;
}

// Compat wrappers — dipakai oleh halaman anak dan API route yang menggunakan
// shape lama. Kembalikan null jika user belum login atau role tidak cocok.
export async function getChildSession() {
  const u = await getCurrentAppUser();
  if (!u || u.role !== "anak") return null;
  return { childId: u.id, familyId: u.familyId, exp: Infinity };
}

export async function getParentUser() {
  const u = await getCurrentAppUser();
  if (!u || u.role !== "ortu") return null;
  return { id: u.id };
}

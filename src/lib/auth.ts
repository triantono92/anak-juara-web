import { createClient } from "@/lib/supabase/server";

export type AppUserSession = {
  id: string;
  familyId: string;
  role: "ortu" | "anak";
  name: string;
  email: string | null;
  avatarColor: string;
  stars: number;
};

/**
 * Ambil user yang sedang login (anak MAUPUN ortu) dari Supabase Auth session.
 * Menggantikan getChildSession() dan getParentUser() yang lama.
 * Kembalikan null kalau belum login atau tidak ada baris di app_users.
 */
export async function getCurrentAppUser(): Promise<AppUserSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("app_users")
    .select("id, family_id, role, name, avatar_color, stars")
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
  };
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

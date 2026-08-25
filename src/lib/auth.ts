import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { CHILD_SESSION_COOKIE, verifyChildSession } from "@/lib/childSession";

// Sesi anak (login PIN, cookie custom — lihat childSession.ts).
export async function getChildSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CHILD_SESSION_COOKIE)?.value;
  return verifyChildSession(token); // { childId, familyId, exp } | null
}

// Sesi ortu (Supabase Auth). Kembalikan null kalau belum login.
export async function getParentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

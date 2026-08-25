import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { CHILD_SESSION_COOKIE, CHILD_SESSION_MAX_AGE, hashPin, signChildSession } from "@/lib/childSession";

// POST /api/child-auth — login anak pakai username + PIN 4 digit.
// Dipanggil dari /anak/login. Memakai service-role client karena anak
// tidak punya sesi Supabase Auth (lihat catatan RLS di schema.sql).
export async function POST(req: NextRequest) {
  const { familyCode, username, pin } = await req.json();
  if (!familyCode || !username || !pin) {
    return NextResponse.json({ error: "familyCode, username, dan pin wajib diisi." }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: family } = await supabase
    .from("families")
    .select("id")
    .eq("invite_code", familyCode.trim().toLowerCase())
    .maybeSingle();

  if (!family) {
    return NextResponse.json({ error: "Kode keluarga tidak ditemukan." }, { status: 404 });
  }

  const { data: child, error } = await supabase
    .from("app_users")
    .select("id, family_id, name, role, avatar_color, stars, pin_hash")
    .eq("family_id", family.id)
    .eq("username", username)
    .eq("role", "anak")
    .maybeSingle();

  if (error || !child || child.pin_hash !== hashPin(pin)) {
    return NextResponse.json({ error: "Username atau PIN salah." }, { status: 401 });
  }

  const token = signChildSession(child.id, child.family_id);
  const res = NextResponse.json({
    id: child.id,
    name: child.name,
    role: child.role,
    avatarColor: child.avatar_color,
    stars: child.stars,
  });
  res.cookies.set(CHILD_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: CHILD_SESSION_MAX_AGE,
    path: "/",
  });
  return res;
}

// DELETE /api/child-auth — logout anak (hapus cookie sesi).
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CHILD_SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}

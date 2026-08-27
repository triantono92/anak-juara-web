import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getParentUser } from "@/lib/auth";

// POST /api/family/add-child — ortu menambahkan akun anak (email + password).
// Membuat akun Supabase Auth untuk anak lalu menyimpan profil di app_users.
export async function POST(req: NextRequest) {
  const user = await getParentUser();
  if (!user) return NextResponse.json({ error: "Belum login sebagai ortu." }, { status: 401 });

  const { name, email, password, avatarColor, age } = await req.json();
  if (!name || !email || !password || password.length < 6) {
    return NextResponse.json(
      { error: "name, email, dan password (min. 6 karakter) wajib diisi." },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();

  // Ambil family_id ortu yang sedang login
  const { data: me } = await supabase
    .from("app_users")
    .select("family_id")
    .eq("id", user.id)
    .single();
  if (!me) return NextResponse.json({ error: "Akun ortu tidak ditemukan." }, { status: 404 });

  // Buat akun Supabase Auth untuk anak
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // langsung aktif tanpa perlu verifikasi email
  });
  if (authErr || !authData.user) {
    return NextResponse.json(
      { error: authErr?.message ?? "Gagal membuat akun anak." },
      { status: 500 },
    );
  }

  const { data: child, error: insertErr } = await supabase
    .from("app_users")
    .insert({
      id: authData.user.id,
      family_id: me.family_id,
      name,
      role: "anak",
      username: name.toLowerCase().replace(/\s+/g, "."),
      auth_method: "password",
      avatar_color: avatarColor || "#3EA8DE",
      age: age ?? null,
      member_status: "aktif",
    })
    .select("id, name, avatar_color, stars")
    .single();

  if (insertErr) {
    // Rollback: hapus auth user yang baru dibuat
    await supabase.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json(child);
}

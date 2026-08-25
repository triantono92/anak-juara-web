import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getParentUser } from "@/lib/auth";
import { hashPin } from "@/lib/childSession";

// POST /api/family/add-child — ortu menambahkan akun anak (username + PIN 4 digit).
// app_users tidak punya RLS policy INSERT (lihat schema.sql), jadi wajib lewat
// route ini yang memverifikasi ortu lebih dulu lalu pakai service-role client.
export async function POST(req: NextRequest) {
  const user = await getParentUser();
  if (!user) return NextResponse.json({ error: "Belum login sebagai ortu." }, { status: 401 });

  const { name, username, pin, avatarColor } = await req.json();
  if (!name || !username || !pin || pin.length !== 4) {
    return NextResponse.json({ error: "name, username, dan pin (4 digit) wajib diisi." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: me } = await supabase.from("app_users").select("family_id").eq("id", user.id).single();
  if (!me) return NextResponse.json({ error: "Akun ortu tidak ditemukan." }, { status: 404 });

  const { data: child, error } = await supabase
    .from("app_users")
    .insert({
      family_id: me.family_id,
      name,
      role: "anak",
      username,
      auth_method: "pin",
      pin_hash: hashPin(pin),
      avatar_color: avatarColor || "#FF7A59",
    })
    .select("id, name, username, avatar_color, stars")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(child);
}

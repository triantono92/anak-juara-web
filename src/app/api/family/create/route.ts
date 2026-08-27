import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, createClient } from "@/lib/supabase/server";

// POST /api/family/create — dipanggil sekali saat ortu pertama mendaftar.
// Membuat baris `families` + `app_users` (role 'ortu', id = auth user id)
// dalam satu alur. Pakai service-role client karena RLS mensyaratkan
// app_users sudah ada sebelum current_family_id() bisa jalan (chicken-and-egg).
export async function POST(req: NextRequest) {
  // Baca userId dari sesi Supabase Auth yang aktif (bukan dari body).
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  const { familyName, parentName, parentRole } = await req.json();
  if (!familyName || !parentName) {
    return NextResponse.json(
      { error: "familyName dan parentName wajib diisi." },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();

  const { data: family, error: familyErr } = await supabase
    .from("families")
    .insert({ name: familyName })
    .select()
    .single();

  if (familyErr) return NextResponse.json({ error: familyErr.message }, { status: 500 });

  const { error: userErr } = await supabase.from("app_users").insert({
    id: user.id,
    family_id: family.id,
    name: parentName,
    role: "ortu",
    username: parentName.toLowerCase().replace(/\s+/g, "."),
    auth_method: "password",
    avatar_color: "#17395B",
    parent_role: parentRole ?? "bunda",
    member_status: "pemilik",
  });

  if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 });

  return NextResponse.json({ family });
}

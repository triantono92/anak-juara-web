import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// POST /api/family/create — dipanggil sekali saat ortu pertama mendaftar.
// Membuat baris `families` + `app_users` (role 'ortu', id = auth user id)
// dalam satu alur. Pakai service-role client karena RLS mensyaratkan
// app_users sudah ada sebelum current_family_id() bisa jalan (chicken-and-egg).
export async function POST(req: NextRequest) {
  const { userId, familyName, parentName, parentRole } = await req.json();
  if (!userId || !familyName || !parentName) {
    return NextResponse.json({ error: "userId, familyName, parentName wajib diisi." }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: family, error: familyErr } = await supabase
    .from("families")
    .insert({ name: familyName })
    .select()
    .single();

  if (familyErr) return NextResponse.json({ error: familyErr.message }, { status: 500 });

  const { error: userErr } = await supabase.from("app_users").insert({
    id: userId,
    family_id: family.id,
    name: parentName,
    role: "ortu",
    username: parentName.toLowerCase().replace(/\s+/g, "."),
    auth_method: "password",
    avatar_color: "#1E2A4A",
    parent_role: parentRole ?? "bunda",
    member_status: "pemilik",
  });

  if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 });

  return NextResponse.json({ family });
}

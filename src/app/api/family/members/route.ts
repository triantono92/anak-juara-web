import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// GET /api/family/members?code=JUA7
// Returns family info + all members (children + parents)
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code || code.trim().length < 4) {
    return NextResponse.json({ error: "Kode keluarga tidak valid." }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Case-insensitive lookup
  const { data: family } = await supabase
    .from("families")
    .select("id, name, invite_code")
    .ilike("invite_code", code.trim())
    .maybeSingle();

  if (!family) {
    return NextResponse.json({ error: "Kode keluarga tidak ditemukan." }, { status: 404 });
  }

  const { data: members } = await supabase
    .from("app_users")
    .select("id, name, role, avatar_color, username, parent_role, member_status, age, stars")
    .eq("family_id", family.id)
    .order("role") // ortu dulu, anak belakang
    .order("created_at");

  return NextResponse.json({
    family: { id: family.id, name: family.name, invite_code: family.invite_code },
    members: members ?? [],
  });
}

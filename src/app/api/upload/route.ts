import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getChildSession } from "@/lib/auth";

// POST /api/upload — anak upload foto bukti misi ke Supabase Storage.
// Body: { base64: string, mediaType?: string }
// Butuh bucket "submissions" (lihat README) — dibuat lewat dashboard/CLI Supabase,
// bukan lewat schema.sql.
export async function POST(req: NextRequest) {
  const session = await getChildSession();
  if (!session) {
    return NextResponse.json({ error: "Belum login sebagai anak." }, { status: 401 });
  }

  const { base64, mediaType } = await req.json();
  if (!base64) {
    return NextResponse.json({ error: "base64 wajib diisi." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const ext = (mediaType || "image/jpeg").split("/")[1] || "jpg";
  const path = `${session.familyId}/${session.childId}/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(base64, "base64");

  const { error } = await supabase.storage.from("submissions").upload(path, buffer, {
    contentType: mediaType || "image/jpeg",
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: pub } = supabase.storage.from("submissions").getPublicUrl(path);
  return NextResponse.json({ url: pub.publicUrl, path });
}

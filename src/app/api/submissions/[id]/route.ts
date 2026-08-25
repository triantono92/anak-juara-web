import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, createClient } from "@/lib/supabase/server";
import { getParentUser } from "@/lib/auth";

// PATCH /api/submissions/:id — ortu approve/reject submission foto/rekam.
// Body: { action: "approve" | "reject" }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const parent = await getParentUser();
  if (!parent) {
    return NextResponse.json({ error: "Belum login sebagai ortu." }, { status: 401 });
  }

  const { id } = await params;
  const { action } = await req.json();
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action harus 'approve' atau 'reject'." }, { status: 400 });
  }

  // Pakai client bersesi ortu supaya RLS tetap berlaku (ortu hanya bisa
  // menyentuh submission dari keluarganya sendiri).
  const supabase = await createClient();
  const { data: sub, error: subErr } = await supabase
    .from("submissions")
    .select("id, mission_id, child_id, status")
    .eq("id", id)
    .single();

  if (subErr || !sub) {
    return NextResponse.json({ error: "Submission tidak ditemukan." }, { status: 404 });
  }
  if (sub.status !== "pending") {
    return NextResponse.json({ error: "Submission ini sudah diproses." }, { status: 409 });
  }

  const { data: mission } = await supabase.from("missions").select("stars").eq("id", sub.mission_id).single();

  if (action === "reject") {
    const { data, error } = await supabase
      .from("submissions")
      .update({ status: "rejected", reviewed_by: parent.id })
      .eq("id", id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // approve: update status + tambahkan bintang ke anak (pakai service client
  // untuk operasi lintas-tabel yang tidak dicover satu RLS policy).
  const service = createServiceClient();
  const stars = mission?.stars ?? 0;

  const { data: updatedSub, error: updateErr } = await service
    .from("submissions")
    .update({ status: "approved", stars_awarded: stars, reviewed_by: parent.id })
    .eq("id", id)
    .select()
    .single();

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  const { data: child } = await service.from("app_users").select("stars").eq("id", sub.child_id).single();
  await service.from("app_users").update({ stars: (child?.stars ?? 0) + stars }).eq("id", sub.child_id);

  return NextResponse.json(updatedSub);
}

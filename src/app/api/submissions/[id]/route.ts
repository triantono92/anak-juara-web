import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, createClient } from "@/lib/supabase/server";
import { getCurrentAppUser } from "@/lib/auth";

// PATCH /api/submissions/:id — ortu approve/reject submission foto/rekam.
// Body: { action: "approve" | "reject" }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const parent = await getCurrentAppUser();
  if (!parent || parent.role !== "ortu") {
    return NextResponse.json({ error: "Belum login sebagai ortu." }, { status: 401 });
  }

  const { id } = await params;
  const { action } = await req.json();
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action harus 'approve' atau 'reject'." }, { status: 400 });
  }

  // Baca submission via session client — RLS memfilter ke family ortu yang login.
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

  // Defense-in-depth: verifikasi eksplisit bahwa child_id submission
  // benar-benar ada di family yang sama dengan requester — jaring pengaman
  // jika suatu saat ada bug di RLS.
  const service = createServiceClient();
  const { data: childCheck } = await service
    .from("app_users")
    .select("id")
    .eq("id", sub.child_id)
    .eq("family_id", parent.familyId)
    .maybeSingle();
  if (!childCheck) {
    return NextResponse.json({ error: "Submission tidak ditemukan." }, { status: 404 });
  }

  const { data: mission } = await supabase
    .from("missions")
    .select("stars")
    .eq("id", sub.mission_id)
    .single();

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

  // approve: update status via service client, lalu tambah bintang atomik via RPC.
  const stars = mission?.stars ?? 0;

  const { data: updatedSub, error: updateErr } = await service
    .from("submissions")
    .update({ status: "approved", stars_awarded: stars, reviewed_by: parent.id })
    .eq("id", id)
    .select()
    .single();

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  const { error: rpcErr } = await service.rpc("increment_stars", {
    p_user_id: sub.child_id,
    p_delta: stars,
  });
  if (rpcErr) return NextResponse.json({ error: rpcErr.message }, { status: 500 });

  return NextResponse.json(updatedSub);
}

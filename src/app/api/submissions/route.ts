import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getChildSession } from "@/lib/auth";

// POST /api/submissions — anak submit bukti misi (foto/rekam/kuis).
// Untuk verify_type 'kuis', kirim juga quiz_json + score + answers_correct;
// status langsung 'auto_done' dan bintang ditambahkan di sini (lihat spesifikasi §3).
export async function POST(req: NextRequest) {
  const session = await getChildSession();
  if (!session) {
    return NextResponse.json({ error: "Belum login sebagai anak." }, { status: 401 });
  }

  const body = await req.json();
  const { missionId, verifyType, date, photoUrl, audioUrl, quiz, score, answersCorrect } = body;

  if (!missionId || !verifyType || !date) {
    return NextResponse.json({ error: "missionId, verifyType, date wajib diisi." }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: mission, error: missionErr } = await supabase
    .from("missions")
    .select("id, family_id, stars")
    .eq("id", missionId)
    .single();

  if (missionErr || !mission || mission.family_id !== session.familyId) {
    return NextResponse.json({ error: "Misi tidak ditemukan." }, { status: 404 });
  }

  const isKuis = verifyType === "kuis";
  const { data: sub, error } = await supabase
    .from("submissions")
    .insert({
      mission_id: missionId,
      child_id: session.childId,
      date,
      verify_type: verifyType,
      status: isKuis ? "auto_done" : "pending",
      photo_url: photoUrl ?? null,
      audio_url: audioUrl ?? null,
      quiz_json: isKuis ? quiz : null,
      score: isKuis ? score : null,
      answers_correct: isKuis ? answersCorrect : null,
      stars_awarded: isKuis ? mission.stars : 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (isKuis) {
    // Kuis auto-selesai: tambah bintang atomik via RPC — menghindari
    // race condition read-then-write non-atomik.
    const { error: rpcErr } = await supabase.rpc("increment_stars", {
      p_user_id: session.childId,
      p_delta: mission.stars,
    });
    if (rpcErr) return NextResponse.json({ error: rpcErr.message }, { status: 500 });
  }

  return NextResponse.json(sub);
}

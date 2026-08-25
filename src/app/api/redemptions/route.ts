import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getChildSession } from "@/lib/auth";

// POST /api/redemptions — anak menukar bintang dengan hadiah.
export async function POST(req: NextRequest) {
  const session = await getChildSession();
  if (!session) {
    return NextResponse.json({ error: "Belum login sebagai anak." }, { status: 401 });
  }

  const { rewardId } = await req.json();
  const supabase = createServiceClient();

  const { data: reward, error: rewardErr } = await supabase
    .from("rewards")
    .select("id, family_id, name, stars_cost, active")
    .eq("id", rewardId)
    .single();

  if (rewardErr || !reward || !reward.active || reward.family_id !== session.familyId) {
    return NextResponse.json({ error: "Hadiah tidak tersedia." }, { status: 404 });
  }

  const { data: child } = await supabase.from("app_users").select("stars").eq("id", session.childId).single();
  if (!child || child.stars < reward.stars_cost) {
    return NextResponse.json({ error: "Bintang tidak cukup." }, { status: 400 });
  }

  const { data: redemption, error } = await supabase
    .from("redemptions")
    .insert({
      child_id: session.childId,
      reward_id: reward.id,
      reward_name: reward.name,
      stars_spent: reward.stars_cost,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("app_users").update({ stars: child.stars - reward.stars_cost }).eq("id", session.childId);

  return NextResponse.json(redemption);
}

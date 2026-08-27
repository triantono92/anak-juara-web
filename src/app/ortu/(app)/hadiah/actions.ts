"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAppUser } from "@/lib/auth";
import type { RewardCategory } from "@/lib/types";

export async function addReward(input: {
  name: string;
  category: RewardCategory;
  starsCost: number;
  assignedTo: string;
}) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== "ortu") throw new Error("Belum login sebagai ortu.");

  const supabase = await createClient();
  const me = { family_id: user.familyId };

  const icon = "";

  const { error } = await supabase.from("rewards").insert({
    family_id: me.family_id,
    name: input.name,
    icon,
    category: input.category,
    stars_cost: input.starsCost,
    assigned_to: input.assignedTo,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/ortu/hadiah");
}

export async function toggleReward(id: string, active: boolean) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== "ortu") throw new Error("Belum login sebagai ortu.");

  const supabase = await createClient();

  // Defense-in-depth: verifikasi reward milik keluarga requester sebelum update.
  const { data: reward } = await supabase
    .from("rewards")
    .select("family_id")
    .eq("id", id)
    .single();
  if (!reward || reward.family_id !== user.familyId) throw new Error("Hadiah tidak ditemukan.");

  const { error } = await supabase
    .from("rewards")
    .update({ active: !active })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/ortu/hadiah");
}

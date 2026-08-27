"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireEditAccess } from "@/lib/auth";
import type { RewardCategory } from "@/lib/types";

export async function addReward(input: {
  name: string;
  category: RewardCategory;
  starsCost: number;
  assignedTo: string;
}) {
  const user = await requireEditAccess();
  const supabase = await createClient();

  const { error } = await supabase.from("rewards").insert({
    family_id: user.familyId,
    name: input.name,
    icon: "",
    category: input.category,
    stars_cost: input.starsCost,
    assigned_to: input.assignedTo,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/ortu/hadiah");
}

export async function toggleReward(id: string, active: boolean) {
  const user = await requireEditAccess();
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

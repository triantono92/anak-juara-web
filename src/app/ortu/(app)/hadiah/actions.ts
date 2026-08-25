"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getParentUser } from "@/lib/auth";
import type { RewardCategory } from "@/lib/types";

export async function addReward(input: {
  name: string;
  category: RewardCategory;
  starsCost: number;
  assignedTo: string;
}) {
  const user = await getParentUser();
  if (!user) throw new Error("Belum login sebagai ortu.");

  const supabase = await createClient();
  const { data: me } = await supabase.from("app_users").select("family_id").eq("id", user.id).single();
  if (!me) throw new Error("Akun ortu tidak ditemukan.");

  const icon = input.category === "Uang" ? "💵" : input.category === "Privilege" ? "🎮" : "🎁";

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
  const user = await getParentUser();
  if (!user) throw new Error("Belum login sebagai ortu.");

  const supabase = await createClient();
  const { error } = await supabase.from("rewards").update({ active: !active }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/ortu/hadiah");
}

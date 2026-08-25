"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getParentUser } from "@/lib/auth";

export async function addMission(input: {
  name: string;
  icon: string;
  verifyType: "foto" | "rekam" | "kuis";
  days: number[];
  assignedTo: string[];
  stars: number;
  deadlineTime: string;
}) {
  const user = await getParentUser();
  if (!user) throw new Error("Belum login sebagai ortu.");

  const supabase = await createClient();
  const { data: me } = await supabase.from("app_users").select("family_id").eq("id", user.id).single();
  if (!me) throw new Error("Akun ortu tidak ditemukan.");

  const { error } = await supabase.from("missions").insert({
    family_id: me.family_id,
    name: input.name,
    icon: input.icon,
    verify_type: input.verifyType,
    days: input.days,
    assigned_to: input.assignedTo,
    stars: input.stars,
    deadline_time: input.deadlineTime,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/ortu/misi");
}

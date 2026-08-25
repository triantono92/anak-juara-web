"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getParentUser } from "@/lib/auth";

type MissionInput = {
  name: string;
  icon: string;
  verifyType: "foto" | "rekam" | "kuis";
  days: number[];
  assignedTo: string[];
  stars: number;
  deadlineTime: string;
};

export async function addMission(input: MissionInput) {
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

export async function updateMission(id: string, input: MissionInput) {
  const user = await getParentUser();
  if (!user) throw new Error("Belum login sebagai ortu.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("missions")
    .update({
      name: input.name,
      icon: input.icon,
      verify_type: input.verifyType,
      days: input.days,
      assigned_to: input.assignedTo,
      stars: input.stars,
      deadline_time: input.deadlineTime,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/ortu/misi");
}

export async function deleteMission(id: string) {
  const user = await getParentUser();
  if (!user) throw new Error("Belum login sebagai ortu.");

  const supabase = await createClient();
  const { error } = await supabase.from("missions").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/ortu/misi");
}

export async function toggleMissionActive(id: string, active: boolean) {
  const user = await getParentUser();
  if (!user) throw new Error("Belum login sebagai ortu.");

  const supabase = await createClient();
  const { error } = await supabase.from("missions").update({ active: !active }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/ortu/misi");
}

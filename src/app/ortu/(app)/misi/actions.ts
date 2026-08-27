"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireEditAccess } from "@/lib/auth";
import type { MissionKategori, MissionGrup, VerifyType } from "@/lib/types";

type MissionInput = {
  name: string;
  icon: string;
  verifyType: VerifyType;
  days: number[];
  assignedTo: string[];
  stars: number;
  deadlineTime: string;
  kategori?: MissionKategori;
  grup?: MissionGrup;
};

export async function addMission(input: MissionInput) {
  const user = await requireEditAccess();
  const supabase = await createClient();

  const { error } = await supabase.from("missions").insert({
    family_id: user.familyId,
    name: input.name,
    icon: input.icon,
    verify_type: input.verifyType,
    days: input.days,
    assigned_to: input.assignedTo,
    stars: input.stars,
    deadline_time: input.deadlineTime,
    kategori: input.kategori ?? "Netral",
    grup: input.grup ?? "Harian",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/ortu/misi");
}

export async function updateMission(id: string, input: MissionInput) {
  await requireEditAccess();
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
      kategori: input.kategori ?? "Netral",
      grup: input.grup ?? "Harian",
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/ortu/misi");
}

export async function deleteMission(id: string) {
  await requireEditAccess();
  const supabase = await createClient();
  const { error } = await supabase.from("missions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/ortu/misi");
}

export async function toggleMissionActive(id: string, active: boolean) {
  await requireEditAccess();
  const supabase = await createClient();
  const { error } = await supabase
    .from("missions")
    .update({ active: !active })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/ortu/misi");
}

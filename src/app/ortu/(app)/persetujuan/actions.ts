"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getParentUser } from "@/lib/auth";

export async function approveRedemption(id: string) {
  const user = await getParentUser();
  if (!user) throw new Error("Unauthorized");
  const supabase = await createClient();
  const { error } = await supabase
    .from("redemptions")
    .update({ status: "disetujui" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/ortu/persetujuan");
}

export async function rejectRedemption(id: string) {
  const user = await getParentUser();
  if (!user) throw new Error("Unauthorized");
  const supabase = await createClient();
  const { error } = await supabase
    .from("redemptions")
    .update({ status: "ditolak" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/ortu/persetujuan");
}

export async function approveMember(id: string) {
  const user = await getParentUser();
  if (!user) throw new Error("Unauthorized");
  const supabase = await createClient();
  await supabase.from("app_users").update({ member_status: "aktif" }).eq("id", id);
  revalidatePath("/ortu/persetujuan");
  revalidatePath("/ortu/anggota");
}

export async function rejectMember(id: string) {
  const user = await getParentUser();
  if (!user) throw new Error("Unauthorized");
  const supabase = await createClient();
  await supabase.from("app_users").delete().eq("id", id);
  revalidatePath("/ortu/persetujuan");
  revalidatePath("/ortu/anggota");
}

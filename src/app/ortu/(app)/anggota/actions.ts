"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient, createClient } from "@/lib/supabase/server";
import { getParentUser } from "@/lib/auth";
import type { ParentRole } from "@/lib/types";

export async function addChild(input: {
  name: string;
  age: number;
  avatarColor: string;
  email: string;
  password: string;
}) {
  const user = await getParentUser();
  if (!user) throw new Error("Unauthorized");
  const supabase = await createClient();
  const serviceClient = createServiceClient();

  const { data: me } = await supabase
    .from("app_users")
    .select("family_id")
    .eq("id", user.id)
    .single();
  if (!me) throw new Error("Akun tidak ditemukan");

  // Buat akun Supabase Auth untuk anak
  const { data: authData, error: authErr } = await serviceClient.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });
  if (authErr || !authData.user) {
    throw new Error(authErr?.message ?? "Gagal membuat akun anak.");
  }

  const { error } = await serviceClient.from("app_users").insert({
    id: authData.user.id,
    family_id: me.family_id,
    name: input.name,
    role: "anak",
    username: input.name.toLowerCase().replace(/\s+/g, "."),
    auth_method: "password",
    avatar_color: input.avatarColor,
    age: input.age,
    member_status: "aktif",
  });
  if (error) {
    await serviceClient.auth.admin.deleteUser(authData.user.id);
    throw new Error(error.message);
  }
  revalidatePath("/ortu/anggota");
}

export async function addParent(input: {
  name: string;
  email: string;
  parentRole: ParentRole;
}) {
  const user = await getParentUser();
  if (!user) throw new Error("Unauthorized");
  const supabase = await createClient();

  const { data: me } = await supabase
    .from("app_users")
    .select("family_id")
    .eq("id", user.id)
    .single();
  if (!me) throw new Error("Akun tidak ditemukan");

  const username = input.name.toLowerCase().replace(/\s+/g, ".");
  // Insert ortu baru dengan member_status menunggu (nanti approve via email/login)
  const { error } = await supabase.from("app_users").insert({
    family_id: me.family_id,
    name: input.name,
    role: "ortu",
    username,
    auth_method: "password",
    avatar_color: "#3EA8DE",
    parent_role: input.parentRole,
    member_status: "menunggu",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/ortu/anggota");
}

export async function generateNewInviteCode() {
  const user = await getParentUser();
  if (!user) throw new Error("Unauthorized");
  const supabase = await createClient();
  const { data: me } = await supabase
    .from("app_users")
    .select("family_id")
    .eq("id", user.id)
    .single();
  if (!me) throw new Error("Akun tidak ditemukan");

  const newCode = Math.random().toString(36).slice(2, 8).toUpperCase();
  await supabase
    .from("families")
    .update({ invite_code: newCode })
    .eq("id", me.family_id);
  revalidatePath("/ortu/anggota");
}

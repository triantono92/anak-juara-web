"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient, createClient } from "@/lib/supabase/server";
import { getCurrentAppUser, requireEditAccess } from "@/lib/auth";
import type { ParentRole } from "@/lib/types";

// Normalkan pesan error dari Supabase Admin ke bahasa Indonesia yang jelas.
function normalizeAuthError(msg: string): string {
  const lower = msg.toLowerCase();
  if (
    lower.includes("already registered") ||
    lower.includes("already been registered") ||
    lower.includes("email address is already") ||
    lower.includes("duplicate")
  ) {
    return "Email ini sudah terdaftar. Gunakan email lain.";
  }
  return msg;
}

export async function addChild(input: {
  name: string;
  age: number;
  avatarColor: string;
  email: string;
  password: string;
}) {
  const user = await requireEditAccess(); // blok Wali
  const serviceClient = createServiceClient();

  const { data: authData, error: authErr } = await serviceClient.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });
  if (authErr || !authData.user) {
    throw new Error(normalizeAuthError(authErr?.message ?? "Gagal membuat akun anak."));
  }

  const { error } = await serviceClient.from("app_users").insert({
    id: authData.user.id,
    family_id: user.familyId, // dari session, BUKAN dari body
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
  password: string;
  parentRole: ParentRole;
}) {
  const user = await requireEditAccess(); // blok Wali
  const serviceClient = createServiceClient();

  // Buat akun Supabase Auth untuk co-parent — WAJIB supaya bisa login di /masuk.
  const { data: authData, error: authErr } = await serviceClient.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });
  if (authErr || !authData.user) {
    throw new Error(normalizeAuthError(authErr?.message ?? "Gagal membuat akun."));
  }

  const { error } = await serviceClient.from("app_users").insert({
    id: authData.user.id,
    family_id: user.familyId, // dari session, BUKAN dari body
    name: input.name,
    role: "ortu",
    username: input.name.toLowerCase().replace(/\s+/g, "."),
    auth_method: "password",
    avatar_color: "#3EA8DE",
    parent_role: input.parentRole,
    member_status: "aktif", // langsung aktif — sudah diverifikasi oleh pemilik
  });
  if (error) {
    await serviceClient.auth.admin.deleteUser(authData.user.id);
    throw new Error(error.message);
  }
  revalidatePath("/ortu/anggota");
}

export async function generateNewInviteCode() {
  const user = await requireEditAccess(); // blok Wali
  const supabase = await createClient();
  const newCode = Math.random().toString(36).slice(2, 8).toUpperCase();
  await supabase.from("families").update({ invite_code: newCode }).eq("id", user.familyId);
  revalidatePath("/ortu/anggota");
}

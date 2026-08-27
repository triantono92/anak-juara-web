"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient, createClient } from "@/lib/supabase/server";
import { getCurrentAppUser } from "@/lib/auth";

// Helper: ambil family_id requester yang sedang login sebagai ortu.
// Lempar error jika tidak login atau bukan ortu.
async function requireOrtuFamily(): Promise<string> {
  const user = await getCurrentAppUser();
  if (!user || user.role !== "ortu") throw new Error("Unauthorized");
  return user.familyId;
}

export async function approveRedemption(id: string) {
  // redemptions diproteksi RLS "ortu lihat penukaran sekeluarga" (child_id in family)
  // → createClient() cukup, RLS menolak update di luar keluarga.
  const user = await getCurrentAppUser();
  if (!user || user.role !== "ortu") throw new Error("Unauthorized");
  const supabase = await createClient();
  const { error } = await supabase
    .from("redemptions")
    .update({ status: "disetujui" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/ortu/persetujuan");
}

export async function rejectRedemption(id: string) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== "ortu") throw new Error("Unauthorized");
  const supabase = await createClient();
  const { error } = await supabase
    .from("redemptions")
    .update({ status: "ditolak" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/ortu/persetujuan");
}

export async function approveMember(id: string) {
  // app_users tidak punya RLS UPDATE policy → wajib service client + cek manual.
  const familyId = await requireOrtuFamily();
  const service = createServiceClient();

  // Verifikasi target memang anggota keluarga yang sama sebelum update.
  const { data: target } = await service
    .from("app_users")
    .select("id, family_id")
    .eq("id", id)
    .single();
  if (!target || target.family_id !== familyId) throw new Error("Anggota tidak ditemukan.");

  const { error } = await service
    .from("app_users")
    .update({ member_status: "aktif" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/ortu/persetujuan");
  revalidatePath("/ortu/anggota");
}

export async function rejectMember(id: string) {
  // app_users tidak punya RLS DELETE policy → wajib service client + cek manual.
  const familyId = await requireOrtuFamily();
  const service = createServiceClient();

  // Verifikasi target memang anggota keluarga yang sama sebelum delete.
  const { data: target } = await service
    .from("app_users")
    .select("id, family_id")
    .eq("id", id)
    .single();
  if (!target || target.family_id !== familyId) throw new Error("Anggota tidak ditemukan.");

  // Tolak penghapusan diri sendiri.
  const me = await getCurrentAppUser();
  if (target.id === me!.id) throw new Error("Tidak bisa menghapus akun sendiri.");

  const { error } = await service.from("app_users").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/ortu/persetujuan");
  revalidatePath("/ortu/anggota");
}

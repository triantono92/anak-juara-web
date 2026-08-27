"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireEditAccess } from "@/lib/auth";
import type { MissionKategori } from "@/lib/types";

export async function addScheduleBlock(input: {
  childId: string;
  hari: number;
  jamMulai: string;
  durasiMenit: number;
  nama: string;
  kategori: MissionKategori;
  missionIds: string[];
}) {
  const user = await requireEditAccess();
  const supabase = await createClient();

  const { error } = await supabase.from("schedule_blocks").insert({
    child_id: input.childId,
    family_id: user.familyId,
    hari: input.hari,
    jam_mulai: input.jamMulai,
    durasi_menit: input.durasiMenit,
    nama: input.nama,
    kategori: input.kategori,
    mission_ids: input.missionIds,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/ortu/jadwal");
  revalidatePath("/anak/jadwal");
}

export async function updateScheduleBlock(
  id: string,
  input: {
    jamMulai: string;
    durasiMenit: number;
    nama: string;
    kategori: MissionKategori;
    missionIds: string[];
  }
) {
  await requireEditAccess();
  const supabase = await createClient();
  const { error } = await supabase
    .from("schedule_blocks")
    .update({
      jam_mulai: input.jamMulai,
      durasi_menit: input.durasiMenit,
      nama: input.nama,
      kategori: input.kategori,
      mission_ids: input.missionIds,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/ortu/jadwal");
  revalidatePath("/anak/jadwal");
}

export async function deleteScheduleBlock(id: string) {
  await requireEditAccess();
  const supabase = await createClient();
  await supabase.from("schedule_blocks").delete().eq("id", id);
  revalidatePath("/ortu/jadwal");
  revalidatePath("/anak/jadwal");
}

export async function toggleScheduleBlock(id: string, aktif: boolean) {
  await requireEditAccess();
  const supabase = await createClient();
  await supabase.from("schedule_blocks").update({ aktif: !aktif }).eq("id", id);
  revalidatePath("/ortu/jadwal");
}

export async function copyBlocksToWeekdays(childId: string, fromHari: number) {
  const user = await requireEditAccess();
  const supabase = await createClient();

  const { data: sourceBlocks } = await supabase
    .from("schedule_blocks")
    .select("*")
    .eq("child_id", childId)
    .eq("hari", fromHari)
    .eq("family_id", user.familyId); // pastikan hanya blok keluarga sendiri

  if (!sourceBlocks?.length) return;

  const weekdays = [0, 1, 2, 3, 4].filter((h) => h !== fromHari);
  for (const targetHari of weekdays) {
    await supabase
      .from("schedule_blocks")
      .delete()
      .eq("child_id", childId)
      .eq("hari", targetHari);
    const inserts = sourceBlocks.map(
      (b: {
        child_id: string;
        family_id: string;
        jam_mulai: string;
        durasi_menit: number;
        nama: string;
        kategori: MissionKategori;
        mission_ids: string[];
        aktif: boolean;
      }) => ({
        child_id: b.child_id,
        family_id: b.family_id,
        hari: targetHari,
        jam_mulai: b.jam_mulai,
        durasi_menit: b.durasi_menit,
        nama: b.nama,
        kategori: b.kategori,
        mission_ids: b.mission_ids,
        aktif: b.aktif,
      })
    );
    await supabase.from("schedule_blocks").insert(inserts);
  }
  revalidatePath("/ortu/jadwal");
  revalidatePath("/anak/jadwal");
}

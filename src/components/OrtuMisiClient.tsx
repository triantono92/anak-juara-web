"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BottomSheet } from "./BottomSheet";
import { CategoryIcon } from "./CategoryIcon";
import {
  addMission,
  updateMission,
  deleteMission,
  toggleMissionActive,
} from "@/app/ortu/(app)/misi/actions";
import type { Mission, AppUser, MissionKategori, MissionGrup, VerifyType } from "@/lib/types";

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const KATEGORI_LIST: MissionKategori[] = ["Ibadah", "Belajar", "Rumah", "Sehat", "Sekolah", "Netral"];
const VERIFY_TYPES: VerifyType[] = ["foto", "rekam", "kuis"];

function MisiToggle({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={(e) => {
        e.stopPropagation();
        startTransition(async () => {
          await toggleMissionActive(id, active);
          router.refresh();
        });
      }}
      className={`w-10 h-6 rounded-full relative transition-colors flex-shrink-0 ${
        active ? "bg-green" : "bg-[#E1EAF2]"
      }`}
    >
      <span
        className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full transition-transform ${
          active ? "translate-x-[18px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

function MisiRow({
  mission,
  kids,
  onEdit,
}: {
  mission: Mission;
  kids: AppUser[];
  onEdit: (m: Mission) => void;
}) {
  const assignedKids = kids.filter((k) => mission.assigned_to.includes(k.id));
  return (
    <button
      onClick={() => onEdit(mission)}
      className={`w-full bg-white rounded-2xl p-3.5 card-shadow flex items-center gap-3 text-left transition-opacity ${
        !mission.active ? "opacity-50" : ""
      }`}
    >
      <CategoryIcon kategori={mission.kategori ?? "Netral"} size={40} />
      <div className="flex-1 min-w-0">
        <div className="font-bold text-navy text-sm">{mission.name}</div>
        <div className="text-muted text-xs">
          ★ {mission.stars} · {mission.verify_type} ·{" "}
          {assignedKids.length > 0
            ? assignedKids.map((k) => k.name).join(", ")
            : "Semua"}
        </div>
        <div className="flex gap-0.5 mt-1.5">
          {DAYS.map((d, i) => (
            <span
              key={i}
              className={`w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold ${
                mission.days.includes(i)
                  ? "bg-[#C8F0E5] text-[#1F8F76]"
                  : "bg-[#F6F9FC] text-[#C5D5E2]"
              }`}
            >
              {d[0]}
            </span>
          ))}
        </div>
      </div>
      <MisiToggle id={mission.id} active={mission.active} />
    </button>
  );
}

function MisiSheetForm({
  mission,
  kids,
  onClose,
}: {
  mission: Mission | null; // null = tambah baru
  kids: AppUser[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(mission?.name ?? "");
  const [stars, setStars] = useState(mission?.stars ?? 20);
  const [kategori, setKategori] = useState<MissionKategori>(mission?.kategori ?? "Netral");
  const [grup, setGrup] = useState<MissionGrup>(mission?.grup ?? "Harian");
  const [verifyType, setVerifyType] = useState<VerifyType>(mission?.verify_type ?? "foto");
  const [days, setDays] = useState<number[]>(mission?.days ?? [0, 1, 2, 3, 4]);
  const [assigned, setAssigned] = useState<string[]>(mission?.assigned_to ?? []);
  const [deadline, setDeadline] = useState(mission?.deadline_time ?? "20:00");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [err, setErr] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      setErr("Isi nama misi.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const input = {
        name: name.trim(),
        icon: "",
        verifyType,
        days,
        assignedTo: assigned,
        stars,
        deadlineTime: deadline,
        kategori,
        grup,
      };
      if (mission) {
        await updateMission(mission.id, input);
      } else {
        await addMission(input);
      }
      router.refresh();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Gagal menyimpan.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!mission) return;
    setBusy(true);
    try {
      await deleteMission(mission.id);
      router.refresh();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Gagal menghapus.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Nama */}
      <div>
        <label className="text-xs font-bold text-navy mb-1.5 block">Nama Misi</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Sholat Subuh"
          className="w-full border-2 border-border-color rounded-xl px-3 py-2.5 text-sm font-semibold text-navy outline-none focus:border-navy"
        />
      </div>

      {/* Poin stepper */}
      <div>
        <label className="text-xs font-bold text-navy mb-1.5 block">Poin</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStars((s) => Math.max(5, s - 5))}
            className="w-10 h-10 rounded-xl bg-grey-bg border-2 border-border-color font-bold text-navy text-lg"
          >
            −
          </button>
          <div className="flex-1 text-center font-display font-bold text-navy text-2xl">
            ★ {stars}
          </div>
          <button
            onClick={() => setStars((s) => Math.min(200, s + 5))}
            className="w-10 h-10 rounded-xl bg-grey-bg border-2 border-border-color font-bold text-navy text-lg"
          >
            +
          </button>
        </div>
      </div>

      {/* Grup Harian/Mingguan */}
      <div>
        <label className="text-xs font-bold text-navy mb-1.5 block">Frekuensi</label>
        <div className="flex gap-2">
          {(["Harian", "Mingguan"] as MissionGrup[]).map((g) => (
            <button
              key={g}
              onClick={() => setGrup(g)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 ${
                grup === g
                  ? "border-navy bg-navy text-white"
                  : "border-border-color text-muted"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Hari */}
      <div>
        <label className="text-xs font-bold text-navy mb-1.5 block">Hari</label>
        <div className="flex gap-1">
          {DAYS.map((d, i) => (
            <button
              key={i}
              onClick={() =>
                setDays(
                  days.includes(i)
                    ? days.filter((x) => x !== i)
                    : [...days, i]
                )
              }
              className={`flex-1 aspect-square rounded-xl text-[10px] font-bold ${
                days.includes(i)
                  ? "bg-navy text-white"
                  : "border-2 border-border-color text-muted"
              }`}
            >
              {d[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Kategori */}
      <div>
        <label className="text-xs font-bold text-navy mb-1.5 block">Kategori</label>
        <div className="flex gap-1.5 flex-wrap">
          {KATEGORI_LIST.map((k) => (
            <button
              key={k}
              onClick={() => setKategori(k)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 ${
                kategori === k
                  ? "border-navy bg-navy text-white"
                  : "border-border-color text-muted"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Jenis bukti */}
      <div>
        <label className="text-xs font-bold text-navy mb-1.5 block">Jenis Bukti</label>
        <div className="flex gap-2">
          {VERIFY_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setVerifyType(t)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 capitalize ${
                verifyType === t
                  ? "border-navy bg-navy text-white"
                  : "border-border-color text-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Anak yang ditugaskan */}
      {kids.length > 0 && (
        <div>
          <label className="text-xs font-bold text-navy mb-1.5 block">Untuk Anak</label>
          <div className="flex gap-2 flex-wrap">
            {kids.map((k) => (
              <button
                key={k.id}
                onClick={() =>
                  setAssigned(
                    assigned.includes(k.id)
                      ? assigned.filter((x) => x !== k.id)
                      : [...assigned, k.id]
                  )
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 ${
                  assigned.includes(k.id)
                    ? "border-navy bg-navy text-white"
                    : "border-border-color text-muted"
                }`}
              >
                {k.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Deadline */}
      <div>
        <label className="text-xs font-bold text-navy mb-1.5 block">Batas Waktu</label>
        <input
          type="time"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full border-2 border-border-color rounded-xl px-3 py-2.5 text-sm font-semibold text-navy outline-none focus:border-navy"
        />
      </div>

      {err && (
        <div className="text-red-danger text-xs font-semibold">{err}</div>
      )}

      {/* Tombol aksi */}
      <div className="flex gap-2 pt-2">
        {mission && !confirmDelete && (
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-3 rounded-xl border-2 border-red-danger text-red-danger font-bold text-sm"
          >
            Hapus
          </button>
        )}
        {confirmDelete && (
          <button
            disabled={busy}
            onClick={handleDelete}
            className="flex-1 bg-red-danger text-white font-bold text-sm py-3 rounded-xl btn-chunky disabled:opacity-60"
          >
            {busy ? "Menghapus..." : "Konfirmasi Hapus"}
          </button>
        )}
        {!confirmDelete && (
          <button
            disabled={busy}
            onClick={handleSave}
            className="flex-1 bg-navy text-white font-bold text-sm py-3 rounded-xl btn-chunky disabled:opacity-60"
          >
            {busy ? "Menyimpan..." : mission ? "Simpan Perubahan" : "Tambah Misi"}
          </button>
        )}
      </div>
    </div>
  );
}

export function OrtuMisiClient({
  missions,
  kids,
}: {
  missions: Mission[];
  kids: AppUser[];
}) {
  const [editingMission, setEditingMission] = useState<Mission | null | undefined>(
    undefined
  ); // undefined = tutup, null = tambah baru
  const sheetOpen = editingMission !== undefined;

  const harian = missions.filter((m) => (m.grup ?? "Harian") === "Harian");
  const mingguan = missions.filter((m) => m.grup === "Mingguan");

  return (
    <>
      <div className="p-4 space-y-4">
        {/* Tombol tambah */}
        <button
          onClick={() => setEditingMission(null)}
          className="w-full bg-orange text-white font-bold text-sm py-3 rounded-2xl btn-chunky flex items-center justify-center gap-2"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="white" strokeWidth={2.5} strokeLinecap="round" />
          </svg>
          Tambah Misi
        </button>

        {/* Grup Harian */}
        {harian.length > 0 && (
          <div>
            <div className="text-xs font-bold text-muted uppercase tracking-wide mb-2 px-1">
              Harian ({harian.length})
            </div>
            <div className="space-y-2">
              {harian.map((m) => (
                <MisiRow
                  key={m.id}
                  mission={m}
                  kids={kids}
                  onEdit={setEditingMission}
                />
              ))}
            </div>
          </div>
        )}

        {/* Grup Mingguan */}
        {mingguan.length > 0 && (
          <div>
            <div className="text-xs font-bold text-muted uppercase tracking-wide mb-2 px-1">
              Mingguan ({mingguan.length})
            </div>
            <div className="space-y-2">
              {mingguan.map((m) => (
                <MisiRow
                  key={m.id}
                  mission={m}
                  kids={kids}
                  onEdit={setEditingMission}
                />
              ))}
            </div>
          </div>
        )}

        {missions.length === 0 && (
          <div className="text-center py-12 text-muted text-sm">
            Belum ada misi. Tap &quot;Tambah Misi&quot; untuk mulai.
          </div>
        )}
      </div>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setEditingMission(undefined)}
        title={editingMission ? "Edit Misi" : "Tambah Misi Baru"}
      >
        {sheetOpen && (
          <MisiSheetForm
            mission={editingMission ?? null}
            kids={kids}
            onClose={() => setEditingMission(undefined)}
          />
        )}
      </BottomSheet>
    </>
  );
}

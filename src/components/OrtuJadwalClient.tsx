"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BottomSheet } from "./BottomSheet";
import { CategoryIcon } from "./CategoryIcon";
import {
  addScheduleBlock,
  updateScheduleBlock,
  deleteScheduleBlock,
  toggleScheduleBlock,
  copyBlocksToWeekdays,
} from "@/app/ortu/(app)/jadwal/actions";
import type { ScheduleBlock, Mission, MissionKategori } from "@/lib/types";

const KATEGORI_LIST: MissionKategori[] = [
  "Ibadah",
  "Belajar",
  "Rumah",
  "Sehat",
  "Sekolah",
  "Netral",
];

function BlockToggle({ block }: { block: ScheduleBlock }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={(e) => {
        e.stopPropagation();
        startTransition(async () => {
          await toggleScheduleBlock(block.id, block.aktif);
          router.refresh();
        });
      }}
      className={`w-10 h-6 rounded-full relative transition-colors flex-shrink-0 ${
        block.aktif ? "bg-green" : "bg-[#E1EAF2]"
      }`}
    >
      <span
        className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full transition-transform ${
          block.aktif ? "translate-x-[18px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

function BlockForm({
  block,
  selectedChildId,
  selectedHari,
  missions,
  onClose,
}: {
  block: ScheduleBlock | null;
  selectedChildId: string;
  selectedHari: number;
  missions: Mission[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [nama, setNama] = useState(block?.nama ?? "");
  const [jamMulai, setJamMulai] = useState(block?.jam_mulai ?? "07:00");
  const [durasi, setDurasi] = useState(block?.durasi_menit ?? 30);
  const [kategori, setKategori] = useState<MissionKategori>(
    block?.kategori ?? "Netral"
  );
  const [selectedMissions, setSelectedMissions] = useState<string[]>(
    block?.mission_ids ?? []
  );
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [err, setErr] = useState("");

  const handleSave = async () => {
    if (!nama.trim()) {
      setErr("Isi nama blok waktu.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      if (block) {
        await updateScheduleBlock(block.id, {
          jamMulai,
          durasiMenit: durasi,
          nama: nama.trim(),
          kategori,
          missionIds: selectedMissions,
        });
      } else {
        await addScheduleBlock({
          childId: selectedChildId,
          hari: selectedHari,
          jamMulai,
          durasiMenit: durasi,
          nama: nama.trim(),
          kategori,
          missionIds: selectedMissions,
        });
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
    if (!block) return;
    setBusy(true);
    try {
      await deleteScheduleBlock(block.id);
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
      <div>
        <label className="text-xs font-bold text-navy mb-1.5 block">
          Nama Blok
        </label>
        <input
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Contoh: Waktu Belajar"
          className="w-full border-2 border-border-color rounded-xl px-3 py-2.5 text-sm font-semibold text-navy outline-none focus:border-navy"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs font-bold text-navy mb-1.5 block">
            Jam Mulai
          </label>
          <input
            type="time"
            value={jamMulai}
            onChange={(e) => setJamMulai(e.target.value)}
            className="w-full border-2 border-border-color rounded-xl px-3 py-2.5 text-sm font-semibold text-navy outline-none focus:border-navy"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-bold text-navy mb-1.5 block">
            Durasi (menit)
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDurasi((d) => Math.max(15, d - 15))}
              className="w-9 h-9 rounded-xl bg-grey-bg border-2 border-border-color font-bold text-navy"
            >
              −
            </button>
            <div className="flex-1 text-center font-bold text-navy text-sm">
              {durasi}m
            </div>
            <button
              onClick={() => setDurasi((d) => Math.min(240, d + 15))}
              className="w-9 h-9 rounded-xl bg-grey-bg border-2 border-border-color font-bold text-navy"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-navy mb-1.5 block">
          Kategori
        </label>
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

      {missions.length > 0 && (
        <div>
          <label className="text-xs font-bold text-navy mb-1.5 block">
            Misi terkait (opsional)
          </label>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {missions.map((m) => (
              <button
                key={m.id}
                onClick={() =>
                  setSelectedMissions(
                    selectedMissions.includes(m.id)
                      ? selectedMissions.filter((x) => x !== m.id)
                      : [...selectedMissions, m.id]
                  )
                }
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-left ${
                  selectedMissions.includes(m.id)
                    ? "border-navy bg-navy/5"
                    : "border-border-color"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                    selectedMissions.includes(m.id)
                      ? "bg-navy border-navy"
                      : "border-muted"
                  }`}
                />
                <span className="text-xs font-semibold text-navy flex-1">
                  {m.name}
                </span>
                <span className="text-xs text-muted">★{m.stars}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {err && <div className="text-red-danger text-xs font-semibold">{err}</div>}

      <div className="flex gap-2 pt-2">
        {block && !confirmDelete && (
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
            {busy ? "Menyimpan..." : block ? "Simpan" : "Tambah Blok"}
          </button>
        )}
      </div>
    </div>
  );
}

export function OrtuJadwalClient({
  blocks,
  selectedChildId,
  selectedHari,
  missions,
  isWali = false,
}: {
  blocks: ScheduleBlock[];
  selectedChildId: string;
  selectedHari: number;
  missions: Mission[];
  isWali?: boolean;
}) {
  const router = useRouter();
  const [editingBlock, setEditingBlock] = useState<
    ScheduleBlock | null | undefined
  >(undefined);
  const sheetOpen = editingBlock !== undefined;
  const [copyBusy, startCopy] = useTransition();

  return (
    <>
      <div className="p-4 space-y-3">
        {/* Stat & tombol */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-muted">
            {blocks.length} blok hari ini
          </div>
          {!isWali && (
            <div className="flex gap-2">
              {blocks.length > 0 && selectedHari < 5 && (
                <button
                  disabled={copyBusy}
                  onClick={() =>
                    startCopy(async () => {
                      await copyBlocksToWeekdays(selectedChildId, selectedHari);
                      router.refresh();
                    })
                  }
                  className="text-xs font-bold text-navy border-2 border-navy px-3 py-1.5 rounded-xl disabled:opacity-60"
                >
                  {copyBusy ? "Menyalin..." : "Salin ke Sen-Jum"}
                </button>
              )}
              <button
                onClick={() => setEditingBlock(null)}
                className="bg-orange text-white font-bold text-xs px-4 py-1.5 rounded-xl btn-chunky flex items-center gap-1"
              >
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="white"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />
                </svg>
                Blok
              </button>
            </div>
          )}
        </div>

        {/* Daftar blok */}
        {blocks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted">
            <svg
              width={48}
              height={48}
              viewBox="0 0 24 24"
              fill="none"
              className="mb-3 opacity-30"
            >
              <rect
                x="3"
                y="5"
                width="18"
                height="16"
                rx="3"
                stroke="#8AA3BB"
                strokeWidth="2"
              />
              <path
                d="M8 3v4M16 3v4"
                stroke="#8AA3BB"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path d="M3 9h18" stroke="#8AA3BB" strokeWidth="2" />
            </svg>
            <div className="text-sm font-semibold">Belum ada jadwal</div>
            {!isWali && <div className="text-xs mt-1">Tap &quot;+ Blok&quot; untuk tambah</div>}
          </div>
        )}

        {blocks.map((block) => (
          <div
            key={block.id}
            onClick={() => { if (!isWali) setEditingBlock(block); }}
            className={`w-full bg-white rounded-2xl p-3.5 card-shadow flex items-center gap-3 text-left ${!isWali ? "cursor-pointer" : ""}`}
          >
            <CategoryIcon kategori={block.kategori} size={40} />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-navy text-sm">{block.nama}</div>
              <div className="text-muted text-xs">
                {block.jam_mulai} · {block.durasi_menit} menit
                {block.mission_ids?.length > 0
                  ? ` · ${block.mission_ids.length} misi`
                  : ""}
              </div>
            </div>
            {!isWali && <BlockToggle block={block} />}
          </div>
        ))}
      </div>

      {!isWali && (
        <BottomSheet
          open={sheetOpen}
          onClose={() => setEditingBlock(undefined)}
          title={editingBlock ? "Edit Blok" : "Tambah Blok Waktu"}
        >
          {sheetOpen && (
            <BlockForm
              block={editingBlock ?? null}
              selectedChildId={selectedChildId}
              selectedHari={selectedHari}
              missions={missions}
              onClose={() => setEditingBlock(undefined)}
            />
          )}
        </BottomSheet>
      )}
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import {
  updateMission,
  deleteMission,
  toggleMissionActive,
} from "@/app/ortu/(app)/misi/actions";
import type { Mission, AppUser, VerifyType } from "@/lib/types";

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const ICON_BY_TYPE: Record<VerifyType, string> = { foto: "📷", rekam: "🎙️", kuis: "🧠" };

export function OrtuMissionCard({
  mission,
  kids,
}: {
  mission: Mission;
  kids: AppUser[];
}) {
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [name, setName] = useState(mission.name);
  const [verifyType, setVerifyType] = useState<VerifyType>(mission.verify_type);
  const [days, setDays] = useState<number[]>(mission.days);
  const [assigned, setAssigned] = useState<string[]>(mission.assigned_to);
  const [stars, setStars] = useState(String(mission.stars));
  const [deadline, setDeadline] = useState(mission.deadline_time);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [togglePending, startToggle] = useTransition();

  const handleSave = async () => {
    if (!name.trim() || assigned.length === 0) {
      setErr("Isi nama misi dan pilih minimal satu anak.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await updateMission(mission.id, {
        name: name.trim(),
        icon: ICON_BY_TYPE[verifyType],
        verifyType,
        days,
        assignedTo: assigned,
        stars: Number(stars) || 0,
        deadlineTime: deadline,
      });
      setEditing(false);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Gagal menyimpan.");
    } finally {
      setBusy(false);
    }
  };

  const cancelEdit = () => {
    setName(mission.name);
    setVerifyType(mission.verify_type);
    setDays(mission.days);
    setAssigned(mission.assigned_to);
    setStars(String(mission.stars));
    setDeadline(mission.deadline_time);
    setErr("");
    setEditing(false);
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteMission(mission.id);
      router.refresh();
    } catch {
      setConfirmDelete(false);
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <div className="bg-white border border-dashed border-border-color rounded-2xl p-3.5 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama misi"
          className="w-full border border-border-color rounded-xl px-3 py-2 text-xs font-semibold focus:border-navy focus:outline-none"
        />
        <div className="flex gap-2">
          {(["foto", "rekam", "kuis"] as VerifyType[]).map((t) => (
            <button
              key={t}
              onClick={() => setVerifyType(t)}
              className={`flex-1 py-2 rounded-xl text-[10.5px] font-bold border-2 capitalize ${
                verifyType === t
                  ? "bg-grey-bg border-navy text-navy"
                  : "border-border-color text-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {DAYS.map((d, i) => (
            <button
              key={i}
              onClick={() =>
                setDays(
                  days.includes(i) ? days.filter((x) => x !== i) : [...days, i]
                )
              }
              className={`flex-1 aspect-square rounded-lg text-[10px] font-bold ${
                days.includes(i)
                  ? "bg-green text-white"
                  : "border border-border-color text-muted"
              }`}
            >
              {d[0]}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {kids.map((c) => (
            <button
              key={c.id}
              onClick={() =>
                setAssigned(
                  assigned.includes(c.id)
                    ? assigned.filter((x) => x !== c.id)
                    : [...assigned, c.id]
                )
              }
              className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold border-2 ${
                assigned.includes(c.id)
                  ? "bg-coral-soft border-orange text-orange"
                  : "border-border-color text-muted"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={stars}
            onChange={(e) => setStars(e.target.value.replace(/\D/g, ""))}
            placeholder="Bintang"
            className="flex-1 border border-border-color rounded-xl px-3 py-2 text-xs font-semibold focus:border-navy focus:outline-none"
          />
          <input
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            placeholder="18:00"
            className="flex-1 border border-border-color rounded-xl px-3 py-2 text-xs font-semibold focus:border-navy focus:outline-none"
          />
        </div>
        {err && <div className="text-red-danger text-[11px] font-semibold">{err}</div>}
        <div className="flex gap-2">
          <button
            onClick={cancelEdit}
            className="flex-1 border border-border-color text-muted font-bold text-xs py-2.5 rounded-xl"
          >
            Batal
          </button>
          <button
            disabled={busy}
            onClick={handleSave}
            className="flex-1 bg-orange text-white font-bold text-xs py-2.5 rounded-xl btn-chunky disabled:opacity-60"
          >
            {busy ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-2xl p-3 card-shadow transition-opacity ${
        !mission.active ? "opacity-60" : ""
      }`}
    >
      {confirmDelete && (
        <div className="mb-2 bg-[#FFF0EC] border border-[#F5C0B0] rounded-xl p-2.5 flex items-center gap-2">
          <span className="text-[11px] text-navy font-semibold flex-1">
            Hapus misi ini?
          </span>
          <button
            onClick={() => setConfirmDelete(false)}
            className="text-[11px] text-muted font-bold px-2 py-1 rounded-lg border border-border-color"
          >
            Batal
          </button>
          <button
            disabled={busy}
            onClick={handleDelete}
            className="text-[11px] text-white font-bold px-2 py-1 rounded-lg bg-red-danger disabled:opacity-60"
          >
            Hapus
          </button>
        </div>
      )}
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-grey-bg flex items-center justify-center text-sm flex-shrink-0">
          {mission.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-navy text-xs">{mission.name}</div>
          <div className="text-[10px] text-muted font-semibold">
            Verifikasi: {mission.verify_type} · Sebelum {mission.deadline_time}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="font-display font-bold text-[11px] text-yellow">
            ★{mission.stars}
          </div>
          {/* Toggle aktif */}
          <button
            disabled={togglePending}
            onClick={() =>
              startToggle(async () => {
                await toggleMissionActive(mission.id, mission.active);
                router.refresh();
              })
            }
            className={`w-8 h-[19px] rounded-full relative transition-colors ${
              mission.active ? "bg-green" : "bg-border-color"
            }`}
            title={mission.active ? "Nonaktifkan" : "Aktifkan"}
          >
            <span
              className={`absolute top-[2px] w-[15px] h-[15px] bg-white rounded-full transition-transform ${
                mission.active ? "translate-x-[17px]" : "translate-x-[2px]"
              }`}
            />
          </button>
          {/* Tombol edit */}
          <button
            onClick={() => setEditing(true)}
            className="text-muted hover:text-navy p-0.5"
            title="Edit misi"
          >
            <Pencil size={13} />
          </button>
          {/* Tombol hapus */}
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-muted hover:text-red-danger p-0.5"
            title="Hapus misi"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      <div className="flex gap-1 mt-2">
        {DAYS.map((d, i) => (
          <span
            key={i}
            className={`w-5 h-5 rounded-md flex items-center justify-center text-[8.5px] font-bold ${
              mission.days.includes(i)
                ? "bg-hijau-soft text-hijau"
                : "bg-grey-bg text-muted"
            }`}
          >
            {d[0]}
          </span>
        ))}
      </div>
    </div>
  );
}

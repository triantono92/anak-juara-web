"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { addMission } from "@/app/ortu/(app)/misi/actions";
import type { AppUser, VerifyType } from "@/lib/types";

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const ICON_BY_TYPE: Record<VerifyType, string> = { foto: "📷", rekam: "🎙️", kuis: "🧠" };

export function MissionForm({ kids }: { kids: AppUser[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [verifyType, setVerifyType] = useState<VerifyType>("foto");
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [assigned, setAssigned] = useState<string[]>([]);
  const [stars, setStars] = useState("10");
  const [deadline, setDeadline] = useState("18:00");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!name.trim() || assigned.length === 0) {
      setErr("Isi nama misi dan pilih minimal satu anak.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await addMission({
        name: name.trim(),
        icon: ICON_BY_TYPE[verifyType],
        verifyType,
        days,
        assignedTo: assigned,
        stars: Number(stars) || 0,
        deadlineTime: deadline,
      });
      setName("");
      setOpen(false);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Gagal menyimpan misi.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="bg-orange text-white font-bold text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1">
        <Plus size={12} /> Tambah Misi
      </button>
    );
  }

  return (
    <div className="bg-white border border-dashed border-border-color rounded-2xl p-3.5 space-y-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama misi" className="w-full border border-border-color rounded-xl px-3 py-2 text-xs font-semibold focus:border-navy focus:outline-none" />
      <div className="flex gap-2">
        {(["foto", "rekam", "kuis"] as VerifyType[]).map((t) => (
          <button
            key={t}
            onClick={() => setVerifyType(t)}
            className={`flex-1 py-2 rounded-xl text-[10.5px] font-bold border-2 capitalize ${
              verifyType === t ? "bg-grey-bg border-navy text-navy" : "border-border-color text-muted"
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
            onClick={() => setDays(days.includes(i) ? days.filter((x) => x !== i) : [...days, i])}
            className={`flex-1 aspect-square rounded-lg text-[10px] font-bold ${
              days.includes(i) ? "bg-green text-white" : "border border-border-color text-muted"
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
            onClick={() => setAssigned(assigned.includes(c.id) ? assigned.filter((x) => x !== c.id) : [...assigned, c.id])}
            className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold border-2 ${
              assigned.includes(c.id) ? "bg-coral-soft border-orange text-orange" : "border-border-color text-muted"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={stars} onChange={(e) => setStars(e.target.value.replace(/\D/g, ""))} placeholder="Bintang" className="flex-1 border border-border-color rounded-xl px-3 py-2 text-xs font-semibold focus:border-navy focus:outline-none" />
        <input value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="18:00" className="flex-1 border border-border-color rounded-xl px-3 py-2 text-xs font-semibold focus:border-navy focus:outline-none" />
      </div>
      {err && <div className="text-red-danger text-[11px] font-semibold">{err}</div>}
      <button disabled={busy} onClick={submit} className="w-full bg-orange text-white font-bold text-xs py-2.5 rounded-xl btn-chunky disabled:opacity-60">
        {busy ? "Menyimpan..." : "Simpan Misi"}
      </button>
    </div>
  );
}

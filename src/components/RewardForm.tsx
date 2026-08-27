"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { addReward } from "@/app/ortu/(app)/hadiah/actions";
import type { AppUser, RewardCategory } from "@/lib/types";

export function RewardForm({ kids }: { kids: AppUser[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<RewardCategory>("Uang");
  const [starsCost, setStarsCost] = useState("50");
  const [assignedTo, setAssignedTo] = useState("all");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!name.trim()) {
      setErr("Isi nama hadiah.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await addReward({ name: name.trim(), category, starsCost: Number(starsCost) || 0, assignedTo });
      setName("");
      setOpen(false);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Gagal menyimpan hadiah.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="bg-orange text-white font-bold text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1">
        <Plus size={12} /> Tambah Hadiah
      </button>
    );
  }

  return (
    <div className="bg-white border border-dashed border-border-color rounded-2xl p-3.5 space-y-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama hadiah" className="w-full border border-border-color rounded-xl px-3 py-2 text-xs font-semibold focus:border-navy focus:outline-none" />
      <div className="flex gap-2">
        {(["Uang", "Privilege", "Barang"] as RewardCategory[]).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`flex-1 py-2 rounded-xl text-[10.5px] font-bold border-2 ${
              category === c ? "bg-grey-bg border-navy text-navy" : "border-border-color text-muted"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <input value={starsCost} onChange={(e) => setStarsCost(e.target.value.replace(/\D/g, ""))} placeholder="Harga bintang" className="w-full border border-border-color rounded-xl px-3 py-2 text-xs font-semibold focus:border-navy focus:outline-none" />
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setAssignedTo("all")}
          className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold border-2 ${
            assignedTo === "all" ? "bg-coral-soft border-orange text-orange" : "border-border-color text-muted"
          }`}
        >
          Semua Anak
        </button>
        {kids.map((c) => (
          <button
            key={c.id}
            onClick={() => setAssignedTo(c.id)}
            className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold border-2 ${
              assignedTo === c.id ? "bg-coral-soft border-orange text-orange" : "border-border-color text-muted"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
      {err && <div className="text-red-danger text-[11px] font-semibold">{err}</div>}
      <button disabled={busy} onClick={submit} className="w-full bg-orange text-white font-bold text-xs py-2.5 rounded-xl btn-chunky disabled:opacity-60">
        {busy ? "Menyimpan..." : "Simpan Hadiah"}
      </button>
    </div>
  );
}

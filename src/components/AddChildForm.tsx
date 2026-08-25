"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

const COLORS = ["#FF7A59", "#6C63E0", "#3F9142", "#C97F0B", "#D64545"];

export function AddChildForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim() || !username.trim() || pin.length !== 4) {
      setErr("Lengkapi nama, username, dan PIN 4 digit.");
      return;
    }
    setBusy(true);
    setErr("");
    const res = await fetch("/api/family/add-child", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, pin, avatarColor: color }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error || "Gagal menambah anak.");
      return;
    }
    setName("");
    setUsername("");
    setPin("");
    setOpen(false);
    router.refresh();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-coral text-white font-bold text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1"
      >
        <Plus size={12} /> Tambah Anak
      </button>
    );
  }

  return (
    <div className="bg-white border border-dashed border-[#c3ccdc] rounded-2xl p-3.5 space-y-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama anak"
        className="w-full border border-line rounded-lg px-3 py-2 text-xs font-semibold"
      />
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
        placeholder="Username (untuk login)"
        className="w-full border border-line rounded-lg px-3 py-2 text-xs font-semibold"
      />
      <input
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
        placeholder="PIN 4 digit"
        className="w-full border border-line rounded-lg px-3 py-2 text-xs font-semibold"
      />
      <div className="flex gap-2">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className="w-7 h-7 rounded-full border-2"
            style={{ background: c, borderColor: color === c ? "#1E2A4A" : "transparent" }}
          />
        ))}
      </div>
      {err && <div className="text-stempel text-[11px] font-semibold">{err}</div>}
      <button disabled={busy} onClick={submit} className="w-full bg-coral text-white font-bold text-xs py-2.5 rounded-lg disabled:opacity-60">
        {busy ? "Menyimpan..." : "Simpan Anak"}
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

const COLORS = ["#FF7A59", "#6C63E0", "#3F9142", "#C97F0B", "#D64545"];

export function AddChildForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim() || !email.trim() || password.length < 6) {
      setErr("Lengkapi nama, email, dan kata sandi (min. 6 karakter).");
      return;
    }
    setBusy(true);
    setErr("");
    const res = await fetch("/api/family/add-child", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, avatarColor: color }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error || "Gagal menambah anak.");
      return;
    }
    setName("");
    setEmail("");
    setPassword("");
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
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email anak"
        className="w-full border border-line rounded-lg px-3 py-2 text-xs font-semibold"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Kata sandi (min. 6 karakter)"
        minLength={6}
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

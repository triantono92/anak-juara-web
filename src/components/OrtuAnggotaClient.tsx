"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BottomSheet } from "./BottomSheet";
import { addChild, addParent } from "@/app/ortu/(app)/anggota/actions";
import type { ParentRole } from "@/lib/types";

const AVATAR_COLORS = ["#3EA8DE", "#F58634", "#35C0A0", "#F5C33B"];

function AddAnggotaSheet({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [tab, setTab] = useState<"anak" | "ortu">("anak");

  // Anak form
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState(8);
  const [childColor, setChildColor] = useState(AVATAR_COLORS[0]);
  const [childEmail, setChildEmail] = useState("");
  const [childPassword, setChildPassword] = useState("");

  // Ortu form
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentRole, setParentRole] = useState<ParentRole>("ayah");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async () => {
    setErr("");
    setBusy(true);
    try {
      if (tab === "anak") {
        if (!childName.trim()) throw new Error("Isi nama anak.");
        if (!childEmail.trim()) throw new Error("Isi email anak.");
        if (childPassword.length < 6) throw new Error("Kata sandi minimal 6 karakter.");
        await addChild({
          name: childName.trim(),
          age: childAge,
          avatarColor: childColor,
          email: childEmail.trim(),
          password: childPassword,
        });
      } else {
        if (!parentName.trim()) throw new Error("Isi nama orang tua.");
        if (!parentEmail.trim()) throw new Error("Isi email.");
        await addParent({
          name: parentName.trim(),
          email: parentEmail.trim(),
          parentRole,
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

  return (
    <div className="space-y-4">
      {/* Segmented Anak / Ortu */}
      <div className="flex bg-grey-bg rounded-xl p-1 gap-1">
        {(["anak", "ortu"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
              tab === t ? "bg-white text-navy card-shadow" : "text-muted"
            }`}
          >
            {t === "anak" ? "Anak" : "Orang Tua"}
          </button>
        ))}
      </div>

      {tab === "anak" ? (
        <>
          <div>
            <label className="text-xs font-bold text-navy mb-1.5 block">
              Nama Anak
            </label>
            <input
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Contoh: Aira"
              className="w-full border-2 border-border-color rounded-xl px-3 py-2.5 text-sm font-semibold text-navy outline-none focus:border-navy"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-navy mb-1.5 block">
              Umur
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setChildAge((a) => Math.max(4, a - 1))}
                className="w-10 h-10 rounded-xl bg-grey-bg border-2 border-border-color font-bold text-navy text-lg"
              >
                −
              </button>
              <div className="flex-1 text-center font-display font-bold text-navy text-2xl">
                {childAge} th
              </div>
              <button
                onClick={() => setChildAge((a) => Math.min(17, a + 1))}
                className="w-10 h-10 rounded-xl bg-grey-bg border-2 border-border-color font-bold text-navy text-lg"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-navy mb-1.5 block">
              Warna Avatar
            </label>
            <div className="flex gap-3">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setChildColor(c)}
                  className={`w-10 h-10 rounded-full border-4 transition-all ${
                    childColor === c
                      ? "border-navy scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-navy mb-1.5 block">
              Email Anak
            </label>
            <input
              type="email"
              value={childEmail}
              onChange={(e) => setChildEmail(e.target.value)}
              placeholder="email@contoh.com"
              className="w-full border-2 border-border-color rounded-xl px-3 py-2.5 text-sm font-semibold text-navy outline-none focus:border-navy"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-navy mb-1.5 block">
              Kata Sandi (min. 6 karakter)
            </label>
            <input
              type="password"
              value={childPassword}
              onChange={(e) => setChildPassword(e.target.value)}
              placeholder="••••••"
              minLength={6}
              className="w-full border-2 border-border-color rounded-xl px-3 py-2.5 text-sm font-semibold text-navy outline-none focus:border-navy"
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="text-xs font-bold text-navy mb-1.5 block">
              Nama
            </label>
            <input
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Contoh: Bunda Sari"
              className="w-full border-2 border-border-color rounded-xl px-3 py-2.5 text-sm font-semibold text-navy outline-none focus:border-navy"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-navy mb-1.5 block">
              Email
            </label>
            <input
              type="email"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              placeholder="email@contoh.com"
              className="w-full border-2 border-border-color rounded-xl px-3 py-2.5 text-sm font-semibold text-navy outline-none focus:border-navy"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-navy mb-1.5 block">
              Peran
            </label>
            <div className="flex gap-2">
              {(["ayah", "bunda", "wali"] as ParentRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setParentRole(r)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 capitalize ${
                    parentRole === r
                      ? "border-navy bg-navy text-white"
                      : "border-border-color text-muted"
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {err && <div className="text-red-danger text-xs font-semibold">{err}</div>}

      <button
        disabled={busy}
        onClick={handleSubmit}
        className="w-full bg-navy text-white font-bold text-sm py-3 rounded-xl btn-chunky disabled:opacity-60 mt-2"
      >
        {busy ? "Menyimpan..." : "Tambah Anggota"}
      </button>
    </div>
  );
}

export function OrtuAnggotaClient() {
  const [sheetOpen, setSheetOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setSheetOpen(true)}
        className="w-full bg-orange text-white font-bold text-sm py-3 rounded-2xl btn-chunky flex items-center justify-center gap-2"
      >
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14M5 12h14"
            stroke="white"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </svg>
        Tambah Anggota
      </button>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Tambah Anggota"
      >
        <AddAnggotaSheet onClose={() => setSheetOpen(false)} />
      </BottomSheet>
    </>
  );
}

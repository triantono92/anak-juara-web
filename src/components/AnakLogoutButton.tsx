"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BottomSheet } from "@/components/BottomSheet";

export function AnakLogoutButton() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    setBusy(true);
    await supabase.auth.signOut();
    router.push("/masuk");
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-white/60 text-xs font-semibold px-1"
      >
        Keluar
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Keluar dari akun">
        <p className="text-sm text-muted mb-5">Yakin ingin keluar?</p>
        <button
          onClick={handleLogout}
          disabled={busy}
          className="w-full bg-red-danger text-white font-bold text-sm py-3.5 rounded-2xl btn-chunky disabled:opacity-50 mb-3"
        >
          {busy ? "Memproses..." : "Ya, keluar"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="w-full text-muted text-sm font-semibold py-2"
        >
          Batal
        </button>
      </BottomSheet>
    </>
  );
}

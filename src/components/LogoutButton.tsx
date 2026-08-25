"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/child-auth", { method: "DELETE" });
        router.push("/anak/login");
        router.refresh();
      }}
      className="text-[11px] text-ink-soft"
    >
      Keluar
    </button>
  );
}

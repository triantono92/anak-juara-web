"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();
  return (
    <button
      onClick={async () => {
        await supabase.auth.signOut();
        router.push("/masuk");
        router.refresh();
      }}
      className="text-[11px] text-ink-soft"
    >
      Keluar
    </button>
  );
}

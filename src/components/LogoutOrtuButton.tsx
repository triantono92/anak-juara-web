"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LogoutOrtuButton() {
  const router = useRouter();
  const supabase = createClient();
  return (
    <button
      onClick={async () => {
        await supabase.auth.signOut();
        router.push("/masuk");
        router.refresh();
      }}
      className="opacity-80"
    >
      <LogOut size={16} />
    </button>
  );
}

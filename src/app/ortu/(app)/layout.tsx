import { redirect } from "next/navigation";
import Link from "next/link";
import { Check, Award, Gift, Users, BarChart3 } from "lucide-react";
import { getParentUser } from "@/lib/auth";
import { LogoutOrtuButton } from "@/components/LogoutOrtuButton";

export default async function OrtuAppLayout({ children }: { children: React.ReactNode }) {
  const user = await getParentUser();
  if (!user) redirect("/ortu/login");

  const tabs = [
    { href: "/ortu/persetujuan", label: "Persetujuan", icon: Check },
    { href: "/ortu/misi", label: "Misi", icon: Award },
    { href: "/ortu/hadiah", label: "Hadiah", icon: Gift },
    { href: "/ortu/anggota", label: "Anggota", icon: Users },
    { href: "/ortu/laporan", label: "Laporan", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex justify-center bg-bg-neutral py-6 px-4">
      <div className="w-full max-w-[520px] bg-paper rounded-[28px] border border-line shadow-xl overflow-hidden flex flex-col min-h-[80vh]">
        <div className="bg-ink text-white px-4 pt-4 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <div className="font-display font-bold text-base">Kontrol Orang Tua</div>
            <LogoutOrtuButton />
          </div>
          <div className="text-[11px] opacity-70">{user.email}</div>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        <div className="flex border-t border-line bg-white py-2 flex-shrink-0">
          {tabs.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex-1 flex flex-col items-center gap-1 text-[9px] font-bold text-ink-soft">
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { Award, Gift, Clock3 } from "lucide-react";
import { getChildSession } from "@/lib/auth";

export default async function AnakAppLayout({ children }: { children: React.ReactNode }) {
  const session = await getChildSession();
  if (!session) redirect("/anak/login");

  const tabs = [
    { href: "/anak/misi", label: "Misi", icon: Award },
    { href: "/anak/toko", label: "Toko", icon: Gift },
    { href: "/anak/riwayat", label: "Riwayat", icon: Clock3 },
  ];

  return (
    <div className="min-h-screen flex justify-center bg-bg-neutral py-6 px-4">
      <div className="w-full max-w-[420px] bg-paper rounded-[28px] border border-line shadow-xl overflow-hidden flex flex-col min-h-[80vh]">
        <div className="flex-1 overflow-y-auto">{children}</div>
        <div className="flex border-t border-line bg-white py-2 flex-shrink-0">
          {tabs.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-1 text-[10px] font-bold text-ink-soft"
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

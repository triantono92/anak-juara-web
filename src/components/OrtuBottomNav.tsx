"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    href: "/ortu/persetujuan",
    label: "Setujui",
    icon: (active: boolean) => (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="4" stroke={active ? "#17395B" : "#8AA3BB"} strokeWidth="2"/>
        <path d="M7 12l3.5 3.5L17 8.5" stroke={active ? "#17395B" : "#8AA3BB"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/ortu/misi",
    label: "Misi",
    icon: (active: boolean) => (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={active ? "#17395B" : "#8AA3BB"} strokeWidth="2"/>
        <circle cx="12" cy="12" r="5" stroke={active ? "#17395B" : "#8AA3BB"} strokeWidth="2"/>
        <circle cx="12" cy="12" r="1.5" fill={active ? "#17395B" : "#8AA3BB"}/>
      </svg>
    ),
  },
  {
    href: "/ortu/jadwal",
    label: "Jadwal",
    icon: (active: boolean) => (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="16" rx="3" stroke={active ? "#17395B" : "#8AA3BB"} strokeWidth="2"/>
        <path d="M8 3v4M16 3v4" stroke={active ? "#17395B" : "#8AA3BB"} strokeWidth="2" strokeLinecap="round"/>
        <path d="M3 9h18" stroke={active ? "#17395B" : "#8AA3BB"} strokeWidth="2"/>
        <rect x="7" y="13" width="3" height="3" rx="0.5" fill={active ? "#17395B" : "#8AA3BB"}/>
        <rect x="14" y="13" width="3" height="3" rx="0.5" fill={active ? "#17395B" : "#8AA3BB"}/>
      </svg>
    ),
  },
  {
    href: "/ortu/hadiah",
    label: "Hadiah",
    icon: (active: boolean) => (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="10" width="18" height="11" rx="2" stroke={active ? "#17395B" : "#8AA3BB"} strokeWidth="2"/>
        <rect x="2" y="7" width="20" height="5" rx="2" stroke={active ? "#17395B" : "#8AA3BB"} strokeWidth="2"/>
        <path d="M12 7v14" stroke={active ? "#17395B" : "#8AA3BB"} strokeWidth="2"/>
        <path d="M12 7c0 0-2-4 0-4s2 4 0 4" stroke={active ? "#17395B" : "#8AA3BB"} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M12 7c0 0 2-4 0-4" stroke={active ? "#17395B" : "#8AA3BB"} strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/ortu/laporan",
    label: "Laporan",
    icon: (active: boolean) => (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <rect x="4" y="14" width="4" height="7" rx="1" fill={active ? "#17395B" : "#8AA3BB"}/>
        <rect x="10" y="9" width="4" height="12" rx="1" fill={active ? "#17395B" : "#8AA3BB"}/>
        <rect x="16" y="5" width="4" height="16" rx="1" fill={active ? "#17395B" : "#8AA3BB"}/>
        <path d="M3 21h18" stroke={active ? "#17395B" : "#8AA3BB"} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/ortu/anggota",
    label: "Anggota",
    icon: (active: boolean) => (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="4" stroke={active ? "#17395B" : "#8AA3BB"} strokeWidth="2"/>
        <path d="M3 20c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke={active ? "#17395B" : "#8AA3BB"} strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 11c1.657 0 3 1.343 3 3" stroke={active ? "#17395B" : "#8AA3BB"} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M19 14c1.105 0 2 .895 2 2v4" stroke={active ? "#17395B" : "#8AA3BB"} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export function OrtuBottomNav() {
  const pathname = usePathname();
  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-border-color flex z-30"
      style={{ height: 74 }}
    >
      {NAV.map(({ href, label, icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5"
          >
            {icon(active)}
            <span
              className="font-bold"
              style={{ fontSize: 9, color: active ? "#17395B" : "#8AA3BB" }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

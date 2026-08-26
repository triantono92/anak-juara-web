"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" width={22} height={22} fill="none">
      <path
        d="M2 9l8-7 8 7v9a1 1 0 01-1 1H3a1 1 0 01-1-1V9z"
        fill={active ? "#3EA8DE" : "none"}
        stroke={active ? "#3EA8DE" : "#8AA3BB"}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path
        d="M7 20v-8h6v8"
        stroke={active ? "white" : "#8AA3BB"}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MisiIcon({ active }: { active: boolean }) {
  const c = active ? "#3EA8DE" : "#8AA3BB";
  return (
    <svg viewBox="0 0 20 20" width={22} height={22} fill="none">
      <circle cx="10" cy="10" r="8" stroke={c} strokeWidth={1.5} />
      <path
        d="M7 10l2 2 4-4"
        stroke={c}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function JadwalIcon({ active }: { active: boolean }) {
  const c = active ? "#3EA8DE" : "#8AA3BB";
  return (
    <svg viewBox="0 0 20 20" width={22} height={22} fill="none">
      <rect x="2" y="4" width="16" height="14" rx="3" stroke={c} strokeWidth={1.5} />
      <path
        d="M2 8h16M7 2v4M13 2v4"
        stroke={c}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

function HadiahIcon({ active }: { active: boolean }) {
  const c = active ? "#3EA8DE" : "#8AA3BB";
  return (
    <svg viewBox="0 0 20 20" width={22} height={22} fill="none">
      <rect x="2" y="8" width="16" height="10" rx="2" stroke={c} strokeWidth={1.5} />
      <path
        d="M10 8v10M2 12h16M7 8a3 3 0 010-6 3 3 0 013 6M13 8a3 3 0 010-6 3 3 0 01-3 6"
        stroke={c}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

function LaporanIcon({ active }: { active: boolean }) {
  const c = active ? "#3EA8DE" : "#8AA3BB";
  return (
    <svg viewBox="0 0 20 20" width={22} height={22} fill="none">
      <rect x="2" y="2" width="16" height="16" rx="3" stroke={c} strokeWidth={1.5} />
      <path
        d="M6 14v-4M10 14v-7M14 14v-2"
        stroke={c}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

const NAV = [
  { href: "/anak", label: "Beranda", Icon: HomeIcon, exact: true },
  { href: "/anak/misi", label: "Misi", Icon: MisiIcon, exact: false },
  { href: "/anak/jadwal", label: "Jadwal", Icon: JadwalIcon, exact: false },
  { href: "/anak/hadiah", label: "Hadiah", Icon: HadiahIcon, exact: false },
  { href: "/anak/laporan", label: "Laporan", Icon: LaporanIcon, exact: false },
];

export function AnakBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center z-30">
      <div className="w-full max-w-[480px] h-[74px] bg-white border-t border-border-color flex items-center px-2">
        {NAV.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2"
            >
              <Icon active={active} />
              <span className={`text-[10px] font-bold ${active ? "text-brand-blue" : "text-muted"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

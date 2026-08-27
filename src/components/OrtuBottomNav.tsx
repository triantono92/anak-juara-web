"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    href: "/ortu",
    exact: true,
    label: "Beranda",
    icon: (active: boolean) => (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <path
          d="M3 11.5L12 4l9 7.5V21a1 1 0 01-1 1H15v-5h-6v5H4a1 1 0 01-1-1V11.5z"
          stroke={active ? "#17395B" : "#8AA3BB"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/ortu/persetujuan",
    exact: false,
    label: "Setujui",
    icon: (active: boolean) => (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="4"
          stroke={active ? "#17395B" : "#8AA3BB"}
          strokeWidth="2"
        />
        <path
          d="M7 12l3.5 3.5L17 8.5"
          stroke={active ? "#17395B" : "#8AA3BB"}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/ortu/misi",
    exact: false,
    label: "Misi",
    icon: (active: boolean) => (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke={active ? "#17395B" : "#8AA3BB"}
          strokeWidth="2"
        />
        <circle
          cx="12"
          cy="12"
          r="5"
          stroke={active ? "#17395B" : "#8AA3BB"}
          strokeWidth="2"
        />
        <circle cx="12" cy="12" r="1.5" fill={active ? "#17395B" : "#8AA3BB"} />
      </svg>
    ),
  },
  {
    href: "/ortu/hadiah",
    exact: false,
    label: "Hadiah",
    icon: (active: boolean) => (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <rect
          x="3"
          y="10"
          width="18"
          height="11"
          rx="2"
          stroke={active ? "#17395B" : "#8AA3BB"}
          strokeWidth="2"
        />
        <rect
          x="2"
          y="7"
          width="20"
          height="5"
          rx="2"
          stroke={active ? "#17395B" : "#8AA3BB"}
          strokeWidth="2"
        />
        <path d="M12 7v14" stroke={active ? "#17395B" : "#8AA3BB"} strokeWidth="2" />
        <path
          d="M12 7c0 0-2-4 0-4s2 4 0 4"
          stroke={active ? "#17395B" : "#8AA3BB"}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M12 7c0 0 2-4 0-4"
          stroke={active ? "#17395B" : "#8AA3BB"}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/ortu/laporan",
    exact: false,
    label: "Laporan",
    icon: (active: boolean) => (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <rect x="4" y="14" width="4" height="7" rx="1" fill={active ? "#17395B" : "#8AA3BB"} />
        <rect x="10" y="9" width="4" height="12" rx="1" fill={active ? "#17395B" : "#8AA3BB"} />
        <rect x="16" y="5" width="4" height="16" rx="1" fill={active ? "#17395B" : "#8AA3BB"} />
        <path
          d="M3 21h18"
          stroke={active ? "#17395B" : "#8AA3BB"}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
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
      {NAV.map(({ href, exact, label, icon }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
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

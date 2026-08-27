"use client";

export function LaporanPrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 border-2 border-navy text-navy font-bold text-sm px-4 py-2 rounded-xl"
    >
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <path
          d="M6 9V2h12v7"
          stroke="#17395B"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="2"
          y="9"
          width="20"
          height="10"
          rx="2"
          stroke="#17395B"
          strokeWidth="2"
        />
        <path
          d="M6 14h12v8H6z"
          stroke="#17395B"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      Unduh PDF
    </button>
  );
}

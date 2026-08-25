import { Star } from "lucide-react";

export function StarPill({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1 bg-amber-soft border border-[#f3dfa0] text-[#8a6a05] font-bold text-sm px-3 py-1.5 rounded-full font-mono-brand">
      <Star size={14} fill="currentColor" /> {value}
    </div>
  );
}

import { Star } from "lucide-react";

export function StarPill({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1 bg-[#FFE9B0] border border-[#E5C05A] text-[#8A6100] font-bold text-sm px-3 py-1.5 rounded-full font-display">
      <Star size={14} fill="currentColor" /> {value}
    </div>
  );
}

import { ChevronLeft } from "lucide-react";

export function TopBar({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0">
      {onBack ? (
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-white border border-line flex items-center justify-center"
        >
          <ChevronLeft size={18} />
        </button>
      ) : (
        <div className="w-0" />
      )}
      <div className="font-bold text-ink text-base flex-1 font-display">{title}</div>
      {right}
    </div>
  );
}

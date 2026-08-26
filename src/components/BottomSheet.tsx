"use client";
import { useEffect } from "react";

export function BottomSheet({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[rgba(11,29,48,0.45)]"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="relative w-full max-w-[480px] bg-white rounded-t-3xl p-5 pb-8 z-10 max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Handle */}
        <div className="w-10 h-1 bg-[#e1eaf2] rounded-full mx-auto mb-4" />
        {title && (
          <div className="font-display font-bold text-navy text-base mb-4">{title}</div>
        )}
        {children}
      </div>
    </div>
  );
}

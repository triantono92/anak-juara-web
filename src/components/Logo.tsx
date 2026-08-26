// Logo Anak Juara: kotak biru berisi bintang + wordmark
// Ukuran: size prop (default "md")
export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = { sm: 32, md: 44, lg: 60 }[size];
  const textSize = { sm: "text-[10px]", md: "text-[13px]", lg: "text-[18px]" }[size];

  return (
    <div className="flex items-center gap-2">
      <div
        className="bg-brand-blue rounded-[20%] flex items-center justify-center flex-shrink-0"
        style={{ width: dims, height: dims }}
      >
        <svg viewBox="0 0 24 24" fill="#F5C33B" width={dims * 0.55} height={dims * 0.55}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
      <div className="leading-none">
        <div className={`font-display font-semibold text-muted-2 ${textSize}`}>ANAK</div>
        <div className={`font-display font-extrabold text-orange ${textSize}`}>JUARA</div>
      </div>
    </div>
  );
}
